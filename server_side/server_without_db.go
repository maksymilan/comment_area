package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

// Comment 结构体表示一条评论的基本信息
type Comment struct {
	Name    string `json:"username"`
	Content string `json:"text"`
	ID      int    `json:"id"`
}

// Response 结构体定义了API的统一响应格式
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`  // 状态信息，通常是 'success' 或错误消息
	Data interface{} `json:"data"` // 响应数据，可以是评论列表、新添加的评论或空值
}

var comments []Comment
var nextID int = 1

// getComments 处理器函数用于获取评论列表
func getComments(w http.ResponseWriter, r *http.Request) {
	// 从查询参数中获取分页信息
	w.Header().Set("Access-Control-Allow-Origin", "*") // 允许所有来源
	w.Header().Set("Content-Type", "application/json")
	// pageStr := r.URL.Query().Get("page")
	// sizeStr := r.URL.Query().Get("size")
	// 将查询参数从字符串转换为整数
	// page, _ := strconv.Atoi(pageStr)
	// size, _ := strconv.Atoi(sizeStr)

	// if size == -1 || size > len(comments) {
	// 	size = len(comments) // 如果size为-1，或者大于评论总数，则返回所有评论
	// }

	// start := (page - 1) * size
	// end := start + size

	// if start >= len(comments) {
	// 	start, end = 0, 0 // 如果起始索引超出范围，返回空结果
	// } else if end > len(comments) {
	// 	end = len(comments)
	// }
	// //构造响应数据
	response := Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"total":    len(comments),
			"comments": comments[:],
		},
	}
	// 将响应数据编码为JSON并写入响应体
	json.NewEncoder(w).Encode(response)
}

// addComment 处理器函数用于添加新的评论
func addComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*") // 允许所有来源
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	// 如果是OPTIONS请求，返回预检响应
	if r.Method == http.MethodOptions {
		// fmt.Println(http.MethodOptions)
		w.WriteHeader(http.StatusOK) // 返回204状态码表示成功但无内容
		return
	}
	var newComment Comment
	//从请求体中解码json数据到newComment变量
	if err := json.NewDecoder(r.Body).Decode(&newComment); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest) //如果解码失败，返回400错误
		return
	}
	//分配ID给新评论并递增nextID
	newComment.ID = nextID
	nextID++
	fmt.Println(newComment)
	//将新评论加到comments切片
	comments = append(comments, newComment)

	//构造响应数据
	response := Response{
		Code: 0,
		Msg:  "success",
		Data: newComment,
	}
	//将响应数据编码为JSON并写入响应体
	json.NewEncoder(w).Encode(response)
}

// deleteComment处理函数用于删除评论
func deleteComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*") // 允许所有来源
	w.Header().Set("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
	// 如果是OPTIONS请求，返回预检响应
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
	fmt.Println("Option end")
	//从查询参数中获取评论的ID
	idStr := r.URL.Query().Get("id")
	fmt.Println(r.URL)
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest) //转换失败，返回400
		return
	}
	//查找要删除的评论在切片中的索引
	index := -1
	for i, comment := range comments {
		if comment.ID == id {
			index = i
			break
		}
	}

	if index != -1 {
		comments = append(comments[:index], comments[index+1:]...)
	}
	//构造响应数据
	response := Response{
		Code: 0,
		Msg:  "success",
		Data: nil, //删除成功，返回空数据
	}
	json.NewEncoder(w).Encode(response)
}
