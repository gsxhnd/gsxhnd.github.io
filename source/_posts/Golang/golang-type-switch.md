---
title: Golang类型转换方法
tags:
  - Golang
categories:
  - Golang
date: 2020/05/26 13:29
---

## int

```go
import "strconv"  //先导入strconv包

// int到string
string := strconv.Itoa(int)

// int64到string
string := strconv.FormatInt(int64,10)
```

## float

```go
//float到string
string := strconv.FormatFloat(float32, 'E', -1, 32)

string := strconv.FormatFloat(float64, 'E', -1, 64)
// 'b' (-ddddp±ddd，二进制指数)
// 'e' (-d.dddde±dd，十进制指数)
// 'E' (-d.ddddE±dd，十进制指数)
// 'f' (-ddd.dddd，没有指数)
// 'g' ('e':大指数，'f':其它情况)
// 'G' ('E':大指数，'f':其它情况)
```

## string

```go
import "strconv"  //先导入strconv包

// string到int
int, err := strconv.Atoi(string)

// string到int64
int64, err := strconv.ParseInt(string, 10, 64)

//string到float32(float64)
float, err := strconv.ParseFloat(string,32/64)

//string 到 uint64(uint32)
uint64, err :=strconv.ParseUint(string,10,64)

```
