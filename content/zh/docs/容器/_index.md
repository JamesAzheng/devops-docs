---
title: "容器"
weight: 11
---

## cgroup 概述
cgroup 对于现代服务器和云计算环境至关重要，特别是对于容器技术（如 **Docker** 和 **Kubernetes**）来说，它是实现资源隔离的**底层基础**：

- **资源隔离**：确保一个应用或服务不会耗尽所有系统资源，影响到其他应用或系统的稳定性。例如，限制一个后台计算任务只能使用 20% 的 CPU，避免拖慢前端 Web 服务。
- **资源分配**：根据不同的优先级为不同的服务分配资源。
- **资源计量**：准确统计某个服务使用了多少资源，方便计费或性能分析。



### cgroup 的工作方式

cgroup 通过一个**虚拟文件系统**（通常挂载在 `/sys/fs/cgroup`）暴露给用户空间。用户或程序通过在这个文件系统中创建目录（即创建 cgroup）和写入文件（即设置限制参数）来管理和控制进程。

总而言之，**cgroup 是 Linux 实现进程资源管理和隔离的核心机制**。


# 运行时 和 容器运行时

## 运行时（runtime）

- runtime 就是一个语言实现的基础, 就好像一个人类最基本的心跳, 呼吸技能一样. runtime 和 库 的区别, 类似于 [人类本身] 与 [人类后天增加的装备] 的区别。
- runtime 一般和 compile time 相对，他们在时间上，分别代表运行期和编译期两个时期；
- 在代码上，runtime 代表程序能正常运行所必需的基础代码。对于解释型语言，它的解释器就是 runtime；对于编译型语言，它的 runtime 可以理解为标准库和系统库中不可或缺的那一部分。
  - 比如 c 语言对 glibc，python 对 cpython。但有些语言的标准库的作用除了提供 runtime 之外还提供常用方法的官方实现，并非少了它们整个程序就运行不了了。对于这些并非必要的部分，一般不把它们当做语言的 runtime。
- 总之， **runtime 的意思大概就是 「运行期所必需的东西」**



## 容器运行时（container runtime）

参考文档：https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/

**容器运行时是负责运行容器的软件。**

- Kubernetes 支持容器运行时，例如 containerd、CRI-O 以及 Kubernetes CRI（容器运行时接口）的任何其他实现。
- Docker 确被弃用，大家应该开始考虑使用 CRI 运行时，例如 containerd 与 CRI-O。

**常见容器运行时：**

- containerd

  - 如果大家只是想从 Docker 迁移出来，那么 containerd 就是最好的选择。因为它实际上就是在 Docker 之内起效，可以完成所有“运行时”工作，如上图所示。更重要的是，它提供的 CRI 其实 100% 就是由 Docker 所提供。

  - containerd 与 Docker 相兼容，二者共享相同的核心组件。

  - ```
    https://github.com/containerd/containerd/
    ```

- CRI-O

  - 如果你主要使用 Kubernetes 的最低功能选项，CRI-O 可能更为适合。

- runc

- lxc

- rkt





# Docker 概述

- docker和kvm最大的区别是docker是和系统共用同一个内核，而kvm是各有各的内核，所以docker的性能更好
- runtime是真正运行容器的地方
- 每个容器都对应一个containerd-shim的进程
- docker默认使用的是联合文件系统(overlay2)，其特性为可以将多个设备挂载到同一个dir中，且可以设置各自不同的权限
- du -sh /var/lib/docker/overlay2/ ，镜像容器存放的目录

## 优点

- **快速部署**：短时间内可以部署成百上千个应用，更快速的交付到线上
- **高效虚拟化**：不需要额外 hypervisor 支持，基于Linux内核实现应用虚拟化，相比虚拟机大幅提高性能和效率
- **节省开支**：提高服务器利用率，降低IT支出
- **简化配置**：将运行环境打包保存至容器，利用时直接启用即可
- **环境统一**：将开发、测试、生成的应用运行环境进行标准化和统一，减少环境不一样带来的各种问题
- **快速迁移和扩展**：可实现跨平台运行在物理机、虚拟机、公有云等环境，良好的兼容性可以方便将应用从A宿主机迁移到B主机，甚至是A平台迁移到B平台
- **更好的实现面向服务的架构，推荐一个容器只运行一个应用，实现分布的应用模型，可以方便的进行横向扩展，符合开发中高内聚、低耦合的要求，减少不同服务之间的相互影响**

## 缺点

- 多个容器公用宿主机的内核，各应用间的隔离性不如虚拟机彻底

## 组成

### docker host

- 一个物理机或虚拟机，用于运行docker服务进程和容器，也称为宿主机、node节点

### docker server

- docker守护进程，运行docker容器

### docker client

- 客户端使用 docker 命令或其他工具调用 docker API

### docker images

- 镜像可以理解为创建实例使用的模板，本质上就是一些程序文件的集合

### docker registry

- 保存镜像的仓库
  - 官方仓库：https://hub.docker.com/
  - 私有仓库：harbor

### docker container

- 容器是从镜像生成对外提供服务的一个或一组服务，其本质就是将镜像中的程序启动后生成的进程



