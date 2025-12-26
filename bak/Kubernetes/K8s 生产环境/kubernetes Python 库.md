# 前言

https://github.com/kubernetes-client/python 是一个 Kubernetes 官方维护的 Python 客户端库。它提供了与 Kubernetes API 进行交互的功能，使开发人员可以使用 Python 编写应用程序来管理和操作 Kubernetes 集群。

使用 Kubernetes Python 客户端库，你可以完成以下一些任务：

1. 创建、删除和管理 Kubernetes 资源：你可以使用该库创建和删除 Kubernetes 中的各种资源，如 Pod、Deployment、Service、Ingress 等。你可以定义这些资源的配置，并使用客户端库将其应用于 Kubernetes 集群。
2. 与 Kubernetes API 进行交互：该库提供了与 Kubernetes API 进行交互的方法。你可以执行查询和操作，例如获取集群状态、列出资源、更新资源等。
3. 监视 Kubernetes 资源：你可以使用该库来监视 Kubernetes 资源的状态和事件。你可以注册回调函数，以便在资源发生变化时接收通知。
4. 执行 Kubernetes 资源操作：你可以使用该库来执行与 Kubernetes 资源相关的操作，例如扩展 Pod 的副本数、更新 Deployment 的配置、管理 Service 的负载均衡等。

总之，该库使你能够以编程方式与 Kubernetes 集群进行交互，轻松管理和操作 Kubernetes 资源。它提供了丰富的功能和 API，可以帮助你构建和管理基于 Kubernetes 的应用程序。





# 参考文档

https://kubernetes.io/zh-cn/docs/reference/using-api/client-libraries/

https://github.com/kubernetes-client/python/tree/master/examples

https://github.com/kubernetes-client/python

https://blog.csdn.net/weixin_42562106/article/details/130333802



https://github.com/kubernetes-client/python/blob/master/kubernetes/README.md

- 在该文档中，你可以找到有关如何使用 Kubernetes Python 客户端库的详细说明、类和方法的文档以及示例代码。





# 注意事项

在使用 Kubernetes Python 客户端时，以下是一些注意事项：

1. 版本匹配：确保你使用的 Kubernetes Python 客户端库版本与你的 Kubernetes 集群版本兼容。不同版本的客户端库可能有不同的 API 版本支持和功能。可以在客户端库的文档或发布说明中查找兼容的 Kubernetes 版本信息。
2. 权限和访问控制：确保你的脚本具有足够的权限来执行所需的操作。根据你的需求，可能需要为你的脚本配置适当的 RBAC 角色或服务账号，并确保将其绑定到正确的命名空间或资源上。
3. 异常处理：使用适当的异常处理机制来处理可能的错误情况。Kubernetes Python 客户端库会抛出 `kubernetes.client.rest.ApiException` 异常来表示 API 调用错误。你可以使用 `try-except` 块来捕获和处理这些异常，以便在出现错误时采取适当的措施。
4. 配置加载：根据你的脚本运行环境，正确加载 Kubernetes 配置。如果在 Kubernetes 集群内部运行，使用 `config.load_incluster_config()` 加载集群内部的配置。如果在集群外部运行，使用 `config.load_kube_config()` 加载本地的 kubeconfig 文件。
5. 资源清理：注意及时清理不再使用的 Kubernetes 资源，以避免资源浪费和可能的副作用。在删除 Deployment、Pod 或其他资源时，请确保你的脚本按需进行清理。
6. 与其他库的兼容性：如果你的脚本使用了其他的 Python 库，注意确保 Kubernetes Python 客户端库与这些库之间的兼容性。有时候可能会出现依赖冲突或不兼容的情况，你需要仔细处理这些问题。
7. 参考文档：参考官方文档、示例代码和其他资源，以便了解更多关于使用 Kubernetes Python 客户端库的最佳实践、常见问题和示例用法。

遵循这些注意事项可以帮助你更有效地使用 Kubernetes Python 客户端库，并确保你的脚本与 Kubernetes 集群进行交互时顺利运行。



# kubeconfig

kubeconfig 是 Kubernetes 集群配置文件，用于指定连接和身份验证集群的参数。它包含了集群信息、用户凭据、上下文以及其他配置选项。kubeconfig 文件通常用于命令行工具（如 `kubectl`）或客户端库与 Kubernetes 集群进行交互。

kubeconfig 文件通常位于用户的家目录下的 `~/.kube` 目录中，文件名为 `config`。但是，可以通过设置 `KUBECONFIG` 环境变量来指定不同的 kubeconfig 文件路径。

下面是 kubeconfig 文件的示例内容：

```yaml
apiVersion: v1
kind: Config
clusters:
- name: my-cluster
  cluster:
    server: https://my-cluster-api-server.example.com
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCg==
contexts:
- name: my-context
  context:
    cluster: my-cluster
    user: my-user
current-context: my-context
users:
- name: my-user
  user:
    client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCg==
    client-key-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCg==
```

kubeconfig 文件包含以下主要部分：

1. `clusters`：定义集群的信息，包括名称、API 服务器地址和证书颁发机构的证书数据。
2. `contexts`：定义上下文，将集群、用户和命名空间组合在一起。上下文提供了连接到集群的具体身份验证信息和运行时配置。
3. `users`：定义用户凭据，包括客户端证书和私钥数据。
4. `current-context`：指定当前使用的上下文。

通过编辑 kubeconfig 文件，可以配置多个集群、用户和上下文，并在使用命令行工具或客户端库时切换它们。

对于命令行工具 `kubectl`，你可以使用 `--kubeconfig` 标志指定 kubeconfig 文件的位置，例如：

```sh
kubectl --kubeconfig=/path/to/kubeconfig.yaml get pods
```

对于使用 Kubernetes Python 客户端库的应用程序，你可以使用 `config.load_kube_config()` 方法加载 kubeconfig 文件，例如：

```python
from kubernetes import config

config.load_kube_config(config_file="/path/to/kubeconfig.yaml")
```

加载 kubeconfig 文件后，你可以使用客户端库与 Kubernetes 集群进行交互，并执行各种操作，如创建、更新和删除资源。

kubeconfig 文件还支持其他配置选项，例如设置代理、TLS 设置、命令行上下文提示等。你可以参考 Kubernetes 官方文档以了解更多关于 kubeconfig 的详细信息和配置选项。





# 简单测试代码

## 基本操作

下面是一个简单的测试代码示例，演示如何使用 Kubernetes Python 客户端库加载 kubeconfig 文件并执行一些基本操作：

```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException

def test_kubernetes_operations():
    # 加载 kubeconfig 文件
    config.load_kube_config()

    # 创建 CoreV1Api 客户端实例
    api_instance = client.CoreV1Api()

    try:
        # 列出所有命名空间
        print("Namespaces:")
        namespaces = api_instance.list_namespace()
        for ns in namespaces.items:
            print(ns.metadata.name)

        # 创建一个 Pod
        pod_manifest = {
            "apiVersion": "v1",
            "kind": "Pod",
            "metadata": {
                "name": "test-pod",
                "namespace": "default"
            },
            "spec": {
                "containers": [
                    {
                        "name": "test-container",
                        "image": "nginx:latest",
                        "ports": [
                            {
                                "containerPort": 80
                            }
                        ]
                    }
                ]
            }
        }
        api_instance.create_namespaced_pod(body=pod_manifest, namespace="default")
        print("Pod created.")

    except ApiException as e:
        print("Exception when calling Kubernetes API: %s\n" % e)

# 执行测试
test_kubernetes_operations()
```

这个示例代码加载默认的 kubeconfig 文件（`~/.kube/config`），创建了一个 CoreV1Api 客户端实例，并执行了以下操作：

1. 列出所有命名空间，并打印它们的名称。
2. 创建一个名为 "test-pod" 的 Pod，使用 nginx 镜像，并暴露容器端口 80。

请确保你的 kubeconfig 文件已正确配置，以便访问你的 Kubernetes 集群。如果你的 kubeconfig 文件位于不同的位置，可以使用 `config.load_kube_config(config_file="/path/to/kubeconfig.yaml")` 指定文件路径。

在执行代码之前，请确保已安装 `kubernetes` Python 客户端库，可以使用 `pip install kubernetes` 进行安装。

这只是一个简单的示例，你可以根据需要扩展和修改代码来执行其他操作或与其他 Kubernetes API 进行交互。



## 列出集群节点

要查询和列出集群中的节点（Nodes），你可以使用 Kubernetes Python 客户端库中的 `list_node()` 方法。该方法允许你获取集群中的节点列表和详细信息。

以下是查询和列出集群节点的示例代码：

```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException

def list_cluster_nodes():
    config.load_incluster_config()  # 在集群内部运行，加载集群内部的配置

    api_instance = client.CoreV1Api()

    try:
        api_response = api_instance.list_node()
        return api_response.items
    except ApiException as e:
        print("Exception when calling CoreV1Api->list_node: %s\n" % e)

# 使用示例
nodes = list_cluster_nodes()
print("Cluster Nodes:")
for node in nodes:
    print("Node Name:", node.metadata.name)
    print("Node IP:", node.status.addresses[0].address)
    print("Node Status:", node.status.conditions[-1].type)
    print("------------------------")
```

在上述示例中，我们定义了一个 `list_cluster_nodes()` 函数，它使用 `list_node()` 方法获取集群中的节点列表。

请注意，要使用该示例，你需要根据你的环境配置适当的访问权限和加载配置的方法（例如，如果在集群外部运行，可以使用 `config.load_kube_config()` 加载本地的 kubeconfig 文件）。

调用 `list_cluster_nodes()` 函数将返回节点的详细信息列表。在示例中，我们遍历每个节点并打印节点的名称、IP 地址和状态。

你可以根据需要进一步处理节点列表，例如获取更多节点属性、筛选特定类型的节点或执行其他操作。

这样，你就可以使用 Kubernetes Python 客户端库查询和列出集群中的节点（Nodes）。





## 列出集群中的所有资源

要查询和列出集群中的所有资源，你可以使用 Kubernetes Python 客户端库中的 `list_namespaced_custom_object()` 方法。通过指定适当的 API 组、版本和命名空间，你可以获取集群中的所有资源列表。

以下是查询和列出集群中所有资源的示例代码：

```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException

def list_cluster_resources():
    config.load_incluster_config()  # 在集群内部运行，加载集群内部的配置

    api_instance = client.CustomObjectsApi()

    # 设置适当的 API 组、版本和命名空间
    group = ""
    version = "v1"
    namespace = "default"  # 可以根据需要更改命名空间

    try:
        api_response = api_instance.list_namespaced_custom_object(
            group=group,
            version=version,
            namespace=namespace,
            plural=""
        )
        return api_response["items"]
    except ApiException as e:
        print("Exception when calling CustomObjectsApi->list_namespaced_custom_object: %s\n" % e)

# 使用示例
resources = list_cluster_resources()
print("Cluster Resources:")
for resource in resources:
    print(resource)
    print("------------------------")
```

在上述示例中，我们定义了一个 `list_cluster_resources()` 函数，它使用 `list_namespaced_custom_object()` 方法来获取集群中的所有资源列表。

请注意，要使用该示例，你需要根据你的环境配置适当的访问权限和加载配置的方法（例如，如果在集群外部运行，可以使用 `config.load_kube_config()` 加载本地的 kubeconfig 文件）。

在函数中，你需要设置适当的 API 组、版本和命名空间。如果要列出所有命名空间的资源，可以将命名空间设置为空字符串（""）。

调用 `list_cluster_resources()` 函数将返回集群中所有资源的列表。在示例中，我们遍历每个资源并打印其内容。

请注意，根据集群的规模和资源的数量，查询和列出所有资源可能需要一些时间。

这样，你就可以使用 Kubernetes Python 客户端库查询和列出集群中的所有资源。



# Pod

## Pod 简述

- Pod 是 kubernetes 中资源调度的最小单位，一个 Pod 中可以包含一个或多个容器，但至少要有一个容器。
  - PS：Pod 翻译过来也叫豆荚，可以理解为豆荚中的豆粒就是所谓的容器，而每个不同的豆荚中豆粒的数量可能也不尽相同，因此每个 Pod 中可以容纳不同数量的容器。



## 创建 Pod

使用 Kubernetes Python 客户端库创建 Pod 需要以下步骤：

1. 安装客户端库：首先，你需要安装 Kubernetes Python 客户端库。你可以使用 pip 命令来安装：

   ```python
   pip install kubernetes
   ```

2. 导入必要的模块：在 Python 脚本中，你需要导入所需的模块，包括 kubernetes、kubernetes.client 和 kubernetes.client.rest。

   ```python
   from kubernetes import client, config
   from kubernetes.client.rest import ApiException
   ```

3. 加载 Kubernetes 配置：如果你的 Python 脚本在 Kubernetes 集群内部运行，可以使用 `config.load_incluster_config()` 来加载集群内部的配置。如果你的脚本在集群外部运行，可以使用 `config.load_kube_config()` 来加载本地的 kubeconfig 文件。

   ```python
   config.load_incluster_config()  # 在集群内部运行
   # 或者
   config.load_kube_config()  # 在集群外部运行
   ```

4. 创建 Pod 对象：使用客户端库的 `client.CoreV1Api()` 创建一个 CoreV1Api 的实例，然后创建 Pod 对象并设置相关属性。

   ```python
   api_instance = client.CoreV1Api()
   
   pod = client.V1Pod()
   pod.metadata = client.V1ObjectMeta(name="my-pod")
   pod.spec = client.V1PodSpec(containers=[client.V1Container(name="my-container", image="nginx")])
   ```

   在上面的示例中，我们创建了一个名为 "my-pod" 的 Pod，它包含一个名为 "my-container" 的容器，使用 "nginx" 镜像。

5. 创建 Pod：使用 `api_instance.create_namespaced_pod()` 方法来创建 Pod。

   ```python
   namespace = "default"  # Pod 所属的命名空间
   try:
       api_response = api_instance.create_namespaced_pod(namespace, pod)
       print("Pod created successfully.")
   except ApiException as e:
       print("Error creating Pod: %s" % e)
   ```

   在上面的示例中，我们将 Pod 创建在 "default" 命名空间中。你可以根据需要修改命名空间。

这样，你就可以使用 Kubernetes Python 客户端库创建 Pod。根据你的需求，你可以进一步定义 Pod 的规格、标签、容器的镜像和端口等属性。





## 获取 Pod 创建的状态

要获取 Pod 的创建状态，你可以使用 Kubernetes Python 客户端库中的 `read_namespaced_pod()` 方法来检索 Pod 的详细信息，包括其当前状态。

以下是获取 Pod 创建状态的示例代码：

```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException

def get_pod_status(pod_name, namespace):
    config.load_incluster_config()  # 在集群内部运行，加载集群内部的配置

    api_instance = client.CoreV1Api()

    try:
        api_response = api_instance.read_namespaced_pod(pod_name, namespace)
        pod_status = api_response.status.phase
        return pod_status
    except ApiException as e:
        print("Exception when calling CoreV1Api->read_namespaced_pod: %s\n" % e)

# 使用示例
pod_name = "my-pod"
namespace = "default"

status = get_pod_status(pod_name, namespace)
print("Pod status:", status)
```

在上述示例中，我们定义了一个 `get_pod_status()` 函数，它接受 Pod 的名称和命名空间作为参数，并返回 Pod 的状态。

请注意，要使用该示例，你需要根据你的环境配置适当的访问权限和加载配置的方法（例如，如果在集群外部运行，可以使用 `config.load_kube_config()` 加载本地的 kubeconfig 文件）。

调用 `get_pod_status()` 函数，并传入 Pod 的名称和命名空间，它将返回 Pod 的状态，例如 "Pending"、"Running"、"Succeeded" 或 "Failed" 等。

你可以根据 Pod 的状态来判断其创建状态。一般情况下，当 Pod 的状态为 "Running" 时，表示它已成功创建并正在运行。



## 获取 Pod 日志

要执行 Pod 的日志查询，你可以使用 Kubernetes Python 客户端库中的 `read_namespaced_pod_log()` 方法。该方法允许你获取指定 Pod 的日志。

以下是执行 Pod 日志查询的示例代码：

```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException

def get_pod_logs(pod_name, namespace):
    config.load_incluster_config()  # 在集群内部运行，加载集群内部的配置

    api_instance = client.CoreV1Api()

    try:
        api_response = api_instance.read_namespaced_pod_log(pod_name, namespace)
        return api_response
    except ApiException as e:
        print("Exception when calling CoreV1Api->read_namespaced_pod_log: %s\n" % e)

# 使用示例
pod_name = "my-pod"
namespace = "default"

logs = get_pod_logs(pod_name, namespace)
print("Pod logs:")
print(logs)
```

在上述示例中，我们定义了一个 `get_pod_logs()` 函数，它接受 Pod 的名称和命名空间作为参数，并返回该 Pod 的日志。

请注意，要使用该示例，你需要根据你的环境配置适当的访问权限和加载配置的方法（例如，如果在集群外部运行，可以使用 `config.load_kube_config()` 加载本地的 kubeconfig 文件）。

调用 `get_pod_logs()` 函数，并传入 Pod 的名称和命名空间，它将返回指定 Pod 的日志内容。

你可以根据需要在代码中进一步处理和解析这些日志，例如输出到控制台、写入文件或进行其他操作。



# Deployment

## Deployment 简述

- Deployment 可以理解为是一个或多个相同 Pod 副本的集合；
- Deployment 可以动态的调整 Pod 副本的数量，因此可以实现对 Pod 进行动态的扩缩容、升级、回滚等操作。



## 创建 Deployment

使用 Kubernetes Python 客户端库创建 Deployment 需要以下步骤：

1. 安装客户端库：首先，你需要安装 Kubernetes Python 客户端库。你可以使用 pip 命令来安装：

   ```python
   pip install kubernetes
   ```

2. 导入必要的模块：在 Python 脚本中，你需要导入所需的模块，包括 kubernetes、kubernetes.client 和 kubernetes.client.rest。

   ```python
   from kubernetes import client, config
   from kubernetes.client.rest import ApiException
   ```

3. 加载 Kubernetes 配置：如果你的 Python 脚本在 Kubernetes 集群内部运行，可以使用 `config.load_incluster_config()` 来加载集群内部的配置。如果你的脚本在集群外部运行，可以使用 `config.load_kube_config()` 来加载本地的 kubeconfig 文件。

   ```python
   config.load_incluster_config()  # 在集群内部运行
   # 或者
   config.load_kube_config()  # 在集群外部运行
   ```

4. 创建 Deployment 对象：使用客户端库的 `client.AppsV1Api()` 创建一个 AppsV1Api 的实例，然后创建 Deployment 对象并设置相关属性。

   ```python
   api_instance = client.AppsV1Api()
   
   deployment = client.V1Deployment()
   deployment.metadata = client.V1ObjectMeta(name="my-deployment")
   deployment.spec = client.V1DeploymentSpec(
       replicas=3,
       selector=client.V1LabelSelector(match_labels={"app": "my-app"}),
       template=client.V1PodTemplateSpec(
           metadata=client.V1ObjectMeta(labels={"app": "my-app"}),
           spec=client.V1PodSpec(containers=[client.V1Container(name="my-container", image="nginx")])
       )
   )
   ```

   在上面的示例中，我们创建了一个名为 "my-deployment" 的 Deployment，它包含了一个名为 "my-container" 的容器，使用 "nginx" 镜像，并设置了副本数为 3。

5. 创建 Deployment：使用 `api_instance.create_namespaced_deployment()` 方法来创建 Deployment。

   ```python
   namespace = "default"  # Deployment 所属的命名空间
   try:
       api_response = api_instance.create_namespaced_deployment(namespace, deployment)
       print("Deployment created successfully.")
   except ApiException as e:
       print("Error creating Deployment: %s" % e)
   ```

   在上面的示例中，我们将 Deployment 创建在 "default" 命名空间中。你可以根据需要修改命名空间。

这样，你就可以使用 Kubernetes Python 客户端库创建 Deployment。根据你的需求，你可以进一步定义 Deployment 的规格、标签、容器的镜像、副本数、滚动更新策略等属性。



## 调整 Deployment 中的 Pod 副本数

要调整 Deployment 中的 Pod 副本数，你可以使用 Kubernetes Python 客户端库中的 `patch_namespaced_deployment_scale()` 方法来更新 Deployment 的副本数。

以下是调整副本数的示例代码：

```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException

def scale_deployment(deployment_name, namespace, replicas):
    config.load_incluster_config()  # 在集群内部运行，加载集群内部的配置

    api_instance = client.AppsV1Api()

    try:
        api_response = api_instance.patch_namespaced_deployment_scale(
            deployment_name,
            namespace,
            body={"spec": {"replicas": replicas}}
        )
        print("Deployment scaled successfully.")
    except ApiException as e:
        print("Exception when calling AppsV1Api->patch_namespaced_deployment_scale: %s\n" % e)

# 使用示例
deployment_name = "my-deployment"
namespace = "default"
replicas = 3  # 更新的副本数

scale_deployment(deployment_name, namespace, replicas)
```

在上述示例中，我们定义了一个 `scale_deployment()` 函数，它接受 Deployment 的名称、命名空间和要调整的副本数作为参数。函数使用 `patch_namespaced_deployment_scale()` 方法来更新 Deployment 的副本数。

请注意，要使用该示例，你需要根据你的环境配置适当的访问权限和加载配置的方法（例如，如果在集群外部运行，可以使用 `config.load_kube_config()` 加载本地的 kubeconfig 文件）。

调用 `scale_deployment()` 函数，并传入 Deployment 的名称、命名空间和要调整的副本数，它将根据提供的副本数更新 Deployment。

这样，你就可以使用 Kubernetes Python 客户端库轻松调整 Deployment 中的 Pod 副本数。







