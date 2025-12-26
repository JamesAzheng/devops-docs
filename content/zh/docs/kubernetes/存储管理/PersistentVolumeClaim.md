---
title: "PersistentVolumeClaim"
weight: 10
---

# PVC 概述

- Persistent Volume Claim 持久卷申请，简称 PVC，**名称空间级别资源**
- PVC 由用户使用，由用户定义出存储消费需求，而后根据需求条件与现有各 PV 进行匹配检测，找出一个最佳的使用，并与之绑定，最终交给 Pod 来使用。
  - Pod 是通过 PVC 将数据保存至 PV，PV 再保存至真实存储
  - **一个 PVC 只能绑定(bound)一个 PV**
  - 另外，PV 与 PVC **二者要么都不属于任何StorageClass资源，要么属于同一个StorageClass资源**，才能进行绑定




# PVC Explain

定义PVC时，用户可通过访问模式（accessModes）、数据源（dataSource）、存储资源空间需求和限制（resources）、存储类、标签选择器、卷模型和卷名称等匹配标准来筛选集群上的PV资源

- **其中 resources 和 accessModes是最重的筛选标准**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-tmp
  namespace: default
spec:
  volumeName: pv-tmp # 直接指定要绑定的PV资源的名称(一般不定义，而是由定义的各种维度进行动态筛选)
  accessModes:
    - ReadWriteOnce # PVC的访问模式；它同样支持RWO、RWX和ROX三种模式
  resources: # 声明使用的存储空间的最小值和最大值(以选出合适的PV)；目前，PVC的资源限定仅支持空间大小一个维度
    requests:
      storage: 80Gi
```

## accessModes

- 被筛选的PV也要同样支持此处定义的访问模式 
- `PersistentVolumeClaim.spec.accessModes`



## dataSource

- 用于从指定的数据源恢复该PVC卷，它目前支持的数据源包括一个现在卷快照对象（snapshot.storage.k8s.io/VolumeSnapshot）、一个既有PVC对象（PersistentVolumeClaim）或一个既有的用于数据转存的自定义资源对象（resource/object）

- `PersistentVolumeClaim.spec.dataSource`



## selector

- 筛选PV时额外使用的标签选择器（matchLabels）或匹配条件表达式（matchExpressions）

- `PersistentVolumeClaim.spec.selector`



## storageClassName

- 该PVC资源隶属的存储类资源名称；指定了存储类资源的PVC仅能在同一个存储类下筛选PV资源，否则，就只能从所有不具有存储类的PV中进行筛选

- `PersistentVolumeClaim.spec.storageClassName`



## volumeMode

- 卷模型，用于指定此卷可被用作文件系统还是裸格式的块设备；默认值为Filesystem；
- 被筛选的PV也要同样支持相同的卷模型
- `PersistentVolumeClaim.spec.volumeMode`







# PVC Example

## 创建 PVC

### 验证 pv

- 需事先具有PV

```sh
# kubectl get pv
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv-nfs-001   5Gi        RWO            Retain           Available                                   4m22s
pv-nfs-002   5Gi        RWX            Retain           Available                                   4m22s
pv-nfs-003   10Gi       RWX            Retain           Available                                   4m22s
```

### yaml

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-demo-001
spec:
  accessModes: ["ReadWriteMany"]
  volumeMode: Filesystem
  resources:
    requests:
      storage: 3Gi
    limits:
      storage: 10Gi
  selector: # 只有与此处选择器定义所匹配的pv才能够被匹配
    matchLabels:
      usedof: "redisdata"
```

### 验证

- **pv-nfs-002 和 pv-nfs-003 都满足RWX，但会更倾向于接近`PersistentVolumeClaim.spec.resources.requests`中定义的请求值进行匹配**
- 如果没有合适的PV来满足PVC，PVC将不会与任何PV建立绑定关系

```sh
# kubectl get pvc
NAME           STATUS   VOLUME       CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pvc-demo-001   Bound    pv-nfs-002   5Gi        RWX                           3s
```



## Pod 中使用 PVC

### 验证 PVC

```yaml
# kubectl describe pvc pvc-demo-001
Name:          pvc-demo-001
Namespace:     default
StorageClass:  
Status:        Bound
Volume:        pv-nfs-002
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      5Gi
Access Modes:  RWX
VolumeMode:    Filesystem
Used By:       <none>
Events:        <none>


# 对应的PV
# kubectl describe pv pv-nfs-002
Name:            pv-nfs-002
Labels:          usedof=redisdata
Annotations:     pv.kubernetes.io/bound-by-controller: yes
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:    
Status:          Bound
Claim:           default/pvc-demo-001
Reclaim Policy:  Retain
Access Modes:    RWX
VolumeMode:      Filesystem
Capacity:        5Gi
Node Affinity:   <none>
Message:         
Source:
    Type:      NFS (an NFS mount that lasts the lifetime of a pod)
    Server:    10.0.0.8
    Path:      /data/nfs/redis002
    ReadOnly:  false
Events:        <none>
```

### yaml

- **注：Pod 只能调用与自己在同一名称空间中的 PVC**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volumes-pvc-demo
  namespace: default
spec:
  containers:
  - name: redis
    image: redis:alpine
    imagePullPolicy: IfNotPresent
    securityContext:
      runAsUser: 1688 # 因为此处PVC对应PV所关联的是nfs，所以需要定义在nfs挂载目录中有读写权限的用户
    ports:
    - containerPort: 6379
      name: redisport
    volumeMounts:
    - mountPath: /data
      name: redis-nfs-vol
  volumes:
  - name: redis-nfs-vol
    persistentVolumeClaim:
      claimName: pvc-demo-001
```

### 验证

```yaml
# kubectl describe pod volumes-pvc-demo 
...
Containers:
...
    Mounts:
      /data from redis-nfs-vol (rw)
...
Volumes:
  redis-nfs-vol:
    Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)
    ClaimName:  pvc-demo-001
    ReadOnly:   false
...


# 写入数据测试
# kubectl exec -it volumes-pvc-demo -- sh
/data $ redis-cli -h 127.0.0.1
127.0.0.1:6379> set mykey jamesazheng
OK
127.0.0.1:6379> get mykey
"jamesazheng"
127.0.0.1:6379> bgsave
Background saving started
127.0.0.1:6379> 
/data $ ls /data/ -l
total 4
-rw-r--r--    1 1688     nobody         116 Dec 28 04:17 dump.rdb



# nfs端生成的数据
# ls -l /data/nfs/redis002/
total 4
-rw-r--r-- 1 redis nobody 116 Dec 28 12:17 dump.rdb



# 删除pod重建后数据仍然会保留
# kubectl exec -it volumes-pvc-demo -- sh
/data $ redis-cli -h 127.0.0.1
127.0.0.1:6379> get mykey
"jamesazheng"
```



## 卸载PVC





# 实现 PV / PVC

- Jenkins数据实现持久化；NFS 作为集群外存储，PV 调用 NFS

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

## 准备 NFS

- 安装过程省略

```bash
# 创建共享目录
# mkdir -p /nfs_data/jenkins/{jenkins-data,jenkins-root}

# 定义共享目录
# vim /etc/exports
...
/nfs_data/jenkins/ *(rw,no_root_squash)

# 重载配置文件
# exportfs -r

# 查看共享结果
# showmount -e 10.0.0.103
Export list for 10.0.0.103:
/nfs_data/jenkins/ *
```

## 准备 namespace

```yaml
# vim /data/yaml/jenkins/jenkins-ns.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: jenkins
```

### 验证

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-ns.yaml
namespace/jenkins created


# kubectl get ns
NAME              STATUS   AGE
jenkins           Active   2s
...
```



## 准备 PV

```yaml
# vim /data/yaml/jenkins/jenkins-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: jenkins-data-pv
  labels:
    type: jenkins-data-pv
  namespace: jenkins
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: "/nfs_data/jenkins/jenkins-data"
    server: 10.0.0.103

---

apiVersion: v1
kind: PersistentVolume
metadata:
  name: jenkins-root-pv
  labels:
    type: jenkins-root-pv
  namespace: jenkins
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: "/nfs_data/jenkins/jenkins-root"
    server: 10.0.0.103
```

### 验证

```bash
# kubectl apply -f jenkins-pv.yaml 
persistentvolume/jenkins-data-pv created
persistentvolume/jenkins-root-pv created


# STATUS 一定要是 Available
# kubectl get pv
NAME              CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
jenkins-data-pv   100Gi      RWO            Retain           Available                                   3s
jenkins-root-pv   100Gi      RWO            Retain           Available                                   3s
```



## 准备 PVC

```yaml
# vim /data/yaml/jenkins/jenkins-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-data-pvc
  namespace: jenkins
spec:
  volumeName: jenkins-data-pv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 80Gi

---

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-root-pvc
  namespace: jenkins
spec:
  volumeName: jenkins-root-pv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 80Gi
```

### 验证

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-pvc.yaml 
persistentvolumeclaim/jenkins-data-pvc created
persistentvolumeclaim/jenkins-root-pvc created



# STATUS 一定要是 Bound
# kubectl get pv
NAME              CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                      STORAGECLASS   REASON   AGE
jenkins-data-pv   100Gi      RWO            Retain           Bound    jenkins/jenkins-data-pvc                           113s
jenkins-root-pv   100Gi      RWO            Retain           Bound    jenkins/jenkins-root-pvc                           113s



# STATUS 一定要是 Bound
# kubectl get pvc -n jenkins 
NAME               STATUS   VOLUME            CAPACITY   ACCESS MODES   STORAGECLASS   AGE
jenkins-data-pvc   Bound    jenkins-data-pv   100Gi      RWO                           17s
jenkins-root-pvc   Bound    jenkins-root-pv   100Gi      RWO                           17s
```



## 准备 deployment

```yaml
# vim /data/yaml/jenkins/jenkins-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jenkins-deployment
  namespace: jenkins
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jenkins
  template:
    metadata:
      labels:
        app: jenkins
    spec:
      restartPolicy: Always
      containers:
      - name: jenkins-server
        image: jenkins-2.303.3-jdk-8u333:1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: jenkins-server
          protocol: TCP
        resources:
          requests:   
            cpu: 512m
            memory: 512Mi   
          limits:   
            cpu: 1   
            memory: 1024Mi
        volumeMounts:
        - mountPath: "/jenkins/jenkins-data/" # 结尾 / 加与不加效果都一样，都是将整个目录下的所有挂载至存储 
          name: jenkins-data # 调用卷名称（相当于调用PVC的别名）
        - mountPath: "/root/.jenkins/"
          name: jenkins-root
      volumes:
      - name: jenkins-data # 定义卷名称（相当于给PVC起别名）
        persistentVolumeClaim:
          claimName: jenkins-data-pvc # 指定pvc的name，需等于PersistentVolumeClaim.metadata.name
      - name: jenkins-root
        persistentVolumeClaim:
          claimName: jenkins-root-pvc

---

kind: Service
apiVersion: v1
metadata:
  labels:
    app: jenkins-service
  name: jenkins-service
  namespace: jenkins
spec:
  type: NodePort
  ports:
  - name: jenkins-server
    port: 8080
    protocol: TCP
    targetPort: 8080
    nodePort: 30080
  selector:
    app: jenkins
```

### 验证

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-deployment.yaml 
deployment.apps/jenkins-deployment created
service/jenkins-service created


# kubectl get pod -n jenkins -o wide 
NAME                                  READY   STATUS    RESTARTS   AGE     IP            NODE         NOMINATED NODE   READINESS GATES
jenkins-deployment-64d5b67576-gqd5z   1/1     Running   0          9m31s   10.10.1.147   k8s-work-1   <none>           <none>
```



## 测试

```bash
root@nfs:/nfs_data/jenkins# ls jenkins-data/
 bootstrap              images                        'Main$FileAndDescription.class'   robots.txt
 ColorFormatter.class   JNLPMain.class                 Main.class                       scripts
 css                    jsbundles                     'MainDialog$1$1.class'            WEB-INF
 executable            'LogFileOutputStream$1.class'  'MainDialog$1.class'              winstone.jar
 favicon.ico           'LogFileOutputStream$2.class'   MainDialog.class
 help                   LogFileOutputStream.class      META-INF


root@nfs:/nfs_data/jenkins# ls jenkins-root/
config.xml                        jobs              plugins                   updates
hudson.model.UpdateCenter.xml     logs              secret.key                userContent
identity.key.enc                  nodeMonitors.xml  secret.key.not-so-secret  users
jenkins.telemetry.Correlator.xml  nodes             secrets
```



# ceph

## rbd example

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-sc-rbd-demo
  namespace: default
spec:
  accessModes: ["ReadWriteOnce"]
  volumeMode: Filesystem
  resources:
    requests:
      storage: 3Gi
    limits:
      storage: 10Gi
  storageClassName: fast-rbd

```



## cephfs example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volumes-cephfs-demo
spec:
  containers:
  - name: redis 
    image: redis:alpine
    volumeMounts:
    - mountPath: "/data"
      name: redis-cephfs-vol
  volumes:
  - name: redis-cephfs-vol
    cephfs:
      monitors:
      - 172.29.200.1:6789
      - 172.29.200.2:6789
      - 172.29.200.3:6789
      path: /kube/namespaces/default/redis1
      user: fsclient
      secretFile: "/etc/ceph/fsclient.key"
      readOnly: false
```



