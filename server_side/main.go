package main

import (
	"log"
	"net/http"
)

func main() {
	//绑定路由和处理器函数
	http.HandleFunc("/comment/get", getComments)
	http.HandleFunc("/comment/add", addComment)
	http.HandleFunc("/comment/delete/", deleteComment)

	//启动HTTP服务器，监听8000端口
	log.Println("server is running on port 8000")
	log.Fatal(http.ListenAndServe(":8000", nil)) //log.Fatal确保服务器关闭时记录日志
}
