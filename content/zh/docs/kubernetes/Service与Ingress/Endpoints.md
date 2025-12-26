---
title: "Endpoint"
---

# Endpoint 概述

- 在创建 Service 时会自动创建一个与之同名的 Endpoint
- **只有在 Endpoint 就绪列表中的Pod才可被调度，即就绪探针探测通过的Pod**

- 通常 Endpoint 由 Service 自动创建即可
- 但如果需要将**集群外部的服务引入到k8s集群内部中**来，则可以使用手动创建 Endpoint 这种方式来实现
  - Endpoint 的端点直接指向外部服务的IP和端口号，而后再在前面创建 Service；
    - 但是集群外部服务出现问题不能实现自动下线？TCP无法连接就会自动将其下线并设为noready？



# ---



# Endpoints Explain

```yaml
apiVersion: v1
kind: Endpoint
metadata:  # 对象元数据
  name:
  namespace:
subsets:      # 端点对象的列表
- addresses:  # 处于“就绪”状态的端点地址对象列表
  - hostname  <string>  # 端点主机名
    ip <string>          # 端点的IP地址，必选字段
    nodeName <string>   # 节点主机名
    targetRef：              # 提供了该端点的对象引用
      apiVersion <string>  # 被引用对象所属的API群组及版本
      kind <string>  # 被引用对象的资源类型，多为Pod
      name <string>  # 对象名称
      namespace <string>  # 对象所属的名称究竟
      fieldPath <string>  # 被引用的对象的字段，在未引用整个对象时使用，常用于仅引用
# 指定Pod对象中的单容器，例如spec.containers[1]
      uid <string>     # 对象的标识符；
  notReadyAddresses:  # 处于“未就绪”状态的端点地址对象列表，格式与address相同
  ports:                # 端口对象列表
  - name <string>  # 端口名称；
    port <integer>  # 端口号，必选字段；
    protocol <string>     # 协议类型，仅支持UDP、TCP和SCTP，默认为TCP；
    appProtocol <string>  # 应用层协议；
```



# ---

# Endpoints Example

- 将外部MySQL引入到集群内部中来

- **注意：**Endpoints 一定要先于 Service 创建，否则在创建 Service 时会自动创建 Endpoints

```yaml
apiVersion: v1
kind: Endpoints # 定义了外部 mysql 服务所在的 IP 以及对应端口
metadata:
  name: mysql-external
  namespace: default
subsets:
- addresses: # 定义外部MySQL的IP
  - ip: 172.29.9.51
  - ip: 172.29.9.52
  ports: # 定义外部MySQL的端口
  - name: mysql
    port: 3306
    protocol: TCP

---

apiVersion: v1
kind: Service # 引用 Endpoints，只需将 name 设为和 Endpoints 同名，不需要设置标签选择器
metadata:
  name: mysql-external
  namespace: default
spec:
  type: ClusterIP
  ports:
  - name: mysql
    port: 3306
    targetPort: 3306
    protocol: TCP
```