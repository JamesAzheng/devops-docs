---
title: "04实现反向主DNS服务器"
---


# 前言

- **反向则表示将IP解析成域名**
- 应用场景有 邮件服务等（通过反向解析来判断是否是一个合法的邮件服务器，从而避免垃圾邮件）



# 建立反向解析数据库

```bash
[root@DNS ~]# vim /var/named/10.0.0.reverse.zone
$TTL 1D
@   IN   SOA    ns1.xiangzheng.org.  rootroot25.163.com. ( 1 12H 10M 3D 1D )
         NS     ns1.xiangzheng.org.
7        PTR      websrv.xiangzheng.org.
123      PTR      mailsrv.xiangzheng.org.
```

# 在配置文件中添加

```bash
#子配置文件添加，方便管理
[root@DNS named]# cat /etc/named.conf |grep -i include
include "/etc/named.rfc1912.zones";

[root@DNS ~]# vim /etc/named.rfc1912.zones 
zone "0.0.10.in-addr.arpa" IN {
    type master;
    file "10.0.0.reverse.zone";
};


#检查数据库语法是否错误
[root@DNS ~]# named-checkzone 0.0.10.in-addr.arpa /var/named/10.0.0.reverse.zone 
zone 0.0.10.in-addr.arpa/IN: loaded serial 1
OK

#检查配置文件是否有误
[root@DNS ~]# named-checkconf 

#检查无误后重新加载配置文件
[root@DNS ~]# rndc reload
server reload successful
```



# 测试反向解析

```bash
#-t ptr 表示指定类型为ptr记录，或者也可用使用dig -x 10.0.0.7 这样就不用反着写了
[root@18 ~]# dig -t ptr 7.0.0.10.in-addr.arpa

; <<>> DiG 9.11.26-RedHat-9.11.26-6.el8 <<>> -t ptr 7.0.0.10.in-addr.arpa
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14810
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: 511665a682ca568baa4c296c61bce6bd2167747f82432afd (good)
;; QUESTION SECTION:
;7.0.0.10.in-addr.arpa.		IN	PTR

;; ANSWER SECTION:
7.0.0.10.in-addr.arpa.	86400	IN	PTR	websrv.xiangzheng.org.

;; AUTHORITY SECTION:
0.0.10.in-addr.arpa.	86400	IN	NS	ns1.xiangzheng.org.

;; ADDITIONAL SECTION:
ns1.xiangzheng.org.	86400	IN	A	10.0.0.8

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Sat Dec 18 03:36:29 CST 2021
;; MSG SIZE  rcvd: 147

```





