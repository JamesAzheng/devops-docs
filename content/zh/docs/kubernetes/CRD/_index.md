---
title: "CRD"
weight: 10
---

# CRD 概述

- CustomResourceDefinitions 自定义资源类型，简称CRD；

- CRD 是 k8s 默认提供的一种资源类型，是用于帮助自定义资源类型的资源类型；
- 使用 CRD 定义出来的自定义资源称为 CustomResourceType（Kind: CustomResourceType）；
  - 可以使用 `kubectl get crd` 和 `kubectl api-resources` 来获取到目前存在的CRD
- 而使用 Kind: CustomResourceType 定义出来的 object 又称为 CustomResource；

- 自定义资源类型并根据字段添加资源后 只是将字段信息写入了etcd中，要将**资源真正运行到k8s集群中还需编写控制器 `Control Loop`**
  - 复杂的控制器通常称为 Operator


```go
// Control Loop
for {
  desired := getDesiredState()  // 获取资源对象的期望状态
  current := getCurrentState()  // 获取当前的实际状态 
  makeChanges(desired, current)  // 执行操作，让当前状态符合期望状态
}
```



## 其他扩展K8s API的方式

**除 CRD 以外，还有以下扩展 kubernetes API 的方式：**

- 开发自定义的 API Server 并聚合至主 API Server；
- 定制扩展 API Server 源码。

**总结：**

- CRD最为易用但限制颇多，自定义API Server更富于弹性但代码工作量偏大；
- 无论以哪种方式安装定制资源，新的资源都会被当做定制资源，以便与内置的 Kubernetes 资源（如 Pods）相区分。



## 参考文档

- https://kubernetes.io/zh-cn/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)
- https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/api-extension/custom-resources/



- 



# CRD Explain

- 全局级别，因此没有 namespace

```yaml
apiVersion: apiextensions.k8s.io/v1  # API群组和版本
kind: CustomResourceDefinition  # 资源类别
metadata:
  name <string>  # 资源名称
spec:
	conversion <Object>  # 定义不同版本间的格式转换方式
	   strategy <string>  # 不同版本间的自定义资源转换策略，有None和Webhook两种取值
	   webhook <Object>  # 如何调用用于进行格式转换的webhook
	group <string>  # 资源所属的API群组
	names <Object>  # 自定义资源的类型，即该CRD创建资源规范时使用的kind
	  categories  <[]string>  # 资源所属的类别编目，例如”kubectl get all”中的all
	  kind <string>  # kind名称，必选字段
	  listKind <string>  # 资源列表名称，默认为"`kind`List"
	  plural <string>  # 复数，用于API路径`/apis/<group>/<version>/.../<plural>`
	  shortNames <[]string>  # 该资源的kind的缩写格式
	  singular <string>  # 资源kind的单数形式，必须使用全小写字母，默认为小写的kind名称
	preserveUnknownFields <boolean>  # 预留的非知名字段，kind等都是知名的预留字段
	scope <string>  # 作用域，可用值为Cluster和Namespaced
	versions <[]Object>  # 版本号定义
	  additionalPrinterColumns <[]Object>  # 需要返回的额外信息
	  name <string>  # 形如vM[alphaN|betaN]格式的版本名称，例如v1或v1alpha2等
	  schema <Object>  # 该资源的数据格式（schema）定义，必选字段
	    openAPIV3Schema  <Object>  # 用于校验字段的schema对象，格式请参考相关手册
	  served <boolean>  # 是否允许通过RESTful API调度该版本，必选字段
	  storage <boolean>  # 将自定义资源存储于etcd中时是不是使用该版本
	  subresources <Object>  # 子资源定义
	    scale <Object>  # 启用scale子资源，通过autoscaling/v1.Scale发送负荷
	    status <map[string]>   # 启用status子资源，为资源生成/status端点
```





# CRD Example

## crd yaml

```yaml
# vim crd-v1-user.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: users.auth.ilinux.io
spec:
  group: auth.ilinux.io # 资源所属的API群组
  names:  # 自定义资源的类型，即该CRD创建资源规范时使用的kind
    kind: User # kind名称
    plural: users # 复数形式
    singular: user # 单数形式
    shortNames: # 简称
    - u
  scope: Namespaced # 作用域为名称空间级别资源
  versions: # 版本号相关定义
  - served: true # 允许通过RESTful API调度该版本
    storage: true # 将该版本的自定义资源存储于etcd
    name: v1alpha1 # 版本名称
    schema: # 该资源相关字段的具体定义
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              userID:
                type: integer
                minimum: 1
                maximum: 65535
              groups:
                type: array
                items:
                  type: string
              email:
                type: string
              password:
                type: string
                format: password
            required: ["userID","groups"]
```

### 验证

```yaml
# kubectl apply -f crd-v1-user.yaml
customresourcedefinition.apiextensions.k8s.io/users.auth.ilinux.io created


# kubectl get crd users.auth.ilinux.io
NAME                   CREATED AT
users.auth.ilinux.io   2023-01-11T12:18:30Z


# kubectl describe crd users.auth.ilinux.io
Name:         users.auth.ilinux.io
Namespace:
Labels:       <none>
Annotations:  <none>
API Version:  apiextensions.k8s.io/v1
Kind:         CustomResourceDefinition
Metadata:
  Creation Timestamp:  2023-01-11T12:18:30Z
  Generation:          1
  Managed Fields:
    API Version:  apiextensions.k8s.io/v1
    Fields Type:  FieldsV1
    fieldsV1:
      f:status:
        f:acceptedNames:
          f:kind:
          f:listKind:
          f:plural:
          f:shortNames:
          f:singular:
        f:conditions:
          k:{"type":"Established"}:
            .:
            f:lastTransitionTime:
            f:message:
            f:reason:
            f:status:
            f:type:
          k:{"type":"NamesAccepted"}:
            .:
            f:lastTransitionTime:
            f:message:
            f:reason:
            f:status:
            f:type:
    Manager:      Go-http-client
    Operation:    Update
    Subresource:  status
    Time:         2023-01-11T12:18:30Z
    API Version:  apiextensions.k8s.io/v1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .:
          f:kubectl.kubernetes.io/last-applied-configuration:
      f:spec:
        f:conversion:
          .:
          f:strategy:
        f:group:
        f:names:
          f:kind:
          f:listKind:
          f:plural:
          f:shortNames:
          f:singular:
        f:scope:
        f:versions:
    Manager:         kubectl-client-side-apply
    Operation:       Update
    Time:            2023-01-11T12:18:30Z
  Resource Version:  2839836
  UID:               fa64e03f-957e-41c9-b64e-97d8f4f44b16
Spec:
  Conversion:
    Strategy:  None
  Group:       auth.ilinux.io
  Names:
    Kind:       User
    List Kind:  UserList
    Plural:     users
    Short Names:
      u
    Singular:  user
  Scope:       Namespaced
  Versions:
    Name:  v1alpha1
    Schema:
      openAPIV3Schema:
        Properties:
          Spec:
            Properties:
              Email:
                Type:  string
              Groups:
                Items:
                  Type:  string
                Type:    array
              Password:
                Format:  password
                Type:    string
              User ID:
                Maximum:  65535
                Minimum:  1
                Type:     integer
            Required:
              userID
              groups
            Type:  object
        Type:      object
    Served:        true
    Storage:       true
Status:
  Accepted Names:
    Kind:       User
    List Kind:  UserList
    Plural:     users
    Short Names:
      u
    Singular:  user
  Conditions:
    Last Transition Time:  2023-01-11T12:18:30Z
    Message:               no conflicts found
    Reason:                NoConflicts
    Status:                True
    Type:                  NamesAccepted
    Last Transition Time:  2023-01-11T12:18:30Z
    Message:               the initial names have been accepted
    Reason:                InitialNamesAccepted
    Status:                True
    Type:                  Established
  Stored Versions:
    v1alpha1
Events:  <none>


# kubectl api-resources --api-group=auth.ilinux.io
NAME    SHORTNAMES   APIVERSION                NAMESPACED   KIND
users   u            auth.ilinux.io/v1alpha1   true         User
```



## apply yaml

```yaml
# vim user-crd-demo.yaml
apiVersion: auth.ilinux.io/v1alpha1
kind: User
metadata:
  name: admin
  namespace: default
spec:
  userID: 1
  email: sredevops@163.com
  groups:
  - superusers
  - adminstrators
  password: llinux.cn
```

### 验证

- 虽然可以创建，但只是将内容写入到了etcd当中，要实现具体的功能还需编写 control loop

```yaml
# kubectl apply -f user-crd-demo.yaml
user.auth.ilinux.io/admin created

# kubectl get user
NAME    AGE
admin   30s

# kubectl describe user admin
Name:         admin
Namespace:    default
Labels:       <none>
Annotations:  <none>
API Version:  auth.ilinux.io/v1alpha1
Kind:         User
Metadata:
  Creation Timestamp:  2023-01-11T12:40:27Z
  Generation:          1
  Managed Fields:
    API Version:  auth.ilinux.io/v1alpha1
    Fields Type:  FieldsV1
    fieldsV1:
      f:metadata:
        f:annotations:
          .:
          f:kubectl.kubernetes.io/last-applied-configuration:
      f:spec:
        .:
        f:email:
        f:groups:
        f:password:
        f:userID:
    Manager:         kubectl-client-side-apply
    Operation:       Update
    Time:            2023-01-11T12:40:27Z
  Resource Version:  2841606
  UID:               54983f0a-1b80-47cc-877c-72bb3f1e1128
Spec:
  Email:  sredevops@163.com
  Groups:
    superusers
    adminstrators
  Password:  llinux.cn
  User ID:   1
Events:      <none>
```





# ---



# Operator 概述

- Operator 是基于 CRD 自定义资源来部署应用，部署完成后，相应的应用程序就会添加到 Kubernetes API 扩展中，后期便可以使用 kubectl 创建、访问和管理应用程序，就像处理 Pod、Deployment、Service 等内置资源一样。

- 例如：部署了一个数据库类型应用的 Operator，那么在部署前或部署后就可以使用 kubectl 来指定创建几个主节点、几个从节点等...

- 在部署一些有状态应用时，使用官方提供的 Operator 往往更加适合；

#### 参考文档

- https://operatorhub.io/（Operator 官方仓库）
- https://github.com/operator-framework
- https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/operator/



# Operator Example - MySQL

- [percona/percona-xtradb-cluster-operator: Percona Operator for MySQL based on Percona XtraDB Cluster (github.com)](https://github.com/percona/percona-xtradb-cluster-operator)
- [Percona Operator for MySQL based on Percona XtraDB Cluster](https://docs.percona.com/percona-operator-for-mysql/pxc/index.html)

## 部署 Operator

- `kubectl apply -f https://raw.githubusercontent.com/percona/percona-xtradb-cluster-operator/main/deploy/bundle.yaml`
- 主要包含 MySQL CRD 的定义

```yaml
# head -100 bundle.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  annotations:
    controller-gen.kubebuilder.io/version: v0.8.0
  creationTimestamp: null
  name: perconaxtradbclusterbackups.pxc.percona.com
spec:
  group: pxc.percona.com
  names:
    kind: PerconaXtraDBClusterBackup
    listKind: PerconaXtraDBClusterBackupList
    plural: perconaxtradbclusterbackups
    shortNames:
    - pxc-backup
    - pxc-backups
    singular: perconaxtradbclusterbackup
  scope: Namespaced
  versions:
  - additionalPrinterColumns:
    - description: Cluster name
      jsonPath: .spec.pxcCluster
      name: Cluster
      type: string
    - description: Storage name from pxc spec
      jsonPath: .status.storageName
      name: Storage
      type: string
    - description: Backup destination
      jsonPath: .status.destination
      name: Destination
      type: string
    - description: Job status
      jsonPath: .status.state
      name: Status
      type: string
    - description: Completed time
      jsonPath: .status.completed
      name: Completed
      type: date
    - jsonPath: .metadata.creationTimestamp
      name: Age
      type: date
    name: v1
    schema:
      openAPIV3Schema:
        properties:
          apiVersion:
            type: string
          kind:
            type: string
          metadata:
            type: object
          priorityClassName:
            type: string
          schedulerName:
            type: string
          spec:
            properties:
              pxcCluster:
                type: string
              storageName:
                type: string
            type: object
          status:
            properties:
              azure:
                properties:
                  container:
                    type: string
                  credentialsSecret:
                    type: string
                  endpointUrl:
                    type: string
                  storageClass:
                    type: string
                type: object
              completed:
                format: date-time
                type: string
              conditions:
                items:
                  properties:
                    lastTransitionTime:
                      format: date-time
                      type: string
                    message:
                      maxLength: 32768
                      type: string
                    observedGeneration:
                      format: int64
                      minimum: 0
                      type: integer
                    reason:
                      maxLength: 1024
                      minLength: 1
                      pattern: ^[A-Za-z]([A-Za-z0-9_,:]*[A-Za-z0-9_])?$
                      type: string
                    status:
                      enum:
```

### 验证

```sh
# kubectl get crd | grep pxc
perconaxtradbclusterbackups.pxc.percona.com    2023-01-11T13:33:07Z
perconaxtradbclusterrestores.pxc.percona.com   2023-01-11T13:33:07Z
perconaxtradbclusters.pxc.percona.com          2023-01-11T13:33:07Z


# kubectl api-resources --api-group pxc.percona.com
NAME                           SHORTNAMES                 APIVERSION           NAMESPACED   KIND
perconaxtradbclusterbackups    pxc-backup,pxc-backups     pxc.percona.com/v1   true         PerconaXtraDBClusterBackup
perconaxtradbclusterrestores   pxc-restore,pxc-restores   pxc.percona.com/v1   true         PerconaXtraDBClusterRestore
perconaxtradbclusters          pxc,pxcs                   pxc.percona.com/v1   true         PerconaXtraDBCluster
root@k8s-master-1:~#

```



## 部署 MySQL Cluster

- ` kubectl apply -f https://raw.githubusercontent.com/percona/percona-xtradb-cluster-operator/main/deploy/cr.yaml`

```yaml
# cat cr.yaml | grep -E ^"[^#]"
apiVersion: pxc.percona.com/v1
kind: PerconaXtraDBCluster
metadata:
  name: cluster1
  finalizers:
    - delete-pxc-pods-in-order
spec:
  crVersion: 1.13.0
  allowUnsafeConfigurations: false
  updateStrategy: SmartUpdate
  upgradeOptions:
    versionServiceEndpoint: https://check.percona.com
    apply: disabled
    schedule: "0 4 * * *"
  pxc:
    size: 3
    image: percona/percona-xtradb-cluster:8.0.29-21.1
    autoRecovery: true
    resources:
      requests:
        memory: 1G
        cpu: 600m
    affinity:
      antiAffinityTopologyKey: "kubernetes.io/hostname"
    podDisruptionBudget:
      maxUnavailable: 1
    volumeSpec:
      persistentVolumeClaim:
        resources:
          requests:
            storage: 6G
    gracePeriod: 600
  haproxy:
    enabled: true
    size: 3
    image: perconalab/percona-xtradb-cluster-operator:main-haproxy
    resources:
      requests:
        memory: 1G
        cpu: 600m
    affinity:
      antiAffinityTopologyKey: "kubernetes.io/hostname"
    podDisruptionBudget:
      maxUnavailable: 1
    gracePeriod: 30
  proxysql:
    enabled: false
    size: 3
    image: perconalab/percona-xtradb-cluster-operator:main-proxysql
    resources:
      requests:
        memory: 1G
        cpu: 600m
    affinity:
      antiAffinityTopologyKey: "kubernetes.io/hostname"
    volumeSpec:
      persistentVolumeClaim:
        resources:
          requests:
            storage: 2G
    podDisruptionBudget:
      maxUnavailable: 1
    gracePeriod: 30
  logcollector:
    enabled: true
    image: perconalab/percona-xtradb-cluster-operator:main-logcollector
    resources:
      requests:
        memory: 100M
        cpu: 200m
  pmm:
    enabled: false
    image: percona/pmm-client:2.32.0
    serverHost: monitoring-service
    resources:
      requests:
        memory: 150M
        cpu: 300m
  backup:
    image: perconalab/percona-xtradb-cluster-operator:main-pxc8.0-backup
    pitr:
      enabled: false
      storageName: STORAGE-NAME-HERE
      timeBetweenUploads: 60
    storages:
      s3-us-west:
        type: s3
        verifyTLS: true
        s3:
          bucket: S3-BACKUP-BUCKET-NAME-HERE
          credentialsSecret: my-cluster-name-backup-s3
          region: us-west-2
      azure-blob:
        type: azure
        azure:
          credentialsSecret: azure-secret
          container: test
      fs-pvc:
        type: filesystem
        volume:
          persistentVolumeClaim:
            accessModes: [ "ReadWriteOnce" ]
            resources:
              requests:
                storage: 6G
    schedule:
      - name: "daily-backup"
        schedule: "0 0 * * *"
        keep: 5
        storageName: fs-pvc
```

