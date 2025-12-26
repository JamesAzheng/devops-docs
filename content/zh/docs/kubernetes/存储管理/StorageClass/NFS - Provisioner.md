---
title: "NFS Provisioner"
weight: 10
---


# NFS Provisioner 概述

要在Kubernetes中使用NFS作为外部存储解决方案，需要使用nfs-subdir-external-provisioner。

nfs-subdir-external-provisioner是一个Kubernetes外部存储供应商，它允许在Kubernetes集群中自动创建NFS PV（Persistent Volume）和PVC（Persistent Volume Claim）。它通过在NFS服务器上创建子目录并将其用作PV来实现存储的动态供应和回收。

使用nfs-subdir-external-provisioner，您可以通过创建一个存储类（StorageClass）来定义NFS存储的配置和参数，然后在PVC中引用该存储类。当创建PVC时，nfs-subdir-external-provisioner将自动在NFS服务器上创建一个子目录，并将其用作PV供PVC使用。

- 自动创建的 PV 以 `${namespace}-${pvcName}-${pvName}` 这样的命名格式创建在 NFS 服务器上的共享数据目录中
- 而当这个 PV 被回收后会以 `archieved-${namespace}-${pvcName}-${pvName}` 这样的命名格式存在 NFS 服务器上。

项目地址：https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner



# NFS Provisioner 部署

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



## 通过 Helm 部署 NFS Provisioner

https://artifacthub.io/packages/helm/nfs-subdir-external-provisioner/nfs-subdir-external-provisioner

- 添加仓库

```sh
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
```

- 创建 namespace

```
kubectl create ns nfs-subdir-external-provisioner
```

- 安装（镜像来自`registry.k8s.io/sig-storage/nfs-subdir-external-provisioner`，无法直接下载，这里采用阿里云构建墙外镜像。）

```sh
helm install nfs-subdir-external-provisioner \
nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
--set nfs.server=172.16.0.138 \
--set nfs.path=/k8s-data \
--set image.repository=registry.cn-hangzhou.aliyuncs.com/jamesazheng/nfs-subdir-external-provisioner:v4.0.2 \
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



## 验证

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





# 测试

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





