---
title: "Kustomization"
---

# Kustomization 概述

[使用 Kustomize 对 Kubernetes 对象进行声明式管理 | Kubernetes](https://kubernetes.io/zh-cn/docs/tasks/manage-kubernetes-objects/kustomization/)

[Kustomize - Kubernetes 原生配置管理](https://kustomize.io/)

[GitHub - kubernetes-sigs/kustomize：Kubernetes YAML 配置的定制](https://github.com/kubernetes-sigs/kustomize/)

Kustomize的核心目标在于为管理的应用生成资源配置，而这些资源配置中定义了资源的期望状态，在具体实现上，它通过kustomization.yaml文件组合和（或）叠加多种不同的来源的资源配置来生成。

Kustomize将一个特定应用的配置保存于专用的目录中，且该目录中必须有一个名为kustomization.yaml的文件作为该应用的核心控制文件。由以下kustomization.yaml文件的格式说明可以大体看出，Kustomize可以直接组合由resources字段中指定资源文件作为最终配置，也可在它们的基础上进行额外的修订，例如添加通用标签和通用注解、为各个资源添加统一的名称前缀或名称后缀、改动Pod模板中的镜像文件及向容器传递变量等。





# Kustomization Explain

```






apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources <[]string>   # 待定制的原始资源配置文件列表，将由kustomize按顺序处理
namespace <string>     # 设定所有名称空间级别资源所属的目标名称空间
commonLabels <map[string]string>  # 添加到所有资源的通用标签，包括Pod模板及相关的
# 相关的标签选择器
commonAnnotations <map[string]string>   # 添加到所有资源的通用注解
namePrefix <string>   # 统一给所有资源添加的名称前缀
nameSuffix <string>   # 统一给所有资源添加的名称后缀
images <[]Image>   # 将所有Pod模板中的符合name字段条件镜像文件修改为指定的镜像
- name <String>    # 资源清单中原有的镜像名称，即待替换的镜像
  nameName <String>   # 要使用的新镜像名称
  newTag <String>     # 要使用的新镜像的标签
  digest <String>     # 要使用的新镜像的sha256校验码
vars <[]Var>       # 指定可用于替换Pod容器参数中变量的值或容器环境变量的值
- name <String>   # 变量的名称，支持以“$(name)”格式进行引用
  objref <String>  # 包含了要引用的目标字段的对象的名称
  fieldref <String>  # 引用的字段名称，默认为metadata.name




配置生成器：

configMapGenerator <[]ConfigMapGeneratorArgs>  # ConfigMap资源生成器列表
- name <String>   # ConfigMap资源的名称，会受到namePrefix和nameSuffix的影响
  namespace <String>  # 资源所在的名称空间，会覆盖kustomize级别的名称空间设定
  behavior <String>   # 与上级同名资源的合并策略，可用取值为create/replace/merge；
  files <[]String>   # 从指定的路径加载文件生成ConfigMap，要使用当前项目的相对路径
  literals <[]String>   # 从指定的“key=value”格式的直接值生成ConfigMap
  env <String>   # 从指定的环境变量文件中加载“key=value”格式的环境变量为资源数据
secretGenerator <[]secretGeneratorArgs>  # Secret资源生成器列表
- name <String>   # Secret资源的名称，会受到namePrefix和nameSuffix的影响
  namespace <String>  # 资源所在的名称空间，会覆盖kustomize级别的名称空间设定
  behavior <String>   # 与上级同名资源的合并策略，可用取值为create/replace/merge
  files <[]String>   # 从指定的路径加载文件生成Secret，起始于当前项目的相对路径
  literals <[]String>   # 从指定的“key=value”格式的直接值生成Secret
  type <String>   # Secret资源的类型，且“kubernetes.io/tls”有特殊的键名要求
generatorOptions <GeneratorOptions>   # 当前kustomization.yaml中的ConfigMap
# 和Secret生成器专用的选项
  labels <map[String]String>   # 当前kustomization.yaml中所有生成资源添加的标签
  annotations <map[String]String>   # 为生成所有资源添加的注解
  disableNameSuffixHash <Boolean>  # 是否禁用hash名称后缀，默认为启用



资源补丁

patchesJson6902 <[]Json6902>   # 由各待补对象及其补丁文件所组成的列表
  path <String>   # 补丁文件，不含有目标资源对象的信息，支持json或yaml格式
  target <Target>   # 待补资源对象
    group <String>  # 资源所属的群组
    version <String>   # API版本
    kind <String>   # 资源类型
    name <String>   # 资源对象的名称
    namespace <string>   # 资源对象所属的名称空间
patchesStrategicMerge <[]string>   # 将补丁补到匹配的资源之上，匹配的方式是根据资源
                                         # Group/Version/Kind + Name/Namespace判断


```

