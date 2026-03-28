---
title: Docker 运行PicoClaw
created: 2026-03-28 22:53:55
published: 2026-03-28 22:53:55
tags:
  - Docker
  - NAS
  - PicoClaw
description: "在 NAS 上使用 Docker 或 Docker Compose 部署 PicoClaw，包含初始化、配置、Web UI、命令行模式与常见问题。"
---
<!-- markdownlint-disable MD025 -->

# Docker 运行PicoClaw

最近在折腾 NAS 上的一些轻量服务时，我顺手把 PicoClaw 也塞了进去。

它的优点很明显：占用不大、启动够快，而且很适合用 Docker 这种方式长期挂着。对 NAS 来说，这类服务越省心越好。

这篇就记录一下我在 NAS 上用 Docker / Docker Compose 跑 PicoClaw 的基本流程，尽量写成拿来就能照着做的版本。

## 准备工作

- NAS 已安装 `Docker` 和 `Docker Compose`
- 可以访问外网，方便拉取镜像和调用模型 API
- 至少准备一个可用模型配置，例如 OpenAI、OpenRouter、DeepSeek，或者本地 Ollama

## 1. 拉取项目

```shell
git clone https://github.com/sipeed/picoclaw.git
cd picoclaw
```

如果你平时就习惯把容器项目统一放在一个目录里，也可以提前建个文件夹，例如 `/volume1/docker/picoclaw` 或 `/mnt/data/docker/picoclaw`，再把仓库克隆进去。

## 2. 首次启动，生成配置文件

PicoClaw 第一次运行时会自动生成配置目录，容器完成初始化后会退出，这是正常现象。

```shell
docker compose -f docker/docker-compose.yml --profile launcher up
```

看到 `First-run setup complete.` 之后，就说明初始化完成了。

这一步会生成：

- `docker/data/config.json`
- `docker/data/workspace/`

## 3. 修改配置

编辑配置文件：

```shell
vim docker/data/config.json
```

如果你只是想先把 PicoClaw 跑起来，至少要配置一个默认模型。下面是一个最小示例：

```json
{
  "agents": {
    "defaults": {
      "model_name": "gpt-5.4"
    }
  },
  "model_list": [
    {
      "model_name": "gpt-5.4",
      "model": "openai/gpt-5.4"
    }
  ]
}
```

如果你使用本地 `Ollama`，可以改成这样：

```json
{
  "agents": {
    "defaults": {
      "model_name": "local-llama"
    }
  },
  "model_list": [
    {
      "model_name": "local-llama",
      "model": "ollama/llama3.1:8b",
      "api_base": "http://宿主机IP:11434/v1"
    }
  ]
}
```

> 如果是新版配置，敏感信息通常会单独放到 `.security.yml`，API Key 相关内容按官方文档补充即可。

如果只是测试能不能跑起来，建议先用一个最简单的模型配置，确认 Web UI 能打开、对话能成功，再慢慢补其他 provider、channel 或自动化能力。

## 适合 NAS 的 docker-compose 示例

官方仓库已经自带 `docker/docker-compose.yml`，直接用当然没问题。

但如果你想把配置整理成一个更适合 NAS 的独立 compose 文件，也可以在项目根目录新建一个 `compose.yaml`，内容参考下面这样：

```yaml
services:
  picoclaw:
    image: docker.io/sipeed/picoclaw:launcher
    container_name: picoclaw
    restart: on-failure
    environment:
      PICOCLAW_GATEWAY_HOST: 0.0.0.0
    ports:
      - "18800:18800"
      - "18790:18790"
    volumes:
      - ./data:/root/.picoclaw
```

启动命令：

```shell
docker compose up -d
```

这个写法比较适合 NAS 场景，原因也很直接：

- `18800` 用来访问 PicoClaw 的 Web UI
- `18790` 是网关端口，后续接 webhook 或聊天平台时可能会用到
- `./docker/data` 统一保存配置、workspace 和运行数据，迁移也方便
- `PICOCLAW_GATEWAY_HOST=0.0.0.0` 让容器内服务可以被局域网访问

如果你只想自己在 NAS 本机上访问，也可以把端口写成 `127.0.0.1:18800:18800` 这种形式，安全性会更高一些。

## 4. 启动 PicoClaw

推荐直接启动 `launcher`，这样可以通过 Web UI 管理配置和对话：

```shell
docker compose -f docker/docker-compose.yml --profile launcher up -d
```

如果你已经改成了上面的独立 `compose.yaml`，那就直接执行：

```shell
docker compose up -d
```

启动完成后，在浏览器打开：

```text
http://NAS-IP:18800
```

第一次在浏览器里看到页面出来的时候，基本就说明方向对了。后面不管是接 OpenAI、OpenRouter，还是连本地 Ollama，都会轻松很多。

如果你是放在 Docker、虚拟机或者 NAS 容器环境里，记得确认监听地址是不是 `0.0.0.0`，否则可能只能容器内部访问。

## 5. 查看日志

```shell
docker compose -f docker/docker-compose.yml logs -f
```

如果只想看网关日志，也可以执行：

```shell
docker compose -f docker/docker-compose.yml logs -f picoclaw-gateway
```

## 6. 停止与更新

停止：

```shell
docker compose -f docker/docker-compose.yml --profile launcher down
```

更新：

```shell
docker compose -f docker/docker-compose.yml pull
docker compose -f docker/docker-compose.yml --profile launcher up -d
```

如果你用的是自己的 `compose.yaml`，更新就更简单：

```shell
docker compose pull
docker compose up -d
```

## 7. 只在命令行里临时使用

如果你不需要常驻服务，只想临时问一个问题，可以直接跑 agent 模式：

```shell
docker compose -f docker/docker-compose.yml run --rm picoclaw-agent -m "帮我总结今天的待办"
```

进入交互模式：

```shell
docker compose -f docker/docker-compose.yml run --rm picoclaw-agent
```

这种方式很适合在 NAS 上偶尔调用，不需要一直挂着后台服务。

我自己更推荐的用法还是：平时让 `launcher` 常驻，需要调试时再临时跑 `agent`。这样既有 Web UI，也保留了命令行的灵活性。

## 常见问题

### 访问不到 Web UI

- 先确认 NAS 防火墙是否放行 `18800` 端口
- 确认 Docker 端口已经映射出来
- 确认监听地址不是 `127.0.0.1`
- 如果用了反向代理，顺便检查一下转发目标端口有没有写错

### 配置改完还是不能用

- 先看日志，通常是模型配置或 API Key 问题
- 检查 `model_name` 和默认模型是否一致
- 使用本地模型时，确认 `api_base` 能从容器内访问到
- 如果本地模型在宿主机上，必要时给容器加上宿主机访问能力

### 数据会不会丢

不会。配置和工作目录都挂载到了 `./data/` 下面，容器重建后数据仍然保留。

这也是我喜欢把这类服务放进 Docker 的原因之一：目录清楚、迁移方便、以后换 NAS 也不至于手忙脚乱。

## Refer

- [sipeed/picoclaw - GitHub](https://github.com/sipeed/picoclaw)
- [Docker Deployment - PicoClaw](https://mintlify.com/sipeed/picoclaw/deployment/docker)
