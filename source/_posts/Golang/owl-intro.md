---
title: owl-简单的 Etcd 全局配置库和命令行工具
tags:
  - Golang
categories:
  - Golang
date: 2020/06/22 10:00
---

## 介绍

owl 链接远程 Etcd 集群或单节点，获取、更新和监听配置文件
提供命令行工具和 golang 库

## 功能

owl 支持以下功能：

1. 从 Etcd 中获取配置数据
2. 把`yaml`配置文件更新到 Etcd 中
3. 监听 Etcd 中指定 key 值的变化
4. 提供 CLI 工具方便的把`yaml`文件的内容推送到 Etcd

## 命令行

### 安装

#### Go 安装

```bash
go get github.com/gsxhnd/owl
```

#### 二进制下载

```bash
# mac
wget https://github.com/gsxhnd/owl/releases/latest/download/owl-darwin-amd64
mv owl-darwin-amd64 /usr/local/bin/owl
chmod +x /usr/local/bin/owl
# linux
wget https://github.com/gsxhnd/owl/releases/latest/download/owl-linux-amd64
mv owl-linux-amd64 /usr/local/bin/owl
chmod +x /usr/local/bin/owl
# windows
wget https://github.com/gsxhnd/owl/releases/latest/download/owl-windows-amd64.exe
```

### 使用

```bash
usage: owl COMMAND [arg...]

commands:
   get  retrieve the value of a key
   put  set the value of a key
   version show version
```

#### get

```bash
usage: owl get [flags] [arg...]
flags:
   -e, --endpoint string   etcd endpoint (default "http://127.0.0.1")
arg:
   the key what you want value at the etcd
```

#### put

```bash
usage: owl put [flags] [arg...]
example:
    owl put /conf/test.yaml ../mock/test.yaml
flags:
    -e, --endpoint string   etcd endpoint (default "http://127.0.0.1")
arg:
    the key what you want value at the etcd
```

#### 举个栗子

获取 Etcd 中`/conf/test.yaml`的配置内容

```bash
owl get -e 127.0.0.1:2379 /conf/test.yaml

value:  name: test1
addr: :8080
test:
  - test01: test01
  - test02: test02
```

将本地`./mock/test.yaml`的配置文件推送到 Etcd 中

```bash
owl put -e local_dev:2379 /conf/test.yaml ./mock/test.yaml
```

## 库

作为 lib，集成到你的服务中。

### 安装依赖

```bash
go get -u github.com/gsxhnd/owl
```

### 使用

#### 初始化实例

```bash
# 使用默认的etcd client 配置
owl.SetAddr([]string{"127.0.0.1:2379"})
# 自定义etcd client 配置
conf := clientv3.Config{
		Endpoints:        []string{"127.0.0.1:2379"},
		AutoSyncInterval: 0,
		DialTimeout:      5 * time.Second,
	}
owl.SetConfig(conf)
```

#### 获取配置

```
# 提前设置key，再获取值
owl.SetKey("/conf/test.yaml")
conf,_:=owl.Get()
# 传入你想要的key获取值
conf,_:=owl.GetByKey("/conf/test.yaml")
```

#### 监听值的变化

```bash
confKey := "conf/test.yaml"
c := make(chan string)
go owl.Watcher(confKey, c)
go func() {
    for i := range c {
        fmt.Println("config value changed: ", i)
    }
}()
```

### 使用 owl 代替 viper_remote

```go
fun main() {
  owl.SetAddr(etcdUrlArry)
  confKey := args[0]
  confStr, err := owl.GetByKey(confKey)
  if err != nil {
    panic(err)
  }
  viper.SetConfigType("yaml")
  err = viper.ReadConfig(bytes.NewBuffer([]byte(confStr)))
  if err != nil {
    panic(err)
  }
  c := make(chan string)
  go owl.Watcher(confKey, c)
  go func() {
    for i := range c {
      _ = viper.ReadConfig(bytes.NewBuffer([]byte(i)))
    }
  }()
}
```
