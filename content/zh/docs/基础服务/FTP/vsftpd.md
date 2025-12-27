---
title: "vsftpd"
---

# vsftpd 概述

[vsftpd - Secure, fast FTP server for UNIX-like systems (security.appspot.com)](https://security.appspot.com/vsftpd.html)

Very Secure FTP Daemon，CentOS 默认FTP服务器高速，稳定，下载速度是WU-FTP的两倍，ftp.redhat.com数据:单机最多可支持15000个并发



# vsftpd 部署

- 直接通过 yum 或 apt 安装 vsftpd 包即可



# vsftpd 相关文件

- CentOS

```sh
# rpm -ql vsftpd
/etc/vsftpd/vsftpd.conf  # 主配置文件
/usr/lib/systemd/system/vsftpd.service  # 启动服务相关文件
...
```

- Ubuntu

```sh
# dpkg -L vsftpd 
/etc/vsftpd.conf  # 主配置文件
/lib/systemd/system/vsftpd.service  # 启动服务相关文件
...
```



# vsftpd 配置文件说明

## 注意事项

- 配置文件格式为：`option=value` （= 前后不要有空格）

## vsftpd.conf

**获取帮助：**

- `man 5 vsftpd.conf`
- 官方文档需翻墙

### 基础配置

```sh
listen_port=2121  # 修改默认命令端口,默认值为21

# 主动模式端口
connect_from_port_20=YES  # 主动模式端口为20
ftp_data_port=20  # 指定主动模式的端口

# 被动模式端口范围
pasv_min_port=6000  # 0为随机分配，端口范围会影响客户端的并发数，此处仅配置了10个随机端口，即表示最大只支持10个客户端的连接
pasv_max_port=6010

# 时间
use_localtime=YES  # 使用当地时间（默认为NO，使用GMT），不建议修改，不同的客户端默认会调整文件的显示时间
```

### 匿名用户相关

```sh
# 匿名用户登录（不验证账号密码就可以直接自动登录）
anonymous_enable=YES  # 支持匿名用户，CentOS8 默认不允许匿名
no_anon_password=YES  # 匿名用户略过口令检查 , 默认NO

# 匿名用户上传
anon_upload_enable=YES  # 匿名上传，注意:文件系统权限：setfacl -m u:ftp:rwx /var/ftp/pub
anon_mkdir_write_enable=YES  # 匿名建目录

anon_world_readable_only=NO  # 只能下载全部读的文件, 默认YES
anon_umask=0333  # 指定匿名上传文件的umask，默认077，注意：0333中的0不能省略
anon_other_write_enable=YES  # 可删除和修改上传的文件, 默认NO，此选项要谨慎开启

# 指定匿名用户的上传文件的默认的所有者和权限
chown_uploads=YES # 默认NO
chown_username=xiang
chown_upload_mode=0644
```





### 系统用户相关

```sh
# Linux系统用户
local_enable=YES  # 是否允许linux用户登录，默认YES
write_enable=YES  # 允许linux用户上传文件，默认YES
local_umask=022  # 指定系统用户上传文件的默认权限对应umask，默认022

# 将系统用户映射为指定的guest用户
guest_enable=YES  # 所有系统用户都映射成guest用户
guest_username=ftp  # 配合上面选项才生效，指定guest用户
local_root=/ftproot  # 指定guest用户登录所在目录,但不影响匿名用户的登录目录

# 禁锢系统用户
chroot_local_user=YES  # 禁锢系统用户，默认NO，即不禁锢
# 禁锢或不禁锢特定的系统用户在家目录中，与上面设置功能相反
chroot_list_enable=YES  # 默认是NO
chroot_list_file=/etc/vsftpd/chroot_list  #默认值
# 当chroot_local_user=YES和chroot_list_enable=YES时，则chroot_list中用户不禁锢，即白名单
# 当chroot_local_user=NO和chroot_list_enable=YES时，则chroot_list中用户禁锢，即黑名单
```

### 其他配置

```bash
# 日志
# wu-ftp 日志：默认启用,vsftp默认使用此日志记录
xferlog_enable=YES  # 启用记录上传下载日志，此为默认值
xferlog_std_format=YES  # 使用wu-ftp日志格式，此为默认值
xferlog_file=/var/log/xferlog  # 可自动生成，此为默认值

# vsftpd日志：默认不启用
dual_log_enable=YES  # 使用vsftpd日志格式，默认不启用
vsftpd_log_file=/var/log/vsftpd.log  # 可自动生成， 此为默认值

# 提示信息
# 登录提示信息，以下两行都可以实现
ftpd_banner="welcome to mage ftp server" 
banner_file=/etc/vsftpd/ftpbanner.txt  # 此方式优先级更高
# 目录访问提示信息
dirmessage_enable=YES  # 此为默认值
message_file=.message  # 信息存放在指定目录下.message ，此为默认值,只支持单行说明

# 是否启用控制用户登录的列表文件
userlist_enable=YES  # 此为默认值
userlist_deny=YES(默认值) # 黑名单,不提示口令，NO为白名单
userlist_file=/etc/vsftpd/user_list # 此为默认值

# vsftpd服务指定用户身份运行
nopriv_user=nobody # 此为默认值

# 连接数限制
max_clients=0  # 最大并发连接数
max_per_ip=0  # 每个IP同时发起的最大连接数

# 传输速率，单位：字节/秒
anon_max_rate=0  # 匿名用户的最大传输速率,以字节为单位,比如:1024000表示1MB/s
local_max_rate=0  # 本地用户的最大传输速率

# 连接时间：秒为单位
connect_timeout=60  # 主动模式数据连接超时时长
accept_timeout=60  # 被动模式数据连接超时时长
data_connection_timeout=300  # 数据连接无数据输超时时长
idle_session_timeout=60  # 无命令操作超时时长

# 优先以文本方式传输，不建议使用文本方式，因为可能导致二进制文件内容被破坏，status可以查看默认使用的传输方式
ascii_upload_enable=YES
ascii_download_enable=YES
```



# vsftpd 常见配置

## 匿名用户相关

### 允许匿名用户登录

- 通过vsftpd配置文件中的设置，允许匿名访问FTP服务器。匿名用户可以使用"anonymous"或"ftp"作为用户名登录。在登录成功后，匿名用户会被限制在/var/ftp/pub目录下，该目录的所有者为root用户。
  - 需要注意的是，实际情况可能因具体的配置和系统环境而有所不同。
- 通过FTP客户端，匿名用户可以访问pub目录并执行文件传输操作。
- **修改ftp账号的家目录就可以直接修改匿名账号默认的目录了**

```sh
[root@ftp-server ~]# grep anonymous_enable /etc/vsftpd/vsftpd.conf 
anonymous_enable=YES


[root@ftp-client ~]# ftp 10.0.0.8
Connected to 10.0.0.8 (10.0.0.8).
220 (vsFTPd 3.0.3)
Name (10.0.0.8:root): anonymous  # 使用 anonymous 或 ftp 用户都可以登录
331 Please specify the password.
Password:  # 输入任何密码或直接回车都可以
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
227 Entering Passive Mode (10,0,0,8,76,11).
150 Here comes the directory listing.
drwxr-xr-x    2 0        0               6 Apr 22  2021 pub
226 Directory send OK.



# FTP服务器的默认根目录为/var/ftp，其中的pub目录是匿名用户的目录。
[root@ftp-server ~]# id ftp
uid=14(ftp) gid=50(ftp) groups=50(ftp)

[root@ftp-server ~]# getent passwd ftp
ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin

[root@ftp-server ~]# ll /var/ftp/
total 0
drwxr-xr-x 2 root root 6 Apr 22  2021 pub
```



### 匿名用户登录无需密码

#### 实现前

- 默认为 NO，即表示匿名用户登录时需要输入密码，但输入任意密码都可以登录

```sh
[root@ftp-server ~]# grep anonymous_enable /etc/vsftpd/vsftpd.conf 
no_anon_password=NO


[root@ftp-client ~]# ftp 10.0.0.8
Connected to 10.0.0.8 (10.0.0.8).
220 (vsFTPd 3.0.3)
Name (10.0.0.8:root): anonymous  # 使用 anonymous 或 ftp 用户都可以登录
331 Please specify the password.
Password:  # 输入任何密码都可以
230 Login successful.
...
```

#### 实现后

- 设置为 YES 后，匿名用户登录将不再需要输入密码

```sh
[root@ftp-server ~]# grep no_anon_password /etc/vsftpd/vsftpd.conf 
no_anon_password=YES


[root@ftp-client ~]# ftp 10.0.0.8
Connected to 10.0.0.8 (10.0.0.8).
220 (vsFTPd 3.0.3)
Name (10.0.0.8:root): ftp  # 使用 anonymous 或 ftp 用户都可以登录
230 Login successful.  # 直接登录成功
...
```



### 匿名用户上传

#### 实现前

- 默认匿名用户只能下载文件，不能上传文件创建目录

```sh
# 因受到以下参数的影响，所以匿名用户只能下载文件，不能上传文件和创建目录
[root@ftp-server ftp]# grep -E "(anon_upload_enable|anon_mkdir_write_enable)" /etc/vsftpd/vsftpd.conf 
#anon_upload_enable=YES
#anon_mkdir_write_enable=YES


# 可以下载
[root@ftp-client ~]# ftp 10.0.0.8
...
Name (10.0.0.8:root): ftp
...
ftp> ls
227 Entering Passive Mode (10,0,0,8,245,252).
150 Here comes the directory listing.
-rw-r--r--    1 0        0             615 May 17 02:24 fstab
drwxr-xr-x    2 0        0               6 Apr 22  2021 pub
226 Directory send OK.
ftp> get fstab
...

[root@ftp-client ~]# ls
fstab


# 不能上传
[root@ftp-client ~]# ls
fstab  os-release

ftp> put os-release
local: os-release remote: os-release
227 Entering Passive Mode (10,0,0,8,137,120).
550 Permission denied.


# 也不能创建目录
ftp> mkdir d1
550 Permission denied.

```

#### 实现后

- 开启匿名用户上传和建目录功能

- **还要注意文件系统权限的问题，因为 /var/ftp/pub 目录的所有者和所属组是 root，所以 ftp用户无法在此目录下创建文件或目录**

  - ```sh
    # ll /var/ftp/pub -d
    drwxr-xr-x 2 root root 6 Apr 22  2021 /var/ftp/pub
    
    
    # 可以为其设置acl权限
    setfacl -m u:ftp:rwx /var/ftp/pub
    ```

```sh
[root@ftp-server ftp]# grep -E "(anon_upload_enable|anon_mkdir_write_enable)" /etc/vsftpd/vsftpd.conf 
anon_upload_enable=YES
anon_mkdir_write_enable=YES
# Uncomment this to enable any form of FTP write command.
write_enable=YES # 此选项也要为YES


# 还是不能上传，但提示由此前的 Permission denied 转换成了 Could not create file，这是因为文件系统权限的问题
[root@ftp-client ~]# ls
fstab  os-release

ftp> put os-release
local: os-release remote: os-release
227 Entering Passive Mode (10,0,0,8,140,7).
553 Could not create file.  # 此前是 Permission denied


# 还是不能创建目录，但提示由此前的 Permission denied 转换成了 Create directory operation failed，这是因为文件系统权限的问题
ftp> mkdir d1
550 Create directory operation failed.  # 此前是 Permission denied


# 设置acl权限后问题解决
[root@ftp-server ftp]# setfacl -m u:ftp:rwx /var/ftp/pub
```



#### 注意事项

- FTP的根目录不允许有写权限，否则无法登录
- 不能给FTP根目录写权限，只能级子目录写权限，否则报如下错误：

```sh
# ftp 10.0.0.8
Connected to 10.0.0.8 (10.0.0.8).
220 (vsFTPd 3.0.3)
Name (10.0.0.8:root): ftp
331 Please specify the password.
Password:
500 OOPS: vsftpd: refusing to run with writable root inside chroot()
Login failed.
421 Service not available, remote server has closed connection





500 OOPS: vsftpd: refusing to run with writable root inside chroot()

```

- 真实遇到的，为根目录添加acl权限后报错

```sh
# getfacl /usr/local/share/ftp_root/
getfacl: Removing leading '/' from absolute path names
# file: usr/local/share/ftp_root/
# owner: root
# group: root
user::rwx
group::r-x
other::r-x




root@dark-host-3:~# setfacl -m u:ftp:rwx /usr/local/share/ftp_root/


root@dark-host-3:~# getfacl /usr/local/share/ftp_root/
getfacl: Removing leading '/' from absolute path names
# file: usr/local/share/ftp_root/
# owner: root
# group: root
user::rwx
user:ftp:rwx
group::r-x
mask::rwx
other::r-x


[root@office-a-host-3 ~]# ftp 172.16.66.202
Connected to 172.16.66.202 (172.16.66.202).
220 (vsFTPd 3.0.3)
Name (172.16.66.202:root): ftp  
331 Please specify the password.
Password:
500 OOPS: vsftpd: refusing to run with writable root inside chroot()
Login failed.
421 Service not available, remote server has closed connection

```



### 允许匿名用户在根上传文件

默认情况下，FTP服务器通常会限制匿名用户在根目录下上传文件的权限，这是出于安全考虑的。然而，如果您确实需要允许匿名用户在FTP根目录下上传文件，可以尝试以下方法：

1. 修改FTP服务器配置：找到并编辑FTP服务器的配置文件，例如`vsftpd.conf`。在该文件中搜索并找到 `chroot_local_user` 选项，并将其设置为 `NO`，即 `chroot_local_user=NO`。这将允许匿名用户在FTP根目录下进行文件上传。
2. 检查目录权限：确保FTP根目录具有适当的权限，以允许匿名用户进行写入操作。您可以使用 `ls -ld <FTP根目录路径>` 命令来查看目录的权限设置，并使用 `chmod` 命令进行必要的更改。请谨慎设置权限，以确保安全性和适当的访问控制。

请注意，允许匿名用户在FTP根目录下上传文件可能会带来安全风险。请确保您了解潜在的风险，并采取适当的安全措施，例如限制上传文件的大小和类型，以及监控FTP服务器的活动。

在进行任何更改之前，请确保您具有适当的权限和备份，并在实施更改后进行测试和安全评估。

**还要为根目录设置acl权限：**

```sh
# getfacl /usr/local/share/ftp_root/
getfacl: Removing leading '/' from absolute path names
# file: usr/local/share/ftp_root/
# owner: root
# group: root
user::rwx
group::r-x
other::r-x




root@dark-host-3:~# setfacl -m u:ftp:rwx /usr/local/share/ftp_root/


root@dark-host-3:~# getfacl /usr/local/share/ftp_root/
getfacl: Removing leading '/' from absolute path names
# file: usr/local/share/ftp_root/
# owner: root
# group: root
user::rwx
user:ftp:rwx
group::r-x
mask::rwx
other::r-x


[root@office-a-host-3 ~]# ftp 172.16.66.202
Connected to 172.16.66.202 (172.16.66.202).
220 (vsFTPd 3.0.3)
Name (172.16.66.202:root): ftp  
331 Please specify the password.
Password:
500 OOPS: vsftpd: refusing to run with writable root inside chroot()
Login failed.
421 Service not available, remote server has closed connection

```



当您在配置vsftpd时遇到 "500 OOPS: vsftpd: refusing to run with writable root inside chroot()" 错误消息时，这表示vsftpd不允许在chroot环境中使用可写的根目录。

这个错误是出于安全性考虑而设计的，以防止潜在的安全漏洞。chroot是一种安全机制，它限制了FTP用户的访问范围，将其限制在FTP根目录中。因此，vsftpd禁止在chroot环境中将根目录设置为可写入的状态。

如果您需要允许用户在FTP根目录下上传文件，有几种可行的解决方案：

1. 创建一个单独的子目录：为匿名用户或特定用户创建一个专门的子目录，并将其设置为可写入状态。例如，可以在FTP根目录下创建一个名为 "upload" 的目录，并将其权限设置为可写入。
2. 使用虚拟用户：考虑使用虚拟用户来管理FTP访问权限。虚拟用户是与实际系统用户分离的FTP用户，您可以单独为这些用户设置根目录和权限。通过这种方式，您可以将虚拟用户的根目录设置为可写入的状态，而不影响实际系统用户的安全性。

请注意，在进行任何更改之前，请确保您具备必要的安全知识，并了解潜在的风险。确保按照最佳实践和安全建议来配置您的FTP服务器。



## Linux系统用户登录相关





# PAM模块实现用户访问控制

```bash
pam_service_name=vsftpd
pam配置文件:/etc/pam.d/vsftpd
/etc/vsftpd/ftpusers  # 默认文件中用户拒绝登录，默认是黑名单，但也可以是白名单
```



# 实现基于SSL的FTPS

```bash
#查看是否支持SSL
ldd `which vsftpd` #查看到libssl.so
[root@centos8 ~]#ldd `which vsftpd`|grep libssl
libssl.so.1.1 => /lib64/libssl.so.1.1 (0x00007f8878e2c000)

#实现

#CentOS 7 上可以实现直接生成一个包括私钥和证书的文件
[root@centos7 ~]#mkdir /etc/vsftpd/ssl
[root@centos7 ~]#cd /etc/pki/tls/certs/
[root@centos7 certs]#make /etc/vsftpd/ssl/vsftpd.pem
[root@centos7 certs]#openssl x509 -in /etc/vsftpd/ssl/vsftpd.pem -noout -text
#在CentOS8上手动分别生成一个证书和私钥文件，再合并成一个文件
[root@centos8 ~]#mkdir /etc/vsftpd/ssl
[root@centos8 ~]#cd /etc/vsftpd/ssl
[root@centos8 ssl]#
openssl req -x509 -nodes -keyout vsftpd.key -out vsftpd.crt -days 365 -newkey
rsa:2048
[root@centos8 ssl]#cat vsftpd.crt vsftpd.key > vsftpd.pem

#配置vsftpd服务支持SSL：
vim /etc/vsftpd/vsftpd.conf
ssl_enable=YES #启用SSL
allow_anon_ssl=NO #匿名不支持SSL
force_local_logins_ssl=YES #本地用户登录加密
force_local_data_ssl=YES #本地用户数据传输加密
rsa_cert_file=/etc/vsftpd/ssl/vsftpd.pem #一个包括证书和私钥两个内容的文件


#重启并测试
[root@centos8 ~]#systemctl restart vsftpd
[root@centos7 ~]#ftp 192.168.100.8
Connected to 192.168.100.8 (192.168.100.8).
220-welcome to magedu
220
Name (192.168.100.8:root): wang
530 Non-anonymous sessions must use encryption.
Login failed.
421 Service not available, remote server has closed connection

#用filezilla等工具测试
```



# vsftpd 虚拟用户

**默认使用操作系统账号登录ftp有一定的安全风险，可以通过建立ftp的独立虚拟账号并只能此账号来登录，从而实现更安全的操作**

### 虚拟用户：

- 给特定服务使用的用户帐号

- 所有虚拟用户会统一映射为一个指定的系统帐号：访问共享位置，即为此系统帐号的家目录

- 各虚拟用户可被赋予不同的访问权限，通过匿名用户的权限控制参数进行指定

### 虚拟用户帐号的存储方式：

- 文件：创建文本文件，奇数行为用户名，偶数行为密码,再被编码为hash 格式Berkeley DB database文件

```
 db_load -T -t hash -f vusers.txt vusers.db
```

- 关系型数据库中的表中：实时查询数据库完成用户认证

  vsftpd 支持mysql库：pam要依赖于pam-mysql

```
/lib64/security/pam_mysql.so
/usr/share/doc/pam_mysql-0.7/README
```

###  实现基于文件验证的vsftpd虚拟用户

#### 1.创建用户数据库文件

```bash
[root@centos8 ~]#rpm -qf `which db_load`
libdb-utils-5.3.28-37.el8.x86_64
[root@centos8 ~]#yum -y install libdb-utils-5.3.28-37.el8.x86_64
[root@centos8 ~]#vim /etc/vsftpd/vusers.txt
ftp_user1
passwd1
ftp_user2
passwd2
[root@centos8 ~]#db_load -T -t hash -f /etc/vsftpd/vusers.txt 
/etc/vsftpd/vusers.db
[root@centos8 ~]#chmod 600 /etc/vsftpd/vusers.*
```

#### 2.创建用户和访问FTP目录

```bash
[root@centos8 ~]#useradd -d /data/ftproot -s /sbin/nologin -r vuser
[root@centos8 ~]#mkdir -pv /data/ftproot/upload 
[root@centos8 ~]#setfacl -m u:vuser:rwx /data/ftproot/upload
#chmod a=rx /data/ftproot/ 如果自动创建家目录，需修改权限
```

#### 3.创建pam配置文件

```bash
[root@centos8 ~]#vim /etc/pam.d/vsftpd.db
auth required pam_userdb.so db=/etc/vsftpd/vusers #此处省略了db后缀，可以不用加
account required pam_userdb.so db=/etc/vsftpd/vusers
```

#### 4.指定pam配置文件

```bash
[root@centos8 ~]#vim /etc/vsftpd/vsftpd.conf
guest_enable=YES 
guest_username=vuser
pam_service_name=vsftpd.db
```

#### 5.虚拟用户建立独立的配置文件

```bash
#指定各个用户配置文件存放的路径
[root@centos8 ~]#vim /etc/vsftpd/vsftpd.conf
user_config_dir=/etc/vsftpd/conf.d/

#创建各个用户配置文件存放的路径
[root@centos8 ~]#mkdir /etc/vsftpd/conf.d/ 

#创建各用户自已的配置文件,允许ftp_user1用户可读写，其它用户只读
[root@centos8 ~]#vim /etc/vsftpd/vusers.d/ftp_user1  
anon_upload_enable=YES
anon_mkdir_write_enable=YES
anon_other_write_enable=YES

#创建各用户自已的配置文件，并指定登录目录改变至指定的目录
[root@centos8 ~]#vim /etc/vsftpd/conf.d/ftp_user2  
local_root=/data/ftproot2
```





# 实现基于MYSQL验证的vsftpd虚拟用户

**将虚拟账号放到数据库中**

利用 pam_mysql 模块可以实现基于MySQL的FTP虚拟用户功能

项目网站：https://sourceforge.net/projects/pam-mysql/

因此项目年代久远不再更新，只支持CentOS 6,7，不支持CentOS 8





