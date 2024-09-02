// 主程序部分
package main

import (
	"fmt"
	"net/http"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// 获取配置信息
	Config()

	user := yamlConfig.MySql.User
	password := yamlConfig.MySql.Password
	host := yamlConfig.MySql.Host
	port := yamlConfig.MySql.Port
	dbName := yamlConfig.MySql.DbName

	dsn := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + dbName + "?charset=utf8mb4&parseTime=True&loc=Local"
	// fmt.Println(dsn)

	// 连接到 MySQL 数据库
	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println("Failed to connect database:", err)
		return
	}

	// 检查是否已经存在表，避免重复迁移
	if exists := db.Migrator().HasTable(&Comment{}); !exists {
		err = db.AutoMigrate(&Comment{})
		if err != nil {
			fmt.Println("Failed to migrate database:", err)
			return
		}
	}

	// 使用前端的静态文件
	fs := http.FileServer(http.Dir("../front"))
	http.Handle("/", fs)

	// API
	http.HandleFunc("/comment/get", GetComments)
	http.HandleFunc("/comment/add", AddComments)
	http.HandleFunc("/comment/delete", DeleteComments)

	// 启动 HTTP 服务器
	fmt.Println("Server is running on http://localhost:8080")
	err = http.ListenAndServe(":"+yamlConfig.GoServer.Port, nil)
	if err != nil {
		fmt.Println("Failed to start server:", err)
	}
}
