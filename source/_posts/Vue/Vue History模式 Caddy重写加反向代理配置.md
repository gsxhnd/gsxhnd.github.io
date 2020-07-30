---
title: Vue History模式 Caddy重写加反向代理配置
tags:
  - Vue
categories:
  - Vue
date: 2019/2/21 21:52
---

# 简介

1 在 vue 路由模式为 history 的时候，刷新页面会出现 404 问题。我们只需要在服务器配置如果 URL 匹配不到任何静态资源，就跳转到默认的 index.html。
2 需要反响代理，实现 AJAX 请求。

```
exampe.com {
    root /root/html
    gzip
    proxy /api http://127.0.0.1:8080
    proxy /resource http://127.0.0.1:8080
    rewrite {
        if {path} not_match ^(/api|/resource)
        to {path} {path} /
    }
}
```
