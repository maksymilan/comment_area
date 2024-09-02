package main

import (
	"fmt"

	"github.com/spf13/viper"
)

type MYSQL struct {
	Host     string `yaml:"host"`
	Port     string `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DbName   string `yaml:"dbName"`
}

type GOSERVER struct {
	Port string `yaml:"port"`
}

type YamlConfig struct {
	MySql    MYSQL    `yaml:"mysql"`
	GoServer GOSERVER `yaml:"goServer"`
}

var yamlConfig YamlConfig

func Config() {
	// 确认配置文件及路径
	myConfig := viper.New()
	// 改为 public_config
	myConfig.SetConfigName("private_config") // 文件名
	myConfig.SetConfigType("yaml")           // 文件格式
	myConfig.AddConfigPath("..")             // 文件路径

	// 读取解析
	if err := myConfig.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			fmt.Printf("Not Found: %v\n", err)
			return
		} else {
			fmt.Printf("Parse Error: %v\n", err)
			return
		}
	}

	// 映射到结构体
	if err := myConfig.Unmarshal(&yamlConfig); err != nil {
		fmt.Printf("Mapping Error: %v\n", err)
	}

	// fmt.Printf("Mysql: %+v\n", yamlConfig.MySql)
	// fmt.Printf("Go Server: %+v\n", yamlConfig.GoServer)
}
