---
title: "docker-compose"
weight: 11
---

# docker-compose 概述

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。通过 Docker Compose，您可以使用 YAML 文件来配置应用程序的服务、网络和卷，然后通过简单的命令就能够启动、停止和管理整个应用程序。

以下是 Docker Compose 的一些关键概念和特性：

1. **YAML 文件**: Docker Compose 使用一个 YAML 格式的文件来定义应用程序的服务、网络、卷以及其他配置。该文件通常称为 `docker-compose.yml`。

2. **服务**: 服务是应用程序的组成部分，通常由一个容器定义。服务可以包括容器镜像、端口映射、环境变量、卷挂载等配置信息。

3. **多容器应用**: Docker Compose 适用于多容器应用场景，其中不同的服务可以通过定义它们的配置和关系来协同工作。

4. **命令行工具**: Docker Compose 提供了一组命令行工具，允许用户轻松地构建、启动、停止和管理整个应用程序。一些常见的命令包括 `docker-compose up`（启动应用程序）、`docker-compose down`（停止和移除容器）等。

5. **环境变量和扩展**: 使用 Docker Compose，您可以轻松地通过环境变量来配置服务。这使得在不同环境中使用相同的 `docker-compose.yml` 文件变得更为灵活。此外，您还可以使用变量和扩展来简化配置文件。

6. **网络和卷**: Docker Compose 允许您定义应用程序中的网络和卷。这些可以用于在不同服务之间共享信息、数据以及确保容器之间的通信。

下面是一个简单的 `docker-compose.yml` 文件的例子：

```yaml
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
  app:
    image: my-app:latest
    environment:
      - DEBUG=true
    volumes:
      - ./app:/app
```

上述例子定义了两个服务，一个是基于 Nginx 镜像的 `web` 服务，另一个是基于自定义镜像的 `app` 服务。`web` 服务映射主机的 80 端口到容器的 80 端口，而 `app` 服务通过环境变量和卷挂载进行配置。通过运行 `docker-compose up` 命令，可以启动这两个服务。



**docker-compose 将所管理的容器分为三层，分别是工程（project），服务（service）、容器（container）**

这句话指的是 Docker Compose 在概念上将所管理的容器层次化组织，分为三个层次，分别是工程（project）、服务（service）、容器（container）。以下是每个层次的概念：

1. **工程（Project）**:
   - 工程是 Docker Compose 的最高层次概念，它代表整个应用程序或项目。
   - 一个 Docker Compose 工程通常对应一个项目文件夹，该文件夹中包含了一个 `docker-compose.yml` 文件以及可能的其他配置文件和应用程序代码。
   - 一个工程可以包括多个服务。

2. **服务（Service）**:
   - 服务是工程中的一个组成部分，它定义了一个容器化的应用程序组件。
   - 在 `docker-compose.yml` 文件中，每个服务都有自己的配置，包括使用的容器镜像、端口映射、环境变量、卷挂载等。
   - 多个服务可以协同工作，形成一个完整的应用程序。

3. **容器（Container）**:
   - 容器是服务的实例，即在运行时创建的一个具体的容器。
   - 一个服务可以由多个容器实例组成，具体取决于在 `docker-compose.yml` 文件中定义的 `replicas` 或者其他相关配置。
   - 每个容器都是基于服务定义的配置启动的，并且具有独立的运行时环境。

通过这三个层次的组织，Docker Compose 提供了一种清晰且层次分明的方式来描述和管理整个容器化应用程序。在使用 `docker-compose` 命令行工具时，您通常会在工程级别执行命令，例如启动整个工程的所有服务。



https://github.com/docker/compose

https://docs.docker.com/compose/







# docker-compose 安装

- docker-compose 本身就是一个二进制的可执行程序，没有其他文件

## 二进制

- 直接从GitHub下载安装对应版本
- 参考文档：https://github.com/docker/compose/releases

```bash
wget https://github.com/docker/compose/releases/download/v2.3.3/docker-compose-linux-x86_64

chmod +x docker-compose-linux-x86_64 

mv docker-compose-linux-x86_64 /usr/bin/docker-compose

docker-compose --version

```



## pip









# docker-compose 命令说明

默认 docker-compose 命令会调用当前目录下的 docker-compose.yml 文件，因此一般执行docker-compose命令前要先进入 docker-compose.yml文件 所在的目录

https://docs.docker.com/compose/reference/

```bash
-f #指定docker-compose模板文件，默认为docker-compose.yml
-p NAME #指定项目名称，默认将使用当前所在目录名称作为项目名
--verbose #显示更多输出信息
--log-level LEVEL #定义日志级别（DEBUG, INFO, WARNING, ERROR, CRITICAL）
--no-ansi #不显示ANSI控制字符
-v #显示docker-compose的版本

#以下为命令常用选项，需要在 docker-compose.(yml|yaml) 文件所在目录执行
build #构建镜像
bundle #从当前 docker compose 文件生成一个以<当前目录>为名称的json格式的Docker bundle备份文件
config -q #查看当前配置，没有错误则不输出任何信息
down #停止和删除所有容器、网络、镜像和卷
exec #进入指定容器进行操作
help #显示帮助信息
kill #强制终止运行中的容器
logs #查看容器中的日志
pause #暂停服务
unpause #取消暂停服务
port #查看端口
pull #重新拉取镜像
push #上传镜像
restart #重启服务
scale # 设置指定服务运行的容器个数
top #显示容器运行状态
```

## run

当你使用该命令时，它会在指定的服务上运行一个一次性的命令，这可能包括启动新的容器。这样，你就可以在定义的服务中执行特定的命令。

以下是一个示例 `docker-compose.yml` 文件：

```yaml
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"

  db:
    image: postgres:latest
    environment:
      POSTGRES_PASSWORD: example_password
```

在这个例子中，有两个服务：`web` 和 `db`。你可以使用 `docker-compose run` 命令在这些服务上运行命令。例如：

```bash
docker-compose run web ls /usr/share/nginx/html
```

上述命令将在 `web` 服务的容器中执行 `ls /usr/share/nginx/html`。

请注意，`docker-compose run` 主要用于执行一次性的命令，而不是持续运行服务。如果你希望启动整个应用程序，包括多个服务，可以使用 `docker-compose up` 命令。



## 常用命令

```sh
# 前台创建并启动容器，加  -d 后台运行
docker-compose up

# 启动服务
docker-compose start

# 停止服务
docker-compose stop

# 列出所有运行和退出状态的容器
docker-compose ps -a

# 删除已停止的服务，加 -f 面交互强制删除
docker-compose rm
```



# docker-compose.yml 文件格式

docker-compose.yml 文件的格式根据不同的docker版本 格式略有不同，具体参见官方文档：
- https://docs.docker.com/compose/compose-file/
- https://docs.docker.com/compose/compose-file/compose-versioning/
- https://github.com/compose-spec/compose-spec/blob/master/spec.md

## version

`version` 字段用于指定 Docker Compose 文件的版本。不同的版本支持不同的语法和特性，因此您需要选择适当的版本，以确保文件中的配置能够正确解析和运行。

目前，Docker Compose 主要支持以下几个版本：

1. **Version 1**:
   - 这是 Docker Compose 的初始版本，已经不推荐使用。它主要用于早期版本的 Docker Compose。

2. **Version 2.x**:
   - Version 2.x 引入了许多新特性，包括网络定义、卷定义、`docker-compose.override.yml` 文件等。
   - Version 2.x 支持多个文件的组合，使得可以将通用配置与环境特定的配置分开。

3. **Version 3.x**:
   - Version 3.x 是当前推荐使用的版本，引入了一些新的特性，同时移除了一些旧版本的特性。
   - 支持多阶段构建、配置引用、命名卷、配置文件扩展等功能。
   - 在 Version 3.x 中，网络和卷被定义为顶级对象，而不是嵌套在服务中。

4. **Compose 文件的 Compatibilities**:
   - 在每个版本中，Docker Compose 会支持一组 Docker 引擎的版本。例如，Compose 文件 Version 3.8 可以与 Docker Engine 18.06.0 及更高版本一起使用。
   - 您可以在 Docker 官方文档中查看 [Compose 文件的版本兼容性](https://docs.docker.com/compose/compose-file/compose-versioning/)。

在编写 Docker Compose 文件时，您应该选择与您的 Docker 引擎版本兼容的合适版本。通常情况下，建议选择最新的支持版本，以获得最新的特性和改进。例如：

```yaml
version: '3.8'
```

- 这表示您正在使用 Docker Compose 文件的 Version 3.8，适用于 Docker 引擎版本 18.06.0 及以上。





## services

`services` 字段是 Docker Compose 文件中的一个主要部分，用于定义应用程序中的各个服务。服务是应用程序的组成部分，通常由一个或多个容器组成，这些容器一起执行特定的任务或服务。

以下是 `services` 字段的主要组成部分和相关配置选项：

1. **服务定义**:
   - 在 `services` 字段下，您可以为每个服务定义一个或多个服务块。每个服务块的键是服务的名称，例如 `web`、`db`。
   - 例如：
     ```yaml
     services:
       web:
         # 配置项...
       db:
         # 配置项...
     ```

2. **镜像（image）**:
   - `image` 配置项指定了服务使用的容器镜像。可以使用官方镜像，也可以使用自定义镜像。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
       db:
         image: mysql:5.7
     ```

3. **端口映射（ports）**:
   - `ports` 配置项用于将容器内部的端口映射到主机上的端口。格式为 `<host>:<container>`。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
         ports:
           - "8080:80"
     ```

4. **环境变量（environment）**:
   - `environment` 配置项用于设置容器内部的环境变量。可以指定单个变量，也可以使用列表形式。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
         environment:
           - DEBUG=true
           - SERVER_NAME=mywebserver
     ```

5. **卷挂载（volumes）**:
   - `volumes` 配置项用于将主机上的目录或卷挂载到容器内部。可以指定单个卷，也可以使用列表形式。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
         volumes:
           - ./html:/usr/share/nginx/html
     ```

6. **依赖关系（depends_on）**:
   - `depends_on` 配置项用于定义服务之间的依赖关系，确保在启动当前服务之前，所依赖的服务已经启动。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
         depends_on:
           - db
       db:
         image: mysql:5.7
     ```

7. **其他配置项**:
   - 除了上述常见的配置项外，还有许多其他配置项，如 `command`（指定容器启动时执行的命令）、`restart`（指定容器的重启策略）、`networks`（将服务连接到指定的网络）等。

通过在 `services` 字段下定义不同的服务块，您可以构建复杂的多容器应用程序，确保各个服务之间的协同工作。具体的配置选项可以根据您的应用程序的需求进行灵活配置。





## networks

`networks` 字段用于定义应用程序中的网络。通过定义网络，可以让服务之间相互通信，同时还可以指定其他网络相关的配置。

以下是 `networks` 字段的主要组成部分和相关配置选项：

1. **网络定义**:
   - 在 `networks` 字段下，您可以为每个网络定义一个或多个网络块。每个网络块的键是网络的名称，例如 `my_network`。
   - 例如：
     ```yaml
     networks:
       my_network:
         # 配置项...
     ```

2. **网络驱动程序（driver）**:
   - `driver` 配置项用于指定网络的驱动程序，定义了网络的类型。常见的驱动程序包括 `bridge`、`overlay`、`host` 等。
   - 例如：
     ```yaml
     networks:
       my_network:
         driver: bridge
     ```

3. **其他配置项**:
   - 根据网络驱动程序的不同，可能还有其他特定于该驱动程序的配置项。例如，`bridge` 驱动程序可以配置子网、网关等参数，而 `overlay` 驱动程序用于跨多个主机的容器通信。
   - 例如：
     ```yaml
     networks:
       my_network:
         driver: overlay
         external: true
         attachable: false
     ```

4. **网络别名（aliases）**:
   - `aliases` 配置项用于为服务指定网络别名，使得可以通过别名进行容器之间的通信。
   - 例如：
     ```yaml
     networks:
       my_network:
         aliases:
           - alias1
           - alias2
     services:
       web:
         networks:
           - my_network
     ```

5. **IPv4 和 IPv6 配置**:
   - 对于 `bridge` 驱动程序，您可以配置网络的 IPv4 和 IPv6 地址池。
   - 例如：
     ```yaml
     networks:
       my_network:
         driver: bridge
         ipam:
           config:
             - subnet: 172.20.0.0/16
             - subnet: 2001:db8:1234::/64
     ```

6. **外部网络（external）**:
   - `external` 配置项用于将服务连接到外部创建的网络，而不是在 Docker Compose 文件中创建。
   - 例如：
     ```yaml
     networks:
       my_network:
         external: true
     services:
       web:
         networks:
           - my_network
     ```

通过定义网络，您可以确保在应用程序的不同服务之间实现通信，并根据需要配置网络的特定参数。这样可以更好地组织和隔离容器，使得多容器应用程序能够按照预期方式运行。



## configs

`configs` 字段用于定义配置对象，这些对象可以在服务中使用。配置对象可用于存储敏感信息（如密码、密钥等）以及其他配置，使得服务的配置更加灵活。配置对象可以从文件、变量或其他来源中读取。

以下是 `configs` 字段的主要组成部分和相关配置选项：

1. **配置对象定义**:
   - 在 `configs` 字段下，您可以为每个配置对象定义一个或多个配置块。每个配置块的键是配置对象的名称，例如 `my_config`。
   - 例如：
     ```yaml
     configs:
       my_config:
         # 配置项...
     ```

2. **配置来源（file、external、或 inline）**:
   - `file` 配置项用于指定配置对象的来源，可以是文件、外部对象（在 Swarm 中使用），或者是直接在 `docker-compose.yml` 文件中定义的。
   - 例如：
     ```yaml
     configs:
       my_config:
         file: ./config-file.txt
     ```

3. **配置标签（labels）**:
   - `labels` 配置项用于为配置对象添加标签，这些标签可以用于在服务中引用配置。
   - 例如：
     ```yaml
     configs:
       my_config:
         file: ./config-file.txt
         labels:
           - "com.example.description=My configuration"
           - "com.example.version=1.0"
     ```

4. **外部配置（external）**:
   - `external` 配置项用于指定是否使用外部配置对象。在 Swarm 模式下，可以共享配置对象，而不是在每个服务中重复定义。
   - 例如：
     ```yaml
     configs:
       my_config:
         external: true
     ```

5. **服务引用**:
   - 在服务的配置中，可以使用 `configs` 配置项引用配置对象。这样服务就可以访问配置对象中存储的值。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
         configs:
           - source: my_config
             target: /etc/nginx/nginx.conf
     ```

通过使用 `configs` 字段，您可以更安全地管理敏感信息，使得配置更加灵活且易于维护。这在处理敏感数据、密钥、证书等方面特别有用。



## secrets

`secrets` 字段用于定义密钥，这些密钥可以在服务中使用。密钥是用于存储敏感信息的一种方式，通常用于保存密码、密钥、证书等机密数据。与 `configs` 字段类似，`secrets` 字段在 Docker Compose 文件中提供了一种安全的方式来处理敏感信息。

以下是 `secrets` 字段的主要组成部分和相关配置选项：

1. **密钥定义**:
   - 在 `secrets` 字段下，您可以为每个密钥定义一个或多个密钥块。每个密钥块的键是密钥的名称，例如 `my_secret`。
   - 例如：
     ```yaml
     secrets:
       my_secret:
         # 配置项...
     ```

2. **密钥来源（file、external、或 inline）**:
   - `file` 配置项用于指定密钥的来源，可以是文件、外部对象（在 Swarm 中使用），或者是直接在 `docker-compose.yml` 文件中定义的。
   - 例如：
     ```yaml
     secrets:
       my_secret:
         file: ./secret-file.txt
     ```

3. **密钥标签（labels）**:
   - `labels` 配置项用于为密钥添加标签，这些标签可以用于在服务中引用密钥。
   - 例如：
     ```yaml
     secrets:
       my_secret:
         file: ./secret-file.txt
         labels:
           - "com.example.description=My secret"
           - "com.example.version=1.0"
     ```

4. **外部密钥（external）**:
   - `external` 配置项用于指定是否使用外部密钥。在 Swarm 模式下，可以共享密钥，而不是在每个服务中重复定义。
   - 例如：
     ```yaml
     secrets:
       my_secret:
         external: true
     ```

5. **服务引用**:
   - 在服务的配置中，可以使用 `secrets` 配置项引用密钥。这样服务就可以访问密钥中存储的值。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
         secrets:
           - source: my_secret
             target: /etc/nginx/secret.txt
     ```

通过使用 `secrets` 字段，您可以更安全地管理敏感信息，使得在 Docker Compose 文件中处理密钥更加灵活和易于维护。这在需要处理密码、API 密钥、证书等方面非常有用。

## ---

## demo

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:4.2.8-bionic
    volumes:
      - /data/mongodb/db:/data/db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: "root"
      MONGO_INITDB_ROOT_PASSWORD: "hit@2020"

  redis:
    image: redis:3.2.11
    volumes:
      - /data/redis/data:/data
      - /data/redis/etc:/usr/local/etc
    ports:
      - "6379:6379"
    command: redis-server /usr/local/etc/redis.conf

  zookeeper:
    image: zookeeper:3.4.12
    volumes:
      - /data/zookeeper/data:/data
    ports:
      - "2181:2181"
```





## ---

## 1

Docker Compose 文件使用 YAML 格式来定义容器化应用程序的服务、网络、卷以及其他配置。以下是 Docker Compose 文件的主要元素和格式详解：

1. **版本（version）**:
   - `version` 指定 Docker Compose 文件的版本。不同的版本可能支持不同的特性和语法。目前常用的版本有 "2", "2.1", "3", 等。
   - 例如：
     ```yaml
     version: '3'
     ```

2. **服务（services）**:
   - `services` 部分定义了应用程序中的各个服务。每个服务都有一个唯一的名称，该名称用于标识该服务。
   - 服务中的配置包括容器镜像、端口映射、环境变量、卷挂载等。
   - 例如：
     ```yaml
     services:
       web:
         image: nginx:latest
         ports:
           - "80:80"
       app:
         image: my-app:latest
         environment:
           - DEBUG=true
         volumes:
           - ./app:/app
     ```

3. **网络（networks）**:
   
   - `networks` 部分定义了应用程序中的网络。可以为服务指定网络别名，并通过别名进行容器间通信。
   - 例如：
     ```yaml
     networks:
       my_network:
     services:
       web:
         networks:
           - my_network
     ```
   
4. **卷（volumes）**:
   
   - `volumes` 部分定义了应用程序中的卷，用于数据持久性或容器之间的共享数据。
   - 例如：
     ```yaml
     volumes:
       data_volume:
     services:
       app:
         volumes:
           - data_volume:/data
     ```
   
5. **环境变量（environment）**:
   - `environment` 部分允许为服务指定环境变量。这些变量在容器运行时生效。
   - 例如：
     ```yaml
     services:
       app:
         environment:
           - DEBUG=true
     ```

6. **扩展（extends）**:
   - `extends` 允许您在一个服务中重用另一个服务的配置。这样可以避免重复定义相似的配置。
   - 例如：
     ```yaml
     services:
       common: &common
         image: nginx:latest
         ports:
           - "80:80"
     app:
       <<: *common
       environment:
         - DEBUG=true
     ```

7. **外部链接（external_links）**:
   - `external_links` 允许将容器连接到 Docker 外部的容器，实现容器之间的通信。
   - 例如：
     ```yaml
     services:
       app:
         external_links:
           - redis:redis
     ```

8. **其他选项**:
   - Docker Compose 支持许多其他选项和配置，如 `depends_on`（定义服务之间的依赖关系）、`restart`（定义容器的重启策略）、`build`（构建自定义镜像）、`healthcheck`（定义容器健康检查）等。

以上只是 Docker Compose 文件的一些常见元素和格式，您可以根据具体的应用场景和需求来灵活使用这些配置项。通过适当的配置，您可以定义和管理复杂的多容器应用程序。



## 2

下面是一个简单的 Docker Compose 示例，演示了一个包含 web 服务和数据库服务的多容器应用程序。这个示例使用 Python Flask 框架创建一个简单的 Web 应用，并使用 MySQL 数据库进行数据存储。

1. 首先，创建一个名为 `docker-compose.yml` 的文件，并添加以下内容：

```yaml
version: '3'

services:
  web:
    image: python:3.8
    volumes:
      - ./web-app:/app
    ports:
      - "5000:5000"
    environment:
      - MYSQL_HOST=db
      - MYSQL_PORT=3306
      - MYSQL_USER=root
      - MYSQL_PASSWORD=my-secret-pw
      - MYSQL_DB=mydatabase
    depends_on:
      - db

  db:
    image: mysql:5.7
    environment:
      - MYSQL_ROOT_PASSWORD=my-secret-pw
      - MYSQL_DATABASE=mydatabase
```

上述配置定义了两个服务：`web` 和 `db`。`web` 服务使用 Python 3.8 镜像，将本地目录 `./web-app` 挂载到容器内的 `/app` 目录，开放容器端口 `5000`，并设置了连接到 MySQL 数据库的环境变量。`db` 服务使用 MySQL 5.7 镜像，并设置了数据库的 root 用户密码和创建的数据库。

2. 创建一个名为 `web-app` 的文件夹，并在其中创建一个简单的 Flask 应用：

```python
# web-app/app.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:my-secret-pw@db:3306/mydatabase'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

@app.route('/')
def index():
    return 'Hello, Docker Compose!'
```

3. 在 `web-app` 文件夹中创建一个名为 `requirements.txt` 的文件，其中包含 Flask 和 Flask-SQLAlchemy 的依赖：

```
# web-app/requirements.txt
Flask==1.1.2
Flask-SQLAlchemy==2.4.4
```

4. 在 `web-app` 文件夹中创建一个名为 `Dockerfile` 的文件，用于构建 web 服务的镜像：

```Dockerfile
# web-app/Dockerfile

FROM python:3.8

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

5. 最终的项目结构如下：

```
project-root/
|-- docker-compose.yml
|-- web-app/
|   |-- app.py
|   |-- requirements.txt
|   |-- Dockerfile
```

6. 在项目的根目录运行以下命令启动应用程序：

```bash
docker-compose up
```

上述示例演示了一个简单的多容器应用程序，其中包含了一个 Web 服务和一个 MySQL 数据库服务。您可以根据实际需求进行修改和扩展，例如添加更多的服务、调整环境变量、配置网络等。



## 3

是的，`services` 字段下的每个服务（例如，`web` 和 `db`）都是您根据应用程序的需要自行指定的。这些服务的名称是在 `docker-compose.yml` 文件中定义的，并且每个服务都有自己的配置，包括容器镜像、端口映射、环境变量、卷挂载等。

在示例中，`web` 服务和 `db` 服务是两个独立的服务，分别用于运行 Web 应用和 MySQL 数据库。您可以根据实际应用程序的组成部分定义更多的服务，例如消息队列服务、缓存服务等，以构建一个完整的多容器应用程序。

每个服务的配置包括以下部分：

- `image`: 指定容器使用的镜像。
- `volumes`: 指定卷挂载，将本地文件系统挂载到容器内部。
- `ports`: 指定端口映射，将容器内部的端口映射到主机上的端口。
- `environment`: 设置容器的环境变量。
- `depends_on`: 指定服务之间的依赖关系，确保某个服务在另一个服务之前启动。

通过定义这些服务，您可以轻松组织和管理多容器应用程序的不同组件，并确保它们能够协同工作。根据实际需求，您可以根据具体情况添加、修改或删除服务。



## 4

除了 `version` 和 `services`，Docker Compose 文件还支持其他一些顶级字段，用于定义网络、卷、配置、部署等。以下是一些常见的顶级字段：

1. **`networks`（网络）**:
   - 通过 `networks` 字段，您可以定义应用程序中的网络，以便服务之间进行通信。可以设置网络别名、驱动程序和其他网络相关的配置。
   - 示例：
     ```yaml
     networks:
       my_network:
         driver: bridge
     services:
       web:
         networks:
           - my_network
     ```

2. **`volumes`（卷）**:
   
   - 通过 `volumes` 字段，您可以定义应用程序中的卷，用于数据持久性或容器之间的共享数据。可以设置卷的驱动程序、外部卷等。
   - 示例：
     ```yaml
     volumes:
       data_volume:
     services:
       app:
         volumes:
           - data_volume:/data
     ```
   
3. **`configs`（配置）**:
   - 通过 `configs` 字段，您可以定义用于配置服务的配置对象。这些配置可以存储敏感信息，如密码、密钥等，并用于容器内部。
   - 示例：
     ```yaml
     configs:
       my_config:
         file: ./config-file.txt
     services:
       web:
         configs:
           - source: my_config
             target: /app/config.txt
     ```

4. **`secrets`（密钥）**:
   
   - 通过 `secrets` 字段，您可以定义用于存储敏感信息的密钥。密钥可以被挂载到服务中，以提供安全的配置。
   - 示例：
     ```yaml
     secrets:
       my_secret:
         file: ./secret-file.txt
     services:
       web:
         secrets:
           - source: my_secret
             target: /app/secret.txt
     ```
   
5. **`configs` 和 `secrets`（配置和密钥的高级使用）**:
   - 这两个字段可以更复杂地结合使用，以提供更灵活的配置和密钥管理。
   - 示例：
     ```yaml
     version: '3.1'
     
     services:
       web:
         image: nginx:latest
         configs:
           - source: nginx_config
             target: /etc/nginx/nginx.conf
         secrets:
           - source: my_secret
             target: /etc/nginx/secret.txt
     
     configs:
       nginx_config:
         file: ./nginx.conf
     
     secrets:
       my_secret:
         file: ./secret-file.txt
     ```

这些字段使得 Docker Compose 文件更加灵活，能够满足不同场景下的需求。具体使用时，根据您的应用程序的特点和要求，选择合适的字段进行配置。



## 5

## ---

## volumes

在Docker Compose中，`volumes`字段用于定义和管理Docker容器的持久化数据存储。卷允许数据持久化，即使容器停止或删除也能保留数据。在提供的Docker Compose文件片段中，`volumes`字段用于指定不同服务的卷。

让我们分解一下你的Docker Compose文件中的卷：

```yaml
volumes:
  - ./data:/data
  - ./mysql:/var/lib/mysql
  - ./log:/home/neople/game/log
```

1. `- ./data:/data`：这一行在容器中创建一个名为`/data`的卷，并将其映射到主机上的`./data`目录。容器中写入`/data`目录的任何数据都将持久化在主机上的`./data`目录中。

2. `- ./mysql:/var/lib/mysql`：这一行在容器中创建一个名为`/var/lib/mysql`的卷，并将其映射到主机上的`./mysql`目录。这通常用于存储MySQL数据库文件，确保在容器重新启动之间数据库数据得以保留。

3. `- ./log:/home/neople/game/log`：这一行在容器中创建一个名为`/home/neople/game/log`的卷，并将其映射到主机上的`./log`目录。它用于持久化应用程序在主机上指定目录中生成的日志文件。

总之，`volumes`字段定义了三个卷，每个卷都有特定的目的，并将它们映射到主机上的目录。这样做可以确保Docker容器生成或使用的数据可以持久化存储在容器环境之外。



**左边是宿主机目录还是右边？**

在Docker Compose文件中，`volumes`字段中的左边表示宿主机（host machine）的目录，而右边表示Docker容器内部的目录。具体来说：

- `./data:/data`：左边的`./data`是宿主机上的目录，右边的`/data`是Docker容器内部的目录。这表示宿主机上的`./data`目录会与Docker容器内的`/data`目录进行映射。

- `./mysql:/var/lib/mysql`：左边的`./mysql`是宿主机上的目录，右边的`/var/lib/mysql`是Docker容器内部的目录。这表示宿主机上的`./mysql`目录会与Docker容器内的`/var/lib/mysql`目录进行映射。

- `./log:/home/neople/game/log`：左边的`./log`是宿主机上的目录，右边的`/home/neople/game/log`是Docker容器内部的目录。这表示宿主机上的`./log`目录会与Docker容器内的`/home/neople/game/log`目录进行映射。

总体而言，左边是宿主机上的路径，右边是Docker容器内部的路径，通过这种映射关系，容器可以访问并持久化存储在宿主机上的数据。





## shm_size

在Docker Compose文件中，`shm_size: 8g` 是用来设置共享内存大小的配置。这是针对 Docker 容器中的共享内存而言的。

解释一下：

- `shm_size` 是 "Shared Memory Size"（共享内存大小）的缩写。
- `8g` 表示设置共享内存的大小为8GB。

共享内存是一块可以被多个进程访问的内存区域，它允许多个进程共享数据。在Docker容器中，通过设置`shm_size`，你可以为容器中运行的进程提供指定大小的共享内存。

在你的 Docker Compose 文件中：

```yaml
dnf:
  image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/dnf:centos6-2.0.2
  # 其他配置...
  shm_size: 8g
  # 其他配置...
```

这表示 `dnf` 服务的容器将被分配8GB的共享内存。这在某些应用场景中可能是必需的，例如某些应用程序需要较大的共享内存来运行。

请注意，共享内存的配置可能因操作系统和Docker运行时的不同而有所差异。在这里，`shm_size: 8g` 表示将8GB的共享内存配置给`dnf`服务的容器。



## memswap_limit

在Docker Compose文件中，`memswap_limit: -1` 是用来设置容器的内存+交换空间的限制的配置。

解释一下：

- `memswap_limit` 是用来限制容器可以使用的内存+交换空间的总量。
- `-1` 表示不设置具体的限制，即容器可以使用主机上的所有可用内存和交换空间。

这意味着，对于你的 `dnf` 服务容器：

```yaml
dnf:
  image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/dnf:centos6-2.0.2
  # 其他配置...
  memswap_limit: -1
  # 其他配置...
```

该容器被允许使用主机上的所有可用内存和交换空间，而不受具体限制。这样的设置通常用于允许容器动态使用主机的内存资源，而不受严格的限制。

请注意，对内存和交换空间的使用限制可能会受到主机操作系统和Docker运行时的限制。在这里，`memswap_limit: -1` 表示不设置具体的限制，容器可以根据需要使用可用的所有内存和交换空间。





## mem_limit

在Docker Compose文件中，`mem_limit: 1g` 是用来设置容器的内存限制的配置。

解释一下：

- `mem_limit` 是用来限制容器可以使用的物理内存的总量。
- `1g` 表示将容器的内存限制设置为1GB。

这意味着，对于你的 `dnf` 服务容器：

```yaml
dnf:
  image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/dnf:centos6-2.0.2
  # 其他配置...
  mem_limit: 1g
  # 其他配置...
```

该容器被限制只能使用1GB的物理内存。这样的设置有助于控制容器的内存消耗，防止它占用过多的系统资源。

请注意，对于内存限制的设置，也可能受到主机操作系统和Docker运行时的限制。在这里，`mem_limit: 1g` 表示将容器的内存限制设置为1GB。



**不做限制呢？**

省略该配置项即可。这将允许容器在主机上使用尽可能多的可用内存。





## cpu_count

在Docker Compose文件中，`cpu_count: 1` 是用来设置容器使用的虚拟CPU核心数量的配置。

解释一下：

- `cpu_count` 是用来指定容器可以使用的虚拟CPU核心的数量。
- `1` 表示将容器限制为使用1个虚拟CPU核心。

这意味着，对于你的 `dnf` 服务容器：

```yaml
dnf:
  image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/dnf:centos6-2.0.2
  # 其他配置...
  cpu_count: 1
  # 其他配置...
```

该容器被限制只能使用1个虚拟CPU核心。这样的设置有助于控制容器在主机上的CPU资源使用，防止它占用过多的计算资源。

请注意，对于CPU核心数量的设置，也可能受到主机操作系统和Docker运行时的限制。在这里，`cpu_count: 1` 表示将容器限制为使用1个虚拟CPU核心。



## cpus

在Docker Compose文件中，`cpus: 1.0` 是用来设置容器使用的CPU份额的配置。

解释一下：

- `cpus` 是用来指定容器可以使用的CPU份额的数量。这个值是一个浮点数，表示占用主机上总CPU资源的比例。
- `1.0` 表示将容器限制为使用主机上全部的CPU资源。

这意味着，对于你的 `dnf` 服务容器：

```yaml
dnf:
  image: registry.cn-hangzhou.aliyuncs.com/xiangzheng_repo/dnf:centos6-2.0.2
  # 其他配置...
  cpus: 1.0
  # 其他配置...
```

该容器被配置为使用主机上全部的CPU资源。这样的设置有助于控制容器在主机上的CPU资源使用，确保它可以占用整个CPU核心的计算能力。

请注意，`cpus: 1.0` 是一个相对于主机上总CPU资源的比例。如果主机有多个CPU核心，容器将获得相应的份额，而不是固定占用一个核心。



**cpu_count 和 cpus 有什么区别？**

`cpu_count` 和 `cpus` 是 Docker Compose 文件中用于配置容器的 CPU 相关参数的两个不同的选项。

1. **cpu_count:**
   - **类型：** 整数
   - **作用：** 用于指定容器可以使用的虚拟 CPU 核心的数量。这个值应该是一个整数，表示容器可以使用的 CPU 核心数目。
   - **示例：** `cpu_count: 1` 表示容器被限制只能使用一个虚拟 CPU 核心。

2. **cpus:**
   - **类型：** 浮点数
   - **作用：** 用于指定容器可以使用的 CPU 份额，表示容器占用主机上总 CPU 资源的比例。这个值是一个浮点数，通常在 0 和 1 之间，表示相对于主机上总 CPU 资源的百分比。
   - **示例：** `cpus: 0.5` 表示容器被配置为使用主机上总 CPU 资源的一半。

**区别：**
- **cpu_count 是整数，表示具体的核心数目。**
- **cpus 是浮点数，表示占用主机上总 CPU 资源的比例。**

在实际使用中，你可以根据需要选择使用其中的一个或两者结合使用，以满足容器对 CPU 资源的需求。例如，如果你想要容器使用固定数量的 CPU 核心，可以使用 `cpu_count`。如果你想要容器占用主机上一定比例的 CPU 资源，可以使用 `cpus`。



# docker-compose 开机自启

```ini
# cat /etc/systemd/system/cmdb.service
[Unit]
Description=Docker Compose Service
Requires=docker.service
After=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/cmdb
#  如 Type=simple，则 ExecStart 执行的命令需前台运行，不能加-d
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
Restart=always

[Install]
WantedBy=multi-user.target
```

