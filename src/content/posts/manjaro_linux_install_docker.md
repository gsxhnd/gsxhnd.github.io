---
title: Manjaro Linux 安装 Docker
tags:
  - Docker
category: Docker
published: 2022-02-21 17:13:00
---

## 基本安装

```shell
# Pacman 安装 Docker
sudo pacman -S docker

# 启动docker服务
sudo systemctl start docker


# 查看docker服务的状态
sudo systemctl status docker


# 设置docker开机启动服务
sudo systemctl enable docker
```

## 去除 SUDO

```shell
# 如果还没有 docker group 就添加一个
sudo groupadd docker

# 将自己的登录名(${USER} )加入该 group 内。然后退出并重新登录就生效啦
sudo gpasswd -a ${USER} docker

# 重启 docker 服务
sudo systemctl restart docker

# 切换当前会话到新 group 或者重启 X 会话
# 注意，这一步是必须的，否则因为 groups 命令获取到的是缓存的组信息，刚添加的组信息未能生效，所以 docker images 执行时同样有错。
newgrp - docker
OR
pkill X
```
