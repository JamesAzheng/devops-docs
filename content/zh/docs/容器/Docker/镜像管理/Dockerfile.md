---
title: "Dockerfile"
weight: 11
---

# Dockerfile 概述

- 每一行以Dockerfile的指令开头，指令不区分大小写，但是惯例使用大写

- 每条指令都是独立运行的

  - ```bash
    RUN cd /app/
    RUN echo 'hello docker' > word.txt # word.txt不会存放到app目录下
    ```
  
- 使用 # 开始作为注释

- 每一行只支持一条指令，每条指令可以携带多个参数

- 指令按文件的顺序从上至下进行执行

## 最佳实践

- 尽可能将多条指令合并成一条指令，因为每个指令的执行会生成一个新的镜像层，为了减少分层和镜像大小
- 为了加速镜像制作，**将最常变化的内容放到dockerfile文件的后面**，因为制作镜像一般可能需要反复多次，每次执行dockerfile都按顺序执行，从头开始，已经执行过的指令已经缓存，不需要再执行，如果后续有一行新的指令没执行过，其往后的指令会重新执行
- 构建完成前将镜像中无用的文件或应用删除和卸载，以减少镜像大小。

## 构建过程

1. 从基础镜像运行一个容器
2. 执行一条指令，对容器做出修改
3. 执行类似docker commit的操作，提交一个新的中间镜像层(可以利用中间层镜像创建容器进行调试和排错)
4. 再基于刚提交的镜像运行一个新容器
5. 执行Dockerfile中的下一条指令，直至所有指令执行完毕

## 获取帮助

- 官方帮助：https://docs.docker.com/engine/reference/builder/

- 帮助：man 5 dockerfile



# Dockerfile 相关命令

## docker build

- 通过 Dockerfile 构建镜像 

```bash
# 语法：
docker build [OPTIONS] PATH | URL | -


# OPTIONS：
-f, --file string  # Dorckerfile文件名，默认为 WORKDIR/Dorckerfile
--force-rm         # 总是删除中间层容器，创建镜像失败时，删除临时容器
--no-cache         # 不使用之前构建时创建的缓存
-q, --quiet=false  # 不显示Dorckerfile的RUN运行的输出结果
--rm=true          # 创建镜像成功时，删除临时容器
-t，--tag list     # 设置注册名称，镜像名称、标签。格式为 <注册名称>/<镜像名称>:<标签>（标签默认为latest）
--build-arg        # 用于向 Dockerfile 中传递构建参数。
--network          # 用于指定构建时要使用的网络模式。

PATH | URL | -     # Dorckerfile文件路径，也可以是URL路径，若设置为 - ，则从标准输入获取Dcokerfile的内容
```

### 选项详细说明

**构建镜像时的注册名称是什么意思**

- 构建镜像时的注册名称通常是指 Docker Hub 上的用户名或组织名，可以将自己或组织的镜像推送到 Docker Hub 上，供其他人使用和下载。注册名称的格式为 `用户名/镜像名称` 或 `组织名/镜像名称`。当使用 Dockerfile 构建镜像时，可以使用该注册名称作为镜像的名称，例如：

  ```dockerfile
  FROM ubuntu:latest
  MAINTAINER John Doe <johndoe@example.com>
  LABEL version="1.0" description="My custom Ubuntu image"
  RUN apt-get update && apt-get install -y python
  CMD ["python"]
  ```

  如果将该 Dockerfile 构建为名为 `johndoe/my-ubuntu` 的镜像，可以使用以下命令构建和推送该镜像：

  ```sh
  docker build -t johndoe/my-ubuntu .
  docker push johndoe/my-ubuntu
  ```

  这样，其他人就可以使用 `docker pull johndoe/my-ubuntu` 命令来下载该镜像并在他们的环境中运行它。



**使用 docker build 构建时的 --force-rm 选项是什么意思**

`--force-rm` 是 Docker 构建镜像时的选项之一，用于强制删除构建过程中的中间镜像，即在每个构建阶段结束后自动清理构建产生的临时容器。该选项可以避免由于临时容器堆积而导致的磁盘空间占用过高的问题。

默认情况下，Docker 会在每个构建阶段结束后保留中间镜像，以便在下一个构建阶段继续使用。但是这些中间镜像可能会占用大量的磁盘空间，因此使用 `--force-rm` 选项可以在每个构建阶段结束后强制删除中间镜像，释放磁盘空间。

使用 `--force-rm` 选项的示例命令如下：

```sh
docker build --force-rm -t my-image .
```

该命令将使用 Dockerfile 中的指令构建一个名为 `my-image` 的镜像，并在构建过程中强制删除中间镜像。



**使用 docker build 构建时的 --force-rm 选项相当于执行 docker build --no-cache 吗**

`--force-rm` 和 `--no-cache` 是两个不同的选项，它们在 Docker 构建镜像时的行为也不同。

`--force-rm` 选项会在每个构建阶段结束后强制删除产生的中间镜像，以释放磁盘空间。该选项不会影响缓存的使用，因此在下一次构建时仍然可以使用缓存。

`--no-cache` 选项则会完全禁用构建时的缓存机制，即每个指令都会强制重新构建，不会使用任何缓存。这将导致构建时间变长，但可以确保使用最新的指令和依赖项来构建镜像。

因此，`--force-rm` 和 `--no-cache` 是两个不同的选项，它们分别用于不同的目的。如果想要强制删除中间镜像并释放磁盘空间，可以使用 `--force-rm`；如果想要禁用缓存机制以确保使用最新的指令和依赖项来构建镜像，则可以使用 `--no-cache`。



**使用 docker build 构建时未加 --force-rm 选项，那么产生的中间镜像会一直保存在磁盘上吗？后期应该如何清理这些中间镜像呢**

是的，如果在使用 `docker build` 构建镜像时没有使用 `--force-rm` 选项，则产生的中间镜像会一直保存在磁盘上，占用大量的磁盘空间。这些中间镜像可以使用 `docker image prune` 命令来清理。

`docker image prune` 命令可以删除未被使用的镜像，包括中间镜像和已经被标记为“<none>”的镜像。使用该命令时需要注意，它将不可逆地删除这些镜像，因此需要谨慎使用。一般来说，如果镜像已经被使用，即使它们的标签已经被删除，也不应该删除它们。

下面是一个使用 `docker image prune` 命令来清理中间镜像的示例：

```sh
docker image prune -f
```

该命令将删除所有未被使用的镜像，包括中间镜像和已经被标记为“<none>”的镜像。如果要删除指定的镜像，可以使用 `docker rmi` 命令。例如：

```sh
docker rmi image_id
```

其中 `image_id` 是要删除的镜像 ID。

### 范例

```sh
docker build -t ubuntu-20.04-base:1.0 --force-rm .
docker build -t ubuntu-20.04-base:1.0 -t ubuntu-20.04-base:latest
docker build .
docker build /usr/local/src/nginx
docker build -f /path/to/a/Dorckerfile .
docker build -t nginx:v1.0 /usr/local/src/nginx
```

### build 脚本

```sh
#!/bin/bash
$1
docker build -t $1 . 
```



## docker history

- 查看镜像分层历史后，还可以进入单独一层的镜像进行操作。

```sh
# docker history centos7.9.2009:v1.0 
IMAGE          CREATED         CREATED BY                                      SIZE      COMMENT
fb167ce759c8   3 minutes ago   /bin/sh -c yum makecache && yum -y install  …   495MB     
410589d1adbe   6 minutes ago   /bin/sh -c #(nop) COPY file:10bd0c16eb66bfb5…   2.52kB    
1026fba06d50   6 minutes ago   /bin/sh -c rm -fr /etc/yum.repos.d/*            0B        
4d1ba4477c9f   6 minutes ago   /bin/sh -c #(nop)  LABEL maintainer=xiangzhe…   0B        
e36d33e25bb2   6 minutes ago   /bin/sh -c #(nop)  LABEL version=1.0            0B        
eeb6ee3f44bd   4 months ago    /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B        
<missing>      4 months ago    /bin/sh -c #(nop)  LABEL org.label-schema.sc…   0B        
<missing>      4 months ago    /bin/sh -c #(nop) ADD file:b3ebbe8bd304723d4…   204MB     


# 较旧的镜像
# docker run -it 4d1ba4477c9f sh
sh-4.2# ls
anaconda-post.log  bin	dev  etc  home	lib  lib64  media  mnt	opt  proc  root  run  sbin  srv  sys  tmp  usr	var
sh-4.2# ls /etc/yum.repos.d/
CentOS-Base.repo  CentOS-Debuginfo.repo  CentOS-Sources.repo  CentOS-fasttrack.repo
CentOS-CR.repo	  CentOS-Media.repo	 CentOS-Vault.repo    CentOS-x86_64-kernel.repo
sh-4.2# exit
exit

# 最新的镜像
# docker run -it fb167ce759c8 sh
sh-4.2# ls /etc/yum.repos.d/
CentOS-Base-7.repo
```



# Dockerfile 调试指令

```dockerfile
...
# 末尾添加（前面不要有CMD 或 docker run时不要或指定参数，否则将成为ENTRYPOINT的参数）
ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]
```



# ---

# .dockerignore 文件

- 与`.gitignore`文件类似，定义创建镜像时忽略的文件或文件夹，存放在和Dockerfile同级的目录下。
  - https://docs.docker.com/engine/reference/builder/#dockerignore-file

- `.dockerignore` 文件使用 Go 的文件路径规则 filepath.Match
  - https://golang.org/pkg/path/filepath/#Match


## 常用语法

```sh
#   # 以#开头的行为注释
*   # 匹配任何非分隔符字符序列
?   # 匹配任何单个非分隔符
\\  # 表示 \
 
**  # 匹配任意数量的目录（包括零）例如：**/*.go将排除在所有目录中以.go结尾的所有文件，包括构建上下文的根
!   # 表示取反，可用于排除例外情况
```

## 范例

```dockerfile
# 排除 test 目录下的所有文件
test/*

# 排除 md 目录下的 xttblog.md 文件
md/xttblog.md

# 排除 xttblog 目录下的所有 .md 的文件
xttblog/*.md

# 排除以 xttblog 为前缀的文件和文件夹
xttblog?

# 排除所有目录下的 .sql 文件夹
**/*.sql
```







# ---



# FROM 指定基础镜像

- 制作镜像时，必须指定一个基础镜像，后续的指令都是根据这个基础镜像来进行定制
- FROM 就是指定基础镜像，此指令通常必须放在 Dockerfile 文件的第一个非注释行
- 基础镜像可以是任何可用的镜像文件，建议使用官方的镜像
- 基础镜像不存在时，将会去dockerhub官网拉取镜像，镜像不存在 则执行 docker build 时会返回错误信息
- 所有镜像的起源镜像是 scratch，相当于Java中的object类，该镜像是一个空的镜像，此镜像在构建基本镜像（例如debianand busybox）或超小镜像（仅包含单个二进制文件及其所需的任何内容，例如hello-world）的上下文中最有用。


- **参考链接：**
  - https://docs.docker.com/develop/develop-images/baseimages/
  - https://hub.docker.com/_/scratch?tab=description

## FROM 格式

```dockerfile
FROM [--platform=<platform>] <image> [AS <name>]
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]

# --platform，指定镜像的平台，如：linux/amd64、 linux/arm64或windows/amd64
# tag 和 digest表示指定源镜像版本的标签，不指定
```

### 范例

```dockerfile
# 不指定镜像版本，则默认tag为latest
FROM ubuntu

# 指定镜像版本
FROM ubuntu:20.04
```





# LABEL 指定镜像元数据

- 可以指定镜像元数据，如：版本号、镜像作者等
- docker inspect 命令可以查看 label

## LABEL 格式

```dockerfile
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```

## 范例

```dockerfile
# 单标签写法
LABEL version="1.0"
LABEL maintainer="azheng <767483070@qq.com>"


# 推荐使用，多标签写法，减少镜像的大小
# 一行格式
LABEL multi.label1="value1" multi.label2="value2" other="value3"

# 多行格式1
LABEL multi.label1="value1" \
      multi.label2="value2" \
      other="value3"

# 多行格式2
LABEL description="This text illustrates \
that label-values can span multiple lines."
```





# RUN 执行命令

- 执行当前调用的镜像支持的命令进行镜像构建，可以是 Shell 命令，也可以是其他语言的编译、安装、配置等操作
- 每个 RUN 都是独立运行的和前一个 RUN 无关

## RUN 格式

```bash
# Shell格式，相当于 /bin/sh -c <命令> 此种形式支持环境变量
RUN <命令>

# exec格式，注意：此种形式不支持环境变量，并且必须是双引号，不能是单引号
RUN ["可执行文件","参数1","参数2" ]


# 只使用一次变量
RUN <key>=<value> <command>

# 引用变量
RUN $key ...
```

### 范例

```dockerfile
# Shell格式
RUN echo '<h1>Hello,Docker!</h1>' > /usr/share/nginx/html/index.html

RUN yum -y install epel-release \
      && yum -y install nginx \
      && rm -fr /usr/share/nginx/html/* \
      && echo "<h1>docker test nginx</h1>" > /usr/share/nginx/html/index.html


# exec格式      
RUN ["/bin/bash","-c","echo hello world"]
```

## 注意事项


- RUN可以写多个，每一个RUN指令都会建立一个镜像层，所以尽可能合并成一条指令，比如将多个Shell命令通过 && 连接一起成为一条指令

- 每个RUN都是独立运行的，和前一个RUN无关：


  - ```dockerfile
    RUN cd /app/
    RUN echo 'hello docker' > word.txt # word.txt不会存放到app目录下
    ```





# ENV 设置环境变量

- ENV 可以定义**镜像构建时 或 容器内** 的环境变量和值

- 会被后续指令(如：ENV、ADD、COPY、RUN等)通过$KEY或${KEY}进行引用，并在容器运行时保持

## ENV  格式

```sh
# 格式1，此格式只能对一个key进行赋值,<key>之后的所有内容均会被视作其<value>的组成部分
ENV <key> <value>

# 格式2，此格式可以支持多个key赋值，定义多个变量时建议使用，减少镜像层
ENV <key1>="<value1>" <key2>="<value2>" \
    <key3>="<value3>" ...
```

### 范例

```dockerfile
# 格式1（等同于格式2）
ENV MY_NAME="John Doe"
ENV MY_DOG=Rex\ The\ Dog
ENV MY_CAT=fluffy

# 格式2（等同于格式1）
ENV MY_NAME="John Doe" MY_DOG="Rex\ The\ Dog" \
    MY_CAT=fluffy
```

## 注意事项

- 如果\<value>中包含空格，可以以反斜线\进行转义，也可通过对\<value>加引号进行标识；另外，反斜线也可以用于续行
- 变量支持高级赋值格式
  - `${key:-word}` 如果变量key未被赋值，则打印word；如果变量key被赋值，则打印实际的值
  - `${key:+word}`

- 在运行容器时修改变量的值，不会影响docker build时环境变量的值

  - 假如Dockerfile中创建文件时引用了变量，那么文件名还是使用最初定义的变量值（一个是运行容器，一个是构建过程，因此不影响）

  - ```bash
    # 在运行容器时临时修改变量的值（仅对对容器中的环境变量有效）
    docker run -it -e USER=www -e VERSION=2.0 --rm centos7.9:v5.0
    ```

- 如果仅在构建期间需要环境变量，而不是在最终镜像中，请考虑为单个命令设置一个值

  - ```dockerfile
    # RUN时定义临时变量
    RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y ...
    
    
    # 或者使用ARG，它不会保留在最终镜像中：
    ARG DEBIAN_FRONTEND=noninteractive
    RUN apt-get update && apt-get install -y ...
    ```



# ARG 构建参数

- ARG指令在build阶段指定变量，和ENV不同的是，容器运行时不会存在这些环境变量
- 如果 ARG 和 ENV 的变量同名，则 ENV 会覆盖 ARG 
- 可以用 `docker build --build-arg <参数名>=<值>` 来覆盖

## ARG 格式

```dockerfile
ARG <name>[=<default value>]
```

## 注意事项

- **在 FROM 之前定义的 ARG 位于构建阶段以外，因此无法被 FROM 之后的内容引用，如果要使用，需在构建阶段(FROM之后)重新引用FROM之前定义的键即可**

```dockerfile
# 在 FROM 之前定义的 ARG 位于构建阶段以外，因此无法被 FROM 之后的内容引用
# vim Dockerfile
ARG  CODE_VERSION=stable
FROM busybox:${CODE_VERSION}
RUN echo ${CODE_VERSION} > /imageversion
CMD ["tail", "-f", "/etc/hosts"]

# docker build -t busybox:v1 .
# docker run -d --name busyboxv1 busybox:v1
# docker exec busyboxv1 cat /imageversion
       # 未被赋值，因此为空

------------------------------------------------------------------------------

# 如果要使用，需在构建阶段(FROM之后)重新引用FROM之前定义的键即可
# vim Dockerfile
ARG  CODE_VERSION=stable
FROM busybox:${CODE_VERSION}
ARG  CODE_VERSION # 引用FROM之前定义的键即可
RUN echo ${CODE_VERSION} > /imageversion
CMD ["tail", "-f", "/etc/hosts"]

# docker build -t busybox:v3 .
# docker run -d --name busyboxv3 busybox:v3
# docker exec busyboxv3 cat /imageversion
stable  # 赋值成功

# 但环境变量不会存在于容器中
# docker exec busyboxv3 env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=42bc81c5a78c
HOME=/root
```

## 范例-1

- FROM指令支持由第一个FROM之前的任何ARG指令声明的变量，但容器运行时不会存在这些环境变量

```dockerfile
ARG  CODE_VERSION=V1.0
FROM nginx:${CODE_VERSION}
...
```



# ---

# COPY 复制文件或目录

- 复制本地宿主机的文件或目录(src) 到 容器中(dest)
- src 的各种元数据都会保留。比如读、写、执行、文件时间戳等信息
- 如果 dest 事先不存在，它将会被自动创建（包括其父目录路径）

## COPY 格式

```dockerfile
COPY [--chown=<user>:<group>] <src>... <dest>

# 包含空格的路径需要使用这种语法
COPY [--chown=<user>:<group>] ["<src>",... "<dest>"]
```

### 范例

```dockerfile
COPY base.repo /etc/yum.repos.d/

COPY hom* /mydir/ 

COPY hom?.txt /mydir/

COPY --chown=55:mygroup files* /somedir/
COPY --chown=bin files* /somedir/
COPY --chown=1 files* /somedir/
COPY --chown=10:11 files* /somedir/
```

## 注意事项

- 如果指定了多个 src，或在 src 中使用了通配符， dest 必须是一个以/结尾的目录；
  - 通配符参考：https://pkg.go.dev/path/filepath#Match

- dest 可以是绝对路径，也可以是`WORKDIR`指定的相对路径
- **src 只能是相对路径**（并且源文件只能放到和 Dockerfile 同级的目录，或同级目录下的子目录）
- 为了便于区分，Dockerfile 在定义时目录最好以/结尾

## 范例：src 绝对路径找不到文件

```dockerfile
# ll /test/data/nginx-1.22.1.tar.gz 
-rw-r--r-- 1 root root 1073948 Oct 19 17:23 /test/data/nginx-1.22.1.tar.gz

# vim /test/Dockerfile
FROM centos:centos7.9.2009
COPY /test/data/nginx-1.22.1.tar.gz /data/
CMD ["tail","-f","/etc/hosts"]


# cd /test/
# docker build -t centos7.9:v2 .
Sending build context to Docker daemon  1.077MB
Step 1/3 : FROM centos:centos7.9.2009
 ---> eeb6ee3f44bd
Step 2/3 : COPY /test/data/nginx-1.22.1.tar.gz /data/
COPY failed: file not found in build context or excluded by .dockerignore: stat test/data/nginx-1.22.1.tar.gz: file does not exist
```



## 范例：复制文件

### 单一文件

- 单一文件的dest可以为文件，也可以为目录

```dockerfile
# 准备测试文件
# tree ./
./
├── Dockerfile
└── etc
    └── issue

# cat etc/issue
Ubuntu 20.04.4 LTS \n \l
# ll etc/issue
-r-------- 1 root root 26 Feb 17  2022 etc/issue

# cat Dockerfile
FROM centos:centos7.9.2009
COPY etc/issue /etc/issue
CMD ["tail","-f","/etc/hosts"]


# 构建镜像
# docker build -t centos7.9:v1.0 .


# 测试，原有文件会被替换，源文件权限会被保留
# docker run -d --name centos centos7.9:v1.0 
# docker exec -it centos sh
sh-4.2# cat /etc/issue
Ubuntu 20.04.4 LTS \n \l
sh-4.2# ls -l /etc/issue
-r-------- 1 root root 26 Feb 17  2022 /etc/issue
```

### 多个文件

- 多个文件的 dest 只能为以/结尾的目录



## 范例：复制目录

- 如果 src 为目录，则其内部文件或子目录会递归复制，**但src目录自身不会被复制**

```dockerfile
# 准备测试文件
# tree ./
./
├── Dockerfile
└── etc
    └── issue

# cat etc/issue
Ubuntu 20.04.4 LTS \n \l
# ll etc/issue
-r-------- 1 root root 26 Feb 17  2022 etc/issue

# cat Dockerfile
FROM centos:centos7.9.2009
COPY etc/ /dir666/
CMD ["tail","-f","/etc/hosts"]


# 构建镜像
# docker build -t centos7.9:v2.0 .


# 测试，目录本身不会复制，源文件权限会被保留
# docker run -d --name centos centos7.9:v2.0 
# docker exec -it centos sh
# ls -l /dir666/
total 4
-r-------- 1 root root 26 Feb 17  2022 issue
```

### 包括目录一并复制

- 只能建立上级目录，然后指定上级目录复制

```dockerfile
# 准备测试文件
# tree ./
./
├── dir # 指定上级目录复制
│   └── etc
│       └── issue
└── Dockerfile


# cat dir/etc/issue 
Ubuntu 20.04.4 LTS \n \l
# ll dir/etc/issue 
-r-------- 1 root root 26 Feb 17  2022 etc/issue

# cat Dockerfile
FROM centos:centos7.9.2009
COPY dir/ /dir666/
CMD ["tail","-f","/etc/hosts"]


# 构建镜像
# docker build -t centos7.9:v3.0 .


# 测试，目录本身不会复制，源文件权限会被保留
# docker run -d --name centos centos7.9:v3.0 
# docker exec -it centos sh
# ls -l /dir666/etc/issue 
-r-------- 1 root root 26 Feb 17  2022 /dir666/etc/issue
```



# ADD 增强版COPY

- 增强版的COPY，除具有COPY的特性外，还支持以下功能：

  - **src 可以是一个URL，进而从URL下载文件，下载后的文件权限将自动设置为为600**
    - 如果为URL且不以/结尾，则指定的文件将被下载并直接被创建，如果以/结尾，则文件名URL指定的文件将被直接下载并保存为/\<filename>
  - **src 如果是tar或者压缩文件可以自动解压，最终会留下解压后的文件，源文件自身不会导入镜像中**
    - zip格式的压缩文件不能自动解压
    - 从URL下载的压缩文件不会自动解压缩
- ADD命令遇到压缩的文件会将其进行解压，并将解压后的文件复制到镜像中
  - Docker 仅支持解压缩格式为 `gzip`、`bzip2`、`xz` 和 `tar` 的压缩文件，而不支持 `zip` 等格式的压缩文件。因此，在使用 `ADD` 命令时，应该尽量避免使用 `zip` 等格式的压缩文件。
- 需要注意的是，`ADD` 命令的这些特性可能会使得镜像的构建不透明。因此，如果可能的话，最好使用 `COPY` 命令将文件复制到镜像中，以确保构建的透明性。只有在确实需要 `ADD` 命令的某些特性时，才应该使用它。

## ADD 格式

```bash
ADD [--chown=<user>:<group>] <src>... <dest>
ADD [--chown=<user>:<group>] ["<src>",... "dest"]
```

### 范例

```dockerfile
ADD nginx.tar.gz /

ADD test dir/

ADD --chown=azheng:azheng files* /somedir/
```



## 范例：src 绝对路径找不到文件

```dockerfile
# ll /test/data/nginx-1.22.1.tar.gz 
-rw-r--r-- 1 root root 1073948 Oct 19 17:23 /test/data/nginx-1.22.1.tar.gz

# vim /test/Dockerfile
FROM centos:centos7.9.2009
ADD /test/data/nginx-1.22.1.tar.gz /data/
CMD ["tail","-f","/etc/hosts"]


# cd /test/
# docker build -t centos7.9:v2 .
Sending build context to Docker daemon  1.077MB
Step 1/3 : FROM centos:centos7.9.2009
 ---> eeb6ee3f44bd
Step 2/3 : ADD /test/data/nginx-1.22.1.tar.gz /data/
ADD failed: file not found in build context or excluded by .dockerignore: stat test/data/nginx-1.22.1.tar.gz: file does not exist
```



## 范例：压缩文件自动解压

```dockerfile
# tree .
.
├── data
│   └── nginx-1.22.1.tar.gz
└── Dockerfile


# vim Dockerfile 
FROM centos:centos7.9.2009
ADD data/nginx-1.22.1.tar.gz /data/
CMD ["tail","-f","/etc/hosts"]


# docker build -t centos7.9:v1 .


# docker run -d --name centos centos7.9:v1


# 测试，压缩文件被解压，而压缩源文件不会导入到镜像中
# docker exec -it centos sh
sh-4.2# ls -l /data/
total 4
drwxr-xr-x 8 1001 1001 4096 Oct 19 08:02 nginx-1.22.1
sh-4.2# ls -l /data/nginx-1.22.1/
total 824
-rw-r--r-- 1 1001 1001 317399 Oct 19 08:02 CHANGES
-rw-r--r-- 1 1001 1001 485035 Oct 19 08:02 CHANGES.ru
-rw-r--r-- 1 1001 1001   1397 Oct 19 08:02 LICENSE
-rw-r--r-- 1 1001 1001     49 Oct 19 08:02 README
drwxr-xr-x 6 1001 1001   4096 Oct 19 08:02 auto
drwxr-xr-x 2 1001 1001   4096 Oct 19 08:02 conf
-rwxr-xr-x 1 1001 1001   2590 Oct 19 08:02 configure
drwxr-xr-x 4 1001 1001   4096 Oct 19 08:02 contrib
drwxr-xr-x 2 1001 1001   4096 Oct 19 08:02 html
drwxr-xr-x 2 1001 1001   4096 Oct 19 08:02 man
drwxr-xr-x 9 1001 1001   4096 Oct 19 08:02 src
```



## 范例：从URL下载

### URL且不以/结尾

```dockerfile
# vim Dockerfile 
FROM centos:centos7.9.2009
ADD https://nginx.org/download/nginx-1.22.1.tar.gz /data/
CMD ["tail","-f","/etc/hosts"]


# docker build -t centos7.9:v4.0 .


# docker run -d --name centos centos7.9:v4.0 


# dest的/data/目录事先不存在 被自动创建了，下载后的文件权限被设为了600，从URL下载的压缩文件不会自动解压缩
# docker exec -it centos sh
sh-4.2# ls -l /data/     
total 1052
-rw------- 1 root root 1073948 Oct 19 09:23 nginx-1.22.1.tar.gz
```

### URL且以/结尾

```dockerfile
# vim Dockerfile 
FROM centos:centos7.9.2009
ADD https://nginx.org/download/nginx-1.22.1.tar.gz/ /data/
CMD ["tail","-f","/etc/hosts"]


# docker build -t centos7.9:v6.0 .
Sending build context to Docker daemon  4.096kB
Step 1/3 : FROM centos:centos7.9.2009
 ---> eeb6ee3f44bd
Step 2/3 : ADD https://nginx.org/download/nginx-1.22.1.tar.gz/ /data/
ADD failed: failed to GET https://nginx.org/download/nginx-1.22.1.tar.gz/ with status 404 Not Found: <html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.21.5</center>
</body>
</html>
```



# ---



# CMD 容器启动命令

- CMD用来指定**启动容器时的一个命令**，其运行结束后，容器也会停止，所以**一般CMD指定的命令为持续且前台执行的命令**

## CMD 格式

```dockerfile
# 使用 exec 执行，推荐方式，此种形式不支持环境变量，第一个参数最好使用命令的绝对路径
CMD ["executable","param1","param2"]

# 在 shell 中执行，此种形式支持环境变量，提供给需要交互的应用
CMD command param1 param2

# 提供给 ENTRYPOINT 命令的默认参数
CMD ["param1","param2"]
```

### 范例

```dockerfile
CMD ["nginx","-g","daemon off;"]
```

## 注意事项

- 每个 Dockerfile 只能有一条 CMD，如定义了多条，则只有最后一条生效
- 如果用户启动容器时用 `docker run` 指定运行的命令，则会覆盖CMD指定的命令

## 范例-1

```dockerfile
# 其实应该使用RUN判断curl命令是否存在，不存在则安装，存在则不安装
# vim Dockerfile
FROM centos:centos7.9.2009
CMD ["curl","-s","cip.cc"]


# docker build -t loadip:v1 .


# docker run loadip:v1 
IP	: 112.39.50.141
地址	: 中国  辽宁  葫芦岛
运营商	: 移动

数据二	: 辽宁省 | 移动

数据三	: 中国辽宁省葫芦岛市 | 移动

URL	: http://www.cip.cc/112.39.50.141


# CMD被替换
# docker run loadip:v1 cat /etc/issue
\S
Kernel \r on an \m


# docker run loadip:v1 -I
docker: Error response from daemon: failed to create shim: OCI runtime create failed: container_linux.go:380: starting container process caused: exec: "-I": executable file not found in $PATH: unknown.
```



# ENTRYPOINT 入口点

- **配置容器启动后执行的命令及参数**，功能类似于CMD，但优先级比CMD高，指定 ENTRYPOINT 后 CMD 将作为 ENTRYPOINT 的参数

## ENTRYPOINT 格式

```dockerfile
# 使用 exec 执行，推荐方式，此种形式不支持环境变量
ENTRYPOINT ["executable","param1","param2"]

# 在 shell 中执行，此种形式支持环境变量，提供给需要交互的应用
ENTRYPOINT command param1 param2
```



## 注意事项

- 每个 Dockerfile 只能有一条 ENTRYPOINT，如定义了多条，则只有最后一条生效

- `docker run` 时如果提供了参数，ENTRYPOINT 不会被覆盖 ，而是将全部参数作为 ENTRYPOINT 的参数

- `docker run` 时如果提供了参数，并且 Dockerfile 中既有 CMD 也有 ENTRYPOINT，那么 `docker run`的参数将覆盖掉 CMD 的内容，并最终作为 ENTRYPOINT 的参数

- 如果 Dockerfile 中既有 CMD 也有 ENTRYPOINT，那么 **CMD 会作为 ENTRYPOINT 的参数**

- 可以通过 `docker run --entrypoint string` 在 `docker run 时替换 ENTRYPOINT` 

  - ```sh
    # --entrypoint后面加命令，最后跟参数
    docker run -d --entrypoint tail nginx:v1.0 -f /etc/hosts
    ```

- 使用 CMD 要在 `docker run` 时重新写命令本身 然后在后面才能追加运行参数，而 ENTRYPOINT 可以 `docker run` 时无需重写命令就可以直接接受新参数

## 范例-1

```dockerfile
# 其实应该使用RUN判断curl命令是否存在，不存在则安装，存在则不安装
# vim Dockerfile
FROM centos:centos7.9.2009
ENTRYPOINT ["curl","-s","cip.cc"]


# docker build -t loadip:v2 .


# docker run loadip:v2 
IP	: 112.39.50.141
地址	: 中国  辽宁  葫芦岛
运营商	: 移动

数据二	: 辽宁省 | 移动

数据三	: 中国辽宁省葫芦岛市 | 移动

URL	: http://www.cip.cc/112.39.50.141


# 作为其参数了
# docker run loadip:v2 -I
HTTP/1.1 200 OK
Server: openresty
Date: Fri, 16 Dec 2022 15:38:25 GMT
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
Vary: Accept-Encoding
X-cip-c: H
```



## 范例-2

- 通过传入变量修改配置文件

### 构建镜像

```dockerfile
# tree .
.
├── data
│   └── index.html
├── Dockerfile
└── entrypoint.sh

# cat data/index.html 
website page

# cat Dockerfile 
FROM nginx:1.23
LABEL author="JamesAzheng"
ENV NGX_ROOT="/data/html/"
ADD data/ ${NGX_ROOT}
ADD entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"] 
CMD ["nginx", "-g", "daemon off;"] # CMD 的指令都会成为 ENTRYPOINT 的参数
EXPOSE 80

# cat entrypoint.sh 
#!/bin/bash
cat > /etc/nginx/conf.d/website.conf << EOF
server {
    listen ${NGX_LISTEN_IP:-0.0.0.0}:${NGX_LISTEN_PORT:-80};
    server_name ${NGX_SERVER_NAME};

    location / {
        root ${NGX_ROOT};
        index index.html;
    }
}
EOF

exec "$@" # 相当于接受CMD的参数后执行 nginx -g daemon off;


# docker build -t website:v6 .
```

#### exec 命令特点

- 不会再开启子进程执行，而是再当前进程直接执行

```sh
# 正常执行会在当前shell中生成一个子进程
# sleep 100
bash(6369)───sleep(6760)


# 使用exec执行的时候会将当前shell替换成执行的程序，并保留PID，最后执行完毕的时候会退出当前进程(退出终端)
# exec sleep 100
sleep(6369)
```



### 传入变量测试-1

- 仅传入主机名

```bash
# docker run -d --name nginx -e NGX_SERVER_NAME=azheng.com  website:v6

# docker ps -a
CONTAINER ID   IMAGE        COMMAND                  CREATED              STATUS              PORTS     NAMES
5c3789120356   website:v6   "/entrypoint.sh ngin…"   About a minute ago   Up About a minute   80/tcp    nginx

# docker exec -it nginx bash

# curl 127.0.0.1
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...


# curl -H Host:azheng.com 127.0.0.1
website page


# cat /etc/nginx/conf.d/website.conf 
server {
    listen 0.0.0.0:80;
    server_name azheng.com;

    location / {
        root /data/html/;
        index index.html;
    }
}


# env
HOSTNAME=5c3789120356
NGX_ROOT=/data/html/
PWD=/
NGX_SERVER_NAME=azheng.com
PKG_RELEASE=1~bullseye
HOME=/root
NJS_VERSION=0.7.9
TERM=xterm
SHLVL=1
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
NGINX_VERSION=1.23.3
_=/usr/bin/env
```

### 传入变量测试-2

- 传入主机名和端口

```bash
# docker run -d --name nginx -e NGX_SERVER_NAME=xiangzheng.com -e NGX_LISTEN_PORT=68 website:v6

# 此处 PORTS 显示 80/tcp 因为只和 Dockerfile 中定义的 EXPOSE 80 有关
# docker ps -a
CONTAINER ID   IMAGE        COMMAND                  CREATED         STATUS         PORTS     NAMES
9d857669d871   website:v6   "/entrypoint.sh ngin…"   4 seconds ago   Up 4 seconds   80/tcp    nginx


# docker exec -it nginx bash

# curl 127.0.0.1
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...


# curl -H Host:xiangzheng.com 127.0.0.1
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...


# curl -H Host:xiangzheng.com 127.0.0.1:68
website page


# cat /etc/nginx/conf.d/website.conf 
server {
    listen 0.0.0.0:68;
    server_name xiangzheng.com;

    location / {
        root /data/html/;
        index index.html;
    }
}


# env
HOSTNAME=9d857669d871
NGX_ROOT=/data/html/
NGX_LISTEN_PORT=68
PWD=/
NGX_SERVER_NAME=xiangzheng.com
PKG_RELEASE=1~bullseye
HOME=/root
NJS_VERSION=0.7.9
TERM=xterm
SHLVL=1
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
NGINX_VERSION=1.23.3
_=/usr/bin/env
```



# ---





# VOLUME 匿名卷

- 默认容器删除后容器内的数据也会被删除，并且在容器下次启动后数据也不会恢复。

- 而 VOLUME 可以在容器中创建一个从本地主机或其他容器挂载的挂载点，一般用来存放数据库和需要保持的数据等，一般会将宿主机上的目录挂载至VOLUME指令指定的容器目录。即使容器后期被删除，此宿主机的目录仍会保留，从而实现容器数据的持久保存

  - ```sh
    # 宿主机目录为：
    /var/lib/docker/volumes/<volume_id>/_data
    ```

- **VOLUME 只是为了将容器内某个路径确定为卷，以确保容器运行时不向容器内部写入数据**

## VOLUME 语法

```html
VOLUME <容器内路径>
VOLUME ["<容器内路径1>","<容器内路径2"...]
```

## 注意事项

- dockerfile中 的 VOLUME 实现的是匿名数据卷，无法指定宿主机路径和容器目录的挂载关系
- 通过`docker rm -fv <容器ID>` 可以删除容器的同时删除VOLUME指定的卷

## 范例

- 在容器创建两个/data1，/data2的挂载点

```dockerfile
# vim Dockerfile
ARG  CODE_VERSION=stable
FROM busybox:${CODE_VERSION}
VOLUME [ "/data1", "/data2" ]
CMD ["tail", "-f", "/etc/hosts"]

# docker build -t busybox:v4 .


---------------------------------

# docker run -d --name busybox busybox:v4

# 出现了两个匿名卷
# ls /var/lib/docker/volumes
8ce8030fcc0a1858059f531783e3c77175f2e887f3c7abcb7d0a62f207e1a40b  backingFsBlockDev
99e28ec5f3a00d8b402c75357d43afd5bafd479d7a7fafbda7ed8f1a9bc7e41b  metadata.db
# docker volume ls
DRIVER    VOLUME NAME
local     8ce8030fcc0a1858059f531783e3c77175f2e887f3c7abcb7d0a62f207e1a40b
local     99e28ec5f3a00d8b402c75357d43afd5bafd479d7a7fafbda7ed8f1a9bc7e41b


# 拷贝文件
# docker exec -it busybox sh
/ # cp /etc/passwd /data1/
/ # cp /etc/group /data2/


# 验证
# tree /var/lib/docker/volumes
/var/lib/docker/volumes
├── 8ce8030fcc0a1858059f531783e3c77175f2e887f3c7abcb7d0a62f207e1a40b
│   └── _data
│       └── group
├── 99e28ec5f3a00d8b402c75357d43afd5bafd479d7a7fafbda7ed8f1a9bc7e41b
│   └── _data
│       └── passwd
├── backingFsBlockDev
└── metadata.db
# docker system df
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          19        1         902.2MB   902.2MB (100%)
Containers      1         1         89B       0B (0%)
Local Volumes   2         2         646B      0B (0%) # 以占用646B的空间
Build Cache     0         0         0B        0B


# 删除容器后只要不明确指定删除卷，那么卷会一直存在
# docker rm `docker ps -aq` -f
4be9c799e5e0
# tree /var/lib/docker/volumes
/var/lib/docker/volumes
├── 8ce8030fcc0a1858059f531783e3c77175f2e887f3c7abcb7d0a62f207e1a40b
│   └── _data
│       └── group
├── 99e28ec5f3a00d8b402c75357d43afd5bafd479d7a7fafbda7ed8f1a9bc7e41b
│   └── _data
│       └── passwd
├── backingFsBlockDev
└── metadata.db

---------------------------------

# 另启容器后因为没有明确指定之前的匿名卷，因此不会有数据
# docker run -d --name busybox busybox:v4
# docker exec -it busybox sh
/ # ls /data1/
/ # ls /data2/

# 出现新的匿名卷
# tree /var/lib/docker/volumes
/var/lib/docker/volumes
├── 1ddb5123bbfca0f593e46318974dfa94e56a7116b73ea09ddc0d3cc3a5c131d4
│   └── _data
├── 8ce8030fcc0a1858059f531783e3c77175f2e887f3c7abcb7d0a62f207e1a40b
│   └── _data
│       └── group
├── 99e28ec5f3a00d8b402c75357d43afd5bafd479d7a7fafbda7ed8f1a9bc7e41b
│   └── _data
│       └── passwd
├── 9fbc12795e7b89287ff83629cf0467e6d6dc674ac254fce0661b66c056491b7b
│   └── _data
├── backingFsBlockDev
└── metadata.db
# docker volume ls
DRIVER    VOLUME NAME
local     1ddb5123bbfca0f593e46318974dfa94e56a7116b73ea09ddc0d3cc3a5c131d4
local     8ce8030fcc0a1858059f531783e3c77175f2e887f3c7abcb7d0a62f207e1a40b
local     9fbc12795e7b89287ff83629cf0467e6d6dc674ac254fce0661b66c056491b7b
local     99e28ec5f3a00d8b402c75357d43afd5bafd479d7a7fafbda7ed8f1a9bc7e41b

```






# EXPOSE 暴露端口

- 指定服务端的容器需要对外暴露(监听)的端口号，以实现容器与外部通信。
- **RXPOSE 仅仅是声明容器打算使用什么端口而已**，并不会真正暴露端口，即不会自动在宿主机进行端口映射 因此，在启动容器时需要通过 -P 或 -p docker 主机才会真正分配一个端口转发到指定暴露的端口才可使用
- **即使 Dockerfile 没有EXPOSE端口指令，也可以通过docker run -p 临时暴露容器内程序真正监听的端口，所以 EXPOSE 相当于指定默认的暴露端口**
  - 容器自身没有监听的端口也可以映射

## EXPOSE 格式

```dockerfile
# protocol用于指定传输协议，可为tcp或udp二选一，默认为tcp协议
EXPOSE <port>[/<protocol>] <port>[/<protocol>] ...

# 范例：
EXPOSE 80 443

EXPOSE 11211/udp 11211/tcp
```

## 范例

### 未暴露端口前

```dockerfile
# vim Dockerfile
ARG  CODE_VERSION=stable
FROM busybox:${CODE_VERSION}
CMD ["tail", "-f", "/etc/hosts"]
# docker build -t busybox:v5 .
# docker run -dP --name busybox busybox:v5

# PORTS处为空
# docker ps -a
CONTAINER ID   IMAGE        COMMAND                CREATED         STATUS         PORTS     NAMES
a8934b936b4c   busybox:v5   "tail -f /etc/hosts"   3 seconds ago   Up 2 seconds             busybox
root@gitlab-server:/test# 

# 因为没有定义EXPOSE，所以docker run -P 无法映射随机端口
# docker port busybox


# 但可以使用-p来手动进行映射（666为宿主机对外端口，888为容器内部端口（容器自身没有监听的端口也可以映射））
# docker run -d -p 666:888 --name busybox02 busybox:v5
# docker port busybox02 
888/tcp -> 0.0.0.0:666
888/tcp -> :::666
# docker exec busybox netstat -ntl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       
```

### 暴露端口后

```dockerfile
# vim Dockerfile
ARG  CODE_VERSION=stable
FROM busybox:${CODE_VERSION}
CMD ["tail", "-f", "/etc/hosts"]
EXPOSE 666
# docker build -t busybox:v6 .
# docker run -dP --name busybox busybox:v6

# PORTS处会显示暴露的端口
# docker ps -a
CONTAINER ID   IMAGE        COMMAND                CREATED         STATUS         PORTS     NAMES
dbb31839fdeb   busybox:v6   "tail -f /etc/hosts"   6 seconds ago   Up 4 seconds   666/tcp   busybox

# 因为定义了EXPOSE，所以docker run -P 可以为EXPOSE映射随机对外端口
# docker port busybox
666/tcp -> 0.0.0.0:49153
666/tcp -> :::49153


# 容器自身没有监听的端口也可以使用EXPOSE进行暴露，因为EXPOSE只起到声明的作用
# docker exec busybox netstat -ntl
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       
```




# WORKDIR 指定工作目录

- WORKDIR 指定工作目录（或称当前目录），为后续的 RUN、CMD、ENTRYPOINT 指令配置工作目录（以后各层的当前目录就被改为指定的目录）；当容器运行后，进入容器内显示的当前目录为 WORKDIR 指定的默认目录
- WORKDIR 指定的目录如果不存在，则会自动创建。

## WORKDIR 语法

```dockerfile
WORKDIR /path
```

### 范例

```dockerfile
# 两次RUN独立运行，不在同一个目录
RUN cd /etc
RUN echo "hello" > world.txt

# 如果想实现相同目录可以使用WORKDIR
WORKDIR /etc
RUN echo "hello" > world.txt

# 可以使用多个WORKDIR指令，后续命令如果参数是相对路径，则会基于之前命令指定的路径。下面范例的最终路径为/a/b/c
WORKDIR /a
WORKDIR b
WORKDIR c
```

## 范例-1

```dockerfile
# 两次RUN独立运行，不在同一个目录
# vim Dockerfile
ARG  CODE_VERSION=stable
FROM busybox:${CODE_VERSION}
RUN cd /etc
RUN echo "hello" > world.txt
CMD ["tail", "-f", "/etc/hosts"]

# docker build -t busybox:v7 .
# docker run -d --name busybox busybox:v7
# docker exec -it busybox sh
/ # pwd
/
/ # cat /etc/world.txt
cat: can't open '/etc/world.txt': No such file or directory
/ # cat /world.txt 
hello


-----------------------------------------------------------------------------

# 使用WORKDIR
# vim Dockerfile
ARG  CODE_VERSION=stable
FROM busybox:${CODE_VERSION}
WORKDIR /etc
RUN echo "hello" > world.txt
CMD ["tail", "-f", "/etc/hosts"]

# docker build -t busybox:v8 .
# docker run -d --name busybox busybox:v8
# docker exec -it busybox sh
/etc # pwd
/etc
/etc # cat /etc/world.txt
hello
```





# ONBUILD 子镜像引用父镜像的指令 

- 可以用来配置当构建当前镜像时的子镜像时，会自动触发执行的指令，但在当前镜像构建时，并不会执行，即延迟到子镜像构建时才执行

## ONBUILD 格式

```dockerfile
# 假设A镜像定义了此内容，则在B镜像引用A镜像时会触发以下定义的内容
ONBUILD [INSTRUCTION]
```



# USER 指定当前用户

- 指定运行容器时的用户名或UID，后续的RUN也会使用指定用户
- 当服务不需要管理员权限时，可以通过该命令指定运行用户
- **这个用户必须是实现建立好的，否则无法切换**
- **如果没有指定USER，默认是root身份运行**

## USER 格式

```dockerfile
USER <user>[:<group>]
USER <UID>[:GID]
```

## 范例

```dockerfile
RUN groupadd -r mysql && useradd -r -g mysql mysql
USER mysql
```




# HEALTHCHECK 健康检查

- 检查容器的健康性
- Dockerfile中只能有一条HEALTHCHECK指令。如果您列出多个，则只有最后一个HEALTHCHECK才会生效。
- 当容器的健康状态发生变化时，health_status会生成一个带有新状态的事件。

## HEALTHCHECK 格式

```dockerfile
HEALTHCHECK [OPTIONS] CMD command # 通过在容器内运行命令检查容器运行状况
HEALTHCHECK NONE # 禁用从基础镜像继承的任何运行状况检查

# [OPTIONS]说明：
--interval=<间隔> # 两次检测的间隔时长，默认30s，即每30s检测一次
--timeout=<时长> # 检测超时时长，默认30s，即检查命令超出30s无响应则认为失败
--retries=<次数> # 检测次数，默认3次，即检测3次失败即成立 则编程unhealthy状态
--start-period=DURATION # 默认0s，

# 容器状态说明：
starting # 最初状态
healthy # 检查通过后的状态
unhealthy # 连续失败一定次数后的状态

# 容器退出状态值
0 # 成功 - 容器健康且可以使用
1 # 不健康 - 容器工作不正常
2 # 保留 - 不要使用此退出代码
```

## 范例：

```dockerfile
# 每隔五分钟左右检查一次网络服务器是否能够在三秒内为网站的主页提供服务
HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```



# STOPSIGNAL 退出容器的信号 

- 设置将被发送到容器退出的系统调用信号

## STOPSIGNAL 格式

```dockerfile
# signal可以为信号字母缩写，也可以为信号对应的数字，例如：9和SIGKILL都可以
STOPSIGNAL signal
```



# SHELL 指定shell

- 指定shell，Linux下不指定则默认为`/bin/sh`，一般可不加，只有在`/bin/sh`无法执行命令时需要加
- SHELL 指令可以出现多次，每个 SHELL 指令将覆盖先前所有的 SHELL 指令，并影响所有后续的指令。

## SHELL 格式

```sh
SHELL ["/bin/bash", "-c"]

# 例如：
SHELL ["/bin/bash", "-c"]
```



## 范例

- sh无法执行相关命令，使用SHELL更换成bash来执行

```bash
# 最初的Dockerfile
FROM ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
ADD jdk-8u311-linux-x64.tar.gz /apps/
ADD jdk.sh /etc/profile.d/
RUN ln -s /apps/jdk1.8.0_311 /apps/jdk && source /etc/profile.d/jdk.sh
ENV JAVA_HOME=/apps/jdk \
    PATH=${JAVA_HOME}/bin/:${PATH} \
    JRE_HOME=${JAVA_HOME}/jre \
    CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/
ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]


# 构建失败
...
/bin/sh: 1: source: not found # 默认为sh，但sh无法执行source命令
Removing intermediate container 314f446bee51
The command '/bin/sh -c ln -s /apps/jdk1.8.0_311 /apps/jdk && source /etc/profile.d/jdk.sh' returned a non-zero code: 127

-----------------------------------------------------------------

# 加上SHELL，使用 bash shell
FROM ubuntu-20.04-base:1.0
LABEL version="1.0" \
      maintainer="azheng <767483070@qq.com>"
SHELL ["/bin/bash", "-c"] # 添加bash shell
ADD jdk-8u311-linux-x64.tar.gz /apps/
ADD jdk.sh /etc/profile.d/
RUN ln -s /apps/jdk1.8.0_311 /apps/jdk && source /etc/profile.d/jdk.sh
ENV JAVA_HOME=/apps/jdk \
    PATH=${JAVA_HOME}/bin/:${PATH} \
    JRE_HOME=${JAVA_HOME}/jre \
    CLASSPATH=${JAVA_HOME}/lib/:${JRE_HOME}/lib/
ENTRYPOINT ["/usr/bin/tail","-f","/etc/hosts"]

#构建成功
...
Successfully built 6ead6b913457
Successfully tagged oracle-jdk-8-ubuntu-20.04:1.0
```







