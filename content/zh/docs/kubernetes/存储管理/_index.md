---
title: "存储管理"
weight: 10
---


### CSI

**Container Storage Interface (CSI)** 是容器存储接口的缩写，它是一个行业标准规范，旨在将任意块存储（block storage）和文件存储（file storage）系统暴露给容器编排系统（Container Orchestration Systems，简称 COs，如 Kubernetes、Mesos 等）上的容器化工作负载。

#### 背景与历史
- 在 CSI 出现之前，Kubernetes 的存储卷插件（Volume Plugins）是 **in-tree**（内置树内）的，即插件代码直接集成在 Kubernetes 核心代码中，随 Kubernetes 二进制文件一起发布。
- 这导致第三方存储厂商添加新存储支持或修复 bug 时，必须跟随 Kubernetes 的发布周期，过程复杂且容易引入安全/可靠性问题。
- CSI 从 Kubernetes 1.9 引入 alpha 版本，1.10 升为 beta，**1.13 版本正式 GA（General Availability）**，成为稳定特性。
- CSI 的目标是使存储插件 **out-of-tree**（树外），允许厂商独立开发、部署和维护插件，而无需修改 Kubernetes 核心代码。

#### CSI 的核心优势
- **可扩展性**：第三方存储提供商只需实现 CSI 标准接口，即可将存储系统集成到 Kubernetes 中，支持动态 provisioning（动态供给）。
- **标准化**：一个 CSI 驱动程序可以跨多个容器编排系统工作（如 Kubernetes 和 Mesos）。
- **容器化部署**：CSI 驱动以容器形式运行，支持现代特性如卷快照（snapshots）、卷扩展（expansion）、克隆（cloning）等。
- **安全性与维护性**：减少核心代码体积，厂商可独立发布更新。

#### CSI 架构与组件
CSI 通过 gRPC 接口通信，主要包括：
- **CSI Driver**：由存储厂商实现的核心容器，包括：
  - **Identity Service**：识别驱动信息。
  - **Controller Service**：处理卷创建/删除、附加/分离、快照等控制器端操作（通常部署为 StatefulSet）。
  - **Node Service**：处理节点端操作，如卷挂载/卸载（通常部署为 DaemonSet）。
- **Sidecar Containers**（Kubernetes 官方提供的辅助容器）：
  - external-provisioner：监听 PVC，触发卷创建/删除。
  - external-attacher：处理卷附加/分离。
  - external-resizer：支持卷扩展。
  - external-snapshotter：支持卷快照。
  - node-driver-registrar：向 kubelet 注册驱动。
  - livenessprobe：健康检查。
- Kubernetes 通过这些 sidecar 与 CSI Driver 交互，用户无需关心底层细节。

#### 使用方式
用户通过熟悉的 Kubernetes 对象使用 CSI：
- **StorageClass**：定义 provisioner（CSI 驱动名称）和参数，支持动态供给。
- **PersistentVolumeClaim (PVC)**：申请存储。
- **PersistentVolume (PV)**：自动或手动创建。

示例 StorageClass：
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: csi.example.com  # CSI 驱动名称
parameters:
  type: ssd
allowVolumeExpansion: true  # 支持扩展
```