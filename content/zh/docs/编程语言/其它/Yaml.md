---
title: "yaml"
---

## yaml 语言概述

- YAML（YAML Ain't Markup Language）是一种人类可读的数据序列化格式，通常用于配置文件和数据交换。它的设计目标是使得数据的表示清晰易懂，同时尽可能地简洁。
- 目前很多软件中采有此格式的文件，如:ubuntu，anisble，docker，k8s等
- YAML 文件扩展名通常为 yml 或 yaml

**YAML 语言特性：**

- 可读性好
- 和脚本语言的交互性好
- 使用实现语言的数据类型
- 有一个一致的信息模型
- 易于实现
- 可以基于流来处理
- 表达能力强，扩展性好

**YAML 官方网站：**

- http://www.yaml.org



## yaml 语法

## 基本规则

1. **缩进：** YAML 使用缩进来表示层次关系，使用空格而不是制表符（Tab）进行缩进。
   - **注意：缩进必须是统一的，不能空格和tab混用。缩进的级别也必须是一致的，同样的缩进代表同样的级别，程序判别配置的级别是通过缩进结合换行来实现的。**
2. **大小写敏感：** YAML 是大小写敏感的，比如 `True` 和 `true` 是不同的值。
3. **注释：** 使用 `#` 符号表示注释。



## 开始和结束的指示符

在 YAML 中，`---` 和 `...` 分别用作文档开始和结束的指示符。

1. **`---`：** 表示 YAML 文档的开始。它通常出现在文件的开头，表示接下来的内容是一个新的 YAML 文档。

2. **`...`：** 表示 YAML 文档的结束。它通常出现在文件的结尾，表示当前 YAML 文档已结束。

这两个指示符通常用于将多个 YAML 文档组合在一个文件中。例如，一个文件中可以包含多个 YAML 文档，每个文档用 `---` 分隔开，而最后一个文档的结尾可以用 `...` 来表示。

示例：

```yaml
--- # 开始第一个 YAML 文档
name: John
age: 30
---

--- # 开始第二个 YAML 文档
name: Alice
age: 25
...

```

在这个示例中，文件包含了两个 YAML 文档。第一个文档描述了一个人名为 John，年龄为 30 岁；第二个文档描述了一个人名为 Alice，年龄为 25 岁。文档之间通过 `---` 分隔，而最后一个文档以 `...` 结束。



## 数据类型

1. **标量类型：**
   - 字符串：可以使用单引号 `'` 或双引号 `"` 包围，也可以省略引号。
   - 数字：整数、浮点数和科学计数法均支持。
   - 布尔值：`true` 或 `false`。
   - 空值：`null` 或 `~`。
2. **序列类型：** 使用连字符 `-` 表示列表的元素。
3. **映射类型：** 使用键值对表示，使用冒号 `:` 表示键值对。



## 数据结构

### 字典

在 YAML 中，字典也称为映射（Mapping），它由键值对组成，每个键值对使用冒号 `:` 分隔。字典可以嵌套，使得数据结构更加复杂。

**基本语法：**

```yaml
person:
  name: John
  age: 30
  job: Developer
```

在这个例子中，`person` 是一个字典，包含了三个键值对：`name`、`age` 和 `job`。



**单行字典：**

在 YAML 中，字典可以写在一行上，每个键值对使用逗号 `,` 分隔。这种写法通常在字典比较简单、内容不多的情况下使用，以提高可读性。以下是一个示例：

```yaml
person: {name: John, age: 30, job: Developer}
```

在这个示例中，`person` 是一个包含三个键值对的字典，所有的键值对都写在了一行上，并使用了花括号 `{}` 进行表示。每个键值对之间使用逗号 `,` 分隔。



### 列表

在 YAML 中，列表是一种序列类型的数据结构，也称为数组或序列，它由一系列项目组成，项目之间使用连字符 `-` 表示。列表可以包含任意数量的项目，并且可以嵌套在其他数据结构中，如字典或列表中。

**基本语法：**

```yaml
fruits:
  - apple
  - banana
  - cherry
```

在这个例子中，`fruits` 是一个列表，包含了三个项目：`apple`、`banana` 和 `cherry`。每个项目都位于连字符 `-` 下面，项目之间使用换行符进行分隔。



**单行列表：**

在 YAML 中，你可以使用方括号 `[]` 将列表写在一行上，并使用逗号 `,` 分隔列表项。以下是一个示例：

```yaml
fruits: [apple, banana, cherry]
```

在这个示例中，`fruits` 是一个列表，包含了三个项目：`apple`、`banana` 和 `cherry`。所有的项目都写在了一行上，并使用了方括号 `[]` 表示列表，项目之间使用逗号 `,` 分隔。

这种写法在列表比较简单且内容不多的情况下可以提高可读性。



### 嵌套结构

在 YAML 中，嵌套结构是指将一个数据结构嵌套在另一个数据结构内部的情况。这种嵌套可以是任意深度的，允许在字典中嵌套列表，或者在列表中嵌套字典，甚至可以混合嵌套使用。

#### 字典嵌套字典

```yaml
people:
  john:
    name: John
    age: 30
    job: Developer
  alice:
    name: Alice
    age: 25
    job: Designer
```

在这个示例中，`people` 是一个字典，包含了两个键值对：`john` 和 `alice`。每个键都对应一个字典，表示一个人的信息。在内部的每个字典中，包含了 `name`、`age` 和 `job` 三个键值对，分别表示人的姓名、年龄和职业。

#### 列表嵌套列表

```yaml
matrix:
  - [1, 2, 3]
  - [4, 5, 6]
  - [7, 8, 9]
```

在这个示例中，`matrix` 是一个包含了三个子列表的列表。每个子列表都包含了三个数字，表示矩阵中的一行。整个结构形成了一个 3x3 的矩阵。

#### 列表嵌套字典

```yaml
people:
  - name: John
    age: 30
    job: Developer
  - name: Alice
    age: 25
    job: Designer
```

在这个示例中，`people` 是一个列表，包含了两个字典作为列表项。每个字典表示一个人的信息，包含了 `name`、`age` 和 `job` 三个键值对。



#### 字典嵌套列表

```yaml
students:
  math:
    - Alice
    - Bob
    - Carol
  history:
    - Dave
    - Eve
    - Frank
```

在这个示例中，`students` 是一个字典，包含了两个键值对：`math` 和 `history`。每个键都对应一个列表，列表中包含了学生的姓名。这种结构可以用来表示不同科目下的学生名单。



## 引用与锚点

1. **锚点（&）：** 使用 `&` 可以为数据结构设置锚点。

   ```yaml
   fruits: &fruits
     - apple
     - banana
     - cherry
   ```

2. **引用（*）：** 使用 `*` 可以引用先前定义的锚点。

   ```yaml
   shopping_list: *fruits
   ```



在 YAML 中，可以使用引用（`*`）和锚点（`&`）来复用数据结构。锚点用于标记数据结构，而引用用于在其他地方使用该锚点所标记的数据结构。这样可以减少重复数据，使 YAML 文件更加清晰和简洁。

下面是引用与锚点的详细解释以及一个生产环境中的示例：

### 锚点 &
- 锚点用于标记一个数据结构，使得它可以在其他地方引用。
- 锚点必须以 `&` 开始，后面跟着一个标识符（可以是任何字符串）。
- 锚点通常标记在某个数据结构的开头。

### 引用 *
- 引用用于在其他地方使用已经标记的数据结构。
- 引用必须以 `*` 开始，后面跟着之前定义的标识符。

### 示例：

假设我们有一个生产环境的配置文件，其中有多个服务器的配置信息。如果这些服务器有一些共同的配置，我们可以使用锚点和引用来避免重复。

```yaml
## 定义共同的配置
common_settings: &common
  timeout: 30
  max_connections: 100

## 服务器配置
servers:
  - name: server1
    <<: *common
    ip: 192.168.1.101
    port: 8080
  - name: server2
    <<: *common
    ip: 192.168.1.102
    port: 8080
  - name: server3
    <<: *common
    ip: 192.168.1.103
    port: 8080
```

在这个示例中：
- `common_settings` 定义了一些共同的配置，它被锚点 `&common` 标记。
- 在每个服务器的配置中，使用 `<<: *common` 引用了已经定义的共同配置，这样就避免了重复输入。
- 每个服务器都有自己的名称、IP 和端口信息。

通过使用锚点和引用，我们可以避免在每个服务器配置中重复输入共同的配置信息，使得 YAML 文件更加简洁易读。



## 多行字符串

### 折叠块样式 >

-  字符串在保持换行符的同时折叠成一行。

```yaml
description: >
  This is a long
  description that spans
  multiple lines.
```



在 YAML 中，折叠块样式（`>`）用于表示一个多行字符串，在保持换行符的同时将其折叠成一行。这种样式在需要保持换行符的同时希望将文本块简化成一行时非常有用。

折叠块样式的语法如下：

```yaml
key: >
  This is a long
  multiline string
  that will be folded
  into a single line.
```

在这个示例中，`>` 用于标识折叠块样式，紧跟着的是一个多行字符串。在折叠块样式下，所有换行符会被转换为空格，但文本内容保持不变。

示例：

假设我们要在 YAML 文件中存储一段较长的文本，但又希望保持文件的整洁性，我们可以使用折叠块样式来将其简化成一行。

```yaml
description: >
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
```

在这个示例中，`description` 键的值是一个多行文本，但由于使用了折叠块样式 `>`，整个文本会被折叠成一行，换行符会被转换为空格，但文本内容保持不变。

使用折叠块样式有助于保持 YAML 文件的整洁性，尤其是在需要包含较长文本的情况下。



### 保留块样式 |

- 字符串保留原始的换行符。

```yaml
content: |
  This is a long
  content with preserved
  line breaks.
```



在 YAML 中，保留块样式（`|`）用于表示一个多行字符串，保留字符串中的换行符。这种样式适合需要保持文本的原始格式，包括换行符的情况。

保留块样式的语法如下：

```yaml
key: |
  This is a long
  multiline string
  that will be preserved
  with line breaks.
```

在这个示例中，`|` 用于标识保留块样式，紧跟着的是一个多行字符串。在保留块样式下，文本中的换行符会被保留，文本内容保持不变。

示例：

假设我们要在 YAML 文件中存储一个包含多个段落的文本，我们可以使用保留块样式来保留文本的原始格式，包括段落之间的换行符。

```yaml
content: |
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 

  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
```

在这个示例中，`content` 键的值是一个多行文本，使用了保留块样式 `|`，因此文本中的换行符会被保留，文本内容保持不变，包括段落之间的空行。

使用保留块样式有助于保持文本的原始格式，在需要保留换行符和段落格式的情况下非常有用。





## 总结

**yaml文件中，-开头的就是列表，k: v 就是字典，我理解的对吗**

在 YAML（YAML Ain't Markup Language）中，以`-`开头的确表示一个列表项，而`k: v`表示一个键值对，通常用于构建字典（也就是映射）结构。你的理解是正确的。下面是一个简单的 YAML 示例：

```yaml
fruits:
  - apple
  - banana
  - orange
vegetables:
  - carrot
  - spinach
  - broccoli
person:
  name: John
  age: 30
```

在这个示例中：
- `fruits`和`vegetables`是键，它们的值是列表。
- `person`是一个键，它的值是一个字典，包含`name`和`age`两个键值对。



**列表中包含字典是什么样的**

列表中包含字典时，YAML 文件的结构会像这样：

```yaml
- key1: value1
  key2: value2
- key1: value3
  key2: value4
```

在这个示例中，每个列表项都是一个字典，字典中有两个键值对。
