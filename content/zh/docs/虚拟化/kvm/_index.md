---
title: "KVM"
---

# KVM 前言

- 官方网站：https://www.linux-kvm.org/

- 红帽KVM介绍：https://www.redhat.com/zh/topics/virtualization/what-is-KVM

- Readhat虚拟化指南：https://access.redhat.com/documentation/zh%EF%BF%BEcn/red_hat_enterprise_linux/7/html/virtualization_getting_started_guide/index

- KVM（用于基于内核的虚拟机）是用于 x86 硬件上的 Linux 的完整虚拟化解决方案，包含虚拟化扩展（Intel VT 或 AMD-V）。它由一个可加载的内核模块 kvm.ko 和一个处理器特定模块 kvm-intel.ko 或 kvm-amd.ko 组成，该模块提供核心虚拟化基础设施。

- 使用 KVM，可以运行多个运行未修改的 Linux 或 Windows 映像的虚拟机。每个虚拟机都有私有的虚拟化硬件：网卡、磁盘、图形适配器等。

- KVM 是开源软件。从 2.6.20 开始，KVM 的内核组件包含在主线 Linux 中。从 1.3 开始，KVM 的用户空间组件包含在主线 QEMU 中。
- **KVM运行在内核空间，提供CPU和内存的虚拟化，以及客户机的I/O拦截，GuestOS的部分I/O被KVM拦截后，交给QEMU处理**
  - **两类组件：**
    - **kvm.ko（/dev/kvm）：**工作为hypervisor，在用户空间可通过系统调用ioctl()与内核中的kvm模块交互，从而完成虚拟机的创建、启动、停止、删除等各种管理功能，可虚拟CPU和内存
    - **qemu-kvm进程：**工作于用户空间，用于**实现IO设备模拟**；也用于实现一个虚拟机实例



# KVM 功能

- 支持 CPU 和 memory 超分（Overcommit）
- 支持半虚拟化I/O（virtio）
- 支持热插拔（CPU、块设备、网络设备等）
- 支持对称多处理（Symmetric Multi-Processing，缩写为 SMP）
- 支持实时迁移（Live Migration）
- 支持PCI设备直接分配 和 单根I/O 虚拟化（SR-IOV）
- 支持内核同页合并(KSM)
- 支持NUMA（Non-Uniform Memory Access，非一致存储访问解构）



# KVM 局限性

- CPU overcommit：过载使用，性能下降
- 时间记录难以精确，依赖于时间同步机制，如：NTP
- VM量特别大时，MAC地址存在冲突的可能性
- 实时迁移：共享存储，CPU架构，版本等
- 性能局限性



# QEMU

- qemu支持xen或kvm模式下的虚拟化

- KVM本身不执行任何硬件模拟，需要客户空间程序通过 /dev/kvm 接口设置一个客户机虚拟服务的地址空间，向它提供模拟的 I/O，并将它的视频显示映射回宿主机的显示屏，目前这个程序是QEMU
- **QEMU是纯软件实现的虚拟化模拟器，几乎可以模拟任何硬件设备**，最熟悉的就是能够模拟一台能够独立运行操作系统的虚拟机，虚拟机认为自己在和硬件打交道，其实这是QEMU模拟出来的，最后由QEMU将这些指令转译给真正的硬件
- 因为QEMU是纯软件实现的，所有的指令都要经过QEMU，从而性能影响较大，所以在生产环境中，大多数的做法都是配合 KVM 来完成虚拟化工作，KVM完成复杂及要求比较高的设备虚拟化
- **QEMU组成部分：**
  - 处理器模拟器（X86、PowerPC 和 Sparc）
  - 仿真设备（键盘、鼠标、硬盘、网卡 等...）
  - 通用设备（用于将仿真设备连接至主机设备 从而实现透传）
  - 模拟机的描述信息
  - 调试器
  - 与模拟器交互的用户接口



# KVM 集中管理与控制相关应用

- 相关文档：http://www.linux-kvm.org/page/Management_Tools
- **ovirt**
  - https://www.ovirt.org/
  - 功能强大，是Redhat虚拟化平台RHEV的开源版本
- **OpenStack**
  - https://www.openstack.org/
  - 最主流的开源虚拟化管理平台
- **Proxmox virtualzation environment**
  - 简称PVE，是一个开源免费的基于Linux的企业级虚拟化解决方案，功能不输专业收费的wmware。是一个完整的企业虚拟化开源平台。借助内置的Web界面，可以轻松管理VM和容器，软件定义的存储和网络，高可用性集群以及单个解决方案上的多个开箱即用工具





# 总结

- KVM主要负责提供CPU和内存的虚拟化，以及客户机的I/O拦截，和复杂及要求比较高的设备虚拟化
- QEMU主要负责一般硬件的虚拟化，如：鼠标、键盘等