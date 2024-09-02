// 功能1：更新页面
function updatePage() {
    let preButton = document.getElementById("previous");                          // "上一页"按钮
    let nextButton = document.getElementById("next");                             // "下一页"按钮
    let pageNum = document.getElementsByClassName("pageNum");                     // 页数
    let pageSize = document.getElementById("pageSize");                           // 单页评论数
    let list = document.getElementById("commentsList");                           // 评论列表
    let banner = document.createElement('p');                                     // 提示语
    let total;                                                                    // 评论总数

    // 获取具体数字，用于发送 GET 请求
    let page = Number(pageNum[0].textContent.slice(2, -2)) || 1; 
    let size = Number(pageSize.value) || localStorage.getItem('lastPageSize');
    localStorage.setItem('lastPageSize', size);          // 保存当前设置的单页评论数（即使关闭浏览器后也有记录）
    
    console.log(`Page: ${page}, Size: ${size}`);
    const urlGet = `/comment/get?page=${page}&size=${size}`;
    
    // 发送 GET 请求
    fetch(urlGet)
        .then(response => {           // 获取响应体
            if (!response.ok) {
                throw new Error (`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {               // 获取响应体的数据（评论）
            console.log('Data fetched from API:', data);
            list.innerHTML = '';      // 清空当前页评论
            if (Array.isArray(data.data.comments) && data.data.total > 0) {     // 如果获取到评论，按照 page 和 size 显示评论
                total = data.data.total;
                updateSum(total);     // 设置评论总数

                // 显示评论的逻辑运算
                let ignoreCnt = size <= 0 ? 0 : (page - 1) * size;              // “忽略”的评论数
                let cnt = size <= 0 ? total : size;                             // 实际需要显示的评论数（size 为负就全显示）
                for (let comment of data.data.comments.slice().reverse()) {     // 获取单个评论数据
                    if (ignoreCnt <= 0 && cnt > 0) {
                        let item = AssembleComment(comment);                    // 组装评论的 HTML 元素
                        list.append(item);
                        cnt--;
                    }
                    if (cnt <= 0) {
                        break;
                    }
                    ignoreCnt--;
                }
            } else {                  // 没有评论，设置对应提示语
                banner.textContent = "这里空空如也，快来抢第一条评论吧(*❦ω❦)";
                banner.style.textAlign = "center";
                banner.style.fontSize = "1.5em";
                list.prepend(banner);
            }

            // 如果该页没有评论，自动跳转至前一页
            if (!list.children.length && page > 1) {
                preButton.click();
                return;
            }
            
            // 更新显示页数
            pageNum[0].textContent = "第 " + String(page) + " 页";

            // 显示当前设置的单页评论数
            pageSize.value = size;

            // 第一页不显示“上一页”按钮，最后一页不显示“下一页”按钮
            preButton.style.visibility = page == 1 ? 'hidden' : 'visible';
            console.log("size:", size)
            console.log("page * size:", page * size)
            console.log("total:", total)
            nextButton.style.visibility = size > 0 && total != undefined ? 
                                            (page * size >= total ? 'hidden' : 'visible')
                                            : 'hidden';
        })
        .catch(error => {            // 响应错误
            console.error('Error fetching data:', error);
            banner.textContent = "加载数据错误(⊙︿⊙)";
            banner.style.textAlign = "center";
            banner.style.fontSize = "1.5em";
            list.prepend(banner);   

            preButton.style.visibility = 'hidden';
            nextButton.style.visibility = 'hidden';
        })
}

// 显示评论总数
function updateSum(count) {
    let sum = document.getElementById("commentSum");
    if (count) {
        sum.innerHTML = "<strong>共 " + String(count) + " 条评论</strong>";
    }
}

// 组装评论 HTML 元素
function AssembleComment(comment) {
    let commentItem = document.createElement("div");
    commentItem.className = "comment"
    commentItem.id = comment.ID;

    let name = document.createElement("h3");
    let content = document.createElement("p");
    let br = document.createElement("br");
    let deleteButton = document.createElement("button");

    name.textContent = comment.Name;
    content.textContent = comment.Content;
    content.style.whiteSpace = "pre-wrap";
    deleteButton.textContent = "删除";
    deleteButton.classList.add("button", "deleteMe");
    deleteButton.addEventListener('click', deleteComments); 

    commentItem.append(name);
    commentItem.append(content);
    commentItem.append(br);
    commentItem.append(deleteButton);

    return commentItem;
}

// 按回车键才能设置单页显示评论数
pageSize.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        updatePage();
    }
});

// 页面切换
// direction：翻页的方向，仅接受两个值，"previous" 表示上一页，"next" 表示下一页
function togglePages(direction, event){
    let step = 0;                      // 翻页

    if (direction == "previous") {     // 上一页
        step = -1;
    }
    else if (direction == "next") {    // 下一页
        step = 1;
    }

    event.stopPropagation();            // 停止向上冒泡，防止误删其他内容
    let page = document.getElementById("previous").nextElementSibling;   // 页面底部信息
    let pageNum = Number(page.textContent.slice(2, -2)) + step;          // 页数的更新
    page.textContent = '第 ' + String(pageNum) + ' 页';

    // 更新页面
    updatePage();
}

// 上一页
previous.addEventListener('click', (event) => togglePages("previous", event));
// 下一页
next.addEventListener('click', (event) => togglePages("next", event));


// 功能2：添加新评论
submit.addEventListener("submit", (event) => {
    event.preventDefault();

    // 获取输入内容（可匿名，但不接受空评论）
    let nameDom = document.getElementById("username");
    if (nameDom.value == "") {
        nameDom.value = "匿名用户";
    }

    let textDom = document.getElementById("commentText");
    if (textDom.value == "") {
        alert("请输入评论内容！");
        return;
    }

    // 生成表单数据（包含 name 和 content 字段）
    let form = document.getElementById('submit');
    let formData = new FormData(form);

    // 调试，打印发送的评论，但由于下面执行了刷新操作，所以在控制台看不到这个输出
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    // 发送 POST 请求
    fetch('/comment/add', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {         // 成功获取数据
        console.log('Success:', data);
        
        // 刷新页面，否则无法及时更新评论
        // 但这样带来了一个问题：无法在开发者工具看到 comment/add 的请求
        // 若要调试，需要注释掉这条语句
        window.location.reload();
    })
    .catch(error => {
        console.error('Error', error);
    })

    // 清空输入框
    nameDom.value = "";    
    textDom.value = "";    

    // 更新页面
    updatePage();
});


// 功能3：删除评论
function deleteComments(event) {
    let parent = event.target.parentElement;   // 按钮的父元素，即它所属的评论块
    let idValue = parent.id;

    // 生成表单数据（包括 id 字段）
    let formData = new FormData();
    formData.append('id', idValue);

    console.log("Deleted comment ID:", idValue)

    // 发送 POST 请求
    fetch('/comment/delete', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        
        // 更新页面
        updatePage();
    })
    .catch(error => {
        console.error('Error:', error);
    })
}


// 首次运行脚本需要立即更新页面
updatePage();


