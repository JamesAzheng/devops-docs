---
title: "StorageClass"
weight: 10
---

# StorageClass 概述

- StorageClass 存储类，简称 SC，**集群级别资源**

- **创建 PVC 的时候可以指定 StorageClass，然后 StorageClass 会根据 PVC 的需求来动态的创建 PV**

- StorageClass 可以存在多个，客户端可以根据不同的需求（读写速度等）动态的通过不同的 StorageClass 来创建 PV

  - ```sh
    # 管理员可以为没有申请绑定到特定 StorageClass 的 PVC 指定一个默认的存储类（根据自己实际名称标记即可）
    kubectl patch storageclass managed-nfs-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
    ```

- StorageClass 也相当于是 PV 与 PVC 间的名称空间，PV 和 PVC 绑定时 只能在同一个存储类中实现

  - 即一个 PVC 只能够在自己所处的 SC 内找 PV  **换而言之**  一个不属于任何 SC 的 PVC 只能够在不属于任何 SC 的 PV 中进行筛选



StorageClass 是 Kubernetes 中用于定义持久化存储的对象。它提供了一种抽象层，用于定义不同类型的存储，例如云存储、本地存储、网络存储等，并允许管理员和开发人员在 Kubernetes 集群中声明和使用这些存储类型。

下面是一些 StorageClass 的详解：

1. 定义和配置：StorageClass 是一个用于定义和配置存储的对象。通过创建 StorageClass，你可以指定存储提供商、存储类型、访问模式以及其他相关的参数。
2. 存储提供商：StorageClass 允许你选择不同的存储提供商，如云服务提供商（AWS、Azure、GCP）或本地存储提供商（NFS、Ceph、GlusterFS）。每个存储提供商可能有自己的配置和参数选项。
3. 存储类型：StorageClass 允许你定义存储的类型，例如块存储、文件存储或对象存储。这取决于你的存储提供商支持的类型。
4. 访问模式：StorageClass 定义了存储的访问模式，指定了哪些 Pod 可以访问存储。常见的访问模式包括读写一致性、只读和读写多次。
5. 动态卷配置：StorageClass 可以与 Kubernetes 的动态卷配置结合使用。动态卷配置允许在请求存储时自动创建和配置持久卷（Persistent Volume）。
6. 动态供应：StorageClass 还支持动态供应，这意味着当一个 Pod 请求存储时，如果没有可用的持久卷，它可以动态地创建一个新的持久卷。
7. Pod 绑定：当一个 Pod 请求使用某个 StorageClass 定义的存储时，Kubernetes 会自动创建一个持久卷，并将该持久卷绑定到该 Pod。

通过使用 StorageClass，你可以在 Kubernetes 中轻松管理持久化存储，并为不同类型的应用程序提供适当的存储解决方案。



## Dynamic Provision

- **在同一个 SC 上声明 PVC 时，若无现存可匹配的 PV，则 SC 能够调用存储服务的管理接口直接创建出一个符合PVC 声明的需求的 PV 来。这种 PV 的提供机制，就称为 动态资源供应 Dynamic Provision 。** 		
- 在动态资源供应模式下，通过 StorageClass 和 PVC 完成资源动态绑定（系统自动生成PV），并供 Pod 使用的存储管理机制。

<img src="/docs/kubernetes/存储管理/StorageClass.png" alt="StorageClass"  />



## 为什么需要StorageClass

在一个大规模的Kubernetes集群里，可能有成千上万个PVC，这就意味着运维人员必须事先创建出多个PV，此外，随着项目的需要，会有新的PVC不断被提交，那么运维人员就需要不断的添加新的，满足要求的PV，否则新的Pod就会因为PVC绑定不到PV而导致创建失败。而且通过 PVC 请求到一定的存储空间也很有可能不足以满足应用对于存储设备的各种需求。

而且不同的应用程序对于存储性能的要求可能也不尽相同，比如读写速度、并发性能等，为了解决这一问题，Kubernetes 又为我们引入了一个新的资源对象：StorageClass，通过 StorageClass 的定义，管理员可以将存储资源定义为某种类型的资源，比如快速存储、慢速存储等，用户根据 StorageClass 的描述就可以非常直观的知道各种存储资源的具体特性了，这样就可以根据应用的特性去申请合适的存储资源了。







# StorageClass Explain

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: <string> # 命名很重要，用户使用这个命名来请求生成一个特定的类。当创建 StorageClass 对象时，管理员设置 StorageClass 对象的命名和其他参数，一旦创建了对象就不能再对其更新

provisioner: <string> 

reclaimPolicy: <string> # 由当前存储类动态创建的PV资源的默认回收策略，可用值为Delete（默认）和Retain两个；但那些静态PV的回收策略则取决于它们自身的定义；通常设为Retain 后期不需要时在手动删除

volumeBindingMode: <string> # 定义如何为PVC完成预配和绑定，默认值为VolumeBindingImmediate ；该字段仅在启用了存储卷调度功能时才能生效。还可以定义为 WaitForFirstConsumer 表示。。。

parameters: <map[string]string> # 定义连接至指定的Provisioner类别下的某特定存储时需要使用的各相关参数；不同Provisioner的可用的参数各不相同；

allowVolumeExpansion: <boolean> # 是否支持存储卷空间扩展功能；是否支持取决于底层存储

allowedTopologies: <[]Object> # 定义可以动态配置存储卷的节点拓扑，仅启用了卷调度功能的服务器才会用到该字段；每个卷插件都有自己支持的拓扑规范，空的拓扑选择器表示无拓扑限制；

mountOptions: <[]string> # 由当前存储类动态创建的PV资源的默认挂载选项列表。
```



## provisioner

必选字段，用于指定存储服务方（provisioner，或称为存储制备器），存储类要依赖该字段值来判定要使用的存储插件以便适配到目标存储系统；Kubernetes内建支持许多的Provisioner，它们的名字都以kubernetes.io/为前缀，例如kubernetes.io/glusterfs等；

要使用 StorageClass，我们就得安装对应的自动配置程序，比如我们这里存储后端使用的是 nfs，那么我们就需要使用到一个 nfs-client 的**自动配置程序，我们也叫它 Provisioner（制备器）**，这个程序使用我们已经配置好的 nfs 服务器，来自动创建持久卷，也就是自动帮我们创建 PV。

每个 StorageClass 都有一个制备器（Provisioner），用来决定使用哪个卷插件制备 PV。 该字段必须指定。

**内置制备器：**

- 其名称前缀为 "kubernetes.io" 并打包在 Kubernetes 中

- https://kubernetes.io/zh-cn/docs/concepts/storage/storage-classes/#provisioner

**外部制备器：**

- 还可以运行和指定外部制备器，这些独立的程序遵循由 Kubernetes 定义的[规范](https://git.k8s.io/design-proposals-archive/storage/volume-provisioning.md)。 外部供应商的作者完全可以自由决定他们的代码保存于何处、打包方式、运行方式、使用的插件（包括 Flex）等。
- 例如，NFS 没有内部制备器，但可以使用外部制备器。 也有第三方存储供应商提供自己的外部制备器。



在 Kubernetes 的 StorageClass 中，provisioner 是一个重要的属性，用于指定用于创建持久卷（Persistent Volume，简称 PV）的存储提供者。

下面是 provisioner 的详解：

1. 定义和作用：provisioner 是 StorageClass 的一个属性，用于定义负责创建和配置持久卷的组件或存储提供者。它负责与底层存储系统交互，并根据请求创建和管理持久卷。
2. 存储提供者：provisioner 属性指定了使用哪个存储提供者来创建持久卷。存储提供者可以是云服务提供商（如 AWS、Azure、GCP）或本地存储提供商（如 NFS、Ceph、GlusterFS）。
3. 动态供应：provisioner 的一个重要用途是支持动态供应。当一个 Pod 请求使用某个 StorageClass 的存储时，如果没有现成的可用持久卷，provisioner 可以根据请求自动创建一个新的持久卷。这种动态供应的方式简化了存储的管理，使管理员无需手动创建和维护持久卷。
4. 存储类别和特性：provisioner 通常与特定的存储类别和特性相关联。存储类别指定了存储的类型，如块存储、文件存储或对象存储。存储特性指定了存储的性能、可靠性、容量等特点。provisioner 需要根据存储类别和特性来选择合适的存储提供者和配置参数。
5. 配置和参数：provisioner 可能需要一些配置和参数来与底层存储系统进行交互。这些配置和参数可以在 StorageClass 的 provisioner 属性中进行设置。例如，AWS EBS 存储提供者可能需要 AWS 访问密钥和区域信息作为配置参数。

通过使用 provisioner 属性，StorageClass 可以与不同的存储提供者和存储系统集成，实现自动化的持久卷创建和管理。这使得在 Kubernetes 集群中使用持久化存储更加简单和灵活。



**如何查看当前 Kubernetes 集群中可用的 provisioner**

要查看当前 Kubernetes 集群中可用的 provisioner，你可以运行以下命令：

```
kubectl get storageclasses
```

该命令将返回当前集群中定义的所有 StorageClass 列表，其中包括每个 StorageClass 的名称、provisioner 和其他相关信息。

在命令输出中，你可以查看 provisioner 列以确定可用的 provisioner。provisioner 列将显示与每个 StorageClass 关联的存储提供者。这些提供者的名称通常是标识性的，例如 `kubernetes.io/aws-ebs` 表示 AWS 的 EBS 存储提供者，`kubernetes.io/gce-pd` 表示 Google Cloud 的 Persistent Disk 存储提供者，以此类推。

通过检查 provisioner 列，你可以确定当前集群中支持的不同存储提供者和相应的 provisioner。

# ---

# StorageClass - OpenEBS

## OpenEBS 概述

https://openebs.io/

OpenEBS（Open Elastic Block Store）是一个开源的容器本地持久化存储项目，旨在为容器化应用程序提供可靠的块级存储。它是以 Kubernetes 为中心的生态系统中的一部分，并提供了一种简单而强大的方法来管理和运行在容器中的应用程序所需的持久化存储。

OpenEBS 的设计目标是提供一种易于使用、高性能和可扩展的持久化存储解决方案。它采用了容器本地存储的概念，即将底层物理存储设备（如本地磁盘）直接暴露给容器。这种方法具有低延迟和高吞吐量的优势，并提供了与本地磁盘相似的性能。

OpenEBS 支持多种存储引擎，如标准块设备（raw block devices）、ZFS、Ceph 等。每个存储引擎都有不同的优势和适用场景。用户可以根据自己的需求选择适合的存储引擎。

OpenEBS 还提供了一种名为"Container Attached Storage"（CAS）的概念，它允许将存储直接附加到容器中，从而实现与应用程序的深度集成。CAS 可以在容器级别对存储进行管理，例如动态分配和回收存储卷，而无需干预底层存储设备。

OpenEBS 还具有一些其他的特性，如快照、克隆、数据复制、数据恢复等。这些功能使用户能够更好地管理和保护他们的数据。

总结来说，OpenEBS 是一个用于 Kubernetes 的开源块级存储项目，它提供了容器本地持久化存储的解决方案，并具有易于使用、高性能和可扩展等特点。它为用户提供了灵活的存储引擎选择，并支持一系列高级功能来管理和保护数据。

- **OpenEBS 部署完成后生成的默认 StorageClass**

```yaml
# kubectl describe sc local 
Name:            local
IsDefaultClass:  Yes
Annotations:     cas.openebs.io/config=- name: StorageType
  value: "hostpath"
- name: BasePath
  value: "/var/openebs/local"
,kubectl.kubernetes.io/last-applied-configuration={"apiVersion":"storage.k8s.io/v1","kind":"StorageClass","metadata":{"annotations":{"cas.openebs.io/config":"- name: StorageType\n  value: \"hostpath\"\n- name: BasePath\n  value: \"/var/openebs/local\"\n","openebs.io/cas-type":"local","storageclass.beta.kubernetes.io/is-default-class":"true","storageclass.kubesphere.io/supported-access-modes":"[\"ReadWriteOnce\"]"},"name":"local"},"provisioner":"openebs.io/local","reclaimPolicy":"Delete","volumeBindingMode":"WaitForFirstConsumer"}
,openebs.io/cas-type=local,storageclass.beta.kubernetes.io/is-default-class=true,storageclass.kubesphere.io/supported-access-modes=["ReadWriteOnce"]
Provisioner:           openebs.io/local
Parameters:            <none>
AllowVolumeExpansion:  <unset>
MountOptions:          <none>
ReclaimPolicy:         Delete
VolumeBindingMode:     WaitForFirstConsumer
Events:                <none>
```

## openebs.yaml

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local
  annotations:
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/openebs/local"
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"storage.k8s.io/v1","kind":"StorageClass","metadata":{"annotations":{"cas.openebs.io/config":"- name: StorageType\n  value: \"hostpath\"\n- name: BasePath\n  value: \"/var/openebs/local\"\n","openebs.io/cas-type":"local","storageclass.beta.kubernetes.io/is-default-class":"true","storageclass.kubesphere.io/supported-access-modes":"[\"ReadWriteOnce\"]"},"name":"local"},"provisioner":"openebs.io/local","reclaimPolicy":"Delete","volumeBindingMode":"WaitForFirstConsumer"}
    openebs.io/cas-type: local
    storageclass.beta.kubernetes.io/is-default-class: "true"
    storageclass.kubesphere.io/supported-access-modes: '["ReadWriteOnce"]'
provisioner: openebs.io/local
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```





# StorageClass - Longhorn

## Longhorn 概述

https://longhorn.io/

Longhorn 是一个开源的分布式块存储系统，专为 Kubernetes 设计，旨在为容器化应用程序提供可靠的持久化存储解决方案。它提供了类似于传统网络附加存储（NAS）的功能，同时利用了 Kubernetes 的弹性和自动化能力。

Longhorn 的设计目标是提供简单、可靠、高性能和易于操作的存储解决方案。它使用了分布式的复制技术来提供数据的持久性和高可用性。数据会被分片和复制到多个节点上，从而实现数据的冗余和容错能力。

下面是 Longhorn 的一些重要特性：

1. **分布式存储**: Longhorn 将数据分布在 Kubernetes 集群中的多个节点上，以提供高可靠性和可用性。它使用复制技术确保数据的冗余存储，并支持动态的数据平衡和故障恢复。
2. **快照和克隆**: Longhorn 支持快照和克隆功能，允许用户创建存储卷的时间点副本或快速复制存储卷。这些功能有助于数据保护、测试和开发等方面的需求。
3. **备份和恢复**: Longhorn 提供了备份和恢复功能，使用户能够将存储卷的数据备份到外部存储系统，并在需要时进行恢复。这样可以保护数据免受意外删除、硬件故障或其他灾难性事件的影响。
4. **动态卷调整**: 用户可以根据需要动态调整 Longhorn 存储卷的大小，而无需停止或重启应用程序。这种灵活性使用户能够根据应用程序的需求有效管理存储资源。
5. **用户界面和命令行工具**: Longhorn 提供了用户友好的 Web 用户界面和命令行工具，使用户能够方便地管理和监控存储卷、快照、克隆等。
6. **云原生和可扩展**: Longhorn 是一个云原生的存储解决方案，完全集成到 Kubernetes 生态系统中。它可以与其他 Kubernetes 工具和功能无缝配合使用，并支持水平扩展，以适应不断增长的存储需求。

总的来说，Longhorn 是一个开源的分布式块存储系统，为 Kubernetes 提供可靠的持久化存储解决方案。它具有分布式存储、快照和克隆、备份和恢复、动态卷调整等功能，并与 Kubernetes 生态系统紧密集成，提供用户友好的界面和工

- **Longhorn 部署完成后生成的默认 StorageClass**

```yaml
# kubectl describe sc
Name:            longhorn
IsDefaultClass:  Yes
Annotations:     longhorn.io/last-applied-configmap=kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: longhorn
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: driver.longhorn.io
allowVolumeExpansion: true
reclaimPolicy: "Delete"
volumeBindingMode: Immediate
parameters:
  numberOfReplicas: "3"
  staleReplicaTimeout: "30"
  fromBackup: ""
  fsType: "ext4"
  dataLocality: "disabled"
,storageclass.kubernetes.io/is-default-class=true
Provisioner:           driver.longhorn.io
Parameters:            dataLocality=disabled,fromBackup=,fsType=ext4,numberOfReplicas=3,staleReplicaTimeout=30
AllowVolumeExpansion:  True
MountOptions:          <none>
ReclaimPolicy:         Delete
VolumeBindingMode:     Immediate
Events:                <none>
```

## redis

- redis 使用 longhorn StorageClass 作为存储媒介，动态供给PV、PVC，以实现数据持久化保存

### 创建 PVC

- 创建 PVC，指向 SC，通过 SC 动态创建 PV

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc-dyn-longhorn-demo
  namespace: default
spec:
  accessModes: ["ReadWriteOnce"]
  volumeMode: Filesystem
  resources:
    requests:
      storage: 1Gi
    limits:
      storage: 3Gi
  storageClassName: longhorn
```

#### 验证

```yaml
# kubectl describe pvc
Name:          redis-pvc-dyn-longhorn-demo
Namespace:     default
StorageClass:  longhorn
Status:        Bound
Volume:        pvc-6a43af98-24f1-42f4-926a-649664be0760
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: driver.longhorn.io
               volume.kubernetes.io/storage-provisioner: driver.longhorn.io
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      1Gi # 根据请求值进行供给
Access Modes:  RWO
VolumeMode:    Filesystem
Used By:       <none>
Events:
  Type    Reason                 Age    From                                                                                      Message
  ----    ------                 ----   ----                                                                                      -------
  Normal  Provisioning           2m56s  driver.longhorn.io_csi-provisioner-869bdc4b79-5ntgh_9b078209-21f1-404c-b426-2ddd139d64b1  External provisioner is provisioning volume for claim "default/redis-pvc-dyn-longhorn-demo"
  Normal  ExternalProvisioning   2m56s  persistentvolume-controller                                                               waiting for a volume to be created, either by external provisioner "driver.longhorn.io" or manually created by system administrator
  Normal  ProvisioningSucceeded  2m54s  driver.longhorn.io_csi-provisioner-869bdc4b79-5ntgh_9b078209-21f1-404c-b426-2ddd139d64b1  Successfully provisioned volume pvc-6a43af98-24f1-42f4-926a-649664be0760



# 动态创建的PV
# kubectl describe pv
Name:            pvc-6a43af98-24f1-42f4-926a-649664be0760
Labels:          <none>
Annotations:     longhorn.io/volume-scheduling-error: 
                 pv.kubernetes.io/provisioned-by: driver.longhorn.io
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:    longhorn
Status:          Bound
Claim:           default/redis-pvc-dyn-longhorn-demo
Reclaim Policy:  Delete
Access Modes:    RWO
VolumeMode:      Filesystem
Capacity:        1Gi
Node Affinity:   <none>
Message:         
Source:
    Type:              CSI (a Container Storage Interface (CSI) volume source)
    Driver:            driver.longhorn.io
    FSType:            ext4
    VolumeHandle:      pvc-6a43af98-24f1-42f4-926a-649664be0760
    ReadOnly:          false
    VolumeAttributes:      dataLocality=disabled
                           fromBackup=
                           fsType=ext4
                           numberOfReplicas=3
                           staleReplicaTimeout=30
                           storage.kubernetes.io/csiProvisionerIdentity=1672284806119-8081-driver.longhorn.io
Events:                <none>


# longhorn所在的节点生产的副本镜像相关文件
# ll -h /var/lib/longhorn/replicas/pvc-6a43af98-24f1-42f4-926a-649664be0760-43bc8a83/
total 49M
drwx------ 2 root root 4.0K Dec 29 13:00 ./
drwxr-xr-x 4 root root 4.0K Dec 29 15:55 ../
-rw------- 1 root root 4.0K Dec 29 13:00 revision.counter
-rw-r--r-- 1 root root 1.0G Dec 29 13:00 volume-head-000.img
-rw-r--r-- 1 root root  126 Dec 29 12:34 volume-head-000.img.meta
-rw-r--r-- 1 root root  143 Dec 29 13:00 volume.meta
```



### 创建 redis Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: redis
  namespace: default
spec:
  containers:
  - name: redis
    image: redis:alpine
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 6379
      name: redisport
    volumeMounts:
    - mountPath: /data
      name: redis-data-vol
  volumes:
  - name: redis-data-vol
    persistentVolumeClaim:
      claimName: redis-pvc-dyn-longhorn-demo
```

#### 验证

```yaml
# kubectl describe pod redis 
...
    Mounts:
      /data from redis-data-vol (rw)
...
Volumes:
  redis-data-vol:
    Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)
    ClaimName:  redis-pvc-dyn-longhorn-demo
    ReadOnly:   false
...



# kubectl exec -it redis -- sh
/data # df -h /data/
Filesystem                Size      Used Available Use% Mounted on
/dev/longhorn/pvc-6a43af98-24f1-42f4-926a-649664be0760
                        973.4M     24.0K    957.4M   0% /data
/data # ls /data/
lost+found


# 写入数据测试
/data # redis-cli -h 127.0.0.1
127.0.0.1:6379> set mykey jamesazheng
OK
127.0.0.1:6379> get mykey
"jamesazheng"
127.0.0.1:6379> bgsave
Background saving started
/data # ls /data/
dump.rdb    lost+found

root@k8s-node-1:~# find / -name dump.rdb -type f
/var/lib/kubelet/pods/5f392b3a-ff4e-4253-9315-e5f4b634d73d/volumes/kubernetes.io~csi/pvc-6a43af98-24f1-42f4-926a-649664be0760/mount/dump.rdb
/var/lib/kubelet/plugins/kubernetes.io/csi/pv/pvc-6a43af98-24f1-42f4-926a-649664be0760/globalmount/dump.rdb



# 删除pod
# kubectl delete pod redis 
pod "redis" deleted


# 重建pod后数据依旧会保留
# kubectl exec -it redis -- sh
/data # ls /data/
dump.rdb    lost+found
/data # redis-cli -h 127.0.0.1
127.0.0.1:6379> get mykey
"jamesazheng"

root@k8s-node-1:~# find / -name dump.rdb -type f
/var/lib/kubelet/pods/c814d234-fc34-433f-a0c6-c5008c862c84/volumes/kubernetes.io~csi/pvc-6a43af98-24f1-42f4-926a-649664be0760/mount/dump.rdb
/var/lib/kubelet/plugins/kubernetes.io/csi/pv/pvc-6a43af98-24f1-42f4-926a-649664be0760/globalmount/dump.rdb
```



## wordpress - 1 

- wordpress 使用 longhorn StorageClass 作为存储媒介动态供给PV、PVC

### 创建 PVC

- 创建 PVC，指向 SC，通过 SC 动态创建 PV

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: wordpress
  namespace: default
spec:
  accessModes: ["ReadWriteMany"]
  volumeMode: Filesystem
  resources:
    requests:
      storage: 3Gi
    limits:
      storage: 10Gi
  storageClassName: longhorn
```

#### 验证

```yaml
# kubectl describe pvc wordpress 
Name:          wordpress
Namespace:     default
StorageClass:  longhorn
Status:        Bound
Volume:        pvc-f39c087e-5961-42df-8091-51b412f0f13a
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: driver.longhorn.io
               volume.kubernetes.io/storage-provisioner: driver.longhorn.io
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      3Gi
Access Modes:  RWX
VolumeMode:    Filesystem
Used By:       <none>
Events:
  Type    Reason                 Age   From                                                                                      Message
  ----    ------                 ----  ----                                                                                      -------
  Normal  ExternalProvisioning   36s   persistentvolume-controller                                                               waiting for a volume to be created, either by external provisioner "driver.longhorn.io" or manually created by system administrator
  Normal  Provisioning           36s   driver.longhorn.io_csi-provisioner-869bdc4b79-5ntgh_bd1b5d4c-babb-4bda-b659-d8c0b42048fb  External provisioner is provisioning volume for claim "default/wordpress"
  Normal  ProvisioningSucceeded  34s   driver.longhorn.io_csi-provisioner-869bdc4b79-5ntgh_bd1b5d4c-babb-4bda-b659-d8c0b42048fb  Successfully provisioned volume pvc-f39c087e-5961-42df-8091-51b412f0f13a


# 动态创建的PV
# kubectl describe pv pvc-f39c087e-5961-42df-8091-51b412f0f13a
Name:            pvc-f39c087e-5961-42df-8091-51b412f0f13a
Labels:          <none>
Annotations:     longhorn.io/volume-scheduling-error: 
                 pv.kubernetes.io/provisioned-by: driver.longhorn.io
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:    longhorn
Status:          Bound
Claim:           default/wordpress
Reclaim Policy:  Delete
Access Modes:    RWX
VolumeMode:      Filesystem
Capacity:        3Gi
Node Affinity:   <none>
Message:         
Source:
    Type:              CSI (a Container Storage Interface (CSI) volume source)
    Driver:            driver.longhorn.io
    FSType:            ext4
    VolumeHandle:      pvc-f39c087e-5961-42df-8091-51b412f0f13a
    ReadOnly:          false
    VolumeAttributes:      dataLocality=disabled
                           fromBackup=
                           fsType=ext4
                           numberOfReplicas=3
                           share=true
                           staleReplicaTimeout=30
                           storage.kubernetes.io/csiProvisionerIdentity=1672296904972-8081-driver.longhorn.io
Events:                <none>


# longhorn所在的节点生产的副本镜像相关文件
# ll -h /var/lib/longhorn/replicas/pvc-f39c087e-5961-42df-8091-51b412f0f13a-aa581238
total 191M
drwx------ 2 root root 4.0K Dec 29 15:55 ./
drwxr-xr-x 4 root root 4.0K Dec 29 15:55 ../
-rw------- 1 root root 4.0K Dec 29 16:12 revision.counter
-rw-r--r-- 1 root root 3.0G Dec 29 16:12 volume-head-000.img
-rw-r--r-- 1 root root  126 Dec 29 15:55 volume-head-000.img.meta
-rw-r--r-- 1 root root  142 Dec 29 15:55 volume.meta
```

### 创建 wordpress Pod

- 仅演示wordpress数据实现持久化，MySQL仅配合使用，不进行持久化

#### mysql

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql
  namespace: default
  labels:
    app: mysql
spec:
  containers:
  - name: mysql
    image: mysql:8.0.31
    imagePullPolicy: IfNotPresent
    env:
    - name: MYSQL_USER
      value: 'wp-user'
    - name: MYSQL_PASSWORD
      value: 'wppass'
    - name: MYSQL_DATABASE
      value: 'wordpress'
    - name: MYSQL_RANDOM_ROOT_PASSWORD
      value: 'yes'
---
kind: Service
apiVersion: v1
metadata:
  name: mysql 
  namespace: default
spec:
  selector:
    app: mysql 
  ports:
  - name: mysql
    port: 3306 
    targetPort: 3306
```

#### wordpress

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: wordpress
  labels:
    app: wordpress
spec:
  containers:
  - name: wordpress
    image: wordpress:php8.2-apache
    imagePullPolicy: IfNotPresent
    env:
    - name: WORDPRESS_DB_HOST
      value: 'mysql.default.svc.k8s.xiangzheng.com'
    - name: WORDPRESS_DB_USER
      value: 'wp-user'
    - name: WORDPRESS_DB_PASSWORD
      value: 'wppass'
    - name: WORDPRESS_DB_NAME
      value: wordpress
    - name: WORDPRESS_TABLE_PREFIX
      value: wp_
    volumeMounts:
    - mountPath: /var/www/html # 挂载
      name: wordpress-data-vol
  volumes:
  - name: wordpress-data-vol # 指定PVC
    persistentVolumeClaim:
      claimName: wordpress
---
kind: Service
apiVersion: v1
metadata:
  name: wordpress
  namespace: default
spec:
  type: NodePort
  selector:
    app: wordpress
  ports:
  - name: wordpress 
    port: 80
    targetPort: 80
    nodePort: 30080
```

### 验证

- 容器内的目录已挂载到PVC上，Pod即使被删除数据也不会丢失

```sh
# kubectl exec -it wordpress -- bash
root@wordpress:/var/www/html# df -h /var/www/html/
Filesystem                                               Size  Used Avail Use% Mounted on
10.107.207.71:/pvc-f39c087e-5961-42df-8091-51b412f0f13a  2.9G   73M  2.8G   3% /var/www/html
```







# StorageClass - aws-ebs

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
reclaimPolicy: Retain
allowVolumeExpansion: true
mountOptions:
  - debug
volumeBindingMode: Immediate
```



# StorageClass - NFS

- 基于 NFS 实现 StorageClass

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

https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner

https://artifacthub.io/packages/helm/nfs-subdir-external-provisioner/nfs-subdir-external-provisioner

- 需要安装 NFS 的外部 Provisioner（制备器）
- 自动创建的 PV 以 `${namespace}-${pvcName}-${pvName}` 这样的命名格式创建在 NFS 服务器上的共享数据目录中
- 而当这个 PV 被回收后会以 `archieved-${namespace}-${pvcName}-${pvName}` 这样的命名格式存在 NFS 服务器上。

### 通过 helm 部署

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
- 镜像来自`registry.k8s.io/sig-storage/nfs-subdir-external-provisioner`，无法直接下载

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



# StorageClass - Alibaba Cloud

在阿里云 ACK 上使用 StorageClass 需要进行以下步骤：

1. 创建阿里云云盘或NAS文件存储，或者使用已有的存储。云盘和NAS存储都可以用来创建 PV。在创建云盘和NAS时，需要注意将其绑定到同一个 VPC 下，并开启同一可用区的跨可用区功能，这样可以提高可用性。

2. 创建 StorageClass，可以在控制台或使用 YAML 文件来创建。例如，下面是一个使用阿里云云盘创建的 StorageClass 的 YAML 文件示例：

   ```yaml
   kind: StorageClass
   apiVersion: storage.k8s.io/v1
   metadata:
     name: alicloud-disk-sc
   provisioner: alicloud/disk
   parameters:
     type: cloud_efficiency
     # 设置云盘的 IOPS
     diskIOPSReadWrite: "300"
     # 设置云盘的大小
     diskSize: "20"
   ```

   其中 `provisioner` 参数需要设置为 alicloud/disk，`type` 参数设置为阿里云云盘的类型，可以是 cloud、cloud_efficiency 或 cloud_ssd。`diskIOPSReadWrite` 参数设置云盘的 IOPS，`diskSize` 参数设置云盘的大小。

   也可以使用阿里云NAS创建 StorageClass，例如：

   ```yaml
   kind: StorageClass
   apiVersion: storage.k8s.io/v1
   metadata:
     name: alicloud-nas-sc
   provisioner: alicloud/nas
   parameters:
     # 设置 NAS 的挂载路径和已有挂载目录名
     server: "192.168.1.1:/nas"
     path: "/test"
   ```

   其中 `provisioner` 参数需要设置为 alicloud/nas，`server` 参数设置 NAS 的挂载路径，`path` 参数设置挂载到 Pod 中的目录名。

3. 创建 PVC，可以通过 YAML 文件或者 kubectl 命令行创建。例如，下面是一个使用上述 StorageClass 创建的 PVC 的 YAML 文件示例：

   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: alicloud-pvc
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 20Gi
     storageClassName: alicloud-disk-sc
   ```

   其中 `storageClassName` 参数需要设置为之前创建的 StorageClass 的名称，`accessModes` 参数设置为挂载方式，可以是 ReadWriteOnce、ReadWriteMany 或 ReadOnlyMany，`resources.requests.storage` 参数设置 PVC 请求的存储大小。

4. 在 Pod 中使用 PVC，例如：

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: test-pod
   spec:
     containers:
       - name: test-container
         image: nginx
         volumeMounts:
           - name: test-volume
             mountPath: /data
     volumes:
       - name: test-volume
         persistentVolumeClaim:
           claimName: alicloud-pvc
   ```

   在 Pod 中使用 `persistent

非常抱歉，我之前回答不完整。以下是关于在阿里云ACK中如何使用StorageClass的完整回答：

在阿里云ACK中使用StorageClass可以按照以下步骤进行：

1. 创建阿里云云盘存储类型（Disk Type）：在阿里云的控制台中选择云盘（Disk）-> 存储类型（Disk Type），选择对应的区域和存储类型创建。
2. 创建StorageClass：在Kubernetes集群中创建一个StorageClass，通过指定云盘存储类型和其他参数来定义它。
3. 创建PVC：在Kubernetes集群中创建一个PVC，并指定存储类的名称。Kubernetes将使用存储类来创建PV。
4. 挂载PVC到Pod中：在Kubernetes集群中创建一个Pod，并在spec.volumeClaimTemplates.spec.claimName中指定PVC的名称。这样，Kubernetes就会将PV挂载到Pod中。

以下是一个使用阿里云云盘和StorageClass的PVC和Pod的示例：

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: alicloud-disk-ssd
---
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: my-container
    image: nginx
    volumeMounts:
    - name: my-volume
      mountPath: /data
  volumes:
  - name: my-volume
    persistentVolumeClaim:
      claimName: my-pvc
```

在这个示例中，创建了一个名为“my-pvc”的PVC，指定了存储类为“alicloud-disk-ssd”。然后创建了一个名为“my-pod”的Pod，将PVC挂载到了名为“my-volume”的卷中，并将该卷挂载到了Pod中的“/data”路径中。

希望这个回答对您有帮助。



# ---

# 默认 StorageClass 

- 将某个 StorageClass 设为默认
- **注意：如果之前有默认的 storageclass，可能需要使用 `kubectl edit` 手动删除默认相关选项**

## kubectl patch

- `kubectl patch storageclass <storageclass-name> -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'`
  - 将` <storageclass-name>` 替换为你要编辑的 `StorageClass` 的名称

### 设置前

```yaml
# kubectl get sc
NAME         PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
nfs-client   cluster.local/nfs-subdir-external-provisioner   Delete          Immediate           true                   35m

# kubectl get sc -o yaml
apiVersion: v1
items:
- allowVolumeExpansion: true
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    annotations:
      meta.helm.sh/release-name: nfs-subdir-external-provisioner
      meta.helm.sh/release-namespace: nfs-subdir-external-provisioner
    creationTimestamp: "2023-12-18T07:05:48Z"
    labels:
      app: nfs-subdir-external-provisioner
      app.kubernetes.io/managed-by: Helm
      chart: nfs-subdir-external-provisioner-4.0.18
      heritage: Helm
      release: nfs-subdir-external-provisioner
    name: nfs-client
    resourceVersion: "30695"
    uid: 5fb59950-bde1-4bac-94d9-fa7fd14d4830
  parameters:
    archiveOnDelete: "true"
  provisioner: cluster.local/nfs-subdir-external-provisioner
  reclaimPolicy: Delete
  volumeBindingMode: Immediate
kind: List
metadata:
  resourceVersion: ""
```

### 将 nfs-client 设为默认

```yaml
# kubectl patch storageclass nfs-client -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
storageclass.storage.k8s.io/nfs-client patched


# kubectl get sc
NAME                   PROVISIONER                                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
nfs-client (default)   cluster.local/nfs-subdir-external-provisioner   Delete          Immediate           true                   37m


# kubectl get sc -oyaml
apiVersion: v1
items:
- allowVolumeExpansion: true
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    annotations:
      meta.helm.sh/release-name: nfs-subdir-external-provisioner
      meta.helm.sh/release-namespace: nfs-subdir-external-provisioner
      storageclass.kubernetes.io/is-default-class: "true"
    creationTimestamp: "2023-12-18T07:05:48Z"
    labels:
      app: nfs-subdir-external-provisioner
      app.kubernetes.io/managed-by: Helm
      chart: nfs-subdir-external-provisioner-4.0.18
      heritage: Helm
      release: nfs-subdir-external-provisioner
    name: nfs-client
    resourceVersion: "37066"
    uid: 5fb59950-bde1-4bac-94d9-fa7fd14d4830
  parameters:
    archiveOnDelete: "true"
  provisioner: cluster.local/nfs-subdir-external-provisioner
  reclaimPolicy: Delete
  volumeBindingMode: Immediate
kind: List
metadata:
  resourceVersion: ""
```





## kubectl edit

在 Kubernetes 中，要将某个 `StorageClass` 设为默认，你可以使用以下步骤：

1. 首先，使用 `kubectl get storageclasses` 命令获取当前的 `StorageClass` 列表，找到你想要设为默认的 `StorageClass` 的名称。

2. 使用 `kubectl edit storageclass <storageclass-name>` 命令来编辑该 `StorageClass` 的配置。将 `<storageclass-name>` 替换为你要编辑的 `StorageClass` 的名称。

3. 在编辑器中打开 `StorageClass` 的配置。找到 `annotations` 部分，并添加或更新以下注释：

   ```
   volume.beta.kubernetes.io/is-default-class: "true"
   ```

   这个注释指示 Kubernetes 将该 `StorageClass` 设置为默认。

4. 保存并关闭编辑器。Kubernetes 将自动更新 `StorageClass` 的配置。

5. 确认默认 `StorageClass` 的更改是否生效。使用 `kubectl get storageclasses` 命令检查 `DEFAULT` 标记是否出现在所选 `StorageClass` 的输出中。如果 `DEFAULT` 列中显示 `true`，则表示成功将该 `StorageClass` 设置为默认。

需要注意的是，只能有一个默认的 `StorageClass`，如果你将另一个 `StorageClass` 设置为默认，之前的默认 `StorageClass` 将被替换。

