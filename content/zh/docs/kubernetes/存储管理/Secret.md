---
title: "Secret"
weight: 10
---

# Secret 概述

- Secret ，名称空间级别资源；
- Secret 可以理解为是 ConfigMap 的加密版，只不过实际上是将文本内容转换成 Base64 编码 而非真正意义上的加密
- ConfigMap 的配置信息基本没有类别之分，但 Secret 有类别之分：
  - docker-registry、tls、generic（通用类型、子类型）

- 支持基于命令行方式管理 Secret，和 ConfigMap 类似，同样支持使用 `--from-file=`  从配置文件中读取信息 或 从 `--from-literal=` 中读取键值

- [Secret | Kubernetes](https://kubernetes.io/zh-cn/docs/concepts/configuration/secret/)



在 Kubernetes 中，Secrets 用于存储敏感信息，如密码、API 密钥和其他敏感数据。Secrets 提供了一种安全的方式将这些敏感信息传递给 Pod 中的容器。



# Secret generic

- 通用类型，可以使用`--type=`定义子类型
- `kubectl create secret generic NAME [--type=string] [--from-file=[key=]source] [--from-literal=key1=value1]
  [--dry-run=server|client|none] [options]`

## Opaque

- 创建时如不使用`--type`定义子类型则默认为Opaque



### 范例：为 MySQL Pod 传递密码：

#### secret

```yaml
# kubectl create ns mysql
namespace/mysql created

# kubectl create secret generic mysql-auth --from-literal=username=root --from-literal=password=PassW@rd -n mysql 
secret/mysql-auth created


# 创建时如不使用--type定义子类型则默认为Opaque
# kubectl get secrets -n mysql mysql-auth
NAME         TYPE     DATA   AGE
mysql-auth   Opaque   2      8s



# kubectl get secrets -n mysql mysql-auth -o yaml 
apiVersion: v1
data:
  password: UGFzc1dAcmQ= # 被转换成了base64编码格式
  username: cm9vdA==
kind: Secret
metadata:
  creationTimestamp: "2022-09-18T10:18:49Z"
  name: mysql-auth
  namespace: mysql
  resourceVersion: "177290"
  uid: bf583d73-d213-4a8c-9644-9e46adba1e5e
type: Opaque


# base64 解码
# echo "UGFzc1dAcmQ=" | base64 -d
PassW@rd
# echo "cm9vdA==" | base64 -d
root
```

#### Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql
  labels:
    name: mysql
  namespace: mysql
spec:
  containers:
  - name: mysql
    image: mysql:8.0.31
    imagePullPolicy: IfNotPresent
    env:
    - name: MYSQL_ROOT_PASSWORD
      valueFrom: 
        secretKeyRef:
          name: mysql-auth
          key: password
          optional: false
```

#### 验证

```sh
# kubectl get pod -n mysql -o wide 
NAME    READY   STATUS    RESTARTS   AGE   IP             NODE         NOMINATED NODE   READINESS GATES
mysql   1/1     Running   0          43s   10.244.1.159   k8s-node-1   <none>           <none>


# mysql -h 10.244.1.159 -p"PassW@rd"
...
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.01 sec)



# 密码不会在Pod清单中以明文方式显示
# kubectl get pod -n mysql -o yaml
...
  spec:
    containers:
    - env:
      - name: MYSQL_ROOT_PASSWORD
        valueFrom:
          secretKeyRef:
            key: password
            name: mysql-auth
            optional: false
...
```



## basic-auth

- 专用于 basic 认证的子类型
- `--type="kubernetes.io/basic-auth"`



## rbd

- 为 ceph rbd 做认证的子类型
- `--type="kubernetes.io/rbd"`



## ssh-auth

- 使用 ssh 认证时的子类型
- `--type="kubernetes.io/ssh-auth"`



## token

- kubeadm 的 bootstrap 所使用的 token 专用的类型，它通常保存于 kube-system 名称空间，以bootstrap-token-为前缀。


- `--type="bootstrap.kubernetes.io/token"`

```bash
# 获取将node加入到k8s集群的token
# kubeadm token create --print-join-command
kubeadm join 10.0.0.100:6443 --token po11mv.gnpjj40xt443i1u1 --discovery-token-ca-cert-hash sha256:a98b1460e6153e42726954f58571bd0d83a6c8e8000e1a0f98c7b5c0d1acc1f5 


# kubectl get secrets -n kube-system bootstrap-token-po11mv 
NAME                     TYPE                            DATA   AGE
bootstrap-token-po11mv   bootstrap.kubernetes.io/token   6      21m


# kubectl get secrets -n kube-system bootstrap-token-po11mv -o yaml 
apiVersion: v1
data:
  auth-extra-groups: c3lzdGVtOmJvb3RzdHJhcHBlcnM6a3ViZWFkbTpkZWZhdWx0LW5vZGUtdG9rZW4=
  expiration: MjAyMi0wOS0xOVQwNjozOTozM1o=
  token-id: cG8xMW12
  token-secret: Z25wamo0MHh0NDQzaTF1MQ==
  usage-bootstrap-authentication: dHJ1ZQ==
  usage-bootstrap-signing: dHJ1ZQ==
kind: Secret
metadata:
  creationTimestamp: "2022-09-18T06:39:33Z"
  name: bootstrap-token-po11mv
  namespace: kube-system
  resourceVersion: "167122"
  uid: 8bb2b760-8a71-4230-9f7a-ac1d67aad4ad
type: bootstrap.kubernetes.io/token
```



# Secret tls

- 专门用于保存tls/ssl用到证书和配对儿的私钥
- TLS类型是一种独特的类型，在创建secret的命令行中，除了类型标识的不同之外，它还需要使用专用的选项--cert和--key。
- 无论证书和私钥文件名是什么，它们会统一为：
  - tls.crt
  - tls.key
- `kubectl create secret tls NAME --cert=path/to/cert/file --key=path/to/key/file [--dry-run=server|client|none]
  [options]`

## 范例：命令行创建 tls 的 Secret 

- 准备证书和私钥文件（这里使用CA自签名证书测试）

```bash
# 生成私钥
openssl genrsa -out ca.key 4096

# 生成 CA 证书
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Beijing/L=Beijing/O=AzhengKeJi/OU=Personal/CN=harbor.xiangzheng.vip" \
 -key ca.key \
 -out ca.crt
```

- 创建 tls 的 Secret 

```bash
# kubectl create ns nginx
namespace/nginx created


# kubectl create secret tls nginx-certs --cert=./ca.crt --key=./ca.key -n nginx 
secret/nginx-certs created


# kubectl describe secrets -n nginx nginx-certs 
Name:         nginx-certs
Namespace:    nginx
Labels:       <none>
Annotations:  <none>

Type:  kubernetes.io/tls # 都会属于此类型

Data
====
tls.crt:  2082 bytes # 使用describe查看，数据只会显示占用大小
tls.key:  3243 bytes



# kubectl get secrets -n nginx nginx-certs -o yaml 
apiVersion: v1
data:
  tls.crt: LS0tLS1CRUdJ... # 使用-o yaml查看，数据会以BASE64编码形式展示
  tls.key: LS0tLS1CRUdJTiB...
kind: Secret
metadata:
  creationTimestamp: "2022-09-18T13:52:18Z"
  name: nginx-certs
  namespace: nginx
  resourceVersion: "195156"
  uid: d3aaa264-7909-4438-ad13-20953243684f
type: kubernetes.io/tls
```



## 范例：ConfigMap + Secret 实现 nginx https

- ConfigMap 定义 nginx 的配置文件，Secret 定义 nginx https 所需的证书

### 前期准备

#### 定义 nginx namespace

```bash
# kubectl create ns nginx
namespace/nginx created
```

#### 准备 nginx 配置文件

- myserver.conf

```nginx
server {
    listen 443 ssl;
    server_name www.xiangzheng.com;

    ssl_certificate /etc/nginx/certs/tls.crt; # 因为Secret会将其改名为默认值
    ssl_certificate_key /etc/nginx/certs/tls.key; # 同理

    ssl_session_timeout 5m;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2; 

    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; 
    ssl_prefer_server_ciphers on;

    include /etc/nginx/conf.d/myserver-*.cfg;

    location / {
        root /usr/share/nginx/html;
    }
}

server {
    listen 80;
    server_name www.llinux.cn; 
    return 301 https://$host$request_uri; 
}
```

- myserver-gzip.cfg

```nginx
gzip on;
gzip_comp_level 5;
gzip_proxied     expired no-cache no-store private auth;
gzip_types text/plain text/css application/xml text/javascript;
```

- myserver-status.cfg

```nginx
location /nginx-status {
    stub_status on;
    access_log off;
}
```

#### 准备证书

- 创建根CA

```bash
# mkdir -p /data/certs
# cd /data/certs/


# 生成私钥
openssl genrsa -out ca.key 4096


# 生成 CA 证书
openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Beijing/L=Beijing/O=AzhengKeJi/OU=Personal/CN=xiangzheng.com" \
 -key ca.key \
 -out ca.crt
```

- 创建服务器证书

```bash
# 生成私钥
openssl genrsa -out www.xiangzheng.com.key 4096


# 生成证书签名请求文件 (CSR)
openssl req -sha512 -new \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=AzhengKeJi/OU=Personal/CN=www.xiangzheng.com" \
    -key www.xiangzheng.com.key \
    -out www.xiangzheng.com.csr


# 签发证书
openssl x509 -req -days 3650 -in www.xiangzheng.com.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out www.xiangzheng.com.crt


# 所需文件
# ls -l /data/certs/
...
-rw-r--r-- 1 root root 1944 Sep 18 23:55 www.xiangzheng.com.crt # 证书
-rw------- 1 root root 3243 Sep 18 23:52 www.xiangzheng.com.key # 私钥
...
```



### 定义 ConfigMap

```yaml
# 定义
# kubectl create cm nginx-confs --from-file=myserver.conf --from-file=myserver-gzip.cfg --from-file=myserver-status.cfg -n nginx 
configmap/nginx-confs created


# 验证
# kubectl get cm -n nginx nginx-confs -o yaml 
apiVersion: v1
data:
  myserver-gzip.cfg: |
    gzip on;
    gzip_comp_level 5;
    gzip_proxied     expired no-cache no-store private auth;
    gzip_types text/plain text/css application/xml text/javascript;
  myserver-status.cfg: |
    location /nginx-status {
        stub_status on;
        access_log off;
    }
  myserver.conf: "server {\n    listen 443 ssl;\n    server_name www.xiangzheng.com;\n\n
    \   ssl_certificate /etc/nginx/certs/tls.crt; \n    ssl_certificate_key /etc/nginx/certs/tls.key;\n\n
    \   ssl_session_timeout 5m;\n\n    ssl_protocols TLSv1 TLSv1.1 TLSv1.2; \n\n    ssl_ciphers
    ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; \n    ssl_prefer_server_ciphers
    on;\n\n    include /etc/nginx/conf.d/myserver-*.cfg;\n\n    location / {\n        root
    /usr/share/nginx/html;\n    }\n}\n\nserver {\n    listen 80;\n    server_name
    www.llinux.cn; \n    return 301 https://$host$request_uri; \n}\n"
kind: ConfigMap
metadata:
  creationTimestamp: "2022-09-18T16:08:00Z"
  name: nginx-confs
  namespace: nginx
  resourceVersion: "206550"
  uid: 2f904b25-3039-4099-aa2d-ead1fd790547
```



### 定义 Secret

```yaml
# 定义
# kubectl create secret tls nginx-ssl --cert=./www.xiangzheng.com.crt --key=./www.xiangzheng.com.key -n nginx
secret/nginx-ssl created


# 验证
# kubectl get secret -n nginx nginx-ssl -o yaml 
apiVersion: v1
data:
  tls.crt: LS0tLS1CRUd...
  tls.key: LS0tLS1CRUdJTiBS...
kind: Secret
metadata:
  creationTimestamp: "2022-09-18T16:11:29Z"
  name: nginx-ssl
  namespace: nginx
  resourceVersion: "206846"
  uid: e0d76701-b049-401b-a812-926ede4ade5b
type: kubernetes.io/tls
```



### 定义 Deployment

- nginx-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-ssl
  template:
    metadata:
      labels:
        app: nginx-ssl
    spec:
      #securityContext:
      #  runAsUser: 0
      #  runAsGroup: 0
      containers:
      - name: nginx
        image: nginx:1.23.0-alpine
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80 
        resources:
          limits:
            memory: "50Mi"
            cpu: "50m"
        volumeMounts:
            # nginx-confs
          - name: nginx-confs
            mountPath: /etc/nginx/conf.d/myserver.conf
            subPath: myserver.conf
            readOnly: true
          - name: nginx-confs
            mountPath: /etc/nginx/conf.d/myserver-gzip.cfg
            subPath: myserver-gzip.cfg
            readOnly: true
          - name: nginx-confs
            mountPath: /etc/nginx/conf.d/myserver-status.cfg
            subPath: myserver-status.cfg
            readOnly: true
            # nginx-ssl
          - name: nginx-ssl
            mountPath: /etc/nginx/certs/ # 目录不存在会自动创建
            readOnly: true
      volumes:
      - name: nginx-confs
        configMap:
          name: nginx-confs
      - name: nginx-ssl
        secret:
          secretName: nginx-ssl

---

kind: Service
apiVersion: v1
metadata:
  namespace: nginx
  name: nginx-service
spec:
  type: NodePort
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 80
    nodePort: 30080
  selector:
    app: nginx-ssl
```



### 验证

- 目前只能在容器内部测试，因为上面定义的Service如果从外部访问将不是标准的https443端口

```bash
# netstat -ntl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      
tcp        0      0 :::80                   :::*                    LISTEN   



# curl -kH "Host:www.xiangzheng.com" https://127.0.0.1:443
...
<title>Welcome to nginx!</title>
...



# 容器内文件（以subPath定义的configmap不会生成软连接？即不支持动态修改？？？ 经测试确实不能动态修改，除非动态edit configmap后删除重建容器！）
# ls -la /etc/nginx/conf.d/
total 32
drwxr-xr-x    1 root     root          4096 Sep 18 16:44 .
drwxr-xr-x    1 root     root          4096 Sep 18 16:44 ..
-rw-r--r--    1 root     root          1093 Sep 18 16:44 default.conf
-rw-r--r--    1 root     root           149 Sep 18 16:44 myserver-gzip.cfg
-rw-r--r--    1 root     root            67 Sep 18 16:44 myserver-status.cfg
-rw-r--r--    1 root     root           554 Sep 18 16:44 myserver.conf
# ls -la /etc/nginx/certs/
total 8
drwxrwxrwt    3 root     root           120 Sep 18 16:44 .
drwxr-xr-x    1 root     root          4096 Sep 18 16:44 ..
drwxr-xr-x    2 root     root            80 Sep 18 16:44 ..2022_09_18_16_44_18.1989501488
lrwxrwxrwx    1 root     root            32 Sep 18 16:44 ..data -> ..2022_09_18_16_44_18.1989501488
lrwxrwxrwx    1 root     root            14 Sep 18 16:44 tls.crt -> ..data/tls.crt
lrwxrwxrwx    1 root     root            14 Sep 18 16:44 tls.key -> ..data/tls.key
```



# Secret docker-registry

- 专用于让kubelet启动Pod时从私有镜像仓库pull镜像时，首先认证到Registry时使用
- **还可以将该 Secret 定义到 ServiceAccount 的 imagePullSecrets中，引用的用于下载Pod中容器镜像的Secret对象列表，pod直接引用此信息可以避免在每个pod中都定义 Secret docker-registry 信息，而使用这个全局ServiceAccount验证信息**

## 范例 - 1

### 创建 Secret 的 docker-registry

```bash
# kubectl create ns docker
namespace/docker created


# 创建docker-registry，docker-server可省略
kubectl create secret docker-registry docker-auth \
--docker-username=azheng \
--docker-password=12345 \
--docker-server=harbor.xiangzheng.com \
-n docker


# 查看
# kubectl describe secrets -n docker docker-auth 
Name:         docker-auth
Namespace:    docker
Labels:       <none>
Annotations:  <none>

Type:  kubernetes.io/dockerconfigjson

Data
====
.dockerconfigjson:  102 bytes
# kubectl get secrets -n docker docker-auth -o yaml 
apiVersion: v1
data:
  .dockerconfigjson: eyJhdXRocyI6eyJoYXJib3IueGlhbmd6aGVuZy5jb20iOnsidXNlcm5hbWUiOiJhemhlbmciLCJwYXNzd29yZCI6IjEyMzQ1IiwiYXV0aCI6IllYcG9aVzVuT2pFeU16UTEifX19
kind: Secret
metadata:
  creationTimestamp: "2022-09-18T14:04:41Z"
  name: docker-auth
  namespace: docker
  resourceVersion: "196202"
  uid: 980eab31-767c-4fae-9001-f5e31de880cb
type: kubernetes.io/dockerconfigjson # 属于此类型



# 将 dockerconfigjson 解码后的信息
# echo "eyJhdXRocyI6eyJoYXJib3IueGlhbmd6aGVuZy5jb20iOnsidXNlcm5hbWUiOiJhemhlbmciLCJwYXNzd29yZCI6IjEyMzQ1IiwiYXV0aCI6IllYcG9aVzVuT2pFeU16UTEifX19" | base64 -d
{"auths":{"harbor.xiangzheng.com":{"username":"azheng","password":"12345","auth":"YXpoZW5nOjEyMzQ1"}}}


# 也能够从docker的认证文件中加载信息，这时使用--from-file选项； 
$HOME/.dockercfg, ~/.docker/config.json
```

### 在 pod 中引用 docker-registry

```bash
pod.spec.imagePullSecrets # 在此处引用
```







# Secret Yaml

## Secret 使用配置文件

- 与configmap基本一致

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secrets-volume-demo
  namespace: default
spec:
  containers:
  - image: nginx:alpine
    name: ngxserver
    volumeMounts:
    - name: nginxcerts # 引用volumes
      mountPath: /etc/nginx/certs/
      readOnly: true
    - name: nginxconfs
      mountPath: /etc/nginx/conf.d/
      readOnly: true
  volumes:
  - name: nginxcerts
    secret:
      secretName: nginx-ssl-secret # 引用secretName
  - name: nginxconfs
    configMap:
      name: nginx-sslvhosts-confs
      optional: false
```







# Secret Demo

## mysqld-exporter.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysqld-exporter-secret
  namespace: monitoring
type: Opaque
data:
  mysqld_exporter.cnf: W2NsaWVudF0KdXNlciA9IGV4cG9ydGVyIApwYXNzd29yZCA9IGV4cG9ydGVyX3Bhc3MK
  
---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysqld-exporter
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysqld-exporter
  template:
    metadata:
      labels:
        app: mysqld-exporter
    spec:
      containers:
      - name: mysqld-exporter
        image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/mysqld-exporter:v0.15.1
        ports:
        - containerPort: 9104
        args:
        - "--mysqld.address=172.16.30.55:3306"
        - "--config.my-cnf=/etc/mysqld_exporter/mysqld_exporter.cnf"
        livenessProbe:
          httpGet:
            path: /metrics
            port: 9104
          initialDelaySeconds: 15
          periodSeconds: 15
        volumeMounts:
        - name: config-volume
          mountPath: /etc/mysqld_exporter # /etc/mysqld_exporter 目录在挂载时会自动创建
          readOnly: true
      volumes:
      - name: config-volume
        secret:
          secretName: mysqld-exporter-secret
```

### 容器内部

```sh
root@k8s-master1:~/monitoring# kubectl exec -it -n monitoring mysqld-exporter-66c7958f4b-zzmrs sh
kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl exec [POD] -- [COMMAND] instead.
/ $ 
/ $ ls /etc/mysqld_exporter/ -la
total 4
drwxrwxrwt    3 root     root           100 Feb 29 10:52 .
drwxr-xr-x    1 root     root          4096 Feb 29 10:52 ..
drwxr-xr-x    2 root     root            60 Feb 29 10:52 ..2024_02_29_10_52_53.840078722
lrwxrwxrwx    1 root     root            31 Feb 29 10:52 ..data -> ..2024_02_29_10_52_53.840078722
lrwxrwxrwx    1 root     root            26 Feb 29 10:52 mysqld_exporter.cnf -> ..data/mysqld_exporter.cnf


/ $ ls /etc/mysqld_exporter/..2024_02_29_10_52_53.840078722/ -la
total 4
drwxr-xr-x    2 root     root            60 Feb 29 10:52 .
drwxrwxrwt    3 root     root           100 Feb 29 10:52 ..
-rw-r--r--    1 root     root            51 Feb 29 10:52 mysqld_exporter.cnf
```



## prometheus-k8s

```yaml
# kubectl get secrets -n kubesphere-monitoring-system prometheus-k8s -oyaml
apiVersion: v1
data:
  prometheus.yaml.gz: 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
kind: Secret
metadata:
  annotations:
    generated: "true"
  creationTimestamp: "2023-10-20T03:40:08Z"
  labels:
    managed-by: prometheus-operator
  name: prometheus-k8s
  namespace: kubesphere-monitoring-system
  ownerReferences:
  - apiVersion: monitoring.coreos.com/v1
    blockOwnerDeletion: true
    controller: true
    kind: Prometheus
    name: k8s
    uid: 53663853-b971-4e10-80ec-018e493f684e
  resourceVersion: "3127"
  uid: efb163e0-7469-4e37-a3a3-cdd2c1238e4c
type: Opaque
```

- **type:** 指定 Secret 中数据的类型，这里是 `Opaque`，表示任意不透明的二进制数据。

- **data:** 包含实际的敏感数据。在这个例子中，有一个键值对：
  - **prometheus.yaml.gz:** 存储的值是经过gzip压缩的 Prometheus 配置文件。这是二进制数据，因为Secrets中的数据被base64编码。



### 导出数据

在 Kubernetes 中，如果你想将 Secret 中的数据导出，你可以使用 `kubectl` 命令行工具和一些命令行工具（例如 `base64` 和 `gzip`）来解码和还原数据。以下是一个基本的步骤：

```sh
# 获取 Secret 的 base64 编码数据:
kubectl get secret prometheus-k8s -n kubesphere-monitoring-system -o yaml


# 将 data 中的 base64 数据解码:
echo 'H4sIAAAAA...' | base64 -d > prometheus.yaml.gz


# 解压
gzip -d prometheus.yaml.gz
```



### 导出的数据包含变量引用

```yaml
# head prometheus.yaml
global:
  evaluation_interval: 1m
  scrape_interval: 1m
  external_labels:
    prometheus: kubesphere-monitoring-system/k8s
    prometheus_replica: $(POD_NAME)
rule_files:
- /etc/prometheus/rules/prometheus-k8s-rulefiles-0/*.yaml
scrape_configs:
- job_name: serviceMonitor/kubesphere-monitoring-system/alertmanager-main/0
```

在这个 `prometheus.yaml` 文件中，`$(POD_NAME)` 是一个环境变量引用，它会在实际运行时由 Kubernetes 注入到 Prometheus 配置中。在这种情况下，`$(POD_NAME)` 是一个 [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator) 中定义的内置变量。

具体来说，在 Prometheus Operator 中，有一些内置的变量可以用于在配置文件中引用动态信息，其中 `$(POD_NAME)` 是其中之一。这个变量会被替换为运行 Prometheus 实例的 Pod 的名称。这对于在配置文件中动态指定一些信息（如标签或注释）是非常有用的，以便在多个实例中区分它们。

在你的配置文件中，`external_labels` 部分使用了 `$(POD_NAME)` 变量。当 Prometheus 运行时，`$(POD_NAME)` 会被替换为实际的 Pod 名称，这样就能够在 Prometheus 中标识出该实例。

在 Kubernetes 中，容器内部可以通过环境变量获取这些值。由于 Prometheus Operator 在 Kubernetes 中被广泛使用，因此这些变量通常由 Operator 通过 **Downward API** 注入到容器的环境变量中。
