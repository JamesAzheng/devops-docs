---
title: "基于 HAProxy + Keepalived 实现高可用"
---

## 架构概览

Keepalived 配置两个 VIP：一个对外提供服务，一个对内提供服务。
- 对外 VIP：绑定在公网网卡（或防火墙 NAT 后），暴露给互联网用户，配合防火墙规则严格限制来源/端口/协议。
- 对内 VIP：绑定在内网网卡，供内网服务器、办公网络、跳板机等访问，不经过公网，安全性更高。

```
互联网用户
     ↓ (公网 IP → NAT)
防火墙 → 对外 VIP (e.g. 10.0.0.100) → HAProxy节点1/2 (Keepalived 主备)
     
内网用户/服务器
     ↓ (内网直接访问)
     → 对内 VIP (e.g. 192.168.1.100) → HAProxy节点1/2 (Keepalived 主备)

后端真实服务器 (web/api/mysql 等) ← 只接受来自 HAProxy 的内网流量
```

## 环境说明

| 虚拟机名称      | hostname      | OS           | CPU  | 内存 | 磁盘  |      IP     |      VIP     |
| --------------- | ------------- | ------------ | ---- | ---- | ---- | ------------ |------------ |
| 生产环境-北京机房-负载均衡01 | prod-bj-lb01 | Ubuntu 22.04 | 8U    | 16G   | 300G | 172.16.0.230 | 172.16.0.100（对内）、172.16.0.200（对外） |
| 生产环境-北京机房-负载均衡02 | prod-bj-lb02  | Ubuntu 22.04 | 8U    | 16G   | 300G | 172.16.0.231 | 172.16.0.100（对内）、172.16.0.200（对外） |

## 注意事项
1. 两台主机需位于同二层网络，否则 VIP 无法正常漂移（因为依赖 VRRP 协议）。
2. 两台虚拟机跨机房或跨物理机部署，以避免单点故障。
3. 两台 HAProxy 的配置文件（`/etc/haproxy/haproxy.cfg`）需保持一致，包括后端服务器列表、健康检查配置等。
4. Keepalived 使用 VRRP 协议（组播），记得在防火墙中放行相关流量，否则会出现“脑裂”（两台机器都抢占 VIP）。
5. 确保两台虚拟机的时间同步。

## 第一阶段：环境准备（两台机器同步操作）
### 1. 修改内核参数：
- 必须启用内核的非本地IP绑定功能，否则HAProxy在尝试监听VIP时可能启动失败（原因是两台机器中总有一台是从节点，从节点默认无法绑定VIP）。
```sh
# 允许内核绑定非本地
echo "net.ipv4.ip_nonlocal_bind = 1" >> /etc/sysctl.conf

# 加载新的内核参数
sysctl -p
```

### 2. 安装 HAProxy 和 Keepalived
```sh
apt install -y haproxy keepalived
```



### 3. 创建健康检查脚本

在两台机器上创建一个脚本，用于监控 HAProxy 的状态。如果 HAProxy 挂了，Keepalived 会自动漂移 VIP。

**创建脚本 `/etc/keepalived/check_haproxy.sh`:**

```Bash
#!/bin/bash
if ! killall -0 haproxy; then
  exit 1
fi
```

别忘了赋予执行权限：`chmod +x /etc/keepalived/check_haproxy.sh`



## 第二阶段：配置 HAProxy（两台机器一致）

- 编辑 /etc/haproxy/haproxy.cfg 后，重启 HAProxy 服务。
```sh
global
    log         127.0.0.1 local2
    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

defaults
    mode                    http
    log                     global
    option                  httplog
    option                  dontlognull
    timeout connect         5000ms
    timeout client          50000ms
    timeout server          50000ms

frontend http_front
    bind 172.16.0.100:80        # 绑定虚拟 IP (VIP)
    default_backend http_back

backend http_back
    balance roundrobin           # 轮询算法
    server web01 172.16.0.20:80 check  # 后端真实服务器 1
    server web02 172.16.0.21:80 check  # 后端真实服务器 2       
```



## 第三阶段：配置 Keepalived

### MASTER 节点

```sh {filename="/etc/keepalived/keepalived.conf"}
global_defs {
    router_id prod-bj-lb0
    enable_script_security
    script_user root

}

vrrp_script check_haproxy {
    script "/etc/keepalived/check_haproxy.sh"
    interval 2
    weight -20
}

vrrp_instance INTERNAL_VIP {
    state MASTER
    interface ens160
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 72198
    }
    virtual_ipaddress {
        172.16.0.100
    }
    track_script {
        check_haproxy
    }
}

vrrp_instance PUBLIC_VIP {
    state MASTER
    interface ens160
    virtual_router_id 52
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 68723
    }
    virtual_ipaddress {
        172.16.0.200
    }
    track_script {
        check_haproxy
    }
}
```



### BACKUP 节点

```sh {filename="/etc/keepalived/keepalived.conf"}
global_defs {
    router_id prod-bj-lb1 # 不同的id
    enable_script_security
    script_user root

}

vrrp_script check_haproxy {
    script "/etc/keepalived/check_haproxy.sh"
    interval 2
    weight -20
}

vrrp_instance INTERNAL_VIP {
    state BACKUP # BACKUP
    interface ens160
    virtual_router_id 51
    priority 90 # 优先级低于 Master
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 72198
    }
    virtual_ipaddress {
        172.16.0.100
    }
    track_script {
        check_haproxy
    }
}

vrrp_instance PUBLIC_VIP {
    state BACKUP # BACKUP
    interface ens160
    virtual_router_id 52
    priority 90 # 优先级低于 Master
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 68723
    }
    virtual_ipaddress {
        172.16.0.200
    }
    track_script {
        check_haproxy
    }
}
```

### 测试 VIP 是否正常漂移
```sh
# 重启 Keepalived 服务
systemctl restart keepalived

# 停止 HAProxy 后，观察 Keepalived 日志
journalctl -u keepalived -f
```

## 流量迁移

