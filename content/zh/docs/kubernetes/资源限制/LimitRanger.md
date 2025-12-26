---
title: "LimitRanger"
weight: 10
---

# LimitRanger 概述

https://k8s-docs.netlify.app/en/docs/concepts/policy/limit-range

- LimitRanger，名称空间级资源限制

- LimitRanger 可以为 Pod、container、PVC等在没有设定默认资源限制时为其设定默认值，也可以设定其资源使用的范围区间，以避免应用占用过多的系统资源。





# LimitRanger Explain

- **max 和 min** 指的是创建的对象所使用的资源必须在此范围之间

- **default 和 defaultRequest** 只有在未对创建的对象所使用资源加以限制时才会生效

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: core-resource-limits
  namespace: dev # 对dev名称空间内的资源使用加以限制
spec:
  limits <[]Object> -required- # 对象列表格式，可以设定多个限制的资源对象
    type	<string> -required- # 针对哪些资源类型设定限制，可以为Pod、Container、PersistentVolumeClaim
    default <map[string]string> # 创建资源时，如未对使用资源加以限制，则使用此默认值（最大使用量）
    defaultRequest <map[string]string> # 创建资源时，如未对使用资源加以限制，则使用此默认值（初始请求量）
    max <map[string]string> # 创建资源时，最大使用的资源范围
    min <map[string]string> # 创建资源时，最小使用的资源范围
    maxLimitRequestRatio <map[string]string> # max和min两者定义的值 不能大于相差的比例
```



## Pod

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: core-resource-limits
  namespace: dev # 对dev名称空间内的资源使用加以限制
spec:
  limits:
    - type: Pod # 对Pod加以限制
      max: # 创建Pod时，最大使用的cpu和内存资源范围
        cpu: "4" 
        memory: "4Gi" 
      min: # 创建Pod时，最小使用的cpu和内存资源范围
        cpu: "500m" 
        memory: "16Mi" 
```

### 验证

```yaml
# kubectl describe limitranges -n dev
Name:       core-resource-limits
Namespace:  dev
Type        Resource  Min   Max  Default Request  Default Limit  Max Limit/Request Ratio
----        --------  ---   ---  ---------------  -------------  -----------------------
Pod         cpu       500m  4    -                -              -
Pod         memory    16Mi  4Gi  -                -              -

---------------------------------

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

# 因未cpu和memory最低资源需求，所以报错
# kubectl apply -f demoapp.yaml 
Error from server (Forbidden): error when creating "demoapp.yaml": pods "demoapp" is forbidden: [minimum memory usage per Pod is 16Mi.  No request is specified, minimum cpu usage per Pod is 500m.  No request is specified, maximum memory usage per Pod is 4Gi.  No limit is specified, maximum cpu usage per Pod is 4.  No limit is specified]


---------------------------------

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
    resources:
      requests:
        cpu: "600m"
        memory: "64Mi"
      limits:
        cpu: "5"
        memory: "5Gi"

# 虽然满足了cpu和memory最低资源需求，但超出了max限制，因此报错
# kubectl apply -f demoapp.yaml 
Error from server (Forbidden): error when creating "demoapp.yaml": pods "demoapp" is forbidden: [maximum cpu usage per Pod is 4, but limit is 5, maximum memory usage per Pod is 4Gi, but limit is 5368709120]



---------------------------------


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
    resources:
      requests:
        cpu: "1"
        memory: "1Gi"
      limits:
        cpu: "2"
        memory: "2Gi"

# 合理范围内不会报错
# kubectl apply -f demoapp.yaml 
pod/demoapp created
```



## Container

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: core-resource-limits
  namespace: dev # 对dev名称空间内的资源使用加以限制
spec:
  limits:
    - type: Container # 对Container加以限制
      max:
        cpu: "4" 
        memory: "1Gi" 
      min:
        cpu: "100m" 
        memory: "4Mi" 
      default: # 创建Container时，如未对使用资源加以限制，则使用此默认值（最大使用量，resources.limits）
        cpu: "2" 
        memory: "512Mi" 
      defaultRequest: # 创建Container时，如未对使用资源加以限制，则使用此默认值（初始请求量，resources.requests）
        cpu: "500m" 
        memory: "64Mi" 
      maxLimitRequestRatio: # max和min两者定义的值 不能大于相差的比例
        cpu: "4" # 表示max和min两者定义相差不能大于4倍，假设requests定义了cpu: "500m"，则limits中定义的cpu不能大于2000m
```

### 验证

```yaml
# kubectl describe limitranges -n dev
Name:       core-resource-limits
Namespace:  dev
Type        Resource  Min   Max  Default Request  Default Limit  Max Limit/Request Ratio
----        --------  ---   ---  ---------------  -------------  -----------------------
Container   cpu       100m  4    500m             2              4
Container   memory    4Mi   1Gi  64Mi             512Mi          -


---------------------------------

# 未定义资源限制
piVersion: v1
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
pod/demoapp created

# kubectl describe pod -n dev demoapp 
Name:         demoapp
Namespace:    dev
...
    # 由LimitRanger生成的默认值：
    Limits:
      cpu:     2
      memory:  512Mi
    Requests:
      cpu:        500m
      memory:     64Mi
...


---------------------------------

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
    resources:
      requests:
        cpu: "0.2" # 最低需求0.2核
        memory: "256Mi"
      limits:
        cpu: "1" # 最大限制1核，高出requests 5倍，超出4倍的限制
        memory: "512Mi"

# 因此报错
# kubectl apply -f demoapp.yaml 
Error from server (Forbidden): error when creating "demoapp.yaml": pods "demoapp" is forbidden: cpu max limit to request ratio per Container is 4, but provided ratio is 5.000000


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
    resources:
      requests:
        cpu: "0.2" # 最低需求0.2核
        memory: "256Mi"
      limits:
        cpu: "0.5" # 最大限制0.5核，高出requests 2.5倍，未超出4倍的限制
        memory: "512Mi"

# 因此不会报错
# kubectl apply -f demoapp.yaml 
pod/demoapp created


# kubectl describe -n dev pod demoapp 
Name:         demoapp
Namespace:    dev
...
    Limits:
      cpu:     500m
      memory:  512Mi
    Requests:
      cpu:        200m
      memory:     256Mi
...
```



## PersistentVolumeClaim

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: core-resource-limits
  namespace: dev # 对dev名称空间内的资源使用加以限制
spec:
  limits:
    - type: PersistentVolumeClaim # 对PVC加以限制
      max: # 不能申请超过10G的PV
        storage: "10Gi"
      min: # 不能申请低于1G的PV
        storage: "1Gi"
      default: # 默认不能申请超过5G的PV
        storage: "5Gi"
      defaultRequest: # 默认申请1G的PV
        storage: "1Gi"
      maxLimitRequestRatio: # 请求和限制不能相差5倍
        storage: "5" 
```



# LimitRanger Example-1

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: core-resource-limits
  namespace: dev # 对dev名称空间内的资源使用加以限制
spec:
  limits:
    - type: Pod # 对Pod加以限制
      max: # 创建Pod时，最大使用的cpu和内存资源范围
        cpu: "4" 
        memory: "4Gi" 
      min: # 创建Pod时，最小使用的cpu和内存资源范围
        cpu: "500m" 
        memory: "16Mi" 
    - type: Container # 对Container加以限制
      max:
        cpu: "4" 
        memory: "1Gi" 
      min:
        cpu: "100m" 
        memory: "4Mi" 
      default: # 创建Container时，如未对使用资源加以限制，则使用此默认值（最大使用量）
        cpu: "2" 
        memory: "512Mi" 
      defaultRequest: # 创建Container时，如未对使用资源加以限制，则使用此默认值（初始请求量）
        cpu: "500m" 
        memory: "64Mi" 
      maxLimitRequestRatio: # max和min两者定义的值 不能大于相差的比例
        cpu: "4" # 表示max和min两者定义相差不能大于4倍，假设requests定义了cpu: "500m"，则limits中定义的cpu不能大于2000m
    - type: PersistentVolumeClaim # 对PVC加以限制
      max:
        storage: "10Gi"
      min:
        storage: "1Gi"
      default:
        storage: "5Gi"
      defaultRequest:
        storage: "1Gi"
      maxLimitRequestRatio:
        storage: "5" 
```

