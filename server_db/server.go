package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"server_db/db"
	"strconv"

	"github.com/spf13/viper"
)

// Response 结构体定义了API的统一响应格式
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`  // 状态信息，通常是 'success' 或错误消息
	Data interface{} `json:"data"` // 响应数据，可以是评论列表、
}

// 配置端口的json
func init() {
	viper.SetConfigName("config")
	viper.SetConfigType("json")
	viper.AddConfigPath(".")

	viper.ReadInConfig()
}

// StartServer启动http服务并设置路由
func StartServer() {

	var port int = viper.GetInt("port")
	var address string = fmt.Sprintf(":%d", port)

	http.HandleFunc("/comment/get/", getComments)
	http.HandleFunc("/comment/add", addComment)
	http.HandleFunc("/comment/delete/", deleteComment)

	fmt.Printf("服务器启动，监听端口 %d", port)
	log.Fatal(http.ListenAndServe(address, nil))
}

// getComments 处理器函数用于获取评论列表
func getComments(w http.ResponseWriter, r *http.Request) {
	// 从查询参数中获取分页信息
	w.Header().Set("Access-Control-Allow-Origin", "*") // 允许所有来源
	w.Header().Set("Content-Type", "application/json")

	//从URL中查询分页信息
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	size, _ := strconv.Atoi(r.URL.Query().Get("size"))

	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 10
	}

	var comments []db.Comment
	var total int64

	//计算偏移量并查询数据库
	offset := (page - 1) * size
	if size == -1 { //获取全部评论
		db.DB.Find(&comments)
	} else {
		db.DB.Offset(offset).Limit(size).Find(&comments)
	}
	db.DB.Model(&db.Comment{}).Count(&total)

	response := Response{
		Code: 0,
		Msg:  "success",
		Data: map[string]interface{}{
			"total":    total,
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
	var newComment db.Comment

	//从请求体中解码json数据到newComment变量
	if err := json.NewDecoder(r.Body).Decode(&newComment); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest) //如果解码失败，返回400错误
		return
	}

	//添加到数据库
	db.DB.Create(&newComment)
	fmt.Println(newComment)

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
	//在数据库中删除指定id的评论
	db.DB.Delete(&db.Comment{}, id)

	//构造响应数据
	response := Response{
		Code: 0,
		Msg:  "success",
		Data: nil, //删除成功，返回空数据
	}
	json.NewEncoder(w).Encode(response)
}
