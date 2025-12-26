---
title: "安装KVM"
---

- **KVM为内核自身的功能，只需CPU支持虚拟化，并且在宿主机安装一些相关的管理工具即可**

# 前期准备

- **注意**：如果是在Windows中的Wmware Workstation模拟，则需要在开启虚拟机时开启虚拟化引擎
  - 处理器
    - √ 虚拟化 Inerl VT-x/EPT 或 AMD-V/RVI(V)
    
  - **VMware Workstation 在此主机上不支持嵌套虚拟化。  模块“HV”启动失败。  未能启动虚拟机**
    
    - 是因为windows自身带的 hyper-v 所影响而导致的问题
    
    - **window控制 --> 程序和功能 --> 启用或关闭windows功能 --> 取消勾选虚拟机平台**

## 验证是否开启虚拟化

```bash
# grep -Em 1 "vmx|svm" /proc/cpuinfo 
#Intel CPU 对应 vmx
#AMC CPU 对应 svm

# lsmod |grep kvm
kvm_amd               110592  0
ccp                    98304  1 kvm_amd
kvm                   798720  1 kvm_amd
irqbypass              16384  1 kvm

# ls -l /dev/kvm 
crw-rw-rw- 1 root kvm 10, 232 Aug  8 17:26 /dev/kvm
```





# 安装 KVM 相关工具包

## 相关包概述

### centos

- **qemu-kvm** 为kvm提供底层仿真支持
- **libvirt** 使用最多的kvm虚拟化管理工具和应用程序接口，即通过libvirt调用KVM创建虚拟机，也是KVM通用的访问API，其不但能管理KVM，还能管理VMware、Xen、Hyper-V、VirtualBox等虚拟化方案
- **libvirt-daemon** libvirt的守护进程，管理虚拟机
- **libvirt-client** 客户端软件，提供客户端管理命令
- **libvirt-daemon-driver-qemu** libvirtd连接qemu的驱动
- **virt-manager** 图形界面管理工具，其底层也是调用libvirt API来完成对虚拟机的操作，包括虚拟机的创建、删除、启动、停止等一些简单的监控功能等
- **virt-install** 虚拟机命令行安装工具
- **virsh** 命令行工具是基于 libvirt API 创建的命令行工具，它可以作为图形化的 virt-manager 应用的备选工具。virsh 命令可以被用来创建虚拟化任务管理脚本，如安装、启动和停止虚拟机
- **virt-viewer** 通过 VNC 和 SPICE 协议显示虚拟机器图形控制台的最小工具。该工具在其同名软件包中：virtviewer
- **cockpit** Centos8 专门提供的基于Web的虚拟机管理界面



## 安装相关包

### centos

- centos8

- **至少需要的包**： qemu-kvm 和 qemu-img(安装qemu-kvm会自动安装) 软件包

```bash
#建议安装的相关包
yum -y install qemu-kvm libvirt virt-manager virt-install virt-viewer

#启动服务
systemctl enable --now libvirtd
```

- centos8提供的图形界面管理虚拟机的工具
- 可选项

```bash
yum -y install cockpit
systemctl enable --now cockpit

#通过以下方式访问
https://主机地址:9090/
```

### Ubuntu

- 18.04  和 20.04 都支持

```bash
#建议安装的相关包
apt -y install qemu-kvm virt-manager libvirt-daemon-system

#启动服务
systemctl enable --now libvirtd
```



## 观察启动后的默认网络配置

- 可以看到多了两块网卡（ virbr0 和 virbr0-nic ），类似于Wmware workstation生成的VMnet8网卡，用来充当虚拟机的NAT网卡

### centos

```bash
[root@centos-kvm ~]# ip a
...
4: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:ef:6a:ec brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
5: virbr0-nic: <BROADCAST,MULTICAST> mtu 1500 qdisc fq_codel master virbr0 state DOWN group default qlen 1000
    link/ether 52:54:00:ef:6a:ec brd ff:ff:ff:ff:ff:ff
    
#ip地址等信息是存放在此文件中
[root@centos8 ~]# cat /etc/libvirt/qemu/networks/default.xml 
<!--
WARNING: THIS IS AN AUTO-GENERATED FILE. CHANGES TO IT ARE LIKELY TO BE
OVERWRITTEN AND LOST. Changes to this xml configuration should be made using:
  virsh net-edit default
or other application using the libvirt API.
-->

<network>
  <name>default</name>
  <uuid>27ec3515-886f-4853-ba1e-37beed262328</uuid>
  <forward mode='nat'/>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:f2:f9:5d'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
    </dhcp>
  </ip>
</network>
```

### Ubuntu

```bash
root@ubuntu-kvm:~# ip a
...
3: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:17:60:45 brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
4: virbr0-nic: <BROADCAST,MULTICAST> mtu 1500 qdisc fq_codel master virbr0 state DOWN group default qlen 1000
    link/ether 52:54:00:17:60:45 brd ff:ff:ff:ff:ff:ff
```





