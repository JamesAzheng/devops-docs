---
title: "CDN与智能DNS"
---

# GSLB

- GSLB：Global Server Load Balance全局负载均衡
- GSLB是对服务器和链路进行综合判断来决定由哪个地点的服务器来提供服务，实现异地服务器群服务质量的保证
- GSLB主要的目的是在整个网络范围内将用户的请求定向到最近的节点（或者区域）
- GSLB分为基于DNS实现、基于重定向实现、基于路由协议实现，其中最通用的是基于DNS解析方式









# CDN 概述

- Content distribution network 内容分发网络

- **CDN 的实现主要就是依赖了智能 DNS**

## CDN工作原理

1. 用户向浏览器输入www.a.com这个域名，浏览器第一次发现本地没有dns缓存，则向网站的DNS服务器请求
2. 网站的DNS域名解析器设置了CNAME，指向了www.a.tbcdn.com,请求指向了CDN网络中的智能DNS负载均衡系统
3. 智能DNS负载均衡系统解析域名，把对用户响应速度最快的IP节点返回给用户；
4. 用户向该IP节点（CDN服务器）发出请求
5. 由于是第一次访问，CDN服务器会通过Cache内部专用DNS解析得到此域名的原web站点IP，向原站点服务器发起请求，并在CDN服务器上缓存内容
6. 请求结果发给用户

## CDN 服务商

- 服务商：阿里，腾讯，蓝汛，网宿，帝联等
- 智能DNS: dnspod dns.la



## 范例：京东使用的CDN

```bash
# 使用谷歌的DNS服务器来查询京东的DNS解析信息
# dig www.jd.com @8.8.8.8

; <<>> DiG 9.11.36-RedHat-9.11.36-3.el8 <<>> www.jd.com @8.8.8.8
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 65152
;; flags: qr rd ra; QUERY: 1, ANSWER: 4, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;www.jd.com.			IN	A

;; ANSWER SECTION:
www.jd.com.		61	IN	CNAME	www.jd.com.gslb.qianxun.com. #指向了CDN的CNAME
www.jd.com.gslb.qianxun.com. 55	IN	CNAME	jd-abroad.cdn20.com. #指向了CDN的CNAME
jd-abroad.cdn20.com.	32	IN	A	222.34.55.166 #分配的就近CDN节点，吉林省四平市 铁通
jd-abroad.cdn20.com.	32	IN	A	111.43.178.111 #分配的就近CDN节点，黑龙江省哈尔滨市 移动

;; Query time: 65 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Wed Jul 06 18:31:36 CST 2022
;; MSG SIZE  rcvd: 139
```









# 实现智能DNS（CDN）

- 详参PDF
- **生成中我们只需将域名指向CDN服务商的CNAME即可，掏钱就行了**
