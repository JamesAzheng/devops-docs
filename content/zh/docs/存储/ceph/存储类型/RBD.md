---
title: "RBD"
---

# RBD 概述

https://docs.ceph.com/en/latest/rbd/

- RADOS Block Devices，RADOS块设备，是 Ceph 对外提供的存储方式之一；
- 其是在librados之上抽象出来的接口，以块设备的方式对外提供访问；
- RBD 是一种建构在RADOS存储集群之上**为客户端提供块设备接口**的存储服务中间层，即**可以直接作为磁盘挂载**，内置了容灾机制。
- 这种接口通常以 QEMU Driver 或者 Kernel Module 的方式存在，这种接口需要实现 Linux 的 Block Device 的接口或者 QEMU 提供的 Block Driver 接口，如 Sheepdog，AWS 的 EBS，青云的云硬盘和阿里云的盘古系统，还有 Ceph 的 RBD（RBD 是 Ceph 面向块存储的接口）
- RBD基于RADOS存储集群中的多个OSD进行条带化，支持存储空间的简配（thin- provisioning）和动态扩容等特性，并能够借助于RADOS集群实现快照、副本和一致性
- BD自身也是RADOS存储集群的客户端，它通过将存储池提供的存储服务抽象为一到多个image（表现为块设备）向客户端提供块级别的存储接口

**常见应用场景：**

- 块设备存储可以对接 Iaas 平台，例如：`OpenStack、CloudStack、Zstack、Eucalyptus、kvm` 等
- 这类的客户端包括虚拟化程序KVM（结合qemu）和云的计算操作系统OpenStack和CloudStack等

**类似应用：**

- DAS、SAN

**相关守护进程：**

- RBD的服务接口**无须依赖于特定的守护进程**；

**客户端访问方式：**

客户端访问RBD设备的方式有两种

- 通过内核模块rbd.ko将image映射为节点本地的块设备，相关的设备文件一般为/dev/rdb#（#为设备编号，例如rdb0等）
- 另一种则是librbd提供的API接口，它支持C/C++和Python等编程语言，qemu即是此类接口的客户端



---

- 块设备，它能够自动精简配置并可调整大小，而且将数据分散存储在多个 OSD 上。

- 一个负责任的，完全-分布式块设备，使用Linux内核cliont和QEMU/KVM驱动程序
- 块是字节序列（通常为 512）。基于块的存储接口是在 HDD、SSD、CD、软盘甚至磁带等介质上存储数据的成熟且常见的方式。
- Ceph 块设备是精简配置的、可调整大小的，并将数据分条存储在多个 OSD 上。Ceph 块设备利用 RADOS功能，包括快照、复制和强一致性。Ceph 块存储客户端通过内核模块或librbd库与 Ceph 集群通信。



# RBD 命令

- RBD相关的管理有如image的创建、删除、修改和列出等基础CRUD操作，也有分组、镜像、快照和回收站等相的管理需求，这些均能够通过rbd命令完成
- `rbd [-c ceph.conf] [-m monaddr] [--cluster cluster-name] [-p|--pool pool] [command...]`





# RBD 实现

## 创建并初始化RBD存储池

- 使用块设备客户端之前必须事先创建专用的存储池、启用rbd并完成其初始化

### 创建存储池

- `ceph osd pool create {pool-name} {pg-num} {pgp-num} `

```sh
# 创建一个名为kubernetes的存储池，pg和pgp的数量为64
# ceph osd pool create rbd-kubernetes 64 64
pool 'rbd-kubernetes' created

# 验证创建的存储池
# ceph osd pool ls
...
rbd-kubernetes
```

### 启用rbd

- `ceph osd pool application enable {pool-name} rbd`

```sh
# 在新建的存储池中启用rdb功能
# ceph osd pool application enable rbd-kubernetes rbd
enabled application 'rbd' on pool 'rbd-kubernetes'
```

### rbd初始化

- `rbd pool init -p {pool-name}`

```sh
# 将新建的存储池初始化为rdb可用的存储池
# rbd pool init -p rbd-kubernetes
```



## 创建 image

- rbd存储池并不能直接用于块设备，而是需要事先在其中按需创建映像（image），并把映像文件作为块设备使用
  - 每一个image就是一个块设备，存储池中的各image名称需要惟一

- `rbd create --size <megabytes> --pool <pool-name> <image-name>`

```sh
# 在rbd-kubernetes存储池中，创建一个名为myimg，大小为3GB的映像
# rbd create --pool rbd-kubernetes myimg --size 3G 

# 此方式同样可以
# rbd create --size 3G rbd-kubernetes/myimg
```

### 验证 image

```sh
# 列出指定存储池中的image
# rbd ls -p rbd-kubernetes --long
NAME   SIZE PARENT FMT PROT LOCK 
myimg 3 GiB          2  


# 获取指定image的详细信息
# rbd info rbd-kubernetes/myimg
rbd image 'myimg':
	size 3 GiB in 768 objects # image空间大小为M，共分割至N个对象（分割的数量由条带大小决定）；768*4/1024=3，将3G的空间划分为768个对象，每个对象默认大小4M
	order 22 (4 MiB objects) # 块大小（条带）的标识序号，有效范围为12-25，分别对应着4K-32M之间的大小；默认每个对象大小为4M
	id: 6eebf6b8b4567 # 当前image的标识符
	block_name_prefix: rbd_data.6eebf6b8b4567 # 当前image相关的object的名称前缀
	format: 2 # image的格式，其中的“2”表示“v2”
	features: layering, exclusive-lock, object-map, fast-diff, deep-flatten # 当前image启用的功能特性，其值是一个以逗号分隔的字符串列表，例如layering, exclusive-lock等；
	op_features: # 可选的功能特性
	flags: 
	create_timestamp: Sat Dec  3 17:23:16 2022
```











# image 管理相关命令

## 创建 image

- rbd存储池并不能直接用于块设备，而是需要事先在其中按需创建映像（image），并把映像文件作为块设备使用
  - 每一个image就是一个块设备，存储池中的各image名称需要惟一

- `rbd create --size <megabytes> --pool <pool-name> <image-name>`

```sh
# 在rbd-kubernetes存储池中，创建一个名为myimg，大小为3GB的映像
# rbd create --pool rbd-kubernetes myimg --size 3G 

# 此方式同样可以
# rbd create --size 3G rbd-kubernetes/myimg
```

## 列出存储池中的image

- `rbd ls` 命令能够列出指定存储池中的image

- `rbd ls [-p <pool-name>] [--long] [--format json|xml] [--pretty-format] <pool-name>`

```sh
# rbd ls -p rbd-kubernetes -l
NAME   SIZE PARENT FMT PROT LOCK 
myimg 3 GiB          2 


# rbd ls -p rbd-kubernetes --long
NAME   SIZE PARENT FMT PROT LOCK 
myimg 3 GiB          2  


# rbd ls -p rbd-kubernetes -l --format json --pretty-format
[
    {
        "image": "myimg",
        "size": 3221225472,
        "format": 2
    }
]
```

## 获取指定image的详细信息

- `rbd info`命令可以获取指定image的详细信息

- `rbd info [--pool <pool>] [--image <image>] [--image-id <image-id>] [--format <format>] [--pretty-format] <image-spec>`

```sh
# 简便语法
# rbd info rbd-kubernetes/myimg
rbd image 'myimg':
	size 3 GiB in 768 objects # image空间大小为M，共分割至N个对象（分割的数量由条带大小决定）；768*4/1024=3，将3G的空间划分为768个对象，每个对象默认大小4M
	order 22 (4 MiB objects) # 块大小（条带）的标识序号，有效范围为12-25，分别对应着4K-32M之间的大小；默认每个对象大小为4M
	id: 6eebf6b8b4567 # 当前image的标识符
	block_name_prefix: rbd_data.6eebf6b8b4567 # 当前image相关的object的名称前缀
	format: 2 # image的格式，其中的“2”表示“v2”
	features: layering, exclusive-lock, object-map, fast-diff, deep-flatten # 当前image启用的功能特性，其值是一个以逗号分隔的字符串列表，例如layering, exclusive-lock等；
	op_features: # 可选的功能特性
	flags: 
	create_timestamp: Sat Dec  3 17:23:16 2022


# 正常语法
# rbd info --image myimg --pool rbd-kubernetes
rbd image 'myimg':
	size 3 GiB in 768 objects
	order 22 (4 MiB objects)
	id: 6eebf6b8b4567
	block_name_prefix: rbd_data.6eebf6b8b4567
	format: 2
	features: layering, exclusive-lock, object-map, fast-diff, deep-flatten
	op_features: 
	flags: 
	create_timestamp: Sat Dec  3 17:23:16 2022
```



## image 特性管理

### image 支持的特性

- J版本起，image默认支持的特性有layering、exclusive-lock、object-map、fast-diff和 deep-flatten五个；
- **条带化：**条带化技术就是一种自动的**将 I/O 的负载均衡到多个物理磁盘上**的技术，条带化技术就是将一块连续的数据分成很多小部分并把他们分别存储到不同磁盘上去

```sh
layering # 是否支持克隆；

striping # 是否支持数据对象间的数据条带化；

exclusive-lock # 是否支持分布式排他锁机制，以限制同时仅能有一个客户端访问当前image；

object-map # 是否支持object位图，主要用于加速导入、导出及已用容量统计等操作，依赖于exclusive-lock特性；

fast-diff # 是否支持快照间的快速比较操作，依赖于object-map特性；

deep-flatten # 是否支持克隆分离时解除在克隆image时创建的快照与其父image之间的关联关系；

journaling # 是否支持日志IO，即是否支持记录image的修改操作至日志对象；依赖于exclusive-lock特性；

data-pool # 是否支持将image的数据对象存储于纠删码存储池，主要用于将image的元数据与数据放置于不同的存储池；
```

### 自定义特性

- `rbd create` 命令的 `--feature` 选项支持创建时自定义支持的特性；
- 现有 image 的特性可以使用 `rbd feature enable` 或 `rbd feature disable` 命令修改

#### 范例

```sh
# 禁用image的、object-map、fast-diff、deep-flatten特性
# rbd feature disable rbd-kubernetes/myimg object-map fast-diff deep-flatten
```



## 调整 image 的大小

- `rbd resize [--pool <pool>] [--image <image>] --size <size> [--allow-shrink] [--no-progress] <image-spec>`

### 增大

- `rbd resize [--pool <pool>] [--image <image>] --size <size>`

### 减少

- `rbd resize [--pool <pool>] [--image <image>] --size <size> [--allow-shrink]`



## 删除 image

- `rbd remove [--pool <pool>] [--image <image>] [--no-progress] <image-spec>`
  - 注意：删除image会导致数据丢失，且不可恢复；建议使用trash命令先将其移入trash，确定不再需要时再从trash中删除；
  - `rbd trash {list|move|purge|remove|restore}`



## 客户端 image 映射及断开

- 在RBD客户端节点上以本地磁盘方式使用块设备之前，需要先将目标image映射至本地内核，而且，若存储集群端启用了CephX认证，还需要指定用户名和keyring文件
- **注意：节点重启后，使用rbd命令建立的image映射会丢失**
- `rbd map [--pool <pool>] [--image <image>] [--id <user-name>][--keyring ]`

### 查看已经映射的image

- `rbd showmapped`

### 断开

- `rbd unmap [--pool <pool>] [--image <image>] <image-or-device-spec>`



# image 快照管理相关命令

https://docs.ceph.com/en/quincy/rbd/rbd-snapshot/

- Ceph 完全支持快照,它是一个基于时间点的、**只读的** RBD 镜像副本。 可以通过创建快照并恢复其原始数据,保存 Ceph RBD 镜像的状态。 
- RBD支持image快照技术
- 快照可以保留image的状态历史
- Ceph还支持快照“分层”机制，从而可实现快速克隆VM映像；
- rbd命令及许多高级接口（包括QEMU、libvirt、OpenStack等）都支持设备快照

## 创建快照

- `rbd snap create [--pool <pool>] --image <image> --snap <snap>`
- 或者 `rbd snap create [<pool-name>/]<image-name>@<snapshot-name>`
- **注意：在创建映像快照之前应停止image上的IO操作，且image上存在文件系统时，还要确保其处于一致状态；**

## 列出快照

- `rbd snap ls [--pool <pool>] --image <image> [--format <format>] [--pretty-format] [--all]`

## 回滚快照

- `rbd snap rollback [--pool <pool>] --image <image> --snap <snap> [--no-progress]`
- **注意：将映像回滚到快照意味着会使用快照中的数据重写当前版本的image，而且执行回滚所需的时间将随映像大小的增加而延长**

## 限制快照数量

- 快照数量过多，必然会导致image上的原有数据第一次修改时的IO压力恶化
- `rbd snap limit set [--pool <pool>] [--image <image>] [--limit <limit>]`

## 解除限制快照数量

- `rbd snap limit clear [--pool <pool>] [--image <image>]`

## 删除快照

- `rbd snap rm [--pool <pool>] [--image <image>] [--snap <snap>] [--no-progress] [--force]`
- 提示：Ceph OSD会以异步方式删除数据，因此删除快照并不能立即释放磁盘空间;

### 范例

```sh
# rbd ls -p rbd-kubernetes -l
NAME                    SIZE PARENT FMT PROT LOCK 
myimg                  8 GiB          2      excl 
myimg@myimg-snapshot01 8 GiB          2           


# rbd snap rm  rbd-kubernetes/myimg@myimg-snapshot01
Removing snap: 100% complete...done.


# rbd ls -p rbd-kubernetes -l
NAME   SIZE PARENT FMT PROT LOCK 
myimg 8 GiB          2      excl 
```



## 清理快照

- 删除一个image的所有快照，可以使用rbd snap purge命令
- `rbd snap purge [--pool <pool>] --image <image> [--no-progress]`

## 快照分层

- Ceph支持在一个块设备快照的基础上创建一到多个COW或COR（Copy-On-Read）类型的克隆，这种中间快照层（snapshot layering）机制提了一种极速创建image的方式
  - 用户可以创建一个基础image并为其创建一个只读快照层，而后可以在此快照层上创建任意个克隆进行读写操作，甚至能够进行多级克隆
  - 例如，实践中可以为Qemu虚拟机创建一个image并安装好基础操作系统环境作为模板，对其创建创建快照层后，便可按需创建任意多个克隆作为image提供给多个不同的VM（虚拟机）使用，或者每创建一个克隆后进行按需修改，而后对其再次创建下游的克隆
    - 类似于docker基础镜像及其子镜像
- 通过克隆生成的image在其功能上与直接创建的image几乎完全相同，它同样支持读、写、克隆、空间扩缩容等功能，惟一的不同之处是克隆引用了一个只读的上游快照，而且**此快照必须要置于“保护”模式之下**
- 支持COW和COR两种类型
  - COW是为默认的类型，仅在数据首次写入时才需要将它复制到克隆的image中
  - COR则是在数据首次被读取时复制到当前克隆中，随后的读写操作都将直接基于此克隆中的对象进行

**使用分层快照：**

- 在RBD上使用分层克隆的方法非常简单：创建一个image，对image创建一个快照 并将其置入保护模式，而克隆此快照即可 
- 创建克隆的image时，需要指定引用的存储池、镜像和镜像快照，以及克隆的目标 image的存储池和镜像名称，因此，克隆镜像支持跨存储池进行

### 保护上游的原始快照

- 下游image需要引用上游快照中的数据，快照的意外删除必将导致数据服务的中止，因此在克隆操作之外，必须将上游的快照置于保护模式
- `rbd snap protect [--pool <pool>] --image <image> --snap <snap>`

### 克隆image的快照

- `rbd clone [--pool <pool>] --image <image> --snap <snap> --dest-pool <dest-pool> [--dest <dest>`
- 或者：`rbd clone [<pool-name>/]<image-name>@<snapshot-name> [<pool- name>/]<image-name>`

### 列出快照的子项

- `rbd children [--pool <pool>] --image <image> --snap <snap>`

### 展平克隆的image

- 克隆的映像会保留对父快照的引用，删除子克隆对父快照的引用时，可通过将信息从快照复制到克隆，进行image的“展平”操作
- 展平克隆所需的时间随着映像大小的增加而延长
- 要删除某拥有克隆子项的快照，必须先平展其子image
- 命令：`rbd flatten [--pool <pool>] --image <image> --no-progress`

### 取消快照保护

- 必须先取消保护快照，然后才能删除它
- 用户无法删除克隆所引用的快照，需要先平展其每个克隆，然后才能删除快照
- 命令：`rbd snap unprotect [--pool <pool>] --image <image> --snap <snap>`



# ---



# 使用 RBD

- 假设已创建完所需的RBD

## 宿主机

- 在宿主机直接使用 RBD，下面以Centos8举例；
- **注意：**
  - 宿主机最好与ceph主机的版本一致，以避免安装的命令兼容性出现问题；
  - 权限方面最好创建ceph账号，而后为ceph.conf等相关文件添加ACL权限，最后使用ceph账号进行管理。

### ceph rbd 节点

#### 禁用image部分特性

- Linux作为磁盘使用时要禁用image的、object-map、fast-diff、deep-flatten特性，否则会内核不支持而导致无法使用；

```sh
# 禁用image的、object-map、fast-diff、deep-flatten特性
# rbd feature disable rbd-kubernetes/myimg object-map fast-diff deep-flatten
```



#### 准备 keyring

```sh
# 创建用户、生成密钥，并添加所有指定的能力
# ceph auth add client.kube mon 'allow r' osd 'allow * pool=rbd-kubernetes' 
added key for client.kube


# 验证
# ceph auth get client.kube
exported keyring for client.kube
[client.kube]
	key = AQCwQ4xjujXTGRAAOkHzbKx9X6udDyZVMJZrog==
	caps mon = "allow r"
	caps osd = "allow * pool=rbd-kubernetes"

# 创建keyring文件
# ceph-authtool --create-keyring ceph.client.kube.keyring


# 将用户导出到keyring文件
# ceph auth get client.kube -o ceph.client.kube.keyring


# 发送给宿主机节点
# scp ceph.client.kube.keyring  10.0.0.8:/etc/ceph/


# 在宿主机节点验证修改keyring文件权限
# chmod 600 /etc/ceph/ceph.client.kube.keyring
# ll /etc/ceph/ceph.client.kube.keyring
-rw------- 1 root root 1806 Dec  4 15:03 /etc/ceph/ceph.client.kube.keyring
```





### 宿主机节点

- 在需要使用RBD的Linux宿主机上进行以下操作

#### 先决条件

- 客户端需要 ceph 内核模块，通过此模块客户端可以连接到 ceph，检索出相应的image镜像

```sh
# modinfo ceph
filename:       /lib/modules/4.18.0-240.el8.x86_64/kernel/fs/ceph/ceph.ko.xz
license:        GPL
...
```

#### 安装ceph仓库

- 还需要安装epel源

```sh
# vim /etc/yum.repos.d/ceph.repo
[Ceph]
name=Ceph packages for $basearch
baseurl=https://mirrors.aliyun.com/ceph/rpm-nautilus/el8/$basearch
enabled=1
gpgcheck=0
type=rpm-md

[Ceph-noarch]
name=Ceph noarch packages
baseurl=https://mirrors.aliyun.com/ceph/rpm-nautilus/el8/noarch
enabled=1
gpgcheck=0
type=rpm-md

[ceph-source]
name=Ceph source packages
baseurl=https://mirrors.aliyun.com/ceph/rpm-nautilus/el8/SRPMS
enabled=1
gpgcheck=0
type=rpm-md
```

#### 安装ceph相关工具包

- `yum -y install ceph-common`

#### 准备 ceph.conf

```sh
# vim /etc/ceph/ceph.conf
[global]
fsid = 23af67b8-235b-48f2-8dfe-8b52370a7419
public_network = 172.18.0.0/16
cluster_network = 10.0.0.0/24
mon_initial_members = stor01, stor02, stor03
mon_host = 172.18.0.7,172.18.0.17,172.18.0.27
auth_cluster_required = cephx
auth_service_required = cephx
auth_client_required = cephx
```

#### 测试 keyring

```sh
# 在宿主机节点验证keyring(注意DNS能解析到ceph节点)
# 注意：宿主机如果不能到达mon对应的网段还需添加相应的路由，例如：route add -net 172.18.0.0/16 dev eth0
# ceph --user kube -s
  cluster:
    id:     23af67b8-235b-48f2-8dfe-8b52370a7419
    health: HEALTH_OK
 
  services:
    mon: 3 daemons, quorum stor01,stor02,stor03
    mgr: stor01(active), standbys: stor02
    mds: cephfs-1/1/1 up  {0=stor01=up:active}
    osd: 3 osds: 3 up, 3 in
    rgw: 1 daemon active
 
  data:
    pools:   8 pools, 240 pgs
    objects: 246  objects, 3.6 KiB
    usage:   3.1 GiB used, 597 GiB / 600 GiB avail
    pgs:     240 active+clean

# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.2        0.0.0.0         UG    101    0        0 eth1
0.0.0.0         10.0.0.2        0.0.0.0         UG    102    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     101    0        0 eth1
10.0.0.0        0.0.0.0         255.255.0.0     U     102    0        0 eth0
172.18.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0
```

#### 映射为块设备

- 将远程rbd image 映射到本地

```sh
# 映射
# rbd --user kube map rbd-kubernetes/myimg
/dev/rbd0


# 查看已经映射的image
# rbd showmapped
id pool           namespace image snap device    
0  rbd-kubernetes           myimg -    /dev/rbd0 


# 其他验证方式
# fdisk -l
...
Disk /dev/rbd0: 3 GiB, 3221225472 bytes, 6291456 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 65536 bytes / 65536 bytes
# lsblk 
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
...
rbd0   253:0    0    3G  0 disk 
```

### 验证

```
# ceph管理端
```



#### 客户端挂载测试

```sh
# mkfs.xfs /dev/rbd0 
...
Discarding blocks...Done.


# mount /dev/rbd0 /mnt/


# cp /etc/issue /mnt/
[root@8 ~]# ll /mnt/
total 4
-rw-r--r-- 1 root root 23 Dec  4 22:37 issue


# mount
...
/dev/rbd0 on /mnt type xfs (rw,relatime,attr2,inode64,logbufs=8,logbsize=64k,sunit=128,swidth=128,noquota)
```



### 客户端卸载映射

```sh
# 需先卸载客户端本地挂载的磁盘
# umount /mnt


# 卸载映射，或者执行： rbd --user kube unmap /dev/rbd0
# rbd --user kube unmap rbd-kubernetes/myimg


# 查看映射是否卸载
# rbd showmapped
   # 空的
```



### ---

### 扩容rbd

#### 目前rbd使用情况

```sh
# rbd showmapped
id pool           namespace image snap device    
0  rbd-kubernetes           myimg -    /dev/rbd0 
# df -h /dev/rbd0 
Filesystem      Size  Used Avail Use% Mounted on
/dev/rbd0       3.0G   54M  3.0G   2% /mnt
```

#### rbd管理端

```sh
# 在ceph管理端将image扩展为8G
# rbd ls -p rbd-kubernetes -l
NAME   SIZE PARENT FMT PROT LOCK 
myimg 3 GiB          2      excl 
# rbd resize -s 8G rbd-kubernetes/myimg
Resizing image: 100% complete...done.
# rbd ls -p rbd-kubernetes -l
NAME   SIZE PARENT FMT PROT LOCK 
myimg 8 GiB          2
```

#### 宿主机

- 以宿主机使用的是xfs文件系统举例：

```sh
# 只需执行此命令，检查新的容量是否已经被内核接受（此命令是核心命令）
# xfs_growfs -d /mnt/
...


# 验证
# df /dev/rbd0 -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/rbd0       8.0G   91M  8.0G   2% /mnt
```





## KVM

- KVM 使用 rbd image；
- KVM 是通过RBD协议，进而连接到ceph之上来获取到rbd中的image

## docker

- docker使用rbd image

## Kubernetes

- 以keyring方式接入Ceph，为Pod提供存储卷
- 以secret方式接入Ceph，为Pod提供存储卷
- 基于StorageClass，为PVC提供动态PV供给机制







# image 快照使用范例

## 实现基础的快照创建与还原

### 客户端当前状态

```sh
# rbd showmapped
id pool           namespace image snap device    
0  rbd-kubernetes           myimg -    /dev/rbd0 


# df /dev/rbd0  -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/rbd0       8.0G   91M  8.0G   2% /mnt


# ls /mnt/
issue  passwd
```

### ceph管理端拍摄快照

- **注意：在创建映像快照之前应停止image上的IO操作，且image上存在文件系统时，还要确保其处于一致状态；**

```sh
# 创建快照，
# rbd snap create rbd-kubernetes/myimg@myimg-snapshot01


# 列出快照
# rbd snap ls rbd-kubernetes/myimg
SNAPID NAME              SIZE TIMESTAMP                
     4 myimg-snapshot01 8 GiB Mon Dec  5 00:27:22 2022 
```

### 客户端删除文件

```sh
# ls /mnt/
issue  passwd

# rm -f /mnt/passwd 

# ls /mnt/
issue
```

### 恢复快照

- **注意：恢复快照时要取消客户端的挂载，并且最好取消客户端与远程rbd的映像连接**

```sh
# 取消客户端的挂载
# umount /mnt


# 取消客户端与远程rbd的映像连接
# rbd --user kube unmap /dev/rbd0


# 恢复快照
# rbd snap rollback rbd-kubernetes/myimg@myimg-snapshot01
Rolling back to snapshot: 100% complete...done.


# 客户端与远程rbd的映像连接
# rbd --user kube map rbd-kubernetes/myimg
/dev/rbd0


# 客户端挂载
# mount /dev/rbd0 /mnt/
# df -h /dev/rbd0
Filesystem      Size  Used Avail Use% Mounted on
/dev/rbd0       8.0G   91M  8.0G   2% /mnt


# 验证
# ls /mnt/
issue  passwd
```



## 实现分层快照

- 大体流程：创建基础image，向基础image中添加所需的基础数据，拍摄基础image的快照，将基础image的快照设为保护模式，基于基础image的快照clone，展平clone后的快照。
- **注意：克隆快照后要展平clone的image，否则原卷或原始快照被删除后，克隆的快照内的数据将丢失**

### 准备基础image

- **ceph 管理端创建存储池、映像、相关管理账号**

```sh
# ceph osd pool create os-base 32 32
pool 'os-base' created

# ceph osd pool application enable os-base rbd
enabled application 'rbd' on pool 'os-base'

# rbd pool init -p os-base

# rbd create --size 3G os-base/ubuntu2004

# rbd ls -p os-base -l
NAME        SIZE PARENT FMT PROT LOCK 
ubuntu2004 3 GiB          2        

# rbd feature disable os-base/ubuntu2004 object-map fast-diff deep-flatten

# rbd info os-base/ubuntu2004
rbd image 'ubuntu2004':
	size 3 GiB in 768 objects
	order 22 (4 MiB objects)
	id: fc7cb6b8b4567
	block_name_prefix: rbd_data.fc7cb6b8b4567
	format: 2
	features: layering, exclusive-lock
	op_features: 
	flags: 
	create_timestamp: Tue Dec  6 19:43:08 2022


# 创建用户、生成密钥，并添加所有指定的能力
# ceph auth add client.vm mon 'allow r' osd 'allow * pool=os-base' 
added key for client.vm


# 验证
# ceph auth get client.vm
exported keyring for client.vm
[client.vm]
	key = AQAfLY9jNSROLRAAHKIgF3xe+AZ+E3KZgCqb9g==
	caps mon = "allow r"
	caps osd = "allow * pool=os-base"


# 创建keyring文件
# ceph-authtool --create-keyring ceph.client.vm.keyring
creating ceph.client.vm.keyring


# 将用户导出到keyring文件
# ceph auth get client.vm -o ceph.client.vm.keyring
exported keyring for client.vm


# 发送给宿主机节点
# scp ceph.client.vm.keyring  10.0.0.8:/etc/ceph/


# 在宿主机节点验证修改keyring文件权限
# chmod 600 /etc/ceph/ceph.client.vm.keyring
# ll /etc/ceph/ceph.client.vm.keyring
-rw------- 1 root root 117 Dec  6 20:00 /etc/ceph/ceph.client.vm.keyring


# 宿主机测试keyring文件
# ceph --user vm -s
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
    pools:   7 pools, 192 pgs
    objects: 245  objects, 3.4 KiB
    usage:   3.1 GiB used, 597 GiB / 600 GiB avail
    pgs:     192 active+clean
```

- **客户端准备数据**


```sh
# 映射
# rbd --user vm map os-base/ubuntu2004
/dev/rbd0


# 查看已经映射的image
# rbd showmapped
id pool    namespace image      snap device    
0  os-base           ubuntu2004 -    /dev/rbd0 
# lsblk  /dev/rbd0
NAME MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
rbd0 253:0    0   3G  0 disk 


# mkfs.xfs /dev/rbd0 
...
Discarding blocks...Done.


# mount /dev/rbd0 /mnt/


# 假设此为完整优化过的Ubuntu2004基础系统
# cp /etc/issue /mnt/ubuntu2004.file
# ll /mnt/ubuntu2004.file
-rw-r--r-- 1 root root 23 Dec  6 20:12 /mnt/ubuntu2004.file



# mount
...
/dev/rbd0 on /mnt type xfs (rw,relatime,attr2,inode64,logbufs=8,logbsize=64k,sunit=128,swidth=128,noquota)
```

### 拍摄快照

```sh
# 客户端取消挂载并断开映射
# umount /dev/rbd0 
# rbd --user vm unmap os-base/ubuntu2004


# ceph管理端拍摄快照
# rbd snap create os-base/ubuntu2004@ubuntu2004-base-snapshot
# rbd ls -p os-base -l
NAME                                 SIZE PARENT FMT PROT LOCK 
ubuntu2004                          3 GiB          2           
ubuntu2004@ubuntu2004-base-snapshot 3 GiB          2           
# rbd snap ls os-base/ubuntu2004
SNAPID NAME                      SIZE TIMESTAMP                
     4 ubuntu2004-base-snapshot 3 GiB Tue Dec  6 21:30:21 2022 
```

### 保护上游的原始快照

- 下游image需要引用上游快照中的数据，快照的意外删除必将导致数据服务的中止，因此在克隆操作之外，必须将上游的快照置于保护模式
- **如何将其设为readonly？，还是默认已为readonly？**
- `rbd snap protect [--pool <pool>] --image <image> --snap <snap>`

```sh
# ceph管理端将快照置于保护模式
# rbd snap protect os-base/ubuntu2004@ubuntu2004-base-snapshot


# PROT为yes则表示其处于保护模式
# rbd ls -p os-base -l
NAME                                 SIZE PARENT FMT PROT LOCK 
ubuntu2004                          3 GiB          2           
ubuntu2004@ubuntu2004-base-snapshot 3 GiB          2 yes   
```

### 克隆image的快照

- 在当前映像快照的基础上进行克隆，克隆的快照会保留原有快照的数据，而新增加的数据会独立出一段分支进行增长；
- `rbd clone [<pool-name>/]<image-name>@<snapshot-name> [<pool- name>/]<image-name>`
  - 克隆的目标可以跨存储池


```sh
# rbd clone os-base/ubuntu2004@ubuntu2004-base-snapshot os-base/ubuntu2004-use01

# 可以看到ubuntu2004-use01映像依赖于os-base/ubuntu2004@ubuntu2004-base-snapshot这个父快照，如果这时父快照、源image、源存储池被删除后，克隆的image中的数据将会丢失
# rbd ls -p os-base -l
NAME                                 SIZE PARENT                                      FMT PROT LOCK 
ubuntu2004                          3 GiB                                               2           
ubuntu2004@ubuntu2004-base-snapshot 3 GiB                                               2 yes       
ubuntu2004-use01                    3 GiB os-base/ubuntu2004@ubuntu2004-base-snapshot   2           
```

### 展平克隆的image

- 展平克隆的image可以与父快照分离开来，以避免父快照、源image、源存储池被删除后 克隆的image中的数据不会随之丢失
- `rbd flatten [--pool <pool>] --image <image> --no-progress`

```sh
# rbd flatten os-base/ubuntu2004-use01 --no-progress

# 可以看到ubuntu2004-use01映像已独立出来，不再依赖任何PARENT
# rbd ls -p os-base -l
NAME                                 SIZE PARENT FMT PROT LOCK 
ubuntu2004                          3 GiB          2           
ubuntu2004@ubuntu2004-base-snapshot 3 GiB          2 yes       
ubuntu2004-use01                    3 GiB          2      
```

### 验证

```sh
# rbd --user vm map os-base/ubuntu2004
/dev/rbd0
# rbd --user vm map os-base/ubuntu2004-use01
/dev/rbd1
# rbd showmapped
id pool    namespace image            snap device    
0  os-base           ubuntu2004       -    /dev/rbd0 
1  os-base           ubuntu2004-use01 -    /dev/rbd1 
# lsblk 
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
... 
rbd0   253:0    0    3G  0 disk 
rbd1   253:16   0    3G  0 disk 
# mkdir /m{1..2}

# 两者在同一主机上只能单独挂载
# mount /dev/rbd0 /m1/
# mount /dev/rbd1 /m2/
mount: /m2: wrong fs type, bad option, bad superblock on /dev/rbd1, missing codepage or helper program, or other error.


# 分层的快照展平后就相当于一个独立的image了，并且此前的父快照、源image、源存储池(与其不在一个存储池)被删除后 克隆的image中的数据不会随之丢失
# mount /dev/rbd0 /m1/
# cp /etc/passwd /m1/
# ls /m1/
passwd  ubuntu2004.file

# mount /dev/rbd1 /m2/
[root@8 ~]# ls /m2/
ubuntu2004.file
```



## 其他快照用法

- 还可以创建一个单独的存储池 其中存放各种系统的镜像(模板池)，然后可以克隆做好的系统镜像到其他的存储池，最后虚拟机等应用可以使用这个克隆的系统镜像进行启动。
