---
title: "Helm"
---

# Helm 概述
Helm 是 Kubernetes 的包管理器，类似 CentOS yum / Ubuntu apt，使用它可以极大地简化应用的部署和管理。
- https://helm.sh/zh
- https://github.com/helm/helm

# Helm 相关组件
**Helm**
- helm 是一个命令行下的客户端工具。类似于 apt / yum；
- 主要用于 Kubernetes 应用程序 Chart 的创建、打包、发布以及创建和管理本地和远程的 Chart 仓库。

**Chart**
- Helm 的软件包，每个包称为一个Chart。类似于 .deb / .rpm 包；
  - 一般Chart是由目录使用tar打包而成，形成 `name-version.tgz `格式的单一文件，方便传输和存储。
- Chart中包含的内容：
  - 一组定义 Kubernetes 资源相关的 YAML 文件
  - 运行一个 Kubernetes应用所需要的镜像、依赖关系等
- 官方Chart仓库：https://artifacthub.io/

**Repoistory**
- Helm 的软件仓库，Repository 本质上是一个 Web 服务器，该服务器保存了一系列的 Chart 软件包以供用户下载，并且提供了一个该 Repository 的 Chart 包的清单文件以供查询。
- Helm 可以同时管理多个不同的 Repository。
- 集中存储和分发Chart的仓库，类似于Perl的CPAN，或者Python的PyPI等。

**Release**
- 使用 helm install 命令在 Kubernetes 集群中部署的 Chart 称为 Release。
- 需要注意的是：Helm 中提到的 Release 和我们通常概念中的版本有所不同，这里的 Release 可以理解为 Helm 使用 Chart 包部署的一个应用实例。
- Chart实例化配置后运行于Kubernetes集群中的一个应用实例；在同一个集群上，一个Chart可以使用不同的Config重复安装多次，每次安装都会创建一个新的“发布（Release）”。
- 名为一个应用实例，但实际上一般是多个api-resources的集合

**Config**
- Chart实例化安装运行时使用的配置信息。



# Helm helm
- https://github.com/helm/helm/releases
- PS：helm 命令执行时也需要 kubeconfig 文件，通常 kubectl 命令能执行则 helm 同样也能执行。
```sh
wget https://get.helm.sh/helm-v3.13.3-linux-amd64.tar.gz
tar xf helm-v3.13.3-linux-amd64.tar.gz 
cp linux-amd64/helm /usr/local/sbin
rm -fr linux-amd64/
helm version
```



# Helm 最佳实践
## 安装/升级应用
```sh
# 添加应用对应的 helm 仓库
helm repo add grafana https://grafana.github.io/helm-charts

# 更新仓库
helm repo update

# 查看目前仓库所有可用的应用与版本，不加 -l 则只显示最新版
helm search repo grafana/loki -l | grep 'loki '

# 导出指定版本的 values 文件（文件名一定要加版本号，因为不同版本可能会有差异）
# --version 参数指定的是 CHART VERSION
helm show values grafana/loki --version 5.43.3 > values-loki-5.43.3.yaml


# 根据部署需求，手动修改 values 文件
略

# 安装/升级
# upgrade --install 为官方推荐写法，第一次执行就是 install，之后每次再执行都是 upgrade。
# loki grafana/loki --version 5.43.3 必须指定，因为 values.yaml 只是“配置覆盖”，chart 名 + 版本才是“安装哪一个软件包”。
# loki 是 Helm release 的名字（对应 helm list -A 的 name 列），grafana/loki 是 chart 的名称。
helm upgrade --install loki grafana/loki \
  --version 5.43.3 \
  --namespace monitoring \
  --create-namespace \
  -f values-loki-5.43.3.yaml
```

## 卸载应用
``` sh
# Pod、ConfigMap、Secret 等由 Helm 管理的资源会被删除，但 pvc 会保留。
helm uninstall loki --namespace monitoring

# 删除 pvc（可选）
kubectl delete pvc -n monitoring -l app.kubernetes.io/name=loki
```
## 其他常用命令
```sh
# 查看目前所有通过helm安装的应用信息（NAME 列就是 Helm release 的名字）
helm list -A

# 导出部署清单
helm get manifest cilium -n cilium > manifest.yaml

# 显示 Helm 的所有环境路径
helm env
```


# Helm FAQ
## 更新时提示网络超时
- 当修改完 values 文件后，执行 upgrade 更新软件包时，有时会提示网络超时，其根本原因是因为去互联网上下载了chart包，而链接的地址通常在境外。

```sh

# vector/vector 是去互联网下载
# helm upgrade --install vector vector/vector   --version 0.35.3   --namespace monitoring   --create-namespace   -f values-vector-0.35.3.yaml
Error: Get "https://github.com/vectordotdev/helm-charts/releases/download/vector-0.35.3/vector-0.35.3.tgz": unexpected EOF


# 解决方案一：如果本机有缓存，直接指定缓存
# 直接使用本地 .tgz 文件
helm upgrade --install vector /root/.cache/helm/repository/vector-0.35.3.tgz \
  --namespace monitoring \
  --create-namespace \
  -f values-vector-0.35.3.yaml
# 或者先将缓存文件复制/重命名到当前目录，再升级
cp /root/.cache/helm/repository/vector-0.35.3.tgz .
helm upgrade --install vector ./vector-0.35.3.tgz \
  --namespace monitoring \
  --create-namespace \
  -f values-vector-0.35.3.yaml \
  --timeout 10m


# 解决方案二：本机开代理下载 Chart，而后拷贝至目标服务器
helm pull vector/vector --version 0.35.3 # 将 vector-0.35.3.tgz 下载至当前目录
```
