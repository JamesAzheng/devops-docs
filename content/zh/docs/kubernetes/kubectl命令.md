---
title: "kubectl 命令"
---

# kubectl 概述

kubectl 是一个用于管理 k8s 集群的工具

https://kubernetes.io/zh-cn/docs/reference/kubectl/docker-cli-to-kubectl/

https://kubernetes.io/zh-cn/docs/reference/kubectl/cheatsheet/

实现自动 tab 键补全：

```bash
kubectl completion bash >> /etc/profile.d/kubectl_completion.sh
. /etc/profile.d/kubectl_completion.sh
```



# ---

# create

## token

`kubectl create token`命令用于在Kubernetes集群中创建一个新的认证令牌（Token）。这个令牌通常用于对Kubernetes API进行身份验证和授权，以便访问和管理集群资源。

该命令的用法如下：

```bash
kubectl create token NAME [--type=string] [--groups=string] [--service-account=string] [--expire-after=duration] [--kubeconfig=kubeconfig]
```

- `NAME`: 新创建的令牌的名称。
- `--type`: 令牌类型，可以是 `service-account-token` 或 `bootstrap-token`.
- `--groups`: 令牌所属的组，这个参数可以有多个值，使用逗号分隔。
- `--service-account`: 如果指定，令牌将与该服务账户关联。
- `--expire-after`: 指定令牌的过期时间，可以是一个持续时间字符串（如"1h"表示1小时，"24h"表示24小时），默认是"24h"。
- `--kubeconfig`: 指定要使用的 kubeconfig 文件。

例如，要创建一个名为`my-token`的新令牌，它属于`admin`组，并且在1小时后过期，可以执行以下命令：

```bash
kubectl create token my-token --groups=admin --expire-after=1h
```

需要注意的是，创建令牌需要具有足够的权限。通常，只有具有足够权限的用户或服务账户才能够执行此操作。



```
kubectl create token dashboard --groups=admin --expire-after=1h
```



# ---









# Cluster

# cluster-info

- 获取一些集群的简要信息，如：一般服务的访问方式等，最后加上 dump 可以进入 debug

```bash
# kubectl cluster-info 
Kubernetes control plane is running at https://10.0.0.100:6443
CoreDNS is running at https://10.0.0.100:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```



# top

- 打印 node 或 pod 的资源使用量
- 依赖 metrics-server，否则将报 `error: Metrics API not available`

```bash
# kubectl top 
Display Resource (CPU/Memory) usage.

 The top command allows you to see the resource consumption for nodes or pods.

 This command requires Metrics Server to be correctly configured and working on the server.

Available Commands:
  node          Display resource (CPU/memory) usage of nodes
  pod           Display resource (CPU/memory) usage of pods

Usage:
  kubectl top [flags] [options]
```

**metrics-server 部署：**

- https://github.com/kubernetes-sigs/metrics-server

```yaml
      - args:
...
        - --kubelet-insecure-tls # 禁用证书验证
       # 镜像源改为国内 
        image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/metrics-server:v0.6.4
...
```



# version

- 打印当前上下文的客户端和服务器版本信息。

```bash
Usage:
  kubectl version [flags] [options]

#短格式输出
kubectl version --short

#yaml格式输出
kubectl version --short --output yaml

#json格式输出
kubectl version --short --output json
```







# Node

## 查看 node

- **查看 node 信息**

```bash
#追加 -A 更多的信息，再追加 -o <wide|json|yaml> 指定格式输出
kubectl get node
```

- **查看 node 更详细的信息**

```bash
kubectl describe node <node_name>
```









# Token

**获取目前 token 的简要信息**

```bash
# kubectl get secrets -A
NAMESPACE     NAME                     TYPE                            DATA   AGE
kube-system   bootstrap-token-5nty7g   bootstrap.kubernetes.io/token   7      8h
```

**获取 token 的详细信息**

- 需要指定 NAME 和 NAMESPACE

```bash
# kubectl describe secrets bootstrap-token-5nty7g -n kube-system 
Name:         bootstrap-token-5nty7g
Namespace:    kube-system
Labels:       <none>
Annotations:  <none>

Type:  bootstrap.kubernetes.io/token

Data
====
usage-bootstrap-authentication:  4 bytes
usage-bootstrap-signing:         4 bytes
auth-extra-groups:               47 bytes
description:                     56 bytes
expiration:                      20 bytes
token-id:                        6 bytes
token-secret:                    16 bytes
```





# Api

## api-resources

- 打印服务器上支持的API资源。

### 输出说明

- **NAME**
  - api 名称
- **SHORTNAMES**
  - api 名称简写
- **APIVERSION**
  - api 版本 和 分组
- **NAMESPACED**
  - false 表示不属于 namespace
  - true 表示属于 namespace
- **KIND**
  - 类型，创建 yaml 文件时需要指定

### yaml 文件范例

- 大小写敏感
- namespace 如果未指定则写入默认的 namespace，即default

```yaml
# cat dashboard-account.yaml 
apiVersion: v1 #api版本和分组
kind: ServiceAccount #类型
metadata: #元数据
  name: admin-user
  namespace: kubernetes-dashboard #指定名称空间

---

apiVersion: rbac.authorization.k8s.io/v1 #api版本和分组
kind: ClusterRoleBinding #类型
metadata: #元数据
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io #api分组
  kind: ClusterRole #类型
  name: cluster-admin
subjects:
- kind: ServiceAccount #类型
  name: admin-user
  namespace: kubernetes-dashboard #指定名称空间
```

### 使用方法

```bash
Usage:
  kubectl api-resources [flags] [options]
```



## api-versions

- 以 "group/version" 的形式打印服务器上支持的API版本。

```bash
Usage:
  kubectl api-versions [options]
```



## 通过API查询资源

- 查询namespace

```sh
# kubectl get --raw /api/v1/namespaces/kube-system
{"kind":"Namespace","apiVersion":"v1","metadata":{"name":"kube-system","uid":"4b522ac8-5d28-49bd-aab4-292ec765c136","resourceVersion":"4","creationTimestamp":"2022-09-12T16:02:04Z","labels":{"kubernetes.io/metadata.name":"kube-system"},"managedFields":[{"manager":"kube-apiserver","operation":"Update","apiVersion":"v1","time":"2022-09-12T16:02:04Z","fieldsType":"FieldsV1","fieldsV1":{"f:metadata":{"f:labels":{".":{},"f:kubernetes.io/metadata.name":{}}}}}]},"spec":{"finalizers":["kubernetes"]},"status":{"phase":"Active"}}


# kubectl get --raw /api/v1/namespaces/kube-system | jq .
{
  "kind": "Namespace",
  "apiVersion": "v1",
  "metadata": {
    "name": "kube-system",
    "uid": "4b522ac8-5d28-49bd-aab4-292ec765c136",
    "resourceVersion": "4",
    "creationTimestamp": "2022-09-12T16:02:04Z",
    "labels": {
      "kubernetes.io/metadata.name": "kube-system"
    },
    "managedFields": [
      {
        "manager": "kube-apiserver",
        "operation": "Update",
        "apiVersion": "v1",
        "time": "2022-09-12T16:02:04Z",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:labels": {
              ".": {},
              "f:kubernetes.io/metadata.name": {}
            }
          }
        }
      }
    ]
  },
  "spec": {
    "finalizers": [
      "kubernetes"
    ]
  },
  "status": {
    "phase": "Active"
  }
}


# kubectl get --raw /api/v1/namespaces/kube-system | jq .kind
"Namespace"

# kubectl get --raw /api/v1/namespaces/kube-system | jq .metadata.name
"kube-system"
```



# Container

## Container 相关命令

### 进入指定的容器

- 与docker类似，但使用 kubectl 可以进入所有 node 的 container

```bash
#查看目前所有的 container
kubectl get pods -A

# -n 指定 namespace，-- sh 表示执行的命令
kubectl exec -it net-test1 -n default -- sh
```

### 查看容器中的日志

- 打印pod或指定资源中容器的日志。如果pod只有一个容器，则容器名称为
  可选择的

```bash
Usage:
  kubectl logs [-f] [-p] (POD | TYPE/NAME) [-c CONTAINER] [options]
  
  
#获取pod信息
kubectl get pod -o wide -A
...


#查看日志
kubectl logs -n kubernetes-dashboard dashboard-metrics-scraper-8c47d4b5d-kvrkn -f
...
10.10.1.1 - - [26/Jun/2022:07:12:48 +0000] "GET / HTTP/1.1" 200 6 "" "kube-probe/1.24" 
10.10.0.0 - - [26/Jun/2022:07:12:50 +0000] "GET /healthz HTTP/1.1" 200 13 "" "dashboard/v2.6.0"
10.10.1.1 - - [26/Jun/2022:07:12:58 +0000] "GET / HTTP/1.1" 200 6 "" "kube-probe/1.24"
...
```





# 其他常用命令

```sh
kubectl get all # 获取当前名称空间下的所有资源
```





# run

要通过 `kubectl run` 命令创建 Pod，您需要执行以下命令：

```
kubectl run <pod-name> --image=<image-name>
```

其中 `<pod-name>` 是要创建的 Pod 的名称，`<image-name>` 是要在其中运行的容器映像的名称。

例如，如果要从映像 `nginx` 创建名为 `my-nginx-pod` 的 Pod，您应该运行以下命令：

```
kubectl run my-nginx-pod --image=nginx
```

该命令将创建一个 Pod 并将其命名为 `my-nginx-pod`，其中运行一个从 `nginx` 映像创建的容器。



# scale

要动态调整 Deployment 中的 Pod 副本数，您可以使用 kubectl scale 命令。以下是一些示例命令：

- 将 nginx Deployment 的副本数增加到 4：

```
kubectl scale --replicas=4 deployment/nginx
```

- 降低 nginx Deployment 的副本数到 2 个：

```
kubectl scale --replicas=2 deployment/nginx
```

您还可以使用 kubectl edit 命令来直接编辑 Deployment 的 YAML 文件，以更改 Pod 副本数。在此文件中，您需要找到 replicas 字段并将其值更改为所需的副本数。然后，保存文件并退出编辑器。例如，在编辑 nginx Deployment 的 YAML 文件中，您可以这样做：

```
kubectl edit deployment/nginx
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 4  # 将此值更改为所需的副本数
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.15.12
        ports:
        - containerPort: 80
```



# convert

可以使用`kubectl`命令将YAML文件转换为JSON格式。使用以下命令：

```sh
# 将pod.yaml转换为JSON格式，并将结果保存到pod.json文件中。
kubectl convert -f pod.yaml --output=json > pod.json
```

转换为JSON后，您可以使用`curl`或其他HTTP客户端工具将JSON作为请求体发送给Kubernetes API。





# -o

```sh
# kubectl get ippool --help | grep "\-\-output=''"
  -o, --output='': Output format. One of: json|yaml|name|go-template|go-template-file|template|templatefile|jsonpath|jsonpath-as-json|jsonpath-file|custom-columns-file|custom-columns|wide See custom columns [https://kubernetes.io/docs/reference/kubectl/overview/#custom-columns], golang template [http://golang.org/pkg/text/template/#pkg-overview] and jsonpath template [https://kubernetes.io/docs/reference/kubectl/jsonpath/].
```



## jsonpath

- https://kubernetes.io/zh-cn/docs/reference/kubectl/jsonpath/
- https://github.com/json-path/JsonPath

kubectl是Kubernetes命令行工具，用于与Kubernetes集群进行交互和管理。其中，jsonpath是kubectl中的一个功能，用于从Kubernetes资源的JSON或YAML表示中提取特定字段或值。

使用jsonpath，您可以指定一个路径表达式，该表达式将在资源的JSON或YAML表示中进行导航，并返回匹配该表达式的结果。

下面是一些常见的用法和示例，来详细解释kubectl jsonpath的使用：

1. 提取单个字段的值：

   ```json
   kubectl get <resource> -o jsonpath='{.field}'
   ```

   这将返回指定资源的指定字段的值。例如，要获取Pod的名称，可以使用以下命令：

   ```json
   kubectl get pod <pod-name> -o jsonpath='{.metadata.name}'
   ```

2. 提取多个字段的值：

   ```json
   kubectl get <resource> -o jsonpath='{.field1} {.field2}'
   ```

   使用空格分隔多个字段，可以同时提取多个字段的值。例如，要获取Pod的名称和IP地址，可以使用以下命令：

   ```json
   kubectl get pod <pod-name> -o jsonpath='{.metadata.name} {.status.podIP}'
   ```

3. 使用通配符提取列表中的所有值：

   ```json
   kubectl get <resource> -o jsonpath='{.items[*].field}'
   ```

   这将返回列表中所有资源的指定字段的值。例如，要获取所有Pod的名称，可以使用以下命令：

   ```json
   kubectl get pod -o jsonpath='{.items[*].metadata.name}'
   ```

4. 使用过滤器筛选结果：

   ```json
   kubectl get <resource> -o jsonpath='{.items[?(@.field=="value")].otherField}'
   ```

   使用过滤器可以根据特定条件筛选结果。例如，要获取特定标签的Pod的名称，可以使用以下命令：

   ```json
   kubectl get pod -o jsonpath='{.items[?(@.metadata.labels.app=="my-app")].metadata.name}'
   ```

这只是kubectl jsonpath的一些基本用法和示例。使用jsonpath时，您可以根据自己的需求编写更复杂的表达式来提取所需的数据。您可以查阅kubectl和jsonpath的官方文档，了解更多详细信息和高级用法。





### 范例 - 1

以下是一个示例JSON清单，包含了几个Pod资源的信息：

```json
jsonCopy code{
  "kind": "PodList",
  "apiVersion": "v1",
  "items": [
    {
      "metadata": {
        "name": "pod1",
        "labels": {
          "app": "my-app",
          "env": "production"
        }
      },
      "status": {
        "phase": "Running",
        "podIP": "10.0.0.1"
      }
    },
    {
      "metadata": {
        "name": "pod2",
        "labels": {
          "app": "my-app",
          "env": "development"
        }
      },
      "status": {
        "phase": "Pending",
        "podIP": ""
      }
    },
    {
      "metadata": {
        "name": "pod3",
        "labels": {
          "app": "other-app",
          "env": "production"
        }
      },
      "status": {
        "phase": "Running",
        "podIP": "10.0.0.3"
      }
    }
  ]
}
```

现在，让我们使用不同的jsonpath表达式来过滤和提取特定的信息：

1. 提取所有Pod的名称：

   ```json
   kubectl get podlist -o jsonpath='{.items[*].metadata.name}'
   ```

   输出：`pod1 pod2 pod3`

2. 提取标签`app=my-app`的Pod的名称：

   ```json
   kubectl get podlist -o jsonpath='{.items[?(@.metadata.labels.app=="my-app")].metadata.name}'
   ```

   输出：`pod1 pod2`

3. 提取处于"Running"状态的Pod的名称和IP地址：

   ```json
   kubectl get podlist -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name} {.items[?(@.status.phase=="Running")].status.podIP}'
   ```

   输出：`pod1 10.0.0.1 pod3 10.0.0.3`

这些示例演示了如何使用jsonpath表达式从JSON清单中过滤和提取所需的数据。您可以根据自己的需求编写不同的表达式来进一步定制和筛选结果。



### 范例 - 2

```json
# kubectl get ippool -o json
{
    "apiVersion": "v1",
    "items": [
        {
            "apiVersion": "crd.projectcalico.org/v1",
            "kind": "IPPool",
            "metadata": {
                "annotations": {
                    "projectcalico.org/metadata": "{\"uid\":\"1ba06317-30af-4017-9665-9e47f1f20a62\",\"creationTimestamp\":\"2023-03-21T06:17:28Z\"}"
                },
                "creationTimestamp": "2023-03-21T06:17:28Z",
                "generation": 1,
                "name": "default-ipv4-ippool",
                "resourceVersion": "1281",
                "uid": "e6ffc1cb-c7a3-4236-9dd6-bf7b7fc3ac92"
            },
            "spec": {
                "allowedUses": [
                    "Workload",
                    "Tunnel"
                ],
                "blockSize": 24,
                "cidr": "10.233.64.0/18",
                "ipipMode": "Always",
                "natOutgoing": true,
                "nodeSelector": "all()",
                "vxlanMode": "Never"
            }
        },
        {
            "apiVersion": "crd.projectcalico.org/v1",
            "kind": "IPPool",
            "metadata": {
                "annotations": {
                    "kubectl.kubernetes.io/last-applied-configuration": "{\"apiVersion\":\"crd.projectcalico.org/v1\",\"kind\":\"IPPool\",\"metadata\":{\"annotations\":{},\"name\":\"my.ippool-1\"},\"spec\":{\"allowedUses\":[\"Workload\",\"Tunnel\"],\"cidr\":\"10.200.64.0/24\",\"disabled\":false,\"ipipMode\":\"CrossSubnet\",\"natOutgoing\":true,\"nodeSelector\":\"all()\"}}\n"
                },
                "creationTimestamp": "2023-06-01T08:34:12Z",
                "generation": 1,
                "name": "my.ippool-1",
                "resourceVersion": "25457187",
                "uid": "45682b30-823e-4fd2-8f3f-dd8079b1f023"
            },
            "spec": {
                "allowedUses": [
                    "Workload",
                    "Tunnel"
                ],
                "cidr": "10.200.64.0/24",
                "disabled": false,
                "ipipMode": "CrossSubnet",
                "natOutgoing": true,
                "nodeSelector": "all()"
            }
        }
    ],
    "kind": "List",
    "metadata": {
        "resourceVersion": "",
        "selfLink": ""
    }
}

```

- 过滤 cidr

```sh
# kubectl get ippool -o jsonpath='{.items[*].spec.cidr}' ; echo
10.233.64.0/18 10.200.64.0/24
```



### 范例 - 3

```json
# kubectl get ippool default-ipv4-ippool -o json
{
    "apiVersion": "crd.projectcalico.org/v1",
    "kind": "IPPool",
    "metadata": {
        "annotations": {
            "projectcalico.org/metadata": "{\"uid\":\"1ba06317-30af-4017-9665-9e47f1f20a62\",\"creationTimestamp\":\"2023-03-21T06:17:28Z\"}"
        },
        "creationTimestamp": "2023-03-21T06:17:28Z",
        "generation": 1,
        "name": "default-ipv4-ippool",
        "resourceVersion": "1281",
        "uid": "e6ffc1cb-c7a3-4236-9dd6-bf7b7fc3ac92"
    },
    "spec": {
        "allowedUses": [
            "Workload",
            "Tunnel"
        ],
        "blockSize": 24,
        "cidr": "10.233.64.0/18",
        "ipipMode": "Always",
        "natOutgoing": true,
        "nodeSelector": "all()",
        "vxlanMode": "Never"
    }
}

```

- 过滤 cidr

```sh
# kubectl get ippool default-ipv4-ippool -o jsonpath='{.spec.cidr}' ; echo
10.233.64.0/18
```





# envsubst

- 通过 envsubst，实现动态替换yaml文件中的变量并进行应用

## 替换前

```yaml
# vim demoapp.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: ${IP}
spec:
  cidr: ${IP}/32
  ipipMode: Always
  vxlanMode: Neve
  natOutgoing: true
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel
---
apiVersion: v1
kind: Pod
metadata:
  name: demoapp-${IP}
  namespace: test
  annotations:
    cni.projectcalico.org/ipAddrs: "[\"${IP}\"]"
spec:
  containers:
  - name: middleware
    image: 172.16.0.120:30002/bjhit-middleware/middleware:v1
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

## 替换

```yaml
# IP=1.1.1.1 envsubst < demoapp.yaml 
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: 1.1.1.1
spec:
  cidr: 1.1.1.1/32
  ipipMode: Always
  vxlanMode: Neve
  natOutgoing: true
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel
---
apiVersion: v1
kind: Pod
metadata:
  name: demoapp-1.1.1.1
  namespace: test
  annotations:
    cni.projectcalico.org/ipAddrs: "[\"1.1.1.1\"]"
spec:
  containers:
  - name: middleware
    image: 172.16.0.120:30002/bjhit-middleware/middleware:v1
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

## 应用

- 82.165.118.196
- 109.250.88.232

```yaml
# IP=82.165.118.196 envsubst < demoapp.yaml 
# IP=82.165.118.196 envsubst < demoapp.yaml | kubectl apply -f -



# IP=109.250.88.232 envsubst < demoapp.yaml
# IP=109.250.88.232 envsubst < demoapp.yaml | kubectl apply -f -


```





## 替换多个变量

### yaml

```yaml
# vim demoapp.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: ${IP}
spec:
  cidr: ${IP}/32
  ipipMode: Always
  vxlanMode: Neve
  natOutgoing: true
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel
---
apiVersion: v1
kind: Pod
metadata:
  name: demoapp-${IP}
  namespace: test
  annotations:
    cni.projectcalico.org/ipAddrs: "[\"${IP}\"]"
spec:
  containers:
  - name: middleware
    image: 172.16.0.120:30002/bjhit-middleware/middleware:v1
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

