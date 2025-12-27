---
title: "collections"
---

`collections` 模块是 Python 标准库中提供了一些额外的数据类型，用于扩展内建数据类型。其中一些主要的类包括 `Counter`、`namedtuple`、`deque` 等。

- `Counter` 用于计数可哈希对象的出现次数
- `namedtuple` 创建带有命名字段的元组
- 而 `deque` 则是一个双向队列，支持在两端高效地添加和弹出元素。

这些类提供了更多功能和性能上的优势，可以在不同场景中提高代码的可读性和性能。



# OrderedDict

`OrderedDict` 是 `collections` 模块中的一个类，它是一个有序字典，保持插入元素的顺序。与普通的字典不同，`OrderedDict` 记录元素的添加顺序，并在迭代时按照插入的顺序返回元素。

```python
from collections import OrderedDict

# 创建一个有序字典
ordered_dict = OrderedDict()

# 添加元素
ordered_dict['a'] = 1
ordered_dict['b'] = 2
ordered_dict['c'] = 3

# 打印有序字典
print(ordered_dict)
# Output: OrderedDict([('a', 1), ('b', 2), ('c', 3)])
```

通过使用 `OrderedDict`，你可以确保字典的遍历顺序与元素添加的顺序一致。这在需要按照特定顺序处理字典元素时非常有用。





# namedtuple

`collections` 模块中的 `namedtuple` 提供了一种创建具有命名字段的轻量级对象类型的方法，类似于结构体。它是一个工厂函数，用于创建命名元组类。

以下是 `namedtuple` 的基本用法和一些重要特性：

1. **创建命名元组类：**
   使用 `collections.namedtuple` 函数可以创建一个命名元组类。它接受两个参数：元组类的名称和字段名称（可以是字符串，也可以是字段名的列表）。返回的是一个新的元组类。

   ```python
   from collections import namedtuple
   
   Point = namedtuple('Point', ['x', 'y'])
   ```

2. **创建命名元组对象：**
   使用创建的命名元组类，你可以像创建普通元组一样创建命名元组对象。字段可以通过名称来访问。

   ```python
   p = Point(3, 4)
   print(p.x)  # 输出: 3
   print(p.y)  # 输出: 4
   ```

3. **字段访问：**
   与普通元组类似，命名元组对象的字段可以通过索引或属性名来访问。

   ```python
   print(p[0])  # 输出: 3
   print(p.y)  # 输出: 4
   ```

4. **_fields 属性：**
   命名元组类有一个特殊属性 `_fields`，它是一个包含所有字段名称的元组。

   ```python
   print(Point._fields)  # 输出: ('x', 'y')
   ```

5. **_make() 方法：**
   命名元组类有一个 `_make()` 方法，它可以接受一个可迭代对象作为参数，并使用这些值来创建一个新的命名元组对象。

   ```python
   p = Point._make([5, 6])
   ```

6. **_asdict() 方法：**
   命名元组对象有一个 `_asdict()` 方法，它返回一个将字段名映射到其值的字典。

   ```python
   print(p._asdict())  # 输出: {'x': 5, 'y': 6}
   ```

`namedtuple` 是一种很方便的数据结构，它可以让你创建具有命名字段的简单对象，而不需要定义一个完整的类。