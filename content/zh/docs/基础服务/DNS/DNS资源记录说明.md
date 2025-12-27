---
title: "DNS资源记录说明"
---


# 资源记录前言

- **区域解析库**：由众多RR组成（资源记录：Resource Record, RR）
- **记录类型**：SOA、NS、MX、A、AAAA、PTR、CNAME、TXT





# 资源记录格式说明

## 注意事项

- **一个DNS区域数据库最少由三部分组成：SOA记录、NS记录、NS对应的A记录**

-  TTL可从全局继承
-  **配置域名要以.结尾，否则还会继续补域名**
-  使用 “@” 符号可用于引用当前区域的名字
-  同一个名字可以通过多条记录定义多个不同的值；此时DNS服务器会以轮询方式响应
-  同一个值也可能有多个不同的定义名字；通过多个不同的名字指向同一个值进行定义；此仅表示通过多个不同的名字可以找到同一个主机

## 语法（格式）

```bash
name     [TTL]    IN   rr_type    value


#说明：
name    # 解析的域名，如：www.xiangzheng.com.（最后一定要填. 表示结束符 否则会将当前域名在往后补一遍）
TTL     # 用户将记录缓存多久，可选，不写将从全局继承，如：86400（表示一天 秒为单位）
IN      # 固定值 照填就可以 表示internet
rr_type # 资源记录类型，如SOA、NS、A...
value   # 域名对应的IP地址（如果是CNAME记录，则只能添加域名）
```







# SOA

- Start Of Authority，起始授权记录

## 注意事项

- 一个区域解析库有且仅能有一个 SOA 记录
- SOA 必须位于解析库的第一条记录

## 包含内容

- 当前区域的主DNS服务器的FQDN，也可以使用当前区域的名字
- 当前区域管理员的邮箱地址（但地址中不能使用@符号，一般用.替换，例如：mail.xiangzheng.com）
- 主从服务区域传输相关定义以及否定的答案的统一的TTL

## SOA 配置范例

- **name**: 当前区域的名字，例如“xiangzheng.com.”
- **value**: 有多部分组成

```bash
$TTL 600 # 全局配置，解析数据在dns服务器的缓存时间，缓存有效期10分钟；首行写一个TTL变量的话 那么下面的TTL可省略不写 将都使用这个值，不写单位即表示以秒为单位，也可以写成 1D 表示一天


# xiangzheng.com. 表示当前的域名，可省略成 @（因为已经在配置文件中添加了域名），@就表示本域
# IN为默认值，照填（表示internet）
# SOA 表示 SOA记录
# ns1 表示主DNS服务器，ns1来维护这个DNS服务（其实完整写法是ns1.xiangzheng.com. 因为本身就在这个域当中 会自动补 所以可以省略写成ns1，还需要写配套的A记录来指明ns1的IP地址）
# rootroot25.163.com. 表示当前区域管理员的邮箱地址；但地址中不能使用@符号，一般用.替换
xiangzheng.com.   IN    SOA    ns1    rootroot25.163.com. (
            2015042201 ; #DNS数据库的版本编号，后续数据库内容发生更新 则此序列号也必须要更新（因为从dns服务器是根据此序列号的变化来判断是否此主dns服务器发生了数据更新）
            1H ; #向主dns服务器拉取数据的时间间隔，一小时
            10M ; #如果一小时后拉取失败后的重试时间，每十分钟尝试一次
            1D ; #过期时间，拉取数据和尝试重新拉取数据都失败后 过多久认为从服务器失效
            12H ; #否定答案的TTL值，访问失败的记录 放在缓存中的有效时长（防止无效的记录多次去网络上查找而浪费资源）
            )

#ns1对应的NS记录，@表示当前域名 即xiangzheng.com，ns1表示ns1.xiangzheng.com
@      NS   ns1

# ns1对应的A记录，需要有对应的A记录来指向对应的 dns-server 的地址
ns1    IN    A    10.0.0.8
```





# NS

- 将子域名指定其它DNS服务器解析

## 注意事项

- 相邻的两个资源记录的name相同时，后续的可省略
- **对NS记录而言，任何一个ns记录后面的服务器名字，都应该在后续有一个A记录**
- 一个区域可以有多个NS记录

## NS 配置范例

- **name**: 当前区域的名字
- **value**: 当前区域的某DNS服务器的名字，例如ns.xiangzheng.com.

```sh
$TTL 600

xiangzheng.com.   IN    SOA    ns1    rootroot25.163.com. (
            2015042201 ;
            1H ;
            10M ;
            1D ;
            12H ;
            )

# xiangzheng.com. 对应的NS记录；
# @表示当前域名 即xiangzheng.com.
# ns1 表示 ns1.xiangzheng.com，即 ns 服务器对应的主机名
@      IN    NS   ns1 #完整写法：xiangzheng.com.   IN   NS   ns1.xiangzheng.com.
@      IN    NS   ns2 #备用 dns-server（从dns）

# ns主机 对应的A记录；
# 即 ns 服务器对应的 dns-server 的地址
ns1    IN    A    10.0.0.8
ns2    IN    A    10.0.0.103 #备用 dns-server（从dns）
```





# MX

- Mail eXchanger，邮件交换器
- 将域名指向邮件服务器的地址

## 注意事项

- 一个区域内，MX记录可有多个；但每个记录的value之前应该有一个数字(0-99)，表示此服务器的优先级；数字越小优先级越高
- 对MX记录而言，任何一个MX记录后面的服务器名字，都应该在后续有一个A记录

## MX 配置范例

- **name**: 当前区域的名字（可以写为@，@表示本域）
- **value**: 当前区域的某邮件服务器(smtp服务器)的主机名

```sh
xiangzheng.com. IN     MX    10    mx1.xiangzheng.com.
                IN     MX    20    mx2.xiangzheng.com.
mx1             IN     A          10.0.0.110   
mx2             IN     A          10.0.0.120 
```





# A

- 将域名指向一个ipv4地址，FQDN --> IP

## 注意事项

- 避免用户写错名称时给错误答案，可通过泛域名解析进行解析至某特定地址

## A 配置范例

- **name**: 某主机的FQDN，例如：www.xiangzheng.com.
- **value**: 主机名对应主机的IP地址

```bash
www.xiangzheng.com.         IN   A   1.1.1.1
www.xiangzheng.com.         IN   A   2.2.2.2
mx1.xiangzheng.com.         IN   A   3.3.3.3
mx2.xiangzheng.com.         IN   A   4.4.4.4
*.xiangzheng.com.           IN   A   5.5.5.5
xiangzheng.com.             IN   A   6.6.6.6
$GENERATE 1-254 HOST$       IN   A   1.2.3.$


#以上内容如果都在 xiangzheng.com. 这个域的话可以简写成以下形式
www         IN   A   1.1.1.1
www         IN   A   2.2.2.2
mx1         IN   A   3.3.3.3
mx2         IN   A   4.4.4.4
*           IN   A   5.5.5.5
@           IN   A   6.6.6.6
```







# AAAA

- 将域名指向一个ipv6地址，FQDN --> IPv6

## AAAA 配置范例

- 假设解析 www.xiangzheng.com 这个域名 对应的IPv6地址为 fe80::216:3eff:fe34:a8cc

```
www   86400   IN   AAAA   fe80::216:3eff:fe34:a8cc
```



# PTR

- PoinTeR，将IP解析成域名，IP --> FQDN

## 注意事项

- 网络地址及后缀可省略；主机地址依然需要反着写

## PTR 配置范例

- **name**: IP，有特定格式，把IP地址反过来写，1.2.3.4，要写作4.3.2.1；还有特定后缀：in-addr.arpa.，所以完整写法为：4.3.2.1.in-addr.arpa.
- **value**: FQDN

```bash
4.3.2.1.in-addr.arpa. IN PTR www.xiangzheng.com.


#如1.2.3为网络地址，可简写成：
4 IN PTR www.xiangzheng.com.
```





# CNAME

别名记录，通常大网站涉及到CDN时使用

CNAME（Canonical Name）记录是一种DNS记录，用于将一个域名映射到另一个域名。这意味着，如果您试图访问CNAME记录对应的域名，您实际上将被重定向到另一个域名。

CNAME记录有以下常见的应用场景：

1. 别名域名：您可以使用CNAME记录将别名域名映射到主域名，从而让您的用户可以使用不同的域名访问您的网站。
2. 负载均衡：您可以使用CNAME记录将域名映射到负载均衡器的DNS名称，从而实现负载均衡。
3. 第三方服务：如果您使用第三方服务（例如云存储服务），则可以使用CNAME记录将您的域名映射到第三方服务的域名，从而让您的用户可以通过您的域名访问第三方服务。

请注意，CNAME记录仅适用于二级域名，不能用于根域名（例如example.com）。此外，某些互联网服务不支持使用CNAME记录，因此请在使用CNAME记录前确认您的服务是否支持。

**为什么CNAME记录不能用于根域名？**

- CNAME记录不能用于根域名（例如example.com）是因为这是一种DNS规则。根域名必须使用A记录或其他类型的DNS记录来指向其IP地址，因为根域名是整个DNS域名系统的基础。
- 如果您将根域名映射到另一个域名，则DNS系统将无法确定您的域名的正确IP地址，因此无法访问您的网站。因此，CNAME记录只适用于二级域名，并且只能将二级域名映射到其他域名，而不是映射到IP地址。







## CNAME 配置范例

- **name**: 别名的FQDN
- **value**: 真正名字的FQDN

```bash
www.xiangzheng.com. IN CNAME  websrv.xiangzheng.com.
```

--

CNAME 记录（Canonical Name Record）是一种 DNS 记录类型，它将一个域名解析为另一个域名。CNAME 记录通常用于将一个主机名映射到另一个主机名，或者将一个子域名映射到另一个域名。

例如，假设你拥有一个名为 `www.example.com` 的网站，该网站的内容存储在名为 `s3.amazonaws.com` 的 Amazon S3 存储桶中。为了让用户通过 `www.example.com` 访问你的网站，你可以创建一个 CNAME 记录，将 `www.example.com` 解析为 `s3.amazonaws.com` 的主机名。具体来说，你需要在 `example.com` 的 DNS 配置中添加一个如下所示的 CNAME 记录：

```
www.example.com.    IN    CNAME    s3.amazonaws.com.
```

在上述记录中，`www.example.com` 是你的网站的主机名，`s3.amazonaws.com` 是存储网站内容的 S3 存储桶的主机名。该记录表示将 `www.example.com` 解析为 `s3.amazonaws.com`，即访问 `www.example.com` 将自动重定向到 `s3.amazonaws.com`，从而让用户访问到你的网站内容。

需要注意的是，CNAME 记录不能直接解析为 IP 地址，只能解析为另一个主机名。如果你需要将一个主机名解析为 IP 地址，应该使用 A 记录或 AAAA 记录。

**那 s3.amazonaws.com. 是不是也应该有对应的 A 记录？**

是的，`s3.amazonaws.com` 主机名对应的 IP 地址需要通过 A 记录或者 AAAA 记录进行解析。AWS 提供了一个名为 `s3.amazonaws.com` 的 DNS 服务，它返回一个可用于访问 S3 存储桶的 IP 地址列表。当你访问 `s3.amazonaws.com` 时，AWS 的 DNS 服务会根据负载均衡策略返回其中一个 IP 地址。

因此，为了让 CNAME 记录正常工作，必须保证目标主机名的 DNS 配置正确，包括正确的 A 记录或 AAAA 记录、适当的负载均衡策略等等。在上述例子中，你需要信任 AWS 的 DNS 服务，并相信它会返回可用的 IP 地址列表，以便让 CNAME 记录正常工作。

**能不能将 CNAME 记录和 A 记录结合起来进行完整演示**

当你创建一个 CNAME 记录时，它指向另一个域名，而不是直接指向一个 IP 地址。在很多情况下，被指向的域名需要有对应的 A 记录才能解析到正确的 IP 地址。

以下是一个演示示例：

1. 假设你有一个域名 `example.com`，它的 DNS 服务器为 `ns1.example.com` 和 `ns2.example.com`。
2. 假设你想要为另一个域名 `blog.example.com` 创建一个 CNAME 记录，将它指向另一个域名 `myblog.com`。因此，当用户访问 `blog.example.com` 时，DNS 服务器会返回 `myblog.com` 的 IP 地址。
3. 在这种情况下，`myblog.com` 域名需要有对应的 A 记录，以便 DNS 服务器可以解析它的 IP 地址。
4. 假设 `myblog.com` 的 IP 地址为 `192.0.2.1`。为了让 DNS 服务器返回正确的 IP 地址，你需要在 `myblog.com` 的 DNS 配置中添加一个 A 记录，指向这个 IP 地址。因此，在 `myblog.com` 的 DNS 配置中添加一个名为 `blog` 的 A 记录，它的值为 `192.0.2.1`。
5. 然后，在 `example.com` 的 DNS 配置中，添加一个 CNAME 记录，将 `blog.example.com` 指向 `myblog.com`。这样，当用户访问 `blog.example.com` 时，DNS 服务器会返回 `myblog.com` 的 IP 地址，然后用户可以访问 `myblog.com`。

请注意，这只是一个示例，并不是一个完整的配置过程，实际的过程可能因为使用的 DNS 服务提供商或其他因素而有所不同。因此，在进行配置时，请仔细阅读 DNS 服务提供商的文档，以确保正确地配置了 CNAME 记录和对应的 A 记录。

**代码示例呢**

这里是一个示例，假设你要将 `blog.example.com` 指向 `myblog.com`，`myblog.com` 对应的 IP 地址为 `192.0.2.1`。在这个示例中，我们使用 AWS Route53 作为 DNS 服务提供商。

1. 登录 AWS 控制台，并选择 Route53 服务。

2. 在左侧导航栏中选择你要管理的域名，然后选择 `Create Record` 按钮。

3. 在 `Create Record` 页面中，选择 `CNAME` 记录类型，并填写以下信息：

   - Name: `blog.example.com`
   - Value: `myblog.com`
   - TTL: 根据需要设置，例如 `300`。

   然后，选择 `Create records` 按钮创建 CNAME 记录。

4. 返回域名列表页面，选择 `myblog.com` 域名，然后选择 `Create Record` 按钮。

5. 在 `Create Record` 页面中，选择 `A` 记录类型，并填写以下信息：

   - Name: `blog`
   - Value: `192.0.2.1`
   - TTL: 根据需要设置，例如 `300`。

   然后，选择 `Create records` 按钮创建 A 记录。

现在，`blog.example.com` 将指向 `myblog.com` 的 IP 地址 `192.0.2.1`。

- **在第五步中，是不是应为 Name: myblog.com，而不是 Name: blog**

  - 非常抱歉，是我在上一个回答中写错了。第五步中应该将 Name 设置为 `myblog.com`，而不是 `blog`。非常感谢您指出这个错误。

    以下是更正后的第五步：

    5. 在 `Create Record` 页面中，选择 `A` 记录类型，并填写以下信息：

    - Name: `myblog.com`
    - Value: `192.0.2.1`
    - TTL: 根据需要设置，例如 `300`。

    然后，选择 `Create records` 按钮创建 A 记录。



# TXT

- 对域名进行标识和说明的一种方式
- 一般做验证记录时会使用此项
- 如：SPF（反垃圾邮件）记录，https验证等

## TXT 配置范例

```
_dnsauth TXT 2012011200000051qgs69bwoh4h6nht4n1h0lr038x
```





# SRV

- SRV记录是[DNS服务器](https://baike.baidu.com/item/DNS服务器/8079460?fromModule=lemma_inlink)的数据库中支持的一种[资源记录](https://baike.baidu.com/item/资源记录/6024505?fromModule=lemma_inlink)的类型，它记录了哪台计算机提供了哪个服务这么一个简单的信息。

[SRV记录 - DNS学习笔记 (skyao.io)](https://skyao.io/learning-dns/dns/record/srv.html)
