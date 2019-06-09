---
  title: Vue History模式 Caddy重写加反向代理配置
  tags: 
      - Vue
      - 前端
      - Caddy
  
  categories:
      - Vue
  date: 2019/2/21 21:52
---



#  简介
1 在vue路由模式为history的时候，刷新页面会出现404问题。我们只需要在服务器配置如果URL匹配不到任何静态资源，就跳转到默认的index.html。
2 需要反响代理，实现AJAX请求。

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