---
title: "SonarQube"
---

# SonarQube 概述

http://www.sonarqube.org/

SonarQube是一种自动代码审查工具，用于检测代码中的错误、漏洞和代码异味，它集成到 现有的工作流程，以便在项目分支和拉取（PR）请求之间进行连续的代码检查；

SonarQube 是一个开源的用于代码质量管理的开放平台，通过插件机制，SonarQube可以集成不同的测试工具，代码分析工具，以及持续集成工具。与持续集成工具（例如 Hudson/Jenkins 等）不同，SonarQube 并不是简单地把不同的代码检查工具结果（例如 FindBugs，PMD 等）直接显示在 Web页面上，而是通过不同的插件对这些结果进行再 加工处理，通过量化的方式度量代码质量的变化，从而可以方便地对不同规模和种类的工程进行代码质量管理。在对其他工具的支持方面，Sonar不仅提供了对 IDE的支持，可以在 Eclipse 和 IntelliJ IDEA 这些工具里联机查看结果；同时 Sonar 还对大量的持续集成工具提供了接口支持，可以很方便地在持续集成中使用 SonarQube,此外，SonarQube 的插件还可以对 Java以外的其他编程语言提供支持，对国际化以及报告文档化也有良好的支持。



## 代码质量的七大考量点

- **编码规范**：是否遵守了编码规范，遵循了最佳实践。

- **潜在的 BUG**：可能在最坏情况下出现问题的代码，以及存在安全漏洞的代码。
- **文档和注释**：过少（缺少必要信息）、过多（没有信息量）、过时的文档或注释。

- **重复代码**：违反了 Don’t Repeat Yourself 原则。
- **复杂度**：代码结构太复杂（如圈复杂度高），难以理解、测试和维护。

- **测试覆盖率**：编写单元测试，特别是针对复杂代码的测试覆盖是否足够。
- **设计与架构**：是否高内聚、低耦合，依赖最少。



## 相关端口

- **TCP / 9000** SonarQube WEB UI



## 相关组件

- SonarQube有四个关键组件：

**SonarQube Server**

- 主要负责运行以下三个进程：

  - Web Server：UI

  - Search Server：为UI提供搜索功能，基于ElasticSearch

  - Compute Engine Server：处理代码分析报告并将之存储到SonarQube Database中

**SonarQube Database**

- 负责存储SonarQube的配置，以及项目的质量快照等

**SonarQube Plugin**

- SonarQube 插件化的应用

**SonarScanner**

- Code analysis Scanners：代码扫描器，扫描后将报告提交给SonarQube Server



## 质量阈

- 在SonarQube中，质量阈是一组预定义的评估条件；代码质量扫描结果可满足这组条件时， 项目才会被标记为“passed”；
- 管理员也可以在SonarQubeUI上按需自定义并调用质量阈；



# SonarQube 单机部署

https://docs.sonarqube.org/8.9/setup/install-server/

https://docs.sonarqube.org/8.9/requirements/requirements/



## DB

- Microsoft SQL Server、Oracle、PostgreSQL 都可以作为 sonarqube 的数据库；

### PostgreSQL

- 安装过程省略，注意版本为9.6或以上；
- 进入 postgresql 控制台后进行以下操作，配置完成后可以执行`\q` 退出postgresql

```sql
# 创建一个sonarqube的用户并设置密码为123456
CREATE USER sonarqube WITH ENCRYPTED PASSWORD '123456';


# 创建一个sonarqube的数据库，并设定其隶属于sonarqube用户
CREATE DATABASE sonarqube OWNER sonarqube;


# sonarqube用户在sonarqube数据库上授予最大给权限
# 注意：前面的sonarqube表示数据库，后面的sonarqube表示用户
GRANT ALL PRIVILEGES ON DATABASE sonarqube TO sonarqube;
```

#### 验证

```sh
# psql -U sonarqube -h localhost
Password for user sonarqube: # 输入密码
psql (12.12 (Ubuntu 12.12-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

sonarqube=> 


# 如与postgresql不在同一主机，还需测试是否能进行远程登录
# psql -U sonarqube -h 10.0.0.103
```



## SonarQube

### 创建 sonarqube 账号

SonarQube 无法使用root身份运行需要创建一个 sonarqube的普通账号

- `useradd -m -s /bin/bash sonarqube`



### limit文件优化

```sh
# vim /etc/security/limits.conf
...
sonarqube   -   nofile   131072 # 运行 SonarQube 的用户可以打开至少 131072 个文件描述符
sonarqube   -   nproc    8192 # 运行 SonarQube 的用户至少可以打开 8192 个线程
...


# 验证（修改后需重启后才能生效，或者使用命令同时进行临时修改）
ulimit -a # 看不到对单一用户修改的？
```



### 内核参数优化

```sh
# vim /etc/sysctl.conf 
...
vm.max_map_count = 524288  #大于或等于 524288
fs.file-max = 293718  #大于或等于 131072
...

# sysctl -p
...
```



### 准备 JDK

- 安装过程省略，需要安装 JDK11 以上版本

```sh
# java -version 
openjdk version "11.0.14.1" 2022-02-08 LTS
OpenJDK Runtime Environment 18.9 (build 11.0.14.1+1-LTS)
OpenJDK 64-Bit Server VM 18.9 (build 11.0.14.1+1-LTS, mixed mode, sharing)
```



### 准备 sonarqube

- sonarqube要使用LTS长期支持版

```bash
# cd /usr/local/src/

# wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-8.9.10.61524.zip


# unzip /usr/local/src/sonarqube-8.9*.zip -d /usr/local/



# ln -sv /usr/local/sonarqube-8.9* /usr/local/sonarqube


# chown -R sonarqube.sonarqube /usr/local/sonarqube*
```



### 修改 sonarqube 配置文件

- /usr/local/sonarqube/conf/sonar.properties

```bash
...
# 修改连接数据库的账号和密码
sonar.jdbc.username=sonarqube
sonar.jdbc.password=123456
...
# 修改数据库地址和库名（10.0.0.103数据库地址，sonar数据库名称）
sonar.jdbc.url=jdbc:postgresql://10.0.0.103/sonarqube
...
# 设定Web Server监听的地址和端口
sonar.web.host=0.0.0.0
sonar.web.port=9000
...
# 如有必要，可修改SonarQube持久存储数据的位置，以下两个相对路径，均起始于sonarqube的安装目录，我们也可以使用绝对路径；
sonar.path.data=data
sonar.path.temp=temp
```

#### 其他

- 若有必要，可编辑conf/wrapper.conf配置文件，指定java的路径

```sh
wrapper.java.command=java
```



### 启动 sonarqube

```bash
# 启动（注意！不要以root身份启动，否则会失败）
su - sonarqube -c "/usr/local/sonarqube/bin/linux-x86-64/sonar.sh start"

#如未启动观察日志
tail -f /usr/local/sonarqube/logs/*.log
```



### service 文件

- java启动的最大和最小内存是32M，有点小，可以适当调大
- /etc/systemd/system/sonarqube.service

```bash
[Unit]
Description=SonarQube service
After=syslog.target network.target

[Service]
Type=simple
User=sonarqube
Group=sonarqube
PermissionsStartOnly=true
ExecStart=/bin/nohup /usr/bin/java -Xms32m -Xmx32m -Djava.net.preferIPv4Stack=true -jar /usr/local/sonarqube/lib/sonar-application-8.9.10.61524.jar
StandardOutput=syslog
LimitNOFILE=131072
LimitNPROC=8192
TimeoutStartSec=5
Restart=always
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```





## 验证

- 使用shell脚本 或 service文件的方式启动后：

```bash
# 浏览器访问，默认账号和密码都是admin
http://10.0.0.100:9000/
```



# SonarScanner 单机部署

https://docs.sonarqube.org/8.9/analysis/scan/sonarscanner/

- SonarQube的扫描器可以和Jenkins部署在同一台主机，环境比较大时 也可以安装在单独的一台服务器上
- 单独安装在一台服务器上时，可以将公钥推送到gitlab上 从而直接去gitlab上拉取代码从而分析，也可以交由Jenkins去gitlab上拉取代码 再推送到SonarQube扫描器主机上



## 安装 sonarscanner

```bash
# cd /usr/local/src/


# wget - https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.7.0.2747-linux.zip


# unzip sonar-scanner-cli-4.7.0.2747-linux.zip -d /usr/local/


# ln -sv /usr/local/sonar-scanner-4.7.0.2747-linux /usr/local/sonar-scanner

# ln -vs /usr/local/sonar-scanner/bin/* /bin/


# 验证
# sonar-scanner -h
```



## sonarscanner 配置 

- /usr/local/sonar-scanner/conf/sonar-scanner.properties

```bash
sonar.host.url=http://10.0.0.100:9000 # SonarQube服务端的IP和端口

sonar.sourceEncoding=UTF-8 # 指定字符集，默认即utf-8
```



## 手动测试扫描

https://docs.sonarqube.org/8.9/analysis/languages/cfamily/

- **先决条件：**
  - 安装了 sonarscanner扫描器，并进行了配置指向了 sonarqube server
  - 在项目的根目录中创建一个名为`sonar-project.properties `的文件
- **注意事项：**
  - 大多数语言只支持源码扫描，少部分语言支持编译后的代码静态分析

### sonar-project.properties

https://docs.sonarqube.org/8.9/analysis/analysis-parameters/

- 此文件要放置在项目的根目录下

```bash
# 项目的唯一键，支持数字、字母、-、_、: 例如：<groupId>:<artifactId>
sonar.projectKey=test-project

# 在web界面上显示的名称
sonar.projectName=test

# 项目版本（如果第二次扫描未修改项目版本，则覆盖第一次扫描的输出信息）
sonar.projectVersion=1.0

# 需要分析的源码所在的目录，多个目录时使用","来进行分割
sonar.sources=.

# targe的位置
sonar.java.binaries=.

# 源文件的编码格式
sonar.sourceEncoding=UTF-8

# SonarQube的登录账号
sonar.login=admin

# SonarQube登录账号对应的密码
sonar.password=admin123


# 指定项目中使用的编程语言
sonar.language=java

# 等待 Web 服务调用响应的最长时间（以秒为单位），默认60秒，如果加载较慢导致超时，可以修改此参数将时间延长
#sonar.ws.timeout


```



### 执行测试

- 一定要在 sonar-project.properties 文件所在的路径执行

```bash
sonar-scanner
```



# SonarQube Plugin

## 中文插件

- https://github.com/xuhuisheng/sonar-l10n-zh/releases

```sh
# 安装插件（安装完成后需在web界面或命令行界面重启才能生效）
Administration --> Marketplace --> Plugins --> search --> chinese --> Chinese Pack --> 同意风险 --> 安装



# 插件下载后存放的位置
# ls -l /usr/local/sonarqube/extensions/downloads/
total 64
-rw-r--r-- 1 sonarqube sonarqube 61903 Mar 10 13:52 sonar-l10n-zh-plugin-8.9.jar

# 插件下载完成安装后的地址（也可以直接将插件存放此处重启后生效）
# ls -l /usr/local/sonarqube/extensions/plugins/
total 68
-rw-r--r-- 1 sonarqube sonarqube   737 Feb  4 08:23 README.txt
-rw-r--r-- 1 sonarqube sonarqube 61903 Mar 10 13:52 sonar-l10n-zh-plugin-8.9.jar
```













# ---

# 实战案例：Jenkins+Gitlab+Shell Script+SonarQube实现测试环境部署代码并进行代码质量测试

- 这里是Jenkins和SonarQube在同一台主机
- **拉取代码操作交由shell脚本执行**

## 先决条件

- Jenkins以root身份运行
- Jenkins和被部署的web服务器建立了ssh免密登录
- Jenkins自身去gitlab拉取代码的话需要将私钥部署在Jenkins端，公钥部署在gitlab端 即gitlab配置ssh免密clone代码

## Jenkins配置

- 选择一个测试环境的构建任务 --> 配置 --> 构建 --> 执行shell
- 保存

### shell脚本

- **Jenkins在发现代码执行失败后就不会向下执行了，即 "代码clone失败 请检查后重试 退出" 这段压根就不会显示**

```bash
#!/bin/bash
DATE=`date +%F_%H-%M-%S`
APP_NAME="myapp-v6.0"
CLONE_BRANCH="develop" #clone的分支
PORJECT_NAME="dev-app1" #项目名称
TOMCAT_ADDR="
10.0.0.38
"

#删除原有clone目录
rm -fr ${PORJECT_NAME}

#clone代码
git clone -b ${CLONE_BRANCH} git@10.0.0.38:app1-dev/dev-app1.git

#判断代码是否clone成功
if [ ${?} -eq 0 ];then
    echo '代码clone成功 下一步进行代码扫描' && sleep 3
else
    echo '代码clone失败 请检查后重试 退出' && exit
fi

cd dev-app1/ && /usr/bin/sonar-scanner #进入代码目录并进行扫描

#判断代码扫描是否成功
if [ ${?} -eq 0 ];then
    echo '代码扫描成功 请登录SonarQube页面查看扫描结果 下一步将代码拷贝到tomcat-server'
else
    echo '代码扫描失败 请检查后重试 退出' && exit
fi

#压缩代码
tar zcvf myapp.tar.gz --exclude=README.md  myapp/

#拷贝代码到远程tomcat-server
for IP in ${TOMCAT_ADDR};do
  scp myapp.tar.gz ${IP}:/data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz
  if [ ${?} -eq 0 ];then
      echo "${APP_NAME}-${DATE}.tar.gz --> tomcat-server:${IP} 拷贝完成"
  else
      echo "${APP_NAME}-${DATE}.tar.gz --> tomcat-server:${IP} 拷贝失败 请检查后重试 退出" && exit
  fi  
done  

echo '代码全部拷贝完成 下面开始停止tomcat服务' && sleep 3

#停止tomcat服务
for IP in ${TOMCAT_ADDR};do
  ssh ${IP} /usr/local/tomcat/bin/catalina.sh stop
  if [ ${?} -eq 0 ];then
      echo "tomcat-server:${IP} 服务停止成功"
  else
      echo "tomcat-server:${IP} 服务停止失败 请检查后重试 退出" && exit
  fi
done

echo '下面开始解压代码实现部署' && sleep 3

#解压代码以实现部署,然后修改远程部署目录的所有者所属组为tomcat
for IP in ${TOMCAT_ADDR};do
      ssh ${IP} tar xvf /data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz -C /data/tomcat/tomcat_webdir/
      ssh ${IP} chown -R tomcat.tomcat  /data/tomcat/
  if [ ${?} -eq 0 ];then
      echo "tomcat-server:${IP} 服务部署成功"
  else
      echo "tomcat-server:${IP} 服务部署失败 请检查后重试 退出" && exit
  fi
done

echo '服务部署成功 下面开始启动tomcat服务' && sleep 3

#启动tomcat服务
for IP in ${TOMCAT_ADDR};do
  ssh ${IP} /usr/local/tomcat/bin/catalina.sh start
  if [ ${?} -eq 0 ];then
      echo "tomcat-server:${IP} 服务启动成功"
  else
      echo "tomcat-server:${IP} 服务启动失败 请检查后重试 退出" && exit
  fi
done

echo '部署完毕'
```





## 代码配置

- sonar-project.properties文件 push到gitlab

```bash
#原有develop分支的代码clone下来
git clone -b develop git@10.0.0.38:app1-dev/dev-app1.git

#加以修改
[root@jenkins dev-app1]# tree 
.
├── myapp
│   ├── index.html
│   └── python-code
│       └── test.py
├── README.md
└── sonar-project.properties #主要是添加此文件


#sonar-project.properties文件内容
sonar.projectKey=test-project
sonar.projectName=test2
sonar.projectVersion=2.0
sonar.sources=myapp
sonar.sourceEncoding=UTF-8
sonar.login=admin
sonar.password=123

#推送到gitlab仓库的develop分支
[root@jenkins dev-app1]# git add ./*
[root@jenkins dev-app1]# git commit -m 'v6'
[root@jenkins dev-app1]# git push
```



