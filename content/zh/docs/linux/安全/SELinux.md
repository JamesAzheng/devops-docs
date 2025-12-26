---
title: SELinux
---

# 关闭 SELinux

- /etc/selinux/config

```sh
...
SELINUX=disabled # 禁用selinux
...
```





# 判断 SELinux 工作状态

```sh
# 方法一
# sestatus
SELinux status:                 disabled

# 方法二
# getenforce
Disabled
```



要在Linux上判断SELinux是否开启或关闭，可以执行以下步骤：

1. 打开终端，以 root 用户或具有管理员权限的用户身份登录。

2. 输入以下命令以检查SELinux的状态：

   ```sh
   sestatus
   ```

   这将显示SELinux的当前状态信息。

   如果SELinux已启用并处于强制模式，输出可能如下所示：

   ```
   SELinux status: enabled
   SELinux mode:   enforcing
   ```

   如果SELinux已启用但处于宽松模式，输出可能如下所示：

   ```
   SELinux status: enabled
   SELinux mode:   permissive
   ```

   如果SELinux已禁用，输出可能如下所示：

   ```
   SELinux status: disabled
   ```

   请注意，输出可能会根据Linux发行版和版本而有所不同。

另外，你还可以通过查看SELinux配置文件来确认SELinux的状态。配置文件的位置可能会有所不同，但通常可以在以下路径之一找到：

- CentOS/RHEL/Fedora：`/etc/selinux/config`
- Ubuntu/Debian：`/etc/selinux/config`

使用文本编辑器打开该文件，查找名为`SELINUX`的行。如果该行的值为`enforcing`，表示SELinux已启用且处于强制模式；如果值为`permissive`，表示SELinux已启用但处于宽松模式；如果该行被注释掉（以`#`开头），表示SELinux已禁用。

请注意，修改SELinux配置文件的内容可能需要管理员权限，并且修改配置后可能需要重新启动系统才能生效。



**还有其它命令判断吗？**

是的，还有其他一些命令可以用于判断SELinux的状态。除了 `sestatus` 命令之外，以下命令也可以提供有关SELinux的信息：

1. **getenforce**：该命令可用于获取SELinux的执行模式。执行以下命令：

   ```
   getenforce
   ```

   如果输出为 `Enforcing`，表示SELinux处于强制模式；如果输出为 `Permissive`，表示SELinux处于宽松模式；如果输出为 `Disabled`，表示SELinux已禁用。

2. **sestatus**：我们已经在前面提到了 `sestatus` 命令，它可以提供更详细的SELinux状态信息，包括当前状态、模式和策略等。执行以下命令：

   ```
   sestatus
   ```

   输出将显示有关SELinux的更多详细信息。

3. **ls -Z**：此命令可用于显示文件和目录的SELinux安全上下文。执行以下命令来检查某个文件或目录的SELinux安全上下文：

   ```
   ls -Z /path/to/file_or_directory
   ```

   输出将显示与该文件或目录关联的SELinux安全上下文。

这些命令应该足够帮助你判断SELinux的状态和配置信息。
