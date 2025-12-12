---
title: Docker 设置国内加速
tags:
  - Docker
category: Docker
published: 2018-10-08 18:43:00
---

使用以下命令直接从该镜像加速地址进行拉取：

```
docker pull registry.docker-cn.com/myname/myrepo:mytag
```

例如:

```
docker pull registry.docker-cn.com/library/ubuntu:16.04
```

#### 使用 --registry-mirror 配置 Docker 守护进程

您可以配置 Docker 守护进程默认使用 Docker 官方镜像加速。这样您可以默认通过官方镜像加速拉取镜像，而无需在每次拉取时指定 registry.docker-cn.com。

您可以在 Docker 守护进程启动时传入  `--registry-mirror`  参数：

```
docker --registry-mirror=https://registry.docker-cn.com daemon
```

为了永久性保留更改，您可以修改  `/etc/docker/daemon.json`  文件并添加上 registry-mirrors 键值。

```
{  "registry-mirrors": ["https://registry.docker-cn.com"]}
```

修改保存后重启 Docker 以使配置生效。

> **注**: 也可以使用适用于 Mac 的 Docker 和适用于 Windows 的 Docker 来进行设置。
