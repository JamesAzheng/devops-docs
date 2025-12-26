---
title: iptables
---

# iptables 理论

## iptables 概述

- **Linux防火墙是由Netfilter组件提供的，Netfilter工作在内核空间，集成在linux内核中**

- **iptables，firewalld等都是属于调用Netfilter组件的工具**

- Netfilter官网文档：https://netfilter.org/documentation/

- Netfilter内核中参数：

  - ```bash
    [root@iptables ~]# grep -i Netfilter /boot/config-4.18.0-240.el8.x86_64 
    CONFIG_NETFILTER=y
    CONFIG_NETFILTER_ADVANCED=y
    CONFIG_BRIDGE_NETFILTER=m
    # Core Netfilter Configuration
    CONFIG_NETFILTER_INGRESS=y
    ...
    ```






## iptables 的组成

- iptables由 五个表table 和五个链chain 以及一些规则组成
- **表就是为了实现特定类别功能的基础模板，最初模板中只有支持的链 并没有规则**
- **链就定义规则所指定的位置**



### 表

#### filter

- **默认表**,可以省略不写，根据预定义的规则过滤符合条件的数据包
- **支持的链(钩子函数)：**(支持的链可以用Tab键补全)
  - INPUT、OUTPUT、FORWARD

#### nat

- network address translation 地址转换规则表
- **支持的链：**
  - PREROUTING、OUTPUT、INPUT、POSTROUTING

#### mangle

- 修改数据标记位规则表（拆解报文，做出修改，并重新封装 的功能）
- **支持的链：**
  - 
  - PREROUTING、FORWARD、OUTPUT、INPUT、POSTROUTING

#### raw

- 不支持tab键补全 但此表存在，关闭nat表上启用的连接追踪机制，加快封包穿越防火墙速度
- **支持的链：**
  - PREROUTING、OUTPUT

#### security

- 不支持tab键补全 但此表存在，用于强制访问控制（MAC）网络规则，由Linux安全模块（如SELinux）实现
- **支持的链：**



#### 五个表的优先级

优先级由高到低的顺序为：

security -->raw-->mangle-->nat-->filter



### 链

- 又称五个勾子函数
- 蓝色表示的就是五个链



#### 五个内置链

- **PREROUTING**：路由前，总入口控制，检测数据报文是否是接下来需要处理的，如果是那就接着往下走，如果不是就将此报文抛弃掉

- **INPUT**：输入，检查是否符合INPUT中定义的策略，符合则访问APP1，不符合则拒绝访问
- **OUTPUT**：输出，本机应用程序需要往外转发的数据将通过此出口转发出去（下面还有一个ROUTE路由表，最后到POSTROUTING）
- **FORWARD**：转发，穿过的数据报文（充当防火墙）
- **POSTROUTING**：路由后，总出口控制

#### 自定义链

用于对内置链进行扩展或补充，可实现更灵活的规则组织管理机制；只有Hook钩子调用自定义链时，才生效



## 三种报文流向

### 流入本机

PREROUTING > INPUT > 用户空间进程

### 流出本机

用户空间进程 > OUTPU > POSTROUTING

### 转发

PREROUTING > FORWARD > POSTROUTING





##  iptables 规则的组成

根据规则的匹配条件尝试匹配报文，对匹配成功的报文根据规则定义的处理动作作出处理，规则在链接上的次序即为其检查时的生效次序

### 匹配条件：

默认为与条件（同时满足）

### 基本匹配：

IP，端口，TCP的Flags（SYN,ACK等）

### 扩展匹配：

通过复杂高级功能匹配

### 处理动作：

称为target，跳转目标

- 内建处理动作：ACCEPT、DROP(抛弃)、REJECT(拒绝)、SNAT、DNAT、MASQUERADE、MARK、LOG...

- 自定义处理动作：自定义chain，利用分类管理复杂情形

- target 包括以下类型：

- ```ABAP
  自定义链, ACCEPT， DROP， REJECT，RETURN,LOG，SNAT，DNAT，REDIRECT，MASQUERADE
  ```

  

## 内核中数据包的传输过程

- **当一个数据包进入网卡时：**
  - 数据包首先进入PREROUTING链，内核根据数据包目的IP判断是否需要转送出去
- **如果数据包是进入本机的：**
  - 数据包就会沿着图向下移动，到达INPUT链。数据包到达INPUT链后，任何进程都会收到它。本机上运行的程序可以发送数据包，这些数据包经过OUTPUT链，然后到达POSTROUTING链输出
- **如果数据包是要转发出去的：**
  - 且内核允许转发，数据包就会向右移动，经过FORWARD链，然后到达POSTROUTING链输出







# iptables 命令使用说明

- **详参：**man 8 iptables

## 格式说明

```sh
iptables [-t table] SUBCOMMAND chain [-m matchname [per-match-options]] -j targetname [per-target-options]
```

## 选项说明

### 指定表

- [-t table]

```sh
-t #指定表，不指定则默认为filter表（可以使用-t加tab键查看支持的表）
```

#### 范例：查看表支持哪些链

```sh
#iptables查看表支持哪些链可以使用tab键补全来查看

#查看支持哪些表
[root@centos ~]# iptables -t 
filter  mangle  nat     

#查看表中支持哪些链
[root@centos ~]# iptables -t nat  -A 
INPUT        OUTPUT       POSTROUTING  PREROUTING 
```





### SUBCOMMAND

- **规则管理**

```sh
-A #追加规则
-I #插入规则，要指明插入至的规则编号，默认为插入到第一条规则
-D #删除规则（需要指明 规则序号 或 规则本身） 
-R [INPUT...] number #replace，替换指定链上编号的规则
-F #清除规则，清空指定表的所有规则链（不指定表表示清除filter表的所有规则）
-Z #zero，将计数器清零（iptables的每条规则都有两个计数器，1：匹配到的报文的个数   2：匹配到的所有报文的大小之和）

-P #Policy，设置默认策略；对filter表中的链而言，其默认策略有：ACCEPT：接受, DROP：丢弃（生产者不建议修改此默认规则，因为假如将默认规则设为DROP 那么清除所有规则后将任何人都无法访问此主机）（建议使用iptables -A INPUT -j DROP 这样的规则追加到最后一行来实现拒绝无关主机的访问）
```

#### 范例：删除规则

```bash
#清除filter表中的所有链的规则
iptables [-t filter] -F

#清除filter表中某个链的规则
iptables [-t filter] -F < FORWARD | INPUT | OUTPUT >

#清除nat表中所有链的规则
iptables -t nat -F

#清除nat表中某个链的规则
iptables -t nat -F < INPUT | OUTPUT | POSTROUTING | PREROUTING >

#删除指定行号的规则，需要事先iptables -vnL --line-number来确定行号
iptables -D < INPUT | OUTPUT | POSTROUTING | PREROUTING > n
```

#### 范例：计数器清零

iptables的每条规则都有两个计数器，(pkts) 匹配到的报文的个数，(bytes) 匹配到的所有报文的大小之和

```bash
#清零前
[root@10.0.0.8 ~]# iptables -vnL
Chain INPUT (policy DROP 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
  557 42192 ACCEPT     all  --  *      *       10.0.0.1             0.0.0.0/0     

#清零
[root@10.0.0.8 ~]# iptables -Z

#清零后
[root@10.0.0.8 ~]# iptables -vnL
Chain INPUT (policy DROP 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    6   428 ACCEPT     all  --  *      *       10.0.0.1             0.0.0.0/0           
    0     0 ACCEPT     all  --  *      *       10.0.0.2             0.0.0.0/0    
```

#### 范例：添加规则并置顶

```bash
#-I表示插入，不指定[n]则默认插入到第一行
iptables -I INPUT [n] -s 10.0.0.1 -j ACCEPT
```

#### 范例：替换规则

```bash
#首先需要iptables -vnL --line--number查看要替换规则的行号
#将INPUT链中的第二条规则替换
iptables -R INPUT 2 规则...
```





### chain

- **链管理**

#### 内置链

- iptables内置的链（PREROUTING、INPUT、OUTPUT、FORWARD、POSTROUTING）
- SUBCOMMAND后可以直接调用这些内置链

##### 内置链基础使用

```bash
#支持一条命令添加多个IP，用","隔开即可：10.0.0.6,10.0.0.7

iptables  -A INPUT -s 10.0.0.6 -j DROP #拒绝10.0.0.6的访问，直接扔掉，没有回应

iptables  -A INPUT -s 10.0.0.7 -j REJECT #拒绝10.0.0.7的访问，并直接回应拒绝请求

iptables  -A OUTPUT -s 10.0.0.7 -j REJECT #拒绝10.0.0.7的访问，访问10.0.0.7时提示错误


iptables -D [INPUT|OUTPUT|FORWARD] <1|2|...> [-t table] #清除某个序号的规则
iptables -F [INPUT|OUTPUT|FORWARD] [-t table] #清除某个链的规则，不写中括号中的内容则默认filter中的内容全部清理

iptables -IINPUT -i lo -j ACCEPT #允许本机的回环网卡可用，（可以在本机测试时用）
```





#### 自定义链

- 本质上还是调用了自带的五个链做组合
- 自定义链定义完成后，不会直接生效，**需要在指定表中的内置链调用才可生效**
- 规则复杂时建议使用，能实现更清晰的条理

##### 自定义链基础使用

```bash
#创建一个自定义链（不指定表则默认在filter表中创建）
iptables -N web_chain

#修改自定义链的名称；引用计数不为0的自定义链不能够被重命名，也不能被删除
iptables -E web_chain WEB_CHAIN

#删除自定义链，删除前需解除和其它链的调用关系，并清空自定义链中的规则
iptables -X WEB_CHAIN

#在nat表中创建一个自定义链
iptables -N web_chain -t nat

#在nat表中删除这个自定义链
iptables -X web_chain -t nat
```

##### 范例：创建自定义链实现WEB的访问控制

```sh
#准备基础规则
[root@iptables ~]# iptables -A INPUT -s 10.0.0.1 -j ACCEPT 
[root@iptables ~]# iptables -A INPUT -j REJECT 

#准备测试页面
[root@iptables ~]# echo 'iptables website page' > /usr/share/nginx/html/index.html 

#客户端访问测试
[root@client1 ~]# curl 10.0.0.18
curl: (7) Failed to connect to 10.0.0.18 port 80: Connection refused
[root@client1 ~]# telnet 10.0.0.18 80
Trying 10.0.0.18...
telnet: connect to address 10.0.0.18: Connection refused


#创建一个自定义链
[root@iptables ~]# iptables -N WEB_CHAIN

#调用multiport模块实现非连续多端口指定
#访问本机的 80,443,8080 端口允许
[root@iptables ~]# iptables -A WEB_CHAIN -p tcp -m multiport --dports 80,443,8080 -j ACCEPT 

#在INPUT链中调用自定义链（主机要插入到最后规则的前一条）
[root@iptables ~]# iptables -I INPUT 2 -j WEB_CHAIN 

#访问测试
[root@client1 ~]# curl 10.0.0.18
iptables website page
[root@client1 ~]# telnet 10.0.0.18 80
Trying 10.0.0.18...
Connected to 10.0.0.18.
Escape character is '^]'.
[root@client1 ~]# ping 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
From 10.0.0.18 icmp_seq=1 Destination Port Unreachable

#继续允许icmp协议访问
[root@iptables ~]# iptables -A WEB_CHAIN -p icmp -j ACCEPT 
[root@client1 ~]# ping 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
64 bytes from 10.0.0.18: icmp_seq=1 ttl=64 time=5.10 ms
```

##### 范例: 删除自定义链

```sh
#无法直接删除自定义链，因为定义链中有内容
[root@centos8 ~]#iptables -X WEB_CHAIN
iptables v1.8.2 (nf_tables): CHAIN_USER_DEL failed (Device or resource busy): 
chain WEB_CHAIN

#清空自定义链
[root@centos8 ~]#iptables -F WEB_CHAIN

#还是无法直接删除自定义链，因为被INPUT链所调用
[root@centos8 ~]#iptables -X WEB_CHAIN
iptables v1.8.2 (nf_tables): CHAIN_USER_DEL failed (Device or resource busy): 
chain WEB_CHAIN

#删除依赖的规则
[root@centos8 ~]#iptables -D INPUT 1

#删除成功
[root@centos8 ~]#iptables -X WEB_CHAIN
```

##### 范例：让自定义链中的规则生效

- 自定义链只有被内置链调用才可以生效

```bash
iptables -IINPUT -s 10.0.0.0/24 -j WEB_CHAIN

#后续添加规则只需在自定义链中添加就可以生效
```

```bash
[root@centos8 ~]#iptables -R WEB_CHAIN 1 -s 10.0.0.6 -p tcp -m multiport --dports 80,443,8080 -j REJECT

[root@centos8 ~]#iptables -vnL WEB_CHAIN
Chain WEB_CHAIN (1 references)
 pkts bytes target     prot opt in     out     source               destination 
        
    1    60 REJECT     tcp  -- *     *       10.0.0.6             0.0.0.0/0   
        multiport dports 80,443,8080 reject-with icmp-port-unreachable
[root@centos8 ~]#iptables -AINPUT -j WEB_CHAIN 
[root@centos8 ~]#iptables -X WEB_CHAIN
iptables v1.8.2 (nf_tables): CHAIN_USER_DEL failed (Device or resource busy): 
chain WEB_CHAIN
[root@centos8 ~]#iptables -F WEB_CHAIN
[root@centos8 ~]#iptables -X WEB_CHAIN
iptables v1.8.2 (nf_tables): CHAIN_USER_DEL failed (Device or resource busy): 
chain WEB_CHAIN
[root@centos8 ~]#iptables -D INPUT 1




iptables -X WEB_CHAIN #删除自定义链，删除前需解除和其它链的调用关系，并清空自定义链中的规则
```





### 匹配条件

- 未定义匹配条件 则表示 所有源主机和端口 所有目标主机和端口
- **!表示取反**

#### 基础匹配选项

- 基本匹配条件：无需加载模块，由iptables/netfilter自行提供
- **源IP地址 表示 从哪个主机来的IP**
- **目标IP地址 表示 要到本机的哪个IP**

```bash
#指定源IP地址或者不连续的IP地址
[!] -s, --source address[/mask][,...]

#指定目标IP地址或者不连续的IP地址
[!] -d, --destination address[/mask][,...]

#指定协议，可使用数字如0（all）
#protocol: tcp, udp, icmp, icmpv6, udplite,esp, ah, sctp, mh 或者 "all",参看：/etc/protocols
#默认不加-p则不指定协议 即匹配所有协议
#iptables 在使用-p选项指明了特定的协议时，无需再用-m选项指明扩展模块的扩展机制，不需要手动加载扩展模块
[!] -p, --protocol protocol：

#报文流入的接口；只能应用于数据报文流入环节，只应用于INPUT、FORWARD、PREROUTING链
#name可以定义为回环网卡lo即本机127.0.0.1；报文流入的接口
[!] -i, --in-interface name

#报文流出的接口；只能应用于数据报文流出的环节，只应用于FORWARD、OUTPUT、POSTROUTING链
[!] -o, --out-interface name
```

##### 范例：

- 查看下面的范例



#### 扩展匹配选项

- 通过复杂高级功能匹配，**分为隐式扩展和显式扩展**
- 需要加载扩展模块（/usr/lib64/xtables/*.so），方可生效
- 详参：man iptables-extensions

```bash
#指定扩展模块
-m modular
```

##### 范例：

- 查看下面的范例





### 处理动作

- targetname

```sh
-j #指定处理动作（ACCEPT,REJECT,DROP...）
```

#### 处理动作说明

- -j 后面指定的动作选项

| 指令       | 功能                                                         |
| ---------- | ------------------------------------------------------------ |
| ACCEPT     | 接受包                                                       |
| DROP       | 丢弃包（ping的时候不会显示回应信息 一直卡住）                |
| REJECT     | 拒绝(驳回)包（ping的时候会提示目标主机不可达 Target host unreachable） |
| QUEUE      | 队列，发送包到用户空间程序                                   |
| CONTINUE   | 继续处理包                                                   |
| RETURN     | 返回，**发送到调用的规则链进行处理**，（RETURN一旦匹配，会返回到原有的内置链中，然后在原有的内置链依次执行） |
| JUMP       | 跳跃，**发送到指定的规则链进行处理**，当完成时或执行了返回的声明，返回到调用的规则链 |
| GOTO       | 转到，发送到指定的规则链进行处理，不返回到调用的规则链       |
| LIMIT      | limit，达到接收包的匹配限制，则根据规则处理包                |
| LOG        | 记录日志，dmesg                                              |
| MARK       | 做防火墙标记                                                 |
| DNAT       | 目标地址转换（外网访问内网）                                 |
| SNAT       | 源地址转换（内网访问外网）                                   |
| MASQUERADE | 地址伪装                                                     |
| REDIRECT   | 端口重定向                                                   |
| 自定义链   | 类似定义函数                                                 |
|            |                                                              |



#### DROP和REJECT的区别

`DROP` 和 `REJECT` 是两种不同的 iptables 操作，它们的作用是拒绝网络数据包的传递。不过它们有一些细微的差别：

1. 返回值：`DROP` 操作会丢弃数据包，并不会发送任何确认信息，而 `REJECT` 操作则会在丢弃数据包的同时返回一个拒绝的 ICMP 包。
2. 可见性：`DROP` 操作在网络上是不可见的，客户端发送数据包后并不会知道它是否被拒绝。而 `REJECT` 操作则是可见的，客户端会收到拒绝的信息。
3. 效率：因为 `REJECT` 操作会发送一个拒绝的 ICMP 包，所以它的速度比 `DROP` 操作慢一些。

在实际使用中，`DROP` 操作常用于安全性要求较高的环境，因为它不会发送任何信息，并且比较隐蔽；而 `REJECT` 操作常用于调试或需要明确告诉客户端拒绝信息的场景。



#### DNAT和REDIRECT的区别

`DNAT` 和 `REDIRECT` 都是在 `iptables` 中用于地址转换的规则，但是它们的实际效果有所不同。

`DNAT` 是 Destination Network Address Translation 的缩写，它可以将一个 IP 地址转换为另一个 IP 地址，从而使得网络中的一个计算机可以用一个不同的 IP 地址向外部发送请求。

`REDIRECT` 则是将接收到的数据包重定向到本地的一个端口上，从而允许在本地实现端口转发。

总而言之，`DNAT` 用于实现地址转换，而 `REDIRECT` 用于实现端口转发。两者适用于不同的场景，根据具体需求选择使用哪种规则是很重要的。



#### MASQUERADE和SNAT的区别

MASQUERADE和SNAT是两种在iptables中实现地址转换（Address Translation）的方法。

MASQUERADE是一种**自动分配**源地址的方法，它将来自内网的数据包的源地址替换为当前的外网IP地址。因此，当您的外网IP地址发生变化时，您不需要手动更改iptables规则。

SNAT（Source NAT）是一种**静态分配**源地址的方法，它将来自内网的数据包的源地址替换为您指定的固定的地址。如果您的外网IP地址发生变化，您需要手动更改iptables规则以匹配新的外网IP地址。

总的来说，如果您的外网IP地址固定，则可以使用SNAT；如果外网IP地址不固定，则推荐使用MASQUERADE。



#### 范例：RETURN的用法

- RETURN一旦匹配，会返回到原有的内置链中，然后在原有的内置链依次执行  

##### 添加一条RETURN规则

```bash
[root@iptables ~]# iptables -I WEB_CHAIN 2 -s 10.0.0.28 -j RETURN
```

##### 添加后的规则展示

```sh
[root@iptables ~]# iptables -vnL
#Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
 4683  366K ACCEPT     all  --  *      *       10.0.0.1             0.0.0.0/0           
  297 35646 WEB_CHAIN  all  --  *      *       0.0.0.0/0            0.0.0.0/0           
  188 38140 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable

....        

#Chain WEB_CHAIN (1 references)
 pkts bytes target     prot opt in     out     source               destination         
   15   890 ACCEPT     tcp  --  *      *       0.0.0.0/0            0.0.0.0/0            multiport dports 80,443,8080
   58  4872 RETURN     all  --  *      *       10.0.0.28            0.0.0.0/0           
  164 13776 ACCEPT     icmp --  *      *       0.0.0.0/0            0.0.0.0/0           
```

##### 测试访问

- **client1无法ping通是因为**：在 WEB_CHAIN 自定义链中匹配到了第二条RETURN规则，所以就被调回到了 INPUT 链中 而 INPUT链中 WEB_CHAIN下正好是拒绝所有，所以无法ping通
- **client2无法ping通是因为**：自定义链中允许了icmp协议的访问

```sh
[root@client1 ~]# ping 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
From 10.0.0.18 icmp_seq=1 Destination Port Unreachable

[root@client2 ~]# ping 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
64 bytes from 10.0.0.18: icmp_seq=1 ttl=64 time=3.15 ms
```





#### 范例：LOG使用方法

##### 语法：

```bash
LOG #非中断target,本身不拒绝和允许,放在拒绝和允许规则前，并将日志记录在/var/log/messages系统日志中
--log-level level   #级别： debug，info，notice, warning, error, crit, alert,emerg
--log-prefix prefix #日志前缀，用于区别不同的日志，最多29个字符
```

##### 范例：

```bash
#新的连接记录日志
[root@centos8 ~]#iptables -I INPUT -s 10.0.0.0/24 -p tcp -m multiport --dports 80,21,22,23 -m state --state NEW -j LOG --log-prefix "new connections: " 

[root@centos8 ~]#tail -f /var/log/messages 
Mar 19 18:41:07 centos8 kernel: iptables tcp connection: IN=eth0 OUT=
MAC=00:0c:29:f8:5d:b7:00:50:56:c0:00:08:08:00 SRC=10.0.0.1 DST=10.0.0.8 LEN=40
TOS=0x00 PREC=0x00 TTL=128 ID=43974 DF PROTO=TCP SPT=9844 DPT=22 WINDOW=4102
RES=0x00 ACK URGP=0
Mar 19 18:41:07 centos8 kernel: new connections: IN=eth0 OUT=
MAC=00:0c:29:f8:5d:b7:00:50:56:c0:00:08:08:00 SRC=10.0.0.1 DST=10.0.0.8 LEN=40
TOS=0x00 PREC=0x00 TTL=128 ID=43975 DF PROTO=TCP SPT=9844 DPT=22 WINDOW=4102
RES=0x00 ACK URGP=0
Mar 19 18:41:08 centos8 kernel: new connections: IN=eth0 OUT=
```



### 查看链和规则

```sh
-L #list, 列出指定链上的所有规则，本选项须置后
-n #numberic，以数字格式显示地址和端口号
-v #verbose，详细信息
-vv #更详细
-x #exactly，显示计数器结果的精确值,而非单位转换后的易读值
--line-numbers #显示规则的序号
-S #selected,以iptables-save 命令格式显示链上规则

#常用组合
-vnL 
-vvnxL --line-numbers
```

#### 范例：查看表中链的规则详细信息

```bash
#显示filter表中所有链的信息 
iptables -vnL

#显示filter表中INPUT链的信息 
iptables -vnL INPUT --line-number

#显示filter表中链的信息

#显示nat表中链的信息
iptables -vnL -t nat
   
#显示mangle表中链的信息
iptables -vnL -t mangle 

#显示信息时显示规则行号
iptables -vnL --line-number
```

#### 范例：查看定义的所有规则

```bash
#查看所有定义规则的详细信息
iptables-save

#查看定义规则的简略信息，即只显示定义规则的指令（默认只显示filter表）
iptables -S

#查看nat表定义规则的简略信息
iptables -S -t nat
```

#### iptables -vnL 输出信息详解

```bash
#Chain INPUT (policy ACCEPT 0 packets, 0 bytes)

Chain INPUT #链的名称，除此之外还有PREROUTING,OUTPUT,FORWARD,POSTROUTING

(policy ACCEPT #默认的规则,默认规则默认为ACCEPT

0 packets #对应链匹配到的报文的个数

0 bytes) #对应链匹配到的报文包的大小总和

----------------------------------------------------------------------------------

#pkts bytes target     prot opt in     out     source               destination     

pkts #对应规则匹配到的报文的个数

bytes #对应规则匹配到的报文包的大小总和

target #也就是匹配成功后的具体的处理动作，ACCEPT,REJECT,自定义链等... 这里使用target这个词其实不太严谨，但也可以理解为这条规则要达成的目标、目的...

prot #具体针对的协议，如：tcp、udp、icmp等，没有指定协议则表示all 即所有协议

opt #规则对应的选项

in #表示数据包由哪个接口(网卡)流入，我们可以设置通过哪块网卡流入的报文需要匹配当前规则。

out #表示数据包由哪个接口(网卡)流出，我们可以设置通过哪块网卡流出的报文需要匹配当前规则。

source #表示规则对应的源头地址，可以是一个IP，也可以是一个网段。

destination #表示规则对应的目标地址。可以是一个IP，也可以是一个网段。
```







# iptables 定义规则前注意事项

## 防止防火墙程序间冲突

**iptables使用时要关闭firewalld和nftables，否则防火墙程序间会冲突**

```bash
systemctl disable --now nftables
systemctl disable --now firewalld
```



## 定义规则的注意事项

- **配置前注意不要将本主机的IP or 网段加入到拒绝规则中，否则会导致本机无法进行远程连接（可以选择将连接远程客户端的IP设置允许规则 然后放在第一条，防止此情况的发生）**
- 前面的**规则一旦匹配成功则不在继续往下继续匹配**，直接使用匹配成功的规则
- **前后规则很重要**
- **有去有回才构成一个完整的数据包**



##  规则添加前的考量点

1. **要实现哪种功能？**
   - 将规则添加在哪张表上
2. **报文流经的路径？**
   - 判断添加在哪个链上
3. **报文的流向？**
   - 判断源和目的地
4. **设置怎样的匹配规则？**
   - 根据业务需要来设置



## iptables 规则定义/优化最佳实践

1. 安全放行所有入站和出站的状态为ESTABLISHED状态连接,建议放在第一条，效率更高

2. 谨慎放行入站的新请求

3. 有特殊目的限制访问功能，要在放行规则之前加以拒绝

4. **如果两个网段间有包含关系(比如在同一网段)，建议小范围的IP往前放，大范围的IP往后放**，防止大范围一旦匹配，后面设置的小范围IP无法生效

5. **如果两个网段间没有包含关系(比如不在同一网段)，建议网段中主机数多的放在前**，因为主机数多即代表匹配的概率就越大，从而减少查询的次数，从而提高效率

6. 应该将那些可由一条规则能够描述的多个规则合并为一条,减少规则数量,提高检查效率

7. **同类规则**（访问同一应用，比如：http ），**匹配范围小的放在前面**，用于特殊处理

8. **不同类的规则**（访问不同应用，一个是http，另一个是mysql ），**匹配范围大的放在前面**，效率更高

   - ```sh
     -s 10.0.0.6 -p tcp --dport 3306 -j REJECT
     -s 172.16.0.0/16 -p tcp --dport 80 -j REJECT
     ```

9. 应该将那些可由一条规则能够描述的多个规则合并为一条,减少规则数量,提高检查效率

10. 设置默认策略，建议白名单（只放行特定连接）

    - iptables -P，不建议，容易出现“自杀现象”
    - 规则的最后定义规则做为默认策略，推荐使用，放在最后一条



# 范例主机

```bash
10.0.0.18 #iptables
10.0.0.28 #client1
10.0.0.38 #client2
```





# 范例：基础匹配定义

### 前言

- 基础匹配定义 无需加载模块，由iptables/netfilter自行提供
- ！表示取反

### -

### 基础匹配选项

- **源IP地址 表示 从哪个主机来的IP**
- **目标IP地址 表示 要到本机的哪个IP**

```bash
#指定源IP地址或者不连续的IP地址
[!] -s, --source address[/mask][,...]

#指定目标IP地址或者不连续的IP地址
[!] -d, --destination address[/mask][,...]

#指定协议，可使用数字如0（all）
#protocol: tcp, udp, icmp, icmpv6, udplite,esp, ah, sctp, mh 或者 "all",参看：/etc/protocols
#默认不加-p则不指定协议 即匹配所有协议
#iptables 在使用-p选项指明了特定的协议时，无需再用-m选项指明扩展模块的扩展机制，不需要手动加载扩展模块
[!] -p, --protocol protocol：

#报文流入的接口；只能应用于数据报文流入环节，只应用于INPUT、FORWARD、PREROUTING链
#name可以定义为回环网卡lo即本机127.0.0.1；报文流入的接口
[!] -i, --in-interface name

#报文流出的接口；只能应用于数据报文流出的环节，只应用于FORWARD、OUTPUT、POSTROUTING链
[!] -o, --out-interface name
```



### -

### 除了icmp的请求外全部允许

```bash
#清除所有规则做测试
[root@iptables ~]# iptables -F

#定义规则前测试
[root@client1 ~]# ping -c1 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
64 bytes from 10.0.0.18: icmp_seq=1 ttl=64 time=0.464 ms
[root@client1 ~]# ssh 10.0.0.18
root@10.0.0.18's password:

#定义规则
[root@iptables ~]#iptables -A INPUT -s 10.0.0.28 ! -p icmp -j ACCEPT

#定义规则后测试（仍然能够ping通，因为定义的规则虽然表示除了icmp协议外的协议允许访问，但是下面并没有拒绝的规则，所以还是可以ping通）
#变相的说明了上面的规则不会对处理动作也取反（不要理解错了），所以必须得有一条兜底的拒绝规则
[root@client1 ~]# ping  10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
64 bytes from 10.0.0.18: icmp_seq=1 ttl=64 time=0.857 ms

#再次定义规则（创建兜底的拒绝规则）
[root@iptables ~]# iptables -I INPUT -s 10.0.0.1 -j ACCEPT 
[root@iptables ~]# iptables -A INPUT -j REJECT 
[root@iptables ~]# iptables -vnL
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
  128 10524 ACCEPT     all  --  *      *       10.0.0.1             0.0.0.0/0           
   32  3669 ACCEPT    !icmp --  *      *       10.0.0.28            0.0.0.0/0           
    3   252 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable #这里也有明显提示：无法访问icmp端口？？？
    
#再次测试，实现此功能
[root@client1 ~]# ping -c1 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
From 10.0.0.18 icmp_seq=1 Destination Port Unreachable

--- 10.0.0.18 ping statistics ---
1 packets transmitted, 0 received, +1 errors, 100% packet loss, time 0ms

[root@client1 ~]# ssh 10.0.0.18
root@10.0.0.18's password: 
```



### -

### 拒绝多个IP

```sh
#定义
[root@iptables ~]# iptables -A INPUT -s 10.0.0.6,10.0.0.10 -j REJECT

#测试
[root@iptables ~]# iptables -vnL
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination
...
    0     0 REJECT     all  --  *      *       10.0.0.6             0.0.0.0/0            reject-with icmp-port-unreachable
    0     0 REJECT     all  --  *      *       10.0.0.10            0.0.0.0/0            reject-with icmp-port-unreachable
...
```



### -

### 定义报文流入接口 为回环网卡lo即本机127.0.0.1

```sh
#最初的规则
[root@iptables ~]# iptables -vnL --line-number
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1      977 70788 ACCEPT     all  --  *      *       10.0.0.1             0.0.0.0/0           
2      139 14586 REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0 

#定义规则前测试（请求包可以发出去 但是回应包进不来 所以卡死）
[root@iptables ~]# ping -c1 127.0.0.1
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
[root@iptables ~]# ping -c1 10.0.0.8
PING 10.0.0.8 (10.0.0.8) 56(84) bytes of data.

#定义规则
[root@iptables ~]#iptables -I INPUT -i lo -j ACCEPT


#定义规则后测试
[root@iptables ~]# ping 127.0.0.1
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.852 ms
[root@iptables ~]# ping  10.0.0.8
PING 10.0.0.8 (10.0.0.8) 56(84) bytes of data.
From 10.0.0.18 icmp_seq=1 Destination Host Unreachable
```



### -

### 没有明确允许的主机全部拒绝

- 指定主机为10.0.0.1，即Windows主机
- 除windows外其他主机都不能访问
- **这种规则定义完后 iptables主机访问其他主机也不行，因为虽然iptables发送的包能出去，目标主机也能接受到，但是目标主机回应的数据包会受到规则限制而无法正常回应给iptables主机，有去有回才构成一个完整的数据包**

```bash
#获取Windows的连接IP
[root@iptables ~]# ss -nt|grep ESTAB|awk -F: '{print $2}'|awk '{print $2}'
10.0.0.1

#添加一条允许10.0.0.1的规则
#必须先于下面的规则创建，否则还没匹配到此规则就被拒绝了
[root@iptables ~]# iptables -A INPUT -s 10.0.0.1 -j ACCEPT 

#拒绝所有主机访问
[root@iptables ~]# iptables -A INPUT -j REJECT

#其他主机测试访问
#有回应，但是提示目标网络不可达（因为明确拒绝而不是抛弃，所以客户端收到拒绝信息后直接提示目标网络不可达）
[root@client1 ~]# ping 10.0.0.18
From 10.0.0.18 icmp_seq=242 Destination Port Unreachable
[root@client2 ~]# ping 10.0.0.18
From 10.0.0.18 icmp_seq=242 Destination Port Unreachable

#iptables主机访问其他主机测试
[root@iptables ~]# ping 10.0.0.28
PING 10.0.0.28 (10.0.0.28) 56(84) bytes of data.
^C
--- 10.0.0.28 ping statistics ---
2 packets transmitted, 0 received, 100% packet loss, time 49ms

[root@iptables ~]# ping 10.0.0.38
PING 10.0.0.38 (10.0.0.38) 56(84) bytes of data.
^C
--- 10.0.0.38 ping statistics ---
3 packets transmitted, 0 received, 100% packet loss, time 40ms
```



### -

### 没有明确允许的主机全部拒绝(危险方式)

- **这种方式是直接将默认的规则修改**

- **这种规则定义非常危险！不建议使用！！！**
- **因为一旦使用 iptables -F 清除所有规则后，谁都无法连接或访问主机**

```bash
#设置前
[root@iptables ~]# iptables -vnL
Chain INPUT (policy ACCEPT 0 packets, 0 bytes) #policy ACCEPT
...

#设置没有明确允许的规则全部拒绝
[root@iptables ~]# iptables -P INPUT DROP
[root@iptables ~]# iptables -vnL
Chain INPUT (policy DROP 0 packets, 0 bytes) #policy DROP
...
```



### -

### 抛弃源主机的请求的请求

- 这里源主机以10.0.0.28举例

```bash
#在filter表中的INPUT链中添加一条规则，抛弃源地址10.0.0.28主机的所有数据报文
[root@iptables ~]# iptables -A INPUT -s 10.0.0.28 -j DROP

#测试
#无任何回应（因为没有直接拒绝 而是抛弃 所以无任何响应）
[root@10.0.0.28 ~]# ping 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.

#ping对方主机也无反应，因为10.0.0.18回应包也被这条规则抛弃了
[root@iptables ~]# ping 10.0.0.28
PING 10.0.0.28 (10.0.0.28) 56(84) bytes of data.
```



### -

### 拒绝某一个网段的访问，只允许该网段中的一个IP访问

- **注意规则定义的前后顺序，这里仅作参考**

```bash
#设置允许访问的IP
iptables -I INPUT  -s 10.0.0.1 -j ACCEPT 

#拒绝10.0.0.0/24网段的访问
iptables -A INPUT -s 10.0.0.0/24 -j REJECT
```





# 范例：扩展匹配定义

- 依赖扩展匹配模块：/usr/lib64/xtables/*.so
- 帮助 ：man iptables-extensionsv
- 分为 隐式扩展匹配 和 显式扩展匹配
- ！表示取反

## 隐式扩展匹配

- 隐式扩展表示 iptables 在使用-p选项指明了特定的协议后 不需要 -m 手动加载扩展模块

### tcp匹配选项

```bash
[!] --sport port[:port]
#匹配报文源端口,可为端口连续范围

[!] --dport port[:port]
#匹配报文目标端口,可为连续范围

[!] --tcp-flags mask comp
#mask 需检查的标志位列表，用,分隔 , 例如 SYN,ACK,FIN,RST
#comp 在mask列表中必须为1的标志位列表，无指定则必须为0 用","分隔tcp协议的扩展选项

[!] --syn
#用于匹配第一次握手, 相当于：--tcp-flags SYN,ACK,FIN,RST SYN
```

#### 范例：匹配第一次握手方法一

```sh
--tcp-flags SYN,ACK,FIN,RST SYN
#表示要检查的标志位为SYN,ACK,FIN,RST四个，其中SYN必须为1，余下的必须为0，SYN=1其余为0当然就是第一次握手了
```

#### 范例：匹配第一次握手方法二

- **常用**

```bash
--syn
#用于匹配第一次握手, 相当于：--tcp-flags SYN,ACK,FIN,RST SYN

#正在连接的用户不拒绝，首次连接的用户拒绝
iptables -A INPUT -p tcp --syn -j REJECT
```

#### 范例：匹配第二次握手

```bash
--tcp-flags SYN,ACK,FIN,RST SYN,ACK
```

#### 范例：匹配错误包

```bash
--tcp-flags ALL ALL  
或
--tcp_flags ALL NONE
```

#### 范例：匹配连续的21到25端口

```bash
--dport 21:25
```



### udp匹配选项

```bash
--sport port[:port] #匹配报文的源端口或端口范围
--dport port[:port] #匹配报文的目标端口或端口范围
```



### icmp匹配选项

```bash
--icmp-type <type[/code]|typename>
#type/code
 0/0 #icmp响应
 8/0 #icmp请求
#typename
echo-reply   #icmp响应
echo-request #icmp请求
```

#### 范例：iptables主机可以ping10.0.0.28，但是10.0.0.28不可以ping iptables的主机

```bash
#最初的规则
[root@iptables ~]# iptables -vnL INPUT --line-number
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1     1584  119K ACCEPT     all  --  *      *       10.0.0.1             0.0.0.0/0           
2     5143  554K REJECT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            reject-with icmp-port-unreachable

#添加规则前测试
[root@iptables ~]# ping 10.0.0.28
PING 10.0.0.28 (10.0.0.28) 56(84) bytes of data. #因为没有在OUTPUT链定义规则 所以数据包可以出去，而10.0.0.28的响应包收到INPUT链的拒绝
[root@client1 ~]# ping 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
From 10.0.0.18 icmp_seq=1 Destination Port Unreachable #因为INPUT链的拒绝规则所以提示目标网络不可达

#添加规则（允许 10.0.0.28 的响应包）
[root@iptables ~]# iptables -I INPUT 2 -s 10.0.0.28 -p icmp --icmp-type 0 -j ACCEPT

#添加规则后测试
[root@iptables ~]# ping 10.0.0.28
PING 10.0.0.28 (10.0.0.28) 56(84) bytes of data.
64 bytes from 10.0.0.28: icmp_seq=1 ttl=64 time=0.816 ms #因为允许接受了10.0.0.28响应包，所以可以ping通了
[root@client1 ~]# ping 10.0.0.18
PING 10.0.0.18 (10.0.0.18) 56(84) bytes of data.
From 10.0.0.18 icmp_seq=1 Destination Port Unreachable #INPUT链的拒绝规则仍在，所以无法ping通
```







## 显式扩展匹配

- 需要 -m 手动加载扩展模块


```bash
 -m 模块名 [选项]
```

### multiport

以离散方式定义多端口匹配,最多指定15个端口

```bash
#指定多个源端口
-m multiport --sports port[,port|,port:port]...
# 指定多个目标端口
-m multiport --dports port[,port|,port:port]...
#多个源或目标端
-m multiport --ports port[,port|,port:port]...
```

###  iprange

指明连续的ip地址范围

```bash
--src-range from[-to] #源IP地址范围
--dst-range from[-to] #目标IP地址范围

#范例
iptables -A INPUT -d 172.16.1.100 -p tcp --dport 80 -m iprange --src-range 172.16.1.5-172.16.1.10 -j DROP
```

### mac

mac 模块可以指明源MAC地址,，适用于：PREROUTING, FORWARD，INPUT 链

相当于将源IP和mac进行绑定，更加安全

```bash
 --mac-source XX:XX:XX:XX:XX:XX #源MAC地址
 #没有目标地址是因为只要是从PREROUTING发过来的数据报文就肯定是本机的（穿过的数据报文也是目标是本机mac才能穿过），否则就会被网卡抛弃掉
 
 #范例
 iptables -A INPUT -s 172.16.0.100 -m mac  --mac-source 00:50:56:12:34:56 -j ACCEPT
```

###  string

对报文中的应用层数据做字符串模式匹配检测

```bash
--algo {bm|kmp} #字符串匹配检测算法
 bm：Boyer-Moore
 kmp：Knuth-Pratt-Morris
--from offset #开始偏移
--to offset   #结束偏移
--string pattern #要检测的字符串模式
--hex-string pattern #要检测字符串模式，16进制格式

#范例，过滤含有google字符串的报文，--from 62是因为数据帧的帧结构中前8字节是前导信息，目标mac占6个字节，源mac占6个字节，type类型占2个字节，ip头占20个字节，tcp占20个字节，所以加起来是62，62字节以后的才是真正的数据data
iptables -A OUTPUT -p tcp --sport 80 -m string --algo bm --from 62  --string "google" -j REJECT
```

### time

根据将报文到达的时间与指定的时间范围进行匹配

**注意！此模块在centos8使用有问题**

```bash
--datestart YYYY[-MM[-DD[Thh[:mm[:ss]]]]] 日期
--datestop YYYY[-MM[-DD[Thh[:mm[:ss]]]]]
--timestart hh:mm[:ss]       时间
--timestop hh:mm[:ss]
[!] --monthdays day[,day...]   每个月的几号
[!] --weekdays day[,day...]   星期几，1 – 7 分别表示星期一到星期日
--kerneltz：内核时区（当地时间），不建议使用，CentOS 7 系统默认为 UTC
注意： centos6 不支持kerneltz ，--localtz指定本地时区(默认)

#范例
iptables -A INPUT -m time --timestart 12:30 --timestop 13:30 -j ACCEPT
```

### connlimit

根据每客户端IP做并发连接数数量匹配

可防止Dos(Denial of Service，拒绝服务)攻击

```bash
-m connlimit --connlimit-upto N #连接的数量小于等于N时匹配
-m connlimit --connlimit-above N #连接的数量大于N时匹配

#范例，并发连接本机80端口超过5个即拒绝访问
iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 5 -j REJECT
```

### limit

包限流

```bash
-m limit --limit-burst number #前多少个包不限制
-m limit --limit #[/second|/minute|/hour|/day]

#范例，icmp的请求包前5个不限制，5个以后，每分钟只放行十个包
iptables -I INPUT -p icmp --icmp-type 8 -m limit --limit 10/minute --limit-burst 5 -j ACCEPT
```

### state

无视协议

state 扩展模块，可以根据”连接追踪机制“去检查连接的状态，较耗资源

conntrack机制：追踪本机上的请求和响应之间的关系

#### 格式：

```bash
-m state --state 状态类型
```

#### 状态类型：

- NEW：新发出请求；连接追踪信息库中不存在此连接的相关信息条目，因此，将其识别为第一次发出的请求

- ESTABLISHED：NEW状态之后，连接追踪信息库中为其建立的条目失效之前期间内所进行的通信状态

- RELATED：新发起的但与已有连接相关联的连接，如：ftp协议中的数据连接与命令连接之间的关系

- INVALID：无效的连接，如flag标记不正确

- UNTRACKED：未进行追踪的连接，如：raw表中关闭追踪

#### 说明：

- 连接跟踪，需要加载模块： modprobe nf_conntrack_ipv4

- 当服务器连接多于最大连接数时dmesg 可以观察到 ：kernel: ip_conntrack: table full, dropping 

- packet错误,并且导致建立TCP连接很慢。

- 各种状态的超时后，链接会从表中删除

```bash
#已经追踪到的并记录下来的连接信息库
/proc/net/nf_conntrack

#调整连接追踪功能所能够容纳的最大连接数量
/proc/sys/net/netfilter/nf_conntrack_max
/proc/sys/net/nf_conntrack_max

#查看连接跟踪有多少条目
/proc/sys/net/netfilter/nf_conntrack_count

#不同的协议的连接追踪时长
/proc/sys/net/netfilter/
```

#### 连接过多的解决办法

(1) 加大nf_conntrack_max 值

```bash
vi /etc/sysctl.conf
net.nf_conntrack_max = 393216
net.netfilter.nf_conntrack_max = 393216
```

(2) 降低 nf_conntrack timeout时间

```bash
vi /etc/sysctl.conf
net.netfilter.nf_conntrack_tcp_timeout_established = 300
net.netfilter.nf_conntrack_tcp_timeout_time_wait = 120
net.netfilter.nf_conntrack_tcp_timeout_close_wait = 60
net.netfilter.nf_conntrack_tcp_timeout_fin_wait = 120
iptables -t nat -L -n
```









# 网络防火墙

- 上面的都是单机防火墙
- iptables/netfilter **利用filter表的FORWARD链,可以充当网络防火墙**



## 网络防火墙注意的问题

- 请求-响应报文均会经由FORWARD链，要**注意规则的方向性**

- 如果要启用conntrack机制，建议将双方向的状态为ESTABLISHED的报文直接放行



## 利用FORWARD链实现内外网络的流量控制

### 实验环境：

- Internet的网关不配也行，因为虚拟机不能彻底的隔离网络，所以不配网关依旧可以ping通

| 主机名   | IP地址/网卡/虚拟机网络模式                                   | 功能                 | 网关         |
| -------- | ------------------------------------------------------------ | -------------------- | ------------ |
| Internet | 192.168.0.8/24、eth0、仅主机                                 | 充当互联网中的客户端 | 192.168.0.18 |
| iptables | 10.0.0.18/24、eth0、NAT                       192.168.0.18/24、eth1、仅主机 | iptables端           | 无需配置     |
| web1     | 10.0.0.28/24、eth0、NAT                                      | nginx-web1           | 10.0.0.18    |
| web2     | 10.0.0.38/24、eth0、NAT                                      | nginx-web2           | 10.0.0.18    |

#### iptables开启ipforward

```bash
[root@iptables ~]# echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf 
[root@iptables ~]# sysctl -p
net.ipv4.ip_forward = 1
```



### 范例：实现内网可以访问外网的，但外网无法访问内网

#### 配置前测试

- 需要开启ipforward才可以互相访问

```bash
#配置前双方互相都可以访问
[root@internet ~]# curl 10.0.0.28
nginx web1
[root@internet ~]# curl 10.0.0.38
nginx web2
[root@web1 ~]# curl 192.168.0.8
internet
[root@web2 ~]# curl 192.168.0.8
internet
```

#### 添加规则实现方法一

- 这种方法有一定的局限性，因为只能使指定的端口或指定的协议实现访问
- 如果想实现多端口多协议的内网访问外网规则添加起来会比较繁琐

```bash
#首先让所有主机都无法穿过，这时客户端和服务器相互都不能访问
[root@iptables ~]# iptables -A FORWARD -j REJECT

#允许源为10.0.0.0/24的网段可以从tcp的80端口出去，省略目标，因为不知道互联网的主机有多少台，这时web1和web2的访问internet可以出去，但是无法回来，所以内网还是无法访问外网
[root@iptables ~]# iptables -I FORWARD -s 10.0.0.0/24 -p tcp --dport 80 -j ACCEPT

#internet端抓包测试，可以看到有回应包 但是回应包无法穿透防火墙 所以内网无法收到信息
[root@internet ~]#tcpdump -i eth0 -nn tcp port 80 -v
    10.0.0.28.35234 > 192.168.0.8.80: Flags [S], cksum 0x3def (correct), seq 2900974481, win 29200, options [mss 1460,sackOK,TS val 1214968412 ecr 0,nop,wscale 7], length 0
03:18:00.689949 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.0.8.80 > 10.0.0.28.35234: Flags [S.], cksum 0xcafa (incorrect -> 0x17a2), seq 289757902, ack 2900974482, win 28960, options [mss 1460,sackOK,TS val 7518886 ecr 1214968412,nop,wscale 7], length 0
03:18:01.725540 IP (tos 0x0, ttl 63, id 36067, offset 0, flags [DF], proto TCP (6), length 60)

#允许目标为10.0.0.0/24的网段可以从tcp的80端口进来，省略源，因为不知道互联网的主机有多少台，这时web1和web2都可以访问Internet了
[root@iptables ~]# iptables -I FORWARD -d 10.0.0.0/24 -p tcp --sport 80 -j ACCEPT

#最终效果
[root@internet ~]# curl 10.0.0.28
curl: (7) Failed to connect to 10.0.0.28 port 80: Connection refused
[root@internet ~]# curl 10.0.0.38
curl: (7) Failed to connect to 10.0.0.38 port 80: Connection refused
[root@web1 ~]# curl 192.168.0.8
internet
[root@web2 ~]# curl 192.168.0.8
internet
```



#### 添加规则实现方法二（最佳解决方案）

- 这种方法只要源地址是新出去的报文都可以返回，而外部主机依旧无法访问内部主机

```bash
#首先让所有主机都无法穿过，这时客户端和服务器相互都不能访问
[root@iptables ~]# iptables -A FORWARD -j REJECT

#将出去的报文统统放行
[root@iptables ~]# iptables -IFORWARD -s 10.0.0.0/24 -m state --state NEW -j ACCEPT 

#将回来的报文统统放行
#调用state扩展模块，ESTABLISHED：NEW状态之后，连接追踪信息库中为其建立的条目失效之前期间内所进行的通信状态
[root@iptables ~]# iptables -I FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

#最终效果
[root@web1 ~]# curl 192.168.0.8
internet
[root@web1 ~]# ping 192.168.0.8
PING 192.168.0.8 (192.168.0.8) 56(84) bytes of data.
64 bytes from 192.168.0.8: icmp_seq=1 ttl=63 time=2.86 ms
[root@internet ~]#curl 10.0.0.28
curl: (7) Failed connect to 10.0.0.28:80; Connection refused
[root@internet ~]#curl 10.0.0.38
curl: (7) Failed connect to 10.0.0.38:80; Connection refused
```







### 范例：实现内网可以ping通外网，但外网无法ping通内网

```bash
#首先让所有主机都无法穿过，这时客户端和服务器相互都不能访问
#并且双方互ping时都提示目标网络不可达 Destination Port Unreachable
[root@iptables ~]# iptables -A FORWARD -j REJECT

#配置规则
#源地址10.0.0.0/24，协议icmp，并使用icmp的扩展规则 8 表示icmp请求，-j ACCEPT放行
[root@iptables ~]# iptables -I FORWARD -s 10.0.0.0/24 -p icmp --icmp-type 8 -j ACCEPT
#目标地址10.0.0.0/24，协议icmp，并使用icmp的扩展规则 0 表示icmp响应，-j ACCEPT放行
[root@iptables ~]# iptables -I FORWARD -d 10.0.0.0/24 -p icmp --icmp-type 0 -j ACCEPT

#配置后
[root@internet ~]# ping 10.0.0.28
PING 10.0.0.28 (10.0.0.28) 56(84) bytes of data.
From 192.168.0.18 icmp_seq=1 Destination Port Unreachable
[root@internet ~]# ping 10.0.0.38
PING 10.0.0.38 (10.0.0.38) 56(84) bytes of data.
From 192.168.0.18 icmp_seq=1 Destination Port Unreachable
[root@web1 ~]# ping 192.168.0.8
PING 192.168.0.8 (192.168.0.8) 56(84) bytes of data.
64 bytes from 192.168.0.8: icmp_seq=1 ttl=63 time=0.936 ms
[root@web2 ~]# ping 192.168.0.8
PING 192.168.0.8 (192.168.0.8) 56(84) bytes of data.
64 bytes from 192.168.0.8: icmp_seq=1 ttl=63 time=1.62 ms
```



### 范例：允许内网指定主机被外网访问，只能访问http

```bash
#首先让所有主机都无法穿过，这时客户端和服务器相互都不能访问
[root@iptables ~]# iptables -A FORWARD -j REJECT

#添加规则
[root@firewall ~]# iptables -IFORWARD 3 -d 10.0.0.18 -p tcp --dport 80 -j ACCEPT

？？？
```















# NAT

## NAT概述

- NAT为地址转换协议
- 主要分为SNAT和DNAT
- SNAT实现的是内网访问外网
- DNAT实现的是外网访问内网

## 实验环境

- internet和iptables是直连所以不需要配网关
- lan1 和 lan2需要访问Internet并且和Internet不在一个网段所以需要配网关

| 主机名   | IP地址/网卡/虚拟机网络模式                                   | 功能                 | 网关      |
| -------- | ------------------------------------------------------------ | -------------------- | --------- |
| Internet | 192.168.0.8/24、eth0、仅主机                                 | 充当互联网中的客户端 | 无需配置  |
| iptables | 10.0.0.18/24、eth0、NAT                       192.168.0.18/24、eth1、仅主机 | iptables端           | 无需配置  |
| vlan1    | 10.0.0.28/24、eth0、NAT                                      | nginx-web1           | 10.0.0.18 |
| vlan2    | 10.0.0.38/24、eth0、NAT                                      | nginx-web2           | 10.0.0.18 |





## SNAT

### SNAT概述

- **源地址转换，实现的是局域网访问互联网**

- **SNAT需要在POSTROUTING链进行设置**
- 内网中的私有IP因为没有路由所以是无法访问外网的，但是可以将发送出的报文目标修改成防火墙的公网IP，从而再用公网的IP来访问外网，然后外网将回应的数据报文发给防火墙的公网IP，防火墙在将收到的数据报文转发给内网的私网IP，从而实现内网和外网间的网络通讯
- **SNAT除了实现私网地址可以访问公网地址以外，因为公网无法直接访问私网，所以从而实现了网络安全**

### SNAT原理

- **这里假设：**
  - 192.168.0.8 为外网IP（外网的web服务）
  - 192.168.0.18 为NAT设备的外网IP
  - 10.0.0.18 为NAT设备的内网IP
  - 10.0.0.28 为内网IP
- :XXX 表示使用的是随机端口

#### 报文结构：

| 序号 | 源               | 目标             |
| ---- | ---------------- | ---------------- |
| 1    | 10.0.0.28:XXX    | 192.168.0.8:80   |
| 2    | 192.168.0.18:XXX | 192.168.0.8:80   |
| 3    | 192.168.0.8:80   | 192.168.0.18:XXX |
| 4    | 192.168.0.8:80   | 10.0.0.28:XXX    |

#### 报文结构说明：

- **1和2是请求包，3和4是回应包，请求包中是将源地址转换成NAT设备的外网地址，所以称为源地址转换SNAT**

1. 内网的10.0.0.28 使用随机端口 访问互联网上的 192.168.0.8的80端口
2. 将源地址替换为NAT设备的外网地址192.168.0.18  目标保留不变
   - 经过互联网的路由到达 192.168.0.8 而后 192.168.0.8 做出回应（这时192.168.0.8看到的日志信息是由192.168.0.18发过来的）
3. 192.168.0.8 回应报文，源地址为 192.168.0.8 ，目标地址为NAT设备的外网地址 192.168.0.18:XXX
   - 这时经过互联网的路由又回到了 NAT设备的外网地址192.168.0.18
4. 最后将目标IP替换为内网的主机10.0.0.28



### 实现SNAT方法1

- 针对专线静态公共IP

#### 语法

```bash
iptables -t nat -A POSTROUTING -s 内网IP [! -d LocalNet] -j SNAT --to-source 替换的外网网卡IP
```

#### 实现前查看

```sh
#外网无法访问
[root@web1 ~]# curl 192.168.0.8

#外网端抓包，发现只有10.0.0.28的请求包，而没有响应包 因为10.0.0.28是内网IP 且没有路由
[root@internet ~]#tcpdump -i eth0 -nn icmp
...
10:57:33.345129 IP 10.0.0.28.35274 > 192.168.0.8.80: Flags [S], seq 3483497226, win 29200, options [mss 1460,sackOK,TS val 1237524092 ecr 0,nop,wscale 7], length 0
....
```

#### 实现

```sh
#针对专线静态公共IP
[root@iptables ~]#iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j SNAT --to-source 192.168.0.18
```

#### 实现后查看

```sh
#可以访问了
[root@web1 ~]# curl 192.168.0.8
internet

#在外网抓包工具可以看到源IP地址不是内网的IP而是192.168.0.8这个外网IP，并且也有了对于192.168.0.18的回应包
[root@internet ~]#tcpdump -i eth0 -nn tcp port 80
...
10:53:35.460239 IP 192.168.0.18.35272 > 192.168.0.8.80: Flags [S], seq 2278333106, win 29200, options [mss 1460,sackOK,TS val 1237286208 ecr 0,nop,wscale 7], length 0
10:53:35.460337 IP 192.168.0.8.80 > 192.168.0.18.35272: Flags [S.], seq 3812381738, ack 2278333107, win 28960, options [mss 1460,sackOK,TS val 29836676 ecr 1237286208,nop,wscale 7], length 0
...

#防火墙端查看转换状态信息
[root@iptables ~]#cat /proc/net/nf_conntrack
ipv4     2 tcp      6 62 TIME_WAIT src=10.0.0.28 dst=192.168.0.8 sport=35270 dport=80 src=192.168.0.8 dst=192.168.0.18 sport=80 dport=35270 [ASSURED] mark=0 zone=0 use=2
```



### 实现SNAT方法2(常用)

- 适用于动态的公网IP，如：拨号网络 和专线静态公共IP，**所以更加通用**
-  MASQUERADE：地址伪装

#### 语法

```sh
iptables -t nat -A POSTROUTING -s 内网IP [! -d LocalNet] -j  MASQUERADE
```

#### 实现前查看

```sh
#外网无法访问
[root@web1 ~]# curl 192.168.0.8

#外网端抓包，发现只有10.0.0.28的请求包，而没有响应包 因为10.0.0.28是内网IP 且没有路由
[root@internet ~]#tcpdump -i eth0 -nn icmp
...
10:57:33.345129 IP 10.0.0.28.35274 > 192.168.0.8.80: Flags [S], seq 3483497226, win 29200, options [mss 1460,sackOK,TS val 1237524092 ecr 0,nop,wscale 7], length 0
....
```

#### 实现

```sh
#适用于动态的公网IP，如：拨号网络 和专线静态公共IP（通用）
[root@firewall ~]#iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE
```

#### 实现后查看

```sh
#可以访问了
[root@web1 ~]# curl 192.168.0.8
internet

#在外网抓包工具可以看到源IP地址不是内网的IP而是192.168.0.8这个外网IP，并且也有了对于192.168.0.18的回应包
[root@internet ~]#tcpdump -i eth0 -nn tcp port 80
...
10:53:35.460239 IP 192.168.0.18.35272 > 192.168.0.8.80: Flags [S], seq 2278333106, win 29200, options [mss 1460,sackOK,TS val 1237286208 ecr 0,nop,wscale 7], length 0
10:53:35.460337 IP 192.168.0.8.80 > 192.168.0.18.35272: Flags [S.], seq 3812381738, ack 2278333107, win 28960, options [mss 1460,sackOK,TS val 29836676 ecr 1237286208,nop,wscale 7], length 0
...

#防火墙端查看转换状态信息
[root@iptables ~]#cat /proc/net/nf_conntrack
ipv4     2 tcp      6 62 TIME_WAIT src=10.0.0.28 dst=192.168.0.8 sport=35270 dport=80 src=192.168.0.8 dst=192.168.0.18 sport=80 dport=35270 [ASSURED] mark=0 zone=0 use=2
```





## DNAT

### DNAT概述

- **目标地址转换，实现的是外部互联网主机访问内部局域网**

- **DNAT需要在PREROUTING链进行设置**

- 把本地网络中的主机上的某服务开放给外部网络访问(发布服务和端口映射)，但隐藏真实IP

- **DNAT的目标只能设置一个IP地址（-d 对外提供服务的外网IP 只能设置一个，因为有LVS这种更好的解决方案了，所以内核不再支持设置多个IP）**

### DNAT原理

- **这里假设：**
  - 192.168.0.8 为外网IP
  - 192.168.0.18 为NAT设备的外网IP
  - 10.0.0.18 为NAT设备的内网IP
  - 10.0.0.28 为内网IP（内网的web服务器）
  - :XXX 表示使用的是随机端口

#### 报文结构：

| 序号 | 源              | 目标            |
| ---- | --------------- | --------------- |
| 1    | 192.168.0.8:XXX | 192.168.0.18:80 |
| 2    | 192.168.0.8:XXX | 10.0.0.28:80    |
| 3    | 10.0.0.28:80    | 192.168.0.8:XXX |
| 4    | 192.168.0.18:80 | 192.168.0.8:XXX |

#### 报文结构说明：

- **1和2是请求包，3和4是回应包，请求包中是将目标地址转换成NAT设备的内网地址，所以称为目标地址转换DNAT**

1. 192.168.0.8 开启了随机端口想访问 192.168.0.18的web服务
2. 但192.168.0.18只是一个NAT设备 并没有web服务 所以将请求调度到内网的 web服务器10.0.0.28



### 语法

```bash
iptables -t nat -A PREROUTING -d 对外提供服务的外网IP -p tcp --dport 80 -j DNAT --to-destination 10.0.0.7:80 
#10.0.0.7:80可以换成不同的ip或端口
```



### 范例：实现内网IP对外可以访问

#### 实现前测试

```bash
#直接访问防火墙的VIP无法访问，因为防火墙本身没有web服务
[root@internet ~]#curl 192.168.0.18
curl: (7) Failed connect to 192.168.0.18:80; Connection refused

```

#### 实现

```bash
#将外网的访问转发到内网的10.0.0.28的80端口
[root@iptables ~]# iptables -t nat -A PREROUTING -d 192.168.0.18 -p tcp --dport 80 -j DNAT --to-destination 10.0.0.28:80

#访问时直接访问映射的IP
[root@internet ~]#curl 192.168.0.8
lanserver1

[root@lanserver1 ~]#tail /var/log/httpd/access_log 
192.168.0.6 - - [08/Jul/2020:18:10:37 +0800] "GET / HTTP/1.1" 200 11 "-"
"curl/7.19.7 (x86_64-redhat-linux-gnu) libcurl/7.19.7 NSS/3.27.1 zlib/1.2.3 
libidn/1.18 libssh2/1.4.2"


```

#### 实现后测试

```sh
#外网可以访问
[root@internet ~]#curl 192.168.0.18
nginx web1

#防火墙可以查看到转发的记录
[root@iptables ~]# cat /proc/net/nf_conntrack
ipv4     2 tcp      6 33 TIME_WAIT src=192.168.0.8 dst=192.168.0.18 sport=43604 dport=80 src=10.0.0.28 dst=192.168.0.8 sport=80 dport=43604 [ASSURED] mark=0 zone=0 use=2

#内网web端可以查看到真实访问的IP地址，因为是将目标地址做了转换 源地址并没有转换 所以可以看到
[root@web1 ~]# cat /var/log/nginx/access.log 
192.168.0.8 - - [06/Feb/2022:13:50:14 +0800] "GET / HTTP/1.1" 200 11 "-" "curl/7.29.0" "-"
```

### 范例：icmp协议的DNAT

```bash
iptables -t nat -A PREROUTING -d 192.168.0.18 -p icmp -j DNAT --to-destination 10.0.0.8
```

### 范例：tcp协议的DNAT

```bash
iptables -t nat -I PREROUTING -d 192.168.0.18 -p tcp -j DNAT --to-destination 10.0.0.8
```







## PNAT

- port nat
- 访问外网时 地址进行转换并且也将端口号也进行转换 防止多台内网主机上网时回应的报文因为端口号相同而不知道该往哪台机器转发





## REDIRECT转发

- **端口重定向**
- **在不改变防火墙规则的情况下，在本机设置端口重定向，从而解决服务修改端口号需要修改防火墙规则的问题**
- REDIRECT，是NAT表的 target，通过改变目标IP和端口，**将接受的包转发至同一个主机的不同端口**，可用于PREROUTING OUTPUT链

### 语法

```sh
#--to-ports的-ports可省略不写
iptables -t nat -A PREROUTING -p 协议 --dport 访问本机的端口 -j REDIRECT --to-ports 转发到本机的端口
```

### 范例：本机服务端口变更 不改变调度器规则的情况下实现端口重定向

```bash
#方法一，在服务的主机设置，当访问本机的80端口时，转发到本机的8080端口，
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to 8080

#方法二，在服务的主机设置，--to-destination的-destination可省略不写
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to :8080
```





## 完全NAT

- **实现跨地区的局域网互相访问，本质上就是双方互做对方的SNAT和DNAT**

### 范例：实现北京到上海局域网互通

#### 实验环境：

| 地区                 | IP/网络类型        | 虚拟机类型 |
| -------------------- | ------------------ | ---------- |
| 北京                 | 10.0.0.8/局域网    | NAT？      |
| 位置地区(充当路由器) | 172.16.0.8/路由器  | 仅主机？   |
| 上海                 | 192.168.0.8/局域网 | NAT？      |

...







# 防火墙案例：

## 公司

```sh
# Generated by iptables-save v1.4.7 on Wed May 18 09:22:34 2016
*filter
:INPUT ACCEPT [85890:4530430]
:FORWARD ACCEPT [76814:55698470]
:OUTPUT ACCEPT [166620:238017546]
-A FORWARD -s 172.16.0.100/32 -j ACCEPT 
-A FORWARD -s 172.16.0.200/32 -j ACCEPT 
-A FORWARD -s 172.16.0.67/32 -j ACCEPT
#WANG   ADD NEXT LINE IN 20170627
#-A FORWARD -s 172.16.0.0/16 -j ACCEPT
#WANG   ADD NEXT LINE IN 20170704
#-A FORWARD -s 172.18.0.0/16 -j ACCEPT
#-A FORWARD -s 172.18.0.0/16 -j REJECT
#-A FORWARD -s 172.16.0.68/32 -j ACCEPT 
#-A FORWARD -s 172.16.0.69/32 -j ACCEPT 
#-A FORWARD -s 172.16.0.6/32 -j ACCEPT
-A FORWARD -s 172.17.200.200/32 -j ACCEPT 
-A FORWARD -s 172.17.136.136/32 -j ACCEPT 
-A FORWARD -s 172.17.0.100/32 -j ACCEPT 
-A FORWARD -s 172.18.100.1/32 -j ACCEPT 
-A FORWARD -s 172.18.0.100/32 -j ACCEPT 
-A FORWARD -s 172.18.200.2/32 -j ACCEPT 
-A FORWARD -s 172.18.200.3/32 -j ACCEPT 
-A FORWARD -s 172.18.211.211/32 -j ACCEPT 
-A FORWARD -s 172.18.212.212/32 -j ACCEPT 
-A FORWARD -m iprange --src-range 172.16.0.100-172.16.0.110 -j ACCEPT 
-A FORWARD -m iprange --src-range 172.17.0.100-172.17.0.110 -j ACCEPT 
-A FORWARD -m iprange --src-range 172.18.0.100-172.18.0.110 -j ACCEPT 
-A FORWARD -m iprange --src-range 172.17.100.6-172.17.100.16 -j ACCEPT 
-A FORWARD -m iprange --src-range 172.18.100.61-172.18.100.70 -j ACCEPT 

-A FORWARD -s 172.16.0.0/16 -m string --string "verycd.com" --algo kmp --to
65535 -j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.16.0.0/16 -m string --string "tudou.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.16.0.0/16 -m string --string "youku.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.16.0.0/16 -m string --string "iqiyi.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.16.0.0/16 -m string --string "pptv.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.16.0.0/16 -m string --string "letv.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.16.0.0/16 -m string --string "xunlei.com" --algo kmp --to
65535 -j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.18.0.0/16 -m string --string "verycd.com" --algo kmp --to
65535 -j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.18.0.0/16 -m string --string "tudou.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.18.0.0/16 -m string --string "youku.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.18.0.0/16 -m string --string "iqiyi.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.18.0.0/16 -m string --string "pptv.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.18.0.0/16 -m string --string "letv.com" --algo kmp --to 65535
-j REJECT --reject-with icmp-port-unreachable
-A FORWARD -s 172.18.0.0/16 -m string --string "xunlei.com" --algo kmp --to
65535 -j REJECT --reject-with icmp-port-unreachable

#-A FORWARD -s 172.18.0.0/16 -j REJECT
#-A FORWARD -s 172.16.0.0/16 -j REJECT
#-A FORWARD -i ppp0 -m string --string ".exe" --algo bm --to 65535 -j REJECT --
reject-with icmp-port-unreachable 
-A FORWARD -s 172.18.0.0/16 -m time --timestart 08:50:00 --timestop 18:00:00 --
weekdays Mon,Wed,Fri  --datestop 2038-01-19T11:14:07 -j REJECT --reject-with
icmp-port-unreachable 
-A FORWARD -s 172.17.0.0/16 -m time --timestart 08:50:00 --timestop 18:00:00 --
weekdays Mon,Wed,Fri  --datestop 2038-01-19T11:14:07 -j REJECT --reject-with
icmp-port-unreachable 
-A FORWARD -s 172.16.0.0/16 -m time --timestart 08:50:00 --timestop 12:30:00 --
weekdays Tue,Thu,Sat  --datestop 2038-01-19T11:14:07 -j REJECT --reject-with
icmp-port-unreachable

-A FORWARD -s 172.16.0.0/16 -m time --timestart 13:50:00 --timestop 18:00:00 --
weekdays Tue,Thu,Sat  --datestop 2038-01-19T11:14:07 -j REJECT --reject-with
icmp-port-unreachable 
#wang next 2 lines changed in 20170619
#-A FORWARD -s 172.17.0.0/16 -m time --timestart 08:50:00 --timestop 12:30:00 --
weekdays Mon,Wed,Fri --datestop 2038-01-19T11:14:07 -j REJECT --reject-with 
icmp-port-unreachable 
#-A FORWARD -s 172.17.0.0/16 -m time --timestart 13:30:00 --timestop 18:10:00 --
weekdays Mon,Wed,Fri --datestop 2038-01-19T11:14:07 -j REJECT --reject-with 
icmp-port-unreachable 
#-A FORWARD -s 172.18.0.0/16 -m time --timestart 08:50:00 --timestop 18:10:00 --
weekdays Mon,Wed,Fri --datestop 2038-01-19T11:14:07 -j REJECT --reject-with 
icmp-port-unreachable 
#-A FORWARD -s 172.18.0.0/16 -m time --timestart 08:50:00 --timestop 18:10:00 --
weekdays Tue,Thu --datestop 2038-01-19T11:14:07 -j REJECT --reject-with icmpport-unreachable 
COMMIT
# Completed on Wed May 18 09:22:34 2016
# Generated by iptables-save v1.4.7 on Wed May 18 09:22:34 2016
*nat
:PREROUTING ACCEPT [1429833:65427211]
:POSTROUTING ACCEPT [850518:35452195]
:OUTPUT ACCEPT [120198:9146655]
-A POSTROUTING -s 172.16.0.100/32 -j MASQUERADE
-A POSTROUTING -s 172.18.0.100/32 -j MASQUERADE
#-A POSTROUTING -s 172.16.0.200/32 -j MASQUERADE
#wang add next 1 line in 20170619 
#wang add next 1 line in 20170704 
-A POSTROUTING -s 172.16.0.69/32 -j MASQUERADE
-A POSTROUTING -s 172.17.200.200/32 -j MASQUERADE
-A POSTROUTING -s 172.17.136.136/32 -j MASQUERADE
-A POSTROUTING -s 172.17.0.100/32 -j MASQUERADE
#-A POSTROUTING -s 172.18.0.0/16 -j MASQUERADE
#-A POSTROUTING -s 172.16.0.6/32 -j MASQUERADE
-A POSTROUTING -m iprange --src-range 172.16.0.100-172.16.0.110 -j MASQUERADE 
-A POSTROUTING -m iprange --src-range 172.17.0.100-172.17.0.110 -j MASQUERADE 
-A POSTROUTING -m iprange --src-range 172.18.0.100-172.18.0.110 -j MASQUERADE 
-A POSTROUTING -s 172.16.0.0/16 -p tcp -m multiport --dports 80,443,53,22,6666 - j MASQUERADE 
-A POSTROUTING -s 172.16.0.0/16 -p udp -m multiport --dports 22 -j MASQUERADE 
-A POSTROUTING -s 172.17.0.0/16 -p tcp -m multiport --dports 80,443,53,22,6666 - j MASQUERADE 
-A POSTROUTING -s 172.17.0.0/16 -p udp -m multiport --dports 22 -j MASQUERADE 
-A POSTROUTING -s 172.18.0.0/16 -p tcp -m multiport --dports
80,443,53,22,6666,1206,5938,1949 -j MASQUERADE 
-A POSTROUTING -s 172.18.0.0/16 -p udp -m multiport --dports 22,1206,5938,1949 - j MASQUERADE 
COMMIT
# Completed on Wed May 18 09:22:34 2016
```

## DOCKER

```sh
,,,
```





#  iptables 规则保存与加载

- iptables的规则默认重启后就会消失


## 保存规则

### Centos7,8保存规则

```bash
iptables-save > /PATH

#范例：
[root@iptables ~]# mkdir -p /etc/iptables/
[root@iptables ~]# iptables-save > /etc/iptables/iptables.rule
# Generated by iptables-save v1.8.4 on Sat Feb  5 15:14:28 2022
*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:WEB_CHAIN - [0:0]
...
```

### Centos6保存规则

```sh
service iptables save #将规则覆盖保存至/etc/sysconfig/iptables文件中
```



## 加载规则

### Centos7,8加载规则

```bash
iptables-restore < /PATH/FROM/SOME_RULE_FILE #CentOS7,8 重新载入预存规则文件中规则（默认覆盖原有的所有规则）

#iptables-restore选项
-n, --noflush #不清除原有规则
-t, --test    #仅分析生成规则集，但不提交（测试）
```

### Centos6加载规则

```sh
service iptables  restart #会自动从/etc/sysconfig/iptables 重新载入规则
```



## 开机自动重载规则

### 方法一：写开机执行脚本

```bash
echo 'iptables-restore < /PATH/FROM/IPTABLES_RULE_FILE' >> /etc/rc.d/rc.local
chmod +x /etc/rc.d/rc.local
```

### 方法二：利用service文件实现开机启动

```bash
dnf -y install iptables-services
systemctl enable --now iptables.service

/etc/sysconfig/iptables #此文件存放防火墙规则，将现有的规则导入到此文件即可

#保存现在的规则到文件中方法1（centos7,8）
iptables-save > /etc/sysconfig/iptables

#保存现在的规则到文件中方法2（centos6）
/usr/libexec/iptables/iptables.init save


systemctl enable --now iptables.service #开机启动

systemctl mask firewalld.service nftables.service #将有可能产生冲突的服务关闭
```





# 清除iptables中的所有内容

可以使用如下命令清除 iptables 中的所有内容：

```
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT
```

- `-F` 表示清空链的所有规则。
- `-X` 表示删除自定义链。
- `-t nat` 表示操作 nat 表。
- `-t mangle` 表示操作 mangle 表。
- `-P` 表示设置默认链的策略，这里将 INPUT、OUTPUT 和 FORWARD 链的策略设置为 ACCEPT，即接受所有数据包。

请注意，清空 iptables 可能导致服务器无法正常通信，请谨慎操作。





# ---

# 数据包处理流程

当一个数据包到达本地机器时，首先会经过 `nat` 表，然后再经过 `filter` 表。

1. **`nat` 表**：首先用于进行网络地址转换（NAT）。主要用于修改数据包的源地址和目的地址，典型的操作包括源地址转换（SNAT）和目的地址转换（DNAT）。

2. **`filter` 表**：其次用于数据包过滤。主要用于实现防火墙功能，通过规则来允许或拒绝数据包的转发。

具体的处理流程如下：

- 数据包进入网络接口后，首先会进入 `PREROUTING` 链（在 `nat` 表中）。
- 如果数据包需要被路由到本地机器，则会进入 `INPUT` 链（在 `filter` 表中）。
- 如果数据包需要被转发到其他网络接口，则会进入 `FORWARD` 链（在 `filter` 表中）。
- 数据包在被发送到外部网络接口之前，会进入 `POSTROUTING` 链（在 `nat` 表中）。

所以，最开始的数据包首先会经过 `nat` 表中的 `PREROUTING` 链，然后再进入 `filter` 表中的相应链条。





# nat

## PREROUTING

在 `iptables` 中，`PREROUTING` 链属于 `nat` 表，用于处理数据包在进入路由器或主机时的初始阶段。在数据包进行路由决策之前，`PREROUTING` 链会先对其进行处理，常用于目标地址转换（DNAT）和端口转发。

### PREROUTING 链的作用
- **DNAT (Destination Network Address Translation)**: 修改数据包的目标地址。在数据包进入网络设备时，`PREROUTING` 链可以通过 `DNAT` 将目标地址修改为内网服务器地址或其他特定地址。
- **端口转发**: 将外部访问请求的特定端口流量转发到内部网络的相应服务器和端口。

### PREROUTING 链的常用规则
以下是一些常见的 `PREROUTING` 链规则：

1. **DNAT**
   ```bash
   iptables -t nat -A PREROUTING -d 203.0.113.1 -p tcp --dport 80 -j DNAT --to-destination 192.168.1.100:80
   ```
   - 这条规则将发往 `203.0.113.1` 的 TCP 80 端口的流量重定向到内网 `192.168.1.100` 的 80 端口。

2. **端口转发**
   ```bash
   iptables -t nat -A PREROUTING -p tcp --dport 2222 -j DNAT --to-destination 192.168.1.101:22
   ```
   - 这条规则将所有发往路由器的 2222 端口的 SSH 流量重定向到内网主机 `192.168.1.101` 的 22 端口。

### 典型应用场景
- **Web 服务器负载均衡**: 将外部访问某个公网 IP 的 HTTP 请求通过 `PREROUTING` 链重定向到不同的内部服务器，实现负载均衡。
- **端口映射**: 在 NAT 环境下，将外部的特定端口映射到内部网络中的相应服务端口，例如将公网的端口 8080 映射到内网服务器的 80 端口。
- **透明代理**: 配置透明代理时，利用 `PREROUTING` 链将流量重定向到代理服务器进行处理。

### 数据包流程
当一个外部数据包进入路由器或主机时，流程如下：
1. **数据包到达**: 数据包通过网络接口进入设备。
2. **PREROUTING 链**: 在路由决策之前，数据包经过 `PREROUTING` 链，此时可以修改目标地址或端口。
3. **路由决策**: 修改后的数据包根据新的目标地址进行路由决策。
4. **数据包转发**: 数据包根据路由决策发送到目标主机或相应的内部服务。

### 总结
`PREROUTING` 链在 NAT 和防火墙规则中至关重要，特别是在处理入站流量时。通过 `PREROUTING` 链，可以对进入网络的数据包进行初始处理，包括目标地址转换和端口重定向。这使得在复杂的网络环境中，可以灵活地控制流量并实现各种高级网络功能，如负载均衡、端口映射和透明代理。

### 示例

```c
Chain PREROUTING (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
   96  4992 DNAT       tcp  --  ht_ooHjTQV4 *       0.0.0.0/0            0.0.0.0/0            tcp dpt:809 to:192.168.200.2:80
```

- **链 (Chain)**：这是在 `PREROUTING` 链中的一条规则。`PREROUTING` 链用于在数据包进入路由前进行处理。
- **策略 (policy)**：默认策略是 `ACCEPT`，表示默认接受数据包。
- **数据包统计 (pkts bytes)**：这条规则已经匹配了 96 个数据包，累计 4992 字节的数据。
- **目标 (target)**：目标是 `DNAT`（目的地址网络地址转换），用于更改数据包的目的地址。
- **协议 (prot)**：这条规则应用于 `tcp` 协议的数据包。
- **选项 (opt)**：该列显示了与规则匹配的选项，`--` 表示没有指定特殊选项。
- **输入接口 (in)**：匹配输入接口 `ht_ooHjTQV4`。
- **输出接口 (out)**：匹配所有输出接口（`*` 表示任何接口）。
- **源地址 (source)**：匹配所有源地址（`0.0.0.0/0`）。
- **目的地址 (destination)**：匹配所有目的地址（`0.0.0.0/0`）。
- **端口 (tcp dpt)**：匹配目的端口为 809 的 TCP 数据包。
- **重定向 (to)**：将目的地址转换为 `192.168.200.2` 的端口 `80`。

**具体意思**：
- 任何从输入接口 `ht_ooHjTQV4` 进入的 TCP 数据包，如果其目的端口是 809，则这条规则会将这些数据包的目的地址修改为 `192.168.200.2`，并将目的端口修改为 `80`。

这条规则的作用是在特定的输入接口上重定向特定端口的流量，通常用于将外部请求重定向到内部服务器。例如，将特定接口上的 809 端口请求重定向到内网中的 Web 服务器（`192.168.200.2:80`）。



## POSTROUTING

在 `iptables` 中，`POSTROUTING` 链属于 `nat` 表，用于处理数据包在路由完成后但在实际发送之前的网络地址转换（NAT）。它主要用于修改数据包的源地址、目的地址或端口信息，常见的场景包括 SNAT（Source Network Address Translation）和 MASQUERADE。

### POSTROUTING 链的作用
- **SNAT (Source Network Address Translation)**: 修改数据包的源地址。在数据包离开路由器时，`POSTROUTING` 链可以通过 `SNAT` 将内部网络的源地址修改为路由器的公网地址。
- **MASQUERADE**: 一种特殊的 SNAT，适用于动态 IP 环境，通常用于将内网设备的流量伪装为路由器的公网 IP，常用于家庭或小型企业网络的互联网共享。

### POSTROUTING 链的常用规则
以下是一些常见的 `POSTROUTING` 链规则：

1. **SNAT**
   ```bash
   iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j SNAT --to-source 203.0.113.1
   ```
   - 这条规则将来自 `192.168.1.0/24` 子网的所有流量，在通过 `eth0` 接口发送时，将源地址修改为 `203.0.113.1`。

2. **MASQUERADE**
   ```bash
   iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
   ```
   - 这条规则将通过 `eth0` 接口发送的所有流量的源地址修改为该接口的 IP 地址，适用于动态 IP 场景。

### 典型应用场景
- **家庭路由器**: 在家庭网络中，多个设备共享一个公网 IP 地址，`POSTROUTING` 链中的 `MASQUERADE` 规则可将内网流量伪装为路由器的公网 IP。
- **VPN 服务器**: 在 VPN 场景中，POSTROUTING 链可以将 VPN 客户端流量的源地址修改为 VPN 服务器的出口地址。

### 数据包流程
当一个数据包在内网生成，并决定通过路由器访问外网时，流程如下：
1. **数据包生成**: 内部主机生成数据包。
2. **路由决策**: 路由器决定数据包的下一跳。
3. **POSTROUTING 链**: 在数据包即将被发送到外网之前，经过 `POSTROUTING` 链，在此链中可以进行源地址修改。
4. **数据包发送**: 修改后的数据包通过网络接口发送到目的地。

### 总结
`POSTROUTING` 链在 NAT 中扮演了关键角色，特别是在处理出站流量时，通过对数据包的源地址或端口进行修改，确保内网和外网之间的通信可以顺利进行。理解并正确配置 `POSTROUTING` 链，对于网络地址转换和流量管理至关重要。
