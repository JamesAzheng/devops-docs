---
title: "sys"
---

## sys 模块概述

`sys` 是 Python 标准库中的一个模块，它提供了与 Python 解释器以及与解释器交互的功能。`sys` 模块包含了一些有用的函数和变量，可以让你访问和控制 Python 解释器的一些运行时环境设置。以下是一些常用的 `sys` 模块功能：



## argv

这是一个包含命令行参数的列表。当你在命令行中运行 Python 脚本时，`sys.argv` 会包含脚本名和传递给脚本的参数。

```python
import sys

print(sys.argv)  # 打印命令行参数列表

## python3 test_sys.py arg1 arg2 arg3
['test_sys.py', 'arg1', 'arg2', 'arg3']
```



## path

这是一个包含用于查找模块的目录列表的字符串列表。你可以修改它以添加或删除模块搜索路径。

```python
import sys

sys.path # 模块当前搜索路径

sys.path.append("/path/to/your/module")  # 添加模块搜索路径
```



## modules

这是一个字典，包含了当前已导入的模块。你可以使用它来查询已加载的模块。

```python
import sys

print(sys.modules.keys())  # 打印已导入模块的名称
```



## stdin

这是标准输入流，你可以用它来获取用户的输入。

```python
import sys

user_input = sys.stdin.readline()  # 读取用户输入
```



## stdout & stderr

这些变量表示标准输出和标准错误流，你可以重定向它们以捕获或修改程序的输出。

```python
import sys

sys.stdout.write("Hello, World!\n")  # 输出到标准输出流
sys.stderr.write("Error message\n")  # 输出到标准错误流
```



## platform

这个字符串变量包含了当前 Python 解释器运行的平台名称，例如 "win32" 表示 Windows，"linux" 表示 Linux。

```python
import sys

print(sys.platform)  # 打印运行平台
```



## version

这个字符串包含了 Python 解释器的版本信息。

```python
import sys

print(sys.version)  # 打印 Python 版本信息
```



## exit

`sys.exit()` 是 Python `sys` 模块中的一个函数，用于退出当前的 Python 解释器。它通常被用于终止程序的执行，无论程序是正常结束还是出现错误。当调用 `sys.exit()` 时，Python 解释器会立即停止执行当前的脚本，并返回到命令行或调用它的程序。

通常情况下，`sys.exit()` 不需要传递参数，但你可以选择传递一个整数参数，表示程序的退出状态码。通常，状态码为 0 表示程序正常退出，而非零状态码通常表示程序出现了错误或异常。

以下是一些示例：

```python
import sys

def main():
    try:
        # 一些代码
        result = 42 / 0  # 除以零，会引发异常
    except ZeroDivisionError:
        print("除以零错误")
        sys.exit(1)  # 退出并返回状态码 1，表示错误

if __name__ == "__main__":
    main()
```

在上面的示例中，当除以零错误发生时，程序调用 `sys.exit(1)` 退出，并返回状态码 1，表示发生了错误。

请注意，`sys.exit()` 是一种强制性的退出方式，它会立即终止程序的执行，包括未完成的任何操作或清理工作。因此，你应该谨慎使用它，确保在需要退出时才调用它，以避免意外中断程序的执行。



