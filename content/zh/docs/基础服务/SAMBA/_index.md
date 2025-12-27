---
title: "SAMBA"
---

# Windows内置的共享服务

- **在Windows系统中，$结尾的共享文件是隐藏的，但是可以在Linux中看到**

## SMB

Server Message Block 服务器消息块，IBM发布，最早是DOS网络文件共享协议,是私有协议

## CIFS

common internet file system，微软基于SMB发布 相当于SMB的升级版，同样也是私有协议

## SAMBA

1991年个人开发，实现Windows和UNIX相通，公有协议



# SAMBA 概述

SAMBA很好的解决了 windows和UNIX之间的跨平台兼容性问题，还可以实现挂载，能更好的实现跨平台文件共享

**官方网站：**https://www.samba.org/

## SAMBA的功能

- 共享文件和打印，实现在线编辑
- 实现登录SAMBA用户的身份认证
- 可以进行NetBIOS名称解析
- 外围设备共享



# SAMBA 相关包

- **samba：**提供smb服务器端
- **samba-client：**客户端软件
- **samba-common：**通用软件
- **cifs-utils：**smb客户端工具（挂载需要安装此工具）



# SAMBA 相关服务进程

- **smbd：**提供smb（cifs）服务、TCP/139,445
- **nmbd：**NetBIOS名称解析、UDP/137,138



# SAMBA 主配置文件

/etc/samba/smb.conf 



# SAMBA 帮助

man smb.conf



# SAMBA 相关工具

```sh
#语法检查
testparm [-v] [/etc/samba/smb.conf]

#客户端工具
smbclient
mount.cifs
```



# 挂载CIFS文件系统

需要安装cifs-utils包，来支持cifs文件系统

## 手动挂载

```
mount -o user=wang,password=magedu //server//shared   /mnt/smb
```

## 开机自动挂载

```bash
#明文账号密码实现开机自动挂载
//server/homes /mnt cifs user=winuser1,pass=123456 0 0

cat /etc/fstab 
#可以用文件代替用户名和密码的输入
//server/homes /mnt cifs credentials或cred=/etc/smb.txt 0 0

cat /etc/smb.txt
username=wang #或 user=wang
password=password #或 pass=password
chmod 600 /etc/smb.txt
```



# Linux作为SAMBA服务器

**生产中，绝大多数为Linux作为samba服务器来实现文件共享存储，Windows作为客户端**

- 建议使用centos8及以上来做samba服务器，samba的版本更新(3.11)兼容性更好

## 实现

```bash
#安装服务端软件
yum -y install samba
rpm -ql samba
/usr/lib/systemd/system/nmb.service #辅助服务，实现名字解析
/usr/lib/systemd/system/smb.service #核心服务

#配置文件放在samba依赖包samba-common中
rpm -ql samba-common
/etc/samba/smb.conf
/etc/samba/smb.conf.example #配置文件的范例

#启动samba服务
systemctl start smb

#观察445、139端口是否开启
ss -ntl
State  Recv-Q   Send-Q     Local Address:Port          Peer Address:Port         
LISTEN    0       50           0.0.0.0:445                 0.0.0.0:*            
LISTEN    0       50           0.0.0.0:139                 0.0.0.0:*             
LISTEN    0       50              [::]:445                    [::]:* #[::]为IPV6地址
LISTEN    0       50              [::]:139                    [::]:*            

#window客户端访问smb服务器时，需要登录smb的虚拟用户
#需先创建一个操作系统账号，需要用户的家目录 否则将无法访问
useradd -s /sbin/nologin -r smb
#在将系统账号加入到虚拟用户中，不加-a表示更改密码
smbpasswd -a smb
pdbedit -L #显示smb数据库中的账号信息，来自/var/lib/samba/private/passdb.tdb
pdbedit -Lv #加-v可以显示的更详细
groupmems -a smb2 -g admins #将smb2用户加入到admins组总（前提系统中有此用户和组） 
groupmems -l -g admins #查看加入的组列表

#修改用户密码
smbpasswd <user>

#删除用户和密码（系统用户如果事先删除的话，因为没有账号对应关系，会导致删除出现问题）
smbpasswd -x <user> 
pdbedit  -x -u <user>

#查看samba服务器状态，版本等信息
smbstatus

#查看服务端的文件
smbclient -L 10.0.0.8 -U smb%smbpass
```

## 在window登录

- 我的电脑 > 搜索 \\\10.0.0.8 > 输入建立的smb账号和密码
- 也可以 我的电脑 > 网络 > 映射网络驱动器来永久添加







## 可能会遇到的问题

- **服务端家目录不存在会导致无法访问等问题**

- **版本协议不同，也有可能出现问题**

```
man mount.cifs

vers=arg
              SMB protocol version. Allowed values are:

              · 1.0 - The classic CIFS/SMBv1 protocol.

              · 2.0 - The SMBv2.002 protocol. This was initially introduced in Windows Vista Service  Pack  1,  and
                Windows  Server  2008. Note that the initial release version of Windows Vista spoke a slightly dif‐
                ferent dialect (2.000) that is not supported.

              · 2.1 - The SMBv2.1 protocol that was introduced in Microsoft Windows 7 and Windows Server 2008R2.

              · 3.0 - The SMBv3.0 protocol that was introduced in Microsoft Windows 8 and Windows Server 2012.

              · 3.02 or 3.0.2 - The SMBv3.0.2 protocol that was introduced in Microsoft  Windows  8.1  and  Windows
                Server 2012R2.

              · 3.1.1  or  3.11  -  The  SMBv3.1.1 protocol that was introduced in Microsoft Windows 10 and Windows
                Server 2016.

              · 3 - The SMBv3.0 protocol version and above.

              · default - Tries to negotiate the highest SMB2+ version supported by both the client and server.

              If  no  dialect  is  specified  on  mount  vers=default  is  used.   To  check   Dialect   refer   to
              /proc/fs/cifs/DebugData

              Note  too  that while this option governs the protocol version used, not all features of each version
              are available.
```





# samba服务器配置

- 默认只共享了samba的家目录，共享其他目录需修改配置文件
- 帮助：man smb.conf 
- samba 配置文件 /etc/samba/smb.conf 格式 ，使用.ini文件的格式，用 [ ] 分成以下几部分

## 全局设置

```bash
[global] #服务器通用或全局设置的部分
```

## 特定共享设置

```bash
[homes] #用户的家目录共享
[printers] #定义打印机资源和服务
[sharename] #自定义的共享目录配置

其中：#和;开头的语句为注释，大小写不敏感
```

## samba配置中的宏定义

```bash
%m #客户端主机的NetBIOS名  
%M #客户端主机的FQDN
%H #当前用户家目录路径 
%U #当前用户的用户名
%g #当前用户所属组
%h #samba服务器的主机名
%L #samba服务器的NetBIOS名 
%I #客户端主机的IP，是i的大写字母
%T #当前日期和时间  
%S #可登录的用户名
```

##  SAMBA服务器全局配置

- workgroup 指定工作组名称

- server string 主机注释信息

- netbios name 指定NetBIOS名，可以被SAMBA客户端使用,但不支持ping 

​       注意：netbios name需要启动nmb服务

​       范例：

```bash
[global]
workgroup = workgroup
netbios name = smbserver   #此设置需要启动nmb服务才可能生效
```

- interfaces 指定服务侦听接口和IP

- hosts allow 可用逗号，空格，或tab分隔，默认允许所有主机访问，也可在每个共享独立配置，如在[global]设置，将应用并覆盖所有共享设置，可以是以下格式：

```
IPv4 network/prefix: 172.16.0.0/24 IPv4 前缀: 172.16.0.
IPv4 network/netmask: 172.16.0.0/255.255.255.0
主机名: desktop.example.com 
以example.com后缀的主机名: .example.com
```

​      范例：

```
hosts allow = 172.16.   .example.com
```

- max log size=50 日志文件达到50K，将轮循rotate,单位KB

- Security三种认证方式：

  user：samba用户（采有linux用户，samba的独立口令）

  share：匿名(CentOS7不再支持)，已不建议使用

  server：已不建议使用

- passdb backend = tdbsam 密码数据库格式



## 配置特定目录共享

每个共享目录应该有独立的[ ]部分

```bash
[共享名称] 远程网络看到的共享名称
comment 注释信息
path 所共享的目录路径
public 能否被guest访问的共享，默认no，和guest=ok 类似
browsable 是否允许所有用户浏览此共享,默认为yes,no为隐藏
writable=yes 可以被所有用户读写，默认为no
read only=no 和writable=yes等价，如与以上设置冲突，放在后面的设置生效，默认只读
write list   用户，@组名，+组名 之间用逗号分隔，如：writable=no，列表中用户或组可读写，不在列表中用户只读
valid users 特定用户才能访问该共享，如为空，将允许所有用户，用户名之间用空格分隔
```

范例：基于特定用户和组的共享

```bash
#需单独写一行语句块
vim /etc/samba/smb.conf
[share]
path = /data/dir #针对此目录共享
valid users=xiang,@admins #xiang用户和adims组的人才能访问
writeable = no #不可写
browseable = no #不可浏览，知道名字的情况下可以访问

#修改完配置文件后，无需重启服务，访问同样可以看到效果
```



# 实战案例

## 实战案例：利用SAMBA实现指定目录共享

```bash
#在samba服务器上安装samba包
yum -y install samba

#创建samba用户和组
groupadd -r admins
useradd -s /sbin/nologin -G admins wang
smbpasswd -a wang
useradd -s /sbin/nologin mage
smbpasswd -a mage

#创建samba共享目录,并设置SElinux
mkdir /testdir/smbshare
chgrp admins /testdir/smbshare
chmod 2775 /testdir/smbshare

#samba服务器配置
vim /etc/samba/smb.conf 
...省略...
[share]
path = /testdir/smbshare
write list = @admins
systemctl enable --now smb nmb

#samba客户端访问
yum -y install cifs-utils

#用wang用户挂载smb共享并访问
mkdir /mnt/wang
mount -o username=wang //smbserver/share /mnt/wang
echo "Hello wang" >/mnt/wang/wangfile.txt

#在samba服务器上安装samba包
yum -y install samba

#创建samba用户和组
groupadd -r admins
useradd -s /sbin/nologin -G admins wang
smbpasswd -a wang
useradd -s /sbin/nologin mage
smbpasswd -a mage

#创建samba共享目录,并设置SElinux
mkdir /testdir/smbshare
chgrp admins /testdir/smbshare
chmod 2775 /testdir/smbshare

#samba服务器配置
vim /etc/samba/smb.conf 
...省略...
[share]
path = /testdir/smbshare
write list = @admins
systemctl enable --now smb nmb

#samba客户端访问
yum -y install cifs-utils

#用wang用户挂载smb共享并访问
mkdir /mnt/wang
mount -o username=wang //smbserver/share /mnt/wang
echo "Hello wang" >/mnt/wang/wangfile.txt
```



## 实战案例2：实现不同samba用户访问相同的samba共享，实现不同的配置

```bash
#创建三个samba用户,并指定密码为magedu
useradd -s /sbin/nologin smb1
useradd -s /sbin/nologin smb2
useradd -s /sbin/nologin smb3
smbpasswd -a smb1
smbpasswd -a smb2
smbpasswd -a smb3 

#修改samba配置文件
Vim /etc/samba/smb.conf

#在workgroup下加一行
config file= /etc/samba/conf.d/%U #%U表示用户名，此行表示以后在/etc/samba/conf.d/下创建一个和用户名同名的文件，并具有以下配置
[share]
Path=/data/dir
Read only= NO
Guest ok = yes
write list=@wheel

#针对smb1和smb2用户创建单独的配置文件
Vim /etc/samba/conf.d/smb1
[share]
Path=/data/dir1
Read only= NO 等价于writable = yes
Create mask=0644     

#说明：默认为744
Vim /etc/samba/conf.d/smb2
[share]
path=/data/dir2
systemctl restart smb nmb

#用户smb1，smb2,smb3访问share共享目录，看到目录是不同目录
smbclient //sambaserver/share -U smb1%magedu
smbclient //sambaserver/share -U smb2%magedu
smbclient //sambaserver/share -U smb3%magedu
```

