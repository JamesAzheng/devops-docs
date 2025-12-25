---
title: "Systemd"
---

# Systemd 概述

从 CentOS 7 版本之后开始用 systemd 实现init进程，系统启动和服务器守护进程管理器，负责在系统启动或运行时，激活系统资源，服务器进程和其它进程

Systemd 是一个系统初始化和管理守护进程的工具套件，广泛用于现代 Linux 发行版中，如 CentOS/RHEL 7+、Ubuntu 15.04+、Fedora 15+、Debian 8+ 等。

systemd 是一个在 Linux 操作系统中广泛采用的初始化系统（init system），它负责启动和管理系统中的各个服务、进程和资源。它是 Linux 发行版中的一个核心组件，用于替代传统的 init 系统（如 SysV init），并提供了更加强大和灵活的功能。

systemd 提供了一套工具和服务，用于启动、停止、管理和监控系统中的服务单元（units），包括系统服务、用户服务、设备、套接字等。它使用配置文件和单元描述符来定义和管理这些服务单元，这些描述符通常位于 `/etc/systemd/system/` 目录或者 `/usr/lib/systemd/system/` 目录中。

除了作为初始化系统外，systemd 还提供了很多其他功能，例如：

1. 服务管理：systemd 可以启动、停止、重启和管理系统服务，提供了对服务的控制和监视。
2. 启动顺序管理：systemd 通过并行启动和按需启动的机制，优化了系统的启动时间。
3. 依赖关系管理：systemd 可以定义服务之间的依赖关系，确保服务按正确的顺序启动和停止。
4. 日志管理：systemd 提供了 journald 服务来收集、存储和检索系统日志，方便日志的查看和分析。
5. 用户会话管理：systemd 可以管理用户会话，提供用户级别的服务和资源控制。
6. 定时任务管理：systemd 可以管理定时任务，类似于 cron 任务，通过 timer 单元实现。
7. 系统状态监控：systemd 提供了一系列的命令和工具，用于监控系统状态、性能和资源使用情况。

总而言之，systemd 是一个功能强大的初始化系统和服务管理器，为 Linux 系统提供了一整套管理和控制服务的机制和工具。





# Systemd 特性

- 系统引导时实现服务并行启动
- 按需启动守护进程
- 自动化的服务依赖关系管理
- 同时采用socket式与D-Bus总线式激活服务
- socket与服务程序分离
- 向后兼容sysv init脚本
- 使用 systemctl 命令管理，systemctl命令固定不变，不可扩展，非由systemd启动的服务，systemctl无法与之通信和控制
- 系统状态快照





# Systemd Unit

Systemd Unit 是一种用于在 Linux 系统中管理系统服务的配置文件。

在 Systemd 中，每个服务或任务都被表示为一个 Unit。Unit 文件定义了一个服务的配置和行为，包括服务的名称、描述、启动条件、依赖关系等。有多种类型的 Unit，包括 service、socket、target、device、mount、automount、timer 等。

每个 service Unit 文件都包含了启动、停止、重启等操作的命令，还可以指定服务启动的条件和依赖关系。

通过 systemd 的管理，可以轻松地启动、停止、重启、查看状态和日志等。

## Unit 类型

查看可用的 unit 类型：`systemctl -t help`

帮助参考：

- systemd.directives（7）
- systemd.unit(5)
- systemd.service(5)
- systemd.socket(5)
- systemd.target(5)
- systemd.exec(5)

```sh
*.service # 最常见的 Unit 类型是 service，它用于管理常驻后台运行的服务程序。

*.socket # 定义进程间通信用的socket文件（socket文件一般定义了IP地址端口号等信息），也可在系统启动时，延迟启动服务，实现按需启动

*.target # 用于模拟实现运行级别

*.device # 用于定义内核识别的设备

*.mount # 定义文件系统挂载点

*.snapshot # 管理系统快照

*.swap # 用于标识swap设备

*.automount # 文件系统的自动挂载点

*.path # 用于定义文件系统中的一个文件或目录使用,常用于当文件系统变化时，延迟激活服务，如：spool 目录
```





## Unit 文件存放位置

```bash
/usr/lib/systemd/system/ # 每个服务最主要的启动脚本设置

/lib/systemd/system/ # ubutun的对应目录，centos也可以访问 因为/usr/lib和/lib是软连接关系

/run/systemd/system/ # 系统执行过程中所产生的服务脚本，比上面目录优先运行

/etc/systemd/system/ # 管理员建立的执行脚本，比上面目录优先运行
```



Systemd Unit 文件通常位于以下目录：

-  `/etc/systemd/system/`（系统管理员和用户使用）
-  `/usr/lib/systemd/system/` （发行版打包者使用）



Systemd Unit 文件的存放位置可以分为两个主要目录：

1. 系统级别目录：这些 Unit 文件适用于整个系统，通常由系统管理员或发行版提供者管理。主要目录包括：
   - `/etc/systemd/system/`：这个目录包含了用户自定义的 Systemd Unit 文件。在这里创建的 Unit 文件优先级高于其他目录中的同名文件，可以用于自定义系统服务或添加自定义的配置。
   - `/usr/lib/systemd/system/`：这个目录包含了发行版或软件包提供的 Systemd Unit 文件。这些 Unit 文件通常不应被直接编辑，因为它们属于软件包管理系统的一部分，可能会在软件包升级时被替换或更新。
2. 用户级别目录：这些 Unit 文件仅适用于特定用户，通常用于用户自己的服务或任务。主要目录包括：
   - `~/.config/systemd/user/`：这个目录是用于存放用户自定义的 Systemd Unit 文件的位置。用户可以在这里创建 Unit 文件，只对当前用户生效，并且优先级高于系统级别的同名文件。

在这些目录中，可以放置各种类型的 Systemd Unit 文件，例如 service、socket、target、device、mount、automount、timer 等。文件的后缀名通常为 ".service"、".socket"、".target" 等，具体取决于 Unit 类型。

请注意，修改或创建 Systemd Unit 文件需要管理员权限。对于系统级别的 Unit 文件，你需要以管理员身份登录，而对于用户级别的 Unit 文件，则不需要管理员权限。确保在修改这些文件时谨慎操作，因为不正确的配置可能导致系统服务无法正常启动或导致其他问题。



## Unit 组成部分

**Unit 文件通常由三部分组成：**

- `[Unit]`：定义与 Unit 类型无关的通用选项；用于提供 Unit 的描述信息、行为、依赖关系等。
- `[Service]`：与特定类型相关的专用选项；此处为 Service 类型，另外还有可能是 socket 类型。
- `[Install]`：定义由 `systemctl enable  `以及 `systemctl disable` 命令在实现服务启用或禁用时用到的一些选项，该字段定义如何安装这个配置文件，即怎样做到开机自启。

**其他说明：**

- 以 “#” 开头的行后面的内容会被认为是注释
- 相关布尔值：
  - 1、yes、on、true 都是开启
  - 0、no、off、false 都是关闭

- 时间单位默认是秒，所以要用毫秒（ms）分钟（m）等须显式说明





## [Unit]

在 Systemd Unit 文件的 `[Unit]` 段中，常用的选项用于描述 Unit 的基本属性和依赖关系。以下是一些常用的 `[Unit]` 段选项：

### Description

- 描述信息
- 用于描述该 Unit 的简要说明或人类可读的描述信息。

```ini
[Unit]
Description=Postfix Mail Transport Agent
```

### Documentation

- 可选选项，用于提供关于该 Unit 的文档链接或路径。

### Before / After

- **只是声明作用吗？？？？即使指定的服务未启动，该程序也能正常启动？？？？？**
- 用于指定 Unit 的启动顺序。`Before` 表示该 Unit 应该在指定的 Units 之前启动，而 `After` 表示该 Unit 应该在指定的 Units 之后启动。

```ini
[Unit]
# 当这些unit启动后才再启动当前unit
After=syslog.target network.target
```

在 Systemd Unit 文件的 `[Unit]` 段中，`Before` 和 `After` 是用于指定 Unit 启动顺序的选项。

1. `Before`：

   - 通过在一个 Unit 文件的 `[Unit]` 段中使用 `Before` 选项，你可以指定该 Unit 应该在哪些其他 Units 之前启动。这意味着，如果该 Unit 准备好要启动，但在 `Before` 中指定的 Units 还没有启动，Systemd 将等待这些 Units 启动后才会启动该 Unit。

   - 例如，假设有一个名为 "myapp.service" 的服务，你想确保 "network.target" 启动后再启动 "myapp.service"。你可以在 "myapp.service" 的 Unit 文件中使用 `Before` 来指定：

     ```
     makefileCopy code[Unit]
     Description=My App Service
     Before=network.target
     ```

2. `After`：

   - 通过在一个 Unit 文件的 `[Unit]` 段中使用 `After` 选项，你可以指定该 Unit 应该在哪些其他 Units 之后启动。这意味着，如果 `After` 中指定的 Units 已经启动，Systemd 将等待这些 Units 启动后才会启动该 Unit。

   - 例如，假设有一个名为 "myapp.service" 的服务，你希望在 "network.target" 启动后再启动 "myapp.service"。你可以在 "myapp.service" 的 Unit 文件中使用 `After` 来指定：

     ```
     makefileCopy code[Unit]
     Description=My App Service
     After=network.target
     ```

`Before` 和 `After` 是相对的关系，意味着你可以在多个 Unit 文件中使用它们，以指定它们之间的启动顺序。Systemd 将根据这些关系来处理启动顺序，以确保 Units 在正确的时间启动，并满足其它依赖关系。

需要注意的是，`Before` 和 `After` 选项只影响启动顺序，并不会自动处理其他 Unit 之间的依赖关系。如果需要明确指定 Unit 之间的依赖关系，请使用 `Requires`、`Wants`、`PartOf` 等选项来定义更细粒度的依赖关系。



### Conflflicts

- 定义units间的冲突关系

```ini
[Unit]
# 与这两个unit冲突
Conflicts=sendmail.service exim.service
```

### Requires

- 依赖到的其它units，强依赖，被依赖的units无法激活时，当前unit也无法激活
- 指定该 Unit 启动所依赖的其他 Units，如果被依赖的 Unit 没有启动，该 Unit 将无法启动。与之相似的选项还有 `Wants` 和 `BindsTo`。

### Wants

- 依赖到的其它units，弱依赖







1. 
2. 
3. 
4. `RequiresMountsFor`: 指定该 Unit 需要的文件系统挂载点。如果指定的挂载点没有挂载，该 Unit 将无法启动。
5. `Conflicts`: 指定该 Unit 与其他 Units 的冲突关系。如果指定的 Units 启动了，该 Unit 将无法启动。
6. `PartOf`: 指定该 Unit 是一个更大 Unit 的一部分，如它所依赖的服务。当主 Unit 停止时，PartOf 中指定的 Unit 也会停止。
7. `OnFailure`: 指定该 Unit 在失败时应该做出的动作，例如启动其他服务。
8. `IgnoreOnIsolate`: 指定该 Unit 在隔离模式下应该被忽略，隔离模式是 Systemd 的一种特殊运行级别。

这些选项是 `[Unit]` 段中常见的一些选项，它们用于定义 Unit 之间的依赖关系、启动顺序和行为。每个选项的具体用法可以在 Systemd 官方文档中找到详细的说明。



## [Service]

在 Systemd Unit 文件的 `[Service]` 段中，有许多常用的选项用于定义服务的行为、启动方式和资源管理等。以下是一些常用的 `[Service]` 段选项：

### Type

指定服务的类型，常见的类型有：

- `simple`: 默认类型，表示服务是一个简单的、常驻后台运行的进程。
- `oneshot`: 表示服务只会执行一次，当服务执行完成后，Systemd 认为服务已经停止。
- `dbus`: 表示服务是一个 D-Bus 服务。
- `notify`: 表示服务在准备好接受请求时通过向 Systemd 发送信号来通知它。

定义影响ExecStart及相关参数的功能的unit进程启动类型

- **simple**：**默认值 不添加Type即默认此值**，这个daemon主要由ExecStart接的指令串来启动，启动后常驻于内存中
- **idle**：与simple类似，要执行这个daemon必须要所有的工作都顺利执行完毕后才会执行。这类的daemon通常是开机到最后才执行即可的服务 
- **dbus**：与simple类似，但这个daemon必须要在取得一个D-Bus的名称后，才会继续运作.因此通常也要同时设定BusNname= 才行
- **oneshot**：与simple类似，不过这个程序在工作完毕后就结束了，不会常驻在内存中
- **notify**：在启动完成后会发送一个通知消息。还需要配合 NotifyAccess 来让 Systemd 接收消息

`Type` 是 Systemd Unit 文件中的一个选项，用于定义服务的类型。`Type` 选项指定了服务的启动方式以及 Systemd 如何管理该服务。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `Type` 设置为以下几种类型之一：

1. `simple`：默认类型。对于简单的、不需要 Fork 的服务。Systemd 将启动服务，并认为服务启动完成，只要 `ExecStart` 中的命令成功启动并返回。
2. `oneshot`：对于只执行一次任务的服务。Systemd 将执行一次 `ExecStart` 中的命令，然后认为服务完成并退出。
3. `notify`：对于使用进程间通信进行通知的服务。Systemd 期望在 `ExecStart` 中启动的服务通过发送通知（例如向 Systemd 发送信号）告知服务启动完成。适用于某些需要较长启动时间的服务，用来通知 Systemd 服务已准备好。
4. `dbus`：用于监听 D-Bus 事件的服务。类似于 `notify` 类型，但适用于监听 D-Bus 事件的服务。
5. `idle`：用于延迟启动的服务。服务在所有活动作业完成后才会启动，用于服务启动后无需立即运行的情况。

需要根据你的服务的实际需求来选择适当的 `Type` 类型。对于简单的服务，一般使用 `simple` 类型即可。对于需要 Fork 或长时间启动的服务，可能需要选择 `forking` 或 `notify` 类型。而对于只执行一次任务的服务，可以使用 `oneshot` 类型。



#### forking

- 指定这种类型后，服务可以定义为后台运行，不需要前台运行也能正常启动。
- 表示服务会创建一个子进程，父进程会立即退出，子进程在后台运行。
- 由ExecStart启动的程序透过spawns延伸出其他子程序来作为此daemon的主要服务。原生父程序在启动结束后就会终止
- 对于需要 Fork 的服务。Systemd 将启动服务，并等待 `ExecStart` 中的命令启动服务的守护进程。Systemd 会监测服务的主进程 PID 是否存在，从而判断服务启动是否成功。注意，`forking` 类型的服务应该在 `ExecStart` 中启动后立即 fork 出守护进程，并且主进程应该在后台运行。





### ExecStartPre

ExecStart前运行

`ExecStartPre` 是 Systemd Unit 文件中的一个选项，用于定义在启动服务之前执行的命令或脚本。通过设置 `ExecStartPre`，你可以在正式启动服务之前执行一些预处理操作。

在 Systemd Unit 文件的 `[Service]` 段中，可以使用 `ExecStartPre` 来指定需要在服务正式启动前执行的命令或脚本。这些预处理命令通常用于检查、准备或初始化服务所需的资源和环境。

例如：

```ini
[Service]
Type=simple
ExecStartPre=/path/to/pre_start_script
ExecStart=/path/to/your/service
```

在上述例子中，`ExecStartPre` 设置为 `/path/to/pre_start_script`，表示在正式启动服务之前，Systemd 会先执行 `/path/to/pre_start_script` 脚本来进行预处理操作。

需要注意的是，`ExecStartPre` 中的命令或脚本会在服务启动之前同步执行，并且必须成功完成（返回退出状态码 0）才能继续执行正式的启动命令 `ExecStart`。如果 `ExecStartPre` 中的命令执行失败，Systemd 将不会继续启动服务，并且会记录相关错误信息。

使用 `ExecStartPre` 可以在服务启动前进行一些必要的准备工作，比如检查配置文件是否存在、检查依赖服务是否已经启动等。这有助于确保服务启动所需的条件和环境是符合要求的，从而提高服务的可靠性和稳定性。



### ExecStart

指明启动unit要运行命令或脚本的绝对路径

- 指定服务的启动命令和参数，可以是一个命令或一个包含多个命令的脚本。

`ExecStart` 是 Systemd Unit 文件中的一个选项，用于定义服务启动时执行的命令或脚本。通过设置 `ExecStart`，你可以指定在启动服务时要运行的命令或脚本，从而启动服务的进程。

在 Systemd Unit 文件的 `[Service]` 段中，`ExecStart` 是一个必要的选项，必须要定义服务的启动命令。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
```

在上述例子中，`ExecStart` 设置为 `/path/to/your/service`，表示在启动服务时，Systemd 会运行 `/path/to/your/service` 这个命令来启动服务的主进程。

需要注意的是，`ExecStart` 中的命令必须是非阻塞的，即该命令应该立即返回而不会一直占用执行线程。如果你的服务启动是一个长时间运行的命令，你可以考虑使用 `Type=oneshot` 或 `Type=notify` 等适当的服务类型，以确保 Systemd 能够正确处理服务的启动状态。

此外，如果你的服务启动后会继续运行并监听端口或进行其他工作，你需要确保服务在启动时正确设置了工作目录和用户权限，并避免因为权限问题或工作目录不正确而导致启动失败。

总之，`ExecStart` 是定义服务启动命令的重要选项，需要根据你的服务实际情况来设置正确的命令。





### ExecStartPost

 ExecStart后运行

`ExecStartPost` 是 Systemd Unit 文件中的一个选项，用于定义在启动服务之后执行的命令或脚本。通过设置 `ExecStartPost`，你可以在服务正式启动后执行一些后处理操作。

在 Systemd Unit 文件的 `[Service]` 段中，可以使用 `ExecStartPost` 来指定需要在服务正式启动后执行的命令或脚本。这些后处理命令通常用于服务启动后的一些清理、通知或其他操作。

例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
ExecStartPost=/path/to/post_start_script
```

在上述例子中，`ExecStartPost` 设置为 `/path/to/post_start_script`，表示在正式启动服务后，Systemd 会执行 `/path/to/post_start_script` 脚本来进行后处理操作。

需要注意的是，`ExecStartPost` 中的命令或脚本会在服务启动之后异步执行，即服务启动后不会等待 `ExecStartPost` 的命令执行完毕。因此，`ExecStartPost` 中的命令不会影响服务的正常运行，即使命令执行失败，也不会影响已经启动的服务。

使用 `ExecStartPost` 可以在服务启动后执行一些附加操作，比如向日志中记录服务启动信息、发送通知或信号、启动其他辅助服务等。这有助于完成一些与服务启动相关的任务，同时保持服务进程的正常运行。



### ExecReload

- 指定重新加载服务时执行的命令和参数。

`ExecReload` 是 Systemd Unit 文件中的一个选项，用于定义在重新加载（reload）服务时执行的命令或脚本。重新加载是一种在不停止服务的情况下重新加载配置或重新启动服务的操作。

通过使用 `ExecReload`，你可以为服务定义重新加载配置或其他相关操作的命令。当你使用 Systemd 命令 `systemctl reload your-service` 时，Systemd 将根据 `ExecReload` 中定义的命令执行重新加载操作。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `ExecReload` 设置为执行的命令或脚本路径。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
ExecReload=/path/to/reload-script
```

在上述例子中，`ExecReload` 设置为 `/path/to/reload-script`，当执行 `systemctl reload your-service` 时，Systemd 将会执行 `/path/to/reload-script` 脚本来重新加载服务。

需要注意的是，`ExecReload` 只有在服务配置文件中支持重新加载时才会生效。并不是所有的服务都支持重新加载操作。有些服务可能需要完全停止后再重新启动才能加载新的配置或修改。

如果你的服务支持重新加载，并且你希望在重新加载时执行特定的操作，你可以在 `ExecReload` 中指定相应的脚本或命令。请确保脚本或命令能够正确地重新加载服务的配置，以避免出现问题。



### ExecStop

指明停止unit要运行的命令或脚本

`ExecStop` 是 Systemd Unit 文件中的一个选项，用于定义在停止服务时执行的命令或脚本。通过设置 `ExecStop`，你可以在停止服务时执行一些清理或善后操作。

在 Systemd Unit 文件的 `[Service]` 段中，可以使用 `ExecStop` 来指定需要在服务停止时执行的命令或脚本。这些命令通常用于在服务停止前做一些资源释放、数据保存或清理工作。

例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
ExecStop=/path/to/stop_script
```

在上述例子中，`ExecStop` 设置为 `/path/to/stop_script`，表示在停止服务时，Systemd 会执行 `/path/to/stop_script` 脚本来进行相关的清理操作。

需要注意的是，`ExecStop` 中的命令或脚本会在服务停止之前同步执行，并且必须成功完成（返回退出状态码 0）才能继续停止服务。如果 `ExecStop` 中的命令执行失败，Systemd 将会记录相关错误信息，但仍会继续停止服务。

使用 `ExecStop` 可以在服务停止前做一些必要的清理工作，比如保存数据、释放资源、发送信号通知其他服务等。这有助于确保在停止服务时，相关的资源得到正确释放，同时提高服务的稳定性和安全性。



### WorkingDirectory

- 指定服务的工作目录，服务会在该目录下启动。

`WorkingDirectory` 是 Systemd Unit 文件中的一个选项，用于设置服务的工作目录。工作目录是指在启动服务时，服务进程所处的当前目录。

通过设置 `WorkingDirectory`，你可以指定服务进程在启动时所处的目录。这对于某些服务可能需要在特定目录下工作的情况很有用，例如，某些服务依赖于特定的配置文件或数据文件在工作目录中。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `WorkingDirectory` 设置为服务所需的目录路径。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
WorkingDirectory=/path/to/working/directory
```

在上述例子中，`WorkingDirectory` 设置为 `/path/to/working/directory`，表示在启动服务时，服务进程将处于 `/path/to/working/directory` 目录中。

需要注意的是，如果不指定 `WorkingDirectory`，服务进程的工作目录默认为根目录（`/`）。因此，通过设置 `WorkingDirectory` 可以确保服务进程在启动时位于正确的目录下，从而避免可能因为缺少所需文件而导致的问题。

在选择 `WorkingDirectory` 时，要根据服务的实际需求来设置，确保服务可以正常访问所需的文件和配置，并在正确的目录中运行。如果服务需要读取或写入特定目录下的文件，需要确保服务对该目录有足够的访问权限。



### User / Group

- 指定服务的运行用户和用户组

`User` 和 `Group` 是 Systemd Unit 文件中的两个选项，用于设置服务运行的用户和用户组。通过指定 `User` 和 `Group`，你可以让服务以指定的用户和用户组身份来运行，增加服务的安全性和隔离性。

- `User`: 用于指定服务运行的用户名。你可以通过用户名来标识一个用户账户，服务将以该用户的身份来运行。例如：`User=myuser`。
- `Group`: 用于指定服务运行的用户组。你可以通过用户组名来标识一个用户组，服务将以该用户组的身份来运行。例如：`Group=mygroup`。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `User` 和 `Group` 设置为相应的用户名和用户组名。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
User=myuser
Group=mygroup
```

在上述例子中，服务将以 `myuser` 用户的身份运行，并且属于 `mygroup` 用户组。

使用 `User` 和 `Group` 可以使服务以非特权用户的身份运行，从而降低服务对系统的影响。这样做可以增加系统的安全性，因为服务的权限将被限制在指定的用户和用户组所拥有的权限范围内。

需要注意的是，在设置 `User` 和 `Group` 之前，请确保对应的用户和用户组已经存在于系统中。此外，某些服务可能需要特定的权限或文件访问权限，因此在选择用户和用户组时，请根据服务的需求进行适当的设置。如果服务需要访问某些文件或目录，还需要确保这些文件或目录对指定的用户和用户组可读、可写或可执行。





### Restart

当设定Restart=1 时，则当次daemon服务意外终止后，会再次自动启动此服务

- 指定服务的重新启动行为，常见的选项有：

  - `no`: 不重新启动服务，默认选项。

  - `always`: 无论何时服务终止，都会自动重新启动。

  - `on-failure`: 只有在服务以非零退出码终止时才会重新启动。

  - `on-abnormal`: 只有在服务以非正常方式终止时才会重新启动。

  - `on-success`: 只有在服务以零退出码终止时才会重新启动。

`Restart` 是 Systemd Unit 文件中的一个选项，用于设置服务在什么情况下进行自动重启。通过设置 `Restart`，你可以指定服务在什么条件下自动重启，以便在服务发生故障或异常停止时进行自动恢复。

`Restart` 选项的取值可以是以下几种：

- `no`: 不自动重启服务。如果服务停止或失败，Systemd 不会尝试自动重启该服务。
- `on-success`: 只在服务正常退出（退出状态为 0）时进行重启。
- `on-failure`: 只在服务非正常退出（退出状态不为 0）时进行重启。
- `on-abnormal`: 只在服务异常退出（例如被信号终止）时进行重启。
- `on-watchdog`: 只在服务超时（如果服务设置了 WatchdogSec）时进行重启。
- `always`: 总是尝试重启服务，无论服务是正常退出还是非正常退出。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `Restart` 设置为上述选项之一。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
Restart=always
```

在上述例子中，`Restart` 设置为 `always`，表示不管服务是正常退出还是非正常退出，Systemd 都会尝试自动重启该服务。

需要注意的是，使用自动重启可能会导致服务在短时间内频繁重启，如果服务存在严重的问题，可能会导致重启循环，降低系统的稳定性。因此，使用 `Restart` 选项时要谨慎，并根据服务的实际需求来选择适当的选项。

另外，如果使用 `Restart` 自动重启服务，建议结合 `RestartSec` 选项，来设置服务重启之间的延迟时间，以避免过于频繁的重启操作。

#### 如未定义

如果在一个 systemd service 文件中没有定义 `Restart=` 操作，但你使用 `systemctl restart` 命令来重启服务，系统会先停止服务 `ExecStop=xxx`，然后再启动服务`ExecStart=xxx`。





### RestartSec

- 指定重新启动服务之间的延迟时间（单位为秒）。

`RestartSec` 是 Systemd Unit 文件中的一个选项，用于设置服务重启之间的延迟时间。当服务由于某种原因停止后，Systemd 可能会根据 `Restart` 选项的设置尝试自动重新启动服务。`RestartSec` 就是用来指定在服务停止后多少秒之后再尝试重新启动服务。

通过设置 `RestartSec`，你可以控制服务重启的延迟，以避免在服务发生故障或异常停止后，立即尝试重新启动，从而降低对系统资源的压力。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `RestartSec` 设置为一个时间值，单位为秒。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
Restart=always
RestartSec=10
```

在上述例子中，`RestartSec` 设置为 10 秒，表示在服务停止后，Systemd 将等待 10 秒后再尝试重新启动服务。

需要注意的是，设置 `RestartSec` 只有在使用 `Restart` 选项时才会生效。`Restart` 选项决定了服务在何种情况下进行重启。常见的选项包括：

- `no`: 不自动重启服务。
- `on-failure`: 在服务退出状态不为 0 时（即非正常退出）尝试重启。
- `on-abnormal`: 在服务异常退出时（包括信号终止等）尝试重启。
- `on-watchdog`: 在服务超时时（如果服务设置了 WatchdogSec）尝试重启。
- `always`: 总是尝试重启服务。

因此，当设置 `Restart` 为 `always` 或其他选项时，`RestartSec` 才会生效。你可以根据服务的需求和性质来选择适当的 `Restart` 选项和 `RestartSec` 值，以达到你期望的重启行为。







### TimeoutStartSec

- 指定服务启动的超时时间（单位为秒）。

`TimeoutStartSec` 是 Systemd Unit 文件中的一个选项，用于设置服务启动的超时时间。当 Systemd 启动一个服务时，如果服务没有在指定的超时时间内启动完成，Systemd 将认为启动失败，并可能采取进一步的措施，例如重新启动或标记服务为启动失败。

通过设置 `TimeoutStartSec`，你可以控制在启动服务时等待的最长时间。这是为了避免某些服务因为某种原因而无法正常启动，从而影响了系统的启动过程。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `TimeoutStartSec` 设置为一个时间值，单位为秒。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
TimeoutStartSec=60
```

在上述例子中，`TimeoutStartSec` 设置为 60 秒，即在启动服务时，Systemd 会等待最多 60 秒来等待服务启动完成，如果服务在 60 秒内没有启动完成，Systemd 将认为启动失败。

需要注意的是，设置 `TimeoutStartSec` 可以保证在服务启动时能够及时检测到问题，避免长时间的等待造成系统启动延迟。然而，对于某些复杂的服务或者在启动时需要较长时间初始化的服务，可能需要适当增加 `TimeoutStartSec` 的值，以确保服务有足够的时间来完成启动过程。

需要根据你的服务的实际情况来选择合适的启动超时时间。对于一些耗时的操作，你还可以考虑使用 `Type=notify` 或 `Type=oneshot` 等更适合的 `Type` 类型来通知 Systemd 服务启动的完成状态。



### TimeoutStopSec

- 指定服务停止的超时时间（单位为秒）。

`TimeoutStopSec` 是 Systemd Unit 文件中的一个选项，用于设置服务停止的超时时间。当服务被要求停止时，Systemd 会等待一段时间来等待服务自行停止，如果在指定的超时时间内服务没有正常停止，Systemd 将强制终止该服务。

通过设置 `TimeoutStopSec`，你可以控制在停止服务时等待的最长时间。这是为了防止某些服务因为某种原因而无法正常停止，从而阻塞了后续的操作。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `TimeoutStopSec` 设置为一个时间值，单位为秒。例如：

```
makefileCopy code[Service]
Type=simple
ExecStart=/path/to/your/service
TimeoutStopSec=30
```

在上述例子中，`TimeoutStopSec` 设置为 30 秒，即在停止服务时，Systemd 会等待最多 30 秒来等待服务自行停止，如果服务在 30 秒内没有停止，Systemd 将强制终止该服务。

需要注意的是，设置 `TimeoutStopSec` 不会影响服务的启动或运行时间，它只是影响服务的停止操作。在设置 `TimeoutStopSec` 时，要根据你的服务的实际情况来选择合适的超时时间。如果你的服务在正常情况下停止需要较长的时间，你可能需要将 `TimeoutStopSec` 设置得更大一些。反之，如果你的服务通常能够迅速停止，你可以将 `TimeoutStopSec` 设置为较小的值，以便更快地处理停止操作。



### LimitNOFILE

- 限制服务可以打开的最大文件描述符数。

`LimitNOFILE` 是 Systemd Unit 文件中的一个选项，用于设置服务进程的文件描述符限制。文件描述符（File Descriptor）是一个在 POSIX 系统中用于访问文件、套接字和其他 I/O 资源的整数标识符。

通过 `LimitNOFILE`，你可以限制服务进程能够打开的文件描述符的数量。这是为了避免服务在运行时打开过多的文件描述符，防止耗尽系统的资源。过多的文件描述符可能导致系统崩溃或服务失去响应。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `LimitNOFILE` 设置为一个整数值，表示服务进程能够打开的最大文件描述符数量。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
LimitNOFILE=10000
```

在上述例子中，服务进程最多可以打开 10000 个文件描述符。

需要注意的是，设置 `LimitNOFILE` 并不会自动增加系统的文件描述符限制。它只是限制了服务进程能够使用的文件描述符数量，服务进程的文件描述符限制仍受限于系统的默认设置。

如果你想要增加系统的文件描述符限制，需要修改系统的配置文件。在大多数 Linux 发行版中，可以通过修改 `/etc/security/limits.conf` 或 `/etc/security/limits.d` 目录下的配置文件来设置全局的文件描述符限制。

在设置 `LimitNOFILE` 时，需要根据你的服务的实际需求和系统的资源情况来选择合适的值。如果你的服务需要处理大量的文件或网络连接，可能需要增加 `LimitNOFILE` 的值。同时，也要注意避免设置过高的值，以免对系统资源造成不必要的浪费或安全风险。



### Environment

- 设置环境变量，用于定义服务运行时的环境。

`Environment` 选项允许你在 Systemd Unit 文件的 `[Service]` 段中设置环境变量，这些环境变量将在服务运行时生效。通过使用 `Environment` 选项，你可以为服务设置特定的环境变量，以便服务在运行过程中获取这些环境变量的值。

在 Systemd Unit 文件的 `[Service]` 段中，可以通过 `Environment` 选项来定义环境变量。它有两种定义方式：

1. 一次定义一个环境变量，格式为 `KEY=VALUE`，每个环境变量之间用空格分隔。

   例如，假设你的服务需要使用一个名为 `MY_VARIABLE` 的环境变量，并设置其值为 `my_value`，你可以这样定义：

   ```ini
   [Service]
   Type=simple
   ExecStart=/path/to/your/service
   Environment="MY_VARIABLE=my_value"
   ```

2. 多次定义多个环境变量，每个环境变量单独一行。

   例如，如果你有多个环境变量需要设置，可以使用多行的方式来定义它们：

   ```ini
   [Service]
   Type=simple
   ExecStart=/path/to/your/service
   Environment="MY_VARIABLE1=value1"
   Environment="MY_VARIABLE2=value2"
   Environment="MY_VARIABLE3=value3"
   ```

在上述例子中，每个 `Environment` 行定义了一个不同的环境变量。你可以根据需要添加或删除环境变量的定义行。

当服务启动时，Systemd 将会自动设置这些环境变量，并将它们传递给服务的进程。服务进程可以通过读取环境变量来获取相应的配置或信息。

需要注意的是，如果你在 Systemd Unit 文件中同时使用了 `EnvironmentFile` 选项和 `Environment` 选项，那么 `EnvironmentFile` 中定义的环境变量会与 `Environment` 中定义的环境变量合并，并且 `Environment` 中定义的环境变量优先级更高。



### EnvironmentFile

`EnvironmentFile` 是 Systemd Unit 文件中的一个选项，用于从指定的文件中加载环境变量。通过设置 `EnvironmentFile`，你可以将环境变量的定义从 Systemd Unit 文件中拆分出来，以便更灵活地管理和修改环境变量。

在 Systemd Unit 文件的 `[Service]` 段中，可以使用 `EnvironmentFile` 来引用一个文件，该文件包含了一系列环境变量的定义。文件中每行包含一个环境变量的定义，通常以 `key=value` 的形式表示。

例如，假设有一个服务单元 `example.service`：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
EnvironmentFile=/etc/environment_vars
```

在上述例子中，`EnvironmentFile` 被设置为 `/etc/environment_vars`，表示 Systemd 将从该文件中加载环境变量。

文件 `/etc/environment_vars` 的内容可能如下：

```ini
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=mysecretkey
```

当服务启动时，Systemd 将读取 `/etc/environment_vars` 文件中的环境变量定义，并将其传递给服务进程。

使用 `EnvironmentFile` 有几个优点：

1. 可以将环境变量定义集中放在一个文件中，方便管理和修改，而不需要直接编辑 Systemd Unit 文件。
2. 可以方便地复用环境变量定义，多个服务单元可以共享同一个环境变量文件。
3. 可以避免在 Systemd Unit 文件中暴露敏感信息，如密码和密钥。

需要注意的是，`EnvironmentFile` 中定义的环境变量会覆盖掉 `Environment` 选项中定义的环境变量。如果 `Environment` 和 `EnvironmentFile` 同时存在，`EnvironmentFile` 中的环境变量会优先生效。确保文件的格式正确，并且服务进程能够正确处理从 Systemd 传递过来的环境变量。



### PrivateTmp

- 设定为yes时，会在生成/tmp/systemd-private-UUID-NAME.service-XXXXX/tmp/目录

- 设置为 `true` 时，使服务有一个私有的临时文件系统。

`PrivateTmp` 是 Systemd Unit 文件中的一个选项，用于控制服务是否使用私有的临时文件系统。当 `PrivateTmp` 被设置为 `true` 时，Systemd 将为服务创建一个独立的、隔离的临时文件系统，使得服务进程在其中运行，并且只能访问自己的私有临时目录。

使用 `PrivateTmp` 可以增加服务的安全性和隔离性，因为它避免了服务进程对系统全局临时目录的访问，防止服务进程意外读写其他服务或系统的临时文件，从而减少了潜在的安全风险。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `PrivateTmp` 设置为 `true` 或 `false`，具体取决于你是否想要为该服务启用私有临时文件系统。

例如，如果你的服务需要使用私有的临时文件系统，你可以这样定义：

```ini
javascriptCopy code[Service]
Type=simple
ExecStart=/path/to/your/service
PrivateTmp=true
```

如果你不想使用私有临时文件系统，你可以将 `PrivateTmp` 设置为 `false` 或省略该选项（默认为 `false`）：

```ini
javascriptCopy code[Service]
Type=simple
ExecStart=/path/to/your/service
PrivateTmp=false
```

需要注意的是，如果使用 `PrivateTmp`，服务进程将不能访问系统全局的临时目录（通常在 `/tmp` 或 `/var/tmp` 中），而是在私有的临时文件系统中运行。这可能会导致某些服务依赖于全局临时目录的功能或配置无法正常工作，因此在启用 `PrivateTmp` 之前，请确保你的服务不依赖于全局临时目录。



### PrivateDevices

- 设置为 `true` 时，使服务有一个私有的 /dev 目录。

`PrivateDevices` 是 Systemd Unit 文件中的一个选项，用于控制服务是否使用私有的 `/dev` 目录。当 `PrivateDevices` 被设置为 `true` 时，Systemd 将为服务创建一个独立的、隔离的 `/dev` 目录，使得服务进程在其中运行，并且只能访问自己的私有设备节点。

使用 `PrivateDevices` 可以增加服务的安全性和隔离性，因为它避免了服务进程对系统全局 `/dev` 目录的访问，防止服务进程意外访问其他设备节点，从而减少了潜在的安全风险。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `PrivateDevices` 设置为 `true` 或 `false`，具体取决于你是否想要为该服务启用私有设备节点。

例如，如果你的服务需要使用私有的设备节点，你可以这样定义：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
PrivateDevices=true
```

如果你不想使用私有设备节点，你可以将 `PrivateDevices` 设置为 `false` 或省略该选项（默认为 `false`）：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
PrivateDevices=false
```

需要注意的是，如果使用 `PrivateDevices`，服务进程将不能访问系统全局的设备节点（通常在 `/dev` 中），而是在私有的设备节点目录中运行。这可能会导致某些服务依赖于全局设备节点的功能或配置无法正常工作，因此在启用 `PrivateDevices` 之前，请确保你的服务不依赖于全局设备节点。



### ProtectSystem

- 设置为 `full` 或 `strict` 时，限制服务对 /usr 和 /etc 目录的访问。

`ProtectSystem` 是 Systemd Unit 文件中的一个选项，用于控制服务对系统文件和目录的保护级别。当 `ProtectSystem` 设置为 `full`、`strict` 或 `true` 时，Systemd 将限制服务对 `/usr` 和 `/etc` 目录的访问权限，以增加服务的安全性。

- `full`: 当设置为 `full` 时，服务将完全受到限制，无法访问 `/usr` 和 `/etc` 目录以及其子目录。这样做可以保护系统文件和配置免受服务的意外修改。
- `strict`: 当设置为 `strict` 时，服务可以读取 `/usr` 和 `/etc` 目录的内容，但是不能写入或创建新文件。这允许服务读取必要的系统文件和配置，但是限制了对这些目录的写访问，防止服务意外修改系统文件。
- `true` 或未指定：如果 `ProtectSystem` 设置为 `true` 或未指定，默认行为与 `strict` 相同。
- `false`: 如果设置为 `false`，则不会对服务的访问权限进行限制，服务可以自由地访问系统的所有目录。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `ProtectSystem` 设置为上述四种选项之一。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
ProtectSystem=strict
```

需要注意的是，当 `ProtectSystem` 被设置为 `full` 或 `strict` 时，服务将无法修改 `/usr` 和 `/etc` 目录中的文件，这可能会导致某些服务功能受到限制。在启用 `ProtectSystem` 之前，请确保你的服务不需要修改这些目录中的文件。如果你的服务确实需要对这些目录进行修改，请确保你的服务是受信任且仅限于有必要的权限。



### CapabilityBoundingSet

- 限制服务的权限，用于增强安全性。

`CapabilityBoundingSet` 是 Systemd Unit 文件中的一个选项，用于控制服务进程所拥有的权限（capabilities）。Capabilities 是 Linux 内核提供的一种细粒度权限控制机制，它允许进程在不需要完全 root 权限的情况下执行特定的操作。

通过 `CapabilityBoundingSet`，你可以限制服务进程的能力，避免服务过度拥有权限，增加服务的安全性。该选项允许你明确指定服务进程能够拥有的 capabilities。

在 Systemd Unit 文件的 `[Service]` 段中，可以将 `CapabilityBoundingSet` 设置为一个 capabilities 的列表，用逗号分隔。例如：

```ini
[Service]
Type=simple
ExecStart=/path/to/your/service
CapabilityBoundingSet=CAP_NET_ADMIN,CAP_SYS_ADMIN
```

在上述例子中，服务进程只能拥有 `CAP_NET_ADMIN` 和 `CAP_SYS_ADMIN` 这两个 capabilities。其他的 capabilities 将被剥夺，使得服务进程在运行时只能执行与这两个 capabilities 相关的操作。

需要特别注意的是，使用 `CapabilityBoundingSet` 要谨慎，确保你了解服务的运行需求，并仔细选择所需的 capabilities。过度限制 capabilities 可能导致服务无法正常运行，而过度放宽权限又可能增加了系统的安全风险。

如果你不确定服务需要哪些 capabilities，可以在启用 `CapabilityBoundingSet` 前，先运行服务，并观察日志或其他输出来检查服务是否出现了权限相关的错误。根据错误提示，再逐步调整 `CapabilityBoundingSet` 的值，直到找到适合服务的权限设置。

注意，capabilities 在 Linux 系统中可以通过 `man 7 capabilities` 查看更多详细信息。



## [Install]

- **Alias**：别名，可使用systemctl command Alias.service

- **WantedBy**：表示该服务所在的 Target。Target的含义是服务组，表示一组服务。WantedBy=multi-user.target指的是服务所在的Target是multi-user.target

  - Systemd 有默认的启动 Target。就是multi-user.target，在这个组里的所有服务，都将开机启动。

  - ```sh
    # 查看 multi-user.target 包含的所有服务
    systemctl list-dependencies multi-user.target
    ```

  - 它的值是一个或多个 target，执行enable命令时，符号链接会放入/etc/systemd/system目录下以
    target 名 + .wants后缀构成的子目录中。“WantedBy=multi-user.target” 表明当系统以多用户方式（默认的运行级别）启动时，这个服务需要被自动运行。当然还需要 systemctl enable 激活这个服务以后自动运行才会生效

- **Also**：安装本服务的时候还要安装别的相关服务

- **RequiredBy**：被哪些units所依赖，强依赖。单元被允许运行需要的一系列依赖单元，RequiredBy列表从Require获得依赖信息。

  - 依赖当前服务的模块。它的值是一个或多个 target，执行enable命令时，符号链接会放入/etc/systemd/system目录下以 target 名 + .required后缀构成的子目录中



`[Install]` 段是 Systemd service 文件的一个配置段，用于指定如何安装、启动和停止该服务。在该段中，可以指定服务的安装位置，服务的依赖关系，以及指定系统启动时该服务是否应该被启动。

具体来说，`[Install]` 段通常包含以下几个配置项：

- `WantedBy`：指定系统启动时该服务应该被启动的目标，例如 `multi-user.target` 或 `graphical.target` 等。这个选项会在启动时自动将服务添加到目标的启动列表中。如果该选项未设置，则服务不会在系统启动时自动启动。
- `RequiredBy`：类似于 `WantedBy`，但该选项要求服务在指定的目标中必须启动，否则系统无法启动。该选项可以用于指定系统启动所需的服务。
- `Alias`：为服务指定一个别名，可以用于在 `systemctl` 命令中使用别名代替服务名称。

例如，以下是一个简单的 `[Install]` 段的例子：

```sh
[Install]
WantedBy=multi-user.target
```

这个例子指定了服务应该在 `multi-user.target` 目标中启动，因此在系统启动时会自动启动该服务。



在 Systemd Unit 文件的 `[Install]` 段中，有一些常用的选项用于定义如何安装（启用/禁用）Unit。这些选项用于指定 Unit 文件的安装方式，以及在何时和如何自动启用或禁用该 Unit。以下是常见的 `[Install]` 段选项：

1. `WantedBy`: 指定一个 target Unit，表示该 Unit 文件会被安装到这个 target Unit 所代表的运行级别中。当目标 target Unit 启动时，该 Unit 会被自动启动。

2. `RequiredBy`: 类似于 `WantedBy`，但这个选项表示该 Unit 是必需的，即如果目标 target Unit 启动失败，Systemd 将不允许该 Unit 启动。

3. `Also`: 指定其他 Unit 文件的名称，表示当前 Unit 文件会与指定的其他 Unit 文件一起安装。

4. `DefaultInstance`: 如果一个 Unit 文件支持多实例，可以通过该选项指定默认实例。

5. `Alias`: 为当前 Unit 文件指定一个别名，允许通过别名来管理该 Unit。

6. `WantedBy` 和 `RequiredBy` 可以用于表示不同 Unit 之间的依赖关系。例如，假设有一个名为 "myapp.service" 的服务，你可以使用 `WantedBy` 来指定它在 "multi-user.target" 启动级别下启动：

   ```
   csharpCopy code[Install]
   WantedBy=multi-user.target
   ```

   这意味着当 "multi-user.target" 启动时，"myapp.service" 也会被自动启动。

7. `Also` 可以用于同时安装多个相关的 Unit 文件。例如，假设有一个名为 "myapp.service" 的服务和一个名为 "myapp.timer" 的定时器，你可以在 "myapp.service" 的 `[Install]` 段中使用 `Also` 来指定同时安装 "myapp.timer"：

   ```
   csharpCopy code[Install]
   Also=myapp.timer
   ```

   这样，当 "myapp.service" 安装时，"myapp.timer" 也会同时被安装。

这些选项可用于控制 Systemd Unit 文件的安装和启用行为。它们提供了一种简便的方式来定义 Unit 之间的关系，以及在启动时自动管理相关的 Unit。请注意，`[Install]` 段中的选项通常只在 `system` 类型的 Unit 文件中有意义，而对于 `user` 类型的 Unit 文件，这些选项不会自动触发启动行为。




## 使新建或修改的unit文件生效

- 注意：对于新创建的unit文件，或者修改了的unit文件，要通知systemd重载此配置文件
- 也可以选择重启生效

```bash
#不重启使其生效
systemctl daemon-reload
```



## unit 文件范例

```bash

```



# Systemd Unit Demo

## 注意事项

- `ExecStart` 中定义的启动命令必须为前台执行，否则程序将无法正常启动。

## myapp

以下是一个简单的 Systemd service Unit 文件的示例（假设服务名为 "myapp"）：

```ini
[Unit]
Description=My App Service
After=network.target

[Service]
Type=simple
ExecStart=/path/to/myapp
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

在这个示例中，Unit 文件定义了一个名为 "myapp" 的服务，它会在网络服务启动后启动。服务使用简单类型 (simple)，启动命令是 `/path/to/myapp`，如果服务由于失败而停止，它会被自动重新启动。WantedBy 表示该服务会在 multi-user.target 启动级别下启动。

通过 Systemd Unit 文件，系统管理员可以方便地管理服务，并实现更加高级的特性，如服务启动顺序的优化、服务的并行启动、资源限制等。

## Nginx

```ini
[Unit]
# 描述信息
Description=The Nginx HTTP Server daemon
# 指定启动nginx之前需要其他的其他服务，如network.target等
After=network.target remote-fs.target nss-lookup.target

[Service]
# Type为服务类型，仅启动一个主进程的服务为simple，需要启动若干子进程的服务为forking
Type=forking 
# 设置执行systemctl start nginx后需要启动的具体命令
ExecStart=/usr/local/nginx/sbin/nginx
# 设置执行systemctl reload nginx后需要执行的具体命令
ExecReload=/usr/local/nginx/sbin/nginx -s reload
# 设置执行systemctl stop nginx后需要执行的具体命令
ExecStop=/bin/kill -s QUIT ${MAINPID}

[Install]
# 设置在什么模式下被安装，设置开机启动的时候需要
WantedBy=multi-user.target
```



## 开机时运行一次命令

在Ubuntu 18.04中，您可以使用`systemd`来创建开机启动脚本。`systemd`是一种系统和服务管理器，它用于管理系统中的各种服务和进程。下面是在Ubuntu 18.04上创建开机启动脚本的一般步骤：

1. 创建一个服务单元文件：

   在`/etc/systemd/system/`目录中，创建一个`.service`文件，比如`disable-offloads.service`，使用文本编辑器打开它：

   ```sh
   sudo nano /etc/systemd/system/disable-offloads.service
   ```

2. 在文件中添加以下内容：

   ```ini
   [Unit]
   Description=Disable Offloads on ens192
   After=network.target

   [Service]
   Type=oneshot
   ExecStart=/sbin/ethtool -K ens192 tso off gso off gro off

   [Install]
   WantedBy=multi-user.target
   ```

   在上面的`ExecStart`行中，请确保将`ens192`替换为您的网络接口名称。

3. 保存文件并关闭文本编辑器。

4. 使用以下命令重载`systemd`以使新的服务单元文件生效：

   ```sh
   sudo systemctl daemon-reload
   ```

5. 启用并启动服务：

   ```sh
   sudo systemctl enable disable-offloads.service
   sudo systemctl start disable-offloads.service
   ```

这将在系统启动时运行`ethtool`命令，以禁用`TSO`、`GSO`和`GRO`功能。请注意，`systemd`服务单元文件的名称、路径和内容可能会根据您的配置和需求略有不同。确保根据您的情况进行调整，并查阅官方文档或社区支持以获取更多详细信息。



# 运行级别

- **target units**：相当于CentOS 6之前的runlevel ,unit配置文件：.target

```
ls /usr/lib/systemd/system/*.target
systemctl list-unit-files --type target --all
```

## 和运行级别对应关系

```bash
0 ==> runlevel0.target, poweroff.target
1 ==> runlevel1.target, rescue.target
2 ==> runlevel2.target, multi-user.target
3 ==> runlevel3.target, multi-user.target
4 ==> runlevel4.target, multi-user.target
5 ==> runlevel5.target, graphical.target
6 ==> runlevel6.target, reboot.target
```

## 查看依赖性

```bash
systemctl list-dependencies graphical.target
```

## 运行级别切换

- 相当于 init N 

```bash
systemctl isolate name.target
```

## 进入默认target

```bash
systemctl default
```

## 切换至字符模式

- 注意：只有/lib/systemd/system/*.target文件中AllowIsolate=yes 才能切换(修改文件需执行systemctl  daemon-reload才能生效)

```bash
systemctl isolate multi-user.target
```

## 获取默认运行级别

- 相当于查看 /etc/inittab

```
systemctl get-default
```

## 修改默认级别

- 相当于修改 /etc/inittab

```bash
systemctl set-default name.target

#范例
[root@centos8 ~]#systemctl set-default multi-user.target
[root@centos8 ~]#ls -l /etc/systemd/system/default.target
lrwxrwxrwx. 1 root root 37 Nov 7 19:32 /etc/systemd/system/default.target -> 
/lib/systemd/system/multi-user.target
```

## 切换至紧急救援模式

```bash
systemctl rescue
```

## 切换至emergency模式

- rescue.target 比emergency 支持更多的功能，例如日志等

```
systemctl emergency
```

## 关机、重启、挂起...

- 传统命令init，poweroffff，halt，reboot都成为 systemctl的软链接

```bash
#关机
systemctl halt 或 systemctl poweroff
 
#重启：
systemctl reboot

#挂起：
systemctl suspend

#休眠：
systemctl hibernate

#休眠并挂起：
systemctl hybrid-sleep
```



# ---

# systemctl 命令

## 命令格式

```bash
systemctl COMMAND name.service
```

## 常用命令

```bash
#启动：相当于service name start 
systemctl start name.service   

#停止：相当于service name stop
systemctl stop name.service

#重启：相当于service name restart 
systemctl restart name.service 

#查看状态：相当于service name status
systemctl status name.service

#禁止自动和手动启动：
systemctl mask name.service

#取消禁止
systemctl unmask name.service

#查看某服务当前激活与否的状态（可以放到脚本中实现服务状态的判断，正常则$?返回值为0，反之则不为0）
systemctl is-active name.service

#查看所有已经激活的服务
systemctl list-units <--type|-t> service

#查看所有服务：
systemctl list-units --type service <--all|-a>

#设定某服务开机自启，相当于chkconfig name on 
systemctl enable name.service

#设定某服务开机禁止启动：相当于chkconfig name off
systemctl disable name.service

#查看所有服务的开机自启状态，相当于chkconfig --list
systemctl list-unit-files --type service

#用来列出该服务在哪些运行级别下启用和禁用：chkconfig –list name
ls /etc/systemd/system/*.wants/name.service

#查看服务是否开机自启：
systemctl is-enabled name.service

#列出失败的服务
systemctl --failed --type=service
 
#立即启动或停止服务，并实现开机自启动
systemctl enable --now postfix 
systemctl disable  --now postfix

#查看服务的依赖关系：
systemctl list-dependencies name.service

#杀掉进程：
systemctl kill unitname
```

## 服务状态

```bash
#显示所有服务的状态
systemctl list-unit-files --type service --all
```

- **loaded**：Unit配置文件已处理
- **active(running)**：一次或多次持续处理的运行
- **active(exited)**：成功完成一次性的配置
- **active(waiting)**：运行中，等待一个事件
- **inactive**：不运行
- **enabled**：开机启动
- **disabled**：开机不启动
- **static**：开机不启动，但可被另一个启用的服务激活
- **indirect**：重定向到别处



## status 打印服务状态

`systemctl status` 命令用于查看系统中正在运行的服务的状态信息。它提供了关于服务的当前状态、最近的日志条目和其他相关信息。

下面是 `systemctl status` 命令输出的一般解释：

```yaml
● service-name.service - Service Name
   Loaded: loaded (/etc/systemd/system/service-name.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2023-05-22 15:42:20 UTC; 3 days ago
 Main PID: 12345 (process-name)
    Tasks: 1 (limit: 4915)
   Memory: 25.6M
   CGroup: /system.slice/service-name.service
           └─12345 /path/to/process

May 22 15:42:20 hostname systemd[1]: Started Service Name.
```

下面是对各个字段的解释：

- `service-name.service - Service Name`：服务的名称。
- `Loaded`：指示服务的配置文件是否已加载，并显示配置文件的路径。
- `Active`：指示服务的当前状态，可以是 `active`（运行中）、`inactive`（停止）、`activating`（正在启动）、`deactivating`（正在停止）等。
- `since`：指示服务最后一次启动的时间。
- `Main PID`：主进程的进程ID。
- `Tasks`：当前服务的任务数量。
- `Memory`：当前服务使用的内存量。
- `CGroup`：服务所属的控制组路径。
- `└─`：表示属于该服务的进程。
- `/path/to/process`：进程的路径。
- `May 22 15:42:20 hostname systemd[1]: Started Service Name.`：最近的系统日志条目，指示服务的启动时间和状态。

通过 `systemctl status` 命令，您可以获取有关服务的基本信息，例如服务的名称、状态、启动时间、进程ID等。此外，还可以查看最近的系统日志条目，以帮助诊断和排除与服务相关的问题。



# ---

# Ubutun实现开机自动运行程序

```bash
[root@ubuntu1804 ~]#ll /lib/systemd/system/rc.local.service 
lrwxrwxrwx 1 root root 16 Dec 12  2018 /lib/systemd/system/rc.local.service -> 
rc-local.service
[root@ubuntu1804 ~]#grep -v "^#" /lib/systemd/system/rc.local.service 
[Unit]
Description=/etc/rc.local Compatibility
Documentation=man:systemd-rc-local-generator(8)
ConditionFileIsExecutable=/etc/rc.local
After=network.target
[Service]
Type=forking
ExecStart=/etc/rc.local start
TimeoutSec=0
RemainAfterExit=yes
GuessMainPID=no

[root@ubuntu1804 ~]#vim /etc/rc.local
#!/bin/bash
echo -e '\E[31;1mstarting test service\E[0m'
sleep 10
[root@ubuntu1804 ~]#chmod +x /etc/rc.local
[root@ubuntu1804 ~]#reboot
```





# 了解系统启动的详细过程

```bash
#命令行界面输出
[root@centos8 ~]# systemd-analyze blame
...

#生成网页
[root@centos8 ~]# systemd-analyze plot > boot.html
[root@centos ~]# sz boot.html
#浏览器打开查看
```



# 禁用ctrl+alt+delete 重启快捷键

```bash
[root@centos8 ~]#ls -l /lib/systemd/system/ctrl-alt-del.target    
lrwxrwxrwx. 1 root root 13 May 23 2019 /lib/systemd/system/ctrl-alt-del.target 
-> reboot.target

[root@centos8 ~]#systemctl mask ctrl-alt-del.target 
Created symlink /etc/systemd/system/ctrl-alt-del.target → /dev/null.

[root@centos8 ~]#init q
或
[root@centos8 ~]#systemctl daemon-reload
```





# 解决关机慢 A stop job is running for...

```bash
# vim /etc/systemd/system.conf
...
#将下面两个值修改为10秒，默认为90秒
DefaultTimeoutStartSec=10s
DefaultTimeoutStopSec=10s
...


#使其生效
systemctl daemon-reload
```





# ---



# 范例：使用 systemd 实现运行 tor 集群

## start_private.sh

```sh
#!/bin/bash

PRIVATE=/root/private
DATA=${PRIVATE}/data
COUNT=3

function killtor {
    pgrep tor && pgrep tor | xargs kill -9
}

function delete {
    if [[ $1 = "authority" ]]; then
        find ${DATA}/${1}/ \
        ! -path ${DATA}/${1}/ \
        ! -path ${DATA}/${1}/keys \
        ! -path "${DATA}/${1}/keys/*" \
        ! -name torrc \
        ! -name fingerprint \
        -exec rm -fr {} \;
    elif [[ $1 = "router" || $1 = "exit" ]]; then
        for i in $(seq 1 ${COUNT})
        do
            find ${DATA}/${1}_${i}/ \
            ! -path ${DATA}/${1}_${i}/ \
            ! -name 'torrc' | xargs rm -fr
        done
    fi
}

function starttor {
    if [[ $1 = "authority" ]]; then
        ${PRIVATE}/tor -f "${DATA}/$1/torrc"
    else
        for i in  $(seq 1 ${COUNT})
        do
            ${PRIVATE}/tor -f "${DATA}/$1_$i/torrc"
        done
    fi
}

function main() {
    case $2 in
    starttor)
        echo "start start tor process..."
        starttor $1
        echo "------------------------------------"
        ;;
    stoptor)
        echo "start kill tor process..."
        killtor
        echo "------------------------------------"
        echo "start delete tor dir..."
        delete $1
        echo "------------------------------------"
        ;;
    esac
}

if [[ -n "$1" && -n "$2" ]];then
    main $1 $2
else
    echo "Please add role and action:
          ./restart_provate.sh < authority | router | exit > < starttor | stoptor >"
fi
```



## tor-authority.service

- /etc/systemd/system/tor-authority.service

```ini
[Unit]
Description=Tor Authorit
After=network.target

[Service]
Type=forking
Environment="ROLE=authority"
User=root
Group=root
ExecStart=/root/start_private.sh $ROLE starttor
ExecStop=/root/start_private.sh $ROLE stoptor

[Install]
WantedBy=multi-user.target
```



## tor-router.service

- /etc/systemd/system/tor-router.service

```ini
[Unit]
Description=Tor Authorit
After=network.target

[Service]
Type=forking
Environment="ROLE=router"
User=root
Group=root
ExecStart=/root/start_private.sh $ROLE starttor
ExecStop=/root/start_private.sh $ROLE stoptor

[Install]
WantedBy=multi-user.target
```

- torrc三个进行配置为后台运行，Type 要为 forking

```
# systemctl status tor-router.service 
● tor-router.service - Tor Authorit
   Loaded: loaded (/etc/systemd/system/tor-router.service; disabled; vendor preset: enabled)
   Active: active (running) since Sat 2023-08-05 14:43:51 UTC; 963ms ago
  Process: 4462 ExecStart=/root/start_private.sh $ROLE starttor (code=exited, status=0/SUCCESS)
    Tasks: 12 (limit: 4623)
   CGroup: /system.slice/tor-router.service
           ├─4466 /root/private/tor -f /root/private/data/router_1/torrc
           ├─4469 /root/private/tor -f /root/private/data/router_2/torrc
           └─4472 /root/private/tor -f /root/private/data/router_3/torrc

Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.114 [notice] By default, Tor does not run 
Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.114 [warn] You have used DirAuthority or A
Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.114 [warn] The DirAuthority options 'hs' a
Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.114 [warn] TestingTorNetwork is set. This 
Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.135 [notice] Opening OR listener on 0.0.0.
Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.142 [notice] Opened OR listener on 0.0.0.0
Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.142 [notice] Opening Directory listener on
Aug 05 14:43:51 tor-router start_private.sh[4462]: Aug 05 14:43:51.142 [notice] Opened Directory listener on 
Aug 05 14:43:51 tor-router start_private.sh[4462]: ------------------------------------
Aug 05 14:43:51 tor-router systemd[1]: Started Tor Authorit.

```



## tor-exit.service

- /etc/systemd/system/tor-exit.service

```ini
[Unit]
Description=Tor Authorit
After=network.target

[Service]
Type=forking
Environment="ROLE=exit"
User=root
Group=root
ExecStart=/root/start_private.sh $ROLE starttor
ExecStop=/root/start_private.sh $ROLE stoptor

[Install]
WantedBy=multi-user.target
```

