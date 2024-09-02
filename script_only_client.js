document.addEventListener('DOMContentLoaded',function(){
    const commentsPerpage = 10;
    let currentPage = 1;
    let commentarea = [];

    function updatePageNumbers(totalPages){
        // console.log('updatePageNumbers function called');  // 调试信息
        // console.log('Total Pages:', totalPages);           // 调试信息
        const pageNumbersContainer = document.getElementById('pageNumbers');
        pageNumbersContainer.innerHTML = '';

        for(let i = 1;i <= totalPages; i++){
            const pageNumberSpan = document.createElement('span')
            pageNumberSpan.textContent = i;
            pageNumberSpan.className = 'page-number';
            if(i === currentPage){
                pageNumberSpan.classList.add('current-page');
            }
            pageNumberSpan.addEventListener('click',function(){
                console.log('Clicked page number:', i);  // 调试信息
                currentPage = i;
                displayComments();
            });
            pageNumbersContainer.appendChild(pageNumberSpan);
        }
    }

    function displayComments(){
        const start = (currentPage - 1)*commentsPerpage;
        const end = start + commentsPerpage;
        const inpagecomments = commentarea.slice(start,end);

        const commentsContainer = document.getElementById('commentarea');
        commentsContainer.innerHTML = '';//清空旧的元素，渲染新的评论并丢掉旧的评论
        
        inpagecomments.forEach(commentDiv => {
            commentsContainer.appendChild(commentDiv);
        });
        const totalPages = Math.ceil(commentarea.length/commentsPerpage);
        updatePageNumbers(totalPages);
    }
    document.getElementById('commentForm').addEventListener('submit',function(event){
    event.preventDefault();//阻止表单的默认提交行为

    //获取输入的用户名和评论内容
    const username = document.getElementById('username').value;
    const content = document.getElementById('content').value;

    //构建一个新的评论元素
    const commentDiv = document.createElement('div');//这是每一条评论框
    commentDiv.className = 'comments';

    const commentContentDiv = document.createElement('div');//这是评论内容
    commentContentDiv.className = 'comment';

    const usernameP = document.createElement('p');//这是用户名
    usernameP.innerHTML = `<strong>${username}</strong>`;

    const contentP = document.createElement('p');//这是评论文本内容
    contentP.textContent = content;

    const deleteButton = document.createElement('button');//这是删除键
    deleteButton.textContent = '删除';

    commentContentDiv.appendChild(contentP);
    
    commentDiv.appendChild(usernameP);
    commentDiv.appendChild(commentContentDiv);
    commentDiv.appendChild(deleteButton);

    //将新评论添加到评论区
    // document.getElementById('commentarea').appendChild(commentDiv);
    commentarea.push(commentDiv);
    //清空表单
    document.getElementById('commentForm').reset();

    //删除评论
    deleteButton.addEventListener('click',function(){
        if(confirm('你确定要删除这条评论吗？')){
            commentDiv.remove();
        }
    })
    displayComments();
});
document.getElementById('prevPage').addEventListener('click',function(){
    if(currentPage > 1){
        currentPage--;
        displayComments();
    }
});
document.getElementById('nextPage').addEventListener('click',function(){
    if((currentPage * commentsPerpage) < commentarea.length){
        currentPage++;
        displayComments();
    }
});
displayComments();
})
