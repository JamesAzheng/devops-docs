---
title: "Python练习题"
---


## 质数（素数）

**求100以内的质数**



**给一个数，判断它是否是质数 (素数)**

要判断一个数是否是质数（素数），可以使用循环和条件语句来实现。

一个数是质数当且仅当它大于1且只能被1和它本身整除。因此，我们可以从2开始遍历到这个数的平方根，判断是否有因子能够整除它，如果有，则这个数就不是质数。如果遍历完了仍然没有因子能够整除它，那么它就是质数。

以下是一个实现示例：

```python
import math

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(math.sqrt(n))+1):
        if n % i == 0:
            return False
    return True

## 测试
print(is_prime(5))  # True
print(is_prime(10)) # False

```

在这个例子中，我们定义了一个函数 `is_prime`，它接受一个参数 `n`，表示要判断的数。如果 `n` 小于等于1，则返回 `False`，因为1不是质数。否则，我们遍历2到`n`的平方根之间的所有数，并判断是否能够整除`n`。如果有因子能够整除它，返回 `False`，否则返回 `True`。最后，我们测试了两个例子来验证这个函数的正确性。

这样就可以实现判断一个数是否是质数的功能了。



**求10万内的所有质数 (素数)**

要求10万内的所有质数，可以使用埃拉托色尼筛法（Sieve of Eratosthenes）算法来实现。这个算法的基本思想是，从2开始，把所有2的倍数标记为合数；然后找到下一个未标记的数3，把所有3的倍数标记为合数；依次类推，直到找到所有小于等于n的质数。

以下是一个实现示例：

```python
def find_primes(n):
    # 用列表存储数字是否是质数的信息，初始化时全部为True
    is_prime = [True] * (n+1)
    # 从2开始遍历，标记所有2的倍数、3的倍数、4的倍数等为合数
    for i in range(2, int(n**0.5)+1):
        if is_prime[i]:
            for j in range(i*i, n+1, i):
                is_prime[j] = False
    # 返回所有质数
    return [i for i in range(2, n+1) if is_prime[i]]

## 测试
print(find_primes(100000))
```

在这个例子中，我们定义了一个函数 `find_primes`，它接受一个参数 `n`，表示要求的质数范围。首先，我们创建一个长度为 `n+1` 的列表 `is_prime`，用来存储每个数字是否是质数的信息，初始化时全部为 `True`。然后，从2开始遍历到 `sqrt(n)`，如果发现一个数字是质数，则把它的所有倍数标记为合数。最后，返回所有质数的列表。我们使用列表推导式来实现最后一步，只返回列表中值为 `True` 的索引，即为质数。

这样就可以实现求10万内的所有质数的功能了。



## 阶乘

**求5的阶乘**

```python
num = 5  # 为5求阶乘
factorial = 1
for i in range(num, 0, -1):  # 5到1循环五次
    factorial *= i
print(factorial)

```



**输入任意数，都可以计算出其对应的阶乘**

- 使用for循环，只计算一次

```python
num = input("请输入要计算阶乘的数字：")
factorial = 1  # 阶乘初始值只能为1，为0的话会导致任何数与0相乘结果都为0
try:
    num = int(num)
    for i in range(num, 0, -1):
        factorial *= i
    print(factorial)
except ValueError:
    print("输入不合法，请重新输入。")

```

- 使用while循环，可以反复计算多个数

```python
factorial = 1  # 阶乘初始值只能为1，为0的话会导致任何数与0相乘结果都为0
while True:
    num = input("请输入要计算阶乘的数字：\n按q退出")
    if num == 'q':
        break
    try:
        num = int(num)
        for i in range(num, 0, -1):
            factorial *= i
        print(num, "的阶乘为", factorial)
        factorial = 1  # 阶乘归1，否则多次计算后数值会叠加产生错误
    except ValueError:
        print("输入不合法，请重新输入。")

```



**求1到5阶乘之和**

方法一

```python
n = 5
factorial_sum = 0
factorial = 1

for i in range(1, n+1):
    factorial *= i
    factorial_sum += factorial

print(factorial_sum)  # 输出结果为 1 + 2 + 6 + 24 + 120 = 153
```

- `n = 5` 定义阶乘计算的范围，用于为 `range()` 函数输入数据
- `factorial_sum = 0` 保存所有阶乘的和
- `factorial = 1` 保存当前阶乘的值
- `for i in range(1, n+1):`，`range(1, n+1)` 阶乘计算的范围，此处开始为1，结束为6，前包后不包，因此计算的范围是1到5的阶乘之和，即循环五次。循环从 1 开始，每次迭代将 `factorial` 乘以当前迭代的自然数，然后将结果加到 `factorial_sum` 中。
  - 第一次循环，`factorial = factorial * 1` 得出1的阶乘为1，然后赋值给 `factorial_sum = factorial_sum + 1`
  - 第二次循环，`factorial = factorial * 1 * 2` 得出2的阶乘为2，然后赋值给 `factorial_sum = factorial_sum + 1 + 2`
  - 第三次循环，`factorial = factorial * 1 * 2 * 3` 得出3的阶乘为6，然后赋值给 `factorial_sum = factorial_sum + 1 + 2 + 6`
  - 第四次循环，`factorial = factorial * 1 * 2 * 3 * 4` 得出4的阶乘为24，然后赋值给 `factorial_sum = factorial_sum + 1 + 2 + 6 + 24`
  - 第五次循环，`factorial = factorial * 1 * 2 * 3 * 4 * 5` 得出5的阶乘为120，然后赋值给 `factorial_sum = factorial_sum + 1 + 2 + 6 + 24 + 120`
- 您的总结是正确的，完全覆盖了这段 Python 代码的逻辑流程。如果需要补充一些内容的话，可以讲一下该算法的时间复杂度是 O(n^2)，因为它使用了两个嵌套的循环。因此，对于较大的 n 值，这种算法的效率可能不太高，可以尝试使用其他算法进行优化，如递归算法或利用数学公式直接计算阶乘之和。



方法二

```python
factorial_sum = 0
for i in range(1, 6):
    factorial = 1
    for j in range(1, i+1):
        factorial *= j
    factorial_sum += factorial

print(factorial_sum)  # 输出结果为 153，即 1! + 2! + 3! + 4! + 5! = 1 + 2 + 6 + 24 + 120 = 153。
```

- 在这个实现中，外层循环变量 `i` 从 1 开始，每次迭代都计算当前迭代数的阶乘并加到 `factorial_sum` 中
- 内层循环变量 `j` 则用于计算当前迭代数的阶乘，每次迭代将当前数乘以前面所有的数。



注意事项：

- 注意，在计算阶乘之和时，我们需要将循环变量从 1 开始，因为 0 的阶乘是 1，而不是 0。因此，如果我们从 0 开始计算阶乘之和，将会得到错误的结果。
- 需要注意的是，阶乘之和增长非常快，很容易超出计算机的表示范围。因此，在计算大数阶乘之和时，需要使用高精度算法来保证结果的准确性。



## 打印九九乘法表

## for

### 方法一

该代码使用了两个嵌套的 for 循环来遍历每个数字，并使用 f-string 格式化字符串输出乘法表达式和结果。在内层循环中，我们使用 end='\t' 将输出的内容分隔开来，以产生适当的对齐效果。在外层循环结束后，使用 print() 语句来打印一个换行符，以便开始新的一行。

```python
for i in range(1, 10):
    for j in range(1, i+1):
        print(f"{j}x{i}={i*j}", end='\t')
    print()

```

- 第一行的 `for` 循环是从 1 到 9 遍历每个数字，它控制每一行的输出。
- 第二行的 `for` 循环是从 1 到当前行数遍历每个数字，它控制每行中每个数字的输出。
- 第三行的 `print()` 语句用于打印乘法表达式和结果。使用 f-string 格式化字符串，它包含乘法表达式 `j x i = i*j`，其中 `i` 和 `j` 分别代表当前行数和当前列数，`i*j` 是它们的乘积。`end='\t'` 使得每个表达式之间使用制表符分隔开来，以产生适当的对齐效果。
- 第四行的 `print()` 语句用于打印一个换行符，以便开始新的一行。

最终输出的结果是一个完整的九九乘法表，其中每一行都包含了从 1 到当前行数的乘法表达式和结果，而且它们以制表符分隔开来，看起来很整齐。



## while

### 方法一

该代码的结构与 `for` 循环版本类似，只是将 `for` 循环替换为了 `while` 循环。

首先使用 `i` 和 `j` 分别表示当前行数和当前列数，初始值都为 1。

在外层 `while` 循环中，只要 `i` 没有达到 10，就会执行内层 `while` 循环和换行操作。

在内层 `while` 循环中，只要 `j` 没有达到 `i+1`，就会输出乘法表达式和结果，然后 `j` 加 1。最后，每次内层 `while` 循环结束后，将 `i` 加 1。

```python
i = 1
while i <= 9:
    j = 1
    while j <= i:
        print(f"{j}x{i}={i*j}", end='\t')
        j += 1
    print()
    i += 1

```

1. 初始化 `i` 为 1，表示当前乘法表的行数，进入第一个 `while` 循环。
2. 初始化 `j` 为 1，表示当前乘法表的列数，进入第二个 `while` 循环。
3. 在第二个 `while` 循环中，如果 `j` 小于等于 `i`，则输出 `j x i = i*j` 的结果，然后 `j` 自增 1，重复此操作直到 `j > i`。
4. 退出第二个 `while` 循环，输出一个空行，并将 `i` 自增 1，回到第一个 `while` 循环。
5. 如果 `i` 小于等于 9，重复步骤 2-4。

整段代码的逻辑非常清晰，先遍历每行，再遍历每列，输出乘法表达式和结果。同时，使用 `end='\t'` 控制每个乘法表达式之间使用制表符隔开，输出结果呈现为一个矩形。该代码与使用两个嵌套 `for` 循环的代码实现相似，但使用 `while` 循环更加灵活，可以应用于更复杂的场景。



### 方法二

还有一种使用 `while` 循环打印九九乘法表的方法，它将两个 `while` 循环合并为一个。

输出结果和前面的示例相同。这种方法只使用一个 `while` 循环来控制输出，避免了使用两个 `while` 循环的繁琐。在循环体中，先输出乘法表达式和结果，然后将 `j` 加 1，如果 `j` 大于 `i`，则输出一个换行符，将 `i` 加 1，将 `j` 重置为 1。这样，我们就可以在一个循环中完成整个九九乘法表的输出。

以下是代码示例：

```python
i, j = 1, 1
while i <= 9 and j <= i:
    print(f"{j}x{i}={i*j}", end='\t')
    j += 1
    if j > i:
        print()
        i += 1
        j = 1

```

1. 初始化 `i` 和 `j` 为 1，表示当前乘法表的行数和列数。
2. 在 `while` 循环中，如果 `i` 小于等于 9 并且 `j` 小于等于 `i`，则输出 `j x i = i*j` 的结果，然后 `j` 自增 1。
3. 如果 `j` 大于 `i`，则输出一个空行，将 `i` 自增 1，并将 `j` 重置为 1。
4. 重复步骤 2-3，直到 `i` 大于 9。

整段代码的逻辑比较简单，只使用了一个 `while` 循环和一个 `if` 条件语句，将乘法表达式和结果输出到控制台上。同时，使用 `end='\t'` 控制每个乘法表达式之间使用制表符隔开，输出结果呈现为一个矩形。这种方法虽然没有使用嵌套的循环结构，但需要在每一轮循环中手动控制行数和列数，因此代码可读性和可维护性相对较低。



## 其他语言打印九九乘法表

- c

```c
#include <stdio.h>

int main() {
    int i, j;
    for (i = 1; i <= 9; i++) {
        for (j = 1; j <= i; j++) {
            printf("%dx%d=%d\t", j, i, i*j);
        }
        printf("\n");
    }
    return 0;
}

```

- go

```go
package main

import "fmt"

func main() {
    for i := 1; i <= 9; i++ {
        for j := 1; j <= i; j++ {
            fmt.Printf("%dx%d=%d\t", j, i, i*j)
        }
        fmt.Println()
    }
}

```



## 用户登录验证

要求：

- 用户依次输入用户名和密码，然后提交验证
- 用户不存在、密码错误，都显示用户名或密码错误提示
- 错误3次，则退出程序
- 验证成功则显示登录信息



```python
## 定义一个字典，存储已注册的用户和密码
users = {"user1": "password1", "user2": "password2", "user3": "password3"}

## 定义变量，用于记录输入错误的次数
tries = 0

while tries < 3:
    # 获取用户输入的用户名和密码
    username = input("请输入用户名：")
    password = input("请输入密码：")

    # 验证用户名和密码是否正确
    if username in users and users[username] == password:
        print("登录成功！")
        # 显示登录信息
        print(f"欢迎回来，{username}！")
        break
    else:
        print("用户名或密码错误，请重新输入！")
        tries += 1

if tries == 3:
    print("您已连续3次输入错误，程序退出！")

```

- 首先定义了一个字典`users`，用于存储已注册的用户和密码。
- 然后使用一个`while`循环，让用户最多可以尝试3次输入用户名和密码进行验证。
  - 如果验证成功，则显示登录信息，程序结束。
  - 如果验证失败，则显示错误提示，尝试次数加1。
- 当用户连续输入错误达到3次时，程序退出。

**`if username in users and users[username] == password:`** 

这段代码是用于验证用户输入的用户名和密码是否正确的。它通过两个条件语句的组合来完成验证：

1. `username in users`：这个条件语句用于检查用户输入的用户名是否在字典`users`中存在。如果存在，返回True，否则返回False。
2. `users[username] == password`：这个条件语句用于检查用户输入的密码是否与字典`users`中对应用户名的密码匹配。如果匹配，返回True，否则返回False。

将这两个条件语句通过`and`关键字组合起来，可以实现用户名和密码同时正确才能通过验证的功能。如果用户名和密码都正确，则返回True，进入登录成功的分支；否则返回False，进入登录失败的分支，显示错误提示。

这段代码使用了字典数据类型，将用户名和密码保存为键值对的形式，可以方便地通过用户名快速查找对应的密码。同时，使用了`in`关键字来检查用户名是否存在于字典中，避免了使用列表或元组时需要遍历整个序列进行查找的麻烦。





## 打印图形

**打印一个边长为n的正方形（分别打印空心和实心的正方形，以*作为正方形的描边）**

- 空心正方形

```python
n = int(input("请输入正方形的边长："))  # 获取输入的正方形边长

## 外部循环控制每一行的输出
for i in range(n):
    # 内部循环控制每一行中的字符输出
    for j in range(n):
        # 判断是否在边界上，如果是则输出"*"，否则输出空格
        if i == 0 or i == n-1 or j == 0 or j == n-1:
            print("*", end="")
        else:
            print(" ", end="")
    # 每一行结束后输出一个换行符
    print()

```

- 在这个例子中，我们使用了两个嵌套的for循环，外部循环控制每一行的输出，内部循环控制每一行中的字符输出。
- 在内部循环中，我们使用if语句判断当前字符是否在边界上，如果是则输出"*"，否则输出空格。
- 最后，我们在每一行结束后输出一个换行符来换行。



- 实心正方形

```python
n = int(input("请输入正方形的边长："))  # 获取输入的正方形边长

## 外部循环控制每一行的输出
for i in range(n):
    # 内部循环控制每一行中每个字符的输出
    for j in range(n):
        print("*", end="")
    # 每一行结束后输出一个换行符
    print()

```

- 要打印一个边长为n的实心正方形，可以使用两个嵌套的循环，外部循环控制每一行的输出，内部循环控制每一行中每个字符的输出。
- 在这个例子中，我们使用两个嵌套的for循环，外部循环控制每一行的输出，内部循环控制每一行中每个字符的输出。在内部循环中，我们直接输出星号字符。最后，我们在每一行结束后输出一个换行符来换行。



**打印下面的菱形**

```python
   *
  ***
 *****
*******
 *****
  ***
   *
```

要打印这个菱形，可以分别打印上半部分和下半部分，再将它们拼接在一起。

以下是一个实现示例：

```python
n = int(input("请输入菱形的高度："))  # 获取输入的菱形高度

## 打印上半部分
for i in range(n):
    # 打印空格
    for j in range(n - i - 1):
        print(" ", end="")
    # 打印星号
    for j in range(2 * i + 1):
        print("*", end="")
    # 换行
    print()

## 打印下半部分
for i in range(n - 2, -1, -1):
    # 打印空格
    for j in range(n - i - 1):
        print(" ", end="")
    # 打印星号
    for j in range(2 * i + 1):
        print("*", end="")
    # 换行
    print()

```

在这个例子中，我们使用两个for循环打印上半部分和下半部分。在每一行中，我们首先打印一定数量的空格，然后打印一定数量的星号。空格和星号的数量根据行数而定，因此我们使用了两个嵌套的循环分别控制它们的数量。最后，我们在每一行结束后输出一个换行符来换行。

这样就可以打印出一个菱形了。注意，在上半部分和下半部分之间有一行重复的行，因此我们需要注意打印的顺序，以免出现重复的行。



## 打印杨辉三角

**打印杨辉三角前六行**

- 打印出杨辉三角的每一行数字即可
- 杨辉三角特点：
  - 第n行有n项，n是正整数
  - 第n行数字之和为2**(n-1)



## 斐波那契数列

**打印100以内的斐波那契数列**

要打印100以内的斐波那契数列，可以使用循环来计算并输出每个数。

斐波那契数列是指这样一个数列：0、1、1、2、3、5、8、13、21、34、……，在数学上，斐波那契数列可以用递归函数 f(n)=f(n-1)+f(n-2) 来定义，其中 f(0)=0，f(1)=1。

以下是一个实现示例：

```python
## 定义斐波那契数列的初始值
fibonacci = [0, 1]

## 循环计算斐波那契数列并输出
while True:
    # 计算下一个数
    next_num = fibonacci[-1] + fibonacci[-2]
    # 如果下一个数大于100，则退出循环
    if next_num > 100:
        break
    # 将下一个数添加到斐波那契数列中
    fibonacci.append(next_num)

## 输出斐波那契数列
print(fibonacci)

```

在这个例子中，我们使用一个列表 `fibonacci` 来存储斐波那契数列的值，初始值为 `[0, 1]`。然后我们使用循环计算斐波那契数列的每个数，直到下一个数大于100时退出循环。在循环中，我们首先计算下一个数，然后将它添加到 `fibonacci` 列表中。最后，我们输出 `fibonacci` 列表来打印斐波那契数列。

这样就可以打印出100以内的斐波那契数列了。



**求斐波那契数列第101项**

要求斐波那契数列的第101项，可以使用递归或循环的方法来计算。

使用递归方法来计算斐波那契数列的第101项，可以这样实现：

```python
def fibonacci(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(101)
print(result)

```

在这个例子中，我们定义了一个递归函数 `fibonacci`，它接受一个参数 `n`，表示要求的斐波那契数列的第 `n` 项。如果 `n` 等于 0 或 1，直接返回对应的值。否则，递归计算斐波那契数列的前两项相加的值。最后，我们调用 `fibonacci` 函数并将参数设置为 101 来计算斐波那契数列的第101项，并将结果输出。

使用循环方法来计算斐波那契数列的第101项，可以这样实现：

```python
a, b = 0, 1
for i in range(100):
    a, b = b, a + b
result = b
print(result)

```

在这个例子中，我们使用两个变量 `a` 和 `b` 来存储斐波那契数列的前两项的值，初始值分别为 0 和 1。然后，我们使用一个循环来计算斐波那契数列的前 100 项，每次计算时将 `a` 和 `b` 更新为它们的下一个值。最后，我们输出 `b` 的值作为斐波那契数列的第 101 项。

这样就可以求得斐波那契数列的第101项了。



## 其它

**打印1到10**

```python
for i in range(1, 11):
    print(i)
```



**打印10以内的奇数**

- 方法一，利用range函数的特性，效率最高，因为无需每次判断和计算

```python
for i in range(1, 10, 2):
    print(i)
```

- 方法二，利用continue

```python
for i in range(1, 10):
    if i % 2 == 0: # 如果i取模后余数为0，则说明其为偶数
        continue # 然后使用continue跳过本次循环，而不使用print打印偶数
    print(i)
```



**打印10以内的偶数**

- 方法一，利用range函数的特性，效率最高，因为无需每次判断和计算

```python
for i in range(0, 10, 2):
    print(i)
```

- 方法二，利用continue

```python
for i in range(0, 10):
    if i % 2 == 1: # 如果i取模后余数为1，则说明其为奇数
        continue # 然后使用continue跳过本次循环，而不使用print打印奇数
    print(i)
```



**倒着打印10以内的奇数和偶数**

- 方法一，利用range函数，打印奇数

```python
for i in range(9, 0, -2):
    print(i)
```

- 方法一，利用range函数，打印偶数

```python
for i in range(8, 0, -2):
    print(i)
```



**打印2的0次幂到10次幂的值**

- 方法一：

```python
for i in range(11):
    result = 2 ** i
    print("2 **", i, "=", result)
```

- 输出结果为：

```
2 ** 0 = 1
2 ** 1 = 2
2 ** 2 = 4
2 ** 3 = 8
2 ** 4 = 16
2 ** 5 = 32
2 ** 6 = 64
2 ** 7 = 128
2 ** 8 = 256
2 ** 9 = 512
2 ** 10 = 1024
```



- 方法二：

```python
for i in range(11):
    print(i, 2**i)
```

- 输出结果为：

```
0 1
1 2
2 4
3 8
4 16
5 32
6 64
7 128
8 256
9 512
10 1024
```



**计算1000以内的被7整除的前20个正整数**

- for循环实现，方法一（效率不高，因为需要计算0~999，并且还会出现0）

```python
count = 0 # 计数器
for i in range(1, 1000):
    if i % 7 == 0:
        print(count, i)
        count += 1
    elif count > 20:
        break

```

- for循环实现，方法二（效率较高）

```python
count = 0 # 计数器
for i in range(7, 1000, 7):
    print(count, i)
    count += 1
    if count > 20:
        break

```

- while循环实现



**给一个半径，求圆的面积和周长。圆周率3.14**

PS：

- 要通过圆的半径计算圆的面积和周长，需要使用以下公式：
  - 圆的面积 = π x 半径²
  - 圆的周长 = 2 x π x 半径
  - 其中，圆周率π的值约为3.14。
- 因此，如果已知圆的半径，可以使用上述公式计算出圆的面积和周长。
- 例如，假设圆的半径为5厘米，则：
  - 圆的面积 = 3.14 x 5² = 78.5平方厘米
  - 圆的周长 = 2 x 3.14 x 5 = 31.4厘米



方法一：

```python
pi = 3.14
radius = float(input("请输入圆的半径（单位cm）："))  # 将输入值转换为浮点数
area = pi * (radius ** 2)  # 计算圆的面积
girth = 2 * pi * radius  # 计算圆的周长

print("圆的面积为：", round(area, 2), "平方厘米")
print("圆的周长为：", round(girth, 2), "厘米")
```

- 首先使用`float()`将输入的字符串类型半径值转换为浮点数类型，以便在计算中使用。

  - 将 input 输入内容转换为浮点数或整数是为了确保输入的值可以直接参与数学运算，否则 Python 会将输入的值视为字符串类型，而不是数值类型，这会导致错误。

    - ```python
      radius = input("请输入圆的半径（单位cm）：")
      radiuss = float(input("请输入圆的半径（单位cm）："))  # 将输入值转换为浮点数
      
      print(type(radius)) # <class 'str'>
      print(type(radiuss)) # <class 'float'>
      ```

  - Python 中是不支持将字符串类型和数字类型直接参与数学运算的，所以需要将输入的字符串类型转换为数值类型。此处我们使用`float()`将输入的字符串转换为浮点数类型。

- 然后使用 `pi * (radius ** 2)` 计算圆的面积，使用 `2 * pi * radius` 计算圆的周长

  - 在python中，幂运算`**`的优先级要比乘`*`的优先级要高，为了提高代码的易读性，可以使用括号将其括起来`pi * (radius ** 2)`

- 最后打印结果。

  - 打印结果时使用 `round()` 函数的目的是让其四舍五入精确到小数点后两位，因为 Python 中浮点数类型是不精确的，即由于内部表示方式的限制，浮点数的运算可能会产生舍入误差。例如：半径输入为5，则周长的打印结果将为 `31.400000000000002`



方法二，通过math模块实现（math模块可以提供许多的数学函数和常量，其中的π可以精确到3.141592653589793）

```python
1
```





**输入两个数，比较大小后，从小到大升序打印（在写一份降序打印的）**

```
1
```



其他实现方式：

注意，以下两份代码中，当用户输入相同的数时，程序不会对其进行排序，仍会原样输出。

以下是输入两个数，比较大小后，从小到大升序打印的 Python 代码：

```python
a = float(input("请输入第一个数："))
b = float(input("请输入第二个数："))
if a > b:
    a, b = b, a
print("从小到大排序：", a, b)

```

- 首先使用 `input()` 函数让用户输入两个数，这里使用 `float()` 函数将输入值转换为浮点数类型。
- 然后使用 `if` 语句比较两个数的大小，如果第一个数大于第二个数，就将两个数交换位置，这样可以确保变量 `a` 存储的是较小的数，变量 `b` 存储的是较大的数。
- 最后使用 `print()` 函数打印排序后的结果。

以下是输入两个数，比较大小后，从大到小降序打印的 Python 代码：

```python
a = float(input("请输入第一个数："))
b = float(input("请输入第二个数："))
if a < b:
    a, b = b, a
print("从大到小排序：", a, b)

```

- 与上述代码相比，唯一不同的地方是在 `if` 语句的判断条件上，如果第一个数小于第二个数，就将两个数交换位置，这样可以确保变量 `a` 存储的是较大的数，变量 `b` 存储的是较小的数。
- 最后使用 `print()` 函数打印排序后的结果。



a, b = b, a 详解：

在 Python 中，`a, b = b, a` 这种语法被称为元组解包（tuple unpacking）。它的作用是将一个元组中的值分别赋给多个变量。

在这里，`(b, a)` 是一个元组，包含两个值。而 `a, b = (b, a)` 则是将这个元组的第一个值赋给变量 `a`，第二个值赋给变量 `b`，相当于按照位置交换了 `a` 和 `b` 的值。

这种语法的好处是它使得变量的赋值更加简洁、直观。在 C 语言等其它编程语言中，要实现变量交换的功能需要使用一个临时变量，而在 Python 中则可以用一行代码解决，更加方便。

此外，元组解包的语法还可以用于函数返回值的接收。例如：

```python
def get_name_and_age():
    return "Tom", 20

name, age = get_name_and_age()

```

这里的 `get_name_and_age()` 函数返回一个包含两个值的元组，然后使用元组解包的方式将这两个值分别赋给 `name` 和 `age` 两个变量。





**依次输入若干个整数，打印出最大值。如果输入为空，则退出程序**

可以使用一个 `while` 循环来读取用户的输入，然后使用一个变量 `max_num` 来记录输入的最大值。每当读取到一个新的整数时，就判断它是否比 `max_num` 大，如果是则更新 `max_num` 的值。如果输入为空，就退出循环并打印出最大值。

```python
max_num = None  # 用 None 初始化最大值

while True:
    s = input("请输入一个整数（输入空行退出）：")
    if not s:  # 如果输入为空，退出循环
        break
    try:
        num = int(s)  # 将输入的字符串转换为整数
    except ValueError:
        print("输入不合法，请重新输入")
        continue
    if max_num is None or num > max_num:  # 如果当前输入的数比最大值大，更新最大值
        max_num = num

if max_num is not None:
    print("最大值为：", max_num)
else:
    print("没有输入任何数，程序已退出")

```

- 在这个代码中，我们使用了 `input` 函数读取用户输入，并通过一个 `try-except` 语句来捕捉输入不合法的异常。如果输入为空行，就跳出循环并打印出最大值。



还可以使用 Python 内置函数 `max()` 来获取输入整数的最大值。每次读取一个整数时，将其加入一个列表中，直到输入为空，然后使用 `max()` 函数找到列表中的最大值。

```python
nums = []  # 定义一个空列表

while True:
    s = input("请输入一个整数（输入空行退出）：")
    if not s:  # 如果输入为空，退出循环
        break
    try:
        num = int(s)  # 将输入的字符串转换为整数
    except ValueError:
        print("输入不合法，请重新输入")
        continue
    nums.append(num)  # 将输入的整数加入列表

if nums:  # 如果列表不为空，则打印最大值
    print("最大值为：", max(nums))
else:  # 如果列表为空，则打印提示信息
    print("没有输入任何数，程序已退出")

```

- 在这个代码中，我们使用了一个空列表 `nums` 来保存输入的整数，每次读取一个整数时，将其加入列表中。如果输入为空行，就跳出循环并使用 `max()` 函数找到列表中的最大值。



**给定一个不超过5位的正整数 (不转换为字符串)，判断该数的位数，依次打印出万位、千位、百位、十位、个位的数字**

可以使用数学运算和整数除法运算来实现。

```python
num = int(input("请输入一个不超过5位的正整数："))

if num < 0 or num > 99999:
    print("输入的数不合法")
else:
    if num >= 10000:
        print("万位数字为：", num // 10000)
        num %= 10000
    if num >= 1000:
        print("千位数字为：", num // 1000)
        num %= 1000
    if num >= 100:
        print("百位数字为：", num // 100)
        num %= 100
    if num >= 10:
        print("十位数字为：", num // 10)
        num %= 10
    if num >= 0:
        print("个位数字为：", num)

```

- 这段代码首先读取一个不超过5位的正整数，然后使用 if 语句来逐个判断它的位数，依次输出万位、千位、百位、十位、个位上的数字。可以通过取整除法运算 `//` 和求余运算 `%` 来实现这一功能。
- `num %= x`  详解：
  - `num %= x` 是一种简写形式，等价于 `num = num % x`，即取 `num` 除以 `x` 的余数，并将结果赋值给 `num` 变量。
  - 例如，如果 `num` 的值为 `10`，执行 `num %= 3` 后，`num` 的值将变为 `1`，因为 `10` 除以 `3` 的余数为 `1`。
  - 这种写法可以简化代码，尤其在需要多次对同一个变量执行取余操作时。例如，要将一个数限制在某一范围内，可以使用 `num %= max_num`，其中 `max_num` 表示所需的最大值。这样，`num` 的值就会被限制在 `0` 到 `max_num - 1` 之间。
  - 需要注意的是，`%=` 是一个赋值运算符，因此它会改变原始变量的值



**给定一个不超过5位的正整数，判断该数是几位数，依次从万位打印到个位的数字**

```python
num = int(input("请输入一个不超过5位的正整数："))

if num >= 10000:  # 判断是否是五位数
    print("万位：", num // 10000)  # 取整除以得到万位数字
    num %= 10000  # 取余数，保留后四位数字

if num >= 1000:  # 判断是否是四位数
    print("千位：", num // 1000)  # 取整除以得到千位数字
    num %= 1000  # 取余数，保留后三位数字

if num >= 100:  # 判断是否是三位数
    print("百位：", num // 100)  # 取整除以得到百位数字
    num %= 100  # 取余数，保留后两位数字

if num >= 10:  # 判断是否是两位数
    print("十位：", num // 10)  # 取整除以得到十位数字
    num %= 10  # 取余数，保留个位数字

print("个位：", num)  # 最后一定是个位数，直接打印即可

```

- 该程序首先使用 `input()` 函数获取一个不超过 5 位的正整数，然后通过判断该数的大小来确定它是几位数，从而分别打印出万位、千位、百位、十位和个位上的数字。
- 程序中，用 `//` 符号表示取整除，例如 `num // 10000` 表示取 `num` 的万位数字。用 `%` 符号表示取余数，例如 `num % 10000` 表示取 `num` 的后四位数字。
- 需要注意的是，在每个判断语句中，如果满足该数是当前位数及以上的数，就要先打印出当前位的数字，并使用取余数的方式保留该数的后面位数，以便后续判断该数的其他位数。



**输入n个数，求每次输入后的算数平均数**

```python
count = 0  # 计数器，记录输入数的个数
sum = 0  # 存储输入数的和

while True:
    num = input("请输入一个数（输入q结束）：")
    if num == 'q':
        break  # 输入q时结束循环
    num = float(num)  # 将输入的字符串转换成浮点数
    count += 1
    sum += num
    average = sum / count  # 计算平均数
    print("当前平均数为：", average)

print("程序结束")

```

- 上述代码中使用了一个无限循环 while True，只要输入的不是 'q'，就会不断进行循环。
- 每次输入一个数时，将其转换成浮点数，累加到 sum 中，并将 count 加 1。
- 计算平均数时，直接将 sum 除以 count 即可。每次计算完平均数后，都会将其打印出来。
- 当输入 'q' 后，循环结束，程序也就结束了。



```python
count = 0  # 计数器，记录输入数的个数
sum = 0  # 存储输入数的和

while True:
    try:
        num = input("请输入一个数（输入q结束）：")
        if num == 'q':
            break  # 输入q时结束循环
        num = float(num)  # 将输入的字符串转换成浮点数
        count += 1
        sum += num
        average = sum / count  # 计算平均数
        print("当前平均数为：", average)
    except ValueError:
        print("输入不合法，请重新输入")
        continue

print("程序结束")

```





**求100内所有奇数的和（结果应为2500）**

```python
sum = 0  # 定义一个变量用于累加和
for i in range(1, 101, 2):  # 循环遍历1~100内的奇数
    sum += i  # 累加和
print("100内所有奇数的和为：", sum)

```

- 首先定义一个变量 `sum` 用于累加和，初始化为 0。
- 然后使用 `for` 循环遍历从 1 到 100 的所有奇数，步长为 2，即 `range(1, 101, 2)`。
- 在循环体中，将遍历到的奇数累加到 `sum` 中。
- 循环结束后，输出累加的结果 `sum`，即为 100 内所有奇数的和。



**判断学生成绩，成绩等级A至E。其中，90分以上为'A'，80~89分为'B'，70~79分为'C'，60~69分为'D'，60分以下为'E'**

```python
score = int(input("请输入学生成绩："))
if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
elif score >= 70:
    grade = 'C'
elif score >= 60:
    grade = 'D'
else:
    grade = 'E'

print("学生成绩等级为：", grade)

```

- 首先，通过 `input` 函数获取用户输入的学生成绩，由于需要判断学生成绩等级，因此需要将输入的字符串类型转换为整型数据类型，使用 `int()` 函数进行转换。
- 然后，使用 `if-elif-else` 语句进行成绩等级的判断，根据题目所给条件，90分以上为'A'，80\~~89分为'B'，70~~79分为'C'，60~69分为'D'，60分以下为'E'。
- 最后，将判断结果打印输出即可。



如果需要判断多个学生成绩，可以将上述代码放在一个循环中，每次输入一个学生成绩，然后根据上述方法进行判断并打印输出。

```python
while True:
    try:
        score = input("请输入学生成绩：(按q退出)")
        if score == 'q':
            break
        score = int(score)
        if score >= 90:
            grade = 'A'
        elif score >= 80:
            grade = 'B'
        elif score >= 70:
            grade = 'C'
        elif score >= 60:
            grade = 'D'
        else:
            grade = 'E'
        print("学生成绩等级为：", grade)
    except ValueError:
        print("输入不合法，请重新输入。")

```







## 拷贝文件

## 01

**指定源文件并拷贝到目标目录**

- 方法一

```python
#!/usr/local/bin/python3.10
import shutil

src_file = "/etc/fstab"
dst_file = "/tmp/fstab.txt"

## 复制文件
shutil.copy(src_file, dst_file)
```

- 方法二（通过函数实现）

```
...
```



## 复制目录

选择一个已存在的目录作为当前工作目录，在其下创建a/b/c/d这样的子目录结构并在这些子目录的不同层级生成50个普通文件，要求文件名由随机4个小写字母构成。将a目录下所有内容复制到当前工作目录dst目录下去，要求复制的普通文件的文件名必须是x、y、Z开头。
举例，假设工作目录是/tmp，构建的目录结构是/tmp/a/b/c/d。在a、b、c、d目录中放入随机生成的文件，这些文件的名称也是随机生成的。最终把a目录下所有的目录也就是b、c、d目录，和文件名开头是x、y、z开头的文件。



要完成这个任务，你可以使用Python来创建目录结构、生成随机文件名以及复制指定文件。以下是一个示例脚本，可以实现这个任务：

```python
import os
import shutil
import random
import string

## 创建目录结构并生成随机文件
def create_directory_structure(base_dir):
    for dir_level in ['a', 'b', 'c', 'd']:
        current_dir = os.path.join(base_dir, dir_level)
        os.makedirs(current_dir, exist_ok=True)
        
        for _ in range(50):
            random_filename = ''.join(random.choice(string.ascii_lowercase) for _ in range(4))
            with open(os.path.join(current_dir, random_filename), 'w') as file:
                file.write("This is a random file.")

## 复制指定文件到目标目录
def copy_files(src_dir, dst_dir):
    for dirpath, dirnames, filenames in os.walk(src_dir):
        for filename in filenames:
            if filename[0] in ['x', 'y', 'z']:
                src_file = os.path.join(dirpath, filename)
                dst_file = os.path.join(dst_dir, os.path.relpath(src_file, src_dir))
                os.makedirs(os.path.dirname(dst_file), exist_ok=True)
                shutil.copy2(src_file, dst_file)

if __name__ == "__main__":
    base_dir = "/tmp"  # 你的工作目录
    dst_dir = "/tmp/dst"  # 目标目录
    
    # 创建目录结构并生成随机文件
    create_directory_structure(base_dir)
    
    # 复制指定文件到目标目录
    copy_files(os.path.join(base_dir, 'a'), dst_dir)
```

在这个示例中，首先使用 `create_directory_structure()` 函数创建目录结构并生成随机文件名的文件。然后，使用 `copy_files()` 函数复制以 'x'、'y' 和 'z' 开头的文件到目标目录。请确保将 `base_dir` 和 `dst_dir` 替换为你的实际工作目录和目标目录。





## 单词统计

文本生成方式：`man man > man.txt`

## 01

对某个文件进行单词统计，不区分大小写，并显示重复最多的十个单词（单词 出现次数）

以下是一个Python脚本，可以对一个文本文件进行单词统计，不区分大小写，并显示出现次数最多的前十个单词及其出现次数：

```python
import re
from collections import Counter

## 读取文件内容
def read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    return text

## 统计单词出现次数
def count_words(text):
    # 将文本转换为小写，以不区分大小写
    text = text.lower()
    
    # 使用正则表达式提取单词
    words = re.findall(r'\b\w+\b', text)
    
    # 使用Counter统计单词出现次数
    word_counts = Counter(words)
    
    return word_counts

## 显示出现次数最多的前十个单词
def display_top_words(word_counts, n=10):
    top_words = word_counts.most_common(n)
    
    print("Top {} Words:".format(n))
    for word, count in top_words:
        print("{}: {}".format(word, count))

if __name__ == "__main__":
    file_path = "your_file.txt"  # 请替换成你的文件路径
    
    # 读取文件内容
    text = read_file(file_path)
    
    # 统计单词出现次数
    word_counts = count_words(text)
    
    # 显示出现次数最多的前十个单词
    display_top_words(word_counts)
```

在这个脚本中，首先使用正则表达式提取文本中的单词，然后使用Counter类来统计单词出现的次数。最后，使用`most_common()`方法来获取出现次数最多的前十个单词，并将它们显示出来。请将`file_path`变量替换为你要处理的文本文件的路径。



## 02

在上一题基础之上，要求用户可以排除一些单词的统计，例如：a、the、of 等不应该出现在具有实际意义的统计中，应当忽略

要求全部代码使用函数封装，并调用完成

```python
...
```

为了允许用户排除一些特定的单词，我们可以在代码中添加一个参数，该参数接受一个要排除的单词列表，并在单词统计时忽略这些单词。以下是更新后的代码，将功能封装成函数并允许用户排除特定单词：

```python
import re
from collections import Counter

## 读取文件内容
def read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    return text

## 统计单词出现次数
def count_words(text, exclude_words=None):
    # 将文本转换为小写，以不区分大小写
    text = text.lower()
    
    # 使用正则表达式提取单词
    words = re.findall(r'\b\w+\b', text)
    
    # 如果提供了要排除的单词列表，将这些单词从统计中移除
    if exclude_words:
        words = [word for word in words if word not in exclude_words]
    
    # 使用Counter统计单词出现次数
    word_counts = Counter(words)
    
    return word_counts

## 显示出现次数最多的前十个单词
def display_top_words(word_counts, n=10):
    top_words = word_counts.most_common(n)
    
    print("Top {} Words:".format(n))
    for word, count in top_words:
        print("{}: {}".format(word, count))

if __name__ == "__main__":
    file_path = "your_file.txt"  # 请替换成你的文件路径
    exclude_words = ["a", "the", "of"]  # 要排除的单词列表
    
    # 读取文件内容
    text = read_file(file_path)
    
    # 统计单词出现次数并排除指定单词
    word_counts = count_words(text, exclude_words)
    
    # 显示出现次数最多的前十个单词
    display_top_words(word_counts)
```

在这个更新后的代码中，我们添加了一个名为 `exclude_words` 的参数，允许用户传递一个要排除的单词列表。在单词统计时，我们检查单词是否存在于排除列表中，如果存在则忽略。这样，用户可以自定义要排除的单词，而不仅仅是 "a"、"the" 和 "of"。
