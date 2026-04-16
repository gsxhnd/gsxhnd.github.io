---
title: Traefik 蓝绿发布实践
created: 2026-04-16 16:36:54
published: 2026-04-16 16:36:54
---
<!-- markdownlint-disable MD025 -->
# Traefik 蓝绿发布实践

在微服务和容器化越来越普遍的今天，应用的访问入口已经不再只是“把请求转发给一个后端”这么简单。

现实中的服务系统往往会面临这些问题：

- 一个域名后面可能对应多个服务
- 服务实例会随着容器重建而变化
- 新旧版本需要并行运行
- 发布时需要灰度、蓝绿或快速回滚
- 运维需要清楚知道当前流量到底打到了哪里

这时，Traefik 就成为了一个非常合适的入口层组件。

它不是简单意义上的“转发器”，而是一个专门为现代动态基础设施设计的反向代理与边缘路由器。尤其是在 Docker、Kubernetes 这类环境中，Traefik 的优势会非常明显。

本文结合一个实际的 Docker Compose Demo，系统讲清楚三个问题：

1. Traefik 是什么
2. Traefik 有什么作用
3. 如何用 Traefik 实现一个蓝绿发布 Demo

## Traefik 是什么

Traefik 是一个开源的现代化反向代理（Reverse Proxy）和边缘路由器（Edge Router）。

如果用一句话来概括它：

**Traefik 是系统流量的统一入口，它负责识别请求、匹配规则，并将请求动态转发到正确的服务。**

和传统代理相比，Traefik 最大的特点不是“也能代理请求”，而是它非常适合运行在动态变化的服务环境中。

所谓“动态变化”，指的是：

- 服务实例会频繁创建和销毁
- 容器名称和 IP 可能不断变化
- 路由规则需要按需调整
- 发布时需要平滑切换版本流量

在这样的环境下，如果还沿用完全静态的代理配置方式，维护成本会越来越高。而 Traefik 的设计目标，就是让这些变化尽可能自动化、可视化和低成本。

## Traefik 有什么作用

Traefik 的价值可以从以下几个方面理解。

### 1. 统一接收入口流量

用户访问系统时，不需要直接面对后端容器地址，只需要访问 Traefik 暴露的入口地址。Traefik 会根据配置规则，把请求转发到对应的服务。

例如：

- 用户访问 `app.localhost`
- Traefik 判断这个请求应该交给哪个后端
- 后端容器对用户透明

这就是反向代理的基本作用。

### 2. 按规则进行动态路由

Traefik 可以根据不同的请求条件进行路由，例如：

- 按域名
- 按路径
- 按入口端口
- 按请求头
- 按中间件处理结果

在实际项目里，这意味着你可以非常灵活地定义入口规则。

比如：

- `api.example.com` 走 API 服务
- `admin.example.com` 走后台管理服务
- `/static` 走静态资源服务
- 某些请求头命中新版本路由

当前这个 Demo 中就采用了最直观的一种方式：按 Host 进行路由。

### 3. 自动发现服务

Traefik 的一个核心优势是服务发现能力。

在 Docker 环境中，它可以直接感知：

- 当前有哪些容器正在运行
- 哪些容器允许被代理
- 它们位于哪个网络
- 它们应该如何被访问

这使得 Traefik 非常适合作为容器环境中的流量入口，而不需要人工反复维护后端地址。

### 4. 负载均衡与流量控制

Traefik 不仅能把流量转发给一个服务，还能把流量分配给多个服务，并支持不同的流量策略。

常见用途包括：

- 多实例负载均衡
- 蓝绿发布
- 灰度发布
- 金丝雀发布

也就是说，Traefik 的价值不只是“代理”，更在于它能参与发布过程中的流量治理。

### 5. 可视化调试与观察

Traefik 自带 Dashboard，可以直观看到：

- 当前有哪些 Router
- 当前有哪些 Service
- 路由和服务如何关联
- 某个入口点是否正常工作

这一点对学习、测试和排查配置问题都非常有帮助。

## 为什么不直接使用 Nginx

很多人在第一次接触 Traefik 时，都会有一个很自然的问题：既然 Nginx 也能做反向代理，为什么这里不直接用 Nginx？

答案并不是 Nginx 不好，而是它们更适合的场景并不完全一样。

Nginx 依然是一个非常成熟、稳定、性能优秀的 Web 服务器和反向代理，在静态站点、传统 Web 服务、固定上游转发等场景里依然非常强大。但当前这个 Demo 的重点并不是“把请求转发出去”，而是：

- 服务运行在 Docker 环境中
- 后端版本需要并行存在
- 需要按权重做蓝绿切流
- 希望配置修改后自动生效
- 希望能直接观察路由与服务关系

在这种场景下，Traefik 的匹配度更高。

### 1. Traefik 更适合动态服务环境

Nginx 更擅长处理相对稳定的上游配置。虽然它也可以通过额外方案支持动态能力，但通常需要借助额外脚本、模板渲染、服务注册中心或 reload 流程。

相比之下，Traefik 天生就是围绕动态基础设施设计的。它可以直接从 Docker Provider 中发现服务，并结合 File Provider 动态加载规则，更适合容器化部署环境。

### 2. Traefik 对蓝绿和灰度更直接

如果使用 Nginx 实现蓝绿发布，通常需要自己维护 upstream、权重、重载配置甚至配套发布脚本。功能当然可以实现，但工程链路往往更长。

Traefik 则把这些能力直接抽象为 Router、Service、Weighted Service 等概念。像当前这个 Demo 一样，只需要在动态配置里调整权重，就可以完成蓝绿流量切换。

### 3. Traefik 的配置模型更贴近云原生

Traefik 的核心模型是：

- `entryPoints`
- `routers`
- `services`
- `providers`

这种模型对“入口规则、目标服务、配置来源”做了清晰拆分，非常适合容器编排和服务治理场景。

Nginx 的配置更偏传统代理风格，灵活而强大，但在多服务、多版本、动态发现的场景中，维护体验通常不如 Traefik 直接。

### 4. Traefik 自带观察能力

Nginx 本身并不会天然提供像 Traefik Dashboard 这样直接的路由观察界面。要做到类似效果，通常需要额外监控和可视化体系配合。

而 Traefik 在学习、调试、本地验证阶段的优势就在于：配置完成后，可以直接从 Dashboard 里看到 Router、Service 和入口点之间的关系。

### 5. 当前场景下选型的关键原因

如果当前目标只是做一个固定服务的静态反向代理，那么 Nginx 完全可以胜任。

但当前这个目录中的 Demo，更关注以下能力：

- 自动发现 Docker 服务
- 使用文件动态配置蓝绿权重
- 无需频繁手工 reload
- 快速观察流量路由关系

因此，这里选择 Traefik，不是因为 Nginx 不能做，而是因为 **Traefik 在这个具体场景下实现成本更低、表达更直接、维护更轻量。**

## 当前 Demo 做了什么

当前示例目录中的核心文件包括：

- `compose/traefik/traefik.compose.yml`
- `compose/traefik/traefik/traefik.yml`
- `compose/traefik/traefik/dynamic/blue-green.yml`

对应的目录结构如下：

```text
compose/traefik/
├── traefik.compose.yml
└── traefik/
    ├── traefik.yml
    └── dynamic/
        └── blue-green.yml
```

这个 Demo 的目标非常明确：

**通过 Traefik 管理两个版本的服务，并用加权路由实现蓝绿切流。**

整个示例中有三个容器：

- `traefik`
- `whoami-blue`
- `whoami-green`

其中：

- `traefik` 是统一流量入口
- `whoami-blue` 是蓝色版本
- `whoami-green` 是绿色版本

为了便于观察结果，这里使用的是 `traefik/whoami` 镜像。这个镜像会返回当前容器信息，所以非常适合用来验证请求到底落到了哪个版本。

## Demo 的整体工作原理

这个示例把请求入口分成了三类：

- `app.localhost`
- `blue.localhost`
- `green.localhost`

它们分别代表不同的访问方式。

### `app.localhost`

这是主流量入口。

访问它时，请求不会直接进入某一个固定版本，而是先交给一个“加权服务”，再由加权服务根据配置比例分发到蓝色或绿色版本。

这就是蓝绿切流的核心入口。

### `blue.localhost`

这个地址直接访问蓝色版本。

它的作用不是承载主流量，而是用于单独验证蓝版本是否正常。

### `green.localhost`

这个地址直接访问绿色版本。

它的作用和 `blue.localhost` 一样，是为了在切流前后，能够绕过加权逻辑直接验证某个版本。

## Compose 编排层做了什么

在 `compose/traefik/traefik.compose.yml` 中，Traefik 服务承担了入口代理角色。

完整配置如下：

```yaml
services:
  traefik:
    image: "traefik:v3.6"
    container_name: "traefik"
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - demo
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=demo"
      - "--entryPoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "./traefik:/etc/traefik"

  whoami-blue:
    image: "traefik/whoami"
    container_name: "whoami-blue"
    restart: unless-stopped
    environment:
      - WHOAMI_NAME=BLUE_VERSION
      - WHOAMI_COLOR=blue
    networks:
      - demo
    labels:
      - "traefik.enable=false"

  whoami-green:
    image: "traefik/whoami"
    container_name: "whoami-green"
    restart: unless-stopped
    environment:
      - WHOAMI_NAME=GREEN_VERSION
      - WHOAMI_COLOR=gree
    networks:
      - demo
    labels:
      - "traefik.enable=false"

networks:
  demo:
    name: demo
```

它的关键配置包括：

- 使用 `traefik:v3.6`
- 打开 Docker Provider
- 设置 `exposedByDefault=false`
- 监听 `80` 端口
- 暴露 `8080` 作为 Dashboard
- 挂载 Docker Socket
- 挂载本地 Traefik 配置目录

这部分配置说明：

1. Traefik 可以感知 Docker 环境中的容器
2. 它不会默认暴露所有容器
3. 它会从本地配置目录继续读取额外的动态规则

这里有两个特别值得注意的点。

### 第一，默认不暴露容器

配置中显式关闭了默认自动暴露，这是一种更安全的做法。否则，某些本不应该被公开访问的容器，也可能被 Traefik 识别并代理出去。

### 第二，Traefik 同时依赖 Docker 与文件配置

这个 Demo 并不是只靠 Docker Label 做路由，而是把更复杂的流量控制逻辑放到了动态配置文件里。这样做更适合演示蓝绿发布和权重切换。

## 静态配置层做了什么

在 `compose/traefik/traefik/traefik.yml` 中，定义了 Traefik 的静态配置。

完整配置如下：

```yaml
api:
  insecure: true
  dashboard: true
entryPoints:
  web:
    address: ":80"
providers:
  docker:
    exposedByDefault: false
  file:
    directory: /etc/traefik/dynamic
    watch: true
```

主要包含三部分：

- API 与 Dashboard
- 入口点
- Provider

### 开启 Dashboard

配置中启用了 Dashboard，便于观察路由和服务状态。本地环境下这样配置最方便，但如果是生产环境，通常不建议直接使用 `insecure: true`。

### 定义入口点

示例中只定义了一个入口点：`web`，监听 `80` 端口。所有 HTTP 请求都从这个入口进入。

### 同时启用两个 Provider

当前配置启用了：

- `docker`
- `file`

这意味着：

- Docker Provider 负责感知容器环境
- File Provider 负责提供动态路由与权重配置

同时，`watch: true` 表示 Traefik 会监听配置文件变化。这也是它能实现“修改权重后自动生效”的基础。

## 动态配置层为什么是整个 Demo 的核心

真正体现 Traefik 能力的，是 `compose/traefik/traefik/dynamic/blue-green.yml`。

完整配置如下：

```yaml
http:
  services:
    app-blue:
      loadBalancer:
        servers:
          - url: "http://whoami-blue:80"

    app-green:
      loadBalancer:
        servers:
          - url: "http://whoami-green:80"

    app-traffic:
      weighted:
        services:
          - name: app-blue
            weight: 0
          - name: app-green
            weight: 100

  routers:
    app-route:
      rule: "Host(`app.localhost`)"
      entryPoints:
        - web
      service: app-traffic

    blue-only:
      rule: "Host(`blue.localhost`)"
      entryPoints:
        - web
      service: app-blue

    green-only:
      rule: "Host(`green.localhost`)"
      entryPoints:
        - web
      service: app-green
```

这个文件定义了三个层次的内容：

- 两个基础服务
- 一个加权服务
- 三个路由规则

## 两个基础服务：蓝与绿

首先，配置里定义了两个逻辑服务：

- `app-blue`
- `app-green`

它们分别指向两个具体容器：

- `whoami-blue`
- `whoami-green`

这一步的意义是：Traefik 并不是直接围绕容器名做流量治理，而是先把后端抽象成逻辑服务，再在此基础上进行分发与路由控制。

## 一个加权服务：流量切换的关键

随后，配置定义了一个聚合服务 `app-traffic`。

它本身不对应具体容器，而是把流量按权重分发给蓝色和绿色两个版本。

当前配置中：

- 蓝色版本权重为 `0`
- 绿色版本权重为 `100`

这意味着访问主入口时，所有流量都会进入绿色版本。

如果把权重改成：

- 蓝色 `10`
- 绿色 `90`

那么就表示 10% 的请求进入蓝版本，90% 进入绿版本。

如果改成：

- 蓝色 `100`
- 绿色 `0`

则表示主流量已经完全切换到蓝版本。

这一机制就是蓝绿发布、灰度发布背后的核心控制方式之一。

## 三个路由：主流量与版本直达

在这个动态配置中，一共定义了三个路由。

### 主路由

`app.localhost` 会进入 `app-traffic`，也就是进入加权流量分发逻辑。

这代表正式入口。

### 蓝色直达路由

`blue.localhost` 会直接进入蓝色版本。

这代表测试入口。

### 绿色直达路由

`green.localhost` 会直接进入绿色版本。

这同样是测试入口。

这三个入口组合起来，就构成了一个非常典型的蓝绿发布模型：

- 正式流量由主入口承载
- 两个测试入口可以分别验证新旧版本
- 权重调整可以实现平滑切换
- 回滚也只需要改回权重即可

## 这个 Demo 为什么很适合用来理解 Traefik

很多人第一次接触 Traefik，只看到它“能代理请求”，但没有理解它真正强大的地方。

这个 Demo 恰好能把 Traefik 的几个关键特性非常直观地展示出来。

### 第一，它不只是代理，而是入口治理组件

Traefik 的职责不只是把请求转出去，而是帮助你管理入口流量的组织方式。

### 第二，它非常适合动态环境

Docker 中的服务变化非常频繁，而 Traefik 可以比较自然地适应这种变化。

### 第三，它天然适合发布流量控制

蓝绿发布和灰度发布的本质，是按策略控制流量流向。而 Traefik 的 weighted service 正好提供了简单直接的实现方式。

### 第四，它有很强的可观察性

通过 Dashboard，可以快速看到路由是否注册成功，服务是否可用，以及请求链路是否符合预期。

## 如果实际运行，这个 Demo 可以怎么验证

如果本地具备 Docker 环境，可以通过以下命令启动：

```bash
docker compose -f compose/traefik/traefik.compose.yml up -d
```

启动之后，可以分别访问：

- `http://app.localhost`
- `http://blue.localhost`
- `http://green.localhost`
- `http://localhost:8080`

你会观察到：

- `app.localhost` 命中当前权重对应的版本
- `blue.localhost` 始终命中蓝版本
- `green.localhost` 始终命中绿版本
- Dashboard 中可以看到 Router 与 Service 的关系

如果继续修改 `blue-green.yml` 中的权重，Traefik 会因为启用了文件监听而自动加载新配置，从而完成流量切换。

这正是这个 Demo 最有教学意义的地方。

## 生产环境还需要补哪些东西

虽然这个案例很适合教学，但它仍然是一个最小化示例。如果进入生产环境，还需要继续完善，例如：

- 配置 HTTPS
- 管理证书
- 为 Dashboard 加访问控制
- 增加健康检查
- 配置日志与监控
- 引入中间件能力
- 结合更完整的发布流程

尤其是当前启用了非安全 Dashboard，只适合本地实验，不适合直接用于线上。

## 总结

Traefik 是一个非常适合现代容器环境的反向代理与边缘路由器。

它的真正价值不在于“能不能转发请求”，而在于它能否：

- 自动发现服务
- 动态管理路由
- 参与发布流量治理
- 提供清晰的可观察能力

而当前这个蓝绿发布 Demo，正好用最小成本展示了 Traefik 最值得理解的一面：

**它让流量切换不再依赖笨重、静态、难维护的代理配置，而是变成一种清晰、动态、可验证的流量治理过程。**
