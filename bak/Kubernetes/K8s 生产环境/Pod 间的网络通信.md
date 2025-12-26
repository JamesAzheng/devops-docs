# 需求描述

- 目前是一个Pod中跑三个容器（tor网络、流量捕获、日志采集），流量捕获捕的是四层数据（即传输层的 源/目标端口，源/目标IP）
- 不同Pod中的容器间通信流量是如何转发的？
- 





# Container to Container

- 一个 Pod 中可以运行多个容器，同一 Pod 中的不同容器间通信，可以直接通过使用 localhost 或 lo（回环）网卡进行直接通信。而这种通信的实现，是通过 Pause 容器来完成的。



## Pause 容器

- 容器之间原本是被 Linux Namespace 和 cgroups 隔开的。但在 kubernetes 中，每运行一个 Pod，都会同时启动一个 pause 容器，pause 容器将作为 Pod 中所有容器的父进程，其主要负责一个 Pod 中的多个容器间共享网络名称空间（Net Namespace）

  - ```sh
    # docker ps -a | grep pause
    fe4ce2b76167   registry.cn-beijing.aliyuncs.com/kubesphereio/pause:3.5   "/pause"                 2 months ago   Up 2 months                           k8s_POD_redis-74f975c764-6tlpd_kubesphere-system_5554f6a5-4cab-4d6d-8d99-a973c6c5f139_1
    d0a39c4f1a7b   registry.cn-beijing.aliyuncs.com/kubesphereio/pause:3.5   "/pause"                 2 months ago   Up 2 months                           k8s_POD_node-exporter-gkr4c_kubesphere-monitoring-system_0e6c8794-1b1f-4aca-bbf2-f071882c19ff_2
    4715f5a51117   registry.cn-beijing.aliyuncs.com/kubesphereio/pause:3.5   "/pause"                 2 months ago   Up 2 months
    ...
    ```

- 所以说一个 Pod 里面的所有容器，它们看到的网络视图是完全一样的。即：它们看到的网络设备、IP 地址、Mac 地址等等，跟网络相关的信息，其实全是一份，这就是 Pod 解决网络共享的一个解法。

- 由于同一 Pod 中的容器共享相同的网络命名空间，它们可以使用 localhost 或 lo 网卡上的 IP 地址进行通信。这种方式非常高效，不需要经过网络堆栈的处理。

![pause](images\pause.png)



**参考文档：**

- https://jimmysong.io/kubernetes-handbook/concepts/pause-container.html
- https://www.ianlewis.org/en/almighty-pause-container





## 范例：同一 Pod 中的容器间通信

### yaml

- 在一个 Pod 中运行多个容器

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
spec:
  containers:
  - name: demoapp # 容器一，测试使用的 http 服务
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
  - name: curl # 容器二，curl 命令镜像
    image: curlimages/curl:8.1.0
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

### 验证

- 应用

```yaml
# kubectl apply -f demoapp.yaml 
pod/demoapp created
```

- 进入任何容器，看到的网络信息都是一致的

```sh
# curl
# kubectl exec -it -n test demoapp -c curl -- sh
/ $ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
4: eth0@if419: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1480 qdisc noqueue state UP 
    link/ether 0a:ee:43:65:66:10 brd ff:ff:ff:ff:ff:ff
    inet 10.200.66.20/32 scope global eth0
       valid_lft forever preferred_lft forever
/ $ ip route
default via 169.254.1.1 dev eth0 
169.254.1.1 dev eth0 scope link 



# demoapp
# kubectl exec -it -n test demoapp -c demoapp -- sh
[root@demoapp /]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN group default qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
4: eth0@if419: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1480 qdisc noqueue state UP group default 
    link/ether 0a:ee:43:65:66:10 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.200.66.20/32 scope global eth0
       valid_lft forever preferred_lft forever
[root@demoapp /]# ip route
default via 169.254.1.1 dev eth0 
169.254.1.1 dev eth0 scope link 
```

- 进入 curl 容器，通过 127.0.0.1 访问 demoapp 的 http 服务

```sh
# kubectl exec -it -n test demoapp -c curl -- sh
/ $ while true ; do curl 127.0.0.1 ; sleep 1 ; done
iKubernetes demoapp v1.0 !! ClientIP: 127.0.0.1, ServerName: demoapp, ServerIP: 10.233.84.159!
...
```

- 进入 demoapp 容器使用 tcpdump 抓包

```sh
# kubectl exec -it -n test demoapp -c demoapp -- sh
[root@demoapp /]# tcpdump -i lo -p tcp
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on lo, link-type EN10MB (Ethernet), capture size 262144 bytes

03:31:32.901880 IP localhost.42744 > localhost.80: Flags [S], seq 3639596300, win 65495, options [mss 65495,sackOK,TS val 2311349850 ecr 0,nop,wscale 7], length 0

03:31:32.901904 IP localhost.80 > localhost.42744: Flags [S.], seq 3540594534, ack 3639596301, win 65483, options [mss 65495,sackOK,TS val 2311349850 ecr 2311349850,nop,wscale 7], length 0

03:31:32.901928 IP localhost.42744 > localhost.80: Flags [.], ack 1, win 512, options [nop,nop,TS val 2311349851 ecr 2311349850], length 0

03:31:32.902043 IP localhost.42744 > localhost.80: Flags [P.], seq 1:77, ack 1, win 512, options [nop,nop,TS val 2311349851 ecr 2311349850], length 76: HTTP: GET / HTTP/1.1

03:31:32.902055 IP localhost.80 > localhost.42744: Flags [.], ack 77, win 511, options [nop,nop,TS val 2311349851 ecr 2311349851], length 0

03:31:32.906528 IP localhost.80 > localhost.42744: Flags [P.], seq 1:18, ack 77, win 512, options [nop,nop,TS val 2311349855 ecr 2311349851], length 17: HTTP: HTTP/1.0 200 OK

03:31:32.906539 IP localhost.42744 > localhost.80: Flags [.], ack 18, win 512, options [nop,nop,TS val 2311349855 ecr 2311349855], length 0

03:31:32.906891 IP localhost.80 > localhost.42744: Flags [P.], seq 18:154, ack 77, win 512, options [nop,nop,TS val 2311349855 ecr 2311349855], length 136: HTTP

03:31:32.906898 IP localhost.42744 > localhost.80: Flags [.], ack 154, win 511, options [nop,nop,TS val 2311349855 ecr 2311349855], length 0

03:31:32.907058 IP localhost.80 > localhost.42744: Flags [P.], seq 154:249, ack 77, win 512, options [nop,nop,TS val 2311349856 ecr 2311349855], length 95: HTTP

03:31:32.907064 IP localhost.42744 > localhost.80: Flags [.], ack 249, win 511, options [nop,nop,TS val 2311349856 ecr 2311349856], length 0

03:31:32.907214 IP localhost.42744 > localhost.80: Flags [F.], seq 77, ack 249, win 512, options [nop,nop,TS val 2311349856 ecr 2311349856], length 0

03:31:32.907566 IP localhost.80 > localhost.42744: Flags [F.], seq 249, ack 78, win 512, options [nop,nop,TS val 2311349856 ecr 2311349856], length 0

03:31:32.907575 IP localhost.42744 > localhost.80: Flags [.], ack 250, win 512, options [nop,nop,TS val 2311349856 ecr 2311349856], length 0
```







# Pod to Pod

- kubernetes 自身并未解决 Pod 之间网络通信的问题，而是提供了 CNI（Container Network Interface）接口 
- 第三方的网络插件可以对接到 CNI 接口上，以实现在集群中创建和管理 Pod 网络，并为 Pod 之间提供了直接的、跨节点的通信能力。
  - 每个 Pod 都会被分配了一个唯一的 IP 地址，Pod 中的容器都共享这个 IP 地址。
  - 不同 Pod 的容器间通信，可以使用该 IP 地址进行直接通信。
- 每个网络插件都提供了不同的虚拟网络实现方式，但大体分为 Overlay 或 Underlay 两种模式。



**Overlay**

- 在 Overlay 模式下，虚拟网络是在底层物理网络之上创建的，通过在节点之间建立逻辑隧道来传输容器之间的网络流量。
- 这些隧道可以使用不同的网络协议和技术实现，如 VXLAN、IPIP、GRE、Geneve 等。容器之间的通信流量在虚拟网络上进行封装和解封装，从而实现了跨节点的通信。
- Overlay 模式在跨云或跨数据中心的场景中更常见，因为它提供了一种透明、灵活的方式来构建虚拟网络。



**Underlay**

- 在 Underlay 模式下，虚拟网络直接利用底层物理网络的路由和连接来进行容器之间的通信。这意味着容器的通信流量直接通过物理网络传输，无需额外的封装和解封装过程。
- Underlay 模式通常使用基于物理网络的网络技术，如 BGP（Border Gateway Protocol），以实现容器之间的通信。
- Underlay 模式更适用于单个数据中心或较小规模的部署，因为它直接利用物理网络的优势，避免了额外的封装和解封装开销。



**常见的网络插件有哪些？**

- 常见的网络插件包括 Flannel、Calico、Weave、Cilium 等，它们提供了不同的网络模式和技术选择，可以根据需求选择合适的虚拟网络方案。
- https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/addons/#networking-and-network-policy



**如何查看目前使用的网络插件？**

```sh
# kubectl get pod -n kube-system | grep -Ei "(Flannel|Calico|Weave|Cilium)"
calico-kube-controllers-69d878584c-vgc8s      1/1     Running   23 (3d9h ago)    60d
calico-node-4279g                             1/1     Running   1 (24d ago)      53d
calico-node-59fr6                             1/1     Running   3 (58d ago)      60d
calico-node-8w7vl                             1/1     Running   1 (23d ago)      53d
calico-node-jjgpm                             1/1     Running   2 (58d ago)      60d
calico-node-jvw65                             1/1     Running   0                60d
calico-node-lrdhb                             1/1     Running   1 (23d ago)      53d
calico-node-plnjq                             1/1     Running   1 (24d ago)      53d
calico-node-qfqrn                             1/1     Running   3 (52d ago)      60d
calico-node-rngxp                             1/1     Running   3 (58d ago)      60d
calico-node-twzqr                             1/1     Running   1 (24d ago)      53d
calico-node-vshqb                             1/1     Running   1 (24d ago)      53d
calico-node-xt5kz                             1/1     Running   1 (23d ago)      53d
calico-node-z5gjd                             1/1     Running   0                60
```



**参考文档：**

- https://github.com/containernetworking/cni
- https://kubernetes.io/zh-cn/docs/concepts/services-networking/
- https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/
- https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/networking/





## Calico

- Calico 是 Kubernetes 的一个常用网络插件之一，用于实现容器之间的网络连接和通信。
- **目前的集群使用的就是此网络插件**



### Calico ippool

#### Pod 可用 IP 范围

- 在 Kubernetes 中，Pod 可以使用的地址范围是由集群的网络插件负责管理的。不同的网络插件可能具有不同的配置方式和默认设置。

##### 查看可用的 IP 地址范围

- 如果你使用的是 Calico 网络插件，你可以通过以下步骤查看 Pod 可以使用的地址范围：

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d


# kubectl describe ippool default-ipv4-ippool
...
  Cidr:           10.233.64.0/18
...
```

- **Cidr: 10.233.64.0/18**

  - 可用地址范围：10.233.64.1 ~ 10.233.127.254
  - 可用地址数量：16382
  - PS：Pod 使用 IP 的范围必须在此之间



##### 自定义 ip pool

参考文档：https://docs.tigera.io/archive/v3.23/reference/resources/ippool

- 最初的地址池

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d


# kubectl describe ippool default-ipv4-ippool
...
  Cidr:           10.233.64.0/18
...
```

- 自定义新的地址池

```yaml
# vim my.ippool-1.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: my.ippool-1
spec:
  cidr: 10.200.64.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel 
```

- 验证

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d
my.ippool-1           31s


# kubectl describe ippool my.ippool-1 
...
  Cidr:           10.200.64.0/24
...
```



### Calico 分配 Pod IP

- 默认情况下，Pod 的 IP 是由 kubernetes 自动分配的，Pod 的每次删除和重建后 IP 都有可能发生变化，但也可以通过一些方式实现明确指定为 Pod 分配的 IP；
- 不同的 CNI 插件，实现为 Pod 分配指定 IP 的方式不尽相同。



#### 自定义 Pod IP 地址

**注意事项：**

- 自定义的 IP 必须要在 Pod 可用地址池的合法范围内，并且该 IP 要未被其它 Pod 所使用
  - 例如当前集群可用的IP范围是：10.233.64.1 ~ 10.233.127.254
- 这种方式只能为每个 Pod 分配一个 IP，不能为 Deployment 等控制器在创建 Pod 时分配多个 IP

**参考文档：**

- https://docs.tigera.io/archive/v3.23/networking/use-specific-ip



##### 范例：自定义 Pod IP 地址

- 通过添加注解的方式明确指定分配的IP

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
  annotations: # 注解
    cni.projectcalico.org/ipAddrs: "[\"10.233.65.177\"]" # 明确指定分配的IP
spec:
  containers:
  - name: demoapp # 容器一
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
  - name: curl # 容器二
    image: curlimages/curl:8.1.0
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

- 验证

```yaml
# kubectl describe pod -n test demoapp
Name:         demoapp
Namespace:    test
Priority:     0
Node:         k8s-worker2/172.16.0.124
Start Time:   Thu, 01 Jun 2023 15:27:30 +0800
Labels:       <none>
Annotations:  cni.projectcalico.org/containerID: 6917fee7bbdd6400defaeda7f0f9f6545e80f2aff339e4ca868dbe812b9e929f
              cni.projectcalico.org/ipAddrs: ["10.233.65.177"]
              cni.projectcalico.org/podIP: 10.233.65.177/32
              cni.projectcalico.org/podIPs: 10.233.65.177/32
Status:       Running
IP:           10.233.65.177
IPs:
  IP:  10.233.65.177
...
```





##### 范例：分配多个 IP 时报错

- 这种方式只能为每个 Pod 分配一个 IP，不能为 Deployment 等控制器在创建 Pod 时分配多个 IP，否则会报以下错误：

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: test
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
      annotations: # 注解
        cni.projectcalico.org/ipAddrs: "[\"10.233.65.177\", \"10.233.65.178\"]" # 分配多个IP
    spec:
      containers:
      - name: demoapp
        image: 172.16.0.120:30002/bjhit-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']



# 所有Pod都将无法分配IP
# kubectl get pod -n test -o wide
NAME                       READY   STATUS              RESTARTS   AGE     IP       NODE          NOMINATED NODE   READINESS GATES
demoapp-67578686fb-8kv7p   0/1     ContainerCreating   0          2m37s   <none>   k8s-worker3   <none>           <none>
demoapp-67578686fb-bvtlg   0/1     ContainerCreating   0          2m37s   <none>   k8s-worker1   <none>           <none>
demoapp-67578686fb-swk5j   0/1     ContainerCreating   0          2m37s   <none>   k8s-worker2   <none>           <none>



# 报错
# kubectl describe pod -n test demoapp-67578686fb-bvtlg 
...
  Warning  FailedCreatePodSandBox  2m41s                   kubelet            Failed to create pod sandbox: rpc error: code = Unknown desc = failed to set up sandbox container "572a7a238eaefae2da6a2ce5e2ae6834187aa7f450365c5e9344815e56545a50" network for pod "demoapp-67578686fb-bvtlg": networkPlugin cni failed to set up pod "demoapp-67578686fb-bvtlg_test" network: cannot have more than one IPv4 address for "cni.projectcalico.org/ipAddrs" annotation
  Normal   SandboxChanged          2m33s (x12 over 2m58s)  kubelet            Pod sandbox changed, it will be killed and re-created.
  Warning  FailedCreatePodSandBox  2m32s (x4 over 2m39s)   kubelet            (combined from similar events): Failed to create pod sandbox: rpc error: code = Unknown desc = failed to set up sandbox container "1e05db9586184396db5add5e44bd1fd73a5f83a07b976165a997bacdbc394a33" network for pod "demoapp-67578686fb-bvtlg": networkPlugin cni failed to set up pod "demoapp-67578686fb-bvtlg_test" network: cannot have more than one IPv4 address for "cni.projectcalico.org/ipAddrs" annotation

```



#### 限制 Pod 使用特定范围内的 IP 地址

- 此方式可以将 ip pool 中的 ip 划分给 pod，划分时可以基于 Pod 和 namespace 两种粒度。

**参考文档：**

- https://docs.tigera.io/archive/v3.23/networking/legacy-firewalls



##### 范例：Pod 级别分配

- 让 pod 使用指定 ippool 中的 ip
- https://docs.tigera.io/archive/v3.23/networking/legacy-firewalls#restrict-a-pod-to-use-an-ip-address-range

###### 获取目前的 ip pool

```yaml
# kubectl get ippool
NAME                  AGE
default-ipv4-ippool   72d
my.ippool-1           47m


# kubectl get ippool default-ipv4-ippool -o jsonpath='{.spec.cidr}' ; echo
10.233.64.0/18


# kubectl get ippool my.ippool-1 -o jsonpath='{.spec.cidr}' ; echo
10.200.64.0/24
```

###### Pod

- 添加注解明确指定分配的 ippool

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["my.ippool-1"]' # 使用该ippool中的ip
spec:
  containers:
  - name: demoapp # 容器一
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
  - name: curl # 容器二
    image: curlimages/curl:8.1.0
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

- 验证，分配的地址位于 my.ippool-1

```yaml
# kubectl describe pod -n test demoapp
Name:         demoapp
Namespace:    test
Priority:     0
Node:         k8s-worker2/172.16.0.124
Start Time:   Thu, 01 Jun 2023 16:47:50 +0800
Labels:       <none>
Annotations:  cni.projectcalico.org/containerID: 2ba2dceb3057fd11e3523c8dc3cf14b115745b9e91b5874193fe9cf19d606ab6
              cni.projectcalico.org/ipv4pools: ["my.ippool-1"]
              cni.projectcalico.org/podIP: 10.200.64.0/32
              cni.projectcalico.org/podIPs: 10.200.64.0/32
Status:       Running
IP:           10.200.64.0 # 分配的地址位于 my.ippool-1
IPs:
  IP:  10.200.64.0
...
```

###### Deployment

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: test
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
      annotations: # 注解
        cni.projectcalico.org/ipv4pools: '["my.ippool-1"]' # 指定地址池
    spec:
      containers:
      - name: demoapp
        image: 172.16.0.120:30002/bjhit-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']



# ok
# kubectl get pod -n test -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
demoapp-5d7978f7f9-4kczb   1/1     Running   0          28s   10.200.64.1     k8s-worker2   <none>           <none>
demoapp-5d7978f7f9-bzrtz   1/1     Running   0          28s   10.200.64.64    k8s-worker1   <none>           <none>
demoapp-5d7978f7f9-c8jp9   1/1     Running   0          28s   10.200.64.192   k8s-worker3   <none>           <none>
```





##### 范例：Namespace 级别分配

- 创建 namespace 时为其指定 ippool，后续在此 namespace 中创建的 pod 都将被分配该 ippool 中的 ip
- https://docs.tigera.io/archive/v3.23/networking/legacy-firewalls#restrict-all-pods-within-a-namespace-to-use-an-ip-address-range

###### 创建 ip pool

- 这里假设创建美国节点的地址池，且 CIDR 为 10.200.66.0/24

```yaml
# vim america_ippool.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: america-ippool
spec:
  cidr: 10.200.66.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel 


# kubectl get ippool
NAME                  AGE
america-ippool        7s
default-ipv4-ippool   72d
my.ippool-1           167m



# kubectl describe ippool america-ippool
...
  Cidr:           10.200.66.0/24
...
```

###### 创建 namespace

- 创建名称空间并指定地址池

```yaml
# vim america-node.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: america-node
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["america-ippool"]' # 指定地址池



# kubectl apply -f america-node.yaml 
namespace/america-node created


# kubectl describe ns america-node 
Name:         america-node
Labels:       kubernetes.io/metadata.name=america-node
              kubesphere.io/namespace=america-node
Annotations:  cni.projectcalico.org/ipv4pools: ["america-ippool"]
Status:       Active
...
```

###### 创建 Depoyment

- 创建的 Pod 都将属于 10.200.66.0/24 网段

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: america-node # 指定namespace
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: 172.16.0.120:30002/bjhit-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']



# kubectl get pod -n america-node -o wide
NAME                       READY   STATUS    RESTARTS   AGE   IP              NODE          NOMINATED NODE   READINESS GATES
demoapp-759f97d8cb-24mx2   1/1     Running   0          16s   10.200.66.192   k8s-worker3   <none>           <none>
demoapp-759f97d8cb-47g8x   1/1     Running   0          16s   10.200.66.0     k8s-worker2   <none>           <none>
demoapp-759f97d8cb-qxvns   1/1     Running   0          16s   10.200.66.64    k8s-worker1   <none>           <none>
```



#### 测试不同 ippool 中的 Pod 是否能通信

- 属于同一子网既可以

##### ippool

###### america_ippool.yaml

```yaml
# vim america_ippool.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: america-ippool
spec:
  cidr: 10.200.66.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel 
```

###### my.ippool-1.yaml

```yaml
# vim my.ippool-1.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: my.ippool-1
spec:
  cidr: 10.200.64.0/24
  ipipMode: CrossSubnet
  natOutgoing: true
  disabled: false
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel

```



##### namespace

###### america-node.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: america-node
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["america-ippool"]' # 指定地址池

```

###### test.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: test 
  annotations: # 注解
    cni.projectcalico.org/ipv4pools: '["my.ippool-1"]' # 指定地址池

```



##### pod

###### demoapp_america-node.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp-america
  namespace: america-node # 指定namespace
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp-america
  template:
    metadata:
      name: demoapp-america
      labels:
        app: demoapp-america
    spec:
      containers:
      - name: demoapp-america
        image: 172.16.0.120:30002/bjhit-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']

```

###### demoapp_test.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp-test
  namespace: test # 指定namespace
spec:
  replicas: 3 # 创建3个Pod副本
  selector:
    matchLabels:
      app: demoapp-test
  template:
    metadata:
      name: demoapp-test
      labels:
        app: demoapp-test
    spec:
      containers:
      - name: demoapp-test
        image: 172.16.0.120:30002/bjhit-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
        env:
        - name: NTP_SERVER1
          value: "172.16.0.125"
        - name: NTP_SERVER2
          value: "172.16.0.127"
        securityContext:
          capabilities:
            add: ['CAP_SYS_TIME']

```

##### 验证

```sh
root@demoapp-test-85fc4bd9f7-kkf8c:/var/lib/logger_processor# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN group default qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
4: eth0@if191: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1480 qdisc noqueue state UP group default 
    link/ether 9e:7f:5a:bd:ea:55 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.200.64.192/32 scope global eth0
       valid_lft forever preferred_lft forever



root@demoapp-test-85fc4bd9f7-kkf8c:/var/lib/logger_processor# ping 10.200.66.21
PING 10.200.66.21 (10.200.66.21) 56(84) bytes of data.
64 bytes from 10.200.66.21: icmp_seq=1 ttl=62 time=0.206 ms
64 bytes from 10.200.66.21: icmp_seq=2 ttl=62 time=0.204 ms
64 bytes from 10.200.66.21: icmp_seq=3 ttl=62 time=0.213 ms

```





#### 分配公网IP

https://zh-hans.ipshu.com/ip-country/us

1.32.239.255

- 通过添加注解的方式明确指定分配的IP

##### public-ippool.yaml

```yml
# vim public-ippool.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: public-ippool
spec:
  cidr: 1.32.239.0/24
  ipipMode: Always
  vxlanMode: Neve
  natOutgoing: true
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel
```

##### demoapp.yaml

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
  annotations: # 注解
    cni.projectcalico.org/ipAddrs: "[\"1.32.239.255\"]" # 明确指定分配的IP
spec:
  containers:
  - name: demoapp # 容器一
    image: ikubernetes/demoapp:v1.0
    imagePullPolicy: IfNotPresent
  - name: curl # 容器二
    image: curlimages/curl:8.1.0
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

- 验证

```yaml
# kubectl describe pod -n test demoapp
Name:         demoapp
Namespace:    test
Priority:     0
Node:         k8s-worker2/172.16.0.124
Start Time:   Thu, 01 Jun 2023 15:27:30 +0800
Labels:       <none>
Annotations:  cni.projectcalico.org/containerID: 6917fee7bbdd6400defaeda7f0f9f6545e80f2aff339e4ca868dbe812b9e929f
              cni.projectcalico.org/ipAddrs: ["10.233.65.177"]
              cni.projectcalico.org/podIP: 10.233.65.177/32
              cni.projectcalico.org/podIPs: 10.233.65.177/32
Status:       Running
IP:           10.233.65.177
IPs:
  IP:  10.233.65.177
...
```



##### middleware.yaml

```yaml
# vim middleware.yaml
apiVersion: v1
kind: Pod
metadata:
  name: middleware
  namespace: test
  annotations: # 注解
    cni.projectcalico.org/ipAddrs: "[\"1.32.239.255\"]" # 明确指定分配的IP
spec:
  containers:
  - name: middleware
    image: 172.16.0.120:30002/bjhit-middleware/middleware:v1
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

##### config.ini

```ini
[LOCAL_LOG]
log_dir = log
log_name = middleware
log_level = DEBUG

[MYSQL]
host = 172.16.30.55
user = root
password = bjhit@2022
dbname = bjhit_middleware

[ES]
master_host1 = http://172.16.30.111:9200
master_host2 = http://172.16.30.112:9200
master_host3 = http://172.16.30.113:9200
port = 9200
timeout = 300
max_retries = 20

[RABBITMQ]
RABBITMQ_HOST = 172.16.0.120
RABBITMQ_PORT = 30196
RABBITMQ_USER = hit
RABBITMQ_PASSWD = hit@2020

[MINIO]
MINIO_SER_HOST = 172.16.0.120:31104
MINIO_WEB_HOST = 172.16.0.120:31553
ACCESS_KEY = kzfXEZZ5n0XyhQWrcU3B
SECRET_KEY = qEmmepnkE5zPft7EK05rQvedRn2vF83YOEen417a

```



#### 分配公网IP-2

##### ippool-93.72.109.49.yaml

```yml
# vim ippool-93.72.109.49.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: 93.72.109.49
spec:
  cidr: 93.72.109.49/32
  ipipMode: Always
  vxlanMode: Neve
  natOutgoing: true
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel
```

##### demoapp-93.72.109.49.yaml

```yml
# vim demoapp-93.72.109.49.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp-93.72.109.49
  namespace: test
  annotations:
    cni.projectcalico.org/ipAddrs: "[\"93.72.109.49\"]"
spec:
  containers:
  - name: middleware
    image: 172.16.0.120:30002/bjhit-middleware/middleware:v1
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```

##### ippool-84.5.151.144.yaml

```yml
# vim ippool-84.5.151.144.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: 84.5.151.144
spec:
  cidr: 84.5.151.144/32
  ipipMode: Always
  vxlanMode: Neve
  natOutgoing: true
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel
```

##### demoapp-84.5.151.144.yaml

```yml
# vim demoapp-84.5.151.144.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp-84.5.151.144
  namespace: test
  annotations:
    cni.projectcalico.org/ipAddrs: "[\"84.5.151.144\"]"
spec:
  containers:
  - name: middleware
    image: 172.16.0.120:30002/bjhit-middleware/middleware:v1
    command:
      - tail
    args:
      - "-f"
      - /etc/hosts
    imagePullPolicy: IfNotPresent
```



#### 分配公网IP-3

##### demoapp.yaml

```yaml
# vim demoapp.yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  name: ${IP}
spec:
  cidr: ${IP}/32
  ipipMode: Always
  vxlanMode: Neve
  natOutgoing: true
  nodeSelector: all()
  allowedUses:
  - Workload
  - Tunnel
---
apiVersion: apps/v1
kind: Deployment
metadata:
  generation: 1
  name: da
  namespace: america-node
spec:
  replicas: 3
  selector:
    matchLabels:
      run: ${RUN}
  template:
    metadata:
      labels:
        run: ${RUN}
      annotations:
        cni.projectcalico.org/ipAddrs: "[\"${IP}\"]"
    spec:
      containers:
      - env:
        - name: ROLE
          value: ${ROLE}
        - name: NTP_SERVER1
          value: 172.16.0.125
        - name: NTP_SERVER2
          value: 172.16.0.127
        image: ${IMAGE}
        name: da
        ports:
        - containerPort: 7000
        - containerPort: 9030
        - containerPort: 9050
        volumeMounts:
        - mountPath: /tor
          name: share-volume
      volumes:
      - name: share-volume
        nfs:
          path: /data/wuhan
          server: 172.16.0.136
```

##### 应用

```sh
# 打印
IP="6.6.6.6" \
IMAGE="whmnixx/tor_da:4.6.10" \
ROLE="DA" \
RUN="da" \
envsubst < demoapp.yaml


# 应用
IP="6.6.6.6" \
IMAGE="whmnixx/tor_da:4.6.10" \
ROLE="DA" \
RUN="da" \
envsubst < demoapp.yaml | kubectl apply -f -
```







### 限制 Pod 网络 IO

**参考文档：**

- https://www.cni.dev/plugins/current/meta/bandwidth/
- https://kubernetes.io/zh-cn/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/#support-traffic-shaping
- https://docs.tigera.io/archive/v3.23/reference/cni-plugin/configuration#cni-network-configuration-lists
- https://github.com/projectcalico/calico/issues/5007



#### 前期准备

- 准备带宽测试服务

```sh
root@k8s-master1:~# iperf -s
------------------------------------------------------------
Server listening on TCP port 5001
TCP window size:  128 KByte (default)
------------------------------------------------------------


root@k8s-master1:~# hostname -I
172.16.0.120 172.17.0.1 10.233.68.0 
```



#### 限制前

- 环境准备

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
spec:
  containers:
  - name: demoapp
    image: 172.16.0.120:30002/bjhit-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
    securityContext:
      capabilities:
        add: ['CAP_SYS_TIME']



# kubectl apply -f demoapp.yaml 
pod/demoapp created
```

- 测试

```sh
# kubectl exec -it -n test demoapp -- bash
...


root@demoapp:/var/lib/logger_processor# apt install iperf
...


root@demoapp:/var/lib/logger_processor# iperf -c 172.16.0.120
------------------------------------------------------------
Client connecting to 172.16.0.120, TCP port 5001
TCP window size: 85.0 KByte (default)
------------------------------------------------------------
[  3] local 10.200.66.6 port 35212 connected with 172.16.0.120 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.0 sec  7.90 GBytes  6.79 Gbits/sec
```



#### 限制后

- 环境准备

```yaml
# vim demoapp.yaml
apiVersion: v1
kind: Pod
metadata:
  name: demoapp
  namespace: test
  annotations:
    kubernetes.io/ingress-bandwidth: 1M # 
    kubernetes.io/egress-bandwidth: 1M # 
spec:
  containers:
  - name: demoapp
    image: 172.16.0.120:30002/bjhit-middleware/logger-processor@sha256:1c973d59cec3915f8c50c86f102a4d9890855a4f576bcac5bec716e6b5597839
    securityContext:
      capabilities:
        add: ['CAP_SYS_TIME']



# kubectl apply -f demoapp.yaml
pod/demoapp created
```

- 测试

```sh
# kubectl exec -it -n test demoapp -- bash
...


root@demoapp:/var/lib/logger_processor# apt install iperf
...


root@demoapp:/var/lib/logger_processor# iperf -c 172.16.0.120
------------------------------------------------------------
Client connecting to 172.16.0.120, TCP port 5001
TCP window size: 85.0 KByte (default)
------------------------------------------------------------
[  3] local 10.200.66.7 port 51158 connected with 172.16.0.120 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.3 sec  29.5 MBytes  24.0 Mbits/sec
```



### 不同 Pod 间的网络通信流程

- 不同 Pod 间通信时，具体的通信过程取决于所使用的 CNI 插件，以及所配置的网络模式。
- 下面以 Calico 举例说明：

**参考文档：**

- https://tanzu.vmware.com/developer/guides/container-networking-calico-refarch/
- https://docs.tigera.io/archive/v3.23/reference/architecture/
- https://docs.tigera.io/archive/v3.23/reference/resources/ippool

**同主机 Pod 间通信流程：**





**跨主机 Pod 间通信流程：**



**如何只关心Pod间通信的流量？？？？**



### 默认ippool

```
root@k8s-master1:~# kubectl get ippools default-ipv4-ippool -o yaml
apiVersion: crd.projectcalico.org/v1
kind: IPPool
metadata:
  annotations:
    projectcalico.org/metadata: '{"uid":"1ba06317-30af-4017-9665-9e47f1f20a62","creationTimestamp":"2023-03-21T06:17:28Z"}'
  creationTimestamp: "2023-03-21T06:17:28Z"
  generation: 1
  name: default-ipv4-ippool
  resourceVersion: "1281"
  uid: e6ffc1cb-c7a3-4236-9dd6-bf7b7fc3ac92
spec:
  allowedUses:
  - Workload
  - Tunnel
  blockSize: 24
  cidr: 10.233.64.0/18
  ipipMode: Always
  natOutgoing: true
  nodeSelector: all()
  vxlanMode: Never

```








# Pod to Service

- 不同 Pod 的容器间通信，还可以通过 Kubernetes 的 Service 来实现 Pod 间的通信
- Service 提供了一个虚拟的 IP 地址和负载均衡功能，可以将请求转发给后端 Pod



## Service 简述

- Service 是 kubernetes 内部的负载均衡，它可以与一组 Pod 相关联，并对外提供一个统一的访问入口；
- 其它 Pod 或外部客户端访问 Service 时，流量会被转发到  Service 所关联的 Pod。

### Service 类型

Service 提供了四种不同的类型以面对不同的应用场景：

**ClusterIP：**

- ClusterIP 是默认的 Service 类型，会分配一个仅提供集群内部访问的 IP（该地址仅在集群内部可见、可达，它无法被集群外部的客户端访问）
- 集群内部访问时，访问的是 ClusterIP + Service 的端口

**NodePort：**


- NodePort 是 ClusterIP 的增强版，除了会分配 ClusterIP，还会在每个节点上打开一个固定端口对外提供访问，端口可以自行指定，也可以不指定，然后由Service自行分配，默认端口的分配范围在30000 ~ 32767之间
- 集群外部访问时，访问的是 节点IP + NodePort（集群内部访问时，依然访问的是 ClusterIP + Service的端口）

**LoadBalancer：**


- LoadBalancer 是 NodePort 的增强类型
- 使用云提供商的负载均衡器向外部暴露服务。 外部负载均衡器可以将流量路由到自动创建的 NodePort 服务和 ClusterIP 服务上

**ExternalName：**


- ExternalName 是一种将 Service 映射到 DNS 名称的类型。该类型的 Service 可以将 Service 映射到集群外部的服务地址，但是只支持 TCP 和 UDP 协议。

- 这种类型的Service允许通过DNS CNAME记录将Service映射到一个外部域名。这种类型的Service通常被用于将集群内部的服务映射到集群外部的服务。




### Service FQDN

在 **Pod 内部时**，可以通过 Service 的 FQDN 来访问 Service

- 每个 Service 都会被分配一个唯一的域名，其格式为 `<service-name>.<namespace>.svc.<cluster-domain>`，其中：
  - `<service-name>` 是 Service 的名称，用于唯一标识该服务。
  - `<namespace>` 是 Service 所属的命名空间。如果 Service 不在特定命名空间中，则使用默认命名空间 `default`。
  - svc 是固定标识
  - `<cluster-domain>` 是集群的域名，通常为 `cluster.local`。
- 例如，如果有一个名为 "my-service" 的 Service，位于命名空间 "my-namespace" 中，并且集群的域名为 "cluster.local"，那么该 Service 的 FQDN 将为 "my-service.my-namespace.svc.cluster.local"。
- 使用 Service FQDN，其他应用程序或服务可以通过这个域名来访问和与 Kubernetes Service 进行通信，而无需直接使用底层的 IP 地址。这提供了一种抽象层，使得服务的位置和可用性可以在不改变调用方代码的情况下进行更改和管理。



**参考文档：**

- https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/





## 范例：通过 Service 访问 Pod

- 在集群内部访问只需定义 ClusterIP 类型的 Service 即可

### 创建 Pod

- 创建 Pod

```yaml
# vim demoapp_deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp
  namespace: test
spec:
  replicas: 3 # 运行三个副本
  selector:
    matchLabels:
      app: demoapp
  template:
    metadata:
      name: demoapp
      labels:
        app: demoapp
    spec:
      containers:
      - name: demoapp
        image: ikubernetes/demoapp:v1.0
```

- 验证

```sh
# kubectl apply -f demoapp_deployment.yaml 
deployment.apps/demoapp created


# kubectl get deployments.apps -n test 
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
demoapp   3/3     3            3           14s


# kubectl get pods -n test 
NAME                       READY   STATUS    RESTARTS   AGE
demoapp-565c666789-khjwh   1/1     Running   0          29s
demoapp-565c666789-vbtbz   1/1     Running   0          29s
demoapp-565c666789-wf85k   1/1     Running   0          29s
```



### 将 Pod 与 Service 进行关联

- Service 是通过标签选择器的方式与标签相匹配的 Pod 进行关联

**注意事项：**

- Service 要与匹配的 Pod 位于同一 namespace，否则 Service 的标签选择器将无法找到匹配的 Pod

```yaml
# vim demoapp_service.yaml
kind: Service
apiVersion: v1
metadata:
  name: demoapp-svc
  namespace: test # 要与匹配的 Pod 位于同一 namespace
spec:
  type: ClusterIP # 通常无需指定因为默认既是 ClusterIP
  selector: # 标签选择器
    app: demoapp # 将具有此标签的 Pod 作为本 Service 的后端
                 # 需等于.spec.template.metadata.labels
  ports:
  - name: http
    protocol: TCP
    port: 80 # Service 的端口号
    targetPort: 80 # 后端目标进程的端口号或名称
```

- 验证

```yaml
# kubectl apply -f demoapp_service.yaml 
service/demoapp-svc created


# kubectl describe service -n test demoapp-svc 
Name:              demoapp-svc
Namespace:         test
Labels:            <none>
Annotations:       <none>
Selector:          app=demoapp
Type:              ClusterIP # service的类型
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.233.4.255 # service的IP
IPs:               10.233.4.255
Port:              http  80/TCP
TargetPort:        80/TCP
Endpoints:         10.233.65.172:80,10.233.73.61:80,10.233.84.161:80 # 匹配到的后端Pod
Session Affinity:  None
Events:            <none>
```



### 通过 Service 访问 Pod

- **PS：**通过 Service 访问一组后端 Pod 时，会以轮询的方式进行调度

#### 在 Pod 内部进行访问

- 在 Pod 内部访问 Service 时，既可以通过 Service 的 IP，也可以通过 Service 的域名；
- 程序在访问 Service 时，通常使用的是 Service 的域名。因为域名更加固定，不会因为 Service 重建后 IP 发生变化再需修改。

```sh
# 创建测试Pod，用于充当客户端来访问service
root@k8s-master1:~# kubectl run curl-client --image=curlimages/curl:8.1.0 -n default -- tail -f /etc/hosts
pod/curl-client created


# 进入Pod内部
root@k8s-master1:~# kubectl exec -it -n default curl-client -- sh


# 通过IP访问
/ $ while true ; do curl 10.233.4.255 ; sleep 1 ; done
iKubernetes demoapp v1.0 !! ClientIP: 10.233.65.176, ServerName: demoapp-565c666789-vbtbz, ServerIP: 10.233.84.161!
iKubernetes demoapp v1.0 !! ClientIP: 10.233.65.176, ServerName: demoapp-565c666789-wf85k, ServerIP: 10.233.73.61!
iKubernetes demoapp v1.0 !! ClientIP: 10.233.65.176, ServerName: demoapp-565c666789-khjwh, ServerIP: 10.233.65.172!
...


# 通过service的域名访问
/ $ while true ; do curl demoapp-svc.test.svc.cluster.local ; sleep 1 ; done
iKubernetes demoapp v1.0 !! ClientIP: 10.233.65.176, ServerName: demoapp-565c666789-khjwh, ServerIP: 10.233.65.172!
iKubernetes demoapp v1.0 !! ClientIP: 10.233.65.176, ServerName: demoapp-565c666789-vbtbz, ServerIP: 10.233.84.161!
iKubernetes demoapp v1.0 !! ClientIP: 10.233.65.176, ServerName: demoapp-565c666789-wf85k, ServerIP: 10.233.73.61!
...


# 容器所指向的dns
/ $ cat /etc/resolv.conf
nameserver 169.254.25.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5

```



#### 在集群内部进行访问

- 在集群内部访问只能通过 service 的 ip，不能通过域名。

```sh
root@k8s-master1:~# while true ; do curl 10.233.4.255 ; sleep 1 ; done
iKubernetes demoapp v1.0 !! ClientIP: 10.233.68.0, ServerName: demoapp-565c666789-khjwh, ServerIP: 10.233.65.172!
iKubernetes demoapp v1.0 !! ClientIP: 10.233.68.0, ServerName: demoapp-565c666789-vbtbz, ServerIP: 10.233.84.161!
iKubernetes demoapp v1.0 !! ClientIP: 10.233.68.0, ServerName: demoapp-565c666789-wf85k, ServerIP: 10.233.73.61!
...


# 访问域名将无法解析
root@k8s-master1:~# while true ; do curl demoapp-svc.test.svc.cluster.local ; sleep 1 ; done
curl: (6) Could not resolve host: demoapp-svc.test.svc.cluster.local
curl: (6) Could not resolve host: demoapp-svc.test.svc.cluster.local
curl: (6) Could not resolve host: demoapp-svc.test.svc.cluster.local
...
```



