---
title: "核心组件"
weight: 10
---


# Master 节点概述

- Master 节点，又称控制平面 Control Plane
- 控制平面是 Kubernetes 集群中的一个组件集合，负责管理集群的状态和行为，并确保它们符合所需的规范。其他控制平面组件包括 API Server、etcd、Controller Manager 和 Cloud-Controller Manager。
- 控制平面组件会为集群做出全局决策，比如资源的调度。 以及检测和响应集群事件
  - 例如当不满足部署的 `replicas` 字段时， 要启动新的 [pod](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/)）
- **Master 节点通常运行相关控制组件，而不运行用户容器**

**Master 节点核心组件：**

- API Server
- Controller Manager
- Scheduler
- etcd（可选）



# Worker 节点概述

- 又称 Node 节点
- 节点（node）组件会在每个节点上运行，负责维护运行的 Pod 并提供 Kubernetes 运行环境。
- 这些节点上会运行 由 Kubernetes 所管理的容器化应用
- 且每个集群至少有一个工作节点。
- 工作节点会托管所谓的 Pods，控制平面管理集群中的工作节点和 Pods。 
- 为集群提供故障转移和高可用性， 这些控制平面一般跨多主机运行，而集群也会跨多个节点运行。

**Worker 节点核心组件：**

- kube-proxy
- kubelet
- Container Runtime



# 前言

Kubernetes的核心组件包括以下几个：

1. Kubernetes Master：Kubernetes集群的控制中心，负责整个集群的管理和控制。它包括以下组件：
   - API Server：提供与Kubernetes集群通信的接口，并处理来自用户和其他组件的请求。
   - Controller Manager：负责运行和管理各种控制器，监视集群状态并采取相应的操作。
   - Scheduler：负责将新的Pod调度到合适的节点上运行。
2. etcd：一个分布式键值存储系统，用于存储Kubernetes集群的所有配置数据和状态信息。
   - etcd 可以单独部署一套集群，也可以和 master 节点运行在一起
3. Kubernetes Node：Kubernetes集群中的工作节点，用于运行应用程序容器。每个节点包括以下组件：
   - Kubelet：与Master节点通信，负责管理节点上的容器、镜像和存储卷等。
   - kube-proxy：负责为Pod提供网络代理和负载均衡功能。
   - 容器运行时（Container Runtime）：负责运行和管理容器，如Docker、containerd等。
4. Pod：是Kubernetes中最小的可调度单元，由一个或多个容器组成。Pod作为应用程序的逻辑主机，共享网络和存储资源。





# API Server

- K8S对外的唯一接口，提供HTTP/HTTPS RESTful API，即kubernetes API。所有的请求都需要经过这个接口进行通信。主要负责接收、校验并响应所有的REST请求，结果状态被持久存储在etcd当中，所有资源增删改查的唯一入口
- [kube-apiserver](https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kube-apiserver/) 服务器是 Kubernetes 控制平面的前端，也**是k8s所有组件间通信的枢纽**
- 只有 apiserver 才能访问 etcd

**apiserver 相关端口**

- TCP **/** 6443

**apiserver 功能示例**

- 当一个 Pod 挂了或者机器挂了的时候，由 Kubernetes API 负责来进行重新启动、迁移等行为，这种行为也叫做 "replication controller"
  - replication controller 会自动在一个健康的机器上创建一个一摸一样的Pod,来维持原来的Pod冗余状态不变
- Kubernetes API 根据一个模板生成了一个Pod，然后系统就根据用户的需求创建了许多冗余，这些冗余的Pod组成了一个整个应用，或者服务，或者服务中的一层。
- 用户可以给 Kubernetes Api 中的任何对象贴上一组 key:value的标签，然后，我们就可以通过标签来选择一组相关的Kubernetes Api 对象，然后去执行一些特定的操作
  - 每个资源额外拥有一组（很多） keys 和 values，然后外部的工具可以使用这些keys和vlues值进行对象的检索，这些Map叫做annotations（注释）。

**查看 apiserver 的版本**

```bash
# curl -k https://127.0.0.1:6443/version
{
  "major": "1",
  "minor": "24",
  "gitVersion": "v1.24.2",
  "gitCommit": "f66044f4361b9f1f96f0053dd46cb7dce5e990a8",
  "gitTreeState": "clean",
  "buildDate": "2022-06-15T14:15:38Z",
  "goVersion": "go1.18.3",
  "compiler": "gc",
  "platform": "linux/amd64"
}
```





API Server是Kubernetes的核心组件之一，它是Kubernetes集群中的控制面板，用于提供与集群通信的接口，并处理来自用户和其他组件的请求。下面是API Server的一些详细解释：

1. 功能：API Server提供了Kubernetes集群的管理和控制功能。它充当了Kubernetes的中央控制器，接收来自各个组件（如kubectl命令行工具、Dashboard、控制器等）的请求，并将其转化为集群内部的操作。它可以用于创建、更新和删除Kubernetes资源（如Pod、Service、Deployment等），查询集群状态，以及执行其他与集群管理相关的操作。
2. API接口：API Server通过RESTful API接口暴露其功能，以支持与集群进行通信。API Server的API接口使用JSON或YAML格式进行数据交换。用户可以通过kubectl命令行工具或其他自定义的客户端应用程序与API Server进行交互。
3. 认证和授权：API Server负责对请求进行认证和授权。它支持多种身份验证机制，如基于令牌(Token)的身份验证、基于客户端证书的身份验证、基于用户名和密码的身份验证等。一旦用户身份被认证，API Server还会根据用户的权限配置（RBAC）对其进行授权，以确保用户只能执行其具备权限的操作。
4. 通信和调度：API Server与其他组件进行通信，并协调集群中的操作。它接收来自Kubelet、Scheduler、Controller Manager等组件的心跳和状态报告，并将其存储在etcd中。API Server还负责调度Pod到合适的节点上运行，通过与Scheduler进行交互来实现调度功能。
5. 扩展性和插件机制：API Server具有可扩展性和插件机制，可以通过自定义API扩展来支持特定的资源类型和操作。这意味着用户可以自定义和扩展API Server的功能，以适应特定的需求和场景。

总之，API Server是Kubernetes集群中的核心组件之一，提供了集群管理和控制的接口。它负责处理用户和其他组件的请求，进行认证和授权，与其他组件进行通信和协调，以及支持可扩展性和插件机制，使得Kubernetes能够实现强大的容器编排和管理功能。





# Controller Manager

Controller Manager（控制器管理器）是Kubernetes的核心组件之一，它是集群控制面的一部分，负责管理和运行各种控制器，监视集群状态并采取相应的操作。下面是Controller Manager的一些详细解释：

1. 功能：Controller Manager负责运行多个控制器（Controllers），每个控制器负责监视和维护特定的Kubernetes资源对象的状态。这些控制器根据集群的期望状态和实际状态之间的差异，采取相应的操作来使集群达到期望状态。控制器可以创建、更新、删除和调度资源对象，以确保集群中的应用程序和资源处于正确的状态。
2. 内置控制器：Controller Manager包含多个内置控制器，用于管理不同类型的资源。一些常见的内置控制器包括：
   - ReplicaSet控制器：确保Pod副本数量与期望数量匹配。
   - Deployment控制器：管理应用程序的部署，实现滚动更新和回滚等功能。
   - StatefulSet控制器：管理有状态应用程序的部署和更新。
   - DaemonSet控制器：确保每个节点上运行一个Pod的副本。
   - Job和CronJob控制器：管理批处理任务的运行和调度。
3. 自定义控制器：除了内置控制器，用户还可以自定义和扩展Controller Manager，以创建自己的控制器来管理特定类型的资源。自定义控制器可以根据用户的需求和场景进行编写，通过监视和操作资源对象来实现自定义的控制逻辑。
4. 调度和协调：Controller Manager通过与其他组件（如API Server、Scheduler、etcd等）进行交互，实现资源的调度和协调。它监视集群中的资源状态，并根据需要触发相应的操作。例如，当ReplicaSet控制器检测到Pod副本数量不足时，它会创建新的Pod副本以满足期望数量。
5. 错误处理和恢复：Controller Manager具有错误处理和恢复机制，以确保集群的稳定性和一致性。当出现错误或异常情况时，控制器会进行错误处理，并尝试恢复集群到正常状态。它可以自动进行故障转移、重新调度和修复操作，以保持集群的健康状态。

总之，Controller Manager是Kubernetes集群中的核心组件之一，负责管理和运行各种控制器，以实现集群中资源的自动化管理和控制。它监视集群状态，根据资源的期望状态和实际状态之间的差异，采取相应的操作来保持集群的一致性和稳定性。内置控制器和自定义控制器共同工作，为Kubernetes提供了强大的编排和管理能力。

## kube-controller-manager

- Controller Manager 中主要包含了一个由多个控制器组成的可执行二进制文件，运行后形成[控制器](https://kubernetes.io/zh/docs/concepts/architecture/controller/)进程；
- 控制器进程主要负责集群内的 Node、Pod副本、服务端点(Endpoint)、命名空间(Namespace)、服务账号(ServiceAccount)、资源定额(ResourceQuota) 等集群中的各种资源处于预期的状态；
- 由控制器完成的主要功能主要包括生命周期功能和API业务逻辑，具体如下：
  - 生命周期功能：包括Namespace创建和生命周期、Event垃圾回收、Pod终止相关的垃圾回收、级联垃圾回收及Node垃圾回收等。
  - API业务逻辑：例如，由ReplicaSet执行的Pod扩展等。

**当某个 Node 意外宕机时，Controller Manager会及时发现并执行自动化修复流程（基于 control loop 控制循环来发现），确保集群始终处于预期的工作状态**

- PS：

**controller-manager 相关端口**

- TCP **/** 10252（老版本）

- TCP **/** 10257（新版本）

**控制器类型**

**注意：以下只列举出了部分控制器。实际上，每一种资源类型 `Kind: xxx` 背后都控制器存在，其使用的控制器可能是自己独享的，也有可能是共享其它的控制器。**

- 节点控制器（Node Controller）
  - 负责在节点出现故障时进行通知和响应

- 任务控制器（Job Controller）
  - 监测代表一次性任务的 Job 对象，然后创建 Pods 来运行这些任务直至完成

- 端点控制器（Endpoints Controller）
  - 填充端点（Endpoints）对象（即加入 Service 与 Pod）

- 服务帐户和令牌控制器（Service Account & Token Controllers）
  - 为新的命名空间创建默认帐户和 API 访问令牌

**Controller 相关命令：**

Kubernetes 控制器管理器是一个守护进程，内嵌随 Kubernetes 一起发布的核心控制回路

- https://kubernetes.io/zh-cn/docs/reference/command-line-tools-reference/kube-controller-manager/

```bash
kube-controller-manager [flags]
```

**参考文档：**

- https://kubernetes.io/zh-cn/docs/concepts/architecture/controller/





## cloud-controller-manager

- **cloud-controller-manager 是指嵌入特定云的控制逻辑之 控制平面组件**
- **cloud-controller-manager 允许你将你的集群连接到云提供商的 API 之上， 并将与该云平台交互的组件同与你的集群交互的组件分离开来。**
- `cloud-controller-manager` 仅运行特定于云平台的控制器。 因此如果你在自己的环境中运行 Kubernetes，或者在本地计算机中运行学习环境， 所部署的集群不需要有云控制器管理器。
- 与 `kube-controller-manager` 类似，`cloud-controller-manager` 将若干逻辑上独立的控制回路组合到同一个可执行文件中， 供你以同一进程的方式运行。 你可以对其执行水平扩容（运行不止一个副本）以提升性能或者增强容错能力。
- 下面的控制器都包含对云平台驱动的依赖：
  - 节点控制器（Node Controller）：用于在节点终止响应后检查云提供商以确定节点是否已被删除
  - 路由控制器（Route Controller）：用于在底层云基础架构中设置路由
  - 服务控制器（Service Controller）：用于创建、更新和删除云提供商负载均衡器



# Scheduler

Scheduler（调度器）是Kubernetes的核心组件之一，负责将新的Pod调度到合适的节点上运行。下面是Scheduler的一些详细解释：

1. 功能：Scheduler的主要功能是根据一组调度策略和节点资源的可用性，选择合适的节点将Pod调度到集群中。它监视集群中的未调度Pod，并根据Pod的资源需求、亲和性和反亲和性规则等因素，选择最佳的节点进行调度。Scheduler还负责处理Pod的调度冲突和负载均衡，以确保集群资源的最优利用。
2. 调度算法：Scheduler使用一系列调度算法和策略来进行节点选择和调度决策。常见的调度算法包括：
   - 负载均衡：选择负载较低的节点进行调度，以实现集群资源的均衡利用。
   - 亲和性和反亲和性：考虑Pod与节点之间的亲和性和反亲和性规则，如将Pod调度到与特定标签匹配的节点上，或将Pod调度到与其他特定Pod所在节点相同的节点上。
   - 资源需求和限制：考虑Pod的资源需求和节点的资源限制，确保Pod可以在节点上得到足够的资源。
3. 节点选择：Scheduler选择节点时，会考虑以下因素：
   - 节点资源可用性：检查节点上的资源使用情况，包括CPU、内存、存储等，选择资源充足的节点。
   - 节点亲和性和反亲和性：考虑Pod与节点之间的亲和性和反亲和性规则，选择满足亲和性和反亲和性规则的节点。
   - 节点互斥条件：避免将互斥的Pod调度到同一节点上，以防止冲突和资源争用。
4. 预选和绑定：Scheduler的调度过程分为两个阶段：预选（predicates）和绑定（binding）。
   - 预选阶段：在预选阶段，Scheduler会对所有的节点进行筛选，并排除不符合Pod的基本需求和调度约束的节点。
   - 绑定阶段：在绑定阶段，Scheduler会从预选通过的节点中选择一个最佳的节点，并将Pod与该节点进行绑定。
5. 可扩展性和插件机制：Scheduler具有可扩展性和插件机制，可以通过自定义调度器插件来扩展其功能。用户可以自定义和配置调度器插件，以实现特定的调度策略和行为。这样可以根据特定的需求和场景，灵活地定制调度器的行为。

总之，Scheduler是Kubernetes集群中的核心组件之一，负责将Pod调度到适合的节点上运行。它使用调度算法和策略，考虑资源需求、节点可用性和亲和性规则等因素，选择最佳的节点进行调度。Scheduler的可扩展性和插件机制使得用户可以自定义和扩展调度器的行为，以满足特定的调度需求。



# Kube-Proxy

- kube-proxy 会通过 api-server 监视 service 资源的变动，进而将**集群上的每一个 service 的定义**转换为本地的 iptables 或 ipvs 规则。
- kube-proxy 主要负责通过 api-server 监视所有节点上 service 的变化，以生成基于 iptables 或 ipvs 的网络规则

**请求数据流：**

- 客户端的请求报文首先会到达内核空间，然后在内核空间基于 iptables 或 ipvs 的规则将请求报文转发给 service，最后 service 在将报文转发给 pod

**kube-proxy代理模式：**

- 默认使用的iptables规则，早期只有 iptables 相关的网络规则，这会导致在启动一定数量容器后会生成数以千条的 iptables 规则，而 iptables 规则的检索 会导致 pod 的性能产生很大的影响
- k8s 1.11后 出现了 ipvs 也就是所谓的 LVS，支持多种调度算法
  - 如果没有开启 ipvs，则自动降级为 iptables



kube-proxy（Kubernetes Proxy）是Kubernetes集群中的核心组件之一，负责为Pod提供网络代理和负载均衡功能。下面是kube-proxy的一些详细解释：

1. 功能：kube-proxy的主要功能是为集群内的Pod提供网络代理和负载均衡。它维护集群中的网络规则和连接跟踪表，根据规则将进入集群的网络流量转发到正确的目标Pod上。kube-proxy还负责负载均衡，在有多个副本的Pod之间均匀分发流量，实现高可用和性能优化。
2. 代理模式：kube-proxy可以以不同的代理模式运行，包括以下几种常见的模式：
   - Userspace模式：在节点上的用户空间内运行代理进程，使用iptables规则进行流量转发和负载均衡。
   - iptables模式：利用节点上的iptables工具来设置规则并进行流量转发。
   - IPVS模式：使用Linux内核的IPVS（IP Virtual Server）模块来实现高性能的流量转发和负载均衡。
3. 负载均衡：kube-proxy负责在有**多个副本的Pod之间进行负载均衡**。它会根据负载均衡算法（如轮询、最少连接等）将进入集群的流量均匀地分发到各个Pod上，以实现负载的平衡和优化。
4. 服务发现：**kube-proxy与Kubernetes的Service概念密切相关**。Service是一种逻辑上的抽象，代表了一组具有相同功能的Pod。kube-proxy通过监视集群中的Service和相关的Endpoint信息，自动更新负载均衡规则，确保流量正确地路由到对应的Service后端Pod。
5. 节点故障处理：kube-proxy会监视节点的健康状态。如果节点发生故障或不可用，kube-proxy会自动将其从负载均衡和代理规则中删除，确保流量不再路由到故障节点上。
6. 高可用性：为了保证kube-proxy的高可用性，通常会在集群中运行多个kube-proxy副本。它们通过与API Server进行通信，保持规则和状态的同步，以实现故障转移和冗余。

总之，kube-proxy是Kubernetes集群中的核心组件之一，提供网络代理和负载均衡功能。它维护网络规则和连接跟踪表，将流量转发到正确的Pod上，并在有多个副本的Pod之间实现负载均衡。kube-proxy与Service紧密集成，确保流量正确路由到Service后端Pod。它的工作保证了集群内部网络的稳定和高效运行。



**kube-proxy 和 calico 网络插件是什么关系？**

kube-proxy和Calico网络插件是Kubernetes中不同层次的组件，但它们在网络功能上存在关系。

1. kube-proxy：kube-proxy是Kubernetes的核心组件之一，负责为Pod提供网络代理和负载均衡功能。它在集群内部的每个节点上运行，并通过维护网络规则和连接跟踪表来实现流量的转发和负载均衡。kube-proxy与Kubernetes的Service对象紧密集成，确保流量正确地路由到Service后端Pod。
2. Calico网络插件：Calico是一种常用的Kubernetes网络插件，用于提供高性能的容器网络和网络策略。Calico使用BGP协议和网络虚拟化技术，为Kubernetes集群中的Pod提供可靠的跨主机通信。它实现了一个高度可扩展的软件定义网络（SDN）解决方案，具有灵活的网络策略和安全性。

关系：

- kube-proxy与Calico网络插件之间存在一定的关系，但它们属于不同的层次和功能。kube-proxy负责在节点级别进行流量转发和负载均衡，而Calico网络插件负责实现跨节点的容器网络和网络策略。
- 当使用Calico作为Kubernetes的网络插件时，kube-proxy与Calico协同工作。kube-proxy仍然负责在节点级别进行流量转发和负载均衡，而Calico则提供底层的网络基础设施，使得跨节点的Pod通信能够顺利进行。
- Calico可以配置特定的网络策略，以控制Pod之间的通信和访问权限。这些网络策略可以与kube-proxy的负载均衡规则结合使用，实现更灵活和精细的网络控制。

总之，kube-proxy和Calico网络插件在Kubernetes集群中扮演不同的角色。kube-proxy负责节点级别的流量转发和负载均衡，而Calico网络插件提供了容器网络和网络策略的功能。当使用Calico作为网络插件时，kube-proxy与Calico协同工作，使得网络流量能够顺利跨节点传递，并结合Calico的网络策略实现网络安全控制。



# Kubelet

- kubelet 是节点的代理，会在每个节点上运行。
- **当 Scheduler 确定在某个 Node 上运行 Pod，并把相关信息通过 api-server 写入 etcd 后，kubelet 会将 Pod 的具体配置信息(image、volume等)发送给该节点的 kubelet ，kubelet 会根据这些信息创建和运行容器，并向 master 报告运行状态**
- 当容器创建失败的时候，kubelet 负责将容器重启
- **kubelet 主要功能：**
  - 节点心跳检检测（向 master 汇报 node 节点的状态信息，）
    - kubelet 负责创建和更新节点的 `.status`，以及更新它们对应的 Lease。
  - 接受指令并在 pod 中创建容器
  - 准备 pod 所需的数据卷
  - 返回 pod 的运行状态
  - 在 node 节点执行容器健康检查
- **kubelet 提供的三种接口：**
  - CNI、CRI、CSI

- **注意事项：**
  - kubelet 不会管理不是由 Kubernetes 创建的容器。



Kubelet（Kubernetes Agent）是Kubernetes集群中每个节点上的核心组件之一，负责管理节点上的容器化工作负载（Pods）。下面是Kubelet的一些详细解释：

1. 功能：Kubelet的主要功能是管理节点上的Pods。它与Master节点中的API Server进行通信，接收来自API Server的Pod创建、更新和删除请求，并确保节点上相应的Pods处于运行状态。Kubelet还负责监视和报告节点和Pods的状态，处理资源限制和Pod调度等任务。
2. 容器管理：Kubelet使用容器运行时（Container Runtime）来管理节点上的容器。常见的容器运行时包括Docker、containerd、CRI-O等。Kubelet负责启动、停止和监视容器的运行状态，以及处理容器的资源分配和网络配置等。
3. Pod生命周期管理：Kubelet负责Pod的生命周期管理。它会监视所分配给本节点的Pod，并根据API Server的指令，创建、启动和停止Pod中的容器。Kubelet还会定期检查Pod的健康状况，并重新启动失败的容器或重启整个Pod。
4. 资源管理和限制：Kubelet负责监视和管理节点上的资源使用情况。它会根据Pod和容器的资源需求和限制，确保节点资源得到合理分配和利用。Kubelet还会与容器运行时配合，实现资源的限制和隔离，以防止容器之间的资源冲突和影响。
5. 网络和存储配置：Kubelet负责为Pod提供网络和存储配置。它会根据Pod的网络策略，为Pod分配IP地址，并配置容器的网络连接。Kubelet还会挂载和管理Pod所需的存储卷，确保Pod能够访问所需的持久化数据。
6. 节点监视和报告：Kubelet会定期向Master节点报告节点的健康状态和资源使用情况。它会收集节点上的各项指标和统计信息，并将其报告给Master节点中的组件（如API Server、Controller Manager等），以帮助集群监控和管理节点的状态。

总之，Kubelet是Kubernetes集群中每个节点上的核心组件，负责管理节点上的容器化工作负载（Pods）。它与Master节点中的API Server进行通信，负责容器的创建、启动和停止，监视和报告Pod和节点的状态，处理资源管理和网络配置，以及为Pod提供存储功能。Kubelet的工作确保了节点上容器化工作负载的正确运行和管理。






# Container Runtime

每个Node都需要提供一个容器运行时(Container Runtime)环境，它负责下载镜像并运行容器。目前K8S支持的容器运行环境至少包括Docker、containerd、podman、RKT、cri-o、Fraki等



