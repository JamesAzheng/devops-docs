---
title: "keepalived"
---

# keepalived 配置文件
keepalived主配置文件路径：/etc/keepalived/keepalived.conf
```sh
# 全局配置，定义邮件配置、route_id、vrrp配置、多播地址等。
global_defs {
   notification_email { #*
     767483070@qq.com   #* keeplived 发生故障切换时邮件发送的目标邮箱，可以按分区写多个
     ...
   } #*
   notification_email_from Alexandre.Cassen@firewall.loc #* 发送邮件的地址
   smtp_server 192.168.200.1   #* 邮件服务器地址
   smtp_connect_timeout 30     #* 邮件服务器连接timeout
   router_id LVS_DEVEL # keepalived主机标识，建议使用当前主机名，但多节点重名不影响
  
   vrrp_skip_check_adv_addr #*启用此配置后，如果收到的通告报文和上一个报文是同一个路由器，则跳过检查，默认值为全检查（对所有通告报文都检查，会比较消耗性能）
   
   vrrp_strict #* 严格遵守VRRP协议，启用此项后以下状况将无法启动服务：
               #1：无VIP地址
               #2：配置了单播邻居
               #3：在VRRP版本2中有ipv6地址
               #开启此项并且没有配置vrrp_iptables时会自动开启iptables防火墙规则，默认会导致VIP无法访问，建议不加此配置项
   
   vrrp_garp_interval 0 #接口发送免费ARP报文之间的延迟时间，默认0 表示不延迟
   vrrp_gna_interval 0 #接口上发送非请求NA消息之间的延迟时间，默认0 表示不延迟
   vrrp_iptables #* 此项和vrrp_strict同时开启会关闭防火墙规则，如未配置vrrp_strict则此项不用添加
   vrrp_mcast_group4 226.6.6.6 #* 多播地址，默认值：224.0.0.18，同一组VIP此地址要相同，地址范围：224.0.0.0到239.255.255.255，不同的keepalived组要使用不同的多播地址，否则会引起冲突
}

# 虚拟路由配置，定义每个vrrp虚拟路由器
# 可以配置多组此字段，针对不同业务 如：web、mysql、redis等
vrrp_instance <STRING> { #<STRING>为vrrp的实例名，一般为业务名称
    state MASTER #当前节点在此虚拟路由器上的初始状态，状态为MASTER或BACKUP，不是配置master就为master，是否是master取决于priority的值是否在路由器组中最高
    interface eth0 #绑定为当前虚拟路由器使用的物理接口，如eth0...，可以和VIP不在一个网卡
    
    virtual_router_id 51 #每个虚拟路由器组的唯一标识，范围：0-255，同属一个虚拟路由器组的多个keepalived节点此值必须相同，与其他虚拟路由器组的此值不能相同，否则服务无法启动
    
    priority 100 #优先级，范围：1-254，数值越大越优先，每个keepalived主机节点此值不同
    advert_int 1 #vrrp通告的时间间隔，默认1s
    
    authentication { #认证机制
        auth_type PASS #PASS为简单密码，也可以设置为AH 表示IPESC认证(不推荐)
        auth_pass 111 #密码，仅前8位有效,同属一个虚拟路由器组的多个keepalived节点此值必须相同
    }
    virtual_ipaddress { #虚拟ip地址，生产环境中可能指定上百个IP地址
        192.168.200.16 #指定VIP，不指定网卡则默认为eth0，不指定/postfix则默认为/32
        192.168.200.17/24 dev eth0 #指定子网掩码和网卡
        192.168.200.18/16 dev eth2 label eth2:1 #指定VIP网卡的label
    }
    
    tarck_interface { #配置监控网络接口，一旦出现故障，则转为FAULT状态实现地址转移
        eth0
        eth1
        ....
    }
}

# 虚拟服务器配置，LVS 集群的 VS 和 RS
virtual_server
...

# 添加此行，可将 VRRP 相关配置放在子配置文件中
include /etc/keepalived/conf.d/*.conf
```