---
title: "downwardAPI"
weight: 10
---

# downwardAPI 概述

https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/downward-api/

- downwardAPI从严格意义上来说不是存储卷，因为它**引用的是Pod自身的运行环境信息**，这些信息在Pod启动后就存在。

- downwardAPI类似于ConfigMap或Secret资源，容器能够在环境变量中在valueFrom字段中嵌套fieldRef或resourceFieldRef字段来引用其所属Pod对象的元数据信息。不过，通常只有常量类型的属性才能够通过环境变量注入到容器中，毕竟，在进程启动完成后无法再向其告知变量值的变动，于是，环境变量也就不支持中途的更新操作。

- 容器规范中可在环境变量配置中的valueFrom通过内嵌字段fieldRef引用的信息包括如下这些：

  - ```sh
    metadata.name # Pod对象的名称； 
    metadata.namespace # Pod对象隶属的名称空间； 
    metadata.uid # Pod对象的UID； 
    metadata.labels['<KEY>'] # Pod对象标签中的指定键的值，例如metadata.labels['mylabel']，仅Kubernetes 1.9及之后的版本才支持；
    metadata.annotations['<KEY>'] # Pod对象注解信息中的指定键的值，仅Kubernetes 1.9及之后的版本才支持。
    ```

- 容器上的计算资源需求和资源限制相关的信息，以及临时存储资源需求和资源限制相关的信息可通过容器规范中的resourceFieldRef字段引用，相关字段包括requests.cpu、limits.cpu、requests.memory和limits.memory等。另外，可通过环境变量引用的信息有如下几个：

  - ```sh
    status.podIP # Pod对象的IP地址
    spec.serviceAccountName # Pod对象使用的ServiceAccount资源名称
    spec.nodeName # 节点名称
    status.hostIP # 节点IP地址
    ```

- 另外，还可以通过resourceFieldRef字段引用当前容器的资源请求及资源限额的定义，因此它们包括requests.cpu、requests.memory、requests.ephemeral-storage、limits.cpu、limits.memory和limits.ephemeral-storage这6项。





# downwardAPI Example

- 在 env.valueFrom 中通过 `fieldRef`  或 `` 来获取相关的信息，详参官方文档

## 通过环境变量暴露

### yaml

- `fieldRef`  从pod定义中的一般字段获取数据，`resourceFieldRef` 从pod定义中的资源限制获取数据。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: downwardapi-env-demo
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.23.0-alpine
      resources:
        requests:
          memory: "32Mi"
          cpu: "250m"
        limits:
          memory: "64Mi"
          cpu: "500m"
      env:
        - name: THIS_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: THIS_POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: THIS_APP_LABEL
          valueFrom:
            fieldRef:
              fieldPath: metadata.labels['app'] # 选labels中app这个下标
        - name: THIS_CPU_LIMIT
          valueFrom:
            resourceFieldRef:
              resource: limits.cpu
        - name: THIS_MEM_REQUEST
          valueFrom:
            resourceFieldRef:
              resource: requests.memory
              divisor: 1Mi # 以M作为计量单位，否则将以字节显示
```

### 验证

```yaml
# kubectl exec -it downwardapi-env-demo -- sh
/ # env
...
THIS_CPU_LIMIT=1 # cpu会取整数信息
THIS_APP_LABEL=nginx
THIS_MEM_REQUEST=32
THIS_POD_NAME=downwardapi-env-demo
THIS_POD_NAMESPACE=default
...
```



## 通过存储卷文件暴露

### yaml

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: downwardapi-volume-demo
  labels:
    zone: zone1
    rack: rack100
    app: demoapp
  annotations:
    region: ease-cn
spec:
  containers:
    - name: demoapp
      image: ikubernetes/demoapp:v1.0
      resources:
        requests:
          memory: "32Mi"
          cpu: "250m"
        limits:
          memory: "64Mi"
          cpu: "500m"
      volumeMounts:
      - name: podinfo
        mountPath: /etc/podinfo
        readOnly: false
  volumes:
  - name: podinfo
    downwardAPI:
      defaultMode: 420
      items:
      - fieldRef:
          fieldPath: metadata.namespace
        path: pod_namespace
      - fieldRef:
          fieldPath: metadata.labels
        path: pod_labels
      - fieldRef:
          fieldPath: metadata.annotations
        path: pod_annotations
      - resourceFieldRef:
          containerName: demoapp
          resource: limits.cpu
        path: "cpu_limit"
      - resourceFieldRef:
          containerName: demoapp
          resource: requests.memory
          divisor: "1Mi"
        path: "mem_request"
```

### 验证

```bash
# kubectl exec -it downwardapi-volume-demo -- sh


# 仍然以软连接形式创建
[root@downwardapi-volume-demo ~]# ls -l /etc/podinfo/
total 0
lrwxrwxrwx    1 root     root            16 Sep 20 10:23 cpu_limit -> ..data/cpu_limit
lrwxrwxrwx    1 root     root            18 Sep 20 10:23 mem_request -> ..data/mem_request
lrwxrwxrwx    1 root     root            22 Sep 20 10:23 pod_annotations -> ..data/pod_annotations
lrwxrwxrwx    1 root     root            17 Sep 20 10:23 pod_labels -> ..data/pod_labels
lrwxrwxrwx    1 root     root            20 Sep 20 10:23 pod_namespace -> ..data/pod_namespace


[root@downwardapi-volume-demo ~]# cat /etc/podinfo/cpu_limit 
1
# cat /etc/podinfo/mem_request 
32
# cat /etc/podinfo/pod_labels 
app="demoapp"
rack="rack100"
```



## 实现 nginx 配置文件动态修改

### 实现前

默认 pod 中获取的是宿主机实际 cpu 的数量

- ```bash
  # echo $THIS_CPU_LIMIT
  1
  
  / # cat /proc/cpuinfo | grep processor
  processor	: 0
  processor	: 1
  
  / # ps aux
  PID   USER     TIME  COMMAND
      1 root      0:00 nginx: master process nginx -g daemon off;
     31 nginx     0:00 nginx: worker process
     32 nginx     0:00 nginx: worker process
     33 root      0:00 sh
     41 root      0:00 ps aux
  
  
  / # cat /etc/nginx/nginx.conf 
  ...
  user  nginx;
  worker_processes  auto;
  ...
  ```



### 方法一

- 通过 downwardapi 获取 pod 实际使用的 cpu 数量，然后再 configmap 调取 downwardapi 定义的变量从而达成模板
- confmap-downwardapi-nginx.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-confs
data:
  nginx.conf: |
    user  nginx;
    worker_processes  ${THIS_CPU_LIMIT};

    error_log  /var/log/nginx/error.log notice;
    pid        /var/run/nginx.pid;


    events {
        worker_connections  1024;
    }


    http {
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;

        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                          '$status $body_bytes_sent "$http_referer" '
                          '"$http_user_agent" "$http_x_forwarded_for"';

        access_log  /var/log/nginx/access.log  main;

        sendfile        on;
        #tcp_nopush     on;

        keepalive_timeout  65;

        #gzip  on;

        include /etc/nginx/conf.d/*.conf;
    }
---
apiVersion: v1
kind: Pod
metadata:
  name: confmap-downwardapi-nginx
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.23.0-alpine
      resources:
        requests:
          memory: "32Mi"
          cpu: "250m"
        limits:
          memory: "64Mi"
          cpu: "500m"
      env:
        - name: THIS_CPU_LIMIT
          valueFrom:
            resourceFieldRef:
              resource: limits.cpu
      volumeMounts:
        - name: nginx-confs
          mountPath: /opt/
  volumes:
  - name: nginx-confs
    configMap:
      name: nginx-confs
      items:
        - key: nginx.conf
          path: nginx.conf
```

#### problem

- 测试发现configmap中无法实现变量值对配置文件的替换

  - ```sh
    / # cat /etc/nginx/nginx.conf 
    
    user  nginx;
    worker_processes  ${THIS_CPU_LIMIT};
    ...
    ```

    



### 方法二

- 利用启动后钩子执行sed命令修改
- downwardapi-env-nginx.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: downwardapi-nginx-env
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.23.0-alpine
      resources:
        requests:
          memory: "32Mi"
          cpu: "250m"
        limits:
          memory: "64Mi"
          cpu: "500m"
      env:
        - name: THIS_CPU_LIMIT
          valueFrom:
            resourceFieldRef:
              resource: limits.cpu
      lifecycle:
        postStart:
          exec:
            command:
              - /bin/sed 
              - -ri
              - "s|^worker_processes.*|worker_processes  ${THIS_CPU_LIMIT};|"
              - /etc/nginx/nginx.conf
```



#### problem

- 测试发现 lifecycle.postStart 执行命令无法实现变量值对配置文件的替换


- ```sh
  / # cat /etc/nginx/nginx.conf 
  
  user  nginx;
  worker_processes  ${THIS_CPU_LIMIT};
  ...
  ```

- 创建文件方式也无法完成修改

- ```sh
  # vim downwardapi-env-nginx.yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: downwardapi-nginx-env
    labels:
      app: nginx
  spec:
    containers:
      - name: nginx
        image: nginx:1.23.0-alpine
        resources:
          requests:
            memory: "32Mi"
            cpu: "250m"
          limits:
            memory: "64Mi"
            cpu: "500m"
        env:
          - name: THIS_CPU_LIMIT
            valueFrom:
              resourceFieldRef:
                resource: limits.cpu
        lifecycle:
          postStart:
            exec:
              command:
                - touch
                - /${THIS_CPU_LIMIT}.abc
  
  
  
  # kubectl exec downwardapi-nginx-env -it -- sh
  / # ls /
  ${THIS_CPU_LIMIT}.abc
  ```

  
