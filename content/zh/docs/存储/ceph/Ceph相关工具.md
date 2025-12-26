---
title: "Ceph相关工具"
---

# ceph 集群管理

## 打印集群状态

```sh
# ceph -s
  cluster:
    id:     23af67b8-235b-48f2-8dfe-8b52370a7419
    health: HEALTH_OK
 
  services:
    mon: 3 daemons, quorum stor01,stor02,stor03
    mgr: stor02(active), standbys: stor01
    mds: cephfs-1/1/1 up  {0=stor01=up:active}
    osd: 3 osds: 3 up, 3 in
    rgw: 1 daemon active
 
  data:
    pools:   8 pools, 240 pgs
    objects: 214  objects, 3.5 KiB
    usage:   3.0 GiB used, 597 GiB / 600 GiB avail
    pgs:     240 active+clean
```



## 停止或重启Ceph集群

### 停止

1. 告知Ceph集群不要将OSD标记为out
   - 命令：`ceph osd set noout`
2. 按如下顺序停止守护进程和节点
   - 存储客户端
   - 网关，例如 NFS Ganesha 或对象网关
   - 元数据服务器
   - Ceph OSD
   - Ceph Manager
   - Ceph Monitor

### 启动

1. 以与停止过程相关的顺序启动节点
   - Ceph Monitor
   - Ceph Manager
   - Ceph OSD
   - 元数据服务器
   - 网关，例如 NFS Ganesha 或对象网关
   - 存储客户端
2. 删除noout标志
   - 命令：`ceph osd unset noout`











# MON

## 打印 MON 状态

- 集群中存在多个Mon主机时，应该在启动集群之后读取或写入数据之前检查Mon的仲裁状态；事实上，管理员也应该定期检查这种仲裁结果

### 显示监视器映射

```sh
# ceph mon stat
e1: 3 mons at {stor01=172.18.0.7:6789/0,stor02=172.18.0.17:6789/0,stor03=172.18.0.27:6789/0}, election epoch 36, leader 0 stor01, quorum 0,1,2 stor01,stor02,stor03

# 或

# ceph mon dump
dumped monmap epoch 1
epoch 1
fsid 23af67b8-235b-48f2-8dfe-8b52370a7419
last_changed 2022-11-19 20:52:37.402539
created 2022-11-19 20:52:37.402539
0: 172.18.0.7:6789/0 mon.stor01
1: 172.18.0.17:6789/0 mon.stor02
2: 172.18.0.27:6789/0 mon.stor03
```

### 显示仲裁状态

```sh
# ceph quorum_status --format json-pretty
# 或
# ceph quorum_status | jq .
{
  "election_epoch": 36,
  "quorum": [
    0,
    1,
    2
  ],
  "quorum_names": [
    "stor01",
    "stor02",
    "stor03"
  ],
  "quorum_leader_name": "stor01",
  "monmap": {
    "epoch": 1,
    "fsid": "23af67b8-235b-48f2-8dfe-8b52370a7419",
    "modified": "2022-11-19 20:52:37.402539",
    "created": "2022-11-19 20:52:37.402539",
    "features": {
      "persistent": [
        "kraken",
        "luminous",
        "mimic",
        "osdmap-prune"
      ],
      "optional": []
    },
    "mons": [
      {
        "rank": 0,
        "name": "stor01",
        "addr": "172.18.0.7:6789/0",
        "public_addr": "172.18.0.7:6789/0"
      },
      {
        "rank": 1,
        "name": "stor02",
        "addr": "172.18.0.17:6789/0",
        "public_addr": "172.18.0.17:6789/0"
      },
      {
        "rank": 2,
        "name": "stor03",
        "addr": "172.18.0.27:6789/0",
        "public_addr": "172.18.0.27:6789/0"
      }
    ]
  }
}
```





# image

- rbd命令可用于创建、查看及删除块设备相在的映像（image），以及克隆映像、创建快照、将映像回滚到快照和查看快照等管理操作

## 创建 image

- 需事先存在RDB的存储池

```sh
# 在rbddata存储池中，创建一个名为img1，大小为1G的image（每一个image就是一个块设备）
# rbd create img1 --size 1024 --pool rbddata
```





# ---

# Socket

- Ceph的管理套接字接口常用于查询守护进程
- 套接字默认保存 于/var/run/ceph目录
- 此接口的使用不能以远程方式进程

```sh
# 命令的使用格式：
# ceph --admin-daemon /var/run/ceph/socket-name

# 获取使用帮助：
# ceph --admin-daemon /var/run/ceph/socket-name help
```

