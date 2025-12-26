---
title: "Docker"
weight: 11
---

# 参考文档

- [Docker 容器运行时runtime- (apispace.com)](https://www.apispace.com/news/post/20973.html)



# OCI

https://github.com/opencontainers

- Open Container Initiative，围绕容器技术创建开放标准





# Namespace

- namespace 是 Linux 系统的底层概念，在内核层实现，即有一些不同类型的名称空间部署在内核内；
- 名称空间可以实现宿主机与容器间的资源隔离；
- 可以隔离的资源有磁盘挂载点、文件系统、进程、主机名、网络、用户等。

| 隔离类型                                    | 功能                                                   | 系统调用参数  | 起始内核版本 |
| ------------------------------------------- | ------------------------------------------------------ | ------------- | ------------ |
| MNT NameSpace (mount)                       | 提供磁盘挂载点和文件系统的隔离能力                     | CLONE_NEWNS   | 2.4.19       |
| IPC NameSpace (Inter-Process Communication) | 提供进程通信的隔离能力，包括信号量、消息队列、共享内存 | CLONE_NEWIPC  | 2.6.19       |
| UTS NameSpace (UNIX Timesharing system)     | 提供内核，主机名和域名隔离能力                         | CLONE_NEWUTS  | 2.6.19       |
| PID NameSpace (Process Identification)      | 提供进程隔离能力                                       | CLONE_NEWPID  | 2.6.24       |
| NET NameSpace（network）                    | 提供网络隔离能力，包括网络设备、网络栈、端口等         | CLONE_NEWNET  | 2.6.29       |
| User NameSpace（user）                      | 提供用户隔离能力，包括用户和组                         | CLONE_NEWUSER | 3.8          |

## MNT NameSpace

- 宿主机使用了 chroot 技术把容器锁定到一个指定的运行目录中，从而禁止容器访问宿主机的资源。

## IPC NameSpace

- 允许一个容器内的不同进程的(内存、缓存等)数据访问，但是不能跨容器直接访问其他容器的数据

## UTS NameSpace

- UNIX Timesharing System，UNIX分时系统，包含了运行内核的名称、版本、底层体系结构类型等信息；
- 用于系统标识，其中包含了主机名 hostname 和域名 domainname，它使得一个容器拥有属于自己的主机名标识，这个主机名标识独立于宿主机系统和其他的容器。





# Control Groups

- **Cgroup 是一个 Linux 内核特性，它可以实现对一组进程的资源使用（CPU、内存、磁盘 I/O 和网络等）进行限制、审计和隔离。**

- Cgroups 最主要的作用，就是限制一个进程组能够使用的资源上线，包括CPU、内存、磁盘、网络带宽等等。此外，还能够对进程进行优先级设置，资源的计量以及资源的控制（如：将进程挂起和恢复等操作）

## 验证系统 cgroups

- cgroups在内核层中默认已经开启，内核版本越新支持的功能越多

### CentOs 8.3 cgroups：

```bash
[root@docker ~]# cat /etc/centos-release
CentOS Linux release 8.3.2011
[root@docker ~]# grep CGROUP /boot/config-4.18.0-240.el8.x86_64 
CONFIG_CGROUPS=y
CONFIG_BLK_CGROUP=y
CONFIG_CGROUP_WRITEBACK=y
CONFIG_CGROUP_SCHED=y
CONFIG_CGROUP_PIDS=y
CONFIG_CGROUP_RDMA=y
CONFIG_CGROUP_FREEZER=y
CONFIG_CGROUP_HUGETLB=y
CONFIG_CGROUP_DEVICE=y
CONFIG_CGROUP_CPUACCT=y
CONFIG_CGROUP_PERF=y
CONFIG_CGROUP_BPF=y
# CONFIG_CGROUP_DEBUG is not set
CONFIG_SOCK_CGROUP_DATA=y
CONFIG_BLK_CGROUP_IOLATENCY=y
# CONFIG_BLK_CGROUP_IOCOST is not set
# CONFIG_BFQ_CGROUP_DEBUG is not set
CONFIG_NETFILTER_XT_MATCH_CGROUP=m
CONFIG_NET_CLS_CGROUP=y
CONFIG_CGROUP_NET_PRIO=y
CONFIG_CGROUP_NET_CLASSID=y
```

### CentOS 7.6 cgroups：

```bash
[root@localhost ~]#cat /etc/centos-release
CentOS Linux release 7.6.1810 (Core)

[root@localhost ~]#grep CGROUP /boot/config-3.10.0-957.el7.x86_64 
CONFIG_CGROUPS=y
# CONFIG_CGROUP_DEBUG is not set
CONFIG_CGROUP_FREEZER=y
CONFIG_CGROUP_PIDS=y
CONFIG_CGROUP_DEVICE=y
CONFIG_CGROUP_CPUACCT=y
CONFIG_CGROUP_HUGETLB=y
CONFIG_CGROUP_PERF=y
CONFIG_CGROUP_SCHED=y
CONFIG_BLK_CGROUP=y
# CONFIG_DEBUG_BLK_CGROUP is not set
CONFIG_NETFILTER_XT_MATCH_CGROUP=m
CONFIG_NET_CLS_CGROUP=y
CONFIG_NETPRIO_CGROUP=y
```

### Ubuntu 20.04 cgroups：

```bash
root@ubuntu:~# lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 20.04.1 LTS
Release:	20.04
Codename:	focal
root@ubuntu:~# cat /etc/issue
Ubuntu 20.04.1 LTS \n \l

root@ubuntu:~# grep CGROUP /boot/config-5.4.0-42-generic 
CONFIG_CGROUPS=y
CONFIG_BLK_CGROUP=y
CONFIG_CGROUP_WRITEBACK=y
CONFIG_CGROUP_SCHED=y
CONFIG_CGROUP_PIDS=y
CONFIG_CGROUP_RDMA=y
CONFIG_CGROUP_FREEZER=y
CONFIG_CGROUP_HUGETLB=y
CONFIG_CGROUP_DEVICE=y
CONFIG_CGROUP_CPUACCT=y
CONFIG_CGROUP_PERF=y
CONFIG_CGROUP_BPF=y
# CONFIG_CGROUP_DEBUG is not set
CONFIG_SOCK_CGROUP_DATA=y
# CONFIG_BLK_CGROUP_IOLATENCY is not set
CONFIG_BLK_CGROUP_IOCOST=y
# CONFIG_BFQ_CGROUP_DEBUG is not set
CONFIG_NETFILTER_XT_MATCH_CGROUP=m
CONFIG_NET_CLS_CGROUP=m
CONFIG_CGROUP_NET_PRIO=y
CONFIG_CGROUP_NET_CLASSID=y
```

### cgroups 中内存模块：

```bash
root@ubuntu:~# grep MEMCG /boot/config-5.4.0-42-generic
CONFIG_MEMCG=y
CONFIG_MEMCG_SWAP=y
# CONFIG_MEMCG_SWAP_ENABLED is not set
CONFIG_MEMCG_KMEM=y
CONFIG_SLUB_MEMCG_SYSFS_ON=y
```



## cgroups 具体实现

- blkio：块设备IO限制
- cpu：使用调度程序为 cgroup 任务提供 cpu 的访问
- cpuacct：产生 cgroup 任务的 cpu 资源报告
- cpuset：如果是多核心的 cpu ，这个子系统会为 cgroup 任务分配单独的 cpu 和内存
- devices：允许或拒绝 cgroup 任务对设备的访问
- freezer：暂停和恢复 cgroup 任务
- memory：设置每个 cgroup 的内存限制以及产生内存资源报告
- net_cls：标记每个网络包以供 cgroup 方便使用
- ns：命名空间子系统
- perf_event：增加了对每 group 的监测跟踪的能力，可以监测属于某个特定的 group 的所有线程以及运行在特定CPU上的线程

## 查看系统 cgroups

```bash
# ll /sys/fs/cgroup/
total 0
drwxr-xr-x 15 root root 380 Dec 12 22:02 ./
drwxr-xr-x 11 root root   0 Dec 12 22:02 ../
dr-xr-xr-x  6 root root   0 Dec 12 22:02 blkio/
lrwxrwxrwx  1 root root  11 Dec 12 22:02 cpu -> cpu,cpuacct/
lrwxrwxrwx  1 root root  11 Dec 12 22:02 cpuacct -> cpu,cpuacct/
dr-xr-xr-x  6 root root   0 Dec 12 22:02 cpu,cpuacct/
dr-xr-xr-x  3 root root   0 Dec 12 22:02 cpuset/
dr-xr-xr-x  6 root root   0 Dec 12 22:02 devices/
dr-xr-xr-x  4 root root   0 Dec 12 22:02 freezer/
dr-xr-xr-x  3 root root   0 Dec 12 22:02 hugetlb/
dr-xr-xr-x  6 root root   0 Dec 12 22:02 memory/
lrwxrwxrwx  1 root root  16 Dec 12 22:02 net_cls -> net_cls,net_prio/
dr-xr-xr-x  3 root root   0 Dec 12 22:02 net_cls,net_prio/
lrwxrwxrwx  1 root root  16 Dec 12 22:02 net_prio -> net_cls,net_prio/
dr-xr-xr-x  3 root root   0 Dec 12 22:02 perf_event/
dr-xr-xr-x  6 root root   0 Dec 12 22:02 pids/
dr-xr-xr-x  2 root root   0 Dec 12 22:02 rdma/
dr-xr-xr-x  6 root root   0 Dec 12 22:02 systemd/
dr-xr-xr-x  5 root root   0 Dec 12 22:02 unified/
```

##  Cgroup Driver

- cgroupfs：
- systemd：新版k8s需修改为此Cgroup Driver



# 容器 Runtime

- Runtime 是真正运行容器的地方，而 docker 则是 Runtime 的一种。
- 为了运行不同的容器，Runtime 需要和操作系统内核紧密协作，以便为容器提供相应的运行环境。
- 如果大家用过 Java，可以这样来理解 runtime 与容器的关系：Java 程序就好比是容器，JVM 则好比是 runtime。JVM 为 Java 程序提供运行环境。同样的道理，容器只有在 runtime 中才能运行。

## 查看 docker 默认的 runtime

```sh
# docker info | grep runtime -i
 Runtimes: io.containerd.runc.v2 io.containerd.runtime.v1.linux runc
 Default Runtime: runc
```

## 容器 runtime 类型

- **lxc：**Linux 上老牌的容器 runtime。Docker 最初也是用 lxc 作为 runtime。
- **runc：**Docker 自己开发的容器 runtime，符合 oci 规范，也是现在 Docker 的默认 runtime。
- **rkt：**CoreOS 开发的容器 runtime，符合 oci 规范，因而能够运行 Docker 的容器。



# Docker Storage Driver

[About storage drivers | Docker Documentation](https://docs.docker.com/storage/storagedriver/)

[Docker storage drivers | Docker Documentation](https://docs.docker.com/storage/storagedriver/select-storage-driver/)

[使用覆盖 FS 存储驱动程序|码头工人文档 (docker.com)](https://docs.docker.com/storage/storagedriver/overlayfs-driver/)

- 容器使用了联合文件系统（Union File System，UnionFS），将多个目录，挂载成为一个虚拟目录。不同的目录在这个虚拟目录里面又可以拥有独立的权限（镜像层只读，容器层读写）。这个虚拟的目录加上宿主机的内核就模拟成了一个完整的操作系统，最终呈现给容器使用。 
  - Docker 使用的存储驱动都是联合文件系统类型的

**查看 Docker 默认的 Storage Driver：**

- 目前 Docker 默认的 Storage Driver 为 overlay2，通常无需额外修改。

```SH
# docker info | grep 'Storage Driver'
 Storage Driver: overlay2
```

## UnionFS 范例

- 下面以aufs文件系统举例，aufs 也是 UnionFS 的一种。

```sh
# 创建挂载目录和文件
# mkdir ./dir{1..2}
# echo 'here is dir1' > ./dir1/file1
# echo 'here is dir2' > ./dir2/file2


# 创建挂载点
# mkdir -p /data/overlay


# 使用aufs文件系统进行挂载，dir1为只读，dir2为读写
# mount -t aufs -o br=./dir1/=ro:./dir2/=rw none /data/overlay/


# 与正常挂载看起来无异
# ls -l /data/overlay/
total 8
-rw-r--r-- 1 root root 13 Dec 14 19:06 file1
-rw-r--r-- 1 root root 13 Dec 14 19:06 file2


# 但dir1为只读，dir2为读写，因为在挂载时分别对两个目录定义了不同的挂载选项
# echo newdata > /data/overlay/file1 
-bash: /data/overlay/file1: Read-only file system
# echo newdata > /data/overlay/file2
# cat /data/overlay/file2
newdata

# df -Th /data/overlay/
Filesystem     Type  Size  Used Avail Use% Mounted on
none           aufs   24G   14G  9.4G  59% /data/overlay
```



# docker info 输出说明

```yaml
# docker info
Client:
 Context:    default
 Debug Mode: false # client端是否开启debug
 Plugins:
  app: Docker App (Docker Inc., v0.9.1-beta3)
  buildx: Docker Buildx (Docker Inc., v0.9.1-docker)
  scan: Docker Scan (Docker Inc., v0.17.0)

Server:
 Containers: 1 # 当前主机运行容器的总数
  Running: 0 # 有几个容器是正在运行的
  Paused: 0 # 有几个容器是暂停的
  Stopped: 1 # 有几个容器是停止的
 Images: 1 # 当前服务端存在的镜像数
 Server Version: 20.10.21
 Storage Driver: overlay2 # 正在使用的存储驱动
  Backing Filesystem: extfs # 后端文件系统，即服务器磁盘的文件系统
  Supports d_type: true # 是否支持d_type
  Native Overlay Diff: true # 是否支持差异数据存储
  userxattr: false
 Logging Driver: json-file # 日志类型
 Cgroup Driver: cgroupfs # Cgroup类型
 Cgroup Version: 1
 Plugins:
  Volume: local
  Network: bridge host ipvlan macvlan null overlay # overlay跨主机通信
  Log: awslogs fluentd gcplogs gelf journald json-file local logentries splunk syslog
 Swarm: inactive # 是否支持swarm
 Runtimes: io.containerd.runc.v2 io.containerd.runtime.v1.linux runc # 已安装的容器运行时
 Default Runtime: runc # 默认使用的容器运行时
 Init Binary: docker-init # 初始化容器的守护进程，即pid为1的进程
 containerd version: 3df54a852345ae127d1fa3092b95168e4a88e2f8
 runc version: v1.0.3-0-gf46b6ba
 init version: de40ad0
 Security Options: # 安全选项
  apparmor # 安全模块
  seccomp # 安全计算模块
   Profile: default
 Kernel Version: 5.4.0-131-generic # 宿主机内核版本
 Operating System: Ubuntu 20.04.4 LTS # 宿主机系统版本
 OSType: linux # 宿主机系统类型
 Architecture: x86_64 # 宿主机架构
 CPUs: 2 # 宿主机CPU数量
 Total Memory: 2.855GiB # 宿主机内存大小
 Name: gitlab-server # 宿主机主机名，hostname
 ID: KMMF:2WZW:L34V:RTUN:E6JL:BV74:EMJ3:DOAB:EUDG:SDCZ:P56Y:E76O # 宿主机ID
 Docker Root Dir: /var/lib/docker # 宿主机关于docker数据的保存目录
 Debug Mode: false # server端是否开启debug
 Registry: https://index.docker.io/v1/ # 镜像仓库
 Labels:
 Experimental: false # 是否为测试版
 Insecure Registries:
  127.0.0.0/8 # 非安全的镜像仓库
 Live Restore Enabled: false # 是否开启活动重启（重启docker-daemon不关闭容器）

WARNING: No swap limit support # 未开启swap限制
```

