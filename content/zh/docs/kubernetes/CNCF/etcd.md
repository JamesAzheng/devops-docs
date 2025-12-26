---
title: "Etcd"
weight: 10
---

# etcd 概述

- etcd 是 CoreOS 公司开发目前是 Kubernetes 默认使用的 key-value 数据存储系统，用于保存所有集群数据，支持分布式集群功能，**生产环境中要为 etcd 定期备份**
- etcd 是兼顾一致性与高可用性的键值数据库，可以作为保存 Kubernetes 所有集群数据的后台数据库。
- 假设有 3 台 etcd 组成了集群，那么只要宕掉一台 则其它的两台都将无法使用

- Etcd在k8s中主要存放的node节点和Pod等组件的数据

- etcd 是 CoreOS 团队发起的开源项目，它是基于 Go 语言实现一个键值（key-value）数据库，支持高可用集群，主要功能是 管理配置信息 和 服务发现。

- **注意：etcd 数据一旦丢失 那么整个集群将不可用**

- 参考文档：

  - https://github.com/etcd-io/etcd
- https://etcd.io/
  - https://etcd.io/docs/

- **特点：**

  - 简单：支持 REST 风格的 HTTP+JSON API
  - 安全：支持 HTTPS 方式的访问
  - 快速：支持并发 1k/s 的写操作
  - 可靠：支持分布式结构，基于 Raft 的一致性算法，Raft 是一套通过选举主节点来实现分布式系统一致性的算法。






# etcd 适用场景

**服务发现 Service Discovery：**

- 服务发现主要解决在同一个分布式集群中的进程或服务，要如何才能找到对方并建立连接。本质上来说，服务发现就是想要了解集群中是否有进程在监听udp或tcp端口，并且通过名字就可以查找和连接。

**消息发布与订阅：**

- 在分布式系统中，最适用的一种组件间通信方式就是消息发布与订阅。即构建一个配置共享中心，数据提供者在这个配置中心发布消息，而消息使用者则订阅他们关心的主题，一旦主题有消息发布，就会实时通知订阅者。通过这种方式可以做到分布式系统配置的集中式管理与动态更新。应用中用到的一些配置信息放到etcd上进行集中管理。

**负载均衡：**

- 在分布式系统中，为了保证服务的高可用以及数据的一致性，通常都会把数据和服务部署多份，以此达到对等服务，即使其中的某一个服务失效了，也不影响使用。etcd本身分布式架构存储的信息访问支持负载均衡。etcd集群化以后，每个etcd的核心节点都可以处理用户的请求。所以，把数据量小但是访问频繁的消息数据直接存储到etcd中也可以实现负载均衡的效果。

**分布式通知与协调：**

- 与消息发布和订阅类似，都用到了etcd中的Watcher机制，通过注册与异步通知机制，实现分布式环境下不同系统之间的通知与协调，从而对数据变更做到实时处理。

**分布式锁：**

- 因为etcd使用Raft算法保持了数据的强一致性，某次操作存储到集群中的值必然是全局一致的，所以很容易实现分布式锁。锁服务有两种使用方式，一是保持独占，二是控制时序。

**集群监控与Leader竞选：**

- 通过etcd来进行监控实现起来非常简单并且实时性强。





# etcd 相关端口

- TCP **/** 2379（用于客户端请求）
- TCP **/** 2380（用于对等通信）
- TCP **/** 2381（用于？）







# etcd 安装

- **注意：kubeadmin 安装的 k8s 集群此工具默认未安装，直接安装会有问题**
- 生产环境中 etcd 集群通常是编译安装的

```bash
# Ubuntu
apt -y install etcd
```







# etcd 相关工具

## 注意事项

- 有的版本需要指定 etcd api的版本，声明环境变量 `ETCDCTL_API=3`，否则将无法正常使用 etcdctl ，目前主流使用的都是 api3 版本

## 查看数据

- **查看成员信息**

```bash
etcdctl member list
```

- **验证当前 etcd 所有成员状态**

```bash
etcdctl --endpoints=http://127.0.0.1:2379 。。。。。。。。
```

- **查看 etcd 数据信息**

```bash
ETCDCTL_API=3 etcdctl get /var/ --keys-only
```

## 增删改查数据

```bash
# 添加数据（ /testkey是键 'hello world'是值）
root@etcd-1:~# ETCDCTL_API=3 etcdctl put /testkey 'hello world'
OK

# 查询数据
root@etcd-1:~# ETCDCTL_API=3 etcdctl get /testkey
/testkey # 返回的键
hello world # 返回的值


# 更改数据（更改本质上就是覆盖原有数据）
root@etcd-1:~# ETCDCTL_API=3 etcdctl put /testkey 'i am Azheng'
OK

# 查看更改结果
root@etcd-1:~# ETCDCTL_API=3 etcdctl get /testkey
/testkey
i am Azheng


# 删除数据
root@etcd-1:~# ETCDCTL_API=3 etcdctl del /testkey
1 # 1表示执行成功


# 查看删除结果
root@etcd-1:~# ETCDCTL_API=3 etcdctl get /testkey


# 删除数据
root@etcd-1:~# ETCDCTL_API=3 etcdctl del /testkey
0 # 0表示执行失败
```

## watch

- 不断监视数据是否发生变化，发生变化就主动通知客户端，支持对某个 key 进行 watch，也支持 watch 一个范围

**watch 测试：**

```bash
# 监听一个不存在的key
root@etcd-1:~# ETCDCTL_API=3 etcdctl watch /testwatch


# 创建不存在的key
root@etcd-1:~# ETCDCTL_API=3 etcdctl put /testwatch 'i am Azheng'


# 监听结果
root@etcd-1:~# ETCDCTL_API=3 etcdctl watch /testwatch
PUT
/testwatch
i am Azheng
```





# etcd 备份

**参考文档：**

- https://kubernetes.io/zh/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster

## 备份注意事项

- 备份数据最好不存放在 etcd 主机
- 由于恢复是只需恢复到最新状态，所以保存最近几天的备份即可
- 为了加以区分，要在不同的 etcd 节点备份的数据加上节点标记和时间戳
  - 如：
    - etcd-1_2022-07-08_00-53-58.bak
    - etcd-2_2022-07-08_00-56-58.bak
    - etcd-3_2022-07-08_00-57-58.bak

## 备份命令

- **备份**

```bash
# 备份前的数据
root@etcd-1:~# ETCDCTL_API=3 etcdctl get /testwatch
/testwatch
i am Azheng


# 备份
root@etcd-1:~# ETCDCTL_API=3 etcdctl snapshot save etcd-1.bak
Snapshot saved at etcd-1.bak
```

- **恢复，？？？？有问题**

```bash
# 准备一个新的 etcd 服务器
root@etcd-2:~# systemctl stop etcd

# 停止 etcd 服务
root@etcd-2:~# systemctl stop etcd

# 观察原有权限
root@etcd-2:~# ll /var/lib/etcd/ -d
drwx------ 3 etcd etcd 4096 Jul  7 23:08 /var/lib/etcd//

# 将其数据存放目录移走
root@etcd-2:~# mv /var/lib/etcd/ /tmp/

#还原到指定目录
root@etcd-2:~# ETCDCTL_API=3 etcdctl snapshot restore etcd-1.bak --data-dir=/var/lib/etcd

# 将权限修改
root@etcd-2:~# chown -R etcd.etcd /var/lib/etcd/

# 启动 etcd 服务
root@etcd-2:~# systemctl start etcd


# 查看数据恢复情况
```

## 备份参考脚本

```bash
root@etcd-1:~# cat backup_etcd.sh 
#!/bin/bash

DATE=$(date +%F_%H-%M-%S)
NODE="1"

ETCDCTL_API=3 etcdctl snapshot save etcd-${NODE}_${DATE}.bak
```

