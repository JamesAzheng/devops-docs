---
title: "re"
---


# re 基础语法

`re` 模块是Python中用于处理正则表达式的标准库。以下是使用 `re` 模块的基本步骤：

1. **导入 `re` 模块**：首先，需要导入 `re` 模块。

   ```python
   import re
   ```

2. **编译正则表达式模式**：使用 `re.compile()` 函数将正则表达式模式编译为一个可重用的正则表达式对象。

   ```python
   pattern = re.compile(r'正则表达式模式')
   ```

   在这里，`r` 前缀表示原始字符串，以防止反斜杠字符 `\` 被转义。

3. **使用正则表达式对象进行匹配和搜索**：有几种方法可用于在字符串中执行匹配和搜索操作：

   - **match()**：从字符串的开头开始匹配。

     ```python
     result = pattern.match(string)
     ```

   - **search()**：在字符串中搜索匹配，返回第一个匹配项。

     ```python
     result = pattern.search(string)
     ```

   - **findall()**：返回字符串中所有匹配项的列表。

     ```python
     results = pattern.findall(string)
     ```

   - **finditer()**：返回一个迭代器，用于迭代所有匹配项。

     ```python
     results = pattern.finditer(string)
     for match in results:
         print(match.group())
     ```

4. **处理匹配结果**：匹配结果通常是 `Match` 对象，你可以使用 `group()` 方法来获取匹配的文本。

   ```python
   if result:
       matched_text = result.group()
   ```

   如果需要捕获分组中的内容，可以使用 `groups()` 方法或 `group(1)`, `group(2)` 等。

5. **其他操作**：`re` 模块还提供了其他一些方法和标志，用于执行不同类型的匹配和搜索，例如，使用 `sub()` 方法替换匹配项，或者使用标志来控制匹配的行为，如忽略大小写、多行匹配等。

这只是一个简单的 `re` 模块入门，正则表达式本身可以非常复杂，具体取决于你的需求。你需要根据要解决的问题和正则表达式的复杂性来选择适当的方法和模式。



# flags

`re` 模块中的 `re.compile()`、`re.match()`、`re.search()`、`re.fullmatch()` 等函数可以接受一个可选的 `flags` 参数，用于指定不同的匹配选项和标志。以下是一些常见的 `flags` 参数，以及它们的作用：

1. `re.IGNORECASE`（或 `re.I`）：忽略大小写。
   - 例如：`re.compile(r'apple', re.IGNORECASE)` 将匹配 "apple"、"Apple"、"APPLE" 等。

2. `re.MULTILINE`（或 `re.M`）：多行匹配。
   - 当启用此标志时，`^` 和 `$` 将匹配字符串的每一行的开头和结尾，而不仅仅是整个字符串的开头和结尾。
   - 例如：`re.compile(r'^start', re.MULTILINE)` 可以匹配 "start" 开头的每一行。

3. `re.DOTALL`（或 `re.S`）：匹配所有字符，包括换行符。
   - 当启用此标志时，`.` 将匹配任何字符，包括换行符 `\n`。
   - 例如：`re.compile(r'.+', re.DOTALL)` 可以匹配包括换行符的多行文本。

4. `re.VERBOSE`（或 `re.X`）：忽略正则表达式中的空白和注释。
   - 当启用此标志时，您可以在正则表达式中使用空格和 `#` 注释，使其更易读。
   - 例如：`re.compile(r'''
     \d +  # 匹配一个或多个数字
     [ ]?  # 匹配可选的空格
     [a-z]+  # 匹配一个或多个小写字母
     ''', re.VERBOSE)`

5. `re.ASCII`（或 `re.A`）：将字符集限制为 ASCII。
   - 当启用此标志时，正则表达式只匹配 ASCII 字符集中的字符。
   - 例如：`re.compile(r'\w+', re.ASCII)` 将只匹配 ASCII 字母、数字和下划线。

这些是一些常见的 `flags` 参数，但还有其他可用的标志，可以根据需要进行设置。您可以根据具体情况在 `re.compile()` 或其他 `re` 模块函数中选择适当的标志，以满足您的正则表达式匹配需求。

## 简述

- `re.IGNORECASE`：忽略大小写
- `re.MULTILINE`：多行模式，意味着正则表达式可以跨越多行
- `re.DOTALL`：匹配所有字符，包括换行符
- `re.UNICODE`：使用 Unicode 字符集进行匹配
- `re.LOCALE`：使用当前区域设置进行匹配
- `re.A`：贪婪模式，尽可能多地匹配
- `re.I`：忽略大小写
- `re.L`：使用 LRE 和 RLE 字符类
- `re.M`：多行模式
- `re.S`：使用 . 进行匹配，而不仅仅是换行符
- `re.U`：使用 Unicode 字符类



## 指定多个 flags

在 Python 中，可以通过按位或组合多个 `re` 模块的标志来指定正则表达式的匹配方式。例如：

```python
import re

pattern = re.compile(r'\d+')
string = "1234567890"
result = pattern.findall(string, re.IGNORECASE | re.MULTILINE)
print(result)  # 输出：['1234567890']
```

在这个例子中，我们使用了 `IGNORECASE` 和 `MULTILINE` 标志来指定正则表达式的匹配方式。这意味着将忽略大小写并在多行模式下进行匹配。`findall()` 函数将返回一个包含所有匹配结果的列表，在这个例子中，它是 "1234567890" 中的所有数字，不管大小写如何。

可以通过按位或组合任意数量的标志来指定正则表达式的匹配方式，只需要在 `findall()` 函数中将它们作为第三个参数传入即可。

# 编译正则对象

## re.compile()

**预编译，得到正则对象**

`re.compile()` 函数是 Python 中的 `re` 模块提供的方法，用于处理正则表达式。正则表达式（通常缩写为正则表达式或 regex）是用于模式匹配和文本操作的强大工具。

`re.compile()` 函数用于将正则表达式模式编译为正则表达式对象。然后，可以使用这个编译后的对象进行各种操作，例如基于指定模式的搜索、匹配和文本替换。

使用 `re.compile()` 编译模式还可以提高正则表达式操作的效率，如果您计划多次使用相同的模式。

以下是`re.compile()`的基本语法：

```python
import re

pattern = re.compile(r'你的正则表达式')
```

在上面的示例中，`r'你的正则表达式'` 是您想要编译的正则表达式模式。然后，您可以使用 `pattern` 对象来在字符串上执行正则表达式操作。

以下是如何使用 `re.compile()` 在字符串中搜索模式的示例：

```python
import re

pattern = re.compile(r'\d+')  # 编译一个匹配一个或多个数字的模式
text = "产品的价格是 $25.99。"

match = pattern.search(text)  # 在文本中搜索模式
if match:
    print("找到:", match.group())  # 打印匹配的文本（在这种情况下是 "25"）
else:
    print("未找到模式。")
```

在此示例中，`re.compile()` 用于创建一个编译后的正则表达式模式，以匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.search(text)` 在给定的 `text` 字符串中搜索这个模式，如果找到匹配项，就会打印匹配的文本。

使用 `re.compile()` 尤其有用的情况是在代码中多次重复使用相同的正则表达式模式，因为它避免了每次使用时都重新编译模式，从而提高了性能。





# 单次匹配

## re.match()

**match 是单次匹配，并不做全文搜索，而且要求必须是从头匹配，索引0**

`re.match()` 是 Python 中的 `re` 模块提供的一个用于正则表达式匹配的函数。它用于检查一个字符串是否以指定的正则表达式模式开头。如果字符串的开头与模式匹配，则返回匹配对象；否则，返回 `None`。

下面是 `re.match()` 的基本语法：

```python
import re

match_object = re.match(pattern, string, flags=0)
```

- `pattern` 是要匹配的正则表达式模式。
- `string` 是要在其开头执行匹配的字符串。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

如果模式与字符串的开头匹配，`re.match()` 返回一个匹配对象，否则返回 `None`。您可以使用匹配对象的方法来获取有关匹配的信息。

以下是一个示例，演示如何使用 `re.match()` 来检查字符串是否以特定模式开头：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "123abc456"

match = pattern.match(text)  # 在字符串开头执行匹配
if match:
    print("匹配到的文本:", match.group())  # 打印匹配到的文本（在这种情况下是 "123"）
else:
    print("模式不在字符串开头。")
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.match(text)` 来在 `text` 字符串的开头执行匹配。如果匹配成功，我们使用 `match.group()` 来获取匹配到的文本。

请注意，`re.match()` 只会尝试匹配字符串的开头。如果您需要在整个字符串中查找匹配项，可以使用 `re.search()` 函数。



## re.fullmatch()

**fullmatch 是单次匹配，要求指定的区间全部匹配**

`re.fullmatch()` 是 Python 中的 `re` 模块提供的一个用于执行完全匹配的函数。它用于检查整个输入字符串是否与指定的正则表达式模式完全匹配。如果整个字符串与模式完全匹配，`re.fullmatch()` 返回一个匹配对象；否则，返回 `None`。

以下是 `re.fullmatch()` 的基本语法：

```python
import re

match_object = re.fullmatch(pattern, string, flags=0)
```

- `pattern` 是要执行完全匹配的正则表达式模式。
- `string` 是要匹配的输入字符串。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

如果整个输入字符串与模式完全匹配，`re.fullmatch()` 返回一个匹配对象，您可以使用它来获取有关匹配的信息。如果没有找到完全匹配项，它将返回 `None`。

以下是一个示例，演示如何使用 `re.fullmatch()` 来执行完全匹配：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "123"

match = pattern.fullmatch(text)  # 执行完全匹配
if match:
    matched_text = match.group()  # 获取匹配的文本
    print("完全匹配的文本:", matched_text)  # 打印完全匹配的文本（在这种情况下是 "123"）
else:
    print("没有找到完全匹配项。")
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.fullmatch(text)` 来执行完全匹配。如果找到完全匹配项，我们使用 `match.group()` 方法来获取匹配的文本，然后将其打印出来。

与 `re.match()` 和 `re.search()` 不同，`re.fullmatch()` 要求整个输入字符串与模式完全匹配，而不仅仅是一部分。如果您需要执行部分匹配，可以使用 `re.match()` 或 `re.search()`。



## re.search()

**search 是单次匹配，并不做全文搜索，但是从 index 为 0 开始向后找到一次，找不到返回 None**

`re.search()` 是 Python 中的 `re` 模块提供的一个用于正则表达式搜索的函数。它用于在输入字符串中查找第一个与正则表达式模式匹配的子字符串。如果找到匹配项，`re.search()` 返回一个匹配对象；否则，返回 `None`。

以下是 `re.search()` 的基本语法：

```python
import re

match_object = re.search(pattern, string, flags=0)
```

- `pattern` 是要搜索的正则表达式模式。
- `string` 是要在其中执行搜索的输入字符串。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

如果找到匹配项，`re.search()` 返回一个匹配对象，您可以使用它来获取有关匹配的信息。如果没有找到匹配项，它将返回 `None`。

以下是一个示例，演示如何使用 `re.search()` 来查找字符串中的匹配项：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "The price is $25.99."

match = pattern.search(text)  # 在字符串中执行搜索
if match:
    print("匹配到的文本:", match.group())  # 打印匹配到的文本（在这种情况下是 "25"）
else:
    print("未找到匹配项。")
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.search(text)` 来在 `text` 字符串中执行搜索。如果找到匹配项，我们使用 `match.group()` 来获取匹配到的文本。

`re.search()` 在整个输入字符串中查找匹配项，因此它可以找到第一个匹配项，而不仅仅是字符串的开头。如果需要匹配整个字符串的开头，可以使用 `re.match()`。



# 全文搜索

## re.findall()

**findall，以列表的方式返回匹配的字符串**

`re.findall()` 是 Python `re` 模块提供的一个用于查找字符串中所有匹配项的函数。它通过在输入字符串中查找所有与正则表达式模式匹配的子字符串，并将这些匹配项以列表的形式返回。

以下是 `re.findall()` 的基本语法：

```python
import re

matches = re.findall(pattern, string, flags=0)
```

- `pattern` 是要用于查找的正则表达式模式。
- `string` 是要在其中查找匹配项的输入字符串。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

`re.findall()` 返回一个包含所有匹配项的列表。如果没有找到匹配项，它将返回一个空列表 `[]`。

以下是一个示例，演示如何使用 `re.findall()` 来查找字符串中的所有匹配项：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "The product costs $25.99 and the discount is 10%."

matches = pattern.findall(text)  # 查找所有匹配项
print("所有匹配项:", matches)  # 打印所有匹配项（在这种情况下是 ['25', '99', '10']）
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.findall(text)` 来查找 `text` 字符串中的所有匹配项，并将它们存储在 `matches` 列表中。

`re.findall()` 非常有用，特别是在需要提取文本中的多个匹配项时，例如提取文本中的所有数字、单词等。



## re.finditer()

**finditer 返回一个迭代器，每一个元素都是 match 实例**

`re.finditer()` 是 Python `re` 模块提供的一个用于查找字符串中所有匹配项的函数，类似于 `re.findall()`，但不同之处在于它返回一个迭代器，而不是一个列表。这意味着您可以逐个迭代处理每个匹配项，而无需一次性获取所有匹配项。

以下是 `re.finditer()` 的基本语法：

```python
import re

matches_iterator = re.finditer(pattern, string, flags=0)
```

- `pattern` 是要用于查找的正则表达式模式。
- `string` 是要在其中查找匹配项的输入字符串。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

`re.finditer()` 返回一个迭代器，您可以使用 `for` 循环或其他迭代方式逐个处理每个匹配项。每个迭代项都是一个匹配对象，您可以使用匹配对象的方法来获取有关匹配的信息。

以下是一个示例，演示如何使用 `re.finditer()` 来查找字符串中的所有匹配项：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "The product costs $25.99 and the discount is 10%."

matches_iterator = pattern.finditer(text)  # 查找所有匹配项

for match in matches_iterator:
    matched_text = match.group()  # 获取匹配的文本
    print("匹配项:", matched_text)  # 逐个打印匹配项（在这种情况下是 '25'、'99' 和 '10'）
```

在此示例中，我们使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.finditer(text)` 来查找 `text` 字符串中的所有匹配项，并将它们存储在 `matches_iterator` 迭代器中。接下来，我们使用 `for` 循环逐个处理每个匹配项，并使用 `match.group()` 方法获取匹配的文本。

`re.finditer()` 对于处理大量文本或需要逐个处理匹配项的情况非常有用，因为它不会一次性加载所有匹配项，从而节省内存。



# 匹配替换

## re.sub()

**sub 模式替换，可以指定至多替换的次数，返回替换的结果**

`re.sub()` 是 Python `re` 模块提供的一个用于在字符串中进行正则表达式替换的函数。它允许您通过正则表达式模式来搜索和替换匹配项，将匹配到的子字符串替换为指定的文本。`re.sub()` 返回一个新的字符串，其中所有匹配项都已被替换。

以下是 `re.sub()` 的基本语法：

```python
import re

new_string = re.sub(pattern, replacement, string, count=0, flags=0)
```

- `pattern` 是要用于搜索的正则表达式模式。
- `replacement` 是要用于替换匹配项的文本。
- `string` 是要在其中执行替换的输入字符串。
- `count` 是可选的，用于指定替换的最大次数。如果不指定，默认为替换所有匹配项。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

`re.sub()` 返回一个新的字符串，其中所有匹配项都已被替换为指定的文本。如果没有找到匹配项，返回的字符串与原始输入字符串相同。

以下是一个示例，演示如何使用 `re.sub()` 来执行正则表达式替换：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "The price is $25.99 and the discount is 10%."

new_text = pattern.sub("XX", text)  # 将所有匹配项替换为 "XX"
print("替换后的文本:", new_text)
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.sub("XX", text)` 来在 `text` 字符串中将所有匹配项替换为 "XX"。最终，我们打印了替换后的文本。

`re.sub()` 对于在文本中执行复杂的替换操作，例如将特定模式的文本替换为其他文本，非常有用。您还可以使用替换模式中的捕获组，以便在替换文本中包含匹配的一部分。



## re.subn()

**subn 模式替换，可以指定至多替换的次数，返回元组（替换的结果，替换的次数）**

`re.subn()` 是 Python `re` 模块提供的一个函数，用于在字符串中进行正则表达式替换，与 `re.sub()` 类似，但返回的不仅是替换后的新字符串，还包括替换的总次数。这个函数非常适合需要知道替换发生了多少次的情况。

以下是 `re.subn()` 的基本语法：

```python
import re

new_string, count = re.subn(pattern, replacement, string, count=0, flags=0)
```

- `pattern` 是要用于搜索的正则表达式模式。
- `replacement` 是要用于替换匹配项的文本。
- `string` 是要在其中执行替换的输入字符串。
- `count` 是可选的，用于指定替换的最大次数。如果不指定，默认为替换所有匹配项。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

`re.subn()` 返回一个包含两个元素的元组，第一个元素是替换后的新字符串，第二个元素是替换的总次数。

以下是一个示例，演示如何使用 `re.subn()` 进行正则表达式替换并获取替换的总次数：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "The price is $25.99 and the discount is 10%."

new_text, count = pattern.subn("XX", text)  # 将所有匹配项替换为 "XX"
print("替换后的文本:", new_text)
print("替换总次数:", count)
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.subn("XX", text)` 来在 `text` 字符串中将所有匹配项替换为 "XX"，并将替换的总次数存储在 `count` 变量中。最终，我们打印了替换后的文本和替换的总次数。

`re.subn()` 对于需要知道替换发生了多少次的情况非常有用，因为它允许您获取替换的统计信息。



# 分组

match、search 函数可以返回 match 对象；findall 返回字符串列表；finditer 返回一个个 match 对象

- **`match` 函数**：`re.match(pattern, string)` 函数尝试从字符串的开头匹配模式 `pattern`。如果字符串以模式开头，它返回一个匹配对象；否则，返回 `None`。匹配对象包含关于匹配的信息，包括匹配的文本和位置信息。
- **`search` 函数**：`re.search(pattern, string)` 函数在整个字符串中搜索模式 `pattern` 的第一个匹配项。如果找到匹配项，它返回一个匹配对象；否则，返回 `None`。与 `match` 不同，`search` 不要求模式从字符串开头开始匹配。
- **`findall` 函数**：`re.findall(pattern, string)` 函数在整个字符串中查找所有与模式 `pattern` 匹配的子字符串，并将它们以字符串列表的形式返回。不返回匹配对象，只返回匹配的文本。
- **`finditer` 函数**：`re.finditer(pattern, string)` 函数与 `findall` 类似，但它返回一个迭代器，可以用于逐个访问匹配对象。每次迭代返回一个匹配对象，以便逐个处理匹配项。

如果 pattern 中使用了分组，如果有匹配的结果，会在 match 对象中

1. 使用 group(N) 的方式返回对应分组，1到N是对应的分组，0返回整个匹配的字符串，N不写缺省为0
   - 如果使用了命名分组，可以使用 group('name') 的方式获取分组
2. 也可以使用 groups() 返回所有组
3. 使用 groupdict() 返回所有命名的分组



您的描述是正确的。当在正则表达式的模式中使用分组时，`re` 模块的匹配对象可以用不同的方法来获取匹配的分组信息：

1. 使用 `group(N)`：可以使用 `group(N)` 来获取第 `N` 个分组的匹配内容，其中 `N` 是一个整数，表示分组的索引。通常，`group(0)` 返回整个匹配的字符串，`group(N)` 返回第 `N` 个分组的内容。如果 `N` 未提供，默认为 `0`。

2. 使用 `groups()`：`groups()` 返回一个包含所有捕获分组的元组，元组中的元素按照它们在正则表达式中的顺序排列，不包括非捕获分组和命名分组。

3. 使用 `groupdict()`：如果在正则表达式中使用了命名分组，可以使用 `groupdict()` 来获取所有命名分组的匹配内容。它返回一个字典，其中键是分组的名称，而值是匹配的内容。

这些方法使您能够方便地访问和提取正则表达式中不同分组的匹配内容，从而更轻松地处理和分析匹配的文本数据。



## match.group()

`match.group()` 是一个方法，用于获取在使用正则表达式进行匹配后找到的匹配文本。它通常与 `re.match()` 或 `re.search()` 返回的匹配对象一起使用。该方法返回匹配对象中的匹配文本部分。

以下是 `match.group()` 的用法示例：

```python
import re

pattern = re.compile(r'\d+')  # 匹配一个或多个数字
text = "The price is $25.99."

match = pattern.search(text)  # 在字符串中执行搜索
if match:
    matched_text = match.group()  # 获取匹配的文本
    print("匹配到的文本:", matched_text)  # 打印匹配到的文本（在这种情况下是 "25"）
else:
    print("未找到匹配项。")
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个数字（`\d+`）。然后，我们使用 `pattern.search(text)` 在 `text` 字符串中执行搜索。如果找到匹配项，我们使用 `match.group()` 方法来获取匹配的文本，然后将其打印出来。

请注意，`match.group()` 可以接受一个可选的参数，用于指定要获取的匹配组的索引。如果正则表达式中有括号分组，您可以传递一个数字参数以获取特定分组的匹配文本。默认情况下，如果不传递参数，它将返回整个匹配的文本。例如：

```python
import re

pattern = re.compile(r'(\d+)-(\d+)-(\d+)')  # 匹配日期格式，包含三个数字分组
text = "Date: 2023-09-05"

match = pattern.search(text)
if match:
    year = match.group(1)
    month = match.group(2)
    day = match.group(3)
    print("年份:", year)
    print("月份:", month)
    print("日期:", day)
```

在此示例中，我们使用一个正则表达式来匹配日期格式，并包含了三个数字分组。然后，我们使用 `match.group(1)`、`match.group(2)` 和 `match.group(3)` 来获取每个分组的匹配文本，以获取年、月和日期的值。



## groups()

`groups()` 是正则表达式匹配对象（通常是通过 `re.match()`、`re.search()` 或 `re.finditer()` 等函数返回的对象）的一个方法。这个方法用于返回匹配中的所有捕获组（也称为子组）的信息。

在正则表达式中，捕获组是通过在模式中使用圆括号来定义的子表达式，它们允许您从匹配的文本中提取特定部分。正则表达式的每个捕获组都可以用一个编号来标识，从1开始，依次递增。

`groups()` 方法返回一个包含所有捕获组内容的元组，其中每个元素对应一个捕获组的内容。通常，元组的第一个元素是整个匹配的文本，然后是第一个捕获组的内容，第二个捕获组的内容，依此类推。

以下是一个示例，演示如何使用 `groups()` 方法来获取匹配对象中的捕获组内容：

```python
import re

pattern = re.compile(r'(\d+)-(\d+)-(\d+)')  # 匹配日期格式，包含三个数字捕获组
text = "Date: 2023-09-05"

match = pattern.search(text)  # 在文本中搜索匹配项

if match:
    all_groups = match.groups()  # 获取所有捕获组的内容
    print("所有捕获组的内容:", all_groups)
    print("年份:", all_groups[0])
    print("月份:", all_groups[1])
    print("日期:", all_groups[2])
```

在此示例中，我们使用一个正则表达式来匹配日期格式，并定义了三个数字捕获组。然后，我们使用 `pattern.search(text)` 在 `text` 字符串中搜索匹配项，获取匹配对象 `match`。接下来，我们使用 `match.groups()` 方法获取所有捕获组的内容，并分别打印年、月和日期的值。

请注意，捕获组的编号从1开始，因此`all_groups[0]` 包含整个匹配的文本。如果模式中没有捕获组，`groups()` 方法将返回一个空元组。



## group()

`group()` 是正则表达式匹配对象的一个方法，用于获取匹配中的捕获组（也称为子组）的内容。正则表达式中的捕获组是通过在模式中使用圆括号来定义的子表达式，它们允许您从匹配的文本中提取特定部分。正则表达式的每个捕获组都可以用一个编号来标识，从1开始，依次递增。

`group()` 方法接受一个可选的参数，用于指定要获取的捕获组的编号。如果不传递参数，它将返回整个匹配的文本。如果传递一个参数，它将返回对应编号的捕获组的内容。

以下是一个示例，演示如何使用 `group()` 方法来获取匹配对象中的捕获组内容：

```python
import re

pattern = re.compile(r'(\d+)-(\d+)-(\d+)')  # 匹配日期格式，包含三个数字捕获组
text = "Date: 2023-09-05"

match = pattern.search(text)  # 在文本中搜索匹配项

if match:
    entire_match = match.group()  # 获取整个匹配的文本
    year = match.group(1)  # 获取第一个捕获组的内容（年份）
    month = match.group(2)  # 获取第二个捕获组的内容（月份）
    day = match.group(3)    # 获取第三个捕获组的内容（日期）

    print("整个匹配的文本:", entire_match)
    print("年份:", year)
    print("月份:", month)
    print("日期:", day)
```

在此示例中，我们使用一个正则表达式来匹配日期格式，并定义了三个数字捕获组。然后，我们使用 `pattern.search(text)` 在 `text` 字符串中搜索匹配项，获取匹配对象 `match`。接下来，我们使用 `match.group()` 方法来获取整个匹配的文本以及每个捕获组的内容。

请注意，捕获组的编号从1开始，`group(0)` 返回整个匹配的文本。如果模式中没有捕获组，尝试使用 `group(1)` 或其他捕获组编号将引发 `IndexError`。在使用 `group()` 方法时，请确保提供正确的捕获组编号或不传递参数以获取整个匹配的文本。



## groupdict()

`groupdict()` 是正则表达式匹配对象的一个方法，用于获取匹配中的捕获组（也称为子组）的字典表示。正则表达式中的捕获组是通过在模式中使用圆括号来定义的子表达式，它们允许您从匹配的文本中提取特定部分。每个捕获组都可以用一个名称来标识。

`groupdict()` 方法返回一个字典，其中包含捕获组的名称作为键，捕获组的内容作为值。

以下是一个示例，演示如何使用 `groupdict()` 方法来获取匹配对象中的捕获组内容：

```python
import re

pattern = re.compile(r'(?P<year>\d+)-(?P<month>\d+)-(?P<day>\d+)')  # 匹配日期格式，使用命名捕获组
text = "Date: 2023-09-05"

match = pattern.search(text)  # 在文本中搜索匹配项

if match:
    group_dict = match.groupdict()  # 获取所有捕获组的字典表示
    print("捕获组字典:", group_dict)
    
    year = group_dict["year"]  # 获取年份
    month = group_dict["month"]  # 获取月份
    day = group_dict["day"]  # 获取日期

    print("年份:", year)
    print("月份:", month)
    print("日期:", day)
```

在此示例中，我们使用一个正则表达式来匹配日期格式，并使用命名捕获组定义了三个捕获组，分别命名为 "year"、"month" 和 "day"。然后，我们使用 `pattern.search(text)` 在 `text` 字符串中搜索匹配项，获取匹配对象 `match`。接下来，我们使用 `match.groupdict()` 方法来获取所有捕获组的字典表示，并从中提取年、月和日期的值。

使用命名捕获组和 `groupdict()` 方法可以使代码更具可读性，并更容易理解捕获组的含义。这在处理复杂的正则表达式模式时尤其有用。



# 分割字符串

## re.split()

`re.split()` 是 Python `re` 模块提供的一个函数，用于根据正则表达式模式来分割字符串。它将输入字符串分割成多个部分，并返回一个列表，其中包含根据模式分割的子字符串。

以下是 `re.split()` 的基本语法：

```python
import re

split_list = re.split(pattern, string, maxsplit=0, flags=0)
```

- `pattern` 是要用于分割字符串的正则表达式模式。
- `string` 是要分割的输入字符串。
- `maxsplit` 是可选的，用于指定最大分割次数。如果不指定，默认为分割所有匹配项。
- `flags` 是可选的，用于指定匹配选项的标志（例如，忽略大小写等）。

`re.split()` 返回一个列表，其中包含根据模式分割的子字符串。如果没有找到匹配项，它将返回一个包含原始字符串的单一元素列表。

以下是一个示例，演示如何使用 `re.split()` 来根据正则表达式模式分割字符串：

```python
import re

pattern = re.compile(r'\s+')  # 匹配一个或多个空白字符
text = "Hello  World   Python"

split_list = pattern.split(text)  # 根据空白字符分割字符串
print("分割后的列表:", split_list)
```

在此示例中，我们首先使用 `re.compile()` 编译了一个模式，该模式用于匹配一个或多个空白字符（`\s+`）。然后，我们使用 `pattern.split(text)` 来根据空白字符分割 `text` 字符串，将分割后的子字符串存储在 `split_list` 列表中。

`re.split()` 对于需要根据复杂的分隔符模式来拆分文本的情况非常有用。您可以根据需要自定义模式，以便灵活地分割字符串。





# 其它正则模块

Python中有几个常用的正则表达式库，其中最常见和流行的是re模块。re模块是Python标准库的一部分，用于处理正则表达式。

以下是一些常用的Python正则表达式库：

1. **re模块**：re模块是Python标准库的一部分，提供了正则表达式的基本功能。你可以使用re.compile()函数来编译正则表达式模式，然后使用各种方法来执行匹配和搜索操作。

   ```python
   import re
   ```

2. **regex模块**：regex模块是一个功能更强大的正则表达式库，提供了一些高级功能和语法扩展。它允许你使用更复杂的正则表达式，并支持一些高级特性，如递归匹配。

   ```python
   import regex as re
   ```

3. **fnmatch模块**：fnmatch模块用于执行文件名模式匹配，它使用通配符而不是正则表达式。这对于匹配文件名或目录名非常有用。

   ```python
   import fnmatch
   ```

4. **pathlib模块**：虽然不是专门的正则表达式库，但Python的pathlib模块允许你使用通配符来处理文件路径。这可以在文件和目录操作中非常有用。

   ```python
   from pathlib import Path
   ```

这些库中的每一个都有其自己的用途和特点，你可以根据项目的需求选择最合适的库来处理正则表达式。通常情况下，re模块足够满足大多数正则表达式需求。如果需要更高级的功能或语法扩展，可以考虑使用regex模块。

