package db

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB初始化数据库连接
func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("comments.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败", err)
	}

	DB.AutoMigrate(&Comment{})
}
