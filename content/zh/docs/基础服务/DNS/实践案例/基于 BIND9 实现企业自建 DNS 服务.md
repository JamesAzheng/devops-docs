---
title: "基于 BIND9 实现企业自建 DNS 服务"
---

# 架构概览
- DNS 服务选择 BIND 9，参考链接：[https://www.isc.org/](https://www.isc.org/)

![](/docs/基础服务/dns.jpg)


# 环境说明

| 虚拟机名称      | hostname      | OS           | CPU  | 内存 | 磁盘  | IP |
| --------------- | ------------- | ------------ | ---- | ---- | ---- | ---- |
| 北京主DNS服务器 | bj-dns-master | Ubuntu 22.04 | 4U   | 8G   | 100G | 172.16.0.223 |
| 北京从DNS服务器 | bj-dns-slave  | Ubuntu 22.04 | 4U   | 8G   | 100G | 172.16.0.225 |

**注意事项：**
- 主从服务器需保持时间同步
- 主从 BIND9 版本需保持一致

# 安装 BIND9
- 在主从服务器下分别执行以下命令：
```sh
apt update

apt install bind9
```


# 配置 BIND9
- 主服务器的区域解析库文件中必须有一条NS记录指向从服务器？？？？？？？？？？？？？

## 主 DNS 服务器配置
### 1. 修改全局配置文件
- 这种配置下，内网域名由自己权威快速返回，外网域名通过转发到可靠公共 DNS 解析。方便内网机器直接使用这套 DNS 即可访问互联网域名。
- 在纯内网环境下，只需设置 `recursion no;` 明确关闭递归查询（只做权威解析），并删除 `recursion`、`forwarders` 配置段即可。

编辑 `/etc/bind/named.conf.options` 文件：

```bind
options {
    directory "/var/cache/bind";               // BIND的工作目录，用来存放缓存、zone文件副本、统计数据等

    // 只允许内网查询（防止外部用户滥用此DNS服务器）
    allow-query { 172.16.128.2; 172.16.0.0/18; localhost; };  // 只接受来自172.16网段和本机的查询请求，外网直接拒绝

    // 开启递归查询（允许服务器代替客户端去互联网上帮查域名）
    recursion yes;

    // 转发外部查询到公共 DNS（当需要递归查询外部域名时，不自己从根服务器开始查，而是直接转发给这些上游DNS）
    forwarders {
        223.5.5.5;  // 阿里公共DNS
        223.6.6.6;  // 阿里公共DNS备用地址
    };

    forward only;   // 只使用转发模式：如果forwarders都不可达，就直接返回失败，不尝试自己去根服务器递归

    // 隐藏版本信息等（防止攻击者通过版本号探测漏洞）
    version "not available";          // 查询版本时返回“不告诉你”，隐藏BIND版本
    hostname "none";                  // 查询hostname时不返回真实主机名
    server-id "none";                 // 查询server-id时也不返回，增强匿名性

    // 安全选项
    allow-transfer { none; };         // 全局禁止任何服务器拉取zone数据（实际在本地zone里单独允许Slave，更安全）
    minimal-responses yes;            // 回复时只给必要信息，不多给额外记录，减少信息泄露

    // DNSSEC
    dnssec-validation no;           // 关闭 DNSSEC 校验，以避免信任链断裂

    // 监听地址
    listen-on { 172.16.0.223; };   // 根据服务器实际IP调整
    listen-on-v6 { none; };  // 不监听在IPv6
};
```

### 2. 配置本地 zone
2. 编辑 `/etc/bind/named.conf.local` 文件：
```bind
// 内网正向解析
zone "internal.bjhit.com" {
    type master;  // 类型为主节点
    file "/etc/bind/zones/db.internal.bjhit.com";   // 区文件路径（自己创建目录）
    allow-transfer { 172.16.0.225; }; // 只允许指定 Slave 传输
    also-notify { 172.16.0.225; };    // 变更时主动通知 Slave
    notify yes;                       // 启用 notify
};

// 如果需要反向解析（如 192.168.1.x），可选添加
// zone "1.168.192.in-addr.arpa" {
//     type master;
//     file "/etc/bind/zones/db.192.168.1";
//     allow-transfer { 172.16.0.225; };
//     also-notify { 172.16.0.225; };
// };
```
### 3. 配置区域数据库
- 区域数据库由众多资源记录（Resource Record, RR）组成，每个域名对应一个区域数据库。

创建`/etc/bind/zones`目录后，编辑 `/etc/bind/zones/db.internal.bjhit.com`文件：

```bind
$TTL    86400
@       IN      SOA     ns1.internal.bjhit.com. admin.internal.bjhit.com. (
                     2025122201         ; Serial（每次修改+1）
                     3600               ; Refresh
                     1800               ; Retry
                     604800             ; Expire
                     86400 )            ; Minimum TTL

@       IN      NS      ns1.internal.bjhit.com.
@       IN      NS      ns2.internal.bjhit.com.

ns1     IN      A       172.16.0.223
ns2     IN      A       172.16.0.225

app1.bj   IN      A       172.16.0.1
app2.bj   IN      A       172.16.0.2
app3.bj   IN      A       172.16.0.3

gitlab.bj   IN      A       172.16.0.100
harbor.bj   IN      A       172.16.0.101
grafana.bj   IN      A       172.16.0.102
mysql.bj   IN      A       172.16.0.103
jenkins.bj   IN      A       172.16.0.104
```
- 区域数据库配置详细说明参考：[https://llinux.cn/基础服务/bind9-dns/#区域数据库](https://llinux.cn/%E5%9F%BA%E7%A1%80%E6%9C%8D%E5%8A%A1/bind9-dns/#%e5%8c%ba%e5%9f%9f%e6%95%b0%e6%8d%ae%e5%ba%93)

### 4. 测试
```sh
# 检查配置文件语法
named-checkconf

# 重新加载配置文件
systemctl reload bind9

# 测试内网 DNS 解析
root@local-server:~# nslookup app1.bj.internal.bjhit.com 172.16.0.223
Server:		172.16.0.223
Address:	172.16.0.223#53

Name:	app1.bj.internal.bjhit.com
Address: 172.16.0.1

root@local-server:~# nslookup mysql.bj.internal.bjhit.com 172.16.0.223
Server:		172.16.0.223
Address:	172.16.0.223#53

Name:	mysql.bj.internal.bjhit.com
Address: 172.16.0.103


# 测试公网 DNS 解析
root@local-server:~# nslookup baidu.com 172.16.0.223
Server:		172.16.0.223
Address:	172.16.0.223#53

Non-authoritative answer:
Name:	baidu.com
Address: 111.63.65.247
Name:	baidu.com
Address: 110.242.74.102
Name:	baidu.com
Address: 111.63.65.103
Name:	baidu.com
Address: 124.237.177.164

root@local-server:~# nslookup qq.com 172.16.0.223
Server:		172.16.0.223
Address:	172.16.0.223#53

Non-authoritative answer:
Name:	qq.com
Address: 123.150.76.218
Name:	qq.com
Address: 203.205.254.157
Name:	qq.com
Address: 113.108.81.189

```

## 从 DNS 服务器配置
- 从 DNS 服务器无需配置区域数据库，而是向主服务器同步。

### 1. 修改全局配置文件
- `/etc/bind/named.conf.options` 与主节点基本相同，但监听IP需改为从节点实际IP。

### 2. 配置本地 zone
2. 编辑 `/etc/bind/named.conf.local` 文件：
```bind
zone "internal.bjhit.com" {
    type slave; // 类型为从节点
    file "/var/cache/bind/db.internal.bjhit.com";   // Slave 自动写入这里（AppArmor 允许）
    masters { 172.16.0.223; };                      // Master IP
    allow-notify { 172.16.0.223; };                 // 只接受 Master notify
};

// 反向区同理（可选）
// zone "1.168.192.in-addr.arpa" {
//     type slave;
//     file "/var/cache/bind/db.192.168.1";
//     masters { 172.16.0.223; };
// };
```

### 3. 测试
```sh
# 检查配置文件语法
named-checkconf

# 重新加载配置文件
systemctl reload bind9

# 查看同步的 zone 文件
root@bj-dns-slave:~# named-compilezone -f raw -F text -o - internal.bjhit.com /var/cache/bind/db.internal.bjhit.com
zone internal.bjhit.com/IN: loaded serial 2025122201
internal.bjhit.com.			      86400 IN SOA	ns1.internal.bjhit.com. admin.internal.bjhit.com. 2025122201 3600 1800 604800 86400
internal.bjhit.com.			      86400 IN NS	ns1.internal.bjhit.com.
internal.bjhit.com.			      86400 IN NS	ns2.internal.bjhit.com.
app1.bj.internal.bjhit.com.		      86400 IN A	172.16.0.1
app2.bj.internal.bjhit.com.		      86400 IN A	172.16.0.2
app3.bj.internal.bjhit.com.		      86400 IN A	172.16.0.3
gitlab.bj.internal.bjhit.com.		      86400 IN A	172.16.0.100
grafana.bj.internal.bjhit.com.		      86400 IN A	172.16.0.102
harbor.bj.internal.bjhit.com.		      86400 IN A	172.16.0.101
jenkins.bj.internal.bjhit.com.		      86400 IN A	172.16.0.104
mysql.bj.internal.bjhit.com.		      86400 IN A	172.16.0.103
ns1.internal.bjhit.com.			      86400 IN A	172.16.0.223
ns2.internal.bjhit.com.			      86400 IN A	172.16.0.225
OK

# 验证 DNS 主从同步状态，修改主节点 /etc/bind/zones/db.internal.bjhit.com 文件中的任意域名指向，以及Serial编号后，重载配置文件后在从节点测试：
root@local-server:~# nslookup grafana.bj.internal.bjhit.com 172.16.0.225
Server:		172.16.0.225
Address:	172.16.0.225#53

Name:	grafana.bj.internal.bjhit.com
Address: 172.16.0.222
```



# 纳入负载均衡


# 下发 DNS 配置
## 修改路由器首选 DNS

## 虚拟机配置 DNS

# FAQs
## 客户端与 DNS 服务器的 IP 与 53端口通，但无法解析域名

日志如下：
- ```sh
  # journalctl -u named -f
  ...
  Dec 23 04:02:35 bj-dns-master named[2564]: client @0x7f8e680900a8 172.16.128.2#62971 (ns1.internal.bjhit.com): query 'ns1.internal.bjhit.com/A/IN' denied
  Dec 23 04:02:42 bj-dns-master named[2564]: client @0x7f8e640089a8 172.16.128.2#62972 (ns2.internal.bjhit.com): query 'ns2.internal.bjhit.com/A/IN' denied
  ```
原因：
- `172.16.128.2` 不在子网 `172.16.0.0/18` 中，导致查询请求被拒绝。

解决方案：
- 修改 `/etc/bind/named.conf.options`，allow-query 中添加被拒绝的IP：`allow-query { 172.16.128.2; 172.16.0.0/18; localhost; };`

## 内网域名可解析，但互联网域名无法解析

日志如下：
- ```sh
  # journalctl -u named -f
  ...
  Dec 23 04:21:32 bj-dns-master named[2649]:   validating com/DS: bad cache hit (./DNSKEY)
  Dec 23 04:21:32 bj-dns-master named[2649]: broken trust chain resolving 'baidu.com/A/IN': 223.6.6.6#53
  ```

原因：
- BIND 开启了 DNSSEC 自动校验`dnssec-validation auto;`，但在转发模式`forward only;`下，上游 DNS（如 223.6.6.6）返回的加密验证信息无法通过 BIND 本地的安全性检查，导致“信任链断裂”。

解决方案：
- 修改 `/etc/bind/named.conf.options`，关闭 DNSSEC 校验，以避免信任链断裂：`dnssec-validation no;`

## Master 上修改了区文件并重载了服务，但 Slave 上查询还是旧数据。
- Master SOA 记录中的 Serial 序列号没有增加，导致 Slave 认为 Master 没有更新，从而不触发 zone transfer。


# 监控 BIND9
## 监控
## 告警模板