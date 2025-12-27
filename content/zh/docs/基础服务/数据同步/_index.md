---
title: "数据同步"
---

# 数据实时同步概述

- 实现类似像MySQL一样的主从复制原理，如：将NFS共享目录的数据文件，自动实时同步到备份的服务器特定目录中

**非实时同步实现方式**

通过计划任务来定时同步，做一个计划任务：

- 在 data server 端 使用 rsync 将数据推送到 backup serve
- 或
- 在 backup server 端 使用 rsync 将 data server 的数据拉取过来

## 实时同步实现方式

1. inotify+rsync
2. sersync

## 实时同步工作原理

- 首先利用监控服务（inotify），监控 data server 上的数据变化
- 一旦发现数据变化，就利用 rsync工具 将数据推送到 backup server上





# inotify

## inotify 概述

**inotify用来监控同步数据服务器目录中信息的变化**，异步的文件系统事件监控机制，利用事件驱动机制，而无须通过诸如cron等的轮询机制来获取事件，inux内核从2.6.13起支持 inotify，通过inotify可以监控文件系统中添加、删除，修改、移动等各种事件

```bash
#查看内核是否支持inotify
grep -i inotify /boot/config-4.18.0-80.el8.x86_64 
CONFIG_INOTIFY_USER=y
```

## 实现 inotify 的软件

选其一即可

- inotify-tools

- sersync

- lrsyncd



## 实现 inotify

### 先决条件

- 查看内核是否支持
- Linux支持inotify的内核最小版本为 2.6.13，参看man 7 inotify 


```bash
#查看内核配置文件中是否启用inotify
grep -i inotify /boot/config-4.18.0-80.el8.x86_64 
CONFIG_INOTIFY_USER=y

#列出下面的文件，说明服务器内核支持inotify
[root@centos8 ~]#ls -l /proc/sys/fs/inotify   
-rw-r--r-- 1 root root 0 Dec  7 10:10 max_queued_events
-rw-r--r-- 1 root root 0 Dec  7 10:10 max_user_instances
-rw-r--r-- 1 root root 0 Dec  6 05:54 max_user_watches

[root@centos8 ~]#cat /proc/sys/fs/inotify/max_queued_events
16384 #inotify 事件队列最大长度，如值太小会出现 Event Queue Overflow 错误，默认值：16384, 生产环境建议调大,比如:327679

[root@centos8 ~]#cat /proc/sys/fs/inotify/max_user_instances
128 #每个用户创建inotify实例最大值，默认值：128

[root@centos8 ~]#cat /proc/sys/fs/inotify/max_user_watches
8192 #可以监视的文件的总数量（inotifywait 单进程），默认值：8192,建议调大
```

```bash
#永久修改以上参数
[root@data-centos8 ~]#vim /etc/sysctl.conf 
fs.inotify.max_queued_events=66666
fs.inotify.max_user_watches=100000    

[root@centos8 ~]#sysctl -p
fs.inotify.max_queued_events = 66666
fs.inotify.max_user_watches = 100000
[root@centos8 ~]#cat /proc/sys/fs/inotify/*
66666
128
100000
```

###  inotify-tools

- inotify-tools参考文档：https://github.com/rvoicilas/inotify-tools/wiki

#### inotify-tools 安装

```bash
inotify-tools # centos 和 Ubuntu 的包名，centos来自epel源
```

#### inotify-tools 主要工具

- inotifywait
  - 在被监控的文件或目录上等待特定文件系统事件（open ，close，delete等）发生，常用于实时同步的目录监控

- inotifywatch
  - 收集被监控的文件系统使用的统计数据，指文件系统事件发生的次数统计


#### inotifywait 命令说明

##### 语法

```
inotifywait [ options ] file1 [ file2 ] [ file3 ] [ ... ]
```

##### 常用选项

```bash
-m, --monitor         #始终保持事件监听
-d, --daemon          #以守护进程方式执行，和-m相似，配合-o使用
-r, --recursive       #递归监控目录数据信息变化
-q, --quiet           #输出少量事件信息
--exclude <pattern>   #指定排除文件或目录，使用扩展的正则表达式匹配的模式实现
--excludei <pattern>  #和exclude相似，不区分大小写
-o, --outfile <file>  #打印事件到文件中，相当于标准正确输出，注意：使用绝对路径
-s, --syslogOutput    #发送错误到syslog相当于标准错误输出


--timefmt <fmt>       #指定时间输出格式，参考 man 3 strftime
          %Y #年份信息，包含世纪信息
          %y #年份信息，不包括世纪信息
          %m #显示月份，范围 01-12
          %d #每月的第几天，范围是 01-31
          %H #小时信息，使用 24小时制，范围 00-23
          %M #分钟，范围 00-59
          %S #秒，范例 0-60
          # 范例：
          --timefmt "%Y-%m-%d %H:%M:%S"


--format <fmt>        #指定的输出格式；即实际监控输出内容
         %T #输出时间格式中定义的时间格式信息，通过 --timefmt option 语法格式指定时间信息
         %w #事件出现时，监控文件或目录的名称信息，相当于dirname
         %f #事件出现时，将显示监控目录下触发事件的文件或目录信息，否则为空，相当于basename
         %e #显示发生的事件信息，不同的事件默认用逗号分隔
         %Xe #显示发生的事件信息，不同的事件指定用X进行分隔
         # 范例：
         --format "%T %w%f event: %;e"
         --format '%T %w %f'


-e      <option>         #指定监听指定的事件，如果省略，表示所有事件都进行监听
         create          #文件或目录创建
         delete          #文件或目录被删除
         modify          #文件或目录内容被写入
         attrib          #文件或目录属性改变
         close_write     #文件或目录关闭，在写入模式打开之后关闭的
         close_nowrite   #文件或目录关闭，在只读模式打开之后关闭的
         close           #文件或目录关闭，不管读或是写模式
         open            #文件或目录被打开
         lsdir           #浏览目录内容
         moved_to        #文件或目录被移动到监控的目录中
         moved_from      #文件或目录从监控的目录中被移动
         move            #文件或目录不管移动到或是移出监控目录都触发事件
         access          #文件或目录内容被读取
         delete_self     #文件或目录被删除，目录本身被删除
         unmount         #取消挂载
         # 范例：
         -e create,delete,moved_to,close_write, attrib
```

#### 范例：使用 inotifywait 

```bash
#监控一次性事件
# inotifywait /data/www
Setting up watches.
Watches established.
/data/www/ CREATE f1.txt

#持续前台监控
# inotifywait -mrq /data/www --exclude=".*\.swx$|.*\.swp$"
/data/www/ OPEN f1.txt
/data/www/ ACCESS f1.txt
/data/www/ CLOSE_NOWRITE,CLOSE f1.txt

#持续后台监控，并记录日志
# inotifywait -o /var/log/inotify.log -drq /data/www --timefmt "%Y-%m-%d %H:%M:%S" --format "%T %w%f event: %e"

#持续前台监控特定事件
# inotifywait -mrq /data/www --timefmt "%F %H:%M:%S" --format "%T %w%f event: %;e" -e create,delete,moved_to,close_write,attrib
```



# rsync

## rsync 概述

- rsync 可以用于数据同步，并且还支持增量形式的同步
- rsync 配合任务计划，rsync能实现定时或间隔同步，
- rsync 配合 inotify 或 sersync，可以实现触发式的实时数据同步
- rsync 除了基于 ssh 协议来实现远程同步外，也可以使用自己专有的端口(873/TCP)来实现远程同步
- rsync 既可当客户端，也可以当服务器端
- rsync 官网：http://rsync.samba.org/



## rsync 安装

```bash
rsync # centos 和 Ubuntu 的包名

# 以服务的方式运行需要启动服务
systemctl enable --now rsync
```



## rsync 相关文件

```bash
/usr/share/doc/rsync/examples/rsyncd.conf # 配置文件模板

/etc/rsyncd.conf  # 配置文件实际需存放的路径

/usr/lib/systemd/system/rsyncd.service # 服务文件
```



## rsync 配置文件说明





## rsync 的三种工作方式 和 命令格式

**本地文件系统上实现同步**

- ```bash
  rsync [OPTION...] SRC... [DEST]
  ```

**本地主机使用远程shell和远程主机通信**

- ```bash
  # Pull: 
  rsync [OPTION...] [USER@]HOST:SRC... [DEST]
  
  # Push: 
  rsync [OPTION...] SRC... [USER@]HOST:DEST
  ```

**本地主机通过网络套接字连接远程主机上的rsync daemon**（让远程主机上运行rsyncd服务，使其监听在一个端口上，等待客户端的连接。）

- ```bash
  # Pull: 
  rsync [OPTION...] [USER@]HOST::SRC... [DEST]
  rsync [OPTION...] rsync://[USER@]HOST[:PORT]/SRC... [DEST]
  
  # Push:
  rsync [OPTION...] SRC... [USER@]HOST::DEST
  rsync [OPTION...] SRC... rsync://[USER@]HOST[:PORT]/DEST
  
  # : 表示使用ssh协议
  # :: 表示使用rsync专用协议873/TCP
  The ':' usages connect via remote shell, while '::' & 'rsync://' usages connect
  to an rsync daemon, and require SRC or DEST to start with a module name.
  ```

## rsync 的常见选项

```bash
-v #显示rsync过程中详细信息。可以使用"-vvvv"获取更详细信息。
-P #显示文件传输的进度信息。(实际上"-P"="--partial --progress"，其中的"--progress"才是显示进度信息的)。
-n --dry-run #仅测试传输，而不实际传输。常和"-vvvv"配合使用来查看rsync是如何工作的。
-a --archive #归档模式，表示递归传输并保持文件属性。等同于"-rtopgDl"。
-r --recursive #递归到目录中去。
-t --times #保持mtime属性。强烈建议任何时候都加上"-t"，否则目标文件mtime会设置为系统时间，导致下次更新检查出mtime不同从而导致增量传输无效。
-o --owner #保持owner属性(属主)。
-g --group #保持group属性(属组)。
-p --perms #保持perms属性(权限，不包括特殊权限)。
-D #是"--device --specials"选项的组合，即也拷贝设备文件和特殊文件。
-l --links #如果文件是软链接文件，则拷贝软链接本身而非软链接所指向的对象
-z #传输时进行压缩提高效率
-R --relative #使用相对路径。意味着将命令行中指定的全路径而非路径最尾部的文件名发送给服务端，包括它们的属性。用法见下文示例。
--size-only #默认算法是检查文件大小和mtime不同的文件，使用此选项将只检查文件大小。
-u --update #仅在源mtime比目标已存在文件的mtime新时才拷贝。注意，该选项是接收端判断的，不会影响删除行为。
-d --dirs #以不递归的方式拷贝目录本身。默认递归时，如果源为"dir1/file1"，则不会拷贝dir1目录，使用该选项将拷贝dir1但不拷贝file1。
--max-size #限制rsync传输的最大文件大小。可以使用单位后缀，还可以是一个小数值(例如："--max-size=1.5m")
--min-size #限制rsync传输的最小文件大小。这可以用于禁止传输小文件或那些垃圾文件。
--exclude #指定排除规则来排除不需要传输的文件。
--delete #以SRC为主，对DEST进行同步。多则删之，少则补之。注意"--delete"是在接收端执行的，所以它是在exclude/include规则生效之后才执行的。
-b --backup #对目标上已存在的文件做一个备份，备份的文件名后默认使用"~"做后缀。
--backup-dir #指定备份文件的保存路径。不指定时默认和待备份文件保存在同一目录下。
-e #指定所要使用的远程shell程序，默认为ssh。
--port #连接daemon时使用的端口号，默认为873端口。
--password-file #daemon模式时的密码文件，可以从中读取密码实现非交互式。注意，这不是远程shell认证的密码，而是rsync模块认证的密码。
-W --whole-file #rsync将不再使用增量传输，而是全量传输。在网络带宽高于磁盘带宽时，该选项比增量传输更高效。
--existing #要求只更新目标端已存在的文件，目标端还不存在的文件不传输。注意，使用相对路径时如果上层目录不存在也不会传输。
--ignore-existing #要求只更新目标端不存在的文件。和"--existing"结合使用有特殊功能，见下文示例。
--remove-source-files #要求删除源端已经成功传输的文件
```



## 范例：两种配置格式访问 rsync daemon 服务

### 不安全的实现方式

- 这种方式虽然配置简单，但有一个很大的问题 那就是任何人都可以直接使用rsync来推送和拉取服务端的共享文件 且**不需要任何验证** 所以**不建议使用**

```bash
#在备份服务器启动 rsync 进程
[root@backup-centos8 ~]#rsync --daemon
Failed to parse config file: /etc/rsyncd.conf #需要有相应配置文件才能实现以独立服务方式运行
[root@backup-centos8 ~]#touch /etc/rsyncd.conf
[root@backup-centos8 ~]#rsync --daemon
[root@backup-centos8 ~]#ss -ntlp|grep rsync
LISTEN   0         5                   0.0.0.0:873              0.0.0.0:*       
users:(("rsync",pid=2921,fd=4))  
LISTEN   0         5                     [::]:873                 [::]:*       
users:(("rsync",pid=2921,fd=5))  

#配置文件内容
[root@backup-centos8 ~]#cat /etc/rsyncd.conf
[backup] #指定共享资源的名称
path = /data/backup/ #代表此文件夹对外共享
read only = no  #指定可读写,默认只读
#修改完配置文件后需执行rsync --daemon来使配置文件生效

#指定目录给nobody权限，默认用户以nobody访问此目录
[root@backup-centos8 ~]#setfacl -m u:nobody:rwx /data/backup/
   
#查看rsync服务器的模块名称
[root@data-centos8 ~]#rsync rsync://10.0.0.8
backup
[root@data-centos8 ~]#rsync 10.0.0.8::
backup #服务端配置文件中括号内的信息

#访问rsync服务器的共享目录
[root@data-centos8 ~]#rsync /etc/networks   root@backup-server::backup
[root@data-centos8 ~]#rsync /etc/shells   rsync://root@backup-server/backup
[root@data-server ~]#rsync 10.0.0.18::backup/* /opt
[root@data-server ~]#rsync   rsync://10.0.0.18/backup/* /mnt
```

### 安全的方式

- 增加验证功能，来实现数据的安全传输

```bash
[root@backup-centos8 ~]#dnf install rsync-daemon

#创建rsync服务器的配置文件
[root@centos8 ~]#vi /etc/rsyncd.conf
uid = root   #提定以哪个用户来访问共享目录，将之指定为生成的文件所有者，默认为nobody
gid = root   #默认为nobody
#port = 874 可指定非标准端口,默认873/tcp
#use chroot = no
max connections = 0
ignore errors
exclude = lost+found/
log file = /var/log/rsyncd.log
pid file = /var/run/rsyncd.pid
lock file = /var/run/rsyncd.lock
reverse lookup = no
#hosts allow = 10.0.0.0/24
[backup]  #每个模块名对应一个不同的path目录，如果同名后面模块生效
path = /data/backup/  
comment = backup dir #备份服务器目录的简要说明
read only = no     #默认是yes,即只读
auth users = rsyncuser  #只有rsyncuser用户才能访问，默认anonymous可以访问rsync服务器
secrets file = /etc/rsync.pas #和rsyncuser用户配套的密码文件存放位置

#服务器端准备目录
[root@backup-centos8 ~]#mkdir -pv /data/backup

#服务器端生成验证文件
[root@backup-centos8 ~]#echo "rsyncuser:jtwmy" > /etc/rsync.pas
[root@backup-centos8 ~]#chmod 600 /etc/rsync.pas

#服务器端启动rsync服务
[root@backup-centos8 ~]#rsync --daemon #可加入/etc/rc.d/rc.local实现开机启动
[root@backup-centos8 ~]#systemctl enable --now rsyncd  #CentOS 7 以上版本

#客户端配置密码文件
#也可将密码赋值给环境变量RSYNC_PASSWORD变量,但不安全；export RSYNC_PASSWORD=jtwmy
[root@data-centos8 ~]#echo "jtwmy" > /etc/rsync.pas
[root@data-centos8 ~]#chmod 600 /etc/rsync.pas   #此为必要项,权限必须修改

#查看远程rsync服务器的模块信息
[root@data-server ~]#rsync   rsync://10.0.0.18
backup         backup dir
#查看具体模块内的文件需要验证
[root@data-server ~]#rsync   rsync://10.0.0.18/backup
Password: 

--------------------------------------------------------------------------
#客户端测试同步数据
#以客户端为基准，同步数据到服务端
[root@data-centos8 ~]#rsync -avz --delete --password-file=/etc/rsync.pas  /data/www/ rsyncuser@rsync服务器IP::backup 
#以服务端为基准，同步数据到客户端
[root@data-centos8 ~]#rsync -avz --delete --password-file=/etc/rsync.pas rsyncuser@rsync服务器IP::backup   /data/www/
```

## rsync 问题汇总

- **data-server端无法向 backup-server端 同步数据**
  - data-server端报错：@ERROR: chroot failed
  - backup-server 端日志报错：rsync: chroot /data/backup/   failed: No such file or directory (2)
  - 解决方法：删除 backup-server 端配置文件 /etc/rsyncd.conf 中 path = /data/backup/ 最后的空格







# inotify+rsync 实现实时数据同步

## 工作原理

- inotify 负责对同步数据目录信息的监控
- rsync 负责对数据的同步
- 最后利用脚本将两者进行结合
- **inotify和rsync客户端放在数据服务器中，rsync服务端放在备份服务器中**

## 缺点

**inotify最大的不足是会产生重复事件，或者同一个目录下多个文件的操作会产生多个事件**，例如，当监控目录中有5个文件时，删除目录时会产生6个监控事件，从而**导致重复调用rsync命令**。比如：vim文件时，inotify会监控到临时文件的事件，但这些事件相对于rsync来说是不应该被监控的

## 同步实现

```bash
#优化内核参数
[root@data-centos8 ~]# echo 50000000 > /proc/sys/fs/inotify/max_user_watches
[root@data-centos8 ~]# echo 327679 > /proc/sys/fs/inotify/max_queued_events


#数据端脚本
[root@data-centos8 ~]#vim inotify_rsync.sh
#!/bin/bash
SRC='/data/www/'
DEST='rsyncuser@rsync服务器IP::backup'
rpm -q rsync &> /dev/null || yum -y install rsync
inotifywait  -mrq  --exclude=".*\.swp" --timefmt '%Y-%m-%d %H:%M:%S' --format
'%T %w %f' -e create,delete,moved_to,close_write,attrib ${SRC} |while read DATE 
TIME DIR FILE;do
        FILEPATH=${DIR}${FILE}
       rsync -az --delete  --password-file=/etc/rsync.pas $SRC $DEST && echo
"At ${TIME} on ${DATE}, file $FILEPATH was backuped up via rsync" >> 
/var/log/changelist.log
done

#测试并查看文件传输日志
[root@data-centos8 ~]# bash inotify_rsync.sh
[root@data-centos8 ~]#tail -f /var/log/changelist.log


------------------------------------------------------------------------
#测试OK script
[root@data-server ~]# vim inotify_rsync.sh
#!/bin/bash
SRC='/data/www/'
DEST='rsyncuser@10.0.0.18::backup'
rpm -q rsync &> /dev/null || yum -y install rsync
inotifywait -mrq --exclude=".*\.swp" --timefmt '%Y-%m-%d %H:%M:%S' --format '%T %w %f' -e create,delete,moved_to,close_write,attrib ${SRC} | while read DATE TIME DIR FILE;do
    FILEPATH=${DIR}${FILE}
    rsync -az --delete --password-file=/etc/rsync.pas $SRC $DEST && echo "At ${TIME} on ${DATE}, file $FILEPATH was backuped up via rsync" >> /var/log/changelist.log
done
```



## 实现开机自动运行

```
[root@data-server ~]# pwd
/root
[root@data-server ~]# mkdir script
[root@data-server ~]# mv inotify_rsync.sh script/
[root@data-server ~]# chmod +x script/inotify_rsync.sh 
[root@data-server ~]# vim /etc/rc.d/rc.local 
...
/root/script/inotify_rsync.sh
...
[root@data-server ~]# chmod +x /etc/rc.d/rc.local
```







#  sersync 实现实时数据同步

- sersync 基于 inotify 进行了二次研发 功能更强大 性能更好


- sersync下载地址：https://code.google.com/archive/p/sersync/downloads

## 基于 rsync daemon 实现

### 数据端配置

```bash
#将二进制包接压缩并移动到相应的目录中
[root@data-centos8 ~]$ll
total 712
-rw-r--r-- 1 root root 727290 May 17 12:39 sersync2.5.4_64bit_binary_stable_final.tar.gz
[root@data-centos8 ~]$tar xvf sersync2.5.4_64bit_binary_stable_final.tar.gz 
GNU-Linux-x86/
GNU-Linux-x86/sersync2
GNU-Linux-x86/confxml.xml
[root@data-centos8 ~]$mv GNU-Linux-x86/sersync2 /usr/sbin/
[root@data-centos8 ~]$mkdir /etc/sersync
[root@data-centos8 ~]$mv GNU-Linux-x86/confxml.xml /etc/sersync/

#确认安装rsync工具
[root@data-centos8 ~]#rpm -q rsync &> /dev/null || dnf -y install rsync

#将sersync配置文件备份
[root@data-centos8 ~]#cp /etc/sersync/confxml.xml{,.bak}

#修改sersync配置文件
[root@data-centos8 ~]#vim /etc/sersync/confxml.xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<head version="2.5">
   <host hostip="localhost" port="8008"></host>
   <debug start="false"/> # 是否开启调试模式
   <fileSystem xfs="false"/> 
   <filter start="false"> #不开启文件过滤功能，当为true时,以下类型的文件将不同步
 <exclude expression="(.*)\.svn"></exclude>
 <exclude expression="(.*)\.gz"></exclude>
 <exclude expression="^info/*"></exclude>
 <exclude expression="^static/*"></exclude>
   </filter>
   <inotify> #inotify的配置段，监控事件
delete/close_write/moved_from/moved_to/create folder
 <delete start="true"/>
  <createFolder start="true"/>
 <createFile start="false"/>
 <closeWrite start="true"/>
 <moveFrom start="true"/>
 <moveTo start="true"/>
 <attrib start="true"/>  #修改此行为true，文件属性变化后也会同步
 <modify start="false"/>
   </inotify>
   <sersync>  # rsync命令的配置段
 <localpath watch="/data/www"> #修改此行,需要同步的源目录或文件，建议同步目录
   <remote ip="备份服务器IP" name="backup"/>  #修改此行,指定备份服务器地址和rsync daemon的模块名，backup名来自rsync服务端中括号里的名称，
   #如果下面开启了ssh start，此时name为远程shell方式运行时的目标目录
   <!--<remote ip="192.168.8.39" name="tongbu"/>--> 
   <!--<remote ip="192.168.8.40" name="tongbu"/>-->
 </localpath>
 <rsync> 
   <commonParams params="-artuz"/>  # 指定rsync选项
   <auth start="true" users="rsyncuser" passwordfile="/etc/rsync.pas"/> #修改此行,修改为true,指定备份服务器的rsync配置的用户和密码文件
   <userDefinedPort start="false" port="874"/><!-- port=874 -->#指定rsync的非标准端口号，如使用默认873端口则无需修改
   <timeout start="false" time="100"/><!-- timeout=100 -->
   <ssh start="false"/> #默认使用rsync daemon运行rsync命令,true为使用远程shell模式
 </rsync>
 <failLog path="/tmp/rsync_fail_log.sh" timeToExecute="60"/><!--default every 
60mins execute once-->                  #错误重传及日志文件路径
 <crontab start="false" schedule="600"><!--600mins--> #不开启crontab功能
   <crontabfilter start="false">  #不开启crontab定时传输的筛选功能
 <exclude expression="*.php"></exclude>
 <exclude expression="info/*"></exclude>
   </crontabfilter>
 </crontab>
 <plugin start="false" name="command"/>
   </sersync>
#####################################以下行不需要修改
####################################
   <plugin name="command">
 <param prefix="/bin/sh" suffix="" ignoreError="true"/> <!--prefix 
/opt/tongbu/mmm.sh suffix-->
 <filter start="false">
   <include expression="(.*)\.php"/>
   <include expression="(.*)\.sh"/>
 </filter>
   </plugin>
   <plugin name="socket">
 <localpath watch="/opt/tongbu">
   <deshost ip="192.168.138.20" port="8009"/>
 </localpath>
   </plugin>
   <plugin name="refreshCDN">
 <localpath watch="/data0/htdocs/cms.xoyo.com/site/">
   <cdninfo domainname="ccms.chinacache.com" port="80" username="xxxx"
passwd="xxxx"/>
   <sendurl base="http://pic.xoyo.com/cms"/>
      <regexurl regex="false" match="cms.xoyo.com/site([/a-zA-Z0-9]*).xoyo.com/images"/>
 </localpath>
   </plugin>
</head>

#创建连接rsynd服务器的用户密码文件,并必须修改权限
[root@data-centos8 ~]#echo jtwmy > /etc/rsync.pas
[root@data-centos8 ~]#chmod 600 /etc/rsync.pas

#查看帮助
[root@data-centos8 ~]#sersync2 -h
set the system param
execute：echo 50000000 > /proc/sys/fs/inotify/max_user_watches
execute：echo 327679 > /proc/sys/fs/inotify/max_queued_events
parse the command param
_______________________________________________________
参数-d:启用守护进程模式
参数-r:在监控前，将监控目录与远程主机用rsync命令推送一遍
参数-n: 指定开启守护线程的数量，默认为10个
参数-o:指定配置文件，默认使用当前工作目录下的confxml.xml文件
参数-m:单独启用其他模块，使用 -m refreshCDN 开启刷新CDN模块
参数-m:单独启用其他模块，使用 -m socket 开启socket模块
参数-m:单独启用其他模块，使用 -m http 开启http模块
不加-m参数，则默认执行同步程序

#以后台方式执行同步
[root@data-centos8 ~]#sersync2 -dro /etc/sersync/confxml.xml

#如果同步失败,可以手动执行下面命令,观察过程
[root@data-centos8 ~]# cd /data/www && rsync -artuz -R --delete ./ rsyncuser@backup-server::backup --password-file=/etc/rsync.pas >/dev/null 2>&1 
run the sersync: 
watch path is: /data/www

#sersync支持多实例，也即监控多个目录时，只需分别配置不同配置文件，然后使用sersync2指定对应配置文件运行
[root@data-centos8 ~]#sersync2 -rd -o /etc/sersync.d/nginx.xml

#实现开机自动运行
[root@data-server ~]# which sersync2
/usr/bin/sersync2
[root@data-server ~]# vim /etc/rc.d/rc.local
...
/usr/bin/sersync2 -dro /etc/sersync/confxml.xml
...
[root@data-server ~]# chmod +x /etc/rc.d/rc.local
```

### 备份服务器端配置

```bash
#安装rsync工具 和 rsync-daemon 包
[root@backup-server ~]# yum -y install rsync rsync-daemon

#修改配置文件
[root@backup-server ~]# vim /etc/rsyncd.conf 
uid = root
gid = root
max connections = 0
ignore errors
exclude = lost+found/
log file = /var/log/rsyncd.log
pid file = /var/run/rsyncd.pid
lock file = /var/run/rsyncd.lock
reverse lookup = no

[backup]
path = /data/backup/
comment = backup dir
read only = no
auth users = rsyncuser
secrets file = /etc/rsync.pas

#启动 rsync-daemon 守护进程
[root@backup-server ~]# systemctl enable --now rsyncd
```







## 基于远程 shell 实现

### 数据端配置

```bash
#配置和backup-server端的基于key验证
[root@data-centos8 ~]#ssh-keygen 
[root@data-centos8 ~]#ssh-copy-id backup-server

#下载sersync，并拷贝至相应的目录
[root@data-centos8 ~]$tar xvf sersync2.5.4_64bit_binary_stable_final.tar.gz 
GNU-Linux-x86/
GNU-Linux-x86/sersync2
GNU-Linux-x86/confxml.xml
[root@data-centos8 ~]$mv GNU-Linux-x86/sersync2 /usr/sbin/
[root@data-centos8 ~]$mkdir /etc/sersync
[root@data-centos8 ~]$mv GNU-Linux-x86/confxml.xml /etc/sersync/


#修改sersync配置文件
[root@data-centos8 ~]#cat /etc/sersync/confxml.xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<head version="2.5">
   <host hostip="localhost" port="8008"></host>
   <debug start="false"/>
   <fileSystem xfs="false"/>
   <filter start="false">
 <exclude expression="(.*)\.svn"></exclude>
 <exclude expression="(.*)\.gz"></exclude>
 <exclude expression="^info/*"></exclude>
 <exclude expression="^static/*"></exclude>
   </filter>
   <inotify>
 <delete start="true"/>
 <createFolder start="true"/>
 <createFile start="false"/>
 <closeWrite start="true"/>
 <moveFrom start="true"/>
 <moveTo start="true"/>
 <attrib start="true"/>  #修改此行为true
 <modify start="false"/>
   </inotify>
   <sersync>
 <localpath watch="/data/www"> #修改此行,指定源数据目录
   <remote ip="备份服务器IP" name="/data/backup"/> #*必须修改此行指定备份服务器地址和备份目标目录
   <!--<remote ip="192.168.8.39" name="tongbu"/>-->
   <!--<remote ip="192.168.8.40" name="tongbu"/>-->
 </localpath>
 <rsync>
   <commonParams params="-artuz"/>
   <auth start="false" users="root" passwordfile="/etc/rsync.pas"/> #*必须修改此行,不启用认证
   <userDefinedPort start="false" port="874"/><!-- port=874 -->
   <timeout start="false" time="100"/><!-- timeout=100 -->
   <ssh start="true"/> #*必须修改此行为true,使用远程shell方式的rsync连接方式，无需在目标主机上配置启动rsync daemon服务
#####################################以下行不需要修改
####################################
 </rsync>
 <failLog path="/tmp/rsync_fail_log.sh" timeToExecute="60"/><!--default every 
60mins execute once-->
 <crontab start="false" schedule="600"><!--600mins-->
   <crontabfilter start="false">
 <exclude expression="*.php"></exclude>
 <exclude expression="info/*"></exclude>
   </crontabfilter>
 </crontab>
 <plugin start="false" name="command"/>
   </sersync>
#将中间的行可以删除
</head>
...


#开启sersync
[root@data-centos8 ~]#sersync2 -dro /etc/sersync/confxml.xml

#实现开机自动运行
[root@data-server ~]# which sersync2
/usr/bin/sersync2
[root@data-server ~]# vim /etc/rc.d/rc.local
...
/usr/bin/sersync2 -dro /etc/sersync/confxml.xml
...
[root@data-server ~]# chmod +x /etc/rc.d/rc.local

#实现开机自动运行后重启后观察，
[root@data-server ~]# pstree -p
systemd(1)─┬─NetworkManager(729)─┬─{NetworkManager}(743)
           │                     └─{NetworkManager}(744)
...
           ├─sersync2(758)─┬─{sersync2}(769)
           │               ├─{sersync2}(770)
           │               ├─{sersync2}(771)
           │               ├─{sersync2}(772)
           │               ├─{sersync2}(773)
           │               ├─{sersync2}(774)
           │               ├─{sersync2}(775)
           │               ├─{sersync2}(776)
           │               ├─{sersync2}(777)
           │               ├─{sersync2}(778)
           │               └─{sersync2}(779)
...
```

### 备份服务器端配置

```bash
#安装rsync
[root@backup-server ~]# yum -y install rsync
或
[root@backup-server ~]# rpm -i https://mirrors.tuna.tsinghua.edu.cn/centos/8/BaseOS/x86_64/os/Packages/rsync-3.1.3-12.el8.x86_64.rpm

#备份目录
[root@backup-server ~]# mkdir -p /data/backup
```

