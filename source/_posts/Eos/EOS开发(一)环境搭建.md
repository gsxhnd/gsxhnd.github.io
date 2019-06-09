---
title: EOS开发(一)环境搭建
tags: 
    - EOS
    - 区块链

categories:
    - EOS
date: 2018/10/18 14:33
---

# 获取Docker镜像

```bash
$ docker pull eosio/eos
```

# 启动节点和钱包

```bash
$ docker run --name eosio \
  --publish 7777:7777 \
  --publish 127.0.0.1:5555:5555 \
  --volume /home/work:/home/work/ \
  --detach \
  eosio/eos \
  /bin/bash -c \
  "keosd --http-server-address=0.0.0.0:5555 & exec nodeos -e -p eosio --plugin eosio::producer_plugin --plugin eosio::history_plugin --plugin eosio::chain_api_plugin --plugin eosio::history_plugin --plugin eosio::history_api_plugin --plugin eosio::http_plugin -d /mnt/dev/data --config-dir /mnt/dev/config --http-server-address=0.0.0.0:7777 --access-control-allow-origin=* --contracts-console --http-validate-host=false --filter-on='*'"
```

`--volume` 是docker的卷管理 将docker环境中的`home/work/`目录映射到本机`/home/work/`目录中

这些设置可实现以下功能：
1. 将端口7777和5555转发到主机。
2. 将本地的工作卷映射到docker容器中。
3. 在Bash中启动Nodeos。这个命令会加载所有的插件，设置服务器地址，启用CORS和一些智能合约的Debug

<!-- more -->

# 确认安装

## 检查节点是否正在生成块

运行如下命令：
```bash
$ docker logs --tail 10 eosio
```
可以在控制台中看到如下输出：
```
1929001ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366974ce4e2a... #13929 @ 2018-05-23T16:32:09.000 signed by eosio [trxs: 0, lib: 13928, confirmed: 0]
1929502ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366aea085023... #13930 @ 2018-05-23T16:32:09.500 signed by eosio [trxs: 0, lib: 13929, confirmed: 0]
1930002ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366b7f074fdd... #13931 @ 2018-05-23T16:32:10.000 signed by eosio [trxs: 0, lib: 13930, confirmed: 0]
1930501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366cd8222adb... #13932 @ 2018-05-23T16:32:10.500 signed by eosio [trxs: 0, lib: 13931, confirmed: 0]
1931002ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366d5c1ec38d... #13933 @ 2018-05-23T16:32:11.000 signed by eosio [trxs: 0, lib: 13932, confirmed: 0]
1931501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366e45c1f235... #13934 @ 2018-05-23T16:32:11.500 signed by eosio [trxs: 0, lib: 13933, confirmed: 0]
1932001ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000366f98adb324... #13935 @ 2018-05-23T16:32:12.000 signed by eosio [trxs: 0, lib: 13934, confirmed: 0]
1932501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 00003670a0f01daa... #13936 @ 2018-05-23T16:32:12.500 signed by eosio [trxs: 0, lib: 13935, confirmed: 0]
1933001ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 00003671e8b36e1e... #13937 @ 2018-05-23T16:32:13.000 signed by eosio [trxs: 0, lib: 13936, confirmed: 0]
1933501ms thread-0   producer_plugin.cpp:585       block_production_loo ] Produced block 0000367257fe1623... #13938 @ 2018-05-23T16:32:13.500 signed by eosio [trxs: 0, lib: 13937, confirmed: 0]
```

## 确认钱包

```bash
$ docker exec -it eosio bash
$ cleos --wallet-url http://127.0.0.1:5555 wallet list keys

# 可以看到返回值：
Wallets:
[]
```

现在我们可以确认 `keosd`运行正常, 输入 `exit` 回车退出`keosd` 。从现在开始，我们不需要使用bash进入容器，并且您将从本地系统执行命令(Linux or Mac)

## 确认节点端
检查RPC API是否正常工作。
在终端下输入如下命令查看信息：

```bash
$ curl http://localhost:7777/v1/chain/get_info

{"server_version":"8f0f54cf","chain_id":"cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f","head_block_num":17090,"last_irreversible_block_num":17089,"last_irreversible_block_id":"000042c1fd994e1ca7b330f1e147964b48a33a8e9d931247ae81e65cf91e1fe8","head_block_id":"000042c25cab5fa49aee317a13415499acf5e620369183512142bedd7d7cf9ca","head_block_time":"2018-10-18T06:43:24.500","head_block_producer":"eosio","virtual_block_cpu_limit":200000000,"virtual_block_net_limit":1048576000,"block_cpu_limit":199900,"block_net_limit":1048576,"server_version_string":"v1.3.1"}
```

## 设置Cleos别名

我们不想每次与Nodeos或者Keosd交互时都进入Docker容器的Bash，设置Cleos别名让我们更容易使用cleos。

首先退出docker环境，然后在本机输入如下命令：

```bash
alias cleos='docker exec -it eosio /opt/eosio/bin/cleos --url http://127.0.0.1:7777 --wallet-url http://127.0.0.1:5555'
```

## 记下有用的Docker命令

### 启动/停止容器

```bash
$ docker start eosio
$ docker stop eosio
```

### 移除EOSIO容器

```bash
$ docker rm eosio
```

# 构建智能合约开发工具包

EOSIO Contract Development Toolkit（智能合约开发工具包），缩写CDT，是与智能合约编译相关的工具包。随后的教程会主要使用CDT来编译智能合约和生成ABIs。

`eosio.cdt`所克隆的位置并不重要，因为在最后一步你会将`eosio.cdt`编译成本地的二进制包。现在，您可以将`eosio.cdt`克隆到您认为合适的本地系统上的任何其他位置。

```bash
$ cd /home/work
# Clone the eosio.cdt repository.
$ git clone --recursive https://github.com/eosio/eosio.cdt
$ cd eosio.cdt
```

## Step 1: 编译
当编译`eosio.cdt`，你需要定义 symbol

本教程与网络无关的，因此教程将使用符号SYS作为本地开发环境的核心符号

```bash
$ ./build.sh SYS
```

## Step 2: 安装

```bash
$ sudo ./install.sh
```

因为eosio.cdt的命令将会被安装在本地，所以上面的命令需要使用`sudo`运行。

安装`eosio.cdt`将使编译后的二进制文件全局化，因此可以在任何地方运行它。
对于本教程， **强烈建议您不要跳过`eosio.cdt`的安装步骤**, 无法安装将使遵循此教程和其他教程变得更加困难，并且通常更难以使用。


