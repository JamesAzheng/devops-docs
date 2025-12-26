---
title: "虚拟化"
weight: 71
---


# virtualzation

- 虚拟化（virtualzation）是一种资源管理技术，是将计算机的各种实体资源（CPU、内存、磁盘空间、网络适配器等），予以抽象、转换后呈现出来并可供分割、组合为一个或多个计算机配置环境，并重新分割、重新组合，已达到最大化合理利用物理资源的目的

## 虚拟化的优势

参考资料：https://www.vmware.com/cn/solutions/virtualization.html

- 资源超分，如物理机虽只有128G内存，但是可以给虚拟机分配200G内存或者更多
- 降低资金成本和运维成本
- 最大限度的减少或消除停机
- 提高IT部门的工作效率、效益、敏捷性和响应能力
- 加快应用和资源的调配速度
- 提高业务连续性和灾难恢复能力
- 简化数据中心管理
- 真正的 Software-Defined Data Center 的可用性
- 减少端口的冲突



## 虚拟化的类型

### 网络虚拟化

- 通过软件定义网络（software defined network ，SDN）
- 即网络的创建不再依赖于物理设备
- 如公有云厂商允许用户自己创建新的网络
- 在 kubernetes、OpenStack 中都会使用网络虚拟化

### 桌面虚拟化

- 将桌面部署为代管服务，使IT组织能够更快地响应不断变化的工作场所需求和新出现的机会
- 还可以将虚拟化桌面和应用快速、轻松地交付给分支机构、外包和离案员工以及使用 ipad 和 Android 平板电脑的移动员工
- Citrix 思杰公司在云计算虚拟化、虚拟桌面和远程接入技术领域处于优势地位，还有阿里云也推出了虚拟桌面端 无影电脑

### 应用虚拟化

- 将软件虚拟化，如office365、钉钉、企业微信等

### 存储虚拟化

- SAN（基于磁盘)
- NAS（NFS/Samba）
- GlusterFS
- ceph 等...

### 库虚拟化

- 在Linux上运行windows程序使用wine，在mac系统运行windows程序使用CrossOver等

### 容器技术

- 被称为下一代的虚拟化技术
- 典型代表：Docker、Podman、Linux Container(LXC)、Pouch



## 虚拟化技术发展历史

- 软件辅助的 full virtualzation --> 基于修改内核的半虚拟化 para virtualzation --> 硬件辅助的 full virtualzation
- 最右侧为最新的技术，也是性能最优的解决方案



## 软件辅助的 full virtualzation

- 在早期没有发布CPU虚拟化的时候，使用的都是软件辅助的全虚拟化

- 因为HostOS运行在CPU的核心态中，而GuestOS运行在用户态，但GuestOS不可避免的需要执行一些程序来操作硬件设备，但因为其运行在用户态，从而无法直接的操纵硬件，所以为了解决以上问题，就出现了两种解决机制：
  - **特权解除：**
    - 当GuestOS需要调用运行在核心态的指令时，VMM就会动态的将核心态的指令捕获 并调用若干运行在非核心态的指令来模拟出期望得到的效果，从而将核心态的特权解除。解除了核心态的特权后，就能在GuestOS中执行大部分的核心指令了，但有一些敏感的指令还是不能得到很好的解决，如：`reboot`、`shutdown`等，直接执行的话会导致HostOS重启，所以就需要陷入模拟的实现
  - **陷入模拟：**
    - 在GuestOS中执行了敏感指令 如：`reboot`时，VMM首先会将敏感指令`reboot`捕获、检测并判断其为敏感指令，此时VMM就会陷入模拟，将敏感指令reboot模拟成一个只针对GuestOS进行操作的、非敏感的、并且运行在非核心态上的`reboot`指令，最后CPU执行虚拟机的重启操作
- **总结：**由于全虚拟化VMM会频繁的捕获这些核心态的敏感指令，然后将这些指令转换后，再交给CPU执行，但是这样会使虚拟机性能变得较低，但全虚拟化VMM应用程序的好处在于无需对GuestOS的核心源码做修改，所以全虚拟化的VMM可以安装绝大部分的OS
- 产品或方案：QEMU、Bochs、PearPC



## 半虚拟化 para virtualzation

- 由于软件辅助的全虚拟化性能较为低下，所以后期出现了半虚拟化这种虚拟化解决方案
- 半虚拟化需要对GuestOS的核心源码做修改，并且要求对GuestOS的系统架构必须和宿主机相同，才能使其支持，所以仅限于开放源代码的OS，如：Linux、open soralis、BSD 等...
- 半虚拟化实际上是将GuestOS的核心源码做修改后（主要是修改GuestOS指令集中的敏感指令 和 核心态指令），修改成可以和VMM直接交互的方式，实现操作系统的定制化。这样就不会有捕获异常、翻译和模拟的过程，从而实现性能的提高
- 半虚拟化除修改内核外，还有一种实现方案：即在每个GuestOS中安装半虚拟软件，如：VMTools、RHEVTools 等
- **注意：**若使用KVM运行Windows时，一定要安装半虚拟化驱动Tools，否则将无法工作，现在主流的半虚拟化驱动是由IBM和Redhat联合开发的一个通用半虚拟化驱动virtio





## 硬件辅助的 full virtualzation

- HVM（hardware virtual Machine）
- 2005年intel提出并开发了由CPU直接支持的虚拟化技术。这种虚拟化技术引入新的CPU运行模式和新的指令集，使得VMM和GuestOS运行于不同的模式下：
- VMM=Root Mode
- GuestOS=Non-Root Mode
- GuestOS运行于受控模式，原来的一些敏感指令在受控模式下会全部陷入VMM，由VMM来实现模拟，这样就解决了部分非内核态敏感指令一一模拟的难题，并且模式切换时上下文的保存恢复由硬件来完成，这样就大大提高了嵌入一一模拟时上下文切换的效率
- 硬件辅助全虚拟化主要使用了支持虚拟化功能的CPU进行支撑(目前CPU基本全部支持)，CPU可以明确的分辨出来自GuestOS的特权指令，并对GuestOS进行特权操作，而不会影响到HostOS
- 硬件辅助全虚拟化还需打开虚拟化功能，如：Intel的 Intel VT-X/EPT，AMD的AMD-V/RVI，以在CPU层面支持虚拟化功能和内存虚拟化技术
- 硬件辅助全虚拟化的相关软件：
  - wmware esxi
  - xen 3.0
  - KVM
  - Microsoft Hyper-V
  - wmware workstation
  - virtual box
  - paralles desktop
- **KVM是硬件辅助的虚拟化技术，主要负责比较繁琐的 CPU 和 内存虚拟化，而QUMU则负责I/O虚拟话，这两者各自发挥自身的优势**





# -





# Hypervisor

## Hypervisor 概述

- 又称 VMM（virtual machine monitor）虚拟机监视器
- Hypervisor 是所有虚拟化技术的核心，多数虚拟化都采用此方式

- Hypervisor 是一种运行在基础物理服务器和操作系统之间的中间软件层，可以控制硬件并向来宾操作系统提供访问底层硬件的途径，并向来宾操作系统提供虚拟化的硬件
- 其可以允许多个操作系统和应用共享底层的内存、CPU、硬盘等物理设备



## Hypervisor 分类

### 裸金属型

- 直接运行到物理机的 Hypervisor 上，
  - Hardware --> Hypervisor --> Application
- 常见裸金属型虚拟化解决方案：
  - KVM
  - XEN
  - wmware esxi
  - Hyper-v Server（Windows）

### 宿主型

- 需要运行在具有虚拟化功能的操作系统上的 Hypervisor
  - Hardware --> OS --> Hypervisor --> Application
- 常见宿主型虚拟化解决方案：
  - wmware workstation
  - Microsoft Hyper-v（Windows）
  - Virtual Box
  - paralles desktop（Mac系统最强虚拟机技术）









**KVM和iptables、LVS一样，都是内核中的功能**