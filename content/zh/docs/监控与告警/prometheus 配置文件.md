---
title: "prometheus 基础"
---

# 配置文件结构
参考文档：https://prometheus.io/docs/prometheus/latest/configuration/configuration/
```yaml
# 全局配置段，包括抓取间隔和评估间隔等。
global:
...

# 指定需要被抓取的目标，支持服务发现、静态配置等方式。
scrape_configs:
...


# 告警规则定义
rule_files:
...

# 定义报警发往何处
# 定义用于触发警报的规则。这些规则基于时间序列数据的评估，当满足特定条件时，将会触发相应的警报。
alerting:
...

# 允许将时间序列数据远程写入其他存储后端，如 Cortex、Thanos 等。
remote_write:
...

# 配置 Prometheus 实例以从其他存储后端读取时间序列数据。
remote_read:
...

# 指定 Prometheus 的本地存储选项，例如数据的保存路径、保留策略等。
storage:
...
```

---

# global
```yaml
global:
  scrape_interval: 1m # 多久 Pull 一次 Targets 上的指标数据（向 /metrics 发送 GET）
  scrape_timeout: 10s # Pull Targets 的超时时间，超时则无法获得本次指标数据（Target 显示 DOWN）
  evaluation_interval: 1m # 告警规则和记录规则的评估间隔时间。
  external_labels: # 所有由该 Prometheus 实例抓取和记录的时间序列都会自动带上这些标签。
    # 这些标签来区分来自不同 Prometheus 实例的指标数据；
    # 使用 Thanos 或 Cortex 等系统将多个 Prometheus 实例的数据聚合到一个中心存储时，这些标签能确保所有数据点的来源是唯一且可识别的。
    prometheus: kubesphere-monitoring-system/k8s
    prometheus_replica: prometheus-k8s-1
```
**什么是告警规则和记录规则？**
- 告警规则定义了在什么条件下，Prometheus 应该生成一个警报。记录规则定义了一个新的、预先计算好的时间序列指标。


# scrape_configs
- `scrape_configs` 用于定义要由 Prometheus 抓取（scrape）的目标。每个`scrape_configs`块中包含一个或多个`job`，而`job`定义了要抓取的一组目标以及与该组目标相关的配置。
- 方式分为静态配置和服务发现两种，服务发现可基于文件、k8s、consul 等。

## kubernetes_sd_configs
```yaml
scrape_configs:
- job_name: serviceMonitor/kubesphere-monitoring-system/kube-apiserver/0 # 相识指标的集合，会在 Prometheus UI 中的 Targets 显示。

  # 1. 抓取行为基本配置
  honor_timestamps: true # 是否保留目标导出的时间戳（通常为 true）。
  scrape_interval: 1m # 抓取该目标指标的时间间隔，优先级高于 global 中的定义。
  scrape_timeout: 10s # 等待目标响应的最大时间，优先级高于 global 中的定义。

  # 2. 连接/安全配置
  metrics_path: /metrics # 抓取指标的 HTTP 路径。
  scheme: https # 连接协议
  follow_redirects: true # 是否跟随 HTTP 重定向。
  authorization: # 授权配置
    type: Bearer # 使用 Bearer Token 进行认证
    credentials_file: /var/run/secrets/kubernetes.io/serviceaccount/token # Token 文件的路径。
  tls_config: # 用于 HTTPS 连接的安全配置
    ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt # 验证服务端证书的 CA 证书文件路径。
    server_name: kubernetes # 用于 TLS 握手时的 Server Name Indication (SNI)。
    insecure_skip_verify: false # 是否跳过证书验证（false 表示不跳过，需要验证）。

  # 3. 基于 K8s 的服务发现配置
  kubernetes_sd_configs:
  - role: endpoints # 发现 Kubernetes Service 的 Endpoints（即 Pod IP 和端口）。
    kubeconfig_file: "" # KubeConfig 文件，空字符串表示使用 Pod 内部的 ServiceAccount 访问 API。
    follow_redirects: true # 服务发现请求是否跟随重定向。
    namespaces: # namespaces 过滤（限制服务发现的命名空间）
      own_namespace: false # false 表示抓取 names 中定义的 namespaces，true 表示仅抓取当前 Prometheus 运行的 namespaces。
      names:
      - default # 只发现 default 命名空间内的目标。
    # 以上配置表示，Prometheus 只会尝试抓取 default 命名空间内，匹配 role: endpoints 和后续 relabel_configs 条件的目标。

  # 4. Targets Relabel 配置，作用于服务发现 (Service Discovery) 之后，实际抓取 (Scrape) 之前。
  # 用于修改目标的地址、端口，或为目标添加/删除/修改标签（例如 instance, job 等），以决定 是否抓取 该目标。
  # 详情参阅 Prometheus Relabel 文章
  relabel_configs:
  ...

  # 5. Metric Relabel 配置，作用于实际抓取 (Scrape) 之后，存储 (Storage) 之前。
  # 用于修改抓取到的指标的名称或标签（例如 code, method 等），以决定 是否保留 该指标。
  # 详情参阅 Prometheus Relabel 文章
  metric_relabel_configs:
  ...
```

## file_sd_configs
- 基于文件的服务发现配置，它仅仅略优于静态配置的服务发现方式，它不依赖于任何平台或第三方服务，因而也是最为简单和通用的实现方式
- Prometheus server 会定期从文件中加载 target 信息
```yaml
# 在 Prometheus 的配置文件中，需要添加一个 `file_sd_configs` 部分，用于指定服务发现文件的路径。以下是一个简化的例子：
scrape_configs:
  - job_name: 'file-service-discovery'
    file_sd_configs:
      - files:
        - '/path/to/service-discovery-file.json'
# 这个配置告诉 Prometheus 定期读取指定路径下的服务发现文件，并监控其中定义的服务实例。

# =============================================================================================

# 服务发现文件的具体格式取决于你的需求，但通常每个实例都有一些基本信息，例如 IP 地址、端口和标签等。以下是一个简化的 JSON 示例：
# /path/to/service-discovery-file.json
[
  {
    "targets": ["10.0.0.1:8080"],
    "labels": {
      "job": "example-job",
      "env": "production"
    }
  },
  {
    "targets": ["10.0.0.2:8080"],
    "labels": {
      "job": "example-job",
      "env": "staging"
    }
  }
]
# 在这个例子中，有两个服务实例，每个实例都有一个 targets 数组表示实例的地址和端口，以及一个 labels 对象表示实例的标签。
```

## static_configs
- `static_configs` 用于定义静态的监控目标和相关的配置。以下是一个使用`static_configs`的简单示例：
```yaml
scrape_configs:
  - job_name: 'example_job'
    static_configs:
      - targets: ['localhost:9090', 'example.com:8080']
        labels:
          environment: 'production'
      - targets: ['anotherhost:9100']
        labels:
          environment: 'testing'
```
在这个例子中，我们定义了一个名为`example_job`的作业，其中包含两个静态监控目标。第一个目标是`localhost:9090`，并且被标记为`environment: 'production'`，而第二个目标是`example.com:8080`，同样被标记为`environment: 'production'`。另外，还添加了一个带有`environment: 'testing'`标签的目标`anotherhost:9100`。这样，Prometheus就可以使用这些配置来抓取和处理这些目标的监控数据。


# 配置文件语法检查
```sh
promtool check config /monitor/prometheus-2.37.1.linux-amd64/prometheus.yml
```