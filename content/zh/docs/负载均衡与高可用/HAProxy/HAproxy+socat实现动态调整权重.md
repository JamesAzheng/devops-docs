---
title: "HAproxy+socat实现动态调整权重"
---


# socat 工具概述

- Socat 是 Linux 下的一个多功能的网络工具，名称由来是Sock CAT，socat也是nc(Net CAT)的增强版，主要特点是在两个数据流之间建立双向通道，且支持众多协议和链接方式 如：IP、TCP、UDP、ipv6、Socket文件等

- **对服务器动态权重和其他状态的调整 可以利用socat工具进行处理**
- 官网：http://www.dest-unreach.org/socat/



# socat 安装

```bash
#Centos
yum -y install socat

#Ubuntu
apt -y install socat
```



# socat 帮助

```bash
socat -h
Usage:
socat [options] <bi-address> <bi-address>
   options:
      -V     print version and feature information to stdout, and exit
      -h|-?  print a help text describing command line options and addresses
      -hh    like -h, plus a list of all common address option names
      -hhh   like -hh, plus a list of all available address option names
      -d[ddd]         increase verbosity (use up to 4 times; 2 are recommended)
...
```



# socat 基础使用

## 查看sock文件支持的选项

- 常用选项：

```bash
[root@haproxy ~]# echo "help" | socat stdio /apps/haproxy/run/haproxy1.sock
...
  disable server #禁用服务器
  enable server #启用已禁用的服务器
  set server #修改服务器的状态、权重或地址
  show info #通过sock文件获取进程的相关信息
...
```

## 通过sock文件获取进程的相关信息

```bash
[root@haproxy ~]# echo "show info" | socat stdio /apps/haproxy/run/haproxy1.sock
Name: HAProxy
Version: 2.0.25-6986403
Release_date: 2021/09/07
Nbthread: 1
Nbproc: 2
Process_num: 2
Pid: 2820
Uptime: 0d 2h34m37s
Uptime_sec: 9277
Memmax_MB: 0
...
```

## 通过sock文件获取进程状态

```bash
[root@haproxy-master ~]# echo "show servers state" | socat stdio /apps/haproxy/run/haproxy1.sock
1
# be_id be_name srv_id srv_name srv_addr srv_op_state srv_admin_state srv_uweight srv_iweight srv_time_since_last_change srv_check_status srv_check_result srv_check_health srv_check_state srv_agent_state bk_f_forced_id srv_f_forced_id srv_fqdn srv_port srvrecord
3 tomcat-server 1 10.0.0.28 10.0.0.28 2 0 1 1 64 6 3 7 6 0 0 0 - 8081 -
3 tomcat-server 2 10.0.0.38 10.0.0.38 2 0 1 1 64 6 3 7 6 0 0 0 - 8081 -
3 tomcat-server 3 10.0.0.48 10.0.0.48 2 0 1 1 64 6 3 7 6 0 0 0 - 8081 -
```

## 通过sock文件将后端服务器禁用

- **单子进程场景**

```bash
[root@haproxy ~]# echo "disable server xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy.sock
```

- **多子进程场景：**
- **需建立多个sock文件并将每个文件和进程一一绑定，然后sock文件逐个进行操作，否则只有单一子进程得到下线，其他子进程还是在线状态**

```bash
#配置文件
[root@haproxy-master ~]# cat /apps/haproxy/etc/haproxy.cfg 
global
...
    nbproc 4
    stats socket /apps/haproxy/run/haproxy1.sock mode 600 level admin process 1
    stats socket /apps/haproxy/run/haproxy2.sock mode 600 level admin process 2
    stats socket /apps/haproxy/run/haproxy3.sock mode 600 level admin process 3
    stats socket /apps/haproxy/run/haproxy4.sock mode 600 level admin process 4
...
listen tomcat-server
    mode http
    bind 10.0.0.66:80
    server 10.0.0.28 10.0.0.28:8081 check inter 3000 fall 3 rise 5
    server 10.0.0.38 10.0.0.38:8081 check inter 3000 fall 3 rise 5
    server 10.0.0.48 10.0.0.48:8081 check inter 3000 fall 3 rise 5
...

#sock文件
    server 10.0.0.48 10.0.0.48:8081 check inter 3000 fall 3 rise 5
[root@haproxy-master ~]# ls -l /apps/haproxy/run/
total 4
srw------- 1 root root 0 Mar 14 01:07 haproxy1.sock
srw------- 1 root root 0 Mar 14 01:07 haproxy2.sock
srw------- 1 root root 0 Mar 14 01:07 haproxy3.sock
srw------- 1 root root 0 Mar 14 01:07 haproxy4.sock
-rw-r--r-- 1 root root 6 Mar 14 01:07 haproxy.pid
srwxr-xr-x 1 root root 0 Mar 14 01:07 stats

#执行命令
[root@haproxy-master ~]# echo "disable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy1.sock
[root@haproxy-master ~]# echo "disable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy2.sock
[root@haproxy-master ~]# echo "disable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy3.sock
[root@haproxy-master ~]# echo "disable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy4.sock
```



## 通过sock文件将后端服务器启用

- **单子进程场景**

```bash
[root@haproxy ~]#  echo "enable server xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy.sock
```

- **多子进程场景：**

```bash
[root@haproxy-master ~]# echo "enable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy1.sock
[root@haproxy-master ~]# echo "enable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy2.sock
[root@haproxy-master ~]# echo "enable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy3.sock
[root@haproxy-master ~]# echo "enable server tomcat-server/10.0.0.28" | socat stdio /apps/haproxy/run/haproxy4.sock
```



# socat 实现对haproxy动态权重调整

## 修改权重前测试

- 可以看到目前是以轮询的方式进行调度

```bash
[root@client ~]# while true;do curl 192.168.0.200;sleep 0.5 ;done
web1.xiangzheng.vip page
web2.xiangzheng.vip page
web1.xiangzheng.vip page
web2.xiangzheng.vip page
```

## 修改权重比例

- **注意只对单进程有效，如需对多进程生效则需建立多个sock文件并将每个文件和进程一一绑定，然后sock文件逐个进行操作**

- 此方式只能实现临时生效，当haproxy重启或重新加载后则会失效，永久生效则需要写配置文件

```bash
#获取目前server的权重
[root@haproxy ~]# echo "get weight xiangzheng_vip_80/web1" | socat stdio /apps/haproxy/run/haproxy.sock
1 (initial 1)
[root@haproxy ~]# echo "get weight xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy.sock
1 (initial 1)

#修改weight，注意只对单进程有效
[root@haproxy ~]# echo "set weight xiangzheng_vip_80/web1 30" | socat stdio /apps/haproxy/run/haproxy.sock

#修改后的weight状况
[root@haproxy ~]# echo "get weight xiangzheng_vip_80/web1" | socat stdio /apps/haproxy/run/haproxy.sock
30 (initial 1)
[root@haproxy ~]# echo "get weight xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy.sock
1 (initial 1)
```

## 测试

```bash
[root@client ~]# while true;do curl 192.168.0.200;sleep 0.5 ;done
web1.xiangzheng.vip page
web1.xiangzheng.vip page
web1.xiangzheng.vip page
web1.xiangzheng.vip page
web1.xiangzheng.vip page
web2.xiangzheng.vip page
```



# socat 实现对haproxy动态权重归零

- 在haproxy中 权限为0则代表 服务器下线

## 修改权重前测试

- 可以看到目前是以轮询的方式进行调度

```bash
[root@client ~]# while true;do curl 192.168.0.200;sleep 0.5 ;done
web1.xiangzheng.vip page
web2.xiangzheng.vip page
```

### 将web1的权重归零

- 权重归0后haproxy状态页面会显示深蓝色 active or backup SOFT STOPPED for maintenance  

```bash
#查看修改前的权重情况
[root@haproxy ~]#  echo "get weight xiangzheng_vip_80/web1" | socat stdio /apps/haproxy/run/haproxy.sock
1 (initial 1)
[root@haproxy ~]#  echo "get weight xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy.sock
1 (initial 1)

#将web1权重归0
[root@haproxy ~]#  echo "set weight xiangzheng_vip_80/web1 0" | socat stdio /apps/haproxy/run/haproxy.sock

#查看修改后的权重情况
[root@haproxy ~]#  echo "get weight xiangzheng_vip_80/web1" | socat stdio /apps/haproxy/run/haproxy.sock
0 (initial 1)
[root@haproxy ~]#  echo "get weight xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy.sock
1 (initial 1)
```

### 修改权重后测试

```bash
[root@client ~]# while true;do curl 192.168.0.200;sleep 1 ;done
web2.xiangzheng.vip page
web2.xiangzheng.vip page
web2.xiangzheng.vip page
web2.xiangzheng.vip page
web2.xiangzheng.vip page
web2.xiangzheng.vip page
web2.xiangzheng.vip page
```



# socat 实现对haproxy多进程情况动态权重调整

- **本质上就是建立多个sock文件并将每个文件和进程一一绑定，然后sock文件逐个进行操作**

## 范例

```bash
#将sock文件和进程进行绑定
[root@haproxy ~]# vim /apps/haproxy/etc/haproxy.cfg 
...
    nbproc 2
    stats socket /apps/haproxy/run/haproxy1.sock mode 600 level admin process 1
    stats socket /apps/haproxy/run/haproxy2.sock mode 600 level admin process 2
...

#将对web2下线（只下线一个进程的话另外一个进程还会继续参与工作） 
 
[root@haproxy ~]# echo "disable server xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy1.sock
[root@haproxy ~]# echo "disable server xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy2.sock

#测试，此时web2已经active or backup DOWN for maintenance (MAINT) 
[root@client ~]# while true;do curl 192.168.0.200;sleep 1 ;done
web1.xiangzheng.vip page
web1.xiangzheng.vip page
web1.xiangzheng.vip page

#将web2上线
[root@haproxy ~]# for i in {1..2};do echo "enable server xiangzheng_vip_80/web2" | socat stdio /apps/haproxy/run/haproxy$i.sock ;done
```



# 一键上线下线后端服务器脚本

```bash
[root@haproxy ~]# cat ./host_up_down.sh 
#!/bin/bash
#
#********************************************************************
#Author:            xiangzheng
#QQ:                767483070
#Date:              2021-09-22
#FileName：         host_up_down.sh
#URL:               https://www.xiangzheng.vip
#Email:             rootroot25@163.com
#Description：      The test script
#Copyright (C):     2021 All rights reserved
#********************************************************************
SOCK_FILE_PRE="/apps/haproxy/run/haproxy"
SOCK_FILE_RANGE="2"
SOCK_FILE_END=".sock"
SERVER="xiangzheng_vip_80/web2"

case $1 in
up)
    for i in $(seq ${SOCK_FILE_RANGE})
        do
        echo "enable server ${SERVER}" | socat stdio ${SOCK_FILE_PRE}${i}${SOCK_FILE_END}
        done
        if [ $? -eq 0 ];then
            echo "${SERVER} is up"
            else
            echo "${SERVER} not up error exit"
            exit 2
        fi
    ;;
down)
    for i in $(seq ${SOCK_FILE_RANGE})
        do
        echo "disable server ${SERVER}" | socat stdio ${SOCK_FILE_PRE}${i}${SOCK_FILE_END}
        done
        if [ $? -eq 0 ];then
            echo "${SERVER} is down"
            else
            echo "${SERVER} not down error exit"
            exit 2
        fi
    ;;
*)
    echo "Usage: Please input ${0} <up|down> exit"
    exit 1
    ;;
esac
```

