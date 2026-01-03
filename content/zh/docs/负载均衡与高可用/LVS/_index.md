---
title: "LVS"
---

## LVS 概述

**LVS (Linux Virtual Server)** 是一个开源的负载均衡项目，由章文嵩博士在 1998 年发起。它通过将请求分发给后端的多台服务器，让它们看起来像是一个高性能、高可用的单一虚拟服务器。

LVS 的工作基于**四层负载均衡**（OSI 模型第四层：传输层，即 TCP/UDP），它不处理应用层协议（如 HTTP），因此性能非常高。

LVS 目前已经集成在 Linux 内核中（IPVS 模块），是构建高性能集群架构的重要组件。

**组成部分：**

- **IPVS (IP Virtual Server)：** 运行在 Linux 内核空间，是 LVS 的核心代码，负责数据包的调度和转发。
- **ipvsadm：** 运行在用户空间，是一个命令行工具，管理员通过它来编写和管理负载均衡规则（类似于 iptables）。


**相关术语：**

- **DS (Director Server)：** 负载均衡调度器（LVS 节点）。
- **RS (Real Server)：** 真实后端服务器（处理业务的节点）。
- **VIP (Virtual IP)：** 暴露给用户的虚拟 IP 地址。
- **DIP (Director IP)：** 调度器用于连接后端 RS 的 IP。
- **RIP (Real IP)：** 后端真实服务器的 IP。

**参考文档：**

- [LVS 官方文档](https://www.linuxvirtualserver.org/)
- [LVS 中文文档](https://www.linuxvirtualserver.org/zh/index.html)



---

## LVS 工作模式

LVS 提供了三种标准转发模式，每种模式的数据流向不同：

| 特性 | LVS-NAT | LVS-DR | LVS-TUN |
| --- | --- | --- | --- |
| **性能** | 较差 (进出都过 DS) | **最高** (只处理入站) | 较高 |
| **真实服务器网关** | 指向 DS | 指向路由器 | 指向路由器 |
| **IP 修改** | 修改目标 IP | 修改 MAC 地址 | 封装新 IP 头 |
| **跨网段支持** | 不支持 (同网段) | 不支持 (同物理层) | **支持** (WAN/跨机房) |
| **适用场景** | 小规模集群 | **大规模高并发 Web/API** | 异地容灾、跨机房 |

### DR

Direct Routing，性能最高的模式，生产环境最常使用。

**工作原理：**
1. 用户请求到达 DS。
2. DS **不修改 IP 地址**，只修改数据帧的**目标 MAC 地址**为 RS 的 MAC 地址，然后将包扔给 RS。
3. RS 收到包后，发现目标 IP 是 VIP（RS 需在回环接口 lo 上绑定 VIP），予以处理。
4. **RS 直接将响应报文发给用户**（不经过 DS）。


**特点：**
- **高性能：** DS 只负责入站请求，RS 响应数据直接回给用户（通常响应流量远大于请求流量）。
- **网络要求：** DS 和 RS 必须在**同一个物理网段**（二层互通）。
- **配置复杂：** 需要在 RS 上配置 ARP 抑制，防止 RS 抢答 VIP 的 ARP 请求。




### NAT

Network Address Translation，最传统的模式，类似路由器的 NAT 功能。

**工作原理：**
1. 用户请求到达 DS（目标 IP 为 VIP）。
2. DS 将请求报文的**目标 IP 修改为后端 RS 的 IP (RIP)**，并转发给 RS。
3. RS 处理完后，将响应发回给 DS。
4. DS 将响应报文的**源 IP 修改为 VIP**，再发给用户。


**特点：**
- **简单配置：** 无需在 RS 上配置复杂的路由规则。
- **瓶颈在 DS：** 进出流量都要经过调度器，大并发下 DS 容易成为瓶颈。
- **网络要求：** RS 的网关必须指向 DS。
- **优点：** 配置简单，支持端口映射。

**实现NAT模式：**
- DS 主机：
```sh
# 1. 查看是否开启内核 IP 转发，为0则未开启
sysctl net.ipv4.ip_forward

# 2. 开启内核 IP 转发
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
sysctl -p

# 3. 配置 keepalived 为 NAT 模式
...
    lb_kind NAT
...
```

- RS 主机网关指向 DS 的内网 VIP。

{{% alert title="<i class='fa-solid fa-exclamation-triangle pe-1'></i> 注意事项" color=warning %}}

1. **DS (DIP) 和 RS (RIP)**：通常在**同一网段**，因为 DS 是 RS 的网关。
2. **Client 和 RS**：绝对**不能**在同一网段（除非特殊配置路由），否则回包不走 LVS，而是通过 ARP 直接返回给 RS，从而导致 NAT 失败。

{{% /alert %}}



### TUN

IP Tunneling，隧道技术，适用于跨地域或跨网段的场景。

**工作原理：**
1. DS 收到请求后，不修改原报文，而是**再封装一层 IP 头**（隧道技术），发给 RS。
2. RS 收到后解包，处理请求。
3. RS 直接将响应发给用户。

**特点：**
- **跨网段：** DS 和 RS 不需要同网段，甚至可以跨机房。
- **系统要求：** RS 必须支持 IP 隧道协议。



---

## LVS 调度算法

DS 根据什么规则选择 RS？LVS 提供了多种算法，分为静态和动态两类：

**静态算法（不考虑 RS 当前负载）：**

1. **RR (Round Robin)：** 轮询。按顺序轮流分配。
2. **WRR (Weighted Round Robin)：** 加权轮询。性能好的机器权重设高，分配更多请求。
3. **DH (Destination Hashing)：** 目标地址哈希。相同的目标 IP（如用户访问同一个 CDN 节点）分发给同一台 RS。
4. **SH (Source Hashing)：** 源地址哈希。来自同一个用户 IP 的请求分发给同一台 RS（用于简单的会话保持）。

**动态算法（根据 RS 当前连接数分配）：**
1. **LC (Least Connections)：** 最少连接。分发给当前连接数最少的 RS。
2. **WLC (Weighted Least Connections)：** **[默认算法]** 加权最少连接。考虑权重和连接数。
3. **SED (Shortest Expected Delay)：** 最短期望延迟。不考虑非活动连接，只看活动连接和权重。
4. **NQ (Never Queue)：** 永不排队。如果 RS 空闲直接分配，否则按 SED 算。
5. **LBLC** 和 **LBLCR**：基于局部性的最少连接（主要用于 Cache 集群）。


## ipvsadm 命令

ipvsadm 是 LVS 的命令行工具，用于编写和管理负载均衡规则。但通常转发规则由keepalived 等工具管理，ipvsadm 主要用于查看和调试。

```bash
# 显示当前所有转发规则
# Forward 列中： Route 表示 DR 模式, Masq 表示 NAT 模式, TUN 表示 TUN 模式
ipvsadm -Ln

# 显示当前所有连接规则，包括权重、活动连接数、非活动连接数
ipvsadm -Lnc
```



## 实现 DR 模式
### DS 配置
```sh
# 1. 查看是否开启内核 IP 转发，为0则未开启
sysctl net.ipv4.ip_forward

# 2. 开启内核 IP 转发
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
sysctl -p

# 3. 使用 keepalived 为 DS 配置 VIP 以及为 DR 模式
...
    lb_kind DR
...

# 验证
ipvsadm -Ln
```

### RS 配置

**1. 修改ARP相关内核参数**

{{% alert title="<i class='fa-solid fa-exclamation-triangle pe-1'></i> 注意" color=warning %}}
修改arp相关内核参数一定要先于绑定VIP，否则会因添加VIP后产生的免费arp广播而导致地址冲突
{{% /alert %}}

```sh
# 忽略arp广播
echo 'net.ipv4.conf.lo.arp_ignore=1' >> /etc/sysctl.conf
echo 'net.ipv4.conf.all.arp_ignore=1' >> /etc/sysctl.conf

# 对外不公开arp
echo 'net.ipv4.conf.lo.arp_announce=2' >> /etc/sysctl.conf
echo 'net.ipv4.conf.all.arp_announce=2' >> /etc/sysctl.conf

# 使配置生效
sysctl -p
```

**2. 绑定VIP到lo接口**
```sh {filename="/etc/netplan/02-vip.yaml"}
# 绑定VIP到lo接口
ip addr add 192.168.1.100/24 dev lo
```