---
title: "LVS+keepalived"
---

# 前言

- LVS 配合 keepalived 实现高可用
- **keepalived中内置了LVS的规则生成工具 所以可以不使用传统的方式定义LVS的规则 而是通过修改keepalived配置文件的方式自动生成LVS规则**



# virtual_server 的文件结构

```bash
#/etc/keepalived/keepalived.conf

virtual_server IP port {
...
    real_server IP port {
        ...
    }
    real_server IP port {
        ...
    }
}
```



# virtual_server 的配置说明

- 参考文档：https://www.keepalived.org/manpage.html
- 注意：括号必须分行写

```bash
virtual_server <IP port>|<fwmark int>|<group string> {
#IP port      定义虚拟服务器的IP地址和端口号
#fwmark int   ipvs的防火墙打标，实现基于防火墙的负载均衡集群
#group string 使用虚拟服务器组
---------------------------------------------------------------------------
    delay_loop <TIMER> #检查后端服务器的时间间隔 单位:秒 ，不指定则默认为60秒
    lb_algo <rr|wrr|lc|wlc|sh|dh|lblc> #调度算法定义
    lb_kind <NAT|DR|TUN> #工作模式
    persistence_timeout <TIMER> #持久连接超时时长(设定时间内始终往同一台RS调度) 单位:秒 不指定则默认为6分钟
    protocol TCP|UDP #指定服务协议，一般为TCP
    sorry_server <IP port> #当所有RS不可用时 备用的sorry_server服务器的地址
---------------------------------------------------------------------------
    real_server <IP port> { #RS的IP和port
        weight <num> #RS的权重 不指定默认为1，只在WRR、WLC等根据权重进行调度的算法时有效
        notify_up <STRING>|<QUOTED-STRING> #RS的上线通知脚本
        notify_down <STRING>|<QUOTED-STRING> #RS的下线通知脚本
        TCP_CHECK|MISC_CHECK|HTTP_GET|SSL_GET {  #定义当前主机监控状态监测方法
        ... #详参下面的 应用层监测 和 TCP监测
        }    
    }
}
```



# virtual_server 应用层监测

- 应用层监测：HTTP_GET|SSL_GET
- 监测web服务的工作状态

```bash
virtual_server <IP port> {
...
    real_server <IP port> {
        ...
        HTTP_GET {  #应用层监测
            url { 
            path <URL_PATH> #定义要监控的url
            status_code <CODE> #指定上述监测机制中HTTP头中返回的状态代码，一般设为200
            }
            connect_timeout <NUM> #客户端请求的超时时间
            retry <NUM> #超时后最大的重新尝试次数
            delay_before_retry <NUM> #两次连续重试之间的延迟时长
            connect_ip <IPADDR> #指定向当前RS的哪个IP地址发起健康状态监测请求，可选项
            connect_port <PORT> #指定向当前RS的哪个port发起健康状态监测请求，可选项
            bindto <IPADDR> #指定以当前主机的哪个源IP向RS发起健康状态监测请求，可选项
            bind_port <PORT> #指定以当前主机的哪个源port向RS发起健康状态监测请求，可选项
        }    
    }
}
```

## 范例：

```bash
# /usr/share/doc/keepalived/keepalived.conf.virtualhost
...
virtual_server 10.0.0.10 80 {
    delay_loop 3
    lb_algo rr
    lb_kind NAT
    persistence_timeout 50
    protocol TCP
    sorry_server 127.0.0.1 80

    real_server 10.0.0.7 80 {
        weight 1
        HTTP_GET {
            url {
              path /monitor.html
              status_code 200
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
        
    real_server 10.0.0.17 80 {
        weight 1
        HTTP_GET {
            url {
              path /monitor.html
              status_code 200
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
        
    }
...
```

# virtual_server TCP监测

- 监测一些不属于http协议的应用，如：mysql、redis等...
- 根据是否能与RS进行TCP三次握手来判断服务是否正常运行

```bash
virtual_server <IP port> {
...
    real_server <IP port> {
        ...
        TCP_CHECK {  #TCP连接监测
            connect_timeout <NUM> #客户端请求的超时时间
            retry <NUM> #超时后最大的重新尝试次数
            delay_before_retry <NUM> #两次连续重试之间的延迟时长
            connect_ip <IPADDR> #向当前RS的哪个IP地址发起健康状态监测请求
            connect_port <PORT> #向当前RS的哪个port发起健康状态监测请求
            bindto <IPADDR> #以当前主机的哪个源IP向RS发起健康状态监测请求
            bind_port <PORT> #以当前主机的哪个源port向RS发起健康状态监测请求
        }    
    }
}
```

## 范例：

```bash
virtual_server 10.0.0.10 80 {
    delay_loop 3
    lb_algo rr
    lb_kind NAT
    persistence_timeout 50
    protocol TCP
    sorry_server 127.0.0.1 80

    real_server 10.0.0.7 80 {
        weight 1
        TCP_CHECK {
            connect_timeout 3
            retry 3
            delay_before_retry 3
            connect_port 3306
        }
...
```





# 实现单主单VIP的 LVS-DR 模式

## 部署前言

- 先决条件：
  - 时间同步
  - 关闭selinux
- 部署概述：
  - 状态检测报文通过组播发送

## 环境

| IP        | VIP               | service                                | hostname            |
| --------- | ----------------- | -------------------------------------- | ------------------- |
| 10.0.0.18 | 10.0.0.100        | Keepalived+LVS(DR)+nginx(sorry server) | Keepalived1         |
| 10.0.0.28 | 10.0.0.100        | Keepalived+LVS(DR)+nginx(sorry server) | Keepalived2         |
| 10.0.0.38 | lo:10.0.0.100(RS) | nginx                                  | web1.xiangzheng.org |
| 10.0.0.38 | lo:10.0.0.100(RS) | nginx                                  | web2.xiangzheng.org |

## 安装ipvsadm工具

- 虽然规则不用手动输入 但是keepalived配置文件本身还是调用了ipvsadm这个工具

```bash
[root@keepalived1 ~]# yum install -y ipvsadm
[root@keepalived2 ~]# yum install -y ipvsadm
```

## 准备web服务和页面

```bash
[root@web1 ~]# echo '10.0.0.38 web page' > /usr/share/nginx/html/index.html 
[root@web1 ~]# systemctl enable --now nginx
[root@web2 ~]# echo '10.0.0.48 web page' > /usr/share/nginx/html/index.html
[root@web2 ~]# systemctl enable --now nginx

#测试访问
[root@client ~]# curl 10.0.0.38
10.0.0.38 web page
[root@client ~]# curl 10.0.0.48
10.0.0.48 web page
```

## 将RS绑定VIP

- 在RS执行以下脚本

```bash
#!/bin/bash
VIP="10.0.0.100"
MASK="32"
DEV="lo"

case $1 in
start)
    ip address add ${VIP}/${MASK} dev ${DEV}
    #ifconfig lo:1 ${VIP}/${MASK}
    echo 1 > /proc/sys/net/ipv4/conf/all/arp_ignore
    echo 1 > /proc/sys/net/ipv4/conf/lo/arp_ignore
    echo 2 > /proc/sys/net/ipv4/conf/all/arp_announce
    echo 2 > /proc/sys/net/ipv4/conf/lo/arp_announce
    echo "VIP:${VIP}/${MASK} is Start"
    ;;
stop)
    ip address del ${VIP}/${MASK} dev lo
    #ifconfig ${DEV} down
    echo 0 > /proc/sys/net/ipv4/conf/all/arp_ignore
    echo 0 > /proc/sys/net/ipv4/conf/lo/arp_ignore
    echo 0 > /proc/sys/net/ipv4/conf/all/arp_announce
    echo 0 > /proc/sys/net/ipv4/conf/lo/arp_announce
    echo "VIP:${VIP}/${MASK} is Stop"
    ;;
*)
    echo "Usage: $(basename $0) {start or stop}"
    ;;
esac


[root@web1 ~]# ./rs_vip.sh start
[root@web2 ~]# ./rs_vip.sh start
```

## keepalived1配置

- sorry server准备过程省略，其实就是安装nginx服务并部署sorry server页面至本机，当然部署在其他主机也可以

```bash
root@lvs-ka1:~# cat /etc/keepalived/keepalived.conf
global_defs {
   router_id lvs-ka1
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance azheng_nginx {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 66666
    }
    virtual_ipaddress {
        10.0.0.123/32 dev eth0 label eth0:0
    }
}

virtual_server 10.0.0.123 80 {
    delay_loop 6
    lb_algo rr
    lb_kind DR
    #persistence_timeout 30
    protocol TCP
    sorry_server 127.0.0.1 80
    real_server 10.0.0.102 80 {
        weight 1
        HTTP_GET {
            url {
                path /
                status_code 200
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }
    real_server 10.0.0.103 80 {
        weight 1
        HTTP_GET {
            url {
                path /
                status_code 200
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }
}
```



## keepalived2配置

- sorry server准备过程省略，其实就是安装nginx服务并部署sorry server页面至本机，当然部署在其他主机也可以

```bash
root@lvs-ka2:~# cat /etc/keepalived/keepalived.conf
global_defs {
   router_id lvs-ka2
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   vrrp_mcast_group4 226.6.6.6
}

vrrp_instance azheng_nginx {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 66666
    }
    virtual_ipaddress {
        10.0.0.123/32 dev eth0 label eth0:0
    }
}

virtual_server 10.0.0.123 80 {
    delay_loop 6
    lb_algo rr
    lb_kind DR
    #persistence_timeout 30
    protocol TCP
    sorry_server 127.0.0.1 80
    real_server 10.0.0.102 80 {
        weight 1
        HTTP_GET {
            url {
                path /
                status_code 200
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }
    real_server 10.0.0.103 80 {
        weight 1
        HTTP_GET {
            url {
                path /
                status_code 200
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }
}
```

## 测试

- 重启服务并测试

```bash
#可以看到通过keepalived的配置文件自动生成了LVS规则
[root@keepalived1 ~]# ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  10.0.0.100:80 rr
  -> 10.0.0.38:80                 Route   1      0          0         
  -> 10.0.0.48:80                 Route   1      0          0    

[root@keepalived2 ~]# ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  10.0.0.100:80 rr
  -> 10.0.0.38:80                 Route   1      0          0         
  -> 10.0.0.48:80                 Route   1      0          0         
```





# 实现单主单VIP的 LVS-DR 模式2

## ka1配置

```

```



## 心跳检测报文

```bash
root@rs1:~# tail -f /var/log/nginx/access.log
...
10.0.0.101 - - [15/Apr/2022:19:26:20 +0800] "GET / HTTP/1.0" 200 4 "-" "KeepAliveClient"
10.0.0.100 - - [15/Apr/2022:19:26:20 +0800] "GET / HTTP/1.0" 200 4 "-" "KeepAliveClient"
...
```





# 实现双主多VIP的 LVS-DR 模式













