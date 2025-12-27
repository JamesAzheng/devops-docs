---
title: "BIND9 DNS"
---

## 前言

- Bekerley Internet Name Domain
- 由 ISC （www.isc.org）提供的DNS软件实现DNS域名结构
- 除 bind DNS 可以提供 DNS 功能外，powerdns、unbound 同样也可以提供 DNS 功能



## bind DNS 相关端口

- dns 使用的是 tcp 和 udp 的53端口
- 953是 rndc 管理使用的端口 用不到这个端口的话关闭953端口也可以



## BIND9 安装

```bash
# CentOS
yum -y install bind bind-utils

# Ubuntu
apt -y install bind9
```

## BIND9 相关文件
### Ubuntu
最常用的几个：
- 改配置基本只动 /etc/bind/named.conf.local 和 named.conf.options
- 自己加区域文件一般都放在 /etc/bind/zones/ 目录下（自己新建），然后在 named.conf.local 里 include
- 主程序是 /usr/sbin/named
- 运行数据都在 /var/cache/bind
```sh
# dpkg -L bind9
/etc/bind/named.conf                # BIND9 主配置文件，所有配置的入口
/etc/bind/named.conf.options        # 全局选项配置（如监听地址、递归、DNSSEC等）
/etc/bind/named.conf.local          # 用户自定义区域文件，通常放你自己添加的zone
/etc/bind/named.conf.default-zones  # Debian/Ubuntu 默认预定义的几个基本zone（如localhost、127.0.0.1）
/etc/bind/bind.keys                 # DNSSEC 信任锚（trust anchors），存放根区KSK公钥
/etc/bind/db.0                      # 根区提示文件（root hints），告诉BIND根服务器在哪里
/etc/bind/db.127                    # 127.0.0.1 反向解析区（localhost）
/etc/bind/db.local                  # 本地环回正向解析区（localhost -> 127.0.0.1）
/etc/bind/db.empty                  # 空区模板，经常用来做黑洞/空区
/etc/bind/db.255                    # 广播地址反向区（255.255.255.255）
/etc/bind/zones.rfc1918             # RFC1918 私有地址空区配置（10/172.16/192.168 返回NXDOMAIN，防泄漏）

/etc/default/named                  # Debian/Ubuntu 启动参数配置（如是否启用chroot、额外选项）

/usr/sbin/named                     # BIND9 主程序（DNS服务器守护进程）
/usr/sbin/ddns-confgen               # 生成动态更新用的TSIG密钥工具（替代tsig-keygen）
/usr/sbin/tsig-keygen               # 生成TSIG密钥工具（已软链接到ddns-confgen）

/usr/bin/named-rrchecker            # 检查资源记录语法是否正确的工具
/usr/bin/named-journalprint         # 打印journal文件内容（查看zone动态更新历史）
/usr/bin/named-nzd2nzf              # 把.nzd格式区文件转成普通zone格式
/usr/bin/arpaname                   # ARPA域名转punycode工具（很少用）
/usr/bin/nsec3hash                  # 生成NSEC3 hash工具（DNSSEC相关）
/usr/bin/dnssec-importkey           # 把DNSKEY导入trusted-keys格式的工具

/var/cache/bind                     # 默认工作目录，存放动态zone的.jnl文件、统计数据、缓存等

/lib/systemd/system/named.service   # systemd 服务单元文件（启动named）
/lib/systemd/system/named-resolvconf.service # 与resolvconf集成的小服务

/etc/apparmor.d/usr.sbin.named      # AppArmor 安全策略文件（限制named权限）

/usr/lib/x86_64-linux-gnu/bind/filter-a.so      # view/filter功能用的过滤模块（过滤A记录）
/usr/lib/x86_64-linux-gnu/bind/filter-aaaa.so   # 同上，过滤AAAA记录（IPv6）

/usr/share/doc/bind9/NEWS.Debian.gz          # Debian 特定版本的重要更新说明（必看）
/usr/share/doc/bind9/changelog.Debian.gz     # Debian 打包历史变更记录
/etc/ufw/applications.d/bind9       # UFW 防火墙预定义规则（方便一键开放53端口）
```

### CentOS
```sh
# rpm -ql bind
...
/etc/named.conf #主配置文件
/usr/lib/systemd/system/named.service #主程序
/var/named/named.ca #根DNS服务器的地址
/var/named #主DNS数据库的存放路径(区域数据库)
...
```



## BIND9 配置文件说明
### 区域数据库
`/etc/bind/zones/db.internal.bjhit.com`文件：
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
@       IN      NS      ns3.internal.bjhit.com.   ; 如果有第三个

ns1     IN      A       192.168.1.10
ns2     IN      A       192.168.1.11
ns3     IN      A       192.168.1.12

s1.bj   IN      A       192.168.1.101   ; 示例记录
s2.bj   IN      A       192.168.1.102
s3.bj   IN      A       192.168.1.103
```
这个文件是 BIND9 的**正向解析区文件（Zone File）**，文件名通常是 `db.internal.bjhit.com`（或类似），用于定义域名 `internal.bjhit.com` 下所有主机名到 IP 地址的映射关系。


```
$TTL    86400
```
- **含义**：设置这个区内所有记录的**默认生存时间（TTL，Time To Live）** 为 86400 秒（也就是 24 小时）。
- **作用**：告诉其他 DNS 服务器（或客户端缓存）这个记录可以缓存多久，过期后需要重新查询。1 天是常见默认值。

```
@       IN      SOA     ns1.internal.bjhit.com. admin.internal.bjhit.com. (
                     2025122201         ; Serial
                     3600               ; Refresh
                     1800               ; Retry
                     604800             ; Expire
                     86400 )            ; Minimum TTL
```
- 这是**SOA 记录（Start of Authority，权威开始记录）**，每个区文件必须有且只能有一条，是这个域的“身份证”。
- **@**：代表当前区名本身，即 `internal.bjhit.com.`（注意后面有点，域名全称以点结尾）。该值通过 zone 配置文件`/etc/bind/named.conf.local`中的 `zone "internal.bjhit.com"` 和 `file` 指向的文件名结合来确定的。
- **IN**：表示 Internet 类（几乎总是 IN）。
- **SOA**：记录类型。
- **ns1.internal.bjhit.com.**：这个域的主名字服务器（Primary NS），带点表示全称。
- **admin.internal.bjhit.com.**：管理员邮箱（@ 替换成了点），即 admin@internal.bjhit.com。
    - `ns1.internal.bjhit.com.`、`admin.internal.bjhit.com.` 这两个字段是 SOA 记录里必须填写的两个关键部分，不能省略。
- 括号内是 SOA 的参数：
  - `2025122201` **Serial（序列号）**：每次修改区文件后必须增大这个数字（常用格式：年月日+当天第几次修改）。Slave 服务器通过比较 Serial 判断是否需要从 Master 拉取更新。
  - `3600` **Refresh**：Slave 每隔 3600 秒（1 小时）检查一次 Master 是否有更新。
  - `1800` **Retry**：如果 Slave 联系 Master 失败，1800 秒（30 分钟）后重试。
  - `604800` **Expire**：如果 Slave 连续 604800 秒（7 天）都联系不上 Master，就认为自己的数据过期，不再提供服务。
  - `86400` **Minimum TTL**：旧版 BIND 用的负缓存 TTL（现在大多被 $TTL 取代，但仍建议保留）。

```
@       IN      NS      ns1.internal.bjhit.com.
@       IN      NS      ns2.internal.bjhit.com.
@       IN      NS      ns3.internal.bjhit.com.   ; 如果有第三个
```
- **NS 记录（Name Server 记录）**：声明这个域的权威名字服务器有哪些。
- 写了三条，表示 `internal.bjhit.com` 由 ns1、ns2、ns3 三台服务器共同负责。
- 客户端查询这个域时，会从这些 NS 中选择一台问。
- 注意：每条 NS 记录的域名后都要带点（全称）。

```
ns1     IN      A       192.168.1.10
ns2     IN      A       192.168.1.11
ns3     IN      A       192.168.1.12
```
- **A 记录（Address 记录）**：把主机名映射到 IPv4 地址。
- `ns1` 是简写，实际代表 `ns1.internal.bjhit.com.`。
- 这三条是“胶记录（glue records）”，非常重要！因为 NS 记录指向了 ns1/ns2/ns3，如果没有对应的 A 记录，外部就不知道这些 NS 的 IP 是多少，导致解析链断掉。

```
s1.bj   IN      A       192.168.1.101   ; 示例记录
s2.bj   IN      A       192.168.1.102
s3.bj   IN      A       192.168.1.103
```
- 真正的业务主机记录。
- `s1.bj` 是简写，完整域名是 `s1.bj.internal.bjhit.com.`。
- 表示访问 `s1.bj.internal.bjhit.com` 时返回 IP 192.168.1.101。
- 分段写法（bj 层）是为了方便管理，实际解析时会自动补全成完整域名。

**总结这个文件的作用**
- 定义了域名 `internal.bjhit.com` 的全部解析规则。
- 声明了三台名字服务器（ns1/ns2/ns3）及其 IP。
- 提供了几台业务服务器的地址（s1.bj、s2.bj、s3.bj）。
- 只放在 **Master 服务器** 上修改，Slave 会自动通过 zone transfer 同步这个文件内容。

**使用建议**
- 每次修改这个文件后，**记得把 Serial 号码加 1**（比如改成 2025122202）。
- 然后执行 `sudo rndc reload internal.bjhit.com` 平滑重载。
- 可以继续添加更多记录，比如：
  - `www` IN A 192.168.1.100
  - `mail` IN A 192.168.1.50
  - `*.bj` IN A 192.168.1.200  ; 通配符记录（慎用）


## BIND9 相关工具
```sh
# 检查配置文件语法
named-checkconf


# 检查区域数据库的语法，第一个xiangzheng.org表示在配置文件中定义的名称
named-checkzone xiangzheng.org /var/named/xiangzheng.org.zone
named-checkzone xiangzheng.org /var/cache/bind/xiangzheng.com.zone.bind

# 重新加载 BIND DNS
systemctl reload bind9

# 重新加载BIND DNS（依赖于 named 进程开放的 TCP/953 控制端口）
rndc reload
```
