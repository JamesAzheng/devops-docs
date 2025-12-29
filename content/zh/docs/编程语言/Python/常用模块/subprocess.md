---
title: "subprocess"
---

## subprocess

`subprocess` 是 Python 中用于创建和管理新进程的模块。它提供了一个更灵活的接口，用于执行外部命令、访问系统 I/O 流以及进行进程间通信。

## 常用函数：

1. **`subprocess.run()`**
   - 执行命令，并等待其完成。可控制输入、输出、错误处理和超时。
   - 示例：`subprocess.run(['ls', '-l'])`

2. **`subprocess.Popen()`**
   - 更灵活的创建子进程的方法，允许更多的交互和控制。
   - 示例：`subprocess.Popen(['echo', 'Hello, subprocess!'])`

3. **`subprocess.call()`**
   - 执行命令，等待其完成，返回退出码。
   - 示例：`subprocess.call(['ls', '-l'])`

4. **`subprocess.check_output()`**
   - 执行命令并获取其输出。如果返回非零退出码，则引发 `CalledProcessError` 异常。
   - 示例：`subprocess.check_output(['ls', '-l'])`

## 常用类：

1. **`subprocess.CompletedProcess`**
   - `run()` 函数的返回类型，包含有关已完成进程的信息，如退出码、输出等。

2. **`subprocess.Popen`**
   - 用于创建新进程的类，可用于与子进程进行交互和控制。
   - 可以使用 `communicate()` 方法与子进程进行通信。

这些函数和类可以让你在 Python 中方便地执行外部命令，并控制子进程的输入、输出和行为。使用它们时要留意异常处理、输入输出流的管理以及子进程的交互。

















## ---



## run()

`subprocess.run()` 是 Python `subprocess` 模块中的一个函数，用于执行外部命令并等待其完成。它是 Python 3.5 引入的一个便捷函数，简化了执行外部命令并处理输入、输出和错误的过程。

## 语法
```python
subprocess.run(args, *, stdin=None, input=None, stdout=None, stderr=None, capture_output=False, shell=False, timeout=None, check=False, text=None, encoding=None, errors=None, env=None, cwd=None, pass_fds=(), executable=None, start_new_session=False)
```

### 常用参数

#### args

 要执行的命令及其参数，可以是列表形式（如 `['ls', '-l']`）或字符串形式（如 `'ls -l'`）。

#### shell

如果为 `True`，则使用系统的 shell 执行命令。

#### text

`text` 参数是 Python 3.7 中新增的一个参数，用于指定输入输出流的文本模式。

通常情况下，当你处理文本数据时，更推荐使用 `text=True`，因为它可以简化代码并自动处理文本编码和解码。但如果你处理的是二进制数据流，则可以将 `text` 设为 `False`。

##### text=True

当 `text=True` 时，`subprocess.run()` 函数将会以文本模式处理输入输出流，这意味着它会自动编码传递给子进程的输入，并将子进程的输出解码为字符串。

在 Python 3 中，处理文本流可能需要考虑字符编码的问题。当 `text=True` 时，Python 会自动处理文本编码和解码，方便处理文本数据。

**示例：**

```python
import subprocess

## 执行命令，并将输入输出流设置为文本模式
result = subprocess.run(['echo', 'Hello, subprocess!'], capture_output=True, text=True)

if result.returncode == 0:
    print("Command executed successfully!")
    print("Output:", result.stdout)
else:
    print("Command failed!")
    print("Error:", result.stderr)
```

在这个例子中，`text=True` 表示输入输出都是文本模式，所以无需手动编码或解码字符串。当你需要处理文本数据时，设置 `text=True` 可以简化代码，并减少手动编码解码的工作。

##### text=False

当 `text=False` 时，`subprocess.run()` 函数会将输入输出流视为二进制数据流，而不是文本模式。这意味着数据将以字节序列的形式传输而不会进行自动编码或解码。

示例：

```python
import subprocess

## 执行命令，并将输入输出流设置为二进制模式
result = subprocess.run(['echo', 'Hello, subprocess!'], capture_output=True, text=False)

if result.returncode == 0:
    print("Command executed successfully!")
    print("Output:", result.stdout.decode())  # 手动解码输出流为文本
else:
    print("Command failed!")
    print("Error:", result.stderr.decode())  # 手动解码错误流为文本
```

在这个示例中，当 `text=False` 时，我们需要手动调用 `.decode()` 方法将输出流和错误流解码为文本。如果不手动解码，结果将是字节序列而不是字符串。

#### capture_output

`capture_output` 用于捕获子进程的标准输出和标准错误输出。

通常情况下，当你不需要获取子进程的输出时，可以使用默认设置 `capture_output=False`。如果你需要获取子进程的输出进行后续处理，可以设置 `capture_output=True` 来捕获输出流。

##### capture_output=True

当设置为 `True` 时，子进程的标准输出和标准错误输出将会被捕获并存储在返回结果的属性中，而不会直接打印到控制台或终端。

示例：

```python
import subprocess

## 执行命令，并捕获输出流
result = subprocess.run(['ls', '-l'], capture_output=True, text=True)

if result.returncode == 0:
    print("Command executed successfully!")
    print("Output:", result.stdout)
else:
    print("Command failed!")
    print("Error:", result.stderr)
```

在这个示例中，`capture_output=True` 允许我们获取 `ls -l` 命令的标准输出，并通过 `result.stdout` 属性访问。如果命令成功执行，`result.returncode` 为 0，否则为非零值，表示相应的错误码。 

这个参数通常用于捕获子进程的输出以便后续处理，比如检查命令是否成功执行，分析输出内容等。

##### capture_output=False

当 `capture_output=False` 时，`subprocess.run()` 函数不会捕获子进程的标准输出和标准错误输出。默认情况下，这两个输出流会直接传输到父进程的标准输出和标准错误输出（即打印到控制台或终端）。

示例：

```python
import subprocess

## 执行命令，不捕获输出流
result = subprocess.run(['ls', '-l'], capture_output=False)

if result.returncode == 0:
    print("Command executed successfully!")
else:
    print("Command failed!")
```

在这个示例中，`capture_output=False` 表示不会捕获 `ls -l` 命令的标准输出和标准错误输出。如果命令成功执行，将打印 `"Command executed successfully!"`，否则打印 `"Command failed!"` 并显示错误信息（如果有的话）。 



### 其它参数

- `stdin`、`stdout`、`stderr`：指定输入、输出、错误的管道。可以是 `subprocess.PIPE`、`subprocess.DEVNULL`、文件对象或一个文件描述符。
- `timeout`：设置命令运行的超时时间。
- `check`：如果为 `True`，则如果命令返回的退出码不为 0，则引发 `subprocess.CalledProcessError` 异常。
- `encoding`、`errors`：用于处理文本输入输出的参数。
- `env`：设置子进程的环境变量。
- `cwd`：设置子进程的工作目录。
- `executable`：指定要执行的可执行程序。
- `start_new_session`：如果为 `True`，将创建一个新的进程组。



## 范例：执行 shell 命令 - 1
```python
import subprocess

## 执行带有管道的 shell 命令
result = subprocess.run('ls -l | grep .txt', shell=True, capture_output=True, text=True)

if result.returncode == 0:
    print("Command executed successfully!")
    print(result.stdout)
else:
    print("Command failed!")
    print(result.stderr)
```

- `returncode` 是 `subprocess.run()` 函数返回的一个属性，表示子进程的退出码（如果执行的命令成功完成，返回码将为 0）



## 范例：执行 shell 命令 - 2

执行带有变量替换和管道的命令：

假设有一个要求统计指定文件夹下特定文件类型数量的任务。我们可以使用 `find` 命令查找特定文件类型，并通过 `wc -l` 命令统计行数。我们将文件夹路径和文件类型作为参数传递到 Python 脚本中，并在其中构建并执行这个 shell 命令。

```python
import subprocess

def count_files(folder_path, file_extension):
    # 构建 shell 命令
    command = f"find {folder_path} -type f -name '*.{file_extension}' | wc -l"

    # 执行 shell 命令
    result = subprocess.run(command, shell=True, capture_output=True, text=True)

    if result.returncode == 0:
        print(f"Number of .{file_extension} files: {result.stdout.strip()}")
    else:
        print("Command failed!")
        print(result.stderr)

## 指定文件夹路径和文件类型（比如统计.py文件数量）
count_files('/path/to/folder', 'py')
```

这个例子展示了如何构建带有变量替换和管道的 shell 命令，并通过 Python 的 `subprocess.run()` 执行它。



## 范例：执行 shell 命令 - 3

执行一个包含循环、变量替换和管道的命令，以下是一个示例：

假设有一个文件夹，你想要对其中所有的 `.txt` 文件进行字符统计，并列出文件名和字符数。你可以使用 `for` 循环和 `wc -c` 命令来完成这个任务。

```python
import subprocess
import os

def character_count_in_files(folder_path):
    # 获取文件夹中的所有 txt 文件
    txt_files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]

    for txt_file in txt_files:
        # 构建 shell 命令
        command = f"cat {os.path.join(folder_path, txt_file)} | wc -c"

        # 执行 shell 命令
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            character_count = result.stdout.strip()
            print(f"File: {txt_file}, Character count: {character_count}")
        else:
            print(f"Failed to process file: {txt_file}")
            print(result.stderr)

## 指定文件夹路径
character_count_in_files('/path/to/folder')
```

这个示例中，Python 代码获取文件夹中的所有 `.txt` 文件，并使用 `for` 循环遍历每个文件，构建了一个读取文件内容并用 `wc -c` 命令进行字符统计的 shell 命令。然后使用 `subprocess.run()` 执行这个命令，并输出文件名和字符统计结果。



## 范例：过滤输出

```python
import subprocess

## 要执行的Linux命令
command = "ls -l"

## 使用subprocess运行命令
result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

## 打印命令的标准输出
print("标准输出:")
print(result.stdout)

## 打印命令的标准错误（如果有）
print("标准错误:")
print(result.stderr)

## 打印命令的返回代码
print("返回代码:", result.returncode)
```

上面的代码中，我们使用`subprocess.run`函数执行了一个`ls -l`命令。您可以将`command`变量设置为您想要执行的任何Linux命令。设置`shell=True`表示可以使用shell语法运行命令。`stdout=subprocess.PIPE`和`stderr=subprocess.PIPE`参数用于捕获命令的标准输出和标准错误输出。最后，我们打印了命令的输出和返回代码。



## call()

`subprocess.call()` 是 `subprocess` 模块中的一个函数，用于执行系统命令。它会等待子进程完成并返回一个表示子进程退出状态的整数值。

## 语法
```python
subprocess.call(args, *, stdin=None, stdout=None, stderr=None, shell=False, timeout=None, cwd=None)
```

- `args`：要执行的命令及其参数，可以是字符串形式或列表形式。
- `stdin`、`stdout`、`stderr`：指定输入、输出、错误的管道。可以是 `subprocess.PIPE`、`subprocess.DEVNULL`、文件对象或文件描述符。
- `shell`：如果为 `True`，则在系统 shell 中执行命令。
- `timeout`：设置命令运行的超时时间。
- `cwd`：设置子进程的工作目录。

## 示例：
```python
import subprocess

## 执行命令，并等待其完成
return_code = subprocess.call(['ls', '-l'])

if return_code == 0:
    print("Command executed successfully!")
else:
    print("Command failed!")
```

`subprocess.call()` 执行给定的命令，等待其完成，并返回子进程的退出状态码。如果命令成功执行，则返回码为 0，否则为非零值。与 `subprocess.run()` 不同，`subprocess.call()` 不支持捕获子进程的输出，仅返回子进程的退出状态。



## check_output()

`subprocess.check_output()` 是 `subprocess` 模块中的一个函数，用于执行系统命令并获取其输出。与 `subprocess.run()` 或 `subprocess.call()` 不同，`check_output()` 函数直接返回子进程的标准输出，并在命令执行失败时引发 `CalledProcessError` 异常。

## 语法：
```python
subprocess.check_output(args, *, stdin=None, stderr=None, shell=False, timeout=None, text=None, encoding=None, errors=None, universal_newlines=None)
```

## 参数说明：
- `args`：要执行的命令及其参数，可以是字符串形式或列表形式。
- `stdin`、`stderr`：指定输入、错误的管道。可以是 `subprocess.PIPE`、`subprocess.DEVNULL`、文件对象或文件描述符。
- `shell`：如果为 `True`，则在系统 shell 中执行命令。
- `timeout`：设置命令运行的超时时间。
- `text`、`encoding`、`errors`：用于处理文本输入输出的参数。
- `universal_newlines`：是否将输入和输出流作为文本流处理（在 Python 3 中默认为 True）。

## 示例：
```python
import subprocess

## 执行命令，并获取输出
output = subprocess.check_output(['ls', '-l'], text=True)

print("Output:", output)
```

在这个示例中，`subprocess.check_output()` 执行 `ls -l` 命令，并返回其输出。如果命令执行失败，将会引发 `CalledProcessError` 异常。与 `subprocess.run()` 或 `subprocess.call()` 不同，`check_output()` 函数专注于获取命令的输出，而不返回退出状态码。

## ---



## Popen()

`subprocess.Popen()` 允许更复杂的控制和与子进程的交互：

```python
import subprocess

## 打开子进程，执行命令
process = subprocess.Popen(['echo', 'Hello, subprocess!'], stdout=subprocess.PIPE)

## 读取子进程的输出
output, _ = process.communicate()
print(output.decode())
```



## 进程间通信

通过管道实现进程间通信：

```python
import subprocess

## 创建子进程并建立管道通信
p1 = subprocess.Popen(['cat', 'file.txt'], stdout=subprocess.PIPE)
p2 = subprocess.Popen(['grep', 'pattern'], stdin=p1.stdout, stdout=subprocess.PIPE)
p1.stdout.close()  # 关闭 p1 的输出流，以便在 p2 中触发文件读取
output = p2.communicate()[0]
print(output.decode())
```

`subprocess` 模块提供了强大的工具来管理和与外部进程交互，但在处理输入输出、错误处理和与子进程交互时需要小心，以避免潜在的死锁和阻塞。



## CompletedProcess()





