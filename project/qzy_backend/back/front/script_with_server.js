let commentarea = []
let currentPage = 1;
let totalcomments = 0;
const commentPerpage = 10;
const baseurl = 'http://localhost:8000/comment/'
//fetchcomment得到的response的结构
// object{
//     code:0
//     data:{
//         comments:{//comments是多个comment组成的数组，一个comment的内部数据如下
//             Name:
//             Content:
//             ID:
//         }
//         total:
//     }
//     msg:
// }


//从json构建评论DOM元素，接受每一个comment的json结构，将其中的数据读取到dom中
function createCommentElement(comment){
    const commentDiv = document.createElement('div');//这是每一条评论框
    commentDiv.className = 'comments';
    // commentDiv.textContent = `${comment.username}: ${comment.text}`;
    commentDiv.id = comment.ID;
    //构建一个新的评论元素
    const commentContentDiv = document.createElement('div');//这是评论内容
    commentContentDiv.className = 'comment';

    // console.log(comment.Name)
    const usernameP = document.createElement('p');//这是用户名
    usernameP.innerHTML = `<strong>${comment.Name}</strong>`;

    const contentP = document.createElement('p');//这是评论文本内容
    contentP.textContent = comment.Content;

    const deleteButton = document.createElement('button');//这是删除键
    deleteButton.textContent = '删除';

    commentContentDiv.appendChild(contentP);
    
    commentDiv.appendChild(usernameP);
    commentDiv.appendChild(commentContentDiv);
    commentDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click',function(){
        if(confirm('你确定要删除这条评论吗？')){
            // commentDiv.remove();
            deleteComment(comment.ID)
        }
    })
    return commentDiv;
}

//显示评论，将读取到的评论（储存在commentarea切片中）添加到dom中
function displayComments(){
    const start = (currentPage - 1)*commentPerpage;
    const end = start + commentPerpage;
    const inpageComments = commentarea.slice(start,end);

    const commentsContaner = document.getElementById('commentarea');
    commentsContaner.innerHTML = '';
    inpageComments.forEach(commentDiv => {
        commentsContaner.appendChild(commentDiv);
    });//将切片中选中的评论添加到评论区中

    const totalPages = Math.ceil(totalcomments/commentPerpage);
    updatePageNumbers(totalPages);
}

// 更新页码，在底部实现数字导航栏的效果
function updatePageNumbers(totalPages){
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';

    for(let i = 1;i <= totalPages;i++){
        const pageNumberSpan = document.createElement('span');
        pageNumberSpan.textContent = i;
        pageNumberSpan.className = 'page-number';

        if(i === currentPage){
            pageNumberSpan.classList.add('current-page');
        }
        pageNumberSpan.addEventListener('click',function(){
            currentPage = i;
            fetchComments(currentPage)
        });
        pageNumbersContainer.appendChild(pageNumberSpan);
    }
}

//获取评论的异步函数
async function fetchComments(page = 1,size = 10) {
    try{
        const response = await fetch(`comment/get?page=${page}&size=${size}`);
        const data = await response.json();
        console.log(data);
        console.log(data.data.comments)
        const data_comments = data.data.comments
        totalcomments = data.data.total
        commentarea = data_comments.map(comment => createCommentElement(comment));//comment是json对象
        displayComments();
    }catch(error){
        console.error('获取评论失败',error);
    }
}

//添加评论的异步函数
async function addComment(Name,Content) {
    try{
        // let nameDom = document.getElementById("username")
        // let textDom = document.getElementById("content")

        let data = new FormData()
        data.append("name",Name)
        data.append("content",Content)
        // console.log(data)
        // console.log("fetch开始")
        const response = await fetch('comment/add',{
            method: 'POST',
            body: data
        });
        // console.log("fetch完成")
        // const resclone = response.clone()
        // console.log(resclone.json())
        if(response.ok){
            const newComment = await response.json();
            console.log(newComment.data)
            commentarea.unshift(createCommentElement(newComment.data));
            // console.log(newComment.data)    
            displayComments();
        }
        location.reload();//添加后刷新页面
    }catch(error){
        console.error('添加评论失败',error);
    }
}

//删除评论的异步函数
async function deleteComment(id) {
    try{
        //生成表单数据
        let data = new FormData()
        data.append("id",id)
        const response = await fetch('comment/delete',{
            method: 'POST',
            body: data
        });
        const rescol = response.clone()
        console.log(rescol.json())
        console.log("delete sucucess")
        if(response.ok){
            commentarea = commentarea.filter(comment => comment.id !== id);
            displayComments();
        }
        location.reload();//删除后刷新页面
    }catch(error){
        console.error('删除评论失败',error);
    }
}

window.onload = function(){
    fetchComments();
    // setInterval(fetchComments,60000);//6s更新一次评论区
    document.getElementById('prevPage').addEventListener('click',function(){
        if(currentPage > 1){
            currentPage--;
            // fetchComments(currentPage)
            displayComments()
        }
    });//返回上一页

    document.getElementById('nextPage').addEventListener('click',function(){
        const totalPages = Math.ceil(totalcomments/commentPerpage);
        if(currentPage < totalPages){
            currentPage ++;
            // fetchComments(currentPage)
            displayComments()
        }
    });//进入下一页

    document.getElementById('commentForm').addEventListener('submit',function(e){
        e.preventDefault();
        const username = document.getElementById('username').value;
        const content = document.getElementById('content').value;
        //不能为空
        if(username&&content){
            addComment(username,content);
            //清空输入
            document.getElementById('username').value = '';
            document.getElementById('content').value = '';
        }
    });
}