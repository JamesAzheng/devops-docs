---
title: "SSH"
---

# ssh 概述

- Secure Shell，安全的远程登录协议 加密通信，代替传统的 Telnet 协议
- SSH 会自动加密和解密所有 SSH 客户端与服务端之间的网络数据

**端口/协议：**

- 22/tcp

**具体的软件实现：**

- openssh：ssh协议的开源实现，目前主流linux系统默认安装
- dropbear：另一个ssh协议的开源项目实现

**ssh协议版本：**

- v1：不安全，基于CRC-32做MAC，man-in-middle
- v2：安全，目前主流，双方主机协议选择安全的MAC方式，基于DH算法做密钥交换，基于RSA或DSA实现身份认证





# openssh

## 相关包

- openssh-client
- openssh-server

## 相关文件

```bash
/etc/ssh/ssh_config   #ssh客户端配置文件
/etc/ssh/sshd_config  #ssh服务端端配置文件
~./ssh/know_hosts   #已知的主机公钥列表

#centos8ssh登录的时候交换的公钥是ecdsa算法的，每个版本都不一样
#公钥是私钥必须是成对使用的，不成对的话ssh可以用私钥来生成公钥
/etc/ssh/ssh_host_*_key.pub
/etc/ssh/ssh_host_*_key
```





# ssh 客户端

## ssh 客户端相关原理

#### 公钥交换原理：

1. 客户端发起链接请求
2. 服务端返回自己的公钥，以及一个会话ID（这一步客户端得到服务端公钥）
3. 客户端生成密钥对
4. 客户端用自己的公钥异或会话ID，计算出一个值Res，并用服务端的公钥加密
5. 客户端发送加密后的值到服务端，服务端用私钥解密，得到Res
6. 服务端用解密后的值Res异或会话ID，计算出客户端的公钥（这一步服务端得到客户端公钥）
7. 最终：双方各自持有三个秘钥，分别为自己的一对公、私钥，以及对方的公钥，之后的所有通讯都会被加密



## ssh 客户端命令

### 语法

```bash
ssh [user@]host [COMMAND] #如果不指定用户的话则默认使用当前用户来登录远程主机
```

### 选项

```bash
-p port #远程服务器监听的端口

-b #指定连接的源IP

-v #调试模式

-C #压缩方式

-X #支持x11转发

-t #强制伪tty分配，（跨多个远程服务器来链接目标服务器）如：ssh -t remoteserver1 ssh -t remoteserver2   ssh   remoteserver3（最后一个就不用加-t了）

-o option   #如：-o StrictHostKeyChecking=no（相当于直接改/etc/ssh/ssh_config配置文件了，但是属于临时生效，即本次登录）

-i <file> #指定私钥文件路径，实现基于key验证，默认使用文件： ~/.ssh/id_dsa，~/.ssh/id_ecdsa, ~/.ssh/id_ed25519，~/.ssh/id_rsa等
```

### 强制伪tty分配

- 在某些对安全要求较高的环境，需要跨多个远程服务器来链接目标服务器

- 如：A连接D，需要A先连接B再连接C，最后只能由C连接D，即D不允许A和B直接连接，C也不允许A直接连接

- 这种场景就可以使用ssh的 -t 选项来减少复杂度

- 范例：

  - 环境准备：

  - ```bash
    #10.0.0.103
    iptables -A INPUT -s 10.0.0.100,10.0.0.101 -j REJECT
    
    #10.0.0.102
    iptables -A INPUT -s 10.0.0.100 -j REJECT
    ```

  - -t 实现：

  - ```bash
    #10.0.0.100登录
    # ssh -t 10.0.0.101 ssh -t 10.0.0.102 ssh 10.0.0.103
    root@10.0.0.101's password: #密码正常输
    root@10.0.0.102's password:
    root@10.0.0.103's password:
    root@103:~# #登录成功
    ```



### 本机脚本在远程主机执行

```bash
ssh 远程主机 bash < 本地脚本
```

#### 范例

```bash
[root@centos8 ~]#hostname -I
10.0.0.8
[root@centos8 ~]#cat test.sh 
#!/bin/bash
hostname -I
[root@centos8 ~]#ssh 10.0.0.18 /bin/bash < test.sh 
root@10.0.0.18's password: 
10.0.0.18
```

### 确认ssh连接的主机是否真实

登录到被连接的主机上，自己连接自己，得到哈希值，在和远程准备连接主机得到的值做对比

```bash
ssh 127.0.0.0
```



## ssh 客户端配置文件说明

```bash
# /etc/ssh/ssh_config
...
StrictHostKeyChecking ask #是否验证远程主机的公钥，默认为ask 即第一次通信需要选择yes or no来确定公钥，ask改为no则不验证 自动将远程的key下载下来，也可以使用ssh -o StrictHostKeyChecking=no 临时生效，获取的文件为服务端的 /etc/ssh/ssh_host_ecdsa_key.pub 文件，即服务端公钥
...
```



## 实现 ssh 免密登录

- **注意：私钥文件要使用600权限，否则会提示权限太开放从而拒绝连接**

### 手动生成密钥对和推送

- 在客户端生成密钥对

```bash
ssh-keygen -t rsa [-P 'password'] [-f “~/.ssh/id_rsa"]
```

- 把公钥文件传输至远程服务器对应用户的家目录

```bash
ssh-copy-id [-i [identity_file]] [user@]host
```

- 重设私钥口令

```bash
ssh-keygen –p
```

### 自动生成密钥对和推送

#### 基于expect实现

```bash
#!/bin/bash
#
#********************************************************************
#Author:	     	xiangzheng
#QQ: 			    767483070
#Date: 		     	2022-04-20
#FileName：		    push_ssh_key_expect.sh
#URL: 		    	https://www.xiangzheng.vip
#Email: 		    rootroot25@163.com
#Description：		The test script
#Copyright (C): 	2022 All rights reserved
#********************************************************************
PASS=123
dpkg -L expect &> /dev/null || apt -y install expect &> /dev/null
#rpm -q expect &> /dev/null || yum -y install expect &> /dev/null
ssh-keygen -f /root/.ssh/id_rsa -t rsa -P "" && echo "ssh key created succeed"

while read IP ;do
expect <<EOF &> /dev/null
set timeout 20
spawn ssh-copy-id -i /root/.ssh/id_rsa.pub root@$IP
expect {
"yes/no" { send "yes\n";exp_continue }
"password" { send "$PASS\n" }
}
expect eof
EOF
echo $IP push succeed
done < hosts.txt
```

##### 后续

```bash
#准备IP文件
# cat hosts.txt 
10.0.0.7
10.0.0.6

#执行脚本
# bash push_ssh_key.sh 
ssh key is created
10.0.0.7 is ready
10.0.0.6 is ready


#测试
# ssh 10.0.0.7
Last login: Fri May 22 10:19:35 2020 from 10.0.0.8
# exit
logout
Connection to 10.0.0.7 closed.
# ssh 10.0.0.6
Last login: Fri May 22 10:19:39 2020 from 10.0.0.8
# exit
logout
Connection to 10.0.0.6 closed
```

#### 基于sshpass实现



### 免密登录守护进程

- 生产中通常都是要给私钥设置密码的，而给私钥设置密码的话又违背的免密登录的原则
- 可以配置一个守护进程来代理输入密码
- **注意：ssh代理程序仅在当前shell生效，即退出当前shell则消失**

```bash
#启用代理
# ssh-agent bash

#观察代理进程是否启动
# ps aux|grep agent
root       1972  0.0  0.0  29440   548 ?       Ss   10:18   0:00 ssh-agent bash
root       1992  0.0  0.1  12108   964 pts/0   S+   10:18   0:00 grep --
color=auto agent

# ssh-add
Enter passphrase for /root/.ssh/id_rsa:  #输入私钥的密码
Identity added: /root/.ssh/id_rsa (root@centos8.wangxiaochun.com)

#登录无需密码了
# ssh 10.0.0.7
Last login: Fri May 22 08:48:55 2020 from 10.0.0.8

#进程树关系
# pstree -p |grep -C 3 agent
           |-sshd(864)-+-sshd(1060)---bash(1192)
           |           `-sshd(1364)---bash(1556)---bash(30031)-+-grep(30046)
           |                                                   |-pstree(30045)
           |                                                   `-ssh-agent(30032)
# echo $$
30031
# echo $PPID
1556
```

### 实现各主机彼此免密登录

- 创建一个记录IP地址的host.txt文件 也可以包括本主机的IP，然后再每台主机执行自动推送key的脚本 推送到所有需要免费登录的主机

### xshell生成公钥私钥对

- 工具 --> 新建用户密钥生成向导
- **注意：向服务器复制公钥时注意权限要修改为600**



## 其他 ssh 客户端工具

### scp

- 语法：

```bash
scp [options] SRC... DEST/

#范例：
scp [options] [user@]host:/sourcefile /destpath
scp [options] /sourcefile [user@]host:/destpath
```

- 常用选项：

```bash
-C #压缩数据流
-r #递归复制
-p #保持原文件的属性信息
-q #静默模式
-P #PORT 指明remote host的监听的端口
```

### rsync

rsync使用安全的shell连接做为传输方式，比scp更快，基于增量数据同步，即只复制两方不同的文件

**注意：通信两端主机都需要安装 rsync 软件**

- 常用选项：

```bash
-n #模拟复制过程
-v #显示详细过程
-r #递归复制目录树
-p #保留权限
-t #保留修改时间戳
-g #保留组信息
-o #保留所有者信息
-l #将软链接文件本身进行复制（默认）
-L #将软链接文件指向的文件复制
-u #如果接收者的文件比发送者的文件较新，将忽略同步
-z #压缩，节约网络带宽
-a #存档，相当于–rlptgoD，但不保留ACL（-A）和SELinux属性（-X）
--delete #源数据删除，目标数据也自动同步删除
```

- 范例：

```bash
rsync  -av /etc server1:/tmp #复制etc目录和etc目录下文件

rsync  -av /etc/ server1:/tmp #只复制etc目录下文件，而不复制etc目录本身

rsync -auv --delete /data/test 10.0.0.7:/data
```

#### 增量复制范例

- **scp**

```bash
#准备测试文件
# ll f*
-rw-r--r-- 1 root root 657 Apr 20 18:24 f1.txt
-rw-r--r-- 1 root root 657 Apr 20 18:24 f2.txt
-rw-r--r-- 1 root root 657 Apr 20 18:24 f3.txt

#scp复制到远程主机
# scp f* 10.0.0.101:
f1.txt   100%  657   424.6KB/s   00:00    
f2.txt   100%  657   291.5KB/s   00:00    
f3.txt   100%  657   244.6KB/s   00:00

#更改文件
# echo >> f2.txt 
# ll f*
-rw-r--r-- 1 root root 657 Apr 20 18:24 f1.txt
-rw-r--r-- 1 root root 658 Apr 20 18:27 f2.txt
-rw-r--r-- 1 root root 657 Apr 20 18:24 f3.txt

#scp再次复制到远程主机，可以看到每次都是全部复制
# scp f* 10.0.0.101:
f1.txt   100%  657   424.6KB/s   00:00    
f2.txt   100%  658   291.5KB/s   00:00    
f3.txt   100%  657   244.6KB/s   00:00   
```

- **rsync**

```bash
#准备测试文件
# ll f*
-rw-r--r-- 1 root root 657 Apr 20 18:24 f1.txt
-rw-r--r-- 1 root root 657 Apr 20 18:24 f2.txt
-rw-r--r-- 1 root root 657 Apr 20 18:24 f3.txt

#rsync复制到远程主机
# rsync -v f* 10.0.0.101:
f1.txt
f2.txt
f3.txt

sent 2,183 bytes  received 73 bytes  1,504.00 bytes/sec
total size is 1,971  speedup is 0.87

#更改文件
# echo >> f2.txt 
# ll f*
-rw-r--r-- 1 root root 657 Apr 20 18:24 f1.txt
-rw-r--r-- 1 root root 658 Apr 20 18:27 f2.txt
-rw-r--r-- 1 root root 657 Apr 20 18:24 f3.txt

#rsync再次复制到远程主机，可以看到只复制变化的数据
# rsync -v f* 10.0.0.101:
f2.txt     

sent 2,183 bytes  received 73 bytes  1,504.00 bytes/sec
total size is 1,971  speedup is 0.87
```



### sftp

交互式文件传输工具，用法和传统的ftp工具相似，利用ssh服务实现安全的文件上传和下载使用ls cd mkdir rmdir pwd get put等指令，可用？或help获取帮助信息

- 范例：

```
sftp [user@]host
sftp> help
```





# ssh 服务端

## ssh 服务端配置文件说明

- 帮助：man 5 sshd_config

```bash
# /etc/ssh/sshd_config
...
port 22 # ssh服务器端的默认端口号

ListenAddress 0.0.0.0 #ssh监听地址

PermitRootLogin yes # 是否允许root远程登录，默认ubuntu不允许root远程ssh登录，yes允许，prohibit-password或者no 禁止

LoginGraceTime 2m #宽限期，允许客户端发起连接后多长时间内输入密码

StrictModes yes #检查.ssh/文件的所有者，权限等

MaxAuthTries 6 #允许重试连接的次数，为此值的一半，6/2=3次

MaxSessions 10 #同一个连接最大会话，如：xsell中的复制ssh隧道

PubkeyAuthentication yes #是否基于key验证

PermitEmptyPasswords no #是否允许空密码连接，设置为yes则空密码也可登录

PasswordAuthentication yes #基于用户名和密码连接

GatewayPorts no #是否启用网关功能

ClientAliveInterval 10 #间隔多少秒监测一次客户端是否活跃，与ClientAliveInterval配合
ClientAliveCountMax 3 #检查客户端是否活跃的次数，与ClientAliveInterval配合，超过此次数则断开与客户端的连接

UseDNS yes # 提高速度可改为no

GSSAPIAuthentication yes #提高速度可改为no

MaxStartups    #未认证连接最大值，默认值10

Banner /path/file

#以下是可以限制可登录用户的办法：
AllowUsers user1 user2 user3
DenyUsers
AllowGroups
DenyGroups
...
```







# ssh 之实现加密隧道

## 前言

- **ssh的加密隧道其实是通过端口转发来实现的**

- 首先 SSH 会自动加密和解密所有 SSH 客户端与服务端之间的网络数据 这一过程也被叫做“隧道” （tunneling），但除此之外 SSH 还能够将其他 TCP 端口的网络数据通过 SSH 链接来转发，**任何非加密的协议都可以使用此方式**，例如，Telnet，SMTP，LDAP 这些 TCP 应用均能够从中得益，以避免用户名，密码以及隐私信息的明文传输。
- 如果工作环境中的防火墙限制了一些网络端口的使用，但是允许 SSH 的连接，也能够通过将 TCP 端口转发来使用 SSH 进行通讯

- **SSH 端口转发能够提供两大功能：**

  - 加密 SSH Client 端至 SSH Server 端之间的通讯数据

  - 突破防火墙的限制完成一些之前无法建立的 TCP 连接



## SSH 本地端口转发

- **不常用**
- 通常生产中客户端是无法直接连接内部的ssh-server的 因为ssh-server前面通常是有防火墙的，而防火墙一般都限制了22端口访问，**常用方法参阅下面的ssh远程端口转发**

### 语法和选项说明

```bash
#语法说明
#不写 localhost: 则监听本机的0.0.0.0
ssh -L [localhost:]localport:remotehost:remotehostport  -fNg sshserver

#选项说明
-L #指定address，指定要将到本地(客户端)
-f #后台启用
-N #不打开远程shell，处于等待状态
-g #启用网关功能
```

### 报文流向

以客户端与telnet连接举例：

- 当访问本机的9527的端口时，被加密后转发到ssh-server的ssh服务，再解密被转发到telnetsrv:23
- data **<-->** localhost:9527 **<-->** localhost:XXXXX **<-->** ssh-server:22 **<-->** ssh-server:YYYYY **<-->** telnet-server:23
- **注意：ssh-server到telnet-server这段报文是未加密的，因为没有使用ssh加密隧道(相当于ssh-server直接连接telnet-server)，但通常这也不是问题，因为这段通常都是在内网中**



### 范例：实现telnet协议的安全转发

#### 环境

| IP         | service       | location |
| ---------- | ------------- | -------- |
| 10.0.0.100 | client        | Internet |
| 10.0.0.101 | ssh-server    | intranet |
| 10.0.0.102 | telnet-server | intranet |

#### 环境准备

##### 10.0.0.100

- 安装telnet客户端即可

##### 10.0.0.101

- ssh服务默认一般已经安装

##### 10.0.0.102

```bash
#Ubuntu安装telnet
apt -y install telnetd

#Ubuntu启动telnet server
/usr/sbin/in.telnetd

#观察端口是否开启
# ss -tnl|grep 23
LISTEN   0        128              0.0.0.0:23            0.0.0.0:* 

#拒绝10.0.0.100直接连接
iptables -A INPUT -s 10.0.0.100 -j REJECT
```

#### 实现

```bash
#在客户端执行
ssh -L localhost:9527:10.0.0.102:23 -Nfg 10.0.0.101
```

#### 测试

```bash
# telnet 127.0.0.1 9527
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
Ubuntu 20.04.4 LTS
102 login: root
Password: 
Welcome to Ubuntu 20.04.4 LTS (GNU/Linux 5.4.0-105-generic x86_64)
...
```

#### 连接后情况

```bash
#10.0.0.100，client 使用随机端口向 ssh-server 的22端口发起连接
# ss -ntla|grep 101
ESTAB   0       0             10.0.0.100:45430       10.0.0.101:22 


#10.0.0.101，ssh-server 解密后使用随机端口向 telnet-server的23端口 发起连接     
# ss -ntla|grep 23
ESTAB   0       0             10.0.0.101:48546       10.0.0.102:23  


#10.0.0.102，telnet-server 本质上是与 ssh-server 建立的连接，而非client直接连接
# ss -ntla|grep 23
LISTEN  0        128              0.0.0.0:23            0.0.0.0:*               
ESTAB   0        0             10.0.0.102:23         10.0.0.101:48546       
```



### 范例：实现http协议的安全转发

#### 环境

| IP         | role                 | location |
| ---------- | -------------------- | -------- |
| 10.0.0.100 | client               | internet |
| 10.0.0.101 | ssh-server           | intranet |
| 10.0.0.102 | nginx-server（http） | intranet |

#### 环境准备

##### 10.0.0.100

- 安装curl即可

##### 10.0.0.101

- ssh服务默认一般以及安装

##### 10.0.0.102

```bash
#Ubuntu安装nginx
apt -y install nginx

#启动
systemctl enable --now nginx

#准备页面
echo 'website on 10.0.0.102' > /var/www/html/index.nginx-debian.html 

#拒绝10.0.0.100直接连接
iptables -A INPUT -s 10.0.0.100 -j REJECT
```

#### 实现

```bash
#在客户端执行
ssh -L localhost:6666:10.0.0.102:80 -Nfg 10.0.0.101
```

#### 测试

```bash
# curl 127.0.0.1:6666
website on 10.0.0.102
```

#### 连接后情况

```bash
#10.0.0.100，client 使用随机端口向 ssh-server 的22端口发起连接
# ss -ntla|grep 101
ESTAB   0       0             10.0.0.100:45436       10.0.0.101:22 


#10.0.0.101，ssh-server 解密后使用随机端口向 nginx-server的80端口 发起连接     
# ss -ntla|grep 80
TIME-WAIT  0       0           10.0.0.101:35532      10.0.0.102:80   


#10.0.0.102，nginx-server 本质上是与 ssh-server 建立的连接，而非client直接连接
# ss -ntla|grep 80
LISTEN  0        128              0.0.0.0:80            0.0.0.0:*               
ESTAB   0        0             10.0.0.102:80         10.0.0.101:48546       
```



## SSH 远程端口转发

- **常用**
- **实现过程类似上文的ssh本地端口转发 只不过需要客户端与服务端的角色互换**
- **让内网的服务器成为ssh的客户端，之前的客户端成为ssh的服务端，而内网的主机访问外网的ssh服务器是没有限制的，从而不需要修改防火墙策略就能实现外网和内网服务器的数据安全传输**

### 语法和选项说明

```bash
#语法说明
ssh -RfNg localport:remotehost:remotehostport sshserver

#选项说明
-R #指定address，指定要转发到远程（服务器）
-f #后台启用
-N #不打开远程shell，处于等待状态
-g #启用网关功能
```

### 报文流向

以客户端与telnet连接举例：

- 让sshsrv侦听9527端口的访问，如有访问，就加密后通过ssh服务转发请求到本机ssh客户端，再由本机解密后转发到telnetsrv:23
- Data **<-->** sshsrv:9527 **<-->** sshsrv:22 **<-->** localhost:XXXXX **<-->** localhost:YYYYY **<-->** telnetsrv:23
- **注意：ssh-server到telnet-server这段报文是未加密的，因为没有使用ssh加密隧道(相当于ssh-server直接连接telnet-server)，但通常这也不是问题，因为这段通常都是在内网中**



### 范例：实现http协议的安全转发

#### 环境

| IP         | role                 | hostname     | location |
| ---------- | -------------------- | ------------ | -------- |
| 10.0.0.100 | client，ssh-server   | ssh-server   | Internet |
| 10.0.0.101 | ssh-client           | ssh-client   | Intranet |
| 10.0.0.102 | nginx-server（http） | nginx-server | Intarnet |

#### 环境准备

##### 10.0.0.100

- 安装curl即可

##### 10.0.0.101

- ssh服务默认一般以及安装

##### 10.0.0.102

```bash
#Ubuntu安装nginx
apt -y install nginx

#启动
systemctl enable --now nginx

#准备页面
echo 'website on 10.0.0.102' > /var/www/html/index.nginx-debian.html 

#拒绝10.0.0.100直接访问
iptables -A INPUT -s 10.0.0.100 -p tcp --dport 80 -j REJECT
```

#### 实现

```bash
root@ssh-server:~# vim /etc/ssh/sshd_config
...
GatewayPorts yes #开启服务端的网关功能，开启后既可以监听在本机的0.0.0.0:9527，不开启的话只能监听在本机的127.0.0.1:9527上
...

#客户端执行
root@ssh-client:~# ssh -NfgR 9527:10.0.0.102:80 10.0.0.100
root@10.0.0.100's password:
```

#### 测试

```bash
root@ssh-server:~# curl 127.0.0.1:9527
website on 10.0.0.102
root@ssh-server:~# curl 10.0.0.100:9527
website on 10.0.0.102

#其他主机也可以通过 ssh-server 这个代理来访问
[root@7 ~]#curl 10.0.0.100:9527
website on 10.0.0.102
[root@18 ~]#curl 10.0.0.100:9527
website on 10.0.0.102
```

#### 连接后情况

```bash
#10.0.0.100，client充当ssh服务器的客户端来接受内网服务器的连接，即内网服务器使用随机端口向client的ssh服务器的22端口发起连接
# ss -ntla|grep 101
ESTAB   0        0             10.0.0.100:22         10.0.0.101:38246

#10.0.0.101，内网的ssh-client 解密后使用随机端口向 nginx-server的80端口 发起连接     
# ss -ntla|grep 80
TIME-WAIT  0       0           10.0.0.101:50868       10.0.0.102:80  


#10.0.0.102，nginx-server看的连接是来自10.0.0.101，也就是内网的ssh-client
root@nginx-server:~# tail -f /var/log/nginx/access.log 
10.0.0.101 - - [21/Apr/2022:18:50:48 +0800] "GET / HTTP/1.1" 200 22 "-" "curl/7.68.0"
```







## SSH 动态端口转发

```bash
#当用firefox访问internet时，本机的1080端口做为代理服务器，firefox的访问请求被转发到sshserver上，由sshserver替之访问internet
ssh -D 1080 root@sshserver  -fNg

#在本机firefox设置代理socket proxy:127.0.0.1:1080
curl  --socks5 127.0.0.1:1080 http://www.google.com
```

**范例：动态端口转发实现科学上网方式1**

```bash
[root@vps ~]#ssh -gfND 9527 10.0.0.18

#Firefox浏览器中设置socksv5代理，并指向本机127.0.0.1:9527
```

**范例：动态端口转发实现科学上网方式2**

```bash
[root@vps ~]#ssh -gfND 9527 10.0.0.18

[root@centos6 ~]#curl --socks5 10.0.0.18:9527 http://10.0.0.28
google On 10.0.0.28
[root@centos7 ~]#curl --socks5 10.0.0.18:9527 http://10.0.0.28
google On 10.0.0.28
```



# X 协议转发

所有图形化应用程序都是X客户程序,能够通过tcp/ip连接远程X服务器,数据没有加密，但是它通过ssh连接隧道安全进行

```bash
#remotehost主机上的gedit工具，将会显示在本机的X服务器上,传输的数据将通过ssh连接加密
ssh -X user@remotehost gedit
```

**范例：在windows上使用mobaXtrem的X server 显示 Linux 的图形工具**

```bash
#Ubuntu无需
[root@centos ~]#yum install xorg-x11-xauth xorg-x11-fonts-* xorg-x11-font-utils 
xorg-x11-fonts-Type1 firefox
[root@centos ~]#exit
[root@centos ~]#firefox
```

**范例：在windows上使用xshell的X server 显示 Linux 的图形工具**

```bash
[root@centos ~]# export DISPLAY=10.0.0.1:0.0
[root@centos ~]# yum -y install xclock
```





# ssh 其他相关工具

## 远程挂载 sshfs

- 目前CentOS8 还没有提供

```bash
# yum install fuse-sshfs

# sshfs 10.0.0.8:/data /mnt

# df /mnt
Filesystem     1K-blocks   Used Available Use% Mounted on
10.0.0.8:/data  52403200 398576  52004624   1% /mnt
```



## 自动登录 sshpass

- sshpass 主要用于非交互SSH的密码验证，一般用在sh脚本中，无须再次输入密码（前提是本known_hosts文件中有的主机才能生效，或者 ssh -o StrictHostKeyChecking=no指定）
- sshpass 支持密码从 命令行、文件、环境变量中读取
- 来自 sshpass 包

### 语法

```bash
sshpass [option] command parameters
```

### 常用选项

```bash
-p password #后跟密码它允许你用 -p 参数指定明文密码，然后直接登录远程服务器
-f filename #后跟保存密码的文件名，密码是文件内容的第一行。
-e #将环境变量SSHPASS作为密码
```

### 范例

```bash
# sshpass -p 123456 ssh -o StrictHostKeyChecking=no root@10.0.0.8

# sshpass -p 123456 ssh -o StrictHostKeyChecking=no 10.0.0.7 hostname -I
Warning: Permanently added '10.0.0.7' (ECDSA) to the list of known hosts.
10.0.0.7 

# sshpass -p 123456 ssh -o StrictHostKeyChecking=no 10.0.0.6 hostname -I
Warning: Permanently added '10.0.0.6' (RSA) to the list of known hosts.
10.0.0.6 

# cat pass.txt
123456
# sshpass -f pass.txt ssh root@10.0.0.8

# export SSHPASS=123456
# sshpass -e ssh root@10.0.0.8
```

- **范例：批量修改多台主机的root密码为随机密码**

```bash
#!/bin/bash
rpm -q sshpass &> /dev/null || yum -y install sshpass
export SSHPASS=123456
NET=10.0.0
for i in {1..254};do
   {
 PASS=`openssl rand -base64 9`
 sshpass -e ssh $NET.$i "echo $PASS|passwd --stdin root &> /dev/null"
 echo $NET.$i:$PASS >> host.txt
 }&
done
wait
```



## 自动化运维

**类似ansible的工具：**

- **pssh**：基于python编写，可在多台服务器上执行命令的工具，也可实现文件复制，提供了基于ssh和scp的多个并行工具，项目：http://code.google.com/p/parallel-ssh/, CentOS8上目前没提供

- **pdsh**：Parallel remote shell program，是一个多线程远程shell客户端，可以并行执行多个远程主机上的命令。 可使用几种不同的远程shell服务，包括rsh，Kerberos IV和ssh，项目： https://pdsh.googlecode.com/

- **mussh**：Multihost SSH wrapper，是一个shell脚本，允许使用命令在多个主机上通过ssh执行命令。 可使用ssh-agent和RSA/DSA密钥，以减少输入密码，项目：http://www.sourceforge.net/projects/mussh





# 实现基于密钥的登录方式

**1.在客户端生成基于当前用户的公钥私钥对**

```bash
ssh-keygen [-t rsa] [-P 'password'] [-f "~/.ssh/id_rsa"] #为了安全起见，通常要给私钥设置口令
#正常一路回车就行
```

**2.把公钥文件传输至远程服务器对应用户的家目录**

```bash
ssh-copy-id [-i [identity_file]] [user@]host

#此命令很聪明，即使写的是拷贝私钥但还会将公钥拷贝过去而不拷贝私钥
```

**重设私钥口令：**

```bash
ssh-keygen –p

#给私钥设置口令后，对远程主机的操作又会回到交互式操作，这时我们可以通过启动ssh代理的方法来解决，下面是具体实现方法：
ssh-agent bash #开启代理
ssh-add #将密码托管给代理程序
#代理程序是临时行的，相当于开了一个子shell
```

**在windows的终端软件上实现密钥登录**

**xshell举例：**
1.工具>新建用户秘钥生成向导>选择密钥类型和秘钥长度然后下一步>下一步>输入秘钥名称和密码下一步>可以选择保存文件，或者直接点完成
2.把公钥文件保存至想登录的主机并改名"cat 私钥文件 >> ~/.ssh/authorized_keys"，要注意修改 ~/.ssh/authorized_keys文件的权限为600！
3.在xshell登录中选 新建>连接>用户身份验证>方法>public key
4.这样就可以实现xshell基于key验证登录了，为了安全也可以给私钥加密码，可以把私钥文件导出到便携设备，在别处登录时直接将私钥拷贝至xshell即可

  

## 实战案例：实现双主机互相免密登录

- A主机：10.0.0.103
- B主机：10.0.0.8

### 需要的包：

```bash
#centos
openssh包

#ubuntu

```

### A主机配置

```bash
#生成公钥私钥对，一路回车即可
root@logstash:~# ssh-keygen
...

#生成的公钥私钥对存放位置
root@logstash:~# ll -t .ssh/
total 16
drwx------ 2 root root 4096 Nov 24 16:53 ./
-rw------- 1 root root 2602 Nov 24 16:53 id_rsa #私钥（注意！！！，谁拿到这个私钥都可以随意的登录存放此私钥对应公钥的主机 且不需要验证，所以要妥善保管并给此私钥设置密码）
-rw-r--r-- 1 root root  567 Nov 24 16:53 id_rsa.pub #公钥
...

#将公钥拷贝到B主机
root@logstash:~# ssh-copy-id root@10.0.0.8
...
root@10.0.0.8's password:  #输入B主机的密码
...

#在B主机查看公钥信息
[root@keepalived1 ~]# ll -at .ssh/
total 4
drwx------  2 root root  48 Nov 24 17:07 .
-rw-------  1 root root 567 Nov 24 17:07 authorized_keys #B主机接受到的A主机公钥
...

#查看公钥内容是否一致（A主机的公钥是经过BASE64编码处理过的，所以看起来不一样）
...

#最后就可以实现A主机登录B主机无需密码验证
root@logstash:~# hostname -I
10.0.0.103 
root@logstash:~# ssh 10.0.0.8
Last login: Wed Nov 24 17:12:28 2021 from 10.0.0.103
[root@keepalived1 ~]#
[root@keepalived1 ~]# hostname -I
10.0.0.8
```



### B主机配置

和A主机配置同理...





## 在所有节点实现相互之间ssh key验证

```bash
[root@mha-manager ~]# ssh-keygen
[root@mha-manager ~]# ssh-copy-id 127.0.0.1
[root@mha-manager ~]# rsync -av .ssh 10.0.0.8:/root/
[root@mha-manager ~]# rsync -av .ssh 10.0.0.18:/root/
[root@mha-manager ~]# rsync -av .ssh 10.0.0.28:/root/
```





# 解决ssh登录缓慢的问题

```bash
vim /etc/ssh/sshd_config
UseDNS no
GSSAPIAuthentication no
systemctl restart sshd
```





# 禁止ssh首次连接的询问过程（不询问yes or no）

```bash
sed -i.bak '/StrictHostKeyChecking/s/.*/StrictHostKeyChecking no/' /etc/ssh/ssh_config

#恢复成初始状态:
sed -i.bak '/StrictHostKeyChecking/s/.*/#StrictHostKeyChecking ask/' /etc/ssh/ssh_config

#以上设置完毕后需要重启服务systemctl restart sshd
#如果恢复成初始状态链接没有询问，则需要删除~/.ssh/known_hosts文件
```

