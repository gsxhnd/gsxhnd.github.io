---
title: Railgun-网关服务
tags:
  - Golang
categories:
  - Golang
date: 2020/06/22 10:00
---

# Railgun

[Golang](https://github.com/golang/go)编写的网关服务，使用 Etcd 存储和获取服务配置和 API 转发规则。

1. [Website]()
2. [Release](https://github.com/MisakaSystem/LastOrder/releases)
3. [Roadmap](https://github.com/MisakaSystem/roadmap)

## 功能

1. Dashboard：
2. 转发

## 需求

- Etcd 集群或单节点

## 设置配置

### 1.1 安装 owl

使用 owl 将配置文件保存到 Etcd

- 使用 go install owl

```shell script
go install github.com/gsxhnd/owl
```

- 下载二进制

```shell script
wget https://github.com/gsxhnd/owl/releases/download/v0.3.0/owl-0.3.0-linux64-amd64
mv owl-0.3.0-linux64-amd64 /usr/local/bin/owl
chmod +x /usr/local/bin/owl
```

### 1.2 设置/更新配置文件至 Etcd

```shell script
owl put -e "local_dev:2379" /conf/gateway.yaml ./conf/gateway.yaml
```

### 1.3 确认当前 Etcd 中的配置内容

```shell script
owl get -e "local_dev:2379" /conf/cdn.yaml
```

## 下载 Railgun

通过[Release](https://github.com/MisakaSystem/LastOrder/releases)页面下载最新的二进制文件

## 启动服务

```bash
railgun run --etcds="127.0.0.1:2379" /conf/gateway.yaml
```

## FAQ

### 命名由来？

> 动漫作品《[魔法禁书目录](https://baike.baidu.com/item/魔法禁书目录/25423)》中的人物。[御坂网络](https://baike.baidu.com/item/御坂网络/8582829?fr=aladdin)中的上位个体，检体番号 20001 号，是所有御坂妹妹的司令塔，是为了防止“妹妹们”反叛、失控而制作出来的安全装置。和御坂网络中的其他个体不同，具有较丰富的表情，头顶上有一根呆毛。

## License

[MIT](https://tldrlegal.com/license/mit-license)

