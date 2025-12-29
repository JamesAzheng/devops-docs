---
title: "threading 模块"
---

## Event()

在 Python 的 `threading` 模块中，`Event` 是一个同步原语，用于在线程之间通信。**它提供了一种机制，使得一个线程可以等待另一个线程发出的信号**。`Event` 对象包含一个内部标志，这个标志可以通过 `set()` 方法设置为 `True`，并通过 `clear()` 方法清除（即设置为 `False`）。此外，线程可以调用 `wait()` 方法阻塞自己，直到这个内部标志被设置为 `True`。

以下是 `Event` 类的主要方法：

1. `set()`: 将内部标志设置为 `True`。所有等待这个事件的线程都会被唤醒。
2. `clear()`: 将内部标志设置为 `False`。调用 `wait()` 方法的线程将会被阻塞，直到该标志被重新设置为 `True`。
3. `wait(timeout=None)`: 如果内部标志被设置为 `True`，则立即返回；否则，阻塞线程，直到内部标志被设置为 `True` 或 `timeout` 时间（如果提供的话）到期。
4. `is_set()`: 如果内部标志为 `True`，返回 `True`；否则返回 `False`。

下面是一个简单的示例，展示了如何使用 `Event` 对象在线程之间进行通信：

```python
import threading
import time

## 创建一个 Event 对象
event = threading.Event()

def worker():
    print("Worker is waiting for the event to be set.")
    event.wait()  # 等待事件被设置
    print("Worker has been notified. Event is set!")

def setter():
    time.sleep(2)  # 等待2秒钟
    print("Setting the event.")
    event.set()  # 设置事件

## 创建线程
t1 = threading.Thread(target=worker)
t2 = threading.Thread(target=setter)

## 启动线程
t1.start()
t2.start()

## 等待线程完成
t1.join()
t2.join()
```

在这个示例中，`worker` 线程会等待 `event` 被设置。当 `setter` 线程在 2 秒后调用 `event.set()` 时，`worker` 线程会被唤醒并继续执行。



## ---

在Python中，事件（Event）是一种线程同步的基本机制，用于在多线程编程中控制线程的执行顺序。当一个线程等待另一个线程发出的信号时，可以使用事件。事件对象管理一个内部标志，调用其`set()`方法可以将这个标志设置为真，调用其`clear()`方法可以将这个标志设置为假。线程可以通过`wait()`方法等待事件的内部标志变为真。

以下是一个简单的示例，演示了如何使用`threading.Event`来控制线程的执行顺序：

```python
import threading
import time

## 创建一个事件对象
event = threading.Event()

## 定义一个函数作为线程的目标函数
def thread_function(name):
    print(f"线程 {name} 正在等待事件.")
    event.wait()  # 等待事件
    print(f"线程 {name} 收到事件通知.")

## 创建两个线程
thread1 = threading.Thread(target=thread_function, args=("1",))
thread2 = threading.Thread(target=thread_function, args=("2",))

## 启动两个线程
thread1.start()
thread2.start()

time.sleep(2)  # 等待2秒钟

print("主线程设置事件.")
event.set()  # 设置事件，通知等待的线程

thread1.join()
thread2.join()
```

在上面的示例中，我们创建了一个`threading.Event`对象，并将其命名为`event`。然后我们定义了一个名为`thread_function`的函数，该函数等待事件，并在事件发生后打印消息。然后我们创建了两个线程，并启动它们。在主线程中，我们等待2秒钟，然后设置了事件，通知等待的线程。

这个程序的输出可能是：

```
线程 1 正在等待事件.
线程 2 正在等待事件.
主线程设置事件.
线程 1 收到事件通知.
线程 2 收到事件通知.
```

事件是一种非常有用的线程同步机制，它允许线程在需要的时候等待某个事件的发生。在复杂的多线程应用程序中，事件可以用于控制不同线程之间的交互和通信。



## Event 相关方法和属性

在Python中，`threading.Event`类提供了一些用于控制线程同步的方法和属性。下面是`threading.Event`类的常用方法和属性：

1. `set()`
   - 用法：`event.set()`
   - 功能：将事件标志设置为"已设置"，通知等待该事件的所有线程可以继续执行。

2. `clear()`
   - 用法：`event.clear()`
   - 功能：将事件标志设置为"未设置"，导致等待该事件的所有线程被阻塞。

3. `is_set()`
   - 用法：`event.is_set()`
   - 功能：检查事件标志是否被设置。如果事件标志被设置，则返回`True`；否则返回`False`。

4. `wait(timeout=None)`
   - 用法：`event.wait(timeout=None)`
   - 功能：等待事件标志被设置。如果事件标志已经被设置，则立即返回`True`。如果事件标志未设置，它将阻塞当前线程，直到事件标志被设置或者超时发生。如果提供了`timeout`参数且超时时间已过，则返回`False`。

这些方法可以帮助管理多个线程之间的同步，允许线程等待某个事件的发生或者触发特定的操作。可以在多线程编程中使用这些方法来确保线程之间的协调运行。

以下是一个简单示例，演示了如何使用`threading.Event`类的方法：

```python
import threading
import time

## 创建一个事件
event = threading.Event()

## 定义一个函数，当事件被设置时将会执行
def work():
    print("Thread is waiting for the event.")
    event.wait()
    print("Thread continues its operation.")

## 创建一个线程并启动它
thread = threading.Thread(target=work)
thread.start()

## 让主线程等待一段时间
time.sleep(3)

## 设置事件，使得线程可以继续执行
event.set()

## 等待线程结束
thread.join()
```

在这个例子中，`work`函数中的线程会等待`event`事件的设置。主线程在等待了一段时间后设置了事件，从而允许线程继续执行。



## 范例 - 1

```python
import threading
from threading import Event
import time

## 在2秒后设置传入的事件对象
def fn(e:Event):
    time.sleep(2)
    e.set()

## 创建一个threading.Event对象e
e = Event()

print(e) # <threading.Event object at 0x0000020023436650>，打印事件对象。这将打印出事件对象的内存地址。

print(e.is_set()) # False，打印事件对象的状态。在创建事件对象时，它的初始状态是未设置的，因此打印的结果为False。

## 创建了一个新的线程，目标函数为fn，传入的参数为事件对象e。这个线程会在后台运行。
threading.Thread(target=fn, args=(e,)).start()

## 等待事件的设置，最多等待5秒。在这里，由于新线程会在2秒后将事件对象设置为已设置，因此等待方法会在事件被设置后立即返回True。
print(e.wait(5)) # True
```

**e:Event** 含义：

在你提供的代码中，`e:Event`是函数`fn`的一个参数注解。在Python中，参数注解是对函数参数的说明，用于提供关于参数预期类型或其他信息的提示。它们不会对程序的执行产生直接影响，仅仅是为了提供一些辅助的信息。

在这个例子中，`e:Event`表示参数`e`的预期类型是`threading.Event`。这种注解的作用在于提供给阅读代码的人一些额外的信息，以便他们更好地理解函数的用途和预期。实际上，它并不会强制要求`e`参数必须是`threading.Event`类型，因为Python中的类型注解通常是可选的，不会影响代码的实际执行。

总的来说，`e:Event`注解在这个函数中是提供了关于参数`e`预期类型的信息，告诉其他人或工具该参数应该是`threading.Event`类型的对象。



## 例题 - 1

有一个老板和一个工人，老板让工人做十个杯子，并且老板一直盯着工工作，等着工人完成，直到工人完成，老板夸工人一句"good job"

### 正常写法

```python
import threading
import time
import logging

FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
logging.basicConfig(format=FORMAT, level=logging.INFO)

cpus = []
flag = False

def boss():
    logging.info('I\'m watching u')
    while not flag:
        time.sleep(1)
    logging.info('Good Job')

def worker(count=10):
    global flag # 必须声明为全局变量，否则flag将为局部变量，进而导致boss函数始终无法执行完毕。
    logging.info('I\'m working for u')
    while len(cpus) < count:
        time.sleep(0.5)
        cpus.append(1)
        logging.info('made one')
        print('当前杯子总数为: {}'.format(len(cpus)))
    flag = True
    logging.info('Finished My Job')

b = threading.Thread(target=boss, name='boss')
w = threading.Thread(target=worker, name='worker')
b.start()
w.start()
```



### 利用Event

```python
import threading
import time
import logging

FORMAT = "%(asctime)s - %(levelname)s - %(message)s"
logging.basicConfig(format=FORMAT, level=logging.INFO)

cpus = []
flag = False

def boss():
    logging.info('I\'m watching u')
    while not flag:
        time.sleep(1)
    logging.info('Good Job')

def worker(count=10):
    global flag # 必须声明为全局变量，否则flag将为局部变量，进而导致boss函数始终无法执行完毕。
    logging.info('I\'m working for u')
    while len(cpus) < count:
        time.sleep(0.5)
        cpus.append(1)
        logging.info('made one')
        print('当前杯子总数为: {}'.format(len(cpus)))
    flag = True
    logging.info('Finished My Job')

b = threading.Thread(target=boss, name='boss')
w = threading.Thread(target=worker, name='worker')
b.start()
w.start()
```



## 其它

在Python中，"事件"通常指的是事件驱动编程，即通过事件来触发特定的操作或函数。事件通常与图形用户界面（GUI）编程、网络编程和异步编程相关。下面是关于Python中事件的详细解释：

1. 事件是什么？
   事件是一种信号或通知，用于通知程序某个特定的事情已经发生，可以触发相应的操作或函数。这种模型用于处理异步操作，例如用户交互、网络数据传输或传感器数据。

2. 事件驱动编程
   在事件驱动编程中，程序不会按照线性顺序执行，而是等待事件的发生，然后根据事件来执行相应的代码。这种编程模型通常用于创建响应式的、交互式的应用程序。

3. 事件和回调函数
   在Python中，事件通常与回调函数结合使用。当特定事件发生时，相关的回调函数会被调用。回调函数是预定义的函数，它们用于处理特定事件，例如按钮点击、鼠标移动或网络数据到达。

4. 事件库
   Python中有许多库和框架，可以帮助实现事件驱动编程。一些常用的库包括：
   - Tkinter：用于创建图形用户界面（GUI）应用程序的标准库，它支持事件处理和回调函数。
   - PyQt和PySide：用于创建跨平台GUI应用程序的库，也支持事件处理。
   - Twisted：一个用于网络编程的事件驱动框架，用于处理异步网络操作。
   - asyncio：Python标准库中的模块，用于异步编程，它提供了事件循环和协程等工具。
   - Flask和Django：用于Web开发的框架，也支持处理HTTP请求和触发相应的视图函数。

5. 事件循环
   在事件驱动编程中，通常需要一个事件循环来等待和分发事件。事件循环会监听事件的发生，然后根据事件类型执行相关的回调函数。事件循环通常是一个无限循环，直到程序退出。

6. 事件处理的示例
   下面是一个简单的示例，演示如何使用Tkinter库处理按钮点击事件：

```python
import tkinter as tk

def on_button_click():
    label.config(text="Hello, World!")

app = tk.Tk()
app.title("Event Example")

label = tk.Label(app, text="")
label.pack()

button = tk.Button(app, text="Click Me", command=on_button_click)
button.pack()

app.mainloop()
```

在这个示例中，当用户点击"Click Me"按钮时，`on_button_click`函数将被调用，修改标签上的文本。

总之，事件驱动编程是一种非常常见的编程模型，用于创建响应式、交互式的应用程序。不同的库和框架提供了不同的事件处理机制，但基本的概念是相似的：等待事件发生，然后执行相应的操作。

## ---

## threading 模块概述

`threading` 模块是 Python 中用于多线程编程的标准库模块之一。它提供了创建和管理线程的工具，使得在 Python 中实现并发编程变得更加容易。

以下是 `threading` 模块的基本语法和示例：

1. **导入 threading 模块**：

   首先，您需要导入 `threading` 模块：

   ```python
   import threading
   ```

2. **创建线程**：

   使用 `Thread` 类来创建线程对象，指定要执行的函数或方法作为参数。以下是一个简单的线程创建示例：

   ```python
   def my_function():
       # 线程要执行的操作
       pass
   
   thread = threading.Thread(target=my_function)
   ```

3. **启动线程**：

   使用 `start()` 方法来启动线程：

   ```python
   thread.start()
   ```

4. **等待线程完成**：

   使用 `join()` 方法等待线程完成，以确保主线程等待子线程执行完毕：

   ```python
   thread.join()
   ```

5. **线程的状态**：

   您可以使用 `is_alive()` 方法来检查线程是否仍在运行：

   ```python
   if thread.is_alive():
       # 线程正在运行
   ```

6. **线程间通信**：

   线程之间可以通过共享数据结构来进行通信。要确保线程安全，您可能需要使用锁（Lock）或其他同步机制来防止竞争条件。

以下是一个简单的完整示例，演示了创建和启动两个线程：

```python
import threading

def print_numbers():
    for i in range(1, 6):
        print(f"Number: {i}")

def print_letters():
    for letter in 'abcde':
        print(f"Letter: {letter}")

## 创建线程
t1 = threading.Thread(target=print_numbers)
t2 = threading.Thread(target=print_letters)

## 启动线程
t1.start()
t2.start()

## 等待线程完成
t1.join()
t2.join()

print("Both threads are done.")
```

这个示例创建了两个线程，一个用于打印数字，另一个用于打印字母。主线程等待这两个线程执行完毕后才继续执行。注意，多线程编程需要小心处理共享资源，以避免竞争条件等问题。







Python的 `threading` 模块提供了创建和管理线程的工具，以下是使用 `threading` 模块创建线程的基本语法：

1. **导入 threading 模块**：

   首先，您需要导入 `threading` 模块：

   ```python
   import threading
   ```

2. **定义线程执行的函数**：

   创建一个函数，将在线程中执行。这个函数通常包含您想要在线程中并行执行的任务。

   ```python
   def my_function():
       # 线程要执行的操作
       pass
   ```

3. **创建线程对象**：

   使用 `Thread` 类创建线程对象，将要执行的函数作为 `target` 参数传递给线程对象。您还可以传递其他参数给函数。

   ```python
   thread = threading.Thread(target=my_function, args=(arg1, arg2))
   ```

   `args` 参数是一个元组，包含传递给函数的参数。

4. **启动线程**：

   使用 `start()` 方法启动线程，使其开始执行函数中的操作：

   ```python
   thread.start()
   ```

5. **等待线程完成**：

   使用 `join()` 方法等待线程完成，以确保主线程等待子线程执行完毕：

   ```python
   thread.join()
   ```

6. **线程的状态**：

   您可以使用 `is_alive()` 方法检查线程是否仍在运行：

   ```python
   if thread.is_alive():
       # 线程正在运行
   ```

7. **线程的命名**：

   您可以为线程指定一个名称，以便在日志和调试中更容易识别：

   ```python
   thread = threading.Thread(target=my_function, name="MyThread")
   ```

8. **设置线程为守护线程**：

   您可以使用 `setDaemon(True)` 方法将线程设置为守护线程，它将随着主线程的退出而自动退出：

   ```python
   thread.setDaemon(True)
   ```

下面是一个完整的示例，演示了如何使用 `threading` 创建和启动线程：

```python
import threading

def print_numbers():
    for i in range(1, 6):
        print(f"Number: {i}")

def print_letters():
    for letter in 'abcde':
        print(f"Letter: {letter}")

## 创建线程对象
thread1 = threading.Thread(target=print_numbers)
thread2 = threading.Thread(target=print_letters)

## 启动线程
thread1.start()
thread2.start()

## 等待线程完成
thread1.join()
thread2.join()

print("Both threads are done.")
```

这个示例创建了两个线程，一个用于打印数字，另一个用于打印字母。主线程等待这两个线程执行完毕后才继续执行。注意，多线程编程需要小心处理共享资源，以避免竞争条件等问题。



## Thread()

`threading.Thread()` 是 Python `threading` 模块中用于创建线程的类，它允许您创建和管理线程对象。

以下是`threading.Thread()` 的语法和使用方法的详细说明：

**语法**：

```python
thread = threading.Thread(target=function, args=(), kwargs={}, name=None, daemon=None)
```

**参数**：

- `target`（必需）：要在线程中执行的函数或方法。
- `args`（可选）：传递给目标函数的参数，以元组形式传递。
- `kwargs`（可选）：传递给目标函数的关键字参数，以字典形式传递。
- `name`（可选）：线程的名称，用于标识线程。
- `daemon`（可选）：布尔值，指定线程是否为守护线程。
  - 如果设置为 `True`，线程将被设置为守护线程；
  - 如果设置为 `False`，线程将被设置为非守护线程；
  - 默认为`None`，等价于`False`。


**使用方法**：

1. **创建线程对象**：

   使用 `threading.Thread()` 构造函数来创建线程对象，传递要在线程中执行的目标函数和任何参数：

   ```python
   import threading
   
   def my_function(arg1, arg2):
       # 线程要执行的操作
   
   thread = threading.Thread(target=my_function, args=(value1, value2))
   ```

   在上述示例中，`my_function` 是线程将要执行的函数，`arg1` 和 `arg2` 是传递给函数的参数。

2. **设置线程名称**：

   您可以为线程设置一个可选的名称，以便在日志和调试中更容易识别线程：

   ```python
   thread = threading.Thread(target=my_function, name="MyThread")
   ```

### 特殊写法

```python
threading.Thread(target=worker, name='w1', args=(lock,)).start()
```

这段代码创建了一个新的`Thread`实例，并立即调用了`start`方法，而没有显式地将实例化的线程对象存储在变量中。这种方式在不需要在后续代码中引用该线程对象的情况下是可以的。

但如果您需要对线程进行操作或跟踪它的状态，可以考虑将其实例化为变量，以便稍后引用。例子如下：

```python
import threading

## 假设有一个名为worker的函数
def worker(lock):
    # 做一些工作
    pass

lock = threading.Lock()
## 实例化线程对象
thread = threading.Thread(target=worker, name='w1', args=(lock,))
## 启动线程
thread.start()

## 在这里您可以对线程对象进行操作或跟踪其状态
## 例如，您可以调用thread.join()等方法来等待线程结束

## 其他的代码
```

通过实例化线程对象，您可以在需要时跟踪线程的状态，并调用其方法。

## start()

`start()` 方法是 Python `threading.Thread` 类的一个方法，用于启动线程并执行线程的目标函数。以下是 `start()` 方法的语法和详细使用方法：

**语法**：

```python
thread.start()
```

**使用方法**：

1. **创建线程对象**：

   首先，您需要使用 `threading.Thread()` 构造函数创建一个线程对象，并指定要在线程中执行的目标函数：

   ```python
   import threading
   
   def my_function(arg1, arg2):
       # 线程要执行的操作
   
   thread = threading.Thread(target=my_function, args=(value1, value2))
   ```

2. **启动线程**：

   使用 `start()` 方法启动线程，使其开始执行目标函数中的操作。一旦线程被启动，它将在后台运行：

   ```python
   thread.start()
   ```

   线程将在一个新的执行线程中并行运行，而不会阻塞主线程。

3. **注意事项**：

   - 通常，每个线程只能启动一次。如果尝试多次调用 `start()` 方法，将会引发 `RuntimeError` 异常。
     - 只能重新创建线程对象后再启动新的线程对象
   - 一旦线程被启动，不应手动调用线程的 `run()` 方法。`run()` 方法是 `start()` 内部调用的。

使用 `start()` 方法是多线程编程的基本步骤之一，它允许您并行执行线程的目标函数，从而提高应用程序的性能和响应性。要确保线程安全，需要小心处理共享资源，以避免竞争条件和数据不一致的问题。





## is_alive()

`is_alive()` 方法是 Python `threading.Thread` 类的一个方法，用于检查线程是否仍在运行。

以下是 `is_alive()` 方法的语法和详细使用方法：

**语法**：

```python
thread.is_alive()
```

**使用方法**：

1. **创建线程对象**：

   首先，您需要使用 `threading.Thread()` 构造函数创建一个线程对象，并指定要在线程中执行的目标函数：

   ```python
   import threading
   
   def my_function(arg1, arg2):
       # 线程要执行的操作
   
   thread = threading.Thread(target=my_function, args=(value1, value2))
   ```

2. **启动线程**：

   使用 `start()` 方法启动线程，使其开始执行目标函数中的操作：

   ```python
   thread.start()
   ```

   线程将在一个新的执行线程中并行运行。

3. **检查线程是否存活**：

   使用 `is_alive()` 方法检查线程是否仍在运行。这可以在需要时执行，以确定线程是否已完成或仍在执行：

   ```python
   if thread.is_alive():
       # 线程正在运行
   else:
       # 线程已完成
   ```

   如果线程仍在运行，`is_alive()` 方法返回 `True`；如果线程已经完成（包括正常完成和异常终止），则返回 `False`。

`is_alive()` 方法对于在主线程中监视其他线程的状态非常有用。您可以使用它来确定何时等待线程的完成或采取其他操作，具体取决于线程的状态。

请注意，一旦线程完成执行，`is_alive()` 将返回 `False`，即使您没有显式调用线程的 `join()` 方法。因此，您可以使用 `is_alive()` 来检查线程是否已经完成，而不一定需要等待线程的完成。

















## 范例 - 1

### test.py

```python
#!/usr/local/bin/python3
import threading
import time

def print_numbers():
    for i in range(1, 6):
        print(f"Number: {i}")
        time.sleep(3)

def print_letters():
    for letter in 'abcde':
        print(f"Letter: {letter}")
        time.sleep(3)

## 创建线程
t1 = threading.Thread(target=print_numbers)
t2 = threading.Thread(target=print_letters)

## 启动线程
t1.start()
t2.start()

## 等待线程完成
t1.join()
t2.join()

print("Both threads are done.")
```

#### PS

上面的代码中的函数定义、创建线程对象等操作都是在主线程中完成的。Python 的主程序从上往下顺序执行，所以这些操作在主线程中依次执行。

具体来说：

1. 函数 `print_numbers` 和 `print_letters` 的定义都在主线程中。
2. 创建线程对象 `t1` 和 `t2` 也是在主线程中执行的。
3. 启动线程 `t1.start()` 和 `t2.start()` 会在主线程中触发线程的并发执行。
4. 最后，主线程通过 `t1.join()` 和 `t2.join()` 等待线程 `t1` 和 `t2` 完成。

请注意，在上述代码中，`time.sleep(3)` 用于让每个线程休眠3秒，以便在输出中看到线程之间的交替执行。但不要将休眠操作与线程的实际并发执行混淆，线程在休眠期间不会占用 CPU 资源，其他线程仍然可以执行。



### 运行结果

```python
## ./test.py 
Number: 1
Letter: a
...


## pstree -p | grep test.py
           |-sshd(954)-+-sshd(1365)---bash(1449)---test.py(2404)-+-{test.py}(2405)
           |           |                                         `-{test.py}(2406)
```





## 范例：线程的结束方式

### break

- 通过break正常结束线程

```python
#!/usr/local/bin/python3
import threading
import time

def print_numbers():
    for i in range(1, 6):
        print(f"Number: {i}")
        time.sleep(1)
        if i == 3:
            break # 通过break正常结束线程

## 创建线程
t1 = threading.Thread(target=print_numbers)


## 启动线程
t1.start()
```

在您的代码中，当线程函数 `print_numbers` 中的 `if i == 3:` 条件满足时，您使用了 `break` 语句来跳出循环。这并不会终止线程，而只是终止了循环，线程函数仍然会继续执行其他部分的代码。

如果您在一个线程中使用 `break` 来跳出循环，线程本身不会被终止。线程会继续执行函数中的剩余部分，然后线程自然结束。在您的示例中，线程将在循环之后自动结束。

如果您需要在外部强制终止线程，而不是仅终止循环，通常需要使用一种线程终止的机制，例如设置一个标志来指示线程在某个条件下退出，或者使用 `threading.Event` 等线程同步工具来实现线程的安全终止。



### return

```python
#!/usr/local/bin/python3
import threading
import time

def print_numbers():
    for i in range(1, 6):
        print("Number: {}".format(i))
        time.sleep(1)
        if i == 3:
            return 123 # 通过return的方式

## 创建线程
t1 = threading.Thread(target=print_numbers)


## 启动线程
t1.start()
```

在您的代码中，当线程函数 `print_numbers` 中的 `if i == 3:` 条件满足时，您使用 `return 123` 将线程函数的执行提前结束。这意味着线程将在这一点上退出并终止，不会继续执行循环或线程函数的其余部分。

这种方式结束线程是通过线程函数的正常返回来实现的，而不是通过强制终止线程。线程函数在返回时，线程将自动退出，并且可以将一个返回值传递给线程对象。在您的示例中，您返回了整数 `123`。

注意，这种方式结束线程通常是比较安全的，因为它允许线程在执行清理工作之后正常退出。如果您在线程函数中使用了资源，如打开的文件或网络连接，正常返回可以确保这些资源得到正确地释放。

但是，这也意味着线程的结束是由线程函数的逻辑控制的，而不是由外部强制控制的。如果您需要在外部强制结束线程，可以考虑使用线程间的通信或信号机制来实现线程的安全终止。



### exception

```python
#!/usr/local/bin/python3
import threading
import time

def print_numbers():
    for i in range(1, 6):
        print("Number: {}".format(i))
        time.sleep(1)
        if i == 3:
            1 / 0 # 除零异常

## 创建线程
t1 = threading.Thread(target=print_numbers)


## 启动线程
t1.start()
```

在您的代码中，当线程函数 `print_numbers` 中的 `if i == 3:` 条件满足时，您使用了 `1 / 0` 的操作，这会引发一个除零异常（ZeroDivisionError）。

当线程抛出未捕获的异常时，线程会终止，并且异常信息将被打印到标准错误流（stderr）。在这种情况下，由于未捕获的异常，线程 `t1` 会异常终止，线程函数 `print_numbers` 不会继续执行剩余的代码。

请注意，线程中的异常通常应该被捕获和处理，以避免线程终止并且异常未处理。在实际的多线程应用程序中，捕获异常并根据需要进行处理是很重要的，以确保线程的稳定性和健壮性。

在这个特定示例中，由于异常未被捕获，线程 `t1` 会终止，但主线程会继续运行，因此您可能会看到异常信息在主线程之后输出。



### raise

```python
#!/usr/local/bin/python3
import threading
import time

def print_numbers():
    for i in range(1, 6):
        print("Number: {}".format(i))
        time.sleep(1)
        if i == 3:
            raise RuntimeError

## 创建线程
t1 = threading.Thread(target=print_numbers)


## 启动线程
t1.start()
```

在您的代码中，当线程函数 `print_numbers` 中的 `if i == 3:` 条件满足时，您使用了 `raise RuntimeError` 来引发一个 `RuntimeError` 异常。

当线程引发未捕获的异常时，线程会终止，并且异常信息将被打印到标准错误流（stderr）。在这种情况下，由于未捕获的异常，线程 `t1` 会异常终止，线程函数 `print_numbers` 不会继续执行剩余的代码。

这种方式结束线程是相对安全的，因为您显式引发了异常，并且可以选择在异常发生时进行必要的处理，例如记录错误信息或执行清理操作。但是需要注意，未捕获的异常会终止线程，因此需要适当处理异常以确保线程的稳定性。

总的来说，引发异常来结束线程是一种常见的做法，但需要谨慎处理异常，以确保不会产生未捕获的异常导致线程不稳定。同时，建议记录异常信息以进行调试和错误报告。



### PS

在绝大多数情况下，推荐的方式是使用正常的线程函数返回来结束线程。这意味着线程函数中的代码自然执行完毕并返回，线程会在完成任务后自动退出。这种方式是安全的，因为它允许线程完成清理工作，例如资源释放，而不会产生未处理的异常。

强制终止线程（例如，使用 `threading.Thread` 对象的 `terminate()` 方法或 `os._exit()`）通常被认为是不安全的，因为它可能会导致资源泄漏、数据不一致或其他不可预测的问题。强制终止线程通常是最后的手段，应该避免使用。

在某些情况下，如果线程需要在外部条件满足时立即终止，您可以考虑使用线程间的通信机制，例如使用一个共享的退出标志或 `threading.Event` 来通知线程退出。这样的方式更加安全，允许线程在退出之前完成当前任务。

总之，尽量避免使用强制终止线程的方式，而是让线程自然结束，或者使用线程间通信来安全地控制线程的终止。这有助于确保多线程程序的可维护性和稳定性。





## 范例：threading的属性和方法

- `threading.active_count()`: 返回当前活动线程的数量。
- `threading.current_thread()`: 返回当前线程对象。
- `threading.main_thread()`: 返回主线程对象。
- `threading.enumerate()`：返回所有活着的线程列表，不包括已经终止的线程和未开始的线程。
- `threading.get_ident()`：返回当前线程的ID，非0整数。

```python
#!/usr/local/bin/python3
import threading
import time


def show_thread_info(name):
    thread_info = {
        "active_count": threading.active_count(),
        "main_thread": threading.main_thread(),
        "current_thread": threading.current_thread(),
        "enumerate": threading.enumerate(),
        "get_ident": threading.get_ident()
    }

    for key, value in thread_info.items():
        print(name, f"{key}: {value}")

def print_numbers():
    show_thread_info('in')
    for i in range(1, 6):
        print("Number: {}".format(i))
        time.sleep(1)
        if i == 3:
            break

## 创建线程
t1 = threading.Thread(target=print_numbers)

show_thread_info('out')

## 启动线程
t1.start()

'''
out active_count: 1
out main_thread: <_MainThread(MainThread, started 20392)>
out current_thread: <_MainThread(MainThread, started 20392)>
out enumerate: [<_MainThread(MainThread, started 20392)>]
out get_ident: 20392
in active_count: 2
in main_thread: <_MainThread(MainThread, stopped 20392)>
in current_thread: <Thread(Thread-1 (print_numbers), started 12668)>
in enumerate: [<_MainThread(MainThread, stopped 20392)>, <Thread(Thread-1 (print_numbers), started 12668)>]
in get_ident: 12668
Number: 1
Number: 2
Number: 3
'''
```



## start() & run()

在 Python 的 `threading` 模块中，`start()` 方法用于启动一个新的线程，并在新线程中执行 `run()` 方法。`run()` 方法是线程对象的实际工作函数，包含了线程的主要逻辑。一般情况下，您需要继承 `threading.Thread` 类并重写 `run()` 方法，然后通过 `start()` 方法来创建并启动新线程。

下面是一个示例，说明了 `start()` 方法和 `run()` 方法的关系：

```python
import threading

class MyThread(threading.Thread):
    def run(self):
        for i in range(5):
            print(f"Thread {self.name}: {i}")

## 创建线程对象
t1 = MyThread()
t2 = MyThread()

## 启动线程，会在新线程中执行 run() 方法
t1.start()
t2.start()

## 主线程继续执行自己的工作
for i in range(5):
    print(f"Main Thread: {i}")
```

在这个示例中，`start()` 方法会在新线程中执行 `run()` 方法，而主线程会继续执行自己的工作。这样可以实现多线程并发执行。

需要注意的是，**直接调用 `run()` 方法不会创建新线程，而是在当前线程中执行 `run()` 方法的代码**。通常情况下，我们使用 `start()` 来创建新线程，而不是直接调用 `run()`。





## Daemon 线程

- **daemon 线程，守护线程，后台运行；**
  - 守护线程通常用于在后台执行任务。
  - 通过将线程设置为守护线程，您可以确保主线程在退出时不必等待所有线程完成。这在编写多线程应用程序时非常有用，可以提高应用程序的可管理性。
- **non-daemon 线程，非守护线程，前台运行；**
  - 非守护线程通常用于执行重要的任务，需要等待线程完成。

**注意事项：**

- daemon 属性，必须在 start 方法前设置好。

- 一旦线程被设置为守护线程，您无法将其重新设置为非守护线程。

- **如未定义daemon属性，则从父线程继承daemon值**（daemon=True 或 daemon=False）

  - 如果创建的线程对象没有明确设置 `daemon` 属性的值（即没有显式设置为 `daemon=True` 或 `daemon=False`），那么该线程的 `daemon` 属性将继承自创建它的父线程。
  - 具体来说，如果父线程是守护线程（`daemon=True`），则默认情况下新创建的子线程也会被视为守护线程，其 `daemon` 属性为 `True`。如果父线程不是守护线程（`daemon=False`，这是大多数情况），则子线程的 `daemon` 属性也会被设置为 `False`。
  - 这个机制有助于控制线程的终止行为。如果一个线程是守护线程，那么当主线程（或其他非守护线程）退出时，它会随之退出，无论它是否完成。而非守护线程会阻止程序退出，直到它完成。
  - 如果您希望明确设置线程的 `daemon` 属性，可以在创建线程时使用 `daemon=True` 或 `daemon=False` 来指定。这样可以更精确地控制线程的行为。

  



### non-daemon

```python
#!/usr/local/bin/python3
import threading
import time

def foo():
    for i in range(1, 6):
        print(i)
        time.sleep(1)

t = threading.Thread(target=foo) # 默认不开启 daemon 线程 

t.start()

print('Main Thread Finished.')
```

线程 `t` 默认不是守护线程（`daemon=False`，这是 `Thread` 类的默认行为）。这意味着当主线程结束时，它会等待 `t` 线程完成执行，然后程序才会退出。因此，会看到线程 `t` 中的循环完全执行后，才会打印 "Main Thread Finished"。



### daemon

```python
#!/usr/local/bin/python3
import threading
import time

def foo():
    for i in range(1, 6):
        print(i)
        time.sleep(1)

t = threading.Thread(target=foo, daemon=True) # daemon=True 表示开启 daemon 线程 

t.start()

print('Main Thread Finished.')
```

通过设置 `daemon=True`，将线程 `t` 设置为守护线程。这意味着当主线程结束时，它不会等待 `t` 线程完成执行，而会立即退出程序。因此，会看到 "Main Thread Finished" 被立即打印，而不需要等待线程 `t` 的循环完成。



### 其他 Daemon 线程相关方法

#### setDaemon()

**通常直接在Thread类实例化时直接添加`daemon`参数，等价于`setDaemon()`**

`setDaemon()` 方法是 Python `threading.Thread` 类的一个方法，用于将线程设置为守护线程或非守护线程。以下是 `setDaemon()` 方法的语法和详细使用方法：

**语法**：

```python
thread.setDaemon(daemonic)
```

**参数**：

- `daemonic`（必需）：布尔值，指定线程是否为守护线程。如果设置为 `True`，线程将被设置为守护线程；如果设置为 `False`，线程将被设置为非守护线程。

**使用方法**：

1. **创建线程对象**：

   首先，您需要使用 `threading.Thread()` 构造函数创建一个线程对象，并指定要在线程中执行的目标函数：

   ```python
   import threading
   
   def my_function(arg1, arg2):
       # 线程要执行的操作
   
   thread = threading.Thread(target=my_function, args=(value1, value2))
   ```

2. **设置线程为守护线程或非守护线程**：

   使用 `setDaemon()` 方法将线程设置为守护线程或非守护线程，根据您的需求传递 `True` 或 `False` 作为参数：

   ```python
   thread.setDaemon(True)  # 设置为守护线程
   ```

   或

   ```python
   thread.setDaemon(False)  # 设置为非守护线程
   ```

   - 如果线程被设置为守护线程，它将在主线程退出时自动退出，无论它是否完成。
   - 如果线程被设置为非守护线程，它将在主线程退出时继续执行，直到完成为止。
   - 默认情况下，线程被设置为非守护线程。

3. **启动线程**：

   使用 `start()` 方法启动线程，使其开始执行目标函数中的操作：

   ```python
   thread.start()
   ```

   线程将在一个新的执行线程中并行运行。



### daemon线程的应用场景

守护线程（daemon 线程）通常用于在后台执行一些任务，它们的生命周期通常与主线程（或其他非守护线程）相互独立。以下是一些守护线程的应用场景：

1. **后台任务处理**：守护线程适合用于处理一些后台任务，如日志记录、数据备份、周期性任务等。这些任务不需要干扰主线程的正常执行，但需要在程序运行期间持续执行。

2. **定时任务**：守护线程可以用于执行定时任务，例如定时清理临时文件、定时发送心跳信号等。

3. **监控任务**：在一些应用中，需要不断监控某些资源或条件，以便在满足特定条件时执行某些操作。这些监控任务通常适合作为守护线程运行。

4. **网络服务器**：在网络服务器应用程序中，通常会使用守护线程来处理客户端的请求。这样可以让主线程专注于监听新连接，而守护线程处理客户端的请求，使得服务器能够同时服务多个客户端。

5. **数据采集和处理**：守护线程适用于数据采集和处理的场景，例如从传感器或外部设备获取数据，并将其持续处理或存储到数据库中。

6. **信号处理**：在一些应用中，需要处理各种信号或事件，守护线程可以用于监听并处理这些信号，以便及时响应。

请注意，守护线程的特性是，一旦主线程（或其他非守护线程）结束，它们会立即退出，不会等待任务完成。因此，在使用守护线程时，需要确保这些线程的任务可以在主线程退出之前完成，或者通过其他机制来确保数据的完整性和一致性。它们适合处理不需要严格控制的任务，但需要持续运行的场景。



### PS

主要应用场景有:
1.后台任务。如发送心跳包、监控，这种场景最多
2.主线程工作才有用的线程。如主线程中维护这公共的资源，主线程已经清理了，准备退出，而工作线程使用这些资源工作也没有意义了，一起退出最合适
3.随时可以被终止的线程
如果主线程退出，想所有其它工作线程一起退出，就使用daemon=True来创建工作线程比如，开启一个线程定时判断WEB服务是否正常工作，主线程退出，工作线程也没有必须存在了，应该随着主线程退出一起退出。这种daemon线程一旦创建，就可以忘记它了，只用关心主线程什么时候退出就行了。
**daemon线程，简化了程序员手动关闭线程的工作.**
如果在non-daemon线程A中，对另一个daemon线程B使用了ioin方法，这个线程B设置成daemon就没有什么意义了，因为non-daemon线程A总是要等待B。如果在一个daemon线程C中，对另一个daemon线程D使用了ioin方法，只能说明C要等待D，主线程返出，C和D不管是否结束，也不管它们谁等谁，都要被杀掉。





## join() 方法

`join()` 方法是 Python `threading.Thread` 类的一个方法，用于等待线程完成执行。

`join()` 方法允许主线程等待其他线程完成执行，确保线程之间的协作和顺序执行。这对于需要等待其他线程生成结果或完成关键任务的情况非常有用。如果不需要等待线程完成，主线程可能会继续执行，而不考虑线程的状态。

请注意，在使用 `join()` 方法时，如果线程无法正常完成（例如，线程陷入无限循环或出现异常），主线程可能会一直等待，因此需要谨慎处理线程的异常情况。



以下是 `join()` 方法的语法和详细使用方法：

**语法**：

```python
thread.join([timeout])
```

**参数**：

- `timeout`（可选）：最长等待时间（以秒为单位）。如果指定了 `timeout`，则 `join()` 方法会阻塞主线程，但不会无限期等待，而是在超过指定的 `timeout` 时间后返回。

**使用方法**：

1. **创建线程对象**：

   首先，您需要使用 `threading.Thread()` 构造函数创建一个线程对象，并指定要在线程中执行的目标函数：

   ```python
   import threading
   
   def my_function(arg1, arg2):
       # 线程要执行的操作
   
   thread = threading.Thread(target=my_function, args=(value1, value2))
   ```

2. **启动线程**：

   使用 `start()` 方法启动线程，使其开始执行目标函数中的操作：

   ```python
   thread.start()
   ```

   线程将在一个新的执行线程中并行运行。

3. **等待线程完成**：

   使用 `join()` 方法等待线程执行完毕。这是通过在主线程中调用 `join()` 方法来实现的：

   ```python
   thread.join()
   ```

   此时，主线程将被阻塞，直到线程完成为止。线程完成后，主线程将继续执行。

4. **等待超时时间（可选）**：

   如果需要设置最长等待时间，可以传递 `timeout` 参数给 `join()` 方法，以秒为单位。如果线程在指定的超时时间内未完成，则 `join()` 方法将返回。这是一个可选的参数：

   ```python
   thread.join(timeout=5)  # 最长等待5秒
   ```



### 范例 - 1

```python
#!/usr/local/bin/python3
import threading
import time

def foo(name, sleep=1):
    for i in range(1, 6):
        print(i, name)
        time.sleep(sleep)

t = threading.Thread(target=foo, args=('azheng',), daemon=True)

t.start()

t.join()

print('Main Thread Finished.')
```

在这段代码中，`t.join()` 起到了等待线程 `t` 完成的作用。具体来说，它的作用包括以下几点：

1. **启动线程 `t`**：首先，通过 `t.start()` 启动了线程 `t`，使其开始执行 `foo` 函数。

2. **等待线程 `t` 完成**：接下来，通过 `t.join()` 调用，主线程将等待线程 `t` 执行完成。这意味着主线程会阻塞在这里，直到线程 `t` 的 `foo` 函数执行完毕。

3. **主线程继续执行**：一旦线程 `t` 的 `foo` 函数执行完成，`t.join()` 会返回，主线程会继续执行下面的代码。

所以，`t.join()` 的作用是确保主线程等待线程 `t` 完成后再继续执行后续的代码。这通常用于协调多个线程的执行顺序，以确保在主线程中需要线程 `t` 的执行结果或某种状态时，主线程能够等待线程 `t` 完成再进行下一步操作。



### PS

1. **一个线程中调用另一个线程的 `join` 方法，调用者将被阻塞，直到被调用线程终止，或阻塞超时**：
   这意味着如果一个线程（我们称之为线程A）在自己的代码中调用了另一个线程（线程B）的 `join` 方法，线程A将会被阻塞，直到线程B终止执行或达到设置的超时时间。这是一种线程间协作的机制，允许线程A等待线程B的完成。

2. **一个线程可被 `join` 多次**：
   一个线程可以在多个地方或多次调用其他线程的 `join` 方法。每次 `join` 会使调用线程阻塞等待被调用线程完成。这允许在不同部分的代码中等待同一个线程完成，或者等待不同的线程完成。

3. **`timeout` 参数指定调用者等待多久，没有设置超时，就一直等到被调用线程结束**：
   `join` 方法可以接受一个 `timeout` 参数，这是一个以秒为单位的浮点数或整数，它指定了调用线程要等待的最大时间。如果设置了超时，那么当被调用线程在指定时间内未完成时，`join` 方法会返回，调用线程将不再等待。如果未设置超时（通常是传入 `None`），那么调用线程将一直等待，直到被调用线程结束。

4. **调用谁的 `join` 方法，就是 `join` 谁，就要等谁**：
   这是最重要的概念。`join` 方法是用于等待其他线程完成的，当一个线程调用另一个线程的 `join` 方法时，它将等待被调用线程完成。这确保了线程之间的协同执行和控制。

总之，`join` 方法是多线程编程中用于等待其他线程完成的重要工具，可以协调线程之间的执行顺序和控制，以确保线程在需要的时候能够正确地协作和同步。



## Python 线程的状态转换过程

Python线程的状态转换过程是多线程编程中的一个重要概念，它描述了线程在其生命周期中可能经历的各种状态以及状态之间的转换。Python线程的状态包括以下几种：

1. **新建状态（New）**：线程被创建但尚未启动。
2. **就绪状态（Runnable/Ready）**：线程已经创建并等待分配CPU时间片，可以随时运行。
3. **运行状态（Running）**：线程正在执行其任务，占用CPU资源。
4. **阻塞状态（Blocked/Waiting/Sleeping）**：线程因为某种原因而暂时停止运行，例如等待I/O操作完成、休眠、等待锁、等待条件变量等。
5. **终止状态（Terminated/Dead）**：线程执行完成或出现异常，终止并释放资源。

线程的状态之间可以发生如下转换：

- **新建 -> 就绪**：当线程被创建后，可以调用 `start()` 方法使其进入就绪状态。
- **就绪 -> 运行**：线程调度器将就绪状态的线程分配CPU时间片，进入运行状态。
- **运行 -> 阻塞**：线程在运行过程中可能因为某种原因需要等待，例如等待I/O操作完成，线程进入阻塞状态。
- **阻塞 -> 就绪**：当线程等待的条件满足，它会重新进入就绪状态，等待调度器重新分配CPU时间片。
- **运行 -> 终止**：线程完成其任务或者出现了未捕获的异常，线程进入终止状态。
- **阻塞 -> 终止**：如果线程处于阻塞状态并且线程被中断或者引发了异常，线程可以直接进入终止状态。
- **运行 -> 就绪**：
  - 从运行状态到就绪状态的状态转换可能发生在以下情况下：

    1. 当线程的时间片用尽（CPU时间用完）时，线程调度器会将当前运行的线程切换到就绪状态，以便其他就绪状态的线程有机会运行。

    2. 当线程主动放弃CPU执行权，通常是通过调用 `time.sleep()`、等待I/O操作、等待锁、等待条件变量等阻塞操作时，线程也会从运行状态转换为就绪状态。这样可以让其他就绪状态的线程运行，提高系统的效率。

线程状态转换是由操作系统的线程调度器和Python解释器管理的，程序员通常只需要关注线程的创建、启动、等待和终止等基本操作，线程状态的转换是由底层系统和解释器来管理的。确保适当的线程同步机制和异常处理是编写多线程程序的关键，以确保线程能够正确地进入和退出各种状态，从而避免竞争条件和死锁等问题。



## 注意事项

### 尽量使用局部变量

在多线程编程中，尽量使用局部变量，可以增加程序的安全性。这是因为局部变量只在特定的作用域中可见，每个线程都有自己的执行栈，所以它们之间不会相互影响，也不会出现竞争条件或数据不一致的情况。

使用局部变量有助于避免多线程程序中常见的线程安全问题，例如竞争条件、死锁和数据竞争等。当多个线程需要访问同一个变量时，如果这个变量是局部变量，每个线程都会有自己的副本，它们之间不会相互影响，因此可以避免潜在的冲突和安全隐患。

在编写多线程应用程序时，建议将共享的资源限制在最小范围内，并尽可能使用局部变量来避免多线程访问共享资源时可能出现的问题。这样可以提高程序的健壮性和稳定性，确保多线程程序的正确性和安全性。

以下是一个使用局部变量的简单示例：

```python
import threading

def process_data(data):
    # 在这个函数中使用了局部变量result，它只在函数内部可见
    result = data * 2
    print(f"Processed data: {result}")

data = 5
## 创建线程并传入数据
thread = threading.Thread(target=process_data, args=(data,))
thread.start()

## 主线程继续执行其他任务
print("Main thread continues to run.")
```

在这个示例中，`process_data` 函数使用了一个局部变量 `result`，它只在函数内部可见。即使 `process_data` 函数在多个线程中被调用，每个线程都会有自己的 `result` 变量副本，彼此之间不会相互影响。这确保了在多线程环境中的安全性。

通过使用局部变量，我们可以避免多个线程之间共享数据时可能出现的竞争条件和数据不一致性问题。这样可以提高程序的稳定性和可靠性，并确保多线程应用程序的正确性。



### 尽量不使用全局变量

全局变量容易引发多个线程之间的竞争条件和数据不一致性问题，导致程序的不确定行为。使用全局变量可能会导致以下问题：

1. **竞争条件**：多个线程同时访问和修改全局变量时可能会导致竞争条件，导致数据的不一致性和错误的结果。

2. **复杂性增加**：全局变量会增加程序的复杂性，使得代码难以维护和调试。尤其是在大型项目中，全局变量可能会引起混乱和错误。

3. **可扩展性差**：过多的全局变量会降低程序的可扩展性，使得代码难以重用和扩展。这会影响代码的可读性和可维护性。

为了避免使用全局变量，可以考虑使用局部变量、实例变量或者传递参数的方式来传递数据。另外，可以使用线程安全的数据结构或同步机制来保护共享数据，以确保在多线程环境中数据访问的安全性和一致性。

总而言之，避免使用全局变量可以提高程序的健壮性和可靠性，在多线程环境中特别重要。使用局部变量和合适的数据共享机制可以有效减少并发编程中可能出现的问题，确保程序的正确性和稳定性。

#### 范例

```python
import threading
import logging
import time

FORMAT = "%(asctime)s %(levelname)s %(threadName)s %(message)s"

logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S", level=logging.INFO)

x = 0

def worker():
    global x
    for i in range(1000):
        time.sleep(0.0001)
        x += 1
    logging.info(f"x = {x}")

for i in range(10):
    threading.Thread(target=worker, name=f"w{i}").start()
'''
2023-10-17 13:55:09 INFO w4 x = 9991
2023-10-17 13:55:09 INFO w7 x = 9992
2023-10-17 13:55:09 INFO w2 x = 9993
2023-10-17 13:55:09 INFO w3 x = 9994
2023-10-17 13:55:09 INFO w0 x = 9995
2023-10-17 13:55:09 INFO w1 x = 9996
2023-10-17 13:55:09 INFO w8 x = 9997
2023-10-17 13:55:09 INFO w5 x = 9998
2023-10-17 13:55:09 INFO w6 x = 9999
2023-10-17 13:55:09 INFO w9 x = 10000
'''
```

- 在这段代码中，你创建了一个全局变量 `x` 并且有10个线程同时对它进行操作。这种情况下由于全局变量 `x` 是共享的，所以多个线程会同时访问和修改它，可能会引起竞争条件。

- 每个线程都会执行 `worker` 函数，该函数包含一个 `for` 循环，每次循环都会对全局变量 `x` 做加 1 操作，然后输出当前的 `x` 值。

- 由于 `x += 1` 操作并不是原子的，它包含了读取、加 1、写入的操作，因此在多个线程同时修改 `x` 的情况下可能会发生竞争条件。这就导致了输出结果中的混乱顺序，因为每个线程在不同的时间完成操作并输出结果。

- 最终的输出结果是10个线程最后累加到了 `x` 为10000。然而由于竞争条件，每个线程可能不是按照顺序逐个增加 `x` 的值，而是在竞争条件下交错执行，所以输出的结果顺序是混乱的。

- 为了避免这种竞争条件，可以使用线程锁或其他同步机制来保护共享资源 `x`，确保每次只有一个线程可以修改它，以确保数据的一致性和正确性。



### 进程返回值

在操作系统中，进程的返回值是指当一个进程终止时，它向其父进程返回的一个整型值。这个返回值可以用来表示进程的终止状态，通常用来指示进程是否成功执行了它的任务。在大多数操作系统中，这个返回值的范围是 0 到 255。

- 如果进程成功地执行完它的任务，通常会返回 0。
- 如果进程由于某些错误没有成功执行完任务，会返回一个非零的值。这个值的具体含义可以根据具体的程序而定，有些程序会对不同的错误码赋予不同的含义。

**对于工作线程（也称为子线程或后台线程），它们通常不能直接返回值给主线程**，因为它们在后台运行，并且不会与用户交互。因此，它们通常不会返回值给调用它们的线程。如果主线程需要获取工作线程的执行结果，可以使用线程间通信的机制，比如共享内存、消息传递、信号量等。

另外，具体根据不同的编程语言和操作系统，对于多线程中子线程返回值的获取方式可能有所不同。在某些编程语言和库中，提供了专门的机制来处理多线程间的通信和数据传递，比如使用 Future 或 Promise 对象等来获取子线程的执行结果。

因此，在多线程编程中，对于工作线程的返回值的获取是需要开发者根据具体的编程语言和操作系统，采用相应的线程通信机制来实现的。



## threading.local 类

`threading.local`是Python中的一个类，用于在多线程环境中创建线程本地数据。它提供了一个简单的方式来维护每个线程独立的数据。每个线程可以访问自己的本地副本，但不会影响其他线程的数据。这对于需要在线程之间共享全局数据，同时又需要避免数据混乱的情况非常有用。

下面是关于`threading.local`的详细解释和用法：

```python
import threading

## 创建threading.local对象：
local_data = threading.local()

def my_thread_func(arg):
    # 将数据绑定到threading.local对象：
    local_data.x = arg
    print(f'Thread {arg}: {local_data.x}')

## 在线程中使用threading.local对象：
thread1 = threading.Thread(target=my_thread_func, args=(1,))
thread2 = threading.Thread(target=my_thread_func, args=(2,))

thread1.start()
thread2.start()
```

- 在这段代码中，首先需要导入`threading`模块。然后定义了一个名为`my_thread_func`的函数，该函数接受一个参数`arg`。在`my_thread_func`函数中，使用了一个叫做`local_data`的`threading.local`对象。在每个线程中，该函数将参数`arg`绑定到`local_data.x`上，并打印出线程ID和相应的值。
- 接下来，通过创建两个线程`thread1`和`thread2`来调用`my_thread_func`函数。其中`thread1`的`arg`参数为1，`thread2`的`arg`参数为2。然后分别启动这两个线程。
- 这样，你就可以在每个线程中维护独立的`local_data`对象，而不会干扰其他线程的数据。在本例中，`local_data.x`将分别在两个线程中存储不同的值，并在每个线程中打印出相应的值。

**工作原理：** `threading.local`使用线程 ID 来存储和检索对应的本地数据。这样，在多线程环境中，每个线程都可以通过`local_data`对象访问自己的本地数据，而不会干扰其他线程的数据。

**示例应用场景：** `threading.local`常用于 Web 应用程序中，特别是在基于线程的服务器中，它可以用来存储每个请求的上下文数据，而无需显式地将数据传递给每个函数。

需要注意的是，`threading.local`适用于同一线程内的多个函数或方法，以确保它们共享相同的数据。然而，在多进程环境中，它无法提供相同的行为。如果你需要在多进程环境中使用类似的功能，可以考虑使用`multiprocessing.Manager`中的`Namespace`对象。

最后，当使用`threading.local`时，务必小心确保数据不会在不同线程之间混淆或共享。

### 范例 - 1

#### 使用前

```python
import threading
import logging
import time

FORMAT = "%(asctime)s %(levelname)s %(threadName)s %(message)s"

logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S", level=logging.INFO)

x = 0

def worker():
    global x
    for i in range(1000):
        time.sleep(0.0001)
        x += 1
    logging.info(f"x = {x}")

for i in range(10):
    threading.Thread(target=worker, name=f"w{i}").start()
'''
2023-10-17 13:55:09 INFO w4 x = 9991
2023-10-17 13:55:09 INFO w7 x = 9992
2023-10-17 13:55:09 INFO w2 x = 9993
2023-10-17 13:55:09 INFO w3 x = 9994
2023-10-17 13:55:09 INFO w0 x = 9995
2023-10-17 13:55:09 INFO w1 x = 9996
2023-10-17 13:55:09 INFO w8 x = 9997
2023-10-17 13:55:09 INFO w5 x = 9998
2023-10-17 13:55:09 INFO w6 x = 9999
2023-10-17 13:55:09 INFO w9 x = 10000
'''
```

#### 使用后

```python
import threading
import logging
import time

FORMAT = "%(asctime)s %(levelname)s %(threadName)s %(message)s"

logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S", level=logging.INFO)

#x = 0
g_data = threading.local()

def worker():
    g_data.x = 0
    for i in range(1000):
        time.sleep(0.0001)
        #x += 1
        g_data.x += 1
    logging.info(f"x = {g_data.x}")

for i in range(10):
    threading.Thread(target=worker, name=f"w{i}").start()
'''
2023-10-22 15:46:23 INFO w0 x = 1000
2023-10-22 15:46:23 INFO w7 x = 1000
2023-10-22 15:46:23 INFO w8 x = 1000
2023-10-22 15:46:23 INFO w1 x = 1000
2023-10-22 15:46:23 INFO w9 x = 1000
2023-10-22 15:46:23 INFO w6 x = 1000
2023-10-22 15:46:23 INFO w3 x = 1000
2023-10-22 15:46:23 INFO w2 x = 1000
2023-10-22 15:46:23 INFO w5 x = 1000
2023-10-22 15:46:23 INFO w4 x = 1000
'''
```

- 在这段代码中，使用了 `threading.local()` 方法创建了一个 `threading.local` 对象 `g_data`，它可以确保每个线程都有自己独立的变量副本，避免了共享全局变量造成的竞争条件问题。

- 在每个线程的 `worker` 函数中，通过 `g_data.x` 来访问和修改 `x`，由于每个线程都有自己独立的 `g_data` 对象，因此它们之间的 `x` 是相互独立的，不会相互影响。

- 因此，虽然有多个线程同时执行 `worker` 函数，并且都在操作 `x`，但由于每个线程都有自己独立的 `g_data.x`，它们之间不会发生竞争条件，从而避免了数据混乱和不一致的问题。

- 通过使用 `threading.local` 对象，可以在多线程环境中安全地使用变量，每个线程都可以独立地操作自己的变量副本，确保数据的一致性和正确性。这是一种常见的解决方案，用来避免多线程环境中共享变量带来的潜在问题。



### 范例 - 2

Python中的Thread-local对象（线程本地对象）是一种特殊类型的对象，它可以确保在多线程环境中，每个线程都可以独立地访问自己的对象副本，而不会与其他线程的对象产生冲突。Python提供了`threading.local()`来创建Thread-local对象。

关于Thread-local对象的属性创建和可用性：

1. **属性创建：** Thread-local对象中的属性是在访问线程中创建的。当某个线程首次访问Thread-local对象时，如果该属性不存在，Python会为当前线程创建一个新的属性。这意味着每个线程可以在其本地上下文中使用Thread-local对象，而不会影响其他线程。

2. **可用性：** **Thread-local对象的属性仅在创建它的线程中可用**。其他线程无法直接访问或修改这些属性。这样可以确保在多线程环境中，不同线程之间的数据不会互相干扰，避免了竞争条件和数据不一致性问题。

下面是一个简单的示例，展示了如何使用Thread-local对象：

```python
import threading

## 创建Thread-local对象
local_data = threading.local()

## 在线程中设置属性
def thread_func(value):
    local_data.value = value
    print(f"Value set to {local_data.value} in {threading.current_thread().name}")

## 创建多个线程
threads = []
for i in range(5):
    t = threading.Thread(target=thread_func, args=(i,))
    threads.append(t)
    t.start()

## 等待所有线程完成
for t in threads:
    t.join()
```

在上面的示例中，每个线程访问了Thread-local对象`local_data`，并为其设置了不同的属性值。每个线程只能访问自己设置的值，而不会影响其他线程。











## threading.Timer

在Python中，`threading.Timer`类允许您创建一个定时器，该定时器在指定的时间间隔后执行一个函数。这在需要执行定时操作的应用程序中非常有用。下面是关于`threading.Timer`的详细说明：

1. 创建定时器：您可以使用`threading.Timer`类创建一个定时器对象。构造函数的参数包括延迟时间和要执行的函数。

   ```python
   t = threading.Timer(5.0, my_function)  # 创建一个延迟5秒后执行my_function的定时器
   ```

2. 启动定时器：要启动定时器，可以使用`start`方法。一旦启动，定时器将会在指定的延迟时间后执行指定的函数。

   ```python
   t.start()  # 启动定时器
   ```

3. 取消定时器：您可以随时取消定时器，以防止其在到期之前执行。可以使用`cancel`方法取消定时器。

   ```python
   t.cancel()  # 取消定时器
   ```

4. 定时器执行的函数：您可以指定在定时器到期时要执行的函数。这可以是您定义的任何函数。

   ```python
   def my_function():
       print("Timer expired!")
   ```

使用定时器的主要优点是可以在指定的时间后执行某些操作，而不需要阻塞程序的执行。这对于需要在后台执行一些操作或进行定时任务的应用程序非常有用。

以下是一个简单的示例，演示了如何使用`threading.Timer`类创建定时器：

```python
import threading

def hello():
    print("Hello, Timer!")

## 创建一个延迟2秒后执行hello函数的定时器
t = threading.Timer(2.0, hello)
t.start()  # 启动定时器
```

在这个例子中，`hello`函数将会在2秒后被调用，并打印"Hello, Timer!"。注意，您可以随时取消定时器，以防止它在到期之前执行。

## 范例 - cancel()

cancel() 可以实现在**定时器启动前取消**

下面是一个简单的示例，演示了如何使用 `cancel()` 方法在定时器启动之前取消定时器：

```python
import threading

def hello():
    print("Hello, Timer!")

## 创建一个延迟2秒后执行hello函数的定时器
t = threading.Timer(2.0, hello)

## 取消定时器
t.cancel()

## 尝试启动定时器
t.start()

print('__main__')
```

在这个示例中，我们首先创建了一个定时器 `t`，然后立即调用了 `t.cancel()` 方法来取消定时器。即使我们尝试调用 `t.start()` 启动定时器，由于我们已经在之前取消了定时器，所以定时器函数 `hello` 将不会被执行。



如果你想让 `Hello, Timer!` 被打印出来，你可以移除 `t.cancel()` 这一行代码，或者在调用 `t.cancel()` 之后重新创建一个新的定时器。以下是修改后的代码：

```python
import threading

def hello():
    print("Hello, Timer!")

## 创建一个延迟2秒后执行hello函数的定时器
t = threading.Timer(2.0, hello)

## 取消定时器
t.cancel()

## 重新创建一个延迟2秒后执行hello函数的定时器
t = threading.Timer(2.0, hello)

t.start()

print('__main__')
```

这样修改后，`Hello, Timer!` 将会被打印。





## threading.Lock

`threading.Lock` 最基本的锁类型，用于提供简单的互斥访问控制。它可以确保在任何时刻只有一个线程可以访问被保护的代码块，从而**防止多个线程同时修改相同的数据，导致不一致或不可预料的行为**。

## teading.Lock 相关方法和属性

在 Python 中，`threading.Lock` 是一个同步原语，用于多线程编程中对共享资源的访问进行控制。它具有以下方法和属性：

### 方法

1. `acquire(blocking=True, timeout=-1)`：获取锁。默认情况下，如果该锁已被其他线程获取，则会阻塞当前线程直到获得锁为止。可以通过 `blocking` 参数指定是否阻塞。`timeout` 参数可指定最长阻塞时间。
   - 获取锁，阻塞其他线程直到获得锁为止。

2. `release()`：释放锁。通常在临界区代码执行完成后调用，以便其他线程可以获取锁并执行其临界区代码。
   - 释放锁，允许其他线程获取锁。

3. `locked()`：返回一个布尔值，表示当前锁是否被某个线程所持有。
   - 如果锁当前被某个线程持有，则返回 `True`，否则返回 `False`。


### 属性

1. `locked`：一个只读属性，表示当前锁是否被某个线程所持有。

### 示例代码

```python
import threading

lock = threading.Lock()

## 获取锁
lock.acquire()

## 打印锁的状态
print("Lock status:", lock.locked())  # True

## 释放锁
lock.release()

## 打印锁的状态
print("Lock status:", lock.locked())  # False
```

在上面的示例中，我们创建了一个 `threading.Lock` 对象 `lock`，然后获取了锁，并打印了锁的状态。接着释放了锁并再次打印了锁的状态。你可以看到在获取锁后，`locked()` 方法返回 `True`，表示锁已被某个线程持有；而在释放锁后，`locked()` 方法返回 `False`，表示锁没有被任何线程持有。

确保在使用 `threading.Lock` 的 `acquire()` 和 `release()` 方法时，遵循正确的同步原则，以避免死锁和竞态条件等问题。

#### timeout

```python
import threading

lock = threading.Lock()

x = lock.acquire()
print(x)

y = lock.acquire(timeout=3)
print(y)
```

首先创建了一个 `threading.Lock` 对象 `lock`。然后，你连续两次调用了 `lock.acquire()` 方法，第二次调用中传入了 `timeout` 参数为 3。

这段代码的运行方式如下：

1. 第一次调用 `lock.acquire()` 会成功获取到锁，并返回 `True`，因为没有其他线程持有该锁。
2. 第二次调用 `lock.acquire(timeout=3)` 会尝试获取锁，但如果在 3 秒内无法获取到锁，则会返回 `False`。

请注意，`timeout` 参数的作用是如果在指定的超时时间内无法获得锁，则放弃获取锁并返回 `False`。这可以避免程序在无法获取到锁的情况下一直阻塞。因此，如果在 3 秒内无法获取到锁，变量 `y` 将会被赋值为 `False`。

要特别注意在使用 `timeout` 参数时需要考虑到线程安全性和程序逻辑。确保在使用 `threading.Lock` 的时候遵循正确的同步原则，以避免出现竞态条件和死锁等问题。



## 范例 - 死锁

**加锁后未解锁=死锁**

```python
import threading

lock = threading.Lock()

x = lock.acquire()
print(x)

y = lock.acquire()
print(y)
```

在这段代码中，我们首先创建了一个 `threading.Lock` 对象 `lock`，然后连续两次调用了 `lock.acquire()` 方法。

现在让我们分析这段代码为什么会导致死锁：

1. 第一次调用 `lock.acquire()` 时，该调用会获得锁并返回 `True`。这意味着变量 `x` 的值为 `True`。
2. 第二次调用 `lock.acquire()` 时，由于第一次获取锁的线程尚未释放锁，因此第二次调用会被阻塞，直到锁被释放。因此，第二次调用 `lock.acquire()` 不会立即返回，而是阻塞在这里。

因此，这段代码中的连续两次调用 `lock.acquire()` 导致了第二次调用被阻塞，从而形成了死锁。这是由于第一个线程获取了锁但没有释放，而第二个线程又试图获取相同的锁，但由于已被占用而无法继续执行。

为避免死锁，应该确保在持有锁的代码段中能够正常释放锁，或者在获取锁之前检查锁的状态。通常情况下，推荐使用 `try-finally` 语句来确保在所有情况下都能够正确释放锁。

## 范例 - 示例代码

```python
import threading

## 创建锁
lock = threading.Lock()

## 共享资源
shared_resource = 0

## 线程函数
def thread_function(lock, shared_resource):
    for _ in range(100000):
        # 获取锁
        lock.acquire()
        try:
            # 访问共享资源
            shared_resource += 1
        finally:
            # 释放锁
            lock.release()

## 创建线程
thread1 = threading.Thread(target=thread_function, args=(lock, shared_resource))
thread2 = threading.Thread(target=thread_function, args=(lock, shared_resource))

## 启动线程
thread1.start()
thread2.start()

## 等待线程结束
thread1.join()
thread2.join()

## 输出最终的共享资源值
print("Shared Resource:", shared_resource)
```

在上面的示例中，由于使用了锁 `lock`，两个线程不会同时访问共享资源，因此最终输出的 `shared_resource` 值将是预期的值。

需要注意的是，在使用 `threading.Lock` 时要确保遵循一定的规则，以避免死锁等问题。此外，Python 还提供了其他类型的锁，如 `RLock` 和 `Semaphore`，可以根据具体的需求选择合适的同步原语。



## 范例 - 1

```python
#!/usr/local/bin/python3
import time
import threading
import logging

FORMAT = '%(asctime)s %(message)s'

logging.basicConfig(format=FORMAT, level=logging.INFO)

lock = threading.Lock()

x = lock.acquire()

print(x)

def worker(l: threading.Lock):
    name = threading.current_thread().name
    logging.info(f'{name} want to get locker')
    logging.info(l.acquire())
    logging.info(f'{name} finished')

for i in range(5):
    threading.Thread(target=worker, name='w{}'.format(i), args=(lock,)).start()

while True:
    cmd = input('>>> ')
    if cmd == 'r':
        lock.release()
    elif cmd == 'quit':
        break
    else:
        print(threading.enumerate())
```





## 范例：加锁 & 释放锁的时机

有十个工人，共同生产1000个杯子，生产完毕后，结束。

### 错误方式 - 1



### 错误方式 - 2



### 正确方式

- 加锁无效？

```python
import time
import threading
import logging

FORMAT = '%(asctime)s - %(levelname)s - %(message)s'

logging.basicConfig(format=FORMAT, level=logging.INFO)

lock = threading.Lock()
cups = []

def worker(count=1000):
    logging.info('{} is working'.format(threading.current_thread().name))
    flag = False
    while True:
        lock.acquire()
        if len(cups) >= count:
            flag = True
        lock.release()
        time.sleep(0.001)
        if not flag:
            cups.append(1)
        if flag:
            break
    logging.info('{} finished cups={}'.format(threading.current_thread().name, len(cups)))

for i in range(10):
    threading.Thread(target=worker, name='t{}'.format(i)).start()
    # t = threading.Thread(target=worker, name='t{}'.format(i))
    # t.start()
```



## 例题 - 1

有十个工人，共同生产1000个杯子，生产完毕后，结束。

### 未加锁

```python
import time
import threading
import logging

FORMAT = '%(asctime)s - %(levelname)s - %(message)s'

logging.basicConfig(format=FORMAT, level=logging.INFO)

caps = []

def worker(count=1000):
    logging.info('{} start working'.format(threading.current_thread().name))
    while len(caps) < count:
        time.sleep(0.001)
        caps.append(1)
    logging.info('{} finished, cpus={}'.format(threading.current_thread().name, len(caps)))

for i in range(10):
    threading.Thread(target=worker, name='w{}'.format(i)).start()
```

- 这段代码创建了一个`worker`函数，它向一个全局的`caps`列表中添加元素。然后使用`threading.Thread`创建了10个线程来调用`worker`函数。每个线程会执行`worker`函数，不断地向`caps`列表中添加元素，直到`caps`列表的长度达到设定的值。
- 但是由于多个线程同时修改全局的`caps`列表，这会导致竞争条件。因为线程的执行顺序是不确定的，它们可能会交替地访问和修改`caps`列表，因此`cpus`的输出可能会不一致。具体来说，由于没有使用任何同步机制，多个线程可能同时检查`len(caps) < count`条件，然后同时执行`caps.append(1)`操作，从而导致数据不一致或意外行为。
- 要解决这个问题，你可以使用锁来确保一次只有一个线程可以修改`caps`列表。你可以使用`threading.Lock`来创建一个锁对象，并在访问和修改`caps`列表时使用这个锁来保护临界区。这样可以避免竞争条件，并确保`caps`列表被正确地更新。

**杯子为什么多生产了？**

- 在这段代码中，`worker`函数被用作多个线程的目标函数。每个线程都执行`worker`函数，该函数的功能是向一个全局的`caps`列表中添加元素，直到`caps`列表的长度达到预设的值`count`。

- 然而，由于多个线程在没有任何同步机制的情况下同时访问和修改`caps`列表，就会出现竞争条件。在一个线程判断`len(caps) < count`条件为真时，另一个线程也可能在同一时间对`caps`列表进行修改，这可能导致一些意外行为，例如数据不一致或者竞争状态。

- 此外，由于`caps.append(1)`操作不是原子性的，它实际上包含了读取`caps`列表的长度、分配新的空间、将新的元素添加到列表中等多个步骤。如果多个线程同时执行这些操作，就会导致数据不一致的情况发生。
  - 在计算机科学中，原子性是指一个操作是不可中断的，要么被完全执行，要么完全不执行，不会出现部分执行的情况。换句话说，如果一个操作是原子的，那么在多个线程或进程的并发执行下，它要么会完整地执行，要么不会执行，不会出现中间状态。
  - 原子操作对于并发编程至关重要，因为它可以确保数据的一致性和完整性。在多线程环境中，多个线程可能同时访问和修改共享的资源，如果这些操作不是原子的，就可能会出现数据不一致或竞争条件。因此，为了保证并发程序的正确性，需要使用原子操作来保护关键的数据操作。
  - 在许多编程语言和操作系统中，通常会提供一些机制来实现原子操作，例如原子变量、互斥锁、原子锁等。这些机制可以确保在多线程或多进程环境中，关键操作能够以原子方式执行，从而避免了数据竞争和不一致性。
- 换句话说，当多个线程同时执行`caps.append(1)`操作时，可能会出现以下情况：

  1. 一个线程读取了`caps`列表的长度，然后被挂起。
  2. 另一个线程读取了相同的长度，然后也被挂起。
  3. 两个线程都向列表中添加了一个元素。
  4. 然后两个线程都继续执行，导致`caps`列表中产生了两个元素，而不是一个。
- 因此，当多个线程同时操作共享资源时，为了保证数据的一致性和正确性，通常需要使用同步机制。例如，在这种情况下，可以使用锁来确保在任何时候只有一个线程能够访问和修改`caps`列表。



### 加锁 - 方式一

```python
import time
import threading
import logging

FORMAT = '%(asctime)s - %(levelname)s - %(message)s'

logging.basicConfig(format=FORMAT, level=logging.INFO)

caps = []
lock = threading.Lock()  # 创建锁对象

def worker(count=1000):
    logging.info('{} start working'.format(threading.current_thread().name))
    while True:
        with lock:  # 使用锁保护临界区
            if len(caps) >= count:
                break
            time.sleep(0.001)
            caps.append(1)
    logging.info('{} finished, cpus={}'.format(threading.current_thread().name, len(caps)))

for i in range(10):
    threading.Thread(target=worker, name='w{}'.format(i)).start()
```

- 这段代码创建了一个名为`worker`的函数，它向一个全局的`caps`列表中添加元素。同时，通过使用`threading.Lock`创建了一个锁对象`lock`来保护对`caps`列表的访问。

- 在`worker`函数中，使用了`while True`循环来不断尝试向`caps`列表中添加元素，直到`caps`列表的长度达到指定的值`count`。在每次尝试添加元素之前，使用`with lock`语句来获取锁，从而保护接下来的临界区，确保一次只有一个线程可以访问和修改`caps`列表。在临界区内部，首先检查`len(caps) >= count`的条件，如果满足则退出循环，否则等待一段时间（这里是通过`time.sleep(0.001)`模拟一定的计算时间），然后向`caps`列表中添加一个元素。

- 通过使用锁，这段代码解决了之前提到的竞争条件问题，确保了多个线程能够安全地访问和修改共享的`caps`列表，避免了数据不一致或意外行为的发生。

- 总体来说，使用锁可以有效地保护共享资源，确保多线程程序的安全性和一致性。在这个例子中，`with lock`语句确保了在每次访问和修改`caps`列表时都会获得锁，从而避免了多个线程同时修改共享资源的问题。

## threading.RLock

`threading.RLock` 可重入锁，允许同一线程多次获得相同的锁。它可以防止单线程对共享资源的重复加锁造成的阻塞。



## threading.Semaphore

`threading.Semaphore` 信号量，允许多个线程同时访问同一资源。可以控制同时访问某一资源的最大线程数。