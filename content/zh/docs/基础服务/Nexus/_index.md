---
title: "私有仓库 Nexus"
---

# 前言

nexus官网：

- https://help.sonatype.com/repomanager3
- https://help.sonatype.com/repomanager3/product-information/download

阿里云云效制品仓库：https://www.aliyun.com/product/yunxiao/





# nexus 概述

Nexus就是著名的制品库服务之一

nexus 是一个强大的仓库管理器，可以实现maven、apt、yum等仓库的代理以及缓存，它极大的简化了企业内部仓库的维护和外部仓库的访问

**创建储存库时 group hosted proxy 的区别**

- **hosted** 本地仓库，通常我们会部署自己的构建到这一类仓库，比如公司的第三方仓库
- **proxy** 代理仓库，**常用**，它们被用来代理远程的公共仓库，如maven官方仓库等
- **group** 仓库组，用来合并多个 hosted/proxy 仓库，当你的项目希望在多个 repository 使用资源时就不需要多次引用了，只需要引用一个 group 即可





# nexus 单机部署

## 先决条件

参考链接：https://help.sonatype.com/repomanager3/product-information/system-requirements

- 内存最低要求4G
- 调大 limit文件硬限制、软限制等



## 前期准备

### 存储空间

准备单独的数据存放空间

- **准备新的磁盘**

```bash
# 准备一块300G的硬盘，生产中通常需要1T以上的容量
# lsblk /dev/sdb 
NAME MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sdb    8:16   0  300G  0 disk
```

- **创建分区**

```bash
# fdisk /dev/sdb
Command (m for help): n # 添加一个新分区
...
Select (default p): p # 只创建一个主分区
Partition number (1-4, default 1): 
First sector (2048-629145599, default 2048):  # 分区起点
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-629145599, default 629145599): # 分区终点，将整块硬盘的空间都分配到一个分区中

Created a new partition 1 of type 'Linux' and of size 300 GiB.

Command (m for help): p
Disk /dev/sdb: 300 GiB, 322122547200 bytes, 629145600 sectors
Disk model: VMware Virtual S
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xd46ebab9

Device     Boot Start       End   Sectors  Size Id Type
/dev/sdb1        2048 629145599 629143552  300G 83 Linux

Command (m for help): w # 写入
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

- **创建文件系统**

```bash
# mkfs.ext4 /dev/sdb1
```

- **挂载**

```bash
# 创建数据存放目录
# mkdir /data


# 获取挂载点的UUID 方法一
# lsblk -f /dev/sdb1 
NAME FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT
sdb1 ext4         4acb5a8f-4da7-4e85-8cd2-77eda28c9368 


# 获取挂载点的UUID 方法二
# ll /dev/disk/by-uuid
...
lrwxrwxrwx 1 root root  10 Jun 15 19:25 4acb5a8f-4da7-4e85-8cd2-77eda28c9368 -> ../../sdb1


# 挂载
# vim /etc/fstab
...
/dev/disk/by-uuid/4acb5a8f-4da7-4e85-8cd2-77eda28c9368 /data ext4 defaults 0 0


# 同步挂载
# mount -a


# 查看结果
# df -h /dev/sdb1 
Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb1       295G   65M  280G   1% /data
```



### 安装 jdk

- Ubuntu

```sh
# apt-get install openjdk-8-jdk


# java -version
openjdk version "1.8.0_362"
OpenJDK Runtime Environment (build 1.8.0_362-8u372-ga~us1-0ubuntu1~18.04-b09)
OpenJDK 64-Bit Server VM (build 25.362-b09, mixed mode)
```



## Ubuntu

- 在 `Ubuntu 18.04.4 LTS` 上部署



# nexus 容器方式部署

参考链接：https://hub.docker.com/r/sonatype/nexus3/

## 前期准备

- 拉取nexus镜像

```sh
docker pull sonatype/nexus3

docker pull sonatype/nexus3:3.53.1
```

- 创建nexus用户（否则容器的数据将无法挂载到宿主机，因为容器上是以nexus身份运行的）

```sh
root@repo-server:~# useradd -u 200 -s /usr/sbin/nologin -r nexus

root@repo-server:~# id 200
uid=200(nexus) gid=200(nexus) groups=200(nexus)
```

- 创建数据存放目录

```sh
mkdir /data/nexus && chown -R nexus /data/nexus


# 不创建nexus用户的话，也可以直接将所有者id改为200
mkdir /data/nexus && chown -R 200 /data/nexus
```

## 运行

- -d 后台运行
- -p 容器与宿主机的端口映射策略（宿主机端口:容器内端口）
- --name 自定义容器名称
- --restart 重启策略
- -v 容器与宿主机的卷映射策略（宿主机目录:容器目录）

```sh
docker run -d \
-p 8081:8081 \
--name nexus \
--restart=always \
-v /data/nexus:/nexus-data/ \
registry.cn-hangzhou.aliyuncs.com/jamesazheng/nexus3:3.53.1
```

## 停止

- 停止时，请确保留出足够的时间让数据库完全关闭。

```sh
docker stop --time=120 <CONTAINER_NAME>
```



# 登录 nexus

- 账号为admin

```sh
# 获取密码
# cat /data/nexus/admin.password ; echo
d4f4d781-620c-4896-9f7f-2e3492fabc51
```



# nexus 构建私有仓库

## yum

### 定义

repository **-->** repositories **-->** create repository **-->** yum(proxy)

- **name** 定义一个仓库名称
  - 如：
    - yum-epel
    - yum-AppStream
    - yum-BaseOS
- **remote storage** 被代理的远程仓库的地址
  - 如：
    - https://mirrors.tuna.tsinghua.edu.cn/epel/8/Everything/x86_64/
    - https://mirrors.tuna.tsinghua.edu.cn/centos/8-stream/AppStream/x86_64/os/
    - https://mirrors.tuna.tsinghua.edu.cn/centos/8-stream/BaseOS/x86_64/os/
- **blob store** 定义存储数据的存放路径
  - 基于容器部署可以使用存储卷的方式持久化数据 然后选择default即可，二进制部署则需要创建单独的blob
  - 如：default
  
- **create repository**

### 调用

**复制生成的仓库地址**

- http://10.0.0.100:8081/repository/yum-epel/

**修改客户端yum配置文件**

```bash
# vim /etc/yum.repos.d/nexus-base.repo
[nexus-epel]
name=epel
baseurl=http://10.0.0.100:8081/repository/yum-epel/
gpgcheck=0

[nexus-AppStream]
name=AppStream
baseurl=http://10.0.0.100:8081/repository/yum-AppStream/
gpgcheck=0

[nexus-BaseOS]
name=BaseOS
baseurl=http://10.0.0.100:8081/repository/yum-BaseOS/
gpgcheck=0
```

### 测试

```bash
# yum makecache

# yum list
...

[root@58 ~]# yum info java-1.8.0-openjdk-devel
Last metadata expiration check: 0:04:12 ago on Thu 16 Jun 2022 04:40:33 AM CST.
Available Packages
Name         : java-1.8.0-openjdk-devel
Epoch        : 1
Version      : 1.8.0.322.b06
Release      : 11.el8
Architecture : x86_64
Size         : 9.8 M
Source       : java-1.8.0-openjdk-1.8.0.322.b06-11.el8.src.rpm
Repository   : nexus-AppStream #来自
Summary      : OpenJDK 8 Development Environment
URL          : http://openjdk.java.net/
License      : ASL 1.1 and ASL 2.0 and BSD and BSD with advertising and GPL+ and GPLv2 and GPLv2 with exceptions and
             : IJG and LGPLv2+ and MIT and MPLv2.0 and Public Domain and W3C and zlib
Description  : The OpenJDK 8 development tools.

[root@58 ~]# yum -y install java-1.8.0-openjdk-devel
...
Complete! #安装完成
```





## apt

### 定义

repository **-->** repositories **-->** create repository **-->** apt(proxy)

- **name** 定义一个仓库名称
  - 如：
    - apt-sources
- **distribution** 发行版本
  - 如：focal

- **remote storage** 被代理的远程仓库的地址
  - 如：http://mirrors.aliyun.com/ubuntu/
- **blob store** 定义存储数据的存放路径
  - 基于容器部署可以使用存储卷的方式持久化数据 然后选择default即可，二进制部署则需要创建单独的blob
  - 如：default
- **create repository**

### 调用

**复制生成的仓库地址**

- http://10.0.0.100:8081/repository/apt-sources/

**修改客户端apt配置文件**

```bash
#sed替换
sed -i 's#http:\/\/mirrors.aliyun.com\/ubuntu\/#http:\/\/10.0.0.100:8081\/repository\/apt-sources\/#' /etc/apt/sources.list
```

```bash
#最终结果
# cat /etc/apt/sources.list
deb http://10.0.0.100:8081/repository/apt-sources/ focal main restricted universe multiverse
deb-src http://10.0.0.100:8081/repository/apt-sources/ focal main restricted universe multiverse

deb http://10.0.0.100:8081/repository/apt-sources/ focal-security main restricted universe multiverse
deb-src http://10.0.0.100:8081/repository/apt-sources/ focal-security main restricted universe multiverse

deb http://10.0.0.100:8081/repository/apt-sources/ focal-updates main restricted universe multiverse
deb-src http://10.0.0.100:8081/repository/apt-sources/ focal-updates main restricted universe multiverse

deb http://10.0.0.100:8081/repository/apt-sources/ focal-proposed main restricted universe multiverse
deb-src http://10.0.0.100:8081/repository/apt-sources/ focal-proposed main restricted universe multiverse

deb http://10.0.0.100:8081/repository/apt-sources/ focal-backports main restricted universe multiverse
deb-src http://10.0.0.100:8081/repository/apt-sources/ focal-backports main restricted universe multiverse
root@103:~# 
```

### 测试

```bash
# yum makecache

# yum list
...

[root@58 ~]# yum info java-1.8.0-openjdk-devel
Last metadata expiration check: 0:04:12 ago on Thu 16 Jun 2022 04:40:33 AM CST.
Available Packages
Name         : java-1.8.0-openjdk-devel
Epoch        : 1
Version      : 1.8.0.322.b06
Release      : 11.el8
Architecture : x86_64
Size         : 9.8 M
Source       : java-1.8.0-openjdk-1.8.0.322.b06-11.el8.src.rpm
Repository   : nexus-AppStream #来自
Summary      : OpenJDK 8 Development Environment
URL          : http://openjdk.java.net/
License      : ASL 1.1 and ASL 2.0 and BSD and BSD with advertising and GPL+ and GPLv2 and GPLv2 with exceptions and
             : IJG and LGPLv2+ and MIT and MPLv2.0 and Public Domain and W3C and zlib
Description  : The OpenJDK 8 development tools.

[root@58 ~]# yum -y install java-1.8.0-openjdk-devel
...
Complete! #安装完成
```



## 生产环境

### centos

- 基础源：
  - Remote Storage：https://mirrors.aliyun.com/centos/ 
  - 映射为
  - URL：http://172.16.0.137:8081/repository/centos/
- epel源：
  - Remote Storage：https://mirrors.aliyun.com/epel/
  - 映射为
  - URL：http://172.16.0.137:8081/repository/epel/



### apt

apt 所有发行版均适用

- Remote Storage：https://mirrors.tuna.tsinghua.edu.cn/ubuntu/
- 映射为
- URL：http://172.16.0.137:8081/repository/ubuntu/



### pypi

- Remote Storage：https://mirrors.aliyun.com/pypi/
- 映射为
- URL：http://172.16.0.137:8081/repository/pypi/

```ini
# 持久生效
# vim ~/.pip/pip.conf
[global]
index-url = http://172.16.0.137:8081/repository/pypi/simple
trusted-host = 172.16.0.137


# 临时使用
pip3 install \
--trusted-host 172.16.0.137 \
-i http://172.16.0.137:8081/repository/pypi/simple \
sphinx sphinx-rtd-theme sphinx-autobuild recommonmark prettytable h5py pyyaml pymysql
```





# nexus 相关文件

```bash
/nexus-data/blobs/default/ # 默认安装包储存路径
```



Nexus Repository 的相关文件和目录可以根据安装方式和配置而有所不同，以下是 Nexus Repository 常见的相关文件和目录：

1. 安装目录：这是 Nexus Repository 的主要安装目录，包含 Nexus Repository 的二进制文件和其他相关文件。该目录通常命名为 "nexus" 或 "nexus-{version}"。
2. 日志目录：包含 Nexus Repository 的日志文件，用于记录运行时的事件和错误。默认情况下，日志目录位于安装目录下的 "logs" 子目录中。
3. 配置文件：包含 Nexus Repository 的配置文件，用于定义运行时的行为和属性。这些文件通常位于安装目录下的 "etc" 或 "conf" 子目录中。
4. 存储目录：用于存储上传的软件包和其他存储内容的目录。这个目录可以根据配置进行自定义，常见的默认路径是 "/nexus-data"。
   - 包储存路径：默认情况下，软件包存储在 "/nexus-data/repository" 目录下的相应存储库文件夹中。例如，Maven 存储库可能位于 "/nexus-data/repository/maven-public"。
   - 数据目录：存储 Nexus Repository 运行时的数据，包括索引、缓存、元数据等。默认情况下，数据目录位于 "/nexus-data/db" 目录下。
   - Blob 目录：存储 Nexus Repository 中的二进制大对象（Blobs），包括软件包文件和其他二进制文件。默认情况下，Blob 目录位于 "/nexus-data/blobs/default"。这个目录是存储库的实际文件存储位置。
   - 控制目录：包含 Nexus Repository 的运行时控制文件和状态信息。默认情况下，控制目录位于 "/nexus-data/control" 目录下。
   - 临时目录：用于存储 Nexus Repository 的临时文件和缓存数据。默认情况下，临时目录位于 "/nexus-data/tmp" 目录下。

请注意，上述路径仅作为示例，实际路径可能因为安装方式、操作系统和配置而有所不同。在安装和配置 Nexus Repository 时，可以根据需要进行自定义和调整。



# nexus 仓库类型

https://help.sonatype.com/repomanager3/nexus-repository-administration/repository-management

## Hosted

本地仓库，通常我们会部署自己的构件到这一类型的仓库，例如公司的第三方仓库

选择 Hosted 仓库表示你要创建一个用于本地存储和管理组件的仓库

Hosted 仓库也称为本地仓库，是用于存储和管理本地创建的组件的仓库。你可以将自己的组件上传到 Hosted 仓库，并且可以对其进行版本控制、依赖管理和发布等操作。**Hosted 仓库是一个本地存储库，可以直接上传和管理组件。**



## Proxy

代理仓库，它们被用来代理远程的公共仓库，例如maven官方仓库、阿里云、清华等官方镜像源

选择 Proxy 仓库表示你要创建一个代理远程仓库或中央存储库的仓库，以提供更快的组件访问和减轻远程仓库的负载。

Proxy 仓库用于代理远程仓库或中央存储库中的组件。当你请求一个组件时，**Proxy 仓库会尝试从远程仓库中获取该组件，并将其缓存在本地**。下次请求该组件时，Proxy 仓库会直接从本地缓存提供。这样可以提高组件的获取速度，并减轻远程仓库的负载。Proxy 仓库对于访问公共远程仓库、中央存储库或其他私有远程仓库非常有用。



## Group

仓库组，用来合并多个 hosted/proxy 仓库，当你的项目希望在多个 repository 使用资源时就不需要多次引用了，只需要引用一个 group 即可

选择 Group 仓库表示你要创建一个组合多个仓库的逻辑仓库

Group 仓库是一种逻辑上的仓库组合，用于将多个仓库组合在一起，并提供一个单一的访问点。当你向 Group 仓库请求某个组件时，它会在其包含的所有仓库中查找该组件。这对于管理多个仓库并提供统一访问的场景非常有用。**Group 仓库本身不存储实际的组件，而是将请求转发到其包含的仓库。**



# nexus 问题汇总

- **提示以下错误时 是因为实现点击了网页中的储存库健康检查功能，点击指定的存储库然后点击重建索引或使缓存无效即可**

```bash
[root@58 yum.repos.d]# yum makecache
epel                                                                                   44 kB/s | 1.7 kB     00:00    
Errors during downloading metadata for repository 'nexus-epel':
  - Status code: 404 for http://10.0.0.100:8081/repository/yum-epel/repodata/repomd.xml (IP: 10.0.0.100)
Error: Failed to download metadata for repo 'nexus-epel': Cannot download repomd.xml: Cannot download repodata/repomd.xml: All mirrors were tried
```

