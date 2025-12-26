---
title: "Ceph配置文件"
---

https://docs.ceph.com/en/latest/rados/configuration/ceph-conf/#

# Ceph 配置文件加载顺序

- $cluster 为集群名称，默认为ceph（参阅Ceph元变量）

1. `$CEPH_CONF`（`$CEPH_CONF` 环境变量后面的路径）
2. `-c path/path` （命令行`-c`参数）
3. `/etc/ceph/$cluster.conf`
4. `~/.ceph/$cluster.conf`
5. `./$cluster.conf`（在当前工作目录中）
6. 仅在 FreeBSD 系统上，`/usr/local/etc/ceph/$cluster.conf`





# Ceph 配置文件说明

- Ceph 配置文件使用 ini 风格的语法。您可以在井号 (#) 或分号 (;) 后添加注释文本；
- 选项名称可以使用 **_** 作为分隔符，也可以使用 **-** 作为分隔符，但建议统一使用 **_** 作为分隔符。
  - 例如：`mon-host` 等同于 `mon_host`
- **配置优先级：**
  - 越具体，越优先，例如：[global] 和 [osd.1] 部分定义了相同类型的配置，则 [osd.1] 中定义的值生效
  - 如果在同一部分中指定了同一配置选项的多个值，则最后一个值优先。
  - 请注意，本地配置文件中的值始终优先于监视器配置数据库中的值，无论它们出现在哪个部分。

```ini
# 全局配置段，会影响 Ceph 存储集群中的所有守护进程和客户端。
[global]
debug_ms = 0
log_file = /var/log/ceph/$cluster-$type.$id.log
# 示例选项，支持长格式换行写入，下面的例子相当于 foo = long long ago long ago
foo = long long ago\
long ago

# mon配置段，会影响 Ceph 存储集群中的所有ceph-mon守护进程，并覆盖 global.
[mon]
mon_cluster_log_to_syslog = true

# mgr配置段，会影响 Ceph 存储集群中的所有ceph-mgr守护进程，并覆盖 global.
[mgr]
mgr_stats_period = 10

# osd配置段，会影响 Ceph 存储集群中的所有ceph-osd守护进程，并覆盖 global.
[osd]
debug_ms = 1
osd_op_queue = wpq

[osd.1] # 针对某个单独的osd守护进程进行配置
debug_ms = 10

[osd.2] # 针对某个单独的osd守护进程进行配置
debug_ms = 10

# mds配置段，会影响 Ceph 存储集群中的所有ceph-mds守护进程，并覆盖 global.
[mds]
mds_cache_memory_limit = 10G


# client配置段，会影响所有 Ceph 客户端（例如，挂载的 Ceph 文件系统、挂载的 Ceph 块设备等）以及 Rados 网关 (RGW) 守护进程。
[client]
objecter_inflight_ops = 512

[client.smith] # 针对某个单独的客户端进行配置
```



# Ceph 元变量

https://docs.ceph.com/en/latest/rados/configuration/ceph-conf/#metavariables

元变量极大地简化了 Ceph 存储集群配置。当在配置值中设置元变量时，Ceph 在使用配置值时将元变量扩展为具体值

Ceph 支持以下元变量：

## $cluster

- 扩展为 Ceph 存储集群名称。在同一硬件上运行多个 Ceph 存储集群时很有用。
- Example：`/etc/ceph/$cluster.keyring`
- Default：`ceph`

## $type

- 扩展为守护进程或进程类型（例如`mds`、`osd`或`mon`）
- Example：`/var/lib/ceph/$type`

## $id

- 扩展为守护程序或客户端标识符。如果是 `osd.0`，这将为`0`；如果是 `mds.a`，这将为`a`。

- Example：`/var/lib/ceph/$type/$cluster-$id`

## $host

- 扩展为运行进程的主机名。

## $name

- 扩展为`$type.$id`。
- Example：`/var/run/ceph/$cluster-$name.asok`

## $pid

- 扩展为守护程序 pid。

- Example：`/var/run/ceph/$cluster-$name-$pid.asok`





# Ceph 配置源注意事项

https://docs.ceph.com/en/latest/rados/configuration/ceph-conf/#config-sources

每个 Ceph 守护进程、进程和库都会从下面列出的几个来源中提取其配置。当两者都存在时，列表后面的来源将覆盖列表前面的来源。

- 编译的默认值
- 监视器集群的集中配置数据库
- 存储在本地主机上的配置文件
- 环境变量
- 命令行参数
- 管理员设置的运行时覆盖







# Ceph 运行时修改配置

https://docs.ceph.com/en/latest/rados/configuration/ceph-conf/#runtime-changes

在大多数情况下，Ceph 允许您在运行时更改守护进程的配置。此功能对于增加/减少日志输出、启用/禁用调试设置，甚至对于运行时优化非常有用。

一般来说，配置选项可以通过命令以通常的方式更新。

```sh
# 范例：在特定 OSD 上启用调试日志级别
ceph config set osd.123 debug_ms 20
```

## 临时覆盖配置

- https://docs.ceph.com/en/latest/rados/configuration/ceph-conf/#override-values

## 查看运行时设置

- https://docs.ceph.com/en/latest/rados/configuration/ceph-conf/#viewing-runtime-settings

