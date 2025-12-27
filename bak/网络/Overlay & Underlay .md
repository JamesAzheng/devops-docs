# Underlay

## Underlay 概述

Underlay网络是由各类物理设备构成，通过使用路由协议保证其设备之间的IP连通性的承载网络。

## Underlay 网络痛点

- 由于硬件根据目的IP地址进行数据包的转发，所以传输的路径依赖十分严重。
- 新增或变更业务需要对现有底层网络连接进行修改，重新配置耗时严重。
- 互联网不能保证私密通信的安全要求。
- 网络切片和网络分段实现复杂，无法做到网络资源的按需分配。
- 多路径转发繁琐，无法融合多个底层网络来实现负载均衡。





# ---



# Overlay

## Overlay 概述

- **Overlay网络是建立在Underlay网络上的逻辑网络**
- Overlay网络是通过网络虚拟化技术，在同一张Underlay网络上构建出的一张或者多张虚拟的逻辑网络。不同的Overlay网络虽然共享Underlay网络中的设备和线路，但是Overlay网络中的业务与Underlay网络中的物理组网和互联技术相互解耦。Overlay网络的多实例化，既可以服务于同一租户的不同业务（如多个部门），也可以服务于不同租户，是SD-WAN以及数据中心等解决方案使用的核心组网技术。
- 相互连接的Overlay设备之间建立隧道，数据包准备传输出去时，设备为数据包添加新的IP头部和隧道头部，并且被屏蔽掉内层的IP头部，数据包根据新的IP头部进行转发。当数据包传递到另一个设备后，外部的IP报头和隧道头将被丢弃，得到原始的数据包，在这个过程中Overlay网络并不感知Underlay网络。

- Overlay网络有着各种网络协议和标准，包括VXLAN、NVGRE、SST、GRE、NVO3、EVPN等。
  

## Overlay 网络优点

- 流量传输不依赖特定线路。Overlay网络使用隧道技术，可以灵活选择不同的底层链路，使用多种方式保证流量的稳定传输。
- Overlay网络可以按照需求建立不同的虚拟拓扑组网，无需对底层网络作出修改。
- 通过加密手段可以解决保护私密流量在互联网上的通信。
- 支持网络切片与网络分段。将不同的业务分割开来，可以实现网络资源的最优分配。
- 支持多路径转发。在Overlay网络中，流量从源传输到目的可通过多条路径，从而实现负载分担，最大化利用线路的带宽。
  





# Overlay vs Underlay

![](https://img-blog.csdnimg.cn/0407f15dfba6438a9c23bc047518d179.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZHBkcGRwcHA=,size_20,color_FFFFFF,t_70,g_se,x_16)