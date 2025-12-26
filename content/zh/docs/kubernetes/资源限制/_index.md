---
title: "资源限制"
weight: 10
---

K8s 中的 **LimitRanger** 和 **ResourceQuota** 都是用于限制和管理资源使用的机制，但它们的作用范围、目的和应用方式有本质区别。以下是详细对比：

| 特性                  | LimitRanger                                      | ResourceQuota                                      |
|-----------------------|--------------------------------------------------|----------------------------------------------------|
| **作用范围**          | **单个对象（Pod、Container）**                   | **整个 Namespace**                                 |
| **主要功能**          | 为未指定资源限制（limits）和请求（requests）的 Pod/Container 设置默认值，或者强制执行最小/最大限制 | 对 Namespace 内所有资源的**总量**进行限制（如 CPU、内存、Pod 数量、PVC 数量等） |
| **控制的对象**        | 单个 Pod 或 Container 的资源 requests 和 limits  | Namespace 内所有 Pod、Service、PVC、ConfigMap 等资源的**累计使用量** |
| **典型使用场景**      | 防止用户忘记设置资源限制，导致 Pod 过度消耗节点资源；强制设置默认值或上下限 | 控制一个团队/项目/租户在一个 Namespace 内能使用的总资源量，实现多租户隔离和配额管理 |
| **是否支持默认值**    | 支持（default、defaultRequest）                  | 不支持（只限制总量，不设置默认值）                 |
| **支持的资源类型**    | 只针对 Pod/Container 的 CPU、内存                | 支持多种资源：CPU、内存、Pod 数、Service 数、PVC 数、特定 StorageClass 的存储等 |
| **是否能阻止创建**    | 能（如果 Pod 超出 LimitRanger 设置的最大值或低于最小值，会被拒绝） | 能（当 Namespace 内的资源总量达到配额上限时，新资源创建会被拒绝） |
| **配置方式**          | 通过 LimitRange 对象（每个 Namespace 可以有一个） | 通过 ResourceQuota 对象（每个 Namespace 可以有一个） |

### 举例说明

1. **LimitRanger 示例**（限制单个 Pod/Container）
   ```yaml
   apiVersion: v1
   kind: LimitRange
   metadata:
     name: mem-limit-range
     namespace: default
   spec:
     limits:
     - type: Container
       max:
         memory: 2Gi
         cpu: "1"
       min:
         memory: 256Mi
         cpu: "0.1"
       default:
         memory: 512Mi
         cpu: "0.5"
       defaultRequest:
         memory: 256Mi
         cpu: "0.2"
   ```
   效果：
   - 如果用户创建 Pod 没写 limits/requests，会自动补上默认值（512Mi/0.5 cpu）。
   - 如果用户写的 limits 超过 2Gi 内存，会被拒绝创建。
   - 防止单个 Pod 占用过多资源。

2. **ResourceQuota 示例**（限制 Namespace 总资源）
   ```yaml
   apiVersion: v1
   kind: ResourceQuota
   metadata:
     name: compute-quota
     namespace: dev-team
   spec:
     hard:
       pods: "50"                    # 最多 50 个 Pod
       requests.cpu: "20"            # 所有 Pod 的 requests.cpu 总和不超过 20
       requests.memory: "40Gi"
       limits.cpu: "40"
       limits.memory: "80Gi"
       persistentvolumeclaims: "20"
   ```
   效果：
   - 当 dev-team 这个 Namespace 里所有 Pod 的 requests.cpu 总和达到 20 时，再创建新 Pod 会被拒绝。
   - 适合给不同团队分配资源配额。

### 总结：什么时候用哪个？

| 场景                              | 推荐使用                     |
|-----------------------------------|------------------------------|
| 防止用户忘记设置资源限制          | LimitRanger（设置默认值）    |
| 强制单个容器不能超过一定资源      | LimitRanger（设置 max/min）  |
| 给整个团队/项目/租户分配资源配额  | ResourceQuota                |
| 多租户环境，限制 Namespace 总资源 | ResourceQuota                |
| 通常一起使用                      | 先用 LimitRanger 控制单个 Pod，再用 ResourceQuota 控制总量 |

**一句话概括**：
- **LimitRanger** 是“单个 Pod/Container 的资源守门员”，管好每个容器。
- **ResourceQuota** 是“Namespace 的资源总账本”，管好整个命名空间的总量。

在实际生产环境中，**通常会同时使用两者**，实现既控制单个 Pod 又控制总配额的精细化管理。