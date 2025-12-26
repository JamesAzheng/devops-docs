# 前言

- **下面实现的是单独的 redis，但是如果在 k8s 中部署 redis 集群是否有意义呢？？？**
- **下面使用 PV/PVC 的方式将 RDB/AOF 的数据进行持久保存**





# NFS

- 安装过程省略

```bash
# 创建共享目录
# mkdir -p /nfs_data/redis

# 定义共享目录
# vim /etc/exports
...
/nfs_data/redis/ *(rw,no_root_squash)

# 重载配置文件
# exportfs -r

# 查看共享结果
# showmount -e 10.0.0.103
Export list for 10.0.0.103:
/nfs_data/redis *
...
```





# Dockerfile

## 相关文件

- redis源码下载链接：https://download.redis.io/releases/

```bash
# pwd
/data/dockerfile/redis


# ll
total 2440
drwxr-xr-x 2 root root    4096 Jul 17 09:42 ./
drwxr-xr-x 8 root root    4096 Jul 17 09:39 ../
-rw-r--r-- 1 root root       0 Jul 17 09:41 Dockerfile
-rw-r--r-- 1 root root       0 Jul 17 09:41 entrypoint.sh
-rw-r--r-- 1 root root 2487287 Jul 16 22:23 redis-6.2.7.tar.gz
-rw-r--r-- 1 root root       0 Jul 17 09:42 redis.conf
```

## Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-os/ubuntu-20.04-base:1.0

LABEL version="1.0" \
      maintainer="XiangZheng <767483070@qq.com>"

ENV PATH=/redis/bin/:${PATH}

ADD redis-6.2.7.tar.gz /redis/
COPY redis.conf /

RUN apt-get update && apt-get -y install \
    libsystemd-dev \
    make \
    gcc; \
    cd /redis/redis-6.2.7 && make USE_SYSTEMD=yes PREFIX=/redis install

RUN mkdir -p /redis/etc; \
    mkdir -p /redis/log; \
    mkdir -p /redis/data; \
    mkdir -p /redis/run; \
    mv /redis.conf /redis/etc/; \
    groupadd -r redis --gid=637; \
    useradd -r -g redis --uid=637 redis; \
    chown -R redis.redis /redis/; \
    rm -fr /redis/redis-6.2.7


WORKDIR /redis/ 

EXPOSE 6379

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
```

## redis.conf

```bash
bind 0.0.0.0
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300
#前台运行
daemonize no
pidfile /redis/run/redis.pid
loglevel notice
logfile "/redis/log/redis.log"
requirepass 123456
maxclients 10000
#8g内存的半数byte
maxmemory 4294967296
databases 16
always-show-logo no
set-proc-title yes
proc-title-template "{title} {listen-addr} {server-mode}"
stop-writes-on-bgsave-error yes
#rdb持久化策略
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
rdb-del-sync-files no
dir "/redis/data/"
save 5 1
save 30 10
save 60 100
#
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-diskless-load disabled
repl-disable-tcp-nodelay no
replica-priority 100
acllog-max-len 128
lazyfree-lazy-eviction no
lazyfree-lazy-expire no
lazyfree-lazy-server-del no
replica-lazy-flush no
lazyfree-lazy-user-del no
lazyfree-lazy-user-flush no
oom-score-adj no
oom-score-adj-values 0 200 800
disable-thp yes
appendonly no
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
aof-rewrite-incremental-fsync yes
rdb-save-incremental-fsync yes
jemalloc-bg-thread yes
```

## entrypoint.sh

```bash
#!/bin/bash
/redis/bin/redis-server /redis/etc/redis.conf
```

## 构建镜像

```bash
docker build -t redis-6.2.7-ubuntu-20.04:1.0 .
```

## 测试

```bash
docker run --rm -d --name redis -p 6379:6379 redis-6.2.7-ubuntu-20.04:1.0 ; docker exec -it redis bash

redis客户端访问6379

docker stop redis


docker images |grep redis ; docker ps -a |grep redis
```

## 上传到 harbor

```bash
# 打标签
docker tag redis-6.2.7-ubuntu-20.04:1.0 harbor.xiangzheng.vip/baseimages-app/redis-6.2.7-ubuntu-20.04:1.0

# 上传
docker push harbor.xiangzheng.vip/baseimages-app/redis-6.2.7-ubuntu-20.04:1.0
```





# yaml

## 说明

- **如果nfs端目录实现存有数据，那么新生成的 Pod 会直接采用 nfs 目录共享的内容 而不会生成初始化的文件，所以在初始化过程中要保证 nfs 共享的目录没有文件存在 尤其是不易发现的隐藏文件**

## 相关文件

```bash
# pwd
/data/yaml/jenkins

# ll
total 20
drwxr-xr-x 2 root root 4096 Jul 16 16:21 ./
drwxr-xr-x 7 root root 4096 Jul 16 16:11 ../
-rw-r--r-- 1 root root 1583 Jul 16 16:11 jenkins-deployment.yaml
-rw-r--r-- 1 root root  487 Jul 16 16:11 jenkins-pvc.yaml
-rw-r--r-- 1 root root  531 Jul 16 16:11 jenkins-pv.yaml
```



## 准备 namespace

```yaml
# vim /data/yaml/redis/redis-ns.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: redis
```

### 验证

```bash
# kubectl apply -f /data/yaml/redis/redis-ns.yaml
namespace/redis created


# kubectl get ns
NAME              STATUS   AGE
redis           Active   2s
...
```



## 准备 PV

```yaml
# vim /data/yaml/redis/redis-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: redis-data-pv
  labels:
    type: redis-data-pv
  namespace: redis
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: "/nfs_data/redis/"
    server: 10.0.0.103
```

### 验证

```bash
# kubectl apply -f redis-pv.yaml 
persistentvolume/redis-data-pv created



# STATUS 一定要是 Available
# kubectl get pv
NAME            CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
redis-data-pv   100Gi      RWO            Retain           Available                                   12s
```



## 准备 PVC

```yaml
# vim /data/yaml/redis/redis-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-data-pvc
  namespace: redis
spec:
  volumeName: redis-data-pv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 80Gi
```

### 验证

```bash
# kubectl apply -f /data/yaml/redis/redis-pvc.yaml 
persistentvolumeclaim/redis-data-pvc created



# STATUS 一定要是 Bound
# kubectl get pv
NAME            CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                  STORAGECLASS   REASON   AGE
redis-data-pv   100Gi      RWO            Retain           Bound    redis/redis-data-pvc                           111s



# STATUS 一定要是 Bound
# kubectl get pvc -n redis
NAME             STATUS   VOLUME          CAPACITY   ACCESS MODES   STORAGECLASS   AGE
redis-data-pvc   Bound    redis-data-pv   100Gi      RWO                           41s
```



## 准备 deployment

```yaml
# vim /data/yaml/redis/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-deployment
  namespace: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      restartPolicy: Always
      containers:
      - name: redis-server
        image: redis-6.2.7-ubuntu-20.04:1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 6379
          name: redis-server
          protocol: TCP
        resources:
          requests:   
            cpu: 512m
            memory: 512Mi   
          limits:   
            cpu: 1   
            memory: 1024Mi
        volumeMounts:
        - mountPath: "/redis/data/"
          name: redis-data
      volumes:
      - name: redis-data
        persistentVolumeClaim:
          claimName: redis-data-pvc 

---

kind: Service
apiVersion: v1
metadata:
  labels:
    app: redis-service
  name: redis-service
  namespace: redis
spec:
  type: NodePort
  ports:
  - name: redis-server
    port: 6379
    protocol: TCP
    targetPort: 6379
    nodePort: 30079
  selector:
    app: redis
```

### 验证

```bash
# kubectl apply -f /data/yaml/redis/redis-deployment.yaml
deployment.apps/redis-deployment created
service/redis-service created



# kubectl get pod -n redis
NAME                                READY   STATUS    RESTARTS   AGE
redis-deployment-6bfb85484f-tzrh7   1/1     Running   0          27s
```



## 测试

- **模拟 Pod 被删，然后查看是否能恢复数据**

```bash
root@client:~# apt install redis-tools

root@client:~# redis-cli -h 10.0.0.100 -p 30079  -a 123456
10.0.0.100:30079> set key1 value1
OK
10.0.0.100:30079> KEYS *
1) "key1"

root@nfs:~# ll /nfs_data/redis/
...
-rw-r--r-- 1 root root  110 Jul 17 12:07 dump.rdb

# kubectl delete -f /data/yaml/redis/redis-deployment.yaml
deployment.apps "redis-deployment" deleted
service "redis-service" deleted
# kubectl apply -f /data/yaml/redis/redis-deployment.yaml
deployment.apps/redis-deployment created
service/redis-service created

# 数据依旧能恢复
root@client:~# redis-cli -h 10.0.0.100 -p 30079  -a 123456
10.0.0.100:30079> set key1 value1
OK
10.0.0.100:30079> KEYS *
1) "key1
```



