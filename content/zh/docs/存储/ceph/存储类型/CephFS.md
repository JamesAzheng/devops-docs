---
title: "CephFS"
---

# CephFS 概述

https://docs.ceph.com/en/latest/cephfs/

- Ceph File System ，即Ceph文件系统，是 Ceph 对外提供的存储方式之一；
- CephFS 是基于 librados 封装原生接口，文件系统的客户端可以直接访问 RADOS 以读取和写入文件数据块。
- 提供 POSIX 兼容的网络文件系统 CephFS，专注于高性能、大容量存储。
- 通常意义是支持 POSIX 接口，它跟传统的文件系统如 Ext4 是一个类型的，但区别在于分布式存储提供了并行化的能力，如 Ceph 的 CephFS（CephFS 是 Ceph 面向文件存储的接口），但是有时候又会把 GlusterFS，HDFS 这种非 POSIX 接口的类文件存储接口归入此类
- 不同于传统文件系统的地方是，CephFS MDS在设计的初衷之一即高度可扩展的能力，其实现机制中，数据由客户端以分布式方式通过多路OSD直接存储于RADOS系统，而元数据则由MDS组织管理后仍然存储于RADOS系统之上
  - **MDS仅是实现了分布式文件系统的控制平面，数据和元数据的存取依然由RADOS负责**
- CephFS依赖于独立运行的守护进程ceph-mds向客户端提供服务

**类似应用：**

- NFS、NAS、CIFS



# MDSs

- Metadata Server，[元数据](https://en.wikipedia.org/wiki/Metadata)服务器，用于缓存和代理对CephFS 文件系统内的[inode](https://en.wikipedia.org/wiki/Inode)和[目录的访问。](https://en.wikipedia.org/wiki/Directory_(file_systems))
- Ceph 元数据服务器允许 POSIX 文件系统用户执行基本命令（如 ls、find等），而不会给 Ceph 存储集群带来巨大负担。

**注意：**

- CephFS 的元数据实际保存于 matedata pool 的存储池中，而 MDS 仅做缓存和代理。而数据则存放于 data pool 中。因此，每个 CephFS 至少拥有 matedata pool 和 data pool 两个存储池。

- ceph 的块存储和 ceph 对象存储都不需要 MDS

**相关守护进程：**

- ceph-mds