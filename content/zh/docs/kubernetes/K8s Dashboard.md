---
title: "Dashboard"
---

# 部署 Dashboard

**参考文档：**

- https://github.com/kubernetes/dashboard
- https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/web-ui-dashboard/

**注意事项：**

- 每个 dashboard 支持的 Kubernetes 版本不一样，详参 github 中 release 的 Compatibility
- 在 Web UI 进行登录验证时一定要使用 ServiceAccount，而非 UserAccount，因为 Dashboard 是以 Pod 方式运行，而 Pod 与其它资源进行交互时需要 ServiceAccount

**PS：**

- 可以先将其中包含的镜像文件下载至本地然后推送至harbor



## 下载 yaml 文件

```sh
# wget https://raw.githubusercontent.com/kubernetes/dashboard/v2.6.0/aio/deploy/recommended.yaml
```





## 修改 yaml 文件

- 修改Service，以实现可以通过外部访问，externalIPs 和 NodePort 二选一即可

### externalIPs

```yaml
# vim recommended.yaml
...
---

kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  ports:
    - port: 443
      targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard
  externalIPs: # 列表格式，可以定义多个
  - '10.0.0.168'
---
...
```



### NodePort

```yaml
# vim recommended.yaml
...
---

kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  type: NodePort # 添加此行为 NodePort
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 30443 # 可选，添加此行指定固定的nodePort，否则将使用随机分配的nodePort
  selector:
    k8s-app: kubernetes-dashboard

---
...
```

## 运行 yaml 文件

```bash
# kubectl apply -f recommended.yaml 
namespace/kubernetes-dashboard created
serviceaccount/kubernetes-dashboard created
service/kubernetes-dashboard created
secret/kubernetes-dashboard-certs created
secret/kubernetes-dashboard-csrf created
secret/kubernetes-dashboard-key-holder created
configmap/kubernetes-dashboard-settings created
role.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrole.rbac.authorization.k8s.io/kubernetes-dashboard created
rolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
clusterrolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
deployment.apps/kubernetes-dashboard created
service/dashboard-metrics-scraper created
deployment.apps/dashboard-metrics-scraper created
```



## 验证

```sh
# kubectl get pod -n kubernetes-dashboard 
NAME                                         READY   STATUS    RESTARTS   AGE
dashboard-metrics-scraper-6f669b9c9b-p85vc   1/1     Running   0          2m50s
kubernetes-dashboard-67b9478795-cb2sm        1/1     Running   0          2m50s
```



### externalIPs

- 浏览器访问https://10.0.0.168/

```sh
# kubectl get svc -n kubernetes-dashboard kubernetes-dashboard 
NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
kubernetes-dashboard   ClusterIP   10.102.14.235   10.0.0.168    443/TCP   5m40s


# kubectl get ep -n kubernetes-dashboard kubernetes-dashboard 
NAME                   ENDPOINTS           AGE
kubernetes-dashboard   10.244.1.220:8443   6m3s



# 任何node节点都会生成ipvs规则（前提使用的是ipvs代理模式，而非iptables）
# ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  10.0.0.168:443 rr
  -> 10.244.1.220:8443            Masq    1      0          0         
...
```



### NodePort

- 浏览器访问任意node节点的 https://1.2.3.4:30443

```sh
# kubectl get svc -n kubernetes-dashboard 
NAME                        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)         AGE
dashboard-metrics-scraper   ClusterIP   10.110.136.155   <none>        8000/TCP        3m18s
kubernetes-dashboard        NodePort    10.97.7.2        <none>        443:30443/TCP   3m18s

```



# 登录 Dashboard

## 范例：集群级别管理员

- 绑定 ClusterRole 下的 cluster-admin 以获得集群级别管理员权限

### 创建 ServiceAccount

```sh
# kubectl create sa -n kubernetes-dashboard dashboard-cluster-admin
serviceaccount/dashboard-cluster-admin created


# kubectl get sa -n kubernetes-dashboard dashboard-cluster-admin 
NAME                      SECRETS   AGE
dashboard-cluster-admin   1         18s
```



### ClusterRolebinding

- 为 ServiceAccount 使用 ClusterRolebinding 绑定 ClusterRole 下的 cluster-admin

```sh
# kubectl create clusterrolebinding dashboard-cluster-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-cluster-admin
clusterrolebinding.rbac.authorization.k8s.io/dashboard-cluster-admin created


# kubectl describe clusterrolebinding dashboard-cluster-admin
Name:         dashboard-cluster-admin
Labels:       <none>
Annotations:  <none>
Role: # 与ClusterRole下的cluster-admin进行绑定
  Kind:  ClusterRole
  Name:  cluster-admin
Subjects: # 绑定的用户信息
  Kind            Name                     Namespace
  ----            ----                     ---------
  ServiceAccount  dashboard-cluster-admin  kubernetes-dashboard
```



### 获取token

```yaml
# 先获取创建 ServiceAccount 时所生成的对应 secrets
# kubectl describe sa -n kubernetes-dashboard dashboard-cluster-admin 
Name:                dashboard-cluster-admin
Namespace:           kubernetes-dashboard
Labels:              <none>
Annotations:         <none>
Image pull secrets:  <none>
Mountable secrets:   dashboard-cluster-admin-token-x2b2p # secrets
Tokens:              dashboard-cluster-admin-token-x2b2p
Events:              <none>
```

#### 方法一

- 使用 describe 获取

```yaml
# kubectl describe secrets -n kubernetes-dashboard dashboard-cluster-admin-token-x2b2p
Name:         dashboard-cluster-admin-token-x2b2p
Namespace:    kubernetes-dashboard
...

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1099 bytes
namespace:  20 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZC... # 得到的token可以直接用于kubernetes-dashboard UI 进行登录



# 一条命令获取
# kubectl -n kubernetes-dashboard describe secrets dashboard-cluster-admin-token-x2b2p | grep ^token | awk '{print $2}'
eyJhbGciOiJSUzI1NiIsImtpZC...
```

#### 方法二

- `get -o yaml` 方式获取，先从secrets中获取base64编码格式的token，然后再进行转换，不过这样比较麻烦

```yaml
# 获取secrets中的token然后进行复制
# kubectl get secrets -n kubernetes-dashboard dashboard-cluster-admin-token-x2b2p -o yaml
...
  token: ZXlKaGJHY2lPaUp...
...


# 将base64编码格式的token转换成字符串格式
# echo 'ZXlKaGJHY2lPaUp...' | base64 -d ; echo
eyJhbGciOiJSUzI1NiIsImtpZC... # 得到token，然后复制到web界面中进行登录
```

#### 方法三

- 参考文档：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-token-em-
- 1.23.10 版本此命令不可用
- ？？？？？

```bash
kubectl -n kubernetes-dashboard create token admin-user


# --duration=10080m 表示token有效期为一周 10080分钟，不指定的默认有效期很短
kubectl -n project-1 create token azheng --duration=10080m
```



### 生成kubeconfig

```sh
# 导入集群信息
kubectl config set-cluster kubernetes \
--server=https://10.0.0.100:6443 \
--certificate-authority=/etc/kubernetes/pki/ca.crt \
--embed-certs=true \
--kubeconfig=./dashboard-cluster-admin.conf


# 导入token（token获取方法参阅上面的生成token）
kubectl config set-credentials dashboard-cluster-admin \
--token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlJEbktqUnNWWHZwWXdtUzQ4LWxNVGk3NmpxUkJXT2hRbHFkdkFpMlBUNzAifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJkYXNoYm9hcmQtY2x1c3Rlci1hZG1pbi10b2tlbi14MmIycCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJkYXNoYm9hcmQtY2x1c3Rlci1hZG1pbiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjVlMzJiNDY0LTY0ZGUtNGVmZC05NGFkLTdiZjY0YzIxMTY1MCIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDpkYXNoYm9hcmQtY2x1c3Rlci1hZG1pbiJ9.UOLx7MYXuMURqEMgMTasKjkaBFR_CqGfia4uPf9gGGVlrp_a9fnQ0UMF6IvQu4E3Uhv9JeOGSdxa5k1P1MTt6jLu7s9iPdinST9POsb_ULXrttBTvZM2Du9jfH-TUOAMkKRZFLBmA9ztYQYzAW9aHtEzKWX-jcw2HQimlpXpj5G-jOtsOghERAy_uUg7_jdgJZHtsYJlj5DE1CwjXhhFAO4dcGV6trx_UXfjl8PpWXMbWmOcBYf-6p2nAnMNaKPx9ix93kxA4UMfjJ0V4SaSUaUCNPG_JtbARK5d3Ko4BTWxkf4DaUzaS0D8D3NBHNZKx08bcefW47ahaC-dBdMdDA' \
--kubeconfig=./dashboard-cluster-admin.conf



# 设置上下文
kubectl config set-context kubernetes@dashboard-cluster-admin \
--cluster=kubernetes \
--user=dashboard-cluster-admin \
--kubeconfig=./dashboard-cluster-admin.conf


kubectl config set-context kubernetes@dashboard-cluster-admin \
--cluster=kubernetes \
--namespace=dev \
--user=dashboard-cluster-admin \
--kubeconfig=./dashboard-cluster-admin.conf


# 设置当前上下文
kubectl config use-context kubernetes@dashboard-cluster-admin --kubeconfig=./dashboard-cluster-admin.conf

```



## 范例：名称空间级别管理员

- 绑定 ClusterRole 下的 admin 以获得名称空间级别管理员权限

### 创建 ServiceAccount

```sh
# kubectl create sa -n kube-flannel kube-flannel-admin
serviceaccount/kube-flannel-admin created


# kubectl get sa -n kube-flannel kube-flannel-admin 
NAME                 SECRETS   AGE
kube-flannel-admin   1         10s
```



### Rolebinding

- 为 ServiceAccount 使用 Rolebinding 绑定 ClusterRole 下的 admin
  - 使用 Rolebinding 可以将权限限制于名称空间范围，否则默认的 admin ClusterRole 将拥有所有名称空间的最高权限
  - **注意：一定要使用Rolebinding ，使用clusterrolebinding的话其权限范围将是集群级别**

```sh
# kubectl create rolebinding kube-flannel-admin --clusterrole=admin --serviceaccount=kube-flannel:kube-flannel-admin -n kube-flannel 
rolebinding.rbac.authorization.k8s.io/kube-flannel-admin created



# kubectl describe rolebinding kube-flannel-admin -n kube-flannel
Name:         kube-flannel-admin
Labels:       <none>
Annotations:  <none>
Role: # 与ClusterRole下的admin进行绑定
  Kind:  ClusterRole
  Name:  admin
Subjects: # 绑定的用户信息
  Kind            Name                Namespace
  ----            ----                ---------
  ServiceAccount  kube-flannel-admin  kube-flannel
```



### 获取token

```yaml
# 先获取创建 ServiceAccount 时所生成的对应 secrets
# kubectl describe sa -n kube-flannel kube-flannel-admin 
Name:                kube-flannel-admin
Namespace:           kube-flannel
Labels:              <none>
Annotations:         <none>
Image pull secrets:  <none>
Mountable secrets:   kube-flannel-admin-token-5wgk2 # secrets
Tokens:              kube-flannel-admin-token-5wgk2
Events:              <none>
```

#### 方法一

- 使用 describe 获取

```yaml
# kubectl describe secrets -n kube-flannel kube-flannel-admin-token-5wgk2
Name:         kube-flannel-admin-token-5wgk2
Namespace:    kube-flannel
...

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1099 bytes
namespace:  20 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6I... # 得到的token可以直接用于kubernetes-dashboard UI 进行登录



# 一条命令获取
# kubectl -n kube-flannel describe secrets kube-flannel-admin-token-5wgk2 | grep ^token | awk '{print $2}'
eyJhbGciOiJSUzI1NiIsImtpZCI6I...
```

#### 方法二

- `get -o yaml` 方式获取，先从secrets中获取base64编码格式的token，然后再进行转换，不过这样比较麻烦

```yaml
# 获取secrets中的token然后进行复制
# kubectl get secrets -n kube-flannel kube-flannel-admin-token-5wgk2 -o yaml
...
  token: ZXlKaGJHY2lPaUp...
...


# 将base64编码格式的token转换成字符串格式
# echo 'ZXlKaGJHY2lPaUp...' | base64 -d ; echo
eyJhbGciOiJSUzI1NiIsImtpZCI6I... # 得到token，然后复制到web界面中进行登录
```

#### 方法三

- 参考文档：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-token-em-
- 1.23.10 版本此命令不可用
- ？？？？？

```bash
kubectl -n kubernetes-dashboard create token admin-user


# --duration=10080m 表示token有效期为一周 10080分钟，不指定的默认有效期很短
kubectl -n project-1 create token azheng --duration=10080m
```



### 生成kubeconfig

```sh
# 导入集群信息
kubectl config set-cluster kubernetes \
--server=https://10.0.0.100:6443 \
--certificate-authority=/etc/kubernetes/pki/ca.crt \
--embed-certs=true \
--kubeconfig=./kube-flannel-admin.conf


# 导入token（token获取方法参阅上面的获取token）
kubectl config set-credentials kube-flannel-admin \
--token='eyJhbGciOiJSUzI1NiIsImtpZCI6IlJEbktqUnNWWHZwWXdtUzQ4LWxNVGk3NmpxUkJXT2hRbHFkdkFpMlBUNzAifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLWZsYW5uZWwiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoia3ViZS1mbGFubmVsLWFkbWluLXRva2VuLTV3Z2syIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6Imt1YmUtZmxhbm5lbC1hZG1pbiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImU3NGYxMmI5LTAyOWUtNDA2YS1iMTU4LWZlNTcwYTEzZDE2NCIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlLWZsYW5uZWw6a3ViZS1mbGFubmVsLWFkbWluIn0.LFks0nB9bF-EQvZBfNUELYjyqEGnQL9F1Elc6m-_zLbtxuJMsrxUnDywZYOt_itSY2f-SsKugFwJkCIb0C8Z7XDHW7KZv8YgaYdwZhThjCvObfYKlc4R5dPRfo7Jtfdtvx-gsUhZo-oQWGI2UTkrOky3KWYkqOpbiUjX8oVRMk5m0Y0JXcKsqxvsg03RJ1A5plUjRMHnka0wSj8H_F2qrgeB3OBpcOV1yMacDP2ZWmbXFNZzpvMyLXviBdw-XupREjbScajorHtkaz97T9YHnDh16NgNxdBC6Nz16GQF8NUNovHZrj8e-3E3lkHRKnSj13EA1ZWn7L-BPsPWZ_tGww' \
--kubeconfig=./kube-flannel-admin.conf



# 设置上下文
kubectl config set-context kubernetes@kube-flannel-admin \
--cluster=kubernetes \
--namespace=kube-flannel \ # 名称空间可加可不加，因为Rolebinding已经限制了名称空间级别限制
--user=kube-flannel-admin \
--kubeconfig=./kube-flannel-admin.conf


# 设置当前上下文
kubectl config use-context kubernetes@kube-flannel-admin --kubeconfig=./kube-flannel-admin.conf

```

#### 测试

- 访问：https://10.0.0.168/#/pod?namespace=kube-flannel，只有kube-flannel下的资源可以访问



## 范例：名称空间级别部分权限

- 此处仅授予查看pod运行状态和日志的权限







# 一键创建基于sa的kubeconfig脚本

- 仅作参考

```sh
# cat gen-kubeconfig-based-sa.sh 
# Update these to match your environment
SERVICE_ACCOUNT_NAME=$1
CONTEXT=$(kubectl config current-context)
NAMESPACE=$2

NEW_CONTEXT=$3
KUBECONFIG_FILE="kubeconfig-sa"


SECRET_NAME=$(kubectl get serviceaccount ${SERVICE_ACCOUNT_NAME} \
  --context ${CONTEXT} \
  --namespace ${NAMESPACE} \
  -o jsonpath='{.secrets[0].name}')
TOKEN_DATA=$(kubectl get secret ${SECRET_NAME} \
  --context ${CONTEXT} \
  --namespace ${NAMESPACE} \
  -o jsonpath='{.data.token}')

TOKEN=$(echo ${TOKEN_DATA} | base64 -d)

# Create dedicated kubeconfig
# Create a full copy
kubectl config view --raw > ${KUBECONFIG_FILE}.full.tmp
# Switch working context to correct context
kubectl --kubeconfig ${KUBECONFIG_FILE}.full.tmp config use-context ${CONTEXT}
# Minify
kubectl --kubeconfig ${KUBECONFIG_FILE}.full.tmp \
  config view --flatten --minify > ${KUBECONFIG_FILE}.tmp
# Rename context
kubectl config --kubeconfig ${KUBECONFIG_FILE}.tmp \
  rename-context ${CONTEXT} ${NEW_CONTEXT}
# Create token user
kubectl config --kubeconfig ${KUBECONFIG_FILE}.tmp \
  set-credentials ${CONTEXT}-${NAMESPACE}-token-user \
  --token ${TOKEN}
# Set context to use token user
kubectl config --kubeconfig ${KUBECONFIG_FILE}.tmp \
  set-context ${NEW_CONTEXT} --user ${CONTEXT}-${NAMESPACE}-token-user
# Set context to correct namespace
kubectl config --kubeconfig ${KUBECONFIG_FILE}.tmp \
  set-context ${NEW_CONTEXT} --namespace ${NAMESPACE}
# Flatten/minify kubeconfig
kubectl config --kubeconfig ${KUBECONFIG_FILE}.tmp \
  view --flatten --minify > ${KUBECONFIG_FILE}
# Remove tmp
rm ${KUBECONFIG_FILE}.full.tmp
rm ${KUBECONFIG_FILE}.tmp
```

