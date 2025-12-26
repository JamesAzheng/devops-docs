# 前言

- **Deployment 不适合运行 zookeeper 这种有状态服务，下面的内容仅作参考**







# 说明

**目前有以下几个问题：**

- **zookeeper-service.yaml 中 如果使用 type: NodePort 并且定义 nodePort: 32181，那么在 zookeeper 中使用 service 的名称来定义其它 zookeeper 节点的地址将无法完成 leader 选举，除非使用 Pod 的 IP，但使用 Pod 的 IP 又无法实现当 Pod 宕机 IP 被回收所导致的高可用问题**
- **zookeeper-service.yaml 中 如果使用 type: ClusterIP 并且定义 clusterIP: None，虽然可以完成 leader 的选举，但又无法实现从外部访问 zookeeper cluster**
- **另外镜像还需修改，因为各集群节点需手工添加：**

- ```bash
  # cat /zookeeper/apache-zookeeper-3.8.0-bin/conf/zoo.cfg 
  dataDir=/data/zookeeper
  dataLogDir=/data/zookeeper/logs
  tickTime=2000
  initLimit=10
  syncLimit=5
  clientPort=2181
  server.1=zookeeper-service-1.zookeeper.svc.kubecluster.local:2888:3888
  server.2=zookeeper-service-2.zookeeper.svc.kubecluster.local:2888:3888
  server.3=zookeeper-service-3.zookeeper.svc.kubecluster.local:2888:3888
  ```

  





# 部署 nfs 存储

...









# 制作 zookeeper 镜像

## 相关文件

- **注意：entrypoint.sh 脚本需要加执行权限**

```bash
# ll /data/dockerfile/zookeeper/
total 12892
drwxr-xr-x 2 root root     4096 Jul 14 14:58 ./
drwxr-xr-x 7 root root     4096 Jul 14 14:45 ../
-rw-r--r-- 1 root root 13185104 Jun 11 14:05 apache-zookeeper-3.8.0-bin.tar.gz
-rw-r--r-- 1 root root        0 Jul 14 14:45 Dockerfile
-rwxr-xr-x 1 root root     1860 Jul 14 14:58 entrypoint.sh*
```

## apache-zookeeper-3.8.0-bin.tar.gz

```bash
# sha512sum /data/dockerfile/zookeeper/apache-zookeeper-3.8.0-bin.tar.gz 
d66e3a40451f840406901b2cd940992b001f92049a372ae48d8b420891605871cd1ae5f6cceb3b10665491e7abef36a4078dace158bd1e0938fcd3567b5234ca  /data/dockerfile/zookeeper/apache-zookeeper-3.8.0-bin.tar.gz


# 官方提供的校验码
d66e3a40451f840406901b2cd940992b001f92049a372ae48d8b420891605871cd1ae5f6cceb3b10665491e7abef36a4078dace158bd1e0938fcd3567b5234ca-apache-zookeeper-3.8
```

## entrypoint.sh

- offical

```bash
#!/bin/bash
#
#********************************************************************
#Author:	     	xiangzheng
#QQ: 			    767483070
#Date: 		     	2022-07-14
#FileName：		    entrypoint.sh
#URL: 		    	https://www.xiangzheng.vip
#Email: 		    rootroot25@163.com
#Description：		The test script
#Copyright (C): 	2022 All rights reserved
#********************************************************************

set -e

# Allow the container to be started with `--user`
if [[ "$1" = 'zkServer.sh' && "$(id -u)" = '0' ]]; then
    chown -R zookeeper "$ZOO_DATA_DIR" "$ZOO_DATA_LOG_DIR" "$ZOO_LOG_DIR"
    exec gosu zookeeper "$0" "$@"
fi

# Generate the config only if it doesn't exist
if [[ ! -f "$ZOO_CONF_DIR/zoo.cfg" ]]; then
    CONFIG="$ZOO_CONF_DIR/zoo.cfg"
    {
        echo "dataDir=$ZOO_DATA_DIR"
        echo "dataLogDir=$ZOO_DATA_LOG_DIR"

        echo "tickTime=$ZOO_TICK_TIME"
        echo "initLimit=$ZOO_INIT_LIMIT"
        echo "syncLimit=$ZOO_SYNC_LIMIT"

        echo "autopurge.snapRetainCount=$ZOO_AUTOPURGE_SNAPRETAINCOUNT"
        echo "autopurge.purgeInterval=$ZOO_AUTOPURGE_PURGEINTERVAL"
        echo "maxClientCnxns=$ZOO_MAX_CLIENT_CNXNS"
        echo "standaloneEnabled=$ZOO_STANDALONE_ENABLED"
        echo "admin.enableServer=$ZOO_ADMINSERVER_ENABLED"
    } >> "$CONFIG"
    if [[ -z $ZOO_SERVERS ]]; then
      ZOO_SERVERS="server.1=localhost:2888:3888;2181"
    fi

    for server in $ZOO_SERVERS; do
        echo "$server" >> "$CONFIG"
    done

    if [[ -n $ZOO_4LW_COMMANDS_WHITELIST ]]; then
        echo "4lw.commands.whitelist=$ZOO_4LW_COMMANDS_WHITELIST" >> "$CONFIG"
    fi

    for cfg_extra_entry in $ZOO_CFG_EXTRA; do
        echo "$cfg_extra_entry" >> "$CONFIG"
    done
fi

# Write myid only if it doesn't exist
if [[ ! -f "$ZOO_DATA_DIR/myid" ]]; then
    echo "${ZOO_MY_ID:-1}" > "$ZOO_DATA_DIR/myid"
fi

exec "$@"
```

- test

```bash
#!/bin/bash
#
#********************************************************************
#Author:	     	xiangzheng
#QQ: 			    767483070
#Date: 		     	2022-07-14
#FileName：		    entrypoint.sh
#URL: 		    	https://www.xiangzheng.vip
#Email: 		    rootroot25@163.com
#Description：		The test script
#Copyright (C): 	2022 All rights reserved
#********************************************************************

set -e

# 仅当配置文件不存在时生成配置文件
if [[ ! -f "${ZOO_WORK_DIR}/conf/zoo.cfg" ]]; then
    CONFIG="${ZOO_WORK_DIR}/conf/zoo.cfg"
    {
        echo "dataDir=${ZOO_DATA_DIR}"
        echo "dataLogDir=${ZOO_DATA_LOG_DIR}"

        echo "tickTime=${ZOO_TICK_TIME}"
        echo "initLimit=${ZOO_INIT_LIMIT}"
        echo "syncLimit=${ZOO_SYNC_LIMIT}"

        echo "clientPort=${ZOO_CLI_PORT}"
    } >> "$CONFIG"
fi



# 通过循环方式添加集群节点
for ID in `seq ${CLUSTER_NUM}`;do
    echo "server.${ID}=10.0.0.100:2888:3888" >> $CONFIG
done

# 本节点ID
echo ${MY_ID} > /data/zookeeper/myid



/usr/bin/tail -f /etc/hosts
```





## Dockerfile

- 基于定制的 jdk 镜像制作 zookeeper 镜像
- /data/dockerfile/zookeeper/Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-app/jdk-8u333-base-ubuntu:1.0

LABEL version="1.0" \
      maintainer="XiangZheng <767483070@qq.com>"

ADD apache-zookeeper-3.8.0-bin.tar.gz /zookeeper/

    # 指定工作目录
ENV ZOO_WORK_DIR=/zookeeper/apache-zookeeper-3.8.0-bin \
    # zookeeper 数据保存目录
    ZOO_DATA_DIR=/data/zookeeper \
    # zookeeper 数据日志保存目录
    ZOO_DATA_LOG_DIR=/data/zookeeper/logs\
    # zookeeper 节点间心跳节点检测时间间隔，毫秒为单位
    ZOO_TICK_TIME=2000 \
    # 集群中的 leader 与 follower服务器的初始连接心跳检测次数
    # 此处的10表示 当初始连接超过10个2000毫秒后此follower将视为不可用
    ZOO_INIT_LIMIT=10 \
    # 集群中的 leader 与 follower服务器的连接后，后期的心跳检测次数
    # 此处的5表示 当后续连接超过5个2000毫秒后此follower将视为不可用
    ZOO_SYNC_LIMIT=5 \
    # 监听客户端连接的端口
    ZOO_CLI_PORT=2181


RUN set -eux; \
    # 定义启动用户
    groupadd -r zookeeper --gid=2181; \
    useradd -r -g zookeeper --uid=2181 zookeeper; \
    chown -R zookeeper.zookeeper ${ZOO_WORK_DIR}; \
    # 创建数据存放目录
    mkdir -p /data/zookeeper/logs



WORKDIR ${ZOO_WORK_DIR}

EXPOSE 2181 2888 3888 8080

COPY entrypoint.sh /

#ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]
ENTRYPOINT ["/entrypoint.sh"]
#CMD ["zkServer.sh", "start-foreground"]
```



**测试：**

```bash
docker run --rm -d --name zookeeper zookeeper-3.8.0-jdk-8u333:1.0 ; docker exec -it zookeeper bash

docker stop zookeeper


docker images |grep zoo ; docker ps -a |grep zoo




server.1=zookeeper-service-1.zookeeper.svc.kubecluster.local:2888:3888
server.2=zookeeper-service-2.zookeeper.svc.kubecluster.local:2888:3888
server.3=zookeeper-service-3.zookeeper.svc.kubecluster.local:2888:3888



server.1=zookeeper-service-1:2888:3888
server.2=zookeeper-service-2:2888:3888
server.3=zookeeper-service-3:2888:3888

 


server.1=192.168.3.144:2888:3888
server.2=192.168.12.58:2888:3888
server.3=192.168.8.64:2888:3888


# docker run --rm -e CLUSTER_NUM=3 -e MY_ID=1 -d --name zookeeper zookeeper-3.8.0-jdk-8u333:1.0 ; docker exec -it zookeeper bash
# cat conf/zoo.cfg     
dataDir=/data/zookeeper
dataLogDir=/data/zookeeper/logs
tickTime=2000
initLimit=10
syncLimit=5
clientPort=2181
server.1=10.0.0.100:2888:3888
server.2=10.0.0.100:2888:3888
server.3=10.0.0.100:2888:3888
# cat /data/zookeeper/myid 
1

```

- 配置文件

```bash
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/data/zookeeper
clientPort=2181




# cat zoo.cfg.bak 
# The number of milliseconds of each tick
tickTime=2000
# The number of ticks that the initial 
# synchronization phase can take
initLimit=10
# The number of ticks that can pass between 
# sending a request and getting an acknowledgement
syncLimit=5
# the directory where the snapshot is stored.
# do not use /tmp for storage, /tmp here is just 
# example sakes.
dataDir=/tmp/zookeeper
# the port at which the clients will connect
clientPort=2181
# the maximum number of client connections.
# increase this if you need to handle more clients
#maxClientCnxns=60
#
# Be sure to read the maintenance section of the 
# administrator guide before turning on autopurge.
#
# https://zookeeper.apache.org/doc/current/zookeeperAdmin.html#sc_maintenance
#
# The number of snapshots to retain in dataDir
#autopurge.snapRetainCount=3
# Purge task interval in hours
# Set to "0" to disable auto purge feature
#autopurge.purgeInterval=1

## Metrics Providers
#
# https://prometheus.io Metrics Exporter
#metricsProvider.className=org.apache.zookeeper.metrics.prometheus.PrometheusMetricsProvider
#metricsProvider.httpHost=0.0.0.0
#metricsProvider.httpPort=7000
#metricsProvider.exportJvmInfo=true

```





## 构建镜像并上传到 harbor

- **构建镜像**

```bash
docker build -t zookeeper-3.8.0-jdk-8u333:1.0 .
```

- **在 harbor 创建项目，并命名为 如：baseimages-os，访问级别设为公开**

- **打标签然后上传到 harbor**

```bash
# 打标签
docker tag zookeeper-3.8.0-jdk-8u333:1.0 harbor.xiangzheng.vip/baseimages-os/zookeeper-3.8.0-jdk-8u333:1.0

# 上传
docker push harbor.xiangzheng.vip/baseimages-os/zookeeper-3.8.0-jdk-8u333:1.0
```





# k8s 编排 zookeeper 镜像（imperfect）

## 相关文件

```bash
# tree /data/yaml/zookeeper/
/data/yaml/zookeeper/
├── pv
│   ├── zookeeper-pvc.yaml
│   └── zookeeper-pv.yaml
├── zookeeper-deployment.yaml
├── zookeeper-namespace.yaml
└── zookeeper-service.yaml

1 directory, 5 files
```

## zookeeper-namespace.yaml

```yaml
# cat /data/yaml/zookeeper/zookeeper-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: zookeeper
```

- **加载**

```bash
# kubectl apply -f /data/yaml/zookeeper/zookeeper-namespace.yaml 
namespace/zookeeper created


# kubectl get namespaces 
NAME              STATUS   AGE
...
zookeeper         Active   3m37s
```



## zookeeper-service.yaml

- **外部访问问题如何解决？？？**

```yaml
# cat /data/yaml/zookeeper/zookeeper-service.yaml
kind: Service
apiVersion: v1
metadata:
  name: zookeeper-service-1
  namespace: zookeeper
spec:
  selector:
    app: zookeeper
    server-id: "1"
  clusterIP: None
  #type: NodePort
  type: ClusterIP
  ports:
  - name: client
    port: 2181
    #nodePort: 32181
  - name: leader
    port: 2888
  - name: election
    port: 3888

---

kind: Service
apiVersion: v1
metadata:
  name: zookeeper-service-2
  namespace: zookeeper
spec:
  selector:
    app: zookeeper
    server-id: "2"
  clusterIP: None
  #type: NodePort
  type: ClusterIP
  ports:
  - name: client
    port: 2181
    #nodePort: 32182
  - name: leader
    port: 2888
  - name: election
    port: 3888 

---

kind: Service
apiVersion: v1
metadata:
  name: zookeeper-service-3
  namespace: zookeeper
spec:
  selector:
    app: zookeeper
    server-id: "3"
  clusterIP: None
  #type: NodePort
  type: ClusterIP
  ports:
  - name: client
    port: 2181
    #nodePort: 32183
  - name: leader
    port: 2888
  - name: election
    port: 3888
```

- **加载**

```bash
# kubectl apply -f /data/yaml/zookeeper/zookeeper-service.yaml
service/zookeeper-service-1 created
service/zookeeper-service-2 created
service/zookeeper-service-3 created



# kubectl get service -n zookeeper 
NAME                  TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)                                        AGE
zookeeper-service-1   NodePort   192.168.9.168    <none>        2181:32181/TCP,2888:31125/TCP,3888:32623/TCP   6s
zookeeper-service-2   NodePort   192.168.15.251   <none>        2181:32182/TCP,2888:32445/TCP,3888:32624/TCP   6s
zookeeper-service-3   NodePort   192.168.15.42    <none>        2181:32183/TCP,2888:30929/TCP,3888:30416/TCP   6s
```



## zookeeper-pv.yaml

```yaml
# cat /data/yaml/zookeeper/pv/zookeeper-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: zookeeper-pv
  labels:
    type: zookeeper-pv
  namespace: zookeeper
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: "/nfs_data/nginx"
    server: 10.0.0.103
```



## zookeeper-pvc.yaml

```yaml
# cat /data/yaml/zookeeper/pv/zookeeper-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: zookeeper-pvc
  namespace: zookeeper # 存放在哪个 namespace，不指定则默认为 default
spec:
  volumeName: zookeeper-pv # 引用PV的名字，常用，也可以使用标签选择器来指定PV
  #selector: 
  #  matchLabels:
  #    type: zookeeper-pv # 使用标签选择器来指定PV
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
```



## zookeeper-deployment.yaml

```yaml
# cat /data/yaml/zookeeper/zookeeper-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zookeeper-1-deployment
  namespace: zookeeper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: zookeeper
  template:
    metadata:
      labels:
        app: zookeeper
        server-id: "1"
    spec:
      restartPolicy: Always
      containers:
      - name: zookeeper
        image: zookeeper-3.8.0-jdk-8u333:1.0
        imagePullPolicy: IfNotPresent
        env:
         - name: ZOO_TICK_TIME
           value: "2000"
         - name: CLUSTER_NUM
           value: "3"
         - name: MY_ID
           value: "1"
        ports:
          - containerPort: 2181
          - containerPort: 2888
          - containerPort: 3888
#        resources:
#          requests:   
#            cpu: 20m
#            memory: 32Mi   
#          limits:   
#            cpu: 100m   
#            memory: 64Mi
#        volumeMounts:
#        - mountPath: "/usr/share/nginx/html"
#          name: project-1-pvc # 调用卷名称
#      volumes:
#      - name: project-1-pvc # 定义卷名称
#        persistentVolumeClaim:
#          claimName: project-1-pvc # 指定pvc的name

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: zookeeper-2-deployment
  namespace: zookeeper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: zookeeper
  template:
    metadata:
      labels:
        app: zookeeper
        server-id: "2"
    spec:
      restartPolicy: Always
      containers:
      - name: zookeeper
        image: zookeeper-3.8.0-jdk-8u333:1.0
        imagePullPolicy: IfNotPresent
        env:
         - name: ZOO_TICK_TIME
           value: "2000"
         - name: CLUSTER_NUM
           value: "3"
         - name: MY_ID
           value: "2"
        ports:
          - containerPort: 2181
          - containerPort: 2888
          - containerPort: 3888

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: zookeeper-3-deployment
  namespace: zookeeper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: zookeeper
  template:
    metadata:
      labels:
        app: zookeeper
        server-id: "3"
    spec:
      restartPolicy: Always
      containers:
      - name: zookeeper
        image: zookeeper-3.8.0-jdk-8u333:1.0
        imagePullPolicy: IfNotPresent
        env:
         - name: ZOO_TICK_TIME
           value: "2000"
         - name: CLUSTER_NUM
           value: "3"
         - name: MY_ID
           value: "3"
        ports:
          - containerPort: 2181
          - containerPort: 2888
          - containerPort: 3888
```







## 测试

- **目前还需手动执行 `/zookeeper/apache-zookeeper-3.8.0-bin/bin/zkServer.sh start`**

```bash
root@zookeeper-1-deployment-749db8476c-bbmlh:~# /zookeeper/apache-zookeeper-3.8.0-bin/bin/zkServer.sh status
ZooKeeper JMX enabled by default
Using config: /zookeeper/apache-zookeeper-3.8.0-bin/bin/../conf/zoo.cfg
Client port found: 2181. Client address: localhost. Client SSL: false.
Mode: follower



root@zookeeper-2-deployment-55bb4f459c-8rtqk:~# /zookeeper/apache-zookeeper-3.8.0-bin/bin/zkServer.sh status
ZooKeeper JMX enabled by default
Using config: /zookeeper/apache-zookeeper-3.8.0-bin/bin/../conf/zoo.cfg
Client port found: 2181. Client address: localhost. Client SSL: false.
Mode: leader



root@zookeeper-3-deployment-847d65c495-t5jxn:~# /zookeeper/apache-zookeeper-3.8.0-bin/bin/zkServer.sh status
ZooKeeper JMX enabled by default
Using config: /zookeeper/apache-zookeeper-3.8.0-bin/bin/../conf/zoo.cfg
Client port found: 2181. Client address: localhost. Client SSL: false.
Mode: follower
```

