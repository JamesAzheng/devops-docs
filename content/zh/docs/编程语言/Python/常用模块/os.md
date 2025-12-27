---
title: "os"
---

# os 模块概述

`os` 模块是 Python 中的一个标准库模块，用于与操作系统进行交互，提供了许多用于文件和目录操作、环境变量管理、进程控制等功能的函数和方法。



# os 模块常用函数和方法

PS：“方法”通常指的是类中定义的函数，而“函数”则是指一般的独立代码块。

`os` 模块提供了许多用于与操作系统进行交互的方法。以下是 `os` 模块中一些常用的方法：

1. **文件和目录操作**：
   - `os.listdir(path='.')`: 返回指定目录中的文件和子目录列表。
   - `os.mkdir(path)`: 创建一个新目录。
   - `os.makedirs(path, mode=0o777, exist_ok=False)`: 递归创建目录，如果目录已经存在则不会引发异常（如果 `exist_ok` 为 True）。
   - `os.remove(path)`: 删除指定的文件。
   - `os.rmdir(path)`: 删除指定的目录（只能删除空目录）。
   - `os.removedirs(path)`: 递归删除目录树。
   - `os.rename(src, dst)`: 重命名文件或目录。
   - `os.path.exists(path)`: 检查指定的路径是否存在。
   - `os.path.isfile(path)`: 检查指定的路径是否是文件。
   - `os.path.isdir(path)`: 检查指定的路径是否是目录。

2. **环境变量**：
   - `os.getenv(name, default=None)`: 获取指定环境变量的值。
   - `os.putenv(name, value)`: 设置环境变量的值。
   - `os.environ`: 包含当前环境变量的字典。

3. **系统信息**：
   - `os.name`: 返回当前操作系统的名称（例如，'posix' 表示 Unix/Linux 系统，'nt' 表示 Windows 系统）。
   - `os.uname()`: 返回有关当前系统的信息，但在 Windows 系统上不可用。
   - `os.getcwd()`: 返回当前工作目录。
   - `os.chdir(path)`: 改变当前工作目录。

4. **进程管理**：
   - `os.system(command)`: 在子 shell 中执行系统命令。
   - `os.spawn*(...)`: 一组函数用于创建新进程。
   - `os.kill(pid, sig)`: 向进程发送信号。

5. **其他**：
   - `os.getpid()`: 返回当前进程的 PID。
   - `os.getuid()`: 返回当前进程的用户 ID。
   - `os.getgid()`: 返回当前进程的组 ID。
   - `os.access(path, mode)`: 检查指定路径的权限。

这只是 `os` 模块提供的一小部分方法，该模块还包含许多其他有用的函数和常量，用于与操作系统进行交互。



## os.path.dirname()

这个函数的作用是返回指定路径中的目录部分，即指定路径中最后一个目录分隔符之前的部分。如果指定的路径是一个空字符串，则返回 `'.'`，表示当前工作目录。

`os.path.dirname()` 函数的语法如下：

```python
os.path.dirname(path)
```

- `path`：是要处理的路径字符串。这个路径可以是文件路径或目录路径。



**示例：**

```py
print(os.path.dirname(__file__))
```

这行代码是使用 Python 的 `os.path.dirname()` 函数来获取指定文件的目录名。让我们逐步解释它：

1. `os.path`: 这是 Python 中的一个模块，提供了许多用于处理文件路径的方法。

2. `__file__`: 这是一个内置的 Python 变量，表示当前脚本文件的路径。在运行时，Python 解释器会自动设置 `__file__` 变量的值为当前执行的脚本文件的路径。

3. `os.path.dirname()`: 这是 `os.path` 模块中的一个函数，用于获取指定路径的目录名。它会返回指定路径中最后一个目录分隔符之前的部分，即指定路径的目录部分。如果指定的路径是一个空字符串，则返回 '.'，表示当前工作目录。

因此，`print(os.path.dirname(__file__))` 这行代码会输出当前脚本文件所在的目录名。

```py
# pwd
/root/python

# cat ./test_os.py
#!/usr/local/bin/python3
import os
print(os.path.dirname(__file__))

# ./test_os.py
/root/python/.
```



## os.path.join()

这个函数的作用是将多个路径组件连接起来形成一个完整的路径。它会根据当前操作系统的规则自动添加适当的路径分隔符（如 Windows 系统下的 `\` 或 Unix/Linux 系统下的 `/`）。

`os.path.join()` 函数的语法如下所示：

```python
os.path.join(path1[, path2[, ...]])
```

- `path1`, `path2`, ...：是要连接的路径组件。可以是字符串、字节序列或者是一个可迭代对象（如列表、元组等），其中包含了要连接的路径组件。



**示例：**

```py
os.path.join(os.path.dirname(__file__), 'config.json')
```

这行代码是使用 Python 的 `os.path.join()` 函数来拼接文件路径，生成一个完整的文件路径。让我们逐步解释它：

1. `os.path`: 这是 Python 中的一个模块，提供了许多用于处理文件路径的方法。

2. `os.path.dirname(__file__)`: 这一部分使用 `os.path.dirname()` 函数获取当前脚本文件的目录名，即当前脚本文件所在的目录。

3. `'config.json'`: 这是要拼接到目录名后面的文件名，表示所需的文件名为 `config.json`。

4. `os.path.join()`: 这是 `os.path` 模块中的一个函数，用于将多个路径组合成一个完整的路径。它会根据当前操作系统的规则自动添加适当的路径分隔符。

因此，`os.path.join(os.path.dirname(__file__), 'config.json')` 这行代码会将当前脚本文件所在的目录名与文件名 `config.json` 拼接起来，生成一个完整的文件路径。

```py
# pwd
/root/python

# cat test_os.py 
#!/usr/local/bin/python3
import os
print(os.path.dirname(__file__))
print(os.path.join(os.path.dirname(__file__), 'config.json'))

# ./test_os.py
/root/python/.
/root/python/./config.json
```



## 1

下面是一些常用的 `os` 模块函数和方法：

获取当前工作目录：

```python
import os
current_directory = os.getcwd()
```

切换工作目录：

```python
os.chdir('/path/to/new/directory')
```

列出目录中的文件和子目录：

```python
files_and_dirs = os.listdir('/path/to/directory')
```

创建目录：

```python
os.mkdir('/path/to/new/directory')
```

创建多级目录：

```python
os.makedirs('/path/to/new/directory/multiple/levels')
```

删除文件：

```python
os.remove('/path/to/file')
```

删除目录（必须为空目录）：

```python
os.rmdir('/path/to/directory')
```

删除目录及其内容（递归删除）：

```python
import shutil
shutil.rmtree('/path/to/directory')
```

重命名文件或目录：

```python
os.rename('/path/to/old', '/path/to/new')
```

获取文件或目录的属性：

```python
file_stats = os.stat('/path/to/file_or_directory')
```

检查文件或目录是否存在：

```python
exists = os.path.exists('/path/to/file_or_directory')
```

检查是否为文件或目录：

```python
is_file = os.path.isfile('/path/to/file')
is_directory = os.path.isdir('/path/to/directory')
```

运行外部命令：

```python
os.system('command')
```

获取环境变量：

```python
env_var = os.environ.get('ENV_VARIABLE_NAME')
```

设置环境变量：

```python
os.environ['ENV_VARIABLE_NAME'] = 'new_value'
```

这只是 `os` 模块的一小部分功能示例。`os` 模块在处理文件、目录和操作系统相关任务时非常有用，它可以帮助你编写跨平台的 Python 程序。注意，某些操作可能涉及对文件系统的敏感操作，因此请小心使用，并确保你有适当的权限。





# sched_setaffinity()

在Python中，有一些库可以用来控制进程的CPU亲缘性绑定，比如`psutil`和`os.sched_setaffinity`。

`os.sched_setaffinity`是一个在Unix系统上的低级API，可以直接操作进程的CPU亲缘性。以下是一个使用`os.sched_setaffinity`的示例：

```py
import os

def bind_process_to_cores(process_id, core_list):
    os.sched_setaffinity(process_id, core_list)

# 示例：将进程绑定到CPU核心0和1
process_id_to_bind = os.getpid()  # 获取当前进程ID
cores_to_bind = [0, 1]           # 替换为你想要绑定的CPU核心列表

bind_process_to_cores(process_id_to_bind, cores_to_bind)
```

