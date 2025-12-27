---
title: "07实现Internet的DNS服务架构"
---

# 实验环境

```sh
10.0.0.7  #客户端
10.0.0.17 #本地DNS(只缓存)
10.0.0.8  #转发DNS(forward)
10.0.0.18 #根DNS
10.0.0.28 #父域(org)DNS
10.0.0.38 #子域DNS(主)
10.0.0.48 #子域DNS(从)
10.0.0.58 #web服务器
```

- 选择从下到上的方式搭建 方便测试
- 从上到下搭建没有办法进行测试，因为假如先搭建了转发服务器 而其他服务器没有搭建将没有办法测试转发



## 前期准备

- 关闭SElinux
- 关闭防火墙
- 时间同步



# web服务器配置

```bash
[root@web-server ~]# yum -y install nginx ; systemctl enable --now nginx ; echo 10.0.0.58 page > /usr/share/nginx/html/index.html
```

### 测试：

```bash
#因为没有配置域名和IP间的记录，所以只能用IP来测试
[root@client ~]#curl 10.0.0.58
10.0.0.58 page
```



# 主DNS配置

```bash
#安装bind dns
[root@master-dns ~]# yum -y install bind

#修改主配置文件
[root@master-dns ~]# vim /etc/named.conf 
...
options {
//  listen-on port 53 { 127.0.0.1; };
...
//  allow-query     { localhost; };
	allow-transfer { 10.0.0.48; }; #安全加固，只允许从节点10.0.0.48来抓取数据
...

#修改子配置文件，设置域名和区域数据库位置
[root@master-dns ~]# vim /etc/named.rfc1912.zones 
zone "xiangzheng.org" IN { #设置xiangzheng.org的域名
    type master;
    file "xiangzheng.org.zone"; #指定区域数据库的名称
};

#创建数据库内容
[root@master-dns ~]# cd /var/named/
[root@master-dns named]# cp -a named.localhost xiangzheng.org.zone
[root@master-dns named]# vim xiangzheng.org.zone
$TTL 1D
@   IN SOA  master rootroot25.163.com. (
                    1   ; serial
                    1D  ; refresh
                    1H  ; retry
                    1W  ; expire
                    3H )    ; minimum
@       NS   master
@       NS   slave
master  A    10.0.0.38
slave   A    10.0.0.48
www     A    10.0.0.58

#检查语法（named-checkzone 命令需要安装 bind-utils包）
[root@master-dns named]# named-checkzone xiangzheng.org xiangzheng.org.zone 
zone xiangzheng.org/IN: loaded serial 1
OK
[root@master-dns named]# named-checkconf

#生效
systemctl enable --now named #第一次启动服务
rndc reload                  #不是第一次启动服务
```

### 测试：

```bash
[root@client ~]#host www.xiangzheng.org 10.0.0.38
Using domain server:
Name: 10.0.0.38
Address: 10.0.0.38#53
Aliases: 

www.xiangzheng.org has address 10.0.0.58
```



# 从DNS配置

```bash
[root@slave-dns ~]# yum -y install bind bind-utils

#修改主配置文件
[root@slave-dns ~]# vim /etc/named.conf
...
options {
//  listen-on port 53 { 127.0.0.1; };
...
//  allow-query     { localhost; };
	allow-transfer { none; }; #安全加固，不允许任何人来抓取数据
...

#修改子配置文件
[root@slave-dns ~]# vim /etc/named.rfc1912.zones
zone "xiangzheng.org" IN {
    type slave;
    masters { 10.0.0.38; };
    file "slaves/xiangzheng.org.zone.slave";
};

#检查语法
[root@slave-dns ~]# named-checkconf

#生效
systemctl enable --now named #第一次启动服务
rndc reload                  #不是第一次启动服务

#更新主库数据库版本，并重新加载配置文件
[root@master-dns named]# vim xiangzheng.org.zone
...
                    2   ; serial
...
[root@master-dns named]# rndc reload
server reload successful

#查看从库文件是否出现
[root@slave-dns ~]# ll /var/named/slaves/
total 4
-rw-r--r-- 1 named named 353 Dec 19 10:45 xiangzheng.org.zone.slave
```

### 测试：

```bash
[root@client ~]#host www.xiangzheng.org 10.0.0.48
Using domain server:
Name: 10.0.0.48
Address: 10.0.0.48#53
Aliases: 

www.xiangzheng.org has address 10.0.0.58

[root@client ~]#dig  www.xiangzheng.org @10.0.0.48

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.el7_9.8 <<>> www.xiangzheng.org @10.0.0.48
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 33573
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.xiangzheng.org.		IN	A

;; ANSWER SECTION:
www.xiangzheng.org.	86400	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.org.		86400	IN	NS	slave.xiangzheng.org.
xiangzheng.org.		86400	IN	NS	master.xiangzheng.org.

;; ADDITIONAL SECTION:
master.xiangzheng.org.	86400	IN	A	10.0.0.38
slave.xiangzheng.org.	86400	IN	A	10.0.0.48

;; Query time: 1 msec
;; SERVER: 10.0.0.48#53(10.0.0.48)
;; WHEN: Sun Dec 19 11:17:33 CST 2021
;; MSG SIZE  rcvd: 136
```



# 父域(org)DNS配置

```bash
[root@org-dns ~]# yum -y install bind bind-utils

#修改主配置文件
[root@org-dns ~]# vim /etc/named.conf
...
options {
//  listen-on port 53 { 127.0.0.1; };
...
//  allow-query     { localhost; };
	allow-transfer { none; }; #安全加固，不允许任何人来抓取数据
...

#修改子配置文件
[root@org-dns ~]# vim /etc/named.rfc1912.zones
...
zone "org" IN {
    type master;
    file "org.zone";
};
...

#创建数据库内容
[root@org-dns ~]# cd /var/named/   
[root@org-dns named]# cp -a named.localhost org.zone
[root@org-dns named]# vim org.zone
$TTL 1D
@   IN        SOA   master rootroot25.163.com. (
                    0   ; serial
                    1D  ; refresh
                    1H  ; retry
                    1W  ; expire
                    3H )    ; minimum
@             NS   master
xiangzheng    NS xiangzhengns1
xiangzheng    NS xiangzhengns2
master        A    10.0.0.28
xiangzhengns1 A 10.0.0.38
xiangzhengns2 A 10.0.0.48

#检查语法
[root@org-dns named]# named-checkzone org /var/named/org.zone 
zone org/IN: loaded serial 0
OK
[root@org-dns named]# named-checkconf

#生效
systemctl enable --now named #第一次启动服务
rndc reload                  #不是第一次启动服务
```

### 测试：

```bash
[root@client ~]#host www.xiangzheng.org 10.0.0.28
Using domain server:
Name: 10.0.0.28
Address: 10.0.0.28#53
Aliases: 

www.xiangzheng.org has address 10.0.0.58
[root@client ~]#dig  www.xiangzheng.org @10.0.0.28

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.el7_9.8 <<>> www.xiangzheng.org @10.0.0.28
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 46852
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.xiangzheng.org.		IN	A

;; ANSWER SECTION:
www.xiangzheng.org.	86385	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.org.		86400	IN	NS	xiangzhengns1.org.
xiangzheng.org.		86400	IN	NS	xiangzhengns2.org.

;; ADDITIONAL SECTION:
xiangzhengns1.org.	86400	IN	A	10.0.0.38
xiangzhengns2.org.	86400	IN	A	10.0.0.48

;; Query time: 0 msec
;; SERVER: 10.0.0.28#53(10.0.0.28)
;; WHEN: Sun Dec 19 11:15:30 CST 2021
;; MSG SIZE  rcvd: 151
```



# 根DNS配置

```bash
[root@root-dns ~]# yum -y install bind bind-utils

#修改主配置文件
root@root-dns ~]# vim /etc/named.conf
...
options {
//  listen-on port 53 { 127.0.0.1; };
...
//  allow-query     { localhost; };
...
zone "." IN {
    type master; #修改根为主
    file "root.zone"; #指定根DNS区域数据库文件
};
...

#修改区域数据库文件
[root@root-dns ~]# cd /var/named/
[root@root-dns named]# vim root.zone 
$TTL 1D  
@           IN  SOA master rootroot25.163.com.  ( 1 1D 1H 1W 3D )
@               NS  master
org             NS  orgns
master          A   10.0.0.18
orgns           A   10.0.0.28

#检查语法
[root@root-dns named]# named-checkzone . root.zone 
zone ./IN: loaded serial 1
OK
[root@root-dns named]# named-checkconf

#生效
systemctl enable --now named #第一次启动服务
rndc reload                  #不是第一次启动服务
```

### 测试：

```bash
[root@client ~]#host www.xiangzheng.org 10.0.0.18
Using domain server:
Name: 10.0.0.18
Address: 10.0.0.18#53
Aliases: 

www.xiangzheng.org has address 10.0.0.58

[root@client ~]#dig www.xiangzheng.org @10.0.0.18

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.el7_9.8 <<>> www.xiangzheng.org @10.0.0.18
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 52622
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.xiangzheng.org.		IN	A

;; ANSWER SECTION:
www.xiangzheng.org.	86378	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.org.		86378	IN	NS	xiangzhengns2.org.
xiangzheng.org.		86378	IN	NS	xiangzhengns1.org.

;; ADDITIONAL SECTION:
xiangzhengns1.org.	86378	IN	A	10.0.0.38
xiangzhengns2.org.	86378	IN	A	10.0.0.48

;; Query time: 0 msec
;; SERVER: 10.0.0.18#53(10.0.0.18)
;; WHEN: Sun Dec 19 11:41:49 CST 2021
;; MSG SIZE  rcvd: 151
```



# 转发DNS配置

```bash
[root@forward-dns ~]# yum -y install bind bind-utils

#修改主配置文件
[root@forward-dns ~]#vim /etc/named.conf
options {
//      listen-on port 53 { 127.0.0.1; }; #注释掉
...
//      allow-query     { localhost; }; #注释掉
...
		#关闭dnsec功能，否则会影响转发，此功能和安全加密有关，生产环境不常用
        dnssec-enable no;
        dnssec-validation no;
...
};

#修改区域数据库文件
[root@forward-dns ~]# vim /var/named/named.ca
.           518400  IN  NS  a.root-servers.net.
a.root-servers.net. 518400  IN  A   10.0.0.18

#检查语法
[root@root-dns named]# named-checkconf

#生效
systemctl enable --now named #第一次启动服务
rndc reload                  #不是第一次启动服务
```

### 测试：

```bash
[root@client ~]#host www.xiangzheng.org 10.0.0.8
Using domain server:
Name: 10.0.0.8
Address: 10.0.0.8#53
Aliases: 

www.xiangzheng.org has address 10.0.0.58

[root@client ~]#dig www.xiangzheng.org @10.0.0.8

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.el7_9.8 <<>> www.xiangzheng.org @10.0.0.8
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 38906
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;www.xiangzheng.org.		IN	A

;; ANSWER SECTION:
www.xiangzheng.org.	86384	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.org.		86384	IN	NS	xiangzhengns1.org.
xiangzheng.org.		86384	IN	NS	xiangzhengns2.org.

;; ADDITIONAL SECTION:
xiangzhengns1.org.	86384	IN	A	10.0.0.38
xiangzhengns2.org.	86384	IN	A	10.0.0.48

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Sun Dec 19 12:01:24 CST 2021
;; MSG SIZE  rcvd: 151
```



# 本地只缓存DNS配置

```bash
[root@local-dns ~]#yum -y install bind bind-utils

#修改主配置文件
[root@forward-dns ~]#vim /etc/named.conf
options {
//      listen-on port 53 { 127.0.0.1; }; #注释掉
...
//      allow-query     { localhost; }; #注释掉
...

        forward only; #设置转发类型为only
        forwarders { 10.0.0.8;}; #设置转发的主DNS服务IP
		#关闭dnsec功能
        dnssec-enable no;
        dnssec-validation no;
...
};

#检查语法
[root@root-dns named]# named-checkconf

#生效
systemctl enable --now named #第一次启动服务
rndc reload                  #不是第一次启动服务
```



# 客户端测试

```bash
[root@client ~]#cat /etc/resolv.conf
# Generated by NetworkManager
nameserver 10.0.0.17
[root@client ~]#curl www.xiangzheng.org
10.0.0.58 page

[root@client ~]#host www.xiangzheng.org 10.0.0.17
Using domain server:
Name: 10.0.0.17
Address: 10.0.0.17#53
Aliases: 

www.xiangzheng.org has address 10.0.0.58

[root@client ~]#dig www.xiangzheng.org @10.0.0.17

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.el7_9.8 <<>> www.xiangzheng.org @10.0.0.17
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 39117
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.xiangzheng.org.		IN	A

;; ANSWER SECTION:
www.xiangzheng.org.	85684	IN	A	10.0.0.58

;; AUTHORITY SECTION:
xiangzheng.org.		85684	IN	NS	xiangzhengns2.org.
xiangzheng.org.		85684	IN	NS	xiangzhengns1.org.

;; ADDITIONAL SECTION:
xiangzhengns2.org.	85684	IN	A	10.0.0.48
xiangzhengns1.org.	85684	IN	A	10.0.0.38

;; Query time: 0 msec
;; SERVER: 10.0.0.17#53(10.0.0.17)
;; WHEN: Sun Dec 19 12:13:04 CST 2021
;; MSG SIZE  rcvd: 151
```

### 测试2

```bash
#停掉主节点，并在前面的DNS服务器清理缓存测试是否能访问
[root@master-dns named]# systemctl stop named
[root@local-dns ~]#rndc flush
[root@forward-dns ~]# rndc flush
[root@root-dns named]# rndc flush
[root@org-dns named]# rndc flush
#测试访问
[root@client ~]#curl www.xiangzheng.org
10.0.0.58 page
[root@client ~]#dig www.xiangzheng.org @10.0.0.17

; <<>> DiG 9.11.4-P2-RedHat-9.11.4-26.P2.el7_9.8 <<>> www.xiangzheng.org @10.0.0.17
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 30583
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.xiangzheng.org.		IN	A

;; ANSWER SECTION:
www.xiangzheng.org.	86397	IN	A	10.0.0.58

;; Query time: 1 msec
;; SERVER: 10.0.0.17#53(10.0.0.17)
;; WHEN: Sun Dec 19 12:17:42 CST 2021
;; MSG SIZE  rcvd: 63
```

