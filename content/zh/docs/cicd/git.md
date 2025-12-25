---
title: "Git"
---

# Git 全局设置
```sh
# 配置提交时的用户名和邮箱。`--global` 选项意味着该配置将对所有项目生效。
git config --global user.name "xiangzheng"
git config --global user.email "sredevops@163.com"

# 查看当前 Git 的配置信息。
git config --list

```

# 推送现有文件夹到远程仓库
```sh
# 进入项目目录
cd k8s/

# 在当前目录下初始化一个新的 Git 仓库，并将初始分支名设为 main
git init --initial-branch=main

# 添加远程仓库，到本地 Git 仓库中
git remote add origin http://172.16.20.24/devops/k8s.git

# 查看目前的远程仓库配置，fetch 用于拉取代码，push 用于推送代码。
git remote -v

# 添加到本地暂存区
git add .

# 提交到本地仓库
git commit -m "Initial commit"

# 推送到远程仓库
git push -u origin main
```

# ---

# git 常见操作

Git 是一个分布式版本控制系统，用于管理和跟踪代码的更改。以下是一些常用的 Git 命令和操作场景：

## 1. Git 初始化与配置

### 初始化 Git 仓库
```bash
git init
```
在当前目录下初始化一个新的 Git 仓库。


## 2. Git 基础操作

### 克隆远程仓库
```bash
git clone <repository_url>
```
克隆远程仓库到本地。

### 查看仓库状态
```bash
git status
```
查看当前工作区的状态，包括已更改的文件、未追踪的文件等。

### 添加文件到暂存区
```bash
git add <file>
```
将指定的文件添加到暂存区，可以是单个文件，也可以是整个目录或使用 `.` 代表全部文件：
```bash
git add .
```

### 提交更改
```bash
git commit -m "Commit message"
```
将暂存区的更改提交到本地仓库，`-m` 后面跟上提交信息。

### 提交并跳过暂存区（快速提交所有更改）
```bash
git commit -a -m "Commit message"
```
跳过 `git add` 步骤，将所有已跟踪文件的更改直接提交。



## 3. 分支操作

### 查看分支
```bash
git branch
```
列出所有本地分支，当前分支会有 `*` 标记。

### 创建新分支
```bash
git branch <branch_name>
```
创建一个新的本地分支。

### 切换分支
```bash
git checkout <branch_name>
```
切换到指定的分支。

### 创建并切换分支
```bash
git checkout -b <branch_name>
```
创建一个新分支并直接切换到该分支。

### 合并分支
```bash
git merge <branch_name>
```
在当前分支下合并指定的分支的更改。

### 删除分支
```bash
git branch -d <branch_name>
```
删除本地分支。如果该分支没有合并，会提示是否强制删除。

```bash
git branch -D <branch_name>
```
强制删除本地分支。



## 4. 远程仓库操作

### 查看远程仓库
```bash
git remote -v
```
查看配置的远程仓库信息。

### 添加远程仓库
```bash
git remote add origin <repository_url>
```
添加远程仓库地址，`origin` 是远程仓库的默认名称。

### 推送到远程仓库
```bash
git push origin <branch_name>
```
将本地指定分支推送到远程仓库。

### 拉取远程仓库的更改
```bash
git pull
```
从远程仓库拉取最新的更改并与本地合并。

### 获取远程仓库更新
```bash
git fetch
```
获取远程仓库的最新更新，但不自动合并。



## 5. 查看与比较

### 查看提交日志
```bash
git log
```
显示提交日志，可以通过 `--oneline` 选项简化输出：
```bash
git log --oneline
```

### 查看文件的更改
```bash
git diff
```
查看尚未暂存的文件更改。

### 比较两个分支的差异
```bash
git diff <branch_1> <branch_2>
```



## 6. 撤销操作

### 撤销暂存区的更改
```bash
git reset <file>
```
将指定文件从暂存区移除，改为回到未暂存状态。

### 修改最后一次提交
```bash
git commit --amend
```
修改上一次的提交信息或附加更改。

### 回退到某个提交
```bash
git reset --hard <commit_id>
```
回退到指定的提交（`commit_id` 是提交的哈希值），并丢弃后续的所有更改。



## 7. 标签操作

### 创建标签
```bash
git tag <tag_name>
```
为当前提交创建一个标签。

### 推送标签到远程仓库
```bash
git push origin <tag_name>
```
将本地标签推送到远程仓库。

### 查看标签
```bash
git tag
```
列出所有标签。

## 8. 常见协作操作

### 创建并推送分支
```bash
git checkout -b <new_branch>
git push -u origin <new_branch>
```
创建新分支并推送到远程仓库。

### 合并远程分支
```bash
git pull origin <branch_name>
```
将远程仓库的指定分支合并到当前分支。

### 解决合并冲突
合并冲突时，Git 会标记冲突的文件，手动解决冲突后，需要执行以下命令：
```bash
git add <file>
git commit
```



## 9. 其他有用命令

### 清除未跟踪文件
```bash
git clean -f
```
清除未被追踪的文件。



# ---

# git 概述

https://git-scm.com/

- Git是一个开源的分布式版本控制系统， 可以实现对开发编写的代码实现持续集成，也是[Linus Torvalds](https://baike.baidu.com/item/Linus Torvalds/9336769?fromModule=lemma_inlink)为了帮助管理Linux内核开发而开发的一个开放源码的版本控制软件。



## 类似产品

下面这两种都是属于集中式代码仓库，而且必须有网络才能进行代码提交

- **CVS：**早期的集中式版本控制系统，现已基本淘汰，会出现数据提交后不完整的情况
- **SVN：**2000 年开始开发，目标就是替代 CVS 集中式管理，依赖于网络，一台服务器集中管理，目前依然有部分公司在使用

**CVS & SVN 数据存储方式：**

- 每次提交的文件都单独保存，即按照文件的提交时间区分不同的版本，保存至不同的逻辑存储区域，后期恢复的时候直接基于之前版本恢复。
- 实打实的上传 即每次都是真正存放用户提交的新数据；
  - 优点：旧文件被删除 新文件不受影响
  - 缺点：占用空间较大



# git 数据流

- init / clone 启动工作区 **-->** add 暂存区 **-->** commit 本地仓库 **-->** push 远程仓库

- **工作区：**
  - clone 的代码或者开发自己编写的代码文件所在的目录，通常是代码所在的一个服务的目录名称。
- **暂存区：**
  - 用于存储在工作区中对代码进行修改后的文件所保存的地方，使用 git add 将工作区的代码添加到暂存区
- **本地仓库：**
  - 用于提交存储在工作区和暂存区中改过的文件地方，使用 git commit 将暂存区的代码提交到本地仓库。
- **远程仓库：**
  - 多个开发共同协作提交代码的仓库，即 gitlab 服务器，使用 git push 将本地仓库的代码推送到远程仓库



# git 相关术语

## PR & MR

### PR（Pull Request）

- GitHub中的命名
- Github 一般是公开库，当然没有人愿意别人直接在自己的仓库上面修改代码。当然当其他人想要给自己合并代码时，一般是要 fork 一个仓库，然后在开发者自己的仓库开发，开发完成后给原创仓库提交PR合并请求，**请求原仓库主人把你的代码拉回去（Pull Request）。**因此称为PR
- 拉回需要合并的分支

### MR（Merge Request）

- Gitlab中的命名
- Gitlab 一般是公司的私有库，一个工作团队维护一个仓库，通常大家会从开发分支拉取代码，开发完成后，先把代码推送到开发分支，而后提交分支合并请求 **请求合并到主分支（Merge Request）**。因此称为MR
- 合并进目标分支

### 总结：

- PR & MR 两者都代表分支合并的意思，只不过在不同的代码托管平台命名不同



## HEAD 

- HEAD 指明了当前签出分支中的最后一次提交，它就像一个指向任何引用的指针。
- HEAD 可以被理解为 “**当前分支**“，例如：
  - 当你用 “checkout “切换分支时，HEAD被转移到新的分支。
  - `git log` 日志展示中`HEAD -> master`指的是：当前分支指向的是master分支。



## branch

- branch 分支

### 分支概述

生产中gitlab仓库中通常只有两个分支，分别是master分支和develop分支

- **master分支**：又称main分支，即主分支，也是默认分支，新的生产环境代码发布前存放的位置
- **develop分支**：即开发分支，默认没有，需手动创建，是开发环境存放代码的位置
  - 基于master创建的develop分支会完整的继承master分支的内容

### 分支的调用关系

- 开发人员将新编写的代码push到develop分支，而后由运维人员将develop分支的代码通过Jenkins部署到测试环境；
- 再由测试人员进行测试，测试人员发现问题则通知开发修改代码；
- 开发人员修改完代码然后再次push到develop分支，再由运维人员将develop分支的代码通过Jenkins部署到测试环境；
- 再由测试人员进行测试；
- 测试无问题后，一般由开发leader将develop分支的代码合并到master分支，最后由运维人员部署上线到生产环境

### 分支策略

- 主干开发、分支发布
  - 在master/main上直接开发，master/main拥有全量代码，基于分支发布
- 分支开发、主干发布
  - 在develop分支上开发，合并至master/main分支，经由main/master发布
- 主干开发、主干发布
  - 在master/main上开，直接在master/main发布



​		



# git 相关文件说明

## .git

- 初始化git仓库后的默认内容：

```sh
# tree /myapp -a
/myapp
└── .git
    ├── branches # 分支
    ├── config # 当前仓库的配置文件，仓库级别的账号存放于此处
    ├── description
    ├── HEAD # 首部指针
    ├── hooks # 钩子
    │   ├── applypatch-msg.sample
    │   ├── commit-msg.sample
    │   ├── fsmonitor-watchman.sample
    │   ├── post-update.sample
    │   ├── pre-applypatch.sample
    │   ├── pre-commit.sample
    │   ├── pre-merge-commit.sample
    │   ├── prepare-commit-msg.sample
    │   ├── pre-push.sample
    │   ├── pre-rebase.sample
    │   ├── pre-receive.sample
    │   ├── push-to-checkout.sample
    │   └── update.sample
    ├── info
    │   └── exclude
    ├── objects # 数据存放的目录
    │   ├── info
    │   └── pack
    └── refs # 引用信息
        ├── heads # 分支索引信息存放目录
        └── tags
```



## .gitignore

- 在代码目录创建 .gitignore文件 即可定义忽略文件（定义哪些文件**不往gitlab上传**）





# 流程范例

## https

Git 全局设置:

```
git config --global user.name "azheng"
git config --global user.email "11897828+jamesazheng@user.noreply.gitee.com"
```

创建 git 仓库:

```
mkdir work_nodes
cd work_nodes
git init 
touch README.md
git add README.md
git commit -m "first commit"
git remote add origin https://gitee.com/jamesazheng/work_nodes.git
git push -u origin "master"
```

已有仓库?

```
cd existing_git_repo
git remote add origin https://gitee.com/jamesazheng/work_nodes.git
git push -u origin "master"
```

## ssh

Git 全局设置:

```
git config --global user.name "项征"
git config --global user.email "11897828+jamesazheng@user.noreply.gitee.com"
```

创建 git 仓库:

```
mkdir work_nodes
cd work_nodes
git init 
touch README.md
git add README.md
git commit -m "first commit"
git remote add origin git@gitee.com:jamesazheng/work_nodes.git
git push -u origin "master"
```

已有仓库?

```
cd existing_git_repo
git remote add origin git@gitee.com:jamesazheng/work_nodes.git
git push -u origin "master"
```







# init

- 创建一个空的Git存储库或重新初始化现有的存储库

## init option

```sh
-b, --initial-branch <name> # 重新初始分支的名称
```



## init example

```sh
# 默认会在当前目录创建.git，并且默认分支名称为master，可以使用 git branch -m <name> 来指定分支名称
git init
```

### 创建裸仓库

- 裸仓库一般用于上传至github、gitlab等平台的初始仓库
- 裸仓库是没有工作区的，但被clone下来时会包含工作区 即.git目录

```sh
# 裸仓库目录的命名要以.git结尾，但被clone下来时是会自动省略.git名称的 demoapp.git --> demoapp
[root@8 ~]# mkdir demoapp.git

[root@8 ~]# cd demoapp.git/

# --bare表示创建裸仓库
[root@8 demoapp.git]# git init --bare 
...

# 验证裸仓库
[root@8 demoapp.git]# ls
branches  config  description  HEAD  hooks  info  objects  refs
```



# clone

- clone 可以实现基于ssh、http、https、git的方式将远程代码克隆到本地

## clone option

```sh
-b <branch_name> # 指定分支clone
```



## clone example

### clone base

```sh
# git clone https://github.com/iKubernetes/spring-boot-helloWorld.git
...
# cd spring-boot-helloWorld/
# git branch -a
* main # 本地仓库所处的分支
  remotes/origin/HEAD -> origin/main # remotes开头表示远程仓库的信息，origin默认远程仓库的引用符号，此处表示远程仓库的HEAD指向远程仓库的origin/main分支
  remotes/origin/develop
  remotes/origin/main
  
  
# 远程仓库的配置信息来自此处：
# cat .git/config 
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
[remote "origin"] # look
	url = https://github.com/iKubernetes/spring-boot-helloWorld.git
	fetch = +refs/heads/*:refs/remotes/origin/* # 本地分支的引用信息都保存在.git/refs目录下
[branch "main"] # look
	remote = origin
	merge = refs/heads/main
```



### ssh clone

- `ssh: USER@HOST:/namespace/repo.git`
- 基于ssh公钥clone代码，不需要输入账号和密码
- 工作台创建公钥私钥对，例如使用 `ssh-keygen` 创建

- 注意：ssh只能用于代码clone，不能用于代码推送



### http/https clone

- `	http|https://HOST:PORT/NAMESPACE/repo_name.git`

- 基于http/https，不会用于Jenkins的代码clone，但是clone后做代码修改后可以重新上传至gitlab

```bash
#首先得到git网站提供的clone地址
http://gitlab-server/app1-dev/dev-app1.git

#将git网站复制的clone地址改为实际的域名 然后使用git命令clone下来
[root@client ~]# git clone http://10.0.0.18/app1-dev/dev-app1.git
Cloning into 'dev-app1'...
Username for 'http://10.0.0.18': devuser1 #输入一个对应的gitlab用户名
Password for 'http://devuser1@10.0.0.18': #用户对应的密码
remote: Enumerating objects: 11, done.
...

#检查clone下来的文件
[root@client ~]# tree dev-app1/
dev-app1/
├── app1page
│   └── index.html
└── README.md
```

### git clone







# pull

- 拉取并合并，相当于fetch+merge

```sh
git pull #获取代码到本地（也可以更新代码，即将最新的变化的代码pull到本地）
```



# fetch

- 只拉取到本地仓库，而不进行合并，因此在工作区是看不到拉取内容中的差异数据，但是可以使用merge进行手动合并



# push

- push 将本地仓库已经commit的代码提交到远程git仓库
- 注意事项：如果远程仓库内容已被修改，则需要先pull后push，否则会报错

## push example

- 参阅 remote

### 推送现有文件夹到gitlab

- 推送现有文件夹到gitlab，以实现在gitlab创建基于现有文件夹的项目
- 注意：需要事先在远程仓库中建立与推送项目同名的仓库

```sh
# 进入现有文件夹
[root@8 /]# # cd /myapp

# 将现有主分支改名为main（gitlab、github默认主分支名称为main）
[root@8 myapp]# git branch -a
* master
[root@8 myapp]# git branch -m master main
[root@8 myapp]# git branch -a
* main

# 自定义推送的远程仓库
[root@8 myapp]# git remote remove origin
[root@8 myapp]# git remote add origin http://gitlab.xiangzheng.com/gitlab-instance-010b0ac5/myapp.git
[root@8 myapp]# git remote -v
origin	http://gitlab.xiangzheng.com/gitlab-instance-010b0ac5/myapp.git (fetch)
origin	http://gitlab.xiangzheng.com/gitlab-instance-010b0ac5/myapp.git (push)


# 推送
[root@8 myapp]# git add .
[root@8 myapp]# git commit -m "Initial commit"
[root@8 myapp]# git push -u origin main
```



# add

- add 将指定文件、目录或当前目录下所有数据提交到本地暂存区

## add example

```sh
# pwd
/myapp
# ls -a
.  ..  .git


# 编写代码
# vim index.html 
<h1> Index Page v1 </h1>


# 添加到暂存区
git add index.html


# 验证
# tree /myapp -a
/myapp
├── .git
...
│   ├── index # 新增的文件，存放的是暂未commit的对象数据
...
│   ├── objects
│   │   ├── a9
│   │   │   └── 18d20f4d1b9c0d934b881cff2fa93bdfc54371 # 新增的文件
...

```



# remote

- remote 常用于查看和修改推送时的远程仓库信息

## remote example

```sh
# git remote -v
origin	https://github.com/iKubernetes/spring-boot-helloWorld.git (fetch) # fetch时默认的url
origin	https://github.com/iKubernetes/spring-boot-helloWorld.git (push) # push时的默认url
```

### 自定义推送的远程仓库

```sh
# gitlab为自定义的远程仓库名称，add换成remove表示删除自定义的远程仓库
# git remote add gitlab http://gitlab.xiangzheng.com/java/spring-boot-helloWorld.git


# 验证
# git remote -v
gitlab	http://gitlab.xiangzheng.com/java/spring-boot-helloWorld.git (fetch)
gitlab	http://gitlab.xiangzheng.com/java/spring-boot-helloWorld.git (push)
origin	https://github.com/iKubernetes/spring-boot-helloWorld.git (fetch)
origin	https://github.com/iKubernetes/spring-boot-helloWorld.git (push)
# cat .git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
[remote "origin"]
	url = https://github.com/iKubernetes/spring-boot-helloWorld.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
[remote "gitlab"] # look
	url = http://gitlab.xiangzheng.com/java/spring-boot-helloWorld.git
	fetch = +refs/heads/*:refs/remotes/gitlab/*


# 推送时可以指定自定义的远程仓库名称推送，不指定也有默认使用的远程仓库
git push [<gitlab|origin>]


# branch_name还可以指定分支推送，不指定则默认只推送主分支？或者指定all推送所有分支？
git push [<gitlab|origin>] [<branch_name>] 
```

### 显示远程仓库的详细信息

```sh
# git remote -v
gitlab	http://gitlab.xiangzheng.com/java/spring-boot-helloWorld.git (fetch)
gitlab	http://gitlab.xiangzheng.com/java/spring-boot-helloWorld.git (push)
origin	https://github.com/iKubernetes/spring-boot-helloWorld.git (fetch)
origin	https://github.com/iKubernetes/spring-boot-helloWorld.git (push)

# git remote show origin 
* remote origin
  Fetch URL: https://github.com/iKubernetes/spring-boot-helloWorld.git
  Push  URL: https://github.com/iKubernetes/spring-boot-helloWorld.git
  HEAD branch: main
  Remote branches:
    develop tracked
    main    tracked
  Local branch configured for 'git pull':
    main merges with remote main
  Local ref configured for 'git push':
    main pushes to main (up to date)
```



# config

- 常用于本地创建账户
- 用户级别：
  - --local，只对某个仓库生效，`/myapp/.git/config`
  - --global，当前用户下的所有仓库生效，常用，`~/.gitconfig`
  - --system，整个系统的所有用户下的仓库生效，`/etc/gitconfig`
    - 优先级：local > global > system
- **注意：** config 子命令创建的账户与gitlab没有关系，只是一个本地声明而已，但建议与gitlab的账户保持一致。

## config example

```bash
# 创建global级别账户，会在当前用户下的所有仓库生效
# git config --global user.email "sredevops@163.com"
# git config --global user.name "Xiang zheng"


# 验证，本质上就是调用了~/.gitconfig文件
# git config --global --list
user.email=sredevops@163.com
user.name=Xiang zheng
# cat ~/.gitconfig 
[user]
	email = sredevops@163.com
	name = Xiang zheng
```



## 忽略不安全的证书

```sh
git config --global http.sslVerify false

git config --global https.sslVerify false
```



## 走代理

```sh
git config --global http.proxy http://proxy.example.com:port
git config --global https.proxy https://proxy.example.com:port



git config --global http.proxy socks5://104.166.126.10:29900
git config --global https.proxy socks5://104.166.126.10:29900
```



# commit

- commit 将本地暂存区的**所有文件和目录**提交到本地仓库
- commit 后的代码可以进行回滚

- **注意：**commit 前需要使用 `git config` 创建一个本地工作区的用户；

## commit option

```sh
--amend # 修改以前的提交，即实现将现有已提交的内容或注释信息进行简单的修改，从而避免重新commit

--no-edit # 不对message进行修改

-F # 从文件中加载message
```

## commit example

- 如果提交的目录为空 则不会进行上传

```bash
# -m表示非交互形式添加提交的描述信息，不加-m则进入交互式界面
# git commit -m "v1"
[master (root-commit) ee2c4e6] v1
 1 file changed, 1 insertion(+)
 create mode 100644 index.html


# 验证：
# git log
commit ee2c4e6a4e413e0d2340cbf98bc417cfc7a5ee6a
Author: Xiang zheng <sredevops@163.com>
Date:   Fri Oct 21 15:03:53 2022 +0800

    v1
# git reflog 
ee2c4e6 HEAD@{3}: commit (initial): v1
```

### --amend

#### 目前的提交信息

```sh
# git reflog 
9c1d1d1 (HEAD -> master) HEAD@{0}: commit: v2
ee2c4e6 HEAD@{1}: commit (initial): v1
```

#### 仅修改代码

```sh
# 假设需要修改此前提交的文件
# cat index.html 
<h1> Index Page v1 </h1>
# echo '<h1> Index Page v2 </h1>' > index.html


# 修改完成后肯定会提示与当前最新的主分支文件不一致
# git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
# git add index.html 
# git status
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   index.html


# 这时如果直接使用git commit直接提交肯定会创建新的分支；
# 但是，可以使用--amend来避免创建新的分支，即表示只在原来分支的基础上修改
# git commit --amend --no-edit 
[master b047197] v2
 Date: Fri Oct 21 17:10:27 2022 +0800
 2 files changed, 2 insertions(+), 1 deletion(-)
 create mode 100644 new_index.html


# 验证：
# git reflog 
b047197 (HEAD -> master) HEAD@{0}: commit (amend): v2 # 可以看到只是做了修改
9c1d1d1 HEAD@{1}: commit: v2
ee2c4e6 HEAD@{2}: commit (initial): v1
```

#### 仅修改message

```sh
# 也可以使用-F从文件中加载message
# git commit --amend -m 'v2 Hello Git !'
[master 7a4ffac] v2 Hello Git !
 Date: Fri Oct 21 17:10:27 2022 +0800
 2 files changed, 2 insertions(+), 1 deletion(-)
 create mode 100644 new_index.html


# git reflog 
7a4ffac (HEAD -> master) HEAD@{0}: commit (amend): v2 Hello Git !
b047197 HEAD@{1}: commit (amend): v2
9c1d1d1 HEAD@{2}: commit: v2
ee2c4e6 HEAD@{3}: commit (initial): v1
```





# status

- 查看工作区的状态

## status example

```sh
# pwd
/myapp
# ls -a
.  ..  .git  index.html
```

- **如果在工作区没有新增的文件：**

```sh
# git status 
On branch master
nothing to commit, working tree clean
```

- **如果在工作区有新增的文件，但未add到本地暂存区：**

```sh
# cp index.html new_index.html
# git status 
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	new_index.html

nothing added to commit but untracked files present (use "git add" to track)
```

- **如果将新增的文件add到本地暂存区：**

```sh
# git add .
# git status 
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   new_index.html
```

- **如果将add后的文件commit：**

```sh
# git commit -m 'v2'
[master 9c1d1d1] v2
 1 file changed, 1 insertion(+)
 create mode 100644 new_index.html

# git status 
On branch master
nothing to commit, working tree clean
```

- **如果现有文件发生修改：**

```sh
# cat index.html 
<h1> Index Page v1 </h1>

# echo '<h1> Index Page v3 </h1>' > index.html

# git status 
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html

no changes added to commit (use "git add" and/or "git commit -a")
```





# log

- log 查看操作日志，显示当前HEAD和祖先，递归是沿着当前指针父提交、父父提交依次向前追溯； 

## log option

```sh
--pretty=oneline # 简略显示1

--oneline # 简略显示2

-Number # 仅显示的最近的N次提交；
```

## log example

```sh
# git log
commit 9c1d1d190384918d75fbffb2a1ac1298c7dfc929 (HEAD -> master)
Author: Xiang zheng <sredevops@163.com>
Date:   Fri Oct 21 17:10:27 2022 +0800

    v2

commit ee2c4e6a4e413e0d2340cbf98bc417cfc7a5ee6a # commit的哈希值
Author: Xiang zheng <sredevops@163.com> # commit的用户
Date:   Fri Oct 21 15:03:53 2022 +0800 # commit的时间

    v1                                # commit时指定的描述信息
```

### --pretty=oneline

```sh
# git log --pretty=oneline 
9c1d1d190384918d75fbffb2a1ac1298c7dfc929 (HEAD -> master) v2
ee2c4e6a4e413e0d2340cbf98bc417cfc7a5ee6a v1
```

### --oneline

```sh
# git log --oneline 
9c1d1d1 (HEAD -> master) v2
ee2c4e6 v1
```



# reflog

- 并非去遍历显示HEAD及其各个祖先提交，而是遍历HEAD所指向的顺序提交列表：undo历史；
- Reference logs，记录分支或其它引用在本地仓库中被更新的令牌 

- reflog 可以获取每次提交的 ID，然后可以使用--hard 根据提交的 ID 进行版本回退

## reflog option

- `usage: git reflog [ show | expire | delete | exists ]`

```sh
show # 默认值

expire # 

delete # 

exists # 
```

## reflog example

```sh
# git reflog 
9c1d1d1 (HEAD -> master) HEAD@{0}: commit: v2
ee2c4e6 HEAD@{1}: commit (initial): v1
```









# reset

- reset 通过修改HEAD指向的方式实现代码回滚 

## reset option

```sh
--soft # 仅本地仓库改变HEAD指向，即回到未commit前，一般用于需要重新提交的场景

--mixed # 暂存区、本地仓库改变HEAD指向，即回到未add前，一般用于需要重新添加到暂存区的场景

--hard # 工作区、暂存区、本地仓库改变HEAD指向，工作区的内容也会一并回滚！相当于彻彻底底的回滚
```

### 回滚指向标识

```sh
提交ID # 使用commit的ID，即git relog输出的长格式ID 或 git reflog输出的短格式ID

HEAD^ # HEAD表示当前分支，^表示回滚到上一个版本；因此HEAD^^表示回滚到上上一个版本，以此类推...

HEAD~N # HEAD表示当前分支，N表示回滚到相对于当前版本的第几个版本，例如：HEAD~5表示回滚到当前版本的第五个版本
```



## reset example

### 模板

```sh
[root@8 myapp]# ls
test1.txt  test2.txt  test3.txt


[root@8 myapp]# git reflog 
8f02ff1 (HEAD -> master) HEAD@{0}: commit: add test3.txt
9f3db0f HEAD@{1}: commit: add test2.txt
e2c4c6b HEAD@{2}: commit (initial): add test1.txt


[root@8 myapp]# git log
commit 8f02ff10d22bef34d84507ca38bfcf1b4fe2c954 (HEAD -> master)
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:21:50 2022 +0800

    add test3.txt

commit 9f3db0fc0a2e69a66a3426f77704d97c219b3fba
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:21:23 2022 +0800

    add test2.txt

commit e2c4c6b9643859459124ee4f686df480725ed717
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:20:58 2022 +0800

    add test1.txt


[root@8 myapp]# git status
On branch master
nothing to commit, working tree clean
```

### --soft

- --soft 仅本地仓库改变HEAD指向，即回到未commit前，一般用于需要重新提交的场景

```SH
[root@8 myapp]# git reset --soft HEAD^


# 本地仓库HEAD指向完成，最新的HEAD指向上一个版本的sha1值9f3db0f
[root@8 myapp]# git reflog 
9f3db0f (HEAD -> master) HEAD@{0}: reset: moving to HEAD^ # 9f3db0f
8f02ff1 HEAD@{1}: commit: add test3.txt
9f3db0f (HEAD -> master) HEAD@{2}: commit: add test2.txt # 9f3db0f
e2c4c6b HEAD@{3}: commit (initial): add test1.txt
[root@8 myapp]# git log
commit 9f3db0fc0a2e69a66a3426f77704d97c219b3fba (HEAD -> master) # 9f3db0f
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:21:23 2022 +0800

    add test2.txt

commit e2c4c6b9643859459124ee4f686df480725ed717
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:20:58 2022 +0800

    add test1.txt


# 工作区文件依旧存在
[root@8 myapp]# ls
test1.txt  test2.txt  test3.txt


# 可以进行重新commit了
[root@8 myapp]# git status
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   test3.txt
```



### --mixed

- --mixed 暂存区、本地仓库改变HEAD指向，即回到未add前，一般用于需要重新添加到暂存区的场景

```sh
[root@8 myapp]# git reset --mixed HEAD^


# 本地仓库HEAD指向完成，最新的HEAD指向上一个版本的sha1值9f3db0f
[root@8 myapp]# git reflog 
9f3db0f (HEAD -> master) HEAD@{0}: reset: moving to HEAD^ # 9f3db0f
8f02ff1 HEAD@{1}: commit: add test3.txt
9f3db0f (HEAD -> master) HEAD@{2}: commit: add test2.txt # 9f3db0f
e2c4c6b HEAD@{3}: commit (initial): add test1.txt
[root@8 myapp]# git log 
commit 9f3db0fc0a2e69a66a3426f77704d97c219b3fba (HEAD -> master) # 9f3db0f
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:21:23 2022 +0800

    add test2.txt

commit e2c4c6b9643859459124ee4f686df480725ed717
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:20:58 2022 +0800

    add test1.txt


# 工作区文件依旧存在
[root@8 myapp]# ls
test1.txt  test2.txt  test3.txt


# 可以重新add、commit了
[root@8 myapp]# git status 
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	test3.txt

nothing added to commit but untracked files present (use "git add" to track)
```



### --hard

- --hard 工作区、暂存区、本地仓库改变HEAD指向，工作区的内容也会一并回滚！，相当于彻彻底底的回滚

```sh
[root@8 myapp]# git reset --hard HEAD^
HEAD is now at 9f3db0f add test2.txt

# 本地仓库HEAD指向完成，最新的HEAD指向上一个版本的sha1值9f3db0f
[root@8 myapp]# git reflog 
9f3db0f (HEAD -> master) HEAD@{0}: reset: moving to HEAD^ # 9f3db0f
8f02ff1 HEAD@{1}: commit: add test3.txt
9f3db0f (HEAD -> master) HEAD@{2}: commit: add test2.txt # 9f3db0f
e2c4c6b HEAD@{3}: commit (initial): add test1.txt
[root@8 myapp]# git log 
commit 9f3db0fc0a2e69a66a3426f77704d97c219b3fba (HEAD -> master) # 9f3db0f
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:21:23 2022 +0800

    add test2.txt

commit e2c4c6b9643859459124ee4f686df480725ed717
Author: Xiang zheng <sredevops@163.com>
Date:   Sat Oct 22 11:20:58 2022 +0800

    add test1.txt


# 工作区文件被一并回滚
[root@8 myapp]# ls
test1.txt  test2.txt


# 相当于彻彻底底的回滚
[root@8 myapp]# git status 
On branch master
nothing to commit, working tree clean
```



# restore

- ？

## restore option

```sh
--staged <file> # 恢复索引
```



## ？

```
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   1.txt
```



# branch

- branch 可以实现查看、创建、重命名、删除 分支

## 注意事项

**创建分支时，目前所处的分支很关键，例如：**

- 在A分支上创建B分支，则表示B分支是从A分支迁出的，其中的内容为A分支的内容，可以理解为新分支是以软连接的方式指向了旧分支，**但是**后期A分支上所作出的修改不会影响B分支。A、B分支二者会按照各自的时间线向前衍生。

- 范例：

  - ```sh
    # 目前所处的master分支状态：
    [root@8 myapp]# git branch -a
    * master
    [root@8 myapp]# cat index.html 
    <h1> Index Page v1 </h1>
    
    
    # 创建新的develop分支：
    [root@8 myapp]# git branch -a
    * master # 创建时位于master分支
    [root@8 myapp]# git branch develop
    [root@8 myapp]# git branch -a
      develop # 因此新创建的分支内容来自master分支
    * master
    
    
    # 验证新创建的develop分支：
    [root@8 myapp]# git checkout develop 
    Switched to branch 'develop'
    [root@8 myapp]# git branch 
    * develop
      master
    [root@8 myapp]# cat index.html 
    <h1> Index Page v1 </h1>
    
    
    # 更改master分支下的内容：
    [root@8 myapp]# git branch -a
      develop
    * master
    [root@8 myapp]# cat index.html 
    <h1> Index Page v1 </h1>
    [root@8 myapp]# echo 'New Line' >> index.html 
    [root@8 myapp]# git add index.html 
    [root@8 myapp]# git commit -m 'v2'
    [master 45689fb] v2
     1 file changed, 1 insertion(+)
    [root@8 myapp]# cat index.html 
    <h1> Index Page v1 </h1>
    New Line
    
    
    
    # 切换回develop分支查看：
    [root@8 myapp]# git branch -a
    * develop
      master
    [root@8 myapp]# cat index.html 
    <h1> Index Page v1 </h1> # 不受影响
    ```


## branch option

```sh
git branch # 查看当前所处的分支
git branch -a # 显示所有分支
git branch -r # 显示远程分支
git branch -va # 详细信息

git branch <branchname> # 创建分支

git branch -m [<oldname>] <newname> # 重命名分支，不指定oldname则表示修改目前所处分支的名称，-M强制重命名

git branch -d <branchname> # 删除分支，-D强制删除
```



## branch example

```sh
# git branch -a
* master


# 创建分支
# git branch dev
# git branch -a
  dev
* master


# 重命名分支
# git branch -m dev develop
# git branch -a
  develop
* master
```



## WEB UI 管理分支

**为项目创建新分支：**

- 选择一个项目 --> 仓库 --> 分支 --> 新建分支
  - Branch name：develop
  - Create from：main（现有分支名称）
  - Create develop

**合并分支：**

- 选择一个项目 --> 仓库 --> 合并请求 --> 新建合并请求
  - Source branch：develop
  - Target branch：main
  - 比较分支并继续
  - 创建合并请求
- **最后使用devadmin的账号(即具有Owner权限的账号)，点击合并请求并合并**



# checkout

- checkout 可以实现分支切换、文件找回

## checkout option

```sh
git checkout -b <branchname> # 创建并切换到一个新分支
git checkout <branchname> # 签出(切换)分支


# 找回那些曾经存入到暂存区，或者完成提交，但在工作区中被误删除以及误修改内容的文件，又称签出 & 检出；
# 如果指定commit则表示从提交中找回，未指定则表示从暂存区中找回，--表示分隔符，避免将commit认为是文件名
# 注意：通常不要使用指向commit，因为会改变HEAD的指向
git checkout [<commit>] -- <file> ...
```

## checkout example

### 分支切换

- 注意事项：在同一主机同一时刻同一目录即使开了多个终端窗口，也只能位于同一分支

```sh
[root@8 myapp]# git branch -a
* develop
  master

[root@8 myapp]# git checkout master 
Switched to branch 'master'

[root@8 myapp]# git branch -a
  develop
* master
```

### 暂存区中找回工作区丢失的文件

```sh
[root@8 myapp]# pwd
/myapp
[root@8 myapp]# ls
test1.txt  test2.txt  test3.txt
[root@8 myapp]# cat test2.txt 
222
[root@8 myapp]# git status 
On branch master
nothing to commit, working tree clean

---

# 模拟文件误删除和误修改
[root@8 myapp]# rm -f test3.txt
[root@8 myapp]# ls
test1.txt  test2.txt
[root@8 myapp]# echo 'New Line' >> test2.txt 
[root@8 myapp]# cat test2.txt 
222
New Line
[root@8 myapp]# git status 
On branch master
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   test2.txt
	deleted:    test3.txt

no changes added to commit (use "git add" and/or "git commit -a")

---

# 文件找回
[root@8 myapp]# git checkout test2.txt test3.txt
Updated 2 paths from the index
[root@8 myapp]# ls
test1.txt  test2.txt  test3.txt
[root@8 myapp]# cat test2.txt 
222
[root@8 myapp]# git status 
On branch master
nothing to commit, working tree clean
```



# diff

- diff 可以实现文件内容比较，通常用于冲突合并

## diff option

```sh
git diff [--] [<file>] # 工作区与暂存区比较，不指定文件则进行全部比较； 

git diff --cached [<commit>] -- <path> # 暂存区与提交比较，不指定commit则表示最新的提交； 

git diff <commit> -- <path> # 工作区与提交比较； 

git diff <commit> <commit> -- <path> # 提交与提交之间比较； 
```

## diff example

### 工作区与暂存区比较

```sh
# 目前工作区与暂存区中test1.txt文件的内容没有任何不同，因此没有提示
[root@8 myapp]# git diff test1.txt


# 修改工作区test1.txt文件的内容
[root@8 myapp]# cat test1.txt 
111
[root@8 myapp]# echo 'New Line' >> test1.txt 


# 再次比较即可看到工作区与暂存区间的内容差异
[root@8 myapp]# git diff test1.txt
diff --git a/test1.txt b/test1.txt
index 58c9bdf..e8a03b3 100644
--- a/test1.txt
+++ b/test1.txt
@@ -1 +1,2 @@
 111
+New Line
```

### 暂存区与指定的提交比较

```sh
# 获取目前的所有提交
[root@8 myapp]# git reflog 
8f02ff1 (HEAD -> master) HEAD@{0}: commit: add test3.txt
9f3db0f HEAD@{1}: commit: add test2.txt
e2c4c6b HEAD@{2}: commit (initial): add test1.txt


# 将暂存区和目前最新的提交相比较，因为没有不同 所以没有提示信息
[root@8 myapp]# git diff --cached -- 8f02ff1 test1.txt


# 修改工作区test1.txt文件的内容，并提交到暂存区
[root@8 myapp]# cat test1.txt 
111
[root@8 myapp]# echo 'New Line' >> test1.txt 
[root@8 myapp]# git add test1.txt 



# 再次将暂存区和目前最新的提交相比较，可以看到差异
[root@8 myapp]# git diff --cached -- 8f02ff1 test1.txt
diff --git a/test1.txt b/test1.txt
index 58c9bdf..e8a03b3 100644
--- a/test1.txt
+++ b/test1.txt
@@ -1 +1,2 @@
 111
+New Line
```



# merge

- merge 可以实现分支合并

## 分支合并方式

- 一般分支合并只有以下两种方式：
- 假设有A、B两个分支，而B分支是由A分支迁出的；

### 快进式合并

- 只有B分支做出了修改，而A分支保持不变(没有任何提交操作)，那么在合并时只需将A分支的HEAD直接指向B分支的HEAD即可，这种就是快进式合并；
- 反之，如果A、B两个分支都做出了修改，那将无法进行快进式合并，只能进行三方合并；

### 三方合并

- A、B两个分支都向前推进，而后A、B两个分支的最新一次提交(指向的HEAD)在分叉前的区域进行合并，这种就是三方合并；
- 只有三方合并才有产生冲突的可能性；





## merge example

### 分支合并

- 合并时位于哪个分支，哪个分支就为合并分支，其他分支就为被合并分支；
- 一般合并操作都是由develop分支向master分支合并，或者feature分支向develop分支合并；

```sh
# 分支合并前
[root@8 myapp]# git branch 
* develop
  master
[root@8 myapp]# cat test1.txt 
111
New Line
[root@8 myapp]# git checkout master
Switched to branch 'master'
[root@8 myapp]# git branch 
  develop
* master
[root@8 myapp]# cat test1.txt 
111



# 将develop分支合并至master分支
# 注意：合并前一定要确定develop分支已经add并且commit，以及合并时位于master分支
[root@8 myapp]# git branch 
  develop
* master
[root@8 myapp]# git merge develop
Updating 8f02ff1..8e8a0ce
Fast-forward
 test1.txt | 1 +
 1 file changed, 1 insertion(+)
 
 
# 验证
[root@8 myapp]# git branch 
  develop
* master
[root@8 myapp]# cat test1.txt 
111
New Line
```



### 分支合并时冲突

- 分支合并时冲突主要体现在 不同分支 同一文件 共同向前推进时产生的差异所导致的文件内容冲突

```sh
# 分支合并前
[root@8 myapp]# git branch 
* develop
  master
[root@8 myapp]# cat test2.txt 
222
666
[root@8 myapp]# git checkout master
Switched to branch 'master'
[root@8 myapp]# git branch 
  develop
* master
[root@8 myapp]# cat test2.txt 
222
888


# 将develop分支合并至master分支出现冲突，需要手动修复冲突后提交
[root@8 myapp]# git branch 
  develop
* master
[root@8 myapp]# git merge develop
Auto-merging test2.txt
CONFLICT (content): Merge conflict in test2.txt
Automatic merge failed; fix conflicts and then commit the result.
[root@8 myapp]# cat test2.txt 
222
<<<<<<< HEAD
888
======= # 分隔符
666
>>>>>>> develop



# 修复冲突可以选择以master为基准或以develop为基准
# 以develop为基准修复冲突
[root@8 myapp]# git branch 
  develop
* master
[root@8 myapp]# vim test2.txt
222
666 # 也可以将此行删除而后通过合并来补全，即回到迁出分支时的初始状态 从而实现快进式合并
[root@8 myapp]# git add test2.txt 
[root@8 myapp]# git commit -m 'fix conflicts'
[master 450f15c] fix conflicts
[root@8 myapp]# git merge develop
Already up to date. # 因为通过手动修改的方式与develop保持一致并提交了，因此合并结果提示已经是最新的
```



# rebase

- 三方合并也可以用rebase实现
- `git rebase --help`





# rm

- 默认会将工作区和暂存区一并删除，但是可以使用 `restore --staged <file>`  + `git restore <file>` 将其恢复

- **注意事项：**如果文件或目录仅在工作区删除，而未删除暂存区的内容，则会导致代码在提交到本地仓库后文件或目录依旧存在。因此，正确的删除方法是先删除工作区再删除暂存区：rm && git rm --cached

## rm option

```sh
-r # 递归删除，针对目录必须递归
-f # 强制删除
-n # dry run
--cached # 仅删除暂存区的内容，不会删除工作区的内容，其功能等同于git reset HEAD <file>...
```

## rm example

### 删除gitlab上的文件

```bash
#先将远程的代码clone下来
[root@jenkins opt]# git clone -b develop git@10.0.0.38:app1-dev/dev-app1.git

#进入代码目录
[root@jenkins opt]# cd dev-app1/

#git rm -r "要删除的文件"
[root@jenkins dev-app1]# git rm -r "myapp/"

#git commit -m "备注"
[root@jenkins dev-app1]# git commit -m "del"

#提交
[root@jenkins dev-app1]# git push
```

### 删除暂存区的内容

```sh
# git status 
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	1.txt

nothing added to commit but untracked files present (use "git add" to track)


# git add 1.txt 


# git status 
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   1.txt


# 删除暂存区的内容
# git rm --cached 1.txt 
rm '1.txt'

# git status 
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	1.txt

nothing added to commit but untracked files present (use "git add" to track)
```





# mv

- 默认会将工作区和暂存区一并移动
- `git mv`
