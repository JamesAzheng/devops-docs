---
title: "DNS相关工具"
---

# host

- DNS测试工具，Centos 来自 bind-utils 包；

## syntax

- `host [选项] <域名> [DNS服务器]`

## option

```sh
-a # 显示详细的DNS记录，包括域名的所有记录类型。
-t <类型> # 指定查询的DNS记录类型。常见的类型包括：A（IPv4地址）、AAAA（IPv6地址）、CNAME（规范名）、MX（邮件交换记录）、NS（域名服务器记录）、PTR（反向解析记录）、TXT（文本记录）等。
-C # 显示完整的规范名（Canonical Name）链，包括所有CNAME记录。
-v # 显示详细的调试信息。
-4 # 仅使用IPv4地址。
-6 # 仅使用IPv6地址。
```

## example

- 查询域名的A记录（IPv4地址）：

```sh
host example.com


# 测试是否能将域名解析为IP地址
# host xiangzheng.vip
xiangzheng.vip has address 8.140.166.135
```

- 查询域名的AAAA记录（IPv6地址）：

```
host -t AAAA example.com
```

- 查询域名的MX记录（邮件交换记录）：

```
host -t MX example.com
```

- 查询域名的CNAME记录（规范名）：

```
host -t CNAME www.example.com
```

- 查询域名的所有记录类型：

```
host -a example.com
```

- 指定特定的DNS服务器进行查询：

```sh
host example.com ns1.example-dns-server.com


# host demoapp-svc.test.svc.cluster.local 169.254.25.10
Using domain server:
Name: 169.254.25.10
Address: 169.254.25.10#53
Aliases: 

demoapp-svc.test.svc.cluster.local has address 10.233.4.255
```





# dig

- 显示更详细的DNS测试工具，来自bind-utils包


## syntax

- `dig [选项] <域名> [记录类型] [DNS服务器]`

## option

```sh
+trace # 显示DNS查询的路径，包括每一步的中间DNS服务器。
+short # 以简洁格式显示结果，只显示IP地址或记录的值。
+stats # 显示执行查询的统计信息，包括查询时间、传输时间、响应大小等。
+nofail # 即使查询失败也不终止，继续查询其他DNS服务器。
@<DNS服务器> # 指定查询使用的DNS服务器。
```

## example

```bash
# 显示dns相关的详细信息
[root@DNS ~]# dig xiangzheng.vip

; <<>> DiG 9.11.26-RedHat-9.11.26-6.el8 <<>> xiangzheng.vip
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 48323
;; flags: qr rd; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: e637d014d318e73888c580e561bb0c0c22a2e3e30f462ad0 (good)
;; QUESTION SECTION:
;xiangzheng.vip.			IN	A

;; Query time: 0 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 16 17:51:08 CST 2021
;; MSG SIZE  rcvd: 71


# 测试140.205.41.21这个DNS服务器能否直接将xiangzheng.vip的IP解析出来，flags处显示aa表示可以，aa表示全为DNS服务器
dig xiangzheng.vip @140.205.41.21


# 查看域名或IP对应的邮件服务器地址
dig -t mx 邮件服务器的域名或IP


# 抓所有区域信息，但对已经安全加固的DNS服务器无效，@后面跟DNS服务器
dig -t axfr xiangzheng.org  @10.0.0.8

; <<>> DiG 9.11.26-RedHat-9.11.26-6.el8 <<>> -t axfr xiangzheng.org @10.0.0.18
;; global options: +cmd
xiangzheng.org.		86400	IN	SOA	ns1.xiangzheng.org. rootroot25.163.com. 20211218 3600 600 86400 10800
xiangzheng.org.		86400	IN	NS	ns1.xiangzheng.org.
xiangzheng.org.		86400	IN	NS	ns2.xiangzheng.org.
ns1.xiangzheng.org.	86400	IN	A	10.0.0.8
ns2.xiangzheng.org.	86400	IN	A	10.0.0.18
websrv.xiangzheng.org.	86400	IN	A	10.0.0.38
www.xiangzheng.org.	86400	IN	CNAME	websrv.xiangzheng.org.
xiangzheng.org.		86400	IN	SOA	ns1.xiangzheng.org. rootroot25.163.com. 20211218 3600 600 86400 10800
;; Query time: 2 msec
;; SERVER: 10.0.0.18#53(10.0.0.18)
;; WHEN: Sat Dec 18 05:33:15 CST 2021
;; XFR size: 8 records (messages 1, bytes 270)
```



- 查询域名的A记录（IPv4地址）：

```
dig example.com
```

- 查询域名的AAAA记录（IPv6地址）：

```
dig AAAA example.com
```

- 查询域名的MX记录（邮件交换记录）：

```
dig MX example.com
```

- 查询域名的CNAME记录（规范名）：

```
dig CNAME www.example.com
```

- 查询域名的所有记录类型：

```
dig ANY example.com
```

- 指定特定的DNS服务器进行查询：

```
dig example.com @8.8.8.8
```

- 使用`+trace`选项来跟踪DNS查询的路径：

```
dig +trace example.com
```





# nslookup

- `nslookup`是一个常用的DNS查询工具，用于获取域名的IP地址、解析域名、查看DNS缓存等。

## syntax

- `nslookup [选项] <域名> [DNS服务器]`

## option

```sh
-type=<类型>    # 指定查询的DNS记录类型。常见的类型包括：A（IPv4地址）、AAAA（IPv6地址）、CNAME（规范名）、MX（邮件交换记录）、NS（域名服务器记录）、PTR（反向解析记录）、TXT（文本记录）等。

-query=<类型>   # 同-type选项，指定查询的DNS记录类型。

-timeout=<秒数> # 设置查询的超时时间。

-debug  # 显示详细的调试信息。

-vc     # 强制使用TCP协议进行查询。
```

## example

- 查询域名的A记录（IPv4地址）：

```sh
nslookup example.com



# nslookup llinux.cn
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	llinux.cn
Address: 8.140.166.135
```

- 查询域名的AAAA记录（IPv6地址）：

```sh
nslookup -type=AAAA example.com
```

- 查询域名的MX记录（邮件交换记录）：

```sh
nslookup -type=MX example.com
```

- 查询域名的CNAME记录（规范名）：

```sh
nslookup -type=CNAME www.example.com
```

- 查询域名的NS记录（域名服务器记录）：

```sh
nslookup -type=NS example.com
```

- 查询域名的PTR记录（反向解析记录）：

```sh
nslookup -type=PTR 192.0.2.1
```

- 指定特定的DNS服务器进行查询：

```sh
nslookup example.com 8.8.8.8


# nslookup demoapp-svc.test.svc.cluster.local 169.254.25.10
Server:		169.254.25.10
Address:	169.254.25.10#53

Name:	demoapp-svc.test.svc.cluster.local
Address: 10.233.4.255

```



# resolvectl

- `resolvectl`命令是用于管理和配置系统的DNS解析设置的工具，它是systemd网络管理工具集的一部分。`resolvectl`提供了一种方便的方式来查看和修改系统的DNS解析器配置。

## syntax

- `resolvectl [选项] [命令]`

## option

```sh
status  # 显示当前的DNS解析器配置和状态信息。
list    # 列出系统中可用的DNS解析器配置文件。
set-dns <接口> <DNS服务器>   # 为指定接口设置DNS服务器。
set-domain <接口> <域名>    # 为指定接口设置搜索域名。
set-link <接口> <配置文件>   # 为指定接口设置DNS解析器配置文件。
revert <接口>  # 恢复指定接口的DNS解析器配置为默认设置。
```

## example

- 需要开启 `systemd-resolved` 服务才能使用，Ubuntu中此服务以默认开启

```sh
# resolvectl query llinux.cn
llinux.cn: 8.140.166.135                       -- link: eth0

-- Information acquired via protocol DNS in 253.4ms.
-- Data is authenticated: no
```



- 显示当前的DNS解析器配置和状态信息：

```
resolvectl status
```

- 列出系统中可用的DNS解析器配置文件：

```
resolvectl list
```

- 为指定接口设置DNS服务器：

```
resolvectl set-dns eth0 8.8.8.8 8.8.4.4
```

- 为指定接口设置搜索域名：

```
resolvectl set-domain eth0 example.com
```

- 为指定接口设置DNS解析器配置文件：

```
resolvectl set-link eth0 myconfig
```

- 恢复指定接口的DNS解析器配置为默认设置：

```
resolvectl revert eth0
```

