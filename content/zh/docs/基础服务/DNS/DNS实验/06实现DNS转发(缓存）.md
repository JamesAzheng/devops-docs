---
title: "06实现DNS转发(缓存）"
---

# 前言

利用DNS转发，可以将用户的DNS请求，转发至指定的DNS服务，而非默认的根DNS服务器，并将指定服务器查询的返回结果进行缓存，提高效率。





# 注意事项

- 被转发的服务器需要能够为请求者做递归，否则转发请求不予进行

-  在全局配置块中，关闭dnssec功能

  - ```bash
    dnssec-enable no;
    dnssec-validation no;
    ```





# 转发方式

- **first**：先转发至指定DNS服务器，如果无法解析查询请求，则本服务器再去根服务器查询
- **only**：先转发至指定DNS服务器，如果无法解析查询请求，则本服务器将不再去根服务器查询

## 全局转发

- 对非本机所负责解析区域的请求，全转发给指定的服务器
- **常用**
- 在全局配置块中实现：

```bash
Options {
...
   forward first|only;
   forwarders { ip;};
...
};
```

## 特定区域转发

- 仅转发对特定的区域的请求，**比全局转发优先级高**
- **不常用**
- 在区域数据库配置文件中实现：

```bash
zone "ZONE_NAME" IN {
   type forward;
   forward first|only;
   forwarders { ip;};
};
```







# 实现 DNS 转发

## 环境说明

- dns-forward  服务器也应该实现高可用，具体实现方法？？？

| hostname    | IP         | service | role          | OS     |
| ----------- | ---------- | ------- | ------------- | ------ |
| dns-forward | 10.0.0.18  | bind9   | dns转发服务器 | CentOS |
| dns-master  | 10.0.0.103 | bind9   | 主DNS         | Ubuntu |

## dns-master  配置

```bash
# 区域数据库文件
root@dns-master:~# cat /var/cache/bind/xiangzheng.com.zone.bind
$TTL 600
@   IN    SOA    ns1    mail.xiangzheng.com. (
            2015042204 ;
            1H ;
            10M ;
            1D ;
            12H ;
            )
@         NS   ns1
@         NS   ns2
ns1       A    10.0.0.103
ns2       A    10.0.0.104
@         A    10.0.0.77
```

## 实现前客户端测试

```bash
# 使用公网的公共DNS测试是否能实现解析自己的网站
[root@client ~]# host xiangzheng.vip 223.5.5.5
Using domain server:
Name: 223.5.5.5
Address: 223.5.5.5#53
Aliases: 

xiangzheng.vip has address 8.140.166.135


# xiangzheng.com 直接从根服务器迭代查询了
[root@client ~]# host xiangzheng.com 10.0.0.18
Using domain server:
Name: 10.0.0.18
Address: 10.0.0.18#53
Aliases: 

xiangzheng.com is an alias for overdue.aliyun.com.
overdue.aliyun.com has address 170.33.9.230
```





## dns-forward  实现转发

- **以全局转发的方式实现转发**

```bash
# 只需在全局配置块添加以下配置即可
[root@dns-forward ~]# vim /etc/named.conf 
options {
    listen-on port 53 { localhost; }; #或者注释也许
...
    allow-query     { any; }; #或者注释也行
    forward first; #first表示转发的服务器如果查询不到则去根服务器查询
    forwarders { 10.0.0.103;}; #转发的DNS服务器IP
...
    dnssec-enable no; #no
    dnssec-validation no; #no
...


#检查配置文件
[root@dns-forward ~]# named-checkconf 


#重新加载配置文件
[root@dns-forward ~]# rndc reload
server reload successful
```





## 实现后客户端测试

```bash
# 如果目标DNS服务器有记录，则会直接返回结果
[root@client ~]# host xiangzheng.com 10.0.0.18
Using domain server:
Name: 10.0.0.18
Address: 10.0.0.18#53
Aliases: 

xiangzheng.com has address 10.0.0.77


# 如果目标DNS服务器没有记录，则转发服务器会向根服务器发起迭代查询
[root@client ~]# host xiangzheng.vip 10.0.0.18
Using domain server:
Name: 10.0.0.18
Address: 10.0.0.18#53
Aliases: 

xiangzheng.vip has address 8.140.166.135

---------------------------------

#当主dns服务器停掉
root@dns-master:~# poweroff 


#还是可以解析，因为 forward-dns 会有缓存
[root@client ~]# host xiangzheng.com 10.0.0.18
Using domain server:
Name: 10.0.0.18
Address: 10.0.0.18#53
Aliases: 

xiangzheng.com has address 10.0.0.77

---------------------

#当 forward-dns 清理掉缓存
[root@dns-forward ~]# rndc flush

# 又会去根服务器迭代查询
[root@client ~]# host xiangzheng.com 10.0.0.18
Using domain server:
Name: 10.0.0.18
Address: 10.0.0.18#53
Aliases: 

xiangzheng.com is an alias for overdue.aliyun.com.
overdue.aliyun.com has address 170.33.9.230
```

