---
title: "Jenkins与GitLab"
---


在GitLab和Jenkins中配置自动触发构建的流程主要涉及两个方面：

1. **GitLab 配置 Webhook**：当代码发生变更（如Push、Merge等）时，GitLab通过Webhook通知Jenkins。
2. **Jenkins 配置 Job**：配置 Jenkins Job，使其能够接收来自GitLab的Webhook触发。

下面是详细的配置步骤：

## 流水线



## 自由风格的软件项目

### 步骤 1：在Jenkins中配置GitLab插件

首先，确保Jenkins安装了以下插件：
- **GitLab Plugin**

可以在 `Jenkins > Manage Jenkins > Manage Plugins` 中搜索并安装这些插件。

### 步骤 2：在GitLab中创建Access Token

在Jenkins中，需要使用GitLab的Access Token来访问GitLab代码库。创建步骤如下：

1. 登录GitLab，点击右上角的头像，进入 **Settings > Access Tokens**。
2. 创建一个 **Personal Access Token**，并勾选 `api` 权限（确保具有足够权限访问项目）。
3. 复制该Token备用，稍后会用到。glpat-Dqm_C_eU46G6Bsh8SpVE

### 步骤 3：在Jenkins中添加GitLab凭据

1. 在Jenkins中，进入 **Manage Jenkins > Manage Credentials**。
2. 添加一个新的凭据，类型选择 **Secret text**。
3. 在 **Secret** 字段中粘贴之前创建的GitLab Access Token。
4. 给凭据一个ID（比如`gitlab-token`）以便后续使用。

### 步骤 4：在Jenkins中创建或配置Job

1. 创建一个新的Job（例如，选择 **Freestyle project** 或 **Pipeline**）。
2. 在Job配置中，选择 **Source Code Management** 下的 **Git**。
3. 输入GitLab仓库的URL，并选择 **Credentials** 中刚刚创建的GitLab Access Token。
4. 配置构建触发器，使其可以被GitLab的Webhook触发：
   - 找到 **Build Triggers**，勾选 **Build when a change is pushed to GitLab**（若使用GitLab Plugin），或者 **Trigger builds remotely**（若使用GitLab Hook Plugin）。
   - 如果使用GitLab Hook Plugin，生成一个 **Token**，如 `my-token`，后续在GitLab Webhook中使用。

### 步骤 5：在GitLab中配置Webhook

1. 登录到GitLab项目，进入 **Settings > Webhooks**。
2. 在 **URL** 中输入 Jenkins Webhook 地址。格式如下：
   ```
   http://<jenkins_url>/project/<job_name>
   ```
   如果配置了Token，则格式为：
   ```
   http://<jenkins_url>/project/<job_name>?token=my-token
   ```
3. 选择触发条件，比如勾选 **Push events** 和 **Merge request events**。
4. 点击 **Add webhook** 保存配置。

### 步骤 6：测试

1. 在GitLab仓库中进行一次Push或创建一个Merge Request。
2. 检查Jenkins中的Job是否被自动触发并构建。

### 常见问题

- **网络访问问题**：确保Jenkins服务器能被GitLab访问到。如果Jenkins部署在内网，可能需要配置公网访问或者使用反向代理。
- **Token不匹配**：如果使用了Token，请确保GitLab Webhook中的Token与Jenkins中配置的Token一致。
- **权限问题**：GitLab的Access Token需要具有对仓库的读取权限，确保设置的权限足够。

以上步骤完成后，每当GitLab中有新的代码提交或合并，Jenkins的Job都会自动触发构建。

# ---



Jenkins 和 GitLab 可以集成以构建一个完整的持续集成和持续交付（CI/CD）流水线。这种集成能够自动触发构建、测试和部署代码，以确保高质量的软件交付。下面是基本的步骤和原理：

1. **安装和配置 Jenkins 和 GitLab：** 首先确保你已经安装和配置了 Jenkins 和 GitLab。在 Jenkins 中安装 GitLab 插件，它可以使得 Jenkins 能够和 GitLab 进行交互。

2. **创建 Jenkins 任务：** 在 Jenkins 中创建一个新的项目（Job）。配置该项目的触发方式为 GitLab Webhook。这样，当 GitLab 项目中有代码推送事件时，Jenkins 就会收到通知并开始构建流水线。

3. **配置 GitLab Webhook：** 在 GitLab 中配置一个 Webhook，将其指向 Jenkins 项目的 URL。这样，当代码在 GitLab 中被推送时，GitLab 会发送一个 HTTP POST 请求到 Jenkins，触发构建流水线。

4. **编写 Jenkinsfile：** 在项目的根目录下创建一个名为 Jenkinsfile 的文件。这个文件定义了整个 CI/CD 流水线的执行过程，包括构建、测试、部署等步骤。Jenkins 会根据 Jenkinsfile 中的定义来执行各个阶段。

5. **构建流程定义：** 在 Jenkinsfile 中定义构建流程，这包括拉取代码、构建项目、运行测试、生成文档等步骤。你可以使用 Jenkins 的插件或者命令行工具来执行这些步骤。

6. **部署流程定义：** 如果需要部署到特定环境，你可以在 Jenkinsfile 中定义部署步骤。这可能涉及将构建的软件包传输到目标服务器、设置环境变量、运行数据库迁移脚本等操作。

7. **持续集成和持续部署设置：** 在 Jenkins 中配置持续集成和持续部署的规则。你可以设置触发构建的条件，比如代码推送、定时触发等。同时，你还可以设置自动部署到测试环境或者生产环境的规则。

8. **监控和报告：** Jenkins 可以生成构建和部署的报告，包括构建状态、测试覆盖率、部署状态等。这些报告可以帮助你监控整个 CI/CD 流水线的运行状态，并快速发现问题所在。

9. **持续改进：** 定期检查 CI/CD 流水线的运行情况，找出其中的瓶颈和问题，并进行优化和改进。这可以帮助提高软件交付的速度和质量。

通过这些步骤，你可以实现基于 Jenkins 和 GitLab 的自动化 CI/CD 流水线，从代码推送到最终部署的整个过程都可以自动化执行。







在 Jenkins 和 GitLab 中配置 Webhook 是为了实现两者之间的协作，并确保当代码仓库中有更新时，Jenkins 能够自动触发构建流水线。下面解释了为什么需要配置 Webhook 以及它们彼此间是如何协作的：

1. **GitLab Webhook 配置：** 在 GitLab 中配置 Webhook 是为了通知 Jenkins 有关代码仓库中的更改。当在 GitLab 中推送新的代码提交时，GitLab 会向预先配置的 Jenkins Webhook URL 发送 HTTP POST 请求，以触发 Jenkins 中配置的构建任务。这种方式可以确保 Jenkins 及时获知代码仓库的更改，并开始执行相应的构建流程。

2. **Jenkins 中的 GitLab 插件：** Jenkins 中安装的 GitLab 插件允许 Jenkins 和 GitLab 之间建立通信。这个插件提供了与 GitLab 交互所需的功能，包括与 GitLab 服务器进行认证、拉取代码、检索信息等。通过这个插件，Jenkins 可以与 GitLab 服务器通信并获取有关代码仓库的信息，从而执行相应的构建、测试和部署任务。

3. **双向通信机制：** 通过配置 Webhook，Jenkins 和 GitLab 之间建立了双向的通信机制。GitLab 向 Jenkins 发送触发信号，通知 Jenkins 有新的代码提交；而 Jenkins 通过 GitLab 插件与 GitLab 服务器进行交互，拉取代码、执行构建任务，并将构建结果等信息反馈给 GitLab。这种双向通信机制确保了代码仓库和持续集成服务器之间的同步和协作。

配置 Webhook 的过程是为了建立这种通信机制，使得 Jenkins 和 GitLab 能够自动协作，从而实现持续集成和持续交付。通过配置适当的 Webhook 和插件，你可以确保代码仓库中的更改能够触发自动化的构建流水线，从而提高开发和交付效率。


- https://www.jenkins.io/zh/doc/book/pipeline/syntax/#触发器

# 触发器定义方式

- 注意：下述方法并不适用于多分支pipeline、Github组织等类型的项目的触发，这些类型的任务都需要有相应的Jenkinsfile进行标识；

**web界面**

- pipeline类型项目的Web界面中可以直接定义构建触发器；
- 选择指定的job **-->** configuration **-->** 构建触发器

**脚本式pipeline**

- 对于脚本式pipeline，可以在代码顶部指定一个properties代码块来定义触发条件；

- 该方式定义的触发条件将会和Web界面中定义的触发条件合并处理，并且Web界面上定义的条件优先生效；

**声明式pipeline**

- 对于声明式pipeline，可将触发条件定义在triggers{}指令定义的配置段中；

- triggers内置支持cron、pollSCM和upstream三种触发机制；
- 其它触发机制可借助于插件来实现，例如基于代码仓库上webhook通知的触发等；



# 定时构建

- 又称周期性构建，这是一种cron类型的构建机制，它按照预定义的时间周期启动任务；
- PS：**对于期望能够基于代码变更进行触的CI场景来说，周期性构建并非其最佳选项**，但对于有些类型的任务，它却也能够通过精心编排的周期性构建来避免资源冲突；
- Jenkins cron语法遵循Unix cron语法的定义，但在细节上略有差别；
- 另外还可以包含一个H字符，它可用于任何字段，它能够在一个时间范围内对项目名称进行散列值计算出一个唯一的偏移量，以避免所有配置相同cron值的项目在同一时间启动（错峰启动）；

## web界面

```sh
# Every fifteen minutes (perhaps at :07, :22, :37, :52):
H/15 * * * *

# Every ten minutes in the first half of every hour (three times, perhaps at :04, :14, :24):
H(0-29)/10 * * * *

# Once every two hours at 45 minutes past the hour starting at 9:45 AM and finishing at 3:45 PM every weekday:
45 9-16/2 * * 1-5

# Once in every two hour slot between 8 AM and 4 PM every weekday (perhaps at 9:38 AM, 11:38 AM, 1:38 PM, 3:38 PM):
H H(8-15)/2 * * 1-5

# Once a day on the 1st and 15th of every month except December:
H H 1,15 1-11 *
```



## 声明式pipeline

```groovy
// 在每天每小时的0~30分钟内随机计算出一个时间点来触发构建
triggers { cron(H(0,30) * * * *) }
```

### example

- 每3分钟执行一次，且为了同其它在同一时间点启动的任务散开执行而使用了H标识；

```groovy
pipeline {
    agent any
    triggers {
        cron ('H/3 * * * *')
    }
    stages {
        stage('Cron Build') {
            steps {
                echo 'Cron Demo Building...'
            }
        }
    }
}
```



# 轮询SCM

- 轮询SCM指的是定期到代码仓库检查代码是否有变更，存在代码变更时就运行pipeline；

## 声明式pipeline

### example

```sh
pipeline {
    agent any
    triggers {
        pollSCM('H/2 * * * *')
    }
    tools {
        maven 'mvn-3.6.3'
    }
    stages {
        stage('Source') {
            steps {
                git branch: 'main', url: 'https://github.com/iKubernetes/spring-boot-helloWorld.git'
            }
        }
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
    }
}
```



# 其他工程构建后触发

- 可以实现例如A工程构建完成后再触发B工程运行的功能，当然也可以根据工程A的不同返回结果(成功或失败)后B工程再进行其他操作

## 声明式pipeline

- 若job-x依赖于job-y的执行结果，则称为job-y为job-x的upstream（上游）；
- 当前任务依赖到的upstream任务定义在upstreamProjects参数中，多个任务彼此间以逗号分隔；
- 触发条件为upstream的执行状态，它定义在threshold参数中，其值为hudson.model.Result.\<STATE>
- Hudson.model.Result支持以下取值
  - ABORTED：任务被中止
  - FAILURE： 构建失败
  - SUCCESS：构建成功
  - UNSTABLE：不稳定，即存在失败的步骤，但尚未导致失败；
  - NOT_BUILT：多阶段构建场景中，因前面阶段的问题导致后面的阶段无法执行；

### example

- 当pipeline-job1执行成功后，则执行pipeline-job2
- **注意：只有pipeline-job2在定义完成并且执行一次后，上述功能才能生效**

#### pipeline-job1

```groovy
pipeline { 
    agent any
    stages {
        stage("job1") {
            steps {
                echo "job1 run success"
            }
        }
    }    
}
```

#### pipeline-job2

```groovy
pipeline { 
    agent any
    triggers { 
        upstream(upstreamProjects: 'pipeline-job1', threshold: hudson.model.Result.SUCCESS)
    }
    stages {
        stage("job2") {
            steps {
                echo "job2 run success"
            }
        }
    }    
}
```



# GitLab通知触发

https://docs.gitlab.com/ee/integration/jenkins.html

- GitLab通知触发，是指pipeline关联的GitLab Repository上的代码出现变更时，由GitLab将相关事件通知给Jenkins，从而触发Jenkins执行构建操作，避免了pollSCM的频繁轮询依然存在滞后可能性的问题；



## 配置GitLab允许外发

以GitLab管理员的身份，设置系统在外发请求中，允许Webhook和服务对本地网络的请求；

1. 在顶部栏上，选择**“主菜单”>“管理员”**。
2. 在左侧边栏上，选择**“设置>网络”**。
3. 展开“**出站请求**”并添加条目。（允许来自 web hooks 和服务对本地网络的请求 √）



## 授予 Jenkins 对 Gitab 项目的访问权限：

在 GitLab 上创建新的 GitLab 用户，或选择现有的 GitLab 用户

- 通常做法是创建一个Jenkins专有的账号，以避免使用其他人账号时后期如果这个账号不可用则将导致自动构建流程的中断
- 注意：创建的用户要对构建的项目具有例如：Maintainer的权限



## 授予 Jenkins 对 Gitab API 的访问权限

在 GitLab 创建个人访问令牌以授权 Jenkins 访问 GitLab。

1. 登录上述创建好的账号
2. 右上角头像 --> 编辑个人资料 --> 左侧方访问令牌 --> 创建个人访问令牌
   - 令牌名称自定义，例如：jenkins
   - 选择访问：api

3. 妥善保管令牌（请确保妥善保存它 - 您无法再次访问它的内容。）
   - glpat-sNy3yZyFZsQbNcBAtysM



## 配置 Jenkins

1. 在 Jenkins 上安装GibLab插件和Git插件（这两个插件可能默认已经安装）
2. 系统管理 --> 系统配置，找到Giblab一栏
   - Enable authentication for '/project' end-point √
   - Connection name，例如：jenkins
   - Gitlab host URL，例如：gitlab.xiangzheng.com
   - 添加Gitlab的API 令牌，将上面的令牌贴入
   - 最后 Test Connection，succeed后保存



## 配置 Jenkins item

1. 在 Jenkins 中创建一个新的或使用现有的项目，触发器选择上步生成的 Gitlab URL

2. 指定如何将构建状态报告给 GitLab：

   - 如果创建了**自由式**项目，请在“**生成后操作”**部分，选择“**将生成状态发布到 GitLab”**。

   - 如果创建了**管道**项目，则必须使用 Jenkins 管道脚本来更新 GitLab 上的状态。

     - https://github.com/jenkinsci/gitlab-plugin#scripted-pipeline-jobs

     - ```groovy
       // example
        pipeline {
           agent any
       
           stages {
              stage('gitlab') {
                 steps {
                    echo 'Notify GitLab'
                    updateGitlabCommitStatus name: 'build', state: 'pending'
                    updateGitlabCommitStatus name: 'build', state: 'success'
                 }
              }
           }
        }
       ```



## 配置 GitLab

以下两种方法都可以实现 GitLab 与 Jenkins 的集成：

### 方法一

- 推荐做法，因为它比 [Webhook 集成](https://docs.gitlab.com/ee/integration/jenkins.html#configure-a-webhook)更易于配置。
- 在 Gitlab 中登录上述创建的 Gitlab 账号，找到指定的项目
- 设置 --> 集成 --> Jenkins
  - 配置完成后 Test，测试成功后返回Gitlab中的job自动启动了构建；
  - 后期就可以根据：推送到仓库的触发事件；在创建、更新或合并合并请求时触发事件；推送到仓库的新标签的触发事件。 等操作来自动触发Gitlab的构建了



### 方法二

- Webhook 集成



## 配置 Jenkins 与 Gitlab 的密钥认证

使用http拉取代码不被gitlab所允许，因此只能使用ssh拉取代码

私钥配置在Jenkins的全局凭据当中，公钥配置在Gitlab中，以实现基于ssh拉取代码

**创建公钥私钥对：**

```sh
# usermod -s /bin/bash jenkins

# su - jenkins

# ssh-keygen -t rsa -b 2048 -C 'jenkins@xiangzheng.com'
```

**复制公钥文件的内容，贴在 GitLab上的用户账号配置属性中：**

- ...

**复制私钥文件的内容，保存为Jenkins上的凭据：**

- 系统管理 --> 凭据 --> 添加全局凭据
  - 类型：SSH username with private key
  - 范围：全局
  - ID：ssh-key-jenkins-gitlab
  - 描述：ssh-key-jenkins-gitlab
  - Username：jenkins
  - Private Key：贴入私钥内容



## 最终测试

```groovy
pipeline {
    agent any
    tools {
        maven 'maven-3.8.6'
    }
    stages {
        stage('Source') {
            steps {
                git branch: 'main', credentialsId: 'ssh-key-jenkins-gitlab',  url: 'git@gitlab.xiangzheng.com:gitlab-instance-010b0ac5/spring-boot-helloWorld.git'              
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

