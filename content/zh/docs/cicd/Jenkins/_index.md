---
title: "Jenkins"
---

# Jenkins 概述

- 针对运维实现持续部署
- 配置要求：一般生产中4C、8G、50G就可以满足要求
- 基于Java开发，**安装需要依赖JDK**，生产者要使用orocal的JDK，不要使用openjdk
- 官网：https://www.jenkins.io/zh/



# Jenkins 部署

https://www.jenkins.io/zh/doc/book/installing/

## docker

```sh
docker pull jenkins/jenkins:lts-jdk11
docker rm -f jenkins
docker run \
--name jenkins \
-u root \
--restart always \
-d \
-p 80:8080 -p 50000:50000 \
-v jenkins_home:/var/jenkins_home \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /usr/bin/docker:/usr/bin/docker \
-v /etc/localtime:/etc/localtime:ro \
-v /etc/timezone:/etc/timezone:ro \
jenkins/jenkins:lts-jdk11
```



## yum

https://mirrors.aliyun.com/jenkins/

https://mirrors.tuna.tsinghua.edu.cn/jenkins/

依赖JDK，一般要求JDK11+

```BASH
wget https://mirrors.tuna.tsinghua.edu.cn/jenkins/redhat-stable/jenkins-2.319.3-1.1.noarch.rpm

yum -y install ./jenkins-2.319.3-1.1.noarch.rpm

systemctl enable --now jenkins.service
```





# Jenkins 部署后配置

## 指向国内代理

- 要在解锁Jenkins前进行此步骤

### 指向阿里云镜像站


```bash
root@ubuntu:~# cat /var/lib/jenkins/hudson.model.UpdateCenter.xml 
<?xml version='1.1' encoding='UTF-8'?>
<sites>
  <site>
    <id>default</id>
    <url>https://mirrors.aliyun.com/jenkins/updates/update-center.json</url>
  </site>
```

### 指向清华大学镜像站

- 注意：如果在Jenkins的插件管理中点击了立即获取，则有可能导致插件代理指向重新加载而导致又执行国外，判断方法：
  - grep -o 'mirrors.tuna.tsinghua.edu.cn' /var/lib/jenkins/updates/default.json
  - grep -o 'updates.jenkins.io' /var/lib/jenkins/updates/default.json
- 一定要等待Jenkins初始化完毕后再进行如下修改，修改完成后再贴入密钥并安装推荐插件

```bash
# sed -ir 's@https://updates.jenkins.io/update-center.json@https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json@g'  /var/lib/jenkins/hudson.model.UpdateCenter.xml

---

# sed -ir 's@updates.jenkins.io/download/@mirrors.tuna.tsinghua.edu.cn/jenkins/@g' /var/lib/jenkins/updates/default.json
```







# Jenkins 相关文件

```bash
/var/lib/jenkins/plugins/ #插件存放目录
```



# Jenkins 配置文件

- /etc/sysconfig/jenkins

```bash
JENKINS_HOME=/var/lib/$NAME #所有产生的数据的家目录

MAXOPENFILES=8192 #最大打开的文件数量，可以调大一些，如：65536

HTTP_PORT=8080 #http端口，如果同时也安装了tomcat，可以修改此端口防止冲突

JENKINS_USER=root #设为root，避免以后执行脚本等操作会出现的权限问题
JENKINS_GROUP=root #新版本不存在 即只有JENKINS_USER，老版本需设为root，避免以后执行脚本等操作会出现的权限问题
```



# ---



# 常见代码部署方式

- **增量发布：**只覆盖需要变更的文件，优点：速度快，缺点：因为只覆盖部分变化的文件 所以不能保证文件是否有遗漏
- **全量发布：**常用，全部文件覆盖，优点：能确保所有文件的一致性，缺点：速度慢

## 蓝绿部署

蓝绿部署指的是不停老版本的代码(不影响上一个版本的访问)，而是在另外一套环境部署新版本然后进行测试，测试通过后将用户流量切到新版本，其特点为业务无中断，升级风险较小

### 蓝绿部署流程：

1. 当前版本正常访问(V1)
2. 在另外一套环境部署新代码(V2)，代码可能是增加了功能或者是修复了某些BUG
3. 测试通过之后将用户请求流量切换到新版本环境
4. 观察一段时间，如有异常直接回滚切换到旧版本
5. 下次升级，将最初的旧版本升级到新版本(V3)

### 蓝绿部署适用的场景：

1. 不停止老版本，额外部署一套新版本，等测试发现新版本OK后，删除老版本
2. 蓝绿发布是一种用于升级与更新的发布策略，部署的最小维度是容器，而发布的最小维度是应用

### 蓝绿部署的缺点：

1. 需要两组相同环境的服务器(测试、生成分别一组)，所以成本较高(一般大公司才用)
2. 蓝绿发布对于增量升级有比较好的支持，但是对于涉及数据表结构变更等不可逆转的升级 并不完全适合用蓝绿发布来实现，需要结合一些业务的逻辑以及数据迁移与回滚的策略才可以完全满足需求



## 金丝雀发布

金丝雀发布又称灰度发布，是指在黑与白之间 平滑过渡的一种方式，灰度发布是增量发布的一种类型，灰度发布是在原有版本可用的情况下，同时部署一个新版本作为金丝雀(小白鼠) 以测试新版本的表现，当新版本无问题时，再逐步或统一发布到新版本，反之，如果新版本出现问题 可以下线这个新版本，从而不影响业务的正常访问

灰度发布可以保证整体系统的稳定，在初始灰度的时候就可以发现、调整问题，以保证其影响度

### 金丝雀(灰度)发布流程：

1. 准备好部署各个阶段的工作，包括：构建工作，测试脚本，配置文件和部署清单文件。
2. 从负载均衡列表中移除掉“金丝雀”服务器(即老版本可以正常访问的服务器)。
3. 升级“金丝雀”应用（排掉原有流量并进行部署）
4. 对应用进行自动化测试
5. 将“金丝雀”服务器重新添加到负载均衡列表中（连通性和健康检查）
6. 如果“金丝雀”在线使用测试成功，则升级其他剩余的服务器（否则就回滚）

### 金丝雀(灰度)部署适用的场景：

1. 不停止老版本，额外搞一套新版本，不同版本应用共存
2. 灰度发布中，常常按照用户设置路由权重，例如：90%的用户维持老版本，10%的用户尝鲜新版本
3. 经常与A/B测试一起使用，用于测试选择多种方案



## 滚动发布

- 逐步升级替换，一般是取出一个或者多个服务器停止服务，执行更新，并重新将其投入使用，周而复始，直到集群中所有的实例都更新成新版本




## A/B测试

- A/B测试也是同时运行两个APP环境，但是和蓝绿部署完全是两码事，A/B测试是用来测试应用功能表现的方法，例如可用性、受欢迎程度、可见性等等，蓝绿部署的目的是安全稳定地发布新版本应用，并在必要时回滚，即蓝绿部署是一套正式环境在线，而A/B测试是两套正式环境在线















# Jenkins 代码clone

- **从gitlab克隆代码有两种实现方式：**
  1. 编写shell脚本或命令去gitlab克隆代码（常用）
  2. 让Jenkins自动去gitlab克隆代码（这种方式需要使用ssh的方式clone）

## shell命令拉取代码

- **注意事项：**
  1. Jenkins必须以非交互的方式拉取代码，所以需要在Jenkins上配置ssh密钥

### 配置ssh密钥

```bash
#生成公钥私钥对
[root@jenkins ~]# ssh-keygen 
...

#生成的私钥和公钥
[root@jenkins ~]# ls -a .ssh/
id_rsa  id_rsa.pub
```

### 将公钥推送到gitlab上

- gitlabweb --> 右上角头像 --> 偏好设置 --> ssh密钥 --> 将公钥复制到框中(标题会根据复制的公钥自动生成) --> 添加密钥

### 测试clone

```bash
#centos默认没有git命令，需要安装
[root@jenkins ~]# yum -y install git

#clone，
[root@jenkins ~]# git clone git@10.0.0.38:app1-dev/dev-app1.git
```



## Jenkins拉取代码

### 配置ssh密钥

```bash
#生成公钥私钥对
[root@jenkins ~]# ssh-keygen 
...

#生成的私钥和公钥
[root@jenkins ~]# ls -a .ssh/
id_rsa  id_rsa.pub
```

### 将公钥推送到gitlab上

- gitlabweb --> 右上角头像 --> 偏好设置 --> ssh密钥 --> 将公钥复制到框中(标题会根据复制的公钥自动生成) --> 添加密钥

### 将私钥添加到Jenkins web端

- 系统管理 --> manage credentials(管理凭据) --> Jenkins --> 全局凭据 --> 添加凭据 --> 
  - 类型：SSH Username with private key
  - 范围：全局
  - ...
  - Username：root（哪个用户创建的私钥就指定哪个用户）
  - 私钥：
    - 直接输入√
    - 将私钥直接复制到框中
  - 密码：
    - 私钥有密码则需输入密码
  - 确定
- **完成上面的操作即可实现Jenkins自身使用私钥去gitlab上拉取代码（前提是gitlab上有与之配对的公钥）**

### 将Jenkins私钥和指定的gitlab仓库关联

- 选择一个项目 --> 配置 --> 源码管理
  - Git √
  - Repository URL：输入gitlab上的clone指令
    - 如：git@10.0.0.38:app1-dev/dev-app1.git
  - Credentials：选择Jenkins（其实旁边的"添加"也可以添加密钥凭证）
  - Branches to build（有分支需求时可以更改此项）
    - 指定分支，为空时代表any
  - 保存

### Jenkins拉取代码测试

- 选择刚才关联私钥的项目 --> 立即构建 --> 构建 --> 立即构建
- 最后可以在构建历史的控制台输出查看构建日志以及是否成功构建

### 小结

- 通过jenkins拉取的代码存放于此目录
- **web界面的工作空间中也可以看到拉取的代码**

```bash
[root@jenkins ~]# tree /var/lib/jenkins/workspace/project1/
/var/lib/jenkins/workspace/project1/
├── myapp
│   └── index.html
└── README.md
```







# Jenkins 代码部署基础实现

## 先决条件

1. Jenkins以root身份运行
2. Jenkins和被部署的web服务器建立了ssh免密登录
3. Jenkins自身去gitlab拉取代码的话需要将私钥部署在Jenkins端，公钥部署在gitlab端 即gitlab配置ssh免密clone代码



## 完全通过shell脚本实现部署生产环境

- 选择一个项目 --> 配置 --> 构建 --> 增加构建步骤 --> 执行shell

### 构建的shell脚本

- 实际生成环境要更加复杂，这里只做参考
- **正常还需要停止tomcat然后从负载均衡中去除然后升级**

```bash
DATE=`date +%F_%H-%M-%S`
APP_NAME="myapp-v3.0"
rm -fr dev-app1
git clone git@10.0.0.38:app1-dev/dev-app1.git
cd dev-app1/
tar zcvf myapp.tar.gz --exclude=README.md  myapp/
scp myapp.tar.gz 10.0.0.28:/data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz
scp myapp.tar.gz 10.0.0.38:/data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz
ssh 10.0.0.28 /usr/local/tomcat/bin/catalina.sh stop
ssh 10.0.0.38 /usr/local/tomcat/bin/catalina.sh stop
ssh 10.0.0.28 tar xvf /data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz -C /data/tomcat/tomcat_webdir/
ssh 10.0.0.38 tar xvf /data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz -C /data/tomcat/tomcat_webdir/
ssh 10.0.0.28 chown -R tomcat.tomcat /data/tomcat/
ssh 10.0.0.38 chown -R tomcat.tomcat /data/tomcat/
ssh 10.0.0.28 /usr/local/tomcat/bin/catalina.sh start
ssh 10.0.0.38 /usr/local/tomcat/bin/catalina.sh start
```

#### tomcat页面配置参考

```bash
[root@tomcat-node1 ~]# tree /data/
/data/
└── tomcat
    ├── tomcat_appdir #存放代码压缩包的目录
    │   └── myapp.tar.gz
    ├── tomcat_webapps #tomcat的页面主目录，以软连接的方式指向解压后的目录
    │   └── myapp -> /data/tomcat/tomcat_webdir/myapp/
    └── tomcat_webdir #代码解压后的目录
        └── myapp
            └── index.html
```

### 构建后测试

- 选择一个项目 --> 立即构建

```bash
[root@localhost ~]#curl 10.0.0.28:8081/myapp -L
<h1>app1 page v1 </h1>
[root@localhost ~]#curl 10.0.0.38:8081/myapp -L
<h1>app1 page v1 </h1>
```

### gitlab再次提交代码

```bash
[root@jenkins ~]# vim dev-app1/myapp/index.html 
<h1>app1 page v1 </h1>
<h1>app1 page v2 </h1>

#提交
[root@jenkins ~]# cd dev-app1/
[root@jenkins dev-app1]# git add ./*
[root@jenkins dev-app1]# git commit -m 'v2'
[root@jenkins dev-app1]# git push
```

### 再次构建后测试

```bash
[root@localhost ~]#curl 10.0.0.28:8081/myapp -L
<h1>app1 page v1 </h1>
<h1>app1 page v2 </h1>
[root@localhost ~]#curl 10.0.0.38:8081/myapp -L
<h1>app1 page v1 </h1>
<h1>app1 page v2 </h1>
```

### 小结

- **拉取代码等操作后的存放目录：**
- 在web界面中的工作空间也可以看到

```bash
[root@jenkins ~]# tree /var/lib/jenkins/workspace
/var/lib/jenkins/workspace
├── project1
│   └── dev-app1
│       ├── myapp
│       │   └── index.html
│       ├── myapp.tar.gz
│       └── README.md
└── project1@tmp
```





## Jenkins拉取代码+shell脚本 实现部署测试或生产环境

- 选择测试或生产环境的项目 --> 配置
- **源码管理：** 
  - Git √ 
  - Repository URL：如：git@10.0.0.38:app1-dev/dev-app1.git（**一定要选择ssh clone**）
  - Credentials：添加一个之前创建的秘钥（秘钥添加方法参考上面的 Jenkins代码clone --> Jenkins拉取代码）
  - 指定分支：
    - ***/develop**（如果是测试环境一定要选择develop分支，因为生产中develop分支通常都是测试分支）
    - ***/master**（如果是测试环境一定要选择master分支，因为生产中develop分支通常都是生产分支）
- 构建：执行shell（参考下面构建的shell脚本）
- 保存

### 构建的shell脚本

- 实际生成环境要更加复杂，这里只做参考

```bash
tar zcvf myapp.tar.gz --exclude=README.md  myapp/
scp myapp.tar.gz 10.0.0.28:/data/tomcat/tomcat_appdir/
ssh 10.0.0.28 /usr/local/tomcat/bin/catalina.sh stop
ssh 10.0.0.28 tar xvf /data/tomcat/tomcat_appdir/myapp.tar.gz -C /data/tomcat/tomcat_webdir/
ssh 10.0.0.28 chown -R tomcat.tomcat /data/tomcat/
ssh 10.0.0.28 /usr/local/tomcat/bin/catalina.sh start
```



# Jenkins 代码回滚基础实现

## 先决条件

1. Jenkins以root身份运行
2. Jenkins和被部署的web服务器建立了ssh免密登录

## 实现代码回滚

### 实现前测试

- 假设现在版本为v4，而v4版本有问题，需要回滚到v2

```bash
[root@localhost ~]#curl 10.0.0.100:/myapp -L
<h1>app1 page v1 </h1>
<h1>app1 page v2 </h1>
<h1>app1 page v3 </h1>
```

### Jenkins配置

- 选择或创建回滚项目 --> 配置 --> 构建 --> 增加构建步骤 --> 执行shell（**注意：这里不用Jenkins clone代码，因为Jenkins clone可能会出现问题**）

### 回滚的shell脚本

- 实际生成环境要更加复杂，这里只做参考
- **正常还需要停止tomcat然后从负载均衡中去除然后升级**

```bash
DATE=`date +%F_%H-%M-%S`
APP_NAME="myapp-v2.0"
rm -fr dev-app1
git clone git@10.0.0.38:app1-dev/dev-app1.git
cd dev-app1/
git reset --hard HEAD^ #回滚操作
tar zcvf myapp.tar.gz --exclude=README.md  myapp/
scp myapp.tar.gz 10.0.0.28:/data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz
scp myapp.tar.gz 10.0.0.38:/data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz
ssh 10.0.0.28 /usr/local/tomcat/bin/catalina.sh stop
ssh 10.0.0.38 /usr/local/tomcat/bin/catalina.sh stop
ssh 10.0.0.28 tar xvf /data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz -C /data/tomcat/tomcat_webdir/
ssh 10.0.0.38 tar xvf /data/tomcat/tomcat_appdir/${APP_NAME}-${DATE}.tar.gz -C /data/tomcat/tomcat_webdir/
ssh 10.0.0.28 chown -R tomcat.tomcat /data/tomcat/
ssh 10.0.0.38 chown -R tomcat.tomcat /data/tomcat/
ssh 10.0.0.28 /usr/local/tomcat/bin/catalina.sh start
ssh 10.0.0.38 /usr/local/tomcat/bin/catalina.sh start
```





# Jenkins 触发器

- Jenkins触发器可以实现开发提交代码即自动上线到测试环境，此方式因为比较危险，所以**部署生产环境时禁用**

## 实现流程

- 选择一个测试项目 --> 设置 --> 构建触发器...





# Jenkins 级联项目

- 定义多个项目 让每个项目实现不同的功能，最后将每个单一的项目串联起来，从而完成整个完整的项目
- 如：定义一个停止服务的项目、一个拷贝代码的项目、一个解压代码的项目、一个启动服务的项目等...
- **因为一旦项目定义的过多，会导致管理上的复杂，不及单一项目直观，所以生产中使用较少**

## 实现流程

- 选择一个项目 --> 设置 --> 构建(如定义停止服务的脚本) --> 构建后的操作(如拷贝代码) --> 以此类推





# Jenkins 分布式实现代码部署

- ...





# Jenkins 相关目录

- 当 Jenkins 使用 yum/apt 安装后，默认的家目录为 /var/lib/jenkins

```sh
/var/lib/jenkins/workspace/ # 所有项目和临时文件存放路径

/var/lib/jenkins/workspace/$ITEM_NAME/ # 项目相关文件存放路径

/var/lib/jenkins/workspace/$ITEM_NAME/target/ # 制品存放路径，例如编译完成的jar包

/var/lib/jenkins/workspace/$ITEM_NAME@tmp/ # 项目临时文件存放路径


```

