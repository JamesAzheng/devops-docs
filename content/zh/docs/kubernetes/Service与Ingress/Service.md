---
title: "Service"
---

# Service 概述

https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/

- Service 是 kubernetes 内部的负载均衡，名称空间级别资源；
- Pod 在重建后IP地址会发生变化，而使用 Service 来实现对 Pod 的访问就不会受到影响
- Service 与其后端 Pod 副本集群之间则是通过 Label Selector 实现关联。
- 每个 service 都有一个独立的子网；





## kube-proxy & Service

kube-proxy 和 Service 的关系：

- kube-proxy 通过 k8s-apiserver 监听着 service ，一旦 service 资源发生变化，kube-proxy 就会生成对应的负载调度的调整（添加 或 删除 iptables 或 ipvs规则），从而保证 service 处于最新状态







# Service 代理模式

## Userspace

- 早期方式，性能较差



## iptables

- iptables代理模式下的ClusterIP，每个Service在每个节点上（由kube-proxy负责生成）都会生成相应的iptables规则



### 设置为 iptables 代理模式

- 默认就是 iptables 代理模式



### iptables 代理模式工作原理

#### KUBE-SERVICES

包含所有ClusterIP类型的Service的流量匹配规则，由PREROUTING和OUTPUT两个内置链直接调用；每个Service对象包含两条规则定义，对于所有发往该Service（目标IP为Service_IP且目标端口为Service_Port）的请求报文，前一条用于为那些非源自Pod网络（! -s 10.244.0.0/16）中请求报文借助于KUBE-MARQ-MASK自定义链中的规则打上特有的防火墙标记，后一条负责将所有报文转至专用的以KUBE-SVC为名称前缀的自定义链，后缀是Service信息hash值。

#### KUBE-NODEPORTS

- xxx

#### KUBE-MARK-MASQ

专用目的自定义链，所有转至该自定义链的报文都将被置入特有的防火墙标记（0x4000）以便于将特定的类型的报文定义为单独的分类，目的在将该类报文转发到目标端点之前由POSTROUTING规则链进行源地址转换。

#### KUBE-SVC-\<HASH>

定义一个服务的流量调度规则，它通过随机调度算法（RANDOM）将请求分发给该Service的所有后端端点，每个后端端点定义在以KUBE-SEP为前缀名称的自定链上，后缀是端点信息的hash值。

#### KUBE-SEP-\<HASH>

定义一个端点相关的流量处理规则，它通常包含两条规则，前一条用于为那些源自该端点自身（-s ep_ip）的请求流量调用自定义链KUBE-MARQ-MASK打上特有的防火墙标记，后一条负责将发往该端点的所有流量进行目标IP地址和端口转换，新目标为该端点的IP和端口（-j DNAT --to-destination ep_ip:ep_port）。

#### KUBE-POSTROUTING

专用的自定义链，由内置链POSTROUTING无条件调用，负责将拥有特有防火墙标记0x4000的请求报文进行源地址转换（Target为实现地址伪装的MASQUERADE），新的源地址为报文离开协议栈时流经接口的主IP（primary ip）地址。 



## ipvs

- ipvs 会处于 NAT 工作模型，而非传统默认的 DR 模型
- 会在每个节点上创建一个名为kube-ipvs0的虚拟接口，并将集群所有Service对象的ClusterIP和ExternalIP都配置在该接口；
- kube-proxy 会为每个 Service 生成一个虚拟服务器（Virtual Server）的定义；
- ipvs 代理模式下也需要借助少量的 iptables 规则来完成源地址转换等功能。



### 设置为 ipvs 代理模式

- **注意：一定要在集群初始化完成后设置为 ipvs 代理模式，以避免出现问题**

```yaml
# kubectl get configmaps -n kube-system 
NAME                                 DATA   AGE
...
kube-proxy                           2      2d16h # 修改此项configmap
...


# kubectl edit configmaps -n kube-system kube-proxy
...
    iptables:
      masqueradeAll: false
      masqueradeBit: null
      minSyncPeriod: 0s
      syncPeriod: 0s
    ipvs:
      excludeCIDRs: null
      minSyncPeriod: 0s
      scheduler: "" # 调度算法，默认轮询
      strictARP: false
      syncPeriod: 0s
      tcpFinTimeout: 0s
      tcpTimeout: 0s
      udpTimeout: 0s
    kind: KubeProxyConfiguration
    metricsBindAddress: ""
    mode: "ipvs" # 默认为空，表示使用的是iptables代理模式
...


# 保存退出后显示次结果表示修改成功
configmap/kube-proxy edited


# kube-proxy 需重建后才能生效
# kubectl get pod -n kube-system 
NAME                                   READY   STATUS    RESTARTS      AGE
...
kube-proxy-79gw9                       1/1     Running   3 (42h ago)   2d15h
kube-proxy-dr7l5                       1/1     Running   2 (42h ago)   2d16h
...


# 重建 kube-proxy，生产环境修改的话需要一个一个删除然后由k8s自动重建，这里采用标签选择的方式全部删除重建
# 获取标签
# kubectl get pod -n kube-system --show-labels
...
# 全部重建
# kubectl delete pod -n kube-system  -l k8s-app=kube-proxy
pod "kube-proxy-79gw9" deleted
pod "kube-proxy-dr7l5" deleted
# 查看是否重建成功
# kubectl get pod -n kube-system  -l k8s-app=kube-proxy
NAME               READY   STATUS    RESTARTS   AGE
kube-proxy-l9qnk   1/1     Running   0          13s
kube-proxy-wpjtz   1/1     Running   0          12s


# 生成的接口
# ifconfig kube-ipvs0
kube-ipvs0: flags=130<BROADCAST,NOARP>  mtu 1500
        inet 10.96.0.10  netmask 255.255.255.255  broadcast 0.0.0.0
        ether be:6f:c3:98:dc:d1  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0


# 选择一个node节点查看ipvs规则生成情况
root@k8s-node-1:~# apt-get install ipvsadm
...
# node节点情况
root@k8s-node-1:~# ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  10.96.0.1:443 rr
  -> 10.0.0.100:6443              Masq    1      0          0         
TCP  10.96.0.10:53 rr
  -> 10.244.0.6:53                Masq    1      0          0         
  -> 10.244.0.7:53                Masq    1      0          0         
TCP  10.96.0.10:9153 rr
  -> 10.244.0.6:9153              Masq    1      0          0         
  -> 10.244.0.7:9153              Masq    1      0          0         
UDP  10.96.0.10:53 rr
  -> 10.244.0.6:53                Masq    1      0          0         
  -> 10.244.0.7:53                Masq    1      0          0         

# 控制端查看service
# kubectl get service -A
NAMESPACE     NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
default       kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP                  2d16h
kube-system   kube-dns     ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   2d16h
```



### ipvs 代理模式工作原理

- 客户端首先会向`kube-ipvs0`虚拟接口发起请求，





# Service FQDN

在 Kubernetes 中，Service FQDN（Fully Qualified Domain Name）是用于访问 Kubernetes Service 的完全限定域名。

每个 Kubernetes Service 都会被分配一个唯一的域名，其格式为 `<service-name>.<namespace>.svc.<cluster-domain>`，其中：

- `<service-name>` 是 Service 的名称，用于唯一标识该服务。
- `<namespace>` 是 Service 所属的命名空间。如果 Service 不在特定命名空间中，则使用默认命名空间 `default`。
- `<cluster-domain>` 是集群的域名，通常为 `cluster.local`。

通过使用 Service FQDN，可以在 Kubernetes 集群内部或外部访问 Service。这种域名解析是通过 Kubernetes 的 DNS 服务来完成的。Kubernetes 的 DNS 服务会将 Service FQDN 解析为 Service 的虚拟 IP 地址，从而将请求转发到相应的后端 Pod。

例如，如果有一个名为 "my-service" 的 Service，位于命名空间 "my-namespace" 中，并且集群的域名为 "cluster.local"，那么该 Service 的 FQDN 将为 "my-service.my-namespace.svc.cluster.local"。

使用 Service FQDN，其他应用程序或服务可以通过这个域名来访问和与 Kubernetes Service 进行通信，而无需直接使用底层的 IP 地址。这提供了一种抽象层，使得服务的位置和可用性可以在不改变调用方代码的情况下进行更改和管理。

## 获取集群的域名

- 获取 \<cluster-domain>


```sh
kubectl get configmap coredns -n kube-system -o yaml | grep kubernetes | awk '{print $2}'
```



## demo

- grafana 与 Prometheus 均部署在 k8s 中时，例如可通过以下域名添加 Prometheus 数据源

```
http://prometheus-k8s.kubesphere-monitoring-system.svc.cluster.local:9090

http://prometheus-server.prometheus.svc.cluster.local:80
```





**为什么service的域名只能在pod内部解析，而在pod外部无法解析**

在 Kubernetes 中，默认情况下，Service 的域名只能在 Pod 内部进行解析，而在 Pod 外部无法解析。这是因为 Kubernetes 使用了自己的 DNS 服务，通过 Cluster DNS 来解析 Service 的域名。

在 Kubernetes 集群中，每个 Pod 都会自动配置一个 DNS 解析器，该解析器会将 DNS 查询转发到 Cluster DNS 服务进行解析。当 Pod 内部的应用程序尝试解析 Service 的域名时，DNS 解析请求会被发送到 Cluster DNS，并返回与该 Service 相关联的 IP 地址。这样，Pod 内部的应用程序可以使用 Service 的域名来访问其他 Pod 或 Service。

然而，在 Pod 外部（例如集群外部）进行 DNS 解析时，默认情况下无法直接解析 Service 的域名。这是因为 Service 的域名是 Kubernetes 内部定义的，外部的 DNS 服务器并不知道如何解析这些域名。

要在 Pod 外部解析 Service 的域名，通常有以下几种方式：

1. 使用完全限定域名（FQDN）： 可以使用 Service 的完全限定域名（FQDN）来解析，包括 Service 名称、命名空间和集群域名后缀。例如，`<service-name>.<namespace>.svc.cluster.local`。需要确保 DNS 解析请求能够到达 Kubernetes 集群的 DNS 服务器，以进行解析。
2. 使用外部 DNS 解析方案： 可以配置外部的 DNS 解析方案，将 Service 的域名映射到相应的 IP 地址。例如，可以通过配置外部的 DNS 服务器或 DNS 转发规则，将 Service 的域名映射到相应的 Cluster IP 地址。
3. 使用 Ingress 控制器： Ingress 是 Kubernetes 的一种资源类型，用于将外部流量路由到集群内的 Service。Ingress 控制器通常会提供自己的 DNS 解析功能，可以将 Ingress 规则中定义的域名解析到相应的 Service。

需要注意的是，具体的解决方案可能因 Kubernetes 发行版、网络插件和集群配置而有所不同。以上提供的方法只是一些常见的解决方案，您可以根据实际情况选择合适的方式来实现在 Pod 外部解析 Service 的域名。



# ---

# Service Explain

```yaml
apiVersion: v1
kind: Service
metadata:
  name: …
  namespace: …
  labels:
    key1: value1
    key2: value2
spec:
  type <string>   # Service类型，默认为ClusterIP
  selector <map[string]string>  # 等值类型的标签选择器，内含“与”逻辑
                                # 注意：Service 资源的 selector 只有基于等式的
  ports：  # Service的端口对象列表
  - name <string>  # 端口名称
    protocol <string>  # 协议，目前仅支持TCP、UDP和SCTP，默认为TCP
    port <integer>  # Service的端口号
    targetPort  <string>  # 后端目标进程的端口号或名称，名称需由Pod规范定义
    nodePort <integer>  # 节点端口号，仅适用于NodePort和LoadBalancer类型
  clusterIP  <string>  # Service的集群IP，建议由系统自动分配
  externalTrafficPolicy  <string> # 外部流量策略处理方式，Local表示由当前节点处理，Cluster表示向集群范围调度，默认为Cluster，注意：如果选择为Local 则当当前节点pod宕机时访问可能出现问题
  loadBalancerIP  <string>  # 外部负载均衡器使用的IP地址，仅适用于LoadBlancer，即只能对接Iaas平台提供的负载均衡
  externalName <string>  # 外部服务名称，该名称将作为Service的DNS CNAME值
```

## port

- port 是 Service 自身监听的端口；
- 而且如果后端Pod有多个端口，并且每个端口都想通过Service暴露的话，每个都要单独定义。**(最终接收请求的是PodIP和containerPort**)
- `Service.spec.ports.port`



# selector

- service的标签选择器，选择要访问的目标pod；
- selector 可以基于单个标签，也可以基于多个标签，**多个标签时必须全部匹配才能生效**
  - 需等于 `Deployment.spec.template.metadata.labels`
- **注意：因为 service 是名称空间级别资源，所以 selector 在选择时不能跨 namespace 匹配**
- `Service.spec.selector`

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: app1
  name: app1-nginx
  labels:
    app: app1-nginx
spec:
  selector:
    # 同时满足以下标签的Pod会成为该service的后端
    app: app1-nginx-deployment-label
    version: v1
...
```



# type

- 定义service的类型
- `Service.spec.type`

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: app1
  name: app1-nginx
  labels:
    app: app1-nginx
spec:
  selector:
    app: app1-nginx-deployment-label
    version: v1
  type: ClusterIP # ClusterIP、NodePort、ExternalName、LoadBalancer
...
```



## ClusterIP

- ClusterIP 是默认的 Service 类型，会分配一个仅提供集群内部访问的 IP（该地址仅在集群内部可见、可达，它无法被集群外部的客户端访问）
- 集群内部访问时，访问的是 ClusterIP + Service 的端口

### example

```yaml
kind: Service
apiVersion: v1
metadata:
  name: demoapp-svc
  namespace: default
spec:
  type: ClusterIP # 通常无需指定因为默认既是ClusterIP
  clusterIP: 10.97.72.1 # ClusterIP 的 IP 可以自定义，但通常由 K8S 动态分配
  selector:
    app: demoapp
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 80
```



## NodePort

- NodePort 是 ClusterIP 的增强版，除了会分配 ClusterIP，还会在每个节点上打开一个固定端口对外提供访问，端口可以自行指定，也可以不指定，然后由Service自行分配，默认端口的分配范围在30000 ~ 32767之间
- 集群外部访问时，访问的是 节点IP + NodePort，（集群内部访问时，访问的是 ClusterIP + Service的端口）
- --

- NodePort 是 ClusterIP 的增强类型
- NodePort 类型的 Service 默认会分配 ClusterIP 和 NodePort
  - 集群内部通过 ClusterIP + ServicePort 进行通信，最后请求到达 PodIP + targetPort
  - 集群外部通过 NodeIP + NodePort 进行通信，最后请求到达 PodIP + targetPort
- NodePort 会**在每个节点上使用一个相同的端口号将外部流量引入到该 Service 上来。**
  - 端口号不定义则由 K8S 动态分配；也可以通过nodePort手动指定
    - 端口号默认范围：30000 ~ 32767（可以通过二进制安装来指定更大的端口范围）
  - 但这个对外的端口只能从外部客户端或集群节点上进行访问 ，**Pod内部无法访问**
- **客户端可以访问任意节点的 NodePort，最终请求都会被转发到对应的 service**
  - 客户端只访问单一节点会有单点失败的可能，因此通常在使用 NodePort 的 service 类型时会使用外部负载均衡器的方式将流量进行转发。例如：Haproxy
    - 在私有云环境中，如果 SLB 使用的是 Haproxy，可以将 Haproxy 的后端定义为 NodePort 类型的 Service，然后客户端通过 Haproxy 这个同一的入口进行访问
    - 是的，在私有云环境中，如果使用的负载均衡器是 Haproxy，可以将 Haproxy 的后端定义为 NodePort 类型的 Service。这样，在客户端想要访问 Kubernetes 中的某个 Service 时，可以通过访问 Haproxy 这个同一的入口进行访问。具体地，可以通过配置 Haproxy 的监听器来将客户端的请求路由到 Kubernetes 集群中相应的 NodePort 上，从而实现对 Service 的访问。这种方式相对于直接访问 Kubernetes 中的 Service，可以提供更好的可用性和扩展性，同时也可以通过 Haproxy 进行一些负载均衡的优化和控制。
- 但是不建议直接使用 NodePort 暴露服务，而是使用 Ingress 或 LoadBalancer。

### example

```yaml
kind: Service
apiVersion: v1
metadata:
  name: demoapp-nodeport-svc
spec:
  type: NodePort
  clusterIP: 10.97.56.1
  selector:
    app: demoapp
  ports:
  - name: http
    protocol: TCP
    port: 80 # service的端口，集群内部提供服务
    targetPort: 80
    nodePort: 30080 # nodePort的端口，集群外部提供服务
  # externalTrafficPolicy: Local
```



## LoadBalancer

- LoadBalancer 是 NodePort 的增强类型
- 要借助于底层IaaS云服务上的LBaaS产品来按需管理LoadBalancer。

- **使用云提供商的负载均衡器向外部暴露服务。 外部负载均衡器可以将流量路由到自动创建的 NodePort 服务和 ClusterIP 服务上。**
- 需要在 spec.status.loadBalancer 字段指定外部负载均衡器的IP地址，通常用于公有云。

### example

```yaml
kind: Service
apiVersion: v1
metadata:
  name: demoapp-loadbalancer-svc
spec:
  type: LoadBalancer
  selector:
    app: demoapp
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 80
  loadBalancerIP: 1.2.3.4
```



## ExternalName

- service_name --> CNAME，对应的是外部服务的名称，该服务要能在外部 DNS 服务中被解析(外部服务指的是互联网上的DNS服务器)；
- 借助集群上KubeDNS来实现，服务的名称会被解析为一个CNAME记录，而CNAME名称会被DNS解析为集群外部的服务的IP地址；
- 表示服务只包含对kubedns或同等名称将作为CNAME记录返回的外部名称，没有暴露或代理任何涉及的pod，通过返回 CNAME 和对应值，可以将服务映射到 externalName 字段的内容（例如，foo.bar.example.com）。 无需创建任何类型代理。
- **这种Service既不会有ClusterIP，也不会有NodePort，也不需要标签选择器；**
- --
- ExternalName 是一种将 Service 映射到 DNS 名称的类型。该类型的 Service 可以将 Service 映射到集群外部的服务地址，但是只支持 TCP 和 UDP 协议。
- 这种类型的Service允许通过DNS CNAME记录将Service映射到一个外部域名。这种类型的Service通常被用于将集群内部的服务映射到集群外部的服务。
- 应用场景：例如 pod 需要 k8s 集群外部的 MySQL

### example

```yaml
kind: Service
apiVersion: v1
metadata:
  name: externalname-redis-svc
  namespace: default
spec:
  type: ExternalName
  externalName: redis.ik8s.io
  ports:
  - protocol: TCP
    port: 6379
    targetPort: 6379
    nodePort: 0
  selector: {}
```



### example-2

ExternalName 类型的 Service 可以将 Kubernetes 内部的 Service 映射到外部 DNS 的 CNAME 记录。具体来说，使用 ExternalName 类型的 Service 可以将一个 Kubernetes 中的 Service 绑定到一个外部 DNS 的 CNAME 记录上，**从而实现将 Kubernetes 中的服务通过外部域名访问。**

使用 ExternalName 类型的 Service 非常简单，只需要在 Service 的定义中将 type 设置为 ExternalName，并指定 externalName 参数为外部 DNS 的 CNAME 记录即可。例如，下面是一个 ExternalName 类型的 Service 的定义示例：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ExternalName
  externalName: my.external.domain.com
```

在上面的示例中，Service 的名称为 my-service，类型为 ExternalName，externalName 参数指定了外部 DNS 的 CNAME 记录为 my.external.domain.com。

使用 ExternalName 类型的 Service 时，Kubernetes 集群内部的 Pod 可以通过 Service 名称来访问外部 DNS 的 CNAME 记录所对应的服务，从而实现通过外部域名访问 Kubernetes 中的服务。

外部客户端也可以直接通过外部 DNS 的 CNAME 记录来访问 Kubernetes 中的服务。需要注意的是，ExternalName 类型的 Service 只能用于将服务映射到外部 DNS 的 CNAME 记录，不能将服务映射到外部 IP 地址或端口上。



### example-3

ExternalName：将 Service 映射到外部 DNS 的 CNAME 记录当中

是的，ExternalName 是 Kubernetes 中的一种 Service 类型，可以将 Service 对象映射到外部 DNS 的 CNAME 记录当中，以便将来可以通过 Service 名称来访问该外部服务。

具体地说，ExternalName Service 会创建一个 Kubernetes Service 对象，该对象的规范名称（Spec.Name）就是该 Service 的名称，而规范类型（Spec.Type）则为 ExternalName。该 Service 的端口（Spec.Ports）没有实际意义，仅用于显示。而该 Service 的规范细节（Spec.ExternalName）指向一个外部服务的 DNS 名称，例如 `mydatabase.external.com`。当使用该 Service 名称来进行访问时，Kubernetes 将通过 DNS 解析查找该服务对应的 IP 地址，然后将请求转发到该 IP 地址对应的服务器上。

使用 ExternalName Service 可以很方便地将集群内部服务与外部服务进行集成。例如，如果你的应用程序需要连接到一个外部的数据库服务，可以使用 ExternalName Service 将该数据库服务映射到一个 Service 名称，然后在应用程序中使用该名称来进行连接。这样，即使该数据库服务的 IP 地址发生变化，也不需要修改应用程序的配置文件，因为 Kubernetes 会自动更新 DNS 记录。



好的，我可以举一个具体的例子来演示 ExternalName Service 的使用。

假设你有一个 Web 应用程序，需要连接到一个外部的 MySQL 数据库服务。该数据库服务的 DNS 名称为 `mysql.external.com`，IP 地址为 `10.10.20.30`。现在你希望通过 Kubernetes 中的 Service 对象来访问该数据库服务，而不需要在应用程序中硬编码该数据库的 IP 地址。

首先，你需要创建一个 ExternalName Service 对象，如下所示：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-external
spec:
  type: ExternalName
  externalName: mysql.external.com
```

在上述 YAML 文件中，我们创建了一个名为 `mysql-external` 的 ExternalName Service，将其指向外部 MySQL 服务的 DNS 名称 `mysql.external.com`。

接下来，你可以在 Web 应用程序中使用该 Service 名称来连接 MySQL 数据库，而不是直接使用该数据库的 IP 地址。例如，在 Node.js 中，你可以使用以下代码来连接 MySQL 数据库：

```js
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'mysql-external',
  user: 'root',
  password: 'password',
  database: 'mydatabase'
});
```

在上述代码中，我们使用了 ExternalName Service 的名称 `mysql-external` 来连接 MySQL 数据库，而不是使用其 IP 地址。Kubernetes 会自动将该名称解析为 MySQL 服务的 IP 地址，并将请求转发到该 IP 地址对应的服务器上。

需要注意的是，ExternalName Service 仅适用于访问外部服务，不能用于访问集群内部的其他 Service 或 Pod。如果你需要访问集群内部的服务，应该使用 ClusterIP、NodePort 或 LoadBalancer 类型的 Service。



**ExternalName 类型的 Service 是不是只能用于集群内部访问集群外部的服务，而不能使集群外部访问集群内部**

是的，ExternalName 类型的 Service 只能用于集群内部访问集群外部的服务，而不能使集群外部访问集群内部。因为 ExternalName 类型的 Service 只会返回一个外部服务的 DNS 名称，而不是一个 IP 地址。这意味着当外部请求访问这个 Service 时，它们将无法直接通过 IP 地址访问到后端服务，因为该 IP 地址不存在于集群内部。

如果你需要让集群外部的客户端访问集群内部的服务，可以考虑使用 NodePort 或者 LoadBalancer 类型的 Service。这些类型的 Service 都会暴露一个固定的 IP 地址和端口，用于接收来自集群外部的请求，并将请求转发到后端服务。这些 Service 类型可以用于实现对外公开的服务，例如 Web 应用程序、API 服务等。



# clusterIP

**Service.spec.clusterIP**

- clusterIP 可以为 service 设置自定义的IP地址，但通常无需指定，而是由service自动进行配置；
- clusterIP 更多的使用场景是将其定义为 None，进而成为Headless Service，即无头服务；

```yaml
apiVersion: v1
kind: Service
...
spec:
...
  clusterIP: None # Headless Service，因为 type 默认就是 ClusterIP，所以不用指定
...
```

## Headless Service

- 又称无头服务，**在不需要使用Service提供的默认负载均衡的功能 以及 单独的 Service IP 的情况下**，可以通过指定 `spec.clusterIP`的值为 `"None"` 来创建 Headless Service；
- 可以仅通过Label Selector将后端的Pod列表返回给调用的客户端；
- headless service 关联的每个 endpoint(Pod实际的IP)，都会有对应的DNS域名，Pod之间可以通过独有的域名互相访问；
  - **其实就是实现了与 Pod 与 Pod 间直接通信，而不通过 service 这层负载均衡**
  - **ping 无头服务 service 域名的时候返回的是Pod真实的IP，而 ping 普通 service 域名时返回的将是 service 的 IP**
  - 说白了就是无头服务不会分配 Cluster IP，从而使该 Service 中的 Pod 可以直接通过 IP或 域名来进行通信（通常是使用域名来通信）
  
- headless services 一般结合 StatefulSet来部署有状态的应用，例如：kafka集群，mysql集群，zookeeper集群等



### 范例

- 注意：此处使用Deployment进行演示，但正常多数情况都是使用StatefulSet来部署有状态的应用，并且每个Pod都有一个单独的service以实现独立的解析名称

  - A 记录：

    - ```sh
      # 域名                                    A记录   PodIP
      <a>-<b>-<c>-<d>.<service>.<ns>.svc.<zone>  A     PodIP
      ```

  - PTR 记录：

    - ```sh
      # PodIP                              PTR记录    域名
      <d>.<c>.<b>.<a>.in-addr.arpa.  IN    PTR       <a>-<b>-<c>-<d>.<service>.<ns>.svc.<zone>
      ```

#### 正常 clusterIP

##### yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: ikubernetes/demoapp:v1.0
---
apiVersion: v1
kind: Service
metadata:
  name: demoapp-svc
spec:
  type: ClusterIP
  selector:
    app: demoapp
  ports:
  - port: 80
    targetPort: 80
```

##### 验证

```yaml
# kubectl describe svc demoapp-svc 
Name:              demoapp-svc
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=demoapp
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.100.31.12 # 分配的ClusterIP
IPs:               10.100.31.12
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         10.244.1.17:80,10.244.1.18:80,10.244.1.19:80
Session Affinity:  None
Events:            <none>


# kubectl exec demoapp-5748b7ccfc-22hlj -- nslookup demoapp-svc.default.svc.k8s.xiangzheng.com
Server:		10.96.0.10
Address:	10.96.0.10#53

Name:	demoapp-svc.default.svc.k8s.xiangzheng.com
Address: 10.100.31.12 # 解析出来的是service的ClusterIP
```



#### Headless Service

##### yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: ikubernetes/demoapp:v1.0
---
apiVersion: v1
kind: Service
metadata:
  name: demoapp-svc
spec:
  type: ClusterIP
  clusterIP: None
  selector:
    app: demoapp
  ports:
  - port: 80
    targetPort: 80
```

##### 验证

```yaml
# kubectl describe svc demoapp-svc 
Name:              demoapp-svc
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=demoapp
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                None # 不会分配serviceIP
IPs:               None
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         10.244.1.20:80,10.244.1.21:80,10.244.1.22:80
Session Affinity:  None
Events:            <none>


# 解析出来的是pod的真实IP
# kubectl exec demoapp-5748b7ccfc-bgzsj -- nslookup demoapp-svc.default.svc.k8s.xiangzheng.com
Server:		10.96.0.10
Address:	10.96.0.10#53

Name:	demoapp-svc.default.svc.k8s.xiangzheng.com
Address: 10.244.1.21
Name:	demoapp-svc.default.svc.k8s.xiangzheng.com
Address: 10.244.1.20
Name:	demoapp-svc.default.svc.k8s.xiangzheng.com
Address: 10.244.1.22



# kubectl exec demoapp-5748b7ccfc-bgzsj -- curl demoapp-svc.default.svc.k8s.xiangzheng.com -s
10.244.1.20, ServerName: demoapp-5748b7ccfc-bgzsj, ServerIP: 10.244.1.20!
# kubectl exec demoapp-5748b7ccfc-bgzsj -- curl demoapp-svc.default.svc.k8s.xiangzheng.com -s
10.244.1.20, ServerName: demoapp-5748b7ccfc-qkntg, ServerIP: 10.244.1.21!
# kubectl exec demoapp-5748b7ccfc-bgzsj -- curl demoapp-svc.default.svc.k8s.xiangzheng.com -s
10.244.1.20, ServerName: demoapp-5748b7ccfc-ql8sf, ServerIP: 10.244.1.22!
# kubectl exec demoapp-5748b7ccfc-bgzsj -- curl demoapp-svc.default.svc.k8s.xiangzheng.com -s
10.244.1.20, ServerName: demoapp-5748b7ccfc-ql8sf, ServerIP: 10.244.1.22!
```





# ports

```yaml
apiVersion: v1
kind: Service
...
spec:
...
  ports:
  - name: http
    protocol: HTTP # 协议，目前仅支持TCP、UDP和SCTP，默认为TCP
    port: 80 # service的80端口
    targetPort: 80 # 目标pod内部的端口，默认情况下，targetPort 将被设置为与 port 字段相同的值。
    nodePort: 30080 # 自定义node节点对外暴露的端口，默认为30000-32767之间
```

## example

- 多端口service

```yaml
kind: Service
apiVersion: v1
metadata:
  namespace: app1
  name: app1-nginx
  labels:
    app: app1-nginx-service
spec:
  type: NodePort
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 80
    nodePort: 30080
  # 定义多个
  - name: https
    port: 443
    protocol: TCP
    targetPort: 443
    nodePort: 30043
  selector:
    app: app1-nginx-deployment-label
    version: v1
```



# externalIPs

- externalIPs 可以实现将一个具体的公网或内网 IP 直接绑定在 service 上，以提供一个统一供外部访问的接口，访问这个 IP 时 请求可以转发到每个 node 节点 pod 的 endpoint 上
- **并且每个节点上都会自动生成 externalIPs 定义的 IP 以及对应的 service 端口**
- --
- `externalIPs` 不是 Service 的类型，而是一种在创建 Service 时可以使用的可选字段。`externalIPs` 字段允许将 Service 暴露到指定的外部 IP 地址上。在 Service 中指定 `externalIPs` 后，Kubernetes 会将该 Service 关联的 Endpoints（即 Service 的后端 Pod）与该外部 IP 地址进行绑定。这样，当外部流量访问该 IP 地址时，就会被路由到 Service 的后端 Pod 上。
- 需要注意的是，`externalIPs` 字段只适用于 ClusterIP 类型的 Service，并且这些 IP 地址必须存在于集群的某个节点上。

## example - 1 

```yaml
kind: Service
apiVersion: v1
metadata:
  name: demoapp-svc
  namespace: default
spec:
  type: ClusterIP # 也可以定义为 NodePort 进而实现外部访问 externalIP 或 NodePort 都可以
                  # 注意：在设置 externalIPs 后 type: 不能为 LoadBalancer
  selector:
    app: demoapp
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 80
  externalIPs: # 列表格式，可以定义多个
  - '10.0.0.168'
```

### test

```yaml
# kubectl describe svc demoapp-svc 
Name:              demoapp-svc
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=demoapp
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.109.71.156
IPs:               10.109.71.156
External IPs:      10.0.0.168
Port:              http  80/TCP
TargetPort:        80/TCP
Endpoints:         10.244.1.91:80,10.244.1.92:80,10.244.2.35:80
Session Affinity:  None
Events:            <none>


# curl 10.0.0.168
iKubernetes demoapp v1.0 !! ClientIP: 10.244.0.0, ServerName: demoapp-65bc49b76-cj6lw, ServerIP: 10.244.1.92!


# 并且每个节点上都会自动生成10.0.0.168的IP以及80端口（80端口对应的是service的80端口）
#root@k8s-master-1:~# ss -ntl | grep 168 ; ip a | grep 168
LISTEN  0        4096          10.0.0.168:80             0.0.0.0:*              
    inet 10.0.0.168/32 scope global kube-ipvs0
#root@k8s-node-1:~# ss -ntl | grep 168 ; ip a | grep 168
LISTEN  0        4096          10.0.0.168:80             0.0.0.0:*              
    inet 10.0.0.168/32 scope global kube-ipvs0
#root@k8s-node-2:~# ss -ntl | grep 168 ; ip a | grep 168
LISTEN  0        4096          10.0.0.168:80             0.0.0.0:*              
    inet 10.0.0.168/32 scope global kube-ipvs0
```

## example - 2

### yaml

```yaml
# vim recommended.yaml
...
---

kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
spec:
  ports:
    - port: 443
      targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard
  externalIPs: # 列表格式，可以定义多个
  - '10.0.0.168'
---
...
```

### 验证

- 当客户端访问 https://10.0.0.168/ 时，会通过ipvs规则转发到 10.244.1.220:8443  这个实际Pod的IP上

```sh
# kubectl get svc -n kubernetes-dashboard kubernetes-dashboard 
NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
kubernetes-dashboard   ClusterIP   10.102.14.235   10.0.0.168    443/TCP   5m40s


# kubectl get ep -n kubernetes-dashboard kubernetes-dashboard 
NAME                   ENDPOINTS           AGE
kubernetes-dashboard   10.244.1.220:8443   6m3s



# 任何node节点都会生成ipvs规则（前提使用的是ipvs代理模式，而非iptables）
# ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  10.0.0.168:443 rr
  -> 10.244.1.220:8443            Masq    1      0          0         
...
```



# sessionAffinity

**Service.spec.sessionAffinity**

- 回话亲和性，默认值为 None 表示轮询调度到后端的 Pod，设置为 ClientIP 表示基于客户端IP地址进行会话保持的模式，即第1次将某个客户端发起的请求转发到后端的某个Pod上，之后从相同的客户端发起的请求都将被转发到后端相同的Pod上，你还可以通过适当设置 service.spec.sessionAffinityConfig.clientIP.timeoutSeconds 来设置最大会话停留时间。（默认值为 10800 秒，即 3 小时）。

```yaml
apiVersion: v1
kind: Service
...
spec:
...
  sessionAffinity: None
```





# ---

# Service Template

- service-tmp.yaml

```yaml
kind: Service
apiVersion: v1
metadata:
  name: ${NAME}
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  selector:
    ${SELECT_KEY}: ${SELECT_VALUE}
  ports:
  - name: http
    protocol: TCP
    port: ${TARGET_PORT} # service的端口，集群内部提供服务
    targetPort: ${TARGET_PORT} # 容器自身监听的端口
    nodePort: ${EXTERNAL_PORT} # nodePort的端口，集群外部提供服务
```

- 调用方式

```sh
NAMESPACE="england-10-200-66-1-24" \
NAME="client" \
SELECT_KEY="run" \
SELECT_VALUE="client" \
TARGET_PORT=19001 \
EXTERNAL_PORT=32222 \
envsubst < service-tmp.yaml | kubectl apply -f -
```

