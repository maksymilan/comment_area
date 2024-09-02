package db

//comment定义每一条评论的模型
type Comment struct {
	Name    string `gorm:"column:name;size:255"`
	Content string `gorm:"column:content;type:text"`
	ID      uint   `gorm:"column:id;primaryKey"`
}
