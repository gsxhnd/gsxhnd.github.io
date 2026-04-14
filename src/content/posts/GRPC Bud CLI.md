---
title: GRPC Buf CLI
author:
origin: buf.build
description: Buf CLI 是一款面向现代 Protobuf API 管理的高效工具，强调快速、现代与易用
created: 2026-04-14 11:11:10
published: 2026-04-14 11:11:10
tags:
  - grpc
  - go
---
## Buf CLI

Buf CLI 是一款围绕 Protobuf / gRPC 工作流设计的工具链，核心目标是用统一配置替代零散的 `protoc` 命令、脚本和团队约定。它把代码生成、依赖管理、Lint、破坏性变更检查以及与 [Buf Schema Registry](https://buf.build/docs/bsr/) 的协作整合到一套一致的命令模型中。

如果把传统 `protoc` 工作流理解为“手动拼命令”，那么 Buf 更像是“声明式地描述 API 工程规则”，再通过 CLI 稳定执行这些规则。

## Buf 能解决什么问题

- 统一代码生成入口，避免每个语言或插件都单独维护脚本
- 用内置 Lint 规则约束 `.proto` 风格和目录结构
- 在 CI 中做 breaking change 检查，降低 schema 演进风险
- 通过 `deps` 和 `buf.lock` 管理第三方 proto 依赖，减少 vendoring 成本
- 将模块发布到 BSR，便于团队内外复用和协作

## 命令

Buf 提供的一组命令将 Protobuf 管理从繁琐工作转变为顺畅的工作流：生成代码、安全演进 schema、测试 API，以及通过 [Buf Schema Registry](https://buf.build/docs/bsr/) 与他人协作：

- [`generate`](https://buf.build/docs/generate/): 使用 `protoc` 插件根据 Protobuf 文件生成代码桩
- [`breaking`](https://buf.build/docs/breaking/): 验证是否引入了破坏性变更，防止兼容性问题
- [`lint`](https://buf.build/docs/lint/): 按照最佳实践对 Protobuf 文件进行 Lint 检查
- [`format`](https://buf.build/docs/format/): 格式化 Protobuf 文件，保持风格一致
- [`build`](https://buf.build/docs/reference/cli/buf/build/): 构建模块并校验 schema 是否可被正确解析
- [`curl`](https://buf.build/docs/curl/): 通过调用 RPC 端点来测试 API，类似使用 `curl`
- [`convert`](https://buf.build/docs/reference/cli/buf/convert/): 在二进制与 JSON 之间转换消息，适合调试或测试场景
- [`dep update`](https://buf.build/docs/reference/cli/buf/dep/update/): 拉取并更新 `buf.lock` 中锁定的依赖版本
- [`registry`](https://buf.build/docs/reference/cli/buf/registry/)、[`push`](https://buf.build/docs/reference/cli/buf/push/) 和 [`export`](https://buf.build/docs/bsr/module/export/): 管理你在 Buf Schema Registry 中的仓库
- [`config`](https://buf.build/docs/reference/cli/buf/config/): 生成并管理 Buf 配置文件

完整的命令选项与参数说明，请参见 [Buf CLI 参考文档](https://buf.build/docs/reference/cli/buf/)。

## 配置

Buf CLI 通过几个简单的 YAML 文件进行配置：

- [`buf.yaml`](https://buf.build/docs/configuration/v2/buf-yaml/): 定义模块、依赖、Lint 和 breaking 规则
- [`buf.gen.yaml`](https://buf.build/docs/configuration/v2/buf-gen-yaml/): 定义代码生成插件、输出目录和 managed mode
- [`buf.lock`](https://buf.build/docs/configuration/v2/buf-lock/): 锁定依赖版本，确保团队和 CI 环境结果一致

一个典型目录通常类似这样：

```text
.
|-- buf.yaml
|-- buf.gen.yaml
|-- buf.lock
|-- proto/
`-- gen/
```

### `buf.yaml`

`buf.yaml` 是项目主配置，通常关心四类内容：

- `modules`: 本地 proto 模块路径
- `deps`: 依赖的远程模块，例如 `googleapis`
- `lint`: 风格和约束规则
- `breaking`: schema 兼容性检查规则

### `buf.gen.yaml`

`buf.gen.yaml` 负责“如何生成代码”。你可以在这里声明：

- 使用本地插件还是远程插件
- 输出目录 `out`
- 插件参数 `opt`
- 是否启用 managed mode 自动处理部分 file option

### `buf.lock`

`buf.lock` 类似语言生态中的 lockfile。执行依赖更新后，Buf 会把解析后的依赖版本写入这里，避免不同机器上拿到不同的 proto 依赖。

## 安装

```shell
# Homebrew 安装
brew install bufbuild/buf/buf

# go 安装
go install github.com/bufbuild/buf/cmd/buf@1.67.0
```

安装完成后，可先检查版本：

```shell
buf --version
```

## Quick Start

```shell
buf config init
```

上面的命令会初始化基础配置文件，随后可按项目结构补充 `buf.yaml` 与 `buf.gen.yaml`。

```yaml group:buf tab:buf.yaml
# For details on buf.yaml configuration, visit https://buf.build/docs/configuration/v2/buf-yaml
version: v2
modules:
  - path: proto
deps:
  - buf.build/bufbuild/protovalidate
  - buf.build/googleapis/googleapis
lint:
  use:
    - STANDARD
breaking:
  use:
    - FILE
```

这里的含义是：

- `version: v2`: 使用 Buf v2 配置格式
- `modules`: 当前仓库中需要纳入管理的 proto 目录
- `deps`: 引入远程依赖模块
- `lint.use: STANDARD`: 使用官方推荐的一组标准规则
- `breaking.use: FILE`: 以文件级别规则检查兼容性

```yaml group:buf tab:buf.gen.yaml
# For details on buf.gen.yaml configuration, visit https://buf.build/docs/configuration/v2/buf-gen-yaml
version: v2
managed:
  enabled: true
  disable:
    # Don't modify any files in buf.build/googleapis/googleapis
    - module: buf.build/googleapis/googleapis
  override:
    - file_option: go_package_prefix
      value: go_micro_framework/gen\

plugins:
  # - remote: buf.build/protocolbuffers/go
  - local: protoc-gen-go
    out: gen
    opt: paths=source_relative
  # - remote: buf.build/grpc/go:v1.6.1
  - local: protoc-gen-go-grpc
    out: gen
    opt: paths=source_relative,require_unimplemented_servers=false
  # - remote: buf.build/grpc-ecosystem/gateway:v2.28.0
  - local: protoc-gen-grpc-gateway
    out: gen
    opt: paths=source_relative
  # - remote: buf.build/grpc-ecosystem/openapiv2:v2.28.0
  - local: protoc-gen-openapiv2
    out: docs/openapi

inputs:
  - directory: proto
```

这个生成配置说明：

- 打开 `managed.enabled` 后，Buf 可统一处理部分语言相关 file option
- `override` 用来覆盖某些 option，例如 Go 的包前缀
- `plugins` 中定义要调用的本地插件和产物目录
- `inputs` 指定生成输入目录

```go file:go.mod
module demo

go 1.24

tool (
 github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway
 github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2
 google.golang.org/grpc/cmd/protoc-gen-go-grpc
 google.golang.org/protobuf/cmd/protoc-gen-go
)
```

如果使用 Go 1.24+ 的 `tool` 块，可以执行：

```shell
go install tool
```

然后生成代码：

```shell
buf generate
```

## 常用工作流

开发过程中最常见的是下面这组命令：

```shell
# 格式化 proto
buf format -w

# 检查规范
buf lint

# 更新依赖锁文件
buf dep update

# 生成代码
buf generate
```

如果你需要在 CI 中校验兼容性，可以再加上：

```shell
buf breaking --against '.git#branch=main'
```

它会把当前分支的 schema 与 `main` 分支对比，判断是否存在破坏性变更。

## 与 `protoc` 的区别

相比直接调用 `protoc`，Buf 的优势主要在于：

- 配置集中在文件中，而不是散落在 shell 脚本里
- 原生支持 Lint 与 breaking change 检查
- 依赖管理更清晰，不必手动维护大量第三方 proto 文件
- 更适合放入 CI/CD 与团队协作流程

`protoc` 仍然是底层编译与插件生态基础，但 Buf 负责把这套能力组织成更可维护的工程化工作流。

## 适用场景

- 团队内有多个 gRPC / Protobuf 服务，需要统一规范
- 需要对 API schema 做持续演进与兼容性控制
- 希望把生成代码、依赖管理和 CI 检查统一起来
- 需要借助 BSR 共享或发布 proto 模块

## 参考

- [Buf CLI Reference](https://buf.build/docs/reference/cli/buf/)
- [Buf Configuration](https://buf.build/docs/configuration/v2/buf-yaml/)
- [Buf Generate](https://buf.build/docs/generate/)
- [Buf Breaking Change Detection](https://buf.build/docs/breaking/)
