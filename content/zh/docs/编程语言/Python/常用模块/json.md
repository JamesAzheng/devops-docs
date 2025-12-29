---
title: "json"
---

## json 概述

Python 提供了标准库中的 `json` 模块，可以用于将 Python 数据结构转换为 JSON 格式（序列化）或将 JSON 数据解析为 Python 数据结构（反序列化）。这使得在 Python 中处理 JSON 数据变得非常方便。





## json 与 python 类型对应关系

以下是一个简单的对应表，显示了 JSON 数据类型和相应的 Python 数据类型之间的关系：

这个对应表可以帮助你理解 JSON 数据类型和 Python 数据类型之间的关系，以及在使用 Python 处理 JSON 数据时如何映射它们。

| JSON 数据类型     | Python 数据类型                  |
| ----------------- | -------------------------------- |
| 对象（Object）    | 字典（`dict`）                   |
| 数组（Array）     | 列表（`list`）                   |
| 字符串（String）  | 字符串（`str`）                  |
| 数字（Number）    | 整数（`int`）、浮点数（`float`） |
| 布尔值（Boolean） | 布尔值（`bool`）                 |
| 空值（Null）      | `None`                           |

**对象（Object）对应于 Python 字典（`dict`）** 

JSON 中的对象是由一组键值对组成的，而 Python 字典也是由键值对组成的数据结构，因此它们之间可以很容易地进行映射。

例如，JSON 对象：

```json
{
  "name": "John",
  "age": 30
}
```

对应的 Python 字典：

```python
{
  "name": "John",
  "age": 30
}
```

**数组（Array）对应于 Python 列表（`list`）**

 JSON 中的数组是一个有序的值集合，而 Python 列表也是有序的值集合，因此它们之间可以直接映射。

例如，JSON 数组：

```json
["apple", "banana", "cherry"]
```

对应的 Python 列表：

```python
["apple", "banana", "cherry"]
```

**字符串（String）对应于 Python 字符串（`str`）**

 JSON 字符串是由双引号包围的字符序列，Python 字符串也使用双引号或单引号包围字符序列。

例如，JSON 字符串：

```json
"Hello, World!"
```

对应的 Python 字符串：

```python
"Hello, World!"
```

**数字（Number）对应于 Python 整数（`int`）和浮点数（`float`）**

 JSON 中的数字可以是整数或浮点数，Python 也有相应的整数和浮点数数据类型。

例如，JSON 数字：

```json
42
3.14
```

对应的 Python 整数和浮点数：

```python
42
3.14
```

**布尔值（Boolean）对应于 Python 布尔值（`bool`）**

 JSON 中的布尔值是 `true` 或 `false`，而 Python 使用 `True` 或 `False` 表示布尔值。

例如，JSON 布尔值：

```json
true
false
```

对应的 Python 布尔值：

```python
True
False
```

**空值（Null）对应于 Python 的 `None`**

JSON 中的空值用 `null` 表示，而 Python 使用 `None` 表示空值。

例如，JSON 空值：

```json
null
```

对应的 Python `None`：

```python
None
```





## 注意事项

JSON 标准不支持直接表示 Python 中的元组（`tuple`）类型。 JSON 支持的数据类型有限，包括对象、数组、字符串、数字、布尔值和空值，但不包括元组。

如果需要在 JSON 数据中表示元组，通常可以将元组转换为 JSON 支持的数据类型之一，例如列表（`list`）或对象（`dict`）。选择如何表示元组取决于元组的具体用途和结构。

以下是两种常见的方法：

1. **使用列表（`list`）：** 如果元组的元素没有关联的键，可以将元组中的元素存储在一个列表中。例如，将一个包含元组的列表表示为 JSON 数组。

   ```python
   my_tuple = (1, 2, 3)
   my_json = [1, 2, 3]
   ```

2. **使用对象（`dict`）：** 如果元组的元素具有关联的键，可以将元组中的元素存储在一个对象中，并使用键来表示元素的名称。

   ```python
   my_tuple = ("name", "John", "age", 30)
   my_json = {"name": "John", "age": 30}
   ```

要注意，当将元组表示为 JSON 数据时，需要确保元组中的数据结构能够与 JSON 数据类型相匹配，否则在进行数据转换时可能需要一些自定义的逻辑。

在处理元组和 JSON 之间的转换时，也可以使用 Python 的 `json` 模块提供的自定义编码和解码函数，以满足特定需求。例如，可以编写一个编码函数将元组转换为 JSON 对象，或者编写解码函数将 JSON 对象转换为元组。这可以根据具体情况来定制。



## 范例：1

```python
import json

## 编码（将 Python 对象转换为 JSON 字符串）
data = {
    "name": "Alice",
    "age": 30,
    "isStudent": False
}
json_string = json.dumps(data)

print(json_string) # {"name": "Alice", "age": 30, "isStudent": false}

## 解码（将 JSON 字符串转换为 Python 对象）
decoded_data = json.loads(json_string)

print(decoded_data) # {'name': 'Alice', 'age': 30, 'isStudent': False}
```



## 范例：2

在Python中，`json`模块用于处理JSON数据。以下是`json`模块中常用的四个函数及其示例：

1. `dump`: 用于将Python对象转换为JSON格式并写入文件。

```python
import json

data = {"name": "John", "age": 30, "city": "New York"}

## 将数据写入JSON文件
with open("data.json", "w") as json_file:
    json.dump(data, json_file)
```

2. `load`: 用于从JSON文件中读取数据并将其解析为Python对象。

```python
import json

## 从JSON文件中读取数据
with open("data.json", "r") as json_file:
    loaded_data = json.load(json_file)

print(loaded_data)  # 输出: {'name': 'John', 'age': 30, 'city': 'New York'}
```

3. `dumps`: 用于将Python对象转换为JSON格式的字符串。

```python
import json

data = {"name": "John", "age": 30, "city": "New York"}

## 将数据转换为JSON字符串
json_string = json.dumps(data)

print(json_string)  # 输出: {"name": "John", "age": 30, "city": "New York"}
```

4. `loads`: 用于将JSON格式的字符串解析为Python对象。

```python
import json

json_string = '{"name": "John", "age": 30, "city": "New York"}'

## 解析JSON字符串为Python对象
parsed_data = json.loads(json_string)

print(parsed_data)  # 输出: {'name': 'John', 'age': 30, 'city': 'New York'}
```

这些函数允许你在Python中方便地处理JSON数据，无论是将Python对象转换为JSON格式，还是将JSON数据解析为Python对象。



## ---



## yaml 转 json



你可以使用 Python 中的 `yaml` 和 `json` 模块来实现 YAML 格式到 JSON 格式的转换。首先，确保你已经安装了 `PyYAML` 和 `json` 模块。

如果还没有安装 `PyYAML` 模块，你可以通过以下命令使用 pip 安装：

```bash
pip install PyYAML
```

接下来，下面是一个简单的示例，演示如何将 YAML 格式的数据转换为 JSON 格式：

```python
import yaml
import json

## 假设你有一个 YAML 格式的数据
yaml_data = """
key1: value1
key2:
  - item1
  - item2
key3:
  subkey1: subvalue1
  subkey2: subvalue2
"""

## 将 YAML 格式的数据解析为 Python 对象
parsed_data = yaml.safe_load(yaml_data)

## 将 Python 对象转换为 JSON 格式的字符串
json_data = json.dumps(parsed_data)

print(json_data)
```

这段代码将会把 YAML 格式的数据解析为 Python 对象 `parsed_data`，然后使用 `json.dumps()` 将其转换为 JSON 格式的字符串 `json_data`。你可以根据实际情况读取文件中的 YAML 数据并进行相同的转换操作。