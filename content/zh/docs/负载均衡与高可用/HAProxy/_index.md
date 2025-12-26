---
title: "HAProxy"
---

# HAproxy 概述

- haproxy是一款可以实现四、七层负载均衡的应用服务，由C语言编写，分为企业版和社区版

- 企业版官网：https://www.haproxy.com/

- 社区版官网：https://www.haproxy.org/
- Github：https://github.com/haproxy

## 支持的功能

- 支持TCP 和 HTTP 反向代理
- 支持动态程序的反向代理
- 支持基于数据库的反向代理
- SSL/TSL 服务器
- 可以针对HTTP请求添加cookie，进行路由后端服务器
- 可平衡负载至后端服务器，并支持持久连接
- 支持所有主服务器故障切换至备用服务器
- 支持专用端口实现监控服务
- 支持停止接受新连接请求，而不影响现有连接
- 可以在双向添加、修改、删除HTTP报文首部
- 支持响应报文压缩
- 支持基于pattern实现连接请求的访问控制
- 通过特定的URI为授权用户提供详细的状态信息



## 不支持的功能

- 正向代理
- 缓存代理
- UDP协议







# HAproxy 安装

## Centos

### centos8

#### yum安装

- centos8 yum安装提供的是 1.8版本

```bash
dnf -y install haproxy
```



## Ubuntu

### Ubuntu20.04 

#### apt安装

- 官方包安装：https://haproxy.debian.net/

```bash
apt-get update
apt-get install haproxy=2.0.\*
...
```



## 编译安装

- **生产中常用的安装方式**
- **下面以 Centos8.3 作为编译安装范例**

### 解决lua环境

- haproxy编译安装依赖lua环境

- lua官方网站：https://www.lua.org/

#### 编译安装lua

```bash
#安装依赖包
[root@haproxy ~]# yum -y install gcc readline-devel make

#下载lua源码包并编译安装
[root@haproxy ~]# cd /usr/local/src/
[root@haproxy src]# wget http://www.lua.org/ftp/lua-5.4.3.tar.gz
[root@haproxy src]# mkdir /apps
[root@haproxy src]# tar xf lua-5.4.3.tar.gz -C /apps/
[root@haproxy src]# cd /apps/lua-5.4.3/
[root@haproxy lua-5.4.3]# make all test
```

### 下载源码包

```bash
[root@haproxy ~]# cd /usr/local/src/
[root@haproxy src]# wget https://www.haproxy.org/download/2.0/src/haproxy-2.0.25.tar.gz
```

### 安装相关依赖包

```bash
[root@haproxy src]# dnf -y install gcc openssl-devel pcre-devel systemd-devel make
```

### 开始编译安装

```bash
[root@haproxy src]# tar xf haproxy-2.0.25.tar.gz 
[root@haproxy src]# cd haproxy-2.0.25/

#编译安装前可以参考INSTALL文件
[root@haproxy haproxy-2.0.25]# cat INSTALL
...

#执行以下命令开始编译安装
[root@haproxy haproxy-2.0.25]# make -j 2 TARGET=linux-glibc \
USE_OPENSSL=1 USE_ZLIB=1 USE_LUA=1 USE_PCRE=1 USE_SYSTEMD=1 \
LUA_INC=/apps/lua-5.4.3/src LUA_LIB=/apps/lua-5.4.3/src
[root@haproxy haproxy-2.0.25]# make install PREFIX=/apps/haproxy
```

### 验证安装

```bash
[root@haproxy ~]# /apps/haproxy/sbin/haproxy -vv
```

### 后续配置

```bash
#给haproxy创建软连接，或者加入到PATH变量也可以 这里省略
[root@haproxy ~]# ln -s /apps/haproxy/sbin/haproxy /sbin/

#给haproxy配置service文件
[root@haproxy ~]# vim /usr/lib/systemd/system/haproxy.service
[Unit]
Description=HAProxy Load Balancer
After=network-online.target
Wants=network-online.target

[Service]
Environment="CONFIG=/apps/haproxy/etc/haproxy.cfg" "PIDFILE=/apps/haproxy/run/haproxy.pid"
#EnvironmentFile=/etc/sysconfig/haproxy
ExecStartPre=/usr/sbin/haproxy -f $CONFIG -c -q $OPTIONS
ExecStart=/usr/sbin/haproxy -Ws -f $CONFIG -p $PIDFILE $OPTIONS
ExecReload=/bin/kill -USR2 $MAINPID
SuccessExitStatus=143
KillMode=mixed
Type=notify

[Install]
WantedBy=multi-user.target

#使service文件生效
[root@haproxy ~]# systemctl daemon-reload

#创建haproxy账号
[root@haproxy ~]# useradd -r -s /sbin/nologin -d /var/lib/haproxy haproxy

#准备haproxy的配置和pid目录
[root@haproxy ~]# mkdir /apps/haproxy/{etc,run}

#准备haproxy的配置文件
[root@haproxy ~]# vim /apps/haproxy/etc/haproxy.cfg
global

    log         127.0.0.1 local2

    chroot      /apps/haproxy/
    pidfile     /apps/haproxy/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /apps/haproxy/run/stats

    # utilize system-wide crypto-policies
    ssl-default-bind-ciphers PROFILE=SYSTEM
    ssl-default-server-ciphers PROFILE=SYSTEM

#---------------------------------------------------------------------
# common defaults that all the 'listen' and 'backend' sections will
# use if not designated in their block
#---------------------------------------------------------------------
defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------
frontend main
    bind *:5000
    acl url_static       path_beg       -i /static /images /javascript /stylesheets
    acl url_static       path_end       -i .jpg .gif .png .css .js

    use_backend static          if url_static
    default_backend             app

#---------------------------------------------------------------------
# static backend for serving up images, stylesheets and such
#---------------------------------------------------------------------
backend static
    balance     roundrobin
    server      static 127.0.0.1:4331 check

#---------------------------------------------------------------------
# round robin balancing between the various backends
#---------------------------------------------------------------------
backend app
    balance     roundrobin
    server  app1 127.0.0.1:5001 check
    server  app2 127.0.0.1:5002 check
    server  app3 127.0.0.1:5003 check
    server  app4 127.0.0.1:5004 check

listen stats
    mode http
    bind 0.0.0.0:5000
    stats enable
    log global
    stats uri /haproxy-status
    stats auth haadmin:123456
    
    
#启动服务并设备开机自启动
[root@haproxy ~]# systemctl enable --now haproxy.service

#打开浏览器访问测试页面，能正常显示则无问题，账号haadmin，密码123456，显示503可换浏览器或者强制刷新重新输入账号密码登录（报503是因为转发的服务器未存在）
http://10.0.0.8:5000/haproxy-status
```





## docker安装

...







# HAproxy 配置说明

## 前言

- **haproxy 的每个版本的变化都相对比较大，可能一个功能或一个参数在上一个版本还可以使用 但换其其他版本就不能用了，所以最权威的还是要看官方文档**

- GitHub官方帮助文档：http://cbonte.github.io/haproxy-dconv/

- 官方帮助文档：https://www.haproxy.org/#docs

## 配置分类

**HAProxy 的配置文件 haproxy.cfg由两大部分组成，分别是global和proxies**

- global：全局配置段

```
进程及安全配置相关参数
性能调整相关参数
Debug参数
```

- proxies：代理配置段

```bash
defaults #为frontend，backend，listen提供默认配置
frontend #前端，相当于nginx中的server{}
backend  #后端，相当于nginx中的upstream{}
listen   #同时拥有前端和后端配置，配置简单，生产中推荐使用
```



## global 配置段

- 官方文档：http://cbonte.github.io/haproxy-dconv/2.0/configuration.html#3

```bash
[root@haproxy ~]# haproxy -v
HA-Proxy version 2.0.25-6986403 2021/09/07 - https://haproxy.org/
[root@haproxy ~]# cat /apps/haproxy/etc/haproxy.cfg
global
    pidfile     /var/run/haproxy.pid #指定pid文件路径
    chroot /apps/haproxy #锁定haproxy的运行目录，更加安全
    daemon #以守护进程方式运行（后台执行），在docker中运行时注意不要添加此行（否则开启即关闭）
    stats socket /var/lib/haproxy/haproxy.sock mode 600 level admin #socket文件（socket文件可以实现本机与本机之间应用程序的通信）
    user  haproxy #运行haproxy的用户身份
    group haproxy #运行haproxy的组身份  
    nbproc 4 #开启的 haproxy work 进程数，默认进程数是一个，通常设置成和系统的cpu核心数相同即可
    cpu-map 1 0 #绑定 haproxy worker 进程至指定cpu，将第1个work进程绑定至0号cpu
    cpu-map 2 1 #绑定 haproxy worker 进程至指定cpu，将第1个work进程绑定至0号cpu
    cpu-map 3 2 #绑定 haproxy worker 进程至指定cpu，将第1个work进程绑定至0号cpu
    cpu-map 4 3 #绑定 haproxy worker 进程至指定cpu，将第1个work进程绑定至0号cpu    
    #ps axo pid,cmd,psr 命令可以查看进程与cpu核心的绑定关系
    #循环方式检测是否一直在绑定：
    #while true ;do ps axo pid,cmd,psr|grep [h]aproxy;sleep 0.1  ;done
    maxconn 100000 #每个haproxy进程的最大并发连接数（haproxy的并发连接数比nginx强，但是比不上LVS）
    maxsslconn n #每个haproxy进程 ssl最大连接数，用于haproxy配置了证书的场景下
    maxsslrate n #每个进程每秒创建的最大连接数，用于haproxy配置了证书的场景下
    spread-checks n #后端server状态check随机提前或延迟百分比时间，建议2-5(20%-50%)之间，默认0
    log 127.0.0.1 local2 info #定义全局的syslog服务器；日志服务器需要开启UDP协议，最多可以定义两个
```



## Proxies 配置段

- 官方文档：http://cbonte.github.io/haproxy-dconv/2.0/configuration.html#4
- **name字段建议只用数字字母_-**

### defaults

- **默认配置段 针对以下的frontend、backend、listen生效**，name可以不写
- **Syntax：**defaults [name] ...

```bash
[root@haproxy ~]# haproxy -v
HA-Proxy version 2.0.25-6986403 2021/09/07 - https://haproxy.org/
[root@haproxy ~]# cat /apps/haproxy/etc/haproxy.cfg
global
...
defaults
    mode                   <http|tcp> #设置默认工作类型，使用tcp服务器性能会更好，减少压力，默认http 一般不用动
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option                  redispatch #当serverID对应的服务器挂掉后，强制定向到其他监控的服务器，重新派发
    option                  abortonclose #当服务器负载很高时，自动结束掉当前队列处理比较久的连接，针对业务情况选择开启
    option                  http-keep-alive #开启与客户端的会话保持
    option                  forwardfor #透传客户端真实IP至后端web服务器
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s #客户端请求从haproxy到后端server最长连接等待时长(TCP连接之前)
    timeout server          1m #客户端请求从haproxy到后端server的请求处理超时时长(TCP连接之后)，如果超时，会出现502报错，此值建议设置较大些，防止502错误
    timeout client          1m #设置haproxy与客户端的最长非活动连接时间，建议和timeout server相同
    timeout check           10s #对后端服务器的默认检测超时时间
    timeout http-keep-alive 120s #session会话保持超时时间，此时间段内会转发到相同的后端服务器    
    maxconn                 3000
    default-server inter 1000 weight 3 #指定后端服务器的默认设置
...
```

### frontend

- **前端servername**，类似于nginx的一个虚拟主机、server和LVS集群
- **Syntax：**frontend <name> ...

#### 参数说明

```bash
[root@haproxy ~]# haproxy -v
HA-Proxy version 2.0.25-6986403 2021/09/07 - https://haproxy.org/
[root@haproxy ~]# cat /apps/haproxy/etc/haproxy.cfg
global
...
defaults
....
frontend <name> #名称必须写
bind [<address>]:<port_range> [, ...] [param*] #指定haproxy前端的监听地址，其实就是所谓的对外提供服务的VIP，可以是IPV4或IPV6，可以同时监听多个IP或端口
#支持的字段：frontend、listen
#注意：如果需要绑定在非本机的IP，需要开启内核参数 net.ipv4.ip_nonlocal_bind=1

...
```

#### 官方范例

```bash
listen http_proxy #监听http的多个IP的多个端口和socket文件
    bind :80,:443
    bind 10.0.0.1:10080,10.0.0.1:10443
    bind /var/run/ssl-frontend.sock user root mode 600 accept-proxy

listen http_https_proxy #https监听
    bind :80
    bind :443 ssl crt /etc/haproxy/site.pem #公钥和私钥公共文件

listen http_https_proxy_explicit #监听ipv6、ipv4和unix sock文件
    bind ipv6@:80
    bind ipv4@public_ssl:443 ssl crt /etc/haproxy/site.pem
    bind unix@ssl-frontend.sock user root mode 600 accept-proxy

listen external_bind_app1 #监听file descriptor
    bind "fd@${FD_APP1}"
```

#### 生产范例

```bash
frontend xiangzheng-web-80 #可以采用业务-服务-端口 的方式进行命名
    bind :80,:8080
    bind 10.0.0.38:8801-8810,10.0.0.48:9001-9010
    mode http|tcp #指定负载协议类型
    use_backend <backend_name> #调用的后端服务器组名称
```



### backend

- **后端服务器组 backend服务器将被frontend进行调用**，等于nginx的upstream和LVS中的RS服务器
- **注意：**backend的名称必须唯一，并且必须在listen或frontend中事先定义才可以使用，否则服务无法启动
- **Syntax：**backend  <name> ...

#### 参数说明

```bash
[root@haproxy ~]# haproxy -v
HA-Proxy version 2.0.25-6986403 2021/09/07 - https://haproxy.org/
[root@haproxy ~]# cat /apps/haproxy/etc/haproxy.cfg
global
...
defaults
....
frontend <name>
...
backend  <name>
mode http|tcp #指定负载协议类型，和对应的frontend必须一致
option #配置选项，后面可加 httpchk、smtpchk、mysql-check、pgsql-check、ssl-hello-chk等方法，可用于实现多应用层检测功能

server #定义后端的real server，必须指定IP和端口 除此之外还支持以下配置：
#针对一个server配置：
       name #指定服务器的名称，必填项，可以将对应的IP地址设为名称 便于管理
       check #对指定real进行健康状态检测，如不加此设置 则默认不开启，只有check后面没有其他配置也可以启用检查功能（默认对相应的后端服务器IP和端口 利用TCP连接进行周期性检查 所以必须配置IP和端口）check还支持以下配置：
             addr  <IP>  #指定的健康状态检测IP，可以是专门的数据网络 减少网络流量，但生产中通常只监测业务服务器对应的IP和端口
             port  <num> #指定健康状态的检测端口
             inter <num> #健康状态检测间隔时间，默认2s
             fall  <num> #后端服务器从线上转为线下的连续失效次数，默认为3
             rise  <num> #后端服务器从下线恢复上线的检测有效次数，默认为2
       weight <weight> #权重，默认为1，最大值为256，0表示不参与负载均衡 但仍接受持久连接（0权重在haproxy状态页显示蓝色(摸鱼状态)）
       backup #将后端服务器标记为备份状态，只有在所有非备份主机down机时提供服务，类似Sorry Server
       disabled #将后端服务器标记为不可用状态，即维护状态，除了持久模式，将不再接受连接，（haproxy状态页显示深黄色）
       redirect prefix https://www.baidu.com #将请求临时(302)重定向至其他URL，只适用于http模式
       redir https://www.baidu.com #将请求临时(302)重定向至其他URL，只适用于http模式
       maxconn <maxconn> #当前后端server的最大并发连接数
```

#### frontend+backend组合范例

##### 范例1

```bash
frontend xiangzheng-web-80
    bind :80,:8080
    bind 10.0.0.38:8801-8810,10.0.0.48:9001-9010
    mode http
    use_backend xiangzheng-web-80-nodes

backend xiangzheng-web-80-nodes
    mode http
    server web1 10.0.0.38:80 weight 2 check addr 10.0.0.110 port 8080
    server web2 10.0.0.48:80 check
```

##### 范例2

```bash
#官网业务访问入口
frontend xiangzheng-vip-80
    mode http
    bind 192.168.0.200:80
    use_backend xiangzheng-vip-80-nodes #调用backend

backend xiangzheng-vip-80-nodes
    mode http
    option forwardfor
    server web1 10.0.0.38:8080 check inter 3000 fall 3 rise 5
    server web2 10.0.0.48:8080 check inter 3000 fall 3 rise 5
```

##### 范例3

- MySQL pxc cluster

```
frontend mysql-pxc-cluster
    bind *:3306
    mode tcp
    use_backend      pxc-node

backend pxc-node
    mode tcp
    option mysql-check
    balance     roundrobin
    server  10.0.0.100 10.0.0.100:3306 check
    server  10.0.0.101 10.0.0.101:3306 check
    server  10.0.0.102 10.0.0.102:3306 check
```





### listen

- **将frontend和backend合并在一起配置**，相对于frontend和backend配置更加简洁
- **生产中常用**
- **Syntax：**listen <name> ...

#### 范例1

```bash
[root@haproxy ~]# haproxy -v
HA-Proxy version 2.0.25-6986403 2021/09/07 - https://haproxy.org/
[root@haproxy ~]# cat /apps/haproxy/etc/haproxy.cfg
...
#官网业务访问入口
listen xiangzheng_vip_80
    mode http
    bind 192.168.0.200:80 #haproxy监听的端口
    option    forwardfor #透传客户端真实IP至后端web服务器（在defaults段配置了其实就不用写）
    #server后面的第一个IP地址表示描述信息，通常都是写IP，因为这样和socat工具配合使用时方便区分主机
    server 10.0.0.38 10.0.0.38:8080 check inter 3000 fall 3 rise 5 weight 1
    server 10.0.0.48 10.0.0.48:8080 check inter 3000 fall 3 rise 5 weight 1
    
#haproxy状态页面
listen stats
    mode http
    bind 0.0.0.0:5000
    stats enable #是否启用状态页功能
    log global #记录日志
    stats uri /haproxy-status #状态页URI
    stats auth haadmin:123456 #状态页验证密码
```

#### 范例2

- MySQL pxc cluster

```bash
#
```





## 定义子配置文件

- **注意：子配置文件必须以 cfg 为后缀 并且 非.开头的非隐藏文件**

```bash
#创建子配置目录
[root@haproxy ~]# mkdir -p /apps/haproxy/etc/conf.d

#创建子配置文件
[root@haproxy ~]# vim /apps/haproxy/etc/conf.d/test.cfg
listen xiangzheng_vip_80
    mode http
    bind 10.0.0.18:80
    option    forwardfor
    server web1 10.0.0.38:8080 check inter 3000 fall 3 rise 5
    server web2 10.0.0.48:8080 check inter 3000 fall 3 rise 5
    
#修改service文件，添加config2
[root@haproxy ~]# vim /lib/systemd/system/haproxy.service 
...
[Service]
Environment="CONFIG=/apps/haproxy/etc/haproxy.cfg" "CONFIG2=/apps/haproxy/etc/conf.d" "PIDFILE=/apps/haproxy/run/haproxy.pid"
ExecStartPre=/usr/sbin/haproxy -f $CONFIG -f $CONFIG2 -c -q $OPTIONS
ExecStart=/usr/sbin/haproxy -Ws -f $CONFIG -f $CONFIG2 -p $PIDFILE $OPTIONS
...

#后续执行
[root@haproxy ~]# systemctl daemon-reload 
[root@haproxy ~]# systemctl restart haproxy.service 
```



# HAproxy 检查配置文件语法

```bash
[root@haproxy-master ~]# haproxy -c -f /apps/haproxy/etc/haproxy.cfg
Configuration file is valid #配置文件是有效的

#-c 只检查配置文件并退出
#-f 指定配置文件或目录
```



# HAproxy 多进程和多线程

- haproxy支持一个进程带多个线程的模式，也支持多个work进程的模式

```bash
...
```





# HAproxy 多socket

- 定义多个socket可以实现对单一进程的控制...

```bash
#设置前的进程树关系
[root@haproxy ~]# pstree -p
systemd(1)─┬─NetworkManager(692)─┬─{NetworkManager}(707)
...
           ├─haproxy(45759)───haproxy(45761)
...

#设置两个进程和两个sock文件
[root@haproxy ~]# vim /apps/haproxy/etc/haproxy.cfg 
global
...
    nbproc 2
    stats socket /apps/haproxy/run/haproxy1.sock mode 600 level admin process 1
    stats socket /apps/haproxy/run/haproxy2.sock mode 600 level admin process 2
...
defaults

#重启服务
[root@haproxy ~]# systemctl restart haproxy.service 

#设置后的进程树关系
[root@haproxy ~]# pstree -p
systemd(1)─┬─NetworkManager(692)─┬─{NetworkManager}(707)
...
           ├─haproxy(46133)─┬─haproxy(46135)
           │                └─haproxy(46136)
...

#sock文件
[root@keepalived1 ~]# ll /apps/haproxy/run/
total 4
srw------- 1 root root 0 Feb 21 21:25 haproxy1.sock
srw------- 1 root root 0 Feb 21 21:25 haproxy2.sock
-rw-r--r-- 1 root root 6 Feb 21 21:25 haproxy.pid
```



# HAproxy 开启日志记录

- haproxy本身不记录客户端的访问日志，此外为减少服务器负载，**一般生产中haproxy不记录日志**
- 也可以配置 haproxy+syslog 将日志记录到指定文件中

```bash
[root@haproxy ~]# vim /etc/haproxy/haproxy.cfg
global
...
    log 127.0.0.1 local{1-7} info #在global段中定义，基于syslog记录日志到指定设备，记录级别除了info外 还有err、warning、debug等... 日志也可以写到远程服务器，只需把127.0.0.1修改成远程服务器的地址，如：10.0.0.18，然后再10.0.0.18这台主机上开启rsyslog服务，然后再按照下文的配置进行修改（在TCP段）即可，
...


#还需修改rsyslog的配置文件
[root@haproxy ~]# vim /etc/rsyslog.conf
...
# provides UDP syslog reception
module(load="imudp")
input(type="imudp" port="514")
local3.*                                                /var/log/haproxy.log
...


#重启服务器
systemctl restart haproxy
systemctl enable --now rsyslog

#查看514端口是否开启
[root@haproxy ~]# ss -nul
```



# HAproxy 初步实现

- **下面采用子配置文件结合listen配置段实现**

## 环境准备

- **说明：**
- 仅主机网络：单独的一个网络环境
- NAT网络：所有NAT网络内的设备都处于同一个网络环境
- gateway：同网段通讯无须配网关，不同网段通讯才需配网关

| IP/网络模式          | VIP                  | service | hostname               |
| -------------------- | -------------------- | ------- | ---------------------- |
| 192.168.0.100/仅主机 | NULL                 | NULL    | client                 |
| 10.0.0.18/NAT        | 192.168.0.200/仅主机 | haproxy | haproxy.xiangzheng.vip |
| 10.0.0.38/NAT        | NULL                 | nginx   | web1.xiangzheng.vip    |
| 10.0.0.48/NAT        | NULL                 | nginx   | web2.xiangzheng.vip    |

## 验证环境

```bash
[root@client ~]# curl 10.0.0.38
web1.xiangzheng.vip page
[root@client ~]# curl 10.0.0.48
web2.xiangzheng.vip page

[root@haproxy ~]# hostname
haproxy.xiangzheng.vip
[root@haproxy ~]# hostname -I
192.168.0.200 10.0.0.18 

[root@web1 ~]# hostname
web1.xiangzheng.vip
[root@web1 ~]# hostname -I
10.0.0.38

[root@web2 ~]# hostname
web2.xiangzheng.vip
[root@web2 ~]# hostname -I
10.0.0.48
```



## 实现基本http调度

### 配置

```bash
[root@haproxy ~]# vim /apps/haproxy/etc/conf.d/xiangzheng.vip.cfg
listen xiangzheng_vip_80
    mode http
    bind 192.168.0.200:80 #本地监听的VIP
    server web1 10.0.0.38:80 #后端的server IP和port
    server web2 10.0.0.48:80
```

### 测试

```bash
#基本上是轮询调度
[root@client ~]# curl 192.168.0.200
web1.xiangzheng.vip page
[root@client ~]# curl 192.168.0.200
web2.xiangzheng.vip page

#后端日志记录情况，可以看到并没有记录真实客户端的IP地址
[root@web1 ~]# tail -f /var/log/nginx/access.log
10.0.0.18 - - [22/Feb/2022:15:29:00 +0800] "GET / HTTP/1.1" 200 25 "-" "curl/7.61.1" "192.168.0.100"
```



## 开启地址透传

### 配置

- 官方文档说明：option    forwardfor 这个选项 在 defaults、frontend、listen、backend 都支持，当然**无特殊需求可以直接在 defaults 段统一指定**

```bash
[root@haproxy ~]# vim /apps/haproxy/etc/conf.d/xiangzheng.vip.cfg
listen xiangzheng_vip_80
    mode http
    option    forwardfor #添加此行表示开启客户端地址透传
    bind 192.168.0.200:80
    server web1 10.0.0.38:80
    server web2 10.0.0.48:80
```

### 测试

```bash
#基本上是轮询调度
[root@client ~]# curl 192.168.0.200
web1.xiangzheng.vip page
[root@client ~]# curl 192.168.0.200
web2.xiangzheng.vip page

#后端日志记录情况，可以看到已经记录了真实客户端的IP地址192.168.0.100
[root@web1 ~]# tail -f /var/log/nginx/access.log
10.0.0.18 - - [22/Feb/2022:15:35:15 +0800] "GET / HTTP/1.1" 200 25 "-" "curl/7.61.1" "192.168.0.100"
```



## 开启状态检测

- haproxy默认没有开启对后端服务器状态检测功能，这样会导致后端服务器down掉后haproxy还会继续调度，并且未开启检测时在haproxy状态页会显示灰色not checked，开启检测后如果服务器正常会显示绿色active UP
- **测试发现不开启状态检测也会实现故障自动转移？？！**

### 配置前测试

```bash
#调度正常
[root@client ~]# while true;do curl 192.168.0.200;sleep 1 ;done
web2.xiangzheng.vip page
web1.xiangzheng.vip page

#
```

### 配置

```bash
[root@haproxy ~]# vim /apps/haproxy/etc/conf.d/xiangzheng.vip.cfg
listen xiangzheng_vip_80
    mode http
    option    forwardfor
    bind 192.168.0.200:80
    server web1 10.0.0.38:80 check #添加check
    server web2 10.0.0.48:80 check
```

...







