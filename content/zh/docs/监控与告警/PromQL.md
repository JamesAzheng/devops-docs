---
title: "PromQL"
---

# Metric 类型
Prometheus 客户端库主要提供四种主要的 metric 类型：
## Counter 计数器
- 一种只能累加的 metric，其值从0开始只能增加，不会减少；重启进程后，会被重置
- 典型应用：http的请求数、下单数、结束的任务数、出现的错误数等等。
- 示例：查询 `http_requests_total{method=”get”, job=”Prometheus”, handler=”query”}` 返回 8，10 秒后，再次查询，则返回 14。
- 常见操作： 通常使用 rate() 或 irate() 函数来计算其变化率（例如，每秒的请求数）。

**通常，Counter的总数并没有直接作用，而是需要借助于rate、topk、increase和irate等函数来生成样本数据的变化状况（增长率）；**

- rate(http_requests_total[2h])，获取2小内，该指标下各时间序列上的http总请求数的增长速率；
  - **增长速率是指单位时间内增长的数量**
- topk(3, http_requests_total)，获取该指标下http请求总数排名前3的时间序列；
- irate(http_requests_total[2h])，高灵敏度函数，用于计算指标的瞬时速率；
  - 基于样本范围内的最后两个样本进行计算，相较于rate函数来说，irate更适用于短期时间范围内的
    变化速率分析；

## Gauge 仪表盘
- 一个可增减的值，可以随时间增加或减少，用于存储有着起伏特征的指标数据。
- 典型应用：内存的使用量、CPU 的当前温度、队列中的消息数、当前并发请求数等、运行的 goroutines 的个数。
- 示例：go_goroutines{instance=”172.17.0.2”, job=”Prometheus”} 返回值 147，10 秒后返回 124。

**Gauge用于存储其值可增可减的指标的样本数据，常用于进行求和、取平均值、最小值、最大值等聚合计算；也会经常结合PromQL的predict_linear和delta函数使用；**
`predict_linear(v range-vector, t, scalar)` 函数可以预测时间序列v在t秒后的值，它通过线性回归的方式来预测样本数据的Gauge变化趋势；
`delta(v range-vector)` 函数计算范围向量中每个时间序列元素的第一个值与最后一个值之差，从而展示不同时间点上的样本值的差值；
- `delta(cpu_temp_celsius{host="web01.xiangzheng.com"}[2h])`，返回该服务器上的CPU温度与2小时之前的差异；

## Histogram 直方图
- 可以理解为柱状图，它会在一段时间范围内对数据进行采样，并将其计入可配置的 bucket 之中，用于分组及统计。
  - 暴露三个指标：_bucket, _sum, _count。
- Histogram 更适合监测一个一系列事件的持续时间或大小的分布情况；
- 典型应用：HTTP 请求延迟、数据库查询时间、响应体大小。
- 常见操作： 用于计算分位数（如 P95、P99），通常配合 `histogram_quantile()` 函数使用。

**示例：API 请求处理延迟**

假设您的 API 收到 1000 个请求，您想知道这些请求的处理时间分布，特别是 99% 的请求是否在 500 毫秒内完成。

Histogram 不记录 1000 个延迟值本身，而是定义一组**分桶**（例如 100ms, 250ms, 500ms, 1s），然后记录有多少次请求的延迟落入每个分桶。
**Prometheus 实际暴露的指标：**

| **指标名称**                           | **标签 (le)** | **值 (计数)** | **含义**                               |
| -------------------------------------- | ------------- | ------------- | -------------------------------------- |
| `http_request_duration_seconds_bucket` | `{le="0.1"}`  | 100           | 100个请求延迟 ≤ 0.1 秒             |
| `http_request_duration_seconds_bucket` | `{le="0.25"}` | 500           | 500个请求延迟 ≤ 0.25 秒            |
| `http_request_duration_seconds_bucket` | `{le="0.5"}`  | 950           | 950个请求延迟 ≤ 0.5 秒             |
| `http_request_duration_seconds_bucket` | `{le="+Inf"}` | 1000          | 1000个请求延迟 $ + ∞ 秒 (总数) |
| `http_request_duration_seconds_sum`    | (无)          | 150.0         | 所有请求延迟的总和（秒）               |
| `http_request_duration_seconds_count`  | (无)          | 1000          | 请求总数                               |

- **特点：** 它是一组**统计数据**，反映了一段时间内**采样值的分布**。

- 查询： 通常用于计算分位数，例如计算 P99 (第 99 百分位数) 延迟：
  - `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))` 在过去 5 分钟内，有 99% 的用户请求，其延迟（响应时间）最高是多少？
  - 内层 rate： 将 5 分钟内的累积计数转换为每秒的请求延迟分布。
  - 外层 histogram_quantile(0.99, ...)： 根据这个每秒分布，计算出 99% 的请求所能达到的最大延迟时间。
  - 最终结果的意义： 如果结果是 500ms，就说明你的系统在过去 5 分钟内，有 99% 的用户请求都在 500ms 或更短的时间内得到了响应。这是一个非常重要的服务等级指标（SLI）。

- **Gauge** 回答：“**现在**是什么？”
- **Histogram** 回答：“**在一段时间内**，**大部分**事件的速度（或大小）是多少？”

---

## Summary 摘要
- 与 Histogram 类似，也是用于对采样值进行统计，它在客户端计算和存储。
- 典型应用：请求持续时间，响应大小。

# PromQL 概述
- Prometheus Query Language
- 当 Prometheus 从系统和服务收集指标数据时，它会把数据存储在内置的时序数据库（TSDB）中，要对收集到的数据进行任何处理，我们都可以使用 PromQL 从 TSDB 中读取数据，同时可以对所选的数据执行过滤、聚合以及其他转换操作。
- 外部用户和 UI 界面可以使用 Prometheus 服务提供的 [HTTP API](https://prometheus.io/docs/prometheus/latest/querying/api/) 来执行 PromQL 查询。这就是仪表盘软件（例如 [Grafana](https://grafana.com/grafana/)、[PromLens](https://promlens.com/) 以及 Prometheus 内置 Web UI）访问 PromQL 的方式。


# PromQL 基础语法
**`<metric name> {<label name>=<label value>, …}`**
- **metric name** 指标名称：通常用于描述系统上要测定的某个特征；例如`http_requests_total` 表示接收到的HTTP请求总数
- **label name** 标签：可选项；键值型数据，附加在指标名称之上，从而让指标能够支持多纬度特征；例如`http_requests_total{method=GET}` 和 `http_requests_total{method=POST}` 代表着两个不同的时间序列，以 __ 开头的标签名是Prometheus 系统内部保留使用的。

**注意事项：**
- `metric name`、`label name`仅支持字母、数字和下划线，且必须能匹配RE2规范的正则表达式`[a-zA-Z_:][a-zA-Z0-9_:]*`；
- 指标名称和标签的特定组合代表着一个时间序列；更改任何标签值，包括添加或删除标签，都会创建一个新的时间序列；
- **应该尽可能地保持标签的稳定性**，否则，则很可能创建新的时间序列，更甚者会生成一个动态的数据环境，并使得监控的数据源难以跟踪，从而导致建立在该指标之上的图形、告警及记录规则变得无效。



# PromQL 匹配操作符
**定义标签过滤条件，目前支持如下4种匹配操作符：**
- `=` 完全相等
- `!=` 不等于
- `=~` 正则匹配
- `!~` 正则匹配取反

**示例：**
```sh
# 统计 master 节点数量
count(up{job="kubernetes-nodes", instance=~'k8s-master.*'})
```

# PromQL 函数
## 聚合函数
**Prometheus 内置提供了11个聚合函数：**
- `sum()` 对样本值求和
- `avg()` 对样本值求平均值，这是进行指标数据分析的标准方法
- `count()` 对分组内的时间序列进行数量统计
- `stddev()` 对样本值求标准差，以帮助用户了解数据的波动大小（或称之为波动程度）
- `stdvar()` 对样本值求方差，它是求取标准差过程中的中间状态
- `min()` 求取样本值中的最小者
- `max()` 求取样本值中的最大者
- `topk()` 逆序返回分组内的样本值最大的前k个时间序列及其值
- `bottomk()` 顺序返回分组内的样本值最小的前k个时间序列及其值
- `quantile()` 分位数用于评估数据的分布状态，该函数会返回分组内指定的分位数的值，即数值落在小于等于指定的分位区间的比例
- `count_values()` 对分组内的时间序列的样本值进行数量统计对每一个样本值进行分别计数

**聚合操作语法：**
- `<aggr-op>([parameter,] <vector expression>) [without|by (<label list>)] `
- `<aggr-op> [without|by (<label list>)] ([parameter,] <vector expression>)`
  - aggr-op：聚合操作，指定聚合函数
  - parameter：对于 topk、bottomk 聚合函数返回结果的取值范围

  - without：从结果向量中删除由without子句指定的标签，未指定的那部分标签则用作分组标准；

  - by：功能与without刚好相反，它仅使用by子句中指定的标签进行聚合，结果向量中出现但未被by子句指定的标签则会被忽略；
    - 为了保留上下文信息，使用by子句时需要显式指定其结果中原本出现的job、instance等一类的标签
- 分组聚合：先分组、后聚合
- 事实上，各函数工作机制的不同之处也仅在于计算操作本身，PromQL对于它们的执行逻辑相似；

### count
- K8s 节点状态统计
```sh
# 统计 master 节点数量
count(up{job="kubernetes-nodes", instance=~'k8s-master.*'})
```

- 计算CPU核心数
```sh
count(count(node_cpu_seconds_total{instance="$node",job="$job"}) by (cpu))
count(count(node_cpu_seconds_total{instance="10.0.0.7:9100",job="nodes"}) by (cpu))


# 打印出每号CPU的各种状态，例如：0号CPU的idle、system、user等总计8种状态，如果有两个CPU则总计会返回0号和1号CPU的总计16条信息。
node_cpu_seconds_total{instance="10.0.0.7:9100",job="nodes"}


# 计数，1颗cpu返回8，2颗返回16，以此类推。
count(node_cpu_seconds_total{instance="10.0.0.7:9100",job="nodes"})


# 根据CPU分组，最后得到实际CPU的个数
count(count(node_cpu_seconds_total{instance="10.0.0.7:9100",job="nodes"}) by (cpu))
```

## 内建函数
https://prometheus.io/docs/prometheus/latest/querying/functions

### rate
`rate()` 函数用于计算某个 Counter 类型指标，在单位时间内的增长速率。

语法：`rate(指标名称[时间范围])`

示例：
```sh
# 计算在过去 5 分钟内的 HTTP 请求速率。
rate(http_requests_total[5m])

# 意思是“看看过去5分钟（5m）这个计数器一共涨了多少，然后除以300秒，给我算出每秒平均增长速度”
# 过去5分钟涨了300 → rate = 300 ÷ 300秒 = 1 次/秒
# 过去5分钟涨了1500 → rate = 1500 ÷ 300秒 = 5 次/秒
```

### irate
`irate()` 也是把 Counter 变成“每秒速度”，但它只看过去时间窗口里的最后两个数据点的增长速度，反应的是瞬间速率（超级敏感，适合抓突发峰值）。

语法：`irate(指标名称[时间范围])`

示例：
```sh
# 看当前这一瞬间的请求速度有多猛
irate(http_requests_total[5m])

# 假设：Prometheus 每10秒刮擦一次数据（典型间隔）。
# 过去5分钟（300秒）窗口里，有一堆样本点。
# 但 irate 只关心最后两个点：比如 t=295秒 值=1000，t=300秒 值=1100（最后5秒内突然涨了100）。
# 增长 = 1100 - 1000 = 100
# 时间差 = 300 - 295 = 5秒（注意：实际时间差取决于刮擦间隔，不是固定5秒）
# irate = 100 ÷ 5 = 20 次/秒（瞬间爆发20 QPS！）
# 而 rate() 会用整个5分钟的第一个和最后一个点算平均，可能过去5分钟总涨了1500，rate=1500÷300=5 次/秒（平滑，看不出瞬间峰值）
```

rate 和 irate 的区别：
- rate 计算的是单位时间内的平均增长速率，适合像 CPU 使用率、磁盘 IO 这种场景，线条比较平滑。
- irate 是高灵敏函数，计算的是单位时间内**最后两个数据点的瞬时速率**，适合像 HTTP 请求速率（QPS）、突发性网络流量这种场景，线条比较陡峭。
- 简单来讲，irare 更加敏感，它能看到一些瞬时、突发的情况。而rate 更平滑，

### increase
`increase()` 函数用于计算某个 Counter 类型指标，在指定时间范围内的增量（增长值）。
语法：`increase(指标名称[时间范围])`

示例：
```sh
# 看过去5分钟总共处理了多少个成功的GET请求：
increase(http_requests_total{method="GET", code="200"}[5m])
```

### time
- 返回自1970年1月1日UTC以来的秒数。
```sh
# 系统启动的时间，unix时间戳为单位，以秒为单位
node_boot_time_seconds{instance=~"10.0.0.18:9100"}

# time()函数以unix时间戳的方式打印当前时间，减去启动时间，即得到启动的秒数
time() - node_boot_time_seconds{instance=~"10.0.0.18:9100"}

# /60 得到启动的分钟
(time() - node_boot_time_seconds{instance=~"10.0.0.18:9100"}) / 60


# grafana中写法，因为可以实现自动单位转换
avg(time() - node_boot_time_seconds{instance=~"$instance"})
```

# PromQL 分组聚合
PromQL（Prometheus Query Language）中的分组聚合主要通过两个关键字实现：
- `by`：按指定的标签分组（分组聚合）
- `without`：排除指定的标签后，把剩余所有标签作为分组依据（常用于去掉一些噪音标签）

它的核心作用是：在聚合运算（sum、avg、count、min、max、topk、bottomk 等）时，先按照某些标签把指标划分成不同的组，然后对每个组分别进行聚合计算。

没有分组 = 对所有时间序列整体聚合

有分组 = 对每一组（相同标签值的组合）分别聚合，得到多条结果序列

**示例：基于 by 实现单标签分组：**
- 假设我们有指标：`http_requests_total{job="api-server", instance="1.2.3.4:9090", code="200", method="get"}`
```sh
# 统计整个集群总的HTTP请求数（不分组）：
sum(http_requests_total)
# 结果：只有1条时间序列，整个集群的总和


# 按状态码统计总请求数（按code分组）：
sum(http_requests_total) by (code)
# 结果：
# {code="200"}  => 很大一堆
# {code="404"}  => 少一点
# {code="500"}  => 很少
```

**示例：基于 by 实现多标签分组：**
```sh
# 按方法和状态码一起分组
sum(http_requests_total) by (method, code)
```

**示例：基于 without 实现多标签分组：**
- 使用 without 去掉某些标签（常用于去掉instance、pod等噪声标签）
```sh
# 去掉instance和pod标签后，按剩下的所有标签分组求和
# 典型场景：统计每个服务、每个路由的总QPS，不关心具体是哪台机器
sum(http_requests_total) without (instance, pod)
```

**示例：生产环境参考**
```sh
# 1. 每个服务的总QPS（去掉机器维度）
sum(rate(http_requests_total[5m])) without (instance)

# 2. 每个服务的错误率（按job + code分组）
sum(rate(http_requests_total[5m])) by (job, code) 

# 3. 每个路由的P99延迟（去掉instance）
histogram_quantile(0.99, 
  sum(rate(http_request_duration_seconds_bucket[5m])) without (instance) by (le, route)
)

# 4. top 10 请求最多的路径
topk(10, sum(rate(http_requests_total[5m])) by (route))

# 5. 统计集群中不同job有多少个实例在运行（count by job）
count(count by (instance, job) (up)) by (job)
# 或者更简单：
count(up) by (job)
```

# FAQ