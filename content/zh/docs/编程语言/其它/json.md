---
title: "JSON"
---

# JSON 概述

https://www.json.org/

JSON（JavaScript Object Notation）是一种轻量级的数据交换格式，它是一种文本格式，用于表示结构化数据。JSON 最初是为 JavaScript 开发的，但已成为跨编程语言的通用数据格式，因为它易于阅读、编写和解析。

**数据结构**：JSON 数据以键值对的形式组织，其中键是字符串，值可以是字符串、数字、布尔值、对象、数组或 null。这种键值对的集合可以嵌套，以创建复杂的数据结构。

**用途**：JSON 在网络通信和数据交换中广泛使用，例如：

- 在前端和后端之间传输数据，特别是在 AJAX 请求中。
- 存储配置文件和数据。
- 作为 RESTful API 的数据格式。
- 在各种编程语言之间传递数据。

**注意事项：**

- JSON 不支持注释





# JSON 数据类型

这些基本数据类型可以组合在一起，构成复杂的 JSON 结构，用于表示各种数据。例如，可以在对象中嵌套数组，或者在数组中包含对象，从而构建更复杂的数据结构。 JSON 是一种通用的数据格式，广泛用于数据交换和配置文件等场景。

## 字符串（String）

字符串是由双引号 `"` 包围的一串字符，可以有转义字符。

### 范例 - 1

```json
"Hello, World!"
```

### 范例 - 2

JSON 字符串可以包含转义字符。转义字符是一种特殊的字符序列，以反斜杠符号 `\` 开头，后跟一个字符，用于表示一些特殊字符或控制字符。以下是一些常见的 JSON 字符串转义字符：

1. `\"`：表示双引号字符 `"`，用于在字符串中包含双引号。
2. `\\`：表示反斜杠字符 `\`，用于在字符串中包含反斜杠。
3. `\/`：表示斜杠字符 `/`，尽管 JSON 规范不要求转义斜杠，但它仍然可以被转义以增强字符串的可读性。
4. `\b`：表示退格（backspace）字符。
5. `\f`：表示换页符（form feed）字符。
6. `\n`：表示换行符（newline）字符。
7. `\r`：表示回车符（carriage return）字符。
8. `\t`：表示制表符（tab）字符。

例如，以下是一个包含转义字符的 JSON 字符串的示例：

```json
{
  "message": "Hello, \"World\"!\nHave a\tgreat day."
}
```

在上面的示例中，字符串中的双引号、换行符和制表符都被使用转义字符来表示。 JSON 解析器会将这些转义字符还原为原始字符，以便正确解析字符串的内容。



## 数字（Number）

数字可以是正负数、整数、浮点数，没有引号包围。例如：

```json
42
-10
3.14
```

### 范例 - 1







## 数组（Array）

数组是一个有序的值集合，每个值可以是任何合法的 JSON 数据类型（包括对象、数组、字符串、数字、布尔值或空值）。

数组以 `[]` 方括号包围，值之间用逗号 `,` 分隔。



### 范例 - 1

```json
{
  "fruits": ["apple", "banana", "cherry", "date"]
}
```

在这个 JSON 对象中，有一个键值对 `"fruits"`，其值是一个包含多个元素的数组：

- `"fruits": ["apple", "banana", "cherry", "date"]`：表示一个包含四种水果名称的数组，分别是 "apple"、"banana"、"cherry" 和 "date"。



### 范例 - 2

以下是一个更复杂的 JSON 示例，包含嵌套的数组和对象：

```json
{
  "employees": [
    {
      "name": "Alice",
      "age": 28,
      "department": "HR",
      "skills": ["communication", "problem solving"]
    },
    {
      "name": "Bob",
      "age": 35,
      "department": "Engineering",
      "skills": ["programming", "problem solving", "teamwork"]
    },
    {
      "name": "Charlie",
      "age": 32,
      "department": "Sales",
      "skills": ["salesmanship", "customer relations"]
    }
  ],
  "companyInfo": {
    "name": "ABC Inc.",
    "location": "New York",
    "foundedYear": 2000
  }
}
```

这个 JSON 对象包含了两个键值对：

1. `"employees"`：这是一个键值对，其值是一个包含多个员工信息的数组。每个员工信息都表示为一个对象，包括姓名、年龄、部门和技能等信息。

   - 每个员工信息对象包括：
     - `"name"`：员工的姓名。
     - `"age"`：员工的年龄。
     - `"department"`：员工所属的部门。
     - `"skills"`：员工的技能，表示为一个包含多个字符串的数组。

2. `"companyInfo"`：这是一个键值对，其值是一个公司信息的对象，包括公司名称、地点和成立年份等信息。

   - 公司信息对象包括：
     - `"name"`：公司的名称。
     - `"location"`：公司的地点。
     - `"foundedYear"`：公司的成立年份。

这个复杂的 JSON 示例演示了如何使用 JSON 来表示嵌套的结构，包括数组和对象，以描述多个员工的信息以及相关公司的信息。 JSON 的灵活性使其适用于表示各种复杂的数据结构。





## 布尔值（Boolean）

布尔值表示真或假，只有两个可能的值：`true` 和 `false`，没有引号包围。

### 范例 - 1

以下是一个包含布尔值（Boolean）的 JSON 示例：

```json
{
  "isStudent": true,
  "hasJob": false,
  "isMarried": true,
  "likesCoding": false
}
```

在这个 JSON 对象中，有四个键值对，它们的值是布尔值：

1. `"isStudent": true`：表示这个人是学生（布尔值 `true` 表示是学生）。

2. `"hasJob": false`：表示这个人没有工作（布尔值 `false` 表示没有工作）。

3. `"isMarried": true`：表示这个人已婚（布尔值 `true` 表示已婚）。

4. `"likesCoding": false`：表示这个人不喜欢编程（布尔值 `false` 表示不喜欢编程）。

布尔值在 JSON 中用于表示逻辑真假或两种状态中的一种。它们在描述条件、开关或标志时非常有用。



## 空值（Null）

空值表示一个缺失或空的值，使用关键字 `null` 表示，没有引号包围。

### 范例 - 1

以下是一个包含空值（null）的 JSON 示例：

```json
{
  "name": "Alex",
  "email": null,
  "address": {
    "street": "789 Oak St",
    "city": null,
    "zipcode": "67890"
  }
}
```

在这个 JSON 对象中，有几个键值对的值是 null：

1. `"email": null`：表示这个人的电子邮件地址为空（null 值）。

2. `"city": null`：表示地址中的城市信息为空（null 值）。

这些 null 值表示对应的数据项没有有效值或尚未定义。 JSON 中的 null 值在数据表示中很有用，因为它们可以表示缺失的数据或占位符，以便在以后填充数据。



## 对象（Object）

对象是一组无序的键值对（key-value pairs）集合，以 `{}` 大括号包围。

- 键（key）必须是字符串（因此需要用双引号`"`包围）
- 值（value）可以是任何合法的 JSON 数据类型（包括对象、数组、字符串、数字、布尔值或空值）
- 键和值之间用冒号 `:` 分隔
- 键值对之间用逗号 `,` 分隔。

### 范例 - 1

```json
{
  "name": "John",
  "age": 30,
  "city": "New York"
}
```

1. `"name": "John"`：这是一个键值对（key-value pair），其中 `"name"` 是键，表示姓名，`"John"` 是与键关联的值，表示该人的名字。

2. `"age": 30`：这也是一个键值对，其中 `"age"` 是键，表示年龄，`30` 是与键关联的值，表示该人的年龄。

3. `"city": "New York"`：同样，这也是一个键值对，其中 `"city"` 是键，表示城市，`"New York"` 是与键关联的值，表示该人所在的城市。

这整个 JSON 对象表示一个人名叫 John，年龄是 30 岁，居住在纽约（New York）这座城市。



### 范例 - 2

```json
{
  "name": "Alice",
  "age": 25,
  "isStudent": true,
  "hobbies": ["reading", "hiking", "painting"],
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipcode": "12345"
  }
}
```

1. `"name": "Alice"`：这是一个键值对，键是 `"name"`，与之关联的值是 `"Alice"`。它表示这个人的姓名是 Alice。

2. `"age": 25`：这也是一个键值对，键是 `"age"`，与之关联的值是 `25`。它表示这个人的年龄是 25 岁。

3. `"isStudent": true`：这是一个键值对，键是 `"isStudent"`，与之关联的值是 `true`。它表示这个人是一名学生（布尔值 `true` 表示是学生）。

4. `"hobbies": ["reading", "hiking", "painting"]`：这是一个键值对，键是 `"hobbies"`，与之关联的值是一个数组 `["reading", "hiking", "painting"]`。它表示这个人的兴趣爱好，包括阅读、徒步和绘画。

5. `"address": { "street": "123 Main St", "city": "Anytown", "zipcode": "12345" }`：这也是一个键值对，键是 `"address"`，与之关联的值是一个嵌套的对象，包含了地址的详细信息。这个嵌套对象包括 `"street"`、`"city"` 和 `"zipcode"` 三个键值对，分别表示街道地址、城市和邮政编码。

所以，这个 JSON 对象表示一个叫 Alice 的人，她是一名 25 岁的学生，喜欢阅读、徒步和绘画，并且她的地址是 123 Main St，Anytown，邮政编码是 12345。



### 范例 - 3

```json
{
  "person": {
    "name": "Bob",
    "age": 35,
    "isStudent": false
  },
  "hobbies": ["music", "travel"],
  "address": {
    "street": "456 Elm St",
    "city": "Sometown",
    "zipcode": "54321"
  },
  "friends": [
    {
      "name": "Alice",
      "age": 28
    },
    {
      "name": "Charlie",
      "age": 40
    }
  ]
}
```

这个复杂的 JSON 对象包含了多层嵌套和不同的数据类型，下面逐一解释：

1. `"person"`：这是一个包含个人信息的对象，其中包含了三个键值对：
   - `"name": "Bob"`：表示这个人的姓名是 Bob。
   - `"age": 35`：表示这个人的年龄是 35 岁。
   - `"isStudent": false`：表示这个人不是学生（布尔值 `false` 表示不是学生）。

2. `"hobbies"`：这是一个包含兴趣爱好的数组，包括 `"music"` 和 `"travel"`。

3. `"address"`：这是一个包含地址信息的对象，其中包括三个键值对：
   - `"street": "456 Elm St"`：表示街道地址是 456 Elm St。
   - `"city": "Sometown"`：表示城市是 Sometown。
   - `"zipcode": "54321"`：表示邮政编码是 54321。

4. `"friends"`：这是一个包含朋友信息的数组，包括两个对象，每个对象都表示一个朋友的信息：
   - 第一个对象包含键值对 `"name": "Alice"` 和 `"age": 28`，表示朋友 Alice 的信息。
   - 第二个对象包含键值对 `"name": "Charlie"` 和 `"age": 40`，表示朋友 Charlie 的信息。

总之，这个复杂的 JSON 对象包含了个人信息、兴趣爱好、地址信息以及朋友信息的组合。







