---
title: "argparse"
---

# argparse 模块概述

`argparse` 是 Python 标准库中用于处理命令行参数的模块，它提供了一种简单而灵活的方式来解析命令行参数，并生成帮助文档。使用 `argparse` 可以轻松地创建命令行工具，以便用户可以通过命令行界面与程序进行交互。



## 位置参数

Positional Arguments

- 位置参数是命令行参数的一种类型，它们是根据它们在命令行中的位置来解析的，通常是在程序名称之后提供的。
- **位置参数通常用于表示必需的输入，用户必须提供它们以正确运行程序。**
- 在 `argparse` 中，你可以通过 `add_argument()` 方法来定义位置参数。

示例：

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("input_file", help="Input file path")
parser.add_argument("output_file", help="Output file path")

args = parser.parse_args()

print("Input file:", args.input_file)
print("Output file:", args.output_file)
```

在上述示例中，`input_file` 和 `output_file` 都是位置参数，用户必须按照指定的顺序提供它们，例如：

```
python my_tool.py input.txt output.txt
```

位置参数的顺序非常重要，因为它们是根据它们在命令行中的位置来解析的。



## 选项参数

Optional Arguments

- 选项参数是命令行参数的另一种类型，它们通常是以前缀 `-` 或 `--` 开头的，用户可以选择是否提供它们。
- **选项参数通常用于配置程序的行为，不是必需的输入。**
- 在 `argparse` 中，你可以通过 `add_argument()` 方法来定义选项参数。

示例：

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--verbose", action="store_true", help="Enable verbose mode")
parser.add_argument("--threshold", type=float, help="Threshold value")

args = parser.parse_args()

print("Verbose mode:", args.verbose)
print("Threshold value:", args.threshold)
```

在上述示例中，`--verbose` 和 `--threshold` 都是选项参数，用户可以选择提供它们，例如：

```
python my_tool.py --verbose --threshold 0.5
```

选项参数通常是用来配置程序的特定选项或标志，而不是作为程序输入的一部分。







# ArgumentParser

https://docs.python.org/3/library/argparse.html#argumentparser-objects

要使用 `ArgumentParser`，首先需要创建一个 `ArgumentParser` 对象，然后在其上定义你的命令行参数。

以下是 `ArgumentParser` 类的实例化语法以及常用的参数配置选项的完整列表：

```python
import argparse

# 创建 ArgumentParser 对象
parser = argparse.ArgumentParser(
    prog=None,  # 用于指定程序的名称，默认为 sys.argv[0]
    usage=None,  # 用于自定义使用说明，默认会自动生成
    description=None,  # 工具的简短描述，显示在帮助信息中
    epilog=None,  # 工具的结尾描述，显示在帮助信息的末尾
    parents=[],  # 允许继承其他 ArgumentParser 对象的参数配置
    formatter_class=argparse.HelpFormatter,  # 自定义帮助信息的格式化类
    prefix_chars='-',  # 用于指定可选参数标志的前缀字符，默认为 '-'
    fromfile_prefix_chars=None,  # 用于指定读取参数配置文件的前缀字符，默认不启用
    argument_default=None,  # 参数的默认值，默认为 None
    conflict_handler='error',  # 解决参数冲突的策略，默认为 'error'
    add_help=True,  # 是否添加默认的 -h/--help 参数
    allow_abbrev=True  # 是否允许参数缩写，默认为 True
)
```





## 范例：创建 ArgumentParser 对象

```python
import argparse

# 创建一个名为 parser 的 ArgumentParser 对象，并使用 description 参数提供了工具的简短描述。
parser = argparse.ArgumentParser(description="My command-line tool")
```



# print_help()

打印工具的帮助信息。

## 范例：1

```python
import argparse

parser = argparse.ArgumentParser(description='My command-line tool')

parser.print_help()
```

当你运行这段代码时，它会打印出如下帮助信息：

```
usage: script.py [-h]

My command-line tool

optional arguments:
  -h, --help  show this help message and exit
```

这个示例中只有一个默认的帮助参数 `-h`，因为还没有定义其他的命令行参数。如果你要添加其他参数，可以在 `ArgumentParser` 对象上使用 `add_argument()` 方法来定义它们。



# add_argument()

https://docs.python.org/3/library/argparse.html#the-add-argument-method

一旦创建了 `ArgumentParser` 对象，你可以使用其 `add_argument()` 方法来定义命令行参数。

下面是 `add_argument()` 方法的基本语法：

```python
add_argument(name or flags, [action], [type], [default], [help], [choices], [required])
```

每个参数的含义如下：

- `name or flags`（必需）：参数的名称或标志。可以是一个**位置参数的名称或一个带有前缀 `-` 或 `--` 的可选参数标志**。这个参数可以是一个字符串或一个字符串列表，允许你为参数定义多个不同的名称或标志。例如，"input"、"--input"、["-i", "--input"] 都是有效的。
- `action`（可选）：参数的行为。默认为 "store"，表示将参数值存储在命名空间中。常见的值包括：
  - "store"：将参数值存储在命名空间中。
  - "store_const"：将常数值存储在命名空间中。
  - "store_true"：将 `True` 存储在命名空间中（用于标志参数的肯定形式）。
  - "store_false"：将 `False` 存储在命名空间中（用于标志参数的否定形式）。
  - "append"：将多个参数值存储在列表中。
  - "count"：统计参数出现的次数。
- `type`（可选）：参数的数据类型。指定参数值应该被解释为何种数据类型，如 `int`、`float`、`str` 等。`type` 可以是内置类型或自定义类型。
- `default`（可选）：参数的默认值。如果用户未提供参数值，将使用默认值。
- `help`（可选）：参数的帮助文本。当用户运行程序时，可以通过 `--help` 标志来查看帮助文本。
- `choices`（可选）：可接受的参数值的列表。如果指定了 `choices`，则只有在用户提供的参数值在列表中时，参数才会被接受。
- `required`（可选）：指定参数是否是必需的。默认为 `False`，表示参数是可选的。如果将其设置为 `True`，则用户必须提供参数值。
- `metavar`（可选）：用于自定义参数在帮助信息中的显示方式。
- `nargs`（可选）：指定参数应该接受的参数个数。

PS：

- `add_argument()` 方法接受多个参数，其中最重要的是参数的名称和参数的配置选项。

- `add_argument()` 方法可以多次调用，以定义多个命令行参数。一旦定义了所有参数，你可以通过 `parse_args()` 方法解析用户提供的命令行参数，并访问它们的值以执行相应的操作。



## action

在`argparse`模块的`add_argument`函数中，`action`参数用于指定在解析命令行参数时应该执行的动作。以下是几个常见的`action`值及其效果：

1. `store`（默认）: 将命令行参数的值存储起来。这是最常见的动作，参数值将被存储在解析结果的相应属性中。

    ```python
    parser.add_argument('--foo', action='store')
    ```

2. `store_const`: 将常量值存储在属性中。通常与`const`一起使用，表示如果命令行中包含了某个选项，则将设定的常量值存储到相应的属性中。

    ```python
    parser.add_argument('--foo', action='store_const', const=42)
    ```

3. `store_true`和`store_false`: 用于存储布尔值`True`或`False`，通常用于处理命令行中的标志。

    ```python
    parser.add_argument('--foo', action='store_true')
    parser.add_argument('--bar', action='store_false')
    ```

4. `append`: 将命令行参数的值追加到列表中，适用于处理多个相同选项的情况。

    ```python
    parser.add_argument('--foo', action='append')
    ```

5. `count`: 计算命令行参数出现的次数，适用于处理计数类型的选项。

    ```python
    parser.add_argument('--verbose', action='count')
    ```

这些`action`选项允许您根据需求指定命令行参数的处理方式。



### store_true

当使用`action='store_true'`时，通常用于处理命令行中的布尔标志。以下是一个简单的例子：

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--verbose', action='store_true', help='Enable verbose mode')

args = parser.parse_args()

if args.verbose:
    print('Verbose mode is enabled.')
else:
    print('Verbose mode is disabled.')
```

在这个例子中，`--verbose`是一个布尔标志，当在命令行中指定了该标志时，`args.verbose`的值将为`True`，否则为`False`。这种方式常用于控制程序的输出级别或启用某些调试功能。



## nargs

`nargs`是`argparse`模块中`add_argument`函数的一个参数，用于指定命令行参数应当消耗的命令行参数个数。

- 如果`nargs`的值是一个整数，表示参数应当消耗这么多个命令行参数。例如，`nargs=2`表示该参数应当消耗两个命令行参数。
  
- 如果`nargs`的值是`'?'`，表示该参数可以消耗零个或一个命令行参数。

- 如果`nargs`的值是`'*'`，表示该参数可以消耗零个或多个命令行参数。

- 如果`nargs`的值是`'+'`，表示该参数可以消耗一个或多个命令行参数。

- 如果`nargs`的值是一个整数后跟`'?'`，表示消耗指定数量的参数，但是也可以不提供（零个或一个参数）。

例如：
```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--foo', nargs=2)
args = parser.parse_args(['--foo', 'bar', 'baz'])
print(args.foo)  # 输出：['bar', 'baz']
```

在这个例子中，`--foo`参数需要消耗两个命令行参数。



## 范例：位置参数

```py
import argparse

parser = argparse.ArgumentParser(description='My command-line tool')

parser.add_argument("name", help="Your name")

parser.print_help()
```

**`parser.add_argument("name", help="Your name")`：**

- 使用 `add_argument()` 方法定义了一个位置参数 `name`，并提供了帮助信息。这意味着用户在运行脚本时**必须提供**一个名为 `name` 的参数。

当你运行这段代码时，它会打印出如下帮助信息：

```
usage: script.py [-h] [--age AGE] name

My command-line tool

positional arguments:
  name        Your name

options:
  -h, --help  show this help message and exit
```



## 范例：选项参数

```py
import argparse

parser = argparse.ArgumentParser(description='My command-line tool')

parser.add_argument("--age", type=int, help="Your age")

parser.print_help()
```

**`parser.add_argument("--age", type=int, help="Your age")`：**

- 使用 `add_argument()` 方法定义了一个可选参数 `--age`，并指定了参数的数据类型为整数 (`int`)。这个参数是**可选**的，用户可以选择是否提供自己的年龄。

当你运行这段代码时，它会打印出如下帮助信息：

```
usage: script.py [-h] [--age AGE] name

My command-line tool

options:
  -h, --help  show this help message and exit
  --age AGE   Your age
```



## 范例：位置+选项参数  - 1

```python
import argparse

parser = argparse.ArgumentParser(description='My command-line tool')

parser.add_argument("name", help="Your name")
parser.add_argument("--age", type=int, help="Your age")

parser.print_help()
```

当你运行这段代码时，它会打印出如下帮助信息：

```
usage: script.py [-h] [--age AGE] name

My command-line tool

positional arguments:
  name        Your name

optional arguments:
  -h, --help  show this help message and exit
  --age AGE   Your age
```

这里的帮助信息说明了工具的描述（"My command-line tool"），定义了一个必需的位置参数 `name` 和一个可选参数 `--age`，并提供了对这两个参数的帮助信息。用户可以通过运行你的脚本并提供 `name` 和可选的 `--age` 参数来使用你的命令行工具。



## 范例：定义位置+选项参数  - 2

```python
import argparse

parser = argparse.ArgumentParser(description='My command-line tool')

parser.add_argument("input", help="Input file path")
parser.add_argument("--output-file", help="Output file path", default="output.txt")
parser.add_argument("--verbose", action="store_true", help="Enable verbose mode")
parser.add_argument("--threshold", type=float, help="Threshold value")

parser.print_help()
```

- **`parser.add_argument("input", help="Input file path")`：**
  - 使用 `add_argument()` 方法定义了一个位置参数 `input`，并提供了帮助信息。这意味着用户在运行脚本时需要提供一个名为 `input` 的参数。
- **`parser.add_argument("--output-file", help="Output file path", default="output.txt")`：**
  - 使用 `add_argument()` 方法定义了一个可选参数 `--output-file`，并提供了帮助信息以及一个默认值 `"output.txt"`。用户可以选择是否提供输出文件路径，如果不提供，默认为 `"output.txt"`。
- **`parser.add_argument("--verbose", action="store_true", help="Enable verbose mode")`：**
  - 定义了一个可选参数 `--verbose`，并使用 `action="store_true"` 将其定义为布尔标志参数，意味着如果用户提供了 `--verbose` 参数，则其值为 `True`，否则为 `False`。帮助信息说明了这是用于启用详细模式的参数。
- **`parser.add_argument("--threshold", type=float, help="Threshold value")`：**
  - 定义了一个可选参数 `--threshold`，并指定了参数的数据类型为浮点数 (`float`)。用户可以选择是否提供阈值参数，如果提供了，它会被解释为浮点数。帮助信息说明了这是一个阈值参数。

当你运行这段代码时，它会打印出如下帮助信息：

```
usage: script.py [-h] [--output-file OUTPUT_FILE] [--verbose] [--threshold THRESHOLD] input

My command-line tool

positional arguments:
  input                 Input file path

optional arguments:
  -h, --help            show this help message and exit
  --output-file OUTPUT_FILE
                        Output file path (default: output.txt)
  --verbose             Enable verbose mode
  --threshold THRESHOLD
                        Threshold value
```

这里的帮助信息包括工具的描述，定义了一个必需的位置参数 `input` 和多个可选参数，每个参数都有相应的说明和使用方式。用户可以通过运行你的脚本并提供适当的参数来使用你的命令行工具。



## 范例：可选参数（带有默认值）

```py
parser.add_argument("--output_file", default="output.txt", help="Output file path")
```



## 范例：参数是必需的

```py
parser.add_argument("--required_arg", required=True, help="A required argument")
```



## 范例：布尔标志参数（默认为 False）

```py
parser.add_argument("--verbose", action="store_true", help="Enable verbose mode")
```



## 范例：整数类型参数

```py
parser.add_argument("-m", type=int, help="Specify the size of memory occupied (MB)")
```

```py
# cat test_argparse.py 
#!/usr/local/bin/python3
import argparse

parser = argparse.ArgumentParser(description="Memory and CPU stress testing tools")

parser.add_argument("-m", type=int, help="Specify the size of memory occupied (MB)")

parser.print_help()


# ./test_argparse.py 
usage: test_argparse.py [-h] [-m M]

Memory and CPU stress testing tools

options:
  -h, --help  show this help message and exit
  -m M        Specify the size of memory occupied (MB)
```



## 范例：参数值必须在指定的列表中

```python
parser.add_argument("--color", choices=["red", "green", "blue"], help="Choose a color")
```



## 范例：nargs

`nargs` 是 `argparse` 中用于控制命令行参数接受多个值的选项之一。它允许你指定参数应该接受多少个值，以及如何将这些值解释和存储。以下是一些常见的 `nargs` 使用方式和示例：

1. **nargs='?' - 接受零个或一个值**:

   这是默认的 `nargs` 值，参数可以不提供值，也可以提供一个值。在解析时，如果参数提供了值，它将作为字符串存储，如果没有提供值，则存储为 `None`。

   示例：
   
   ```python
   import argparse

   parser = argparse.ArgumentParser()
   parser.add_argument("--input", nargs='?', help="Input file path")

   args = parser.parse_args()

   print("Input file:", args.input)
   ```

   用户可以选择提供或不提供 `--input` 参数的值：

   ```
   python my_tool.py --input input.txt
   # 或
   python my_tool.py --input
   ```

2. **nargs='*' - 接受零个或多个值**:

   这表示参数可以不提供值，也可以提供一个或多个值，这些值将以列表的形式存储。

   示例：
   
   ```python
   import argparse

   parser = argparse.ArgumentParser()
   parser.add_argument("--files", nargs='*', help="List of input files")

   args = parser.parse_args()

   print("Input files:", args.files)
   ```

   用户可以选择提供多个文件：

   ```
   python my_tool.py --files input1.txt input2.txt input3.txt
   ```

   如果没有提供文件名，`args.files` 将是一个空列表 `[]`。

3. **nargs='+' - 接受一个或多个值**:

   这表示参数必须提供至少一个值，并且可以提供多个值，这些值将以列表的形式存储。

   示例：
   
   ```python
   import argparse

   parser = argparse.ArgumentParser()
   parser.add_argument("--files", nargs='+', help="List of input files")

   args = parser.parse_args()

   print("Input files:", args.files)
   ```

   用户必须提供至少一个文件名：

   ```
   python my_tool.py --files input1.txt input2.txt input3.txt
   ```

4. **nargs=int - 接受指定数量的值**:

   使用整数值作为 `nargs`，你可以明确指定参数应该接受多少个值。这些值将以列表的形式存储。

   示例：
   
   ```python
   import argparse
   
   parser = argparse.ArgumentParser()
   parser.add_argument("--numbers", nargs=3, type=int, help="Three numbers")
   
   args = parser.parse_args()
   
   print("Numbers:", args.numbers)
   ```

   用户必须提供三个整数值：

   ```
   python my_tool.py --numbers 1 2 3
   ```

   如果提供的值不足三个或超过三个，将会引发错误。

`nargs` 的使用方式可以根据你的需求来选择，它允许你处理需要接受多个值的命令行参数，如文件列表、数字序列等。





# parse_args()

一旦你定义了命令行参数，可以通过 `parse_args()` 方法来解析用户提供的命令行参数，并将它们存储在一个命名空间对象中。



## 范例：1

```python
import argparse

# 创建 ArgumentParser 对象
parser = argparse.ArgumentParser(description="My command-line tool")

# 定义命令行参数
parser.add_argument("name", help="Your name")
parser.add_argument("--age", type=int, help="Your age")

# 解析命令行参数
args = parser.parse_args()

print(args)
```

使用 `parser.parse_args()` 方法来解析用户提供的命令行参数，并将其存储在 `args` 对象中，最后打印 `args` 对象。

假设你运行这个脚本，并提供以下输入参数：

```
python my_tool.py John --age 30
```

在这种情况下，脚本的执行结果将如下所示：

```
Namespace(name='John', age=30)
```

- `Namespace` 是 `argparse` 模块中的一个命名空间对象，用于存储解析后的命令行参数的值。

- `name='John'` 表示位置参数 `name` 的值为 `'John'`，这是因为你在命令行中提供了一个位置参数，值为 `'John'`。

- `age=30` 表示可选参数 `--age` 的值为 `30`，这是因为你在命令行中提供了 `--age 30`，并且使用了 `type=int` 将其解释为整数类型。

这样，你可以在程序中通过访问 `args` 对象的属性来获取命令行参数的值，例如：

```python
print("Your name is:", args.name)
print("Your age is:", args.age)
```

这将输出：

```
Your name is: John
Your age is: 30
```

你可以使用这些值来在程序中执行相应的操作，根据用户提供的命令行参数来定制程序的行为。

## 范例：2

```py
# cat ./modules/test_argparse.py
#!/usr/local/bin/python3
import argparse

parser = argparse.ArgumentParser(description="Memory and CPU stress testing tools")

parser.add_argument("-m", type=int, help="Specify the size of memory occupied (MB)")

args = parser.parse_args()

print(type(args))
print(args)
print(args.m)


# ./modules/test_argparse.py
<class 'argparse.Namespace'>
Namespace(m=None)
None


# ./modules/test_argparse.py -m 1024
<class 'argparse.Namespace'>
Namespace(m=1024)
1024
```



## 范例：3

```python
import argparse

# 创建 ArgumentParser 对象
parser = argparse.ArgumentParser(description="My command-line tool")

# 定义命令行参数
parser.add_argument("input", help="Input file path")
parser.add_argument("--output-file", help="Output file path", default="output.txt")
parser.add_argument("--verbose", action="store_true", help="Enable verbose mode")
parser.add_argument("--threshold", type=float, help="Threshold value")

# 解析命令行参数
args = parser.parse_args()

# 访问命令行参数值
input_file = args.input
output_file = args.output_file
verbose_mode = args.verbose
threshold_value = args.threshold

# 执行相应的操作，根据命令行参数的值
```

在命令行中运行这个脚本，可以像下面这样提供参数：

```
python my_tool.py input.txt --output-file output.csv --verbose --threshold 0.5
```

然后，你可以通过访问相应的变量来获取命令行参数的值，以在程序中执行相应的操作。



## 范例：4

```py
import ctypes
import time
import sys
import argparse

def occupy_memory(size_mb):
    size_bytes = size_mb * 1024 * 1024
    memory_block = ctypes.create_string_buffer(size_bytes)
    while True:
        # Access the memory to ensure it's not optimized away
        for i in range(0, size_bytes, 4096):
            memory_block[i] = b'x'
        time.sleep(1)


def main():
    parser = argparse.ArgumentParser(description="Memory and CPU stress testing tools")

    parser.add_argument("-m", type=int, help="Specify the size of memory occupied (MB)")
    
    args = parser.parse_args()

    if len(sys.argv) < 2:
        parser.print_help()
    else:
        occupy_memory(args.m)

if __name__ == "__main__":
    main()
```





# ---





# sys.argv

在 Python 中，你可以使用 `sys.argv` 来访问命令行参数。

`sys.argv` 是一个包含命令行参数的列表，其中第一个元素是脚本的名称，随后的元素是用户提供的参数，如下所示：

```python
# cat 3.py 
#!/usr/local/bin/python3
import sys

print(sys.argv)


# ./3.py -la 11 22
['./3.py', '-la', '11', '22']
```

以下是一个简单的示例，演示如何使用 `sys.argv` 来打印用户提供的命令行参数：

```python
import sys

# 获取命令行参数
arguments = sys.argv

# 打印脚本名称
print(f"脚本名称：{arguments[0]}")

# 打印用户提供的参数
if len(arguments) > 1:
    print("用户提供的参数：")
    for arg in arguments[1:]:
        print(arg)
else:
    print("未提供任何参数。")
```

在命令行中运行这个脚本，并提供一些参数，例如：

```
python myscript.py arg1 arg2 arg3
```

脚本将会打印出：

```
脚本名称：myscript.py
用户提供的参数：
arg1
arg2
arg3
```

如上所示，`sys.argv` 的第一个元素是脚本的名称，后面的元素是用户提供的参数。你可以根据需要进一步处理这些参数，以执行你的程序逻辑。





# ---



# 实现`ls`命令的功能

**要求：**

实现`ls`命令的功能，以及`-l`、`-a` `--all`、`-h`选项的功能。

- `ls`显示路径路径下的文件列表
- `-l`详细列表显示
- `-a` 和`--all`显示包含.开头的文件
- `-l`和`-h`配合人性化显示文件大小，例如：1K、1M、1G等



待优化！！

```python
from pathlib import Path
import argparse

# 创建 ArgumentParser 对象
parser = argparse.ArgumentParser(description="List information about the FILEs (the current directory by default).")

# 定义命令行参数
parser.add_argument("ls", help="List files or directories in the current directory")
#parser.add_argument("--age", type=int, help="Your age")

# 解析命令行参数
args = parser.parse_args()

# 访问参数值
print(args)
print(args.ls)

def ls():
    path = Path('.')
    currents = path.glob('*')
    for x in currents:
        print(x)

if args.ls == 'ls':
    ls()

```



# 1

# argparser

https://docs.python.org/3/library/argparse.html

`argparse` 是 Python 中用于解析命令行参数的标准库模块。它允许你编写命令行界面的应用程序，使用户能够通过命令行输入参数来控制程序的行为。以下是使用 `argparse` 模块的基本步骤：

1. 导入 `argparse` 模块：

```python
import argparse
```

2. 创建一个 `ArgumentParser` 对象，该对象用于定义和解析命令行参数：

```python
parser = argparse.ArgumentParser(description='描述你的命令行工具的用途')
```

3. 使用 `add_argument` 方法定义命令行参数：

```python
parser.add_argument('arg_name', help='参数的帮助文本')
```

`arg_name` 是参数的名称，可以在命令行中使用。`help` 参数是参数的帮助文本，当用户运行你的程序时，可以通过添加 `--help` 或 `-h` 参数来查看帮助信息。

4. 使用 `parse_args()` 方法解析命令行参数：

```python
args = parser.parse_args()
```

5. 程序现在可以使用 `args` 对象中的属性来访问用户提供的参数值：

```python
print(args.arg_name)
```

这里是一个完整的示例，演示如何使用 `argparse` 模块创建一个接受两个整数参数并计算它们和的简单命令行工具：

```python
import argparse

def add_numbers():
    parser = argparse.ArgumentParser(description='计算两个整数的和')
    parser.add_argument('num1', type=int, help='第一个整数')
    parser.add_argument('num2', type=int, help='第二个整数')
    
    args = parser.parse_args()
    result = args.num1 + args.num2
    print(f'结果：{result}')

if __name__ == '__main__':
    add_numbers()
```

在命令行中运行该程序时，你可以像这样提供两个整数参数：

```
python myprogram.py 10 20
```

`argparse` 将解析这些参数并执行相应的操作。

这只是 `argparse` 的基本用法，它还支持许多其他功能，如可选参数、默认值、互斥参数组等。





