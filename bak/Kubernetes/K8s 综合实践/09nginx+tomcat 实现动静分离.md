# 前言

- 下面简单实现了 nginx+tomcat 的动静分离，其中存储使用了 nfs
- **tomcat 还需做 session 共享，下文中不包含**



# 注意要点

- **nginx 业务镜像配置文件中的 upstream 段指向 tomcat 的 service 全称： tomcat-service.project-1.svc.kubecluster.local:8080**
- **nginx 业务镜像配置文件中的 proxy_pass 段指向 http://myapp/; 注意末尾一定要加/，否则将访问 tomcat 的 /myapp/index.jsp 因未配置此目录 所以会报 404**





# 环境说明

| Host Name    | IP         | VIP       | service                                 | role                 |
| ------------ | ---------- | --------- | --------------------------------------- | -------------------- |
| k8s-master-1 | 10.0.0.100 |           | docker、kubeadm、kubelet、kubectl       | k8s-master           |
| k8s-node-1   | 10.0.0.101 |           | docker、kubeadm、kubelet                | k8s-node             |
| k8s-node-2   | 10.0.0.102 |           | docker、kubeadm、kubelet                | k8s-node             |
| harbor       | 10.0.0.103 | 10.0.0.68 | docker、harbor、haproxy+keepalived、nfs | harbor、haproxy、nfs |











# 环境部署

- 安装过程略

## docker

- **上传镜像端准备**

- 在使用上传镜像的 docker 客户端不启用 https 验证，否则将无法正常上传镜像（harbor 端如果为https 则需在 docker 客户端配置证书才能正常上传镜像）
- **在所有 master 和 node 节点配置**

```bash
# vim /lib/systemd/system/docker.service
...
[Service]
...
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock --insecure-registry harbor.xiangzheng.vip #添加 --insecure-registry 并指向 harbor 的域名或IP
...


# systemctl daemon-reload 

# systemctl restart docker.service 


# 登录到 harbor
# docker login harbor.xiangzheng.vip
Username: admin
...
Login Succeeded
```

## nfs

```bash
# 安装 nfs
yum -y install nfs-utils #centos
apt -y install nfs-kernel-server #Ubuntu


# 创建 nfs 共享目录
mkdir -p /nfs_data/{nginx,tomcat}


# 配置 nfs 共享
# /etc/exports
/nfs_data/nginx/ 10.0.0.0/16(rw,no_root_squash)
/nfs_data/tomcat/ 10.0.0.0/16(rw,no_root_squash)


# 加载nfs配置文件
exportfs -r


# 客户端查看远程 nfs 挂载情况
# showmount -e 10.0.0.103
Export list for 10.0.0.103:
/nfs_data/tomcat 10.0.0.0/16
/nfs_data/nginx  10.0.0.0/16


# 将 nginx 静态文件导入 nfs 共享
# tree /nfs_data/nginx/
/nfs_data/nginx/
├── about.html
├── contact.html
├── css
│   ├── animate.css
│   ├── bootstrap.css
...
├── images
│   ├── img_1.jpg
│   ├── img_bg_1.jpg
...
├── index.html
├── js
│   ├── bootstrap.min.js
│   ├── jquery.countTo.js
...


# 创建 tomcat 测试页面
# mkdir -p /nfs_data/tomcat/ROOT
# echo 'tomcat website for project-1' > /nfs_data/tomcat/ROOT/index.jsp
# tree /nfs_data/tomcat/
/nfs_data/tomcat/
└── ROOT
    └── index.jsp
```

## haproxy+keepalived

```bash
# 安装
apt -y install haproxy keepalived


# /etc/keepalived/keepalived.conf
global_defs {
   router_id LVS_DEVEL
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    authentication {
        auth_type PASS
        auth_pass 1111
    }   
    virtual_ipaddress {
        10.0.0.68 dev eth0 label eth0:0
    }   
}   


# systemctl restart keepalived.service 
# ip a|grep 68
    inet 10.0.0.68/32 scope global eth0:0


# /etc/haproxy/haproxy.cfg
# 80端口与harbor冲突 所以这里选择81
...
listen project-1-nginx-81
    bind 10.0.0.68:81
    mode tcp
    server 10.0.0.101 10.0.0.101:30003 check inter 3 fall 3 rise 5
    server 10.0.0.102 10.0.0.102:30003 check inter 3 fall 3 rise 5


# systemctl restart haproxy.service
# ss -ntl|grep 81
LISTEN  0        491            10.0.0.68:81             0.0.0.0:*
```







# 准备相关目录

## Dockerfile 相关目录

```bash
# mkdir -p /data/dockerfile/{system/{centos,ubuntu,debian,alpine},web/{nginx,tomcat},jdk}


# tree /data/
/data/
└── dockerfile
    ├── jdk
    ├── system
    │   ├── alpine
    │   ├── centos
    │   ├── debian
    │   └── ubuntu
    └── web
        ├── nginx
        └── tomcat
```

## 准备 yaml 文件存放目录

```bash
# mkdir -p /data/yaml/{namespace,project-1}

# tree /data/
/data/
...
└── yaml
    ├── namespace
    └── project-1
```





# 构建 namespace

```bash
# /data/yaml/namespace/ns-project-1.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: project-1
  

# kubectl apply -f /data/yaml/namespace/ns-project-1.yaml
namespace/project-1 created


# kubectl get namespaces 
NAME              STATUS   AGE
...
project-1         Active   3s
```













# 构建 Ubuntu 基础镜像

- 基于官方 Ubuntu 镜像，构建定制的 Ubuntu 基础镜像 并上传到 harbor

## 相关文件

- 创建一个 20.04 的目录，以表示在此存放 Ubuntu20.04的镜像

```bash
# pwd
/data/dockerfile/system/ubuntu/2004


# ls | tr '' '\n'
Dockerfile
sources.list # 指向国内或企业内部的apt源
```

## Dockerfile

```dockerfile
FROM ubuntu:20.04
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD sources.list /etc/apt/
RUN apt-get update && apt-get -y install \
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

## 构建镜像并上传到 harbor

- **构建镜像**

```bash
docker build -t ubuntu-20.04-base:1.0 .
```

- **在 harbor 创建项目，并命名为 如：baseimages-os，访问级别设为公开**

- **打标签然后上传到 harbor**

```bash
# 打标签
docker tag ubuntu-20.04-base:1.0 harbor.xiangzheng.vip/baseimages-os/ubuntu-20.04-base:1.0

# 上传
docker push harbor.xiangzheng.vip/baseimages-os/ubuntu-20.04-base:1.0
```







# 构建 nginx 基础镜像

- 基于定制的 Ubuntu 基础镜像，构建 nginx 基础镜像 并上传到 harbor

## 相关文件

```bash
# pwd
/data/dockerfile/web/nginx


# ls | tr '' '\n'
Dockerfile
nginx-1.18.0.tar.gz
```

## Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-os/ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
RUN apt-get update \
    && apt-get -y install make gcc libpcre3 libpcre3-dev openssl libssl-dev zlib1g-dev
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
    && chown -R nginx.nginx /apps/nginx \
    && sed -i '1i daemon off;' /apps/nginx/conf/nginx.conf
EXPOSE 80 443
ENTRYPOINT ["/apps/nginx/sbin/nginx"]
```

## 构建镜像

```bash
docker build -t nginx-1.18.0-base-ubuntu:1.0 .
```

## 测试访问

```bash
# docker run -d --rm --name nginx -p 80:80 nginx-1.18.0-base-ubuntu:1.0


# docker exec -it nginx bash


# curl 10.0.0.100
...
<h1>Welcome to nginx!</h1>
...

# docker stop nginx
```

## 上传到 harbor

- **在 harbor 创建项目，并命名为 如：baseimages-app，访问级别设为公开**

```bash
# 打标签
docker tag nginx-1.18.0-base-ubuntu:1.0 harbor.xiangzheng.vip/baseimages-app/nginx-1.18.0-base-ubuntu:1.0


# 上传
docker push harbor.xiangzheng.vip/baseimages-app/nginx-1.18.0-base-ubuntu:1.0
```







# 构建 jdk 基础镜像

- 基于定制的 Ubuntu 基础镜像，构建 jdk 基础镜像 并上传到 harbor

## 相关文件

```bash
# pwd
/data/dockerfile/jdk


# ls | tr '' '\n'
Dockerfile
jdk-8u333-linux-x64.tar.gz
```

## Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-os/ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD jdk-8u333-linux-x64.tar.gz /apps/
RUN ln -s /apps/jdk1.8.0_333 /apps/jdk
ENV JAVA_HOME=/apps/jdk
ENV JRE_HOME=${JAVA_HOME}/jre
ENV CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/
ENV PATH=${JAVA_HOME}/bin/:${PATH}
ENTRYPOINT /usr/bin/tail -f /etc/hosts
```

## 构建镜像

- **构建镜像**

```bash
docker build -t jdk-8u333-base-ubuntu:1.0 .
```

## 测试

```bash
# docker run -d --rm --name jdk jdk-8u333-base-ubuntu:1.0


# docker exec -it jdk bash


# java -version
java version "1.8.0_333"
Java(TM) SE Runtime Environment (build 1.8.0_333-b02)
Java HotSpot(TM) 64-Bit Server VM (build 25.333-b02, mixed mode)


# docker stop jdk
```

## 上传到 harbor

- **在 harbor 创建项目，并命名为 如：baseimages-app，访问级别设为公开**

```bash
# 打标签
docker tag jdk-8u333-base-ubuntu:1.0 harbor.xiangzheng.vip/baseimages-app/jdk-8u333-base-ubuntu:1.0

# 上传
docker push harbor.xiangzheng.vip/baseimages-app/jdk-8u333-base-ubuntu:1.0
```







# 构建 tomcat 基础镜像

- 基于定制的 jdk 基础镜像，构建 tomcat 基础镜像 并上传到 harbor

## 相关文件

```bash
# pwd
/data/dockerfile/web/tomcat


# ls | tr '' '\n'
Dockerfile
apache-tomcat-8.5.71.tar.gz
```

## Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-app/jdk-8u333-base-ubuntu:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD apache-tomcat-8.5.71.tar.gz /apps
RUN ln -s /apps/apache-tomcat-8.5.71 /apps/tomcat
EXPOSE 8080

# 前台启动tomcat
ENTRYPOINT ["/apps/tomcat/bin/catalina.sh","run"]
```

## 构建镜像

```bash
docker build -t tomcat-8.5.71-base-ubuntu:1.0 .
```

## 测试访问

```bash
# docker run -d --rm --name tomcat -p 8080:8080 tomcat-8.5.71-base-ubuntu:1.0


# docker exec -it tomcat bash


# curl 10.0.0.100:8080
...


# docker stop tomcat
```

## 上传到 harbor

- **在 harbor 创建项目，并命名为 如：baseimages-app，访问级别设为公开**

```bash
# 打标签
docker tag tomcat-8.5.71-base-ubuntu:1.0 harbor.xiangzheng.vip/baseimages-app/tomcat-8.5.71-base-ubuntu:1.0


# 上传
docker push harbor.xiangzheng.vip/baseimages-app/tomcat-8.5.71-base-ubuntu:1.0
```









# 构建 nginx 业务镜像

- 基于定制的 nginx 基础镜像，构建 nginx 业务镜像 并上传到 harbor

## 相关文件

- **假设业务名为 project-1**

```nginx
# 创建关于 project-1 的目录
# mkdir -p /data/dockerfile/project-1/{nginx,tomcat}

# pwd
/data/dockerfile/project-1/nginx


# ls | tr '' '\n'
Dockerfile
nginx.conf

# 这里仅作演示，所以简单配置，生产中的业务需按需修改配置文件
# nginx.conf
worker_processes  auto;
pid        /apps/nginx/run/nginx.pid;
daemon off;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
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
    access_log  logs/access.log  log_json;
    sendfile        on;
    keepalive_timeout  65;
    gzip  on;

    upstream myapp {
        server tomcat-service.project-1.svc.kubecluster.local:8080 weight=1 fail_timeout=15s max_fails=3;
    }

    server {
        listen 80;

        location / {
            root /data/nginx;
            index index.html;
        }

        location /myapp {
            proxy_pass http://myapp;
        }
    }
}
```

## Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-app/nginx-1.18.0-base-ubuntu:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"

# 创建静态页面存放目录，通过 nfs 将页面文件共享至此目录
RUN mkdir -p /data/nginx

# 将原有子配置文件替换
COPY nginx.conf /apps/nginx/conf/nginx.conf

ENTRYPOINT ["/apps/nginx/sbin/nginx"]
```

## 构建镜像并上传到 harbor

- **构建镜像**

```bash
docker build -t project-1-nginx-1.18.0-ubuntu:1.0 .
```

- **在 harbor 创建项目，并命名为 如：project-1，访问级别设为公开**

- **打标签然后上传到 harbor**

```bash
# 打标签
docker tag project-1-nginx-1.18.0-ubuntu:1.0 harbor.xiangzheng.vip/project-1/project-1-nginx-1.18.0-ubuntu:1.0

# 上传
docker push harbor.xiangzheng.vip/project-1/project-1-nginx-1.18.0-ubuntu:1.0
```

## 部署到 k8s 中测试

- **注意：所有的master和 node 节点都要配置将 DNS 解析至 harbor，并且成功登录至 harbor，否则镜像将拉取失败**

### yaml 文件

```yaml
# /data/yaml/project-1/project-1-nginx.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-1-nginx-deployment
  labels:
    app: project-1-nginx-deployment-label
  namespace: project-1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: project-1-nginx-deployment-label
  template:
    metadata:
      labels:
        app: project-1-nginx-deployment-label
    spec:
      restartPolicy: Always
      containers:
      - name: project-1-nginx-container
        image: harbor.xiangzheng.vip/project-1/project-1-nginx-1.18.0-ubuntu:1.0
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
        - containerPort: 443
          name: https
          protocol: TCP
        resources:
          requests:   
            cpu: 100m
            memory: 256Mi   
          limits:   
            cpu: 1   
            memory: 512Mi
        volumeMounts:
        - mountPath: /data/nginx
          name: nfs-project-1
      volumes:
      - name: nfs-project-1
        nfs:
          server: 10.0.0.103
          path: /nfs_data/nginx

---

kind: Service
apiVersion: v1
metadata:
  labels:
    app: nginx-service
  name: nginx-service
  namespace: project-1
spec:
  type: NodePort
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 80
    nodePort: 30003
  - name: https
    port: 443
    protocol: TCP
    targetPort: 443
    nodePort: 30004
  selector:
    app: project-1-nginx-deployment-label
```

### 使其生效

```bash
kubectl apply -f project-1-nginx.yaml
```

### 查看结果

```bash
# kubectl get pod -n project-1 
NAME                                          READY   STATUS    RESTARTS   AGE
project-1-nginx-deployment-7987f9d6dc-k6w2m   1/1     Running   0          45s


# kubectl get  service -n project-1 
NAME            TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
nginx-service   NodePort   192.168.15.145   <none>        80:30003/TCP,443:30004/TCP   3m21s
```

## 测试访问

- 因为已经配置了 haproxy 转发，所以可以直接使用浏览器访问 VIP 10.0.0.68:81







# 构建 tomcat 业务镜像

- 基于定制的 tomcat 基础镜像，构建 tomcat 业务镜像 并上传到 harbor

## 相关文件

- **假设业务名为 project-1**

```bash
# 创建关于 project-1 的目录
# mkdir -p /data/dockerfile/project-1/{nginx,tomcat}

# pwd
/data/dockerfile/project-1/tomcat


# ls | tr '' '\n'
Dockerfile
server.xml

# 这里仅作演示，所以简单配置，生产中的业务需按需修改配置文件
# server.xml
...
      <Host name="localhost"  appBase="/data/tomcat/"
            unpackWARs="false" autoDeploy="false">
...
```

## Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-app/tomcat-8.5.71-base-ubuntu:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"

# 创建静态页面存放目录，通过 nfs 将页面文件共享至此目录
RUN mkdir -p /data/tomcat

# 将原有配置文件替换
COPY server.xml /apps/tomcat/conf/server.xml

# 前台运行 tomcat
ENTRYPOINT ["/apps/tomcat/bin/catalina.sh","run"]
```

## 构建镜像并上传到 harbor

- **构建镜像**

```bash
docker build -t project-1-tomcat-8.5.71-ubuntu:1.0 .
```

- **在 harbor 创建项目，并命名为 如：project-1，访问级别设为公开**

- **打标签然后上传到 harbor**

```bash
# 打标签
docker tag project-1-tomcat-8.5.71-ubuntu:1.0 harbor.xiangzheng.vip/project-1/project-1-tomcat-8.5.71-ubuntu:1.0


# 上传
docker push harbor.xiangzheng.vip/project-1/project-1-tomcat-8.5.71-ubuntu:1.0
```

## 部署到 k8s 中测试

- **注意：所有的master和 node 节点都要配置将 DNS 解析至 harbor，并且成功登录至 harbor，否则镜像将拉取失败**

### yaml 文件

```yaml
# /data/yaml/project-1/project-1-tomcat.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-1-tomcat-deployment
  labels:
    app: project-1-tomcat-deployment-label
  namespace: project-1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: project-1-tomcat-deployment-label
  template:
    metadata:
      labels:
        app: project-1-tomcat-deployment-label
    spec:
      restartPolicy: Always
      containers:
      - name: project-1-tomcat-container
        image: harbor.xiangzheng.vip/project-1/project-1-tomcat-8.5.71-ubuntu:1.0
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
        resources:
          requests:   
            cpu: 100m
            memory: 256Mi   
          limits:   
            cpu: 1   
            memory: 512Mi
        volumeMounts:
        - mountPath: /data/tomcat
          name: nfs-project-1
      volumes:
      - name: nfs-project-1
        nfs:
          server: 10.0.0.103
          path: /nfs_data/tomcat

---

kind: Service
apiVersion: v1
metadata:
  labels:
    app: tomcat-service
  name: tomcat-service
  namespace: project-1
spec:
  type: NodePort
  ports:
  - name: http
    port: 8080
    protocol: TCP
    targetPort: 8080
    nodePort: 30008
  selector:
    app: project-1-tomcat-deployment-label
```

### 使其生效

```bash
kubectl apply -f project-1-tomcat.yaml
```

### 查看结果

```bash
# kubectl get pod -n project-1 
NAME                                           READY   STATUS    RESTARTS   AGE
project-1-nginx-deployment-7987f9d6dc-k6w2m    1/1     Running   0          122m
project-1-tomcat-deployment-6475c7c856-4bwgm   1/1     Running   0          45s


# kubectl get  service -n project-1 
NAME             TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
nginx-service    NodePort   192.168.15.145   <none>        80:30003/TCP,443:30004/TCP   121m
tomcat-service   NodePort   192.168.14.177   <none>        8080:30008/TCP               91s
```

## 测试访问

```bash
# curl 10.0.0.68:81
...



# curl 10.0.0.68:81/myapp
tomcat website for project-1
```





# 后期业务升级思路

- 将打包好的 jar 包或 war 包传入到 Dockerfile 同级的目录当中，在 Dockerfile 中添加 ADD(使其自动解压到指定目录)，构建成新的镜像并上传到 harbor(不要忘记打版本升级的 tag )，最后在 k8s 的 yaml 文件中原有的 image 地址替换成新升级的镜像地址后指执行 `kubectl apply -f project-1-tomcat.yaml`



