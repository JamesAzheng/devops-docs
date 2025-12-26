---
title: "OSD、MON、MGR"
---


# OSD 概述

- Object Storage Device 对象存储设备，简称OSD，必选组件
  - 使用直接日志磁盘存储的[对象存储设备](https://en.wikipedia.org/wiki/Object_storage_device)（名为 BlueStore， [[18\]](https://en.wikipedia.org/wiki/Ceph_(software)#cite_note-bluestore-18)，自 v12.x 版本以来，它取代了使用文件系统的 FileStore [[19\] ）](https://en.wikipedia.org/wiki/Ceph_(software)#cite_note-19)

- OSD 将数据以对象的形式存储到集群中的每个节点的物理磁盘上；
- 每个OSD都包含POOL和PG；
- OSD 负责存储数据、处理数据复制、恢复、回（Backfilling）、再平衡。完成存储数据的工作绝大多数是由 OSD daemon 进程实现。
- 在构建 Ceph OSD 的时候，建议采用 SSD 磁盘以及 xfs 文件系统来格式化分区。
- OSD 还会对其它 OSD 进行心跳检测，并检测结果汇报给 Monitor。
- 冗余和高可用性通常需要至少三个 Ceph OSD。

**相关守护进程：**

- ceph-osd，每个OSD都会有一个单独的守护进程 以便于单独进行管理。





# OSD 相关命名

## 打印 OSD 状态

```sh
# ceph osd stat
3 osds: 3 up, 3 in; epoch: e68

# 显示osd更详细的信息
# ceph osd dump
...
```

## 在CRUSH地图中的位置查看OSD

- Ceph将列显CRUSH树及主机、它的OSD、OSD是否已启动及其权重

```sh
# ceph osd tree
ID CLASS WEIGHT  TYPE NAME       STATUS REWEIGHT PRI-AFF 
-1       0.58589 root default                            
-3       0.19530     host stor01                         
 0   hdd 0.19530         osd.0       up  1.00000 1.00000 
-5       0.19530     host stor02                         
 1   hdd 0.19530         osd.1       up  1.00000 1.00000 
-7       0.19530     host stor03                         
 2   hdd 0.19530         osd.2       up  1.00000 1.00000 
```



# MON

在 Ceph 中，`mon` 是指 Monitor，是一个用于维护 Ceph 集群状态的守护进程。每个 Ceph 集群都需要至少一个 Monitor，它们通常是在不同的物理或虚拟机器上运行的。Monitor 之间通过 Paxos 协议来达成共识，并维护 Ceph 的监视器映射、数据块位置信息、PG 到 OSD 映射等元数据信息。Monitors 还协调其他 Ceph 守护进程（例如 OSD 和 MDS）之间的通信。

Monitors 还负责监控 Ceph 集群的状态，并在有必要时进行故障转移。如果某个 Monitor 宕机，其他 Monitors 会通过选举协议来选择新的 Monitor，以确保 Ceph 集群的可用性。

在 Ceph 集群中，Monitors 是极其重要的组件，任何对于 Monitors 的故障或异常都会影响整个 Ceph 集群的运行状态。因此，建议在部署 Ceph 集群时，至少保证有 3 个 Monitor 的高可用性部署，以确保 Ceph 集群的稳定运行。

# ---



# MGR

## 模块管理

```sh
# ceph mgr module ls
{
    "enabled_modules": [ # 已经启用的模块
        "balancer",
        "crash",
        "iostat",
        "restful",
        "status"
    ],
    "disabled_modules": [ # 已禁用的模块
        {
            "name": "dashboard",
            "can_run": true, # 为true表示此模块可以开启
            "error_string": ""
        },
        {
            "name": "hello",
            "can_run": true,
            "error_string": ""
        },
        {
            "name": "influx",
            "can_run": false,
            "error_string": "influxdb python module not found"
        },
        {
            "name": "localpool",
            "can_run": true,
            "error_string": ""
        },
        {
            "name": "prometheus",
            "can_run": true,
            "error_string": ""
        },
        {
            "name": "selftest",
            "can_run": true,
            "error_string": ""
        },
        {
            "name": "smart",
            "can_run": true,
            "error_string": ""
        },
        {
            "name": "telegraf",
            "can_run": true,
            "error_string": ""
        },
        {
            "name": "telemetry",
            "can_run": true,
            "error_string": ""
        },
        {
            "name": "zabbix",
            "can_run": true,
            "error_string": ""
        }
    ]
}
```

