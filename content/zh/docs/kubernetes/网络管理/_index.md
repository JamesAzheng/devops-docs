---
title: "网络管理"
weight: 10
---

# k8s 网络前言

**k8s 中的四种通信方式**

- Container to Container：
  - 发生在Pod内部，借助于lo实现；
- Pod to Pod：

  - Pod间的通信，k8s自身并未解决该该类通信，而是借助于CNI接口，交给第三方解决方案；CNI之前的接口叫kubenet
- Pod to Service：

  - 借助于kube-proxy生成的iptables或ipvs规则完成；
- ExternalClient to Service or Pod：

  - 引入集群外部流量，hostPort、hostNetwork、nodeport/service、loadbalancer/service、externalIP/service、Ingress



**k8s 环境中 总共需要划分三个地址段：**

- 宿主机网段
- pod网段
- service网段
- PS：注意，跨机房通信时注意地址段不要冲突



**容器跨节点通信**

- 如果容器要实现跨节点通信，需要使用虚拟网络，然后将容器接入虚拟网络

 

是的，如果容器需要在不同节点之间进行通信，通常需要使用虚拟网络。虚拟网络是一种将物理网络资源抽象化并提供逻辑网络连接的技术。它允许将容器接入到虚拟网络中，从而使它们能够跨节点进行通信。

通过将容器接入虚拟网络，每个容器都可以获得一个虚拟的网络接口，具有自己的IP地址和网络标识符。这使得容器之间可以像在同一网络中一样进行通信，而无需关心物理节点之间的细节。

虚拟网络技术可以通过不同的方式实现，如使用容器编排平台（例如Kubernetes）提供的网络功能，或者使用软件定义网络（Software-Defined Networking，SDN）技术来创建和管理虚拟网络。具体的实现方式可能因使用的平台和工具而有所不同。





# 构建虚拟网络

- 如果容器要实现跨节点通信，需要使用虚拟网络，然后将容器接入虚拟网络

- 虚拟网络是一种逻辑网络，它可以在物理网络之上创建，以便容器可以在不同的节点之间进行通信。



**在 Kubernetes 中，虚拟网络可以使用 Overlay 或 Underlay 两种模式。**

1. Overlay 模式：在 Overlay 模式下，虚拟网络是在底层物理网络之上创建的，通过在节点之间建立逻辑隧道来传输容器之间的网络流量。这些隧道可以使用不同的网络协议和技术实现，如VXLAN（Virtual Extensible LAN）、GRE（Generic Routing Encapsulation）或 Geneve 等。容器之间的通信流量在虚拟网络上进行封装和解封装，从而实现了跨节点的通信。
2. Underlay 模式：在 Underlay 模式下，虚拟网络直接利用底层物理网络的路由和连接来进行容器之间的通信。这意味着容器的通信流量直接通过物理网络传输，无需额外的封装和解封装过程。Underlay 模式通常使用基于物理网络的网络技术，如VLAN（Virtual Local Area Network）或直接使用物理网络的子网来创建虚拟网络。



**选择何种虚拟网络模式？**

选择使用 Overlay 模式还是 Underlay 模式取决于具体的网络需求和部署环境。

- Overlay 模式在跨云或跨数据中心的场景中更常见，因为它提供了一种透明、灵活的方式来构建虚拟网络。
- Underlay 模式更适用于单个数据中心或较小规模的部署，因为它直接利用物理网络的优势，避免了额外的封装和解封装开销。



**虚拟网络解决方案有哪些？**

在 Kubernetes 中，常见的虚拟网络实现方案包括 Flannel、Calico、Weave、Cilium 等，它们提供了不同的网络模式和技术选择，可以根据需求选择合适的虚拟网络方案。



**Pod 只是一种抽象，实际跨网络通信的是容器与容器，而不是Pod与Pod，我的理解对吗？**

是的，您的理解是正确的。在Kubernetes中，Pod是一个抽象的概念，可以将其中的一个或多个容器部署在同一主机上。因此，不同Pod中的容器通常在不同的主机上运行，它们需要通过网络进行通信。

在Kubernetes中，容器是网络通信的基本单位，不同容器之间可以进行跨网络通信，而不是Pod之间。当一个Pod中有多个容器时，这些容器可以通过localhost（127.0.0.1）地址进行通信，因为它们都运行在同一个网络命名空间中。但是，如果容器需要与其他Pod中的容器通信，它们需要使用Pod IP地址或服务名称来进行通信。

因此，在实际使用中，需要将容器部署在Pod中，并使用Kubernetes网络插件来创建虚拟网络，以便容器之间可以进行跨节点通信。同时，Kubernetes还提供了一些高级网络功能，如Service和Ingress，以简化网络配置和管理。







## Overlay

- Overlay 网络，又称：叠加网络、覆盖网络、承载网络

- Overlay 网络是一种通过在物理网络之上创建虚拟网络来实现容器之间通信的技术。
- 在 Overlay 网络中，每个节点都有一个虚拟网络接口，该接口用于与其他节点上的虚拟网络接口通信。
- Overlay 网络通常使用隧道协议来传输数据包。
- 隧道协议会将数据包封装在另一个数据包中，从而使其可以在不同的节点之间传输。
- 在 Kubernetes 中，常用的 Overlay 网络插件包括 Flannel、Weave Net 和 Calico 等。这些插件都提供了虚拟网络功能，并使用不同的隧道协议来传输数据包。

- 简单理解就是把一个逻辑网络建立在一个实体网络之上。其在大体框架上对基础网络不进行大规模修改就能实现应用在网络上的承载，并能与其它网络业务分离，通过控制协议对边缘的网络设备进行网络构建和扩展是SD-WAN以及数据中心等解决方案使用的核心组网技术。





## Underlay 

- Underlay 又称承载网络

- Underlay 网络是一种将容器网络直接映射到物理网络的技术。
- 在 Underlay 网络中，每个节点都有一个物理网络接口，该接口用于与其他节点上的物理网络接口通信。
- 容器可以直接使用物理网络接口进行通信，从而不需要使用 Overlay 网络。
- 在 Kubernetes 中，使用 Underlay 网络通常需要在物理网络上进行一些额外的配置。例如，可能需要配置网络路由、防火墙规则和负载均衡等。

### BGP 协议

BGP（Border Gateway Protocol，边界网关协议）是一种路由协议，用于在不同的自治系统（AS）之间交换路由信息，控制Internet上不同AS之间的路由选择。BGP协议可以根据不同的路由策略，将数据包从源AS传递到目的AS。

BGP协议是一种路径向量协议，与其他内部网关协议（IGP）如OSPF、IS-IS等不同，它不仅关心到达目标地址的最短路径，还可以通过策略控制和选择传输路径。BGP协议中的路由决策过程是基于自治系统（AS）之间的关系和政策的，这使得BGP协议在Internet中扮演着至关重要的角色。

BGP协议的主要特点包括：

1. BGP协议是一种自治系统之间的协议，用于在不同的自治系统之间交换路由信息。
2. BGP协议是一种路径向量协议，与其他内部网关协议（IGP）如OSPF、IS-IS等不同，它可以通过策略控制和选择传输路径。
3. BGP协议可以支持多种类型的路由信息，包括IPv4和IPv6等。
4. BGP协议可以使用TCP协议进行可靠的通信，确保路由信息的可靠传输。

在Internet中，BGP协议扮演着至关重要的角色，它是实现自治系统之间互联互通和互相了解的关键协议之一。



**BGP 协议和 Underlay 的关系**

BGP协议在Underlay网络中扮演着至关重要的角色，因为它负责在不同的自治系统之间交换路由信息，控制Underlay网络中的路由选择，从而保证数据包可以从源主机到达目的主机。

在Underlay网络中，不同的物理设备通过BGP协议来进行自治系统之间的通信和互联，构成一个底层的物理网络。这个底层的物理网络是Overlay网络运行所依赖的基础，Overlay网络通过在这个底层的物理网络之上建立虚拟网络来实现容器之间的通信。

BGP协议在Underlay网络中的主要作用是：

1. 支持自治系统之间的互联互通，从而使得Underlay网络中的不同自治系统之间可以进行通信。
2. 负责在Underlay网络中的路由选择，保证数据包可以从源主机到达目的主机。
3. 支持对Underlay网络中的路由进行策略控制，从而满足不同业务场景下的路由需求。

总的来说，BGP协议是Underlay网络中非常重要的一个组成部分，是构建Overlay网络的基础，它通过自治系统之间的互联和路由选择，为容器之间的跨节点通信提供了必要的支持。





**Node-to-Node mesh & BGP Reflector**

"Node-to-Node mesh" 和 "BGP Reflector" 都是 Kubernetes 中使用的网络模型，它们分别用于实现 Kubernetes 集群内部的容器之间的通信和 Kubernetes 集群与外部网络之间的通信。

1. Node-to-Node mesh：

Node-to-Node mesh 是一种 Kubernetes 网络模型，它基于容器网络接口（CNI）和Overlay网络技术，实现了 Kubernetes 集群内部的容器之间的通信。在 Node-to-Node mesh 中，每个 Kubernetes Node 上都会运行一个容器网络代理（CNI插件），该代理负责管理该节点上的容器网络，将该节点上的容器与其他节点上的容器建立虚拟网络连接。这样，在 Kubernetes 集群内部，不同节点上的容器之间就可以直接通信，而无需通过外部网络。

1. BGP Reflector：

BGP Reflector 是一种 Kubernetes 网络模型，它基于 BGP 协议和 Overlay 网络技术，用于实现 Kubernetes 集群与外部网络之间的通信。在 BGP Reflector 中，每个 Kubernetes Node 上都运行一个BGP代理，该代理负责与外部BGP网络交换路由信息，并将这些路由信息分发给集群内部的各个节点。这样，Kubernetes 集群内部的容器就可以通过 Overlay 网络直接与外部网络通信，而无需通过额外的NAT等设备进行转换。

需要注意的是，Node-to-Node mesh 和 BGP Reflector 都是 Kubernetes 中的网络模型，它们可以用于不同的网络场景，具体的选择需要根据实际需求进行评估和选择。





## Overlay & Underlay

总的来说，Overlay 网络适用于在不同物理网络之间建立虚拟网络，而 Underlay 网络适用于在同一物理网络内建立容器网络。根据具体的场景和需求，可以选择适合自己的网络模式。



在Kubernetes中，Overlay网络和Underlay网络都得到了广泛应用。Overlay网络通常用于在集群内部实现Pod之间的跨节点通信，而Underlay网络通常用于实现跨物理网络的Pod之间的通信。





**Overlay 与 Underlay 的选择和应用场景：**

Overlay 和 Underlay 都是网络中的概念，Overlay 是基于底层物理网络之上的虚拟网络，而 Underlay 是底层物理网络本身。在 Kubernetes 网络中，Overlay 和 Underlay 的选择需要根据不同的应用场景进行评估和选择。

1. Overlay网络的应用场景：

Overlay网络可以在物理网络之上构建出虚拟网络，这种网络模型能够实现跨物理机和跨数据中心的容器之间的通信。因此，Overlay网络适用于多数据中心和跨物理机的场景，其中容器之间需要进行跨网络通信。

1. Underlay网络的应用场景：

Underlay网络是底层物理网络本身，它可以提供物理层面上的互联和通信。在 Kubernetes 网络中，Underlay网络通常由物理设备（如路由器、交换机等）构成，负责数据包的传输和路由选择。因此，Underlay网络适用于单数据中心或单物理机场景，其中容器之间需要进行本地通信或物理层面的通信。

需要注意的是，Overlay网络和Underlay网络不是对立的关系，它们在实际应用中通常会结合使用，构成一个完整的网络架构。比如，在 Kubernetes 网络中，Overlay网络可以基于物理网络构建出虚拟网络，而 Underlay网络则负责数据包的传输和路由选择，从而实现容器之间的跨节点通信。在实际应用中，根据具体的业务需求和网络规模，需要进行合理的选择和设计。







## 参考文档

[Overlay 与 Underlay - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/436605135)

[还有人不知道Overlay网络？看完这个你就全懂了 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/497638990)





# 接入虚拟网络

- 在虚拟网络之上，可以通过 Bridge、MACVLAN、IPVLAN 等方式接入到虚拟网络
  - MACVLAN、IPVLAN 属于多路复用
- 其中最常用的方式是通过 Bridge 来接入虚拟网络，但也需要根据实际应用场景和网络规模选择合适的容器网络接入方式，从而实现容器之间的高效通信和互联。



## Bridge

- 在Bridge模式下，容器通过虚拟网桥接入虚拟网络。虚拟网桥相当于一种虚拟的交换机，容器通过网桥可以实现与其他容器或物理机之间的通信。





## MACVLAN

- MACVLAN模式可以为容器提供独立的MAC地址和虚拟网络接口，使得容器可以直接接入底层物理网络，实现容器和物理机之间的直接通信。



## IPVLAN

- IPVLAN模式是一种基于Linux内核的虚拟化技术，可以为容器提供独立的IP地址和虚拟网络接口，使得容器可以直接接入底层物理网络，实现容器和物理机之间的直接通信。



## 单根网络

- 硬件交换，需要硬件支持





## IPAM

**通常，在一个节点上，基于该节点的子网向该节点上的Pod分配IP地址，通常需要专门的插件完成，插件统称：IPAM**

是的，通常在一个节点上，基于该节点的子网向该节点上的Pod分配IP地址需要使用IPAM插件来实现。在Kubernetes中，每个节点上都运行着一个网络代理程序，该程序负责实现Pod之间的通信，同时也负责管理该节点上的IP地址资源。Kubernetes中常用的IPAM插件包括：

1. kube-router：一种高性能、开源的Kubernetes网络代理程序，支持多种网络模型，包括基于BGP的Overlay网络模型，以及基于VXLAN、GRE、IPSEC等协议的Underlay网络模型。
2. Calico：一种开源的网络和安全方案，支持基于BGP的Overlay网络模型，以及基于IPSEC等协议的Underlay网络模型。
3. CNI-IPAM：一个通用的IPAM插件，可以与各种CNI网络插件配合使用，支持多种IP地址分配方式，包括静态IP分配、DHCP分配和动态IP池分配等。

这些IPAM插件可以帮助Kubernetes管理员更加方便和高效地管理IP地址资源，从而实现更加灵活和可靠的容器网络。



IPAM（IP Address Management，IP地址管理）是一种管理IP地址资源的技术，它可以帮助网络管理员对IP地址资源进行规划、配置、分配和回收。IPAM通常包括以下几个方面：

1. IP地址规划：IP地址规划是IPAM的核心内容，它可以帮助网络管理员对IP地址资源进行合理的规划和划分，从而避免IP地址的浪费和冲突。
2. IP地址分配：IP地址分配是IPAM的另一个重要方面，它可以帮助网络管理员对IP地址资源进行动态分配和管理，使得IP地址资源得到更加充分的利用。
3. IP地址跟踪和管理：IP地址跟踪和管理是IPAM的辅助功能，它可以帮助网络管理员实时监控IP地址的使用情况，及时发现IP地址的冲突和重复使用，从而及时进行处理。
4. 自动化IP地址管理：自动化IP地址管理是IPAM的一种发展方向，它可以通过自动化技术实现IP地址资源的自动规划、自动配置和自动分配，从而提高网络管理员的工作效率和准确性。

在容器化和云计算环境中，IPAM技术变得越来越重要，因为这些环境通常需要大量的IP地址资源管理和自动化，IPAM技术可以帮助网络管理员更加有效地管理和利用IP地址资源。













# 端口和协议

参考文档：

- https://kubernetes.io/zh-cn/docs/reference/ports-and-protocols/

当你在一个有严格网络边界的环境里运行 Kubernetes，例如拥有物理网络防火墙或者拥有公有云中虚拟网络的自有数据中心，了解 Kubernetes 组件使用了哪些端口和协议是非常有用的。

## 控制面

- 尽管 etcd 的端口也列举在控制面的部分，但你也可以在外部自己托管 etcd 集群或者自定义端口。

| 协议 | 方向 | 端口范围  | 目的                    | 使用者               |
| ---- | ---- | --------- | ----------------------- | -------------------- |
| TCP  | 入站 | 6443      | Kubernetes API server   | 所有                 |
| TCP  | 入站 | 2379-2380 | etcd server client API  | kube-apiserver, etcd |
| TCP  | 入站 | 10250     | Kubelet API             | 自身, 控制面         |
| TCP  | 入站 | 10259     | kube-scheduler          | 自身                 |
| TCP  | 入站 | 10257     | kube-controller-manager | 自身                 |



## 工作节点

| 协议 | 方向 | 端口范围    | 目的              | 使用者       |
| ---- | ---- | ----------- | ----------------- | ------------ |
| TCP  | 入站 | 10250       | Kubelet API       | 自身, 控制面 |
| TCP  | 入站 | 30000-32767 | NodePort Services | 所有         |

[NodePort Services](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/)的默认端口范围为 30000-32767，也可以通过二进制安装来指定默认的端口范围 如：30000-30000

端口使用时划分要明确，以防端口冲突等问题的产生，有以下两种划分方法可以参考：

- **顺序使用：**
  - 30001；app1-nginx-http-80
  - 30002；app1-nginx-http-443
  - 30003；app2-nginx-http-80
  - 30004；app2-nginx-http-443
- **划分范围：**
  - 30001~300010；app1
  - 300011~300020；app2

所有默认端口都可以重新配置。当使用自定义的端口时，你需要打开这些端口来代替这里提到的默认端口。

一个常见的例子是 API 服务器的端口有时会配置为443。或者你也可以使用默认端口，把 API 服务器放到一个监听443 端口的负载均衡器后面，并且路由所有请求到 API 服务器的默认端口。




## CNI 概述

- Kubernetes本身不提供网络解决方案，但是提供了CNI规范。这些规范被许多CNI插件（例如WeaveNet，Flannel，Calico等）遵守。
- 在 Kubernetes 中，CNI (Container Network Interface) 是一种标准化的网络接口，用于配置容器运行时的网络连接。
- CNI 接口提供了一个标准的插件模型，使得 Kubernetes 可以支持多种不同的网络方案，例如 flannel、Calico、Weave、Open vSwitch 等。
- CNI 插件是实现了 CNI 接口的二进制程序，它们通过网络插件来配置容器的网络，使得容器可以互相通信以及与外部网络进行通信。当一个容器创建时，Kubernetes 会调用 CNI 插件，将容器的网络连接配置为插件所定义的网络。
- CNI 插件的配置是以 JSON 格式的文件为基础的，包括了容器的 IP 地址、网关、路由等信息。Kubernetes 集群管理员可以选择不同的 CNI 插件来配置 Kubernetes 集群的网络，以满足不同的需求。

- CNI 定义了一组用于实现容器网络接口的配置以及 IP 地址的分配的规范
- CNI 只关注容器的网络连接以及当容器删除时移除被分配的网络资源
- 常用的第三方网络插件有 Flannel 和 Calico，通常以DaemonSet的方式在每个节点运行
  - 注意：任何第三方网络插件都应该在首次部署k8s进群后定型安装，不要在集群正式运行后再修改为其他网络插件 否则会出现问题

**参考文档：**

- https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/networking/
- https://github.com/containernetworking/cni



### CNI 配置

```yaml
cniVersion <string>  # CNI配置文件的语义版本
name <string>  # 网络的名称，在当前主机上必须唯一
type <string>： # CNI插件的可执行文件名
args <map[string]string>  # 由容器管理系统提供的附加参数，可选配置
ipMasq  <Boolean>  # 是否启用IP伪装，可选参数
ipam <map[string]string>  # ip地址分配插件，主要有host-local和dhcp
  type <string>  # 能够完成IP地址分配的插件的名称
  subnet <string>  # 分配IP地址时使用的子网地址
  routes <string>  # 路由信息
    dst <string>  # 目标主机或网络    gw <string>  # 网关地址
dns <map[string]string>  # 配置容器的DNS属性
  nameservers <[]string>  # DNS名称服务器列表，其值为ipv4或ipv5格式的地址
  domain <[]string>  # 用于短格式主机查找的本地域 
  search <[]string>  # 用于短格式主机查找的优先级排序的搜索域列表
  options <[]string>  # 传递给解析程序的选项列表
```

