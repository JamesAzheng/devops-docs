# 需求描述

- 通过集成代码的方式创建Pod，例如直接调用 kubernetes RESTful API 的方式进行创建，或通过一些工具来间接的调用 API 实现







# 申请证书

- 无论使用何种方式调用 Kubernetes API，都需要具有由 Kubernetes 根 CA (Certificate Authority) 签发的证书。
- Kubernetes API Server 会对来自客户端的请求进行身份验证，并验证请求中的证书是否由可信的根 CA 签发。
- 身份验证通过后，Kubernetes API Server 才会处理客户端的请求

https://kubernetes.io/zh-cn/docs/concepts/security/controlling-access/

## 通过 openssl 申请证书

https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/certificate-signing-requests/#normal-user

- 创建存放目录

```sh
mkdir -p /root/test/certs/xiangzheng
cd /root/test/certs/xiangzheng
```

- 生成私钥

```sh
openssl genrsa -out xiangzheng.key 2048
```

- 生成证书申请文件
- 证书中的 Common Name 字段来标明用户名，例如："/CN=xiangzheng"
- 证书中的 organization 字段来标明用户的所属组（可选），例如："/O=devops"

```sh
openssl req -new -key xiangzheng.key -out xiangzheng.csr -subj "/CN=xiangzheng/O=devops"
```

- kubernetes CA 签发证书

```sh
openssl x509 -req -days 36500 -CA /etc/kubernetes/pki/ca.crt -CAkey /etc/kubernetes/pki/ca.key -CAcreateserial -in xiangzheng.csr -out xiangzheng.crt


# 此提示表示签发成功
Signature ok
subject=CN = xiangzheng, O = devops
Getting CA Private Key
```

- 验证证书

```sh
# openssl x509 -in xiangzheng.crt -text
Certificate:
    Data:
        Version: 1 (0x0)
        Serial Number:
            6c:47:b2:a0:5d:54:81:15:92:11:8b:71:fb:d9:7c:1c:e1:4a:be:5e
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN = kubernetes
        Validity
            Not Before: May 19 06:11:53 2023 GMT
            Not After : Apr 25 06:11:53 2123 GMT
        Subject: CN = xiangzheng, O = devops
        Subject Public Key Info:
...
```





## RBAC 授权

- 证书申请完后，相当于只是创建了一个用户，其本身没有任何权限，因此还需要通过 RBAC（基于角色的访问控制） 为其授权

### RBAC 简述

- RBAC 是基于角色的访问控制，其中包含了 Role、ClusterRole，RoleBinding、ClusterRoleBinding
- Role 和 ClusterRole 负责定义权限，但角色是名称空间级别授权，集群角色是集群级别授权
- RoleBinding 和 ClusterRoleBinding 负责将 User、Group 或 ServiceAccount 与 Role 或 ClusterRole 进行绑定
  - 当用户使用 RoleBinding 和 Role 进行绑定时，用户将获得名称空间级别授权
  - 当用户使用 RoleBinding 和 ClusterRole 进行绑定时，RoleBinding 中所指定的 namespace 会将授权限制为名称空间级别
  - 当用户使用 ClusterRoleBinding 和 ClusterRole 进行绑定时，用户将获得集群级别授权
- RBAC 只是 kubernetes 中众多访问控制中的一种实现方案，其它的还有 ABAC 基于属性的访问控制等等...

参考文档：

- https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/rbac/



### ClusterRole + ClusterRoleBinding

- 这里为了简化操作，使用集群角色 + 集群角色绑定的方式对刚刚创建的证书(用户)进行授权
- ClusterRole 使用内置的 admin 以直接获取最高权限，也可以自定义 Role 或 ClusterRole 以实现更细粒度的权限划分

```yaml
# vim rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: xiangzheng-admin
roleRef: # 集群角色 cluster-admin
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects: # 与 xiangzheng 进行绑定
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: xiangzheng



# kubectl apply -f rolebinding.yaml 
clusterrolebinding.rbac.authorization.k8s.io/xiangzheng-admin created



# 验证
# kubectl describe clusterrolebindings.rbac.authorization.k8s.io xiangzheng-admin
Name:         xiangzheng-admin
Labels:       <none>
Annotations:  <none>
Role:
  Kind:  ClusterRole
  Name:  cluster-admin
Subjects:
  Kind  Name        Namespace
  ----  ----        ---------
  User  xiangzheng  

```





# 方案一：通过 kubectl 命令

- 可以使用 kubectl 命令的方式来创建，**其本质上就是调用的 kubernetes API**
- kubectl 命令其中包含了很多子命令，例如直接创建 Pod，或者加载 yaml 配置清单等

**方案特点：**

- kubectl 命令是 K8s 的原生工具，使用起来比较方便，并且可以将其集成到 例如 shell 脚本当中进行调用

**注意事项：**

- kubectl 命令通常只能在 master 节点执行，因为通常只有 master 节点才具有由 kubernetes CA 所签发的证书

**参考文档：**

- https://kubernetes.io/zh-cn/docs/reference/kubectl/



## 范例：创建 pod

```sh
# 在 test 名称空间中创建 demoapp
# kubectl run demoapp --image=ikubernetes/demoapp:v1.0 -n test
pod/demoapp created


# 验证
# kubectl get pod -n test 
NAME      READY   STATUS    RESTARTS   AGE
demoapp   1/1     Running   0          30s
```



## 范例：通过 yaml 清单创建 Pod

- 测试使用的 yaml 清单

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
spec:
  containers:
  - name: demoapp
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
  affinity:
    nodeAffinity:       
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: hostname
            operator: In
            values:
            - k8s-worker2
```

- 应用并验证

```sh
# kubectl apply -f demoapp.yaml 
pod/demoapp created


# kubectl get pod -n test
NAME      READY   STATUS    RESTARTS   AGE
demoapp   1/1     Running   0          80s
```



## 范例：动态调整 Deployment 中的 Pod 副本数

- 测试使用的 yaml 清单，运行三个副本

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: test
spec:
  replicas: 3 # 运行三个副本
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: ikubernetes/demoapp:v1.0
      affinity:
        nodeAffinity:       
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            preference:
              matchExpressions:
              - key: hostname
                operator: In
                values:
                - k8s-worker2
```

- 应用并测试，目前运行三个Pod副本

```sh
# kubectl apply -f demoapp_deployment.yaml 
deployment.apps/demoapp created


# kubectl get pod -n test 
NAME                       READY   STATUS    RESTARTS   AGE
demoapp-5598f7778c-6r7nj   1/1     Running   0          30s
demoapp-5598f7778c-gcwr2   1/1     Running   0          30s
demoapp-5598f7778c-mnj6j   1/1     Running   0          30s


# 目前运行三个Pod副本
# kubectl get deployments.apps -n test 
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
demoapp   3/3     3            3           48s
```

- 通过 kubectl 动态调整其副本数，将 demoapp Deployment 的副本数增加到 6

```sh
# 将 demoapp Deployment 的副本数增加到 6
# kubectl scale --replicas=6 deployment/demoapp -n test 
deployment.apps/demoapp scaled


# 验证
# kubectl get deployments.apps -n test
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
demoapp   6/6     6            6           6m24s

# kubectl get pod -n test
NAME                       READY   STATUS    RESTARTS   AGE
demoapp-5598f7778c-6r7nj   1/1     Running   0          6m11s
demoapp-5598f7778c-fjr44   1/1     Running   0          46s
demoapp-5598f7778c-gcwr2   1/1     Running   0          6m11s
demoapp-5598f7778c-h7689   1/1     Running   0          46s
demoapp-5598f7778c-jx4vt   1/1     Running   0          46s
demoapp-5598f7778c-mnj6j   1/1     Running   0          6m11s
```

- 通过 kubectl 动态调整其副本数，将 demoapp Deployment 的副本数减少到 2

```sh
# 将 demoapp Deployment 的副本数减少到 2
# kubectl scale --replicas=2 deployment/demoapp -n test 
deployment.apps/demoapp scaled


# 验证
# kubectl get deployments.apps -n test
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
demoapp   2/2     2            2           7m49s

# kubectl get pod -n test
NAME                       READY   STATUS    RESTARTS   AGE
demoapp-5598f7778c-gcwr2   1/1     Running   0          9m42s
demoapp-5598f7778c-mnj6j   1/1     Running   0          9m42s
```







# 方案二：直接调用 K8s API

**参考文档：**

- https://kubernetes.io/zh-cn/docs/concepts/overview/kubernetes-api/
- https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/



## yaml to json

- kubernetes API 只接受 json 格式的数据，因此事先需要通过一些工具来将 yaml 格式转为 json 格式

- 在线转json的网站：
  - https://www.json2yaml.com/convert-yaml-to-json

- 还可以使用`kubectl`命令将YAML文件转换为JSON格式。使用以下命令：

  - ```sh
    # 将pod.yaml转换为JSON格式，并将结果保存到pod.json文件中。
    kubectl convert -f pod.yaml --output=json > pod.json
    ```

转换为JSON后，您可以使用`curl`或其他HTTP客户端工具将JSON作为请求体发送给Kubernetes API。



## 测试 API

Kubernetes API 提供了一组测试使用的 URI，可以用于验证与 API 服务器的连接和基本功能。这些测试 URI 通常可用于 GET 请求，并返回一些基本的响应数据。

### 获取 API 版本信息

- `GET /api`

```sh
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --request GET \
     https://10.233.0.1/api
```

- 返回结果

```json
{
  "kind": "APIVersions",
  "versions": [
    "v1"
  ],
  "serverAddressByClientCIDRs": [
    {
      "clientCIDR": "0.0.0.0/0",
      "serverAddress": "172.16.0.121:6443"
    }
  ]
}
```



### 获取 K8s 集群中所有的 namespaces

- `GET /api/v1/namespaces`

```sh
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --request GET \
     https://10.233.0.1/api/v1/namespaces
```

- 返回结果

```json
{
  "kind": "NamespaceList",
  "apiVersion": "v1",
...
    {
      "metadata": {
        "name": "ceshi",
        "uid": "b378d4cd-33c2-4133-952d-42cbc299337e",
        "resourceVersion": "19599374",
        "creationTimestamp": "2023-04-28T10:15:43Z",
        "deletionTimestamp": "2023-05-16T02:07:04Z",
        "labels": {
          "kubernetes.io/metadata.name": "ceshi",
          "kubesphere.io/namespace": "ceshi",
          "kubesphere.io/workspace": "bjhit"
        },
        "annotations": {
          "kubesphere.io/alias-name": "测试一个容器多个pod的通信",
          "kubesphere.io/creator": "admin"
        },
...
```



## Pod

**参考文档：**

- https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/pod-v1/

### POST

#### 创建 Pod

- `POST /api/v1/namespaces/{namespace}/pods`
- 将`{namespace}`替换为实际的命名空间名称。

```json
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --header "Content-Type: application/json" \
     --request POST \
     --data '{
              "apiVersion": "v1",
              "kind": "Pod",
              "metadata": {
                "name": "demoapp",
                "namespace": "test"
              },
              "spec": {
                "containers": [
                  {
                    "name": "demoapp",
                    "image": "ikubernetes/demoapp:v1.0",
                    "imagePullPolicy": "IfNotPresent"
                  }
                ],
                "affinity": {
                  "nodeAffinity": {
                    "preferredDuringSchedulingIgnoredDuringExecution": [
                      {
                        "weight": 100,
                        "preference": {
                          "matchExpressions": [
                            {
                              "key": "hostname",
                              "operator": "In",
                              "values": [
                                "k8s-worker2"
                              ]
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }' \
     https://10.233.0.1/api/v1/namespaces/test/pods
```





### GET

#### 获取特定命名空间的 Pod 列表

- `GET /api/v1/namespaces/<NAMESPACE>/pods`
- 将`<NAMESPACE>`替换为实际的命名空间名称。

```sh
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --request GET \
     https://10.233.0.1/api/v1/namespaces/hsdir-sniper/pods
```

- 返回结果

```json
{
  "kind": "PodList",
  "apiVersion": "v1",
  "metadata": {
    "resourceVersion": "20760958"
  },
  "items": [
    {
      "metadata": {
        "name": "hsdir-sniper-bot-65c6554497-ff5wv",
        "generateName": "hsdir-sniper-bot-65c6554497-",
        "namespace": "hsdir-sniper",
        "uid": "54c05f8a-4e13-4796-aee2-9a21d1b719d6",
        "resourceVersion": "17952384",
        "creationTimestamp": "2023-05-11T12:37:34Z",
        "labels": {
          "app": "hsdir-sniper-bot",
          "pod-template-hash": "65c6554497"
        },
...
```

#### 获取特定Pod的详细信息

- `GET /api/v1/namespaces/<NAMESPACE>/pods/<POD_NAME>`
- 将`<NAMESPACE>`替换为Pod所在的命名空间，`<POD_NAME>`替换为Pod的名称。

```sh
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --request GET \
     https://10.233.0.1/api/v1/namespaces/hsdir-sniper/pods/hsdir-sniper-bot-65c6554497-ff5wv
```

- 返回结果

```json
{
  "kind": "Pod",
  "apiVersion": "v1",
  "metadata": {
    "name": "hsdir-sniper-bot-65c6554497-ff5wv",
    "generateName": "hsdir-sniper-bot-65c6554497-",
    "namespace": "hsdir-sniper",
    "uid": "54c05f8a-4e13-4796-aee2-9a21d1b719d6",
    "resourceVersion": "17952384",
    "creationTimestamp": "2023-05-11T12:37:34Z",
    "labels": {
      "app": "hsdir-sniper-bot",
      "pod-template-hash": "65c6554497"
    },
...
```



### DELETE

#### 删除 Pod

- `DELETE /api/v1/namespaces/{namespace}/pods/{name}`
- `{namespace}` Pod 所处的名称空间。
- `{name}` Pod 的名称。

```json
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --header "Content-Type: application/json" \
     --request DELETE \
     https://10.233.0.1/api/v1/namespaces/test/pods/demoapp
```





## Deployment

**参考文档：**

- https://kubernetes.io/zh-cn/docs/reference/kubernetes-api/workload-resources/deployment-v1/

### POST

#### 创建 Deployment

- `POST /apis/apps/v1/namespaces/{namespace}/deployments`
- `{namespace}` 为 Deployment 所处的命名空间名称。

```json
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --header "Content-Type: application/json" \
     --request POST \
     --data '{
               "apiVersion": "apps/v1",
               "kind": "Deployment",
               "metadata": {
                 "name": "demoapp",
                 "namespace": "test"
               },
               "spec": {
                 "replicas": 3,
                 "selector": {
                   "matchLabels": {
                     "app": "demoapp"
                   }
                 },
                 "template": {
                   "metadata": {
                     "name": "demoapp",
                     "labels": {
                       "app": "demoapp"
                     }
                   },
                   "spec": {
                     "containers": [
                       {
                         "name": "demoapp",
                         "image": "ikubernetes/demoapp:v1.0"
                       }
                     ],
                     "affinity": {
                       "nodeAffinity": {
                         "preferredDuringSchedulingIgnoredDuringExecution": [
                           {
                             "weight": 100,
                             "preference": {
                               "matchExpressions": [
                                 {
                                   "key": "hostname",
                                   "operator": "In",
                                   "values": [
                                     "k8s-worker2"
                                   ]
                                 }
                               ]
                             }
                           }
                         ]
                       }
                     }
                   }
                 }
               }
             }' \
     https://10.233.0.1/apis/apps/v1/namespaces/test/deployments
```









### PUT

#### 更新 Pod 副本数量

- `PATCH /apis/apps/v1/namespaces/{namespace}/deployments/{name}`
- `{namespace}` 为 Deployment 所处的命名空间名称。
- `{name}`Deployment 的名称

下面的例子中将Pod副本数从原有的3调整为6：

```json
curl --cacert /etc/kubernetes/pki/ca.crt \
     --cert xiangzheng.crt \
     --key xiangzheng.key \
     --header "Content-Type: application/json" \
     --request PUT \
     --data '{
               "apiVersion": "apps/v1",
               "kind": "Deployment",
               "metadata": {
                 "name": "demoapp",
                 "namespace": "test"
               },
               "spec": {
                 "replicas": 6,
                 "selector": {
                   "matchLabels": {
                     "app": "demoapp"
                   }
                 },
                 "template": {
                   "metadata": {
                     "name": "demoapp",
                     "labels": {
                       "app": "demoapp"
                     }
                   },
                   "spec": {
                     "containers": [
                       {
                         "name": "demoapp",
                         "image": "ikubernetes/demoapp:v1.0"
                       }
                     ],
                     "affinity": {
                       "nodeAffinity": {
                         "preferredDuringSchedulingIgnoredDuringExecution": [
                           {
                             "weight": 100,
                             "preference": {
                               "matchExpressions": [
                                 {
                                   "key": "hostname",
                                   "operator": "In",
                                   "values": [
                                     "k8s-worker2"
                                   ]
                                 }
                               ]
                             }
                           }
                         ]
                       }
                     }
                   }
                 }
               }
             }' \
     https://10.233.0.1/apis/apps/v1/namespaces/test/deployments/demoapp
```







# 其它说明

- 示例中的 10.233.0.1 是 kubernetes API server 的地址，但它是 ClusterIP 类型的 Service，只能在 kubernetes 集群中的任意节点进行访问。如果要从公司的其他服务器来访问，还需要改成 NodePort 类型的 Service 对外暴露。
- 另外证书的申请还有更简单的方法，如果在 kubesphere 平台有账号的话，可以将 kubeconfig 中的证书导出来直接用，证书和私钥都是base64编码，转换一下就可以了
