---
title: "NTP"
---

# ntp 概述

## Linux时间同步软件概述

- **ntp（老牌）**

- **chrony（推荐使用）**

- **ntp和chrony底层都是遵从ntp协议的**
- 通常在生产中会独立设置**两个**时间同步NTP服务器（两个为了容错）指向国内的NTP服务器，来对其他主机提供时间同步服务



## 公共 NTP 服务

- **阿里云 Unix/linux类：**ntp.aliyun.com，ntp1-7.aliyun.com
- **阿里云 windows类：** time.pool.aliyun.com

- **北京邮电大学：**s1a.time.edu.cn
- **清华大学：**s1b.time.edu.cn 
- **北京大学：**s1c.time.edu.cn 
- **国家授时中心服务器：**210.72.145.44



## 时区

- UTC（Coordinated Universal Time）：协调世界时，是国际标准时间（UTC+0：与UTC时间相同）

- GMT（Greenwich Mean Time）：格林威治标准时间（UTC+0：与UTC时间相同）
- CST（Central Standard Time）：中部标准时间，常见于北美洲（UTC-6：比UTC慢6个小时）

- 中国标准时间（China Standard Time）：中国所采用的标准时间（UTC+8：比UTC快8个小时）
  - 中国标准时间也简称为 CST



**UTC和GMT有什么区别**

UTC（Coordinated Universal Time）和GMT（Greenwich Mean Time）之间的主要区别在于它们的定义和使用方式：

1. 定义：
   - UTC：UTC是一种基于原子钟的时间标准，通过精确测量地球自转的速度来保持稳定性。它是由国际原子时（TAI）与可预测的闰秒调整相结合，以确保与地球自转的匹配。
   - GMT：GMT是基于天文观测的时间标准，最初是以伦敦格林威治天文台的时间为基准，基于地球自转周期的平均值。
2. 使用方式：
   - UTC：UTC是国际上广泛采用的标准时间，用于协调全球的时间标准化，许多计算机和通信系统都以UTC为基准进行时间同步。
   - GMT：GMT是一个术语，用来表示相对于格林威治的时间偏移。在实际应用中，UTC已经成为主要的时间标准，而GMT通常用作与UTC相同的含义。

总结来说，UTC是基于原子钟的国际标准时间，而GMT是基于天文观测的时间标准。尽管GMT最初是以伦敦的时间为基准，但在现代应用中，UTC被广泛接受并用作全球统一的时间标准，而GMT通常被视为与UTC相同的概念。



# chrony

## chrony 概述

Chrony 是一个用于 Linux 系统的网络时间同步工具，它用于确保系统时间与网络时间服务器保持同步和精确。与传统的 NTP (Network Time Protocol) 客户端相比，Chrony 具有更高的精度和稳定性，并提供了一些高级功能。

以下是 Chrony 的一些特点和功能：

1. 高精度时间同步：Chrony 使用一种称为“混合时钟过滤器”的算法，结合本地时钟和多个网络时间服务器的时间信息，以实现高度准确的时间同步。这种算法可以在网络延迟和抖动的情况下提供更稳定的时间同步。
2. 时钟漂移调整：Chrony 可以通过连续监测和测量系统时钟的漂移率，动态地调整系统时钟，以保持时间的准确性。它可以自动校准时钟的频率，并逐渐调整以避免时间跳跃。
3. 网络时间服务器管理：Chrony 可以管理多个网络时间服务器，并根据它们的可用性、准确性和延迟等指标来选择最佳的时间源。它支持对时间服务器的自动发现和选择，以确保从可靠的和准确的时间源同步时间。
4. 闰秒处理：Chrony 能够处理闰秒的插入和删除，以保持时间的连续性和准确性。
5. 移动设备支持：Chrony 针对移动设备（如笔记本电脑）提供了一些特殊的优化，以适应网络连接的变化和离线操作的场景。
6. 系统日志和监控：Chrony 提供了详细的系统日志和监控信息，可以用于跟踪时间同步状态、调试问题和监控时间性能。

在安装和配置 Chrony 后，它将自动作为一个守护进程在后台运行，并与指定的时间服务器进行通信，以确保系统时间的准确性和同步。你可以编辑配置文件 `/etc/chrony.conf` 来自定义 Chrony 的配置，包括指定时间服务器、配置闰秒处理等。

需要注意的是，Chrony 可以与其他时间同步工具（如 systemd-timesyncd 或 ntpd）共存，但最好不要同时运行多个时间同步工具，以避免冲突和不一致的时间同步行为。

总体而言，Chrony 是一个功能强大且可靠的时间同步工具，适用于需要高精度和稳定时间同步的 Linux 系统环境。

- https://chrony.tuxfamily.org



Chrony 时间同步工具在网络通信中使用以下两个端口：

1. UDP 端口 123：Chrony 使用 UDP 端口 123 来进行时间同步通信。默认情况下，Chrony 作为 NTP 客户端使用此端口与时间服务器进行通信。
2. TCP 端口 323：Chrony 也支持使用 TCP 端口 323 进行时间同步通信。但是，默认情况下，Chrony 通常使用 UDP 端口 123 进行通信，因为 NTP 协议在 UDP 上运行更为常见和广泛支持。

请确保防火墙或网络设备允许在 Chrony 客户端和时间服务器之间进行 UDP 123 端口的通信，以确保时间同步的正常进行。如果你在网络中有防火墙规则，你可能需要配置规则以允许 Chrony 客户端访问时间服务器的 UDP 123 端口。

需要注意的是，Chrony 时间同步工具在默认配置下不作为时间服务器监听端口。它主要用于客户端模式，与时间服务器进行通信并调整本地系统时钟。如果你希望将 Chrony 设置为时间服务器，你需要相应地修改配置文件，并根据需要打开 TCP 323 端口用于监听其他客户端的时间同步请求。

请注意，端口号是网络通信中的虚拟地址，具体的端口使用情况可能因系统配置、环境需求或个人偏好而有所不同。在进行任何网络配置更改时，请谨慎考虑并参考相关文档和安全最佳实践。



## chrony 安装

```sh
# Centos
yum -y install chrony

# Ubuntu
apt -y install chrony
```



## chrony 相关文件

```bash
[root@centos ~]# rpm -ql chrony
/etc/NetworkManager/dispatcher.d/20-chrony
/etc/chrony.conf #主配置文件
/etc/chrony.keys
/etc/dhcp/dhclient.d/chrony.sh
/etc/logrotate.d/chrony
/etc/sysconfig/chronyd
/usr/bin/chronyc #主程序
/usr/lib/.build-id
/usr/lib/.build-id/9a
/usr/lib/.build-id/9a/91fc5f84c9a7dfc41b114c7c9a28581a74b2bb
/usr/lib/.build-id/e1
/usr/lib/.build-id/e1/f1bac1dc701342a9f8aad225f91928a5f0181a
/usr/lib/systemd/ntp-units.d/50-chronyd.list
/usr/lib/systemd/system/chrony-dnssrv@.service
/usr/lib/systemd/system/chrony-dnssrv@.timer
/usr/lib/systemd/system/chrony-wait.service
/usr/lib/systemd/system/chronyd.service # chrony服务service文件
/usr/libexec/chrony-helper
/usr/sbin/chronyd
/usr/share/doc/chrony
/usr/share/doc/chrony/FAQ
/usr/share/doc/chrony/NEWS
/usr/share/doc/chrony/README
/usr/share/doc/chrony/ntp2chrony.py
/usr/share/licenses/chrony
/usr/share/licenses/chrony/COPYING
/usr/share/man/man1/chronyc.1.gz
/usr/share/man/man5/chrony.conf.5.gz
/usr/share/man/man8/chronyd.8.gz
/var/lib/chrony
/var/lib/chrony/drift
/var/lib/chrony/rtc
/var/log/chrony
```



## chrony 配置文件说明

`/etc/chrony.conf` 是 Chrony 时间同步工具的配置文件，它包含了用于指定时间服务器、配置时间同步行为和其他相关选项的配置信息。以下是 `/etc/chrony.conf` 配置文件的一些常用选项和其详细说明：

```sh
# server：指定要使用的时间服务器。你可以添加多个 server 行来列出多个时间服务器。例如：
server time1.example.com
server time2.example.com

# pool：与 server 类似，但它使用池的方式选择时间服务器。可以指定一个池的名称或地址。例如：
pool pool.ntp.org

# allow：指定允许访问 Chrony 时间服务器的客户端 IP 地址或网络段。默认情况下，所有客户端都被允许访问。例如：
allow 192.168.0.0/24

# deny：指定禁止访问 Chrony 时间服务器的客户端 IP 地址或网络段。默认情况下，没有客户端被禁止访问。例如：
deny 10.0.0.2

# initstepslew：指定启动 Chrony 时进行时间调整的速率。默认情况下，它是 1 ppm (parts per million)。例如：
initstepslew 10

# keyfile：指定包含密钥的文件的路径。Chrony 使用密钥进行身份验证和加密。例如：
keyfile /etc/chrony.keys

# driftfile：指定保存系统时钟漂移数据的文件路径。该文件记录了系统时钟的漂移率。例如：
driftfile /var/lib/chrony/chrony.drift

# logdir：指定 Chrony 日志文件的存储目录。默认情况下，日志文件存储在 `/var/log/chrony/` 目录下。例如：
logdir /var/log/chrony
```

以上只是 `/etc/chrony.conf` 配置文件中的一些常用选项，还有其他一些选项可用于配置闰秒处理、权限控制、调试选项等。在配置文件中，还包含了详细的注释，可以帮助你理解和设置各个选项的含义和用法。

请注意，在修改 `/etc/chrony.conf` 配置文件后，你需要重新启动 Chrony 服务以使更改生效。你可以使用 `systemctl restart chronyd` 命令来重新启动 Chrony 服务。

要了解更多关于 Chrony 的配置选项和使用方法，请参考 Chrony 的官方文档或手册。







## chrony 相关工具

### chronyc

`chronyc` 是 `chronyd` 时间同步服务的命令行管理工具，用于与 `chronyd` 守护进程进行交互和管理。它提供了一组命令，可以查询和控制时间同步的各个方面。以下是一些常用的 `chronyc` 命令及其功能：

1. `chronyc sources`：显示当前与 `chronyd` 同步的时间源（NTP 服务器）的状态信息，包括源的名称、步进（stratum）、状态、延迟（delay）和偏移（offset）等。
2. `chronyc tracking`：显示本地系统与时间源同步的详细信息，包括偏移（offset）、延迟（delay）、时钟频率（frequency）、系统时钟精度（system clock precision）等。
3. `chronyc makestep`：强制时间调整，即立即调整系统时间以与时间源同步。这通常用于快速调整时间，但可能会产生一些系统时钟偏移。
4. `chronyc sources -v`：显示更详细的时间源信息，包括每个源的版本、协议、支持的模式和选项等。
5. `chronyc sources -a`：显示所有可用的时间源列表，包括可用性和可达性。
6. `chronyc sourcestats`：显示时间源的统计信息，包括源的名称、接收的数据包数量、丢失的数据包数量、延迟和偏移等。
7. `chronyc waitsync <seconds>`：等待系统与时间源同步的指定时间（以秒为单位）。这对于等待时间同步完成或在脚本中进行同步等待非常有用。
8. `chronyc exit`：退出 `chronyc` 命令行界面。

这些只是 `chronyc` 命令中的一些常见用法示例。你可以通过运行 `chronyc help` 命令或查阅 `chronyc` 的官方文档来获取更多命令和详细信息。

### sources -v

显示当前与 `chronyd` 同步的时间源（NTP 服务器）的状态信息

```ABAP
210 Number of sources = 2

  .-- Source mode  '^' = server, '=' = peer, '#' = local clock.
 / .- Source state '*' = current synced, '+' = combined , '-' = not combined,
| /   '?' = unreachable, 'x' = time may be in error, '~' = time too variable.
||                                                 .- xxxx [ yyyy ] +/- zzzz
||      Reachability register (octal) -.           |  xxxx = adjusted offset,
||      Log2(Polling interval) --.      |          |  yyyy = measured offset,
||                                \     |          |  zzzz = estimated error.
||                                 |    |           \
MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^x 172-16-0-125.kubelet.kub>    10   6    77    52  +14316s[+14316s] +/-   86us
^x 172-16-0-127.kubelet.kub>    10   6    77    52   +7122s[ +7122s] +/-  132us

```

- `Number of sources = 2`：NTP 源的数量为 2。
- `Source mode`：表明每个源的类型。`^` 表示服务器模式，`=` 表示对等模式，`#` 表示本地时钟。
- `Source state`：表明每个源的状态。`*` 表示当前同步，`+` 表示已合并，`-` 表示未合并，`?` 表示无法访问，`x` 表示时间可能有误，`~` 表示时间波动较大。
- `Reachability register`：以八进制表示的可达性注册值，指示每个源的可达性情况。
- `Log2(Polling interval)`：以二进制对数表示的轮询间隔。
- `MS Name/IP address`：源的名称或 IP 地址。
- `Stratum`：源的层级。
- `Poll`：轮询间隔。
- `Reach`：源的可达性。
- `LastRx`：最后接收到数据的时间。
- `Last sample`：最后采样的时间。
- `Offset`：偏差，用于测量系统时间与源时间之间的差异。
- `Jitter`：抖动，表示源时间的变化范围。

根据输出结果，你提供的两个源都以 `^x` 开头，表示服务器模式且时间可能有误。`Stratum` 值为 10，表示这些源是间接源，即它们从其他时间源同步。

需要注意的是，由于时间可能有误，这些源的时间不应被视为准确的时间。你可能需要检查源的可达性和稳定性，并考虑更可靠的源来同步时间。





### tracking

显示本地系统与时间源同步的详细信息，包括偏移（offset）、延迟（delay）、时钟频率（frequency）、系统时钟精度（system clock precision）等。

通过`chronyc tracking`命令输出，你可以了解到与时间源的同步情况、时间偏差和频率偏差等信息，以评估系统时间的准确性和稳定性。

```yaml
# chronyc tracking
Reference ID    : AC10007D (172-16-0-125.kubelet.kube-system.svc.cluster.loca)
Stratum         : 4
Ref time (UTC)  : Wed May 31 08:19:34 2023
System time     : 0.000000272 seconds fast of NTP time
Last offset     : -0.000531825 seconds
RMS offset      : 0.003528475 seconds
Frequency       : 15.666 ppm fast
Residual freq   : -0.643 ppm
Skew            : 6.549 ppm
Root delay      : 0.054410171 seconds
Root dispersion : 0.005759091 seconds
Update interval : 64.0 seconds
Leap status     : Normal
```

- Reference ID: 指定参考时间源的标识符，通常是一个IP地址或主机名。
- Stratum: 指定该节点的层级。更低的层级表示更接近时间源的节点。
- Ref time (UTC): 参考时间的UTC时间戳，显示最后一次与时间源同步的时间。
- System time: 当前系统时间相对于NTP时间的偏差。正值表示系统时间快于NTP时间，负值表示系统时间慢于NTP时间。
- Last offset: 最近一次与时间源同步时的时间偏差，以秒为单位。负值表示系统时间早于时间源。
- RMS offset: 对最近一次同步时间偏差的平均误差，以秒为单位。
- Frequency: 系统时钟的频率偏差，以 parts per million (ppm) 表示。正值表示系统时钟快于标准时钟频率，负值表示系统时钟慢于标准时钟频率。
- Residual freq: 当前系统时钟频率相对于标准时钟频率的偏差，以 parts per million (ppm) 表示。
- Skew: 时钟偏斜率，以 parts per million (ppm) 表示。它表示时钟偏差的变化速率。
- Root delay: 从本地节点到时间源的传输延迟，以秒为单位。
- Root dispersion: 本地节点与时间源之间的时间差的估计值，以秒为单位。
- Update interval: 时间同步的更新间隔，以秒为单位。
- Leap status: 时间同步服务的闰秒状态。Normal表示无闰秒调整。



## chrony 作为客户端

- 作为客户端，指向时间同步服务器来实现时间同步

```sh
# vim /etc/chrony/chrony.conf
server ntp.aliyun.com iburst
stratumweight 0
driftfile /var/lib/chrony/drift
rtcsync
makestep 10 3
bindcmdaddress 127.0.0.1
bindcmdaddress ::1
keyfile /etc/chrony.keys
commandkey 1
generatecommandkey
logchange 0.5
logdir /var/log/chrony


# 验证：
systemctl restart chronyd
ss -nul | grep 323
chronyc sources -v # 查看时间同步状态，*代表已经同步
```





## chrony 作为服务端

安装chrony后，修改/etc/chrony/chrony.conf：

```sh
# 作为时间同步服务器为其他主机提供服务，优先使用公网 NTP 服务器，当公网 NTP 服务器不可用时使用本地时间作为备用
server ntp1.aliyun.com
server ntp2.aliyun.com
local stratum 10
allow all
maxupdateskew 100.0
rtcsync
makestep 1 3



# 仅作为时间同步服务器为其他主机提供服务，不与公网 NTP 服务器同步：
local stratum 10
allow all
maxupdateskew 100.0
rtcsync
makestep 1 3
```





### 验证

```sh
systemctl restart chronyd
ss -ntulp | grep -E "(323|123)"
```

最后其他需要同步时间的主机安装 chrony 然后将同步的IP指向此服务器即可，或者也可以使用 `ntpdate -b <ntp-server>` 手动向该服务器进行时间同步。  



您可以使用以下方法验证 Chrony 是否按预期工作：

1. **查看系统日志**：可以检查系统日志以查看 Chrony 的活动和任何潜在的错误消息。在大多数 Linux 发行版中，系统日志通常位于 `/var/log/messages`、`/var/log/syslog` 或 `/var/log/chrony/chronyd.log`。您可以使用 `tail` 命令查看最新的日志条目：

   ```sh
   tail -f /var/log/chrony/chronyd.log
   ```

2. **使用 `chronyc` 工具**：`chronyc` 是 Chrony 的命令行工具，可用于检查服务器状态、观察时钟偏移等。以下是一些示例命令：

   - 检查与服务器同步状态：

     ```sh
     chronyc tracking
     ```

   - 查看当前时间源：

     ```sh
     chronyc sources
     ```

   - 查看系统的平均时钟偏移和频率：

     ```sh
     chronyc sources -v
     ```

3. **检查时间同步**：您可以通过与其他已知准确的时间源进行比较来验证时间同步。例如，您可以使用 `ntpdate` 命令与公共 NTP 服务器进行比较：

   ```sh
   sudo ntpdate -q time.example.com
   ```

   这将显示您的系统时间与指定服务器的时间之间的差异。

4. **使用 `ntpq` 工具**：如果您的系统安装了 ntpd，则可以使用 `ntpq` 命令检查与 NTP 服务器的连接和状态。例如：

   ```sh
   ntpq -p
   ```

   这将显示与当前 NTP 服务器的连接状态和偏移值。

通过以上方法，您可以验证 Chrony 是否正确配置并正常工作，以确保时间同步的准确性。



### ---

- 作为时间同步服务器来对其他主机提供服务的

```bash
[root@centos ~]# vim /etc/chrony.conf
...
#allow 192.168.0.0/16（按照这个格式，启一新行，添加对哪些主机提供服务即可）
allow 0.0.0.0/0 # 向任何人提供时间同步服务，allow all 与之等价
local stratum 10 # 这行表示是否设置当此时间同步服务器与指向的NTP服务器无法完成同步时，是否继续为其下面的主机继续提供时间同步服务，继续提供的话把此行的#号删除即可 
...


# 重启服务，重启服务后会自动开启upd本地的123端口对外提供时间同步服务
systemctl restart chronyd


# ss -ntulp | grep -E "(323|123)"
udp    UNCONN   0        0                 0.0.0.0:123            0.0.0.0:*      users:(("chronyd",pid=10073,fd=3))                                             
udp    UNCONN   0        0               127.0.0.1:323            0.0.0.0:*      users:(("chronyd",pid=10073,fd=1))                                             
udp    UNCONN   0        0                   [::1]:323               [::]:*      users:(("chronyd",pid=10073,fd=2))   
```

- 最后其他需要同步时间的主机安装chrony 然后将同步的IP指向此服务器即可





**local stratum 10**

 local指令用来允许将本地时间作为标准时间授时给其它客户端，即使自己未能通过网络时间服务器同步到真实时间。通常用在独立网络中，在某台作为ntp服务器的主机上配置，为其他需要同步时间的ntp客户端提供时间同步服务。该台主机通过定期手动输入，来保持时间与真实时间一致。



值10可以被其他值取代，可选范围为1到15。stratum 1表示计算机具有直接连接的真实时间的参考时间源，例如：GPS、原子钟。这样的计算机的时间与真实时间非常接近。stratum 2表示该计算机有一个stratum 1的计算机作为同步时间源；stratum 3表示该计算机有一个stratum 10的计算机作为同步时间源。选择stratum 10，这个值是比较大的，表示距离具有真实时间的服务器比较远，它的时间是不太可靠的。换句话说，假如该计算机可以连接到一台最终与真实时间同步的计算机，那么该计算机的stratum层级几乎可以肯定比10小。因此，为local命令选取stratum 10这样的大数值，可以防止机器本身的时间与真实时间混淆，可以保证该机器不会将本身的时间授时给那些可以连接同步到真实时间的ntp服务器的ntp客户端。



在 Chrony 的配置文件 `/etc/chrony.conf` 中，`local stratum` 是一个选项，用于设置本地系统的时间层级（stratum）。

Stratum 是指在时间同步网络中，时间服务器的等级。较低的 stratum 值表示更高层级的服务器，而较高的 stratum 值表示更低层级的服务器。通常，Stratum 0 是指最高级别的时间源（如原子钟），Stratum 1 是直接与 Stratum 0 同步的服务器，而 Stratum 2 是间接与 Stratum 1 同步的服务器，以此类推。

`local stratum` 选项允许你设置本地系统的时间层级。默认情况下，Chrony 将本地系统设置为 stratum 16（未同步状态）。但是，你可以使用 `local stratum` 选项将本地系统的时间层级设置为其他值，例如：

```
local stratum 10
```

上述配置将本地系统的时间层级设置为 10。请注意，Stratum 值的范围通常是 0 到 15，其中 16 表示未同步状态，0 是最高级别的时间源。

请注意，将本地系统的时间层级设置为较低的值并不会改变实际的时间同步状态。它只是用于本地系统在时间同步网络中的标识。实际的时间同步是通过与远程时间服务器进行通信和调整实现的。

在设置 `local stratum` 时，需要谨慎考虑，并确保它符合你的网络环境和时间同步需求。一般情况下，除非你是一个时间服务器提供者，否则将本地系统的时间层级设置为较低的值可能不是必需的。





## 生产环境

### 客户端配置

- `10.26.23.55` 为私有时间同步服务器

```
# cat /etc/chrony/chrony.conf
server 10.26.23.55 minpoll 0 maxpoll 5 maxdelay .05
keyfile /etc/chrony/chrony.keys
driftfile /var/lib/chrony/chrony.drift
logdir /var/log/chrony
maxupdateskew 100.0
rtcsync
makestep 1 3
```





# ntp

- 来自于ntpdata包，centos8默认没有安装且yum源里也没有，centos7有



## ntp 手动同步时间

```bash
#时间改为一年前
[root@centos ~]# date -s '-1 year'
Sat Dec 19 16:14:59 CST 2020
[root@centos ~]# date
Sat Dec 19 16:15:02 CST 2020

#手动同步（需要安装 ntpdata 才能使用）
ntpdata s1a.time.edu.cn
```





# systemd-timesyncd

Ubuntu 22.04 默认使用 **`systemd-timesyncd`** 作为时间同步服务。这是 Ubuntu 自带的轻量级时间同步解决方案，依靠 NTP（Network Time Protocol）来同步系统时间。它作为 `systemd` 服务的一部分，运行效率较高且适合大多数常规场景。

可以通过 `timedatectl` 命令来查看和管理时间同步设置。如果需要更复杂的时间同步需求，也可以选择安装 `chrony`。

## 查看和管理 `systemd-timesyncd`
1. **查看时间同步状态**：
   ```bash
   timedatectl status
   ```
   这条命令会显示系统时间、时区、是否使用 NTP 以及是否同步成功等信息。

2. **确保 NTP 时间同步已开启**：
   如果你想确保时间同步服务是启用的，可以运行以下命令：
   
   ```bash
   timedatectl set-ntp true
   ```
   
3. **查看 `systemd-timesyncd` 服务状态**：
   ```bash
   systemctl status systemd-timesyncd
   ```

## 配置 `systemd-timesyncd`
- 编辑 `/etc/systemd/timesyncd.conf` 文件

```ini
[Time]
# 主 NTP 服务器列表。系统会优先使用这些服务器进行时间同步。可以指定一个或多个 NTP 服务器，系统会按照顺序尝试连接并同步时间。
NTP=time1.google.com time2.google.com
# 备用 NTP 服务器。当所有在 NTP= 选项中指定的主 NTP 服务器不可用时，系统会尝试使用 FallbackNTP 进行时间同步。
FallbackNTP=ntp.ubuntu.com
```

修改完成后，保存文件并重新启动 `systemd-timesyncd` 服务：
```bash
systemctl restart systemd-timesyncd
```

## 
