package main

import (
	"server_db/db"
)

func main() {
	//初始化数据库
	db.InitDB()

	//启动服务器
	StartServer()
}
