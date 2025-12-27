---
title: "TFTP"
---

# TFTP 概述

- TFTP：Trivial File Transfer Protocol 
- TFTP是一种用于传输文件的简单高级协议，是文件传输协议（FTP）的简化版本







# TFTP 和 FTP 的区别

### 安全性区别

- FTP支持登录安全，具有适当的身份验证和加密协议，在建立连接期间需要与FTP身份验证通信
- TFTP是一种开放协议，缺乏安全性，没有加密机制，与TFTP通信时不需要认证

### 传输层协议的区别

- FTP使用TCP作为传输层协议，TFTP使用UDP作为传输层协议

### 使用端口的区别

- FTP使用2个端口：TCP端口21，是个侦听端口；TCP端口20或更高TCP端口1024以上用于源连接
- TFTP仅使用一个具有停止和等待模式的端口：端口：69/udp

### RFC的区别

- FTP是基于RFC 959文档，带有其他RFC涵盖安全措施；TFTP基于RFC 1350文档

### 执行命令的区别

- FTP有许多可以执行的命令（get，put，ls，dir，lcd）并且可以列出目录等
- TFTP只有5个指令可以执行（rrq，wrq，data，ack，error）





# TFTP 服务端

## TFTP 服务端安装

- 服务端包：tftp-server

```bash
#安装tftp服务器包
yum install -y tftp-server

#启动服务
systemctl enable --now tftp.service 

# ss -nulp|grep tftp 
UNCONN   0         0                         *:69                     *:*       
users:(("in.tftpd",pid=10100,fd=0),("systemd",pid=1,fd=32))
```

## TFTP 服务端相关文件

```bash
# rpm -ql tftp-server
/usr/lib/.build-id
/usr/lib/.build-id/8c
/usr/lib/.build-id/8c/6921a9fb21d66da4fb299d516bce9ee6afea34
/usr/lib/systemd/system/tftp.service #tftp service文件
/usr/lib/systemd/system/tftp.socket #tftp socket文件（如果只开启socket，那么tftp默认只会附属在systemd进程上，当用户下载文件后，服务器端会自动打开in.tftpd主程序）
/usr/sbin/in.tftpd   #tftp主程序
/usr/share/doc/tftp-server
/usr/share/doc/tftp-server/CHANGES
/usr/share/doc/tftp-server/README
/usr/share/doc/tftp-server/README.security
/usr/share/man/man8/in.tftpd.8.gz
/usr/share/man/man8/tftpd.8.gz
/var/lib/tftpboot   #TFTP服务数据目录
```



# TFTP 客户端

## TFTP 客户端安装

- 客户端包：tftp

```bash
yum -y install tftp
```

## TFTP 客户端命令说明

```bash
# tftp 10.0.0.8 #登录tftp服务器
tftp> help #获取帮助
tftp-hpa 5.2
Commands may be abbreviated. Commands are:
connect connect to remote tftp
mode   set file transfer mode
put     send file
get     receive file
quit   exit tftp
verbose toggle verbose mode
trace   toggle packet tracing
literal toggle literal mode, ignore ':' in file name
status show current status
binary set mode to octet
ascii   set mode to netascii
rexmt   set per-packet transmission timeout
timeout set total retransmission timeout
?       print help information
help   print help information
```







# TFTP 使用

```bash
#安装tftp服务端
[root@tftp-server ~]# yum -y install tftp-server

#tftp服务端启动服务
[root@tftp-server ~]# systemctl enable --now tftp.service 

#tftp服务端准备测试文件
[root@tftp-server ~]# cp /etc/fstab /var/lib/tftpboot/f1.txt
[root@tftp-server ~]# mkdir /var/lib/tftpboot/dir
[root@tftp-server ~]# cp /etc/passwd /var/lib/tftpboot/dir/f2.txt
[root@tftp-server ~]# tree /var/lib/tftpboot/
/var/lib/tftpboot/
├── dir
│   └── f2.txt
└── f1.txt


----------------------------------------------------------------------------

#安装tftp客户端
[root@tftp-client ~]# yum -y install tftp

#客户端通过tftp测试下载文件
[root@tftp-client ~]# tftp 10.0.0.8 #登录tftp服务器
tftp> get f1.txt
tftp> get dir/f2.txt
tftp> quit

#检查下载的文件
[root@tftp-client ~]# ls
f1.txt f2.txt
```

