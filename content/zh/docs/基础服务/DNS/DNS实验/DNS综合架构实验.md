---
title: "DNS综合架构实验"
---

# 环境说明

- 生成中DNS服务器需要做高可用，下面以单机作为演示

| hostname       | IP         | service | role                            | OS     |
| -------------- | ---------- | ------- | ------------------------------- | ------ |
| client         | 10.0.0.103 |         | 客户端                          | Ubuntu |
| dns-local      | 10.0.0.8   | bind9   | 本地 DNS（只缓存）              | CentOS |
| dns-forward    | 10.0.0.18  | bind9   | 转发 DNS（转发到自建的根域DNS） | CentOS |
| dns-xiangzheng | 10.0.0.28  | bind9   | xiangzheng 子域 DNS             | CentOS |
| dns-com        | 10.0.0.38  | bind9   | com 子域 DNS                    | CentOS |
| dns-root       | 10.0.0.48  | bind9   | 根域 DNS                        | CentOS |
| webserver      | 10.0.0.58  | nginx   | web服务器                       | CentOS |







# 注意事项

- **虽然部署顺序没有要求，但还是要部署一步测试一步 以便出现问题好排错**







# 部署 dns-xiangzheng 

## 配置

```bash
# 修改 named 配置文件
[root@dns-xiangzheng ~]# vim /etc/named.conf 
options {
	listen-on port 53 { localhost; }; # 53端口监听在本机所有IP
...
    directory 	"/var/named";
...
	allow-query     { any; }; # 允许所有主机来查询
...
	dnssec-enable no; # 建议改为no
	dnssec-validation no; # 建议改为no
...

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";



# 区域数据库文件
# /var/named/xiangzheng.com.zone
$TTL 600
@   IN    SOA    ns1    mail.xiangzheng.com. (
            2015042201 ;
            1H ;
            10M ;
            1D ;
            12H ;
            )
          NS   ns1
ns1       A    10.0.0.103
@         A    10.0.0.58
# 注意修改权限
# chgrp named /var/named/com.zone




# 区域数据库配置文件
# /etc/named.rfc1912.zones 
...
zone "xiangzheng.com" {
    type master;
    file "xiangzheng.com.zone";
};
...
```

## 测试

```bash
root@client:~# host xiangzheng.com 10.0.0.28
Using domain server:
Name: 10.0.0.28
Address: 10.0.0.28#53
Aliases: 
xiangzheng.com has address 10.0.0.58


# 向 10.0.0.28 发起DNS请求，查询 xiangzheng.com 对应的IP
root@client:~# dig xiangzheng.com @10.0.0.28
; <<>> DiG 9.16.1-Ubuntu <<>> xiangzheng.com @10.0.0.28
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 5457
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: 7e723cb438d5c4181041841862c584d5eb323ef2dd5b6092 (good)
;; QUESTION SECTION:
;xiangzheng.com.			IN	A # xiangzheng.com 对应的A记录是多少？

;; ANSWER SECTION:
xiangzheng.com.		600	IN	A	10.0.0.58 # xiangzheng.com 对应的A记录是10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.com.		600	IN	NS	ns1.xiangzheng.com. #额外的DNS从节点信息

;; ADDITIONAL SECTION:
ns1.xiangzheng.com.	600	IN	A	10.0.0.103 #额外的DNS从节点对应的IP

;; Query time: 0 msec
;; SERVER: 10.0.0.28#53(10.0.0.28)
;; WHEN: Wed Jul 06 20:49:25 CST 2022
;; MSG SIZE  rcvd: 121
```





# 部署 dns-com

## 配置

```bash
# 修改 named 配置文件
[root@dns-com ~]# vim /etc/named.conf 
options {
	listen-on port 53 { localhost; }; # 53端口监听在本机所有IP
...
    directory 	"/var/named";
...
	allow-query     { any; }; # 允许所有主机来查询
...
	dnssec-enable no; # 建议改为no
	dnssec-validation no; # 建议改为no
...

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";



# 区域数据库文件
# /var/named/com.zone
$TTL 600
@   IN    SOA    ns1  mail.xiangzheng.com. (
            2015042201 ;
            1H ;
            10M ;
            1D ;
            12H ;
            )
               NS  ns1
xiangzheng     NS  xiangzhengns1 #xiangzheng子域对应的NS域名
ns1            A   10.0.0.104
xiangzhengns1  A   10.0.0.28 #NS域名对应的IP
# 注意修改权限
# chgrp named /var/named/com.zone




# 区域数据库配置文件
# /etc/named.rfc1912.zones 
...
zone "com" {
    type master;
    file "com.zone";
};
...
```

## 测试

```bash
root@client:~# host xiangzheng.com 10.0.0.38
Using domain server:
Name: 10.0.0.38
Address: 10.0.0.38#53
Aliases: 

xiangzheng.com has address 10.0.0.58


# 向 10.0.0.28 发起DNS请求，查询 xiangzheng.com 对应的IP
root@client:~# dig xiangzheng.com @10.0.0.38

; <<>> DiG 9.16.1-Ubuntu <<>> xiangzheng.com @10.0.0.38
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 17527
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: 6f00ea6cc4dc92fd843578f762c5fde40f176586ef3f2e1e (good)
;; QUESTION SECTION:
;xiangzheng.com.			IN	A

;; ANSWER SECTION:
xiangzheng.com.		592	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.com.		600	IN	NS	xiangzhengns1.com.

;; ADDITIONAL SECTION:
xiangzhengns1.com.	600	IN	A	10.0.0.28

;; Query time: 0 msec
;; SERVER: 10.0.0.38#53(10.0.0.38)
;; WHEN: Wed Jul 06 21:25:55 CST 2022
;; MSG SIZE  rcvd: 131
```







# 部署 dns-root

## 配置

```bash
# 修改 named 配置文件
[root@dns-root ~]# vim /etc/named.conf 
options {
	listen-on port 53 { localhost; }; # 53端口监听在本机所有IP
...
    directory 	"/var/named";
...
	allow-query     { any; }; # 允许所有主机来查询
...
	dnssec-enable no; # 建议改为no
	dnssec-validation no; # 建议改为no
...

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";



# 区域数据库文件
# /var/named/root.zone
$TTL 600
@   IN    SOA    ns1  mail.xiangzheng.com. (
            2015042201 ;
            1H ;
            10M ;
            1D ;
            12H ;
            )
            NS    ns1
com         NS    comns1 #com子域对应的NS域名
ns1         A     10.0.0.105
comns1      A     10.0.0.38 #NS域名对应的IP
# 注意修改权限
# chgrp named /var/named/root.zone




# 区域数据库配置文件
# /etc/named.rfc1912.zones 
...
zone "." {
    type master;
    file "root.zone";
};
...
```

## 测试

```bash
root@client:~# host xiangzheng.com 10.0.0.48
Using domain server:
Name: 10.0.0.48
Address: 10.0.0.48#53
Aliases: 

xiangzheng.com has address 10.0.0.58


root@client:~# dig xiangzheng.com @10.0.0.48

; <<>> DiG 9.16.1-Ubuntu <<>> xiangzheng.com @10.0.0.48
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 26385
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: c84f317b9b348d15b70e581562c603010a6c79a93ab3bf61 (good)
;; QUESTION SECTION:
;xiangzheng.com.			IN	A

;; ANSWER SECTION:
xiangzheng.com.		596	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.com.		596	IN	NS	xiangzhengns1.com.

;; ADDITIONAL SECTION:
xiangzhengns1.com.	596	IN	A	10.0.0.28

;; Query time: 4 msec
;; SERVER: 10.0.0.48#53(10.0.0.48)
;; WHEN: Wed Jul 06 21:47:44 CST 2022
;; MSG SIZE  rcvd: 131
```







# 部署 dns-forward

- **只指向自建的根DNS，即dns-root**

## 配置

```bash
# 修改 named 配置文件
[root@dns-forward ~]# vim /etc/named.conf 
options {
	listen-on port 53 { localhost; }; # 53端口监听在本机所有IP
...
    directory 	"/var/named";
...
	allow-query     { any; }; # 允许所有主机来查询
...
	dnssec-enable no; # 建议改为no
	dnssec-validation no; # 建议改为no
...

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";



# 修改指向的根DNS
# /var/named/named.ca
.           518400  IN  NS  a.root-servers.net.
a.root-servers.net. 518400  IN  A   10.0.0.48
```

## 测试

```bash
root@client:~# host xiangzheng.com 10.0.0.18
Using domain server:
Name: 10.0.0.18
Address: 10.0.0.18#53
Aliases: 

xiangzheng.com has address 10.0.0.58



root@client:~# dig xiangzheng.com @10.0.0.18

; <<>> DiG 9.16.1-Ubuntu <<>> xiangzheng.com @10.0.0.18
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 47454
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: 1d782f0fc152cd7187c2c5f262c595127ad14f1f87e9dbbc (good)
;; QUESTION SECTION:
;xiangzheng.com.			IN	A

;; ANSWER SECTION:
xiangzheng.com.		592	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.com.		592	IN	NS	xiangzhengns1.com.

;; ADDITIONAL SECTION:
xiangzhengns1.com.	592	IN	A	10.0.0.28

;; Query time: 0 msec
;; SERVER: 10.0.0.18#53(10.0.0.18)
;; WHEN: Wed Jul 06 21:58:42 CST 2022
;; MSG SIZE  rcvd: 131
```







# 部署 dns-local

## 配置

```bash
# 修改 named 配置文件
[root@dns-local ~]# vim /etc/named.conf 
options {
	listen-on port 53 { localhost; }; # 53端口监听在本机所有IP
...
    directory 	"/var/named";
...
	allow-query     { any; }; # 允许所有主机来查询
...
    forward only; #only表示转发的服务器如果查询不到则直接返回查询不到的结果
    forwarders { 10.0.0.18;}; #转发的DNS服务器IP
...
	dnssec-enable no; # 建议改为no
	dnssec-validation no; # 建议改为no
...

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";
```

## 测试

```bash
root@client:~# host xiangzheng.com 10.0.0.8
Using domain server:
Name: 10.0.0.8
Address: 10.0.0.8#53
Aliases: 

xiangzheng.com has address 10.0.0.58


root@client:~# dig xiangzheng.com @10.0.0.8

; <<>> DiG 9.16.1-Ubuntu <<>> xiangzheng.com @10.0.0.8
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 1374
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: bc40a75cf7036a146d2491c362c5984287bb9d93e7e1efe3 (good)
;; QUESTION SECTION:
;xiangzheng.com.			IN	A

;; ANSWER SECTION:
xiangzheng.com.		579	IN	A	10.0.0.58

;; Query time: 0 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Wed Jul 06 22:12:18 CST 2022
;; MSG SIZE  rcvd: 87
```

