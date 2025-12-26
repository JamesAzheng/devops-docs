---
title: "Longhorn"
weight: 10
---

# Longhorn

## Longhorn 概述

- Longhorn StorageClass 可以将工作负载绑定到 PV，而无需在 Kubernetes 中创建StorageClass 对象

- Longhorn是由Rancher创建的一款云原生的、轻量级、可靠且易用的开源**分布式块存储系统**。部署到K8s集群上之后，Longhorn会自动将集群中所有节点上可用的本地存储聚集为存储集群，然后利用这些存储管理分布式、带有复制功能的块存储，支持快照和数据备份。
- Longhorn 属于典型的 Out-of-Tree  数外型存储（k8s原生不支持的，需额外部署一些Pod 然后再基于CSI实现）
- https://longhorn.io/



## Longhorn deploy

- https://longhorn.io/docs/1.2.5/deploy/install/install-with-kubectl/

### 先决条件

- https://longhorn.io/docs/1.2.5/deploy/install/#installation-requirements

#### 安装依赖项

- 在所有 master 和 node 节点上安装

```bash
# Ubuntu
apt -y install jq nfs-common open-iscsi
```

#### 启动所需服务

```bash
systemctl enable --now iscsid
```

#### 执行环境检查脚本

- https://github.com/longhorn/longhorn/blob/v1.2.5/scripts/environment_check.sh

```bash
# mkdir /k8s-yaml/longhorn

# cd /k8s-yaml/longhorn

# wget https://raw.githubusercontent.com/longhorn/longhorn/v1.2.5/scripts/environment_check.sh

# bash environment_check.sh
[INFO]  Required dependencies are installed.
[INFO]  Waiting for longhorn-environment-check pods to become ready (0/2)...
[INFO]  All longhorn-environment-check pods are ready (2/2).
[INFO]  Required packages are installed.
[INFO]  MountPropagation is enabled.
[INFO]  Cleaning up longhorn-environment-check pods...
[INFO]  Cleanup completed. # ok
```



### kubectl deploy

```sh
# pwd
/k8s-yaml/longhorn


# wget https://raw.githubusercontent.com/longhorn/longhorn/v1.2.5/deploy/longhorn.yaml
```

- **部署前自定义默认设置：**https://github.com/longhorn/website/edit/master/content/docs/1.2.5/advanced-resources/deploy/customizing-default-settings.md)

```bash
# kubectl apply -f longhorn.yaml
...


# 可以监视安装进度
# kubectl get pod -n longhorn-system -w
...


# 全部running即为运行成功

```



## Longhorn UI

- 要启用对 Longhorn UI 的访问，您需要设置一个 Ingress 控制器。默认情况下不启用对 Longhorn UI 的身份验证。有关使用基本身份验证创建 NGINX Ingress 控制器的信息，请参阅[本节。](https://longhorn.io/docs/1.2.5/deploy/accessing-the-ui/longhorn-ingress)
- [使用这些步骤](https://longhorn.io/docs/1.2.5/deploy/accessing-the-ui)访问 Longhorn UI 。

通过动态修改 Longhorn Service 的方式临时访问 Longhorn UI 

```bash
#
```

