---
title: "PersistentVolume"
weight: 10
---


# PV 概述

[持久卷 | Kubernetes](https://kubernetes.io/zh-cn/docs/concepts/storage/persistent-volumes/)

- Persistent Volume 持久卷，简称 PV，**集群级别资源**
- PV 是集群中的一块存储，通常由管理员事先供应，或者使用[存储类（Storage Class）](https://kubernetes.io/zh-cn/docs/concepts/storage/storage-classes/)来动态供应
  - 供应时，可以实现对存储的容量划分、读写访问权限控制等功能

- PV 通常将 NFS、Ceph 等实际远程存储作为存储数据源
- PV 可被 PVC 绑定



# PV Explain

- 主要是定义PV的容量、访问模式和回收策略等属性。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-tmp
  labels:
    type: pv-tmp
  namespace: default # pv属于集群级别资源，虽然可以定义名称空间，但意义不大
spec:
  capacity: # 指定PV的容量
    storage: 100Gi # 向存储设备申请100G的空间
  accessModes: # 定义访问模式，可以定义多种，但PVC挂载时只能选择一种
    - ReadWriteOnce # 单路读写
  persistentVolumeReclaimPolicy: Retain # 定义持久卷回收策略
  nfs: # 定义具体的存储设备
    path: "/nfs_data/jenkins/jenkins-data"
    server: 10.0.0.103
```



## accessModes

https://kubernetes.io/zh-cn/docs/concepts/storage/persistent-volumes/#access-modes

- 访问模式可以在 PV 中定义，也可以在 PVC 中定义，但**通常在 PVC 中定义**
- 某个特定的存储系统可能会支持其中的部分或全部的访问模式。
- 在命令行接口（CLI）中，访问模式可以使用缩写形式，例如 ReadWriteOnce 可以缩写为RWO
- `PersistentVolume.spec.accessModes`

**ReadWriteOnce**

- RWO，单路读写，卷可以被一个节点以读写方式挂载。 也允许运行在同一节点上的多个 Pod 访问卷。

**ReadWriteMany**

- RWX ，多路读写，卷可以被多个节点以读写方式挂载。

**ReadOnlyMany**

- ROX，多路只读，卷可以被多个节点以只读方式挂载。

**ReadWriteOncePod**

- RWOP，卷可以被单个 Pod 以读写方式挂载。
- 如果你想确保整个集群中只有一个 Pod 可以读取或写入该 PVC， 请使用ReadWriteOncePod 访问模式。这只支持 CSI 卷以及需要 Kubernetes 1.22 以上版本。



## persistentVolumeReclaimPolicy

https://kubernetes.io/zh-cn/docs/concepts/storage/persistent-volumes/#reclaim-policy

- PV 空间被释放时的处理机制
- `PersistentVolume.spec.persistentVolumeReclaimPolicy`

**Retain**

- 默认值，删除 PV 后保持原装，最后需要管理员手动删除，**常用！**

**Delete**

- 自动删除存储卷，**危险！**
- 诸如 AWS EBS、GCE PD、Azure Disk 或 OpenStack Cinder 卷这类关联存储资产也被删除
- 远程实际存储上的数据是否一并被删除通常取决于远程实际存储的类型，例如 NFS 使用 Delete 就不会被一并删除
- Delete：立即删除PV，任何数据都不会被保留。该策略通常用于在数据不再需要时立即删除PV及其中的数据。

**Recycle**

- 空间回收，即删除存储卷上的所有数据(包括目录和隐藏文件) (`rm -rf /thevolume/*`)，**危险！**
- 目前仅 NFS 和 HostPath 支持 Recycle
- Recycle：回收PV，但要求其中的数据不能被保留。该策略通常用于清除PV中的数据，以便在之后将其重新分配给其他Pod。





## volumeMode

- 该PV的卷模型，用于指定此存储卷被格式化为文件系统使用还是直接使用裸格式的块设备；默认值为Filesystem，仅块设备接口的存储系统支持该功能。
- `PersistentVolume.spec.volumeMode`



## storageClassName

- 当前PV所属的StorageClass资源的名称，指定的存储类需要事先存在；默认为空值，即不属于任何存储类。
- `PersistentVolume.spec.storageClassName`



## mountOptions

- 挂载选项组成的列表，例如ro、soft和hard等。
- **说明：** 并非所有持久卷类型都支持挂载选项，Kubernetes 不对挂载选项执行合法性检查。如果挂载选项是非法的，挂载就会失败。
- `PersistentVolume.spec.mountOptions`



## nodeAffinity

- 节点亲和性，用于限制能够访问该PV的节点，进而会影响到使用与该PV关联的PVC的Pod的调度结果。
- `PersistentVolume.spec.nodeAffinity`



# PV Example

## pv-nfs

### 准备nfs

```sh
# nfs 节点同样创建相同的用户
# useradd -u 1688 -s /bin/bash -m redis
# id 1688
uid=1688(redis) gid=1688(redis) groups=1688(redis)


# 创建一个共享的目录
#  mkdir -p /data/nfs/redis00{1..3}


# 修改权限
# chown redis.redis /data/nfs/redis00{1..3}
# ls -l /data/nfs/
total 0
drwxr-xr-x 2 redis redis 6 Dec 28 09:03 redis001
drwxr-xr-x 2 redis redis 6 Dec 28 09:03 redis002
drwxr-xr-x 2 redis redis 6 Dec 28 09:03 redis003


# 配置共享，*后面不填内容表示以只读方式共享，读写需要在*后面添加(rw)
# vim /etc/exports
/data/nfs/redis001 10.0.0.0/24(rw)
/data/nfs/redis002 10.0.0.0/24(rw)
/data/nfs/redis003 10.0.0.0/24(rw)


# 让配置生效
# exportfs -r


# 查看配置，即本机被共享出来的路径
# exportfs -v
/data/nfs/redis001
		10.0.0.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
/data/nfs/redis002
		10.0.0.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
/data/nfs/redis003
		10.0.0.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)

```

### pv-yaml

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs-001
  labels:
    usedof: "redisdata"
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  mountOptions:
    - hard
    - nfsvers=4.1
  nfs:
    path:  "/data/nfs/redis001"
    server: 10.0.0.8
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs-002
  labels:
    usedof: "redisdata"
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  mountOptions:
    - hard
    - nfsvers=4.1
  nfs:
    path:  "/data/nfs/redis002"
    server: 10.0.0.8
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs-003
  labels:
    usedof: "redisdata"
spec:
  capacity:
    storage: 10Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  mountOptions:
    - hard
    - nfsvers=4.1
  nfs:
    path:  "/data/nfs/redis003"
    server: 10.0.0.8
```

### 验证

- **因为 pv 是集群级别资源，所以在任何名称空间内都可以看到所有存在的 pv**
  - CLAIM  被谁绑定了

```sh
# kubectl get pv -n kube-system 
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv-nfs-001   5Gi        RWO            Retain           Available                                   30s
pv-nfs-002   5Gi        RWX            Retain           Available                                   30s
pv-nfs-003   10Gi       RWX            Retain           Available                                   30s
       
# kubectl get pv -n testns 
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv-nfs-001   5Gi        RWO            Retain           Available                                   42s
pv-nfs-002   5Gi        RWX            Retain           Available                                   42s
pv-nfs-003   10Gi       RWX            Retain           Available                                   42s

```



## pv-rbd

### yaml

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-rbd-demo
  labels:
    usedof: redisdata
spec:
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteOnce
  rbd:
    monitors:
    - ceph01.ilinux.io
    - ceph02.ilinux.io
    - ceph03.ilinux.io
    pool: kube
    image: pv-test
    user: kube
    keyring: /etc/ceph/ceph.client.kube.keyring
    fsType: xfs
    readOnly: false
  persistentVolumeReclaimPolicy: Retain
```





# ---

# kubectl get pv

在使用 `kubectl get pv` 命令时，每列的输出包含以下信息：

1. **NAME（名称）**：持久卷（Persistent Volume）的名称，用于在集群中唯一标识该持久卷。
2. **CAPACITY（容量）**：持久卷的存储容量大小。通常以字节（如GiB、MiB）表示。
3. **ACCESS MODES（访问模式）**：指定持久卷可以支持的访问模式，它决定了哪些类型的卷可以绑定到该持久卷。访问模式包括：
   - **ReadWriteOnce（RWO）**：可以由单个节点以读写模式挂载和使用。
   - **ReadOnlyMany（ROX）**：可以由多个节点以只读模式挂载和使用。
   - **ReadWriteMany（RWX）**：可以由多个节点以读写模式挂载和使用。
4. **RECLAIM POLICY（回收策略）**：PVC 删除后的回收策略：
   
   - **Retain**：PVC 删除后，PV 保留，手动进行后续操作。
   
   - **Delete**：PVC 删除后，PV 同时也删除。
   
     - ```sh
       # 删除前
       root@k8s-master1:~# kubectl get pvc -n monitoring | grep loki
       data-loki-backend-0      Bound    pvc-9b7dfbf3-483e-473b-a04c-e3f39afeb869   10Gi       RWO            nfs-client     16h
       data-loki-backend-1      Bound    pvc-2d68b148-7c72-4341-ae81-b8f6375a9fed   10Gi       RWO            nfs-client     16h
       data-loki-backend-2      Bound    pvc-f4aaecce-82e4-4724-93d7-9c3590780693   10Gi       RWO            nfs-client     16h
       data-loki-write-0        Bound    pvc-38179f9d-2ab0-4677-ae8d-96272493beca   10Gi       RWO            nfs-client     16h
       data-loki-write-1        Bound    pvc-2d68c2e4-5d22-484b-8397-321a1bfbcd81   10Gi       RWO            nfs-client     16h
       data-loki-write-2        Bound    pvc-421f012c-449b-4b2b-8504-eb9707045a55   10Gi       RWO            nfs-client     16h
       root@k8s-master1:~# kubectl get pv | grep loki
       pvc-2d68b148-7c72-4341-ae81-b8f6375a9fed   10Gi       RWO            Delete           Bound    monitoring/data-loki-backend-1                                    nfs-client              16h
       pvc-2d68c2e4-5d22-484b-8397-321a1bfbcd81   10Gi       RWO            Delete           Bound    monitoring/data-loki-write-1                                      nfs-client              16h
       pvc-38179f9d-2ab0-4677-ae8d-96272493beca   10Gi       RWO            Delete           Bound    monitoring/data-loki-write-0                                      nfs-client              16h
       pvc-421f012c-449b-4b2b-8504-eb9707045a55   10Gi       RWO            Delete           Bound    monitoring/data-loki-write-2                                      nfs-client              16h
       pvc-9b7dfbf3-483e-473b-a04c-e3f39afeb869   10Gi       RWO            Delete           Bound    monitoring/data-loki-backend-0                                    nfs-client              16h
       pvc-f4aaecce-82e4-4724-93d7-9c3590780693   10Gi       RWO            Delete           Bound    monitoring/data-loki-backend-2                                    nfs-client              16h
       
       
       
       # 删除后
       kubectl delete pvc -n monitoring -l app.kubernetes.io/name=loki
       ...
       kubectl get pv | grep loki # 对应pv随之删除
       ```
   
       
5. **STATUS（状态）**：持久卷的当前状态，常见的状态包括：
   - **Available**：可用的持久卷，尚未绑定到任何声明。
   - **Bound**：持久卷已绑定到某个声明，并可以供使用。
   - **Released**：持久卷已解绑，但尚未被回收。
   - **Failed**：持久卷的绑定或回收过程中出现了错误。
6. **CLAIM（声明）**：绑定到持久卷的声明（Persistent Volume Claim）的名称。如果持久卷未被绑定，则该列显示为`<none>`。
7. **STORAGECLASS（存储类）**：指定创建该持久卷时使用的存储类的名称。存储类定义了动态供应持久卷的方式。
8. **REASON（原因）**：如果持久卷的状态是`Failed`，则此列将显示失败的原因。

需要注意的是，具体输出的列可能因 Kubernetes 版本和集群配置而有所不同。您可以通过在命令行中使用 `kubectl explain pv` 命令来获取更详细的信息，其中会列出当前集群上支持的每个字段以及它们的含义。







# PV STATUS

- **Available** 可以被PVC所绑定；
- **Bound** 已与PVC建立绑定关系；
- **Released** 已与PVC解除绑定关系，但对应存储空间并未释放，只能被原有PVC再次绑定（例如：CLAIM `default/pvc-demo-001`）

