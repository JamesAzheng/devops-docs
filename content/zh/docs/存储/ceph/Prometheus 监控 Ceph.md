
---
title: "Prometheus 监控 Ceph"
---

# 参考文档

- http://docs.ceph.com/docs/mimic/mgr/prometheus/



# 启用 prometheus 模块

- Ceph Manager内置了众多模块，包括prometheus模块，⽤于直接输出Prometheus风格的指标数据。

```sh
# ceph mgr module enable prometheus


# ceph mgr module ls
{
    "enabled_modules": [
        "balancer",
        "crash",
        "dashboard",
        "iostat",
        "prometheus", # 验证
...


# 查看目前活跃的mgr节点
# ceph -s
...
  services:
    mon: 3 daemons, quorum stor01,stor02,stor03
    mgr: stor02(active), standbys: stor01
...


# 活跃的mgr位于stor02，即10.0.0.17，prometheus module默认会监听在9283端口
# curl 10.0.0.17:9283/metrics

# HELP ceph_paxos_store_state_latency_sum Storing state latency Total
# TYPE ceph_paxos_store_state_latency_sum counter
ceph_paxos_store_state_latency_sum{ceph_daemon="mon.stor03"} 22.663664887
ceph_paxos_store_state_latency_sum{ceph_daemon="mon.stor02"} 26.437775038
# HELP ceph_pg_incomplete PG incomplete
# TYPE ceph_pg_incomplete gauge
ceph_pg_incomplete{pool_id="4"} 0.0
ceph_pg_incomplete{pool_id="7"} 0.0
ceph_pg_incomplete{pool_id="6"} 0.0
ceph_pg_incomplete{pool_id="12"} 0.0
ceph_pg_incomplete{pool_id="3"} 0.0
ceph_pg_incomplete{pool_id="8"} 0.0
ceph_pg_incomplete{pool_id="5"} 0.0
...
```





# 配置 Prometheus Job

- 修改Prometheus的配置⽂件，添加与Ceph相关的Job。

```sh
# vim /usr/local/prometheus/prometheus.yml
...
scrape_configs:
...
  - job_name: "ceph"
    static_configs:
      - targets:
        - 10.0.0.17:9283
```





# 配置 Grafana

- dashboard ID参考：2842