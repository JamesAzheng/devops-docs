---
title: "DNS"
---

# K8s 中的 DNS 解析流程
```txt
Pod → 本节点 nodelocaldns → CoreDNS → 外部上游
```
- 本节点 nodelocaldns 为容器 /etc/resolv.conf 文件中 nameserver 所定义的 IP

# nodelocaldns
每个 Node 上会以 DaemonSet 形式运行一个 nodelocaldns（本地 DNS 缓存代理）

该 Pod 监听地址通常为 `169.254.25.10:53` 以及 `::ffff:169.254.25.10:53`
- 该 IP 源自于 kubelet 的配置参数

这个本地缓存代理再把请求向上游转发（上游通常就是 CoreDNS 的 ClusterIP）

# CoreDNS
- CoreDNS 是 k8s 的核心插件，提供了 DNS 和 Serviec Discover 功能；
- Serviec Discover 可以动态发现 endpoint 中的 pod 列表，从而实现动态添加和删除相关解析记录。
- CoreDNS 将传统的DNS服务直接提供一个云原生解决方案，他支持从apiserver动态加载相关的service及端点信息，并自动生成资源记录。


```sh
# kubectl get pod -n kube-system -l k8s-app=kube-dns
NAME                       READY   STATUS    RESTARTS       AGE
coredns-65c54cc984-8sfk8   1/1     Running   35 (43h ago)   104d
coredns-65c54cc984-fpv5f   1/1     Running   35 (43h ago)   104d

# kubectl describe svc -n kube-system kube-dns 
Name:              kube-dns
Namespace:         kube-system
Labels:            k8s-app=kube-dns
                   kubernetes.io/cluster-service=true
                   kubernetes.io/name=CoreDNS
Annotations:       prometheus.io/port: 9153
                   prometheus.io/scrape: true
Selector:          k8s-app=kube-dns
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.96.0.10 # 默认为10.96.0.10
IPs:               10.96.0.10
Port:              dns  53/UDP
TargetPort:        53/UDP
Endpoints:         10.244.0.74:53,10.244.0.75:53
Port:              dns-tcp  53/TCP
TargetPort:        53/TCP
Endpoints:         10.244.0.74:53,10.244.0.75:53
Port:              metrics  9153/TCP
TargetPort:        9153/TCP
Endpoints:         10.244.0.74:9153,10.244.0.75:9153
Session Affinity:  None
Events:            <none>
```

**参考文档：**

- https://github.com/coredns/coredns
- https://coredns.io/



## 配置文件

```sh
# kubectl get configmap coredns -n kube-system -o yaml
apiVersion: v1
data:
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf {
           max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
kind: ConfigMap
...
```

1. CoreDNS 监听地址和端口： CoreDNS 配置文件中的 `.:53` 指定了 CoreDNS 的监听地址和端口。这表示 CoreDNS 将监听默认的 DNS 端口 53，以接收 DNS 查询请求。
2. 健康检查和就绪状态： 配置中的 `health` 块定义了健康检查相关的配置，其中 `lameduck 5s` 表示在关闭 CoreDNS 之前等待 5 秒钟，以确保正在进行的 DNS 查询能够完成。`ready` 表示 CoreDNS 将提供就绪状态检查的端点。
3. Kubernetes 集群的 DNS 配置： `kubernetes` 块定义了对 Kubernetes 集群的 DNS 配置。**其中的 `cluster.local` 是默认的域名后缀，用于解析集群内的服务和 Pod。**`pods insecure` 表示可以通过直接使用 Pod 名称进行 DNS 查询，而不需要完全限定的域名。`fallthrough in-addr.arpa ip6.arpa` 表示对于逆向 DNS 查询（反向解析），将继续使用 `in-addr.arpa` 和 `ip6.arpa` 域名。`ttl 30` 表示 DNS 解析结果的 TTL（Time to Live）为 30 秒。
4. Prometheus 指标暴露： `prometheus :9153` 表示 CoreDNS 将在端口 9153 上暴露 Prometheus 指标，以供监控和指标收集。
5. DNS 解析的转发： `forward . /etc/resolv.conf` 表示 CoreDNS 将对于除了本地区域的 DNS 查询请求转发到 `/etc/resolv.conf` 文件中指定的上游 DNS 服务器。`max_concurrent 1000` 表示最大并发转发请求数为 1000。
6. DNS 缓存和其他功能： `cache 30` 表示启用 DNS 缓存，并设置缓存的 TTL 为 30 秒。`loop` 表示启用 DNS 循环查询，以支持循环引用的 DNS 配置。`reload` 表示启用动态配置重载。`loadbalance` 表示启用负载均衡功能。



## 默认资源记录类型

- CoreDNS 对于每个Service对象，都会具有以下3个类型的DNS资源记录。

### A & AAAA

- 根据 ClusterIP 的地址类型，为 IPv4 生成 A 记录，为 IPv6 生成 AAAA 记录；
- service_name --> service_ip

```sh
# A
<service>.<ns>.svc.<zone>. <ttl>  IN  A  <cluster-ip>

# AAAA
<service>.<ns>.svc.<zone>. <ttl> IN AAAA <cluster-ip>
```

**范例：**

- 环境说明

```sh
# kubectl describe service demoapp-svc 
Name:              demoapp-svc
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=demoapp
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.99.152.124
IPs:               10.99.152.124
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         10.244.1.13:80,10.244.1.14:80,10.244.1.15:80
Session Affinity:  None
Events:            <none>


# 在不同的名称空间中创建pod测试
# kubectl create ns testns
namespace/testns created
# kubectl run testpod --image=ikubernetes/demoapp:v1.0 -n testns
pod/testpod created
```

- 测试

```sh
# kubectl exec -it -n testns testpod -- sh


# 获取zone（k8s.xiangzheng.com）
[root@testpod /]# cat /etc/resolv.conf 
nameserver 10.96.0.10
search testns.svc.k8s.xiangzheng.com svc.k8s.xiangzheng.com k8s.xiangzheng.com
options ndots:5


# 测试
[root@testpod /]# nslookup -q=a demoapp-svc.default.svc.k8s.xiangzheng.com
Server:		10.96.0.10
Address:	10.96.0.10#53

Name:	demoapp-svc.default.svc.k8s.xiangzheng.com
Address: 10.99.152.124

[root@testpod /]# curl demoapp-svc.default.svc.k8s.xiangzheng.com
iKubernetes demoapp v1.0 !! ClientIP: 10.244.1.16, ServerName: demoapp-65bc49b76-n8rv9, ServerIP: 10.244.1.15!
[root@testpod /]# curl demoapp-svc.default.svc.k8s.xiangzheng.com
iKubernetes demoapp v1.0 !! ClientIP: 10.244.1.16, ServerName: demoapp-65bc49b76-t782v, ServerIP: 10.244.1.14!
[root@testpod /]# curl demoapp-svc.default.svc.k8s.xiangzheng.com
iKubernetes demoapp v1.0 !! ClientIP: 10.244.1.16, ServerName: demoapp-65bc49b76-c5fst, ServerIP: 10.244.1.13!
[root@testpod /]# curl demoapp-svc.default.svc.k8s.xiangzheng.com


# coredns内部生成的解析记录格式：
demoapp-svc.default.svc.k8s.xiangzheng.com. 30 IN A  10.99.152.124
```



### SRV

- 主要负责端口解析
- 为每个定义了名称的端口生成一个SRV记录，**未命名的端口号则不具有该记录**；

```
_<port>._<proto>.<service>.<ns>.svc.<zone>. <ttl>  IN  SRV  <weight> <priority>  <port-number>  <service>.<ns>.svc.<zone>.
```



### PTR

- service_ip --> service_name
- 对于每个给定的A记录（例如a.b.c.d）或AAAA记录（例如a1a2a3a4:b1b2b3b4:c1c2c3c4:d1d2d3d4:e1e2e3e4:f1f2f3f4:g1g2g3g4:h1h2h3h4）都要生成PTR记录，它们各自的格式如下所示：

```sh
# A
<d>.<c>.<b>.<a>.in-addr.arpa.  <ttl>  IN  PTR <service>.<ns>.svc.<zone>.

# AAAA
h4.h3.h2.h1.g4.g3.g2.g1.f4.f3.f2.f1.e4.e3.e2.e1.d4.d3.d2.d1.c4.c3.c2.c1.b4.b3.b2.b1.a4.a3.a2.a1.ip6.arpa <ttl> IN PTR <service>.<ns>.svc.<zone>.
```

**范例**：
- 环境说明

```sh
# kubectl describe service demoapp-svc 
Name:              demoapp-svc
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=demoapp
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.99.152.124
IPs:               10.99.152.124
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         10.244.1.13:80,10.244.1.14:80,10.244.1.15:80
Session Affinity:  None
Events:            <none>


# 在不同的名称空间中创建pod测试
# kubectl create ns testns
namespace/testns created
# kubectl run testpod --image=ikubernetes/demoapp:v1.0 -n testns
pod/testpod created
```

- 测试

```sh
# kubectl exec -it -n testns testpod -- sh


# 获取zone（k8s.xiangzheng.com）
[root@testpod /]# cat /etc/resolv.conf 
nameserver 10.96.0.10
search testns.svc.k8s.xiangzheng.com svc.k8s.xiangzheng.com k8s.xiangzheng.com
options ndots:5


# 正向解析获取到serviceIP
[root@testpod /]# nslookup -q=a demoapp-svc.default.svc.k8s.xiangzheng.com
Server:		10.96.0.10
Address:	10.96.0.10#53

Name:	demoapp-svc.default.svc.k8s.xiangzheng.com
Address: 10.99.152.124


# 反向解析获取到serviceIP对应的name
[root@testpod /]# nslookup -q=ptr 10.99.152.124
Server:		10.96.0.10
Address:	10.96.0.10#53

124.152.99.10.in-addr.arpa	name = demoapp-svc.default.svc.k8s.xiangzheng.com.


# coredns内部生成的解析记录格式：
124.152.99.10.in-addr.arpa. 30   IN  PTR  demoapp-svc.default.svc.k8s.xiangzheng.com.
```



### 默认行为说明
例如，在 default 名称空间中创建 Service 对象 demoapp-svc 的地址为 10.97.72.1，且为 TCP 协议的 80 端口取名 http，对于默认的 cluster.local 域名来说，此它会拥有如下3个 DNS 资源记录。

```sh
# A记录：
demoapp-svc.default.svc.cluster.local. 30 IN A  10.97.72.1

# SRV记录：
_http._tcp.demoapp-svc.default.svc.cluster.local. 30 IN SRV 0 100 80 demoapp-svc.default.svc.cluster.local.

# PTR记录：
1.72.97.10.in-addr.arpa. 30     IN      PTR     demoapp-svc.default.svc.cluster.local.
```




## 注意事项
**CoreDNS配置文件中的转发策略（forward XXX{XXX}）一定要指向企业内部的DNS服务器，而非公网的DNS，否则一些内网域名将无法解析**
- 如：数据库存放在外部，而数据的访问都是从企业内部的DNS服务器来进行名字解析从而进行访问的

# FAQ
## 如何查询K8s集群域名？
- 大多数的集群域名为 `cluster.local`，如不确定，可通过以下方式查看：
```sh
# 方法一：通过 CoreDNS 的 ConfigMap 查看
$ kubectl -n kube-system get cm coredns -o jsonpath='{.data.Corefile}'
.:53 {
    errors
    health {
       lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa { # cluster.local 就是集群域名。
       pods insecure
       fallthrough in-addr.arpa ip6.arpa
       ttl 30
    }
    prometheus :9153
    forward . /etc/resolv.conf {
       max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}

# 方法二：查看某个 Pod 中的 resolv.conf 文件
$ kubectl exec -n harbor harbor-nginx-5ff8c5896d-69sjh -- cat /etc/resolv.conf
nameserver 169.254.25.10
search harbor.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```


## 如何通过域名访问 service？
```sh
# 域名格式如下：
<service_name>.<namespace>.svc.<zone> # <zone>为集群本地域名，例如 cluster.local，例如 prometheus-server.monitoring.svc.cluster.local 


# 验证方式
$ nslookup prometheus-server.monitoring.svc.cluster.local $(kubectl get svc -n kube-system  | grep coredns | awk '{print $3}')
Server:		10.233.0.3
Address:	10.233.0.3#53

Name:	prometheus-server.monitoring.svc.cluster.local
Address: 10.233.11.201

$ kubectl get svc -n monitoring  | grep prometheus-server
prometheus-server                                NodePort    10.233.11.201   <none>        80:30036/TCP        642d
```
