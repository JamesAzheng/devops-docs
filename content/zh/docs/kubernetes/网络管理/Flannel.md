---
title: "Flannel"
weight: 10
---

# Flannel 概述

Flannel 是 Kubernetes 中常用的 CNI 插件之一，用于提供容器之间的网络通信和与外部网络的通信。

Flannel 的原理是通过将每个节点上的 Pod IP 地址转换为一个不同的子网 IP 地址，实现容器之间的通信。

Flannel 使用的是虚拟网络的方式，将每个节点的 Pod IP 地址映射到一个虚拟的网络中，然后通过网络隧道将不同节点上的容器连接起来。

Flannel 的优点包括：

1. 简单易用：Flannel 的安装和配置相对简单，且能够轻松地与 Kubernetes 集成。
2. 多种网络后端：Flannel 支持多种网络后端，包括 VXLAN、UDP 和 Host-GW，可以满足不同场景的需求。
3. 性能高效：Flannel 采用了虚拟网络技术，能够快速实现容器之间的通信，且网络延迟较小。
4. 可扩展性强：Flannel 可以方便地扩展到大规模的集群环境中，且支持跨云平台的部署。

然而，Flannel 也存在一些缺点，例如：

1. 网络拓扑不稳定：Flannel 的网络拓扑依赖于底层网络设施，例如路由器和交换机等，若底层网络拓扑发生变化，可能会影响容器之间的通信。
2. 部署复杂性：对于一些复杂的网络拓扑场景，Flannel 的部署和配置可能会比较繁琐。
3. IP 碰撞问题：在 Flannel 中，每个节点上的 Pod IP 地址都是唯一的，因此在大规模集群中，可能会出现 IP 地址碰撞的问题。



- Flannel 负责在集群中的多个节点之间提供第 3 层 IPv4 网络。Flannel 不控制容器如何与主机联网，只控制流量在主机之间的传输方式。
- Flannel 通过在每一个节点上启动一个叫做flanneld的进程，负责每一个节点上的子网划分，并将相关的配置信息（如各个节点的子网网段、外部IP等）保存到etcd中，flanneld只需要WATCH这些数据的变化，然后实时更新路由表即可，而具体的网络包转发交给具体的backend实现
- Flannel 专注于网络。对于网络策略，可以使用[Calico](http://www.projectcalico.org/)等其他项目。



参考文档：

- https://github.com/flannel-io/flannel



# flanneld

Flannel 确实以 DaemonSet 的方式在每个节点上运行 flanneld 守护进程，而 flanneld 守护进程主要负责以下任务：

1. 定义 Pod 网段：flanneld 守护进程会定义一个 IP 地址池，其中包含可用于分配给 Pod 的 IP 地址范围。默认情况下，Flannel 使用 10.244.0.0/16 作为 Pod 网段。
2. 为 Pod 分配 IP 地址：当一个 Pod 创建时，Kubernetes 将请求一个 IP 地址。flanneld 守护进程会从 IP 地址池中选择一个可用的 IP 地址，并将其分配给该 Pod。
3. 构建虚拟网络：flanneld 守护进程使用一种名为 VXLAN 的技术来创建一个虚拟网络，其中每个节点扮演着一个 VXLAN 端点。这个虚拟网络可以解决跨节点通信等问题。
4. 保存配置信息到 etcd 中：flanneld 守护进程会将 Flannel 的配置信息保存到 etcd 中。这些配置信息包括 Pod 网段、每个节点的 IP 地址以及 VXLAN 端点等信息。

需要注意的是，Flannel 通过 flanneld 守护进程实现了 Pod 网段的定义和 IP 地址的分配，但是它并不直接管理容器网络，而是使用 CNI 插件来实现容器网络的管理。在 Flannel 中，CNI 插件称为 flannel-cni。flannel-cni 负责将容器加入 Flannel 的虚拟网络中，并为其分配 IP 地址。



# Flannel Backends

	Flannel：
		overlay: VXLAN
		underlay: host-gw
			flanneld --> api server (etcd)

Flannel 是一个 CNI 插件，支持多种不同的网络后端（Backend）。

不同的网络后端采用不同的技术来实现容器之间的网络通信，因此在选择网络后端时需要考虑不同场景的需求。

目前，Flannel 支持以下几种网络后端：

- VXLAN（默认）
- Host-GW
- UDP

总的来说，不同的网络后端适用于不同的场景和需求。在选择网络后端时，需要考虑到集群规模、网络拓扑结构、性能和安全等方面的因素。



**Backend 也就是所谓的工作模式，一旦设置后 则不允许在运行时修改**

是的，网络后端（Backend）也被称为 Flannel 的工作模式，它定义了 Flannel 在容器网络中的行为和方式。

一旦选择了网络后端，就不允许在运行时修改。因此，在部署 Flannel 时，需要根据实际需求选择最合适的网络后端。

在 Kubernetes 集群中，可以通过修改 Flannel DaemonSet 的配置来选择不同的网络后端。例如：

- 如果要使用 VXLAN 后端，则可以将 Flannel DaemonSet 中的 `--backend` 参数设置为 `vxlan`；
- 如果要使用 Host-GW 后端，则可以将 `--backend` 参数设置为 `host-gw`。
- 注意，修改 Flannel 后端需要重新启动 Flannel，因此需要进行相应的集群管理操作，以确保 Flannel 能够正确地重新启动和配置。



**参考文档：**

- https://github.com/flannel-io/flannel/blob/master/Documentation/backends.md





## VXLAN

默认模式，也是推荐的选择，使用 VXLAN 技术来实现容器之间的通信。

VXLAN 通过在底层网络上建立一个虚拟的二层网络来实现容器之间的通信，可以在不同节点之间建立 Overlay 网络，提供跨节点的通信。

VXLAN 后端需要在集群中使用 Layer 2 网络，且需要底层网络支持 UDP 封装和解封装。

- Pod与Pod经由隧道封装后通信，各节点彼此间能通信就行，不要求在同一个二层网络；

VXLAN 工作原理

1. 源容器中数据包首先会从网关发送到 cni0 的网桥上，进而到达宿主机，然后宿主机的 flannel.1 设备会将报文进行封装然后通过隧道发送给对端设备
2. 对端设备对外网卡收到后，会将报文转发给本机的 flannel.1 设备，然后将报文解封装并发送给本机的 cni0 网桥，最后由网桥转发到对端容器内部

参考文档：https://blog.csdn.net/qq_40378034/article/details/123964705?spm=1001.2014.3001.5506

## VXLAN Direct Routing

- 位于同一个二层网络上的、但不同节点上的Pod间通信，无须隧道封装；但非同一个二层网络上的节点上的Pod间通信，仍须隧道封装；

VXLAN Direct Routing 是 VXLAN 后端的一种实现方式，它使用直接路由技术（Direct Routing）来加速容器之间的通信，提高网络性能。

在传统的 VXLAN 实现中，数据包需要经过一个 VTEP（VXLAN Tunnel Endpoint）设备进行封装和解封装，从而实现跨节点的容器通信。但是，在高负载和大规模容器部署的场景下，VTEP 设备可能成为瓶颈，降低网络性能。为了解决这个问题，VXLAN Direct Routing 采用了直接路由技术，使得数据包可以直接在节点之间进行传输，避免了经过 VTEP 设备的封装和解封装，提高了网络性能。

具体来说，VXLAN Direct Routing 需要满足以下条件：

1. 所有节点都连接在一个 Layer 3 网络上，可以通过路由器进行通信。
2. 所有节点都有自己的 IP 地址池，容器 IP 地址从这个地址池中分配。
3. 所有节点都运行了一个容器网络插件，如 Flannel。

在 VXLAN Direct Routing 中，Flannel 插件会在每个节点上创建一个虚拟的 VXLAN 设备，并将其配置为直接路由模式。这样，当容器之间需要通信时，数据包可以直接通过底层网络进行传输，而无需经过 VTEP 设备的封装和解封装。从而提高了网络性能和吞吐量。

需要注意的是，VXLAN Direct Routing 相对于传统的 VXLAN 实现，需要更高的网络配置和管理能力。同时，由于数据包可以直接在节点之间传输，安全性也需要得到特别关注和处理。



## Host-GW

使用主机网关技术来实现容器之间的通信。Host-GW 后端会将所有节点上的容器 IP 地址添加到路由表中，使得容器可以直接访问其他节点上的容器。Host-GW 后端适用于需要高性能和低延迟的场景，但需要使用静态 IP 地址，且需要底层网络支持 ARP 协议。



- 推荐给有经验的用户，他们希望提高性能并且基础设施支持它（通常不能在云环境中使用）
- Pod与Pod不经隧道封装而直接通信，要求各节点位于同一个二层网络；

**host-gw 工作原理：**

- host-gw模式的工作原理其实就是将每个Flannel子网的下一跳设置成了该子网对应的宿主机的IP地址。这个主机会充当这条容器通信路径里的网关，这也正是host-gw的含义
- host-gw模式能够正常工作的核心，就在于IP包在封装成帧发出去的时候，会使用路由表的下一跳设置目的MAC地址。这样，它就会经过二层网络到达目的宿主机。
- 所以说，Flannel host-gw模式必须要求集群宿主机之间是二层连通的



## UDP

- 不建议使用，仅用于调试或用于不支持 VXLAN 的非常旧的内核。

UDP 模式确实不建议在生产环境中使用，因为它有一些限制和缺点，可能会影响网络性能和稳定性。以下是一些关于 UDP 模式的限制和缺点：

1. 性能问题：UDP 模式使用 UDP 包来封装数据包，而 UDP 协议是面向无连接的，不能保证数据传输的可靠性和顺序性。这可能会导致网络丢包和延迟等性能问题。
2. 安全问题：UDP 模式使用明文的 UDP 包来传输数据，不支持加密和身份验证等安全机制，容易受到网络攻击和嗅探等安全问题的影响。
3. 依赖问题：UDP 模式需要使用一些内核模块和库来实现网络隧道，这些组件可能会与其他组件冲突或不兼容，导致系统不稳定或无法正常工作。

因此，Flannel 官方文档中确实建议不要在生产环境中使用 UDP 模式，除非您的内核版本太老，不支持 VXLAN。如果您在生产环境中使用 Flannel，建议使用 VXLAN 或 Host-GW 模式来实现节点之间的网络隔离和通信。



VXLAN隧道报文封装和传输时使用UDP协议了吗：

是的，VXLAN 隧道在封装和传输时使用 UDP 协议。VXLAN 将以太网帧封装在 UDP 数据包中，然后通过 IP 网络进行传输。这个 UDP 数据包的目的端口号是 4789，源端口号是随机选择的。VXLAN 通过在 UDP 包头中添加 VNI（VXLAN Network Identifier）字段来实现虚拟网络的隔离和通信。VNI 是一个24位的整数，用于唯一标识不同的虚拟网络。在 Flannel 中，每个 Kubernetes 集群都有一个独立的 VNI，用于隔离不同的 Pod 网络。因此，VXLAN 隧道通过将以太网帧封装在 UDP 数据包中，并使用 VNI 实现虚拟网络的隔离和通信。



# Flannel 部署

**参考链接：**

- https://github.com/flannel-io/flannel/#deploying-flannel-manually
- https://github.com/flannel-io/flannel/blob/master/Documentation/kubernetes.md

- https://github.com/flannel-io/flannel/blob/master/Documentation/building.md
- https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

**说明：**

- 二进制文件通常无需手工编译，如包安装时此二进制文件存放在：`/opt/cni/bin/flannel` 目录下，github也提供了编译好的 flannel 二进制文件（下载时注意要选择 amd64）

- 官方提供的 yaml 文件通常不能直接使用，一般需要进行如下修改

  - 指向实际的 `podCIDR`  否则默认为 `10.244.0.0/16`
  - flannel 的二进制文件默认指向`/opt/bin/flanneld`，如不在此处则需指向实际二进制文件存放的位置
  - 工作类型默认为 `vxlan`，这个性能最好，所以一般无需修改
  - `image` 如无法下载，则最好下载到本地再传到 harbor ，最后将 `image` 地址执行 harbor

- 上述配置无误后在，每个 master 节点和 node 节点安装

  - ```bash
    kubectl apply -f kube-flannel.yml
    ```

## 验证

- 如果安装无误，flannel 会生成如下网络配置文件

```bash
# /run/flannel/subnet.env
FLANNEL_NETWORK=10.10.0.0/16
FLANNEL_SUBNET=10.10.0.1/24
FLANNEL_MTU=1450 # MTU=1450避免封装隧道头后巨型帧的产生
FLANNEL_IPMASQ=true
```

- 生产的 flannel 进程

```bash
# ps aux | grep flannel 
root        2895  0.1  1.1 1335156 34888 ?       Ssl  02:43   0:44 /opt/bin/flanneld --ip-masq --kube-subnet-mgr
```





