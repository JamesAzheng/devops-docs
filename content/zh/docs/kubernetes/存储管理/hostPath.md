---
title: "hostPath"
weight: 10
---

# hostPath 概述

- Host 级持久卷，数据不会随着容器的删除而删除，而是持久存放在宿主机

**应用场景：**

- 采集宿主机的日志、

**参考文档：**

- https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/#hostpath





## hostPath  注意事项

- HostPath 卷可能会暴露特权系统凭据（例如 Kubelet）或特权 API（例如容器运行时套接字），可用于容器逃逸或攻击集群的其他部分。
- 具有相同配置（例如基于同一 PodTemplate 创建）的多个 Pod 会由于节点上文件的不同而在不同节点上有不同的行为。
- 下层主机上创建的文件或目录只能由 root 用户写入。你需要在 [特权容器](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/security-context/) 中以 root 身份运行进程，或者修改主机上的文件权限以便容器能够写入 `hostPath` 卷。

- **为了安全考虑，当必须使用 HostPath 卷时，它的范围应仅限于所需的文件或目录，并以只读方式挂载 即 readOnly: true**

  - 只读方式挂载其实是为了避免在容器中误操作导致宿主机的内容一同被删除

  - 只读方式挂载 如果宿主机不存在 volumes 定义的目录则会自动创建 但无法往其中写入数据

  - 但是有的时候以只读方式挂载有时会导致容器无法启动，所以**可以选择将需要读写的目录进行读写挂载(比如日志目录)，其它不需要读写操作的目录进行只读挂载**

  - 范例：nginx全部目录以只读方式挂载报错如下，这时就可以单独将日志目录进行读写挂载

    - ```
      nginx: [alert] could not open error log file: open() "/var/log/nginx/error.log" failed (30: Read-only file system)
      
      2022/07/25 01:51:16 [emerg] 1#1: open() "/var/log/nginx/error.log" failed (30: Read-only file system)
      ```



# hostPath Explain

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-hostpath
spec:
  containers:
  - name: test-hostpath
    image: nginx-1.18-ubuntu:1.0
    volumeMounts:
    - name: hostpath # 引用pod级别存储卷的名称
      mountPath: /var/log/nginx # 容器上的路径，不存在则会自动创建
  volumes:
  - name: hostpath # 定义pod级别存储卷的名称
    hostPath: # 定义存储卷类型为hostPath
      path: /data/logs/nginx  # 宿主上的位置，不存在则会自动创建，也可以加下面的type进行判断
      #type: Directory # 默认在关联hostPath存储卷之前不进行任何检查（不检查文件或目录是否存在，以及文件类型为何）。
```

## type

`deployments.spec.template.spec.volumes.hostPath.type`

- **File**：事先必须存在的文件路径；
- **Directory**：事先必须存在的目录路径；
- **DirectoryOrCreate**：指定的路径不存时自动将其创建为0755权限的空目录，属主属组均为kubelet；
- **FileOrCreate**：指定的路径不存时自动将其创建为0644权限的空文件，属主和属组同为kubelet；
- **Socket**：事先必须存在的Socket文件路径；
- **CharDevice**：事先必须存在的字符设备文件路径；
- **BlockDevice**：事先必须存在的块设备文件路径；



# ---

# hostPath Example - 1

## yaml

- 此示例中将宿主机的日志等目录挂载到容器中，该容器可以实现采集指定挂载点的日志数据发送到redis

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volumes-hostpath-demo
spec:
  containers:
  - name: filebeat
    image: ikubernetes/filebeat:5.6.7-alpine
    env:
    - name: REDIS_HOST
      value: redis.ilinux.io:6379
    - name: LOG_LEVEL
      value: info
    volumeMounts:
    - name: varlog
      mountPath: /var/log
    - name: socket
      mountPath: /var/run/docker.sock
    - name: varlibdockercontainers
      mountPath: /var/lib/docker/containers
      readOnly: true # 设为只读，防止此关键目录中的数据被误删除
  volumes:
  - name: varlog
    hostPath:
      path: /var/log
  - name: varlibdockercontainers
    hostPath:
      path: /var/lib/docker/containers
  - name: socket
    hostPath:
      path: /var/run/docker.sock
```

## 验证

```yaml
# kubectl describe pod volumes-hostpath-demo 
Name:         volumes-hostpath-demo
Namespace:    default
Priority:     0
Node:         k8s-node-1/10.0.0.101
...
Containers:
...
    Mounts:
      /var/lib/docker/containers from varlibdockercontainers (ro)
      /var/log from varlog (rw)
      /var/run/docker.sock from socket (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-hv26d (ro)
...
Volumes:
  varlog:
    Type:          HostPath (bare host directory volume)
    Path:          /var/log
    HostPathType:  
  varlibdockercontainers:
    Type:          HostPath (bare host directory volume)
    Path:          /var/lib/docker/containers
    HostPathType:  
  socket:
    Type:          HostPath (bare host directory volume)
    Path:          /var/run/docker.sock
    HostPathType:  
...

---------------------------

# 宿主机
root@k8s-node-1:~# ls /var/log/ -l
total 6412
-rw-r--r--  1 root      root                  0 Oct  1 20:59 alternatives.log
-rw-r--r--  1 root      root               8768 Sep 25 08:41 alternatives.log.1
-rw-r--r--  1 root      root               2260 Mar 24  2022 alternatives.log.2.gz
-rw-r-----  1 root      adm                   0 Oct 18 10:04 apport.log
-rw-r-----  1 root      adm                 115 Oct 17 17:59 apport.log.1
drwxr-xr-x  2 root      root               4096 Dec 23 12:43 apt
...

# 容器中
root@k8s-master-1:~# kubectl exec volumes-hostpath-demo -- ls -l /var/log
total 6412
-rw-r--r--    1 root     root             0 Oct  1 12:59 alternatives.log
-rw-r--r--    1 root     root          8768 Sep 25 00:41 alternatives.log.1
-rw-r--r--    1 root     root          2260 Mar 24  2022 alternatives.log.2.gz
-rw-r-----    1 root     adm              0 Oct 18 02:04 apport.log
-rw-r-----    1 root     adm            115 Oct 17 09:59 apport.log.1
drwxr-xr-x    2 root     root          4096 Dec 23 04:43 apt
...
```

### 宿主机中创建文件

```sh
root@k8s-node-1:~# echo 'Create in Host' > /var/log/hostfile.txt
root@k8s-node-1:~# cat /var/log/hostfile.txt
Create in Host



root@k8s-master-1:~# kubectl exec volumes-hostpath-demo -- cat /var/log/hostfile.txt
Create in Host


# Pod删除后文件会在宿主机持久保存
# kubectl delete -f volumes-hostpath-demo.yaml 
pod "volumes-hostpath-demo" deleted
root@k8s-node-1:~# cat /var/log/hostfile.txt
Create in Host
```



### 容器中创建文件

```sh
root@k8s-master-1:~# kubectl exec -it volumes-hostpath-demo -- sh
/ # echo 'Create in Container' > /var/log/containerfile.txt
/ # cat /var/log/containerfile.txt
Create in Container


root@k8s-node-1:~# cat /var/log/containerfile.txt
Create in Container


# Pod删除后文件会在宿主机持久保存
# kubectl delete -f volumes-hostpath-demo.yaml 
pod "volumes-hostpath-demo" deleted
root@k8s-node-1:~# cat /var/log/containerfile.txt
Create in Container
```



# hostPath Example - 2

## yaml

- test-hostpath.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-hostpath
spec:
  containers:
  - name: test-hostpath
    image: nginx-1.18-ubuntu:1.0
    volumeMounts:
    - name: hostpath # 引用pod级别存储卷的名称
      mountPath: /var/log/nginx # 容器上的路径，不存在则会自动创建
  volumes:
  - name: hostpath # 定义pod级别存储卷的名称
    hostPath: # 定义存储卷类型为hostPath
      path: /data/logs/nginx  # 宿主上的位置，不存在则会自动创建，也可以加下面的type进行判断
      #type: Directory # Directory、 File、DirectoryOrCreate...，默认在关联hostPath存储卷之前不进行任何检查。
```



## Test

```bash
#创建
# kubectl apply -f test-pod.yaml 
pod/test-pod created


#进入容器中并创建测试文件
# kubectl exec -it test-pod -- bash
root@test-pod:/# echo 'hello k8s!' > /cache/test.txt
root@test-pod:/# ls -l /cache/
total 4
-rw-r--r-- 1 root root 11 Jun 29 06:16 test.txt
root@test-pod:/# cat /cache/test.txt 
hello k8s!


#查看pod被创建到哪个节点
# kubectl get pod -o wide 
NAME        READY   STATUS        RESTARTS   AGE     IP           NODE         NOMINATED NODE   READINESS GATES
...
test-pod    1/1     Running       0          6m25s   10.10.1.26   k8s-work-1   <none>           <none>


#来到被创建到的节点查找文件
root@k8s-work-1:~# tree /data
/data
└── logs
    └── nginx
        ├── access.log
        └── error.log


#删除容器
# kubectl delete -f test-pod.yaml 
pod "test-pod" deleted


#卷会保留
root@k8s-work-1:~# tree /data
/data
└── logs
    └── nginx
        ├── access.log
        └── error.log
```

### 当多个镜像使用相同的 hostPath

- **结论：数据会以增量形式添加，而非覆盖**

```bash
# cat test-pod.yaml 
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - image: nginx
    name: test-container
    volumeMounts:
    - mountPath: /var/log/nginx  #容器上的路径
      name: test-volume
  volumes:
  - name: test-volume
    hostPath: 
      path: /data/logs/nginx  #宿主上目录位置 



# cat test-pod2.yaml 
apiVersion: v1
kind: Pod
metadata:
  name: test-pod2
spec:
  containers:
  - image: nginx
    name: test-container2
    volumeMounts:
    - mountPath: /var/log/nginx  #容器上的路径
      name: test-volume #调用
  volumes:
  - name: test-volume #定义
    hostPath: 
      path: /data/logs/nginx  #宿主上目录位置 



root@k8s-master:~# kubectl exec -it test-pod bash
root@test-pod:/# echo 111 >> /var/log/nginx/access.log
root@k8s-master:~# kubectl exec -it test-pod2 bash
root@test-pod2:/# echo 222 >> /var/log/nginx/access.log


root@k8s-work-1:~# tail -f /data/logs/nginx/access.log 
111
222
```

### 如果宿主机事先有目录并且有文件

- **总结：有原有目录的话数据不会丢 容器内的文件会以增量的方式存放在宿主机，容器中可以看到宿主机挂载目录的全部内容 并且可以进行删除等操作**

```yaml
# test-hostPath.yaml 
apiVersion: v1
kind: Namespace
metadata:
  name: test-hostpath

---

apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: test-hostpath
  namespace: test-hostpath
spec:
  selector:
    matchLabels:
      name: nginx
  template:
    metadata:
      labels:
        name: nginx
    spec:
      restartPolicy: Always
      containers:
      - name: nginx
        image: nginx
        imagePullPolicy: IfNotPresent
        volumeMounts:
        - name: log
          mountPath: /var/log/nginx
      volumes:
      - name: log
        hostPath:
          path: /data/logs/nginx


# 宿主机目录
# ll /data/logs/nginx/
...
-rw-r--r-- 1 root root  630 Jul 25 09:49 fstab
-rw-r--r-- 1 root root 2099 Jul 25 09:49 passwd



# 再次查看宿主机目录
# kubectl apply -f test-hostPath.yaml
namespace/test-hostpath created
daemonset.apps/test-hostpath created
# ll /data/logs/nginx/
...
-rw-r--r-- 1 root root    0 Jul 25 09:53 access.log
-rw-r--r-- 1 root root  505 Jul 25 09:53 error.log
-rw-r--r-- 1 root root  630 Jul 25 09:49 fstab
-rw-r--r-- 1 root root 2099 Jul 25 09:49 passwd


# 容器中会看到宿主机中的内容
# kubectl exec -it -n test-hostpath test-hostpath-bl5vj -- bash
root@test-hostpath-bl5vj:/# ls -l /var/log/nginx/
total 12
-rw-r--r-- 1 root root    0 Jul 25 02:00 access.log
-rw-r--r-- 1 root root  505 Jul 25 02:00 error.log
-rw-r--r-- 1 root root  630 Jul 25 02:01 fstab
-rw-r--r-- 1 root root 2099 Jul 25 02:00 passwd
```

### hostpath 采集宿主机日志

- **以只读方式挂载**
- **注意：此方式没有解决针对不同宿主机日志分类存放的问题，如何解决？**

```yaml
# test-hostPath.yaml 
apiVersion: v1
kind: Namespace
metadata:
  name: test-hostpath

---

apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: test-hostpath
  namespace: test-hostpath
spec:
  selector:
    matchLabels:
      name: nginx
  template:
    metadata:
      labels:
        name: nginx
    spec:
      restartPolicy: Always
      containers:
      - name: nginx
        image: nginx
        imagePullPolicy: IfNotPresent
        volumeMounts:
        - name: log
          mountPath: /tmp
          readOnly: true
      volumes:
      - name: log
        hostPath:
          path: /var/log



# kubectl apply -f test-hostPath.yaml 
namespace/test-hostpath created
daemonset.apps/test-hostpath created
# kubectl get pod -n test-hostpath 
NAME                  READY   STATUS    RESTARTS   AGE
test-hostpath-cjwb2   1/1     Running   0          3s
test-hostpath-hlzxk   1/1     Running   0          3s
# kubectl exec -it -n test-hostpath test-hostpath-cjwb2 -- bash
root@test-hostpath-cjwb2:/# ls /tmp/
alternatives.log       cloud-init.log  haproxy.log	  haproxy.log.3.gz  kern.log.3.gz 
...

# 只能查看 不能删除
root@test-hostpath-cjwb2:/# rm -f /tmp/syslog
rm: cannot remove '/tmp/syslog': Read-only file system
```





# 同一 Pod 中多个容器挂载相同的 hostPath

- 挂载前，各容器数据存放位置

```yaml
# cat demoapp.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      labels:
        app: demoapp
    spec:
      containers:
        - name: demoapp
          image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/demoapp:v1.0
          command:
          - tail
          - -f
          - /dev/null
        - name: nginx 
          image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/nginx:1.23 
 
 
# nginx 容器数据
# ls /usr/share/nginx/html/
50x.html  index.html

# demoapp 容器数据
# ls /usr/local/bin/demo.py 
/usr/local/bin/demo.py
```

- **如果宿主机事先未创建挂载目录，则该目录会被自动创建**，并将该目录挂载至对应的容器中。因此 nginx 与 demoapp 容器之前的数据将看不到（看到的是宿主机 /share-data 目录的内容）。
- 总结：**宿主机的目录挂载到容器中**

```yaml
# 注意！该目录应在 Pod 被调度的节点查询！
root@local-k8s-worker-1:~# ls /share-data
ls: cannot access '/share-data': No such file or directory


# cat demoapp.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      labels:
        app: demoapp
    spec:
      containers:
        - name: demoapp
          image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/demoapp:v1.0
          command:
          - tail
          - -f
          - /dev/null
          volumeMounts:
          - name: test-hostpath
            mountPath: /usr/local/bin/
        - name: nginx 
          image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/nginx:1.23 
          volumeMounts:
          - name: test-hostpath
            mountPath: /usr/share/nginx/html/ 
      volumes:
        - name: test-hostpath
          hostPath:
            path: /share-data


# Pod 创建后，该目录在被调度的节点上出现
root@local-k8s-worker-1:~# ls /share-data -d
/share-data
```

