---
title: "emptyDir"
weight: 10
---

# emptyDir 概述

- 本地临时匿名存储卷，**数据会随着容器的删除而删除**；
- 可以借助于外部的高速磁盘 或 内存作为存储介质，为应用提供共享数据 或 高速缓存；
- 常用于一个 Pod 中的多个容器间共享数据。

参考文档：

- https://kubernetes.io/zh-cn/docs/concepts/storage/volumes/#emptydir



# emptyDir Explain

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: test-emptydir
  namespace: default
spec:
  containers:
  - name: test-container
    image: nginx-1.18-ubuntu:1.0
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: emptydir # 引用pod级别存储卷的名称
      mountPath: /cache # 容器上的路径，不存在则会自动创建
  volumes: # 定义pod级别的存储卷
  - name: emptydir # 定义pod级别存储卷的名称
    #emptyDir: {} # 定义存储卷类型为emptyDir，{}表示使用默认值
    emptyDir:
      medium: Memory # 将内存定义为存储卷使用的空间，默认是使用磁盘作为存储空间
      sizeLimit: 16Mi # 限制使用的最大大小，默认占用宿主机50%的内存
```





# emptyDir Example - 1

## yaml

- test-emptydir.yaml

```yml
apiVersion: v1
kind: Pod
metadata:
  name: test-emptydir
  namespace: default
spec:
  containers:
  - name: test-container
    image: nginx-1.18-ubuntu:1.0
    imagePullPolicy: IfNotPresent
    volumeMounts:
    - name: emptydir # 引用名称
      mountPath: /cache # 容器上的路径，不存在则会自动创建
      #readOnly:true # 是否只读，默认false
  volumes: # 定义pod级别的存储卷
  - name: emptydir # 定义名称
    #emptyDir: {} # 定义存储卷类型为emptyDir，{}表示使用默认值
    emptyDir:
      medium: Memory # 将内存定义为存储卷使用的空间，默认是使用磁盘作为存储空间
      sizeLimit: 16Mi # 限制使用的最大大小，默认不限制
```

## Test

```bash
#创建
# kubectl apply -f test-emptydir.yaml
pod/test-emptydir created


#进入容器中并创建测试文件
# kubectl exec -it test-emptydir -- bash
nginx@test-emptydir:/$ echo 'hello k8s!' > /cache/test.txt



#查看pod被创建到哪个节点
# kubectl get pod -o wide 
NAME        READY   STATUS        RESTARTS   AGE     IP           NODE         NOMINATED NODE   READINESS GATES
...
test-pod    1/1     Running       0          6m25s   10.10.1.26   k8s-work-1   <none>           <none>


#来到被创建到的节点查找文件
root@k8s-work-1:~# find / -name test.txt
/var/lib/kubelet/pods/700f49ad-5419-473c-9a98-602ae6fe787b/volumes/kubernetes.io~empty-dir/cache-volume/test.txt
root@k8s-work-1:~# cat /var/lib/kubelet/pods/700f49ad-5419-473c-9a98-602ae6fe787b/volumes/kubernetes.io~empty-dir/cache-volume/test.txt
hello k8s!


#删除容器
# kubectl delete -f test-pod.yaml 
pod "test-pod" deleted


#卷也不复存在
root@k8s-work-1:~# cat /var/lib/kubelet/pods/700f49ad-5419-473c-9a98-602ae6fe787b/volumes/kubernetes.io~empty-dir/cache-volume/test.txt
cat: /var/lib/kubelet/pods/700f49ad-5419-473c-9a98-602ae6fe787b/volumes/kubernetes.io~empty-dir/cache-volume/test.txt: No such file or directory
```







# emptyDir Example - 2

## yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volumes-emptydir-demo
  namespace: default
spec:
  initContainers:
  - name: config-file-downloader
    image: ikubernetes/admin-box
    imagePullPolicy: IfNotPresent
    command: ['/bin/sh','-c','wget -O /data/envoy.yaml http://ilinux.io/envoy.yaml']
    volumeMounts: # 2：在初始化容器中挂载存储卷，此时从上面command中下载的envoy.yaml文件会被复制到存储卷中
    - name: config-file-storey
      mountPath: /data
  containers:
  - name: envoy
    image: envoyproxy/envoy-alpine:v1.13.1
    command: ['/bin/sh','-c']
    args: ['envoy -c /etc/envoy/envoy.yaml']
    volumeMounts: # 3：在主容器中挂载存储卷，因为初始化容器中事先挂载了存储卷，并且已经把envoy.yaml文件写入到了存储卷中，所以可以直接调用
    - name: config-file-store
      mountPath: /etc/envoy
      readOnly: true
  volumes: # 1：定义存储卷
  - name: config-file-store
    emptyDir:
      medium: Memory
      sizeLimit: 16Mi
```





# ---

# 通过 emptyDir 实现临时 Pod 中多个容器间数据共享

## yaml

- hsdir-sniper.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hsdir-sniper
  namespace: test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hsdir-sniper
  template:
    metadata:
      labels:
        app: hsdir-sniper
    spec:
      containers:
      - name: hsdir-sniper-bot
        image: 172.16.0.120:30002/hsdirsniper/hsdir_sniper_bot@sha256:f2495d6b108168b381c4a74a34e6e6174683f0e4ba9cbf317e86cbb8aaddff47
        imagePullPolicy: IfNotPresent
        command:
          - /bin/bash
        args:
          - '-c'
          - /root/hsdir_sniper/script/start_nsq_listen.sh && service cron start && tail -f /dev/null
        volumeMounts:
          - name: shared-data
            mountPath: /opt
      - name: logger-processor
        image: 172.16.0.120:30002/example-middleware/logger-processor@sha256:4d9c407e0966d849fb5301f73990a9927058fed45cb4b7a126b09b298b5326ec
        imagePullPolicy: IfNotPresent
        command:
          - /bin/bash
        args:
          - '-c'
          - tail -f /dev/null
        volumeMounts:
          - name: shared-data
            mountPath: /opt
      volumes:
        - name: shared-data
          emptyDir: {}
```

## 验证

- 进入第一个容器创建文件

```sh
# kubectl exec -it -n test hsdir-sniper-cccb75c6c-w5gvp -c hsdir-sniper-bot -- bash

# touch /opt/a.txt
```

- 进入第二个容器查看

```sh
# kubectl exec -it -n test hsdir-sniper-cccb75c6c-w5gvp -c logger-processor -- bash

# ls /opt/
a.txt
```



## 实际应用 yaml

- hsdir-sniper.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hsdir-sniper
  namespace: test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hsdir-sniper
  template:
    metadata:
      labels:
        app: hsdir-sniper
    spec:
      containers:
      - name: hsdir-sniper-bot
        image: 172.16.0.120:30002/hsdirsniper/hsdir_sniper_bot@sha256:f2495d6b108168b381c4a74a34e6e6174683f0e4ba9cbf317e86cbb8aaddff47
        imagePullPolicy: IfNotPresent
        command:
          - /bin/bash
        args:
          - '-c'
          - /root/hsdir_sniper/script/start_nsq_listen.sh && service cron start && tail -f /dev/null
        volumeMounts:
          - name: hsdir-sniper-log
            mountPath: /root/hsdir_sniper/logfile/ # 
      - name: logger-processor
        image: 172.16.0.120:30002/example-middleware/logger-processor@sha256:4d9c407e0966d849fb5301f73990a9927058fed45cb4b7a126b09b298b5326ec
        imagePullPolicy: IfNotPresent
        command:
          - /bin/bash
        args:
          - '-c'
          - tail -f /dev/null
        volumeMounts:
          - name: hsdir-sniper-log
            mountPath: /root/hsdir_sniper/logfile/ # 
      volumes:
        - name: hsdir-sniper-log # 
          emptyDir: {}
```









```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hsdir-sniper
  namespace: test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hsdir-sniper
  template:
    metadata:
      labels:
        app: hsdir-sniper
    spec:
      containers:
      - name: hsdir-sniper-bot
        image: ...
        volumeMounts:
          - name: hsdir-sniper-log
            mountPath: /root/hsdir_sniper/logfile/ # 
      - name: logger-processor
        image: ...
        volumeMounts:
          - name: hsdir-sniper-log
            mountPath: /root/hsdir_sniper/logfile/ # 
      volumes:
        - name: hsdir-sniper-log # 
          emptyDir: {}
```



```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hsdir-sniper
  namespace: test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hsdir-sniper
  template:
    metadata:
      labels:
        app: hsdir-sniper
    spec:
      containers:
      - name: hsdir-sniper-bot
        image: ...
        volumeMounts:
          - name: torrc
            mountPath: /root/hsdir_sniper/logfile/ # 
      - name: logger-processor
        image: ...
        volumeMounts:
          - name: torrc
            mountPath: /root/hsdir_sniper/logfile/ # 
      volumes:
        - name: torrc # 
          emptyDir: {}
```





