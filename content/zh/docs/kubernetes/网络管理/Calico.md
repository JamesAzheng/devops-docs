---
title: "Calico"
weight: 10
---

# Calico 概述

[Calico](https://projectcalico.docs.tigera.io/about/about-calico/) 是一个开源的联网及网络安全方案， 用于基于容器、虚拟机和本地主机的工作负载。 Calico 支持多个数据面，包括：纯 Linux eBPF 的数据面、标准的 Linux 联网数据面 以及 Windows HNS 数据面。Calico 在提供完整的联网堆栈的同时，还可与 [云驱动 CNIs](https://projectcalico.docs.tigera.io/networking/determine-best-networking#calico-compatible-cni-plugins-and-cloud-provider-integrations) 联合使用，以保证网络策略实施。

Calico 相比 flannel 支持更多的网络层安全策略



Calico 是一个联网和网络策略供应商。 Calico 支持一套灵活的网络选项，因此你可以根据自己的情况选择最有效的选项，包括非覆盖和覆盖网络，带或不带 BGP。 Calico 使用相同的引擎为主机、Pod 和（如果使用 Istio 和 Envoy）应用程序在服务网格层执行网络策略。



Calico是一个开源的容器网络解决方案，旨在为Kubernetes和容器化环境提供高性能、安全可靠的网络连接。它使用CNI（Container Network Interface）规范，并提供了强大的网络策略和安全功能。

下面是Calico的一些详解：

1. BGP路由：Calico使用BGP（Border Gateway Protocol）作为底层网络路由协议，实现跨节点的容器网络互连。每个节点上的Calico代理（Calico Node）会运行BGP守护进程，并与其他节点建立BGP邻居关系。这样，容器的通信流量可以通过BGP路由表进行路由选择和转发。
2. IP地址管理：Calico使用IP池（IP Pool）来管理容器的IP地址分配。管理员可以定义一个或多个IP池，并为每个池指定IP地址范围。当容器创建时，Calico会从IP池中动态分配IP地址，并确保IP地址的唯一性和一致性。
3. 网络策略：Calico提供了强大的网络策略功能，用于定义和控制容器之间的网络访问规则。网络策略可以基于源IP、目标IP、端口等条件来过滤和限制流量。这使得管理员可以灵活地配置容器之间的通信，增强网络安全性。
4. 安全性：Calico提供了多层次的安全功能，用于保护容器网络。它支持网络隔离，确保容器之间的互相隔离和安全性。此外，Calico还支持加密和认证等功能，用于保护容器间的通信和控制平面。
5. 可扩展性：Calico的设计目标之一是可扩展性。它使用分布式架构，并充分利用BGP协议的可扩展性特性。每个节点上的Calico代理只负责本地节点的网络配置和管理，减轻了集中式控制的压力，并提高了系统的可扩展性和性能。

Calico被广泛应用于Kubernetes集群和容器化环境中，因其高性能、可靠性和丰富的安全功能而受到青睐。它提供了灵活的网络配置、强大的网络策略和高度可扩展的架构，为容器网络提供了可靠的基础设施。





## 参考文档

- https://github.com/projectcalico/calico
- https://www.tigera.io/project-calico/
- https://docs.tigera.io/
- https://www.ibm.com/docs/fr/cloud-private/3.1.1?topic=ins-calico
- https://blog.palark.com/calico-for-kubernetes-networking-the-basics-examples/
- https://tanzu.vmware.com/developer/guides/container-networking-calico-refarch/

- overlay：https://docs.tigera.io/calico/latest/networking/determine-best-networking#overlay-networks



## 获取 Calico 版本

不同版本间的配置参数可能会有所不同，获取版本信息后可以根据 calico 版本来查看指定的文档

下面的命令将返回 Calico Node 容器的镜像名称，其中包含了 Calico 的版本信息。通常情况下，Calico 的版本号被包含在镜像名称中。

```sh
# kubectl get daemonset calico-node -n kube-system -o jsonpath='{.spec.template.spec.containers[0].image}' ; echo
calico/node:v3.23.2



# kubectl describe daemonset calico-node -n kube-system | grep Image
    Image:      calico/cni:v3.23.2
    Image:      calico/cni:v3.23.2
    Image:      calico/node:v3.23.2
```

- 针对目前的版本查看对应的官方文档：https://docs.tigera.io/archive/v3.23/about/about-calico





# Calico 组件说明

[Component architecture (tigera.io)](https://docs.tigera.io/archive/v3.23/reference/architecture/overview)

<img src="/docs/kubernetes/网络管理/architecture-calico.svg" alt="architecture-calico" style="zoom:200%;" />



```
Calico的组件
	Felix：接口管理、路由管理、ACL、状态报告； 需要运行于每个节点；
	BIRD：
		BGP客户端：需要运行于每个节点，负责将Felix生成的路由信息载入内核并通告到整个网络中； 		
		BGP Reflector：专用反射各BGP客户端发来路由信息；
				将  N --> N-1  转为  N --> 1
	etcd：通信总线； 


部署的程序组件：
	calico-node

	calico-kube-controller
```

## Calico Node

- Calico Node 是运行在每个容器节点上的主要组件，负责管理该节点上的网络功能。它包含了 Calico 的核心功能，如 IP 路由、网络策略和数据平面的实现。

```sh
# kubectl get pod -n kube-system | grep calico-node
calico-node-4279g                             1/1     Running   1 (39d ago)      68d
calico-node-59fr6                             1/1     Running   3 (73d ago)      75d
calico-node-8w7vl                             1/1     Running   1 (38d ago)      68d
calico-node-jjgpm                             1/1     Running   2 (73d ago)      75d
calico-node-jvw65                             1/1     Running   0                75d
calico-node-lrdhb                             1/1     Running   1 (38d ago)      68d
calico-node-plnjq                             1/1     Running   1 (39d ago)      68d
calico-node-qfqrn                             1/1     Running   3 (67d ago)      75d
calico-node-rngxp                             1/1     Running   3 (73d ago)      75d
calico-node-twzqr                             1/1     Running   1 (39d ago)      68d
calico-node-vshqb                             1/1     Running   1 (39d ago)      68d
calico-node-xt5kz                             1/1     Running   1 (38d ago)      68d
calico-node-z5gjd                             1/1     Running   0                75d
```



## Felix

- Felix 是 Calico Node 中的一个代理程序，负责监控节点上的网络状态，并在必要时更新节点的路由表。它与其他节点上的 Felix 代理程序通信，以确保网络中的路由一致性。
- Felix 是在每个节点上运行的主要 Calico 守护进程。它负责处理网络和安全任务，如路由、IP 地址管理和网络策略执行。



## BIRD

- BIRD（BIRD Internet Routing Daemon）是一个开源的路由守护程序，Calico 使用它来实现 IP 路由功能。BIRD 运行在每个 Calico 节点上，负责与其他节点交换路由信息，并维护节点之间的路由表。
- BIRD（Border Gateway Protocol 守护进程）是 Calico 使用的 BGP 路由守护进程。它在每个 calico/node 容器上运行，并与 Calico 网络中的其他节点交换路由信息。BIRD 确保网络路由在集群中正确分发和维护。



## etcd

- 可选
- etcd 是一个高可用的分布式键值存储系统，Calico 使用它来存储和共享网络状态和配置信息。etcd 提供了数据的持久化存储，并确保数据的一致性和可靠性。



## Calicoctl

- 可选
- Calicoctl 是 Calico 的命令行工具，用于管理和配置 Calico 网络。通过 Calicoctl，管理员可以创建和管理网络策略、查看和修改路由信息、监控网络状态等。



# Calico 工作模式

```
Calico:
	三层虚拟网络解决方案：BGP
		节点：vRouter
		各节点上的vRouter通过BGP协议学习生成路由表； 
			小规模网络：BGP peer
			大规模网络：BGP Reflector
	Overlay Network：
		IPIP: 
		VXLAN：
			也支持类似于Flannel VXLAN with DirectRouting

			Vxlan With BGP
```

Calico 提供了几种不同的工作模式来满足不同的网络需求和部署环境。以下是 Calico 的常见工作模式：

1. IP-in-IP 模式：在 IP-in-IP 模式下，Calico 在容器之间创建隧道，通过封装和解封装 IP 数据包来实现跨主机的容器通信。这种模式适用于大多数网络环境，可以在虚拟化环境和裸机环境中使用。
2. BGP 模式：BGP（Border Gateway Protocol）模式使用 BGP 协议来建立和维护网络路由。在该模式下，每个节点上的 Calico Agent 会作为 BGP 路由器，与其他节点的 Calico Agent 交换路由信息，以构建整个网络的路由表。这种模式适用于复杂网络拓扑和大规模部署，提供高度可扩展性和灵活性。
3. VXLAN 模式：VXLAN（Virtual Extensible LAN）模式使用 VXLAN 封装来实现容器之间的跨主机通信。它将容器数据包封装在 VXLAN 报文中，以在底层网络上传输。VXLAN 模式适用于需要使用 VXLAN 的环境，如基于 VMware NSX 的部署。
4. Wireguard 模式：Wireguard 模式使用 Wireguard VPN 技术来实现容器之间的加密通信。它提供了安全的点对点连接，并使用 Wireguard 协议进行数据加密和解密。这种模式适用于需要加密容器流量的安全需求。

这些是 Calico 的常见工作模式，具体选择哪种模式取决于您的网络需求、部署环境以及底层网络设备和技术的支持情况。Calico 提供了灵活的配置选项，可以根据需要进行定制和调整。



Calico 的默认工作模式是 IPIP (IP-in-IP) 模式。

在 Calico 的默认配置中，它使用 IPIP 封装技术来实现容器之间的跨主机通信。在 IPIP 模式下，Calico 会为容器创建隧道，将容器的 IP 数据包封装在 IP-in-IP 报文中，以便在底层网络上传输。这使得容器可以直接通过底层 IP 网络进行通信，而无需额外的路由协议。

IPIP 模式是 Calico 的默认选择，因为它是一种简单而有效的方式，适用于大多数网络环境。它不依赖于底层网络设备的特殊配置或支持，并且易于部署和管理。

需要注意的是，尽管 Calico 的默认模式是 IPIP，但用户可以根据需要选择其他工作模式，如 BGP 模式或 Wireguard 模式。这些模式可以根据特定的网络需求和环境进行配置和调整。对于大多数用户来说，Calico 的默认配置（IPIP 模式）通常是一个良好的起点。







## 示例环境说明

```sh
# kubectl get nodes -o wide
NAME           STATUS                     ROLES                  AGE    VERSION    INTERNAL-IP    EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION       CONTAINER-RUNTIME
k8s-master1    Ready                      control-plane,master   140d   v1.22.12   172.16.0.120   <none>        Ubuntu 18.04.4 LTS   4.15.0-213-generic   docker://20.10.8
k8s-master2    Ready                      control-plane,master   140d   v1.22.12   172.16.0.121   <none>        Ubuntu 18.04.4 LTS   4.15.0-213-generic   docker://20.10.8
k8s-master3    Ready                      control-plane,master   140d   v1.22.12   172.16.0.122   <none>        Ubuntu 18.04.4 LTS   4.15.0-213-generic   docker://20.10.8
k8s-worker-1   Ready                      worker                 29d    v1.22.12   172.16.0.130   <none>        Ubuntu 20.04.6 LTS   5.4.0-155-generic    docker://20.10.23
k8s-worker-2   Ready                      worker                 29d    v1.22.12   172.16.0.131   <none>        Ubuntu 20.04.6 LTS   5.4.0-155-generic    docker://20.10.23
k8s-worker-3   Ready                      worker                 29d    v1.22.12   172.16.0.132   <none>        Ubuntu 20.04.6 LTS   5.4.0-155-generic    docker://20.10.23
k8s-worker-4   Ready,SchedulingDisabled   worker                 18d    v1.22.12   172.16.0.133   <none>        Ubuntu 20.04.6 LTS   5.15.0-78-generic    docker://20.10.8



# kubectl describe ds -n kube-system calico-node | grep Image
    Image:      calico/cni:v3.23.2
    Image:      calico/cni:v3.23.2
    Image:      calico/node:v3.23.2
```



## BGP

将节点做为虚拟路由器通过 BGP 路由协议来实现集群内容器之间的网络访问。

![Calico-BGP模式](/docs/kubernetes/网络管理/Calico-BGP模式.png)





## IPIP

**默认模式**

在原有 IP 报文中封装一个新的 IP 报文，新的 IP 报文中将源地址 IP 和目的地址 IP 都修改为对端宿主机 IP。

![Calico-ipip模式](/docs/kubernetes/网络管理/Calico-ipip模式.png)

部署完成后默认使用 calico-ipip 的模式，通过在节点的路由即可得知，通往其他节点路由通过 tunl0 网卡出去

```sh
root@k8s-worker-1:~# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.16.0.1      0.0.0.0         UG    0      0        0 ens160
10.233.68.0     172.16.0.120    255.255.255.0   UG    0      0        0 tunl0
10.233.72.0     172.16.0.133    255.255.255.0   UG    0      0        0 tunl0
10.233.74.0     172.16.0.131    255.255.255.0   UG    0      0        0 tunl0
10.233.83.0     172.16.0.122    255.255.255.0   UG    0      0        0 tunl0
10.233.87.0     172.16.0.132    255.255.255.0   UG    0      0        0 tunl0
10.233.88.0     172.16.0.121    255.255.255.0   UG    0      0        0 tunl0
10.233.89.0     0.0.0.0         255.255.255.0   U     0      0        0 *
10.233.89.217   0.0.0.0         255.255.255.255 UH    0      0        0 caliddde6aa41aa
10.233.89.218   0.0.0.0         255.255.255.255 UH    0      0        0 cali8ee0b615a05
10.233.89.219   0.0.0.0         255.255.255.255 UH    0      0        0 calia8562f237aa
10.233.89.220   0.0.0.0         255.255.255.255 UH    0      0        0 calib780a7d3bc9
10.233.89.221   0.0.0.0         255.255.255.255 UH    0      0        0 caliadfd805b63c
10.233.89.222   0.0.0.0         255.255.255.255 UH    0      0        0 cali52be4ea9497
10.233.89.223   0.0.0.0         255.255.255.255 UH    0      0        0 cali54e86f2c93e
10.233.89.224   0.0.0.0         255.255.255.255 UH    0      0        0 cali6796fb4c6a8
10.233.89.225   0.0.0.0         255.255.255.255 UH    0      0        0 calib1621a7eac7
10.233.89.226   0.0.0.0         255.255.255.255 UH    0      0        0 cali4d239ec8772
10.233.89.227   0.0.0.0         255.255.255.255 UH    0      0        0 calid9819a15597
10.233.89.228   0.0.0.0         255.255.255.255 UH    0      0        0 cali0b5fd109ea1
10.233.89.229   0.0.0.0         255.255.255.255 UH    0      0        0 cali09304935b77
10.233.89.231   0.0.0.0         255.255.255.255 UH    0      0        0 caliea2cfd262d1
10.233.89.232   0.0.0.0         255.255.255.255 UH    0      0        0 cali303ff4ac14e
10.233.89.233   0.0.0.0         255.255.255.255 UH    0      0        0 calia3f8635265e
172.16.0.0      0.0.0.0         255.255.192.0   U     0      0        0 ens160
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0


root@k8s-worker-1:~# ip route 
default via 172.16.0.1 dev ens160 proto static 
10.233.68.0/24 via 172.16.0.120 dev tunl0 proto bird onlink 
10.233.72.0/24 via 172.16.0.133 dev tunl0 proto bird onlink 
10.233.74.0/24 via 172.16.0.131 dev tunl0 proto bird onlink 
10.233.83.0/24 via 172.16.0.122 dev tunl0 proto bird onlink 
10.233.87.0/24 via 172.16.0.132 dev tunl0 proto bird onlink 
10.233.88.0/24 via 172.16.0.121 dev tunl0 proto bird onlink 
blackhole 10.233.89.0/24 proto bird 
10.233.89.217 dev caliddde6aa41aa scope link 
10.233.89.218 dev cali8ee0b615a05 scope link 
10.233.89.219 dev calia8562f237aa scope link 
10.233.89.220 dev calib780a7d3bc9 scope link 
10.233.89.221 dev caliadfd805b63c scope link 
10.233.89.222 dev cali52be4ea9497 scope link 
10.233.89.223 dev cali54e86f2c93e scope link 
10.233.89.224 dev cali6796fb4c6a8 scope link 
10.233.89.225 dev calib1621a7eac7 scope link 
10.233.89.226 dev cali4d239ec8772 scope link 
10.233.89.227 dev calid9819a15597 scope link 
10.233.89.228 dev cali0b5fd109ea1 scope link 
10.233.89.229 dev cali09304935b77 scope link 
10.233.89.231 dev caliea2cfd262d1 scope link 
10.233.89.232 dev cali303ff4ac14e scope link 
10.233.89.233 dev calia3f8635265e scope link 
172.16.0.0/18 dev ens160 proto kernel scope link src 172.16.0.130 
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown 

root@k8s-worker-1:~# ip addr show ens160 
2: ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:0c:29:8f:3e:70 brd ff:ff:ff:ff:ff:ff
    inet 172.16.0.130/18 brd 172.16.63.255 scope global ens160
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe8f:3e70/64 scope link 
       valid_lft forever preferred_lft forever


root@k8s-worker-1:~# ip addr show tunl0 
26: tunl0@NONE: <NOARP,UP,LOWER_UP> mtu 1480 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
    inet 10.233.89.0/32 scope global tunl0
       valid_lft forever preferred_lft forever


root@k8s-worker-1:~# ip tunnel 
tunl0: any/ip remote any local any ttl inherit nopmtudisc
```





## cross-subnet

Calico-ipip 模式和 calico-bgp 模式都有对应的局限性，对于一些主机跨子网而又无法使网络设备使用 BGP 的场景可以使用 cross-subnet 模式，实现同子网机器使用 calico-BGP 模式，跨子网机器使用 calico-ipip 模式





## 查看当前集群的工作模式

要确定当前 Calico 的工作模式（例如 BGP、IPIP 或 VXLAN），你可以查看 Calico 的配置或检查 Calico 节点上的相关组件。以下是一些确定 Calico 工作模式的方法：

1. 查看 Calico 配置：你可以查看 Calico 节点上的配置文件，通常位于 `/etc/calico/` 或 `/etc/cni/` 目录中。检查其中的配置文件，例如 `calicoctl.cfg` 或 `calico.env`，以查找与工作模式相关的设置。
2. 检查 calico-node 容器环境变量：Calico Node 容器的配置通常通过环境变量进行传递。你可以检查 calico-node 容器的环境变量，以查看是否设置了与工作模式相关的变量。例如，可以查看 `CALICO_IPV4POOL_IPIP` 或 `CALICO_IPV4POOL_VXLAN` 变量是否存在。
3. 查看 Calico 节点上运行的进程：通过登录到 Calico 节点，可以查看当前运行的进程，特别是 Calico 相关的进程。运行 `ps aux | grep calico` 命令可以列出与 Calico 相关的进程，如 Felix、BIRD 等。通过检查这些进程的命令行参数或配置文件路径，可以获得关于工作模式的信息。
4. 使用 Calico 命令行工具：如果在 Calico 集群中安装了 Calico 命令行工具（calicoctl），你可以使用该工具来查看当前的 Calico 配置和状态。例如，运行 `calicoctl get node` 命令可以获取关于节点和相关配置的信息，包括工作模式。

通过以上方法之一，你应该能够确定当前 Calico 的工作模式是 BGP、IPIP、VXLAN 还是其他。请注意，具体的命令和路径可能因 Calico 版本、部署方式和配置而有所不同。



# Calico 部署

- Calico 有两种部署方式，一是让 calico/node 独立运行于 Kubernetes 集群之外，但 calico/kube-controllers 依然需要以 Pod 资源运行中集群之上；
- 另一种是以 CNI 插件方式配置 Calico 完全托管运行于 Kubernetes 集群之上，类似于我们前面曾经部署托管 Flannel 网络插件的方式。
- 对于后一种方式，Calico 提供了在线的部署清单：
  - 它分别为50节点及以下规模和50节点以上规模的Kubernetes 集群使用 Kubernetes API 作为 Dabastore 提供了不同的配置清单
  - 也为使用独立的 etcd 集群提供了专用配置清单。
  - 但这3种类型的配置清单中，Calico 默认启用的是基于 IPIP 隧道的叠加网络，因而它会在所有流量上使用 IPIP 隧道而不是 BGP 路由。
- 以下配置定义在部署清单中 DaemonSet/calico-node 资源的 Pod 模板中的 calico-node 容器之上。

```yaml
root@k8s-master1:~# kubectl get ds -n kube-system calico-node -o yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: calico-node
  namespace: kube-system
...
spec:
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      k8s-app: calico-node
  template:
    metadata:
      creationTimestamp: null
      labels:
        k8s-app: calico-node
    spec:
      containers:
      - env:
...
        - name: CALICO_IPV4POOL_IPIP # 在IPv4类型的地址池上启用的IPIP及其类型，支持3种可用值
          value: Always # Always（全局流量）、Cross-SubNet（跨子网流量）和 Never 3种可用值
        - name: CALICO_IPV4POOL_VXLAN # 是否在IPV4地址池上启用VXLAN隧道协议，取值及意义与Flannel的VXLAN后端相同； 
          value: Never # 但在全局流量启用VXLAN时将完全不再需要BGP网络，建议将相关的组件禁用
...
        image: calico/node:v3.23.2
```

- 需要注意的是，Calico分配的地址池需要同Kubernetes集群的Pod网络的定义保持一致。
- Pod网络通常由kubeadm init初始化集群时使用--pod-network-cidr选项指定的网络，而Calico在其默认的配置清单中默认使用192.168.0.0/16作为Pod网络，因而部署Kubernetes集群时应该规划好要使用的网络地址，并设定此二者相匹配。
- 对于曾经使用了flannel的默认的10.244.0.0/16网络的环境而言，我们也可以选择修改资源清单中的定义，从而将其修改为其他网络地址。
- 以下配置片断取自Calico的部署清单，它定义在DaemonSet/calico-node资源的Pod模板中的calico-node容器之上。

```yaml
# IPV4地址池的定义，其值需要与 kube-controller-manager 的 “--cluster-network” 选项的值保持一致，以下环境变量默认处于注释状态
- name: CALICO_IPV4POOL_CIDR
  value: "192.168.0.0/16"

# Calico默认以26位子网掩码切分地址池并将各子网配置给集群中的节点，若需要使用其他的掩码长度，则需要定义如下环境变量
- name: CALICO_IPV4POOL_BLOCK_SIZE
  value: "24"

# Calico 默认并不会从 Node.Spec.PodCIDR 中分配地址，但可通过将如下变量设置为 “true” 并结合 host-local 这一 IPAM 插件以强制从 PodCIDR 中分配地址
- name: USE_POD_CIDR
  value: "false"
```

- 在地址分配方面，Calico在JSON格式的CNI插件配置文件中使用专有的calico-ipam插件，该插件并不会使用Node.Spec.PodCIDR中定义的子网作为节点本地用于为Pod分配地址的地址池，而是根据Calico插件为各节点的配置的地址池进行地址分配。
- 若期望为节点真正使用地址池吻合PodCIDR的定义，则需要在部署清单中DaemonSet/calico-node资源的Pod模板中的calico-node容器之上将USE_POD_CIDR环境变量的值设置为true，并修改ConfigMap/calico-config资源中cni_network_config键中的plugins.ipam.type的值为host-local，且使用podCIDR为子网，具体配置如下所示。

```json
"ipam": {
    "type": "host-local",
    "subnet": "usePodCidr"
},
```





# Calico 配置文件

- calico.cfg

```yaml
apiVersion: projectcalico.org/v3
kind: CalicoAPIConfig
metadata:
spec:
  datastoreType: "kubernetes"
  kubeconfig: "/etc/kubernetes/admin.conf"
```



# Calicoctl

`calicoctl` 是 calico 的管理工具

- https://docs.tigera.io/calico/latest/operations/calicoctl/install

`calicoctl`  安装方式有以下几种：

- Single host 上面 binary 安装
- Single host 上面 continer 安装
- 作为 k8s pod 运行

最佳实践：

- Binary 方式在集群里面的一台 worker 节点安装，calicoctl 会检测 bird/felix 的运行状态。

注意事项：

- 在非 calico node 节点运行只能使用部分命令，不能运行 calico node 相关命令。

## 二进制安装

https://docs.tigera.io/archive/v3.23/maintenance/clis/calicoctl/install

```sh
curl -L https://github.com/projectcalico/calico/releases/download/v3.23.5/calicoctl-linux-amd64 -o calicoctl


```





# Calico Node





# Calico IPPool

[IP pool (tigera.io)](https://docs.tigera.io/archive/v3.23/reference/resources/ippool)

## Calico IPPool Yaml

```yaml
# kubectl get ippool default-ipv4-ippool -o yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: default-ipv4-ippool
spec:
  allowedUses:
  - Workload
  - Tunnel
  blockSize: 24
  cidr: 10.233.64.0/18
  ipipMode: Always
  natOutgoing: true
  nodeSelector: all()
  vxlanMode: Never
```

### allowedUses

在 Calico IPPool YAML 中，`allowedUses` 是一个列表，用于指定允许使用 IP 地址的目标类型。

在上述示例中，`allowedUses` 包含两个元素：`Workload` 和 `Tunnel`。这意味着分配给该 IP 地址池的 IP 地址可以被用于两种不同的目标类型。

- `Workload` 表示 IP 地址可以用于分配给工作负载。这包括应用程序容器、虚拟机或其他网络服务。
- `Tunnel` 表示 IP 地址可以用于分配给隧道通信。例如，用于创建虚拟网络或跨节点之间的隧道连接。

通过在 `allowedUses` 中指定目标类型，可以限制 IP 地址的使用范围，确保其仅用于特定的工作负载或隧道通信。

请注意，`allowedUses` 可以包含其他目标类型，根据具体需求进行配置。这允许更细粒度地控制 IP 地址的使用方式和分配策略。

以下是示例的 `allowedUses` 配置：

```yaml
allowedUses:
  - Workload
  - Tunnel
  - Gateway
```

上述示例表示 IP 地址可以用于分配给工作负载、隧道通信和网关设备。

### blockSize

[Change IP pool block size (tigera.io)](https://docs.tigera.io/archive/v3.23/networking/change-block-size)

在 Calico IPPool YAML 中，`blockSize` 是用于定义 IP 地址块（IP block）的大小的选项。IP 地址块是在 Calico 网络中用于分配 IP 地址的单位。

`blockSize` 的值可以是一个介于 24 到 32 之间的整数。较小的 `blockSize` 值表示较大的 IP 地址块，而较大的 `blockSize` 值表示较小的 IP 地址块。

当创建一个 IP 地址池（IPPool）时，Calico 使用 `blockSize` 参数来确定每个 IP 地址块的大小。每个 IP 地址块都包含一系列可用于分配的 IP 地址。

例如，如果 `blockSize` 设置为 26，那么每个 IP 地址块将包含 64 个 IP 地址（2^(32-26) = 64）。这意味着在分配 IP 地址时，每次将一整个地址块分配给节点。

选择适当的 `blockSize` 取决于网络中所需的 IP 地址数量和可用的 IP 地址空间。较小的 `blockSize` 可能导致更快地耗尽 IP 地址池，而较大的 `blockSize` 可能会浪费 IP 地址空间。因此，需要根据具体需求和网络规模来选择合适的 `blockSize` 值。



在Calico IP池（IP Pool）的定义中，blockSize指的是每个子网（subnet）中的IP地址块的大小。它决定了子网中可用的IP地址数量。

举个例子来说明，假设我们有一个IP池，使用CIDR表示法定义为`192.168.0.0/16`，并且设置了一个blockSize为24。这意味着我们将使用这个IP池来创建多个子网，每个子网的大小为24，即有256个IP地址可用。

根据CIDR表示法，`192.168.0.0/16`表示一个包含65,536个IP地址的IP池。然而，由于我们设置了blockSize为24，这个IP池将被划分为多个子网，每个子网包含256个IP地址。

具体划分的子网如下：

- 子网1: `192.168.0.0/24`（包含IP地址`192.168.0.0`到`192.168.0.255`）
- 子网2: `192.168.1.0/24`（包含IP地址`192.168.1.0`到`192.168.1.255`）
- 子网3: `192.168.2.0/24`（包含IP地址`192.168.2.0`到`192.168.2.255`）
- ...
- 子网254: `192.168.253.0/24`（包含IP地址`192.168.253.0`到`192.168.253.255`）
- 子网255: `192.168.254.0/24`（包含IP地址`192.168.254.0`到`192.168.254.255`）

每个子网都有自己的IP地址范围，其中第一个IP地址用于网络地址，最后一个IP地址用于广播地址，因此每个子网实际可用的IP地址数量是254。

通过设置blockSize，我们可以根据需求控制每个子网中可用的IP地址数量。这对于灵活管理IP地址分配和容量规划非常有用。



如果CIDR为`192.168.0.0/24`，并且设置了blockSize为24，这意味着你将创建一个仅包含一个子网的IP池。在这种情况下，blockSize的设置实际上没有任何影响，因为它与CIDR中指定的子网掩码长度相同。

CIDR表示法`192.168.0.0/24`表示一个包含256个IP地址的IP池，其中第一个IP地址用于网络地址，最后一个IP地址用于广播地址，因此实际可用的IP地址数量是254。由于设置了blockSize为24，这个IP池只包含一个子网。

子网的范围是`192.168.0.0/24`，其中的IP地址范围是`192.168.0.0`到`192.168.0.255`。所有分配给Pod的IP地址都将来自这个子网。

总结而言，当CIDR为`192.168.0.0/24`且设置blockSize为24时，你创建了一个包含一个子网和254个可用IP地址的IP池。



如果CIDR为`192.168.0.0/24`，并且设置了blockSize为26，这意味着你将创建一个IP池，其中每个子网的大小为26位，即有64个可用IP地址。

CIDR表示法`192.168.0.0/24`表示一个包含256个IP地址的IP池，其中第一个IP地址用于网络地址，最后一个IP地址用于广播地址，因此实际可用的IP地址数量是254。

设置blockSize为26意味着将这个IP池划分为多个子网，每个子网包含64个可用IP地址。

根据CIDR表示法和blockSize的设置，划分的子网如下所示：

- 子网1: `192.168.0.0/26`（包含IP地址`192.168.0.0`到`192.168.0.63`）
- 子网2: `192.168.0.64/26`（包含IP地址`192.168.0.64`到`192.168.0.127`）
- 子网3: `192.168.0.128/26`（包含IP地址`192.168.0.128`到`192.168.0.191`）
- 子网4: `192.168.0.192/26`（包含IP地址`192.168.0.192`到`192.168.0.255`）

每个子网都有自己的IP地址范围，其中第一个IP地址用于网络地址，最后一个IP地址用于广播地址，因此每个子网实际可用的IP地址数量是62。

通过设置blockSize为26，你将创建一个包含4个子网和总共256个可用IP地址的IP池，每个子网包含64个可用IP地址。这样可以更细粒度地管理IP地址分配，并根据需要进行更灵活的容量规划。



### cidr

必选字段

在 Calico IPPool YAML 中，`cidr` 是指定 IP 地址池（IPPool）的网络地址范围的选项。CIDR（Classless Inter-Domain Routing）是一种用于表示 IP 网络的标准表示法。

`cidr` 的值是一个 IP 地址和子网掩码的组合，表示 IP 地址池的网络地址范围。例如，`192.168.0.0/16` 表示一个包含从 `192.168.0.0` 到 `192.168.255.255` 的 IP 地址范围。

通过指定 `cidr`，Calico 可以知道在该 IP 地址池中可用的 IP 地址范围。Calico 将在该范围内分配 IP 地址给节点和工作负载。

在创建 IPPool 时，需要指定合适的 `cidr` 值，以确保满足网络需求和可用 IP 地址的数量。如果 IP 地址池的 `cidr` 范围与现有网络发生冲突，可能会导致 IP 地址冲突和网络连接问题。

以下是一些示例 `cidr` 值：

- `192.168.0.0/16`：表示一个包含 `192.168.x.x` 形式的 IP 地址范围。
- `10.0.0.0/24`：表示一个包含 `10.0.0.x` 形式的 IP 地址范围。
- `172.16.0.0/12`：表示一个包含 `172.16.x.x` 到 `172.31.x.x` 形式的 IP 地址范围。

根据需要，选择适当的 `cidr` 值来定义 Calico IP 地址池的网络范围，以确保足够的 IP 地址供分配和网络连接使用。



**blockSize 和 cidr 有什么区别？**

`blockSize` 和 `cidr` 是在不同上下文中使用的两个概念，用于定义 IP 地址的不同方面。

1. `blockSize`（块大小）是在 Calico IPPool YAML 中使用的选项，用于定义 IP 地址块的大小。它表示每个 IP 地址块中可用的 IP 地址数量。较小的 `blockSize` 值表示较大的 IP 地址块，而较大的 `blockSize` 值表示较小的 IP 地址块。它影响分配给节点的 IP 地址块的大小，而不直接涉及 IP 地址范围。
2. `cidr`（无类别域间路由）是一个网络表示法，用于表示 IP 地址范围。它通常在网络规划和配置中使用，包括路由和子网掩码。`cidr` 由 IP 地址和前缀长度组成，例如 `192.168.0.0/24` 表示一个包含从 `192.168.0.0` 到 `192.168.0.255` 的 IP 地址范围。它用于确定可用的 IP 地址范围，并与 IP 地址进行比较和匹配。

总结来说，`blockSize` 是用于确定每个 IP 地址块中可用的 IP 地址数量，而 `cidr` 是用于定义 IP 地址范围。它们在不同的上下文中使用，并且用于不同的目的，但它们都与 IP 地址的分配和规划有关。



在给定的示例中，`blockSize` 和 `cidr` 是用于定义 Calico IPPool YAML 中的 IP 地址池的选项。

- `blockSize: 24` 表示每个 IP 地址块中有 24 个可用的 IP 地址。这意味着 Calico 将为每个节点分配一个具有 24 个 IP 地址的子网。
- `cidr: 10.233.64.0/18` 表示一个 IP 地址范围，从 `10.233.64.0` 到 `10.233.127.255`。这个范围可以容纳 18 位前缀长度的 IP 地址，即包含 2^14 (16,384) 个可用的 IP 地址。

结合起来，这两个选项用于定义一个 IP 地址池，其中每个节点将分配一个具有 24 个 IP 地址的子网，并且整个 IP 地址池范围为 `10.233.64.0/18`，可以容纳 16,384 个 IP 地址。

这样的设置允许 Calico 在给定的 IP 地址池中为每个节点分配一个子网，并为节点上的工作负载提供足够的 IP 地址。根据节点数量和预期的工作负载数量，可以调整 `blockSize` 和 `cidr` 的值来满足需求。



### ipipMode

在 Calico IPPool YAML 中，`ipipMode` 是指定 Calico 是否使用 IP-over-IP（IPIP）封装模式的选项。IPIP 是一种将 IP 数据包封装在另一个 IP 数据包中进行传输的隧道协议。在 Calico 中，IPIP 可以用于在不同的节点之间创建虚拟网络，以便跨主机进行通信。

`ipipMode` 可以有以下几个选项：

1. `Always`：始终使用 IPIP 封装模式。无论节点是否在同一个物理网络中，都会使用 IPIP 封装来传输数据包。这是默认设置。
2. `CrossSubnet`：只有当源 IP 和目标 IP 不在同一个子网时，才会使用 IPIP 封装模式。如果两个节点在同一个子网中，则数据包会直接发送，而不进行封装。
3. `Never`：永远不使用 IPIP 封装模式。数据包将直接在底层网络中传输，不进行封装。

通过选择适当的 `ipipMode` 设置，可以控制 Calico 网络中的数据包传输方式，以满足特定的网络要求和性能需求。



### natOutgoing

在 Calico IPPool YAML 中，`natOutgoing` 是一个布尔值选项，用于指定是否对从该 IP 地址池中分配的地址发出的流量执行出站网络地址转换（NAT）。

当 `natOutgoing` 设置为 `true` 时，从该 IP 地址池分配给节点或工作负载的出站流量将使用节点的外部 IP 地址进行源地址转换。这意味着所有从该地址池分配的地址发出的流量将经过 NAT 处理，使其看起来来自于节点的外部 IP 地址。

当 `natOutgoing` 设置为 `false` 时，从该 IP 地址池分配给节点或工作负载的出站流量将不进行源地址转换。流量将保持其原始源 IP 地址不变，并直接发送到目标地址。

通常情况下，当节点或工作负载需要与外部网络通信时，建议将 `natOutgoing` 设置为 `true`，以确保出站流量经过 NAT 处理，从而在外部网络中被正确路由和响应。这对于使用私有 IP 地址范围的网络特别重要，因为私有 IP 地址不能直接在公共互联网上路由。

以下是 `natOutgoing` 的两种设置的示例：

- `natOutgoing: true`：对从该 IP 地址池分配的地址发出的流量执行出站 NAT。
- `natOutgoing: false`：从该 IP 地址池分配的地址发出的流量不进行出站 NAT，保持原始源 IP 地址不变。

根据网络环境和需求，选择适当的 `natOutgoing` 设置以确保正确的出站流量处理和通信。



### nodeSelector

在 Calico IPPool YAML 中，`nodeSelector` 是一个用于选择使用特定标签的节点来分配 IP 地址的选项。

`nodeSelector` 允许你指定一个或多个键值对，用于匹配节点上的标签。只有带有匹配标签的节点才会从指定的 IP 地址池中分配 IP 地址。

当创建 IP 地址池时，可以使用 `nodeSelector` 来限制将 IP 地址分配给具有特定属性或功能的节点。这样可以更有选择地将 IP 地址分配给满足特定要求的节点。

以下是 `nodeSelector` 的示例：

```yaml
nodeSelector:
  key1: value1
  key2: value2
```

上述示例表示只有具有标签 `key1=value1` 和 `key2=value2` 的节点才会从该 IP 地址池中分配 IP 地址。

注意，`nodeSelector` 是一个可选字段，如果未指定，则 IP 地址池中的 IP 地址将可以分配给任何节点。

通过使用 `nodeSelector`，你可以更加灵活地控制 Calico IP 地址的分配，以满足特定的节点选择需求。你可以根据节点的属性、角色或其他自定义标签来选择节点，从而实现更精细的 IP 地址分配策略。



### vxlanMode

在 Calico IPPool YAML 中，`vxlanMode` 是指定 Calico 是否使用 VXLAN（Virtual Extensible LAN）模式的选项。VXLAN 是一种虚拟化扩展局域网的技术，用于在不同的节点之间创建逻辑隧道以进行跨主机的通信。

`vxlanMode` 可以有以下几个选项：

1. `Always`：始终使用 VXLAN 模式。无论节点是否在同一个物理网络中，都会使用 VXLAN 进行数据包封装和传输。这是默认设置。
2. `CrossSubnet`：只有当源 IP 和目标 IP 不在同一个子网时，才会使用 VXLAN 模式。如果两个节点在同一个子网中，则数据包会直接发送，而不进行 VXLAN 封装。
3. `Never`：永远不使用 VXLAN 模式。数据包将直接在底层网络中传输，不进行 VXLAN 封装。

通过选择适当的 `vxlanMode` 设置，可以控制 Calico 网络中数据包的传输方式。VXLAN 模式可以创建逻辑隧道，使得跨物理主机的通信更加灵活和安全。然而，使用 VXLAN 可能会增加一些额外的网络开销。

需要根据网络拓扑、性能需求和环境配置来选择适当的 `vxlanMode` 设置。默认情况下，Calico 使用 VXLAN 进行数据包封装和传输，以提供虚拟网络的功能。



## Pod 可用 IP 范围

- 在 Kubernetes 中，Pod 可以使用的地址范围是由集群的网络插件负责管理的。不同的网络插件可能具有不同的配置方式和默认设置。

### 查看可用的 IP 地址范围

- 如果你使用的是 Calico 网络插件，你可以通过以下步骤查看 Pod 可以使用的地址范围：

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d


# kubectl describe ippool default-ipv4-ippool
...
  Cidr:           10.233.64.0/18
...
```

- **Cidr: 10.233.64.0/18**

  - 可用地址范围：10.233.64.1 ~ 10.233.127.254
  - 可用地址数量：16382
  - PS：Pod 使用 IP 的范围必须在此之间



### 自定义 ip pool

参考文档：https://docs.tigera.io/archive/v3.23/reference/resources/ippool

- 最初的地址池

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d


# kubectl describe ippool default-ipv4-ippool
...
  Cidr:           10.233.64.0/18
...
```

- 自定义新的地址池

```yaml
# vim my.ippool-1.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: my.ippool-1
spec:
  cidr: 10.200.64.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel 
```

- 验证

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d
my.ippool-1           31s


# kubectl describe ippool my.ippool-1 
...
  Cidr:           10.200.64.0/24
...
```



## Calico 分配 Pod IP

- 默认情况下，Pod 的 IP 是由 kubernetes 自动分配的，Pod 的每次删除和重建后 IP 都有可能发生变化，但也可以通过一些方式实现明确指定为 Pod 分配的 IP；
- 不同的 CNI 插件，实现为 Pod 分配指定 IP 的方式不尽相同。



### 自定义 Pod IP 地址

**注意事项：**

- 自定义的 IP 必须要在 Pod 可用地址池的合法范围内，并且该 IP 要未被其它 Pod 所使用
  - 例如当前集群可用的IP范围是：10.233.64.1 ~ 10.233.127.254
- 这种方式只能为每个 Pod 分配一个 IP，不能为 Deployment 等控制器在创建 Pod 时分配多个 IP

**参考文档：**

- https://docs.tigera.io/archive/v3.23/networking/use-specific-ip



#### 范例：自定义 Pod IP 地址

- 通过添加注解的方式明确指定分配的IP

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
  annotations: # 注解
    cni.projectcalico.org/ipAddrs: "[\"10.233.65.177\"]" # 明确指定分配的IP
spec:
  containers:
  - name: demoapp # 容器一
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
  - name: curl # 容器二
    image: curlimages/curl:8.1.0
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

- 验证

```yaml
# kubectl describe pod -n test demoapp
Name:         demoapp
Namespace:    test
Priority:     0
Node:         k8s-worker2/172.16.0.124
Start Time:   Thu, 01 Jun 2023 15:27:30 +0800
Labels:       <none>
Annotations:  cni.projectcalico.org/containerID: 6917fee7bbdd6400defaeda7f0f9f6545e80f2aff339e4ca868dbe812b9e929f
              cni.projectcalico.org/ipAddrs: ["10.233.65.177"]
              cni.projectcalico.org/podIP: 10.233.65.177/32
              cni.projectcalico.org/podIPs: 10.233.65.177/32
Status:       Running
IP:           10.233.65.177
IPs:
  IP:  10.233.65.177
...
```





#### 范例：分配多个 IP 时报错

- 这种方式只能为每个 Pod 分配一个 IP，不能为 Deployment 等控制器在创建 Pod 时分配多个 IP，否则会报以下错误：

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: test
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
      annotations: # 注解
        cni.projectcalico.org/ipAddrs: "[\"10.233.65.177\", \"10.233.65.178\"]" # 分配多个IP
    spec:
      containers:
      - name: demoapp
        image: 172.16.0.120:30002/example-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']



# 所有Pod都将无法分配IP
# kubectl get pod -n test -o wide
NAME                       READY   STATUS              RESTARTS   AGE     IP       NODE          NOMINATED NODE   READINESS GATES
demoapp-67578686fb-8kv7p   0/1     ContainerCreating   0          2m37s   <none>   k8s-worker3   <none>           <none>
demoapp-67578686fb-bvtlg   0/1     ContainerCreating   0          2m37s   <none>   k8s-worker1   <none>           <none>
demoapp-67578686fb-swk5j   0/1     ContainerCreating   0          2m37s   <none>   k8s-worker2   <none>           <none>



# 报错
# kubectl describe pod -n test demoapp-67578686fb-bvtlg 
...
  Warning  FailedCreatePodSandBox  2m41s                   kubelet            Failed to create pod sandbox: rpc error: code = Unknown desc = failed to set up sandbox container "572a7a238eaefae2da6a2ce5e2ae6834187aa7f450365c5e9344815e56545a50" network for pod "demoapp-67578686fb-bvtlg": networkPlugin cni failed to set up pod "demoapp-67578686fb-bvtlg_test" network: cannot have more than one IPv4 address for "cni.projectcalico.org/ipAddrs" annotation
  Normal   SandboxChanged          2m33s (x12 over 2m58s)  kubelet            Pod sandbox changed, it will be killed and re-created.
  Warning  FailedCreatePodSandBox  2m32s (x4 over 2m39s)   kubelet            (combined from similar events): Failed to create pod sandbox: rpc error: code = Unknown desc = failed to set up sandbox container "1e05db9586184396db5add5e44bd1fd73a5f83a07b976165a997bacdbc394a33" network for pod "demoapp-67578686fb-bvtlg": networkPlugin cni failed to set up pod "demoapp-67578686fb-bvtlg_test" network: cannot have more than one IPv4 address for "cni.projectcalico.org/ipAddrs" annotation

```



### 限制 Pod 使用特定范围内的 IP 地址

- 此方式可以将 ip pool 中的 ip 划分给 pod，划分时可以基于 Pod 和 namespace 两种粒度。

**参考文档：**

- https://docs.tigera.io/archive/v3.23/networking/legacy-firewalls



#### 范例：Pod 级别分配

- 让 pod 使用指定 ippool 中的 ip
- https://docs.tigera.io/archive/v3.23/networking/legacy-firewalls#restrict-a-pod-to-use-an-ip-address-range

##### 获取目前的 ip pool

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d
my.ippool-1           47m


# kubectl get ippool default-ipv4-ippool -o jsonpath='{.spec.cidr}' ; echo
10.233.64.0/18


# kubectl get ippool my.ippool-1 -o jsonpath='{.spec.cidr}' ; echo
10.200.64.0/24
```

##### Pod

- 添加注解明确指定分配的 ippool

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["my.ippool-1"]' # 使用该ippool中的ip
spec:
  containers:
  - name: demoapp # 容器一
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
  - name: curl # 容器二
    image: curlimages/curl:8.1.0
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

- 验证，分配的地址位于 my.ippool-1

```yaml
# kubectl describe pod -n test demoapp
Name:         demoapp
Namespace:    test
Priority:     0
Node:         k8s-worker2/172.16.0.124
Start Time:   Thu, 01 Jun 2023 16:47:50 +0800
Labels:       <none>
Annotations:  cni.projectcalico.org/containerID: 2ba2dceb3057fd11e3523c8dc3cf14b115745b9e91b5874193fe9cf19d606ab6
              cni.projectcalico.org/ipv4pools: ["my.ippool-1"]
              cni.projectcalico.org/podIP: 10.200.64.0/32
              cni.projectcalico.org/podIPs: 10.200.64.0/32
Status:       Running
IP:           10.200.64.0 # 分配的地址位于 my.ippool-1
IPs:
  IP:  10.200.64.0
...
```

##### Deployment

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: test
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
      annotations: # 注解
        cni.projectcalico.org/ipv4pools: '["my.ippool-1"]' # 指定地址池
    spec:
      containers:
      - name: demoapp
        image: 172.16.0.120:30002/example-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']



# ok
# kubectl get pod -n test -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
demoapp-5d7978f7f9-4kczb   1/1     Running   0          28s   10.200.64.1     k8s-worker2   <none>           <none>
demoapp-5d7978f7f9-bzrtz   1/1     Running   0          28s   10.200.64.64    k8s-worker1   <none>           <none>
demoapp-5d7978f7f9-c8jp9   1/1     Running   0          28s   10.200.64.192   k8s-worker3   <none>           <none>
```





#### 范例：Namespace 级别分配

- 创建 namespace 时为其指定 ippool，后续在此 namespace 中创建的 pod 都将被分配该 ippool 中的 ip
- https://docs.tigera.io/archive/v3.23/networking/legacy-firewalls#restrict-all-pods-within-a-namespace-to-use-an-ip-address-range

##### 创建 ip pool

- 这里假设创建美国节点的地址池，且 CIDR 为 10.200.66.0/24

```yaml
# vim america_ippool.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: america-ippool
spec:
  cidr: 10.200.66.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel 


# kubectl get ippool
NAME                  AGE
america-ippool        7s
default-ipv4-ippool   72d
my.ippool-1           167m



# kubectl describe ippool america-ippool
...
  Cidr:           10.200.66.0/24
...
```

##### 创建 namespace

- 创建名称空间并指定地址池

```yaml
# vim america-node.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: america-node
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["america-ippool"]' # 指定地址池



# kubectl apply -f america-node.yaml 
namespace/america-node created


# kubectl describe ns america-node 
Name:         america-node
Labels:       kubernetes.io/metadata.name=america-node
              kubesphere.io/namespace=america-node
Annotations:  cni.projectcalico.org/ipv4pools: ["america-ippool"]
Status:       Active
...
```

##### 创建 Depoyment

- 创建的 Pod 都将属于 10.200.66.0/24 网段

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: america-node # 指定namespace
spec:
  replicas: 3 # 创建3个Pod副本
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
        image: 172.16.0.120:30002/example-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']



# kubectl get pod -n america-node -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
demoapp-759f97d8cb-24mx2   1/1     Running   0          16s   10.200.66.192   k8s-worker3   <none>           <none>
demoapp-759f97d8cb-47g8x   1/1     Running   0          16s   10.200.66.0     k8s-worker2   <none>           <none>
demoapp-759f97d8cb-qxvns   1/1     Running   0          16s   10.200.66.64    k8s-worker1   <none>           <none>
```



### 测试不同 ippool 中的 Pod 是否能通信

- 属于同一子网既可以

#### ippool

##### america_ippool.yaml

```yaml
# vim america_ippool.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: america-ippool
spec:
  cidr: 10.200.66.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel 

```

##### my.ippool-1.yaml

```yaml
# vim my.ippool-1.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: my.ippool-1
spec:
  cidr: 10.200.64.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel

```



#### namespace

##### america-node.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: america-node
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["america-ippool"]' # 指定地址池

```

##### test.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: test 
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["my.ippool-1"]' # 指定地址池

```



#### pod

##### demoapp_america-node.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp-america
  namespace: america-node # 指定namespace
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp-america
  template:
    metadata:
      name: demoapp-america
      labels:
        app: demoapp-america
    spec:
      containers:
      - name: demoapp-america
        image: 172.16.0.120:30002/example-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']

```

##### demoapp_test.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp-test
  namespace: test # 指定namespace
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp-test
  template:
    metadata:
      name: demoapp-test
      labels:
        app: demoapp-test
    spec:
      containers:
      - name: demoapp-test
        image: 172.16.0.120:30002/example-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']

```

#### 验证

```sh
root@demoapp-test-85fc4bd9f7-kkf8c:/var/lib/logger_processor# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN group default qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
4: eth0@if191: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1480 qdisc noqueue state UP group default 
    link/ether 9e:7f:5a:bd:ea:55 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.200.64.192/32 scope global eth0
       valid_lft forever preferred_lft forever



root@demoapp-test-85fc4bd9f7-kkf8c:/var/lib/logger_processor# ping 10.200.66.21
PING 10.200.66.21 (10.200.66.21) 56(84) bytes of data.
64 bytes from 10.200.66.21: icmp_seq=1 ttl=62 time=0.206 ms
64 bytes from 10.200.66.21: icmp_seq=2 ttl=62 time=0.204 ms
64 bytes from 10.200.66.21: icmp_seq=3 ttl=62 time=0.213 ms

```





# Calico & NetworkPolicy

```sh
尽管功能上日渐丰富，但k8s自己的NetworkPolicy资源仍然具有相当的局限性，例如它没有明确的拒绝规则、缺乏对选择器高级表达式的支持、不支持应用层规则，以及没有集群范围的网络策略等。为了解决这些限制，Calico等提供了自有的策略CRD，包括NetworkPolicy和GlobalNetworkPolicy等，其中的NetworkPolicy CRD比Kubernetes NetworkPolicy API提供了更大的功能集，包括支持拒绝规则、规则解析级别以及应用层规则等，但相关的规则需要由calicoctl创建。


GlobalNetworkPolicy支持使用selector、serviceAccountSelector或namespaceSelector来选定网络策略的生效范围，默认为all()，即集群上的所有端点。下面的配置清单示例（globalnetworkpolicy-demo.yaml）为非系统类名称空间（本示例假设有kube-system、kubernetes-dashboard、logs和monitoring这4个）定义了一个通用的网络策略。

apiVersion: projectcalico.org/v3
kind: GlobalNetworkPolicy
metadata:
  name: namespaces-default
spec:
  order: 0.0  # 策略叠加时的应用次序，数字越小越先应用，冲突时，后者会覆盖前者
  # 策略应用目标为非指定名称空间中的所有端点
namespaceSelector: name not in {"kube-system","kubernetes-dashboard","logs","monitoring"}
  types: ["Ingress", "Egress"]
  ingress:  # 入站流量规则
  - action: Allow  # 白名单
    source:
      # 策略生效目标中的端点可由下面系统名称空间中每个源端点访问任意端口
      namespaceSelector: name in {"kube-system","kubernetes-dashboard","logs","monitoring"}
  egress:  # 出站流量规则
  - action: Allow  # 允许所有





这些用于节点过滤的预选函数负责根据指定判定标准及各Node对象和当前Pod对象能否适配，它们按照用于实现的主要目标大体可分为如下几类。
	节点存储卷数量限制检测：MaxEBSVolumeCount、MaxGCEPDVolumeCount、 MaxCSIVolumeCount、MaxAzureDiskVolumeCount和MaxCinderVolumeCount。
	检测节点状态是否适合运行Pod：CheckNodeUnschedulable和CheckNodeLabelPresence。
	Pod与节点的匹配度检测：Hostname、PodFitsHostPorts、MatchNodeSelector、NoDiskConflict、PodFitsResources、PodToleratesNodeTaints、PodToleratesNodeNoExecuteTaints、CheckVolumeBinding和NoVolumeZoneConflict
	Pod间的亲和关系判定：MatchInterPodAffinity。
	将一组Pod打散至集群或特定的拓扑结构中：CheckServiceAffinity和EvenPodsSpread。
在Kubernetes Scheduler上启用相应的预选函数才能实现相关调度机制的节点过滤需求，下面给出了这些于Kubernetes v1.17版本中支持的各预选函数的简要功能，其中仅ServiceAffinity和CheckNodeLabelPresence支持自定义配置，余下的均为静态函数。
1）CheckNodeUnschedulable：检查节点是否被标识为Unschedulable，以及是否可将Pod调度于该类节点之上。
2）HostName：若Pod资源通过spec. nodeName明确指定了要绑定的目标节点，则节点名称与与该字段值相同的节点才会被保留。
3）PodFitsHostPorts：若Pod容器定义了ports.hostPort属性，该预选函数负责检查其值指定的端口是否已被节点上的其他容器或服务所占用，该端口已被占用的节点将被过滤掉。
4）MatchNodeSelector：若Pod资源规范上定义了spec.nodeSelector字段，则仅那些拥有匹配该标签选择器的标签的节点才会被保留。
5）NoDiskConflict：检查Pod对象请求的存储卷在此节点是否可用，不存在冲突则通过检查。
6）PodFitsResources：检查节点是否有足够资源（例如 CPU、内存和GPU等）满足Pod的运行需求；节点声明其资源可用容量，而Pod定义其资源需求（requests），于是调度器会判断节点是否有足够的可用资源运行Pod对象，无法满足则返回失败原因（例如，CPU或内存资源不足等）；调度器的评判资源消耗的标准是节点已分配资源量（各容器的requests值之和），而非其上的各Pod已用资源量，但那些在注解中标记为关键性（critical）的Pod资源则不受该预选函数控制。
7）PodToleratesNodeTaints：检查Pod的容忍度（spec.tolerations字段）是否能够容忍该节点上的污点（taints），不过，它仅关注具有NoSchedule和NoExecute两个效用标识的污点。
8）PodToleratesNodeNoExecuteTaints：检查Pod的容忍度是否能接纳节点上定义的NoExecute类型的污点。
9）CheckNodeLabelPresence：检查节点上某些标签的存在性，要检查的标签以及其可否存在则取决于用户的定义；在集群中的部署节点以regions/zones/racks类标签的拓扑方式编制，且基于该类标签对相应节点进行了位置标识时，预选函数可以根据位置标识将Pod调度至此类节点之上。
10）CheckServiceAffinity：根据调度的目标Pod对象所属的Service资源已关联的其他Pod对象的位置（所运行节点）来判断当前Pod可以运行的目标节点，其目的在于将同一Service对象的Pod放置在同一拓扑内（如同一个rack或zone）的节点上以提高效率。
11）MaxEBSVolumeCount：检查节点上已挂载的EBS存储卷数量是否超过了设置的最大值。
12）MaxGCEPDVolumeCount：检查节点上已挂载的GCE PD存储卷数量是否超过了设置的最大值，默认值为16。
13）MaxCSIVolumeCount：检查节点上已挂载的CSI存储卷数量是否超过了设置的最大值。
14）MaxAzureDiskVolumeCount：检查节点上已挂载的Azure Disk存储卷数量是否超过了设置的最大值，默认值为16。
15）MaxCinderVolumeCount：检查节点上已挂载的Cinder存储卷数量是否超过了设置的最大值。
16）CheckVolumeBinding：检查节点上已绑定和未绑定的PVC是否能满足Pod的存储卷需求，对于已绑定的PVC，此预选函数检查给定节点是否能兼容相应PV，而对于未绑定的PVC，预选函数搜索那些可满足PVC申请的可用PV，并确保它可与给定的节点兼容。
17）NoVolumeZoneConflict：在给定了存储故障域的前提下，检测节点上的存储卷是否可满足Pod定义的需求。
18）EvenPodsSpread：检查节点是否能满足Pod规范中topologySpreadConstraints字段中定义的约束以支持Pod的拓扑感知调度。
19）MatchInterPodAffinity：检查给定节点是否能满足Pod对象的亲和性或反亲和性条件，用于实现Pod亲和性调度或反亲和性调度。









	LeastRequestedPriority：优先将Pod打散至集群中的各节点之上，以试图让各节点有着近似的计算资源消耗比例，适用于集群规模较少变动的场景；其分值由节点空闲资源与节点总容量的比值计算而来，即由CPU或内存资源的总容量减去节点上已有Pod对象需求的容量总和，再减去当前要创建的Pod对象的需求容量得到的结果除以总容量；CPU和内存具有相同权重，资源空闲比例越高的节点得分也就越高，其计算公式如为：(cpu((capacity – sum(requested)) * 10 / capacity) + memory((capacity – sum(requested)) * 10 / capacity))/ 2。
	MostRequestedPriority：与优选函数LeastRequestedPriority的评估节点得分的方法相似，但二者不同的是，当前函数将给予计算资源占用比例更大的节点以更高的得分，计算公式如为：(cpu((sum(requested)) * 10 / capacity) + memory((sum(requested)) * 10 / capacity))/ 2。该函数的目标在于优先让节点以满载的方式承载Pod资源，从而能够使用更少的节点数，因而较适用于节点规模可弹性伸缩的集群中以最大化地节约节点数量。
	BalancedResourceAllocation：以CPU和内存资源占用率的相近程度作为评估标准，二者越接近的节点权重越高。该优选函数不能单独使用，它需要和LeastRequestedPriority组合使用来平衡优化节点资源的使用状态，选择那些在部署当前Pod资源后系统资源更为均衡的节点。
	ResourceLimitsPriority：以是否能够满足Pod资源限制为评估标准，那些能够满足Pod对于CPU或（和）内存资源限制的节点将计入1分，节点未声明可分配资源或Pod未定义资源限制时不影响节点计分。
	RequestedToCapacityRatio：该函数允许用户自定义节点各类资源（例如CPU和内存等）的权重，以便提高大型集群中稀缺资源的利用率；该函数的行为可以通过名为requestedToCapacityRatioArguments的配置选项进行控制，它由shape和resources两个参数组成。
	NodeAffinityPriority：节点亲和调度机制，它根据Pod资源规范中的spec.nodeSelector来对给定节点进行匹配度检查，成功匹配到的条目越多则节点得分越高。不过，其评估过程使用PreferredDuringSchedulingIgnoredDuringExecution这一表示首选亲和的标签选择器。
	ImageLocalityPriority：镜像亲和调度机制，它根据给定节点上是否拥有运行当前Pod对象中的容器所依赖到的镜像文件来计算该节点的得分值。那些不具有该Pod对象所依赖到的任何镜像文件的节点得分为0，而那些存在相关镜像文件的各节点中，拥有被Pod所依赖到的镜像文件的体积之和越大的节点得分就会越高。
	TaintTolerationPriority：基于对Pod资源对节点的污点容忍调度偏好进行其优先级评估，它将Pod对象的tolerations列表与节点的污点进行匹配度检查，成功匹配的条目越多，则节点得分越低。
	SelectorSpreadPriority：尽可能分散Pod至不同节点上的调度机制，它首先查找标签选择器能够匹配到当前Pod标签的ReplicationController、ReplicaSet和StatefulSet等控制器对象，而后查找可由这类对象的标签选择器匹配到的现存各Pod对象及其所在的节点，而那些运行此类Pod对象越少的节点得分越高。简单来说，如其名称所示，此优选函数尽量把同一标签选择器匹配到的Pod资源打散到不同的节点上运行。
	ServiceSpreadingPriority：类似于SelectorSpreadPriority，它首先查找标签选择器能够匹配到当前Pod标签的Service对象，而后查找可由这类Service对象的标签选择器匹配到的现存各Pod对象及其所在的节点，而那些运行此类Pod对象越少的节点得分越高。
	EvenPodsSpreadPriority：用于将一组特定的Pod对象在指定的拓扑结构上进行均衡打散，打散条件定义在Pod对象的spec.topologySpreadConstraints字段上，它内嵌labelSelector指定标签选择器以匹配符合条件的Pod对象，使用topologyKey指定目标拓扑结构，使用maxSkew描述最大允许的不均衡数量，而无法满足指定的调度条件时的评估策略则由whenUnsatisfiable字段定义，它有两个可用取值，默认值DoNotSchedule表示不予调度，而ScheduleAnyway则表示以满足最小不均衡值的标准进行调度。
	EqualPriority：设定所有节点具有相同的权重1。
	InterPodAffinityPriority：遍历Pod对象的亲和性条目，并将那些能够匹配到给定节点的条目的权重相加，结果值越大的节点得分越高。
	NodePreferAvoidPodsPriority：此优选级函数权限默认为10000，它根据节点是否设置了注解信息scheduler.alpha.kubernetes.io/preferAvoidPods来计算其优选级。计算方式是，给定的节点无此注解信息时，其得分为10乘以权重10000，存在此注解信息时，对于那些由ReplicationController或ReplicaSet控制器管控的Pod对象的得分为0，其他Pod对象会被忽略（得最高分）。
```

























```yaml
# kubectl get ippool
NAME                  AGE
america-ippool        15h
default-ipv4-ippool   110d
england-ippool        14h
germany-ippool        3d1h



apiVersion: v1
items:
- apiVersion: crd.projectcalico.org/v1
  kind: IPPool
  metadata:
    annotations:
      kubectl.kubernetes.io/last-applied-configuration: |
        {"apiVersion":"crd.projectcalico.org/v1","kind":"IPPool","metadata":{"annotations":{},"name":"america-ippool"},"spec":{"allowedUses":["Workload","Tunnel"],"cidr":"10.200.66.0/24","disabled":false,"ipipMode":"CrossSubnet","natOutgoing":true,"nodeSelector":"all()"}}
    creationTimestamp: "2023-07-09T11:57:51Z"
    generation: 2
    name: america-ippool
    resourceVersion: "39183913"
    uid: f054302a-3d18-45eb-ae0d-4d685c66619e
  spec:
    allowedUses:
    - Workload
    - Tunnel
    cidr: 10.200.66.0/24
    disabled: false
    ipipMode: Always
    natOutgoing: true
    nodeSelector: all()
- apiVersion: crd.projectcalico.org/v1
  kind: IPPool
  metadata:
    annotations:
      projectcalico.org/metadata: '{"uid":"1ba06317-30af-4017-9665-9e47f1f20a62","creationTimestamp":"2023-03-21T06:17:28Z"}'
    creationTimestamp: "2023-03-21T06:17:28Z"
    generation: 1
    name: default-ipv4-ippool
    resourceVersion: "1281"
    uid: e6ffc1cb-c7a3-4236-9dd6-bf7b7fc3ac92
  spec:
    allowedUses:
    - Workload
    - Tunnel
    blockSize: 24
    cidr: 10.233.64.0/18
    ipipMode: Always
    natOutgoing: true
    nodeSelector: all()
    vxlanMode: Never
- apiVersion: crd.projectcalico.org/v1
  kind: IPPool
  metadata:
    annotations:
      kubectl.kubernetes.io/last-applied-configuration: |
        {"apiVersion":"crd.projectcalico.org/v1","kind":"IPPool","metadata":{"annotations":{},"name":"england-ippool"},"spec":{"allowedUses":["Workload","Tunnel"],"cidr":"10.200.65.0/24","disabled":false,"ipipMode":"CrossSubnet","natOutgoing":true,"nodeSelector":"all()"}}
    creationTimestamp: "2023-07-09T12:34:40Z"
    generation: 2
    name: england-ippool
    resourceVersion: "39184018"
    uid: 7b9e7c9e-3fe2-4999-8f0b-2ebad97294b2
  spec:
    allowedUses:
    - Workload
    - Tunnel
    cidr: 10.200.65.0/24
    disabled: false
    ipipMode: Always
    natOutgoing: true
    nodeSelector: all()
- apiVersion: crd.projectcalico.org/v1
  kind: IPPool
  metadata:
    annotations:
      kubectl.kubernetes.io/last-applied-configuration: |
        {"apiVersion":"crd.projectcalico.org/v1","kind":"IPPool","metadata":{"annotations":{},"name":"germany-ippool"},"spec":{"allowedUses":["Workload","Tunnel"],"cidr":"10.66.141.1/24","disabled":false,"ipipMode":"CrossSubnet","natOutgoing":true,"nodeSelector":"all()"}}
    creationTimestamp: "2023-07-07T02:08:56Z"
    generation: 9
    name: germany-ippool
    resourceVersion: "39184084"
    uid: d1028fc8-1960-40ef-8f4a-0266606fb360
  spec:
    allowedUses:
    - Workload
    - Tunnel
    cidr: 10.66.141.1/24
    disabled: false
    ipipMode: Always
    natOutgoing: true
    nodeSelector: all()
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""

```

