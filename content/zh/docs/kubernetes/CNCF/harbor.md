---
title: "Harbor"
weight: 10
---

# Docker 仓库前言

- Docker 仓库大体分为两种，一种是公有仓库，一种是私有仓库
- harbor属于私有分布式仓库，也是目前企业中最常用的docker镜像管理仓库应用
- harbor官网：https://goharbor.io/





# harbor 安装

## 先决条件

- 必须安装docker 和 docker compose



## 下载harbor安装包并解压缩

- 下载地址：https://github.com/goharbor/harbor/releases


```sh
mkdir -p /apps

tar xf harbor-offline-installer-*.tgz -C /apps/
```

## 创建日志目录

```bash
mkdir /var/log/harbor/
```

- **新版本会自动创建**

```bash
# harbor2.3.5
root@harbor:~# ll /var/log/harbor/
total 60
drwxr-xr-x  2 10000  10000  4096 Mar 24 19:16 ./
drwxrwxr-x 10 root  syslog  4096 Mar 24 19:15 ../
-rw-r--r--  1 10000  10000 10336 Mar 24 19:15 core.log
-rw-r--r--  1 10000  10000  9936 Mar 24 19:15 jobservice.log
-rw-r--r--  1 10000  10000  2922 Mar 24 19:17 portal.log
-rw-r--r--  1 10000  10000  5919 Mar 24 19:15 postgresql.log
-rw-r--r--  1 10000  10000   440 Mar 24 19:17 proxy.log
-rw-r--r--  1 10000  10000  2701 Mar 24 19:15 redis.log
-rw-r--r--  1 10000  10000  2489 Mar 24 19:17 registryctl.log
-rw-r--r--  1 10000  10000  3240 Mar 24 19:17 registry.log
```



## 修改配置文件 harbor.cfg

```sh
# /apps/harbor/harbor.yml.tmpl
#只需修改下面两行
hostname: 10.0.0.102 # 生产中可以考虑改为域名，如：harbor.xiangzheng.vip
...
harbor_admin_password: 12345 # 修改密码，生产中要设置复杂些
# 将https相关配置注释（如果不需要）
# https related config
##https:
  # https port for harbor, default is 443
  ##port: 443
  # The path of cert and key files for nginx
  ##certificate: /your/certificate/path
  ##private_key: /your/private/key/path
...

# 修改配置文件名称
cp /apps/harbor/harbor.yml.tmpl /apps/harbor/harbor.yml
```

## 运行 harbor 安装脚本

```sh
# 先安装python
apt -y install python3

#执行 harbor 安装脚本
/apps/harbor/install.sh

#安装成功后可以看到有许多容器
docker ps -a
```

## 实现开机自启动harbor

```sh
# vim /lib/systemd/system/harbor.service
[Unit]
Description=Harbor
Requires=docker.service
After=docker.service systemd-networkd.service systemd-resolved.service
Documentation=http://github.com/vmware/harbor

[Service]
Type=simple
Restart=on-failure
RestartSec=5
ExecStart=/usr/bin/docker-compose -f /apps/harbor/docker-compose.yml up
ExecStop=/usr/bin/docker-compose -f /apps/harbor/docker-compose.yml down
ExecReload=/bin/kill -s HUP $MAINPID

[Install]
WantedBy=multi-user.target


# systemctl daemon-reload
```

## 浏览器访问测试

- 用户名admin，密码就是配置文件定义的密码12345






# harbor 一键安装脚本

```bash
#!/bin/bash
#
#********************************************************************
#Author:	     	xiangzheng
#QQ: 			    767483070
#Date: 		     	2022-03-24
#FileName：		    install_harbor.sh
#URL: 		    	https://www.xiangzheng.vip
#Email: 		    rootroot25@163.com
#Description：		The test script
#Copyright (C): 	2022 All rights reserved
#********************************************************************

#需将 docker-compose 和 harbor 文件放到和此脚本同级的目录下

DOCKER_COMPOSE_VERSION="2.3.3"
HARBOR_HOSTNAME="harbor.xiangzheng.vip"
HARBOR_ADMIN_PASSWORD="666666"
HARBOR_VERSION="2.3.5"

docker --version &> /dev/null || { echo "docker未安装 退出" ; exit; }

apt -y install python3
#dnf -y install python3


install_docker-compose(){
    chmod +x docker-compose-linux-x86_64 
    mv docker-compose-linux-x86_64 /usr/bin/docker-compose
    docker-compose --version &> /dev/null
        if [ $? -eq 0 ];then
            echo "docker-compose 安装完成" ; sleep 3
        else
            echo "docker-compose 安装失败 退出" ; exit 3
        fi
}

install_harbor(){
    mkdir -p /apps && tar xf harbor-offline-installer-v${HARBOR_VERSION}.tgz -C /apps/
    mv /apps/harbor/harbor.yml.tmpl /apps/harbor/harbor.yml
    sed -ri.bak "s|(hostname: )(.*)|\1${HARBOR_HOSTNAME}|" /apps/harbor/harbor.yml
    sed -ri "s|(harbor_admin_password: )(.*)|\1${HARBOR_ADMIN_PASSWORD}|" /apps/harbor/harbor.yml
    sed -ri 's|^(https:)|#\1|' /apps/harbor/harbor.yml
    sed -ri 's|(.*)(port: 443)|#\1\2|' /apps/harbor/harbor.yml
    sed -ri 's|(.*)(certificate: .*)|#\1\2|' /apps/harbor/harbor.yml
    sed -ri 's|(.*)(private_key: .*)|#\1\2|' /apps/harbor/harbor.yml
    /apps/harbor/install.sh
cat > /lib/systemd/system/harbor.service <<EOF
[Unit]
Description=Harbor
Requires=docker.service
After=docker.service systemd-networkd.service systemd-resolved.service
Documentation=http://github.com/vmware/harbor

[Service]
Type=simple
Restart=on-failure
RestartSec=5
ExecStart=/usr/bin/docker-compose -f /apps/harbor/docker-compose.yml up
ExecStop=/usr/bin/docker-compose -f /apps/harbor/docker-compose.yml down
ExecReload=/bin/kill -s HUP \$MAINPID

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable --now harbor.service
    systemctl is-active harbor.service &> /dev/null && echo "harbor 安装成功" || echo "harbor 安装失败"
}

install_docker-compose

install_harbor
```



# 基于 helm 部署 Harbor

https://artifacthub.io/packages/helm/harbor/harbor/1.9.3

- 添加仓库

```sh
helm repo add harbor https://helm.goharbor.io
```

- 验证仓库

```sh
# helm repo list
NAME                           	URL                                                       ...                          
harbor                         	https://helm.goharbor.io
```

- 更新仓库

```
helm repo update
```

- 创建 namespace

```
kubectl create ns harbor
```

- 列出可用的版本

```sh
# helm search repo harbor/harbor -l
NAME         	CHART VERSION	APP VERSION	DESCRIPTION                                       
harbor/harbor	1.12.2       	2.8.2      	An open source trusted cloud native registry th...
harbor/harbor	1.12.1       	2.8.1      	An open source trusted cloud native registry th...
harbor/harbor	1.12.0       	2.8.0      	An open source trusted cloud native registry th...
harbor/harbor	1.11.2       	2.7.2      	An open source trusted cloud native registry th...
harbor/harbor	1.11.1       	2.7.1      	An open source trusted cloud native registry th...
harbor/harbor	1.11.0       	2.7.0      	An open source trusted cloud native registry th...
harbor/harbor	1.10.4       	2.6.4      	An open source trusted cloud native registry th...
harbor/harbor	1.10.3       	2.6.3      	An open source trusted cloud native registry th...
harbor/harbor	1.10.2       	2.6.2      	An open source trusted cloud native registry th...
harbor/harbor	1.10.1       	2.6.1      	An open source trusted cloud native registry th...
harbor/harbor	1.10.0       	2.6.0      	An open source trusted cloud native registry th...
harbor/harbor	1.9.6        	2.5.6      	An open source trusted cloud native registry th...
harbor/harbor	1.9.5        	2.5.5      	An open source trusted cloud native registry th...
harbor/harbor	1.9.4        	2.5.4      	An open source trusted cloud native registry th...
harbor/harbor	1.9.3        	2.5.3      	An open source trusted cloud native registry th...
harbor/harbor	1.9.2        	2.5.2      	An open source trusted cloud native registry th...
harbor/harbor	1.9.1        	2.5.1      	An open source trusted cloud native registry th...
harbor/harbor	1.9.0        	2.5.0      	An open source trusted cloud native registry th...
...
```

- 安装
- **注意事项：**需要添加 `--set externalURL=http://172.16.0.120:30003` 才能实现通过 http 登录，否则登录时会提示账号或密码错误。并且外部访问端口 `30003` 必须加上，否则将无法使用`docker login` 进行登录，以执行`docker push` 等操作

```sh
helm install harbor harbor/harbor \
--set expose.type=nodePort \
--set expose.tls.enabled=false \
--set expose.nodePort.ports.http.nodePort=30003 \
--set expose.nodePort.ports.notary.nodePort=30005 \
--set externalURL=http://172.16.0.120:30003 \
-n harbor \
--version 1.9.3
```

- 更新

```sh
helm upgrade harbor harbor/harbor \
--set expose.type=nodePort \
--set expose.tls.enabled=false \
--set expose.nodePort.ports.http.nodePort=30002 \
--set expose.nodePort.ports.notary.nodePort=30004 \
--set externalURL=http://172.16.0.120:30002 \
-n harbor \
--version 1.9.3
```





# ---



# harbor 使用

## 创建项目

- 创建一个指定项目来上传镜像
  - 如：base_images、LNMP、app1、等....



## 配置 docker 客户端

### harbor https

- 默认从 docker 客户端登录走的就是 https，但是需要将证书存放到 docker 的指定目录上

- 还需在 docker 客户端上配置域名解析 或 指向DNS：

  - ```bash
    root@k8s-master-1:~# cat /etc/hosts
    ...
    10.0.0.103 harbor.xiangzheng.vip
    ```

```bash
# 登录到 harbor，提示
root@k8s-master-1:~# docker login harbor.xiangzheng.vip
Username: admin
Password: 
Error response from daemon: Get https://harbor.xiangzheng.vip/v2/: x509: cannot validate certificate for harbor.xiangzheng.vip because it doesn't contain any IP SANs


# 创建证书存放路径
root@k8s-master-1:~# mkdir -p /etc/docker/certs.d/harbor.xiangzheng.vip


# 转换 harbor.xiangzheng.vip.crt 为 harbor.xiangzheng.vip.cert , 供 Docker 使用。
# Docker 守护进程将.crt文件解释为 CA 证书，将.cert文件解释为客户端证书。
root@harbor-master:~# cd /apps/harbor/certs/
root@harbor-master:/apps/harbor/certs# openssl x509 -inform PEM -in harbor.xiangzheng.vip.crt -out harbor.xiangzheng.vip.cert


# 拷贝证书到所需的 docker 节点
root@harbor-master:/apps/harbor/certs# scp ca.crt harbor.xiangzheng.vip.cert harbor.xiangzheng.vip.key 10.0.0.102:/etc/docker/certs.d/harbor.xiangzheng.vip



# docker 节点验证证书
root@k8s-master-1:~# ll /etc/docker/certs.d/harbor.xiangzheng.vip/
total 20
drwxr-xr-x 2 root root 4096 Jul  4 18:50 ./
drwxr-xr-x 3 root root 4096 Jul  4 18:33 ../
-rw-r--r-- 1 root root 2082 Jul  4 18:50 ca.crt
-rw-r--r-- 1 root root 1960 Jul  4 18:50 harbor.xiangzheng.vip.cert
-rw------- 1 root root 3243 Jul  4 18:50 harbor.xiangzheng.vip.key



#重启 docker
root@k8s-master-1:~# systemctl restart docker



#还不行的话（报错 Error response from daemon: Get https://harbor.xiangzheng.vip/v2/: x509: certificate signed by unknown authority 的话）
#将证书添加到系统新人列表
# Ubuntu：
root@k8s-master-1:~# cp /etc/docker/certs.d/harbor.xiangzheng.vip/harbor.xiangzheng.vip.cert /usr/local/share/ca-certificates/harbor.xiangzheng.vip.crt
root@k8s-master-1:~# update-ca-certificates
Updating certificates in /etc/ssl/certs...
rehash: warning: skipping ca-certificates.crt,it does not contain exactly one certificate or CRL
1 added, 0 removed; done.
Running hooks in /etc/ca-certificates/update.d...
done.
root@k8s-master-1:~# systemctl restart docker
#红帽（CentOS 等）：
# cp yourdomain.com.crt /etc/pki/ca-trust/source/anchors/yourdomain.com.crt
# update-ca-trust
# systemctl restart docker
```



### harbor http

- 默认从 docker 客户端登录时走的是 https，所以无法登录，需要修改docker客户端配置文件
- **注意：--insecure-registry，配置的是域名 那么登录和上传镜像时就要使用域名，配置的是IP的话同理**

```sh
#未做配置前走的是https
root@docker:~# docker login 10.0.0.100
Username: admin
Password: 
Error response from daemon: Get "https://10.0.0.102/v2/": dial tcp 10.0.0.102:443: connect: connection refused

#修改客户端的docker.service文件(添加--insecure-registry 指向harbor server的IP地址)
#--insecure-registry 启用不安全的注册表通信
root@docker:~# vim /lib/systemd/system/docker.service
...
[Service]
...
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:9817 --containerd=/run/containerd/containerd.sock --insecure-registry 10.0.0.100 --insecure-registry 10.0.0.101
...

#重启服务
root@docker:~# systemctl daemon-reload 
root@docker:~# systemctl restart docker.service


#测试登录
[root@docker ~]# docker login 10.0.0.100
Username: admin
...
Login Succeeded


#登录成功后就会生成一个json文件，下次登录就无需重输密码了
root@docker:~# cat /root/.docker/config.json
{
	"auths": {
		"10.0.0.100": {
			"auth": "YWRtaW46MTIzNDU="
		}
	}
	
#docker进程中也可以看到刚刚配置的项目
root@docker1:~# ps aux | grep docker
root        4216  0.1  3.9 1383620 79616 ?       Ssl  14:46   0:00 /usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:9817 --containerd=/run/containerd/containerd.sock --insecure-registry 10.0.0.100 --insecure-registry 10.0.0.101
```

## 上传镜像

- 假设已经在浏览器项目中新建了一个名为 app1 的项目
- **上传镜像总共分为两步，分别是打标签和推送镜像**

```sh
# 1：在项目中标记镜像：
docker tag SOURCE_IMAGE[:TAG] 10.0.0.100/app1/REPOSITORY[:TAG]
# 2：推送镜像到当前项目：
docker push 10.0.0.100/app1/REPOSITORY[:TAG]


# 范例：将制作好的Ubuntu基础镜像上传到harbor
[root@docker ~]# docker tag ubuntu-20.04-base:1.0 10.0.0.100/app1/ubuntu-20.04-base:1.0
[root@docker ~]# docker push 10.0.0.100/app1/ubuntu-20.04-base:1.0
# web 界面验证


# 范例2
# 查看准备推送到 harbor 的镜像
root@k8s-master-1:~# docker images |grep busybox
busybox                                                          latest              beae173ccac6        6 months ago        1.24MB
# 给镜像打标签
root@k8s-master-1:~# docker tag busybox:latest harbor.xiangzheng.vip/base_images/busybox:latest
# 推送镜像
root@k8s-master-1:~# # docker push harbor.xiangzheng.vip/base_images/busybox
The push refers to repository [harbor.xiangzheng.vip/base_images/busybox]
01fd6df81c8e: Pushed 
latest: digest: sha256:62ffc2ed7554e4c6d360bce40bbcf196573dd27c4ce080641a2c59867e732dee size: 527
# web 界面验证
```



## 下载上传的镜像

- 私有镜像拉取前需要先进行登录
- 进入harbor网站页面，点击项目>项目名称>选择需要下载的镜像>复制拉取命令

```sh
docker pull 10.0.0.100/app1/ubuntu-20.04-base:1.0
```



## 自动打标签上传镜像脚本

```bash
#!/bin/bash
#
#********************************************************************
#Author:	     	xiangzheng
#QQ: 			    767483070
#Date: 		     	2022-03-24
#FileName：		    docker_tag_and_push.sh
#URL: 		    	https://www.xiangzheng.vip
#Email: 		    rootroot25@163.com
#Description：		The test script
#Copyright (C): 	2022 All rights reserved
#********************************************************************
PREFIX='10.0.0.100/app1/'

echo "您要上传的镜像仓库前缀为:${PREFIX} 如需更改请修改PREFIX变量的值"

read -p "请输入 SOURCE_IMAGE[:TAG] " SOURCE_IMAGE

docker tag ${SOURCE_IMAGE} ${PREFIX}${SOURCE_IMAGE}
docker push ${PREFIX}${SOURCE_IMAGE}
```







# harbor 修改配置文件

- 后期如果修改harbor配置，比如修改IP地址等，可执行以下步骤生效

## 方法一

- 好使

```bash
/apps/harbor/harbor.yml #修改harbor的配置文件

/apps/harbor/prepare #更新配置

systemctl restart harbor.service #重新启动harbor服务
```

## 方法二

```bash
/apps/harbor/docker-compose.yml down #停止harbor的所有服务

/apps/harbor/harbor.yml #修改harbor的配置文件

/apps/harbor/prepare #更新配置

/apps/harbor/docker-compose.yml up #重新启动harbor服务
```

## 方法三

- ???

```bash
/apps/harbor/install.sh
```







# 实现 harbor 高可用

- 单台harbor具有单点失败的风险，可配置两台harbor来实现高可用
- 参考文档：https://goharbor.io/docs/2.3.0/administration/configuring-replication/

## 注意事项

- 由于 API 的变化，不支持不同版本的 Harbor 之间的复制。
- 如果目标注册表中不存在命名空间，则会自动创建一个新的命名空间。如果它已经存在并且在复制策略中配置的用户帐户没有写入权限，则该过程将失败。
- 成员信息不会被复制。
- 根据网络状况，复制过程中可能会有一些延迟。如果复制任务失败，它会在几分钟后重新安排并重试几次。

## 实现方式

**方案1：基于镜像复制**

- **常用**

- harbor服务器全部为主节点架构，假设A机器被上传镜像，上传完毕后A机器会将上传的镜像复制给B机器，从而实现高可用

**方案2：基于共享存储**

- 所有镜像文件都放在共享存储中，而harbor集群只充当web服务器
- 优点：有冗余性
- 缺点：因为镜像数据是放在共享存储中 所以会导致网络带宽消耗严重，效率较低，并且harbor服务器中的存储空间得不到利用



## 环境说明

| 主机名         | 服务   | IP         | 系统        |
| -------------- | ------ | ---------- | ----------- |
| harbor-server1 | harbor | 10.0.0.100 | Ubuntu20.04 |
| harbor-server2 | harbor | 10.0.0.101 | Ubuntu20.04 |



## 安装harbor

- 安装过程省略...

- **多台 harbor 实现高可用时使用同一套证书即可**

  - ```bash
    scp /apps/harbor/certs/harbor.xiangzheng.vip.crt /apps/harbor/certs/harbor.xiangzheng.vip.key 10.0.0.104:/apps/harbor/certs/
    ```



## web界面配置

### 新版本

harbor 2.3.5

#### 定义复制

下面以 10.0.0.100 的角度来做演示

**定义推送的harbor主机：**

- 系统管理 --> 仓库管理 --> 新建目标
  - 提供者：harbor
  - 目标名：如：harbor-server2
  - 描述：可选，如：推送到harbor-server2
  - 目标URL：如：http://10.0.0.101
  - 访问ID：http://10.0.0.101的有效账号
  - 访问密码：http://10.0.0.101的有效密码
  - 验证远程证书：如未配置https 或 使用的是自签名证书 则无需勾选
  - 测试链接 --> 确定

**定义复制的项目：**

- 系统管理 --> 复制管理 --> 新建规则
  - 名称：本地的项目名称，如app1
  - 描述：可选，如：将app1项目推送到http://10.0.0.101
  - 复制模式：
    - Push-based 选这个即可
    - Pull-based
  - 源资源过滤器：
    - 可选，过滤那些内容不往远程推送
  - 目标仓库：harbor-server2-http://10.0.0.101（刚才定义的仓库）
  - 触发模式：
    - 事件驱动
    - 删除本地资源时同时也删除远程的资源 √
    - 覆盖 √

#### 测试复制

- 向10.0.0.100推送镜像观察10.0.0.101是否出现复制的镜像
- 新版本无需再被推送的harbor上提前创建项目，在复制的时候项目会自动创建



### 老版本

- 在需要复制的主机上新建和被复制的主机同名的项目（访问级别设为公开）
- 在被复制的主机上点击 仓库管理>新建目标>复制管理>新建规则
- 另一方也采用相同配置，从而实现双主复制







# 实现 harbor https

生产中因为harbor通常都是安装在内网，所以一般不用https，况且https也会一定程度上的降低性能

参考文档：https://goharbor.io/docs/2.3.0/install-config/configure-https/

## 注意事项

- **多台 harbor 实现高可用时使用同一套证书即可**

```bash
# 将证书拷贝到另外一个harbor节点
scp /apps/harbor/certs/harbor.xiangzheng.vip.crt /apps/harbor/certs/harbor.xiangzheng.vip.key 10.0.0.104:/apps/harbor/certs/
```

## 生成证书颁发机构证书

参考文档：https://www.openssl.org/docs/manmaster/man1/openssl-req.html

- **创建 CA 证书存放目录**

```bash
mkdir -p /apps/harbor/certs

cd /apps/harbor/certs
```

- **生成 CA 证书私钥**

```bash
openssl genrsa -out ca.key 4096
```

- **生成 CA 证书**

```bash
#调整-subj选项中的值以反映您的组织。如果您使用 FQDN 连接您的 Harbor 主机，则必须将其指定为公用名 ( CN) 属性。
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Beijing/L=Beijing/O=AzhengKeJi/OU=Personal/CN=xiangzheng.vip" \
 -key ca.key \
 -out ca.crt

# 百度证书参考：
# CN = baidu.com
# O = Beijing Baidu Netcom Science Technology Co., Ltd
# OU = service operation department
# L = beijing
# S = beijing
# C = CN
 
 
# 查看生成的 CA 证书
# openssl x509 -in ca.crt -noout -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            07:8c:c0:25:fb:36:bf:70:22:bc:c6:84:63:ab:82:21:e1:c1:60:b2
        Signature Algorithm: sha512WithRSAEncryption
        Issuer: C = CN, ST = Beijing, L = Beijing, O = example, OU = Personal, CN = xiangzheng.vip
        Validity
            Not Before: Jul  3 16:50:52 2022 GMT
            Not After : Jun 30 16:50:52 2032 GMT
        Subject: C = CN, ST = Beijing, L = Beijing, O = example, OU = Personal, CN = xiangzheng.vip
...
```



## 生成服务器证书

参考文档：

- **生成私钥**

```bash
openssl genrsa -out harbor.xiangzheng.vip.key 4096
```

- **生成证书签名请求文件 (CSR)**

```bash
#调整-subj选项中的值以反映您的组织。如果您使用 FQDN 连接您的 Harbor 主机，则必须将其指定为公用名称 ( CN) 属性并在密钥和 CSR 文件名中使用它。
openssl req -sha512 -new \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=AzhengKeJi/OU=Personal/CN=harbor.xiangzheng.vip" \
    -key harbor.xiangzheng.vip.key \
    -out harbor.xiangzheng.vip.csr
```

- **签发证书**

```bash
openssl x509 -req -days 36500 -in harbor.xiangzheng.vip.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out harbor.xiangzheng.vip.crt
```

- **签发证书方法二**

```bash
#生成 x509 v3 扩展文件。
#无论您是使用 FQDN 还是 IP 地址连接到您的 Harbor 主机，您都必须创建此文件，以便为您的 Harbor 主机生成符合主题备用名称 (SAN) 和 x509 v3 的证书扩展要求。替换DNS条目以反映您的域。
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1=yourdomain.com
DNS.2=yourdomain
DNS.3=hostname
EOF


#使用该v3.ext文件为您的 Harbor 主机生成证书。
#将yourdomain.comCRS 和 CRT 文件名中的 替换为 Harbor 主机名。
openssl x509 -req -sha512 -days 3650 \
    -extfile v3.ext \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -in yourdomain.com.csr \
    -out yourdomain.com.crt
```



## 配置 Harbor

```bash
# vim /apps/harbor/harbor.yml
...
https:
  # https port for harbor, default is 443
  port: 443
  # The path of cert and key files for nginx
  certificate: /apps/harbor/certs/harbor.xiangzheng.vip.crt
  private_key: /apps/harbor/certs/harbor.xiangzheng.vip.key
...
```

- **使配置文件生效**

```bash
/apps/harbor/prepare #更新配置

systemctl restart harbor.service #重新启动harbor服务
```

- **验证：https://harbor.xiangzheng.vip/**





# ---



# harbor 整体迁移

- 将harbor原有文件全部打包

```sh
# ls harbor-* -d | tr '' '\n'
harbor-database-data-harbor-database-0-pvc-97acb1c2-3488-4e20-8ccf-fb7c5fd734b5
harbor-data-harbor-redis-0-pvc-7a111f99-0ed6-4c55-8395-01095848d861
harbor-data-harbor-trivy-0-pvc-c5547cf5-e9b8-44ed-988a-e5c4b464ec87
harbor-harbor-chartmuseum-pvc-f9690a7c-79f3-4128-8483-e280bc325cdb
harbor-harbor-jobservice-pvc-7a7d444d-1932-4c53-9e91-1913ff805741
harbor-harbor-registry-pvc-7b8df94c-3791-4796-ae83-30860e919518


# tar zcvf harbor.tar.gz harbor*
```

- 新的k8s集群中安装harbor

```sh
# 添加仓库
helm repo add harbor https://helm.goharbor.io


# 创建 namespace
kubectl create ns harbor

# 安装
helm install harbor harbor/harbor \
--set expose.type=nodePort \
--set expose.tls.enabled=false \
--set expose.nodePort.ports.http.nodePort=30002 \
--set expose.nodePort.ports.notary.nodePort=30004 \
--set externalURL=http://172.16.0.120:30002 \
-n harbor \
--version 1.9.3
```



