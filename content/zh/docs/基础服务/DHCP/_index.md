---
title: "DHCP"
---



# DHCP 概述

- Dynamic Host Configuration Protocol 动态主机配置协议
- DHCP服务器使用 udp/67 端口
- DHCP客户端使用 udp/68 端口



# DHCP 工作原理

## 客户端获取IP的过程

1. **客户机请求IP地址：**客户端在网络中广播一个 discover 包 用来请求IP地址， 包中包含客户机的MAC地址和主机名，使服务器能够确认由哪个客户机发送
2. **服务器响应请求：**DHCP服务器收到 discover 包后，会在自己的地址池中寻找是否有合法的IP给其提供，如果有 则将此IP标记来暂时不给其他主机分配，然后给客户端发送一个 offer 包。这个包中包含：客户机的MAC地址；提供的合法IP；子网掩码；租约期限等信息
3. **客户机选择IP：**客户端收到 offer 包后在其中选择IP地址(有多台DHCP同时发送则遵循先到先得原则)，并广播一个 request 包到所有DHCP服务器，告诉其他服务器我已经使用了这个 IP
4. **服务器确认租期：**服务器在给客户端发送一个 acknowledge 包来进行确认



## 同网段多DHCP服务

- DHCP服务必须基于本地
- 先到先得的原则（客户端使用最先收到的offer包中的IP）



## DHCP相关协议

- arp：IP --> MAC
- rarp：MAC --> IP



## DHCP 服务续租概述

- **50%** ：租赁时间达到50%时来续租，刚向DHCP服务器发向新的DHCPREQUEST请求。如果dhcp服务没有拒绝的理由，则回应DHCPACK信息。当DHCP客户端收到该应答信息后，就重新开始新的租用周期
- **87.5%**：如果之前DHCP Server没有回应续租请求，等到租约期的7/8时，主机会再发送一次广播请求
- DHCP还没有回应，则IP回收
- **补充：**
  - 长租期：IP相对稳定，网络资源消耗较少，但是浪费IP资源（可能存在客户端已经关机 不在使用分配的IP，但因为租期还未结束 所以仍然占用IP）
  - 短租期：IP相对不稳定，网络资源消耗较多，但是IP资源可以充分利用，可以实现较少IP为较多的主机服务

**DHCP所分配的地址，如果续租成功，客户端将一直持有这个IP对吗**

- 如果 DHCP 客户端成功地续租了 IP 地址，那么客户端会继续持有这个 IP 地址。续租成功后，客户端将在新的租约周期内继续使用该 IP 地址，直到租约期到期或者客户端释放该 IP 地址。
- 需要注意的是，DHCP 服务器可能会在续租时更改分配给客户端的 IP 地址，尤其是在网络中有多个 DHCP 服务器的情况下。因此，在客户端续租成功后，它可能会持有新的 IP 地址。但是在同一 DHCP 服务器下，如果续租成功，则客户端将持有相同的 IP 地址。





# DHCP 跨网络工作原理

- DHCP客户端和DHCP服务端通常在同一个网段中，因为DHCP客户端发送的discover报文是基于广播发送的，而广播报文无法穿过路由器
- 如果DHCP客户端和DHCP服务端不在同一个网段中，然后在每个网段都配置一个DHCP服务器的话这样成本比较高，不适合生产环境，有以下两种解决方案
  1. dhcp relay agent: 中继代理（**大多数路由器都支持此功能**，在**路由器接口上启用中继代理**，然后路由器会将接受到的dhcp相关的广播包转发到其他网段）
  2. RFC 1542 Compliant Routers （**使用支持 RFC 1542 的路由器**，它可以允许dhcp的广播报文穿过）





# DHCP 企业架构

- 单台DHCP服务有单点失败问题，所以生产中通常是两台或更多
- IP分配采用二八原则，（即在本网段的DHCP服务器将IP分配百分之80，需要跨路由的DHCP服务器分配百分之20），下面以两台DHCP服务器举例
- **图解：**
  1. 首先 10.0.0.0/8网段 或 172.16.0.0/12 网段 的主机**只会去本网段的DHCP服务器获取地址**，因为本网段的DHCP服务器会首先受到广播报文，而广播报文只会在本网段接受，所以DHCP服务器只会将本网段的IP交给客户端
  2. 如果本网段的DHCP服务器宕机，那么这时本网段的主机会跨路由器通过代理来向其他网段的DHCP服务器来获取IP
  3. **如果在本网段的DHCP服务器配置了其他网段的IP，那么DHCP服务器将无法启动**

![dhcp冗余](dhcp_images\dhcp冗余.png)





# DHCP 服务端实现

- **注意：实现DHCP服务前，先将网络已有DHCP服务，如：mware中的DHCP关闭，访止冲突（实验需要）**

## 实现 DHCP 的软件

- **dnsmasq**：小型服务软件，可以提供dhcp和dns功能

- **ISC dhcp**：相当于 dnsmasq 的升级版，生产中常用，官方网站：https://www.isc.org/

## 安装 DHCP 服务端

- 下面的实验以 ISC dhcp 举例

```bash
#centos8
yum -y install dhcp-server

#centos7
yum -y install dhcp
```

## 准备配置文件并启动 DHCP

```bash
#拷贝配置文件模板
cp /usr/share/doc/dhcp-server/dhcpd.conf.example /etc/dhcp/dhcpd.conf

#修改配置文件模板
# vim /etc/dhcp/dhcpd.conf
option domain-name "baidu.com";
option domain-name-servers 223.5.5.5, 180.76.76.76, 223.6.6.6;
default-lease-time 86400;
max-lease-time 106400;
subnet 10.0.0.0 netmask 255.255.255.0 {
  range 10.0.0.66 10.0.0.88;
  option routers 10.0.0.2;
}

#启动服务
systemctl enable --now dhcpd

#查看端口是否开启
# ss -ntua|grep 67
udp    UNCONN  0        0                  0.0.0.0:67            0.0.0.0:*
```



## 服务端相关文件说明

```bash
# yum -y install  dhcp-server
# rpm -ql dhcp-server
/etc/dhcp/dhcpd.conf #主配置文件
/etc/dhcp/dhcpd6.conf #ipv6 配置文件
/usr/lib/systemd/system/dhcpd.service #主service
/usr/lib/systemd/system/dhcpd6.service #ipv6 service
/usr/sbin/dhcpd #主程序
/usr/share/doc/dhcp-server/dhcpd.conf.example #主配置文件范例
/usr/share/doc/dhcp-server/dhcpd6.conf.example #ipv6 配置范例
/var/lib/dhcpd/dhcpd.leases #地址分配记录
/var/lib/dhcpd/dhcpd6.leases #ipv6 地址分配记录
...
```

## 服务端配置文件说明

```bash
# cp /usr/share/doc/dhcp-server/dhcpd.conf.example /etc/dhcp/dhcpd.conf
# vim /etc/dhcp/dhcpd.conf

option domain-name "example.org"; #自动搜索的后缀（resolv.conf中的search）

option domain-name-servers ns1.example.org, ns2.example.org; #DNS服务器的地址

default-lease-time 600; #地址租期，秒为单位，默认十分钟
max-lease-time 7200; #最大租期

subnet 10.0.0.0 netmask 255.255.255.0 { #网段和子网掩码，根据情况分配
  range 10.0.0.100 10.0.0.200; #地址池范围
  option routers 10.0.0.2; #网关地址
  filename "pxelinux.0"; #指定将由客户端加载的初始引导文件的名称. 应用于无盘工作站
  next-server 10.0.0.18; #指定要从中加载初始引导文件（在filename语句中指定）的服务器的主机地址。Server-name应该是数字 IP 地址或域名，应用于无盘工作站
}

#设置主机mac地址和IP地址间的绑定，还可以设置单独的租期、网关、DNS等...
host testbind { #testbind这个写什么名字都可以
  hardware ethernet 0:0:c0:5d:bd:95; #被绑定主机的mac地址
  fixed-address 10.0.0.238; #固定绑定的地址，可以是设置地址池外的地址，但必须在同一网段内
}
```







# DHCP 客户端实现

- 由 dhcp-client 包提供此功能（系统默认已经安装，和 ISC dhcp 同一个组织研发）

## DHCP 客户端相关文件说明

```bash
# rpm -ql dhcp-client
/usr/sbin/dhclient #客户端程序
/var/lib/dhclient/dhclient.leases#自动获取的IP信息
...
```

## DHCP 客户端命令说明

- 利用 dhclient 命令来实现

```bash
-d #以前台方式运行（默认是以后台方式运行，通常测试加-d）
```



## 客户端获取动态IP地址

### 方法一：手动触发执行

```bash
#测试前相关信息
[root@localhost ~]# hostname -I
10.0.0.7 

#获取IP
[root@localhost ~]# dhclient -d
Internet Systems Consortium DHCP Client 4.2.5
Copyright 2004-2013 Internet Systems Consortium.
All rights reserved.
For info, please visit https://www.isc.org/software/dhcp/

Listening on LPF/eth0/00:0c:29:e8:e9:b0
Sending on   LPF/eth0/00:0c:29:e8:e9:b0
Sending on   Socket/fallback
DHCPDISCOVER on eth0 to 255.255.255.255 port 67 interval 6 (xid=0x6babeb09)
DHCPREQUEST on eth0 to 255.255.255.255 port 67 (xid=0x6babeb09)
DHCPOFFER from 10.0.0.202
DHCPACK from 10.0.0.202 (xid=0x6babeb09)
bound to 10.0.0.69 -- renewal in 40670 seconds. #租期大概为服务端设置租期86400的一一半，因为涉及到服务50%续租


#测试后相关信息
[root@localhost ~]#hostname -I
10.0.0.7 10.0.0.69
[root@localhost ~]# cat /etc/resolv.conf
; generated by /usr/sbin/dhclient-script
search baidu.com
nameserver 223.5.5.5
nameserver 180.76.76.76
nameserver 223.6.6.6


#观察客户端日志
[root@localhost ~]#tail -f /var/lib/dhclient/dhclient.leases 
  option routers 10.0.0.2;
  option dhcp-lease-time 86400;
  option dhcp-message-type 5;
  option domain-name-servers 223.5.5.5,180.76.76.76,223.6.6.6;
  option dhcp-server-identifier 10.0.0.202;
  option domain-name "baidu.com";
  renew 4 2022/03/31 09:58:05;
  rebind 4 2022/03/31 19:40:11;
  expire 4 2022/03/31 22:40:11;
}

#观察服务端日志
[root@dhcp-server ~]# tail -f /var/lib/dhcpd/dhcpd.leases
...
lease 10.0.0.69 {
  starts 3 2022/03/30 14:40:12; #UTC时间
  ends 4 2022/03/31 14:40:12;
  cltt 3 2022/03/30 14:40:12;
  binding state active;
  next binding state free;
  rewind binding state free;
  hardware ethernet 00:0c:29:e8:e9:b0;
}
...
```

### 方法二：修改网卡配置文件

```bash
[root@DHCP-client ~]# vim /etc/sysconfig/network-scripts/ifcfg-eth0 
DEVICE=eth0
NAME=eth0
BOOTPROTO=dhcp
ONBOOT=yes

[root@DHCP-client ~]# nmcli connection reload 
[root@DHCP-client ~]# nmcli connection up eth0
```





# 实现DHCP静态绑定IP

- 首先需要获取到被绑定主机的mac地址

## 获取被绑定主机的mac地址

```bash
[root@DHCP-client ~]# ip address show eth0 
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:cc:63:2f brd ff:ff:ff:ff:ff:ff #00:0c:29:cc:63:2f
    inet 10.0.0.28/16 brd 10.0.255.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fecc:632f/64 scope link 
       valid_lft forever preferred_lft forever
```

## 修改DHCP服务端配置文件

```bash
[root@DHCP-server ~]# vim /etc/dhcp/dhcpd.conf 
host fantasia {
  hardware ethernet 00:0c:29:cc:63:2f;
  fixed-address 10.0.0.238;
}


[root@DHCP-server ~]# systemctl restart dhcpd
```

## 客户端配置

```bash
[root@DHCP-client ~]# vim /etc/sysconfig/network-scripts/ifcfg-eth0 
DEVICE=eth0
NAME=eth0
BOOTPROTO=dhcp
ONBOOT=yes

[root@DHCP-client ~]# nmcli connection reload 
[root@DHCP-client ~]# nmcli connection up eth0
```

## 客户端测试

```bash
[root@DHCP-client ~]# ip address show eth0 
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:cc:63:2f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.238/24 brd 10.0.0.255 scope global dynamic noprefixroute eth0
       valid_lft 425sec preferred_lft 425sec
    inet6 fe80::20c:29ff:fecc:632f/64 scope link 
       valid_lft forever preferred_lft forever
```






# DHCP 相关管理工具

## 查看DHCP分配地址有效期

### dhclient

在 Linux 中，可以使用 `dhclient` 命令来获取 DHCP 分配地址的信息，其中包括有效期。具体命令如下：

```
dhclient -v [interface_name]
```

其中，`-v` 参数表示详细输出，`[interface_name]` 是指定的网络接口名称。执行该命令后，会输出 DHCP 服务器分配给该接口的详细信息，包括 IP 地址、子网掩码、网关、DNS 服务器和租约有效期等信息。

如果只想查看租约有效期信息，可以使用以下命令：

```
dhclient -q -p -1 [interface_name] | grep 'dhcp-server-identifier\|expiry'
```

其中，`-q` 参数表示静默模式，`-p -1` 表示不续约租约，`grep` 命令用于查找 `dhcp-server-identifier` 和 `expiry` 两个关键词。执行该命令后，会输出 DHCP 服务器的标识和租约有效期信息。



### ip

`ip` 命令：`ip` 命令是 Linux 中一个非常强大的网络配置工具，可以用来查看和配置网络接口信息。查看 DHCP 租约有效期的命令如下：

```
ip addr show [interface_name]
```

其中，`[interface_name]` 是指定的网络接口名称。执行该命令后，会输出网络接口的详细信息，包括 IP 地址、子网掩码、网关和租约有效期等信息。



### nmcli

`nmcli` 命令：`nmcli` 命令是 NetworkManager 的命令行界面工具，可以用来管理网络设置。查看 DHCP 租约有效期的命令如下：

```
nmcli device show [interface_name]
```

其中，`[interface_name]` 是指定的网络接口名称。执行该命令后，会输出网络接口的详细信息，包括 IP 地址、子网掩码、网关和租约有效期等信息。



### ifconfig

`ifconfig` 命令：`ifconfig` 命令是 Linux 中一个旧的网络配置工具，可以用来查看和配置网络接口信息。查看 DHCP 租约有效期的命令如下：

```
ifconfig [interface_name]
```

其中，`[interface_name]` 是指定的网络接口名称。执行该命令后，会输出网络接口的详细信息，包括 IP 地址、子网掩码、网关和租约有效期等信息。



## 查看是否是DHCP获取地址

### 通过命令查看

- **准确**

```bash
#先获取目前的连接信息
[root@localhost ~]# nmcli con show
NAME         UUID                                  TYPE      DEVICE 
System eth0  47b568c4-32fb-4237-ac6d-137b91fde8d2  ethernet  eth0   

#查看指定连接的详细信息
[root@localhost ~]# nmcli con show "System eth0"
...
DHCP4.OPTION[1]:                        broadcast_address = 192.168.122.255
DHCP4.OPTION[2]:                        dhcp_lease_time = 3600
DHCP4.OPTION[3]:                        dhcp_message_type = 5
DHCP4.OPTION[4]:                        dhcp_rebinding_time = 3150
DHCP4.OPTION[5]:                        dhcp_renewal_time = 1800
DHCP4.OPTION[6]:                        dhcp_server_identifier = 192.168.122.1
DHCP4.OPTION[7]:                        domain_name_servers = 192.168.122.1
DHCP4.OPTION[8]:                        expiry = 1649221836
DHCP4.OPTION[9]:                        ip_address = 192.168.122.208
DHCP4.OPTION[10]:                       network_number = 192.168.122.0
DHCP4.OPTION[11]:                       next_server = 192.168.122.1
DHCP4.OPTION[12]:                       requested_broadcast_address = 1
DHCP4.OPTION[13]:                       requested_classless_static_routes = 1
DHCP4.OPTION[14]:                       requested_domain_name = 1
DHCP4.OPTION[15]:                       requested_domain_name_servers = 1
DHCP4.OPTION[16]:                       requested_domain_search = 1
DHCP4.OPTION[17]:                       requested_host_name = 1
DHCP4.OPTION[18]:                       requested_interface_mtu = 1
DHCP4.OPTION[19]:                       requested_ms_classless_static_routes = 1
DHCP4.OPTION[20]:                       requested_nis_domain = 1
DHCP4.OPTION[21]:                       requested_nis_servers = 1
DHCP4.OPTION[22]:                       requested_ntp_servers = 1
DHCP4.OPTION[23]:                       requested_rfc3442_classless_static_routes = 1
DHCP4.OPTION[24]:                       requested_root_path = 1
DHCP4.OPTION[25]:                       requested_routers = 1
DHCP4.OPTION[26]:                       requested_static_routes = 1
DHCP4.OPTION[27]:                       requested_subnet_mask = 1
DHCP4.OPTION[28]:                       requested_time_offset = 1
DHCP4.OPTION[29]:                       requested_wpad = 1
...
```

### 通过网卡配置文件查看

- **不太准确**

```bash
[root@localhost ~]# cat /etc/sysconfig/network-scripts/ifcfg-eth0 
# Generated by parse-kickstart
DEVICE="eth0"
IPV6INIT="yes"
BOOTPROTO="dhcp"
UUID="47b568c4-32fb-4237-ac6d-137b91fde8d2"
ONBOOT="yes"
```



# DHCP分配的IP地址冲突解决

如果Ubuntu下DHCP分配的IP地址与其他设备的IP地址冲突，可以尝试以下步骤来更改它：

1. 打开终端，输入以下命令以编辑DHCP服务器的配置文件：

   ```
   sudo nano /etc/dhcp/dhcpd.conf
   ```

2. 使用箭头键和Page Up/Page Down键浏览文件，找到被分配的IP地址的行。通常，它们位于类似于以下内容的区域：

   ```bash
   subnet 192.168.0.0 netmask 255.255.255.0 {
       range 192.168.0.10 192.168.0.50;
       option routers 192.168.0.1;
       option domain-name-servers 192.168.0.1;
   }
   ```

   在这个例子中，范围从192.168.0.10到192.168.0.50。如果发现与其他设备的IP地址冲突，请更改范围内的地址，例如：

   ```
   range 192.168.0.51 192.168.0.100;
   ```

3. 更改完毕后，按Ctrl+O保存更改，按Ctrl+X退出编辑器。

4. 重新启动DHCP服务器以使更改生效：

   ```
   sudo systemctl restart isc-dhcp-server
   ```

这样，DHCP服务器现在应该分配新的、没有与其他设备冲突的IP地址了。



**如果两个客户端地址冲突了呢？**

如果两个客户端的IP地址冲突了，您可以按照以下步骤进行解决：

1. 手动更改其中一个客户端的IP地址。您可以通过以下步骤更改Ubuntu客户端的IP地址：

   - 打开“Settings”应用程序，然后单击“Network”选项卡。
   - 找到您使用的网络连接，并单击其名称。
   - 在弹出菜单中选择“IPv4”选项卡。
   - 更改“Method”下拉列表框的值为“Manual”。
   - 点击“Add”按钮，输入一个可用的IP地址、子网掩码和网关地址，并单击“Apply”保存更改。

2. 如果手动更改IP地址不是可行的解决方案，您可以通过清除DHCP客户端的缓存来尝试解决问题。在终端中输入以下命令：

   ```
   sudo dhclient -r
   ```

   这会释放与DHCP服务器的租约，并清除DHCP客户端的缓存。然后，您可以再次尝试使用DHCP客户端获取IP地址。

   如果两个客户端的MAC地址相同，则无法通过更改IP地址或清除DHCP客户端的缓存来解决冲突。在这种情况下，您需要确保所有设备都具有唯一的MAC地址，并且没有两个设备使用相同的MAC地址。



# 改为静态IP

**办公室的网线是DHCP动态分配IP地址的，如何将其改为静态，并且还能在办公区内直接访问**

- 为了确保在办公区内直接访问，您需要确保您的静态IP地址与办公室的网络设置相匹配。这意味着您的静态IP地址必须在办公室网络的子网中，而且没有其他设备使用相同的静态IP地址。
- 还需要将网关指向为与办公网相同的网关


