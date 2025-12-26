---
title: "Ceph"
---

# 参考链接

- https://github.com/ceph/ceph
- https://docs.ceph.com/en/latest/start/intro/
- https://www.redhat.com/zh/technologies/storage/ceph
- https://access.redhat.com/documentation/en-us/red_hat_ceph_storage/5
- [Ceph 存储介绍_公博义的博客-CSDN博客](https://blog.csdn.net/shenyuanhaojie/article/details/121261005?ops_request_misc={"request_id"%3A"166894395116800182151203"%2C"scm"%3A"20140713.130102334.pc_all."}&request_id=166894395116800182151203&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~hot_rank-1-121261005-null-null.142)



# Ceph 概述

- Ceph是一个对象（object）式存储系统，它把每一个待管理的数据流（例如一个文件）切分为一到多个固定大小的对象数据(默认为4M，因此每个对象的占用的存储空间都为4M的整数倍)，并以其为原子单元完成数据存取
  - **每个对象都有自己的元数据和数据 并存放到一起，而非像文件系统一样将元数据和数据分开存放。**

- 无论 ceph 客户端是哪种类型，例如块设备、对象存储、文件系统，ceph 都会在存储池中将所有数据存储为对象:
- 对象数据的底层存储服务是由多个主机（host）组成的存储集群，该集群也被称之为RADOS（Reliable Automatic Distributed Object Store）存储集群，即可靠、自动化、分布式对象存储系统
- Ceph 目前以被红帽收购





# Ceph 版本参考

https://docs.ceph.com/en/latest/releases/

|                             Name                             |  Release   |                        First release                         | End of life |
| :----------------------------------------------------------: | :--------: | :----------------------------------------------------------: | :---------: |
|                           Argonaut                           |    0.48    |                         July 3, 2012                         |             |
|                           Bobtail                            |    0.56    |                       January 1, 2013                        |             |
|                          Cuttlefish                          |    0.61    |                         May 7, 2013                          |             |
|                           Dumpling                           |    0.67    |                       August 14, 2013                        |  May 2015   |
|                           Emperor                            |    0.72    |                       November 9, 2013                       |  May 2014   |
|                           Firefly                            |    0.80    |                         May 7, 2014                          | April 2016  |
|                            Giant                             |    0.87    |                       October 29, 2014                       | April 2015  |
|                            Hammer                            |    0.94    |                        April 7, 2015                         | August 2017 |
|                          Infernalis                          |   9.2.0    |                       November 6, 2015                       | April 2016  |
|                            Jewel                             |   10.2.0   |                        April 21, 2016                        | 2018-06-01  |
|                            Kraken                            |   11.2.0   |                       January 20, 2017                       | 2017-08-01  |
|                           Luminous                           |   12.2.0   |                       August 29, 2017                        | 2020-03-01  |
|                            Mimic                             |   13.2.0   |                         June 1, 2018                         | 2020-07-22  |
|                           Nautilus                           |   14.2.0   |                        March 19, 2019                        | 2021-06-01  |
|                           Octopus                            |   15.2.0   |                        March 23, 2020                        | 2022-06-01  |
|                           Pacific                            |   16.2.0   | March 31, 2021[[41\]](https://en.wikipedia.org/wiki/Ceph_(software)#cite_note-41) | 2023-06-01  |
|                            Quincy                            | **17.2.0** | April 19, 2022[[42\]](https://en.wikipedia.org/wiki/Ceph_(software)#cite_note-42) | 2024-06-01  |
| Reef[[43\]](https://en.wikipedia.org/wiki/Ceph_(software)#cite_note-43) |    TBA     |                             TBA                              |             |











# Ceph 核心组件

![ceph架构-1](/docs/存储/ceph/ceph架构-1.png)

![ceph架构-2](/docs/存储/ceph/ceph架构-2.png)







## Ceph 对外提供的访问接口

- librados 
- RADOSGW
- RBD
- CephFS



## RADOS

- Reliable Autonomic Distributed Object Store
- RADOS 是 ceph 存储集群的基础。
- 在 ceph 中，所有数据都以对象的形式存储，并且无论什么数据类型，RADOS 对象存储都将负责保存这些对象。RADOS 层可以确保数据始终保持一致。

## Monitors

- 监视器，必选组件；
- 集群监视器跟踪活动和失败的集群节点、集群配置以及有关数据放置和全局集群状态的信息。
- 监视器还负责管理守护进程和客户端之间的身份验证。
- 监视器，维护集群状态的多种映射，同时提供认证和日志记录服务，包括有关 monitor 节点端到端的信息，其中包括 Ceph 集群 ID，监控主机名和 IP 以及端口。并且存储当前版本信息以及最新更改信息，通过 `ceph mon dump` 查看 monitor map
- 冗余和高可用性通常需要至少三个监视器。
  - **注意：mon 节点必须为奇数**


**相关守护进程：**

- ceph-mon，其默认监听在 TCP/6789 端口之上
- ceph-mon 守护进程维护集群状态的映射，包括监视器映射、管理器映射、OSD 映射、MDS 映射和 CRUSH 映射。这些映射是 Ceph 守护进程相互协调所需的关键集群状态。



## Managers

- 管理器执行集群监控、簿记和维护任务，并与外部监控系统和管理接口（例如平衡器、仪表板、[Prometheus](https://en.wikipedia.org/wiki/Prometheus_(software))、Zabbix 插件）

- 管理器，必选组件
- ceph-mgr 守护进程负责跟踪运行时指标和 Ceph 集群的当前状态，包括存储利用率、当前性能指标和系统负载。
- 高可用性通常需要至少两个管理器。（非强制为奇数节点）

**相关守护进程：**

- ceph-mgr，其默认监听在 TCP/6802 端口之上？





# Ceph 相关进程

### 必选进程

[Ceph 存储集群](https://docs.ceph.com/en/latest/glossary/#term-Ceph-Storage-Cluster)至少运行三种类型的守护进程：

- [Ceph 监视器](https://docs.ceph.com/en/latest/glossary/#term-Ceph-Monitor)(`ceph-mon`)
- [Ceph 管理器](https://docs.ceph.com/en/latest/glossary/#term-Ceph-Manager)(`ceph-mgr`)
- [Ceph OSD 守护进程](https://docs.ceph.com/en/latest/glossary/#term-Ceph-OSD-Daemon)(`ceph-osd`)

### 可选进程

- 支持[Ceph 文件系统](https://docs.ceph.com/en/latest/glossary/#term-Ceph-File-System)的 Ceph 存储集群需至少运行一个[Ceph 元数据服务器](https://docs.ceph.com/en/latest/glossary/#term-Ceph-Metadata-Server)( `ceph-mds`)。
- 支持[Ceph 对象存储](https://docs.ceph.com/en/latest/glossary/#term-Ceph-Object-Storage)的集群需运行 Ceph RADOS 网关守护进程 ( `radosgw`)。

### 其他说明

- 每个守护进程都有许多配置选项，每个选项都有一个默认值。您可以通过更改这些配置选项来调整系统的行为。在覆盖默认值之前，请仔细了解后果，因为这可能会显着降低集群的性能和稳定性。另请注意，默认值有时会因版本而异，因此最好查看与您的 Ceph 版本一致的本文档版本。



# Ceph 管理节点

- Admin Host
- Ceph的常用管理接口是一组命令行工具程序，例如rados、ceph、rbd等命令；
- 管理员可以从某个特定的MON节点执行管理操作，但也有人更倾向于使用专用的管理节点；
  - 专用的管理节点有助于在Ceph相关的程序升级或硬件维护期间为管理员提供一个完整的、独立的并隔离于存储集群之外的操作环境，从而避免因重启或意外中断而导致维护操作异常中断



# Crimson

从 2019 年开始，正在进行的项目是在 Ceph 中重新实现 OSD，称为 Crimson。Crimson 的主要目标是最大限度地减少 CPU 开销和延迟，因为像[NVMe这样的现代存储设备比](https://en.wikipedia.org/wiki/NVMe)[HDD](https://en.wikipedia.org/wiki/Hard_disk_drive)甚至[SSD](https://en.wikipedia.org/wiki/Solid-state_drive)快得多，但 CPU 没有赶上这种变化。此外，crimson-osd旨在成为 ceph-osd 的向后兼容替代品。虽然 Crimson 可以与 BlueStore 一起使用，但也正在开发一个名为 SeaStore 的新 ObjectStore 实现。[[25\] ](https://en.wikipedia.org/wiki/Ceph_(software)#cite_note-25)[[26\]](https://en.wikipedia.org/wiki/Ceph_(software)#cite_note-26)


## ---
# ceph 概述
Ceph 是一个高度可靠、自动扩容、自动修复、分布式的存储系统。

---

**Ceph 的三大核心组件**
- OSD（Object Storage Daemon）：存数据的进程
    - 生产环境一般至少要 3 个 OSD
- MON（Monitor）：维护集群状态和选举（类似 etcd/zookeeper）
    - 生产环境必须用 3 个 MON（奇数选举）。
- MGR（Manager）：提供 Dashboard、监控、数据分布的负载均衡等
    - 一般至少 2 个 MGR（主备）。

**Ceph 提供的三种存储类型**
- RBD（块存储）：虚拟硬盘
- CephFS（共享 POSIX 文件系统）：共享目录
- RGW（对象存储 Gateway）：提供兼容 S3 的 API，用作私有云对象存储（替代 MinIO）
