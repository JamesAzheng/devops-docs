---
title: "Pipeline与Jenkinsfile"
---

# pipeline 概述

https://www.jenkins.io/zh/doc/book/pipeline/

- pipeline实际上就是基于Groovy语言实现的一种DSL，用于描述代码编译到打包发布的整个流水线是如何进行的；

## DSL

- **领域特定语言**（英语：domain-specific language、DSL）指的是专注于某个[应用程序](https://baike.baidu.com/item/应用程序/5985445?fromModule=lemma_inlink)领域的[计算机语言](https://baike.baidu.com/item/计算机语言/4456504?fromModule=lemma_inlink)。又译作**领域专用语言**。
- Jenkins中的不同插件集成到pipeline时通常具有不同的语法格式



# pipeline 分类

- `Jenkinsfile` 能使用两种语法进行编写 - 声明式和脚本式；
- 声明式和脚本式的流水线从根本上是不同的。 声明式流水线的是 Jenkins 流水线更近的特性

## 声明式

- 相比脚本化的流水线语法，它提供更丰富的语法特性；
- 是为了使编写和读取流水线代码更容易而设计的。



## 脚本式





# pipeline 定义

## 通过 Blue Ocean

https://www.jenkins.io/zh/doc/book/blueocean/

在 Blue Ocean 中设置一个流水线项目后，Blue Ocean UI 会帮你编写流水线的 `Jenkinsfile` 文件并提交到源代码管理系统。





## 通过经典 UI

你可以通过经典 UI 在 Jenkins 中直接输入基本的流水线。

- Jenkins主页 **-->** 新建item**-->** 自定义项目名称后创建流水线
  - 注意：Jenkins 使用这个项目名称在磁盘上创建目录。建议不要在项目名称中使用空格，因为这样做可能会触发在脚本中不能正确处理目录路径中的空格的bug。

- 第一次保存流水线定义时，UI会提示流水线尚未执行；在项目上通过“立即构建”，可手动触发构建过程；

### 阶段视图

- 任务执行结果会在阶段视图中以方块的形式显示；
  - 一次构建用一行方块来表示，其中每个方块代表流水线中的一个stage；
  - 每个方块都代表了一个特定阶段的一次执行结果；
- 方块颜色的含义：
  - 蓝色条纹：运行中
  - 白色：stage尚未执行
  - 红色条纹：state执行失败
  - 绿色：stage执行成功
  - 浅红色：stage执行成功，但是下游的某个stage出 现失败

### 回放

- 非常好用的pipeline调试工具！

- 对于错误的构建任务（构建历史中查看），Jenkins提供了一种称为“回放”的机制，它允许用户**无须改变已保存的原有代码的基础上进行试验和调试；**
- 回放为用户提供了一种在原有代码基础上修改代码并再次触发pipeline的功能，以便于在正式提交
  代码之前进行一次变更的快速快速验证并查看效果；
- 点击构建菜单中的“回放”，会弹出编辑窗口，并允许用户任意修改程序，而后点击“运行”按钮来验
  证变更效果；
- Jenkins会在回放窗口中运行编辑后的代码，并保存一次全新的构建记录，但原始代码依然保持从前的状
  态；因此，回放操作能帮用户验证变更，但**真正的变更依然需要用户手动更新pipeline的代码完成；**

### 引用 Jenkinsfile

要使用来自源代码管理系统的 `Jenkinsfile` 文件配置流水线项目：

1. 按照 [通过经典 UI](https://www.jenkins.io/zh/doc/book/pipeline/getting-started/#through-the-classic-ui)上面的步骤定义你的流水线直到第5步（在流水线配置页面访问**流水线**部分）。
2. 从 **定义** 字段选择 **Pipeline script from SCM** 选项。
3. 从 **SCM** 字段，选择包含 `Jenkinsfile` 文件的仓库的源代码管理系统的类型。
4. 填充对应仓库的源代码管理系统的字段。
   **Tip:** 如果你不确定给定字段应填写什么值，点击它右侧的 **?** 图标以获取更多信息。
5. 在 **脚本路径** 字段，指定你的 `Jenkinsfile` 文件的位置（和名称）。这个位置是 Jenkins 检出/克隆包括 `Jenkinsfile` 文件的仓库的位置，它应该与仓库的文件结构匹配。该字段的默认值采取名称为 "Jenkinsfile" 的 `Jenkinsfile` 文件并位于仓库的根路径。



## 在源码管理系统中定义

https://www.jenkins.io/zh/doc/book/pipeline/getting-started/#defining-a-pipeline-in-scm

你可以手动编写一个 `Jenkinsfile` 文件，然后提交到项目的源代码管理仓库中

通常认为最好的实践是在 `Jenkinsfile` 文件中定义流水线，Jenkins 之后会直接从源代码管理系统加载。


# Jenkins Pipeline 概述

Jenkins Pipeline 是 Jenkins 中一种用于定义和管理持续集成和持续交付 (CI/CD) 流程的方式。它通过代码的形式编写自动化流程，将构建、测试、部署等步骤组织在一起，形成一条清晰的流水线。通过 Jenkins Pipeline，开发团队可以更灵活地配置并管理项目的生命周期，自动化复杂的开发流程，提升交付效率和代码质量。

## Jenkins Pipeline 基本概念

1. **Pipeline**:
   - **Pipeline** 是 Jenkins 中用来定义自动化流程的脚本，它包含了从代码的构建、测试到部署的各个步骤。Pipeline 通过代码来描述这些步骤，以确保流程可以版本化、共享和维护。

2. **Pipeline DSL (Domain-Specific Language)**:
   - Jenkins Pipeline 使用特定领域语言 (DSL) 来编写。这个 DSL 基于 Groovy 语言，可以灵活定义流水线的各个阶段和步骤。

3. **两种 Pipeline 模式**:
   - **Declarative Pipeline（声明式 Pipeline）**: 更直观，语法结构化，适合大多数场景，便于阅读和维护。
   - **Scripted Pipeline（脚本化 Pipeline）**: 基于 Groovy 语言，灵活性强，但相对复杂，适合有特定需求或高级自定义场景。

## Jenkins Pipeline 的基本结构

### 1. 声明式 Pipeline 结构:
声明式 Pipeline 是更受欢迎的模式，具有更结构化和简单的语法，常见的关键字有 `pipeline`、`agent`、`stages`、`steps` 等。

```groovy
pipeline {
    agent any  // 指定运行流水线的环境
    stages {
        stage('Build') {
            steps {
                // 定义构建步骤
                echo 'Building...'
                // 其他构建相关的操作，如编译代码
            }
        }
        stage('Test') {
            steps {
                // 定义测试步骤
                echo 'Testing...'
                // 运行测试脚本
            }
        }
        stage('Deploy') {
            steps {
                // 定义部署步骤
                echo 'Deploying...'
                // 部署代码到服务器或环境
            }
        }
    }
}
```

### 2. 脚本化 Pipeline 结构:
脚本化 Pipeline 提供更大的灵活性，可以完全使用 Groovy 语言进行定制。与声明式 Pipeline 相比，它没有固定的结构。

```groovy
node {
    stage('Build') {
        echo 'Building...'
        // 构建操作
    }
    stage('Test') {
        echo 'Testing...'
        // 测试操作
    }
    stage('Deploy') {
        echo 'Deploying...'
        // 部署操作
    }
}
```

## Pipeline 的核心组件

1. **Agent**:
   - 定义在哪个 Jenkins 节点上执行 Pipeline 或阶段。可以是本地机器或分布式环境中的节点。

2. **Stages**:
   - **Stage** 是 Pipeline 的核心，表示流水线的不同阶段。通常包括构建、测试、部署等阶段。

3. **Steps**:
   - **Steps** 是每个阶段中实际执行的操作。例如，运行 shell 命令、调用构建工具、执行测试脚本等。

4. **Post**:
   - 用于定义在 Pipeline 结束后（成功或失败）需要执行的操作，常用于清理、通知等。

   ```groovy
   post {
       always {
           echo 'This will always run'
       }
       success {
           echo 'This will run only if successful'
       }
       failure {
           echo 'This will run only if failed'
       }
   }
   ```

## Jenkins Pipeline 的优势

1. **流水线即代码 (Pipeline as Code)**: 流水线被作为代码管理，可以存储在版本控制系统中，便于共享、复用和维护。
2. **可视化**: Jenkins 提供了图形化的界面，可以直观地看到流水线执行的每个阶段、步骤及状态。
3. **自动化流程**: 支持从代码构建、测试、发布的全流程自动化，减少人为操作，提升效率。
4. **灵活性和可扩展性**: 通过 Jenkins 插件和自定义脚本，可以灵活扩展流水线的功能，支持各种编程语言、测试框架和部署环境。
5. **分布式构建**: 可以在多个节点上并行执行任务，适合大型项目和复杂的 CI/CD 流程。

## 使用场景

- **持续集成 (CI)**: Jenkins Pipeline 可以自动化代码的拉取、编译和测试，确保每次代码提交后都能及时反馈构建和测试结果。
- **持续交付 (CD)**: 可以实现代码自动部署到多个环境中，确保软件快速、稳定地交付到生产环境。
- **自动化测试**: 流水线可以集成自动化测试工具，在代码变更后自动触发测试，确保代码质量。

总的来说，Jenkins Pipeline 为持续集成和持续交付提供了一个强大、灵活和自动化的解决方案，使开发团队可以更高效地管理软件的发布和迭代。



# Jenkins Pipeline 参考

## 部署前端代码

以下是一个完整的 Jenkins Pipeline 示例，展示如何从 GitLab 拉取前端代码，并将其构建和部署到 Nginx 服务器上。这个示例假设你使用的是声明式 Pipeline，适用于前端项目（如 React、Vue 或 Angular），并通过 Nginx 进行托管。

### 前提条件
1. **GitLab 仓库**：项目源代码存放在 GitLab 上。
2. **Nginx 服务器**：用于部署前端应用的服务器。
3. **Node.js**：用于构建前端项目的环境（安装 npm 包，运行构建）。
4. **SSH 密钥**：Jenkins 必须能够通过 SSH 访问 Nginx 服务器，并具备合适的权限将构建产物拷贝到服务器。

### Pipeline 示例

```groovy
pipeline {
    agent any  // 在任何可用的 Jenkins 节点上运行
    environment {
        GIT_REPO_URL = 'git@gitlab.com:your-username/your-repo.git'  // GitLab 项目仓库的 URL
        BRANCH_NAME = 'main'  // 要拉取的分支
        DEPLOY_SERVER = 'your-nginx-server'  // Nginx 服务器的 SSH 别名或 IP 地址
        DEPLOY_PATH = '/var/www/html'  // Nginx 的部署路径
        NODE_VERSION = '16'  // Node.js 版本
    }
    stages {
        stage('Clone from GitLab') {
            steps {
                echo 'Cloning the repository from GitLab...'
                // 拉取 GitLab 仓库代码
                git branch: "${BRANCH_NAME}", url: "${GIT_REPO_URL}"
            }
        }
        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies...'
                // 使用 nvm 安装指定版本的 Node.js
                sh """
                    . ~/.nvm/nvm.sh
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}
                    npm install
                """
            }
        }
        stage('Build Project') {
            steps {
                echo 'Building the project...'
                // 使用 npm 构建前端项目
                sh """
                    . ~/.nvm/nvm.sh
                    nvm use ${NODE_VERSION}
                    npm run build
                """
            }
        }
        stage('Deploy to Nginx') {
            steps {
                echo 'Deploying to Nginx server...'
                // 将构建的产物通过 SCP 上传到 Nginx 服务器
                sh """
                    scp -r dist/* ${DEPLOY_SERVER}:${DEPLOY_PATH}
                """
            }
        }
    }
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
```

### 详细说明

#### 1. **环境变量设置 (Environment Block)**
   - `GIT_REPO_URL`：GitLab 仓库的地址，确保使用 SSH URL 以便 Jenkins 能通过 SSH 拉取代码。
   - `BRANCH_NAME`：需要拉取的分支，默认为 `main` 分支。
   - `DEPLOY_SERVER`：Nginx 服务器的 SSH 别名或 IP 地址。确保你已经设置了 Jenkins 到服务器的 SSH 密钥，并能够无密码登录。
   - `DEPLOY_PATH`：Nginx 服务器上的部署目录，通常是 `/var/www/html`。
   - `NODE_VERSION`：指定项目使用的 Node.js 版本。可以根据项目需求进行调整。

#### 2. **阶段说明 (Stages)**

##### 1. **Clone from GitLab**:
   - 使用 `git` 拉取代码。确保你已经在 Jenkins 上配置了 SSH 密钥，以便访问 GitLab 仓库。

##### 2. **Install Dependencies**:
   - 安装项目依赖，通常前端项目需要 `npm install`。
   - 这里假设你使用的是 `nvm` 来管理 Node.js 版本，确保在 Jenkins 节点上安装了 `nvm`。

##### 3. **Build Project**:
   - 使用 `npm run build` 来构建前端项目，生成静态文件。不同的前端框架有不同的构建命令：
     - React：`npm run build`
     - Vue：`npm run build`
     - Angular：`ng build --prod`

##### 4. **Deploy to Nginx**:
   - 使用 `scp` 命令将本地构建目录中的静态文件上传到远程 Nginx 服务器。
   - 构建产物目录通常是 `dist` 或者 `build`，根据项目框架选择正确的文件夹。
   - 确保 Jenkins 有权限在目标服务器的 `DEPLOY_PATH` 目录中写入文件。

#### 3. **Post 块**
   - `success` 和 `failure` 分别表示在流水线成功或失败时执行的操作。可以在这里发送通知或执行其他操作。

### 部署细节

1. **Nginx 配置**：
   - 确保你的 Nginx 配置文件指向正确的部署目录。例如：

     ```nginx
     server {
         listen 80;
         server_name your-domain.com;
     
         location / {
             root /var/www/html;
             index index.html;
             try_files $uri $uri/ /index.html;
         }
     }
     ```

2. **权限管理**：
   - Jenkins 需要具备上传文件的权限。你可以使用 SSH 密钥对配置免密登录，确保 Jenkins 用户有权访问 `DEPLOY_PATH`。

### 注意事项

1. **SSH 配置**：在 Jenkins 中配置 SSH 密钥，用于访问 GitLab 仓库和部署服务器。你可以通过 Jenkins 的凭据管理器来添加 SSH 密钥。
2. **Nginx 文件权限**：确保 `DEPLOY_PATH` 目录有正确的文件权限，以便 Jenkins 可以将构建产物上传到服务器。
3. **Nvm & Node.js**：Jenkins 节点上需要安装 `nvm` 以及相应的 Node.js 版本。

通过这个 Jenkins Pipeline，你可以实现一个自动化的流程，从 GitLab 拉取代码，构建前端项目，并将其自动部署到 Nginx 服务器上，大大简化了手动部署的过程。



# 通过 docker 镜像构建 Pipeline 

https://www.jenkins.io/doc/book/pipeline/docker/

- 需要安装 Docker Pipeline 插件

## 方法一

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'node --version'
                        sh 'sleep 60'
                    }
                }
            }
        }
    }
}
```

## 方法二

```groovy
pipeline {
    agent {
        docker { image 'node:18-alpine' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version'
                sh 'sleep 60'
            }
        }
    }
}
```

## 方法三



# Jenkins Pipeline 生产环境示例

## 前端

```groovy
pipeline {
    agent any
    environment {
        REMOTE_HOST = '172.16.0.123'   // 部署主机IP
        SSH_CREDENTIALS_ID = 'ssh_key-172.16.0.123'  // Jenkins 中配置的 SSH 凭证 ID
        HARBOR_URL = '172.16.0.120:30002/honey/honey-front'
    }
    stages {
        // stage('Test') {
        //     steps {
        //         script {
        //             def remoteCommand = """
        //             docker rm -f honey-front
        //             docker pull ${env.HARBOR_URL}:${env.BUILD_ID}
        //             docker run -d --name honey-front -p 8080:80 ${env.HARBOR_URL}:${env.BUILD_ID}"
        //             """
        //             sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
        //                 sh "ssh -o StrictHostKeyChecking=no ${env.REMOTE_HOST} '${remoteCommand}'"
        //             }
        //         }

        //     }
        // }
        stage('克隆前端代码') {
            steps {
                git branch: 'main', credentialsId: 'gitlab-guoranran', url: 'http://172.16.20.24/four_honey/front.git'
                echo '前端代码克隆完成'

            }
        }
        stage('构建前端代码') {
            steps {
                script {
                    docker.image('node:18-alpine').inside {
                        sh """
                            corepack enable
                            corepack prepare pnpm@9 --activate
                            npm config set registry https://repo.huaweicloud.com/repository/npm/
                            pnpm install --frozen-lockfile
                            pnpm build
                        """
                    }
                echo '前端代码构建完成'
                }
            }
        }
        stage('构建镜像') {
            steps {
                sh """
                    docker build -t honey-front:${env.BUILD_ID} .
                """
                echo '镜像构建完成'
            }
        }
        stage('推送镜像') {
            steps {
                sh """
                    docker login http://172.16.0.120:30002/ -u admin -p Harbor12345
                    docker tag honey-front:${env.BUILD_ID} ${env.HARBOR_URL}:${env.BUILD_ID}
                    docker push ${env.HARBOR_URL}:${env.BUILD_ID}
                """
                echo '镜像推送完成'
            }
        }
        stage('运行镜像') {
            steps {
                script {
                    def remoteCommand = """
                    docker rm -f honey-front
                    docker pull ${env.HARBOR_URL}:${env.BUILD_ID}
                    docker run -d --name honey-front -p 8080:80 ${env.HARBOR_URL}:${env.BUILD_ID}
                    """
                    sshagent (credentials: [env.SSH_CREDENTIALS_ID]) {
                        sh "ssh -o StrictHostKeyChecking=no ${env.REMOTE_HOST} '${remoteCommand}'"
                    }
                }
                echo '镜像运行成功!'

            }
        }
    }
}
```



# ---

# 1

- pipeline的定义有一个明确的、必须遵循的结构，它由一些directive 和section组成，每一个section又可包含其它的section、directive和 step，以及一些condition的定义；
  - Section：负责将那些在某个时间点需要一同运行的条目（item）组织 在一起；
  - Directive（指令）：负责完成特定功能的语句或代码块，如 environment、tools、triggers、input和when等；
  - Steps：steps本身就是一个标识特定section的名称，其内部可以使用任何合法的DSL语句，例如git、sh、bat和echo等；
- pipeline一般由多个阶段组成，包括获取源代码、 编译、集成测试、代码分析、应用打包和部署等；

### 获取帮助

https://www.jenkins.io/zh/doc/book/pipeline/syntax/

从已配置好的流水线导航到**流水线语法**链接，或访问 ``${YOUR_JENKINS_URL}/pipeline-syntax``。

- 该内置文档基于 Jenkins 实例中安装的插件自动生成和更新。

### 片段生成器

- 片段生成器可以帮助生成脚本式流水线的步骤或者声明式流水线的 `stage` 中的 `steps` 代码块
- 片段生成器由 Jenkins 实例中可用的step动态添加。**可用的step的数量依赖于安装的插件**

### 全局变量参考

- 内置的全局变量参考和片段生成器一样，**它也是由插件动态添加**，其中提供了可用于pipeline的变量文档

### 指令生成器

- Declarative Directive Generator
- 片段生成器可以帮助生成脚本式流水线的步骤或者声明式流水线的 `stage` 中的 `steps` 代码块，但是其并没有包含用于定义声明式流水线的 [section（节段）](https://www.jenkins.io/zh/doc/book/pipeline/syntax/#declarative-sections)和 [directive（指令）](https://www.jenkins.io/zh/doc/book/pipeline/syntax/#declarative-sections)。声明式指令生成器（Declarative Directive Generator）这个工具可以做到这点。和 [片段生成器](https://www.jenkins.io/zh/doc/book/pipeline/getting-started/##snippet-generator)类似，指令生成器允许你选择声明式的指令，对其以一种方式进行配置，然后生成这个指令的配置，让你将其用于声明式流水线。

要使用声明式指令生成器生成一个声明式的指令：

1. 从已配置好的流水线导航到 **Pipeline Syntax/流水线语法** 链接，然后点击侧栏的 **Declarative Directive Generator**，或直接访问 ``${YOUR_JENKINS_URL}/directive-generator``。
2. 在下拉菜单中选择需要的指令。
3. 使用下拉菜单下面动态生成的区域配置已选的指令。
4. 点击 **Generate Declarative Directive** 生成一个能够被复制到流水线中的指令配置。

指令生成器可以生成嵌套的指令配置，比如在 `when` 指令内的条件，但是它不能生成流水线步骤。对于包含步骤的指令内容，比如 `stage` 内的 `steps` 或 `post` 内的条件如 `always` 或 `failure`，指令生成器添加一个占位符注释。你仍然需要手动添加步骤到流水线中。

```groovy
Jenkinsfile (Declarative Pipeline)
stage('Stage 1') {
    steps {
        // One or more steps need to be included within the steps block.
    }
}
```





# pipeline

https://www.jenkins.io/zh/doc/book/pipeline/syntax/#声明式流水线

必选字段，流水线的最外层结构，代表整条pipeline，包含着pipeline的完整逻辑

`pipeline`块是Jenkins Pipeline的顶级构建块，用于定义整个Pipeline的结构、参数、选项和阶段。以下是`pipeline`块的一些关键要点：

1. **Agent指令**：`pipeline`块中可以包含`agent`指令，用于指定在哪个代理（agent）上运行Pipeline。例如：

   ```groovy
   pipeline {
       agent any
       // 或 agent { label 'my-defined-label' }
   }
   ```

   这将指定Pipeline在任何可用代理上运行，或者您可以指定特定的代理标签。

2. **环境变量设置**：您可以在`pipeline`块中使用`environment`指令设置环境变量，这些变量可以在整个Pipeline中使用。例如：

   ```groovy
   pipeline {
       environment {
           PATH = "/usr/local/bin:${env.PATH}"
       }
   }
   ```

   这将设置`PATH`环境变量，使其包含`/usr/local/bin`目录。

3. **参数定义**：您可以在`pipeline`块中使用`parameters`指令定义接受用户输入的参数。例如：

   ```groovy
   pipeline {
       parameters {
           string(name: 'DeployEnv', defaultValue: 'production', description: 'Environment to deploy to')
       }
   }
   ```

   这将定义一个名为`DeployEnv`的字符串参数，它的默认值为`production`，并且在Jenkins界面中将显示相应的描述。

4. **Stages定义**：`pipeline`块中的核心是`stages`指令，它定义了Pipeline的不同阶段。每个阶段可以包含多个步骤。例如：

   ```groovy
   pipeline {
       stages {
           stage('拉取代码') {
               steps {
                   // 步骤定义
               }
           }
           // 其他阶段...
       }
   }
   ```

5. **后续操作定义**：最后，`pipeline`块通常包含`post`指令，用于定义Pipeline完成后执行的操作，无论成功与否。例如：

   ```groovy
   pipeline {
       post {
           always {
               // 始终执行的操作
           }
           success {
               // 仅在成功时执行的操作
           }
           failure {
               // 仅在失败时执行的操作
           }
       }
   }
   ```

通过合理配置`pipeline`块，您可以创建复杂的构建流程，并确保Jenkins在构建过程中执行正确的操作，使整个软件交付流程更加可靠和高效。



# agent

https://www.jenkins.io/zh/doc/book/pipeline/syntax/#代理

必选字段，agent用于指定负责运行pipeline或stage中的代码的节点，它可能是代表着slave主机的某个物理机、虚拟机或者容器；

在pipeline代码块的顶部，必须要有一个agent来指定默认的执行节点；
- 而一个stage的顶部也可以有一个agent的定义，用来指定负责运行该stage中的代码的节点；
  - agent指令也可用于stage配置段中，用于为该配置段指定专用的节点

`agent`指令用于指定Jenkins Pipeline中的构建代理，即指定Pipeline将在哪个类型的节点上运行。它允许您控制在哪种类型的计算环境中运行Pipeline。

通过合理使用`agent`指令，您可以控制Pipeline在哪种类型的构建代理上运行，并且能够根据需要选择最适合的环境来执行构建任务。



在Jenkins Pipeline中，`agent`指令通常用于以下几种方式：



## Kubernetes 

https://plugins.jenkins.io/kubernetes/

https://blog.csdn.net/qq_22648091/article/details/117839155

Jenkins Kubernetes Agent是一种用于Jenkins CI/CD的插件，它允许您在Kubernetes集群中动态创建代理（代理节点）来执行Jenkins构建任务。这种插件使得Jenkins能够充分利用Kubernetes的弹性和可扩展性，并在需要时动态地创建和销毁代理节点，从而更好地适应不同的工作负载需求。

下面是一些关于Jenkins Kubernetes Agent的详细解释：

1. **动态代理创建**：Jenkins Kubernetes Agent允许Jenkins根据需要动态地在Kubernetes集群中创建代理节点，这些节点可以用于执行Jenkins的构建任务。当有新的构建任务时，它可以自动地创建新的代理节点，而不是预先分配和静态配置代理节点。

2. **资源利用率**：使用Jenkins Kubernetes Agent可以更有效地利用资源，因为它可以根据需要动态地创建和删除代理节点，而不是静态地占用资源。这使得Jenkins可以根据工作负载的变化来调整代理节点的数量，从而提高资源利用率。

3. **弹性扩展**：Jenkins Kubernetes Agent允许根据需要扩展Jenkins的计算能力，因为它可以在Kubernetes集群中自动调度和管理代理节点。这使得Jenkins能够处理不同规模和复杂度的构建任务，而无需静态地配置大量的代理节点。

4. **容器化构建环境**：Jenkins Kubernetes Agent允许将构建任务运行在Kubernetes集群中的容器中，这使得构建环境更加一致和可重复。您可以利用Kubernetes的容器编排功能来管理和调度构建任务所需的容器化环境。

总的来说，Jenkins Kubernetes Agent使得Jenkins能够更好地与Kubernetes集群集成，从而实现更灵活、高效和弹性的构建和部署流程。



以下是一个简单的示例，展示了如何在Jenkins中使用Pod模板来定义Kubernetes Pod，并结合Pipeline来执行构建任务：

```groovy
pipeline {
    agent {
        kubernetes {
            // 定义Kubernetes Pod模板
            yaml """
                apiVersion: v1
                kind: Pod
                metadata:
                  labels:
                    component: myapp
                spec:
                  containers:
                  - name: maven
                    image: maven:3.6.3-openjdk-11
                    command:
                    - sleep
                    args:
                    - infinity
            """
        }
    }
    stages {
        stage('拉取代码') {
            steps {
                // 从代码库中拉取代码的步骤
                script {
                    echo '正在拉取代码...'
                    git 'https://github.com/example/myapp.git'
                }
            }
        }
        stage('构建') {
            steps {
                // 构建应用程序的步骤
                script {
                    echo '正在构建应用程序...'
                    sh 'mvn clean install'
                }
            }
        }
    }
    post {
        always {
            echo '清理工作空间...'
            cleanWs()
        }
        success {
            echo '部署成功!'
        }
        failure {
            echo '部署失败，请检查日志以找出问题所在。'
        }
    }
}
```

在这个示例中，我们首先定义了一个Kubernetes Pod模板，其中包含了一个基于Maven镜像的容器。然后，在Pipeline中使用了这个Pod模板作为Jenkins代理来执行拉取代码和构建任务。最后，定义了清理工作空间以及成功或失败后的处理操作。

请根据您的实际需求和Kubernetes集群配置对示例进行相应调整。



## any 任何代理

可以使用`agent any`指令，让Jenkins选择任何可用的构建代理来运行Pipeline。示例：

```groovy
pipeline {
    agent any
    // 其他Pipeline配置
}
```



## label 特定代理

可以指定Pipeline应该运行在具有特定标签的代理上。

- **label { label "\<label>" }**：具有指定的标签的节点均为可用节点；

示例：

```groovy
pipeline {
    agent {
        label 'my-defined-label'
    }
    // 其他Pipeline配置
}
```

这将使Pipeline在具有特定标签的代理节点上运行。



## docker 代理

可以使用Docker代理来指定Pipeline在Docker容器中运行。示例：

```groovy
pipeline {
    agent {
        docker {
            image 'node:14-alpine'
            args '-p 3000:3000'
        }
    }
    // 其他Pipeline配置
}
```

这将使用指定的Docker镜像来运行Pipeline，并传递额外的Docker运行参数。

### 1

- 运行docker容器 而后在容器中执行构建任务

#### 先决条件

- Jenkins 节点安装 Docker ，而后安装 Docker Pipeline 与 Docker 插件

- 将jenkins用户加入到docker组，以确保其有权限运行docker命令创建容器

  - ```
    usermod -a -G docker jenkins
    ```

- 重启jenkins服务

#### pipeline example-1

```groovy
pipeline {
    agent {
        docker { image 'openjdk:13-alpine' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'java --version'
            }
        }
    }
}
```

#### pipeline example-2

- 在Pipeline中使用多个容器

```groovy
pipeline {
    agent none
    stages {
        stage('Back-end') {
            agent {
                docker { image 'openjdk:13-alpine' }
            }
            steps {
                sh 'java --version'
            }
        }
        stage('Front-end') {
            agent {
                docker { image 'node:alpine' }
            }
            steps {
                sh 'node --version'
            }
        }
    }
}
```

#### 容器的其他可用参数

除了image外，我们还可以为docker设定更多的参数

- **label**：默认，docker容器可运行于任何配置了docker环境的主机上，而label选项可基于标签过滤出一组特定的主机来运行docker agent；因而，它与agent上的label的作用相同；
- **args**：在创建容器的命令上，传递的自定义参数，例如，使用“-v Con_PATH:Host_PAHT”来使用存储卷；
- **registryUrl**：特定镜像registry服务的URL；
- **registryCredentialsId**：存储有认证到镜像registry上的Credential的ID；

```groovy
// 以指定的凭证认证到私有registry中来获取镜像；
agent {
    docker {
        image hub.magedu.com/node:alpine'
        label 'docker_host'
        registryUrl 'https://hub.magedu.com/'
        registryCredentialsId 'hub-user-magedu'
    }
}
```

#### 为Docker配置默认的私有Registry

- Manage Jenkins → Configure System → Declarative Pipeline (Docker)



## none 无代理

不定义默认的agent，**这就需要为每个stage单独指定；**

可以使用`agent none`指令来指定Pipeline不在任何代理上运行，通常与`script`块一起使用，允许您在Jenkins服务器本身上执行一些脚本操作。

示例：

```groovy
pipeline {
    agent none
    stages {
        stage('Example') {
            steps {
                script {
                    // 在Jenkins服务器上执行的脚本
                }
            }
        }
    }
}
```





## 其它

- **node { label "\<label>" }**：与label相似，但可以指定额外的参数customWorkspace；
- **docker**：在指定的容器中运行pipeline或stage代码，该容器动态创建并运行于预配置的可运行容器的node上，或能够匹配到指定label的node上；可用参数如下：
  - image、label、args、rgistryUrl、registryCredentialsId；
- **dockerfile**：功能上类似于上面docker参数，但容器镜像通过指定的docker进行构建；该参数要求
  Jenkinsfile必须从Multibranch Pipeline或者Pipeline from SCM中加载；可用参数如下：
  - filename、dir、label、additionalBuildArgs、args、registryUrl、registryCredentialsId；
- **kubernetes**：于Kubernetes集群上指定的Pod中运行stage或pipeline代码，该参数同样要求Jenkinsfile
  必须从Multibranch Pipeline或者Pipeline from SCM中加载；
  - 需要在kubernetes参数中指定Pod模板；







# environment

`environment`指令用于在Jenkins Pipeline中设置环境变量。这些环境变量可以在Pipeline的各个阶段和步骤中使用，从而影响和控制Pipeline的执行。您可以在`pipeline`块中使用`environment`指令来设置这些变量。

以下是`environment`指令的基本示例：

```groovy
pipeline {
    environment {
        // 设置环境变量
        PATH = "/usr/local/bin:${env.PATH}"
        CUSTOM_VAR = "custom_value"
    }
    // 其他Pipeline配置
}
```

在这个示例中，我们设置了两个环境变量：`PATH`和`CUSTOM_VAR`。`PATH`变量被修改以包含`/usr/local/bin`目录，而`CUSTOM_VAR`被设置为`custom_value`。

您可以在Pipeline的各个阶段和步骤中使用这些环境变量，例如在`steps`块中执行shell命令时可以使用它们：

```groovy
pipeline {
    environment {
        PATH = "/usr/local/bin:${env.PATH}"
        CUSTOM_VAR = "custom_value"
    }
    stages {
        stage('Example') {
            steps {
                sh 'echo $PATH'  // 使用环境变量PATH
                echo "${CUSTOM_VAR}"  // 使用环境变量CUSTOM_VAR
            }
        }
    }
    // 其他Pipeline配置
}
```

通过合理设置和使用`environment`指令，您可以控制Pipeline中的各个部分使用的环境变量，从而影响构建过程中使用的工具、依赖和配置。



- 可选字段，设定环境变量，可用于stage或pipeline代码块中；支持credentials()函数，用于通过标识符访问预定义的凭证；
- 环境变量可分为Jenkins内置变量和用户自定义变量两类；

## 内置环境变量

下面是Jenkins内置的几个常用的环境变量：

- **BUILD_NUMBER**：构建号，递增的整数值；打包时，经常用作制品名称的一部分；
- **BRANCH_NAME**：在多分支pipeline中，需要根据不同的分支施加不同的操作时较为常用；
- **BUILD_URL**：当前构建页面的URL，常用于邮件通知中；
- **GIT_BRANCH**：基于git拉取的源码进行构建时使用该变量
- **JENKINS_HOME**：Jenkins的家目录；
- **JENKINS_URL**：Jenkins服务的URL；

获取更多：http://jenkins.xiangzheng.com:8080/job/pipeline-job1/pipeline-syntax/globals



## 自定义变量

**自定义环境变量：**

- 在pipeline{}或stage{}中使用environment指令即可自定义环境变量；

**自定义全局环境变量：**

- Manage Jenkins → Configure System → Global properties

**注意事项：**

- 自定义环境变量与全局环境变量同名时，全局环境变量将被覆盖；这可能会引起错误，必要时，可为自定义环境变量使用固定的前缀，例如__等；



## 变量引用

Jenkins全局环境变量可被所有的pipeline引用，它们以"env."为前缀；

- 全局环境变量引用格式有三种：
  - ${env.}
  - $env.
  - ${ENV_VAR_NAME}



## 范例 - 1

```groovy
pipeline {
    agent any
    environment { // 用在最高层的 pipeline 块的 environment 指令适用于流水线的所有步骤。
        CC = 'clang' // 自定义变量
    }
    stages {
        stage('Example') {
            environment { // 定义在 stage 中的 environment 指令只适用于 stage 中的步骤。
                DEBUG_FLAGS = '-g'
            }
            steps {
                sh 'printenv'
            }
        }
    }
}
```



## 范例 - 2



# tools

`tools`指令用于在Jenkins Pipeline中指定所需的工具或工具环境。它允许您定义所需的工具版本，并在Pipeline的不同阶段中使用这些工具。

以下是`tools`指令的基本示例：

```groovy
pipeline {
    agent any
    tools {
        // 定义所需的工具
        maven 'Maven3'
        jdk 'JDK8'
    }
    stages {
        stage('Build') {
            steps {
                // 在构建阶段使用工具
                sh 'mvn clean package'
            }
        }
    }
    // 其他Pipeline配置
}
```

在这个示例中，我们使用了`tools`指令来定义所需的工具。`maven 'Maven3'`指定了需要使用名为'Maven3'的Maven工具，`jdk 'JDK8'`指定了需要使用名为'JDK8'的Java开发工具包。然后在Pipeline的构建阶段中，使用了Maven工具执行了相应的构建命令。

通过合理使用`tools`指令，您可以确保Pipeline中使用的工具版本与您预期的版本一致，并且可以方便地管理和维护不同工具的使用。



https://www.jenkins.io/zh/doc/book/pipeline/syntax/#工具

- 可选字段，指定需要在agent上下载并配置的工具，例如git、maven、jdk等，这些工具可经由PATH环境变量指定的位置访问到；可用于stage或pipeline中；
- 工具名称必须在Jenkins中全局工具配置中预先定义



# options

`options`指令允许您在Jenkins Pipeline中配置各种附加选项，以便更好地控制Pipeline的行为。它可以用于定义超时时间、并行度、构建参数等等。以下是一些常见的选项配置示例：

1. **超时配置**：您可以使用`timeout`指令来设置Pipeline的超时时间，以防止Pipeline运行时间过长而导致问题。示例：

```groovy
pipeline {
    options {
        timeout(time: 1, unit: 'HOURS')
    }
    // 其他Pipeline配置
}
```

这个示例将设置Pipeline的超时时间为1小时，如果Pipeline执行时间超过1小时，则会中断并失败。

2. **并行度配置**：使用`parallel`指令可以允许Pipeline中的多个阶段并行执行。示例：

```groovy
pipeline {
    options {
        parallelize()
    }
    stages {
        stage('Stage 1') {
            steps {
                // 步骤定义
            }
        }
        stage('Stage 2') {
            steps {
                // 步骤定义
            }
        }
        // 其他阶段...
    }
    // 其他Pipeline配置
}
```

这个示例将允许Pipeline中的不同阶段并行执行，从而加快整体构建时间。

3. **构建参数配置**：您可以使用`buildDiscarder`指令来配置构建保留策略，以控制保留多少构建和日志。示例：

```groovy
pipeline {
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }
    // 其他Pipeline配置
}
```

这个示例将配置Pipeline保留最近5次构建和相关日志，旧的构建将被自动删除。

通过合理配置`options`指令，您可以定制Pipeline的行为，以适应不同的构建需求和执行环境，提高构建过程的灵活性和可靠性。



- 可选字段，仅可用在pipeline级别来配置pipeline自身的选项，支持的参数可由pipeline自身提供，也可由其它插件（例如timestamps）提供；
  -  例如“retry(2)”允许在pipeline失败时重试两次；





# triggers

`triggers`指令允许您在Jenkins Pipeline中配置触发器，以便在满足特定条件时自动触发Pipeline的执行。这些触发器可以基于时间、代码库的变化、外部触发事件等。

以下是一些常见的触发器配置示例：

1. **定时触发器**：您可以使用`cron`指令来配置基于Cron表达式的定时触发器，以便在特定的时间间隔内自动触发Pipeline的执行。示例：

```groovy
pipeline {
    triggers {
        cron('H 4 * * 1-5') // 每周一至周五的凌晨4点触发
    }
    // 其他Pipeline配置
}
```

这个示例将设置Pipeline在每周一至周五的凌晨4点触发执行。

2. **代码变更触发器**：您可以使用`pollSCM`指令来配置定期轮询代码库的变化，并在检测到变化时触发Pipeline的执行。示例：

```groovy
pipeline {
    triggers {
        pollSCM('* * * * *') // 每分钟轮询一次代码库的变化
    }
    // 其他Pipeline配置
}
```

这个示例将使Jenkins每分钟轮询一次代码库，如果检测到代码库有变化，将触发Pipeline的执行。

3. **外部触发器**：除了内部触发器外，您还可以配置外部触发器，例如Webhook或其他系统的事件，以触发Pipeline的执行。具体设置取决于所使用的外部系统和集成方式。

通过合理配置`triggers`指令，您可以根据特定的条件自动触发Pipeline的执行，从而实现自动化的构建和部署流程。



- 可选字段，用于指定负责自动启动pipeline的触发器，对于集成了Github或Gitlab等自带触发机制的系统场景来说，triggers并非必须的指令；仅可用于pipeline级别；



# parameters

`parameters`指令允许您在Jenkins Pipeline中定义参数，以便在执行Pipeline时接受用户输入。这些参数允许您根据需要在不同的构建中动态地配置和调整Pipeline的行为。以下是一些常见的参数配置示例：

1. **字符串参数**：您可以使用`string`指令来定义字符串类型的参数，例如版本号、环境名称等。示例：

```groovy
pipeline {
    parameters {
        string(name: 'Version', defaultValue: '1.0.0', description: 'Enter the version number')
    }
    // 其他Pipeline配置
}
```

这个示例将定义一个名为`Version`的字符串参数，它的默认值为`1.0.0`，并在Jenkins界面中显示相应的描述。

2. **布尔参数**：您可以使用`booleanParam`指令来定义布尔类型的参数，例如开关选项。示例：

```groovy
pipeline {
    parameters {
        booleanParam(name: 'Debug', defaultValue: true, description: 'Enable debug mode')
    }
    // 其他Pipeline配置
}
```

这个示例将定义一个名为`Debug`的布尔参数，它的默认值为`true`，并且在Jenkins界面中显示相应的描述。

3. **Choice参数**：您可以使用`choice`指令来定义多个选项中的一个作为参数值。示例：

```groovy
pipeline {
    parameters {
        choice(name: 'Environment', choices: ['dev', 'staging', 'production'], description: 'Select the deployment environment')
    }
    // 其他Pipeline配置
}
```

这个示例将定义一个名为`Environment`的Choice参数，允许用户从给定的选项中选择一个作为参数值，并在Jenkins界面中显示相应的描述。

通过合理配置`parameters`指令，您可以实现动态配置Pipeline的能力，根据用户输入的参数值来控制和定制Pipeline的行为。



- 可选字段，用户在触发pipeline时应该提供的参数列表；仅可用于pipeline级别；



# libraries

- 可选字段，当前pipeline可以导入的共享库，该共享库内部的代码则可被该pipeline调用；



`libraries`指令允许您在Jenkins Pipeline中加载外部共享库，这些共享库通常包含了通用的、可重复使用的代码段，可以在多个Pipeline中共享和重用。这样可以有效地管理和维护共享的代码逻辑，提高Pipeline的可维护性和可重用性。

以下是`libraries`指令的基本示例：

```groovy
pipeline {
    libraries {
        // 加载外部共享库
        lib('my-shared-library@master')
    }
    // 其他Pipeline配置
}
```

在这个示例中，我们使用`libraries`指令加载名为`my-shared-library`的外部共享库，它的来源是名为`master`的分支。加载共享库后，您可以在Pipeline中使用共享库中定义的函数、变量和步骤。

外部共享库通常是存储在源代码管理系统中的独立代码库，它们包含了各种函数、类和工具方法，可以被Pipeline脚本直接调用和使用。通过使用共享库，您可以避免在多个Pipeline中重复编写相同的逻辑，使得Pipeline的编写更加高效和简洁。



# stages

- 必选字段，组织一到多个stage，用于包含所有stage的定义；
- stages封装了用于定义pipeline主体和逻辑的所有stage的定义，它包含一个或多个stage指令；
- stages负责描述pipeline中绝大部分的实际工作（work）；
- 事实上，stages中至少需要包含一个stage指令来定义CD过程的每个离散部分，例如构建、测试和 部署等；

### example

```groovy
// Jenkinsfile (Declarative Pipeline)
pipeline {
    agent any
    stages { // stages 部分通常会遵循诸如 agent, options 等的指令
        stage('Example') {
            // stage中必须要包含steps，steps中至少应该有一个DSL语句，即必须包含一个或多个步骤
            steps { 
                echo 'Hello World'
            }
        }
    }
}
```



`stages`指令用于在Jenkins Pipeline中定义不同的阶段（stages），并且可以在每个阶段中定义一系列步骤（steps）。通过合理使用`stages`指令，您可以将整个构建过程划分为逻辑上相关的阶段，并控制它们的执行顺序。

以下是`stages`指令的基本示例：

```groovy
pipeline {
    agent any
    stages {
        stage('拉取代码') {
            steps {
                // 从代码库中拉取代码的步骤
                script {
                    echo '正在拉取代码...'
                    // 假设使用git进行源代码管理
                    git 'https://github.com/example/myapp.git'
                }
            }
        }
        stage('构建') {
            steps {
                // 构建应用程序的步骤
                script {
                    echo '正在构建应用程序...'
                    sh 'mvn clean install'
                }
            }
        }
        stage('部署') {
            steps {
                // 部署应用程序的步骤
                script {
                    echo '正在部署应用程序...'
                    sh 'sh deploy.sh'
                }
            }
        }
        // 可以添加更多的阶段
    }
    // 其他Pipeline配置
}
```

在这个示例中，我们定义了三个阶段：拉取代码、构建和部署。每个阶段包含了相应的步骤，用于执行实际的操作，比如拉取代码、构建应用程序和部署应用程序。

通过合理划分不同的阶段，并在每个阶段中定义相应的步骤，您可以清晰地组织和控制Pipeline的执行流程，从而实现更加可靠和高效的构建和部署过程。



# stage

- 必选字段，阶段，代表流水线的一个单独的功能完成时期，例如编译等；
- 负责在stages配置段中封装steps配置段，以及其它可用于stage中的指令；

`stage`指令用于在Jenkins Pipeline中定义不同的阶段，每个阶段代表Pipeline中的一个逻辑阶段，可以包含一系列相关的步骤。`stage`指令允许您在Pipeline中明确地标识出每个阶段的目的，并对每个阶段执行相关的操作。

以下是`stage`指令的基本示例：

```groovy
pipeline {
    agent any
    stages {
        stage('拉取代码') {
            steps {
                // 从代码库中拉取代码的步骤
                script {
                    echo '正在拉取代码...'
                    // 假设使用git进行源代码管理
                    git 'https://github.com/example/myapp.git'
                }
            }
        }
        stage('构建') {
            steps {
                // 构建应用程序的步骤
                script {
                    echo '正在构建应用程序...'
                    sh 'mvn clean install'
                }
            }
        }
        // 可以添加更多的阶段
    }
    // 其他Pipeline配置
}
```

在这个示例中，我们定义了两个阶段：'拉取代码'和'构建'。每个阶段都包含了相应的步骤，用于执行实际的操作，比如从代码库中拉取代码和构建应用程序。

通过合理使用`stage`指令，您可以将Pipeline划分为逻辑上相关的阶段，使得整个构建过程更加清晰、可控和可维护。这样的结构可以帮助团队更好地理解和管理整个软件交付流程。



## input

https://www.jenkins.io/zh/doc/book/pipeline/syntax/#input

- stage中的专用指令，用于暂停pipeline并提示用户输入内容后继续；

`stage`输入（stage input）允许您在Jenkins Pipeline中的特定阶段设置交互式输入，以便在执行Pipeline时暂停，并等待用户提供必要的输入信息或确认。这使得在Pipeline的执行过程中可以进行人工干预或确认，从而更好地控制构建过程。

以下是`stage`输入的基本示例：

```groovy
pipeline {
    agent any
    stages {
        stage('部署到生产环境') {
            steps {
                // 一些部署操作
            }
            input {
                message '确认部署到生产环境？'
                ok '确认'
            }
        }
    }
    // 其他Pipeline配置
}
```

在这个示例中，当Pipeline执行到'部署到生产环境'阶段时，它会暂停并等待用户确认。`message`指令定义了用户看到的消息，而`ok`指令定义了用户确认的选项。用户可以选择确认或取消操作。

通过合理使用`stage`输入，您可以在Pipeline的关键阶段引入人工干预步骤，以确保在关键操作执行之前获得必要的确认或输入。这可以帮助减少意外操作，并提高构建和部署过程的可靠性。



## when

https://www.jenkins.io/zh/doc/book/pipeline/syntax/#when

- stage中的专用指令，用于设定该stage的运行条件；
- when指令用于在pipeline中为stage添加自定义的执行条件
  - when指令必须包含至少一个条件，多个条件间为“与”逻辑，即所有的子条件必须返回True， stage才能执行;  
  - 支持使用not、allOf和anyOf来构建更复杂的条件结构；



`stage`块中的`when`指令允许您基于条件来控制Pipeline中的特定阶段是否执行。通过使用`when`指令，您可以根据所设置的条件来动态地决定是否跳过或执行特定阶段，从而使Pipeline在运行时更加灵活和可定制。

以下是`stage`块中`when`指令的基本示例：

```groovy
pipeline {
    agent any
    stages {
        stage('测试') {
            when {
                branch 'master'
            }
            steps {
                // 执行测试的步骤
                echo 'Running tests...'
            }
        }
    }
    // 其他Pipeline配置
}
```

在这个示例中，当Pipeline运行在`master`分支上时，'测试'阶段将被执行。如果Pipeline运行在除`master`以外的分支上，该阶段将被跳过。

您可以使用多种条件来控制`when`指令，比如根据分支名称、环境变量、表达式的结果等等。通过合理使用`when`指令，您可以根据不同的条件动态地控制Pipeline中不同阶段的执行，使Pipeline的行为更加灵活和智能。

### 内置条件

#### branch

- 当正在构建的分支同模式中给定的分支条件匹配时，则运行该stage，仅适用于多分支流水线；
- 例如：`when { branch 'master' }；`

#### environment

- 在指定的环境变量值与给定的目标值匹配时，则运行该stage；
- 例如：`when { environment name: 'DEPLOY_TO', value: 'production' }`

#### expression

- 当指定的Groovy表达式结果为true时，则运行该stage；
- 例如：`when { expression { return params.DEBUG_BUILD } }`





### 内置操作符

#### not

- 对指定的条件取反，即不满足给定的条件时则运行该stage
- 要求至少包含一个条件，例如：
  - `when { not { branch 'master' } }`

#### allOf

- 对给定的多个条件执行"与"逻辑判定，在所有条件的结果均为true时运行该stage
- 要求至少包含一个条件，例如：
  - `when { allOf { branch 'master'; environment name: 'DEPLOY_TO', value: 'production' } }`

#### anyOf

- 对给定的多个条件执行“或”逻辑判定，即在至少有一个条件为true时运行该stage
- 必须包含至少一个条件，例如:
  - `when { anyOf { branch 'master'; branch 'staging' } }`

### example-1

- 根据不同的分支，进行不同的构建操作

```groovy
pipeline {
    agent any
    stages {
        stage('main branch') {
            when {
                branch 'main'
            } 
            steps {
                echo "main branch workflow." 
                sh "printenv"
            }
        }
        stage('develop branch') {
            when {
                branch 'develop'
            } 
            steps {
                echo "develop branch workflow." 
                sh "printenv"
            }
        }
    }
}
```

### example-2

- 与逻辑

```groovy
pipeline {
    agent any
    stages {
        stage('Example Build') {
            steps {
                echo 'Hello World'
            }
        }
        stage('Example Deploy') {
            when {
                allOf {
                    branch 'production'
                    environment name: 'DEPLOY_TO', value: 'production'
                }
            }
            steps {
                echo 'Deploying'
            }
        }
    }
}
```

### example-3

- 与逻辑及或逻辑的组合

```groovy
pipeline {
    agent any
    stages {
        stage('Example Build') {
            steps {
                echo 'Hello World'
            }
        }
        stage('Example Deploy') {
            when {
                expression { BRANCH_NAME ==~ /(production|staging)/ }
                anyOf {
                    environment name: 'DEPLOY_TO', value: 'production'
                    environment name: 'DEPLOY_TO', value: 'staging'
                }
            }
            steps {
                echo 'Deploying'
            }
        }
    }
}
```



# steps

https://www.jenkins.io/zh/doc/pipeline/steps/



`steps`指令用于在Jenkins Pipeline中定义阶段中要执行的一系列步骤。这些步骤可以是Shell命令、脚本、Jenkins插件步骤或其他类型的操作，用于构建、测试、部署或执行其他任务。

以下是`steps`指令的基本示例：

```groovy
pipeline {
    agent any
    stages {
        stage('构建') {
            steps {
                // 执行构建步骤
                script {
                    sh 'make build'
                }
            }
        }
        stage('测试') {
            steps {
                // 执行测试步骤
                script {
                    sh 'make test'
                }
            }
        }
        // 可以添加更多的阶段...
    }
    // 其他Pipeline配置
}
```

在这个示例中，我们在两个阶段中分别定义了`steps`块。每个`steps`块包含了一个`script`块，用于执行相应的Shell命令。具体来说，'构建'阶段执行`make build`命令，而'测试'阶段执行`make test`命令。

通过合理定义`steps`指令，您可以将Pipeline的执行过程细分为多个可控的步骤，以便在每个阶段中执行特定的操作或任务，并确保构建和部署过程的顺利进行。



- 必选字段， 步骤，组织一至多个DSL格式的步骤，用于在stage中定义完成该阶段功能所需要经历的一系列步骤，并能够把这些步骤同该stage中的其它定义（如环境的定义等）分隔开；

- Pipeline的基本结构决定了pipeline的整体流程，但真正“做事”的还是其内部一个个具体的 step，因而steps是pipeline中最核心的组成部署；

- steps负责在stage中定义一到多个DSL语句，这些语句负责完成该stage中特定的功能；但能够同其它的语句分隔开，如environment等；

- 还有相当一部分插件可直接当作step来用；

- 除了script，几乎所有的step在pipeline中都是不可拆分的原子操作；

  - ```groovy
    // script{}步骤负责将脚本引入到steps{}配置段中，但它非为必要的步骤，且复杂的脚本应该单独组织为Shared Libraries，并由Pipeline导入后使用；
    pipeline {
        agent any
        stages {
            stage('Example') {
                steps {
                    echo 'Hello World'
    
                    script {
                        def browsers = ['chrome', 'firefox']
                        for (int i = 0; i < browsers.size(); ++i) {
                            echo "Testing the ${browsers[i]} browser"
                        }
                    }
                }
            }
        }
    }
    ```

### 内置的基础step

- 下面是一些pipeline内置的基础step
- 参考文档：https://www.jenkins.io/doc/pipeline/steps/workflow-basic-steps/

#### 文件/目录相关

- **deleteDir**：删除当前目录；
- **dir("/path/to/dir")**：切换到指定目录；
- **fileExists ("/path/to/dir")** ：判断文件是否存在；
- **isUnix**：判断是否为类Unix系统；
- **pwd**：打印当前目录；
- **writeFile**：将内容写入指定的文件中，支持如下几个参数
  - file：文件路径，支持相对路径和绝对路径；
  - text：要写入的内容；
  - encoding：目标文件的编码，空值为系统默认的编码；支持base64编码格式；可选参数；
- **readFile**：读取文件的内容；支持如下几个参数；
  - file：文件路径，支持相对路径和绝对路径；
  - encoding：读取文件内容时使用的编码格式；可选参数；

#### 消息或控制相关

- **echo("message")**：打印指定的消息；
- **error("message")**：主动报错，并中止当前pipeline；
- **retry(count){}**：重复执行count次在{}中定义的代码块；
- **sleep**：让pipeline休眠一段时间，支持如下参数；
  - time：整数值，休眠时长；
  - unit：时间单位，支持NANOSECONDS、MICROSECONDS、MILLISECONDS、SECONDS、MINUTES、HOURS和DAYS，可选参数；
- **timeout**：代码块的超时时长，支持如下参数；
  - time：整数值，休眠时长；
  - unit：时间单位，支持NANOSECONDS、MICROSECONDS、MILLISECONDS、SECONDS、
  - NUTES、HOURS和DAYS，可选参数；
  - activity：布尔类型，值为true时，表示在该代码块不再有日志活动时才算真正超时；可选参数；
- **waitUntil**：等待指定的条件满足时执行定义的代码块；
  - initialRecurrencePeriod：初始的重试周期，即测试条件是否满足的重试周期，默认为250ms；可选参数；
  - quiet：是否禁止将每次的条件测试都记入日志，默认为false，即记入日志；可选参数；

#### 通知发送相关

- **mail**：向指定邮箱发送邮件；
  - subject：邮件标题；
  - body：邮件正文；
  - from (optional)：发件人地址列表，逗号分隔；
  - cc (optional) ：CC email地址列表，逗号分隔；
  - bcc (optional)：BCC email地址列表，逗号分隔；
  - charset (optional)：编码格式；
  - mimeType (optional)：Email正文的MIME类型，默认为text/plain；
  - replyTo (optional)：回件地址，默认为Jenkins设置的全局配置中的邮箱地址；

#### Node和Process相关

- **bat**：Windows的批处理脚本；
- **powershell**：运行指定的PowerShell脚本，支持Microsoft PowerShell 3+；
- **pwsh**：PowerShell Core Script
- **node**：在指定的节点上运行后续的脚本；
- **sh**：运行shell脚本，支持的参数如下
  - script{}：脚本代码块，支持指定脚本解释器，例如“#!/usr/bin/perl，否则将使用系统默认的解释器，且使用了-xe选项”；
  - encoding (optional)：脚本执行后输出的日志信息的编码格式，未定义时使用系统默认编码格式；
  - label (optional)：显示在Web UI中的详细信息；
  - returnStdout (optional)：布尔型值，true表示任务的标准输出将作为step的返回值，而不是打印到日志中；若有错误，依然会记入日志；
  - returnStatus (optional)：正常情况了命令执行失败会返回非零状态码，设定该参数值为true时，表示将返回该step的结果，而非状态码；
- **ws**：分配工作空间；







# post

`post`指令用于在Jenkins Pipeline中定义在Pipeline执行完毕后（不论成功或失败）执行的一系列操作。您可以使用`post`指令来定义清理操作、通知操作或其他针对Pipeline执行结果的后续操作。`post`指令允许您根据Pipeline的执行情况定义不同的操作，以便在Pipeline执行完毕后做出相应的处理。

以下是`post`指令的基本示例：

```groovy
pipeline {
    agent any
    stages {
        // 定义各个阶段...
    }
    post {
        always {
            // 始终执行的操作
            echo '清理工作空间...'
            cleanWs()
        }
        success {
            // 仅在成功时执行的操作
            echo '部署成功!'
        }
        failure {
            // 仅在失败时执行的操作
            echo '部署失败，请检查日志以找出问题所在。'
        }
    }
}
```

在这个示例中，`post`指令定义了在Pipeline执行完毕后执行的一些操作。`always`块中定义了始终执行的操作，`success`块中定义了仅在Pipeline执行成功时执行的操作，`failure`块中定义了仅在Pipeline执行失败时执行的操作。

通过合理使用`post`指令，您可以根据Pipeline的执行结果来定义相应的清理、通知或其他操作，以便更好地管理和控制Pipeline的执行过程。



https://www.jenkins.io/zh/doc/book/pipeline/syntax/#post

- 可选字段，在stage或整个pipeline的尾部封装一些需要被执行的步骤或者检验条件，用在stage代码块，或者是整个pipeline执行完成后附加的步骤，例如：发送邮件等...;
- post section在stage或pipeline的尾部定义一些step，并根据其所在stage或pipeline的完成情况来
  判定是否运行这些step；

### post-conditions

根据构建任务的运行状态（Finished: XXX）来进行不同的操作

- **always**：总是运行；
- **changed**：其所处的stage或pipeline同前一次运行具有不同状态时，才运行该post；
- **fixed**：stage或pipeline本次运行成功，但前一次为failed或unstable时，才运行该post；
- **regression**：stage或pipeline前一次运行成功，但本次为failure、unstable或aborted时，才运行该post；
- **aborted**：stage或pipeline的运行状态为aborted时，才运行该post；在Web UI中灰色显示；
- **failure**： stage或pipeline的运行状态为failed时，才运行该post；
- **success**：stage或pipeline的运行状态为success时，才运行该post；
- **unstable**：因测试失败或代码冲突导致stage或pipeline的运行状态为unstable时，才运行该post；在Web UI中以黄色显示；
- **unsuccessful**：stage或pipeline的运行不成功时，才运行该post；
- **cleanup**：在其它所有的post的条件均被评估后（无论stage或pipeline的状态为何）才运行该post；



```groovy
pipeline {
    agent any
    stages {
        stage('No-op') {
            steps {
                sh 'ls'
            }
        }
    }
    post {
        always {
            echo 'One way or another, I have finished'
            deleteDir() /* clean up our workspace */
        }
        success {
            echo 'I succeeeded!'
        }
        unstable {
            echo 'I am unstable :/'
        }
        failure {
            echo 'I failed :('
        }
        changed {
            echo 'Things were different before...'
        }
    }
}
```





# pipeline example

## 必选字段

在Jenkins Pipeline中，以下是必须的基本字段：

1. `agent`：指定Pipeline将在哪种类型的代理（节点）上运行。这是Pipeline中的必需字段，需要指定一个代理类型，如`agent any`或`agent { label 'my-label' }`。

2. `stages`：定义Pipeline中的不同阶段（stages），每个阶段包含一系列相关步骤。Pipeline中至少应该有一个`stages`块来定义至少一个阶段。

3. `steps`：在每个阶段中定义执行的具体步骤，比如执行Shell命令、调用外部工具、运行脚本等。每个阶段都应该包含一个或多个`steps`块。

这些字段是Pipeline中必须的基本构建块，它们定义了Pipeline的结构和执行过程。除此之外，您可能还会使用其他可选字段来进一步定制和控制Pipeline的行为，比如`environment`用于设置环境变量、`post`用于定义后续操作、`options`用于配置附加选项等。

下面是一个简单的示例，演示了Jenkins Pipeline的基本结构，包括必要的字段：

```groovy
pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('拉取代码') {
            steps {
                script {
                    echo '正在拉取代码...'
                    git 'https://github.com/example/myapp.git'
                }
            }
        }
        stage('构建') {
            steps {
                script {
                    echo '正在构建应用程序...'
                    sh 'mvn clean install'
                }
            }
        }
    }

    post {
        always {
            echo '清理工作空间...'
            cleanWs()
        }
        success {
            echo '部署成功!'
        }
        failure {
            echo '部署失败，请检查日志以找出问题所在。'
        }
    }
}
```

这个示例中，`pipeline`块包含了必要的`agent`、`stages`和`post`块。在`stages`中定义了两个阶段：`拉取代码`和`构建`，每个阶段包含了相应的`steps`块，用于执行具体的操作。`post`块定义了在Pipeline执行完毕后执行的操作，包括始终执行的操作、成功时执行的操作以及失败时执行的操作。



## 1

以下是一个简单的Jenkins Declarative Pipeline示例，用于从代码库中拉取代码，构建应用程序，并在构建成功时进行部署：

```groovy
pipeline {
    agent any
    environment {
        PATH = "/usr/local/bin:${env.PATH}"
    }
    parameters {
        string(name: 'DeployEnv', defaultValue: 'production', description: 'Environment to deploy to')
    }
    stages {
        stage('拉取代码') {
            steps {
                // 从代码库中拉取代码的步骤
                script {
                    echo '正在拉取代码...'
                    // 假设使用git进行源代码管理
                    git 'https://github.com/example/myapp.git'
                }
            }
        }
        stage('构建') {
            steps {
                // 构建应用程序的步骤
                script {
                    echo '正在构建应用程序...'
                    sh 'mvn clean install'
                }
            }
        }
        stage('部署') {
            when {
                expression { params.DeployEnv == 'production' }
            }
            steps {
                // 在部署阶段部署应用程序的步骤
                script {
                    echo '正在部署应用程序到生产环境...'
                    sh 'sh deploy.sh'
                }
            }
        }
    }
    post {
        always {
            // 无论Pipeline结果如何都要执行的步骤
            echo '清理工作空间...'
            cleanWs()
        }
        success {
            // 仅当Pipeline成功时执行的步骤
            echo '部署成功!'
        }
        failure {
            // 如果Pipeline失败时执行的步骤
            echo '部署失败，请检查日志以找出问题所在。'
        }
    }
}
```

在这个示例中，Pipeline包括三个阶段：拉取代码、构建和部署。它还包括了对`DeployEnv`参数的定义，用于控制部署环境。在部署阶段，它还使用了一个`when`块来根据参数值控制是否执行部署操作。最后，在`post`部分定义了一些清理工作以及针对成功和失败情况的后续操作。



## Hello world!

```groovy
Jenkinsfile (Declarative Pipeline)
pipeline {
    agent any 
    stages {
        stage('Stage 1') {
            steps {
                echo 'Hello world!' 
            }
        }
    }
}
```



## Base

```groovy
pipeline { 
    agent any
    tools {
        maven 'apache-maven-3.0.1' 
    }
    stages {
        stage("Checkout") {
        	agent node02
            steps {
                echo "Get source code..."
            }
        }
        stage("Build") {
            steps {
                echo "Building..."
            }
        }
        stage("Test") {
            steps {
                echo "Testing..."
            }
        }
        stage("Package") {
            steps {
                echo "Packageing..."
            }
        }
        stage("Deploy") {
            steps {
                echo "Deploying..."
            }
        }
    }
    post {
        ...
    }
}
```



## 编译一个简单的Java应用

[使用Maven构建Java应用程序 (jenkins.io)](https://www.jenkins.io/zh/doc/tutorials/build-a-java-app-with-maven/)

```groovy
pipeline {
    agent any
    tools {
        maven 'maven-3.8.6' // 调用全局工具配置中 maven工具定义的 name
    }
    stages {
        stage('Source') {
            steps {
                // 该仓库中的应用是一个基于spring boot的简单示例，它默认监听8080端口，通过http协议提供服务
                git branch: 'main', url: 'https://github.com/iKubernetes/spring-boot-helloWorld.git'
                // 坦克大战源码
                //git branch: 'master', url: 'https://github.com/bjmashibing/tank.git'
            }
        }
        stage('Build') {
            steps {
                configFileProvider([configFile(fileId: 'cd204b28-9287-44c0-a700-6640c2650b9a', targetLocation: '/apps/apache-maven-3.8.6/conf/settings.xml')]) {
                    sh 'mvn clean package'
                }                
            }
        }
    }
}
```

### Test

```sh
# java -jar /var/lib/jenkins/workspace/pipeline-job3/target/spring-boot-helloworld-0.9.2-SNAPSHOT.jar --server.port=8090
...

# curl 127.0.0.1:8090
Hello Spring Boot 2.0!
```



## Python Flask项目示例

```groovy
pipeline {
    agent any
    stages {
        stage('Source') {
            steps {
                git branch: 'main', url: 'https://github.com/iKubernetes/python-flask-helloWorld.git'
            }
        }
        stage('Build') {
            steps {
                sh 'pip3 install -r requirements.txt'
            }
        }
        stage('Test') {
            steps {
                sh 'python3 test.py'
            }
        }
    }
}
```







## k8s

```groovy
pipeline {
    environment { 
        appName = "spring-boot-helloworld"
        appVersion = "v0.9.0"
        //registry = "http://10.247.192.192:8082"
        registry = "http(s)://YOUR_REGISTRY_HOST:PORT"
        //registryCredential = "nexus_admin"
        registryCredential = "YOUR_REGISTRY_USER_CREDENTIAL"
        dockerImage = ""
    }     
    agent {
        kubernetes {
            label 'maven-and-docker'
        }
    }
    stages {
        stage('Source') {
            steps {
                git branch: 'master', url: 'http://gitlab.gitlab.svc.cluster.local/root/spring-boot-helloworld.git'
            }
        }
        stage('Build') {
            steps {
                container('maven') {
                    sh 'mvn clean test package'
                }
            }
        }
        stage('Building app image') { 
            steps {
                container('docker') {
                    script {
                        dockerImage = docker.build appName + ":" + appVersion
                    }
                }
            }
        }
        stage('Push app image') {
            steps {
                container('docker') {
                    script {
                        docker.withRegistry( registry, registryCredential ) {
                            dockerImage.push()
                        }
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                container('kubectl') {
                    withKubeConfig([credentialsId: 'k8s-cluster-admin-kubeconfig-file'
                                    ]) {
                        sh 'kubectl apply -f deploy/'
                    }                      
                }
            }
        }
    }
    post {
        failure {
            updateGitlabCommitStatus name: 'build', state: 'failed'
        }
        success {
            updateGitlabCommitStatus name: 'build', state: 'success'
        }
    }
}
```



## Jenkinsfile 概述

https://www.jenkins.io/zh/doc/book/pipeline/jenkinsfile/

- pipeline 的定义写入到 Jenkinsfile 这个文本文件中， 而后放置在项目的源代码仓库（通常放置在代码仓库的根目录下）；
- 项目构建前，gitlab 会扫描仓库中的 Jenkinsfile，进而根据 Jenkinsfile 中 pipeline 的定义进行后续操作；
- Jenkinsfile 实现了持续交付即代码的理念。







### Jenkinsfile 示例

```groovy
pipeline {
  agent {
    kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        metadata:
          labels:
            jenkins: agent
        spec:
          volumes:
          - name: docker-socket
            hostPath:
              path: /var/run/docker.sock
          - name: docker-auth
            hostPath:
              path: /root/.docker/config.json
          containers:
          - name: docker
            image: docker:20.10.8
            readinessProbe:
              exec:
                command: [sh, -c, "ls -S /var/run/docker.sock"]
            command:
            - sleep
            args:
            - infinity
            volumeMounts:
            - name: docker-socket
              mountPath: /var/run/docker.sock
            - name: docker-auth
              mountPath: /root/.docker/config.json
        '''
    }

  }
  stages {
    stage('克隆代码 & 构建镜像 & 上传镜像') {
      agent none
      steps {
        container('docker') {
          git(url: 'http://172.16.20.24/caiyongyang/target.git', branch: 'main', changelog: true, poll: false, credentialsId: 'gitlab')
          sh 'cat Dockerfile'
          sh 'docker build -t testcicd:v1.0 .'
          sh 'docker tag testcicd:v1.0 172.16.0.120:30002/test/testcicd:v1.0'
          sh 'docker push 172.16.0.120:30002/test/testcicd:v1.0'
        }
      }
    }
  }
}
```

