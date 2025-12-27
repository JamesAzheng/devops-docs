---
title: "functools"
---

# functools

`functools` 模块是 Python 标准库中的一个模块，它提供了一些用于高阶函数（Higher-Order Functions）和函数操作的工具。高阶函数是那些接受一个或多个函数作为参数或返回一个函数作为结果的函数。`functools` 模块包括一些有用的函数，如 `partial`、`reduce`、`wraps` 等，用于函数的修饰、组合和操作。

以下是 `functools` 模块中一些常用函数的简要说明：

1. `functools.partial`：该函数用于部分应用（Partial Application）一个函数，即固定函数的一些参数，返回一个新的函数。这对于创建具有默认参数的函数非常有用。

```python
from functools import partial

# 创建一个新函数，固定了一个参数
double = partial(lambda x, y: x * y, 2)
result = double(5)  # 等同于调用 lambda x: 2 * x，返回 10
```

2. `functools.reduce`：这个函数用于对可迭代对象中的元素进行累积操作。它接受一个二元函数和一个可迭代对象，并返回累积的结果。

```python
from functools import reduce

# 使用 reduce 计算阶乘
result = reduce(lambda x, y: x * y, range(1, 6))  # 返回 120，即 5!
```

3. `functools.wraps`：这个函数用于将装饰器用于函数时，保留原函数的元数据（比如文档字符串和函数名）。这对于编写装饰器时保持函数信息的完整性很重要。

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # 执行一些装饰操作
        result = func(*args, **kwargs)
        return result
    return wrapper
```

`functools` 模块还包括其他一些函数，用于缓存、比较、自定义排序和其他高级函数编程任务。这些函数可以帮助你更好地利用 Python 中的函数式编程特性，以及更灵活地操作函数。





