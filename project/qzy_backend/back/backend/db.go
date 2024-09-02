// 数据库部分
package main

import (
	"gorm.io/gorm"
)

// 数据表（对应 Comments）
type Comment struct {
	ID      uint   `gorm:"primaryKey"`
	Name    string `gorm:"size:100"`
	Comment string `gorm:"size:255"`
}

// 确保对应正确的数据表
func (Comment) TableName() string {
	return "Comments"
}

// 数据库
var db *gorm.DB
