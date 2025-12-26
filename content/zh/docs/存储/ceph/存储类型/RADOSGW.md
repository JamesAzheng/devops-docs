---
title: "RADOSGW"
---

# RADOSGW 概述

https://docs.ceph.com/en/latest/radosgw/

- RADOS GateWay，即对象存储，是 Ceph 对外提供的存储方式之一；
- RADOSGW 是在 librados 之上抽象出来的接口；
- 提供 RESTful 接口，也提供多种编程语言绑定。兼容 S3、Swift；

**相关守护进程：**

- RGW依赖于在RADOS集群基础上独立运行的守护进程（ceph-radosgw）；

**对外提供访问的形式：**

- 基于http或https协议提供相关的API服务

**常见应用场景：**

- 对象存储可以对接网盘（owncloud）应用业务等

**类似应用：**

- MinIO



---

## RADOSGW

- 将对象存储层公开为与[Amazon S3](https://en.wikipedia.org/wiki/Amazon_S3)或[OpenStack Swift](https://en.wikipedia.org/wiki/Openstack#Object_storage_(Swift)) API兼容的接口的[HTTP](https://en.wikipedia.org/wiki/HTTP)网关

- 对象网关，基于存储桶的 REST 网关，兼容s3和Swift
- Ceph 对象网关是一个构建在librados之上的对象存储接口，Ceph 对象存储支持两个接口：
  - 兼容 S3 ：通过与 Amazon S3 RESTful API 的大部分子集兼容的接口提供对象存储功能。
  - 兼容 Swift：提供对象存储功能，其接口与 OpenStack Swift API 的大部分子集兼容。
- Ceph 对象存储使用 Ceph 对象网关守护进程 ( radosgw)，它是用于与 Ceph 存储集群交互的 HTTP 服务器。由于它提供了与 OpenStack Swift 和 Amazon S3 兼容的接口，因此 Ceph 对象网关有自己的用户管理。
- 网关接口，提供对象存储服务。它使用 librgw 和 librados 来实现允许应用程序与 Ceph 对象存储建立连接。并且提供 S3 和 Swift 兼容的 RESTful API 接口。

### 相关守护进程

- ceph-rgw





# RGW
