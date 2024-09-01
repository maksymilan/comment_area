package main

import (
	"server_db/db"
)

func main() {
	//初始化数据库
	db.InitDB()

	//启动服务器
	StartServer() //使用go run .进行编译运行，只运行main文件会显示函数未定义
}
