---
title: "NetworkPolicy"
weight: 10
---

# NetworkPolicy 概述

- 网络策略，管控Pod间的通信流量；
- k8s的名称空间，仅用于为资源名称提供隔离机制，而默认Pod与Pod间通信都是放行的；
- egress：出站流量
- ingress：入站流量



# NetworkPolicy Explain

```yaml
apiVersion: networking.k8s.io/v1  # 资源隶属的API群组及版本号
kind: NetworkPolicy  # 资源类型的名称，名称空间级别的资源；
metadata:  # 资源元数据
  	name <string>  # 资源名称标识
  	namespace <string>  # NetworkPolicy是名称空间级别的资源
spec:  # 期望的状态
  	podSelector <Object>  # 当前规则生效的同一名称空间中的一组目标Pod对象，必选字段，空值表示当前名称空间中的所有Pod资源
  	policyTypes <[]string>  # Ingress表示生效ingress字段；Egress表示生效egress字段，同时提供表示二者均有效
	ingress <[]Object>  # 入站流量源端点对象列表，白名单，空值表示“所有”
	- from <[]Object>  # 具体的端点对象列表，空值表示所有合法端点
	  - ipBlock  <Object> # IP地址块范围内的端点，不能与另外两个字段同时使用
	  - namespaceSelector <Object> # 匹配的名称空间内的端点
	    podSelector <Object>  # 由Pod标签选择器匹配到的端点，空值表示<none>
	  ports <[]Object>  # 具体的端口对象列表，空值表示所有合法端口
	egress <[]Object>  # 出站流量目标端点对象列表，白名单，空值表示“所有”
	- to <[]Object>  # 具体的端点对象列表，空值表示所有合法端点，格式同ingres.from；
	  ports <[]Object>  # 具体的端口对象列表，空值表示所有合法端口
```



# NetworkPolicy Example-1

- 定义允许的入站流量

- **netpol-dev-demoapp-ingress.yaml**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: demoapp-ingress
  namespace: dev # 针对dev名称空间
spec:
  podSelector:
    matchLabels:
      app: demoapp # 仅对dev名称空间中包含app: demoapp标签的pod有效
  policyTypes: ["Ingress"] # 仅对入站流量生效
  ingress: # 入站流量具体的规则定义（白名单）
  - from: # 入站流量规则一
    - namespaceSelector:
        matchExpressions:
        - key: name
          operator: In
          values: [dev, kube-system, logs, monitoring, kubernetes-dashboard] # 对这些名称空间中的入站流量予以放行
    #- ipBlock:
    #    cidr: 192.168.0.0/16 # 来自此网段的流量也予以放行
  - from: # 入站流量规则二
    - namespaceSelector:
        matchExpressions:
        - {key: name, operator: NotIn, values: ["default"]} # 除default名称空间以外允许访问dev名称空间下的80端口
    ports:
    - protocol: TCP
      port: 80
```

# NetworkPolicy Example-2

- 定义拒绝所有出站和入站规则
  - 如果只定义了允许放行的入站流量，但流量依旧会被放行，因为默认是全部流量都允许放行的，所以还需定义默认的全部拒绝策略才能实现部分放行部分拒绝

- **netpol-dev-denyall.yaml**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: dev
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
  egress:
  - to:
    - podSelector: {}
  ingress:
  - from:
    - podSelector: {}
```



# NetworkPolicy Example-3

- 定义允许的出站流量
- **netpol-dev-demoapp-egress.yaml**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: demoapp-egress
  namespace: dev
spec:
  podSelector:
    matchLabels:
      app: demoapp
  policyTypes: ["Egress"] # 策略类型出站规则
  egress: # 出站规则具体定义（白名单）；to与to之间是或逻辑，to中的内容是与逻辑(并且关系)
  - to: # 访问外部UDP/53端口允许
    ports:
    - protocol: UDP
      port: 53
  - to: # 访问外部标签为redis的pod并且目标端口只能为TCP/6379的流量放行
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to: # 访问外部标签为demoapp的pod并且目标端口只能为TCP/80的流量放行
    - podSelector:
        matchLabels:
          app: demoapp
    ports:
    - protocol: TCP
      port: 80
```

