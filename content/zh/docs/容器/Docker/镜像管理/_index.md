---
title: "镜像管理"
weight: 11
---

# 镜像概述

- 镜像就是创建容器所需要的模板，与容器是一对多的关系
- 镜像还可以在创建镜像时被其他镜像所调用，成为要创建镜像的父镜像
- 所有基础镜像的父镜像都为scratch，scratch是一个空的镜像 用于作为构建其他基础镜像的父镜像。
  - scratch类似于 Java 中的object（Java 中所有类的父类），也类似于系统中的systemd进程

- 镜像中主要包含基础操作系统和所需要的内容
- 镜像是由 UnionFS 联合文件系统将多层文件系统叠加而成，这个虚拟文件系统加上宿主机的内核就形成了一个完整的虚拟Linux环境
  - docker 默认的联合文件系统是 overlay2
- 镜像中的每一层都是**只读**的，镜像可以推送到docker仓库中被他人所拉取 生成容器





# 镜像 REPOSITORY

- 一个 Registry 中可以存在多个 Repository；
- Repository 可分为 "顶级仓库" 和 "用户仓库"；
  - 用户仓库名称一般格式为："用户名/仓库名"
- 每个 Repository 可以包含多个 Tag，每个 Tag 对应一个镜像



# 镜像管理相关命令：

- docker 命令有两种使用风格，以拉取镜像为例：
  - 方法一：`docker image pull nginx:1.23`
  - 方法二：`docker pull nginx:1.23`
  - 以上两种写法均可以完成对镜像的拉取操作，但方法二比较简便，因此使用较多。
- 获取帮助：
  - `docker --help`
  - `docker inspect --help`



## 不同主机快速传输镜像

```sh
# 在存在镜像的主机执行：
docker save 镜像A 镜像B 镜像X | ssh root@目标IP 'docker load'


# 方法二，在存在镜像的主机执行：
docker images | grep -E 镜像名称 | awk '{print $1":"$2}' | xargs docker save | ssh -C root@目标IP "docker load"
```

# 导出镜像

- `docker save` 可以将现有的镜像打包成tar格式的文件

```sh
#导出方法一
docker save -o /locadir/savefile.tar IMAGE1 [IMAGE2...]

#导出方法二
docker save IMAGE1 [IMAGE2...] > /locadir/savefile.tar

#导出多个镜像
docker save busybox nginx > /locadir/all.tar
或
docker save -o /locadir/all.tar busybox nginx
```

## 导出镜像并压缩

```sh
# docker images 
REPOSITORY   TAG              IMAGE ID       CREATED      SIZE
...
nginx        1.23             ac8efec875ce   7 days ago   142MB


# 正常打包后的大小
# docker save nginx:1.23 -o ./nginx:1.23.tar
# ll -h ./nginx:1.23.tar
-rw------- 1 root root 140M Dec 13 22:47 ./nginx:1.23.tar


# 压缩成gz格式
# docker save nginx:1.23 | gzip > ./nginx:1.23.tar.gz
root@gitlab-server:~# ll -h ./nginx:1.23.tar.gz
-rw-r--r-- 1 root root 53M Dec 13 22:51 ./nginx:1.23.tar.gz
# 还原镜像：
gunzip -c ./nginx:1.23.tar.gz | docker load
```

# 导入镜像

- `docker load` 可以将打包的镜像导入

```sh
# 导入镜像方法一
docker load -i /locadir/imagesfile

# 导入镜像方法二
docker load < /locadir/imagesfile
```

# 删除镜像

- `docker rmi` 可以实现删除镜像

- 镜像对应容器正在运行则不能删除，除非将对应容器全部关闭 或者 -f 强制删除
  - -f 强制删除时也会同时删除正在运行的容器


```bash
[root@docker ~]# docker images 
REPOSITORY    TAG       IMAGE ID       CREATED        SIZE
busybox       latest    beae173ccac6   2 weeks ago    1.24MB
alpine        latest    c059bfaa849c   8 weeks ago    5.59MB
hello-world   latest    feb5d9fea6a5   3 months ago   13.3kB
centos        latest    5d0da3dc9764   4 months ago   231MB

#删除镜像方法一
docker rmi centos

#删除镜像方法二
docker rmi alpine:latest

#删除多个镜像
docker rmi nginx tomcat

#删除全部镜像，慎用！
docker rmi `docker images -q`
或
docker images -q | xargs docker rmi

#批量删除<none>开头的镜像，方法一:
docker rmi $(docker images | awk '/^<none>/ { print $3 }')

#批量删除<none>开头的镜像，方法二:
docker rmi $(docker images |grep '<none>'|awk '{print $3}')
```

# 搜索镜像

- `docker search`

- 使用较少，通常都是在官方仓库官网上寻找合适的镜像
  - https://hub.docker.com/

```sh
# 搜索镜像，官方镜像在official处会显示OK
docker search imagename
```



# 下载镜像

- `docker pull [OPTIONS] NAME[:TAG|@DIGEST]`
- docker 默认下载的镜像保存于：`/var/lib/docker/overlay2/镜像ID` 目录下

```sh
#下载镜像，不指定版本则下载最新版 
docker pull alpine

#指定版本下载
docker pull alpine:6.6.6
```

**docker pull 下载镜像时提示 `Error response from daemon: Get https://172.16.0.120:30002/v2/: http: server gave HTTP response to HTTPS client` 的解决办法**

这个错误的原因可能是docker使用了https协议去访问`https://172.16.0.120:30002`，但是该服务器只支持http协议。

解决方法是在Docker守护进程中添加允许HTTP访问配置，具体操作如下：

- 使用root身份编辑`/lib/systemd/system/docker.service`文件：

```
sudo nano /lib/systemd/system/docker.service
```

- 在ExecStart行中加入`--insecure-registry`选项，并将`172.16.0.120:30002`替换为实际的仓库地址：

```
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock --insecure-registry 172.16.0.120:30002
```

- 保存修改后，重新加载systemctl配置文件并重启docker服务：

```
sudo systemctl daemon-reload

sudo systemctl restart docker.service
```

- 再次执行`docker pull`命令，应该就可以正常下载镜像了。



# 查看镜像

- ` docker images [OPTIONS] [REPOSITORY[:TAG]]`	

```sh
# 查看本机所有镜像
# docker images
REPOSITORY   TAG              IMAGE ID       CREATED      SIZE
busybox      unstable-glibc   39b7478ba37c   7 days ago   4.86MB
nginx        1.23             ac8efec875ce   8 days ago   142MB


# 输出说明
REPOSITORY # 镜像所属的仓库名称
TAG # 镜像的标签，如下载时为指定标签则默认为latest
IMAGE ID # 镜像的唯一ID标识，ID相同则表示镜像相同。因此有可能出现镜像相同而镜像名称不同的情况，但本质上是同一个镜像
CREATED # 镜像在仓库中被创建的时间
SIZE # 镜像的大小


# 查看指定REPOSITORY的镜像
# docker images nginx
REPOSITORY   TAG       IMAGE ID       CREATED      SIZE
nginx        1.23      ac8efec875ce   8 days ago   142MB
```

## 查看镜像分层历史

- 查看镜像分层历史后，还可以进入单独一层的镜像进行操作。

```sh
# docker history centos7.9.2009:v1.0 
IMAGE          CREATED         CREATED BY                                      SIZE      COMMENT
fb167ce759c8   3 minutes ago   /bin/sh -c yum makecache && yum -y install  …   495MB     
410589d1adbe   6 minutes ago   /bin/sh -c #(nop) COPY file:10bd0c16eb66bfb5…   2.52kB    
1026fba06d50   6 minutes ago   /bin/sh -c rm -fr /etc/yum.repos.d/*            0B        
4d1ba4477c9f   6 minutes ago   /bin/sh -c #(nop)  LABEL maintainer=xiangzhe…   0B        
e36d33e25bb2   6 minutes ago   /bin/sh -c #(nop)  LABEL version=1.0            0B        
eeb6ee3f44bd   4 months ago    /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B        
<missing>      4 months ago    /bin/sh -c #(nop)  LABEL org.label-schema.sc…   0B        
<missing>      4 months ago    /bin/sh -c #(nop) ADD file:b3ebbe8bd304723d4…   204MB     


# 较旧的镜像
# docker run -it 4d1ba4477c9f sh
sh-4.2# ls
anaconda-post.log  bin	dev  etc  home	lib  lib64  media  mnt	opt  proc  root  run  sbin  srv  sys  tmp  usr	var
sh-4.2# ls /etc/yum.repos.d/
CentOS-Base.repo  CentOS-Debuginfo.repo  CentOS-Sources.repo  CentOS-fasttrack.repo
CentOS-CR.repo	  CentOS-Media.repo	 CentOS-Vault.repo    CentOS-x86_64-kernel.repo
sh-4.2# exit
exit

# 最新的镜像
# docker run -it fb167ce759c8 sh
sh-4.2# ls /etc/yum.repos.d/
CentOS-Base-7.repo
```

## 查看镜像的详细信息

- `docker inspect` 可以查看 docker 各种对象的详细信息，包括：镜像、容器、网络等

```sh
# docker inspect busybox
...

# 也可以选择性查看
# docker inspect -f "{{.Created}}" 8f0e1ccddd5a
2021-09-30T10:10:41.25926759Z
```



# 镜像打标签(起别名)

- `docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]`
  - TARGET_IMAGE[:TAG]格式一般形式：`仓库主机IP(或FQDN)[:端口]/项目名(或用户名)/image名字:版本`
  - **如未指定`:TAG`，则默认为latest**
- 镜像打标签，类似于起别名，但通常要遵守一定的命名规范，才可以上传到指定仓库

```sh
# docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
busybox      latest    16ea53ea7c65   2 weeks ago   1.24MB

# docker tag busybox busybox:6.6.6

# docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
busybox      6.6.6     16ea53ea7c65   2 weeks ago   1.24MB
busybox      latest    16ea53ea7c65   2 weeks ago   1.24MB
```



# 镜像实际占用的磁盘空间

要查看Docker中镜像实际占用的磁盘空间，可以使用以下命令：

```
docker system df
```

该命令将显示Docker中各种对象（镜像、容器、卷、网络）占用的磁盘空间以及可使用的空间等详细信息。其中，使用`-v`选项可以显示详细信息，使用`--format`选项可以自定义输出信息的格式。

如果仅想查看镜像占用的磁盘空间，可以添加`--format`选项并指定以下格式字符串：

```
docker images --format '{{.Repository}}: {{.Size}}'
```

该命令将以表格形式显示每个镜像的名称和实际占用的磁盘空间（单位为字节），例如：

```
REPOSITORY              SIZE
busybox                 1.26MB
ubuntu                  87.05MB
hello-world             977B
```

从中可以看到每个镜像的实际占用磁盘空间。











# 拉取 docker hub 上的镜像

```json
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
"registry-mirrors": [
   "https://docker.registry.cyou",
   "https://docker-cf.registry.cyou",
   "https://dockercf.jsdelivr.fyi",
   "https://docker.jsdelivr.fyi",
   "https://dockertest.jsdelivr.fyi",
   "https://mirror.aliyuncs.com",
   "https://dockerproxy.com",
   "https://mirror.baidubce.com",
   "https://docker.m.daocloud.io",
   "https://docker.nju.edu.cn",
   "https://docker.mirrors.sjtug.sjtu.edu.cn",
   "https://docker.mirrors.ustc.edu.cn",
   "https://mirror.iscas.ac.cn",
   "https://docker.rainbond.cc"
 ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```





