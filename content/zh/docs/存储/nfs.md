---
title: "NFS"
---

# NFS 概述

NFS (Network File System) 是一种网络文件系统协议，用于在计算机网络上共享文件和目录。它允许不同的计算机通过网络共享文件，就像这些文件存储在本地计算机上一样。NFS 最初由 Sun Microsystems 开发，并成为 UNIX 系统上最常用的文件共享协议之一。

以下是 NFS 的一些概述特点：

1. 分布式文件系统：NFS 允许在不同的计算机之间共享文件和目录，这些计算机可以是在本地网络中或远程网络中的任意位置。
2. 客户端-服务器模型：NFS 使用客户端-服务器模型，其中一个计算机（NFS 服务器）共享其文件系统，并提供访问权限，而其他计算机（NFS 客户端）可以通过网络连接到服务器并访问共享的文件和目录。
3. 透明访问：NFS 提供了透明访问文件和目录的能力，即客户端可以像访问本地文件系统一样访问远程共享的文件和目录，而不需要了解文件实际存储在哪个服务器上。
4. 文件共享和远程访问权限：NFS 允许管理员在服务器上指定共享的文件和目录，并为每个共享设置访问权限。客户端可以根据其访问权限访问和操作这些共享的文件和目录。
5. 容错和可靠性：NFS 提供了容错和可靠性机制，以确保文件系统在出现网络故障或服务器故障时继续正常运行。它使用重试和错误处理机制来处理传输中的错误，并在恢复后继续传输。
6. 性能和缓存：NFS 使用缓存机制来提高性能，客户端可以将访问过的文件和目录缓存在本地，以减少对服务器的访问次数，提高访问速度。

总之，NFS 是一种用于在计算机网络上共享文件和目录的协议，它提供了透明访问、分布式文件系统、容错和可靠性等特性，广泛应用于 UNIX/Linux 环境以及许多其他操作系统中。



- NFS又称网络文件系统，其强大之处在于可以把远程的共享资源挂载到本机使用
  - 是的，NFS 在将远程共享资源挂载到本地使用方面非常强大。通过将远程文件系统挂载到本地，用户可以像使用本地文件一样访问和操作这些远程共享的资源。

- NFS优势：节省本地存储空间，将常用的数据,如：/home目录，存放在NFS服务器上且可以通过网络访问，本地终端将可减少自身存储空间的使用
  - 您提到的一些优势也是 NFS 的主要优点之一。通过将常用的数据存储在 NFS 服务器上，可以节省本地存储空间，并减少终端设备的存储负担。此外，通过网络访问远程共享资源，可以方便地共享数据和文件，增加协作和共享的灵活性。

- 由于NFS开启的端口不固定，会带来的防火墙配置问题，所以**通常只应用在企业内部中**
  - 关于 NFS 只在企业内部应用的观点，这是基于 NFS 开启的端口通常不固定，这可能导致在防火墙配置方面的一些挑战。因此，NFS 通常更适合于企业内部网络环境，而不是在公共网络或互联网上使用。

- 基于RPC 远程过程调用
  - 最后，NFS 使用 RPC（远程过程调用）作为其通信协议。RPC 是一种允许在不同计算机之间进行通信和调用远程过程的机制，它是 NFS 实现文件和目录共享的基础。




总的来说，NFS 是一种强大的网络文件系统，它可以将远程共享资源挂载到本地使用，具有节省存储空间、方便共享和协作等优势，但在防火墙配置方面需要特别注意，并通常应用于企业内部网络环境中。









# NFS 工作原理

NFS服务端启动后，会将IP端口等相关信息注册到注册中心 rpcbind，当用户访问时，并不是直接访问服务端，而是连接服务端的111端口 并通过注册中心 rpcbind  来获取服务器的相关信息，最后在进行数据交换，整个过程是基于RPC远程过程调用来实现的



是的，您的理解是正确的。

NFS 的工作原理主要基于以下步骤：

1. NFS 服务器启动：NFS 服务器在启动时将自己的 IP 地址、端口以及共享的文件系统信息等注册到注册中心 rpcbind（也称为 portmap）。这样，客户端可以通过 rpcbind 了解到 NFS 服务器的相关信息。
2. 客户端请求：当客户端需要访问 NFS 服务器上的共享资源时，它会发送一个远程过程调用（RPC）请求到 rpcbind。RPC 是一种机制，允许客户端调用远程服务器上的过程或函数，就像在本地调用一样。
3. rpcbind 响应：rpcbind 收到客户端的请求后，会检索到 NFS 服务器的相关信息（如 IP 地址、端口等），并将这些信息返回给客户端。
4. 数据交换：客户端使用从 rpcbind 获取到的 NFS 服务器信息，通过建立与服务器的网络连接（通常是通过 TCP/IP），向服务器发送文件访问请求。服务器收到请求后，根据请求进行相应的文件系统操作，并将结果返回给客户端。

总结起来，NFS 的工作原理是通过 rpcbind（或 portmap）作为注册中心来获取 NFS 服务器的相关信息。客户端发送 RPC 请求到 rpcbind，获取到服务器的地址和端口信息，然后建立与服务器的连接，并进行数据交换，实现对共享资源的访问和操作。

需要注意的是，NFS 的工作流程可以在不同的实现版本和配置中有所差异，但基本原理仍然是通过 RPC 实现远程过程调用来访问和操作远程文件系统。





# NFS 相关包

- **NFS文件系统虽然是内核级别的功能，但是也需要用户空间的软件来进行控制**

## nfs-utils

- 包括服务器和客户端相关工具，CentOS8 最小化安装时默认没有安装
- **Ubuntu中包名为：nfs-kernel-server**

### nfs-utils包内相关文件

```sh
# rpm -ql nfs-utils
...
#包含很多的程序，不同的服务会打开很多不同的端口
/sbin/mount.nfs
/sbin/mount.nfs4
/sbin/nfsdcltrack
/sbin/rpc.statd
/sbin/umount.nfs
/sbin/umount.nfs4
#有很多的service文件
/usr/lib/systemd/system/auth-rpcgss-module.service
/usr/lib/systemd/system/nfs-blkmap.service
/usr/lib/systemd/system/nfs-client.target
/usr/lib/systemd/system/nfs-convert.service
/usr/lib/systemd/system/nfs-idmapd.service
/usr/lib/systemd/system/nfs-mountd.service
/usr/lib/systemd/system/nfs-server.service #服务端主要关注此service文件
/usr/lib/systemd/system/nfs-utils.service
/usr/lib/systemd/system/nfsdcld.service
/usr/lib/systemd/system/proc-fs-nfsd.mount
/usr/lib/systemd/system/rpc-gssd.service
/usr/lib/systemd/system/rpc-statd-notify.service
/usr/lib/systemd/system/rpc-statd.service

...
```



## rpcbind

- 安装 nfs-utils 包时 依赖包中会自动安装 rpcbind 包

- **rpcbind相当于注册中心**，服务器端将端口等信息提交到rpcbind，客户端访问服务器时则直接在rpcbind中获取端口等信息（机器地址，IP...）
- 使用的是 TCP/111 端口

### rpcbind 包内相关文件

```sh
# rpm -ql rpcbind
...
/usr/lib/systemd/system/rpcbind.service
/usr/lib/systemd/system/rpcbind.socket
...
```



## 补充说明

NFS（Network File System）相关的软件包通常包括以下几个主要组件：

1. NFS 服务器软件包：这些软件包包含 NFS 服务器的核心组件，用于提供文件共享和处理客户端请求。常见的 NFS 服务器软件包有：
   - nfs-utils：提供 NFS 服务器的基本功能，包括配置和管理 NFS 服务器。
   - nfs-kernel-server：使用内核模块实现的 NFS 服务器，提供高性能的文件共享。
   - nfs-ganesha：一个开源的 NFS 服务器实现，具有高度可扩展性和灵活性。
2. NFS 客户端软件包：这些软件包用于在客户端系统上访问和挂载远程 NFS 共享的文件系统。常见的 NFS 客户端软件包有：
   - nfs-utils：提供 NFS 客户端的基本功能，包括挂载和管理远程 NFS 共享。
   - nfs-common：包含 NFS 客户端所需的共享库和工具。
3. RPC（Remote Procedure Call）相关软件包：NFS 使用 RPC 进行远程过程调用，因此需要相应的 RPC 库和工具支持。常见的 RPC 软件包有：
   - rpcbind（或 portmap）：作为 NFS 注册中心，负责管理 RPC 端口映射。
   - librpcsecgss：提供基于 GSSAPI 的 RPC 安全支持。

这些软件包在不同的 Linux 发行版中可能有所不同，具体名称和安装方法可能会有所差异。您可以根据您所使用的操作系统和发行版来确定正确的软件包名称，并使用相应的包管理工具（如 apt、yum、dnf 等）进行安装和管理。

请注意，上述列举的软件包仅为常见的示例，还可能存在其他特定于操作系统或发行版的软件包。



# NFS 相关工具

##  rpcinfo

rpcinfo 是一个命令行工具，用于查询和显示 RPC（远程过程调用）服务的信息。它可以列出正在运行的 RPC 服务，显示它们的端口号、版本号以及其他相关信息。

rpcinfo 是一个有用的命令行工具，用于查询和显示 RPC 服务的信息。通过 rpcinfo，您可以了解远程主机上运行的 RPC 服务、端口号、程序号、版本号等详细信息。这对于诊断和调试 RPC 相关问题非常有帮助。

### 命令语法：

```
rpcinfo [options] [host]
```

### 常用选项：

- `-p`：显示远程主机上的所有 RPC 服务及其端口号。
- `-u`：仅显示 UDP（User Datagram Protocol）的 RPC 服务。
- `-t`：仅显示 TCP（Transmission Control Protocol）的 RPC 服务。
- `-s`：显示 RPC 统计信息，包括发送和接收的请求和响应数量。
- `-b`：显示已注册的 RPC 绑定列表。
- `-d`：显示详细的调试信息。

### 常见用法：

- 列出所有的 RPC 服务：

```
rpcinfo -p
```

这会列出本地主机上运行的所有 RPC 服务以及它们的端口号、程序号、版本号等信息。

- 列出特定主机上的 RPC 服务：

```
rpcinfo -p <hostname>
```

将 `<hostname>` 替换为要查询的主机名或 IP 地址，以获取特定主机上运行的所有 RPC 服务信息。

- 仅显示 UDP 或 TCP 的 RPC 服务：

```
rpcinfo -u
rpcinfo -t
```

这两个选项分别显示本地主机上运行的 UDP 或 TCP 的 RPC 服务。

- 显示 RPC 统计信息：

```
rpcinfo -s
```

该命令会显示发送和接收的请求和响应数量，以及其他与 RPC 通信相关的统计信息。





##  exportfs

- 可用于管理NFS导出的文件系统


常见选项：

```bash
-v # 查看本机所有NFS共享
-r # 重读配置文件，并共享目录
-a # 输出(恢复)本机所有共享
-au # 停止本机所有共享(nfs服务不会停)
```



##  showmount

```bash
# 查看远程主机的NFS共享
showmount -e hostname

# 范例：
# showmount -e 10.0.0.8
Export list for 10.0.0.8:
/data/wordpress *
```



##  mount.nfs

- **客户端NFS挂载**

- **挂载时可省略.nfs**，此命令可以自动识别挂载的目标类别

- NFS相关的挂载选项：man 5 nfs
- 挂载选择说明

```bash
fg #（默认）前台挂载
bg #后台挂载
hard #（默认）持续请求
soft #非持续请求
intr #和hard配合，请求可中断
rsize #和wsize 一次读和写数据最大字节数，rsize=32768
_netdev #无网络不挂载（建议添加，防止宿主机没有网络时无法挂载从而无法启动）
vers #指定版本，客户端centos8默认4.2 ，centos7默认4.1 centos6默认4.0
```

**提示：基于安全考虑，建议使用 nosuid,_netdev,noexec 挂载选项**



## 补充说明

NFS（Network File System）相关的工具可以帮助您配置、管理和监视 NFS 服务器和客户端。以下是一些常见的 NFS 相关工具：

1. showmount：用于显示 NFS 服务器上共享的文件系统列表以及客户端的访问权限。可以使用 showmount 命令来检查 NFS 服务器的配置和共享状态。
2. exportfs：用于管理 NFS 服务器上的共享，包括添加、删除和修改共享。exportfs 命令可以指定共享的目录路径、访问权限和选项。
3. mount：用于在 NFS 客户端上挂载远程共享的 NFS 文件系统。可以使用 mount 命令来指定 NFS 服务器的地址和共享目录，将远程文件系统挂载到本地。
4. umount：用于卸载已挂载的 NFS 文件系统。umount 命令可以指定要卸载的本地挂载点，将挂载的 NFS 文件系统从本地解除挂载。
5. nfsstat：用于监视 NFS 客户端和服务器的统计信息。nfsstat 命令可以显示关于 NFS I/O、RPC 连接和性能指标的信息。
6. nfsiostat：用于监视 NFS I/O 的性能统计。nfsiostat 命令可以显示有关 NFS 操作（读取和写入）的统计数据，包括吞吐量、延迟和负载等信息。
7. nfsstat：用于显示 NFS 客户端和服务器的状态信息。nfsstat 命令可以显示有关 NFS 连接和传输状态的详细信息。
8. rpcinfo：用于查询 RPC（远程过程调用）服务的信息。rpcinfo 命令可以列出正在运行的 RPC 服务以及它们的端口和版本号等信息。

这些工具通常可以在 Linux 或 UNIX 系统上使用，并根据不同的发行版和操作系统可能会有所不同。您可以通过在终端中运行工具名称来获取有关每个工具的更多详细信息和用法的帮助。



# NFS 服务端相关配置

## 安装 NFS

```bash
# centos
yum -y install nfs-utils

# Ubuntu
apt -y install nfs-kernel-server
```



## NFS 服务端相关端口

- **tcp/2049** nfsd
-   **tcp|udp/111** rpcbind，其它端口由rpcbind分配
  - PS：111端口关闭需停止rpcbind.service与rpcbind.socket



## NFS 服务端主要进程

- **rpc.nfsd** 最主要的NFS进程，管理客户端是否可登录

- **rpc.mountd** 挂载和卸载NFS文件系统，包括权限管理

- **rpc.lockd** 非必要，管理文件锁，避免同时写出错

- **rpc.statd** 非必要，检查文件一致性，可修复文件



## NFS 服务端日志

```bash
/var/lib/nfs/
```



## NFS 服务端配置文件

```bash
/etc/exports # 主配置文件
/etc/exports.d/*.exports # 子配置文件，要以.exports结尾
```



### NFS 服务端配置文件语法

- NFS 服务器端配置文件是 `/etc/exports`，它用于定义要共享的文件系统和访问权限。
- 以下是 `/etc/exports` 文件的配置格式和语法说明：

```bash
# 每行配置的格式为：
<共享目录> <允许访问的主机>(<选项>,<选项>...) [<允许访问的主机>(<选项>,<选项>...)]...
```

- `<共享目录>`：指定要共享的目录路径。可以是绝对路径或相对路径。
- `<允许访问的主机>`：指定允许访问共享的主机或网络。可以是单个 IP 地址、主机名，或者使用 CIDR 表示的 IP 网络地址。多个主机或网络之间用逗号分隔。
- `<选项>`：可选的共享选项，用于指定访问权限、挂载选项和其他设置。选项之间用逗号分隔。

#### 主机格式

- **所有客户端主机**：
  - *

- **部分客户端主机**：
  - 172.18.0.0/255.255.0.0
  - 172.18.0.0/16
  - \*.magedu.com（主机名支持统配，IP地址不支持) 
  - @group_name（NIS域的主机组) 

- **单个客户端主机**：
  - ipv4、ipv6、FQDN


#### 选项格式

- `rw`：读写，允许读写访问权限。
- `ro`：只读，只允许读取访问权限。
- `sync`：同步写入，每次写操作都会同步到磁盘。
  - 数据在请求时立即写入共享存储磁盘，性能低，安全性高
- `async`：异步写入，写操作可能会在后台异步进行。
  - 数据变化后不立即写磁盘，先写入到缓冲区中，过一段时间再写入磁盘，性能高，安全性低。
- `no_root_squash`：禁止将远程 root 用户映射为匿名用户。
- `root_squash`：将远程 root 用户映射为匿名用户。
- `all_squash`：将所有远程用户映射为匿名用户。
- `subtree_check`：启用子目录检查，确保只有已导出的子目录可以访问。



- `sync`：同步写入，每次写操作都会同步到磁盘。这是默认的同步模式。
- `async`：异步写入，写操作可能会在后台异步进行。可以提高性能，但可能会有一定的数据丢失风险。
- `root_squash`：将远程 root 用户映射为匿名用户。这是默认的 root 用户映射选项，以增加安全性。
- `no_root_squash`：禁止将远程 root 用户映射为匿名用户。使用此选项可以允许远程 root 用户具有特权访问权限。
- `all_squash`：将所有远程用户映射为匿名用户。可以用于创建共享只允许匿名访问的情况。
- `no_all_squash`：禁止将所有远程用户映射为匿名用户。默认情况下，这是关闭的，允许每个用户保留其原始身份。
- `subtree_check`：启用子目录检查，确保只有已导出的子目录可以访问。这是默认的子目录检查选项。



- **root_squash** 远程root映射为nobody
- **no_root_squash** 远程root映射成NFS服务器的root用户
- **all_squash**：所有远程用户(包括root)都变成nobody
- **no_all_squash**：保留共享文件的UID和GID
- **anonuid=UID** 指明匿名用户映射为特定用户UID，**通常配合all_squash使用**
- **anongid=GID** 指明匿名用户映射为特定组GID，**通常配合all_squash使用**



##### 默认选项

下述选项是 NFS 服务器端的默认选项。它们控制着 NFS 共享的访问权限、写入延迟、安全机制和用户映射等方面。根据您的需求，可以选择使用或调整这些选项来实现所需的共享配置和安全性设置。

`(ro,wdelay,root_squash,no_subtree_check,sec=sys,ro,secure,root_squash,no_all_squash)`

- `ro`：只读权限。指定该选项后，远程客户端只能以只读方式访问共享的文件系统，不能进行写操作。
- `wdelay`：写入延迟。启用此选项可以将写入操作的执行延迟一段时间，以提高效率。写入数据会在一定时间后才真正写入磁盘。
- `root_squash`：将远程 root 用户映射为匿名用户。当远程 root 用户尝试访问共享文件系统时，其权限将被限制为匿名用户的权限，以增加安全性。
- `no_subtree_check`：禁用子目录检查。默认情况下，NFS 服务器会检查客户端请求的路径是否在已导出目录的子目录中。启用此选项后，不再进行子目录检查。
- `sec=sys`：指定安全机制为系统（system）级别。这是一种简单的安全机制，使用操作系统的用户和组标识来进行身份验证和权限控制。
- `secure`：启用安全选项。该选项要求客户端使用已认证的端口（通常是小于1024的端口）进行连接，并提供更安全的数据传输。
- `no_all_squash`：禁止将所有远程用户映射为匿名用户。使用此选项可以允许每个远程用户保留其原始身份。

请注意，这些选项的默认行为可能会因不同的 NFS 版本、操作系统和配置而有所差异。建议查阅相关文档或手册以获取特定环境下的准确默认选项信息。



**不同 Linux 发行版中 nobody 用户的区别：**

- centos7之前nfs使用的都是nfsnobody，centos8和Ubuntu2004后使用的都是nobody了


```bash
[root@centos6 ~]#grep nobody /etc/passwd
nobody:x:99:99:Nobody:/:/sbin/nologin
nfsnobody:x:65534:65534:Anonymous NFS User:/var/lib/nfs:/sbin/nologin

[root@centos7 ~]#grep nobody /etc/passwd
nobody:x:99:99:Nobody:/:/sbin/nologin
nfsnobody:x:65534:65534:Anonymous NFS User:/var/lib/nfs:/sbin/nologin

[root@centos8 ~]#grep nobody /etc/passwd
nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin

root@ubuntu2004:~# grep nobody /etc/passwd
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```









#### 注意事项

- 每行配置后面可以添加注释，注释以 `#` 开头。
- 配置文件修改后需要重新加载或重启 NFS 服务器或执行 `exportfs -r` 使配置生效。



### NFS 服务端配置文件示例

- /etc/exports

```bash
/myshare server.example.com
/myshare *.example.com
/myshare server?.example.com
/myshare server[0-20].example.com
/myshare 172.25.11.10
/myshare 172.25.0.0/16
/myshare 2000:472:18:b51:c32:a21
/myshare 2000:472:18:b51::/64
/myshare *.example.com 172.25.0.0/16
/myshare desktop.example.com(ro)
/myshare desktop.example.com(ro) server[0-20].example.com(rw)
/myshare diskless.example.com(rw,no_root_squash) # no_root_squash表示不压榨root，即root创建文件会成为root所拥有，而非nobody了


# /home 目录允许 IP 地址为 192.168.1.100 的主机以读写权限访问。
/home        192.168.1.100(rw)


# /data 目录允许 192.168.1.0/24 网络范围内的主机以只读权限访问。
/data        192.168.1.0/24(ro)


# /documents 目录允许以 *.example.com 为主机名后缀的主机以同步写入方式、禁止 root 用户映射为匿名用户的权限访问。
/documents   *.example.com(sync, no_root_squash)
```



### NFS 配置文件生效方法

#### 方法一

```sh
systemctl restart nfs-server
```

#### 方法二

- 除重启nfs服务外，也可以使用以下指令，（类似于reload）

```bash
exportfs -r # 重新加载配置文件，前提是须先启动服务

exportfs -v # 显示目前已生效的配置内容
```







# NFS 客户端相关配置

## 安装NFS

- 客户端也需安装 nfs

```bash
#centos
yum -y install nfs-utils

#Ubuntu
dnf -y install nfs-kernel-server
```

## 永久挂载

### 范例1


```bash
# /etc/fstab  
10.0.0.8:/data/wordpress   /mnt/nfs   nfs   _netdev  0  0

#_netdev 表示此为远程网络设备，同时也能防止网络出现问题时因挂载信息无法找到而导致的无法开机问题
```





## 临时挂载

- 假设远程主机10.0.0.8 已经将/data/wordpress目录共享出来，目录内有一个 index.html 文件


```bash
#客户端创建目录
mkdir /mnt/nfs

#将远程主机10.0.0.8共享的/data/wordpress目录 挂载到本机的/mnt/nfs目录上
mount -o rw,nosuid,fg,hard,intr 10.0.0.8:/data/wordpress /mnt/nfs

#客户端查看挂载结果
# ls /mnt/nfs
index.html
# df -T /mnt/nfs
Filesystem               Type 1K-blocks   Used Available Use% Mounted on
10.0.0.8:/data/wordpress nfs4  52403200 398336  52004864   1% /mnt/nfs
```









# NFS共享注意事项

- NFS客户端创建文件时，是根据用户的ID号来创建
  - root账号创建文件默认会在nfs上显示为nobody用户，需要在挂载选项中加上no_root_squash才会变成root所拥有
  
- 客户端的uid、gid 和 服务端的uid、gid 相同时，有可能会出现客户端和服务端文件的所有者所属组同ID但不同名的状况，从而导致文件管理上的混乱

  - **解决方案：**	
    1. 应用编译安装时统一指定ID号（NFS服务端、客户端都一样的uid gid）
    2. 单独设立一台服务器作为用户账号分享（ldap server）
    3. 在NFS配置文件中指明创建所属者和所属组的ID

- **客户端在向 NFS 服务端写入文件时，客户端的当前用户id需和NFS服务端共享目录的id保持一致，否则会` Permission denied`，并且双方都要以rw方式挂载**

  - ```sh
    # NFS 服务端
    # ll /data/nfs/redis -d
    drwxr-xr-x 2 redis redis 19 Dec 27 18:44 /data/nfs/redis
    # id redis
    uid=1688(redis) gid=1688(redis) groups=1688(redis)
    
    
    # NFS 客户端
    root@k8s-node-1:~# touch /mnt/a.txt
    touch: cannot touch '/mnt/a.txt': Permission denied
    root@k8s-node-1:~# su - redis
    redis@k8s-node-1:~$ id
    uid=1688(redis) gid=1688(redis) groups=1688(redis)
    redis@k8s-node-1:~$ touch /mnt/a.txt
    redis@k8s-node-1:~$ ls /mnt/a.txt
    /mnt/a.txt
    ```

    






# 实现 NFS 共享

## nfs-server端

```bash
#创建一个共享的目录
[root@nfs-server ~]# mkdir -p /data/wordpress

#配置共享，*后面不填内容表示以只读方式共享，读写需要在*后面添加(rw)
[root@nfs-server ~]# vim /etc/exports
/data/wordpress *

#让配置生效
[root@nfs-server ~]# exportfs -r
exportfs: No options for /data/wordpress *: suggest *(sync) to avoid warning

#查看配置，即本机被共享出来的路径
[root@nfs-server ~]# exportfs -v
/data/wordpress
		<world>(sync,wdelay,hide,no_subtree_check,sec=sys,ro,secure,root_squash,no_all_squash)
```

## client端

```bash
# 观察远程nfs服务器的共享资源，10.0.0.18为远程nfs服务器的IP地址
[root@client ~]# showmount -e 10.0.0.18
Export list for 10.0.0.18:
/data/wordpress *


# 临时挂载
[root@client ~]# mkdir /mnt/nfs
[root@client ~]# mount 10.0.0.18:/data/wordpress /mnt/nfs
[root@client ~]# df -T /mnt/nfs/
Filesystem                Type 1K-blocks   Used Available Use% Mounted on
10.0.0.18:/data/wordpress nfs4  52403200 398336  52004864   1% /mnt/nfs


#永久挂载，_netdev挂载选项表示有网络就挂载，没有网络则不挂，防止没有网络时挂载失败导致无法启动
[root@client ~]# vim /etc/fstab
10.0.0.18:/data/wordpress      /mnt/nfs        nfs     _netdev         0 0
[root@client ~]# mount -a
```







# 基于 autofs 实现 NFS 共享

## 目标

将NFS的共享目录，通过autofs 发布出来，做为远程主机用户的家目录

## 环境准备

```bash
#共三台主机

#一台主机 nfs server
IP:10.0.0.8

#另两台当 nfs client
IP:10.0.0.7
IP:10.0.0.6
```

## 实现

```bash
#NFS服务器创建用户和相应的家目录，将用户wang的家目录共享
[root@centos8 ~]#mkdir -pv /data/home
[root@centos8 ~]#useradd -d /data/home/user1 -u 2000 user1
[root@centos8 ~]#Vim /etc/exports.d/test.exports
/data/home *(rw)
[root@centos8 ~]#exportfs -r 

#在第一台NFS客户端主机10.0.0.7上实现相对路径法的autofs
[root@centos7 ~]#useradd -M -u 2000 user1
[root@centos7 ~]#vim /etc/auto.master
/home   /etc/auto.home
[root@centos7 ~]#vim /etc/auto.home
*  -fstype=nfs,vers=3 10.0.0.8:/data/home/& #开头的*和结尾的&表示*开头是啥结尾就是啥（只适用于相对路径法）
[root@centos7 ~]#systemctl restart autofs
[root@centos7 ~]#su - user1
Last login: Fri Jul  3 16:33:34 CST 2020 on pts/0
[user1@centos7 ~]$pwd
/home/user1
[user1@centos7 ~]$df /home/user1 -T
Filesystem               Type 1K-blocks   Used Available Use% Mounted on
10.0.0.8:/data/home/user1 nfs4  52403200 398464  52004736   1% /home/user1

#注意：home目录下其它用户家目录无法访问，绝对路径法的autofs可以解决此问题
[root@centos7 ~]#ls /home
user1

#在第二台NFS客户端主机10.0.0.6上实现绝对路径法的autofs
[root@centos6 ~]#useradd -M -u 2000 user1
[root@centos6 ~]#vim /etc/auto.master
/- /etc/auto.home
[root@centos6 ~]#vim /etc/auto.home
/home/user1  -fstype=nfs,vers=3 nfsserver:/data/home/user1
[root@centos6 ~]#service autofs restart
[root@centos6 ~]#su - user1
[user1@centos6 ~]$pwd
/home/user1
[user1@centos6 ~]$df -T /home/user1
Filesystem           Type 1K-blocks   Used Available Use% Mounted on
10.0.0.8:/data/home/user1
                     nfs   52403200 398464  52004736   1% /home/user1
[user1@centos6 ~]$ls /home
mage user1 wang
```





# AUTOFS自动挂载

- 可使用 autofs 服务按需要挂载外围设备，NFS共享等
- 默认空闲5分钟后会自动卸载

## 相关包和文件

**软件包：**autofs

**服务文件：**/usr/lib/systemd/system/autofs.service

**主配置文件：**/etc/autofs.conf

**自动挂载配置文件：**/etc/auto.master

## 自动挂载配置文件格式

参看帮助：man 5 autofs

所有导出到网络中的NFS启用特殊匹配 -host 至“browse”

范例：/net目录可以自动挂载NFS共享

```bash
cat /etc/auto.master
/net   -hosts
cd /net/192.168.8.100/
```

## 自动挂载资源的两种格式

- **定义的自动挂载文件夹在修改完配置文件重启服务后，会自动创建，无需手动创建**

### 相对路径法

将mount point 路径分成 **dirname 和 basename 分别配置**，可能会影响现有的目录结构

   **1.**/etc/auto.master 格式

```sh
vim /etc/auto.master
#挂载点的dirname     指定目录的配置文件路径,如:/etc/test.auto

```

   **2.**指定目录的配置文件格式

```bash
#/etc/test.auto
挂载点的basename     挂载选项     选项设备
```

#### 范例：自动挂载nfs

```sh
[root@client ~]# vim /etc/auto.master
/net    /etc/nfs.auto

[root@client ~]# vim /etc/nfs.auto
nfs -fstype=nfs,rw,nosuid     10.0.0.18:/data/wordpress

[root@client ~]# systemctl restart autofs.service

[root@client ~]# cd /net/nfs

[root@client ~]# pwd
/net/nfs
```

#### 范例：自动挂载光盘

```bash
[root@centos8 ~]#vim /etc/auto.master
/misc   /etc/auto.misc
[root@centos8 ~]#vim /etc/auto.misc 
cd      -fstype=iso9660,ro,nosuid,nodev   :/dev/cdrom

#相对路径法为支持通配符
vim /etc/auto.master
/misc   /etc/auto.misc
vim /etc/auto.misc
#表示/misc下面的子目录和nfs共享/export目录的子目录同名
* server:/export/&
```



### 绝对路径法

直接匹配**全部的绝对路径名称，都写入到指定的配置文件里**,不会影响本地目录结构

**1.** /etc/auto.master 格式

```
/-         指定配置文件路径
```

**2.**指定配置文件格式

```
绝对路径       挂载选项     选项设备
```

#### 范例：自动挂载nfs

```sh
[root@client ~]# vim /etc/auto.master
/-      /etc/nfs.auto

#第一种子目录格式
[root@client ~]# vim /etc/nfs.auto
/net/nfs/    -fstype=nfs,rw,nosuid   10.0.0.18:/data/wordpress

[root@client ~]# systemctl restart autofs.service

[root@client ~]# cd /net/10.0.0.18/data/wordpress/

[root@client wordpress]# pwd
/net/10.0.0.18/data/wordpress

[root@client wordpress]# ls
123  666  eee  www
---------------------------------------------------------------
#第二种子目录格式
[root@client ~]# vim /etc/nfs.auto
/nfs    -fstype=nfs,rw,nosuid   10.0.0.18:/data/wordpress

[root@client ~]# systemctl restart autofs.service

[root@client ~]# cd /nfs/
[root@client nfs]# pwd
/nfs
[root@client nfs]# ls
123  666  eee  www
```

#### 范例2

```bash
vim /etc/auto.master:
/- /etc/auto.direct

vim /etc/auto.direct:
/foo -fstype=nfs server1:/export/foo
/user/local/ -fstype=nfs,vers=3 server1:/usr/local
/mnt/cdrom -fstype=iso9660 :/dev/cdrom
```



# ---



```sh
# 安装 nfs
apt-get -y install nfs-kernel-server


# 创建共享目录
mkdir /data


# 配置共享目录
vim /etc/exports
...
/data 172.16.0.0/18(rw,no_root_squash) # 末尾添加此行，172.16.0.0/18 为允许哪些网段的主机访问


# 重载配置
exportfs -r


# 查看共享状态
exportfs -v


# 客户端测试远程nfs共享，172.16.0.136为nfs服务端的ip，另外客户端也要安装nfs-kernel-server
showmount -e 172.16.0.136
```

