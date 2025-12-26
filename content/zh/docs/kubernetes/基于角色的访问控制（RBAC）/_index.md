---
title: "基于角色的访问控制（RBAC）"
weight: 10
---


# RBAC 概述

- RBAC（Role-Based Access Control）是一种访问控制的策略，通过将访问**权限分配给用户的角色**来控制用户访问系统资源的能力。
- 这种控制方式将用户的权限控制从具体的用户账户中解耦出来，以角色的形式进行组织和分配。
- RBAC是访问控制中广泛应用的一种策略，特别是在信息系统中，如操作系统、数据库管理系统、企业资源规划（ERP）系统等。



**启用 RBAC**

- 要启用 RBAC，请使用 `--authorization-mode = RBAC` 启动 API 服务器。

- 被启用之后，RBAC（基于角色的访问控制）使用 `rbac.authorization.k8s.io` API 组来驱动鉴权决策，从而允许管理员通过 Kubernetes API 动态配置权限策略。

- **通常 RBAC 已默认启用：**

  ```sh
  root@k8s-master-1:# ps aux | grep 'authorization-mode'
  ... kube-apiserver ... --authorization-mod=Node,RBAC ...
  
  root@k8s-master-1:# grep 'authorization-mode' /etc/kubernetes/manifests/kube-apiserver.yaml 
      - --authorization-mode=Node,RBAC # Node是专用于向kubelet授权的，集群管理员无法操作
  ```



**RBAC 组成部分**

- RBAC系统由三个基本组件组成：用户，角色和权限。
  - 用户是系统中的个体，可以通过分配角色来授予用户访问资源的权限。
  - 角色是一组权限的集合，可以分配给一个或多个用户。
  - 权限是一个用户或角色访问资源的具体操作或行为。

- 新建的用户默认是没有任何权限的，RBAC 中可以通过角色定义权限，再将用户与角色进行绑定，进而用户就可以获得角色所授予的权限
  - **用户具有什么权限，取决于角色授予了什么权限**




**RBAC 的优点**

1. 简化访问控制管理：RBAC将权限管理集中在角色上，简化了对每个用户的授权和访问权限的管理。
2. 提高安全性：RBAC可以保证用户只能访问其所需的资源，并防止未经授权的访问。
3. 促进合规性：RBAC提供了一种可追溯的授权机制，可以轻松地证明系统符合特定的合规要求。
4. 增强灵活性：RBAC可以根据组织的需要灵活地调整权限和角色的分配。



**与 RBAC 相关的有四个资源类型，且属于 rbac.authorization.k8s.io 群组**

```sh
# kubectl api-resources --api-group rbac.authorization.k8s.io
NAME                  APIVERSION                     NAMESPACED   KIND
clusterrolebindings   rbac.authorization.k8s.io/v1   false        ClusterRoleBinding
clusterroles          rbac.authorization.k8s.io/v1   false        ClusterRole
rolebindings          rbac.authorization.k8s.io/v1   true         RoleBinding
roles                 rbac.authorization.k8s.io/v1   true         Role
```



**RBAC 参考文档**

- https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authorization/
- https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/rbac/



# 其他 AC

**Linux 中 RBAC 的实现：**

- Linux 的 PAM（Pluggable Authentication Modules）框架支持 RBAC 机制，允许管理员将用户划分为不同的角色，并基于角色来控制用户对系统资源的访问权限。

除了 RBAC（Role-Based Access Control），还有以下几种访问控制（Access Control，AC）的策略：



## MAC

MAC（Mandatory Access Control）强制访问控制：

是一种基于系统级别的安全机制，由系统管理员为每个用户分配安全级别，并根据访问控制规则强制限制用户的访问权限。通常用于高度安全的环境中，如军事、政府和金融等领域。

**场景举例：**

- Linux 中的 SElinux（Security-Enhanced Linux）就是一种基于 MAC（Mandatory Access Control）强制访问控制的安全机制，它对 Linux 操作系统的内核进行扩展，实现了更加细粒度的访问控制。在 SElinux 中，每个进程、文件、目录和网络端口都被赋予一个安全上下文（security context），该安全上下文用于控制对象之间的访问权限。因此，SElinux 可以强制执行更加精细的访问控制，防止未经授权的访问和攻击。



## DAC

DAC（Discretionary Access Control）自主访问控制：

是一种基于对象级别的访问控制机制，允许对象所有者授予或拒绝其他用户对其资源的访问权限。即资源的访问控制权在资源的拥有者手中，资源的所有者可以自由地授予或拒绝访问。

**场景举例：**

- Linux 的文件系统采用 DAC 机制来控制对文件和目录的访问权限。每个文件和目录都有一个所有者和一组用户和组的权限设置，决定了谁可以读取、写入和执行该文件或目录。



## ABAC

ABAC（Attribute-Based Access Control）基于属性的访问控制：

- 是一种基于属性的动态访问控制机制，根据用户或资源的属性来控制对资源的访问。可以基于多个属性和条件进行访问控制决策。

**场景举例：**

- kubernetes 中就支持 ABAC 基于属性的访问控制，对k8s资源中某个字段进行访问控制，实现复杂。
  - ABAC 是一种更加灵活的访问控制模型，它可以根据用户、资源和环境属性来控制访问权限。在 ABAC 模型中，每个用户、资源和环境都有一组属性，当一个用户尝试访问一个资源时，系统会检查用户的属性是否满足该资源所定义的属性要求。如果满足要求，则用户将被授予访问权限。
  - 与 RBAC 相比，ABAC 更加细粒度、灵活，可以根据更多的条件进行控制，但是它也需要更多的配置和管理。在 Kubernetes 中，可以使用 Open Policy Agent（OPA）等工具来实现 ABAC 模型。

- 云计算环境：ABAC 可以基于云服务用户的属性和安全策略来控制对云资源的访问权限。例如，在云环境中，管理员可以基于用户的身份、角色、地理位置、时间、设备和网络连接等属性来实施访问控制策略。
- 大型组织：在大型组织中，ABAC 可以基于员工的属性和角色来控制对内部资源的访问权限。例如，管理员可以基于员工的部门、职位、工作职责、资格和执照等属性来实施访问控制策略。
- 物联网环境：在物联网环境中，ABAC 可以基于设备和传感器的属性和安全策略来控制对 IoT 资源的访问权限。例如，管理员可以基于设备的型号、制造商、配置和网络连接等属性来实施访问控制策略。



## RB-RBAC

RB-RBAC（Role-Based Relationship-Based Access Control）基于关系的角色访问控制：

- 是一种基于关系的动态访问控制机制，允许管理员授予用户在特定关系上的角色权限，如父子关系、雇员-管理者关系等。
- RB-RBAC（Relationship-Based Role-Based Access Control）是一种基于角色和关系的访问控制机制。在 RB-RBAC 中，访问控制策略不仅基于用户的角色，还基于用户之间的关系，如所属团队、部门或项目组等。它的实现场景包括以下几个方面：
  - 企业协作环境：在企业协作环境中，RB-RBAC 可以基于用户的角色和所属团队来控制对企业内部资源的访问权限。例如，在一个企业协作平台中，管理员可以基于用户的角色（如管理员、编辑、作者等）和所属团队（如市场、销售、研发等）来实施访问控制策略。
  - 社交网络应用：在社交网络应用中，RB-RBAC 可以基于用户之间的关系来控制对用户个人资料、消息和社交圈子等资源的访问权限。例如，在一个社交网络应用中，管理员可以基于用户的角色（如好友、关注者、粉丝等）和关系（如朋友、家人、同事等）来实施访问控制策略。
  - 金融服务应用：在金融服务应用中，RB-RBAC 可以基于客户和交易之间的关系来控制对金融资源的访问权限。例如，在一个银行服务应用中，管理员可以基于客户的角色（如普通客户、VIP客户等）和交易的关系（如借款、投资、汇款等）来实施访问控制策略。



## PBAC

PBAC（Policy-Based Access Control）策略访问控制：

- 是一种基于策略的访问控制机制，允许管理员定义复杂的策略来控制资源的访问。策略可以基于多个条件和属性，包括时间、位置、角色和安全级别等。
- PBAC（Policy-Based Access Control）是一种基于策略的访问控制机制。在 PBAC 中，访问控制策略是由政策（policy）定义的，政策包括访问控制规则、访问请求的属性和环境信息等。它的实现场景包括以下几个方面：
  - 云计算环境：在云计算环境中，PBAC 可以基于云服务提供商的政策来控制对云资源的访问权限。例如，在云环境中，管理员可以基于云服务提供商的政策来实施访问控制策略，政策可以包括访问控制规则、访问请求的属性和环境信息等。
  - 大型组织：在大型组织中，PBAC 可以基于组织的政策来控制对内部资源的访问权限。例如，管理员可以基于组织的政策来实施访问控制策略，政策可以包括访问控制规则、访问请求的属性和环境信息等。
  - 物联网环境：在物联网环境中，PBAC 可以基于设备和传感器的政策来控制对 IoT 资源的访问权限。例如，管理员可以基于设备和传感器的政策来实施访问控制策略，政策可以包括访问控制规则、访问请求的属性和环境信息等。



# ---



# RBAC 实现流程简述

1. 新建用户（UserAccount | ServiceAccount）
2. 创建 Role、ClusterRole，在其中定义 rules 授权规则（apiGroups、resources、verbs）
   - Role 是名称空间级别授权，ClusterRole 是集群级别授权
3. 最后使用 RoleBinding、ClusterRoleBinding 将用户与角色进行绑定，进而用户就可以获得角色所授予的权限
   - 用户可以与多个角色绑定，从而获得多个不同的权限。



# Role & ClusterRole

- Role 与 ClusterRole 都可以为用户定义权限，因此，**最后用户具有什么权限取决于绑定了什么角色！**
- 需要注意的是，下面的 Example 中只是一些常见的 Kubernetes Role 定义，实际上每个团队和组织都可能有不同的安全要求和角色定义。因此，在定义 Kubernetes Role 时，应该根据实际需求进行调整，并进行适当的测试和审查。

## Role

- 角色，名称空间作用域

### Role Explain

- Role 用来在某个 namespace 内设置访问权限，因此在创建 Role 时，必须指定该 Role 所属的 namespace 

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: my-ns # 角色所在的命名空间
  name: my-role # 角色的名称
rules <[]Object> # 角色的授权规则，一个包含多个授权规则的列表。
- apiGroups <[]string> # 允许访问的 API 组。例如，"apps" 表示可以访问 Kubernetes 中所有应用程序相关的 API，例如 Deployments、StatefulSets 等。
  nonResourceURLs <[]string> # 允许访问的非资源型 URL。例如，"/healthz" 表示可以访问 Kubernetes 健康检查的 API。
  resourceNames <[]string> # 允许访问的某个特定资源下的单个对象。例如，"pods/mypod" 表示可以访问 Kubernetes 中名为 mypod 的 Pod。
  resources <[]string> # 允许访问的资源类型。例如，"pods" 表示可以访问 Kubernetes 中所有的 Pod 资源。
  verbs <[]string> -required- # 允许执行的动作。例如，"get" 表示可以访问资源的 GET 方法，"*" 表示可以访问该资源的所有方法。该字段是必选项，至少需要指定一个动作。
```

#### apiGroups

- `apiGroups` 是定义 Kubernetes API 组的字段。在 Role 中，它用于定义允许访问的 API 组。API 组可以定义多个。
- 来自 kubectl api-resources 中的 APIVERSION 列，例如：

```yaml
apiGroups: ["apps"] # 包含 Deployments、StatefulSets、DaemonSets 等应用程序相关的资源

apiGroups: ["batch"] # 包含 Jobs 和 CronJobs 资源

apiGroups: ["networking.k8s.io"] # 包含 NetworkPolicies 和 Ingress 类型的资源

apiGroups: ["rbac.authorization.k8s.io"] # 包含 Role、ClusterRole、RoleBinding 和 ClusterRoleBinding 资源，用于授权和访问控制

apiGroups: ["apps", "batch"] # API 组可以定义多个，apps和batch群组

apiGroups: ["*"] # 所有群组语法一

apiGroups: [""] # 所有群组语法二
```

#### resources

- 针对apiGroups定义的群组下的哪些资源，可以定义多个。

```yaml
resources: ["pod/log"] # "pod/log"表示只能对pod下的日志进行操作

resources: ["deployments", "pod/log"] # 可以定义多个

resources: ["*"] # 所有资源
```

- 要获取当前 Kubernetes 集群中所有可用的 API 组列表，可以使用 `kubectl api-resources` 命令。该命令将列出所有 API 组及其包含的资源类型，以及它们的缩写、是否可读写等信息。

  - 主要关注输出中的 NAME 列

  - **注意：必须和 kubectl api-resources 中的 NAME 列完全匹配，否则不匹配不会报错，但将无法获得相关权限**

    - ```yaml
      # 应为pods
      # kubectl api-resources --api-group=''
      NAME                     SHORTNAMES   APIVERSION   NAMESPACED   KIND
      ...
      pods                     po           v1           true         Pod
      ...
      
      
      # 定义podsss也不会报错
      # kubectl describe role -n kube-system  jamesazheng
      Name:         jamesazheng
      Labels:       <none>
      Annotations:  <none>
      PolicyRule:
        Resources  Non-Resource URLs  Resource Names  Verbs
        ---------  -----------------  --------------  -----
        podsss     []                 []              [get watch list]
      
      
      # 但无法访问
      # kubectl get pod -n kube-system --kubeconfig=/etc/kubernetes/users/jamesazheng/jamesazheng.conf 
      Error from server (Forbidden): pods is forbidden: User "jamesazheng" cannot list resource "pods" in API group "" in the namespace "kube-system"
      
      
      # 定义为正确的pods
      # kubectl describe role -n kube-system  jamesazheng
      Name:         jamesazheng
      Labels:       <none>
      Annotations:  <none>
      PolicyRule:
        Resources  Non-Resource URLs  Resource Names  Verbs
        ---------  -----------------  --------------  -----
        pods       []                 []              [get watch list]
      
      
      # 可以访问
      # kubectl get pod -n kube-system --kubeconfig=/etc/kubernetes/users/jamesazheng/jamesazheng.conf 
      NAME                                   READY   STATUS    RESTARTS         AGE
      coredns-65c54cc984-8sfk8               1/1     Running   40 (2d8h ago)    113d
      coredns-65c54cc984-fpv5f               1/1     Running   41 (2d8h ago)    113d
      etcd-k8s-master-1                      1/1     Running   38 (2d8h ago)    113d
      kube-apiserver-k8s-master-1            1/1     Running   38 (2d8h ago)    113d
      kube-controller-manager-k8s-master-1   1/1     Running   89 (62m ago)     113d
      kube-proxy-hh5ph                       1/1     Running   12 (2d23h ago)   108d
      kube-proxy-l9qnk                       1/1     Running   35 (2d23h ago)   111d
      kube-proxy-wpjtz                       1/1     Running   36 (2d8h ago)    111d
      kube-scheduler-k8s-master-1            1/1     Running   99 (62m ago)     113d
      ```




#### verbs

[鉴权概述 | Kubernetes](https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/authorization/#determine-the-request-verb)

- Verb 动词，动作，能接受施加Verb的目标有resources、resourceNames、nonResourceURLs
- **Verb 用于指定该 Role 允许执行的动作或操作。以下是常见的几个动作及其含义：**
  - `get`：获取一个或多个资源对象的信息。
  - `list`：列出所有符合指定条件的资源对象。
  - `watch`：监视符合指定条件的资源对象的变化，并在变化发生时获取相关信息。
  - `create`：创建一个新的资源对象。
  - `update`：更新现有的资源对象的信息。
  - `patch`：部分更新现有的资源对象的信息。
  - `delete`：删除一个或多个资源对象。
- **一些特殊的 HTTP 命令动作（HTTP Verbs），用于执行一些特殊的操作：**
  - `proxy`：`proxy` 命令用于代理请求到一个运行中的 Pod 或 Service 上。通常，它用于获取一个正在运行的容器的日志或执行一个 shell 命令。该动作可以在 Role 中授予相应的权限，以允许某个用户或组执行代理请求的操作。
  - `redirect`：`redirect` 命令用于重定向请求到另一个资源或 URL 上。通常，它用于将客户端请求重定向到一个不同的服务或 API，或者重定向到一个不同的 URL 上。该动作可以在 Role 中授予相应的权限，以允许某个用户或组执行重定向请求的操作。
  - `deletecollection`：`deletecollection` 命令用于删除多个资源对象，通常用于删除一个命名空间中的所有资源对象。该动作可以在 Role 中授予相应的权限，以允许某个用户或组执行删除多个资源对象的操作。
  - PS：需要注意的是，这些特殊的 HTTP 命令动作可能会涉及到系统安全和资源访问控制等方面的问题，因此在授权时应该谨慎考虑，并根据实际需求和安全性进行授权。

- **Kubernetes 有时使用专门的动词以对额外的权限进行鉴权。例如：**
  - PodSecurityPolicy：`policy` API 组中 `podsecuritypolicies` 资源使用 `use` 动词
  - RBAC：对 `rbac.authorization.k8s.io` API 组中 `roles` 和 `clusterroles` 资源的 `bind` 和 `escalate` 动词
  - 身份认证：对核心 API 组中 `users`、`groups` 和 `serviceaccounts` 以及 `authentication.k8s.io` API 组中的 `userextras` 所使用的 `impersonate` 动词。

- **在 Role 中，可以为每个资源对象定义不同的 `verbs`，以控制对该对象的访问权限。例如：**
  - 为 Deployment 资源指定 `get`、`list`、`watch` 和 `update`
  - 为 Pod 资源指定 `get`、`list`、`watch` 和 `delete`。
- 需要注意的是，在定义 `verbs` 时应该根据实际需求和安全性考虑，**不要授予过多的权限**，以避免可能的安全风险。



**HTTP 动词 和 Verbs 对照表**

- 针对集合，可以理解为针对全部资源（但具体来说，针对集合指的是特定类型的所有资源，而不是所有的资源）

| HTTP 动词 | 请求动词                                             |
| --------- | ---------------------------------------------------- |
| POST      | create                                               |
| GET, HEAD | get （针对单个资源）、list（针对集合）               |
| PUT       | update                                               |
| PATCH     | patch                                                |
| DELETE    | delete（针对单个资源）、deletecollection（针对集合） |

需要注意的是，不是所有的 HTTP 动词都可以对应 Kubernetes 中的 Verbs。在授权时应该根据实际需求和安全性考虑，并授权相应的 Verbs。



#### 疑问解答

**即便设置了 apiGroups: [""] 和 verbs: ["*"]，但未设置 resources: 是不是依旧无法对所有群组下的任何和资源进行任何操作，是不是也就意味着是安全的**

- 是的，在这种情况下，角色允许对所有API组执行任何操作，但是它没有指定任何资源，因此不会授予对任何资源的访问等权限。



### Role Example - 1

- 该 Kubernetes Role 对象定义了在 `kube-system` 命名空间中名为 `jamesazheng` 的角色。该角色授予用户或服务帐户对于 `core` API 组中的 `pod` 资源执行 `get`, `watch`, `list` 操作的权限。
- 换句话说，具有该角色的用户或服务帐户可以在 `kube-system` 命名空间中读取和监视 `pod` 资源的信息。但是，他们不能进行任何修改或删除操作。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: kube-system
  name: jamesazheng
rules:
- apiGroups: [""] # 核心群组
  resources: ["pod"] # 核心群组中的pod资源
  verbs: ["get", "watch", "list"] # 可以执行以下操作
```

### Role Example - 2

- 该 Kubernetes Role 对象定义了在 `development` 命名空间中名为 `dev-role` 的角色。该角色授予用户或服务帐户对于 `apps` API 组中的 `deployments` 和 `pod/log` 资源执行 `get`, `watch`, `list` 操作的权限。
- 换句话说，具有该角色的用户或服务帐户可以在 `development` 命名空间中读取和监视 `deployments` 和 `pod` 的日志。但是，他们不能进行任何修改或删除操作。需要注意的是，该 Role 对象只授权了 `pod` 的日志读取权限，而没有授权 `pod` 的其他操作权限。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: development
  name: dev-role
rules:
- apiGroups: ["apps"]
  resources: ["deployments", "pod/log"]
  verbs: ["get", "watch", "list"]
```

### Role Example - 3

- 实现了针对某名称空间的最大权限
- 该 Kubernetes Role 对象定义了在 `project-1` 命名空间中名为 `pod-reader` 的角色。该角色授予用户或服务帐户对于任何 API 组中的任何资源执行任何操作的权限。
- 换句话说，具有该角色的用户或服务帐户可以在 `project-1` 命名空间中读取、创建、修改和删除任何资源。这是一种高度特权的角色，可能会对 Kubernetes 系统和应用程序造成潜在的安全风险。因此，不应该在生产环境中随意使用该角色。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: project-1
  name: pod-reader
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
```



### Role Example - view

- 该角色允许用户或服务帐户查看特定命名空间中的所有资源，但不能修改或删除这些资源。该角色通常被用于开发人员或 QA 团队，以便他们可以查看生产环境中的资源。

```yaml
# 该角色允许在 my-namespace 命名空间中的用户或服务帐户查看 pods, services 和 configmaps 资源的信息，但不能进行修改或删除操作。
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: my-namespace
  name: my-view-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
```



### Role Example - edit

- 该角色允许用户或服务帐户查看和修改特定命名空间中的所有资源，但不能删除这些资源。该角色通常被用于部署应用程序或更改配置。

```yaml
# 该角色允许在 my-namespace 命名空间中的用户或服务帐户查看、创建、修改、更新、部分更新 pods, services 和 configmaps 资源的信息，但不能进行删除操作。
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: my-namespace
  name: my-edit-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]
```



### Role Example - admin

- 该角色允许用户或服务帐户在特定命名空间中执行所有操作，包括创建、修改、删除资源。该角色通常被用于 DevOps 团队或系统管理员，以便他们可以对生产环境进行管理。

```yaml
# 该角色允许在 my-namespace 命名空间中的用户或服务帐户查看、创建、修改、更新、部分更新和删除 pods, services 和 configmaps 资源的信息。
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: my-namespace
  name: my-admin-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```





## ClusterRole

- 集群角色，集群作用域
- **需要注意的是 ClusterRole 中定义的权限必须是非命名空间特定的（non-namespaced），即不能限制到特定的命名空间。**

### ClusterRole Explain

- ClusterRole的结构与Role非常相似，ClusterRole是一种集群级别的资源，可以用于定义整个集群中的权限
- 但 ClusterRole 没有`namespace`字段，因为它在整个集群范围内起作用。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole # 类型为 ClusterRole
metadata:
  name: my-cluster-role # 角色名称
rules <[]Object> # 角色授权规则，一个包含多个授权规则的列表。
- apiGroups <[]string> # 允许访问的 API 组。例如，"apps" 表示可以访问 Kubernetes 中所有应用程序相关的 API，例如 Deployments、StatefulSets 等。
  nonResourceURLs <[]string> # 允许访问的非资源型 URL。例如，"/healthz" 表示可以访问 Kubernetes 健康检查的 API。
  resourceNames <[]string> # 允许访问的某个特定资源下的单个对象。例如，"pods/mypod" 表示可以访问 Kubernetes 中名为 mypod 的 Pod。
  resources <[]string> # 允许访问的资源类型。例如，"pods" 表示可以访问 Kubernetes 中所有的 Pod 资源。
  verbs <[]string> -required- # 允许执行的动作。例如，"get" 表示可以访问资源的 GET 方法，"*" 表示可以访问该资源的所有方法。该字段是必选项，至少需要指定一个动作。
```





### ClusterRole Example - 1

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  # "namespace" 被忽略，因为 ClusterRoles 不受名字空间限制
  name: secret-reader
rules:
- apiGroups: [""]
  # 在 HTTP 层面，用来访问 Secret 资源的名称为 "secrets"
  resources: ["secrets"]
  verbs: ["get", "watch", "list"]
```



###  内置 ClusterRole - admin

- 名称空间级别资源的管理员权限
- 具有**所有名称空间级别**资源最大的权限，包括创建删除等，但对PV就无法进行任何操作，因为PV是集群级别资源）

```yaml
# kubectl get clusterrole admin -o yaml 
aggregationRule:
  clusterRoleSelectors:
  - matchLabels:
      rbac.authorization.k8s.io/aggregate-to-admin: "true"
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
  creationTimestamp: "2022-09-12T16:02:05Z"
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
  name: admin
  resourceVersion: "1742096"
  uid: 816dfff5-b535-4acc-a88b-872c31963b70
rules:
- apiGroups:
  - ""
  resources:
  - pods/attach
  - pods/exec
  - pods/portforward
  - pods/proxy
  - secrets
  - services/proxy
  verbs:
  - get
  - list
  - watch
- apiGroups:
  - ""
  resources:
  - serviceaccounts
  verbs:
  - impersonate
...
```



### 内置 ClusterRole - cluster-admin

- 集群管理员，具有集群级别的最大权限
- 具有**集群级别**的最大的权限
- 该角色允许用户或服务帐户在整个 Kubernetes 群集中执行所有操作，包括创建、修改、删除资源。该角色是最高权限的角色，应该只授予必要的人员。

```yaml
# 该角色允许在整个 Kubernetes 群集中的用户或服务帐户执行任何操作，包括创建、修改、删除任何资源，因为该角色是一个集群级别的角色，不需要指定命名空间。需要谨慎使用，只授权必要的人员。
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: my-cluster-admin-role
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
```



## Role 和 ClusterRole 区别

**ClusterRole 可以对 PV 这种集群级别进行授权，而 Role 不可以**

- 在Kubernetes中，PV（PersistentVolume）是一种集群级别的资源，而不是命名空间级别的资源。因此，只有ClusterRole可以授权对PV资源进行操作，而Role则无法对其进行授权。
- 要授权对PV进行操作，可以使用ClusterRole和ClusterRoleBinding，如下所示：

```yaml
# 下面的示例创建了一个名为pv-manager的ClusterRole，它授权了get、list、watch、create和delete操作，这些操作可以用于PersistentVolume资源。然后，创建了一个名为pv-manager-binding的ClusterRoleBinding，它将角色绑定到用户alice上。这样，alice就可以对集群中的PersistentVolume资源执行授权的操作。
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: pv-manager
rules:
- apiGroups: [""] # 对所有API组授权
  resources: ["persistentvolumes"] # 授权对PV资源进行操作
  verbs: ["get", "list", "watch", "create", "delete"] # 授权的操作类型

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: pv-manager-binding
subjects:
- kind: User
  name: alice # 将角色绑定到用户 alice
roleRef:
  kind: ClusterRole
  name: pv-manager # 引用上面定义的ClusterRole
  apiGroup: rbac.authorization.k8s.io
```





# RoleBinding & ClusterRoleBinding

- 角色绑定将角色中定义的权限赋予一个或者一组用户

## RoleBinding

- RoleBinding 在指定的名字空间中执行授权
- 一个 RoleBinding 可以引用同一的名字空间中的任何 Role
- 角色绑定，指是将用户与角色关联起来，意味着，用户仅得到了特定名称空间下的Role的权限，作用范围也限于该名称空间；
- RoleBinding 的作用是将一个或多个对象与一个 Role 或 ClusterRole 绑定起来，使这些对象获得 Role 或 ClusterRole 的权限。例如，将一个 ServiceAccount 绑定到一个 Role 上，这个 ServiceAccount 就能够访问该 Role 的授权资源。
- 通过 RoleBinding 绑定的对象可以访问与 Role 或 ClusterRole 相关的资源，例如在上面的例子中，被绑定的 ServiceAccount 就可以访问与该 Role 相关的资源。

### RoleBinding  Explain

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: my-role-binding # RoleBinding 的名称
  namespace: my-ns # RoleBinding 所在的命名空间（也是所需 Role 所在的 namespace）
subjects <[]Object> # 定义绑定角色的用户信息，可以是用户、服务帐户或组
- kind <string> # 用户的类型，如 User、Group 或 ServiceAccount。
  name <string> # 用户的名称。
  apiGroup <string> # 用户所在的 API 组，如果未指定则为空字符串。
  namespace <string> # 用户所在的 namespace，如果类型为User可以不写，但ServiceAccount这种名称空间级别资源必须写roleRef <Object> # 定义用户与某角色的绑定关系
  kind <string> # 角色的类型，必须是 Role 或 ClusterRole。
  name <string> # 角色的名称。此字段必须与你要绑定的 Role 或 ClusterRole 的名称匹配
  apiGroup <string> # 角色所在的 API 组，如果未指定则为空字符串。也可以指定如：rbac.authorization.k8s.io
```



### RoleBinding  Example - Roles

User --> RoleBinding --> Roles

- 用户使用 RoleBinding 和角色进行绑定，用户将获得角色所处的名称空间级别的授权
- 用户使用 RoleBinding 来将自己与一个 Role 对象绑定在一起。绑定完成后，用户将获得该 Role 所分配的权限，这些权限仅在 Role 所处的命名空间内有效。因此，用户只能访问 Role 所在的命名空间中的资源，并且只能执行该 Role 允许的操作。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-rolebinding
  namespace: development
subjects:
- kind: ServiceAccount
  name: dev-user # 将 dev-user 这个 ServiceAccount
  namespace: development
roleRef:
  kind: Role
  name: dev-role # 与 dev-role 这个 Role 进行绑定，最终 dev-user 会被授予 dev-role 所定义的授权
  apiGroup: rbac.authorization.k8s.io
```





### RoleBinding  Example - ClusterRole

User --> Rolebindig --> ClusterRole

- 用户使用 RoleBinding 和集群角色进行绑定，这种方式会导致**权限降级**，用户只能获得 RoleBinding 所在名称空间级别的授权
  - 虽然 ClusterRoles 可以定义集群级别的权限，但 RoleBinding 会限制其作用域仅为 RoleBinding 所在名称空间
- 如果在定义 RoleBinding 时**指定了特定的命名空间**，那么使用 RoleBinding 和 ClusterRole 进行绑定时，用户只能获得该命名空间下的集群级别授权，而不能获得整个集群范围的授权。
- **RoleBinding 中的命名空间属性会限制 ClusterRole 的作用域，使其仅在特定的命名空间生效。**因此，当一个用户与一个 ClusterRole 进行绑定时，如果 RoleBinding 的命名空间属性设置为特定的命名空间，那么该用户只能在该命名空间中拥有集群级别的权限，而不能在其他命名空间或整个集群中拥有这些权限。
- 这种引用使得你可以跨整个集群定义一组通用的角色， 之后在多个名字空间中复用。

```yaml
# 此角色绑定使得用户 "dave" 只能读取 "development" 名字空间中的 Secrets
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-secrets
  namespace: development # 限制名称空间作用域，仅在 "development" 名字空间内具有访问权限。
subjects: # 将名为 dave 的 ServiceAccount
- kind: ServiceAccount
  name: dave
  apiGroup: rbac.authorization.k8s.io
roleRef: # 绑定到名为 "secret-reader" 的 ClusterRole
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```



## ClusterRoleBinding

- 集群角色绑定，让用户扮演指定的集群角色；意味着，用户得到了是集群级别的权限，作用范围也是集群级别；

### ClusterRoleBinding Explain

- 和 RoleBinding 类似，ClusterRoleBinding 是将用户、服务帐户或组和 ClusterRole 进行绑定，从而给予它们访问 Kubernetes 集群级别资源的权限。
- 在 ClusterRoleBinding 中，还需要指定 subjects 所在的命名空间。因为 ClusterRole 是集群级别的权限，它的访问范围超出了任何单个命名空间，因此在绑定 ClusterRole 时需要额外指定 subjects 所在的命名空间。
- 另外，ClusterRoleBinding 中的 roleRef 也与 RoleBinding 稍有不同，它是引用一个 ClusterRole 对象，其 kind 必须为 ClusterRole。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: my-cluster-role-binding # ClusterRoleBinding 的名称
subjects <[]Object> # 定义绑定角色的用户信息，可以是用户、服务帐户或组
- kind <string> # 用户的类型，如 User、Group 或 ServiceAccount
  name <string> # 用户的名称
  namespace <string> # 用户所在的 namespace，如果类型为User可以不写，但ServiceAccount这种名称空间级别资源必须写
roleRef <Object> # 定义用户与某角色的绑定关系
  kind <string> # 角色的类型，必须是 ClusterRole。
  name <string> # 角色的名称。此字段必须与你要绑定的 ClusterRole 的名称匹配
  apiGroup <string> # 角色所在的 API 组，如果未指定则为空字符串。也可以指定如：rbac.authorization.k8s.io
```





### ClusterRoleBinding Example - ClusterRoles

- 此集群角色绑定允许 “manager” 组中的任何人访问任何名字空间中的 Secret 资源

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-secrets-global
subjects:
- kind: Group
  name: manager
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```



# ---

# 范例：默认的 kubernetes-admin 用户

- k8s集群安装后，默认的 kubernetes-admin 用户拥有最大的权限，因为其加入到了system:masters组中；
- 而system:masters组，被clusterrolebinding绑定到了cluster-admin这个集群角色上；
- 而cluster-admin这个集群角色，具有集群级别最高的管理权限，因此kubernetes-admin用户就拥有了最高权限

```yaml
# k8s集群安装后，默认的kubeconfig
# kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.0.0.100:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
kind: Config
preferences: {}
users:
- name: kubernetes-admin
  user:
    client-certificate-data: REDACTED # 将此用户证书的base64编码解码后，导出到1.txt文件中
    client-key-data: REDACTED


# 而后使用openssl x509 -in 1.txt -text命令会得到以下内容：
# openssl x509 -in 1.txt -text 
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1552321468713633179 (0x158af426b7e3859b)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN = kubernetes
        Validity
            Not Before: Sep 12 16:01:40 2022 GMT
            Not After : Sep 12 16:01:43 2023 GMT
        Subject: O = system:masters, CN = kubernetes-admin # 默认的kubernetes-admin用户加入到了system:masters组中
...


# 而system:masters组，被clusterrolebinding绑定到了cluster-admin这个集群角色上
# kubectl describe clusterrolebinding cluster-admin
Name:         cluster-admin
Labels:       kubernetes.io/bootstrapping=rbac-defaults
Annotations:  rbac.authorization.kubernetes.io/autoupdate: true
Role:
  Kind:  ClusterRole
  Name:  cluster-admin
Subjects:
  Kind   Name            Namespace
  ----   ----            ---------
  Group  system:masters  
  

# 而cluster-admin这个集群角色，具有集群级别最高的管理权限，因此kubernetes-admin用户就拥有了最高权限
# kubectl describe clusterrole cluster-admin
Name:         cluster-admin
Labels:       kubernetes.io/bootstrapping=rbac-defaults
Annotations:  rbac.authorization.kubernetes.io/autoupdate: true
PolicyRule:
  Resources  Non-Resource URLs  Resource Names  Verbs
  ---------  -----------------  --------------  -----
  *.*        []                 []              [*]
             [*]                []              [*]
# kubectl get clusterrole cluster-admin -o yaml 
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-admin
...
rules:
- apiGroups:
  - '*'
  resources:
  - '*'
  verbs:
  - '*'
- nonResourceURLs:
  - '*'
  verbs:
  - '*'
```



# ---



# 范例：Role + RoleBinding

## User

- User 即对 UserAccount 实现

### 基于命令行

- xxx

### 基于 yaml 清单

#### 准备用户

- 创建useraccount过程省略

```yaml
# kubectl config view --kubeconfig=/etc/kubernetes/users/jamesazheng/jamesazheng.conf 
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.0.0.100:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: jamesazheng
  name: kubernetes@jamesazheng
current-context: kubernetes@jamesazheng
kind: Config
preferences: {}
users:
- name: jamesazheng
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED


# 默认是没有权限访问的
# kubectl get pod -n kube-system --kubeconfig=/etc/kubernetes/users/jamesazheng/jamesazheng.conf 
Error from server (Forbidden): pods is forbidden: User "jamesazheng" cannot list resource "pods" in API group "" in the namespace "kube-system"
```

#### Role

##### yaml

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: kube-system
  name: jamesazheng
rules:
- apiGroups: [""] # 核心群组
  resources: ["pods"] # 核心群组中的pod资源
  verbs: ["get", "watch", "list"] # 可以执行以下操作
```

##### 验证

```yaml
# kubectl get role -n kube-system  jamesazheng 
NAME          CREATED AT
jamesazheng   2023-01-04T11:10:46Z


# kubectl describe role -n kube-system  jamesazheng 
Name:         jamesazheng
Labels:       <none>
Annotations:  <none>
PolicyRule:
  Resources  Non-Resource URLs  Resource Names  Verbs
  ---------  -----------------  --------------  -----
  pods       []                 []              [get watch list]


# 未进行RoleBinding，因此还是没有权限
# kubectl get pod -n kube-system --kubeconfig=/etc/kubernetes/users/jamesazheng/jamesazheng.conf 
Error from server (Forbidden): pods is forbidden: User "jamesazheng" cannot list resource "pods" in API group "" in the namespace "kube-system"
```

#### RoleBinding

##### yaml

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: jamesazheng
  namespace: kube-system
subjects: # 指定用户
- kind: User
  name: jamesazheng
  apiGroup: rbac.authorization.k8s.io
roleRef: # 指定对应的Role
  kind: Role
  name: jamesazheng
  apiGroup: rbac.authorization.k8s.io
```

##### 验证

```yaml
# kubectl get rolebinding -n kube-system jamesazheng 
NAME          ROLE               AGE
jamesazheng   Role/jamesazheng   33s


# kubectl describe rolebinding -n kube-system jamesazheng 
Name:         jamesazheng
Labels:       <none>
Annotations:  <none>
Role:
  Kind:  Role
  Name:  jamesazheng
Subjects:
  Kind  Name         Namespace
  ----  ----         ---------
  User  jamesazheng  kube-system


# OK!
# kubectl get pod -n kube-system --kubeconfig=/etc/kubernetes/users/jamesazheng/jamesazheng.conf 
NAME                                   READY   STATUS    RESTARTS         AGE
coredns-65c54cc984-8sfk8               1/1     Running   40 (2d8h ago)    113d
coredns-65c54cc984-fpv5f               1/1     Running   41 (2d8h ago)    113d
etcd-k8s-master-1                      1/1     Running   38 (2d8h ago)    113d
kube-apiserver-k8s-master-1            1/1     Running   38 (2d8h ago)    113d
kube-controller-manager-k8s-master-1   1/1     Running   89 (62m ago)     113d
kube-proxy-hh5ph                       1/1     Running   12 (2d23h ago)   108d
kube-proxy-l9qnk                       1/1     Running   35 (2d23h ago)   111d
kube-proxy-wpjtz                       1/1     Running   36 (2d8h ago)    111d
kube-scheduler-k8s-master-1            1/1     Running   99 (62m ago)     113d
```



## ServiceAccount

- ServiceAccount 即对 UserAccount 实现

### 基于 yaml 清单

#### 创建 serviceaccount

- **创建一个用户以便和 Role Binding**

- 在 project-1 namespace 中创建一个 azheng 用户

```bash
# kubectl create serviceaccount azheng -n project-1 
serviceaccount/azheng created


# kubectl get serviceaccounts -n project-1 
NAME      SECRETS   AGE
azheng    0         80s
default   0         133m
```



#### 创建 Role

- **创建一个 Role 以定义访问规则**

```yaml
# vim /data/k8s-user/role/project-1-role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: project-1
  name: project-1-role
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "watch", "list"]


# kubectl apply -f /data/k8s-user/role/project-1-role.yaml
role.rbac.authorization.k8s.io/project-1-role created


# kubectl get role -n project-1 
NAME         CREATED AT
project-1-role   2022-07-22T14:31:30Z


# kubectl describe role -n project-1 
Name:         project-1-role
Labels:       <none>
Annotations:  <none>
PolicyRule:
  Resources         Non-Resource URLs  Resource Names  Verbs
  ---------         -----------------  --------------  -----
  deployments.apps  []                 []              [get watch list]
```



#### 创建 RoleBinding

- **将 User 和 Role 进行绑定，User 可以指定多个**

```yaml
# vim /data/k8s-user/role/project-1-rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: project-1-rolebinding
  namespace: project-1
subjects: # 指定用户
- kind: ServiceAccount
  name: azheng
  namespace: project-1
roleRef: # 指定对应的Role
  kind: Role
  name: project-1-role
  apiGroup: rbac.authorization.k8s.io
  
  
# kubectl apply -f /data/k8s-user/role/project-1-rolebinding.yaml
rolebinding.rbac.authorization.k8s.io/project-1-rolebinding created


# kubectl get rolebindings.rbac.authorization.k8s.io -n project-1 
NAME                    ROLE                  AGE
project-1-rolebinding   Role/project-1-role   12s



# kubectl describe rolebindings.rbac.authorization.k8s.io -n project-1 
Name:         project-1-rolebinding
Labels:       <none>
Annotations:  <none>
Role:
  Kind:  Role
  Name:  project-1-role
Subjects:
  Kind            Name    Namespace
  ----            ----    ---------
  ServiceAccount  azheng  project-1
```

#### 验证

```bash
# 获取 azheng 用户的 token
# kubectl -n project-1 create token azheng
...


# 打开浏览器进行访问，修改 url 中的 namespace
如：https://10.0.0.100:30054/#/pod?namespace=project-1
```





## Group

- ...





# 范例：ClusterRole + ClusterRoleBinding

## User

### 基于命令行

```sh
# jamesazheng-admin为clusterrolebinding的名称，--user=指定的user，--clusterrole=指定的集群角色
# kubectl create clusterrolebinding jamesazheng-admin --user=jamesazheng --clusterrole=admin 
clusterrolebinding.rbac.authorization.k8s.io/jamesazheng-admin created


# kubectl get clusterrolebinding jamesazheng-admin 
NAME                ROLE                AGE
jamesazheng-admin   ClusterRole/admin   18s


# kubectl get clusterrolebinding jamesazheng-admin -o yaml 
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: jamesazheng-admin
...
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: admin
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: jamesazheng

```



## ServiceAccount

- ...



## Group

- ...



# 范例：ClusterRole + RoleBinding

- **PS：因为k8s默认有 admin 这个 ClusterRole，因此可以使用这两个集群角色实现对名称空间级别的最高权限授权**

## 范例：名称空间级别管理员

- 使用 Rolebinding 绑定 ClusterRole 下的 admin 以获得名称空间级别管理员权限

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
