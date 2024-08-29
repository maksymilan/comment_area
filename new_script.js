let commentarea = []
let currentPage = 1;
const commentPerpage = 10;

//从json构建评论DOM元素
function createCommentElement(comment){
    const commentDiv = document.createElement('div');//这是每一条评论框
    commentDiv.className = 'comments';
    // commentDiv.textContent = `${comment.username}: ${comment.text}`;
    commentDiv.id = comment.id;
    //构建一个新的评论元素
    const commentContentDiv = document.createElement('div');//这是评论内容
    commentContentDiv.className = 'comment';

    const usernameP = document.createElement('p');//这是用户名
    usernameP.innerHTML = `<strong>${comment.username}</strong>`;

    const contentP = document.createElement('p');//这是评论文本内容
    contentP.textContent = comment.text;

    const deleteButton = document.createElement('button');//这是删除键
    deleteButton.textContent = '删除';

    commentContentDiv.appendChild(contentP);
    
    commentDiv.appendChild(usernameP);
    commentDiv.appendChild(commentContentDiv);
    commentDiv.appendChild(deleteButton);

    deleteButton.addEventListener('click',function(){
        if(confirm('你确定要删除这条评论吗？')){
            commentDiv.remove();
        }
    })
    return commentDiv;
}

//分页显示评论
function displayComments(){
    const start = (currentPage - 1)*commentPerpage;
    const end = start + commentPerpage;
    const inpageComments = commentarea.slice(start,end);

    const commentsContaner = document.getElementById('commentarea');
    commentsContaner.innerHTML = '';
    inpageComments.forEach(commentDiv => {
        commentsContaner.appendChild(commentDiv);
    });//将切片中选中的评论添加到评论区中

    const totalPages = Math.ceil(commentarea.length/commentPerpage);
    updatePageNumbers(totalPages);
}

//更新页码
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
            displayComments();
        });
        pageNumbersContainer.appendChild(pageNumberSpan);
    }
}

//获取评论的异步函数
async function fetchComments(page = 1,size = 10) {
    try{
        console.log("begin")
        const response = await fetch('http://localhost:8000/comment/get');
        console.log("fetch")
        const data = await response.json();
        commentarea = data.map(comment => createCommentElement(comment));
        displayComments();
    }catch(error){
        console.error('获取评论失败',error);
    }
}

//添加评论的异步函数
async function addComment(username,commentText) {
    try{
        console.log("fetch开始")
        const response = await fetch('http://localhost:8000/comment/add',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username,text: commentText})
        });
        console.log("fetch完成")
        console.log(response)
        if(response.ok){
            const newComment = await response.json();
            commentarea.unshift(createCommentElement(newComment));
            displayComments();
        }
    }catch(error){
        console.error('添加评论失败',error);
    }
}

//删除评论的异步函数
async function deleteComment(id) {
    try{
        const response = await fetch(`http://localhost:8000/comment/${id}`,{
            method: 'DELETE',
        });

        if(response.ok){
            commentarea = commentarea.filter(comment => comment.id !== id);
            displayComments();
        }
    }catch(error){
        console.error('删除评论失败',error);
    }
}

window.onload = function(){
    fetchComments();
    // setInterval(fetchComments,6000);//6s更新一次评论区
    document.getElementById('prevPage').addEventListener('click',function(){
        if(currentPage > 1){
            currentPage--;
            displayComments();
        }
    });//返回上一页

    document.getElementById('nextPage').addEventListener('click',function(){
        const totalPages = Math.ceil(commentarea.length/commentPerpage);
        if(currentPage < totalPages){
            currentPage ++;
            displayComments();
        }
    });//进入下一页

    document.getElementById('commentForm').addEventListener('submit',function(e){
        e.preventDefault();
        const username = document.getElementById('username').value;
        const content = document.getElementById('content').value;
        //不能为空
        if(username&&content){
            console.log("开始提交")
            addComment(username,content);
            console.log("提交完成")
            //清空输入
            document.getElementById('username').value = '';
            document.getElementById('content').value = '';
        }
    });
}