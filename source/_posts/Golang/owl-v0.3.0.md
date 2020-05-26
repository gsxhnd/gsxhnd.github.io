# owl-简单的全局配置库和命令行工具

## 介绍

owl 获取配置文件和更新配置文件
支持命令行和golang库

## 功能
owl支持以下功能：
1. 从Etcd中获取配置数据
2. 把`yaml`配置文件更新到Etcd中
3. 监听Etcd中指定key值的变化
4. 提供CLI工具方便的把`yaml`文件的内容推送到Etcd

## 命令行使用

### 安装
#### Go安装
```bash
go get github.com/gsxhnd/owl
```
#### 二进制下载
```bash
# mac
wget https://github.com/gsxhnd/owl/releases/download/v0.3.0/owl-0.3.0-darwin-amd64
# linux
wget https://github.com/gsxhnd/owl/releases/download/v0.3.0/owl-0.3.0-linux-amd64
mv owl-0.2.0-darwin-amd64 /usr/local/bin/owl
chmod +x /usr/local/bin/owl
# windows
wget https://github.com/gsxhnd/owl/releases/download/v0.3.0/owl-0.3.0-windows-amd64.exe
```
### 使用
``` bash
usage: owl COMMAND [arg...]

commands:
   get  retrieve the value of a key
   put  set the value of a key
   version show version
```
#### get
``` bash
usage: owl get [flags] [arg...]
flags:
   -e, --endpoint string   etcd endpoint (default "http://127.0.0.1")
arg:
   the key what you want value at the etcd
```
#### put
``` bash
usage: owl put [flags] [arg...]
example:
    owl put /conf/test.yaml ../mock/test.yaml
flags:
    -e, --endpoint string   etcd endpoint (default "http://127.0.0.1")
arg:
    the key what you want value at the etcd
```

#### 举个栗子
#### get
``` bash
owl get -e 127.0.0.1:2379 /conf/test.yaml

value:  name: test1
addr: :8080
test:
  - test01: test01
  - test02: test02
```

#### put
``` bash
owl put -e local_dev:2379 /conf/test.yaml ./mock/test.yaml
```

## 集成库

### 安装依赖
``` bash
go get github.com/gsxhnd/owl
```

### 使用
#### 初始化实例
``` bash
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
``` bash
confKey := "conf/test.yaml"
c := make(chan string)
go owl.Watcher(confKey, c)
go func() {
    for i := range c {
        fmt.Println("config value changed: ", i)
    }
}()
```

