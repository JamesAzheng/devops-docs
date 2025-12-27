---
title: "math"
---

# math

`math` 是 Python 标准库中的一个模块，提供了许多数学函数和常量。要使用 `math` 模块，需要先导入它：

```Python
import math
```

以下是 `math` 模块中常用的一些函数和常量：

## 常量

- `math.pi`：圆周率，约等于 3.141592653589793。
- `math.e`：自然常数，约等于 2.718281828459045。

## 数学函数

- `math.ceil(x)`：返回不小于 x 的最小整数（向上取整）。
- `math.floor(x)`：返回不大于 x 的最大整数（向下取整）。
- `math.trunc(x)`：返回 x 的整数部分。
- `math.pow(x, y)`：返回 x 的 y 次幂。
- `math.sqrt(x)`：返回 x 的平方根。
- `math.exp(x)`：返回 e 的 x 次幂。
- `math.log(x, base=math.e)`：返回以 base 为底的对数，如果不指定 base，则默认为 e。
- `math.log10(x)`：返回以 10 为底的对数。
- `math.sin(x)`、`math.cos(x)`、`math.tan(x)`：返回 x 的正弦、余弦、正切值。
- `math.asin(x)`、`math.acos(x)`、`math.atan(x)`：返回 x 的反正弦、反余弦、反正切值。
- `math.degrees(x)`：将 x 从弧度转换为角度。
- `math.radians(x)`：将 x 从角度转换为弧度。
- `math.hypot(x, y)`：返回点 (x, y) 到原点的距离。
- `math.atan2(y, x)`：返回点 (x, y) 的极角。

## 示例

```Python
import math

print(math.pi)              # 3.141592653589793
print(math.e)               # 2.718281828459045
print(math.ceil(3.5))       # 4
print(math.floor(3.5))      # 3
print(math.trunc(3.5))      # 3
print(math.pow(2, 3))       # 8.0
print(math.sqrt(4))         # 2.0
print(math.exp(2))          # 7.38905609893065
print(math.log(10))         # 2.302585092994046
print(math.log10(10))       # 1.0
print(math.sin(math.pi/2))  # 1.0
print(math.cos(math.pi/2))  # 6.123233995736766e-17
print(math.tan(math.pi/4))  # 0.9999999999999999
print(math.asin(1))         # 1.5707963267948966
print(math.acos(0))         # 1.5707963267948966
print(math.atan(1))         # 0.7853981633974483
print(math.degrees(math.pi))# 180.0
print(math.radians(180))    # 3.141592653589793
print(math.hypot(3, 4))  
```





