```sh
root@k8s-master1:~# mkdir Dockerfile

root@k8s-master1:~# mkdir -p /root/dockerfile/system/{centos/7,ubuntu/{1604,1804}}

root@k8s-master1:~# mkdir -p /root/dockerfile/python/{centos7-python3,ubuntu1604-python3,ubuntu1804-python3}

root@k8s-master1:~# tree dockerfile/
dockerfile/
├── python
│   ├── centos7-python3
│   ├── ubuntu1604-python3
│   └── ubuntu1804-python3
└── system
    ├── centos
    │   └── 7
    └── ubuntu
        ├── 1604
        └── 1804
```



# system

- 系统基础镜像的 Dockerfile；
- 仅包含 ip、tcpdump、traceroute、ps、top、vim、ss、ping 等基础工具。

## centos

### 7

#### Dockerfile

```dockerfile
FROM centos:7
RUN rm -f /etc/localtime && \
    ln -s ../usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    rm -f /etc/yum.repos.d/* \
    mkdir /scripts
COPY CentOS-Base.repo epel.repo /etc/yum.repos.d/
RUN yum makecache && \
    yum install -y \
    iproute \
    tcpdump \
    traceroute \
    wget \
    nmap \
    bind-utils \
    iftop \
    nethogs \
    net-tools \
    which \
    telnet \
    cronie \
    ntpdate \ 
    && yum clean all
ENV LANG=en_US.UTF-8
ENV NTP_SERVER1="${NTP_SERVER1:-ntp.aliyun.com}" \
    NTP_SERVER2="${NTP_SERVER2:-ntp1.aliyun.com}"
ENV MIRRORS_SERVER="${MIRRORS_SERVER:-mirrors.aliyun.com}"
COPY init.sh /scripts/
COPY entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
```

#### CentOS-Base.repo

```sh
# CentOS-Base.repo
#
# The mirror system uses the connecting IP address of the client and the
# update status of each mirror to pick mirrors that are updated to and
# geographically close to the client.  You should use this for CentOS updates
# unless you are manually picking other mirrors.
#
# If the mirrorlist= does not work for you, as a fall back you can try the 
# remarked out baseurl= line instead.
#
#
 
[base]
name=CentOS-$releasever - Base - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/os/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
 
#released updates 
[updates]
name=CentOS-$releasever - Updates - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/updates/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
 
#additional packages that may be useful
[extras]
name=CentOS-$releasever - Extras - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/extras/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
 
#additional packages that extend functionality of existing packages
[centosplus]
name=CentOS-$releasever - Plus - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/centosplus/$basearch/
gpgcheck=1
enabled=0
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
 
#contrib - packages by Centos Users
[contrib]
name=CentOS-$releasever - Contrib - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/contrib/$basearch/
gpgcheck=1
enabled=0
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
```

#### epel.repo

```sh
[epel]
name=Extra Packages for Enterprise Linux 7 - $basearch
baseurl=http://mirrors.aliyun.com/epel/7/$basearch
failovermethod=priority
enabled=1
gpgcheck=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
 
[epel-debuginfo]
name=Extra Packages for Enterprise Linux 7 - $basearch - Debug
baseurl=http://mirrors.aliyun.com/epel/7/$basearch/debug
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=0
 
[epel-source]
name=Extra Packages for Enterprise Linux 7 - $basearch - Source
baseurl=http://mirrors.aliyun.com/epel/7/SRPMS
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=0
```

#### init.sh

```sh
#!/bin/bash
# 导入环境变量
/usr/bin/env > /etc/environment

# 启动计划任务主进程
/usr/sbin/crond

# 将时间同步脚本加入到计划任务当中
cat > /etc/cron.d/time_sync.cron <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/3 * * * * root /usr/sbin/ntpdate -b ${NTP_SERVER1} ${NTP_SERVER2} &>> /var/log/time_sync.log
EOF

# 更改镜像源指向
sed -ri "s/mirrors.aliyun.com/${MIRRORS_SERVER}/g" \
/etc/yum.repos.d/epel.repo \
/etc/yum.repos.d/CentOS-Base.repo
```

#### entrypoint.sh

```sh
#!/bin/bash

# 系统初始化脚本
/scripts/init.sh

exec "$@"
```

#### 构建指令

```sh
docker build -t centos7:v1.0 .

docker build --no-cache -t centos7:v1.0 .
```







## ubuntu

### 16.04

#### Dockerfile

```dockerfile
FROM ubuntu:16.04
RUN apt-get update && apt-get install -y apt-transport-https tzdata && \
    rm -f /etc/localtime && \
    ln -s ../usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    mkdir /scripts
COPY sources.list /etc/apt/
RUN apt-get update && \
    apt-get install -y \
    vim \
    iproute2 \
    iputils-ping \
    tcpdump \
    traceroute \
    wget \
    nmap \
    dnsutils \
    iftop \
    nethogs \
    net-tools \
    telnet \
    cron \
    ntpdate \ 
    && apt-get clean
ENV LANG=en_US.UTF-8
ENV NTP_SERVER1="${NTP_SERVER1:-ntp.aliyun.com}" \
    NTP_SERVER2="${NTP_SERVER2:-ntp1.aliyun.com}"
ENV MIRRORS_SERVER="${MIRRORS_SERVER:-https://mirrors.aliyun.com/ubuntu/}"
COPY init.sh /scripts/
COPY vimrc /root/.vimrc
COPY entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
```

#### sources.list

```ini
deb https://mirrors.aliyun.com/ubuntu/ xenial main
deb-src https://mirrors.aliyun.com/ubuntu/ xenial main

deb https://mirrors.aliyun.com/ubuntu/ xenial-updates main
deb-src https://mirrors.aliyun.com/ubuntu/ xenial-updates main

deb https://mirrors.aliyun.com/ubuntu/ xenial universe
deb-src https://mirrors.aliyun.com/ubuntu/ xenial universe
deb https://mirrors.aliyun.com/ubuntu/ xenial-updates universe
deb-src https://mirrors.aliyun.com/ubuntu/ xenial-updates universe

deb https://mirrors.aliyun.com/ubuntu/ xenial-security main
deb-src https://mirrors.aliyun.com/ubuntu/ xenial-security main
deb https://mirrors.aliyun.com/ubuntu/ xenial-security universe
deb-src https://mirrors.aliyun.com/ubuntu/ xenial-security universe
```

#### vimrc

- 解决vim编辑器中文输入乱码问题

```sh
# 解决vim编辑器中文输入乱码问题
set fileencodings=utf-8,gb2312,gbk,gb18030  
set termencoding=utf-8  
set fileformats=unix  
set encoding=prc
```

#### init.sh

```sh
#!/bin/bash
# 导入环境变量
/usr/bin/env > /etc/environment

# 启动计划任务主进程
/usr/sbin/cron

# 将时间同步脚本加入到计划任务当中并运行
cat > /etc/cron.d/time_sync.cron <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/3 * * * * /usr/sbin/ntpdate -b ${NTP_SERVER1} ${NTP_SERVER2} &>> /var/log/time_sync.log
EOF
/usr/bin/crontab /etc/cron.d/time_sync.cron

# 更改镜像源指向
sed -ri "s#https://mirrors.aliyun.com/ubuntu/#${MIRRORS_SERVER}#g" /etc/apt/sources.list
```

#### entrypoint.sh

```sh
#!/bin/bash

# 系统初始化脚本
/scripts/init.sh

exec "$@"
```

#### 构建指令

```sh
# 构建
docker build -t ubuntu1604:v1.0 .

docker build --no-cache -t ubuntu1604:v1.0 .

docker images -a | grep ubuntu1604

# 运行
docker run -d --rm \
--name ubuntu1604 \
ubuntu1604:v1.0 tail -f /etc/hosts

docker run -d --rm \
--name ubuntu1604 \
-e MIRRORS_SERVER=http://172.16.0.137:8081/repository/ubuntu/ \
ubuntu1604:v1.0 tail -f /etc/hosts

docker exec -it ubuntu1604 bash


# 清理
docker ps -a | grep ubuntu1604
docker stop ubuntu1604
docker images -a | grep ubuntu1604


# 推送镜像
docker tag ubuntu1604:v1.0 172.16.0.120:30002/system/ubuntu1604:v1.0
docker push 172.16.0.120:30002/system/ubuntu1604:v1.0
```



#### ubuntu1604.yaml

- 测试 yaml

```yaml
apiVersion: v1
kind: Pod 
metadata:
  name: ubuntu1604 
  namespace: test
spec:
  containers:
  - name: ubuntu1604 
    image: ubuntu1604:v1.0 
    args:
    - /usr/bin/tail
    - -f
    - /etc/hosts
    env:
    - name: NTP_SERVER1
      value: "172.16.0.125"
    - name: NTP_SERVER2
      value: "172.16.0.127"
    - name: MIRRORS_SERVER 
      value: "http://172.16.0.137:8081/repository/ubuntu/"
    securityContext:
      capabilities:
        add: ['CAP_SYS_TIME']
  nodeSelector:
    kubernetes.io/hostname: 'k8s-master1'
  tolerations:
  - key: node-role.kubernetes.io/master
    effect: NoSchedule
    operator: Exists
```

##### 测试

- kubectl exec -it -n test ubuntu1604 -- bash

```sh
root@ubuntu1604:/# apt-get update
...

root@ubuntu1604:/# apt-get -y install python3
...


root@ubuntu1604:/# python3 --version
Python 3.5.2
```



### 18.04

#### Dockerfile

```dockerfile
FROM ubuntu:18.04
RUN apt-get update && apt-get install -y ca-certificates
COPY sources.list /etc/apt/
RUN apt-get update && \
    apt-get install -y \
    apt-transport-https \
    tzdata \
    vim \
    iproute2 \
    iputils-ping \
    tcpdump \
    traceroute \
    wget \
    nmap \
    dnsutils \
    iftop \
    nethogs \
    net-tools \
    telnet \
    cron \
    ntpdate \ 
    && apt-get clean
RUN rm -f /etc/localtime && \
    ln -s ../usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    mkdir /scripts
ENV LANG=en_US.UTF-8
ENV NTP_SERVER1="${NTP_SERVER1:-ntp.aliyun.com}" \
    NTP_SERVER2="${NTP_SERVER2:-ntp1.aliyun.com}"
ENV MIRRORS_SERVER="${MIRRORS_SERVER:-https://mirrors.aliyun.com/ubuntu/}"
COPY init.sh /scripts/
COPY vimrc /root/.vimrc
COPY entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
```



#### sources.list

```ini
deb https://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse

# deb https://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
```

#### vimrc

- 解决vim编辑器中文输入乱码问题

```sh
# 解决vim编辑器中文输入乱码问题
set fileencodings=utf-8,gb2312,gbk,gb18030  
set termencoding=utf-8  
set fileformats=unix  
set encoding=prc
```

#### init.sh

```sh
#!/bin/bash
# 导入环境变量
/usr/bin/env > /etc/environment

# 启动计划任务主进程
/usr/sbin/cron

# 将时间同步脚本加入到计划任务当中并运行
cat > /etc/cron.d/time_sync.cron <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/3 * * * * /usr/sbin/ntpdate -b ${NTP_SERVER1} ${NTP_SERVER2} &>> /var/log/time_sync.log
EOF
/usr/bin/crontab /etc/cron.d/time_sync.cron

# 更改镜像源指向
sed -ri "s#https://mirrors.aliyun.com/ubuntu/#${MIRRORS_SERVER}#g" /etc/apt/sources.list
```

#### entrypoint.sh

```sh
#!/bin/bash

# 系统初始化脚本
/scripts/init.sh

exec "$@"
```

#### 构建指令

```sh
# 构建
docker build -t ubuntu1804:v1.0 .

docker build --no-cache -t ubuntu1804:v1.0 .

docker images -a | grep ubuntu1804

# 运行
docker run -d --rm \
--name ubuntu1804 \
ubuntu1804:v1.0 tail -f /etc/hosts

docker run -d --rm \
--name ubuntu1804 \
-e MIRRORS_SERVER=http://172.16.0.137:8081/repository/ubuntu/ \
ubuntu1804:v1.0 tail -f /etc/hosts

docker exec -it ubuntu1804 bash


# 清理
docker ps -a | grep ubuntu1804
docker stop ubuntu1804
docker images -a | grep ubuntu1804


# 推送镜像
docker tag ubuntu1804:v1.0 172.16.0.120:30002/system/ubuntu1804:v1.0
docker push 172.16.0.120:30002/system/ubuntu1804:v1.0
```



#### ubuntu1804.yaml

- 测试 yaml

```yaml
apiVersion: v1
kind: Pod 
metadata:
  name: ubuntu1804 
  namespace: test
spec:
  containers:
  - name: ubuntu1804 
    image: ubuntu1804:v1.0 
    args:
    - /usr/bin/tail
    - -f
    - /etc/hosts
    env:
    - name: NTP_SERVER1
      value: "172.16.0.125"
    - name: NTP_SERVER2
      value: "172.16.0.127"
    - name: MIRRORS_SERVER 
      value: "http://172.16.0.137:8081/repository/ubuntu/"
    securityContext:
      capabilities:
        add: ['CAP_SYS_TIME']
  nodeSelector:
    kubernetes.io/hostname: 'k8s-master1'
  tolerations:
  - key: node-role.kubernetes.io/master
    effect: NoSchedule
    operator: Exists
```

##### 测试

- kubectl exec -it -n test ubuntu1804 -- bash

```sh
root@ubuntu1804:/# apt-get update
...

root@ubuntu1804:/# apt-get -y install python3
...


root@ubuntu1804:/# python3 --version
Python 3.6.9
```



# Python

- 基于系统基础镜像所制作的 python 镜像。

## ubuntu16.04-python3.6.8

### Dockerfile

```dockerfile
FROM 172.16.0.120:30002/system/ubuntu1604@sha256:0f1091711eca0abc5f9885809eaffcf09c9e23c11bc9ff4c1fc15231a7e4d4e7
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    checkinstall \
    libreadline-gplv2-dev \
    libncursesw5-dev \
    libssl-dev \
    libsqlite3-dev \
    tk-dev \
    libgdbm-dev \
    libc6-dev \
    libbz2-dev
COPY Python-3.6.8.tgz /
RUN tar -xf Python-3.6.8.tgz && \
    cd Python-3.6.8 && \
    ./configure && \
    make && make install
RUN mkdir /root/.pip
COPY pip.conf /root/.pip
ENV PYPI_SOURCE="${PYPI_SOURCE:-https://pypi.tuna.tsinghua.edu.cn/simple}"
RUN echo 'sed -i "s|https://pypi.tuna.tsinghua.edu.cn/simple|${PYPI_SOURCE}|g" /root/.pip/pip.conf' >> /scripts/init.sh
RUN rm -fr /Python-3.6.8 /Python-3.6.8.tgz && \
    apt-get remove --purge -y \
    build-essential \
    checkinstall \
    libreadline-gplv2-dev \
    libncursesw5-dev \
    libssl-dev \
    libsqlite3-dev \
    tk-dev \
    libgdbm-dev \
    libc6-dev \
    libbz2-dev && \
    apt-get autoremove -y
```

### pip.conf

```ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
```



### ubuntu1604-python368.yaml

- 测试 yaml

```yaml
apiVersion: v1
kind: Pod 
metadata:
  name: ubuntu1604-python368
  namespace: test
spec:
  containers:
  - name: ubuntu1604-python368
    image: ubuntu1604-python368:v1.1
    args:
    - /usr/bin/tail
    - -f
    - /etc/hosts
    env:
    - name: NTP_SERVER1
      value: "172.16.0.125"
    - name: NTP_SERVER2
      value: "172.16.0.127"
    - name: MIRRORS_SERVER
      value: "http://172.16.0.137:8081/repository/ubuntu/"
    - name: PYPI_SOURCE
      value: "http://172.16.0.137:8081/repository/pypi/simple"
    securityContext:
      capabilities:
        add: ['CAP_SYS_TIME']
  nodeSelector:
    kubernetes.io/hostname: 'k8s-master1'
  tolerations:
  - key: node-role.kubernetes.io/master
    effect: NoSchedule
    operator: Exists
```

#### 测试

```
# kubectl exec -it -n test ubuntu1604-python368 -- bash


```





### 构建指令

```sh
docker build -t ubuntu1604-python368:v1.0 .
docker build -t ubuntu1604-python368:v1.1 .
docker build --no-cache -t ubuntu1604-python368:v1.1 .

docker build \
--build-arg MIRRORS_SERVER=http://172.16.0.137:8081/repository/ubuntu/ \
--no-cache \
-t ubuntu1604-python368:v1.1 .

docker images -a | grep python368


kubectl exec -it -n test ubuntu1604-python368 -- bash



docker run -d --rm --name ubuntu1604 ubuntu1604:v1.0 tail -f /etc/hosts


docker run -d --rm --name ubuntu1604 ubuntu:16.04 tail -f /etc/hosts

docker stop ubuntu1604

docker exec -it ubuntu1604 bash


docker ps -a | grep python368

docker images -a | grep python368
docker rmi ubuntu1604-python368:v1.0

docker rm -f ubuntu

# docker run -d --rm --privileged --name centos7 centos7:v1.1

# 推送镜像
docker tag ubuntu1604-python368:v1.0 172.16.0.120:30002/python/ubuntu1604-python368:v1.0
docker push 172.16.0.120:30002/python/ubuntu1604-python368:v1.0


# 推送镜像1.1
docker tag ubuntu1604-python368:v1.1 172.16.0.120:30002/python/ubuntu1604-python368:v1.1
docker push 172.16.0.120:30002/python/ubuntu1604-python368:v1.1
```

## ubuntu18.04-python3.10.12

### Dockerfile

```dockerfile
FROM 172.16.0.120:30002/system/ubuntu1804:v1.0
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    checkinstall \
    libreadline-gplv2-dev \
    libncursesw5-dev \
    libssl-dev \
    libsqlite3-dev \
    tk-dev \
    libgdbm-dev \
    libc6-dev \
    libbz2-dev
COPY Python-3.10.12.tgz /
RUN tar -xf Python-3.10.12.tgz && \
    cd Python-3.10.12 && \
    ./configure && \
    make && make install
RUN mkdir /root/.pip
COPY pip.conf /root/.pip
ENV PYPI_SOURCE="${PYPI_SOURCE:-https://pypi.tuna.tsinghua.edu.cn/simple}"
RUN echo 'sed -i "s|https://pypi.tuna.tsinghua.edu.cn/simple|${PYPI_SOURCE}|g" /root/.pip/pip.conf' >> /scripts/init.sh
RUN rm -fr /Python-3.10.12 /Python-3.10.12.tgz && \
    apt-get remove --purge -y \
    build-essential \
    checkinstall \
    libreadline-gplv2-dev \
    libncursesw5-dev \
    libssl-dev \
    libsqlite3-dev \
    tk-dev \
    libgdbm-dev \
    libc6-dev \
    libbz2-dev && \
    apt-get autoremove -y
```

### pip.conf

```ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
```



### ubuntu1804-python310.yaml

- 测试 yaml

```yaml
apiVersion: v1
kind: Pod 
metadata:
  name: ubuntu1804-python310
  namespace: test
spec:
  containers:
  - name: ubuntu1804-python310
    image: ubuntu1804-python310:v1.0
    args:
    - /usr/bin/tail
    - -f
    - /etc/hosts
    env:
    - name: NTP_SERVER1
      value: "172.16.0.125"
    - name: NTP_SERVER2
      value: "172.16.0.127"
    - name: MIRRORS_SERVER
      value: "http://172.16.0.137:8081/repository/ubuntu/"
    - name: PYPI_SOURCE
      value: "http://172.16.0.137:8081/repository/pypi/simple"
    securityContext:
      capabilities:
        add: ['CAP_SYS_TIME']
  nodeSelector:
    kubernetes.io/hostname: 'k8s-master1'
  tolerations:
  - key: node-role.kubernetes.io/master
    effect: NoSchedule
    operator: Exists
```

#### 测试

```
# kubectl exec -it -n test ubuntu1604-python368 -- bash


```





### 构建指令

```sh
docker build -t ubuntu1804-python310:v1.0 .

docker images | grep python310

# 推送镜像
docker tag ubuntu1804-python310:v1.0 172.16.0.120:30002/python/ubuntu1804-python310:v1.0

docker push 172.16.0.120:30002/python/ubuntu1804-python310:v1.0
```







# kubectl

- 基于python基础镜像，构建能执行kubectl命令的镜像

## 前期准备

```sh
root@k8s-master1:~# mkdir dockerfile/kubectl


# 拷贝kubectl命令 和 kubeconfig
root@k8s-master1:~# cp /usr/local/bin/kubectl dockerfile/kubectl/

root@k8s-master1:~# cp /etc/kubernetes/admin.conf dockerfile/kubectl/

root@k8s-master1:~# ls -l dockerfile/kubectl/
total 45848
-rw------- 1 root root     5655 Jun 30 09:56 admin.conf
-rwxr-xr-x 1 root root 46940160 Jun 30 09:51 kubectl
```

## Dockerfile

```dockerfile
FROM 172.16.0.120:30002/python/python:3.9.17
RUN apt-get update && \
    apt-get install -y \
    gettext
COPY kubectl admin.conf /usr/sbin/
ENV KUBECONFIG="/usr/sbin/admin.conf"
```

## 构建指令

```sh
docker build -t test-kubectl:v1.0 .

docker images | grep kubectl

# 推送镜像
docker tag test-kubectl:v1.0 172.16.0.120:30002/kubectl/test-kubectl:v1.0

docker push 172.16.0.120:30002/kubectl/test-kubectl:v1.0
```



## kubectl.yaml

- 测试 yaml

```yaml
apiVersion: v1
kind: Pod 
metadata:
  name: kubectl
  namespace: test
spec:
  containers:
  - name: kubectl
    image: ubuntu1804-python310:kubectl
    args:
    - /usr/bin/tail
    - -f
    - /etc/hosts
    env:
    - name: NTP_SERVER1
      value: "172.16.0.125"
    - name: NTP_SERVER2
      value: "172.16.0.127"
    - name: MIRRORS_SERVER
      value: "http://172.16.0.137:8081/repository/ubuntu/"
    - name: PYPI_SOURCE
      value: "http://172.16.0.137:8081/repository/pypi/simple"
    securityContext:
      capabilities:
        add: ['CAP_SYS_TIME']
  nodeSelector:
    kubernetes.io/hostname: 'k8s-master1'
  tolerations:
  - key: node-role.kubernetes.io/master
    effect: NoSchedule
    operator: Exists
```

### 测试

```sh
# kubectl exec -it -n test kubectl -- bash

root@k8s-master1:~/dockerfile/kubectl# kubectl exec -it -n test kubectl -- bash

root@kubectl:/# kubectl get ns  
NAME                              STATUS   AGE
america-node                      Active   42h
app-name                          Active   44d
darknet-nodes                     Active   98d
...
```

