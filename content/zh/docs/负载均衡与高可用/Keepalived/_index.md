---
title: "Keepalived"
---

# keepalived 概述

- **keepalived 是基于VRRP虚拟路由冗余协议来实现服务的高可用性，也是VRRP协议的软件实现**
- 官方网站：https://keepalived.org/
- 官方文档：
  - https://keepalived.org/manpage.html
  - https://keepalived.org/doc/
- 主要功能：
  - 基于vrrp协议完成地址流动
  - 为vip地址所在的节点生成ipvs规则(在配置文件中事先定义)
  - 为ipvs集群的各RS做健康状态检测
  - 基于脚本调用接口完成脚本中定义的功能，进而影响集群事务，因此支持LVS、nginx、haproxy等服务

## 核心工作原理简述
1. Master 节点会周期性地向 Backup 节点发送 VRRP 广播报文。
2. 当 Backup 节点在规定时间内没有收到报文，则认为 Master 宕机。
3. Backup 节点接管 VIP，并发送免费 ARP 更新交换机的 MAC 表。
4. 当原 Master 恢复后，会根据优先级（Priority）重新夺回控制权（如果配置了抢占模式）。

## 主要功能

- 解决静态网关单点失败风险

## 工作层

- **物理层：**路由器、三层交换机
- **软件层：**keepalived

## 工作原理

- 将两个虚拟路由器加入到一个分组中 对外提供的是一个路由器的功能 并且共享同样的VIP（虚拟IP）
- 每个虚拟路由器都有不同的ID作为设备的唯一标识（VRID）
- 虚拟路由器有一个为主、另一个为备 且靠优先级区分（优先级高的则是主）
- **VIP在哪个主机上 哪个主机就会在网络中发送组播或者单播 如果其它BACKUP主机收不到MASTER的信息 则认为MASTER宕机 这时就会按照优先级来选取一个优先级高的主机成为新的MASTER**

## 安全认证

- 防止网络中的其他路由器设置了VRRP但比此VRRP更高的优先级导致请求转发到这台错误的路由器上，所以提供了安全认证的方式：简单字符认证：预共享密钥、MD5

## 工作模式

- 主/备：单虚拟路由器
- 主/主：主/备（虚拟路由器1），备/主（虚拟路由器2）



# keepalived 架构

<img src="https://keepalived.org/doc/_images/software_design.png" alt="https://keepalived.org/doc/_images/software_design.png" style="zoom: 80%;" />

## User Space

- **核心组件：**
  - **VRRP Stack**：VIP信息通告
  - **Checkers**：监测 real server
  - **System call**：实现 vrrp 协议状态转换时调用脚本的功能
  - **SMTP**：邮件组件
  - **IPVS warpper**：生成 IPVS 规则
  - **Netlink Reflector**：网络接口
  - **Watch Dog**：监控进程
- **控制组件：**提供 keepalived.conf 的解析器，完成 keepalived 的配置
- **IO复用器：**针对网络目的而优化的自己的线程抽象
- **内存管理组件：**为某些通用的内存管理功能（例如分配、重新分配、发布等）提供访问权限

## Kernel Space

- **IPVS**
- **NETLINK**





# Keepalived 进程结构

```bash
PID 111 Keepalived #<--父进程监控子进程
            112 \_ Keepalived #<-- VRRP 子进程
            113 \_ Keepalived #<-- 健康检查 子进程
```





# keepalived 安装

## 编译安装

- **生产中一般使用编译安装**

### 安装依赖包

#### centos

```bash
yum -y install make gcc curl openssl-devel libnl3-devel net-snmp-devel
```

#### Ubuntu

```bash
apt -y install make gcc curl libssl-dev libnl-3-dev libsnmp-dev
```

### 下载安装包并编译安装

```bash
# cd /usr/local/src/

# wget https://keepalived.org/software/keepalived-2.2.3.tar.gz

# tar xf keepalived-2.2.3.tar.gz
 
# cd keepalived-2.2.3

#按默认规则生成安装文件
# ./configure --prefix=/apps/keepalived

#编译安装
# make && make install

# 拷贝service文件
# cp /usr/local/src/keepalived-2.2.3/keepalived/keepalived.service /etc/systemd/system/

#daemon-reload
# systemctl daemon-reload

#移动配置文件（否则启动时会报错）
# mv /apps/keepalived/etc/keepalived /etc/

#创建运行程序的软连接
# ln -s /apps/keepalived/sbin/keepalived /sbin/

#启动
# systemctl enable --now keepalived.service 
```

### 相关文件说明

```bash
#service文件
/etc/systemd/system/keepalived.service #后期copy的
/usr/local/src/keepalived-2.2.3/keepalived/keepalived.service #解压文件夹带的
```





## 包安装

```bash
#Centos
yum -y install keepalived

#Ubuntu
apt -y install keepalived
```









# keepalived 启用日志

- 默认keepalived是不启用日志功能的，需要对配置文件进行一定修改并结合rsyslog服务才可以实现记录keepalived日志的功能

## 观察默认配置

```bash
#此文件路径已经在service文件中的EnvironmentFile选项中指定
[root@keepalived1 ~]# vim /lib/systemd/system/keepalived.service 
...
[Service]
...
EnvironmentFile=-/etc/sysconfig/keepalived #此文件中记录了keepalived的环境变量
ExecStart=/usr/sbin/keepalived $KEEPALIVED_OPTIONS #keepalived的启动选项
...

#环境变量文件
[root@keepalived1 ~]# cat /etc/sysconfig/keepalived
...
KEEPALIVED_OPTIONS="-D"
...

#本质上keepalived启动时就是使用了：keepalived -D 来进行启动的，而-D表示日志详细信息
[root@keepalived1 ~]# keepalived --help
...
  -D, --log-detail             Detailed log messages
...
```

## 启动记录日志功能

```bash
#修改默认keepalived环境变量
[root@keepalived1 ~]# vim  /etc/sysconfig/keepalived
...
KEEPALIVED_OPTIONS="-D -S 6"

#修改rsyslog配置文件
[root@keepalived1 ~]# vim /etc/rsyslog.conf
...
local6.*                                                /var/log/keepalived.log

#重新启动 keepalived 和 rsyslog的服务
[root@keepalived1 ~]# systemctl restart keepalived.service rsyslog.service

#查看日志文件是否生成
[root@keepalived1 ~]# ls /var/log/k*
/var/log/keepalived.log
```

## 测试

```bash
[root@keepalived1 ~]# tail -f /var/log/keepalived.log 
Feb 18 00:08:25 keepalived1 Keepalived_vrrp[14267]: Sending gratuitous ARP on eth0 for 10.0.0.100
Feb 18 00:08:25 keepalived1 Keepalived_vrrp[14267]: (WEB) Sending/queueing gratuitous ARPs on eth0 for 10.0.0.100
Feb 18 00:08:25 keepalived1 Keepalived_vrrp[14267]: Sending gratuitous ARP on eth0 for 10.0.0.100
...

#模拟停止服务
[root@keepalived1 ~]# systemctl stop keepalived.service 


#观察日志记录
[root@keepalived1 ~]# tail -f /var/log/keepalived.log
Feb 18 00:09:46 keepalived1 Keepalived[14266]: Stopping
Feb 18 00:09:46 keepalived1 Keepalived_vrrp[14267]: (WEB) sent 0 priority
Feb 18 00:09:46 keepalived1 Keepalived_vrrp[14267]: (WEB) removing VIPs.
Feb 18 00:09:47 keepalived1 Keepalived_vrrp[14267]: Stopped - used 0.032561 user time, 0.031172 system time
Feb 18 00:09:47 keepalived1 Keepalived[14266]: Stopped Keepalived v2.0.10 (11/12,2018)

```





# keepalived  实现主备模式

## 实现虚拟飘动VIP

### 环境准备

| IP        | VIP        | service    | hostname    |
| --------- | ---------- | ---------- | ----------- |
| 10.0.0.18 | 10.0.0.100 | Keepalived | Keepalived1 |
| 10.0.0.28 | 10.0.0.100 | Keepalived | Keepalived2 |

### 配置keepalived

- keepalived安装过程省略...

#### keepalived1

```bash
[root@keepalived1 ~]# vim /etc/keepalived/keepalived.conf
global_defs {
   router_id KA1  #指定名称
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance WEB { #定义一个服务名称
    state MASTER
    interface eth0
    virtual_router_id 6 #指定路由器组的ID，属于同一个虚拟路由组则此值必须相同
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666  #设密码
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0  #设置虚拟IP
    }
}
```

#### keepalived2

```bash
[root@keepalived2 ~]# vim /etc/keepalived/keepalived.conf
global_defs {
   router_id KA2
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance WEB {
    state BACKUP #设为BACKUP
    interface eth0
    virtual_router_id 6
    priority 80 #优先级调整
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0
    }
}
```

### 启动keepalived

```bash
[root@keepalived1 ~]# systemctl enable --now keepalived.service 
[root@keepalived2 ~]# systemctl enable --now keepalived.service
```

### 测试

```bash
#可以看到VIP已经飘动到了keepalived1节点上（因为keepalived1的优先级更高）
[root@keepalived1 ~]# ip a show eth0 
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:1c:e1:d3 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.18/16 brd 10.0.255.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet 10.0.0.100/24 scope global eth0 #VIP
       valid_lft forever preferred_lft forever
[root@keepalived2 ~]# ip a show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:cc:63:2f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.28/16 brd 10.0.255.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fecc:632f/64 scope link 
       valid_lft forever preferred_lft forever

#观察网络中的广播信息，可以看到10.0.0.18每隔一秒向226.6.6.6发一次通告，告知vrid为6 prio为100等信息，226.6.6.6由此判断10.0.0.18为存活状态
[root@keepalived1 ~]# tcpdump -i eth0 -nn host 226.6.6.6
dropped privs to tcpdump
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
14:52:33.216159 IP 10.0.0.18 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 100, authtype simple, intvl 1s, length 20

#停止keepalived1
[root@keepalived1 ~]# systemctl stop keepalived.service 

#观察IP飘动情况，可以看到VIP已经飘到了keepalived2
[root@keepalived1 ~]# ip addr show eth0 
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:1c:e1:d3 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.18/16 brd 10.0.255.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
[root@keepalived2 ~]# ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:cc:63:2f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.28/16 brd 10.0.255.255 scope global noprefixroute eth0
       valid_lft forever preferred_lft forever
    inet 10.0.0.100/24 scope global eth0 #VIP
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fecc:632f/64 scope link 
       valid_lft forever preferred_lft forever

#在网络中抓包查看，226.6.6.6因收不到10.0.0.18发的包 由此判断10.0.0.28宕机，变将VIP飘动到10.0.0.28上，再由10.0.0.28发送包给226.6.6.6
[root@keepalived1 ~]# tcpdump -i eth0 -nn host 226.6.6.6
dropped privs to tcpdump
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
15:02:36.282465 IP 10.0.0.28 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 80, authtype simple, intvl 1s, length 20
```







# keepalived 抢占式和非抢占式

## 抢占式和非抢占式概述

- keepalived 提供了两种工作模式 分别是抢占式和非抢占式
- **不指定则默认为抢占式，生产中建议使用非抢占式，因为如果使用抢占式的话当优先级高的主机恢复后 会将VIP抢占回来 这样会造成一定程度上的网络波动**

- **抢占式：**
  - master(优先级高的主机)宕机 则将VIP飘动到backup(优先级低的主机)上，**当master恢复后 会将VIP抢占回来**
  - 抢占式又分为两种：
    - 立刻抢占 即master一旦恢复 则立刻将VIP抢占回来 **默认值**
    - 延迟抢占 即master一旦恢复 则根据设置的预定时间来进行抢占 即时间到达阈值再把VIP抢占回来
- **非抢占式：**
  - master宕机 则将VIP飘动到backup上，**当master恢复后 不会将VIP抢占回来**
  - 如果后续恢复的主机宕机 **只要最初宕机的主机已经恢复 那么依旧会将VIP飘动到原有宕机但已经恢复的主机上**



## 范例：实现非抢占模式

### 非抢占模式相关配置

- **注意：实现非抢占模式需要将所有 keepalived 服务器的 state 配置为 BACKUP**
- **需要在每个keepalived组中的主机都要进行配置**
- 在 vrrp_instance 段设置

```bash
vrrp_instance WEB {
...
    nopreempt #开启非抢占模式
}
```



### 环境准备

| IP        | VIP        | service    | hostname    |
| --------- | ---------- | ---------- | ----------- |
| 10.0.0.18 | 10.0.0.100 | Keepalived | Keepalived1 |
| 10.0.0.28 | 10.0.0.100 | Keepalived | Keepalived2 |

### keepalived1配置

```bash
[root@keepalived2 ~]# vim /etc/keepalived/keepalived.conf
...
global_defs {
   router_id KA1
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance WEB {
    state BACKUP #都为BACKUP
    interface eth0
    virtual_router_id 6
    priority 100 #优先级高
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0
    }
    nopreempt #开启非抢占模式
}
...
```

### keepalived2配置

```bash
[root@keepalived2 ~]# vim /etc/keepalived/keepalived.conf
...
global_defs {
   router_id KA2
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance WEB {
    state BACKUP #都为BACKUP
    interface eth0
    virtual_router_id 6
    priority 80 #优先级低
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0
    }
    nopreempt #开启非抢占模式
}
...
```

### 测试

```bash
#目前因为10.0.0.18的优先级高，所以VIP10.0.0.100在10.0.0.18上面，下面是抓包情况：
[root@keepalived1 ~]# tcpdump -nn host 226.6.6.6
...
18:48:16.988359 IP 10.0.0.18 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 100, authtype simple, intvl 1s, length 20

#下面将10.0.0.18停止服务
[root@keepalived1 ~]# systemctl stop keepalived.service

#抓包观察状况，可以发现VIP已经飘动到10.0.0.28上面
[root@keepalived1 ~]# tcpdump -nn host 226.6.6.6
19:03:16.459117 IP 10.0.0.28 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 80, authtype simple, intvl 1s, length 20

#将10.0.0.18启动服务
[root@keepalived1 ~]# systemctl start keepalived.service 

#再次抓包观察状况，可以发现VIP还是在10.0.0.28上面，因此非抢占模式已经实现
[root@keepalived1 ~]# tcpdump -nn host 226.6.6.6
19:03:16.459117 IP 10.0.0.28 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 80, authtype simple, intvl 1s, length 20

#将10.0.0.28停止服务
[root@keepalived2 ~]# systemctl stop keepalived.service 

#再次抓包观察状况，因为10.0.0.18已经恢复服务，所以虽然开启了非抢占模式，但只要原先宕机的节点已经恢复 那么就能再次将VIP飘动到原有宕机但已经恢复的主机上
[root@keepalived1 ~]# tcpdump -nn host 226.6.6.6
19:05:20.699169 IP 10.0.0.18 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 100, authtype simple, intvl 1s, length 20
```





## 范例：实现延迟抢占模式

### 延迟抢占模式相关配置

- **注意：实现延迟抢占模式需要将所有 keepalived 服务器的 state 配置为 BACKUP，并且不要启用 vrrp_strict**

- 优先级低主机的无需开启延迟抢占
- 在 vrrp_instance 段设置

```bash
vrrp_instance WEB {
...
    preempt_delay 60 #延迟抢占时间设为60秒，不指定则默认为300秒
}
```

### 环境准备

| IP        | VIP        | service    | hostname    |
| --------- | ---------- | ---------- | ----------- |
| 10.0.0.18 | 10.0.0.100 | Keepalived | Keepalived1 |
| 10.0.0.28 | 10.0.0.100 | Keepalived | Keepalived2 |

### keepalived1配置

```bash
[root@keepalived1 ~]# vim /etc/keepalived/keepalived.conf
...
global_defs {
   router_id KA1
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance WEB {
    state BACKUP #都为BACKUP
    interface eth0
    virtual_router_id 6
    priority 100 #优先级高
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0
    }
    preempt_delay 60 #延迟抢占时间设为60秒，不指定则默认为300秒
}
...
```

### keepalived2配置

```bash
[root@keepalived2 ~]# vim /etc/keepalived/keepalived.conf
...
global_defs {
   router_id KA2
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance WEB {
    state BACKUP #都为BACKUP
    interface eth0
    virtual_router_id 6
    priority 80 #优先级低
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0
    }
}   
...
```

### 测试

```bash
#目前因为10.0.0.18的优先级高，所以VIP10.0.0.100在10.0.0.18上面，下面是抓包情况：
[root@keepalived1 ~]# tcpdump -nn host 226.6.6.6
...
18:48:16.988359 IP 10.0.0.18 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 100, authtype simple, intvl 1s, length 20

#下面将10.0.0.18停止服务
[root@keepalived1 ~]# systemctl stop keepalived.service

#抓包观察状况，可以发现VIP已经飘动到10.0.0.28上面
[root@keepalived1 ~]# tcpdump -nn host 226.6.6.6
19:03:16.459117 IP 10.0.0.28 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 80, authtype simple, intvl 1s, length 20

#将10.0.0.18启动服务并记录时间
[root@keepalived1 ~]# date ; systemctl start keepalived.service
Thu Feb 17 19:24:07 CST 2022


#再次抓包观察状况，可以发现VIP还是在10.0.0.28上面，因为开启了延迟抢占，所以VIP并不会立刻被10.0.0.18抢占
[root@keepalived1 ~]# date ; tcpdump -nn host 226.6.6.6
Thu Feb 17 19:24:24 CST 2022
...
19:03:16.459117 IP 10.0.0.28 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 80, authtype simple, intvl 1s, length 20

#过一分钟进行查看，可以看到VIP已经转移到10.0.0.18，因此延迟抢占模式生效
[root@keepalived1 ~]# date ; tcpdump -nn host 226.6.6.6
Thu Feb 17 19:25:14 CST 2022
...
19:25:16.291817 IP 10.0.0.18 > 226.6.6.6: VRRPv2, Advertisement, vrid 6, prio 100, authtype simple, intvl 1s, length 20
```













# keepalived 实现单播模式

## 单播模式概述

- 单播模式相对组播 点对点传输可以减少带宽等性能消耗，**生产中建议使用**


## 单播模式相关配置

- **注意：启用单播，不能启用 vrrp_strict，并且vrrp_mcast_group4多播设置会失效**
- vrrp_instance段中设置
- **在每个keepalived主机上都要配**

```bash
vrrp_instance WEB {
...
  unicast_src_ip 10.0.0.8  #本机地址
  unicast_peer {
    10.0.0.18 #远程主机地址
    ... #如果有多个keepalived，还需将其他的IP地址也进行添加（如果存在多组keepalived 则要注意不要填错）
  }
}
```

## 范例：实现单播模式

### 环境准备

| IP        | VIP        | service    | hostname    |
| --------- | ---------- | ---------- | ----------- |
| 10.0.0.18 | 10.0.0.100 | Keepalived | Keepalived1 |
| 10.0.0.28 | 10.0.0.100 | Keepalived | Keepalived2 |

### keepalived1配置

```bash
[root@keepalived1 ~]# vim /etc/keepalived/keepalived.conf
global_defs {
   router_id KA1
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
}

vrrp_instance WEB {
    state BACKUP
    interface eth0
    virtual_router_id 6
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0
    }
    nopreempt
    unicast_src_ip 10.0.0.18 #指定本机IP
    unicast_peer {
    10.0.0.28 #指定远程keepalived主机IP
  }
}
```

### keepalived2配置

```bash
[root@keepalived2 ~]# vim /etc/keepalived/keepalived.conf
global_defs {
   router_id KA2
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
}

vrrp_instance WEB {
    state BACKUP
    interface eth0
    virtual_router_id 6
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
        10.0.0.100/24 dev eth0 lable eth0:0
    }
    nopreempt
    unicast_src_ip 10.0.0.28 #指定本机IP
    unicast_peer {
    10.0.0.18 #指定远程keepalived主机IP
  }
```

### 抓包测试

```bash
#此刻VIP在10.0.0.28上，因为配置中使用的是非抢占模式 所以即使10.0.0.18优先级高 也不会将10.0.0.28的VIP抢过来
[root@keepalived1 ~]# tcpdump -nn host 10.0.0.28
20:27:42.727536 IP 10.0.0.28 > 10.0.0.18: VRRPv2, Advertisement, vrid 6, prio 80, authtype simple, intvl 1s, length 20

#模拟10.0.0.28宕机
[root@keepalived2 ~]# systemctl stop keepalived.service 

#继续抓包查看，可以看到已经实现了点对点的单播
[root@keepalived1 ~]# tcpdump -nn src host 10.0.0.18 and dst host 10.0.0.28
20:38:09.366561 IP 10.0.0.18 > 10.0.0.28: VRRPv2, Advertisement, vrid 6, prio 100, authtype simple, intvl 1s, length 20
```





# keepalived 实现双主模式

- MASTER/BACKUP 的单主架构，同一时间只有一个keepalived对外提供服务，MASTER很忙 BACKUP却很空闲，而使用MASTER/MASTER的双主模式可以将VIP平摊在每个keepalived节点上，所以可以很好的解决单主机性能瓶颈的问题

## 双主模式概述

- 主/主模式：主/备（虚拟路由器1），备/主（虚拟路由器2）

- 双主模式可以平摊VIP，使多台主机可以均匀负载，并且在一台主机宕机时可以将其VIP转移到其他机器上

## 环境准备

| IP        | VIP                     | service    | hostname    |
| --------- | ----------------------- | ---------- | ----------- |
| 10.0.0.18 | 10.0.0.100 ~ 10.0.0.105 | Keepalived | Keepalived1 |
| 10.0.0.28 | 10.0.0.106 ~ 10.0.0.110 | Keepalived | Keepalived2 |

## keepalived1配置

### 创建子配置文件目录

```bash
[root@keepalived1 ~]# mkdir -p /etc/keepalived/conf.d/
```

### 在主配置文件中定义子配置文件

```bash
#定义子配置文件
[root@keepalived1 ~]# vim /etc/keepalived/keepalived.conf
global_defs {
   router_id KA1
}

include /etc/keepalived/conf.d/*.conf
```

### 定义WEB1子配置文件

```bash
[root@keepalived1 ~]# vim /etc/keepalived/conf.d/keepalived_WEB1.conf 
vrrp_instance WEB1 {
    state MASTER
    interface eth0
    virtual_router_id 66
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
10.0.0.100/24 dev eth0 label eth0:0
10.0.0.101/24 dev eth0 label eth0:1
10.0.0.102/24 dev eth0 label eth0:2
10.0.0.103/24 dev eth0 label eth0:3
10.0.0.104/24 dev eth0 label eth0:4
10.0.0.105/24 dev eth0 label eth0:5
    }
    unicast_src_ip 10.0.0.18
    unicast_peer {
    10.0.0.28
  }
}
```

### 定义WEB2子配置文件

```bash
[root@keepalived1 ~]# vim /etc/keepalived/conf.d/keepalived_WEB2.conf
vrrp_instance WEB2 {
    state BACKUP
    interface eth0
    virtual_router_id 88
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
10.0.0.106/24 dev eth0 label eth0:6
10.0.0.107/24 dev eth0 label eth0:7
10.0.0.108/24 dev eth0 label eth0:8
10.0.0.109/24 dev eth0 label eth0:9
10.0.0.110/24 dev eth0 label eth0:10
    }
    unicast_src_ip 10.0.0.18
    unicast_peer {
    10.0.0.28
  }
}
```



## keepalived2配置

### 创建子配置文件目录

```bash
[root@keepalived2 ~]# mkdir -p /etc/keepalived/conf.d/
```

### 在主配置文件中定义子配置文件

```bash
#定义子配置文件
[root@keepalived2 ~]# vim /etc/keepalived/keepalived.conf
global_defs {
   router_id KA2
}

include /etc/keepalived/conf.d/*.conf
```

### 定义WEB1子配置文件

```bash
[root@keepalived2 ~]# vim /etc/keepalived/conf.d/keepalived_WEB1.conf
vrrp_instance WEB1 {
    state BACKUP
    interface eth0
    virtual_router_id 66
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
10.0.0.100/24 dev eth0 label eth0:0
10.0.0.101/24 dev eth0 label eth0:1
10.0.0.102/24 dev eth0 label eth0:2
10.0.0.103/24 dev eth0 label eth0:3
10.0.0.104/24 dev eth0 label eth0:4
10.0.0.105/24 dev eth0 label eth0:5
    }
    unicast_src_ip 10.0.0.28
    unicast_peer {
    10.0.0.18
  }
}
```

### 定义WEB2子配置文件

```bash
[root@keepalived2 ~]# vim /etc/keepalived/conf.d/keepalived_WEB2.conf
vrrp_instance WEB2 {
    state MASTER
    interface eth0
    virtual_router_id 88
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 666
    }
    virtual_ipaddress {
10.0.0.106/24 dev eth0 label eth0:6
10.0.0.107/24 dev eth0 label eth0:7
10.0.0.108/24 dev eth0 label eth0:8
10.0.0.109/24 dev eth0 label eth0:9
10.0.0.110/24 dev eth0 label eth0:10
    }
    unicast_src_ip 10.0.0.28
    unicast_peer {
    10.0.0.18
  }
}
```



## 测试

```bash
#两个keepalived节点都各自平摊了VIP
[root@keepalived1 ~]# hostname -I | tr ' ' '\n'
10.0.0.18
10.0.0.100
10.0.0.101
10.0.0.102
10.0.0.103
10.0.0.104
10.0.0.105
[root@keepalived2 ~]# hostname -I | tr ' ' '\n'
10.0.0.28
10.0.0.106
10.0.0.107
10.0.0.108
10.0.0.109
10.0.0.110

#模拟keepalived1宕机
[root@keepalived1 ~]# systemctl stop keepalived.service 

#观察IP飘动情况，可以看到所有VIP都已经转移到keepalived2上
[root@keepalived1 ~]# hostname -I | tr ' ' '\n'
10.0.0.18
[root@keepalived2 ~]# hostname -I | tr ' ' '\n'
10.0.0.28
10.0.0.106
10.0.0.107
10.0.0.108
10.0.0.109
10.0.0.110
10.0.0.100
10.0.0.101
10.0.0.102
10.0.0.103
10.0.0.104
10.0.0.105

#模拟keepalived1恢复
[root@keepalived1 ~]# systemctl start keepalived.service 

#因为使用的是抢占式模式，所以可以看到VIP又恢复到了最初的情况
[root@keepalived1 ~]# hostname -I | tr ' ' '\n'
10.0.0.18
10.0.0.100
10.0.0.101
10.0.0.102
10.0.0.103
10.0.0.104
10.0.0.105
[root@keepalived2 ~]# hostname -I | tr ' ' '\n'
10.0.0.28
10.0.0.106
10.0.0.107
10.0.0.108
10.0.0.109
10.0.0.110
```







# keepalived 优化总结

- 开启单播模式，因为点对点传输可以减少带宽等性能消耗
- 使用非抢占模式，因为如果使用抢占式的话当优先级高的主机恢复后 会将VIP抢占回来 这样会造成一定程度上的网络波动








## 配置文件
### 配置文件结构
- 配置文件位置：`/etc/keepalived/keepalived.conf`
```sh
# 全局配置
global_defs {
...
}

# VIP 配置
vrrp_instance {
...
}


# 虚拟服务器配置，可选
```sh
virtual_server {
...
}

include /etc/keepalived/conf.d/*.conf # 添加此行，可将将配置放在子配置文件中
```


### 全局配置 (global_defs)
这部分主要设置故障时的报警通知方式和路由 ID。
```Bash
global_defs {
   router_id prod-bj-lb01           # 机器标识，通常为物理机主机名，每个节点应唯一
   enable_script_security # 开启脚本开启安全检查
   script_user root # 脚本执行身份（创建一个无登录权限的专用用户运行脚本，但脚本逻辑复杂，需要root权限时，还需要设为root）
   notification_email {
     admin@example.com           # 故障发生时接收报警的邮箱地址
   }
   notification_email_from keepalived@example.com # 发件人邮箱
   smtp_server 127.0.0.1         # 邮件服务器 IP
   smtp_connect_timeout 30       # 连接邮件服务器的超时时间
   vrrp_skip_check_adv_addr      # 检查收到的 VRRP 通告中的 IP 是否有效
   vrrp_strict                   # 严格遵守 VRRP 协议，开启后通常会禁止 VIP 的 ping 和访问，建议谨慎开启
   vrrp_garp_interval 0          # 接口发送免费 ARP 的延迟时间
   vrrp_gna_interval 0           # 网卡发送非请求消息的时间间隔
}
```

### VIP 配置 (vrrp_instance)

- 可以配置多组此字段，针对不同业务 如：web、mysql、redis等

```bash
...
vrrp_instance <STRING> { # 虚拟路由器组，<STRING> 一般为业务名称，例如 DNS_VIP、K8s_Ingress_VIP
    state MASTER # 初始状态，可以为 MASTER 或 BACKUP
    interface ens160 # VIP 使用的物理接
    virtual_router_id 51 # 每个虚拟路由器组的唯一标识，范围：0-255，同属一个虚拟路由器组的 keepalived 节点此值必须相同，与其他虚拟路由器组的此值不能相同，否则服务无法启动
    priority 100 # 优先级，范围：1-254，MASTER 优先级需高于 BACKUP
    advert_int 1 # vrrp通告的时间间隔，默认1s
    # 认证机制
    authentication {
        auth_type PASS # PASS为简单密码，也可以设置为AH 表示IPESC认证(不推荐)
        auth_pass 72198 # 密码，仅前8位有效,同属一个虚拟路由器组的 keepalived 节点此值必须相同
    }
    # VIP地址
    virtual_ipaddress {
        192.168.200.16 # 指定VIP，不指定网卡则默认为eth0，不指定子网掩码则默认为/32
        # 192.168.200.17/24 dev eth0 # 指定子网掩码和网卡
        # 192.168.200.18/16 dev eth2 label eth2:1 # 指定VIP网卡的label
    }
}
```

### 监控脚本配置 (vrrp_script)
用于定期检查服务状态（如 Nginx 是否存活），如果服务挂了，自动降低优先级触发切换。
```sh
vrrp_script check_haproxy {
    script "/etc/keepalived/check_service.sh" # 检测脚本的路径
    interval 2                                # 每 2 秒执行一次脚本
    weight -20                                # 如果脚本返回非 0（失败），优先级减 20
}

# 在 vrrp_instance 段落中引用：
# track_script {
#    check_haproxy
# }
```


### 虚拟服务器配置 (virtual_server)
这部分是可选的，仅在结合 LVS（负载均衡）使用时配置。
```sh
virtual_server 192.168.1.100 80 { # 定义虚拟服务器的 VIP 和端口
    delay_loop 6                  # 健康检查的时间间隔（秒）
    lb_algo rr                    # 负载均衡算法：rr (轮询)
    lb_kind DR                    # 转发模式：DR (直接路由)、NAT、TUN
    persistence_timeout 50        # 会话保持时间（秒）
    protocol TCP                  # 使用协议

    real_server 192.168.1.101 80 { # 定义后端真实服务器的 IP 和端口
        weight 1                   # 权重
        TCP_CHECK {                # 健康检查方式
            connect_timeout 3      # 连接超时时间
            nb_get_retry 3         # 重试次数
            delay_before_retry 3   # 重试间隔
            connect_port 80        # 检查的端口
        }
    }
}
```

### 配置文件示例
#### MASTER 主机
#### BACKUP 主机


## 故障通知

- 当keepalived的状态发生变化时，可以自动触发脚本的执行，那么就可以通过编写脚本 在发生故障时进行触发 从而起到故障通知的效果

- 默认以用户keepalived身份执行脚本，如果此用户不存在 则以root身份执行

- 可以使用以下的配置来实现指定运行脚本的用户

  - ```ABAP
    global_defs {
    ...
       script_user <USER>
    ...
    }
    ```



### 通知脚本类型

```bash
notify_master <STRING>|<QUOTED-STRING> #当前节点成为主节点时触发的脚本

notify_backup <STRING>|<QUOTED-STRING> #当前节点成为备节点时触发的脚本

notify_fault  <STRING>|<QUOTED-STRING> #当前节点转为"失败"状态时触发的脚本

notify        <STRING>|<QUOTED-STRING> #通用格式的通知触发机制，包含以上三种状态的通知

notify_stop   <STRING>|<QUOTED-STRING> #当停止VRRP时触发的脚本
```



### 脚本的调用方法

- **在 vrrp_instance XXX 语句块末尾添加**

#### 范例：

```bash
vrrp_instance WEB1 {
...
    notify_master /etc/keepalived/notify.sh master
    notify_backup /etc/keepalived/notify.sh backup
    notify_fault  /etc/keepalived/notify.sh fault
}
```



### 邮件配置

#### 安装邮箱服务

```bash
#Centos
yum -y install mailx

#Ubuntu
apt -y install mailx
```

#### 163邮箱

```bash
#vim /etc/mail.rc
...
set from=rootroot25@163.com
set smtp=smtp.163.com
set smtp-auth-user=rootroot25@163.com
set smtp-auth-password=GMZAKJMKZVPKEKAC
set smtp-auth=login
set ssl-verify=ignore
```

#### QQ邮箱

```bash
#vim /etc/mail.rc
...
set from=767483070@qq.com
set smtp=smtp.qq.com
set smtp-auth-user=767483070@qq.com
set smtp-auth-password=zcsnweqbmqsybeja
set smtp-auth=login
set ssl-verify=ignore
```

#### 测试

```bash
echo "test" |mail -s  "Warning" 767483070@qq.com
```



#### 邮件通知脚本范例

```bash
[root@keepalived1 ~]# vim /etc/keepalived/notify.sh

#!/bin/bash
# 
#********************************************************************
#Author:            xiangzheng
#QQ:                767483070
#Date:              2022-02-19
#FileName：         /etc/keepalived/notify.sh
#URL:               https://www.xiangzheng.vip
#Email:             rootroot25@163.com
#Description：      The test script
#Copyright (C):     2022 All rights reserved
#********************************************************************
CONTACT="767483070@qq.com"

notify(){
    MAIL_SUBJECT="keepalived info: VIP floating "
    MAIL_BODY="keepalived VIP floating host:$(hostname) status:${1}"
    echo "${MAIL_BODY}" | mail -s "${MAIL_SUBJECT}" ${CONTACT}
}

case $1 in
master)
    notify master
    ;;
backup)
    notify backup
    ;;
fault)
    notify fault
    ;;
*)
    echo "Usage: $(basename $0) {master|backup|fault}"
    exit 1
    ;;
esac


[root@keepalived1 ~]# chmod +x /etc/keepalived/notify.sh
```

