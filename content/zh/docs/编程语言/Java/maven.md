---
title: "maven"
---

## maven 概述

Maven 是 Apache 基金会旗下的一个纯 Java 开发的开源项目，Maven 是一个项目管理工具，可以对 Java 项目进行构建、解决打包依赖等功能

maven官网：https://maven.apache.org/

官方maven镜像：https://archive.apache.org/dist/maven/

清华maven镜像：https://mirrors.tuna.tsinghua.edu.cn/apache/maven/





## POM

- Project Object Model 项目对象模型，是 Maven 工程的基本工作单元
- 其本身是一个 XML 文件，包含了项目的基本信息，用于描述项目如何构建、声明项目依赖等
  - 因而，每个maven项目都有一个pom.xml文件；

- 在执行任务或目标时，Maven 会在当前目录中查找 pom 文件，通过读取 pom 文件获取所需的配置信息，然后执行目标
  - 首先，它将在本地repo搜索指定的依赖，而后是Maven的repo服务；
  - 若配置了远程repo服务，Maven还是搜索该repo；


**pom 文件中可以指定以下配置：**

- 项目依赖
- 插件
- 执行目标
- 项目构建 profile
- 项目版本
- 项目开发者列表
- 相关邮件列表信息



## Maven 工程构建的各个环节

- clean：将以前编译得到的旧文件class字节码文件删除；
- compile：将java源程序编译成class字节码文件；
- test：自动测试，例如，自动调用junit程序；
- report：报告测试程序执行的结果；
- package：应用打包，动态Web工程打成war包，java工程打成jar包；
- install：Maven特定的概念，是指将打包得到的文件复制到“仓库”中的指定位置
- deploy：将动态Web工程生成的war包复制到Servlet容器下，使其可以运行









## maven 部署

参考文档：

- https://maven.apache.org/download.cgi

- https://maven.apache.org/install.html

## 前期准备

- JDK 8 +

## 部署

```bash
## wget https://dlcdn.apache.org/maven/maven-3/3.8.6/binaries/apache-maven-3.8.6-bin.zip

## mkdir -p /apps

## unzip apache-maven-3.8.6-bin.zip -d /apps/

## vim /etc/profile.d/maven.sh
export PATH=/apps/apache-maven-3.8.6/bin:$PATH

## . /etc/profile.d/maven.sh

## mvn -v
Apache Maven 3.8.6 (84538c9988a25aec085021c365c560670ad80f63)
Maven home: /apps/apache-maven-3.8.6
Java version: 1.8.0_322, vendor: Red Hat, Inc., runtime: /usr/lib/jvm/java-1.8.0-openjdk-1.8.0.322.b06-11.el8.x86_64/jre
Default locale: en_US, platform encoding: UTF-8
OS name: "linux", version: "4.18.0-240.el8.x86_64", arch: "amd64", family: "unix"
```





## maven 指向国内源

Maven默认使用的是其官方存储库，在因内的下载速度较慢，因而建议使用因内的Maven镜像仓库，例如阿里的镜像仓库等；

参考链接：https://developer.aliyun.com/mvn/guide

国外镜像：

- https://repo1.maven.org/maven2/

```bash
## 配置文件位于Maven安装目录下的conf子目录中，名为settings.xml
## 镜像服务定义在<mirrors></mirrors>配置段中
## vim /apps/apache-maven-3.8.6/conf/settings.xml
...
    <mirror>
      <id>aliyunmaven</id>
      <mirrorOf>*</mirrorOf>
      <name>阿里云公共maven仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
      # 下面这个仓库是？，<url>只能指定一行 否则会报错
      #<url>http://maven.aliyun.com/nexus/content/groups/public</url>
    </mirror>
  </mirrors>
...
```







## maven 编译Java代码

**注意：需要进入到包含 "pom.xml" 的路径进行编译**

- **编译前优化**，所有的 maven 都是建立在 JVM 上的，所以进行编译的时候还需要考虑 JVM 参数优化，相关参数为 bin/mvn.cmd 文件中的 MAVEN_OPTS 参数

```bash
## vim /etc/profile.d/maven.sh
export PATH=/apps/apache-maven-3.8.6/bin:$PATH
export MAVEN_OPTS="-Xmx2g -Xms2g" #添加此行，根据生产中配置设置，此值通常不超过物理内存的一半

## . /etc/profile.d/maven.sh
```

- 跳过测试，并且不编译测试下的源代码，然后进行编译

```bash
mvn clean package -Dmaven.test.skip=true
```

- 针对较大代码量的代码进行编译的相关选项

```bash
mvn -T 2C clean install package -Dmaven.test.skip=true

#-T 2C，指定编译的CPU个数
```