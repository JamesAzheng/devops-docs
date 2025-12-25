---
title: "K8s 最佳实践"
---

# 管理不同环境下的 Yaml 清单与 Helm Values文件
在Kubernetes（K8s）环境中管理大量自研应用的YAML清单以及通过Helm部署的Values文件，尤其是涉及多个集群（如生产、测试、开发环境）时，最佳实践的核心是采用声明式配置管理、版本控制和自动化工具，以确保一致性、可审计性和可扩展性。以下是基于行业标准和官方指导的推荐做法，我将分模块说明。

## 1. **版本控制和存储配置**
将所有YAML清单和Helm Values文件存储在版本控制系统中（如Git），作为单一事实来源。这允许快速回滚、审计变更，并便于在多个集群间重现配置。
- 避免直接在集群中编辑资源，而是通过Git提交变更后应用。
- 对于多环境，使用分支策略（如main分支为生产，dev/test分支为其他环境）或目录结构（如`envs/dev/values.yaml`、`envs/prod/values.yaml`）来分离配置。
- 推荐使用GitOps工具如Argo CD或Flux CD，将Git仓库与集群同步，实现自动化部署和漂移检测（如果集群状态与Git不符，自动校正）。

## 2. **YAML清单的管理**
纯YAML清单容易在多环境间重复和出错，因此采用工具简化：
- **使用Kustomize**：Kubernetes内置工具，用于在基YAML上应用overlay（覆盖层）。例如，创建一个base目录存放通用YAML，然后为每个环境（如dev、test、prod）创建overlay目录，定义环境特定的patch（如资源限制、镜像标签）。这避免了复制整个YAML文件。
- **分组和优化YAML**：将相关对象（如Deployment、Service、ConfigMap）合并到一个文件中，使用`kubectl apply -f dir/`批量应用。避免不必要的默认值，使用最新稳定API版本，并在注解中添加描述以便自省。
- **标签和选择器**：为所有资源添加语义标签（如`app.kubernetes.io/name: myapp`、`env: prod`），便于Service发现和资源管理。使用`kubectl`命令时优先用标签选择器而非具体名称。
- **健康检查和资源管理**：在YAML中定义liveness/readiness probes、资源请求/限制，以确保Pod健康和集群稳定性。优先使用Deployment/ReplicaSet而非裸Pod。

## 3. **Helm Values的管理**
Helm是打包和部署K8s应用的首选工具，尤其适合自研应用和服务。
- **单一Chart，多环境Values**：为每个应用创建一个Helm Chart，将通用模板放在templates/目录中。然后，为不同环境准备独立的Values文件（如values-dev.yaml、values-prod.yaml），覆盖特定参数（如副本数、环境变量、镜像版本）。部署时使用`helm install --values values-dev.yaml`。
- **Chart晋升（Promotion）**：在CI/CD管道中，从测试环境开始部署Chart，测试通过后晋升到生产。使用共享配置存储Values，避免重复定义。工具如Codefresh或Jenkins可以可视化管理这一过程。
- **避免硬编码**：在Chart中参数化所有可变部分，使用Values注入。针对多集群，结合Namespaces隔离资源（如每个环境一个Namespace），增强安全性。

## 4. **多集群管理**
针对生产、测试、开发各一套集群：
- **Namespaces隔离**：在每个集群中使用Namespaces逻辑分隔环境资源，避免冲突。
- **CI/CD集成**：使用Jenkins、GitHub Actions或GitLab CI构建管道，自动化构建、测试和部署。例如，代码合并到分支后，触发Helm upgrade到对应集群。
- **工具组合**：Helm + Kustomize（Helm支持post-render使用Kustomize），或直接用Helm Operator/ChartMuseum管理Chart仓库。
- **监控和审计**：集成Prometheus/Grafana监控配置变更，使用RBAC限制访问，确保生产集群更严格。

## 5. **其他注意事项**
- **安全性**：使用 Secrets 管理敏感数据，避免明文Values。启用集群DNS，并优先创建Service再部署工作负载。
- **可扩展性**：对于大型团队，避免每个服务一个独立Chart，而是创建一个基础Chart供复用。
- **测试**：在开发环境中使用Minikube或kind快速迭代，生产前在测试集群验证。

