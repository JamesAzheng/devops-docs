---
title: "NumPy"
---

NumPy 是 Python 中用于数值操作的强大库，支持大型、多维数组和矩阵，同时提供了在这些数据结构上进行数学运算的函数。以下是一个简要概述：

1. **数组：** NumPy 的主要对象是 `numpy.ndarray`，一个多维元素数组。您可以使用 `numpy.array()` 创建数组。

```python
import numpy as np

arr = np.array([1, 2, 3])
```

2. **数组操作：** NumPy 提供各种操作，如逐元素加法、减法、乘法等。

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

result = a + b
```

3. **数组形状和重塑：** 您可以检查和修改数组的形状。

```python
arr.shape  # 返回数组的形状
arr.reshape((2, 3))  # 将数组重塑为 2x3 矩阵
```

4. **索引和切片：** 与 Python 列表类似，您可以使用索引和切片访问数组中的元素。

```python
arr[0]  # 访问第一个元素
arr[1:3]  # 访问从索引 1 到 2 的元素
```

5. **广播：** NumPy 允许在不同形状和大小的数组之间进行操作。

```python
arr = np.array([1, 2, 3])
scalar = 2
result = arr * scalar
```

6. **数学函数：** NumPy 提供了许多用于数组操作的数学函数。

```python
np.mean(arr)  # 计算数组的平均值
np.sin(arr)   # 逐元素应用正弦函数
```

7. **线性代数：** NumPy 有一个用于线性代数操作的模块 (`numpy.linalg`)。

```python
matrix = np.array([[1, 2], [3, 4]])
det = np.linalg.det(matrix)  # 计算矩阵的行列式
inv = np.linalg.inv(matrix)  # 计算矩阵的逆
```

这只是一个简要概述。NumPy 有许多其他功能，是 Python 科学计算生态系统中的基础库。