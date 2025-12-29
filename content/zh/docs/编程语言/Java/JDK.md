---
title: "JDK"
---


## JDK 概述

- JDK 即Java语言的软件开发工具包，JDK协议基于JRL协议
- JDK 大致分为两种，分别是Open JDK 和 Oracle JDK
  - **Open JDK：**
    - 开源 JDK，测试环境常用，生产中不常用
    - 官网：http://openjdk.java.net/
  - **Oracle JDK：**
    - 正宗 JDK，生产中常用
    - 相对来说，Oracle JDK 具有更好的响应能力和JVM性能，更加稳定
    - 官网：https://www.oracle.com/java/
- **目前主流的使用的JDK版本是 JDK 8 或 JDK 11  **





## Open JDK 安装

## JDK8

### Centos

```bash
## yum -y install java-1.8.0-openjdk
```

### Ubuntu

```bash
## apt -y install openjdk-8-jdk
```

## JDK11

### Centos

- ...

### Ubuntu

#### apt安装

```bash
## apt install openjdk-11-jdk
```









## Oracle JDK 安装

- 官方下载地址：https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html
- 需注册后才能下载

## JDK8

### centos

#### rpm安装

```bash
[root@18 ~]# ll jdk-8u301-linux-x64.rpm 
-rw-r--r-- 1 root root 114544504 Sep 11 23:42 jdk-8u301-linux-x64.rpm

#安装jdk，无依赖包
[root@18 ~]# yum -y install jdk*.rpm
[root@18 ~]# java -version
java version "1.8.0_301"
Java(TM) SE Runtime Environment (build 1.8.0_301-b09)
Java HotSpot(TM) 64-Bit Server VM (build 25.301-b09, mixed mode)

#初始化环境变量，将可执行文件加入到PATH变量
[root@18 ~]# vim /etc/profile.d/jdk.sh
export JAVA_HOME=/usr/java/default
export PATH=${JAVA_HOME}/bin/:${PATH}
#以下两项非必选项
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/

#生效
[root@18 ~]# . /etc/profile.d/jdk.sh
```

#### 二进制安装

```bash
[root@18 ~]# tar xf jdk*.tar.gz -C /usr/local/
[root@18 ~]# cd /usr/local/
[root@18 local]# ln -s jdk1.8.0_301/ jdk

#初始化环境变量，不配置tomcat服务将无法启动
[root@18 ~]# vim /etc/profile.d/jdk.sh
export JAVA_HOME=/usr/local/jdk
export PATH=${JAVA_HOME}/bin/:${PATH}
#以下两项非必选项
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/

#生效
[root@18 ~]# . /etc/profile.d/jdk.sh

#验证版本
[root@18 ~]# java -version
java version "1.8.0_301"
Java(TM) SE Runtime Environment (build 1.8.0_301-b09)
Java HotSpot(TM) 64-Bit Server VM (build 25.301-b09, mixed mode)
```



### Ubuntu

#### 二进制安装

```bash
root@ubuntu:/usr/local/src# mkdir /apps
root@ubuntu:/usr/local/src# tar xf jdk*.tar.gz -C /apps/
root@ubuntu:/usr/local/src# cd /apps/
root@ubuntu:/apps# ln -s jdk1.8.0_311/ jdk


#初始化环境变量，不配置tomcat服务将无法启动
root@ubuntu:/apps# vim /etc/profile.d/jdk.sh
export JAVA_HOME=/apps/jdk
export PATH=${JAVA_HOME}/bin/:${PATH}
#以下两项非必选项
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/

#生效
root@ubuntu:/apps# . /etc/profile.d/jdk.sh

#验证版本
[root@18 ~]# java -version
java version "1.8.0_301"
Java(TM) SE Runtime Environment (build 1.8.0_301-b09)
Java HotSpot(TM) 64-Bit Server VM (build 25.301-b09, mixed mode)
```



## JDK11

- **官方下载地址**：https://www.oracle.com/java/technologies/downloads/#java11
- 需注册登录后才能下载

### Centos

#### rpm

```bash
#验证安装包
## ls -l /usr/local/src/jdk-11.0.14_linux-x64_bin.rpm 
-rw-r--r-- 1 root root 151500100 Mar 10 12:01 /usr/local/src/jdk-11.0.14_linux-x64_bin.rpm

#安装
## yum -y install /usr/local/src/jdk-11.0.14_linux-x64_bin.rpm

#验证安装
## java -version
java version "11.0.14" 2022-01-18 LTS
Java(TM) SE Runtime Environment 18.9 (build 11.0.14+8-LTS-263)
Java HotSpot(TM) 64-Bit Server VM 18.9 (build 11.0.14+8-LTS-263, mixed mode)
```



## jdk_install.sh

```sh
#!/bin/bash
JDK_VERSION="jdk-8u333-linux-x64.tar.gz"
JDK_POSITION="/usr/local/src/${JDK_VERSION}"
JDK_DEST="/usr/local"

tar xf ${JDK_POSITION} -C ${JDK_DEST}

cd ${JDK_DEST}
ln -sv jdk* jdk

JAVA_HOME="${JDK_DEST}/jdk"
cat > /etc/profile.d/jdk.sh <<EOF
export JAVA_HOME="${JAVA_HOME}"
export PATH="${JAVA_HOME}/bin/:\$PATH"
export JRE_HOME="${JAVA_HOME}/jre"
export CLASSPATH="${JAVA_HOME}/lib/:${JRE_HOME}/lib/"
EOF

. /etc/profile.d/jdk.sh

java -version
```



## JRE和JDK的区别

- **JDK**：开发java程序用的开发包，JDK里面有java的运行环境(JRE)，包括client和server端的，需要配置环境变量 

- **JRE**：运行java程序的环境，JVM，JRE里面只有client运行环境，安装过程中，会自动添加PATH
- 参考链接：https://blog.csdn.net/dingwenshuai/article/details/78083266
