---
title: "DR模式实现"
---

# 实现DR模式注意实现

- lvs服务器没有网关的话将无法将客户端的请求信息转发给后端的realserver，没有网关就认为出不去，所以就不转发，lvs的网关可以随便写，只要让lvs服务器认为有网关能出去就行，但是！网关必须写真正的网关，因为如果realserver宕机，而lvs服务器没有真正的网关的话将无法及时通知用户临时维护无法访问等信息
- Real Server的VIP禁用ARP内核参数(通常VIP是绑定在lo网卡上)，但RIP不禁用，因为RIP如果禁用的话LVS的广播报文Real Server将无法收到
- **生产中通常LVS和RS都使用私网地址，然后在防火墙上配置公网地址，用户访问的防火墙的VIP，最后由防火墙做DNAT转换 转发到LVS上**



# LVS-DR模式 单网段案例

## 前言

- 1

## 环境准备

此实验前需禁用所有主机的iptables和SElinux

```bash
#internet host配置，一块仅主机模式网卡
[root@internet network-scripts]#cat ifcfg-eth0
BOOTPROTO=none
NAME=eth0
DEVICE=eth0
ONBOOT=yes
IPADDR=192.168.0.6
PREFIX=24
GATEWAY=192.168.0.200

#router配置，一块仅主机模式网卡(eth1)，一块nat模式网卡(eth0)
[root@router ~]#echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf #开启路由转发功能
[root@router ~]#sysctl -p
net.ipv4.ip_forward = 1
[root@router network-scripts]#cat ifcfg-eth0
DEVICE=eth0
NAME=eth0
IPADDR=10.0.0.200
PREFIX=24
BOOTPROTO=static
ONBOOT=yes
[root@router network-scripts]#cat ifcfg-eth1
DEVICE=eth1
NAME=eth1
IPADDR=192.168.0.200
PREFIX=24
BOOTPROTO=static
ONBOOT=yes

#RS1配置(注意先安装http，否则修改网关后将无法访问互联网连接yum源安装)
[root@RS1 ~]#yum -y install httpd ; systemctl enable --now httpd
[root@RS1 ~]#echo `hostname -I` > /var/www/html/index.html
[root@RS1 ~]#cat /etc/sysconfig/network-scripts/ifcfg-eth0 
DEVICE=eth0
NAME=eth0
IPADDR=10.0.0.7
PREFIX=24
BOOTPROTO=static
ONBOOT=yes
GATEWAY=10.0.0.200
[root@RS1 ~]#echo 1 > /proc/sys/net/ipv4/conf/all/arp_ignore #忽略arp广播
[root@RS1 ~]#echo 1 > /proc/sys/net/ipv4/conf/lo/arp_ignore
[root@RS1 ~]#echo 2 > /proc/sys/net/ipv4/conf/all/arp_announce #对外不公开arp
[root@RS1 ~]#echo 2 > /proc/sys/net/ipv4/conf/lo/arp_announce
[root@RS1 ~]#ifconfig lo:1 10.0.0.100/32 #临时将VIP绑定在回环网卡上，注意一定要先修改内核参数后在绑定VIP，防止冲突

#RS2配置(注意先安装http，否则修改网关后将无法访问互联网连接yum源安装)
[root@RS2 ~]#yum -y install httpd ; systemctl enable --now httpd
[root@RS2 ~]#echo `hostname -I` > /var/www/html/index.html
[root@RS2 ~]#cat /etc/sysconfig/network-scripts/ifcfg-eth0 
DEVICE=eth0
NAME=eth0
IPADDR=10.0.0.17
PREFIX=24
BOOTPROTO=static
ONBOOT=yes
GATEWAY=10.0.0.200
[root@RS1 ~]#echo 1 > /proc/sys/net/ipv4/conf/all/arp_ignore
[root@RS1 ~]#echo 1 > /proc/sys/net/ipv4/conf/lo/arp_ignore
[root@RS1 ~]#echo 2 > /proc/sys/net/ipv4/conf/all/arp_announce
[root@RS1 ~]#echo 2 > /proc/sys/net/ipv4/conf/lo/arp_announce
[root@RS1 ~]#ifconfig lo:1 10.0.0.100/32 #临时将VIP绑定在回环网卡上，注意一定要先修改内核参数在绑定VIP，防止冲突

#生产中内核参数需永久保存
[root@RS1 ~]#echo 'net.ipv4.conf.all.arp_ignore=1' >> /etc/sysctl.conf
[root@RS1 ~]#echo 'net.ipv4.conf.all.arp_announce=2' >> /etc/sysctl.conf
[root@RS1 ~]#echo 'net.ipv4.conf.lo.arp_ignore=1' >> /etc/sysctl.conf
[root@RS1 ~]#echo 'net.ipv4.conf.lo.arp_announce=2' >> /etc/sysctl.conf

#LVS配置
[root@LVS network-scripts]#cat ifcfg-eth0
DEVICE=eth0
NAME=eth0
IPADDR=10.0.0.8
PREFIX=24
BOOTPROTO=static
ONBOOT=yes
GATEWAY=10.0.0.200
[root@LVS ~]#ifconfig lo:1 10.0.0.100/32 #临时将VIP绑定在回环网卡上
```

### Client 准备

### Route 准备

```bash
# cat /etc/sysconfig/network-scripts/ifcfg-eth0
DEVICE=eth0
NAME=eth0
IPADDR=172.16.0.18
PREFIX=16
BOOTPROTO=static
ONBOOT=yes

# cat /etc/sysconfig/network-scripts/ifcfg-eth1
DEVICE=eth1
NAME=eth1
IPADDR=10.0.0.200
PREFIX=24
BOOTPROTO=static
ONBOOT=yes

# echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf 
# sysctl -p
net.ipv4.ip_forward = 1
```



### LVS 准备

#### 准备sorry server



#### 网关指向route

```bash
root@lvs:~# ip route 
default via 10.0.0.200 dev eth0 proto static 
10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.100 
```

#### LVS最终配置

```
# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:cd:b5:7f brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.100/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fecd:b57f/64 scope link 
       valid_lft forever preferred_lft forever
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:cd:b5:89 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.123/32 scope global eth1
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fecd:b589/64 scope link 
       valid_lft forever preferred_lft forever
```



### RS 准备

- 在所有RS执行以下操作

#### 修改ARP相关内核参数

- **注意：修改arp相关内核参数一定要先于绑定VIP，否则会因添加VIP后产生的免费arp广播而导致地址冲突**
- all 和 lo 相关内核参数都要修改，不能只修改lo

##### 临时生效

```bash
# echo 1 > /proc/sys/net/ipv4/conf/all/arp_ignore
# echo 1 > /proc/sys/net/ipv4/conf/lo/arp_ignore
# echo 2 > /proc/sys/net/ipv4/conf/all/arp_announce
# echo 2 > /proc/sys/net/ipv4/conf/lo/arp_announce
```

##### 永久生效

```bash
# echo 'net.ipv4.conf.all.arp_ignore=1' >> /etc/sysctl.conf
# echo 'net.ipv4.conf.all.arp_announce=2' >> /etc/sysctl.conf
# echo 'net.ipv4.conf.lo.arp_ignore=1' >> /etc/sysctl.conf
# echo 'net.ipv4.conf.lo.arp_announce=2' >> /etc/sysctl.conf

# sysctl -p
net.ipv4.conf.all.arp_ignore = 1
net.ipv4.conf.all.arp_announce = 2
net.ipv4.conf.lo.arp_ignore = 1
net.ipv4.conf.lo.arp_announce = 2
```

#### 绑定VIP到lo网卡上

##### 临时生效

```bash
#方法一
ifconfig lo:1 10.0.0.123/32

#方法二
ip addr add 10.0.0.123/32 label lo:1 dev lo
```

##### 永久生效

```bash
# vim /etc/systemd/system/mystartup.service
[Unit]
Description=Runs /usr/local/bin/mystartup.sh

[Service]
ExecStart=/usr/local/bin/mystartup.sh


[Install]
WantedBy=multi-user.target

# echo -e '#!/bin/bash\n/usr/sbin/ip addr add 10.0.0.123/32 label lo:1 dev lo' >>  /usr/local/bin/mystartup.sh

# chmod +x /usr/local/bin/mystartup.sh

# systemctl daemon-reload 

# systemctl enable --now mystartup.service
```

#### 准备web页面

```bash
# apt -y install nginx

# hostname > /var/www/html/index.nginx-debian.html

# systemctl enable --now nginx
```

#### 网关指向route

```bash
root@rs1:~# ip route 
default via 10.0.0.200 dev eth0 proto static 
10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.102 

root@rs2:~# ip route 
default via 10.0.0.200 dev eth0 proto static 
10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.103 
```

#### RS最终配置

```bash
root@rs1:~# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet 10.0.0.123/32 scope global lo:1
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:06:ce:34 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.102/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe06:ce34/64 scope link 
       valid_lft forever preferred_lft forever

----------------------------------------------------------------------------------

root@rs2:~# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet 10.0.0.123/32 scope global lo:1
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:8a:bd:41 brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.103/24 brd 10.0.0.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::20c:29ff:fe8a:bd41/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 02:42:76:2a:db:81 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
```



## 添加LVS规则

```bash
# yum -y install ipvsadm

# ipvsadm -A -t 10.0.0.123:80 -s rr

# ipvsadm -a -t 10.0.0.123:80 -r 10.0.0.102:999 -g #real server端口写错也会被纠正回

# ipvsadm -a -t 10.0.0.123:80 -r 10.0.0.103:80 -g

---------------------------------------------------------------------------------

#LVS最终规则
# ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  10.0.0.123:80 rr
  -> 10.0.0.102:80                Route   1      0          0         
  -> 10.0.0.103:80                Route   1      0          0       
```

## 测试

```bash
[root@internet ~]#curl 10.0.0.123
rs1
[root@internet ~]#curl 10.0.0.123
rs2

#后端RS可以看到真实的访问地址
# cat /var/log/nginx/access.log 
10.0.0.7 - - [14/Apr/2022:10:09:00 +0800] "GET / HTTP/1.1" 200 4 "-" "curl/7.29.0"
```









# LVS-DR模式 多网段案例

## 环境准备

在单网段基础上修改:

```bash
#在router的eth0网卡上永久增加网关地址
[root@router ~]$nmcli connection modify eth0 +ipv4.addresses 172.16.0.200/24
[root@router ~]$nmcli connection reload
[root@router ~]$nmcli connection up eth0
[root@router network-scripts]$cat ifcfg-eth0 
DEVICE=eth0
NAME=eth0
IPADDR=10.0.0.200
PREFIX=24
ONBOOT=yes
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
IPADDR1=172.16.0.200
PREFIX1=24
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=no
UUID=5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03

#LVS配置
[root@LVS ~]$ifconfig lo:1 down
[root@LVS ~]$ifconfig lo:1 172.16.0.100/32

#RS1配置
[root@RS1 ~]$ifconfig lo:1 down
[root@RS1 ~]$ifconfig lo:1 172.16.0.100/32

#RS2配置
[root@RS2 ~]$ifconfig lo:1 down
[root@RS2 ~]$ifconfig lo:1 172.16.0.100/32
```





# RS一键生成VIP脚本

```bash
#rs_vip.sh

#!/bin/bash
VIP="10.0.0.100"
MASK="32"
DEV="lo"

case $1 in
start)
    echo 1 > /proc/sys/net/ipv4/conf/all/arp_ignore
    echo 1 > /proc/sys/net/ipv4/conf/lo/arp_ignore
    echo 2 > /proc/sys/net/ipv4/conf/all/arp_announce
    echo 2 > /proc/sys/net/ipv4/conf/lo/arp_announce
    ip address add ${VIP}/${MASK} dev ${DEV}
    #ifconfig lo:1 ${VIP}/${MASK}
    echo "VIP:${VIP}/${MASK} is Start"
    ;;
stop)
    echo 0 > /proc/sys/net/ipv4/conf/all/arp_ignore
    echo 0 > /proc/sys/net/ipv4/conf/lo/arp_ignore
    echo 0 > /proc/sys/net/ipv4/conf/all/arp_announce
    echo 0 > /proc/sys/net/ipv4/conf/lo/arp_announce
    ip address del ${VIP}/${MASK} dev lo
    #ifconfig ${DEV} down
    echo "VIP:${VIP}/${MASK} is Stop"
    ;;
*)
    echo "Usage: $(basename $0) {start or stop}"
    ;;
esac
```

