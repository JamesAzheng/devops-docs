---
title: "ConfigMap"
weight: 10
---

# ConfigMap 概述

- ConfigMap，简称 cm，名称空间级别资源；
- ConfigMap 可以实现配置信息和镜像间解耦，也可以理解为是k8s中服务的**配置中心**



## ConfigMap 类型

- ConfigMap 有如下两种类型：

### 环境变量

- ConfigMap 以 k/v 格式保存配置项的名称和配置数据；
- Pod 中的容器以环境变量的方式从ConfigMap中加载特定的键的**值**。

### 存储卷

- ConfigMap 定义完整的配置文件；

- Pod 直接将 ConfigMap 以**存储卷**的形式进行附加，而由容器挂载至指定目录下，从而获取到完整的配置文件。

  - **注意：因为configmap是以存储卷的形式附加，所以configmap在pod中挂载时会覆盖掉原有目录中的内容，解决方案可以是在主配置文件中定义子配置文件目录，然后再子配置文件目录中挂载configmap中定义的配置文件**

  

## 其它镜像传参方式

1. 启动容器时，直接向应用程序传递参数，args: []
2. 将定义好的配置文件打入镜像之中
3. 通过环境变量向容器传递配置数据
   - 前提是应用得支持从环境变量加载配置信息
   - 制作镜像时，使用entrypoint脚本来预处理变量，常见的做法就是使用非交互式编辑工具(sed...)，将环境变量的值替换到应用的配置文件中
4. 基于存储卷向容器传递配置文件（运行中的容器更改 需要重新加载容器中的应用程序或重启容器）



## 参考文档

- https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/#configmap
- https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-pod-configmap/







# ConfigMap Cmd

## 创建 K/V 格式的 ConfigMap 

- ` kubectl create <configmap|cm> NAME <--from-literal=key_name=value_name> [--from-literal=key_name=value_name]... `

```yaml
# kubectl create cm my.cnf --from-literal=key1=value1 --from-literal=key2=value2
configmap/my.cnf created


# kubectl get cm my.cnf 
NAME     DATA   AGE
my.cnf   2      38s


# kubectl get cm my.cnf -o yaml 
apiVersion: v1
data: # 定义的键值对：
  key1: value1
  key2: value2
kind: ConfigMap
metadata:
  creationTimestamp: "2022-09-17T12:01:20Z"
  name: my.cnf
  namespace: default
  resourceVersion: "120308"
  uid: d92eee14-078d-40b7-89d3-5ed15d92a8b3


# kubectl describe cm my.cnf
Name:         my.cnf
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
key1:
----
value1
key2:
----
value2

BinaryData
====

Events:  <none>
```

## 基于宿主机文件创建 ConfigMap 

- 这种方式可以在配置文件较大时进行手动导入而生成configmap，避免了手动粘贴配置文件而导致的缩进不统一等错误的产生
- ` kubectl create <configmap|cm> NAME <--from-file=[key_name=]source> [--from-file=[key_name=]source]... `

```yaml
# ls conf.d/
a.conf  b.conf
# cat conf.d/a.conf 
a conf content
# cat conf.d/b.conf 
b conf content


# 创建时可以自定义key_name，例如下面的b.conf，指定key_name的话会以key_name为基准
# kubectl create cm nginx.conf --from-file=conf.d/a.conf --from-file=b.cnf=conf.d/b.conf
configmap/nginx.conf created


# kubectl get cm nginx.conf -o yaml 
apiVersion: v1
data:
  a.conf: | # 不指定key_name的话会以文件名作为key_name，| 表示使用原有格式显示，否则配置文件内容会显示成为一行
    a conf content
  b.cnf: | # 指定key_name的话会以key_name为基准
    b conf content
kind: ConfigMap
metadata:
  creationTimestamp: "2022-09-17T12:07:43Z"
  name: nginx.conf
  namespace: default
  resourceVersion: "120767"
  uid: ee527428-f214-4219-9b39-836948421368

# kubectl describe cm nginx.conf
Name:         nginx.conf
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
a.conf:
----
a conf content

b.cnf: # 指定key_name的话会以key_name为基准
----
b conf content


BinaryData
====

Events:  <none>
```



### 基于目录创建 ConfigMap 

```yaml
# ls conf.d/
a.conf  b.conf
# cat conf.d/a.conf 
a conf content
# cat conf.d/b.conf 
b conf content


# kubectl create cm nginx.conf --from-file=conf.d/
configmap/nginx.conf created


# kubectl get cm nginx.conf -o yaml 
apiVersion: v1
data:
  a.conf: |
    a conf content
  b.conf: |
    b conf content
kind: ConfigMap
metadata:
  creationTimestamp: "2022-09-17T12:13:44Z"
  name: nginx.conf
  namespace: default
  resourceVersion: "121205"
  uid: f3d5270e-1e2c-4358-8546-039cf2cc7ef3
```





# ConfigMap Example

## 注意事项

- data下的自定义配置文件缩进非常严格，直接粘贴可能会导致报错
- 如果基于存储卷的方式挂载配置文件，**被挂载目录中的原有文件会被覆盖（除非使用`Pod.spec.containers.volumeMounts.subPath`挂载子路径???）**

## 范例：为 Pod 传递环境变量

- ConfigMap 仅定义 K/V 格式变量；

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: demoapp-config
  namespace: default
data:
  demoapp.port: "8899" # 定义
  demoapp.host: 127.0.0.1 # 定义
```

### Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: configmaps-env-demo
  namespace: default
spec:
  containers:
  - image: ikubernetes/demoapp:v1.0
    name: demoapp
    env:
    - name: PORT # 自定义键
      valueFrom: # 值来自：
        configMapKeyRef: # 来自configMap
          name: demoapp-config # 选择configMap；需等于ConfigMap.metadata.name
          key: demoapp.port # 选择configMap中具体的key；需等于ConfigMap.data中的key
          optional: false # 是否可选，true可选，false必选(不存在则会报错退出)
    - name: HOST
      valueFrom:
        configMapKeyRef:
          name: demoapp-config
          key: demoapp.host
          optional: true # true表示可选，不存在则会忽略
```

### 验证

```sh
[root@configmaps-env-demo /]# ss -ntl
State       Recv-Q     Send-Q     Local Address:Port      Peer Address:Port           
LISTEN      0          128            127.0.0.1:8899           0.0.0.0:*                 


[root@configmaps-env-demo /]# env
KUBERNETES_SERVICE_PORT=443
KUBERNETES_PORT=tcp://10.96.0.1:443
HOSTNAME=configmaps-env-demo
SHLVL=1
PORT=8899 # 引入的环境变量
HOME=/root
PS1=[\u@\h \w]\$ 
TERM=xterm
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
KUBERNETES_PORT_443_TCP_PORT=443
KUBERNETES_PORT_443_TCP_PROTO=tcp
HOST=127.0.0.1 # 引入的环境变量
DEPLOYENV=Production
KUBERNETES_SERVICE_PORT_HTTPS=443
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
RELEASE=Stable
KUBERNETES_SERVICE_HOST=10.96.0.1
PWD=/
```



## 范例：为 Pod 传递配置文件

- ConfigMap 仅定义存储卷类型的配置文件；

### ConfigMap

```yaml
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
  myserver.conf: |
    server {
        listen 8080;
        server_name www.ik8s.io;

        include /etc/nginx/conf.d/myserver-*.cfg;

        location / {
            root /usr/share/nginx/html;
        }
    }
kind: ConfigMap
metadata:
  name: nginx-config-files
  namespace: default
```

### Pod

#### 正常 Pod 中的内容

```sh
root@k8s-master-1:~# kubectl run test-nginx --image=nginx:1.23

root@k8s-master-1:~# kubectl exec -it test-nginx -- bash

root@test-nginx:/# ls -la /etc/nginx/conf.d/
total 20
drwxr-xr-x 1 root root 4096 Dec 30 03:46 .
drwxr-xr-x 1 root root 4096 Dec 21 11:28 ..
-rw-r--r-- 1 root root 1093 Dec 30 03:46 default.conf
```



#### 格式一

- volumes 引用 configMap中的**部分内容**，volumeMounts 将其挂载到整个目录下；
- **注意：这种方式会将挂载目录中原有的内容覆盖**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-1
  labels:
    app: nginx
  namespace: default
spec:
  containers:
  - name: nginx-container
    image: nginx:1.23
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: nginx-confs # 引用卷名称
      mountPath: /etc/nginx/conf.d  # 容器上的路径，如果此目录事先不存在则会自动创建
      readOnly: true # 只读方式挂载   
  volumes:
  - name: nginx-confs # 定义卷名称
    configMap:
      name: nginx-config-files # 选择ConfigMap的名称，来自ConfigMap.metadata.name
      items: # 引用configMap中的部分内容
        - key: myserver.conf # 来自 ConfigMap.data 中的key
          path: myserver.conf # 定义配置文件名称
          mode: 0644 # 定义文件权限
```

##### 验证

```sh
root@k8s-master-1:~# kubectl exec -it nginx-1 -- bash

root@nginx-1:/# ls -la /etc/nginx/conf.d/
total 12
drwxrwxrwx 3 root root 4096 Dec 30 03:51 .
drwxr-xr-x 3 root root 4096 Dec 21 11:28 ..
drwxr-xr-x 2 root root 4096 Dec 30 03:51 ..2022_12_30_03_51_46.4171449151
lrwxrwxrwx 1 root root   32 Dec 30 03:51 ..data -> ..2022_12_30_03_51_46.4171449151
lrwxrwxrwx 1 root root   20 Dec 30 03:51 myserver.conf -> ..data/myserver.conf
```



#### 格式二

- volumes 引用 configMap 中的**全部内容**，volumeMounts 单独选择要挂载的文件；
- **注意：这种方式挂载目录中原有的内容不会被覆盖覆盖，但不会生成软链接，因此无法通过修改configmap的方式动态修改配置文件**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-2
  namespace: default
spec:
  containers:
  - image: nginx:1.23
    name: nginx-server
    volumeMounts: # 在Pod挂载时单独选择要挂载的文件
    - name: ngxconfs # 引用卷名称
      mountPath: /etc/nginx/conf.d/myserver.conf
      subPath: myserver.conf # 挂载子路径，而非整个目录
      readOnly: true
    - name: ngxconfs # 引用卷名称
      mountPath: /etc/nginx/conf.d/myserver-gzip.cfg
      subPath: myserver-gzip.cfg
      readOnly: true
  volumes:
  - name: ngxconfs # 定义卷名称
    configMap: # 选择ConfigMap的名称，来自ConfigMap.metadata.name，引用 configMap 中的全部内容
      name: nginx-config-files
```

##### 验证

```sh
root@k8s-master-1:~# kubectl exec -it nginx-2 -- bash

root@nginx-2:/# ls -la /etc/nginx/conf.d/
total 28
drwxr-xr-x 1 root root 4096 Dec 30 04:13 .
drwxr-xr-x 1 root root 4096 Dec 21 11:28 ..
-rw-r--r-- 1 root root 1093 Dec 30 04:13 default.conf # 挂载目录中原有的内容不会被覆盖覆盖
# 选择部分挂载的方式不会生成软链接，因此无法通过修改configmap的方式动态修改配置文件
-rw-r--r-- 1 root root  149 Dec 30 04:13 myserver-gzip.cfg
-rw-r--r-- 1 root root  164 Dec 30 04:13 myserver.conf
```

## 范例：为 fluent-bit 传递配置文件

### ConfigMap

- ConfigMap定义

```yaml
apiVersion: v1
kind: ConfigMap
...
  name: fluent-bit # ConfigMap命名为fluent-bit
...
data: # 其中包含两个配置文件
  custom_parsers.conf: | # 配置文件1
    [PARSER]
        Name docker_no_time
        Format json
        Time_Keep Off
        Time_Key time
        Time_Format %Y-%m-%dT%H:%M:%S.%L
  fluent-bit.conf: | # 配置文件2
    [SERVICE]
        Daemon Off
        Flush 1
        Log_Level info
        Parsers_File parsers.conf
        Parsers_File custom_parsers.conf
        HTTP_Server On
        HTTP_Listen 0.0.0.0
        HTTP_Port 2020
        Health_Check On
...
```

### Pod

```yaml
...
    volumeMounts: # 挂载volumes
    - mountPath: /fluent-bit/etc/fluent-bit.conf # 挂载路径和文件名
      name: config # 挂载时引用的是volumes定义的名字
      subPath: fluent-bit.conf # 选择的是configMap中的子文件，ConfigMap.data.fluent-bit.conf
    - mountPath: /fluent-bit/etc/custom_parsers.conf
      name: config
      subPath: custom_parsers.conf
...
  volumes:
  - configMap: # 定义volumes引用configMap
      defaultMode: 420
      name: fluent-bit # 引用的是fluent-bit这个configMap
    name: config # volumes定义的名字
```







## 范例：综合实践

- 引用 ConfigMap 中的部分配置文件以及环境变量

### ConfigMap

```sh
# ls
envoy.yaml  lds.conf

# kubectl create cm demoapp-confs --from-file=./envoy.yaml --from-file=./lds.conf --from-literal=demoapp.port=8080 --from-literal=demoapp.host=0.0.0.0
configmap/demoapp-confs created
```

#### describe

```yaml
# kubectl describe cm demoapp-confs
Name:         demoapp-confs
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
demoapp.host:
----
0.0.0.0
demoapp.port:
----
8080
envoy.yaml:
----
node:
  id: sidecar-proxy
  cluster: demoapp-cluster

admin:
  access_log_path: /tmp/admin_access.log
  address:
    socket_address: { address: 0.0.0.0, port_value: 9901 }

dynamic_resources:
  lds_config:
    path: '/etc/envoy/lds.conf'

static_resources:
  clusters:
  - name: local_service
    connect_timeout: 0.25s
    type: STATIC
    lb_policy: ROUND_ROBIN
    load_assignment:
      cluster_name: local_service
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: 127.0.0.1
                port_value: 8080

lds.conf:
----
{
  "version_info": "0",
  "resources": [
    {
      "@type": "type.googleapis.com/envoy.api.v2.Listener",
      "name": "listener_0",
      "address": {
        "socket_address": {
          "address": "0.0.0.0",
          "port_value": 80
        }
      },
      "filter_chains": [
        {
          "filters": [
            {
              "name": "envoy.http_connection_manager",
              "config": {
                "stat_prefix": "ingress_http",
                "codec_type": "AUTO",
                "route_config": {
                  "name": "local_route",
                  "virtual_hosts": [
                    {
                      "name": "local_service",
                      "domains": [
                        "*"
                      ],
                      "routes": [
                        {
                          "match": {
                            "prefix": "/"
                          },
                          "route": {
                            "cluster": "local_service"
                          }
                        }
                      ]
                    }
                  ]
                },
                "http_filters": [
                  {
                    "name": "envoy.router"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}


BinaryData
====

Events:  <none>
```

#### yaml

- `kubectl get cm demoapp-confs -o yaml`

```yaml
# kubectl get cm demoapp-confs -o yaml 
apiVersion: v1
data:
  demoapp.host: 0.0.0.0
  demoapp.port: "8080"
  envoy.yaml: |
    node:
      id: sidecar-proxy
      cluster: demoapp-cluster

    admin:
      access_log_path: /tmp/admin_access.log
      address:
        socket_address: { address: 0.0.0.0, port_value: 9901 }

    dynamic_resources:
      lds_config:
        path: '/etc/envoy/lds.conf'

    static_resources:
      clusters:
      - name: local_service
        connect_timeout: 0.25s
        type: STATIC
        lb_policy: ROUND_ROBIN
        load_assignment:
          cluster_name: local_service
          endpoints:
          - lb_endpoints:
            - endpoint:
                address:
                  socket_address:
                    address: 127.0.0.1
                    port_value: 8080
  lds.conf: |
    {
      "version_info": "0",
      "resources": [
        {
          "@type": "type.googleapis.com/envoy.api.v2.Listener",
          "name": "listener_0",
          "address": {
            "socket_address": {
              "address": "0.0.0.0",
              "port_value": 80
            }
          },
          "filter_chains": [
            {
              "filters": [
                {
                  "name": "envoy.http_connection_manager",
                  "config": {
                    "stat_prefix": "ingress_http",
                    "codec_type": "AUTO",
                    "route_config": {
                      "name": "local_route",
                      "virtual_hosts": [
                        {
                          "name": "local_service",
                          "domains": [
                            "*"
                          ],
                          "routes": [
                            {
                              "match": {
                                "prefix": "/"
                              },
                              "route": {
                                "cluster": "local_service"
                              }
                            }
                          ]
                        }
                      ]
                    },
                    "http_filters": [
                      {
                        "name": "envoy.router"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
kind: ConfigMap
metadata:
  creationTimestamp: "2022-12-29T15:40:03Z"
  name: demoapp-confs
  namespace: default
  resourceVersion: "2182772"
  uid: a4cb8114-59b3-41eb-9db8-bb7068f76953
```

### Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: default
spec:
  containers:
  - name: proxy
    image: envoyproxy/envoy-alpine:v1.14.1
    command: ['/bin/sh','-c','envoy -c /etc/envoy/..data/envoy.yaml']
    volumeMounts:
    - name: appconfs # 挂载
      mountPath: /etc/envoy # 挂载路径，最终会出现 /etc/envoy/envoy.yaml 和 /etc/envoy/lds.conf
      readOnly: true
  - name: demo
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
    env:
    - name: PORT
      valueFrom:
        configMapKeyRef:
          name: demoapp-confs # 选择configMap的名称
          key: demoapp.port # 选择configMap中对应的key
          optional: false # 必选项
    - name: HOST
      valueFrom:
        configMapKeyRef:
          name: demoapp-confs
          key: demoapp.host
          optional: true # 可选项
  volumes:
  - name: appconfs # 定义
    configMap:
      name: demoapp-confs
      items: # 加载 demoapp-confs configMap 中的部分信息
      - key: envoy.yaml # 导出 demoapp-confs configMap 中的 envoy.yaml
        path: envoy.yaml
        mode: 0644
      - key: lds.conf # 导出 demoapp-confs configMap 中的 lds.conf
        path: lds.conf
        mode: 0644
      optional: false
```

### 验证

```bash
# kubectl get pods demoapp -o json
...
    "status": {
...
        "podIP": "10.244.1.153",
...


# kubectl get pods demoapp -o go-template={{.status.podIP}}
10.244.1.153


# curl -i $(kubectl get pods demoapp -o go-template={{.status.podIP}})
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
content-length: 94
server: envoy # envoy响应
date: Thu, 29 Dec 2022 15:49:07 GMT
x-envoy-upstream-service-time: 2

iKubernetes demoapp v1.0 !! ClientIP: 127.0.0.1, ServerName: demoapp, ServerIP: 10.244.1.153!



# curl -i $(kubectl get pods demoapp -o go-template={{.status.podIP}}):8080
HTTP/1.0 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 95
Server: Werkzeug/1.0.0 Python/3.8.2 # 自定义程序响应
Date: Thu, 29 Dec 2022 15:49:30 GMT

iKubernetes demoapp v1.0 !! ClientIP: 10.244.0.0, ServerName: demoapp, ServerIP: 10.244.1.153!


# kubectl exec demoapp -- ls -la /etc/envoy/
Defaulted container "proxy" out of: proxy, demo
total 12
drwxrwxrwx    3 root     root          4096 Dec 29 15:43 .
drwxr-xr-x    1 root     root          4096 Dec 29 15:43 ..
drwxr-xr-x    2 root     root          4096 Dec 29 15:43 ..2022_12_29_15_43_13.4125477581
lrwxrwxrwx    1 root     root            32 Dec 29 15:43 ..data -> ..2022_12_29_15_43_13.4125477581
lrwxrwxrwx    1 root     root            17 Dec 29 15:43 envoy.yaml -> ..data/envoy.yaml
lrwxrwxrwx    1 root     root            15 Dec 29 15:43 lds.conf -> ..data/lds.conf


# 定义的环境变量在不同容器间也会隔离
# kubectl exec demoapp -- env
Defaulted container "proxy" out of: proxy, demo
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=demoapp
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
KUBERNETES_SERVICE_HOST=10.96.0.1
KUBERNETES_SERVICE_PORT=443
KUBERNETES_SERVICE_PORT_HTTPS=443
KUBERNETES_PORT=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP_PROTO=tcp
KUBERNETES_PORT_443_TCP_PORT=443
LANG=C.UTF-8
HOME=/root


# 定义的环境变量在不同容器间也会隔离
# kubectl exec demoapp -c demo -- env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=demoapp
PORT=8080 #
HOST=0.0.0.0 #
KUBERNETES_PORT_443_TCP_PORT=443
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
KUBERNETES_SERVICE_HOST=10.96.0.1
KUBERNETES_SERVICE_PORT=443
KUBERNETES_SERVICE_PORT_HTTPS=443
KUBERNETES_PORT=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP_PROTO=tcp
DEPLOYENV=Production
RELEASE=Stable
PS1=[\u@\h \w]\$ 
HOME=/root
```













## 范例：动态修改配置文件

- ConfigMap 支持动态修改配置文件，修改配置文件的操作本质上是指向新的软链接
- 新的配置文件是否能对服务生效 取决于服务本身是否支持动态读取配置文件 或手动触发重读配置文件
- **注意：修改 ConfigMap 后，不会立刻生效，而是过一个随机时间周期后生效（错峰生效）**

### 修改前

```bash
# ls -la /etc/nginx/conf.d/
total 12
drwxrwxrwx    3 root     root          4096 Sep 18 01:46 .
drwxr-xr-x    3 root     root          4096 Jul 18 23:43 ..
drwxr-xr-x    2 root     root          4096 Sep 18 01:46 ..2022_09_18_01_46_17.2998841080
lrwxrwxrwx    1 root     root            32 Sep 18 01:46 ..data -> ..2022_09_18_01_46_17.2998841080
lrwxrwxrwx    1 root     root            24 Sep 18 01:46 nginx-azheng.conf -> ..data/nginx-azheng.conf


# 访问测试
# curl -I 10.0.0.100:30080
HTTP/1.1 200 OK
```

### 修改

```bash
# vim wordpress.yaml
...
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-confs
  namespace: wordpress
data:
  nginx-azheng.conf: |
    server {
      listen 80;
      server_name azheng.io;

      location / {
          root /var/www/html;
          index index.php;
          deny  all; # 添加此行
      }
....


# kubectl apply -f wordpress.yaml 
configmap/nginx-confs configured
```

### 修改后

```bash
# 指向了新的软链接时间戳
# ls -la /etc/nginx/conf.d/
total 12
drwxrwxrwx    3 root     root          4096 Sep 18 02:01 .
drwxr-xr-x    3 root     root          4096 Jul 18 23:43 ..
drwxr-xr-x    2 root     root          4096 Sep 18 02:01 ..2022_09_18_02_01_33.2246312080
lrwxrwxrwx    1 root     root            32 Sep 18 02:01 ..data -> ..2022_09_18_02_01_33.2246312080
lrwxrwxrwx    1 root     root            24 Sep 18 01:46 nginx-azheng.conf -> ..data/nginx-azheng.conf



# cat /etc/nginx/conf.d/nginx-azheng.conf 
server {
  listen 80;
  server_name azheng.io;

  location / {
      root /var/www/html;
      index index.php;
      deny  all; # 出现
  }
...


# 因为nginx不支持自动重载配置文件，所以需要手动使其重读配置文件
# nginx -s reload
2022/09/18 02:05:20 [notice] 52#52: signal process started


# curl -I 10.0.0.100:30080
HTTP/1.1 403 Forbidden
```





## 范例：torrc

- torrc 的配置文件需要动态生成，因此需要一个 configmap的模板



```sh
TestingTorNetwork 1
AssumeReachable 1
PathsNeededToBuildCircuits 0.25
TestingDirAuthVoteExit *
TestingDirAuthVoteHSDir *
V3AuthNIntervalsValid 2

TestingDirAuthVoteGuard *
TestingMinExitFlagThreshold 0
Sandbox 1


RunAsDaemon 0
ConnLimit 60
ShutdownWaitLength 0
Log info stdout
ProtocolWarnings 1
SafeLogging 0
DisableDebuggerAttachment 0

Nickname dauviphoochi
DataDirectory /tor/dauviphoochi
Log notice file /tor/dauviphoochi/log
Address 10.200.66.129
AuthoritativeDirectory 1
V3AuthoritativeDirectory 1

TestingV3AuthInitialVotingInterval 60
V3AuthVotingInterval 10 minutes
TestingV3AuthInitialVoteDelay 5
V3AuthVoteDelay 5
TestingV3AuthInitialDistDelay 5
V3AuthDistDelay 5
OrPort 7000
Dirport 9030
ExitPolicy accept *:*
DirAuthority daohhufahuyo orport=7000 no-v2 v3ident=FD387687F41AB43116F453210A7A2028B9BE3B26 10.200.66.69:9030 03625695AED18BDD520B7F062BD53DAD03408BB7
DirAuthority dauviphoochi orport=7000 no-v2 v3ident=FD009655F9BCB6980A2B1C71C1573D065CA624BA 10.200.66.129:9030 50C3A445640C9C5528D09B2C2C88100EAA527905
DirAuthority daleeyaiphei orport=7000 no-v2 v3ident=D826BF64AF8B01DB1EEE9C3387AF5F7B20C88471 10.200.66.128:9030 7DC215ED69E649326B709D4897D3281821064E1D
```





