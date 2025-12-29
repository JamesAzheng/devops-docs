---
title: "queue"
---

## queue 模块概述

Python中的`queue`模块提供了多种队列数据结构的实现，用于在多线程编程中进行线程安全的数据共享和通信。以下是`queue`模块中常用的类和函数：



## Queue 类型

- `queue.Queue(maxsize=0)`：创建一个FIFO队列（先进先出）。`maxsize`参数指定队列的最大容量，如果为0或负数，则队列的容量不受限制。
- `queue.LifoQueue(maxsize=0)`：创建一个LIFO队列（后进先出），也称为堆栈。
- `queue.PriorityQueue(maxsize=0)`：创建一个具有优先级的队列，其中元素按照优先级顺序排列。



## 常用方法

适用于上述所有队列类型：

## put()

`put(item, block=True, timeout=None)`，将元素放入到队列中。

- `item`
  - 将`item`放入队列中（推入队列的顶部（堆栈的顶部））。
- `block`
  - `block=True`（默认值），在队列已满时阻塞，直到有空间可用；
  - `block=False`，在队列已满时，抛出`queue.Full`异常。
- `timeout`
  - 指定在阻塞时等待的最长时间。



## put_nowait(item)

等效于`put(item, block=False)`，不会阻塞。



## get()

`get(block=True, timeout=None)`，从队列的顶部（堆栈的顶部）弹出一个元素。

- `block`：
  - `block=True`（默认值），在队列为空时阻塞，直到有元素可用；
  - `block=False`，在队列为空时抛出`queue.Empty`异常。
- `timeout=N`
  - 指定在阻塞时等待的最长时间。



## get_nowait(item)

等效于`get(item, block=False)`，不会阻塞。



## qsize()

返回队列中的元素数量。

```python
from queue import Queue

q = Queue(3)

q.put(1)
q.put(2)
q.put(3)

print(q.qsize()) # 3
```



## empty()

如果队列为空，则返回True；否则返回False。

```python
from queue import Queue

q = Queue()

q.put(1)

print(q.empty()) # False，队列不为空
print(q.get()) # 1
print(q.empty()) # True，队列为空
```



## full()

如果队列已满，则返回True；否则返回False。

```python
from queue import Queue

q = Queue(2)

q.put(1)

print(q.full()) # False，队列未满
q.put(2)
print(q.full()) # True，队列已满
```







## 不同队列类型的数据结构

不同的队列类型在Python中通常使用不同的数据结构来实现。以下是一些常见的队列类型及其基于的数据结构：

1. **FIFO 队列 (queue.Queue)**:
   - **数据结构**: FIFO 队列通常使用双向链表或动态数组（Python 中的 `collections.deque`）来实现。这些数据结构支持在队列的两端高效地添加和删除元素。

2. **LIFO 队列 (queue.LifoQueue)**:
   - **数据结构**: LIFO 队列实际上也可以使用双向链表或动态数组来实现，但元素的插入和删除操作会在相同的一端进行，从而模拟了堆栈（Stack）的行为。在Python中，`queue.LifoQueue`通常使用`collections.deque`来实现。

3. **优先级队列 (queue.PriorityQueue)**:
   - **数据结构**: 优先级队列通常使用堆（heap）数据结构来实现。Python中的`queue.PriorityQueue`实际上使用了`heapq`模块，它是一个二叉堆的实现，允许您以 O(log n) 的时间复杂度将元素插入并以 O(log n) 的时间复杂度从队列中取出具有最高优先级的元素。

这些队列类型都提供了不同的访问方式和行为，以满足不同的应用需求。FIFO 队列按照先进先出的原则进行排列，LIFO 队列按照后进先出的原则排列，而优先级队列允许为每个元素分配优先级并按照优先级进行排列。在选择队列类型时，请考虑您的具体需求以及需要的数据结构和行为。



## Queue

`queue.Queue` 是 Python 中 `queue` 模块提供的队列实现，它实现了先进先出（FIFO）队列，通常用于多线程编程中的数据共享和通信。下面是 `queue.Queue` 类的详细解释：

**创建 `Queue` 对象**：

- `queue.Queue(maxsize=0)`：创建一个 FIFO 队列。可以通过 `maxsize` 参数来限制队列的最大容量，如果 `maxsize` 为 0 或负数，则队列的容量不受限制。

**示例用法**：

```python
import queue

## 创建一个 FIFO 队列
q = queue.Queue()

## 放入元素
q.put(1)
q.put(2)

## 从队列中取出元素
item1 = q.get()  # item1 的值为 1，因为先进先出原则
item2 = q.get()  # item2 的值为 2

## 创建一个有容量限制的 FIFO 队列
q_with_maxsize = queue.Queue(maxsize=2)

## 放入元素
q_with_maxsize.put(1)
q_with_maxsize.put(2)

## 尝试放入第三个元素会导致阻塞，因为队列已满
## q_with_maxsize.put(3, block=True)  # 阻塞

## 使用非阻塞方式放入元素，会抛出 queue.Full 异常
try:
    q_with_maxsize.put_nowait(3)
except queue.Full:
    print("Queue is full!")

## 从队列中取出元素
item3 = q_with_maxsize.get()  # item3 的值为 1
item4 = q_with_maxsize.get()  # item4 的值为 2
```

`queue.Queue` 类通常用于多线程编程中，允许多个线程安全地共享数据，并且按照先进先出的顺序处理数据。因为它提供了线程安全的操作，所以适用于需要在线程之间传递数据的情况。



## 范例：Queue 队列使用简单示例

- 队列中有数据时，可以立即获取元素；
- 当队列中没有元素时，会陷入阻塞。
  - 陷入阻塞为默认情况，可以通过以下方式解决：
  - `put(item, block=True, timeout=None)`设置超时时间
  - `put(item, block=True, timeout=None)`
  - 使用多线程

```python
from queue import Queue

## 创建一个 FIFO 队列
q = Queue()

## 向队列中放入元素
q.put(1)
q.put(2)
q.put(3)

## 从队列中取出元素
print(q.get()) # 1
print(q.get()) # 2
print(q.get()) # 3
print(q.get()) # 陷入阻塞
print('-' * 30) # 因陷入阻塞，所以不会打印
```



## 范例 ：通过多线程解决阻塞

- 通过多线程的方式解决阻塞问题

```python
import threading
import time
from queue import Queue

## 创建一个 FIFO 队列
q = Queue()

## 向队列中放入元素
q.put(1)
q.put(2)
q.put(3)

## 从队列中取出元素
print(q.get()) # 1
print(q.get()) # 2
print(q.get()) # 3

def pushdata():
    time.sleep(5)
    print('~' * 30)
    q.put('test')

t = threading.Thread(target=pushdata)
t.start()

print(q.get())
print('-' * 30)
```

这段代码涉及到多线程的队列操作，主要使用了Python中的`threading`模块来创建线程，并使用`queue.Queue`来创建一个FIFO队列，然后在主线程中向队列中放入元素，另一个线程在一段时间后向队列中放入另一个元素。

下面是代码的执行过程解释：

1. 首先，创建一个FIFO队列`q`。

2. 使用`q.put(1)`、`q.put(2)`和`q.put(3)`向队列中放入元素1、2和3。

3. 然后，使用`q.get()`从队列中取出元素，按照FIFO原则，第一个取出的是元素1，然后是2和3。因此，以下代码将在主线程中打印出：

   ```python
   1
   2
   3
   ```

4. 接下来，创建了一个新的线程`t`，该线程执行`pushdata`函数。

5. `pushdata`函数在执行前休眠了5秒，然后向队列中放入了一个字符串`'test'`，此时队列变为`[1, 2, 3, 'test']`。

6. 主线程继续执行，然后使用`q.get()`从队列中取出一个元素，因为队列中已经有元素，所以这一行代码不会阻塞，它会立即取出队列中的下一个元素。在这里，它将取出字符串`'test'`。

7. 最后，主线程打印一行横线，输出结果如下：

   ```python
   test
   ------------------------------
   ```

总结：这段代码展示了多线程中使用`queue.Queue`来进行线程间通信，主要利用队列来实现线程安全的数据传递。在队列中，数据的存入和取出是线程安全的，因此可以避免多线程竞争的问题。



## 范例 ：put(block & timeout）

- `put(block=False)`和`put(timeout=N)`

```python
from queue import Queue

## 创建一个 FIFO 队列
q = Queue()

## 向队列中放入元素
q.put(1)

## 从队列中取出元素
print(q.get()) # 1
print(q.get(timeout=3)) # 取不到元素后，3秒钟超时，最后抛出_queue.Empty异常
print('-' * 30) # 不会被打印
```

```python
from queue import Queue

## 创建一个 FIFO 队列
q = Queue()

## 向队列中放入元素
q.put(1)

## 从队列中取出元素
print(q.get()) # 1
print(q.get(block=False)) # 取不到元素后直接抛出_queue.Empty异常
print('-' * 30) # 不会被打印
```



## 范例：捕获 queue.Empty 异常



## LifoQueue

`LifoQueue`（Last-In, First-Out Queue）是Python `queue` 模块提供的一种队列实现，它实现了后进先出（LIFO）的队列策略，也被称为堆栈（Stack）。与常规队列不同，`LifoQueue`允许您将元素推入队列的顶部，然后从顶部弹出元素。这种数据结构的特点是最后进入队列的元素首先被取出。

以下是`LifoQueue`类的主要特性和方法：

**创建`LifoQueue`对象**：

- `queue.LifoQueue(maxsize=0)`：创建一个LIFO队列。与`Queue`类类似，您可以通过`maxsize`参数来限制队列的最大容量，如果`maxsize`为0或负数，则队列的容量不受限制。

**示例用法**：

```python
import queue

## 创建一个LIFO队列
lifo_q = queue.LifoQueue()

## 推入元素
lifo_q.put(1)
lifo_q.put(2)

## 从队列的顶部弹出元素
item1 = lifo_q.get()  # item1的值为2，因为最后推入的元素最先弹出
item2 = lifo_q.get()  # item2的值为1

## 检查队列是否为空
is_empty = lifo_q.empty()  # is_empty为True
```

`LifoQueue`通常用于需要按照后进先出顺序处理元素的情况，例如在深度优先搜索（DFS）算法中，或者在需要执行撤销操作的应用程序中。与普通队列不同，`LifoQueue`提供了一种反向的元素访问方式。



## 范例：LifoQueue 队列使用简单示例

- 其实和 LifoQueue 很类似，只不过LifoQueue是后进先出

```python
from queue import LifoQueue

q = LifoQueue()

q.put(1)
q.put(2)
q.put(3)

print(q.get()) # 3
print(q.get()) # 2
print(q.get()) # 1
print(q.get()) # 阻塞
```



## PriorityQueue

`PriorityQueue` 是 Python `queue` 模块提供的一种队列实现，它允许您在队列中为元素分配优先级，并确保元素按照优先级的顺序出队。这种队列常用于需要按照一定规则对元素进行排序和处理的情况，如任务调度和事件处理。

以下是 `PriorityQueue` 类的主要特性和方法：

1. **创建 `PriorityQueue` 对象**：
   - `queue.PriorityQueue(maxsize=0)`：创建一个优先级队列。与 `Queue` 类类似，您可以通过 `maxsize` 参数来限制队列的最大容量，如果 `maxsize` 为 0 或负数，则队列的容量不受限制。

2. **常用方法**：
   - `put(item, block=True, timeout=None)`：将带有优先级的 `item` 放入队列。`item` 必须是一个元组，包含两个元素：第一个元素是优先级（通常是一个数值），第二个元素是实际的数据项。优先级较低的元素将在队列中排在优先级较高的元素之后。如果队列已满且 `block` 为 True（默认值），则会阻塞直到有空间可用；如果 `block` 为 False，且队列已满，则抛出 `queue.Full` 异常。`timeout` 参数指定在阻塞时等待的最长时间。
   - `get(block=True, timeout=None)`：从队列中取出优先级最高的元素。如果队列为空且 `block` 为 True（默认值），则会阻塞直到有元素可用；如果 `block` 为 False，且队列为空，则抛出 `queue.Empty` 异常。`timeout` 参数指定在阻塞时等待的最长时间。
   - `qsize()`：返回队列中的元素数量。
   - `empty()`：如果队列为空，则返回 True；否则返回 False。
   - `full()`：如果队列已满，则返回 True；否则返回 False。
   - `put_nowait(item)`：等效于 `put(item, block=False)`，不会阻塞。

3. **示例用法**：

```python
import queue

## 创建一个优先级队列
priority_q = queue.PriorityQueue()

## 放入带有优先级的元素
priority_q.put((3, "Low-priority item"))
priority_q.put((1, "High-priority item"))
priority_q.put((2, "Medium-priority item"))

## 从队列中取出元素（按优先级顺序）
item1 = priority_q.get()  # item1 的值为 (1, "High-priority item")
item2 = priority_q.get()  # item2 的值为 (2, "Medium-priority item")
item3 = priority_q.get()  # item3 的值为 (3, "Low-priority item")
```

`PriorityQueue` 允许您将带有不同优先级的元素放入队列，并确保它们按照优先级的顺序被处理。这在任务调度、事件处理和其他需要按照一定规则对元素进行排序的应用程序中非常有用。注意，元素的优先级是通过元组的第一个元素来确定的，因此在放入队列时，请确保为元素分配正确的优先级。



## 范例：元素类型不同会报错

```python
from queue import PriorityQueue

q = PriorityQueue()

q.put(1)
q.put(2)
q.put('tom')
'''
TypeError: '<' not supported between instances of 'str' and 'int'
'''
```

在您的代码中，您尝试使用`PriorityQueue`来存储不同类型的元素（整数和字符串）。`PriorityQueue`内部会尝试根据元素的比较操作符 `<` 来确定元素的优先级顺序。然而，在Python中，整数和字符串之间不能直接比较，因此当您尝试将一个字符串与整数进行比较时，会引发`TypeError`异常。

要解决这个问题，您可以确保所有元素都具有可比较性，或者为每个元素明确指定一个可比较的优先级。以下是两种解决方法：

1. **确保元素具有可比较性**：

   - 如果您要将不同类型的元素放入`PriorityQueue`，请确保这些元素都具有可比较性。这可以通过将它们转换为具有相同类型的对象来实现，或者使用自定义对象，并在自定义对象上实现比较操作符。例如：

   ```python
   from queue import PriorityQueue
   
   class ComparableItem:
       def __init__(self, priority, value):
           self.priority = priority
           self.value = value
   
       def __lt__(self, other):
           return self.priority < other.priority
   
   q = PriorityQueue()
   q.put(ComparableItem(1, 'apple'))
   q.put(ComparableItem(2, 'banana'))
   q.put(ComparableItem(3, 'cherry'))
   ```

2. **为每个元素指定可比较的优先级**：

   - 如果您不想修改元素的类型，可以为每个元素明确指定一个可比较的优先级。例如，为整数分配较低的优先级，为字符串分配较高的优先级：

   ```python
   from queue import PriorityQueue
   
   q = PriorityQueue()
   q.put((1, 1))
   q.put((2, 2))
   q.put((3, 'tom'))
   ```

   在这个示例中，元素是以元组的形式存储的，其中第一个元素表示优先级，第二个元素是实际的数据项。这样，字符串元素具有较高的优先级，而整数元素具有较低的优先级。





## 示例用法：

```python
import queue

## 创建一个FIFO队列
q = queue.Queue()

## 放入元素
q.put(1)
q.put(2)

## 从队列中取出元素
item1 = q.get()
item2 = q.get()

## 创建一个LIFO队列
lifo_q = queue.LifoQueue()

## 创建一个具有优先级的队列
priority_q = queue.PriorityQueue()

## 使用优先级队列
priority_q.put((1, "high-priority item"))
priority_q.put((3, "low-priority item"))
priority_q.put((2, "medium-priority item"))

## 取出元素（按优先级顺序）
item = priority_q.get()  # 返回(1, "high-priority item")
```

`queue`模块的这些类和函数可以帮助您在多线程应用程序中实现线程安全的队列，以便在不同线程之间安全地共享数据和进行通信。

