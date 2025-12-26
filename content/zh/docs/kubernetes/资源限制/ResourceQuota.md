---
title: "ResourceQuota"
weight: 10
---

# ResourceQuota 概述

- ResourceQuota，名称空间级资源限制，可限制名称空间中处于**非终止状态的**所有Pod对象的计算资源需求及计算资源限制总量。
- ResourceQuota 资源还支持为本地名称空间中的PVC存储资源的需求总量和限制总量提供限额，它能够分别从名称空间中的全部PVC、隶属于特定存储类的PVC以及基于本地临时存储的PVC三个类别分别进行定义。
  - 本地临时存储的PVC就是local存储卷

PS：

ResourceQuota 主要是用于**限制每个命名空间中的资源使用情况**，包括 CPU、内存、存储等。它**并不直接限制节点上 Pod 的数量。**而限制的是名称空间的Pod数量




# ResourceQuota Explain

- **总量限额：名称空间内所有pod、PVC等资源加在一起总共的资源限制**


```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: resourcequota-demo
  namespace: dev # 限制的名称空间
spec:
  hard: # 定义硬限制，硬限制表示必须在一定范围内，与其对应的有软限制，软限制表示允许在一定宽限期内超出范围 超过宽限期后即被删除
    pods: "5" # 最多创建5个pod
    # 自v1.9版本起开始支持以count/<resource>.<group>的格式支持对所有资源类型对象的计数配额，例如count/deployments.apps、count/deployments.extensions和 count/services等。
    count/services: "5" # 最多创建5个service，核心v1群组无需指定后缀
    count/configmaps: "5"
    count/secrets: "5"
    count/deployments.apps: "2" # 最多创建2个deployments，特定群组需指定后缀.apps
    count/statefulsets.apps: "2"
    count/cronjobs.batch: "2"
    # requests和limits的总量限额：
    requests.cpu: "2" # CPU资源相关请求的总量限额；
    requests.memory: "4Gi" # 内存资源相关请求的总量限额；
    limits.cpu: "4" # CPU资源相关限制的总量限额；
    limits.memory: "8Gi" # 内存资源相关限制的总量限额；
    # PVC的总量限额：
    persistentvolumeclaims: "6" # 可以创建的PVC总数限额；数量限制；
    requests.storage: "20Gi" # 所有PVC存储需求的总量限额；空间限制；
    # <storage-class-name>.storageclass.storage.k8s.io/requests.storage：特定的存储类上可使用的所有PVC存储需求的总量限额：
    longhorn.storageclass.storage.k8s.io/requests.storage: "20Gi"
    # <storage-class-name>.storageclass.storage.k8s.io/persistentvolumeclaims：特定的存储类上可使用的PVC总数限额；
    longhorn.storageclass.storage.k8s.io/persistentvolumeclaims: "6"

    #requests.ephemeral-storage：所有Pod可以使用的本地临时存储资源的requets总量；
    #limits.ephemeral-storage：所有Pod可用的本地临时存储资源的limits总量。
```

## 注意事项

- **注意：只要定义了限额就必须在Pod中定义对应的限制，否则会报错**
- 例如：定义了 requests.cpu 后在创建Pod时也必须指定 requests.cpu

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: dev
spec:
  containers:
  - name: demo
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent

# kubectl apply -f demoapp.yaml 
Error from server (Forbidden): error when creating "demoapp.yaml": pods "demoapp" is forbidden: failed quota: resourcequota-demo: must specify requests.cpu
```



# ResourceQuota Example

## pods

### yaml

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: resourcequota-demo
  namespace: dev
spec:
  hard:
    pods: "5" # 最多创建5个pod
```

### 验证

```yaml
# kubectl get resourcequotas -n dev
NAME                 AGE   REQUEST     LIMIT
resourcequota-demo   10s   pods: 0/5   
# kubectl describe resourcequotas -n dev
Name:       resourcequota-demo
Namespace:  dev
Resource    Used  Hard
--------    ----  ----
pods        0     5



# kubectl run demoapp01 --image=nginx:alpine -n dev
pod/demoapp01 created
# kubectl describe resourcequotas -n dev
Name:       resourcequota-demo
Namespace:  dev
Resource    Used  Hard
--------    ----  ----
pods        1     5


# 超出限制的数量后Pod将无法创建
# for i in `echo {2..6}` ; do kubectl run "demoapp0${i}" --image=nginx:alpine -n dev ; done
pod/demoapp02 created
pod/demoapp03 created
pod/demoapp04 created
pod/demoapp05 created
Error from server (Forbidden): pods "demoapp06" is forbidden: exceeded quota: resourcequota-demo, requested: pods=1, used: pods=5, limited: pods=5


# kubectl describe resourcequotas -n dev
Name:       resourcequota-demo
Namespace:  dev
Resource    Used  Hard
--------    ----  ----
pods        5     5
```





## services

### yaml

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: resourcequota-demo
  namespace: dev
spec:
  hard:
    count/services: "5" # 最多创建5个service，核心v1群组无需指定后缀
```

### 验证

```yaml
# kubectl apply -f resourcequota-demo.yaml 
resourcequota/resourcequota-demo configured

# 在之前定义的基础上指定会以当前配置为准（之前定义了限制创建5个pod，但此次yaml清单中只限制了services数量，则之前限制的pod数量会被删除）
# kubectl describe resourcequotas -n dev
Name:           resourcequota-demo
Namespace:      dev
Resource        Used  Hard
--------        ----  ----
count/services  0     5


# kubectl create service clusterip demosvc01 --tcp=80:80 -n dev
service/demosvc01 created

# kubectl describe resourcequotas -n dev
Name:           resourcequota-demo
Namespace:      dev
Resource        Used  Hard
--------        ----  ----
count/services  1     5


# 超出限制的数量后services将无法创建
# for i in `echo {2..6}` ; do kubectl create service clusterip "demosvc0${i}" --tcp=80:80  -n dev ; done
service/demosvc02 created
service/demosvc03 created
service/demosvc04 created
service/demosvc05 created
error: failed to create ClusterIP service: services "demosvc06" is forbidden: exceeded quota: resourcequota-demo, requested: count/services=1, used: count/services=5, limited: count/services=5



# kubectl describe resourcequotas -n dev
Name:           resourcequota-demo
Namespace:      dev
Resource        Used  Hard
--------        ----  ----
count/services  5     5
```



## deployments

### yaml

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: resourcequota-demo
  namespace: dev
spec:
  hard:
    count/deployments.apps: "2" # 最多创建2个deployments，特定群组需指定后缀.apps
```

### 验证

```yaml
# kubectl apply -f resourcequota-demo.yaml 
resourcequota/resourcequota-demo configured


# kubectl describe resourcequotas -n dev
Name:                   resourcequota-demo
Namespace:              dev
Resource                Used  Hard
--------                ----  ----
count/deployments.apps  0     2



# kubectl create deployment deploy01 --image=nginx:apline -n dev
deployment.apps/deploy01 created
# kubectl describe resourcequotas -n dev
Name:                   resourcequota-demo
Namespace:              dev
Resource                Used  Hard
--------                ----  ----
count/deployments.apps  1     2


# kubectl create deployment deploy02 --image=nginx:apline -n dev
deployment.apps/deploy02 created
# kubectl describe resourcequotas -n dev
Name:                   resourcequota-demo
Namespace:              dev
Resource                Used  Hard
--------                ----  ----
count/deployments.apps  2     2


# 超出限制的数量后deployment将无法创建
# kubectl create deployment deploy03 --image=nginx:apline -n dev
error: failed to create deployment: deployments.apps "deploy03" is forbidden: exceeded quota: resourcequota-demo, requested: count/deployments.apps=1, used: count/deployments.apps=2, limited: count/deployments.apps=2
```



## requests.cpu

### yaml

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: resourcequota-demo
  namespace: dev
spec:
  hard:
    requests.cpu: "2" # CPU资源相关请求的总量限额；
```

### 验证

```yaml
# kubectl describe resourcequotas -n dev
Name:         resourcequota-demo
Namespace:    dev
Resource      Used  Hard
--------      ----  ----
requests.cpu  0     2


# vim demoapp01.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp01
  namespace: dev
spec:
  containers:
  - name: demo
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
    resources:
      requests:
        cpu: "0.5"
# kubectl apply -f demoapp01.yaml 
pod/demoapp01 created
# kubectl describe resourcequotas -n dev
Name:         resourcequota-demo
Namespace:    dev
Resource      Used  Hard
--------      ----  ----
requests.cpu  500m  2


# vim demoapp02.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp02
  namespace: dev
spec:
  containers:
  - name: demo
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
    resources:
      requests:
        cpu: "1"
# kubectl apply -f demoapp02.yaml 
pod/demoapp02 created
# kubectl describe resourcequotas -n dev
Name:         resourcequota-demo
Namespace:    dev
Resource      Used   Hard
--------      ----   ----
requests.cpu  1500m  2 # 限制配额会累加
# kubectl get pod -n dev
NAME        READY   STATUS    RESTARTS   AGE
demoapp01   1/1     Running   0          5m39s
demoapp02   1/1     Running   0          3m56s



# vim demoapp03.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp03
  namespace: dev
spec:
  containers:
  - name: demo
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
    resources:
      requests:
        cpu: "1" # 上面已经使用了1.5个cpu，而限制是最多使用2个cpu，1.5+1=2.5 显然已经超出范围，因此会报以下错误：
# kubectl apply -f demoapp03.yaml 
Error from server (Forbidden): error when creating "demoapp.yaml": pods "demoapp03" is forbidden: exceeded quota: resourcequota-demo, requested: requests.cpu=1, used: requests.cpu=1500m, limited: requests.cpu=2
```



# ---



# 限制每个节点运行的Pod数量

要限制每个节点运行的 Pod 数量，可以使用 Kubernetes 的调度器策略。

Kubernetes 的调度器策略可以通过资源配额（ResourceQuota）或调度器策略（SchedulerPolicy）来实现

## ResourceQuota

使用 ResourceQuota 可以实现在命名空间级别限制每个节点运行的 Pod 数量。下面是实现的步骤：

1. 创建一个命名空间：

```sh
kubectl create namespace my-namespace
```

1. 创建一个 ResourceQuota 对象，限制每个节点运行的 Pod 数量为 2：

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: my-resource-quota
  namespace: my-namespace
spec:
  hard:
    pods: "2"
```

1. 将 ResourceQuota 对象绑定到命名空间上：

```sh
kubectl apply -f my-resource-quota.yaml
```

上述配置会将 `my-resource-quota` ResourceQuota 对象绑定到 `my-namespace` 命名空间上，并且**限制了该命名空间中每个节点能够运行的 Pod 的数量**？？？。如果在该命名空间中运行的 Pod 数量超出了限制，就会被阻止调度到该节点上。

需要注意的是，ResourceQuota 可以限制的资源不仅包括 Pod 数量，还包括 CPU、内存等资源，可以根据需求设置不同的限制。

## SchedulerPolicy

调度器策略可以更加灵活地控制 Pod 的调度行为，可以在节点级别或者命名空间级别进行设置。

以下是在节点级别设置调度器策略的步骤：

1. 创建一个调度器策略 ConfigMap，命名为 `scheduler-policy-config`，在这个 ConfigMap 中设置 Pod 限制的规则，例如：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: scheduler-policy-config
data:
  policy.cfg: |
    {
      "kind": "Policy",
      "apiVersion": "v1",
      "predicates": [
        {
          "name": "MaxPodsNumber",
          "argument": {
            "maxPodsNumber": "2"
          }
        }
      ]
    }
```

上面的规则设置了每个节点最多只能运行 2 个 Pod。

1. 创建一个调度器策略配置文件，命名为 `scheduler-policy.json`，指定上面创建的 ConfigMap 的名称和命名空间：

```json
{
  "kind": "Policy",
  "apiVersion": "v1",
  "policy": {
    "name": "scheduler-policy",
    "namespace": "default",
    "configMap": "scheduler-policy-config"
  }
}
```

1. 创建一个调度器策略对象：

```sh
kubectl create -f scheduler-policy.json
```

1. 将这个调度器策略绑定到所有节点上：

```sh
kubectl label nodes --all scheduler=default-scheduler
```

以上步骤将会将调度器策略绑定到所有节点上，并在每个节点上运行默认的调度器。在这个调度器策略的规则中，每个节点只能运行 2 个 Pod，如果超过了这个数量，新的 Pod 将会被调度到其他节点上。
