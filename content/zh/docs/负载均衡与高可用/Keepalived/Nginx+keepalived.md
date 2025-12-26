---
title: "Nginx+keepalived"
---

# Nginx+keepalived(单主模式)

- 利用keepalived检测脚本的方式实现对nginx的状态监测 从而实现故障切换

## 环境准备

| IP        | VIP        | service                   | hostname            |
| --------- | ---------- | ------------------------- | ------------------- |
| 10.0.0.18 | 10.0.0.100 | Keepalived + nginx(proxy) | Keepalived1         |
| 10.0.0.28 | 10.0.0.100 | Keepalived + nginx(proxy) | Keepalived2         |
| 10.0.0.38 | NULL       | nginx(web)                | web1.xiangzheng.org |
| 10.0.0.48 | NULL       | nginx(web)                | web2.xiangzheng.org |

## 10.0.0.18 配置

### 准备nginx

```bash
[root@keepalived1 ~]# vim /etc/nginx/nginx.conf
...
http {
...
    upstream nginx {
        server 10.0.0.38:80 weight=1 fail_timeout=15s max_fails=3;
        server 10.0.0.48:80 weight=1 fail_timeout=15s max_fails=3;
    }
...
    server {
...
        location / {
        proxy_pass http://nginx;
        }
...
```

### 准备keepalived

```bash
#定义子配置文件
[root@keepalived1 ~]# cat /etc/keepalived/keepalived.conf 
global_defs {
   router_id KA1
}

include /etc/keepalived/conf.d/*.conf

---------------------------------------------------------------------------

#准备子配置文件
[root@keepalived1 ~]# vim /etc/keepalived/conf.d/virtual_vip.conf
vrrp_script check_nginx { #定义脚本
       script "/etc/keepalived/check_nginx.sh"
       interval 2
       weight -30
       fall 2
       rise 2
}

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
    }

    unicast_src_ip 10.0.0.18
    unicast_peer {
    10.0.0.28
    }

    track_script { #引用脚本
    	check_nginx
    }
}
```

### 准备检测脚本

- **0信号说明：**对进程进行健康性检查(健康则$?结果为0，反之则为1)，但结果并不严谨 因为进程只要存在 它就认为进程是健康的 如：进程已经成为僵尸态 而$?的返回值依旧为0

```bash
[root@keepalived1 ~]# vim /etc/keepalived/check_nginx.sh
#!/bin/bash
killall -0 nginx || systemctl restart nginx.service

[root@keepalived2 ~]# chmod +x /etc/keepalived/check_nginx.sh
```



## 10.0.0.28配置

### 准备nginx

```bash
[root@keepalived2 ~]# vim /etc/nginx/nginx.conf
...
http {
...
    upstream nginx {
        server 10.0.0.38:80 weight=1 fail_timeout=15s max_fails=3;
        server 10.0.0.48:80 weight=1 fail_timeout=15s max_fails=3;
    }
...
    server {
...
        location / {
        proxy_pass http://nginx;
        }
...
```

### 准备keepalived

```bash
#定义子配置文件
[root@keepalived2 ~]# cat /etc/keepalived/keepalived.conf 
global_defs {
   router_id KA2
}

include /etc/keepalived/conf.d/*.conf

----------------------------------------------------------------------------

#准备子配置文件
[root@keepalived2 ~]# vim /etc/keepalived/conf.d/virtual_vip.conf
vrrp_script check_nginx {
       script "/etc/keepalived/check_nginx.sh"
       interval 2
       weight -30
       fall 2
       rise 2
}

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
    }

    unicast_src_ip 10.0.0.28
    unicast_peer {
    10.0.0.18
    }

    track_script {
    	check_nginx
    }
}
```

### 准备检测脚本

- **0信号说明：**对进程进行健康性检查(健康则$?结果为0，反之则为1)，但结果并不严谨 因为进程只要存在 它就认为进程是健康的 如：进程已经成为僵尸态 而$?的返回值依旧为0

```bash
[root@keepalived2 ~]# vim /etc/keepalived/check_nginx.sh
#!/bin/bash
killall -0 nginx || systemctl restart nginx.service

[root@keepalived2 ~]# chmod +x /etc/keepalived/check_nginx.sh
```

## 10.0.0.38配置

- web页面准备过程省略

```bash
[root@client ~]# curl 10.0.0.38
10.0.0.38 web page
```

## 10.0.0.48配置

- web页面准备过程省略

```bash
[root@client ~]# curl 10.0.0.48
10.0.0.48 web page
```

## 测试

```bash
#因为keepalived1优先级高，所以目前VIP在keepalived1上
[root@keepalived1 ~]# hostname -I
10.0.0.18 10.0.0.100 
[root@keepalived2 ~]# hostname -I
10.0.0.18

#模拟keepalived1上的nginx故障
[root@keepalived1 ~]# killall nginx 

#观察VIP飘动情况，可以看到VIP并没有进行切换，这是为什么呢？这是因为在定义脚本的时候配置了只要监测nginx进程不在 那么就立刻执行nginx重启，所以既然nginx重启了 进程恢复了 那么VIP就不会进行飘动了
[root@keepalived1 ~]# hostname -I
10.0.0.18 10.0.0.100 
[root@keepalived2 ~]# hostname -I
10.0.0.18

#将脚本修改成故障不进行重启，只进行检测
[root@keepalived1 ~]# vim /etc/keepalived/check_nginx.sh
#!/bin/bash
killall -0 nginx

#再次模拟keepalived1上的nginx故障
[root@keepalived1 ~]# killall nginx

#观察VIP飘动情况，因为没有定义检测进程失效后执行服务重启的操作，所以脚本执行失败后就会将优先级-30，100-30=70，70的优先级没有备份节点的80优先级高，所以自然VIP就飘到了keepalived2上
[root@keepalived1 ~]# hostname -I
10.0.0.18 
[root@keepalived2 ~]# hostname -I
10.0.0.28 10.0.0.100

#恢复nginx
[root@keepalived1 ~]# systemctl start nginx

#观察VIP飘动情况，因为使用的是抢占式VIP，所以服务恢复后通过脚本检测发现nginx服务恢复正常，所以又将keepalived1标记位可用 然后将优先级恢复为原先的100，keepalived1的100优先级比keepalived2的80高 自然VIP就飘到keepalived1上了
[root@keepalived1 ~]# hostname -I
10.0.0.18 10.0.0.100 
[root@keepalived1 ~]# hostname -I
10.0.0.18 
```





# 