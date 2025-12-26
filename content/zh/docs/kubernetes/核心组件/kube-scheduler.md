---
title: "kube-scheduler"
weight: 10
---

# Kube-Scheduler 概述

- Kube-Scheduler 是 kubernetes 中控制平面的核心组件之一，负责将新创建的 Pod 调度到合适的节点上运行。
- Kube-scheduler 基于一组可配置的策略来选择节点，并且考虑了许多因素，例如可用资源、硬件和软件约束、亲和性和反亲和性规则、Pod 优先级以及用户定义的偏好。
  - **节点的资源使用情况**：Kube-Scheduler 需要了解所有节点的资源使用情况，包括 CPU、内存、磁盘和网络等，以确定当前哪些节点有足够的资源来承载新的 Pod。
  - **Pod 的调度要求**：Pod 可以定义调度策略，比如需要特定的硬件、需要在特定的区域中运行，或者需要和其他 Pod 放在同一个节点上等。Kube-Scheduler 需要考虑这些调度要求，并在满足它们的前提下将 Pod 绑定到节点上。
  - **Pod 亲和性和反亲和性**：Pod 亲和性和反亲和性定义了 Pod 应该和哪些节点亲和，哪些节点反亲和。例如，可以定义一个 Pod 必须和某个节点的标签匹配，或者不能和某些节点共存。Kube-Scheduler 需要考虑这些要求，并在满足它们的前提下将 Pod 绑定到节点上。
  - **节点的健康状态**：Kube-Scheduler 需要检查节点的健康状态，包括节点是否处于维护模式、是否有节点故障或网络故障等，以确定节点是否适合承载新的 Pod。
- kube-scheduler 是一个可插拔的组件，可以用不同的策略来自定义 Pod 的调度行为。此外，kube-scheduler 还支持独立的调度器实现，这些实现可以自定义调度算法和行为，以满足特定的部署需求。
- 总的来说，kube-scheduler 是 Kubernetes 集群的一个重要组件，它使得用户可以轻松地将应用程序部署到集群中，并以高效、可靠的方式管理它们的调度行为。



**Kube-Scheduler 的实现原理主要分为两个步骤：**

1. 选择算法：Kube-Scheduler 提供了很多种选择算法，以选择最合适的节点来部署 Pod。这些算法包括：Random（随机选择）、LeastRequested（选择最空闲的节点）、NodeAffinity（根据 Pod 和节点之间的亲和性选择节点）等。
2. 绑定 Pod 到节点：Kube-Scheduler 会将选择的节点名称信息写入到 Pod 的 `spec.nodeName` 字段中，随后将 Pod 的绑定信息写入 etcd 存储中，这个过程通常通过 Kube-ApiServer 来完成。

需要注意的是，Kube-Scheduler 是可以扩展的，用户可以自定义实现一些选择算法，或者对算法进行定制化，来满足特定的需求。同时，Kubernetes 也提供了很多钩子机制，来让用户在不同的阶段插入自己的代码逻辑，进行调度的定制化。



**参考文档：**

- [Kubernetes 调度器 | Kubernetes](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/kube-scheduler/)
- [将 Pod 指派给节点 | Kubernetes](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/assign-pod-node/)





# Kube-Scheduler 调度策略

- 在 Kubernetes 的调度过程中，Kubernetes Scheduler 使用预选和优选函数来决定将 Pod 调度到哪个节点上，这些函数用于过滤掉不符合条件的节点并评估符合条件的节点

- 在默认的调度器中，Kube-Scheduler 使用了许多内置的预选函数和优选函数，开发者也可以根据需要自定义这些函数来实现更加灵活的调度策略。

- 预选和优选阶段的调度算法（预选 & 优选 函数），都以插件化的形式集成到了 scheduler framework（调度框架）当中

- PS：

  - **调度策略只在 Pod 被调度时有效**，如 Pod 已经调度成功，然后进行修改标签等操作后 Pod 不会收到任何影响

- 参考文档：

  - [Kubernetes 调度系统之 Scheduling Framework-阿里云开发者社区 (aliyun.com)](https://developer.aliyun.com/article/766998)
  - [kubernetes/pkg/scheduler/framework at master · kubernetes/kubernetes (github.com)](https://github.com/kubernetes/kubernetes/tree/master/pkg/scheduler/framework)

  

## 预选（Predicates）

在预选阶段，Kubernetes Scheduler 会使用一系列的预选函数对可用的节点列表进行筛选，去除那些不符合 Pod 要求的节点，得到符合要求的节点子集。

kube-scheduler 根据预选函数过滤掉不符合条件的 Nodes，输入是所有节点，输出是满足预选条件的节点（**即排除不满足条件的节点**），这样在后续的优选过程中就不会考虑那些不满足条件的节点了。

在预选阶段中，通常是排除不满足条件的节点，满足条件的节点会进入到优选阶段。但也有一些特殊情况，例如`HostName`、`PodFitsHostPort`、`MatchNodeSelector`预选函数在匹配时：

- 如果匹配成立，则不再向下匹配，也不进入优选，而是直接将其调度到目标节点
- 如果匹配不成立，跳过该节点，继续进行下面其他的预选函数

是的，你说得对。这些预选函数有时候也被称为“硬性规则”或“必须匹配规则”，因为它们必须在调度过程中满足才能继续执行。如果这些规则不满足，则调度器将不会考虑这个节点，并尝试其他节点。这些规则确保Pod被调度到符合特定要求的节点上，比如某些Pod只能在特定的节点上运行。如果满足了这些规则，则可以跳过预选阶段的其余规则并直接将Pod调度到目标节点，而无需进一步评估节点的优选条件。这样可以加速调度过程并提高整体性能。



### 预选函数

#### CheckNodeCondition

- 检查节点条件。此预选函数会检查节点的磁盘和网络是否可用，以及是否准备就绪。如果节点的磁盘和网络不可用或未准备就绪，该节点将被认为是不适合调度Pod的，进而排除该节点



#### GeneralPredicates

通用预选策略，包含多种策略：

##### HostName

- 检查Pod对象是否定义 `spec.nodeName` ，如果Pod定义了这个属性，则该Pod只能被调度到具有相同名称的节点上。
- 如果没有任何节点的 nodeName 与 Pod 的 `spec.nodeName` 属性相同，则Pod调度将调度失败

##### PodFitsHostPort

- 检查Pod对象是否定义`spec.hostPorts` ，如果Pod定义了这个属性，则该Pod只能被调度到已经绑定了相同端口的节点上。

##### MatchNodeSelector

- 检查Pod对象是否定义`spec.nodeSelector` ，如果Pod定义了这个属性，则该Pod只能被调度到具有相同标签的节点上。

##### PodFitsResources

- 检查Pod的资源需求是否能被节点所满足，如CPU和内存需求，如果节点上没有足够的资源来满足Pod的需求，则该节点将被认为是不适合调度Pod的。
- 不适合调度的 Pod 将会被排除，不会进入优选阶段。

##### NoDiskConflict

- 检查Pod依赖的存储卷能否能满足需求。如果节点上的存储卷与Pod定义的存储卷存在冲突，则该节点将被认为是不适合调度Pod的。



#### PodToleratesNodeTaints

- 查Pod上的`spec.tolerations`可容忍的污点是否完全包含节点上的污点。如果Pod不能容忍节点上的所有污点，则该节点将被认为是不适合调度Pod的。



#### PodToleratesNodeNoExecuteTaints

- 检查Pod上的`spec.tolerations`是否容忍节点的NoExecute污点。如果Pod不能容忍节点上的NoExecute污点，则该节点将被认为是不适合调度Pod的。



#### PodToleratesNodeOutTaints

- 检查Pod是否可以在具有指定的out污点的节点上运行。



#### CheckNodeLabelPresence

- 检查节点标签。如果节点上没有定义所需的标签，则该节点将被认为是不适合调度Pod的。；默认不启用



#### CheckserviceAffinity

- 检查服务亲和性。如果Pod需要绑定到特定的服务上，则只有那些已经与该服务相关联的节点才能被认为是适合调度Pod的。默认不启用



#### MaxEBSVolumeCount

- 亚马逊弹性存储卷最大数量，默认39。如果节点上已经有了最大数量的EBS存储卷，则该节点将被认为是不适合调度Pod的。



#### MaxGCEPDVolumeCount

- 定义谷歌容器引擎最大存储卷数量。默认值为16。



#### MaxAzureDiskVolumeCount

- 定义Azure最大磁盘数量。默认值为16。



#### CheckVolumeBinding

- 检查数据卷是否已经正确绑定到Pod。



#### NoVolumeZoneConflict

- 检查是否存在数据卷空间冲突。如果存在，则该节点不适合该Pod。



#### NoVolumeNodeConflict

- 检查数据卷和节点的区域之间是否存在冲突。



#### CheckNodeMemoryPressure

- 定义检查节点内存压力的名称。



#### CheckNodePIDPressure

- 定义检查节点PID压力的名称。



#### CheckNodeDiskPressure

- 定义检查节点磁盘压力的名称。



#### CheckNodeUnschedulable

- 检查节点是否已被标记为unschedulable。



#### CheckNodeMemoryLimits

- 检查节点是否有足够的内存容量来调度Pod。



#### CheckNodeConditionAndTaints

- 组合了CheckNodeCondition和PodToleratesNodeTaints两个预选函数，用于检查节点条件和Pod对节点污点的容忍。



#### CheckNodeSelector

- 检查Pod是否有指定的nodeSelector，以将Pod调度到节点上。



#### CheckNodeDiskConflict

- 检查Pod是否与节点上的已挂载存储卷冲突。



#### CheckNodeFSGroup

- 检查节点是否支持Pod的安全上下文中的指定FSGroup。



#### MatchInterPodAffinity

- 定义匹配POD间关联的名称。











## 优选（Priorities）

在优选阶段，Kubernetes Scheduler 会使用一系列的优选函数对符合要求的节点子集进行打分，并选出最高分的节点作为 Pod 的最终调度目标。

输入是预选阶段筛选出的节点，优选会根据优先函数为通过预选的Nodes进行打分排名（根据一些条件为每个节点分配一个分数），选择得分最高的Node。

- 将剩余节点进行打分排名，例如：剩余资源越多、负载越小的节点得分会更高

### 优选函数

#### LeastRequested

- 此优选函数的作用是将优先考虑请求资源较少的节点。具体来说，该函数将根据节点的CPU和内存资源的被占用率，计算出一个得分，得分越低的节点将被优先选择
- 计算公式为：
  - (cpu(capacity-sum(requested))\*10/capacity)+(memory(capacity-sum(requested))*10/capacity)/2

#### BalancedResourceAllocation

- CPU和内存资源的被占用率相近的胜出；目的是平衡节点资源的使用率。
- 该函数的作用是平衡节点资源的使用率，选择CPU和内存资源的被占用率相近的节点。具体来说，该函数会计算出所有节点CPU和内存资源使用率的差值，并将两者的差值加权平均，得分越低的节点将被优先选择。

#### NodePreferAvoidPods

- 节点注解信息"scheduler.alpha.kubernetes.io/preferAvoidPods"
- 该函数的作用是根据节点的注解信息，优先选择那些不包含指定Pod的节点。具体来说，如果一个节点的注解信息包含"scheduler.alpha.kubernetes.io/preferAvoidPods"，则该节点将被认为是不适合调度指定Pod的节点。

#### TaintToleration

- 该函数的作用是将Pod对象的spec.tolerations与节点的taints列表项进行匹配度检查，匹配的条目越多得分越低。该函数的作用是尽可能避免将Pod调度到已被污点化的节点上。

#### SelectorSpread

- 尽量将 Pod 分布在不同的标签集合中
- 具体来说，该函数会根据Pod对象的labels和节点的labels进行匹配度计算，并根据匹配度的结果，将Pod调度到标签集合不同的节点上。

#### InterPodAffinity

- 该函数的作用是根据Pod间的亲和性进行调度。具体来说，该函数会计算每个节点上已经运行的Pod对象的标签集合，然后将Pod调度到与其亲和性匹配的节点上。

#### NodeAffinity

- 该函数的作用是根据节点的亲和性和反亲和性筛选节点。具体来说，该函数会根据Pod对象的spec.affinity.nodeAffinity配置项，计算每个节点的匹配度，并选择匹配度最高的节点。

#### MostRequested

- 该函数的作用是优先考虑那些请求资源最少的节点。具体来说，该函数将根据节点的CPU和内存资源的请求量，计算出一个得分，得分越低的节点将被优先选择。

#### NodeLabel

- 该函数的作用是根据节点的标签进行选择。具体来说，该函数会根据Pod对象的spec.nodeSelector配置项，选择标签匹配度最高的节点。

#### ImageLocality

- 根据满足当前Pod对象需求的已有镜像的体积大小之和。
- 该函数的作用是根据满足当前Pod对象需求的已有镜像的体积大小之和进行选择。具体来说，该函数会计算每个节点已有镜像的体积大小之

#### ---

其他的优选函数：

#### MostPods：

- 尝试将Pod调度到当前已分配最多Pod的节点上。

#### MostNodes：

- 尝试将Pod调度到当前已分配最少Pod的节点上。

#### NewPod：

- 尝试将Pod调度到一个没有调度任何Pod的节点上。

#### OldestPods：

- 尝试将Pod调度到拥有最早调度Pod的节点上。

#### RandomFit：

- 在满足所有其他条件的情况下，随机选择一个可用的节点来调度Pod。

#### RequestedToCapacityRatio：

- 基于节点的CPU和内存容量与所需资源量之间的比率来计算得分。

#### ServiceSpreading：

- 尽量将同一服务中的Pod分布在不同的节点上。

#### NodeResourcesFit：

- 根据Pod需要的CPU和内存资源与节点实际可用的资源之间的匹配程度来计算得分。

#### PodTopologySpread：

- 将Pod分布在不同的拓扑域中，以避免Pod过于密集或分散。

#### InterPodAffinityPreferredDuringSchedulingIgnoredDuringExecution

- 根据Pod之间的亲和性将Pod调度到同一节点上。

#### NodeResourcesLeastAllocated：

- 基于节点上已分配的CPU和内存资源的最小值来计算得分，以确保资源使用率最低。



## Select（选定）

- 选择出得分最高的节点，将该节点写入到 Pod 的`nodeName` 字段，该节点的 kubelet 会通过 apiserver 发现有 Pod 需要运行在本节点，进而进行创建。



















# Kube-Scheduler 调度流程简述

- 首先 Scheduler 会通过 Apiserver 监视 etcd，当发现其中有未调度的 Pod 时，会根据预先定义的预选和优选函数来选择合适的节点进行调度，其中会考虑很多因素，例如：
  - 节点剩余可用资源
  - 以及 Pod 定义中所指的nodeName、nodeSelector、节点亲和，Pod亲和、Pod反亲和，节点污点、Pod 容忍度等诸多因素进行考量，最终选出最优的节点
- 之后将调度的信息通过 Apiserver 写入到 Etcd，主要是将 Pod 状态为 Scheduled
- 最后由 Node 节点的 Kubelet 完成剩下的 Pod 创建、创建信息写入 etcd 等操作





# Scheduler Framework 配置

- 注意 apiVersion 是否与 k8s 版本一致

```
配置调度器：

apiVersion: kubescheduler.config.k8s.io/v1alpha2 # v1alpha2版本
kind: KubeSchedulerConfiguration
AlgorithmSource:  # 指定调度算法配置源，v1alpha2版本起该配置进入废弃阶段
  Policy：  # 基于调度策略的调度算法配置源
    File: 文件格式的调度策略
      Path <string>: 调度策略文件policy.cfg的位置
    ConfigMap:   # configmap格式的调度策略
      Namespace <string>  # 调度策略configmap资源隶属的名称空间
      Name <string>  # configmap资源的名称
  Provider <string>  # 配置使用的调度算法的名称，例如DefaultProvider
LeaderElection: {}  # 多kube-scheduler实例并在时使用的领导选举算法
ClientConnection: {}  # 与API Server通信时提供给代理服务器的配置信息
HealthzBindAddress <string>  # 响应健康状态检测的服务器监听的地址和端口
MetricsBindAddress <string>  # 响应指标抓取请求的服务器监听地址和端口
DisablePreemption <bool>  # 是否禁用抢占模式，false表示不禁用
PercentageOfNodesToScore <int32>  # 需要过滤出的可用节点百分比
BindTimeoutSeconds  <int64>  # 绑定操作的超时时长，必须使用非负数
PodInitialBackoffSeconds  <int64>  # 不可调度Pod的初始补偿时长，默认值为1
PodMaxBackoffSeconds <int64>  # 不可调度Pod的最大补偿时长，默认为10
Profiles <[]string>  # 加载的KubeSchedulerProfile配置列表，v1alpha2支持多个
Extenders <[]Extender>  # 加载的Extender列表



调度配置 ：

SchedulerName <string>    # 当前Profile的名称
Plugins <Object>           # 插件配置对象
  <ExtendPoint> <Object>  # 配置指定的扩展点，例如QueueSort，每个扩展点按名指定
    Enabled <[]Plugin>     # 启用的插件列表
    - Name <string>       # 插件名称
      Weight <int32>      # 插件权重，仅Score扩展点支持
    Disabled <[]Plugin>  # 禁用的插件列表
    - Name <string>  # 插件名称
      Weight <int32>  # 插件权重
PluginConfig <[]Object>  # 插件特有的配置
- Name <string>            # 插件名称
Args <Object>            # 配置信息





finalScoreNode = (weight1 * priorityFunc1) + (weight2 * priorityFunc2) + …




apiVersion: kubescheduler.config.k8s.io/v1beta1
kind: KubeSchedulerConfiguration
clientConnection:
  kubeconfig: "/etc/kubernetes/scheduler.conf"
profiles:
- schedulerName: default-scheduler
- schedulerName: demo-scheduler
  plugins:
    filter:
      disabled:
      - name: NodeUnschedulable
    score:
      disabled:
      - name: NodeResourcesBalancedAllocation
        weight: 1
      - name: NodeResourcesLeastAllocated
        weight: 1
      enabled:
      - name: NodeResourcesMostAllocated
        weight: 5


/etc/kubernetes/manifests/kube-scheduler.yaml

spec:
  containers:
  - command:
    - kube-scheduler
    - --authentication-kubeconfig=/etc/kubernetes/scheduler.conf
    - --authorization-kubeconfig=/etc/kubernetes/scheduler.conf
    - --config=/etc/kubernetes/scheduler/kubeschedconf-v1alpha2-demo.yaml


    volumeMounts:
    - mountPath: /etc/kubernetes/scheduler.conf
      name: kubeconfig
      readOnly: true
    - mountPath: /etc/kubernetes/scheduler
      name: schedconf
      readOnly: true
  hostNetwork: true
  priorityClassName: system-node-critical
  volumes:
  - hostPath:
      path: /etc/kubernetes/scheduler.conf
      type: FileOrCreate
    name: kubeconfig
  - hostPath:
      path: /etc/kubernetes/scheduler
      type: DirectoryOrCreate
    name: schedconf
```







# ---

# Affinity  & AntiAffinity 概述

- Affinity：亲和性，通常用于需要运行在同一节点的Pod
  - 例如PHP和MySQL运行在一起，以减少跨网络通信带来的额外开销
- AntiAffinity：反亲和性，通常用于冗余
  - 例如MySQL主从各运行在不同节点



# nodeAffinity

## nodeName

- 明确指定将Pod调度到哪个节点，前提该节点满足资源需求

### 范例 - 1

```yaml
# kubectl get node
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   116d   v1.23.10
k8s-node-1     Ready    <none>                 116d   v1.23.10
k8s-node-2     Ready    <none>                 111d   v1.23.10



# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
spec:
  containers:
  - name: demoapp
    image: ikubernetes/demoapp:v1.0
  nodeName: "k8s-node-1" # 明确指定将Pod调度k8s-node-1节点
# kubectl apply -f demoapp.yaml
pod/demoapp created
# kubectl get pod -o wide
NAME      READY   STATUS    RESTARTS   AGE   IP             NODE         NOMINATED NODE   READINESS GATES
demoapp   1/1     Running   0          25s   10.244.1.242   k8s-node-1   <none>           <none>



# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
spec:
  containers:
  - name: demoapp
    image: ikubernetes/demoapp:v1.0
  nodeName: "k8s-node-2" # 明确指定将Pod调度k8s-node-2节点
# kubectl apply -f demoapp.yaml
pod/demoapp created
# kubectl apply -f demoapp.yaml
pod/demoapp created
root@k8s-master-1:~# kubectl get pod -o wide
NAME      READY   STATUS    RESTARTS   AGE   IP            NODE         NOMINATED NODE   READINESS GATES
demoapp   1/1     Running   0          5s    10.244.2.51   k8s-node-2   <none>           <none>
```





## nodeSelector

- 节点选择器，通过标签选择器选择匹配的单个或多个节点进行调度

### 节点标签相关命令

- 生产中通常将不同资产的 node 节点打上相应的标签，从而实现区分管理

```bash
# 给 node 节点打标签
kubectl label nodes <node_name> <key>=<value>

# 删除标签
kubectl label nodes <node_name> <key>-
```

### 范例 - 1

```yaml
# vim pod-with-nodeselector.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-nodeselector
spec:
  containers:
  - name: demoapp
    image: ikubernetes/demoapp:v1.0
  nodeSelector:
    gpu: '' # 具有gpu标签，并且值未空的节点才会被调度
```

- **pod 处于 Pending 状态，因为没有具有 gpu 标签并且值未空的节点**

```sh
# kubectl get pod
NAME                    READY   STATUS    RESTARTS   AGE
pod-with-nodeselector   0/1     Pending   0          36s

# kubectl get node -l gpu
No resources found
```

- **为 k8s-node-1 打上 gpu="true" 的标签。因为标签不为空，所以不符合条件。因此 pod 仍处于Pending 状态**

```sh
# kubectl label nodes k8s-node-1 gpu="true"
node/k8s-node-1 labeled

# kubectl get node -l gpu
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-1   Ready    <none>   116d   v1.23.10

# kubectl get pod
NAME                    READY   STATUS    RESTARTS   AGE
pod-with-nodeselector   0/1     Pending   0          17m
```

- **为 k8s-node-2 打上 gpu="" 的标签。符合条件，因此 pod 处于 Running 状态并运行在 k8s-node-2 节点**

```sh
# kubectl label nodes k8s-node-2 gpu=""
node/k8s-node-2 labeled

# kubectl get node -l gpu
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-1   Ready    <none>   116d   v1.23.10
k8s-node-2   Ready    <none>   111d   v1.23.10

# kubectl get node -l gpu=""
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-2   Ready    <none>   111d   v1.23.10

# kubectl get pod -o wide
NAME                    READY   STATUS    RESTARTS   AGE   IP            NODE       
pod-with-nodeselector   1/1     Running   0          22m   10.244.2.52   k8s-node-2  
```



## nodeAffinity

节点亲和在定义时还可以指定 软亲和（preferred）、硬亲和（required）

### preferred

- 软亲和（preferred）：指的是优先选择某些节点调度，如某些节点实在不满足要求，则选择其他节点调度。
  - 软亲和的定义是基于节点标签划分权重。

- **相当于激活了优选函数进行打分**
- ` pod.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution` 

#### 注意事项

- 软亲和的权重是相对的，并且只是一个参考值。如果有多个节点都满足软亲和的要求，Kubernetes 只会考虑权重最高的节点。如果所有节点的权重都是一样的，则会随机选择其中的一个节点。因此，在使用软亲和时，需要根据实际情况设置节点的权重值，以确保 Pod 能够在期望的节点上被调度。

#### 范例 - 1

- 对满足匹配条件的节点根据 `weight` 的定义进行权重加分，最后调度到权重最高的节点
- 如果各节点权重相等，则按正常方式调度

```yaml
# cat node-affinity-preferred-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-affinity-preferred
spec:
  replicas: 5
  selector:
    matchLabels:
      app: demoapp
      ctlr: node-affinity-preferred
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
        ctlr: node-affinity-preferred
    spec:
      containers:
      - name: demoapp
        #image: ikubernetes/demoapp:v1.0
        image: nginx:alpine
        resources:
          requests:
            #cpu: 1500m
            #memory: 1Gi
            cpu: 50m
            memory: 32Mi
      affinity:
        nodeAffinity:       
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 60 # 如果节点存在gpu的标签，则权重加60
            preference:
              matchExpressions:
              - key: gpu
                operator: Exists
          - weight: 30 # 如果节点存在region的标签，并且值为foo或者bar，则权重加30
            preference:
              matchExpressions:
              - key: region
                operator: In
                values: ["foo","bar"]
```

##### 各节点权重相等

- 如果各节点权重相等，则按正常方式调度

```sh
# 两个节点都有gpu标签，权重都会加60，因此两个节点权重相等
# kubectl get nodes -l gpu
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-1   Ready    <none>   116d   v1.23.10
k8s-node-2   Ready    <none>   111d   v1.23.10

# kubectl get nodes -l region=foo
No resources found

# kubectl get nodes -l region=bar
No resources found

# kubectl get pod -o wide -w
NAME                                      READY   STATUS    RESTARTS   AGE    IP             NODE      
node-affinity-preferred-c754967cf-4blfc   1/1     Running   0          111s   10.244.1.243   k8s-node-1
node-affinity-preferred-c754967cf-86l2x   1/1     Running   0          111s   10.244.1.244   k8s-node-1
node-affinity-preferred-c754967cf-9fsgl   1/1     Running   0          111s   10.244.2.53    k8s-node-2
node-affinity-preferred-c754967cf-mtntv   1/1     Running   0          111s   10.244.2.54    k8s-node-2
node-affinity-preferred-c754967cf-vjc9z   1/1     Running   0          111s   10.244.1.245   k8s-node-1
```

##### 某节点权重最高

- 会优先调度到权重最高的节点

```sh
# kubectl get nodes -l region=foo
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-1   Ready    <none>   116d   v1.23.10


# kubectl get nodes -l gpu
No resources found


# kubectl get nodes -l region=bar
No resources found


# kubectl get pod -o wide
NAME                                      READY   STATUS    RESTARTS   AGE   IP             NODE      
node-affinity-preferred-c754967cf-7xs5c   1/1     Running   0          15s   10.244.1.254   k8s-node-1
node-affinity-preferred-c754967cf-h4flp   1/1     Running   0          15s   10.244.1.2     k8s-node-1
node-affinity-preferred-c754967cf-n896r   1/1     Running   0          15s   10.244.1.3     k8s-node-1
node-affinity-preferred-c754967cf-qz4nm   1/1     Running   0          15s   10.244.1.4     k8s-node-1
node-affinity-preferred-c754967cf-zwt7s   1/1     Running   0          15s   10.244.1.5     k8s-node-1
```



### required

- 硬亲和（required）：只选择某些节点调度，如某些节点不满足要求，则Pod调度失败。
  - 硬亲和本质还是节点标签选择器，但支持更丰富的判断条件，比如：多个标签间与逻辑的判断，标签存在与否的判断
- **相当于激活了预选函数**
- ` pod.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution`

#### 范例 - 1

```yaml
# cat node-affinity-required-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-affinity-required
  namespace: default
spec:
  replicas: 5
  selector:
    matchLabels:
      app: demoapp
      ctlr: node-affinity-required
  template:
    metadata:
      labels:
        app: demoapp
        ctlr: node-affinity-required
    spec:
      containers:
      - name: demoapp
        image: ikubernetes/demoapp:v1.0
        livenessProbe:
          httpGet:
            path: '/livez'
            port: 80
          initialDelaySeconds: 5
        readinessProbe:
          httpGet:
            path: '/readyz'
            port: 80
          initialDelaySeconds: 15
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms: # 本质上还是节点选择器
            - matchExpressions: # 调度到哪些节点，与逻辑（即此列表项中定义的内容需同时满足 ）
              - key: gpu # 存在gpu标签
                operator: Exists
              - key: node-role.kubernetes.io/master # 不存在node-role.kubernetes.io/master标签的节点（node-role.kubernetes.io/master标签只在master节点存在，因此含义为调度到不存在该标签的node节点）
                operator: DoesNotExist
```

##### 验证

```sh
# 有两个不存在node-role.kubernetes.io/master标签的节点
# kubectl get nodes -l node-role.kubernetes.io/master!=
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-1   Ready    <none>   116d   v1.23.10
k8s-node-2   Ready    <none>   111d   v1.23.10


# 但没有存在gpu标签的节点
# kubectl get nodes -l gpu
No resources found


# 因此，所有Pod都处于为调度的pending状态
# kubectl get pod
NAME                                      READY   STATUS    RESTARTS   AGE
node-affinity-required-65445bfbc6-54qgh   0/1     Pending   0          31s
node-affinity-required-65445bfbc6-lhk2x   0/1     Pending   0          31s
node-affinity-required-65445bfbc6-pfl66   0/1     Pending   0          31s
node-affinity-required-65445bfbc6-q4xs4   0/1     Pending   0          31s
node-affinity-required-65445bfbc6-vf6fl   0/1     Pending   0          31s


# 为k8s-node-2添加gpu=true的标签，标签值任意，因为定义的是存在即可。
# kubectl label nodes k8s-node-2 gpu=true
node/k8s-node-2 labeled
# kubectl get nodes -l gpu
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-2   Ready    <none>   111d   v1.23.10



# 因此，所有Pod都被调度到k8s-node-2节点
# kubectl get pod -o wide
NAME                                      READY   STATUS    RESTARTS   AGE   IP            NODE      
node-affinity-required-65445bfbc6-54qgh   0/1     Running   0          14m   10.244.2.58   k8s-node-2
node-affinity-required-65445bfbc6-lhk2x   0/1     Running   0          14m   10.244.2.59   k8s-node-2
node-affinity-required-65445bfbc6-pfl66   0/1     Running   0          14m   10.244.2.61   k8s-node-2
node-affinity-required-65445bfbc6-q4xs4   0/1     Running   0          14m   10.244.2.60   k8s-node-2
node-affinity-required-65445bfbc6-vf6fl   0/1     Running   0          14m   10.244.2.57   k8s-node-2
```



#### 范例 - 2

```yaml
# cat node-affinity-and-resourcefits.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-affinity-and-resourcefits
  namespace: default
spec:
  replicas: 5
  selector:
    matchLabels:
      app: demoapp
      ctlr: node-affinity-and-resourcefits
  template:
    metadata:
      labels:
        app: demoapp
        ctlr: node-affinity-and-resourcefits
    spec:
      containers:
      - name: demoapp
        image: ikubernetes/demoapp:v1.0
        resources: # 不满足此资源需求的节点将在预选阶段被排除，意味着即使节点满足亲和标签，但资源不足的话仍然会在预选阶段被淘汰
          requests:
            cpu: 2
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: '/livez'
            port: 80
          initialDelaySeconds: 5
        readinessProbe:
          httpGet:
            path: '/readyz'
            port: 80
          initialDelaySeconds: 15
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: gpu
                operator: Exists
              - key: node-role.kubernetes.io/master
                operator: DoesNotExist
```



## 其他说明

**软亲和和硬亲和的区别**

软亲和和硬亲和的区别在于当节点不满足要求时的行为。

- 如果使用硬亲和，则只有满足要求的节点才能被选中，否则 Pod 调度失败。
- 而如果使用软亲和，则可以选择不满足要求但权重较高的节点进行调度。

例如，可以在 Pod 的 spec 中添加如下 nodeAffinity：

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution: # 使用硬亲和来要求 Pod 只能调度到标签为 `disktype=ssd` 且标签为 `gpu=true` 的节点上：
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
          - key: gpu
            operator: Exists
      preferredDuringSchedulingIgnoredDuringExecution: # 使用软亲和，如果没有满足要求的节点，就会选择权重较高的节点进行调度，其中权重为 1。
        - weight: 1
          preference:
            matchExpressions:
            - key: gpu
              operator: Exists
```





**pod.spec.nodeSelector 和 pod.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms 有什么区别**

`pod.spec.nodeSelector`和`pod.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms`都是用于将Pod调度到特定节点上的Kubernetes Pod spec的部分。

`pod.spec.nodeSelector`是一个映射，用于选择具有特定标签键/值对的节点，以在上面运行Pod。该标签必须存在于节点的标签集中。

`pod.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms`是一个更灵活的调度器选项，它允许您指定一个或多个标签选择器，以便更细粒度地控制Pod如何调度到节点上。此字段允许您指定`requiredDuringSchedulingIgnoredDuringExecution`或`preferredDuringSchedulingIgnoredDuringExecution`。前者是必需的标签选择器，Pod只能在满足这些标签选择器的节点上运行。后者是优选标签选择器，如果找不到满足必需标签选择器的节点，则Pod将尝试在满足优选标签选择器的节点上运行。

总的来说，`pod.spec.nodeSelector`提供了一种简单的方式来将Pod调度到特定的节点上，而`pod.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms`提供了更灵活的方式来指定节点标签选择器，以更精细地控制Pod的调度。



**与逻辑和或逻辑**

与逻辑和或逻辑是两种基本的逻辑运算。

"与逻辑"（AND）是指当且仅当两个条件都为真时，整个语句才为真。例如，“如果今天是周六并且天气晴朗，我将去散步。”只有当今天既是周六又晴朗时，整个语句才为真。

"或逻辑"（OR）是指只要两个条件中的一个为真，整个语句就为真。例如，“如果今天是周六或天气晴朗，我将去散步。”只要今天是周六或者天气晴朗，整个语句就为真。

这两种逻辑运算在数学、计算机科学、语言学、哲学等领域都有重要应用。



## 其他注意事项

在 Kubernetes 中，节点的状态是不断变化的，例如，节点可能会添加或删除标签。为了确保节点仍然满足 nodeAffinity 的要求，Kubernetes 会定期重新计算所有节点的状态，并尝试将 Pod 重新调度到满足要求的节点上。

在 nodeAffinity 的默认设置中，Kubernetes 会在调度 Pod 时对节点进行检查，以确保节点满足 nodeAffinity 的要求。但是，如果在节点上更改标签或其他属性，节点将不再满足 nodeAffinity 的要求，Kubernetes 不会自动将 Pod 调度到新的节点上，而是等待节点重新计算其状态时才进行调度。

**因此，在使用 nodeAffinity 时，应该在节点上保持稳定的标签和属性，以确保节点始终满足 nodeAffinity 的要求。**如果需要对节点的标签和属性进行更改，则需要重新调度 Pod，以便将 Pod 调度到满足新要求的节点上。



# pod Affinity  & AntiAffinity

- Pod 亲和 与 反亲和指的是，Pod 彼此间运行于同一位置的倾向性，位置：节点、机架、机排、IDC...
- 而 亲和 与 反亲和中同样细分为 软亲和 与 硬亲和：
  - preferredDuringSchedulingIgnoredDuringExecution，软亲和 preferred，
  - requiredDuringSchedulingIgnoredDuringExecution，硬亲和 required，


## podAffinity

- Pod 亲和，表示当前 Pod 与匹配 Pod 运行在同一节点；
- 同样支持 required 和 preferred：
  - preferred 软亲和（尽量与亲和的Pod运行在同一节点，实在不行再运行到其他节点。）
  - required 硬亲和（如果不能与亲和的Pod运行再同一节点，则Pod将处于Pending状态）

### preferred

- ` pod.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution`

#### 亲和前

- **为 k8s-node-2 节点打标签，后续模拟redis只运行在该节点上：**

```yaml
# kubectl label nodes k8s-node-2 rack=foo
node/k8s-node-2 labeled

# kubectl get nodes -l rack=foo
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-2   Ready    <none>   112d   v1.23.10
```

- **在未明确定义任何调度策略时，Pod通常会均匀的运行在各节点：**

```yaml
# vim pod-affinity-preferred-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-preferred
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
      ctlr: redis-preferred
  template:
    metadata:
      labels:
        app: redis
        ctlr: redis-preferred
    spec:
      nodeSelector: # 只运行在存在该标签的节点上
        rack: foo
      containers:
      - name: redis
        image: redis:6.0-alpine
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-affinity-preferred
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demoapp
      ctlr: pod-affinity-preferred
  template:
    metadata:
      labels:
        app: demoapp
        ctlr: pod-affinity-preferred
    spec:
      containers:
      - name: demoapp
        image: nginx:alpine
        resources:
          requests:
            cpu: 30m
            memory: 50Mi



# kubectl apply -f pod-affinity-preferred-demo.yaml
deployment.apps/redis-preferred created
deployment.apps/pod-affinity-preferred created


# 在未明确定义任何调度策略时，Pod通常会均匀的运行在各节点：
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                                    STATUS   NODE
pod-affinity-preferred-5cfcf57df-cbmqm  Running  k8s-node-2
pod-affinity-preferred-5cfcf57df-ghz6c  Running  k8s-node-1
pod-affinity-preferred-5cfcf57df-hqcl8  Running  k8s-node-1
redis-preferred-76bcfd9c99-b8kmc        Running  k8s-node-2
```

#### 亲和后

- **定义 demoapp 亲和 redis，可以实现 redis 运行在哪个节点，demoapp  就会运行在哪个节点**

```yaml
# vim pod-affinity-preferred-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-preferred
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
      ctlr: redis-preferred
  template:
    metadata:
      labels:
        app: redis
        ctlr: redis-preferred
    spec:
      nodeSelector:
        rack: foo
      containers:
      - name: redis
        image: redis:6.0-alpine
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-affinity-preferred
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demoapp
      ctlr: pod-affinity-preferred
  template:
    metadata:
      labels:
        app: demoapp
        ctlr: pod-affinity-preferred
    spec:
      containers:
      - name: demoapp
        image: nginx:alpine
        resources:
          requests:
            cpu: 30m
            memory: 50Mi
      affinity:
        podAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100 # 如果匹配以下标签和拓扑建，则权重加100（与redis在同一节点）
            podAffinityTerm:
              labelSelector:
                matchExpressions: # 匹配的Pod标签，并且关系，即此列表项中定义的内容需同时满足 
                - {key: app, operator: In, values: ["redis"]}
                - {key: ctlr, operator: In, values: ["redis-preferred"]}
              topologyKey: kubernetes.io/hostname # 匹配的节点标签
          - weight: 50
            podAffinityTerm:
              labelSelector: # 如果匹配以下标签和拓扑建，则权重加50（与redis在同一rack）
                matchExpressions:
                - {key: app, operator: In, values: ["redis"]}
                - {key: ctlr, operator: In, values: ["redis-preferred"]}
              topologyKey: rack # 匹配的节点标签


# pod都亲和到了redis所在的k8s-node-2节点
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                                     STATUS   NODE
pod-affinity-preferred-6474fdcdc7-9xgjb  Running  k8s-node-2
pod-affinity-preferred-6474fdcdc7-f2c64  Running  k8s-node-2
pod-affinity-preferred-6474fdcdc7-vhk9m  Running  k8s-node-2
redis-preferred-76bcfd9c99-m6drd         Running  k8s-node-2

# PS：如果pod并未全部都运行在k8s-node-2上，原因可能是demoapp定义的权重过低，或者是节点资源不足，从而导致在优选阶段k8s-node-2的打分低于k8s-node-1。也有可能是标签匹配器定义错误而导致未匹配
```

### required

- ` pod.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution`

#### 亲和前

- **为 k8s-node-2 节点打标签，后续模拟redis只运行在该节点上：**

```sh
# kubectl label nodes k8s-node-1 rack=foo
node/k8s-node-1 labeled

# kubectl get nodes -l rack=foo
NAME         STATUS   ROLES    AGE    VERSION
k8s-node-1   Ready    <none>   118d   v1.23.10
```

- **在未明确定义任何调度策略时，Pod通常会均匀的运行在各节点：**

```yaml
# vim pod-affinity-required-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
      ctlr: redis
  template:
    metadata:
      labels:
        app: redis
        ctlr: redis
    spec:
      containers:
      - name: redis
        image: redis:6.0-alpine
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-affinity-required
spec:
  replicas: 4
  selector:
    matchLabels:
      app: demoapp
      ctlr: pod-affinity-required
  template:
    metadata:
      labels:
        app: demoapp
        ctlr: pod-affinity-required
    spec:
      containers:
      - name: demoapp
        image: nginx:alpine


# kubectl apply -f pod-affinity-required-demo.yaml
deployment.apps/redis created
deployment.apps/pod-affinity-required created


# 在未明确定义任何调度策略时，Pod通常会均匀的运行在各节点：
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                                    STATUS   NODE
pod-affinity-required-666d6486cb-5x784  Running  k8s-node-1
pod-affinity-required-666d6486cb-st4nm  Running  k8s-node-2
pod-affinity-required-666d6486cb-tcfx8  Running  k8s-node-2
pod-affinity-required-666d6486cb-whc8z  Running  k8s-node-1
redis-797dd94c7-9kt7m                   Running  k8s-node-2
```

#### 亲和后

- **定义 demoapp 亲和 redis，可以实现 redis 运行在哪个节点，demoapp  就会运行在哪个节点**

```yaml
# vim pod-affinity-required-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
      ctlr: redis
  template:
    metadata:
      labels:
        app: redis
        ctlr: redis
    spec:
      containers:
      - name: redis
        image: redis:6.0-alpine
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-affinity-required
spec:
  replicas: 4
  selector:
    matchLabels:
      app: demoapp
      ctlr: pod-affinity-required
  template:
    metadata:
      labels:
        app: demoapp
        ctlr: pod-affinity-required
    spec:
      containers:
      - name: demoapp
        image: nginx:alpine
      affinity:
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector: # labelSelector也可以定义多个，但多个labelSelector间为或关系，即满足一个即可
              matchExpressions: # 匹配的Pod标签，列表项中的内容为与关系，即需同时满足
              - {key: app, operator: In, values: ["redis"]}
              - {key: ctlr, operator: In, values: ["redis"]}
            topologyKey: rack # 匹配的节点标签
 
 
# kubectl apply -f pod-affinity-required-demo.yaml
deployment.apps/redis created
deployment.apps/pod-affinity-required created


# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                                   STATUS             NODE
pod-affinity-required-b5c89887f-6pprc  ContainerCreating  k8s-node-1
pod-affinity-required-b5c89887f-f8dxk  ContainerCreating  k8s-node-1
pod-affinity-required-b5c89887f-vmkx5  ContainerCreating  k8s-node-1
pod-affinity-required-b5c89887f-zz4c5  ContainerCreating  k8s-node-1
redis-797dd94c7-zrtkn                  ContainerCreating  k8s-node-1
```



## podAntiAffinity

- Pod 反亲和，表示当前 Pod 不与匹配 Pod 运行在同一节点；
- 同样支持 required 和 preferred：
  - required 硬反亲和（如果不能与匹配的Pod运行在不同节点，则Pod将处于Pending状态）
  - preferred 软反亲和（尽量与匹配的Pod运行在不同节点，如不能运行在不同节点，则Pod将调度到其他合适的节点）

- ` pod.spec.affinity.podAntiAffinity`

### required

- 此示例表示将每个demoapp运行在不同的节点（类似DaemonSet的效果）

- ` pod.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution`

```yaml
# vim pod-antiaffinity-required-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-antiaffinity-required
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demoapp
      ctlr: pod-antiaffinity-required
  template:
    metadata:
      labels:
        app: demoapp
        ctlr: pod-antiaffinity-required
    spec:
      containers:
      - name: demoapp
        image: ikubernetes/demoapp:v1.0
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - {key: app, operator: In, values: ["demoapp"]}
              - key: ctlr
                operator: In
                values: ["pod-antiaffinity-required"]
            topologyKey: kubernetes.io/hostname


# kubectl apply -f pod-antiaffinity-required-demo.yaml
deployment.apps/pod-antiaffinity-required created


# master节点默认有不可调度的污点，且Pod自身未定义容忍度            
# kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   118d   v1.23.10
k8s-node-1     Ready    <none>                 118d   v1.23.10
k8s-node-2     Ready    <none>                 113d   v1.23.10


# 因此，剩余的Pod如果不能与匹配的Pod运行在不同节点，则剩余的Pod将处于Pending状态
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                                        STATUS   NODE
pod-antiaffinity-required-7fdff56bb8-9xrlb  Running  k8s-node-2
pod-antiaffinity-required-7fdff56bb8-k54dz  Running  k8s-node-1
pod-antiaffinity-required-7fdff56bb8-vbfh7  Pending  <none>
```



# NodeTaints & PodTolerations

## 节点污点

### taints

```yaml
# kubectl explain nodes.spec.taints
...
spec:
...
  taints <[]Object> # 污点的对象列表，可以定义多个
    effect <string> -required- # 效应标识（效用标识）
    key  <string> -required- # 键，必选
    timeAdded <string> # 添加污点的时间，只对NoExecute类型的效应标识有效
    value <string> # 值，可选
...
```

#### effect

效应标识主要有以下3种类型：

- **NoExecute**：
  - Pod 如果不能容忍此节点的污点，将**不会被调度**到该节点（会在调度预选阶段直接排除）；
  - 节点上原有的 Pod 如不能容忍此节点的污点将**会被驱逐**

- **NoSchedule**：
  - Pod 如果不能容忍此节点的污点，将**不会被调度**到该节点（会在调度预选阶段直接排除）；
  - 对节点上原有的 Pod 不产生影响
- **PreferNoSchedule**：
  - Pod 如果不能容忍此节点的污点，将**尽量不调度**到该节点，除非没有其他合适节点可用（会在调度优选阶段影响评分）；
  - 对节点上原有的 Pod 不产生影响

### 节点默认存在的污点

- Master 节点默认存在的污点，Master 节点通常运行apiserver等核心Pod，因此压力通常会很高，所以默认会添加以下污点以实现应用Pod不往其调度（除非Pod定义了容忍度）。

```yaml
# kubectl get nodes k8s-master-1 -o yaml
...
spec:
...
  taints: # taints表示污点
  - effect: NoSchedule # 效应标识（效用标识）
    key: node-role.kubernetes.io/master # 键前缀/键
...


# kubectl describe nodes k8s-master-1
...
Taints:             node-role.kubernetes.io/master:NoSchedule
...
```

### 节点污点自动标识

- 节点控制器在特定条件下自动为节点添加污点信息，它们都使用NoExecute效用标识，因此非能容忍此类污点的现在Pod对象也会遭到驱逐。
- 不过，Kubernetes的核心组件通常都要容忍此类的污点，以确保其相应的DaemonSet控制器能够无视此类污点于节点上部署相应的关键Pod对象，例如kube-proxy或kube-flannel等。
- 目前，内建使用的此类污点有如下几个：

```yaml
node.kubernetes.io/not-ready # 节点进入NotReady状态时被自动添加的污点。
node.alpha.kubernetes.io/unreachable # 节点进入NotReachable状态时被自动添加的污点。
node.kubernetes.io/out-of-disk # 节点进入OutOfDisk状态时被自动添加的污点。
node.kubernetes.io/memory-pressure # 节点内存资源面临压力。
node.kubernetes.io/disk-pressure # 节点磁盘资源面临压力。
node.kubernetes.io/network-unavailable # 节点网络不可用。
node.cloudprovider.kubernetes.io/uninitialized # kubelet由外部的云环境程序启动时，它自动为节点添加此污点，待到云控制器管理器中的控制器初始化此节点时再将其删除。
```

### 节点污点管理命令

```sh
# 为节点打上NoSchedule类型的污点
kubectl cordon

# 取消污点
kubectl uncordon

# 为节点打上NoSchedule类型的污点，并且驱逐节点上原有的Pod（相当于为节点打 NoExecute 类型的污点）
kubectl drain k8s-node-2 --ignore-daemonsets --force --delete-emptydir-data


# 自定义污点
kubectl taint NODE NAME KEY_1=VAL_1:TAINT_EFFECT_1 ... KEY_N=VAL_N:TAINT_EFFECT_N [options]
```



### 范例：kubectl cordon

- 为节点打 NoSchedule 类型的污点，以实现 Pod 不往其调度

#### 打污点前

```yaml
# vim deployment-demoapp.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
spec:
  replicas: 5
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: nginx:alpine


# kubectl apply -f deployment-demoapp.yaml
deployment.apps/demoapp created


# 基本上在个每个节点均匀运行
# kubectl get pod -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP            NODE      
demoapp-757c65c675-46b4z   1/1     Running   0          20s   10.244.1.6    k8s-node-1
demoapp-757c65c675-6l4wg   1/1     Running   0          20s   10.244.2.64   k8s-node-2
demoapp-757c65c675-8jjfc   1/1     Running   0          20s   10.244.1.7    k8s-node-1
demoapp-757c65c675-jrxsm   1/1     Running   0          20s   10.244.2.66   k8s-node-2
demoapp-757c65c675-t2wpf   1/1     Running   0          20s   10.244.2.65   k8s-node-2
```

#### 打污点后

```yaml
# kubectl cordon k8s-node-2
node/k8s-node-2 cordoned


# 可以看到 master 节点的状态成为 SchedulingDisabled 了
# kubectl get nodes
NAME           STATUS                     ROLES                  AGE    VERSION
k8s-master-1   Ready                      control-plane,master   118d   v1.23.10
k8s-node-1     Ready                      <none>                 118d   v1.23.10
k8s-node-2     Ready,SchedulingDisabled   <none>                 112d   v1.23.10


# 被打上的污点
#  kubectl describe nodes k8s-node-2 | grep Taints
Taints:             node.kubernetes.io/unschedulable:NoSchedule


# 因为是NoSchedule类型的污点，所以节点上现存的Pod不会受影响。
# kubectl get pod -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP            NODE      
demoapp-757c65c675-46b4z   1/1     Running   0          11m   10.244.1.6    k8s-node-1
demoapp-757c65c675-6l4wg   1/1     Running   0          11m   10.244.2.64   k8s-node-2
demoapp-757c65c675-8jjfc   1/1     Running   0          11m   10.244.1.7    k8s-node-1
demoapp-757c65c675-jrxsm   1/1     Running   0          11m   10.244.2.66   k8s-node-2
demoapp-757c65c675-t2wpf   1/1     Running   0          11m   10.244.2.65   k8s-node-2



# 因为Pod并未定义容忍度，所以Pod重建后将不会调度到打了污点的节点
# kubectl delete -f deployment-demoapp.yaml
deployment.apps "demoapp" deleted
# kubectl apply -f deployment-demoapp.yaml
deployment.apps/demoapp created
# kubectl get pod -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP            NODE      
demoapp-757c65c675-8qqbz   1/1     Running   0          12s   10.244.1.10   k8s-node-1
demoapp-757c65c675-967f8   1/1     Running   0          12s   10.244.1.9    k8s-node-1
demoapp-757c65c675-fmqzh   1/1     Running   0          12s   10.244.1.12   k8s-node-1
demoapp-757c65c675-tlbm4   1/1     Running   0          12s   10.244.1.8    k8s-node-1
demoapp-757c65c675-w5p6q   1/1     Running   0          12s   10.244.1.11   k8s-node-1



# 取消禁止
# kubectl uncordon k8s-node-2
node/k8s-node-2 uncordoned
# kubectl get node
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   118d   v1.23.10
k8s-node-1     Ready    <none>                 118d   v1.23.10
k8s-node-2     Ready    <none>                 112d   v1.23.10
# kubectl delete -f deployment-demoapp.yaml
deployment.apps "demoapp" deleted
# kubectl apply -f deployment-demoapp.yaml
deployment.apps/demoapp created
# kubectl get pod -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP            NODE      
demoapp-757c65c675-64qlq   1/1     Running   0          8s    10.244.2.67   k8s-node-2
demoapp-757c65c675-hmhwc   1/1     Running   0          8s    10.244.1.13   k8s-node-1
demoapp-757c65c675-klnnj   1/1     Running   0          8s    10.244.2.68   k8s-node-2
demoapp-757c65c675-p4nbj   1/1     Running   0          8s    10.244.2.69   k8s-node-2
demoapp-757c65c675-zwwgq   1/1     Running   0          8s    10.244.1.14   k8s-node-1
```

### 范例：kubectl drain

- `kubectl drain`，相当于为节点打 NoExecute 类型的污点

```yaml
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                      STATUS   NODE
demoapp-757c65c675-64qlq  Running  k8s-node-2
demoapp-757c65c675-hmhwc  Running  k8s-node-1
demoapp-757c65c675-klnnj  Running  k8s-node-2
demoapp-757c65c675-p4nbj  Running  k8s-node-2
demoapp-757c65c675-zwwgq  Running  k8s-node-1


# kubectl drain k8s-node-2 --ignore-daemonsets --force  --delete-emptydir-data
node/k8s-node-2 cordoned
WARNING: ignoring DaemonSet-managed Pods: kube-flannel/kube-flannel-ds-s9h2h, kube-system/kube-proxy-hh5ph
evicting pod default/demoapp-757c65c675-p4nbj
evicting pod default/demoapp-757c65c675-64qlq
evicting pod default/demoapp-757c65c675-klnnj
pod/demoapp-757c65c675-p4nbj evicted
pod/demoapp-757c65c675-klnnj evicted
pod/demoapp-757c65c675-64qlq evicted
node/k8s-node-2 drained


# 原有Pod被驱逐到了其他节点
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                      STATUS   NODE
demoapp-757c65c675-9bc2k  Running  k8s-node-1
demoapp-757c65c675-g4rc5  Running  k8s-node-1
demoapp-757c65c675-hmhwc  Running  k8s-node-1
demoapp-757c65c675-ntpcr  Running  k8s-node-1
demoapp-757c65c675-zwwgq  Running  k8s-node-1


# kubectl get nodes
NAME           STATUS                     ROLES                  AGE    VERSION
k8s-master-1   Ready                      control-plane,master   118d   v1.23.10
k8s-node-1     Ready                      <none>                 118d   v1.23.10
k8s-node-2     Ready,SchedulingDisabled   <none>                 112d   v1.23.10


# 被打上了NoSchedule类型的effect
# kubectl describe nodes k8s-node-2 | grep Taints
Taints:             node.kubernetes.io/unschedulable:NoSchedule


# 取消污点
# kubectl uncordon k8s-node-2
node/k8s-node-2 uncordoned
# kubectl get node
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   118d   v1.23.10
k8s-node-1     Ready    <none>                 118d   v1.23.10
k8s-node-2     Ready    <none>                 112d   v1.23.10
```

### 范例：kubectl taint

#### NoSchedule

```yaml
# vim deployment-demoapp.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
spec:
  replicas: 5
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: nginx:alpine


# kubectl apply -f deployment-demoapp.yaml
deployment.apps/demoapp created


# kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   118d   v1.23.10
k8s-node-1     Ready    <none>                 118d   v1.23.10
k8s-node-2     Ready    <none>                 112d   v1.23.10


# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                      STATUS   NODE
demoapp-757c65c675-4pmjn  Running  k8s-node-1
demoapp-757c65c675-6g5kc  Running  k8s-node-2
demoapp-757c65c675-d4fk7  Running  k8s-node-2
demoapp-757c65c675-qg24c  Running  k8s-node-1
demoapp-757c65c675-vg97j  Running  k8s-node-2


------------

# 为k8s-node-2定义NoSchedule类型的污点，键可以自定义，但此命令不支持定义键前缀，例如：node.kubernetes.io/unschedulable:NoSchedule
# kubectl taint node k8s-node-2 unschedulable:NoSchedule
node/k8s-node-2 tainted

# 验证污点
# kubectl describe nodes k8s-node-2 | grep Taints -i
Taints:             unschedulable:NoSchedule

# 自定的污点不会在STATUS中显示
# kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   118d   v1.23.10
k8s-node-1     Ready    <none>                 118d   v1.23.10
k8s-node-2     Ready    <none>                 112d   v1.23.10


# 因为Pod未定义容忍度，因此只会调度到k8s-node-1
# kubectl delete -f deployment-demoapp.yaml
deployment.apps "demoapp" deleted
# kubectl apply -f deployment-demoapp.yaml
deployment.apps/demoapp created
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                      STATUS   NODE
demoapp-757c65c675-9zhmt  Running  k8s-node-1
demoapp-757c65c675-bthz5  Running  k8s-node-1
demoapp-757c65c675-pt7xt  Running  k8s-node-1
demoapp-757c65c675-rh9zl  Running  k8s-node-1
demoapp-757c65c675-rkbkn  Running  k8s-node-1
```

#### NoExecute

```yaml
# vim deployment-demoapp.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
spec:
  replicas: 5
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: nginx:alpine


# kubectl apply -f deployment-demoapp.yaml
deployment.apps/demoapp created


# kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   118d   v1.23.10
k8s-node-1     Ready    <none>                 118d   v1.23.10
k8s-node-2     Ready    <none>                 112d   v1.23.10


# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                      STATUS   NODE
demoapp-757c65c675-4pmjn  Running  k8s-node-1
demoapp-757c65c675-6g5kc  Running  k8s-node-2
demoapp-757c65c675-d4fk7  Running  k8s-node-2
demoapp-757c65c675-qg24c  Running  k8s-node-1
demoapp-757c65c675-vg97j  Running  k8s-node-2


------------

# 为k8s-node-2定义NoExecute类型的污点
# kubectl taint node k8s-node-2 unschedulable:NoExecute
node/k8s-node-2 tainted

# 验证污点
# kubectl describe nodes k8s-node-2 | grep Taints -i
Taints:             unschedulable:NoExecute

# 自定的污点不会在STATUS中显示
# kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k8s-master-1   Ready    control-plane,master   118d   v1.23.10
k8s-node-1     Ready    <none>                 118d   v1.23.10
k8s-node-2     Ready    <none>                 112d   v1.23.10


# Pod未定义容忍度，因此被驱逐到k8s-node-1
# kubectl get pod -o wide |awk '{print $1,$3,$7}'|column  -t
NAME                      STATUS   NODE
demoapp-757c65c675-286pc  Running  k8s-node-1
demoapp-757c65c675-9m6ts  Running  k8s-node-1
demoapp-757c65c675-cgvm8  Running  k8s-node-1
demoapp-757c65c675-hf4s5  Running  k8s-node-1
demoapp-757c65c675-xckd2  Running  k8s-node-1
```



## Pod容忍度

### tolerations

```yaml
# kubectl explain Pod.spec.tolerations
...
spec:
...
  tolerations <[]Object> # 容忍度的对象列表，可以定义多个
    effect <string> # 效应标识（效用标识）
    key  <string> # 键
    value <string> # 值
    operator <string> # 键与值的关系，可以为Equal或Exists，默认Equal
    tolerationSeconds <integer> # 对NoExecute类型的effect能够容忍多长时间
...
```

#### operator

在Pod对象上定义容忍度时，支持以下两种操作符：

- **等值比较（Equal）：**表示与节点污点的key、value、effect完全匹配。
- **存在性判断（Exists）：**表示与节点污点的key、effect完全匹配。

### 各种 Pod 控制器的默认容忍度

```yaml
# Pod
  tolerations:
  - effect: NoExecute # 可以容忍在未就绪的节点上运行Pod
    key: node.kubernetes.io/not-ready
    operator: Exists
    tolerationSeconds: 300
  - effect: NoExecute # 可以容忍在不可达的节点上运行Pod
    key: node.kubernetes.io/unreachable
    operator: Exists
    tolerationSeconds: 300


# DaemonSet（DaemonSet控制器为保证始终运行在每个节点上，因此默认会存在许多方面的容忍度）
  tolerations:
  - effect: NoExecute # 可以容忍在未就绪的节点上运行Pod（Pod自身默认值）
    key: node.kubernetes.io/not-ready
    operator: Exists
  - effect: NoExecute
    key: node.kubernetes.io/unreachable # 可以容忍在未就绪的节点上运行Pod（Pod自身默认值）
    operator: Exists
  - effect: NoSchedule # 可以容忍在磁盘快满的节点上运行DaemonSet控制器控制的Pod
    key: node.kubernetes.io/disk-pressure
    operator: Exists
  - effect: NoSchedule # 可以容忍在内存快满的节点上运行DaemonSet控制器控制的Pod
    key: node.kubernetes.io/memory-pressure
    operator: Exists
  - effect: NoSchedule
    key: node.kubernetes.io/pid-pressure # 可以容忍在Pid使用量快不足的节点上运行DaemonSet控制器控制的Pod
    operator: Exists
  - effect: NoSchedule # 可以容忍在不可调度的节点上运行DaemonSet控制器控制的Pod
    key: node.kubernetes.io/unschedulable
    operator: Exists
  - effect: NoSchedule # 可以容忍在网络不可用的的节点上运行DaemonSet控制器控制的Pod
    key: node.kubernetes.io/network-unavailable
    operator: Exists
```



### 范例：系统核心 Pod 的容忍度

- **Master 节点默认存在的污点：**

```yaml
# kubectl describe nodes k8s-master-1
...
Taints:             node-role.kubernetes.io/master:NoSchedule
...


# kubectl get nodes k8s-master-1 -o yaml
...
spec:
...
  taints:
  - effect: NoSchedule
    key: node-role.kubernetes.io/master
...
```

- **系统核心 Pod 的容忍度：**

```yaml
# apiserver Pod容忍master节点的污点，因此可以实现运行在master节点之上
# kubectl describe pod -n kube-system kube-apiserver-k8s-master-1 | grep Tolerations
Tolerations:       :NoExecute op=Exists


# kubectl get pod -n kube-system kube-apiserver-k8s-master-1 -o yaml
...
spec:
...
  tolerations:
  - effect: NoExecute
    operator: Exists
```



### 范例：为 Pod 定义容忍度

- 将 node-exporter Pod 定义容忍度，以实现master节点也可以运行

#### yaml

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: daemonset-demo
  namespace: default
  labels:
    app: prometheus
    component: node-exporter
spec:
  selector:
    matchLabels:
      app: prometheus
      component: node-exporter
  template:
    metadata:
      name: prometheus-node-exporter
      labels:
        app: prometheus
        component: node-exporter
    spec:
      tolerations:
      - key: node-role.kubernetes.io/master # 容忍master节点上的NoSchedule标识
        effect: NoSchedule
        operator: Exists
      containers:
      - image: prom/node-exporter:v0.18.1
        name: prometheus-node-exporter
        ports:
        - name: prom-node-exp
          containerPort: 9100
          hostPort: 9100
      hostNetwork: true
      hostPID: true
```

#### 验证

```yaml
# 可以运行在master节点上了
# kubectl get pod -o wide
NAME                   READY   STATUS    RESTARTS   AGE     IP           NODE        
daemonset-demo-cql64   1/1     Running   0          4m56s   10.0.0.100   k8s-master-1
daemonset-demo-rlk4c   1/1     Running   0          4m56s   10.0.0.102   k8s-node-2  
daemonset-demo-zqhlh   1/1     Running   0          4m56s   10.0.0.101   k8s-node-1 



# kubectl describe pod daemonset-demo-rlk4c | grep -i NoSchedule
Tolerations:                 node-role.kubernetes.io/master:NoSchedule op=Exists # 添加的
...
```



## 匹配逻辑

一个节点可以配置使用多个污点，而一个Pod对象也可以有多个容忍度，将一个Pod对象的容忍度套用到特定节点的污点之上进行匹配度检测时，将遵循如下逻辑：

1. 首先处理每个有着与之匹配的容忍度的污点；
   - 取交集
2. 对于不能匹配到容忍度的所有污点，若存在一个污点使用了NoSchedule效用标识，则拒绝调度当前Pod至该节点；
   - 取差集
3. 对于不能匹配到容忍度的所有污点，若都不具有NoSchedule效用标识，但至少有一个污点使用了PreferNoScheduler效用标准，则调度器会尽量避免将当前Pod对象调度至该节点。
4. 如果至少有一个不能匹配容忍度的污点使用了NoExecute效用标识，节点将立即驱逐当前Pod对象，或者不允许该Pod调度至给定的节点；而且，即便容忍度可以匹配到使用了NoExecute效用标识的污点，若在Pod上定义容忍度时同时使用tolerationSeconds属性定义了容忍时限，则在超出时限后当前脚Pod也将会被节点所驱逐。





# 拓扑分布式调度

- Pod资源规范中的拓扑分布约束嵌套定义在.spec.topologySpreadConstraints字段中，它用来指示调度器如何根据集群中现有的Pod放置待调度的该Pod规范的实例。

## Explain

```yaml
topologyKey <string> # 拓扑键，用来划分拓扑结构的节点标签，在指定的键上具有相同值的节点归属为同一拓扑；必选字段。

labelSelector <Object> # Pod标签选择器，用于定义该Pod需要针对哪类Pod对象的位置来确定自身可放置的位置。

maxSkew <integer> # 允许Pod分布不均匀的最大程度，也就是可接受的当前拓扑中由labelSelector匹配到的Pod数量与所有拓扑中匹配到的最少Pod数量的最大差值，可简单用公式表示为max(count(current_topo(matched_pods))-min(topo(matched_pods)))，其中的topo是表示拓扑关系伪函数名称。

whenUnsatisfiable <string> # 拓扑无法满足maxSkew时采取的调度策略，默认值DoNotSchedule是一种强制约束，即不予调度至该区域，而另一可用值ScheduleAnyway则是柔性约束，无法满足约束关系时仍可将Pod放入该拓扑中。
```

### maxSkew

- 极差，最大值和最小值相差的比例，如果该值为1，则：
  - 假设运行4个Pod在3个节点上，其允许1个节点运行两个Pod运行在一个节点

# 指定使用的调度器

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  labels:
    name: myapp
spec:
  schedulerName <string> # 指定使用的调度器，默认使用默认的调度器(经典调度算法)
```

# 调度优先级

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  labels:
    name: myapp
spec:
  priority <integer> # Pod调度时的优先级
  priorityClassName <string> # 优先级类，"system-node-critical" 和 "system-cluster-critical" 表示最高优先级
  preemptionPolicy <string> # 优先级抢占，如果节点没有足够资源创建Pod，则从待调度队列中驱逐一个Pod为其腾出资源
```

## PriorityClass

```
apiVersion: scheduling.k8s.io/v1  # 资源隶属的API群组及版本
kind: PriorityClass  # 资源类别标识符
metadata:
  name <string>   # 资源名称
value  <integer>  # 优先级，必选字段
description  <string>  # 该优先级描述信息
globalDefault <boolean>  # 是否为全局默认优先级
preemptionPolicy  <string>  # 抢占策略，Never为禁用，默认为PreemptLowerPriority
```





# 范例：将 Pod 运行在 master 节点

- 背景说明：在 master 节点构建镜像后，镜像将位于 master 节点，要将该镜像运行于 kubernetes 上还需将其推送到 harbor，不便于测试。
- 但默认 master 节点具有 xxx 的污点，Pod 无法在上面运行

```sh
# 默认 master 节点上的污点
# kubectl describe nodes k8s-master1 | grep Taints
Taints:             node-role.kubernetes.io/master:NoSchedule
```

- 如果只定义 nodeSelector，将报以下错误

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: centos7
  namespace: test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: centos7
  template:
    metadata:
      name: centos7
      labels:
        app: centos7
    spec:
      containers:
      - name: centos7
        image: centos7:v1.1
        #env:
        #- name: NTP_SERVER1
        #  value: "172.16.0.125"
        #- name: NTP_SERVER2
        #  value: "172.16.0.127"
        #securityContext:
        #  capabilities:
        #    add: ['CAP_SYS_TIME']
      nodeSelector:
        kubernetes.io/hostname: 'k8s-master1'



# kubectl get pod -n test
NAME                       READY   STATUS    RESTARTS   AGE
centos7-676c59457c-fvktn   0/1     Pending   0          3m7s



# kubectl describe pod -n test centos7-676c59457c-fvktn
...
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  14s   default-scheduler  0/13 nodes are available: 10 node(s) didn't match Pod's node affinity/selector, 3 node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate.

```

- 还需要容忍 master 节点上的污点

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: centos7
  namespace: test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: centos7
  template:
    metadata:
      name: centos7
      labels:
        app: centos7
    spec:
      containers:
      - name: centos7
        image: centos7:v1.1
        #env:
        #- name: NTP_SERVER1
        #  value: "172.16.0.125"
        #- name: NTP_SERVER2
        #  value: "172.16.0.127"
        #securityContext:
        #  capabilities:
        #    add: ['CAP_SYS_TIME']
      nodeSelector:
        kubernetes.io/hostname: 'k8s-master1'
      tolerations:
      - key: node-role.kubernetes.io/master # 容忍master节点上的NoSchedule标识
        effect: NoSchedule
        operator: Exists


# kubectl get pod -n test -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP             NODE          NOMINATED NODE   READINESS GATES
centos7-85f75c47db-6t8lh   1/1     Running   0          10s   10.233.68.15   k8s-master1   <none>           <none>
```





# ---

# 驱逐在节点运行的Pod

要驱逐在节点上运行的 Pod，你可以使用 `kubectl` 命令行工具来执行。驱逐操作将会将 Pod 从节点上移除，并且 Kubernetes 将会重新调度这些 Pod 到其他可用节点上。

## 查看运行在指定节点的所有Pod

```sh
kubectl get pods --field-selector spec.nodeName=<node-name> -A
```



## 驱逐一个节点上所有的 Pod

如果你想要驱逐一个节点上所有的 Pod，可以使用以下命令：

```bash
kubectl drain <node-name>
```

这个命令会驱逐指定节点上的所有 Pod，并且阻止 Kubernetes 在该节点上调度新的 Pod。驱逐操作将会等待正在运行的 Pod 优雅地终止，并且等待它们被重新调度到其他节点上。



```
# kubectl drain k8s-worker-3
node/k8s-worker-3 cordoned
DEPRECATED WARNING: Aborting the drain command in a list of nodes will be deprecated in v1.23.
The new behavior will make the drain command go through all nodes even if one or more nodes failed during the drain.
For now, users can try such experience via: --ignore-errors
error: unable to drain node "k8s-worker-3", aborting command...

There are pending nodes to be drained:
 k8s-worker-3
cannot delete DaemonSet-managed Pods (use --ignore-daemonsets to ignore): kube-system/calico-node-5bxdm, kube-system/kube-proxy-kdhrx, kube-system/nodelocaldns-2gvwn, kubesphere-monitoring-system/node-exporter-2fzwx
cannot delete Pods with local storage (use --delete-emptydir-data to override): harbor/harbor-database-0, kubesphere-monitoring-system/alertmanager-main-0, kubesphere-monitoring-system/prometheus-k8s-1, target-control/target-async-7459c6bfbc-knjqc
```

这个错误信息说明了在执行节点驱逐时发生了一些问题：

1. **DEPRECATED WARNING**: 在未来的版本中，驱逐命令将会在遇到一个或多个节点失败时继续执行，而不是终止整个操作。为了获得这种体验，你可以使用 `--ignore-errors` 参数。

2. **DaemonSet Pods**: 无法删除由 DaemonSet 管理的 Pod。这些 Pod 在节点上运行的目的可能是关键的，因此默认情况下不能被驱逐。你可以使用 `--ignore-daemonsets` 参数来忽略这些 DaemonSet Pod。

3. **本地存储 Pod**: 无法删除使用本地存储的 Pod。这些 Pod 包含有状态信息，删除它们可能会导致数据丢失。你可以使用 `--delete-emptydir-data` 参数来覆盖此行为，但需要谨慎操作，以免造成数据丢失。

所以，你可以尝试以下命令来驱逐节点，同时忽略上述问题：

```bash
kubectl drain k8s-worker-3 --ignore-daemonsets --delete-emptydir-data
```

这将会尝试驱逐节点并忽略 DaemonSet Pods 和本地存储 Pods，但需要谨慎操作，确保不会因为驱逐这些 Pods 而造成系统问题。



## 驱逐一个节点上特定的 Pod

如果你只想要驱逐一个节点上的特定 Pod，可以使用以下命令：

```bash
kubectl delete pod <pod-name> --grace-period=30
```

其中 `<pod-name>` 是要驱逐的 Pod 的名称。这个命令会立即删除指定的 Pod，并且 Kubernetes 将会在一段时间后重新调度该 Pod 到其他节点上。`--grace-period` 参数指定了 Pod 优雅终止的等待时间。

## 取消节点驱逐

如果你需要取消节点的驱逐操作，可以使用以下命令：

```bash
kubectl uncordon <node-name>
```

这个命令会取消指定节点的驱逐状态，允许 Kubernetes 在该节点上重新调度 Pod。





# 将节点设置为不可调度

要将 Kubernetes 节点设置为不可调度，你可以使用 `kubectl` 命令行工具或者修改节点的标签来实现。下面是两种方法：

## 方法一：使用 kubectl

使用以下命令将节点设置为不可调度：

```bash
kubectl cordon <node-name>
```

这个命令会标记指定的节点为不可调度状态，即 Kubernetes 将不会在这个节点上调度新的 Pod。

## 方法二：修改节点标签

另一种方法是通过修改节点的标签来实现不可调度状态。你可以为节点添加一个特殊的标签，告诉 Kubernetes 不要在这个节点上调度新的 Pod。例如：

```bash
kubectl label nodes <node-name> node-role.kubernetes.io/master-
```

这个命令会将一个名为 `node-role.kubernetes.io/master` 的标签从节点上移除。通常情况下，Kubernetes 集群会避免在被标记为 "master" 的节点上调度工作负载。

## 恢复节点的可调度状态

如果需要恢复节点的可调度状态，可以使用以下命令：

```bash
kubectl uncordon <node-name>
```

这会将节点标记为可调度状态，Kubernetes 可以在这个节点上调度新的 Pod。
