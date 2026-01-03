---
title: 文档首页
---

👋 Hi，我是阿征，一名资深的运维工程师👨‍💻，擅长Kubernetes、CICD、监控等技术栈。欢迎来到我的个人主页✨在这里一起解锁 DevOps/SRE 的运维魔法吧～

## 📚 文档分类

本网站整理了我在运维实践中的技术笔记和经验总结，涵盖了 DevOps/SRE 领域的各个方面。以下是文档的主要分类：

### 🐳 容器与编排
- **[Kubernetes](/docs/kubernetes/)** - K8s 集群管理、Pod、Service、Ingress、RBAC、CRD 等核心组件与实践
- **[容器](/docs/容器/)** - Docker、Containerd、Cgroup 等容器技术

### 🔄 CI/CD 与自动化
- **[CI/CD](/docs/cicd/)** - Jenkins、GitLab CI、SonarQube、Git 等持续集成与持续部署
- **[GitOps](/docs/gitops/)** - GitOps 实践与工具

### 📊 监控与可观测性
- **[监控与告警](/docs/监控与告警/)** - Prometheus、Grafana、Zabbix、Alertmanager 等监控解决方案
- **[日志采集](/docs/日志采集/)** - Vector、Loki、ELK Stack、Fluentd、Filebeat 等日志收集与分析

### 🌐 网络与服务
- **[HTTP](/docs/http/)** - Nginx、Apache、Tomcat、CA 证书管理等 Web 技术
- **[负载均衡与高可用](/docs/负载均衡与高可用/)** - HAProxy、Keepalived、LVS 等负载均衡技术
- **[基础服务](/docs/基础服务/)** - DNS、DHCP、FTP、SAMBA、NTP、Nexus、SSH 等基础服务

### 💾 存储与数据
- **[存储](/docs/存储/)** - Ceph、NFS 等存储解决方案
- **[关系型与非关系型数据库](/docs/关系型与非关系型数据库/)** - 各类数据库技术与实践

### 🔐 安全与审计
- **[VPN](/docs/vpn/)** - OpenVPN 等 VPN 技术
- **[堡垒机](/docs/堡垒机/)** - JumpServer 等堡垒机技术

### 🖥️ 基础设施
- **[Linux](/docs/linux/)** - 系统管理、网络管理、磁盘管理、内存管理、Systemd 等
- **[Shell](/docs/shell/)** - Shell 脚本编写与最佳实践
- **[虚拟化](/docs/虚拟化/)** - KVM 等虚拟化技术
- **[AWS](/docs/aws/)** - 云平台相关实践

### 📨 消息与大数据
- **[消息队列](/docs/消息队列/)** - Kafka、RabbitMQ 等消息中间件
- **[大数据](/docs/大数据/)** - Hive 等大数据技术
- **[注册中心](/docs/注册中心/)** - ZooKeeper 等注册中心技术

### 💻 编程语言
- **[Python](/docs/python/)** - Python 编程、Flask、FastAPI、SQLAlchemy 等
- **[编程语言](/docs/编程语言/)** - Go、Java、C、SQL、前端开发等多语言技术

### 📖 面试与学习
- **[面试宝典](/docs/面试宝典/)** - 常见面试题汇总与解答

## 🎯 文档特点

- **实战导向**：所有内容都来自实际生产环境的实践和总结
- **持续更新**：随着技术栈的演进和经验的积累，文档会持续更新
- **最佳实践**：不仅介绍工具使用方法，更注重分享最佳实践和踩坑经验

## 🚀 快速开始

你可以通过左侧导航栏浏览各个分类，或者使用搜索功能快速找到你需要的内容。

---

*希望这些文档能帮助你在 DevOps/SRE 的道路上少走弯路，共同成长！* 🎉





## 一级标题

### 二级标题

#### 三级标题

```sh {filename="/etc/profile"}
# /etc/profile: system-wide .profile file for the Bourne shell (sh(1))
# and Bourne compatible shells (bash(1), ksh(1), ash(1), ...).

if [ "${PS1-}" ]; then
  if [ "${BASH-}" ] && [ "$BASH" != "/bin/sh" ]; then
    # The file bash.bashrc already sets the default PS1.
    # PS1='\h:\w\$ '
    if [ -f /etc/bash.bashrc ]; then
      . /etc/bash.bashrc
    fi
  else
    if [ "$(id -u)" -eq 0 ]; then
      PS1='# '
    else
      PS1='$ '
    fi
  fi
fi

if [ -d /etc/profile.d ]; then
  for i in /etc/profile.d/*.sh; do
    if [ -r $i ]; then
      . $i
    fi
  done
  unset i
fi
```


{{< tabpane text=true persist=lang >}}
{{< tab header="Configuration file:" disabled=true />}}
{{% tab header="hugo.toml" lang="toml" %}}

```toml
[params]
[params.ui]
showLightDarkModeMenu = true
```

{{% /tab %}} {{% tab header="hugo.yaml" lang="yaml" %}}

```yaml
params:
  ui:
    showLightDarkModeMenu: true
```

{{% /tab %}} {{% tab header="hugo.json" lang="json" %}}

```json
{
  "params": {
    "ui": {
      "showLightDarkModeMenu": true
    }
  }
}
```

{{% /tab %}} {{< /tabpane >}}

{{% alert title="<i class='fa-solid fa-exclamation-triangle pe-1'></i> 注意事项" color=warning %}}
具体内容。
{{% /alert %}}

{{% alert title="<i class='fa-solid fa-check-circle pe-1'></i> 操作成功" color="success" %}}
恭喜！您已成功完成配置，现在可以进行下一步操作。
{{% /alert %}}

{{% alert title="<i class='fa-solid fa-info-circle pe-1'></i> 提示信息" color="info" %}}
这是一个补充说明。
{{% /alert %}}

{{% alert title="<i class='fa-solid fa-ban pe-1'></i> 严重错误" color="danger" %}}
请勿在生产环境中执行此命令，否则可能会导致不可逆的数据丢失！
{{% /alert %}}

{{% alert title="<i class='fa-solid fa-lightbulb pe-1'></i> 实用技巧" color="primary" %}}
你可以通过修改 config.toml 文件来全局设置默认的项目颜色。
{{% /alert %}}


<strong style="color: red;">这段文字是红色加粗的</strong>

<span style="color: red;">这段文字是红色的</span>