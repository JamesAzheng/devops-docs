# 背景

早期集群的存储类为 [OpenEBS](https://openebs.io/)，该存储应用，直接将需要持久化存储的数据存放于 worker 节点，进而导致 woerker 节点磁盘剩余空间严重不足。

<img src="images\1.png" alt="1"  />





# 技术选型

**Kubernetes 的持久化存储方案有多种选择：**

![2](images\2.png)

- Rook：https://rook.io/
- Longhorn：https://longhorn.io/
- OpenEBS：https://openebs.io/
- ...

**在Kubernetes中，目前主流的外部存储解决方案有以下几种，按照采用排行榜排序：**

1. NFS（Network File System）：NFS是Kubernetes中最常见和成熟的外部存储解决方案之一。NFS是一种基于网络的分布式文件系统协议，可以将远程文件系统挂载到Kubernetes集群中的Pod中。它是最常见和成熟的外部存储解决方案之一。
2. Ceph：Ceph是一个开源的分布式存储系统，提供了块存储、文件系统和对象存储等接口。Ceph在Kubernetes中可以通过Rook项目来集成和管理，提供可靠的分布式存储解决方案。
3. GlusterFS：GlusterFS是一个开源的分布式文件系统，具有可扩展性和容错性。它可以将多个存储节点组合成一个统一的命名空间，并将文件划分为小的存储单元进行存储和复制。
4. CSI（Container Storage Interface）：CSI是Kubernetes定义的一种标准化的存储接口，允许外部存储提供商通过插件将其存储系统集成到Kubernetes中。CSI提供了更好的可扩展性和灵活性，使得集成新的存储解决方案更加简单。
5. Rook：Rook是一个开源项目，旨在为Kubernetes提供多种存储解决方案，包括Ceph、NFS、GlusterFS等。它提供了用于部署、管理和扩展这些存储解决方案的自定义资源定义（CRD）和操作符。



**最终选择 NFS 为解决方案，原因如下：**

NFS（Network File System）是一种用于在网络上共享文件系统的协议。在Kubernetes中，使用NFS作为外部存储解决方案有几个好处：

1. **成熟稳定**：NFS是一个成熟且经过广泛使用的网络文件系统协议。它在许多操作系统和存储设备上都得到支持，并且具有广泛的社区支持。因此，使用NFS作为Kubernetes的外部存储解决方案可以获得较高的稳定性和可靠性。
2. **共享访问**：NFS允许多个Pod同时访问同一个共享存储卷，这对于一些需要共享数据的应用程序非常重要。例如，如果你运行一个分布式数据库或共享文件系统，NFS可以提供并发访问和数据共享的功能。
3. **易于管理**：NFS提供了简单的文件系统管理功能，你可以轻松地创建、删除和管理文件和目录。这使得在Kubernetes中使用NFS作为外部存储解决方案变得更加方便。你可以使用标准的文件系统操作来管理NFS存储，而无需学习和使用特定于存储解决方案的API或工具。





# 步骤一：构建外部存储

## 准备 NFS

- 部署 NFS 服务，并确保可以被 K8s 集群所访问

```sh
# 准备 NFS
root@k8s-data:~# vim /etc/exports
/k8s-data 172.16.0.0/18(rw,no_root_squash)

root@k8s-data:~# exportfs -r
...

root@k8s-data:~# exportfs -v
/k8s-data     	172.16.0.0/18(rw,wdelay,no_root_squash,no_subtree_check,sec=sys,rw,secure,no_root_squash,no_all_squash)


# 验证远程nfs可用性
root@k8s-worker6:~# showmount -e 172.16.0.138
Export list for 172.16.0.138:
/k8s-data 172.16.0.0/18
```



## NFS - Provisioner

要在Kubernetes中使用NFS作为外部存储解决方案，需要使用nfs-subdir-external-provisioner。

nfs-subdir-external-provisioner是一个Kubernetes外部存储供应商，它允许在Kubernetes集群中自动创建NFS PV（Persistent Volume）和PVC（Persistent Volume Claim）。它通过在NFS服务器上创建子目录并将其用作PV来实现存储的动态供应和回收。

使用nfs-subdir-external-provisioner，您可以通过创建一个存储类（StorageClass）来定义NFS存储的配置和参数，然后在PVC中引用该存储类。当创建PVC时，nfs-subdir-external-provisioner将自动在NFS服务器上创建一个子目录，并将其用作PV供PVC使用。

- 自动创建的 PV 以 `${namespace}-${pvcName}-${pvName}` 这样的命名格式创建在 NFS 服务器上的共享数据目录中
- 而当这个 PV 被回收后会以 `archieved-${namespace}-${pvcName}-${pvName}` 这样的命名格式存在 NFS 服务器上。

项目地址：https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner



### 通过 helm 部署

https://artifacthub.io/packages/helm/nfs-subdir-external-provisioner/nfs-subdir-external-provisioner

- 添加仓库

```sh
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
```

- 验证仓库

```sh
# helm repo list
NAME                           	URL                                                       ...                          
nfs-subdir-external-provisioner	https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
```

- 更新仓库

```
helm repo update
```

- 创建 namespace

```
kubectl create ns nfs-subdir-external-provisioner
```

- 列出可用的版本

```sh
# helm search repo nfs-subdir-external-provisioner/nfs-subdir-external-provisioner
NAME                                              	CHART VERSION	APP VERSION	DESCRIPTION                                       
nfs-subdir-external-provisioner/nfs-subdir-exte...	4.0.18       	4.0.2      	nfs-subdir-external-provisioner is an automatic...
```

- 安装
- 镜像来自`registry.k8s.io/sig-storage/nfs-subdir-external-provisioner`，无法直接下载，这里采用阿里云构建墙外镜像。

```sh
helm install nfs-subdir-external-provisioner \
nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
--set nfs.server=172.16.0.138 \
--set nfs.path=/k8s-data \
--set image.repository=registry.cn-hangzhou.aliyuncs.com/jamesazheng/nfs-subdir-external-provisioner \
-n nfs-subdir-external-provisioner \
--version 4.0.18


# 响应信息
NAME: nfs-subdir-external-provisioner
LAST DEPLOYED: Wed Jul  5 16:16:06 2023
NAMESPACE: nfs-subdir-external-provisioner
STATUS: deployed
REVISION: 1
TEST SUITE: None
```



### 验证

```yaml
root@k8s-master1:~# kubectl get pod -n nfs-subdir-external-provisioner 
NAME                                               READY   STATUS    RESTARTS   AGE
nfs-subdir-external-provisioner-6fd7c4c95f-jqz5b   1/1     Running   0          13s


root@k8s-master1:~# kubectl describe sc nfs-client 
Name:                  nfs-client
IsDefaultClass:        No
Annotations:           meta.helm.sh/release-name=nfs-subdir-external-provisioner,meta.helm.sh/release-namespace=nfs-subdir-external-provisioner
Provisioner:           cluster.local/nfs-subdir-external-provisioner
Parameters:            archiveOnDelete=true
AllowVolumeExpansion:  True
MountOptions:          <none>
ReclaimPolicy:         Delete
VolumeBindingMode:     Immediate
Events:                <none>
```





## 测试

- 使用 redis 镜像验证能否实现持久化存储

### redis-pvc

- 基于 sc 创建 pvc

```yaml
# vim redis-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: test
spec:
  accessModes: ["ReadWriteOnce"]
  volumeMode: Filesystem
  resources:
    requests:
      storage: 1Gi
    limits:
      storage: 3Gi
  storageClassName: nfs-client
```

- 验证

```sh
root@k8s-master1:~# kubectl describe pvc redis-pvc -n test
Name:          redis-pvc
Namespace:     test
StorageClass:  nfs-client
Status:        Bound
Volume:        pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: cluster.local/nfs-subdir-external-provisioner
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      1Gi
Access Modes:  RWO
VolumeMode:    Filesystem
Used By:       <none>
Events:
  Type    Reason                 Age    From                                                                                                                                 Message
  ----    ------                 ----   ----                                                                                                                                 -------
  Normal  Provisioning           4m37s  cluster.local/nfs-subdir-external-provisioner_nfs-subdir-external-provisioner-6fd7c4c95f-jqz5b_511e84ed-6439-467a-a417-377183fc2748  External provisioner is provisioning volume for claim "test/redis-pvc"
  Normal  ExternalProvisioning   4m37s  persistentvolume-controller                                                                                                          waiting for a volume to be created, either by external provisioner "cluster.local/nfs-subdir-external-provisioner" or manually created by system administrator
  Normal  ProvisioningSucceeded  4m37s  cluster.local/nfs-subdir-external-provisioner_nfs-subdir-external-provisioner-6fd7c4c95f-jqz5b_511e84ed-6439-467a-a417-377183fc2748  Successfully provisioned volume pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e


# nfs服务端数据保存格式
root@k8s-data:~# ls /k8s-data/ -l
total 4
drwxrwxrwx 2 root root 4096 Jul  5 16:31 test-redis-pvc-pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e

```

### redis

- 创建 redis pod 时调用 pvc

```yaml
# vim redis.yaml
apiVersion: v1
kind: Pod
metadata:
  name: redis
  namespace: test
spec:
  containers:
  - name: redis
    image: redis:alpine
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - mountPath: /data
      name: redis-data
  volumes:
  - name: redis-data
    persistentVolumeClaim:
      claimName: redis-pvc
```



### 测试数据持久化

- 客户端写入数据

```sh
root@k8s-master1:~/test/redis# kubectl exec -it -n test redis -- sh

/data # redis-cli -h 127.0.0.1

127.0.0.1:6379> set key1 azheng
OK

127.0.0.1:6379> get key1
"azheng"

127.0.0.1:6379> bgsave
Background saving started

127.0.0.1:6379> exit

/data # ls /data/ -l
total 4
-rw-------    1 redis    redis          107 Jul  5 08:45 dump.rdb
```

- 服务端验证数据

```sh
root@k8s-data:~# ls -l /k8s-data/test-redis-pvc-pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e/
total 4
-rw------- 1 systemd-coredump k8s-data 107 Jul  5 16:45 dump.rdb
```

- 重建 Pod 并验证数据是否存在

```sh
# kubectl delete -f redis.yaml 
pod "redis" deleted


# kubectl apply -f redis.yaml 
pod/redis created


# kubectl exec -it -n test redis -- sh
/data # ls -l
total 4
-rw-------    1 redis    redis          107 Jul  5 08:48 dump.rdb

/data # redis-cli -h 127.0.0.1
127.0.0.1:6379> get key1
"azheng"
```





### 测试超出存储容量

- 分配较少空间的pvc，测试使用的空间是否可以超出存储空间限定值
- 结论：数据写入大小，不受pvc申领空间的限制，即可以写入超出申领存储空间的数据

```sh
# 目前的pvc只申领了1G的空间
# kubectl describe -n test pvc redis-pvc
Name:          redis-pvc
Namespace:     test
StorageClass:  nfs-client
Status:        Bound
Volume:        pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: cluster.local/nfs-subdir-external-provisioner
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      1Gi # 1G的空间
Access Modes:  RWO
VolumeMode:    Filesystem
Used By:       redis
Events:
...


# 在pod中写入超过1G的数据，没问题
# kubectl exec -it -n test redis -- sh
/data # dd if=/dev/zero of=/data/bigfile.txt bs=1M count=3072
3072+0 records in
3072+0 records out
/data # ls -lh /data/
total 3G     
-rw-r--r--    1 root     root        3.0G Jul  5 09:01 bigfile.txt
-rw-------    1 redis    redis        107 Jul  5 08:48 dump.rdb


# nfs服务端验证，没问题
root@k8s-data:~# ls /k8s-data/test-redis-pvc-pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e/ -lh
total 3.1G
-rw-r--r-- 1 root             root     3.0G Jul  5 17:01 bigfile.txt
-rw------- 1 systemd-coredump k8s-data  107 Jul  5 16:48 dump.rdb
```



### PVC 删除后的状态

- 注意：删除PVC时，要先删除与pvc关联的pod，否则pvc将一直处于Terminating状态

```sh
# 删除前
root@k8s-data:~# tree /k8s-data/
/k8s-data/
└── test-redis-pvc-pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e
    ├── bigfile.txt
    └── dump.rdb


# kubectl delete -f redis.yaml 
pod "redis" deleted


# kubectl delete -n test pvc redis-pvc 
persistentvolumeclaim "redis-pvc" deleted



# 删除后，原有目录被重命名为了archived-开头
root@k8s-data:~# tree /k8s-data/
/k8s-data/
└── archived-test-redis-pvc-pvc-19faa8a6-4748-4c21-9b96-9afafe9c767e
    ├── bigfile.txt
    └── dump.rdb
```









# 步骤二：迁移现有服务

## Harbor

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



### 拉取旧仓库的镜像

- 在新的 Harbor 仓库的 Web 管理端定义复制规则，将旧仓库的数据拉取到仓库



### 验证数据

```sh
root@k8s-data:~# cd /k8s-data/

root@k8s-data:/k8s-data# du -sh *
66M	harbor-database-data-harbor-database-0-pvc-97acb1c2-3488-4e20-8ccf-fb7c5fd734b5
352K	harbor-data-harbor-redis-0-pvc-7a111f99-0ed6-4c55-8395-01095848d861
12K	harbor-data-harbor-trivy-0-pvc-c5547cf5-e9b8-44ed-988a-e5c4b464ec87
4.0K	harbor-harbor-chartmuseum-pvc-f9690a7c-79f3-4128-8483-e280bc325cdb
560K	harbor-harbor-jobservice-pvc-7a7d444d-1932-4c53-9e91-1913ff805741
17G	harbor-harbor-registry-pvc-7b8df94c-3791-4796-ae83-30860e919518
```









## MinIO

https://artifacthub.io/packages/helm/bitnami/minio

- 创建 namespace

```sh
# kubectl create ns minio
namespace/minio created
```

- 添加仓库

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
```

- 验证仓库添加结果

```sh
# helm repo list
NAME       	URL                                 
bitnami    	https://charts.bitnami.com/bitnami  
...
```

- 查看可用版本

```sh
# helm search repo minio -l
NAME         	CHART VERSION	APP VERSION	DESCRIPTION                                       
bitnami/minio	12.6.5       	2023.6.19  	MinIO(R) is an object storage server, compatibl...
bitnami/minio	12.6.4       	2023.5.18  	MinIO(R) is an object storage server, compatibl...
bitnami/minio	12.6.3       	2023.5.18  	MinIO(R) is an object storage server, compatibl...
bitnami/minio	12.6.2       	2023.5.18  	MinIO(R) is an object storage server, compatibl...
bitnami/minio	12.6.1       	2023.5.18  	MinIO(R) is an object storage server, compatibl...
bitnami/minio	12.6.0       	2023.5.4   	MinIO(R) is an object storage server, compatibl...
...
```

- 安装

```sh
helm install -n minio minio bitnami/minio \
--version 12.6.5 \
--set global.storageClass=nfs-client \
--set auth.rootPassword=xxx
```



### 更新通过 nodePort 访问

- 创建 nodePort 类型的 service

```yaml
# 创建前
# kubectl get svc -n minio 
NAME    TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)             AGE
minio   ClusterIP   10.233.46.27   <none>        9000/TCP,9001/TCP   5m42s


# 导出yaml清单
# kubectl get svc -n minio minio -o yaml > minio-svc.yaml


# 修改后的yaml清单
# vim minio-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: minio
  namespace: minio
spec:
  ports:
  - name: minio-api
    port: 9000
    protocol: TCP
    targetPort: minio-api
    nodePort: 30006
  - name: minio-console
    port: 9001
    protocol: TCP
    targetPort: minio-console
    nodePort: 30007
  selector:
    app.kubernetes.io/instance: minio
    app.kubernetes.io/name: minio
  type: NodePort


# 应用
# kubectl apply -f minio-svc.yaml 
Warning: resource services/minio is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
service/minio configured


# 创建后
# kubectl get svc -n minio 
NAME    TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)                         AGE
minio   NodePort   10.233.46.27   <none>        9000:30006/TCP,9001:30007/TCP   6m28s
```

- 最后可以通过http://172.16.0.120:30007/login进行访问


### 验证数据

```sh
# du -sh /k8s-data/*
...
92K	/k8s-data/minio-minio-pvc-e20e578d-b445-4709-a040-727b4ab3261f
```

