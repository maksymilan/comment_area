// 服务器部分
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// 更新评论页
func GetComments(w http.ResponseWriter, r *http.Request) {
	httpStatus := 200

	// 确保接收的是 GET 请求
	if r.Method == http.MethodGet {

		// 从数据库中读取数据
		var comments []Comment
		result := db.Find(&comments)
		// fmt.Println("Comments:", comments)

		// 读取数据失败
		if result.Error != nil {
			fmt.Println("Failed to query data:", result.Error)
			http.Error(w, "Failed to query data", http.StatusInternalServerError)
			httpStatus = http.StatusInternalServerError
			packageResponse(&w, nil, false, httpStatus)
			return
		}

		// 打包响应体
		packageResponse(&w, comments, false, httpStatus)
	} else { // 请求错误
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		httpStatus = http.StatusMethodNotAllowed
		packageResponse(&w, nil, false, httpStatus)
	}
}

// 添加新评论
func AddComments(w http.ResponseWriter, r *http.Request) {
	httpStatus := 200

	// 确保接收的是 POST 请求
	if r.Method == http.MethodPost {
		// 解析表单数据
		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			httpStatus = http.StatusBadRequest
			packageResponse(&w, nil, false, httpStatus)
			return
		}

		// 读取表单字段
		name := r.FormValue("name")
		content := r.FormValue("content")

		// 用户名和评论内容要求是非空的
		if name == "" || content == "" {
			http.Error(w, "Some of the field(s) is(are) missing!", http.StatusBadRequest)
			httpStatus = http.StatusBadRequest
			packageResponse(&w, nil, false, httpStatus)
			return
		}

		// 显示插入的评论
		fmt.Printf("Received name: %s, content: %s, ", name, content)

		newComment := []Comment{
			{
				Name:    name,
				Comment: content,
			},
		}

		// 插入新的数据
		result := db.Create(&newComment[0])
		if result.Error != nil {
			fmt.Println("Failed to insert data:", result.Error)
			httpStatus = 1
			packageResponse(&w, nil, false, httpStatus)
			return
		}

		// 打印插入后的 Comment 数据，包括自动生成的 ID
		fmt.Printf("New comment ID: %d\n", newComment[0].ID)

		// 打包响应体
		packageResponse(&w, newComment, true, httpStatus)
	} else { // 请求方法错误
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		httpStatus = http.StatusMethodNotAllowed
		packageResponse(&w, nil, false, httpStatus)
	}
}

// 删除评论
func DeleteComments(w http.ResponseWriter, r *http.Request) {
	httpStatus := 200

	// 确保接收的是 POST 请求
	if r.Method == http.MethodPost {
		// 解析表单数据
		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			http.Error(w, "Unable to parse form", http.StatusBadRequest)
			httpStatus = http.StatusBadRequest
			packageResponse(&w, nil, false, httpStatus)
			return
		}

		// 获取 'id' 字段
		idValue := r.FormValue("id")
		if idValue == "" {
			http.Error(w, "Missing 'id' field", http.StatusBadRequest)
			httpStatus = http.StatusBadRequest
			packageResponse(&w, nil, false, httpStatus)
			return
		}

		// 从数据库删除指定数据行
		result := db.Delete(&Comment{}, idValue)
		if result.Error != nil {
			fmt.Println("Failed to delete data:", result.Error)
			return
		}

		// 被删除评论的 ID 值
		fmt.Printf("Deleted comment ID: %s\n", idValue)

		// 打包响应体
		packageResponse(&w, nil, false, httpStatus)

	} else { // 请求方法错误
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		httpStatus = http.StatusMethodNotAllowed
		packageResponse(&w, nil, false, httpStatus)
	}
}

// 打包响应体
func packageResponse(ptrW *http.ResponseWriter, comments []Comment, isAdd bool, httpStatus int) {
	w := *ptrW

	// 创建响应结构体
	response := map[string]interface{}{
		// "code": 0,
		// "msg":  "success",
	}

	// 如果状态码正常，发送包含 data 的数据
	if httpStatus == 200 {
		response["code"] = 0
		response["msg"] = "success"
		if comments != nil {
			if !isAdd { // 更新页面
				response["data"] = map[string]interface{}{
					"total":    len(comments),
					"comments": comments,
				}
			} else { // 添加评论
				response["data"] = map[string]interface{}{
					"Id":      comments[0].ID,
					"Name":    comments[0].Name,
					"Content": comments[0].Comment,
				}
			}
		} else { // 删除评论
			response["data"] = nil
		}
	} else { // 失败
		response["code"] = httpStatus
		response["msg"] = "failed"
	}

	// 设置响应头
	w.Header().Set("Content-Type", "application/json")

	// 将数据转换为 JSON
	jsonData, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Failed to encode JSON:", err)
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		return
	}

	// 发送 JSON 数据作为响应体
	w.WriteHeader(httpStatus)
	w.Write(jsonData)
}
