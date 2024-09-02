package models

//评论的模型
type Comment struct {
	Name    string `gorm:"type:varchar(100);not null"`
	Content string `gorm:"type:text;not null"`
	ID      uint   `gorm:"primaryKey"`
}
