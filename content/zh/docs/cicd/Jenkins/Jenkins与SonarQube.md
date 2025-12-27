---
title: "Jenkins与SonarQube"
---

# 参考文档

- https://docs.sonarqube.org/latest/analysis/scan/sonarscanner-for-jenkins/



# Jenkins + SonarQube 工作流

1. Jenkins pipeline启动；
2. SonarQube Scanner分析代码，并将报告发送至SonarQube Server；
3. SonarQube Server分析代码检测的结果是否符合预定义的质量阈；
4. SonarQube Server将通过（passed）或者失败（failed）的结果发送回Jenkins上的SonarQube Scanner插件暴露的Webhook；
5. 质量域相关的阶段成功通过或可选地失败时，则Jenkins pipeline续费后面的Stage；否则，pipeline将终止；





# 配置 Jenkins 使用 SonarQube

- 实现配置 Jenkins 使用 sonar-scanner 进行代码质量扫描， 并将结果报告给 SonarQube Server

## 流程概述

1. 在Jenkins上安装SonarQube插件
2. 在SonarQube上生成令牌
3. 配置Jenkins对接到SonarQube Server 
4. 配置Jenkins的全局工具sonar-scanner 
5. 在SonarQube上添加回调Jenkins的Webhook
6. 在Jenkins项目上调用sonar-scanner进行代码质量扫描
7. 通过SonarQube确认扫描结果的评估；



## 在 SonarQube 上生成令牌

在SonarQube上以相应的用户生成令牌，该令牌将被 Jenkins 用于通过相应的 URL 打开 SonarQube

- SonarQube Web UI **-->** 配置 **-->** 权限 **-->** 用户 **-->** 令牌 **-->** 更新令牌 **-->** 填写名称后生成令牌
  - 假设设置的令牌名称为：jenkins
  - 对应的令牌为：255faa25ad464db26c20cdba87710d35a04ae716



## Jenkins 相关配置

- 配置 Jenkins 对接到 SonarQube Server

### 安装 SonarQube 插件 

Jenkins 借助于 SonarQube Scanner 插件 将 SonarQube 提供的 代码质量检查能力集成到 pipeline上，从而确保质量阈检查失败时，能够避免继续进行后续的操作，例如发布等。

- 安装 SonarQube Scanner 插件

### 将 SonarQube 令牌存储为凭证

- Jenkins Dashboard **-->**  系统管理 **-->**  Manage Credentials **-->** 添加新的全局凭据
  - **类型：**Secret text
  - **范围：**全局
  - **Secret：** 贴入 sonarqube 中生成的令牌
  - **ID：**例如：sonarqube-admin-user-token

### 添加SonarQube Server

- Jenkins Dashboard **-->**  系统管理 **-->**  系统配置 **-->** SonarQube Servers
  - Environment variables √
  - **Name：**例如：sonarqube-server
  - **Server URL：**例如：http://10.0.0.103:9000/
  - **Server authentication token：**选择创建的凭据，sonarqube-admin-user-token

### 添加全局工具 sonar-scanner

以便在构建任务中调用

- Jenkins Dashboard **-->**  系统管理 **-->**  全局工具配置 **-->** SonarQube Scanner
  - **Name：**例如：sonarqube-scanner
  - 工具如果事先已经在Jenkins所处的主机安装了 则可以直接指定 `SONAR_RUNNER_HOME`；也可以使用其他自动安装方式





## 在 SonarQube 添加 Jenkins 的回调接口

在 SonarQube 上添加回调 Jenkins 的 Webhook，以实现将代码检测的结果（成功或失败）发送给Jenkins

- SonarQube Web UI **-->** 配置 **-->** 网络调用 **-->** 创建
  - **名称：**例如：jenkins
  - **URL：**例如：http://jenkins.xiangzheng.com:8080/sonarqube-webhook/
    - /sonarqube-webhook 是由 Jenkins 的 SonarQube Scanner 插件的回调接口固定使用的PATH；
  - **密码：**可以使用 `openssl rand -hex 20` 等命令生成随机密码而后贴入其中
    - 密码可自行生成通信时的签名密钥，以防止中间人攻击；









# pipeline

- 在 Jenkins 项目上调用 sonar-scanner 进行代码质量扫描，而后通过 SonarQube 确认扫描结果的评估

```groovy
pipeline {
    agent any
    tools {
        maven 'maven-3.8.6'
    }
    stages {
        stage('Pull Source Code') {
            steps {
                git branch: 'main', url: 'git@github.com:JamesAzheng/spring-boot-helloWorld.git'
            }
        }
        stage("Build") {
            steps {
                sh 'mvn clean package'
            }
        }
        stage("SonarQube analysis") {
            steps {
                withSonarQubeEnv('sonarqube-server') { // 需与jenkins系统配置中的名称保存一致
                    sh 'mvn sonar:sonar' // mvn可使用"sonar:sonar"这一target直接调用SonarQube进行代码质量分析
                }
            }
        }
        stage("Quality Gate") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }    
}
```

