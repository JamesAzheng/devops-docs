---
title: "GitOps"
---
### GitOps 笔记

#### 一、GitOps 概述

**什么是 GitOps？**  
GitOps 是一种云原生时代的运维模式和最佳实践，由 Weaveworks 于 2017 年提出。它将 Git 仓库作为**唯一的真相来源（Single Source of Truth）**，用于管理基础设施和应用程序的声明式配置。所有变更通过 Git 的 Pull Request（或 Merge Request）来驱动，自动化工具（如 ArgoCD 或 Flux）负责将 Git 中的期望状态同步到实际环境中（尤其是 Kubernetes 集群）。

GitOps 是 DevOps 的延伸，专注于**持续部署（Continuous Deployment）**，强调声明式（Declarative）而非命令式（Imperative）操作。

**核心原则（OpenGitOps 项目定义的四大原则）**：
1. **整个系统声明式描述**：所有配置（基础设施、应用）都用声明式文件（如 YAML）描述，并存储在 Git 中。
2. **Git 作为规范状态的唯一来源**：Git 仓库定义了系统的“期望状态”，任何变更必须通过 Git 提交。
3. **变更通过合并请求批准并应用**：利用 Git 的代码审查、分支策略，确保变更可审计、可追溯。
4. **软件代理自动确保一致性**：工具持续监控实际状态与 Git 中的差异，自动校正（漂移检测与修复）。

**GitOps 的优势**：
- **安全性高**：开发者无需直接访问 Kubernetes 集群权限，只需 Git 权限；工具运行在集群内（Pull 模式），减少暴露风险。
- **可靠性强**：Git 提供版本控制、审计轨迹、快速回滚。
- **一致性好**：避免手动操作导致的配置漂移，生产/测试环境易保持一致。
- **协作高效**：开发者熟悉 Git，易于代码审查和团队协作。
- **自动化程度高**：支持多集群、多环境管理，适合云原生应用。

**与传统 CI/CD 的区别**：
- 传统 CI/CD 多为 Push 模式（CI 服务器推送变更到集群）。
- GitOps 多为 Pull 模式（集群内工具拉取 Git 变更），更安全、更适合 Kubernetes 的声明式架构。

**常见工具**：
- **ArgoCD**：UI 丰富、易上手，支持多集群、渐进式交付（Canary/Blue-Green）。
- **FluxCD**：Kubernetes 原生、更轻量、模块化强。

#### 二、GitOps 实践（以 Kubernetes 为例）

在 Kubernetes 中，GitOps 主要通过工具管理资源的部署。资源配置可以是**普通 YAML 清单**（Plain Manifests）或 **Helm Charts**。下面分别说明如何通过 Git 管理它们。

**推荐仓库结构（最佳实践）**：
- 分离应用代码仓库和配置仓库（避免 CI 无限循环）。
- 多环境结构示例：
  ```
  config-repo/
  ├── base/                  # 基础配置（共用）
  │   ├── deployment.yaml
  │   └── service.yaml
  ├── overlays/
  │   ├── dev/               # 开发环境覆盖
  │   │   └── values-dev.yaml
  │   ├── staging/           # 测试环境
  │   └── prod/              # 生产环境
  └── apps/                  # 应用级配置
      └── my-app/
          ├── kustomization.yaml  # 或 Helm Chart
  ```
- 使用 Kustomize 或 Helm 处理环境差异（避免重复）。

**1. 使用普通 YAML 清单管理（Plain Manifests）**

普通 YAML 是最直接的方式，适合简单应用或自定义资源。

**步骤**：
- 将 Kubernetes 资源清单（如 Deployment、Service、ConfigMap）放入 Git 仓库。
- 使用工具（如 ArgoCD 或 Flux）定义 Application 或 Kustomization 资源，指向 Git 路径。
- 工具自动同步：检测 Git 变更 → 应用到集群 → 检测漂移并修复。

**示例（使用 ArgoCD）**：
1. 在 Git 仓库中放置 YAML 文件：
   ```yaml
   # deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nginx
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: nginx
     template:
       metadata:
         labels:
           app: nginx
       spec:
         containers:
         - name: nginx
           image: nginx:1.25
   ```

2. 创建 ArgoCD Application（可通过 UI 或 YAML 声明式管理）：
   ```yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: nginx-app
     namespace: argocd
   spec:
     project: default
     source:
       repoURL: https://github.com/your/repo.git
       path: overlays/prod
       targetRevision: main
     destination:
       server: https://kubernetes.default.svc
       namespace: prod
     syncPolicy:
       automated:
         prune: true    # 自动删除多余资源
         selfHeal: true # 自动修复漂移
   ```

**最佳实践**：
- 使用 Kustomize 处理差异（ArgoCD/Flux 原生支持）。
- 启用自动同步 + 漂移修复。
- 避免手动 kubectl 操作（违背 GitOps 原则）。

**2. 使用 Helm Charts 管理**

Helm 是 Kubernetes 的包管理器，适合复杂应用（带模板、值文件）。

**步骤**：
- 将 Helm Chart（Chart.yaml、templates/、values.yaml）放入 Git。
- 工具渲染 Chart 为 YAML 并应用（不使用 helm install/upgrade，避免状态侧效）。

**示例（使用 ArgoCD）**：
1. Git 仓库结构：
   ```
   my-chart/
   ├── Chart.yaml
   ├── values.yaml         # 默认值
   ├── values-prod.yaml    # 生产覆盖
   └── templates/
       └── deployment.yaml
   ```

2. ArgoCD Application 配置：
   ```yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: my-helm-app
   spec:
     source:
       repoURL: https://github.com/your/repo.git
       path: my-chart
       targetRevision: main
       helm:
         valueFiles:
         - values-prod.yaml  # 环境特定值
         parameters:
         - name: replicaCount
           value: "5"
     syncPolicy:
       automated:
         prune: true
         selfHeal: true
   ```

**Flux 示例**：
- Flux 支持原生 HelmRelease CRD，更接近 Helm 语义。

**最佳实践**：
- Chart 与 values 文件分离，便于环境定制。
- 避免 Helm hooks（可能引入侧效），或谨慎使用。
- 对于外部 Chart（如 Bitnami），使用 HelmRepository CR（Flux）或插件（ArgoCD）。
- 结合 Kustomize post-render 处理 Helm 输出。

**秘密管理**：
- 避免明文 Secret。
- 推荐工具：Sealed Secrets、External Secrets Operator 或 SOPS + Age/Mozillla SOPS。

**其他最佳实践（2025 年最新趋势）**：
- **多集群管理**：使用 ArgoCD ApplicationSet 或 Flux 多源。
- **渐进式交付**：集成 Flagger/Argo Rollouts 支持 Canary/Blue-Green。
- **安全**：RBAC 严格、签名提交（cosign）、政策引擎（Kyverno/OPA）。
- **监控**：集成 Prometheus 观察同步状态。
- **混合模式**：Push（CI 构建镜像） + Pull（GitOps 部署）结合。

通过以上方式，你可以实现完整的 GitOps 流程：所有变更通过 Git PR 审查 → 自动部署 → 自动校正。建议从简单 YAML 开始，逐步引入 Helm 和高级特性。

