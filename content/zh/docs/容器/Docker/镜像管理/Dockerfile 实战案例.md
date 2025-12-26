---
title: "Dockerfile 实战案例"
weight: 11
---

# 前言

- Docker镜像制作类似于虚拟机的模板制作，既按照公司的实际需求将某些软件和相关配置等内容提前构建，生成私人定制的镜像，最后再从镜像批量生成容器实例，这样可以极大的简化相同环境的部署工作

## 制作镜像的方式

**docker commit**

- 从现有容器基础上进行修改，commit为镜像，在push到docker仓库中
- 手动制作

**docker build**

- 写dockerfile，在build为镜像，最后在push到docker仓库中
- 脚本自动化制作



## 注意事项

- PID为1的进程要保证前台运行
- 制作镜像和container状态无关，container停止状态也可以制作镜像
- 如果没有指定 [REPOSITORY[:TAG]]，REPOSITORY 和 TAG 将都为none
- 提交时要标记TAG号，方便指定版本和加以区分





# docker commit

```sh
Usage:  docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]

Create a new image from a container's changes

Options:
  -a, --author string    Author (e.g., "John Hannibal Smith <hannibal@a-team.com>")
  -c, --change list      Apply Dockerfile instruction to the created image
  -m, --message string   Commit message
  -p, --pause            Pause container during commit (default true)
```

## 手动构建镜像流程

1. 下载一个系统的官方基础镜像，如Centos、Ubuntu
2. 基于基础镜像启动一个容器，并进入到容器
3. 在容器里做配置操作
   - 安装基础命令
   - 配置运行环境
   - 安装服务和配置服务
   - 放置业务程序代码
   - 等...
4. 提交为一个新镜像 docker commit
5. 基于自己的镜像创建容器并测试访问

## ---

## 基于 busybox 制作 httpd 镜像

```sh
# 先启动一个容器
root@ubuntu:~# docker run -it --name b1 busybox
/ #

# 可以看到busybox中有一个httpd的程序
/ # ls -l /bin/httpd 
-rwxr-xr-x  400 root     root       1149272 Sep 13 17:21 /bin/httpd
/ # httpd --help
	-i		Inetd mode
	-f		Don't daemonize
	-v[v]		Verbose
	-p [IP:]PORT	Bind to IP:PORT (default *:80)
	-u USER[:GRP]	Set uid/gid after binding to port
	-r REALM	Authentication Realm for Basic Authentication
	-h HOME		Home directory (default .)
	-c FILE		Configuration file (default {/etc,HOME}/httpd.conf)
	-m STRING	MD5 crypt STRING
	-e STRING	HTML encode STRING
	-d STRING	URL decode STRING

# 制作页面文件
/ # mkdir -p /data/html
/ # echo busybox website > /data/html/index.html


# 制作镜像，-a表示作者，-c表示容器启动时执行的命令，EXPOSE 80表示暴露80端口，:v1.0表示指定版本
root@ubuntu:~# docker commit -a "azheng<767483070@qq.com>" -c 'CMD /bin/httpd -f -h /data/html' -c "EXPOSE 80" b1 httpd-busybox:v1.0

# 查看制作的镜像
root@ubuntu:~# docker images
REPOSITORY              TAG       IMAGE ID       CREATED         SIZE
httpd-busybox           v1.0      77b18fff53c8   3 minutes ago   1.24MB

# 启动镜像并测试
root@ubuntu:~# docker run -d 77b18fff53c8
e9a513c9dba80dc7e8fab635eb1d0aa6691e6a48c1ae055e90eb491927029826
azheng@ubuntu:~$ curl  172.17.0.5
busybox website

# 启动镜像并测试方法二（指定暴露端口，-P表示暴露随机端口，-p port 指定暴露端口）
root@ubuntu:~# docker run -d -P httpd-busybox:v1.0
55b12052b84b8fd572e5b2f0e423ba23a9c1ca107f592abdac6ed1da7abea784
root@ubuntu:~# docker ps -a
CONTAINER ID   IMAGE                COMMAND                  CREATED         STATUS         PORTS                                     NAMES
55b12052b84b   httpd-busybox:v1.0   "/bin/sh -c '/bin/ht…"   5 seconds ago   Up 3 seconds   0.0.0.0:49153->80/tcp, :::49153->80/tcp   upbeat_ritchie
root@ubuntu:~# docker port 55b12052b84b
80/tcp -> 0.0.0.0:49153
80/tcp -> :::49153
azheng@ubuntu:~$ curl  10.0.0.100:49153
busybox website


# 制作镜像v2.0版
[root@docker ~]# docker exec -it b1 sh
/ # echo 'busybox website v2.0' > /data/html/index.html
[root@docker ~]#  docker commit -a "azheng<767483070@qq.com>" -c 'CMD /bin/httpd -f -h /data/html' -c "EXPOSE 80" b1 httpd-busybox:v2.0
sha256:c37287429dc49039f0d40a030fd865f7411499a05f5287c3a55af6ff9d47a668
[root@docker ~]# docker images
REPOSITORY      TAG       IMAGE ID       CREATED          SIZE
httpd-busybox   v2.0      c37287429dc4   7 seconds ago    1.24MB
httpd-busybox   v1.0      a2bb2d0950dc   13 minutes ago   1.24MB
busybox         latest    beae173ccac6   3 weeks ago      1.24MB
[root@docker ~]# docker run -d -p 81:80 httpd-busybox:v2.0
5b9c678568f67808cb6754730585b49046a565e8e8aa90a6505aa43b5e2baa00
[root@docker ~]# curl 127.0.0.1:81
busybox website v2.0
```

## ---

## 基于官方 Tomcat镜像生成的容器制作Tomcat镜像

```sh
# 从官网下载tomcat镜像并运行再映射到本机的8080端将口
root@ubuntu:~# docker run -d -p 8080:8080 tomcat

# 进入tomcat容器，开始进行私人定制（准备一个web界面）
root@ubuntu:~# docker exec -it 8345c9a68921 bash
root@8345c9a68921:/usr/local/tomcat# cp -a webapps.dist/* webapps/

# 制作镜像，-m表示提交的信息
root@ubuntu:~# docker commit -a "azheng<767483070@qq.com>" -m "add webapps app" 8345c9a68921 tomcat:10.0.11-v1.0
sha256:e31208e4714286f450d1a458c6feda7c062b2f467bb2048385cbb2349e9042e5

# 查看制作的镜像
REPOSITORY              TAG            IMAGE ID       CREATED             SIZE
tomcat                  10.0.11-v1.0   e31208e47142   31 seconds ago      684MB

# 启动镜像并测试
root@ubuntu:~# docker run -d -P --name tomcat1 tomcat:10.0.11-v1.0
root@ubuntu:~# docker port tomcat1
8080/tcp -> 0.0.0.0:49154
8080/tcp -> :::49154
azheng@ubuntu:~$ curl 10.0.0.100:49154
...
```

## ---

## 基于 Ubuntu的基础镜像利用 apt 安装手动制作  nginx 的镜像

```sh
# 拉取官方的Ubuntu镜像
root@ubuntu:~# docker pull ubuntu:20.04

# 运行拉取的官方镜像
root@ubuntu:~# docker run -it --name ubuntu2004 ubuntu:20.04 bash

# 修改Ubuntu容器中的apt源路径，方法二
root@b9ed97ffe5a2:/# cat /etc/apt/sources.list
deb http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse

deb http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse

# 更新仓库、安装nginx（安装nginx选择亚洲上海，6，70）
root@b9ed97ffe5a2:/# apt update
root@b9ed97ffe5a2:/# apt -y install nginx

# 查看时区是否生效、和安装信息
root@b9ed97ffe5a2:/# ls -l /etc/localtime 
lrwxrwxrwx 1 root root 33 Oct  1 17:22 /etc/localtime -> /usr/share/zoneinfo/Asia/Shanghai
root@b9ed97ffe5a2:/# nginx -v
nginx version: nginx/1.18.0 (Ubuntu)

# 准备nginx页面
root@b9ed97ffe5a2:/# echo "nginx in Docker" > /var/www/html/index.html
root@b9ed97ffe5a2:/# exit
exit

# 打包成为镜像
root@ubuntu:~# docker commit -a 'azheng' -m 'nginx-ubuntu:20.04' nginx-ubuntu nginx-ubuntu20.04:v1.0-1.18.0
sha256:8bcbbac2381ce29d596f1df6f1705b705714022d94138696a0c73930b561324b

# 查看新创建的镜像
root@ubuntu:~# docker images
REPOSITORY              TAG            IMAGE ID       CREATED             SIZE
nginx-ubuntu20.04       v1.18.0        8bcbbac2381c   51 seconds ago      188MB

# 运行镜像，（nginx -g "daemon off;" 是一个命令，可以让nginx保持前台运行，否则服务将开启后即关闭）
root@ubuntu:~# docker run -d -p 80:80 --name nginx-web nginx-ubuntu20.04:v1.18.0 nginx -g "daemon off;"
ba90a7ede2157da5767d399c7b2d31b94b16daf709ba7d51d3ac73c97efe77b8

# 测试
azheng@ubuntu:~$ curl 10.0.0.100
nginx in Docker
root@ubuntu:~# docker ps
CONTAINER ID   IMAGE                       COMMAND                  CREATED         STATUS         PORTS                               NAMES
ba90a7ede215   nginx-ubuntu20.04:v1.18.0   "nginx -g 'daemon of…"   2 minutes ago   Up 2 minutes   0.0.0.0:80->80/tcp, :::80->80/tcp   nginx-web

```

## ---

## 基于 Centos 的基础镜像利用 yum 安装手动制作  nginx 的镜像

```sh
# 下载centos官方镜像
root@ubuntu:~# docker pull centos

# 启动官方容器
root@ubuntu:~# docker run -it --name nginx-centos centos bash

# 修改时区
[root@388036dad83d /]# rm -f /etc/localtime 
[root@388036dad83d /]# ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 安装nginx
[root@456c6ca2f15e /]# yum -y install nginx
[root@456c6ca2f15e /]# nginx -v
nginx version: nginx/1.14.1

# 这时可以修改nginx配置文件来直接实现前台运行


# 准备页面
[root@456c6ca2f15e /]# echo "nginx for centos in docker" > /usr/share/nginx/html/index.html

# 制作镜像
root@ubuntu:~# docker commit -a 'azheng' -m 'nginx-centos:8.4' nginx-centos nginx-centos8.4:v1.0-1.14.1
sha256:accb8bf9fd4ced2ab2f6bde7a5cbbd17ddaf43e030fea459c12d9dfbed2df2b0
root@ubuntu:~# docker images
REPOSITORY              TAG            IMAGE ID       CREATED             SIZE
nginx-centos8.4      v1.0-1.14.1      accb8bf9fd4c   51 seconds ago      343MB

# 运行并测试
root@ubuntu:~# docker run -d -p 80:80 --name nginx-web2 nginx-centos8.4:v1.0-1.14.1 nginx -g "daemon off;"
83b1611062b53341aaf6cea8a577ad7abc496421c86abec349bb545402c558ff
root@ubuntu:~# docker ps -a
CONTAINER ID   IMAGE              COMMAND                  CREATED         STATUS         PORTS                               NAMES
83b1611062b5   nginx-centos:8.4   "nginx -g 'daemon of…"   4 seconds ago   Up 3 seconds   0.0.0.0:80->80/tcp, :::80->80/tcp   nginx-web2
root@ubuntu:~# curl 10.0.0.100
nginx for centos in docker
```



# ---



# 前期准备

- 按照业务类型或系统类型等方式划分创建目录环境，方便后期镜像比较多的时候管理
- 查看镜像分层历史：docker history 镜像ID
- **参考范例：**

```sh
# mkdir -p /data/dockerfile/{web/{nginx,apache,jdk,tomcat},system/{centos,ubuntu,debian,alpine}}

# tree /data/
/data/
└── dockerfile
    ├── system
    │   ├── alpine
    │   ├── centos
    │   ├── debian
    │   └── ubuntu
    └── web
        ├── apache
        ├── jdk
        ├── nginx
        └── tomcat
```



# ---



# 制作系统基础镜像

## Centos

### 准备基础镜像

```dockerfile
# docker pull centos:7.9.2009
# docker images
REPOSITORY   TAG        IMAGE ID       CREATED        SIZE
centos       7.9.2009   eeb6ee3f44bd   4 months ago   204MB
```

### Dockerfile

```dockerfile
ARG CODE_VERSION=7.9.2009
FROM centos:${CODE_VERSION}
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
COPY etc/yum.repos.d/CentOS-Base-7.repo /etc/yum.repos.d/
RUN yum makecache && yum -y install \
    vim iproute net-tools wget curl \
    lrzsz tree telnet bzip2 lsof zip \
    unzip gcc make gcc-c++ glibc glibc-devel \
    pcre pcre-devel openssl openssl-devel zlib-devel
RUN ln -sf ../usr/share/zoneinfo/Asia/Shanghai /etc/localtime
ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]
```

### 所需文件

```bash
.
├── Dockerfile
└── etc
    └── yum.repos.d
        └── CentOS-Base-7.repo #指向公司内部或国内的镜像源
```

### 构建镜像

```bash
docker build -t centos-7.9.2009-base:v1.0 --force-rm .
```



## Ubuntu

### 准备基础镜像

```dockerfile
# docker pull ubuntu:20.04
# docker images
REPOSITORY   TAG        IMAGE ID       CREATED        SIZE
ubuntu      20.04     ba6acccedd29   5 months ago     72.8MB
```

### Dockerfile

```dockerfile
FROM ubuntu:20.04
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD sources.list /etc/apt/
RUN apt update && apt -y install \
    curl \
    lrzsz \
    traceroute \
    tcpdump \
    vim \
    bridge-utils \
    netcat \
    wget \
    tree \
    inetutils-ping \
    make \
    lsof \
    iproute2 \
    net-tools \
    tzdata
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]
```

### 所需文件

```bash
# tree /Dockerfile/ubuntu/
/Dockerfile/ubuntu/
├── Dockerfile
└── sources.list #指向公司内部或国内的镜像源
```

### 构建镜像

```bash
docker build -t ubuntu-20.04-base:1.0 --force-rm .
```

### 测试镜像

```bash
docker run -d --name ubuntu  ubuntu-20.04-base:1.0

docker exec -it ubuntu bash
```



# ---



# 基于系统基础镜像 制作nginx基础镜像

## Centos-Dockerfile

```dockerfile
FROM centos7.9.2009-base:v2.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD nginx-1.18.0.tar.gz /usr/local/src/
RUN cd /usr/local/src/nginx-1.18.0 && ./configure  \
    --prefix=/apps/nginx \
    --user=nginx \
    --group=nginx \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-pcre \
    --with-stream \
    --with-stream_ssl_module \
    --with-stream_realip_module && make -j 2 && make install
COPY nginx.conf /apps/nginx/conf/
RUN id 80 &> /dev/null || useradd -r -u 80 -s /sbin/nologin nginx
RUN chown -R nginx.nginx /apps/nginx && ln -s /apps/nginx/sbin/nginx /usr/sbin/
EXPOSE 80 443
USER nginx
CMD nginx
```



## Ubuntu-Dockerfile

```dockerfile
FROM ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
RUN apt update \
    &&  apt -y install make gcc libpcre3 libpcre3-dev openssl libssl-dev zlib1g-dev
ADD nginx-1.18.0.tar.gz /usr/local/src/
RUN cd /usr/local/src/nginx-1.18.0 \
    && ./configure  \
    --prefix=/apps/nginx \
    --user=nginx \
    --group=nginx \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-pcre \
    --with-stream \
    --with-stream_ssl_module \
    --with-stream_realip_module \
    && make \
    && make install \
    && mkdir -p /apps/nginx/run/ \
    && useradd -r -u 80 -s /sbin/nologin nginx \
    && chown -R nginx.nginx /apps/nginx
COPY nginx.conf /apps/nginx/conf/
EXPOSE 80 443
USER nginx
ENTRYPOINT ["/apps/nginx/sbin/nginx"]
```

## 准备Dockerfile所需文件

```sh
# tree /Dockerfile/nginx/
/Dockerfile/nginx/
├── Dockerfile
├── nginx-1.18.0.tar.gz
└── nginx.conf #一定要指定nginx前台运行，否则开启即关闭 daemon off;
```

## 构建镜像

```sh
#centos
docker build -t nginx-1.18-centos:1.0 --force-rm .

#ubuntu
docker build -t nginx-1.18-ubuntu:1.0 --force-rm .
```





# 基于nginx基础镜像 制作业务镜像1

## Dockerfile

```dockerfile
FROM ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
RUN apt update \
    &&  apt -y install make gcc libpcre3 libpcre3-dev openssl libssl-dev zlib1g-dev
ADD nginx-1.18.0.tar.gz /usr/local/src/
RUN cd /usr/local/src/nginx-1.18.0 \
    && ./configure  \
    --prefix=/apps/nginx \
    --user=nginx \
    --group=nginx \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-http_realip_module \
    --with-http_stub_status_module \
    --with-http_gzip_static_module \
    --with-pcre \
    --with-stream \
    --with-stream_ssl_module \
    --with-stream_realip_module \
    && make \
    && make install \
    && mkdir -p /apps/nginx/run/ \
    && useradd -r -u 80 -s /sbin/nologin nginx \
    && chown -R nginx.nginx /apps/nginx
COPY apps/nginx/conf/nginx.conf /apps/nginx/conf/
EXPOSE 80 443
USER nginx
ENTRYPOINT ["/apps/nginx/sbin/nginx"]
```

## 准备Dockerfile所需文件

```bash
# tree 
.
├── apps
│   └── nginx
│       ├── conf
│       │   └── nginx.conf
│       └── conf.d
│           └── azheng.org.conf
├── Dockerfile
└── html
    ├── about.html
    ├── contact.html
    ├── css
    │   ├── animate.css
    │   ├── bootstrap.css
    │   ├── bootstrap.css.map
    │   ├── flexslider.css
    │   ├── icomoon.css
    │   ├── magnific-popup.css
...
```

### nginx主配置文件

- 范例

```bash
# cat /data/dockerfile/project/apps/nginx/conf/nginx.conf 
user    nginx nginx;
worker_processes  auto;
pid     /apps/nginx/run/nginx.pid;
error_log  logs/error.log;
daemon off;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    log_format log_json '{"@timestamp": "$time_local",'
                        '"remote_addr": "$remote_addr",'
                        '"referer": "$http_referer",'
                        '"request": "$request",'
                        '"status": $status,'
                        '"bytes": $body_bytes_sent,'
                        '"user_agent": "$http_user_agent",'
                        '"x_forwarded": "$http_x_forwarded_for",'
                        '"up_addr": "$upstream_addr",'
                        '"up_host": "$upstream_http_host",'
                        '"up_resp_time": "$upstream_response_time",'
                        '"request_time": "$request_time"'
                        ' }';
    access_log  logs/access.log log_json;
    include /apps/nginx/conf.d/*.conf;
}
```

### nginx子配置文件

- 范例

```bash
# cat /data/dockerfile/project/apps/nginx/conf.d/azheng.org.conf 
server {
    listen 80;
    server_name azheng.org;

    location / {
        root /data/html;
        index index.html;
    }
}
```



## 构建镜像

```bash
docker build -t nginx-ubuntu20.04-porject:1.0 --force-rm .
```





# 基于nginx基础镜像 制作业务镜像2

...





# ---

# 基于系统基础镜像 制作 wordpress 镜像

- 只将 wordpress 解压到系统目录中，不安装nginx，在k8s yaml文件中与nginx一起编排

## Ubuntu-Dockerfile

```dockerfile
FROM ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD wordpress-5.7.1-zh_CN.tar.gz /
```

## 准备Dockerfile所需文件

```sh
# tree /Dockerfile/wordpress/
/Dockerfile/wordpress/
├── Dockerfile
└── wordpress-5.7.1-zh_CN.tar.gz
```

## 构建镜像

```bash
#centos
docker build -t wordpress-5.7.1-centos:1.0 --force-rm .

#ubuntu
docker build -t wordpress-5.7.1-ubuntu:1.0 --force-rm .
```



# ---





# 基于系统基础镜像 制作JDK镜像

- oracle-jdk下载地址：https://www.oracle.com/java/

## Centos-Dockerfile

```dockerfile
FROM centos-7.9.2009-base:v1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD jdk-8u311-linux-x64.tar.gz /apps/
RUN ln -s /apps/jdk1.8.0_311 /apps/jdk
ENV JAVA_HOME=/apps/jdk
ENV JRE_HOME=${JAVA_HOME}/jre
ENV CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/
ENV PATH=${JAVA_HOME}/bin/:${PATH}
ENTRYPOINT /usr/bin/tail -f /etc/hosts #指定前台运行的进程，否则开启即关闭
```

## Ubuntu-Dockerfile

```dockerfile
FROM ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD jdk-8u311-linux-x64.tar.gz /apps/
RUN ln -s /apps/jdk1.8.0_311 /apps/jdk
ENV JAVA_HOME=/apps/jdk
ENV JRE_HOME=${JAVA_HOME}/jre
ENV CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/
ENV PATH=${JAVA_HOME}/bin/:${PATH}
ENTRYPOINT /usr/bin/tail -f /etc/hosts #指定前台运行的进程，否则开启即关闭
```

## 准备Dockerfile所需文件

```bash
# tree 
.
├── Dockerfile
└── jdk-8u311-linux-x64.tar.gz
```

## 构建镜像

```sh
#centos
docker build -t oracle-jdk-8-centos7.9:1.0 --force-rm .
docker exec -it jdk bash
root@db48b99ff1f1:/# java -version
java version "1.8.0_311"
Java(TM) SE Runtime Environment (build 1.8.0_311-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.311-b11, mixed mode)


#ubuntu
docker build -t oracle-jdk-8-ubuntu-20.04:1.0 --force-rm .
docker exec -it jdk bash
root@db48b99ff1f1:/# java -version
java version "1.8.0_311"
Java(TM) SE Runtime Environment (build 1.8.0_311-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.311-b11, mixed mode)
```





# ---



# 基于JDK镜像 制作tomcat基础镜像

## Dockerfile

```dockerfile
FROM tomcat-8.5.71-ubuntu-20.04:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
COPY server.xml /apps/tomcat/conf/
COPY app1 /data/webapps/
RUN chown -R tomcat.tomcat /apps/tomcat/ && chown -R tomcat.tomcat /data/
EXPOSE 8080
USER tomcat
ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]
```

## 准备Dockerfile所需文件

```sh
# tree 
[root@nginx-proxy app1-tomcat]# tree 
.
├── app1
│   ├── css
│   │   ├── animate.css
│   │   ├── bootstrap.css
│   │   ├── bootstrap.css.map
...
│   ├── ROOT #注意网页的根目录存放于此处
│   │   ├── about.html
│   │   ├── contact.html
│   │   ├── index.html
│   │   └── services.html
...
├── Dockerfile
└── server.xml #配置文件
```

### server.xml

```html
<?xml version="1.0" encoding="UTF-8"?>

<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>
    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service name="Catalina">

    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
    <Engine name="Catalina" defaultHost="localhost">

      <Realm className="org.apache.catalina.realm.LockOutRealm">
        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="azheng.org"  appBase="/data/webapps/"
            unpackWARs="false" autoDeploy="false">

        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="azheng.org_access_log" suffix=".log"
               pattern="{&quot;client&quot;:&quot;%h&quot;,  &quot;client user&quot;:&quot;%l&quot;,   &quot;authenticated&quot;:&quot;%u&quot;,   &quot;access time&quot;:&quot;%t&quot;,     &quot;method&quot;:&quot;%r&quot;,   &quot;status&quot;:&quot;%s&quot;,  &quot;send bytes&quot;:&quot;%b&quot;,  &quot;Query?string&quot;:&quot;%q&quot;,  &quot;partner&quot;:&quot;%{Referer}i&quot;,  &quot;Agent version&quot;:&quot;%{User-Agent}i&quot;}"/>

      </Host>
    </Engine>
  </Service>
</Server>
```



## 构建镜像

```sh
#ubuntu
docker build -t tomcat-8.5.71-ubuntu-20.04:1.0 --force-rm .

#centos
docker build -t tomcat-8.5.71-centos7.9:1.0 --force-rm .
```

## 测试镜像

```sh
docker run -d --name tomcat --rm -p 8080:8080 tomcat-8.5.71-ubuntu-20.04:1.0

docker exec -it tomcat  bash
```



# 基于tomcat基础镜像 制作业务镜像1

## 准备Dockerfile

```dockerfile
FROM tomcat-8.5.71-ubuntu-20.04:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
COPY server.xml /apps/tomcat/conf/
COPY app1 /data/webapps/
EXPOSE 8080
USER tomcat
ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]
```



## 准备Dockerfile所需文件

```sh
[root@docker tomcat-app1]# pwd
/data/dockerfile/web/tomcat/tomcat-app1

[root@docker tomcat-app1]# tree 
.
├── Dockerfile
├── tomcat-app1-conf
│   └── conf
│       ├── catalina.policy
│       ├── catalina.properties
│       ├── context.xml
│       ├── jaspic-providers.xml
│       ├── jaspic-providers.xsd
│       ├── logging.properties
│       ├── server.xml
│       ├── tomcat.conf
│       ├── tomcat-users.xml
│       ├── tomcat-users.xsd
│       └── web.xml
└── tomcat-app1-page
    └── webapps
        └── ROOT
            ├── index.jsp
            └── WEB-INF
                └── web.xml


[root@docker tomcat-app1]# cat tomcat-app1-page/webapps/ROOT/index.jsp 
tomcat app1 website page

[root@docker tomcat-app1]# cat tomcat-app1-conf/conf/server.xml 
...
      <Host name="localhost"  appBase="/data/tomcat/tomcat-app1"
            unpackWARs="true" autoDeploy="true">
...
```

## 构建镜像

```sh
docker build -t app1-tomcat-8.5.71:1.0 --force-rm .
```

## 测试镜像

```bash
docker run -d --name tomcat --rm -p 8080:8080 app1-tomcat-8.5.71:1.0

docker exec -it tomcat bash
```



# 基于tomcat基础镜像 制作业务镜像2

...





# ---



# 基于系统镜像 制作redis镜像

## Centos-Dockerfile

```bash
....
```

## Ubuntu-Dockerfile

- 有待完善，如：通过传递变量参数的方式自定义redis初始密码等...

```bash
FROM ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ARG REDIS_VERSION=6.2.6

#拷贝redis压缩包
ADD redis-${REDIS_VERSION}.tar.gz /usr/local/src/

#安装依赖包后进行编译安装
RUN set -eux; \
        apt-get update; \
        apt-get -y install \
        make \
        gcc; \
        cd /usr/local/src/redis-${REDIS_VERSION}; \
        make PREFIX=/apps/redis install

#拷贝redis配置文件
COPY etc/redis.conf /apps/redis/etc/
COPY etc/redis-sentinel.conf /apps/redis/etc/

VOLUME /data
WORKDIR /data
EXPOSE 6379
COPY docker-entrypoint.sh /usr/local/bin/

#执行初始化工作
ENTRYPOINT ["docker-entrypoint.sh"]

#前台启动redis
CMD ["redis-server"]
```

## 准备Dockerfile所需文件

```bash
.
├── docker-entrypoint.sh #注意要加执行权限，否则无法执行
├── Dockerfile
├── etc
│   ├── redis.conf
│   └── redis-sentinel.conf
└── redis-6.2.6.tar.gz

```

## 构建镜像

```bash
#ubuntu
docker build -t redis-6.2.6-ubuntu20.04:1.0 --force-rm .

#centos
docker build -t redis-6.2.6-centos7.9:1.0 --force-rm .
```

## 测试镜像

```bash
docker run -d --name redis -p 6379:6379 redis-6.2.6-ubuntu20.04:1.0

docker exec -it redis bash

#调试
docker run -d --name redis --entrypoint tail redis-6.2.6-ubuntu20.04:1.0 -f /etc/hosts
```





# ---





# 基于centos7.9制作LNMP镜像

## 准备目录

```bash
[root@docker ~]# mkdir -p /data/dockerfile/LNMP
```

## 准备Dockerfile

```dockerfile
[root@docker ~]# cd /data/dockerfile/LNMP
[root@docker LNMP]# vim Dockerfile
```



