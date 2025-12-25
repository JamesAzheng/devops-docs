---
title: "ceph"
---

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
