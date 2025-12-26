---
title: "Cilium"
weight: 10
---

# Cilium 概述

Cilium 是一个开源的网络连接和安全性解决方案，专为容器化、微服务和云原生应用程序设计。它提供了一种高级网络和网络安全层，以帮助管理和保护在大规模分布式环境中运行的应用程序。

以下是 Cilium 的一些关键特性和概念的详细解释：

1. **eBPF (Extended Berkeley Packet Filter)**：Cilium 使用 eBPF 技术在 Linux 内核中实现其核心功能。eBPF 是一种灵活而强大的虚拟机技术，允许在内核中执行自定义的网络过滤和操作。Cilium 利用 eBPF 来拦截和检查网络流量，并在运行时动态地应用安全策略。
2. **网络连接和路由管理**：Cilium 具有灵活的网络连接管理功能，可以自动为容器和微服务创建和管理网络连接。它使用透明的代理来管理和路由流量，无需修改应用程序代码或配置网络规则。Cilium 还支持多种网络层协议和服务发现机制，使得在复杂的应用程序和服务间建立可靠的通信变得更加容易。
3. **安全策略和访问控制**：Cilium 提供了强大的安全性功能，可以定义细粒度的网络安全策略和访问控制规则。它可以基于网络标识、应用程序协议、服务和微服务之间的关系等因素来控制流量。Cilium 还支持网络加密和身份验证，以保护敏感数据和应用程序免受未经授权的访问。
4. **服务发现和负载均衡**：Cilium 集成了强大的服务发现和负载均衡功能，使得在容器和微服务之间进行动态的流量分发变得更加容易。它可以自动检测和跟踪服务的变化，并使用智能路由算法将流量引导到可用的实例上，以实现高可用性和可扩展性。
5. **观察性和监控**：Cilium 提供了全面的观察性和监控功能，帮助用户了解应用程序和网络的运行状况。它集成了 Prometheus、Grafana 等流行的监控工具，提供实时的指标和可视化仪表板，帮助用户诊断问题、监测性能和进行容量规划。

总之，Cilium 是一个功能强大的容器和云原生网络解决方案，通过利用 eBPF 技术和灵活的网络连接管理，帮助用户构



**参考文档：**

- https://cilium.io/
- https://github.com/cilium/cilium



## eBPF

eBPF（extended Berkeley Packet Filter）是一种扩展的伯克利数据包过滤器，它是一个在Linux内核中执行代码的虚拟机。eBPF的设计目标是为了提供一种安全、高效的机制，用于对内核中的事件进行动态的、实时的数据包过滤、网络分析和性能跟踪。

以下是eBPF的一些关键概念和详细解释：

1. 原理：eBPF利用了内核中的一组虚拟机指令，允许用户在不修改内核源代码的情况下，在内核空间中执行自定义的程序。这些程序可以被动态加载到内核中，并在特定事件（如数据包到达、系统调用等）发生时执行。
2. 安全性：eBPF程序在执行之前会进行严格的验证和限制，以确保它们不会破坏内核的稳定性和安全性。eBPF使用了一种基于LLVM的前端编译器，将高级的eBPF程序转换为安全的、可验证的内核字节码。
3. 事件钩子：eBPF程序可以与内核中的各种事件钩子（如网络协议栈、系统调用、硬件事件等）关联起来。这使得用户能够对事件进行过滤、修改或收集数据，从而实现各种用途，如防火墙、网络监控、流量分析和性能调优等。
4. 动态加载：eBPF程序可以动态地加载到内核中，而无需重新启动系统。这使得用户能够实时地修改和更新eBPF逻辑，而无需中断正在运行的应用程序或服务。
5. 多种用途：eBPF的灵活性使其在许多领域得到广泛应用。它可以用于网络安全，例如实现高性能的数据包过滤、DDoS防御和流量分析。此外，eBPF还可以用于性能分析和故障排查，以监控系统调用、函数调用和硬件事件等。
6. 生态系统：eBPF拥有丰富的生态系统，包括各种工具、库和框架，用于开发、调试和部署eBPF程序。例如，BCC（BPF Compiler Collection）提供了一组用于eBPF开发的工具和库，而Cilium和Falco等项目则将eBPF用于容器网络和容器安全领域。



**eBPF 和 iptables 与 ipvs 对比**

eBPF、iptables和IPVS都是在Linux系统中用于网络和安全领域的工具，但它们在功能、应用场景和实现方式上有所不同。下面是它们之间的对比：

1. 功能：

- eBPF：eBPF是一种灵活的内核扩展机制，可以用于数据包过滤、网络分析和性能跟踪等多种用途。它可以在内核中动态加载自定义程序，通过事件钩子来处理网络数据包或系统调用。
- iptables：iptables是Linux系统上用于数据包过滤和网络地址转换（NAT）的工具。它基于规则表和链来对数据包进行过滤、修改和重定向。iptables通常用于实现防火墙规则和网络流量控制。
- IPVS：IPVS（IP Virtual Server）是Linux系统上的一种负载均衡工具，用于将传入的网络流量分发到多个后端服务器上。它支持多种负载均衡算法，并提供高性能的流量分发和会话保持功能。

1. 应用场景：

- eBPF：eBPF适用于需要进行实时数据包过滤、网络分析和性能跟踪的场景。它可以实现高级的网络安全策略、网络监控和故障排查。
- iptables：iptables主要用于配置和管理防火墙规则，进行数据包过滤和网络地址转换。它可以实现访问控制、端口转发、NAT等功能。
- IPVS：IPVS用于负载均衡，将传入的流量分发到后端服务器上，提高服务的可扩展性和可用性。

1. 实现方式：

- eBPF：eBPF是一个在内核中执行代码的虚拟机。它使用特定的eBPF指令集，以及LLVM前端编译器将高级的eBPF程序转换为安全的内核字节码。
- iptables：iptables是基于Netfilter框架的用户空间工具，通过配置Netfilter规则表和链来实现数据包过滤和转发。iptables规则会转换为内核中的Netfilter规则集。
- IPVS：IPVS是内核中的一个模块，通过Linux虚拟服务器（LVS）框架提供负载均衡功能。它使用内核中的IPVS子系统来进行负载均衡决策和流量分发。

需要注意的是，尽管eBPF具有灵活的功能和强大的性能，但它的使用需要更高级的技术和开发经验。而iptables和IPVS则更加成熟和易于使用，适用于常见的网络安全和负载均衡需求。

综上所述，eBPF、iptables和IPVS在功能和应用场景上有所区别。eBPF是一个灵活的内核扩展机制，适用于实时数据包过滤、网络分析和性能跟踪。iptables主要用于防火墙规则和数据包过滤，而IPVS则是一个负载均衡工具。选择使用哪种工具取决于具体的需求和应用场景。



**结合 kubernetes**

当结合Kubernetes时，可以将eBPF、iptables和IPVS与Kubernetes的网络组件和功能进行对比。

1. eBPF与Kubernetes：

- eBPF在Kubernetes中可以用于实现高级的网络安全策略、网络监控和性能调优。它可以通过在内核中执行自定义程序来处理网络事件，例如数据包过滤、流量分析和故障排查。eBPF可以与Kubernetes的网络插件（如Calico）集成，提供更灵活、高级的网络功能。

1. iptables与Kubernetes：

- 在Kubernetes中，iptables被广泛用于实现网络策略和流量转发。Kubernetes使用iptables规则来定义容器之间的网络通信、服务访问和流量控制。iptables可以在节点上进行配置，并根据定义的规则对进出的流量进行过滤和转发。

1. IPVS与Kubernetes：

- IPVS在Kubernetes中用于实现负载均衡。Kubernetes使用IPVS来分发传入的流量到后端的Pod副本，以提高服务的可扩展性和可用性。IPVS支持多种负载均衡算法，并可以与Kubernetes的服务和Ingress对象进行集成。

需要注意的是，在Kubernetes中，网络组件和功能的选择取决于具体的网络架构和需求。一些网络插件（如Calico和Cilium）可能会使用eBPF作为其实现机制，以提供更高级的网络功能。同时，iptables仍然是Kubernetes中常用的流量过滤和转发工具，而IPVS用于负载均衡。因此，在Kubernetes中使用这些工具时，需要考虑网络插件、容器网络模型和负载均衡要求等因素。



**性能对比**

就性能而言，eBPF、iptables和IPVS在处理网络流量和事件时具有不同的特点和性能表现。

1. eBPF性能：

- eBPF的设计目标之一是提供高性能的数据包过滤和网络分析能力。它在内核中执行代码，可以在数据包到达、系统调用等事件发生时实时地处理网络流量。由于eBPF程序是预编译的，且经过严格验证和限制，因此可以获得较好的性能。此外，eBPF还可以利用其优化的机制，如跳转表和红黑树等，进一步提高性能。

1. iptables性能：

- iptables是Linux系统中广泛使用的数据包过滤和网络地址转换工具。它的性能在处理简单的规则时非常高效，对于少量规则的情况下，性能表现较好。然而，随着规则的增加和复杂性的提高，iptables的性能可能会下降。这是因为iptables的规则是按顺序逐个匹配，且匹配规则越多，性能消耗越大。

1. IPVS性能：

- IPVS是Linux内核中的一个模块，用于实现负载均衡。它具有较高的性能，可以实现快速而准确的流量分发。IPVS使用一种基于哈希或轮询等负载均衡算法来选择后端服务器，并支持会话保持。这使得IPVS可以有效地处理大量的并发连接和高负载的网络环境。

需要注意的是，性能的表现取决于多个因素，如硬件配置、系统负载、规则复杂性等。在实际应用中，综合考虑这些因素并进行性能测试是确定最适合特定场景的工具或组件的最佳方法。此外，不同的网络架构和使用方式也会对性能产生影响。因此，在选择和配置这些工具时，应根据具体需求和场景进行评估和测试。





# Cilium 部署

https://docs.cilium.io/en/stable/installation/k8s-install-helm/

- PS：默认cidr为["10.0.0.0/8"]，易产生冲突

```
helm show values cilium/cilium --version 1.14.5 | grep clusterPoolIPv4PodCIDRList
```

- 添加仓库

```
helm repo add cilium https://helm.cilium.io/
```

- 导出 values 文件

```
helm show values cilium/cilium --version 1.14.5 > values-cilium-1.14.5.yaml
```

- 修改 values 文件

```yaml
vim  values-cilium-1.14.5.yaml
...
ipam:
...
  operator:
...
    clusterPoolIPv4PodCIDRList: ["10.168.0.0/16"]
...
```

- 安装

```sh
kubectl create ns cilium
helm install cilium cilium/cilium --namespace cilium -f values-cilium-1.14.5.yaml
```

- 测试工具：[Installation using Helm — Cilium 1.14.5 documentation](https://docs.cilium.io/en/stable/installation/k8s-install-helm/#validate-the-installation)

```
cilium status -n cilium
cilium connectivity test -n cilium
```



# Cilium 卸载

```
helm uninstall cilium  --namespace kube-system

kubectl delete ciliumid --all

kubectl delete crd --all
```

