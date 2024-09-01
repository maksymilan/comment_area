package db

//comment定义每一条评论的模型
type Comment struct {
	Name    string `gorm:"column:username;size:255"`
	Content string `gorm:"column:text;type:text"`
	ID      uint   `gorm:"column:id;primaryKey"`
}
