---
title: "ServiceAccount"
---

# ServiceAccount 概述

- ServiceAccount 服务账号，简称 sa，名称空间级别资源，因此可以在不同的名称空间中定义同名的用户
- ServiceAccount 是 Kubernetes API 所管理的用户

- ServiceAccount 用于 Pod 中的应用程序在访问 API Server 时认证使用

  - 在 Kubernetes 中，Pod 中的应用程序可以使用 ServiceAccount 身份验证令牌来向 Kubernetes API Server 发出请求并访问资源。
  - 当 Pod 中的应用程序需要向 Kubernetes API 发出请求时，它会使用与其关联的 ServiceAccount 的身份验证令牌进行身份验证。Kubernetes API Server 会验证该身份验证令牌是否有效，并检查 ServiceAccount 是否被授予了相应的访问权限。如果验证成功，则应用程序可以访问 Kubernetes API 并执行相应的操作。
  - 通常，管理员会将 ServiceAccount 与相应的 RBAC 角色和角色绑定配合使用，以确保 Pod 中的应用程序只能访问其所需的资源。这有助于提高 Kubernetes 集群的安全性，并减少因应用程序的错误或恶意操作而导致的不良后果。

- 在 Kubernetes 中，每个 Pod 都与一个 ServiceAccount 关联，并且可以使用该 ServiceAccount 的身份验证令牌向 Kubernetes API 发出请求。当 Pod 中的应用程序需要访问自身的信息时，它可以使用 ServiceAccount 的身份验证令牌向 Kubernetes API 查询相关信息，例如 Pod 的 IP 地址、元数据和标签等。

- 总之，ServiceAccount 是一种用于认证 Pod 中的应用程序的身份标识，它可以帮助管理员更好地管理 Pod 对 Kubernetes API 的访问权限，并提高 Kubernetes 集群的安全性。

  

  

  



- 服务账号被身份认证后，所确定的用户名为 `system:serviceaccount:<名字空间>:<服务账号>`， 并被分配到用户组 `system:serviceaccounts` 和 `system:serviceaccounts:<名字空间>`
  - 当 ServiceAccount 被身份认证后，Kubernetes 会为其分配一个用户名和一组用户组。具体来说，用户名的格式为 `system:serviceaccount:<namespace>:<service-account>`，其中 `<namespace>` 表示该 ServiceAccount 所在的名称空间，`<service-account>` 表示 ServiceAccount 的名称。
    - 例如，如果我们在 `default` 名称空间中创建了一个名为 `my-sa` 的 ServiceAccount，则其用户名将为 `system:serviceaccount:default:my-sa`。这个用户名是 Kubernetes API 中用于标识该 ServiceAccount 的唯一标识符。
  - 除了用户名之外，Kubernetes 还为 ServiceAccount 分配了一组用户组。这些用户组包括 `system:serviceaccounts` 和 `system:serviceaccounts:<namespace>`。其中，`system:serviceaccounts` 是所有 ServiceAccount 共享的用户组，而 `system:serviceaccounts:<namespace>` 是特定名称空间中的 ServiceAccount 所共享的用户组。
    - 例如，如果我们在 `default` 名称空间中创建了一个名为 `my-sa` 的 ServiceAccount，则该 ServiceAccount 将分配到两个用户组：`system:serviceaccounts` 和 `system:serviceaccounts:default`。这些用户组是 Kubernetes RBAC 策略中用于授权 ServiceAccount 对 Kubernetes API 进行访问的重要组成部分。
  - 总之，当 ServiceAccount 被身份认证后，Kubernetes 会为其分配一个特定格式的用户名和一组用户组，以便在 Kubernetes API 中进行身份验证和授权。**这些用户组是 Kubernetes RBAC 策略中的重要组成部分，可用于授权 ServiceAccount 对 Kubernetes API 进行访问。**





**注意事项**


- 由于服务账号令牌也可以保存在 Secret API 对象中，任何能够写入这些 Secret 的用户都可以请求一个令牌，且任何能够读取这些 Secret 的用户都可以被认证为对应的服务账号。 在为用户授予访问服务账号的权限以及对 Secret 的读取或写入权能时，要格外小心。

  - 这句话的意思是，Kubernetes 中的 ServiceAccount 令牌可以保存在 Secret 对象中，而任何有权限写入这些 Secret 对象的用户都可以请求一个 ServiceAccount 令牌，并因此获得访问该 ServiceAccount 的权限(RBAC)。
  - 同样，任何有权限读取这些 Secret 对象的用户都可以使用相应的 ServiceAccount 令牌进行身份验证，并获得相应 ServiceAccount 的权限(RBAC)。
  - 因此，当为用户授予访问 ServiceAccount 的权限或授予对 Secret 对象的读取或写入权限时，需要非常小心，以确保只有受信任的用户才能访问这些信息。否则，恶意用户可能会利用这些权限来获取敏感信息或执行未经授权的操作。




**参考文档**

- https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-service-account/
- https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/service-accounts-admin/
- https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authentication/#service-account-tokens
- https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authentication/#users-in-kubernetes



# ServiceAccount Explain

```yaml
apiVersion: v1  # ServiceAccount所属的API群组及版本
kind: ServiceAccount  # 资源类型标识
metadata:
  name <string>  # 资源名称
  namespace <string>  # ServiceAccount是名称空间级别的资源
automountServiceAccountToken <boolean>  # 是否让Pod自动挂载API令牌
secrets <[]Object>   # 以该SA运行的Pod所要使用的Secret对象组成的列表
  apiVersion <string>  # 引用的Secret对象所属的API群组及版本，可省略
  kind <string>  # 引用的资源的类型，这里是指Secret，可省略
  name <string>  # 引用的Secret对象的名称，通常仅给出该字段即可
  namespace <string>  # 引用的Secret对象所属的名称空间
  uid  <string>  # 引用的Secret对象的标识符；
imagePullSecrets <[]Object> # 引用的用于下载Pod中容器镜像的Secret对象列表，pod直接引用此信息可以避免在每个pod中都定义 Secret docker-registry 信息，而使用这个全局ServiceAccount验证信息
  name <string>  # docker-registry类型的Secret资源的名称
```







# ServiceAccount 常见应用场景

**部署应用：**

在 Kubernetes 中，每个应用程序都运行在一个 Pod 中。为了授权 Pod 访问 Kubernetes API 和其他资源，需要为 Pod 创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。这样，Pod 就可以安全地与 Kubernetes API 进行交互，并访问需要的资源。



**访问资源：**

在生产环境中，需要对不同的资源进行访问控制。ServiceAccount 可以为 Pod 提供一个身份，使得 Pod 可以访问这些资源。管理员可以为 ServiceAccount 分配不同的角色和权限，从而实现访问控制。

Kubernetes 中的许多资源都需要经过身份验证才能访问，比如 Secret、ConfigMap、Pod、Service 等。ServiceAccount 可以为 Pod 提供一个可信的身份，使得 Pod 可以访问这些资源。



**访问 Kubernetes API：**

Kubernetes API 是 Kubernetes 管理集群的核心组件，只有经过身份验证的用户才能访问 API。ServiceAccount 可以为 Pod 提供一个身份，使得 Pod 可以访问 Kubernetes API。



**实现 CI/CD：**

在生产环境中，需要实现 CI/CD（Continuous Integration/Continuous Deployment）流程。使用 ServiceAccount 可以为 CI/CD 工具提供一个可信的身份，使得该工具可以安全地与 Kubernetes API 进行交互，并进行应用的自动部署。

在持续集成/持续部署（CI/CD）流程中，需要自动化部署应用程序到 Kubernetes 集群。为了授权 CI/CD 工具访问 Kubernetes API，并进行自动化部署，需要为 CI/CD 工具创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**监控和日志收集工具：**

在 Kubernetes 集群中，需要监控和收集各种资源的监控指标和日志。为了授权监控和日志收集工具访问 Kubernetes API 和收集资源的监控指标和日志，需要为这些工具创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**存储系统：**

在 Kubernetes 集群中，可能需要访问外部存储系统，如 NFS、Ceph、GlusterFS 等。

为了授权 Pod 访问这些存储系统，并进行读写操作，需要为 Pod 创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**其他应用和工具：**

除了上述应用和工具，还有很多其他的应用和工具，如数据库、缓存、消息队列等，也可能需要访问 Kubernetes 集群中的资源和 API。

为了授权这些应用和工具访问 Kubernetes 集群，并进行必要的操作，需要为它们创建相应的 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**访问外部资源：**

在生产环境中，如果 Pod 需要访问外部资源，比如数据库、存储系统等。使用 ServiceAccount 可以为 Pod 提供一个身份，使得 Pod 可以安全地访问这些外部资源。



**实现 RBAC 权限控制：**

在生产环境中，需要对集群资源进行访问控制。ServiceAccount 可以用于实现 Kubernetes 中的 RBAC（Role-Based Access Control）权限控制。

就是使用 ServiceAccount + RBAC 的方式来为 Pod 提供一个身份，管理员可以为不同的 ServiceAccount 分配不同的角色和权限，从而控制不同的 Pod 对集群资源的访问权限。



**在不同的 Namespace 中共享资源：**

不同的 Namespace 中的 Pod 之间默认是没有权限共享资源的。但是可以通过 ServiceAccount 在不同的 Namespace 中创建相同的名称，从而共享一些资源，比如 Secret、ConfigMap 等。



## 需要 ServiceAccount 的 CNCF 项目

**Kubernetes Dashboard**

Kubernetes Dashboard 也是 ServiceAccount 的一个常见应用场景之一。

在 Kubernetes 集群中，Kubernetes Dashboard 通过 ServiceAccount 进行身份验证和授权，以便于安全地访问 Kubernetes API 和进行各种操作。

当 Kubernetes Dashboard 部署到集群中时，会创建一个名为 `kubernetes-dashboard` 的 ServiceAccount 和一个名为 `kubernetes-dashboard` 的 ClusterRoleBinding 对象。

- 这个 ServiceAccount 会被授权访问 Kubernetes API 的特定资源和操作，而这个 ClusterRoleBinding 会将该 ServiceAccount 绑定到一个具有适当权限的 ClusterRole 上，从而使得 Kubernetes Dashboard 可以访问这些资源和操作。

在实践中，管理员可以通过创建自定义的 ClusterRole 和 ClusterRoleBinding 对象，为 Kubernetes Dashboard 提供更细粒度的权限控制。同时，也可以为不同的 ServiceAccount 分配不同的角色和权限，从而实现更加灵活的访问控制策略。



**Prometheus**

Prometheus 是一款流行的开源监控系统，用于收集、存储和查询各种应用程序和系统的监控指标。为了授权 Prometheus 访问 Kubernetes 集群中的资源和 API，需要为 Prometheus 创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**Fluentd**

Fluentd 是一款流行的开源日志收集器，用于收集、聚合和传输各种应用程序和系统的日志。为了授权 Fluentd 访问 Kubernetes 集群中的资源和 API，并收集和传输 Pod 和容器的日志，需要为 Fluentd 创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**Istio**

Istio 是一款流行的开源服务网格框架，用于管理和保护分布式应用程序的流量。为了授权 Istio 访问 Kubernetes 集群中的资源和 API，并管理和保护 Pod 和容器之间的流量，需要为 Istio 创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**Linkerd**

Linkerd 是另一款流行的开源服务网格框架，用于管理和保护分布式应用程序的流量。为了授权 Linkerd 访问 Kubernetes 集群中的资源和 API，并管理和保护 Pod 和容器之间的流量，需要为 Linkerd 创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



**Envoy**

Envoy 是一款高性能的开源代理，用于管理和路由网络流量。在 Kubernetes 集群中，Envoy 可以用于管理和保护 Pod 和容器之间的流量。为了授权 Envoy 访问 Kubernetes 集群中的资源和 API，并管理和保护 Pod 和容器之间的流量，需要为 Envoy 创建一个 ServiceAccount，并将该 ServiceAccount 分配到一个具有适当权限的角色中。



# ServiceAccount  创建方式

- 创建名称空间时，会在该名称空间自动创建一个名为 "default"  的 ServiceAccount
- ServiceAccount 也可以手动创建

## 自动创建的 ServiceAccount

```yaml
# 手动创建一个测试用的 dev 名称空间
# kubectl create ns dev
namespace/dev created


# 创建名称空间后都会自动创建一个名为 default 的 ServiceAccount
# kubectl get sa -n dev
NAME      SECRETS   AGE
default   1         39s
```

**在创建名称空间时默认生成的 ServiceAccount 与哪些角色或集群角色进行绑定了？默认的 ServiceAccount 具有哪些权限？**

- 在创建命名空间时，默认会创建一个名为 `default` 的 ServiceAccount，并将其与一个名为 `system:serviceaccount:<namespace>:default` 的 RoleBinding 进行绑定，其中 `<namespace>` 是该 ServiceAccount 所在的命名空间。
- 该 RoleBinding 引用的是名为 `view` 的 ClusterRole，它允许用户查看当前命名空间中的所有资源（但不包括 Secret 和 ConfigMap 中的内容）。
- 因此，默认的 ServiceAccount 具有查看当前命名空间资源的权限（除了 Secret 和 ConfigMap 中的内容）。



## 手动创建的 ServiceAccount

- 自动创建的sa权限较小，因此也可以手动创建sa，并对其加以授权(例如 RBAC)，以使pod拥有更高的权限

- 手动创建 serviceaccount 时也会自动创建对应的 secrets 资源

```yaml
# 手动创建 ServiceAccount 时，通常使用命令行进行创建
# kubectl create sa admin-dev -n dev
serviceaccount/admin-dev created


# kubectl get sa -n dev
NAME        SECRETS   AGE
admin-dev   1         2s
default     1         46h
```



# ServiceAccount 包含的内容

- ServiceAccount 会关联一个 Secret，Secret 中包含 namespace、ca证书、token，Pod 加载时会自动挂载这些资源

```sh
# kubectl describe sa -n dev default 
Name:                default
Namespace:           dev
Labels:              <none>
Annotations:         <none>
Image pull secrets:  <none>
Mountable secrets:   default-token-pjnm7 # 关联的secrets
Tokens:              default-token-pjnm7
Events:              <none>


# secrets的详细信息
# kubectl get secrets -n dev default-token-pjnm7 -o yaml 
apiVersion: v1
data:
  ca.crt: LS0tLS1CRUdJ... # ca.crt，经过了base64编码
  namespace: ZGV2 # namespace，经过了base64编码，ZGV2解析后为dev
  token: ZXlKaGJHY2lP... # token，经过了base64编码
...
```



**Pod 在访问 API Server 时使用的是 Secret 中的哪个或哪些资源？**

- 在 Pod 访问 API Server 时，**使用的是 Secret 中的访问令牌（Token）进行身份验证**。
- 具体来说，Pod 会使用 Secret 中的访问令牌作为 Bearer Token，在 HTTP Header 中进行传递。这个 Token 可以是一个简单的字符串，也可以是一个 JWT（JSON Web Token）。
- 当 Pod 向 API Server 发送请求时，API Server 会先对该请求进行身份验证，并验证 Token 的有效性。如果 Token 有效，则 Pod 将获得与该 ServiceAccount 相关的权限，否则该请求将被拒绝。



**既然 Pod 在访问 API Server 时使用的是 ServiceAccount 所对应 Secret 中的 Token 来访问 API Server，那将 namespace 和 ca证书 挂载进来有什么用**

在 Pod 中挂载 ServiceAccount 对应的 Secret 中的 namespace 和 ca 证书主要有以下作用：

1. namespace：Pod 可以使用挂载的 Secret 中的 namespace 信息来获取当前 Pod 所在的命名空间。这对于需要根据命名空间动态调整 Pod 的行为或者访问特定命名空间下的资源非常有用。
2. ca 证书：通过在 Pod 中挂载 Secret 中的 ca 证书，可以使 Pod 可以信任 Kubernetes API Server 的证书，从而建立安全的 TLS 连接。在使用 TLS 加密通信时，客户端需要验证服务器端证书的合法性，而服务器端证书的有效性通常是由 CA（Certificate Authority）进行签名的。通过在 Pod 中挂载与 ServiceAccount 对应的 Secret 中的 ca 证书，Pod 可以使用这个证书来验证 Kubernetes API Server 的证书的有效性，确保建立安全的连接。

需要注意的是，Pod 中挂载的 namespace 和 ca 证书并不是直接用于访问 API Server 的身份验证。Pod 访问 API Server 时，会使用 ServiceAccount 对应的 Secret 中的 Token 进行身份验证。而挂载的 namespace 和 ca 证书主要用于其他目的，例如在 Pod 中获取当前命名空间，或者建立安全的 TLS 连接。



**每个 ServiceAccount 中都有一个对应的 Secret，Secret 中包含 namespace、ca证书、token，这三个资源分别有什么作用**

每个 Kubernetes ServiceAccount 对应一个 Secret 对象，这个 Secret 包含了该 ServiceAccount 的访问令牌（Token）、证书（ca.crt）以及命名空间（namespace）等信息。这三个资源在 Kubernetes 中具有不同的作用：

1. 访问令牌（Token）：在 Kubernetes 集群中，每个 ServiceAccount 对应一个访问令牌，这个访问令牌被用于认证 ServiceAccount 对象访问 Kubernetes API Server。当 Pod 使用 ServiceAccount 访问 Kubernetes API Server 时，API Server 会验证该 Pod 所使用的 ServiceAccount 的访问令牌是否有效，如果有效，则该 Pod 将获得与该 ServiceAccount 相关的权限。访问令牌是一串加密过的随机字符串，用于验证访问者的身份。
2. 证书（ca.crt）：Kubernetes API Server 会提供一个 CA（Certificate Authority）证书，该证书用于验证 Kubernetes API Server 的身份，并建立安全的通信。Kubernetes ServiceAccount 中的 ca.crt 是用于校验 Kubernetes API Server CA 证书的证书，使用它能够保证与 Kubernetes API Server 之间通信的安全性。
   - Pod中的ServiceAccount对象是为了授权Pod对Kubernetes API的访问而存在的，其中包含了一个Token和对应的Secret。
   - ServiceAccount对应的Secret中包含了一些重要的信息，其中包括了与该ServiceAccount对应的Token，以及对应的ca证书。这个ca证书是由Kubernetes集群的CA颁发机构签发的，用于验证访问API Server时的TLS连接的合法性。具体来说，当Pod访问Kubernetes API Server时，会使用这个ca证书来验证API Server提供的TLS证书是否合法。
   - 因此，ServiceAccount对应的证书的作用是确保Pod与Kubernetes API Server之间的通信是安全和可靠的，从而防止中间人攻击和欺诈。这个过程只验证了Kubernetes API Server的身份，而没有验证Pod的身份，因此它并不是Pod与API Server之间的双向证书认证。
3. 命名空间（namespace）：命名空间是 Kubernetes 中用于隔离资源的一种方式，它允许多个团队或者项目共享一个 Kubernetes 集群，同时也能保证资源之间的隔离性。Kubernetes ServiceAccount 中的命名空间信息用于指定该 ServiceAccount 所在的命名空间，这有助于确保 ServiceAccount 可以访问所需的资源，并且能够正确地将 Pod 部署到相应的命名空间中。



**每个 ServiceAccount 中都有一个对应的 Secret，Secret 中的 ca证书是由谁签名的**

在 Kubernetes 集群中，每个 ServiceAccount 对应一个 Secret 对象，其中包含了 ServiceAccount 的访问令牌（Token）、命名空间（namespace）以及证书（ca.crt）等信息。这个证书是用于校验 Kubernetes API Server 的 CA（Certificate Authority）证书的，通过这个证书，Pod 可以验证 Kubernetes API Server 的身份，并建立安全的 TLS 连接。

在 Kubernetes 中，API Server 的证书通常由集群的 CA（Certificate Authority）签名。CA 是一个负责签发和管理数字证书的实体，通过数字证书，CA 可以向公众提供一种保护通信安全的手段。在 Kubernetes 中，每个集群都有一个默认的 CA，它负责签发和管理集群中所有的证书，包括 Kubernetes API Server 的证书和 ServiceAccount 的证书等。

因此，在 Kubernetes 中，ServiceAccount 的证书（ca.crt）是由集群的默认 CA 签名的。Pod 使用这个证书来验证 Kubernetes API Server 的证书的有效性，确保建立安全的 TLS 连接。





**什么是双向证书认证**

双向证书认证（Mutual SSL authentication）是一种安全协议，用于在客户端和服务器之间建立双向认证和加密通信。在双向证书认证中，客户端和服务器都要验证对方的身份，而不仅仅是服务器验证客户端。

在传统的SSL/TLS握手中，只有服务器需要提供证书进行验证，而客户端可以选择是否提供证书。但在双向证书认证中，客户端也需要提供证书，以验证其身份。这种方式可以防止中间人攻击和欺诈，并确保通信的安全性和可靠性。

双向证书认证通常用于需要高度安全性的应用程序，例如在线银行、电子商务和政府机构的网站。



**Pod 在访问 API Server 时，使用了 ServiceAccount 对应的 Secret 中的 ca证书，通过该证书访问 API Server 时，实现的是双向证书认证吗**

不完全正确。在Kubernetes中，Pod访问API Server时使用的是ServiceAccount对应的Token，而不是Secret中的ca证书。Token是一种短期的访问凭据，可以代表一个ServiceAccount与API Server进行身份验证和授权。

在Kubernetes中，双向证书认证通常指的是kubelet与API Server之间的身份验证，而不是Pod与API Server之间的身份验证。kubelet是Kubernetes集群中的一个核心组件，负责管理和控制每个节点上的容器。kubelet通过使用其节点上的证书（通常是通过kubelet TLS Bootstrap）来向API Server证明其身份。而API Server使用其自己的证书向kubelet证明其身份。

在Kubernetes中，Pod通过ServiceAccount进行身份验证，而kubelet通过TLS证书进行身份验证。因此，Pod和API Server之间的通信不是双向证书认证。但是，可以通过在Pod中注入TLS证书来实现Pod与其他组件之间的双向证书认证。



# ServiceAccount + RBAC

- ServiceAccount 还可以用于实现基于角色的访问控制 (RBAC)。管理员可以使用 Kubernetes 中的 Role 和 RoleBinding 来授权或拒绝 ServiceAccount 对 Kubernetes API 的访问权限，以确保 Pod 和应用程序只能访问其所需的资源，并提高 Kubernetes 集群的安全性。







# ServiceAccount 在 Pod 中的引用

- 每个 Pod 都会自动关联一个 ServiceAccount
- 最终 ServiceAccount 中的 Secret 会被挂载到 Pod 中，从而允许集群内的进程访问 Kubernetes API

## 使用默认的 ServiceAccount

- 如果 Pod 在定义时，没有明确指定特定的 ServiceAccount，则默认情况下将使用该 Pod 所在名称空间下默认的 ServiceAccount（"default" ServiceAccount）

```yaml
# vim test-pod-dev.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: dev # 指定同名称空间
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      serviceAccountName: default # 相当于省略了此行
      containers:
      - name: nginx
        image: nginx:1.23



# kubectl apply -f test-pod-dev.yaml 
deployment.apps/myapp created



# kubectl get pod -n dev
NAME                     READY   STATUS    RESTARTS   AGE
myapp-69695fb549-bkdvq   1/1     Running   0          7m41s



# kubectl describe deployments.apps -n dev myapp 
Name:                   myapp
Namespace:              dev
...
Pod Template:
  Labels:           app=myapp
  Service Account:  default # 默认的
  Containers:
   nginx:
    Image:        nginx:1.23
...


# kubectl describe pod -n dev myapp-69695fb549-bkdvq 
Name:         myapp-69695fb549-bkdvq
Namespace:    dev
...
Containers:
...
    Mounts: # 挂载点
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-rqb26 (ro)
...
Volumes: # 卷
  kube-api-access-rqb26:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true
...
```

- 进入pod查看挂载具体内容

```sh
# kubectl exec -it -n dev  myapp-69695fb549-bkdvq -- sh


# ls -l /var/run/secrets/kubernetes.io/serviceaccount
total 0
lrwxrwxrwx 1 root root 13 Sep 28 05:33 ca.crt -> ..data/ca.crt
lrwxrwxrwx 1 root root 16 Sep 28 05:33 namespace -> ..data/namespace
lrwxrwxrwx 1 root root 12 Sep 28 05:33 token -> ..data/token



# cat /var/run/secrets/kubernetes.io/serviceaccount/namespace   
dev


# cat /var/run/secrets/kubernetes.io/serviceaccount/token
eyJhbGciOiJSUzI1NiIsIm...



# cat /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
-----BEGIN CERTIFICATE-----
MIIC/jCCAeagAwIBAg...
-----END CERTIFICATE-----
```













## 使用自定义的 ServiceAccount

- 也可以明确指定自定义的 ServiceAccount，在 `Pod.spec.serviceAccountName` 字段指定

### 创建 Pod 测试

```yaml
# vim test-pod-dev.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: dev # 指定同名称空间
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      serviceAccountName: admin-dev # 指定创建的sa
      containers:
      - name: nginx
        image: nginx:1.23



# kubectl apply -f test-pod-dev.yaml 
deployment.apps/myapp created



# kubectl get pod -n dev
NAME                     READY   STATUS    RESTARTS   AGE
myapp-54cb49565c-zr8kh   1/1     Running   0          41s



# kubectl describe deployments.apps -n dev myapp 
Name:                   myapp
Namespace:              dev
...
Pod Template:
  Labels:           app=myapp
  Service Account:  admin-dev # 指定的的
  Containers:
   nginx:
    Image:        nginx:1.23
...




# kubectl describe pod -n dev myapp-54cb49565c-zr8kh
Name:         myapp-54cb49565c-zr8kh
Namespace:    dev
Priority:     0
Node:         k8s-node-1/10.0.0.101
Start Time:   Wed, 28 Sep 2022 15:27:23 +0800
Labels:       app=myapp
              pod-template-hash=54cb49565c
Annotations:  <none>
Status:       Running
IP:           10.244.1.239
IPs:
  IP:           10.244.1.239
Controlled By:  ReplicaSet/myapp-54cb49565c
Containers:
  nginx:
    Container ID:   docker://4a44cc8ead775ad8205664da42499ffda856f508b135914d09ca28b90fcf84a4
    Image:          nginx:1.23
    Image ID:       docker-pullable://nginx@sha256:0b970013351304af46f322da1263516b188318682b2ab1091862497591189ff1
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Wed, 28 Sep 2022 15:27:24 +0800
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts: # 挂载
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-xcsxx (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes: # 卷
  kube-api-access-xcsxx:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    ConfigMapOptional:       <nil>
    DownwardAPI:             true


# kubectl get pod -n dev myapp-54cb49565c-zr8kh -o yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: "2022-09-28T07:27:23Z"
  generateName: myapp-54cb49565c-
  labels:
    app: myapp
    pod-template-hash: 54cb49565c
  name: myapp-54cb49565c-zr8kh
  namespace: dev
  ownerReferences:
  - apiVersion: apps/v1
    blockOwnerDeletion: true
    controller: true
    kind: ReplicaSet
    name: myapp-54cb49565c
    uid: 35eadf1b-b41c-4f82-8216-84ef2831885d
  resourceVersion: "502614"
  uid: 8513b048-20c9-4a4b-bcfd-4324beecaa51
spec:
  containers:
  - image: nginx:1.23
    imagePullPolicy: IfNotPresent
    name: nginx
    resources: {}
    terminationMessagePath: /dev/termination-log
    terminationMessagePolicy: File
    volumeMounts:
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: kube-api-access-xcsxx
      readOnly: true
  dnsPolicy: ClusterFirst
  enableServiceLinks: true
  nodeName: k8s-node-1
  preemptionPolicy: PreemptLowerPriority
  priority: 0
  restartPolicy: Always
  schedulerName: default-scheduler
  securityContext: {}
  serviceAccount: admin-dev
  serviceAccountName: admin-dev
  terminationGracePeriodSeconds: 30
  tolerations:
  - effect: NoExecute
    key: node.kubernetes.io/not-ready
    operator: Exists
    tolerationSeconds: 300
  - effect: NoExecute
    key: node.kubernetes.io/unreachable
    operator: Exists
    tolerationSeconds: 300
  volumes:
  - name: kube-api-access-xcsxx
    projected:
      defaultMode: 420
      sources:
      - serviceAccountToken:
          expirationSeconds: 3607
          path: token
      - configMap:
          items:
          - key: ca.crt
            path: ca.crt
          name: kube-root-ca.crt
      - downwardAPI:
          items:
          - fieldRef:
              apiVersion: v1
              fieldPath: metadata.namespace
            path: namespace
status:
  conditions:
  - lastProbeTime: null
    lastTransitionTime: "2022-09-28T07:27:23Z"
    status: "True"
    type: Initialized
  - lastProbeTime: null
    lastTransitionTime: "2022-09-28T07:27:25Z"
    status: "True"
    type: Ready
  - lastProbeTime: null
    lastTransitionTime: "2022-09-28T07:27:25Z"
    status: "True"
    type: ContainersReady
  - lastProbeTime: null
    lastTransitionTime: "2022-09-28T07:27:23Z"
    status: "True"
    type: PodScheduled
  containerStatuses:
  - containerID: docker://4a44cc8ead775ad8205664da42499ffda856f508b135914d09ca28b90fcf84a4
    image: nginx:1.23
    imageID: docker-pullable://nginx@sha256:0b970013351304af46f322da1263516b188318682b2ab1091862497591189ff1
    lastState: {}
    name: nginx
    ready: true
    restartCount: 0
    started: true
    state:
      running:
        startedAt: "2022-09-28T07:27:24Z"
  hostIP: 10.0.0.101
  phase: Running
  podIP: 10.244.1.239
  podIPs:
  - ip: 10.244.1.239
  qosClass: BestEffort
  startTime: "2022-09-28T07:27:23Z"
```



















