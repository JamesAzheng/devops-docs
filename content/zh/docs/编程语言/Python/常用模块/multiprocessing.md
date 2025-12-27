---
title: "multiprocessing"
---

# multiprocessing 模块概述

`multiprocessing` 是 Python 中用于实现并行处理的模块，它允许在多个进程中执行代码，以充分利用多核处理器。

## 注意事项：

- **全局变量问题：** 多个进程之间不共享全局变量。在进程之间共享数据时，可以使用 `multiprocessing` 提供的 `Value`、`Array` 或 `Manager` 对象。
- **操作系统兼容性：** `multiprocessing` 模块基于进程创建，而不是线程。因此，在处理 CPU 密集型任务时，它更适合利用多核 CPU。但是，与线程相比，创建和销毁进程的开销更大。
- **避免在交互式解释器中使用：** 在交互式解释器（如 Jupyter Notebook）中，`multiprocessing` 的使用可能会遇到一些问题，因为它涉及到启动新的进程。

`multiprocessing` 是 Python 中强大且灵活的并行处理模块，在需要利用多核处理器的场景下，能够提高程序的执行效率。





# Process()

**Process（进程）：** `multiprocessing` 中的核心对象之一。通过创建 `Process` 对象，可以启动一个新的进程，执行指定的函数或代码块。

## terminate()

`terminate()` 方法是 `multiprocessing` 模块中 `Process` 对象的一个方法，用于终止该进程的执行。这个方法会强制结束一个正在运行的进程，不会给予进程进行清理或完成的机会，因此在使用时需要小心谨慎。

### 语法和用法：

```python
Process.terminate()
```

- **语法：** 调用 `Process` 对象的 `terminate()` 方法。
- **作用：** 强制终止该进程的执行。
- **注意：** 这种终止方式是比较暴力的，会直接中断进程的执行，可能会导致资源无法释放、文件未关闭或数据损坏等问题。

### 注意事项：

1. **无法进行清理工作：** `terminate()` 方法不会执行清理工作或触发 `finally` 代码块。因此，如果进程在执行过程中占用了资源（如打开文件、建立连接等），这些资源可能不会得到释放或关闭，可能会导致资源泄露。
   
2. **可能引发数据损坏：** 如果进程在执行时，正在进行某些数据操作，使用 `terminate()` 方法可能会导致数据损坏或不一致的问题。

3. **推荐使用更加温和的方式终止进程：** 尽量避免直接使用 `terminate()` 方法，除非必要。可以尝试使用更温和的方式，如发送一个信号给进程，让进程自行结束运行，以允许进程完成清理工作。

4. **可能导致进程变成僵尸进程：** 在某些情况下，`terminate()` 方法可能导致进程变成僵尸进程，即进程已经结束但其父进程尚未对其进行善后处理。可以使用 `join()` 方法等待进程的结束，以避免产生僵尸进程。

总的来说，`terminate()` 方法是一种强制终止进程执行的方法，但它可能引发一系列问题，因此在使用时需要谨慎考虑，并尽量避免直接使用，除非确实无法通过其他方式终止进程。

### 范例：

```py
import time
import multiprocessing


def stress_cpu(num_cores):
    def cpu_heavy_task():
        while True:
            pass

    processes = []
    for _ in range(num_cores):
        process = multiprocessing.Process(target=cpu_heavy_task)
        processes.append(process)
        process.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        for process in processes:
            process.terminate()

stress_cpu(2)
```

这段代码演示了如何利用 `multiprocessing` 模块创建多个进程，并将它们设置为执行 CPU 密集型任务。具体解释如下：

1. `import time` 和 `import multiprocessing`：导入了 `time` 模块和 `multiprocessing` 模块。

2. `def stress_cpu(num_cores):`：定义了一个名为 `stress_cpu` 的函数，它接受一个参数 `num_cores`，用于指定需要创建的进程数量。

3. `def cpu_heavy_task(): while True: pass`：定义了一个名为 `cpu_heavy_task` 的函数，它包含一个无限循环，用于模拟 CPU 密集型的计算任务。这个任务是一个简单的循环，会一直占用 CPU 资源。

4. `processes = []`：创建了一个空列表 `processes`，用于存储将要创建的进程对象。

5. `for _ in range(num_cores):`：通过 `num_cores` 次循环创建多个进程，每个进程执行 `cpu_heavy_task` 函数。

6. `process = multiprocessing.Process(target=cpu_heavy_task)`：创建了一个 `Process` 对象 `process`，并将 `cpu_heavy_task` 函数设置为其目标函数。

7. `processes.append(process)`：将创建的进程对象添加到 `processes` 列表中。

8. `process.start()`：启动了每个进程，使其开始执行 `cpu_heavy_task` 函数中的无限循环。

9. `try:` 开始一个无限循环，其中 `time.sleep(1)` 让主线程每秒休眠一次。

10. `except KeyboardInterrupt:`：捕获键盘中断信号（Ctrl + C）。

11. `for process in processes: process.terminate()`：在捕获到键盘中断信号后，遍历进程列表，使用 `terminate()` 方法强制终止所有的子进程，以停止这些无限循环的 CPU 密集型任务。

12. `stress_cpu(2)`：调用 `stress_cpu` 函数并传入参数 `2`，这将创建两个进程来执行 CPU 密集型任务。

总的来说，这段代码展示了如何使用 `multiprocessing` 模块创建多个进程来模拟 CPU 密集型任务，通过捕获键盘中断信号来优雅地终止这些进程，避免它们无限占用 CPU 资源。

## 范例：1

```python
from multiprocessing import Process

def func():
    print("This is a function running in a separate process.")

if __name__ == "__main__":
    p = Process(target=func)
    p.start()
    p.join()
```

这段代码演示了如何使用 `multiprocessing` 模块创建一个新的进程，并在该进程中运行一个函数。

1. `from multiprocessing import Process`：导入 `multiprocessing` 模块中的 `Process` 类，用于创建新的进程。

2. `def func(): print("This is a function running in a separate process.")`：定义了一个名为 `func` 的函数，这个函数将在新的进程中运行。它简单地打印一条消息。

3. `if __name__ == "__main__":`：这是 Python 的惯用写法，用于确保代码在主程序执行时运行，而不是在被导入时执行。

4. `p = Process(target=func)`：创建了一个 `Process` 对象 `p`，指定其 `target` 参数为之前定义的 `func` 函数。这表示新的进程将执行 `func` 函数中的代码。

5. `p.start()`：启动新的进程，开始执行 `func` 函数中的代码。

6. `p.join()`：等待新的进程执行结束。`join()` 方法会阻塞主进程，直到被调用的进程执行结束为止。在这个例子中，主进程会等待新创建的进程（执行 `func` 函数的进程）结束后才会继续执行接下来的代码。

这样，通过 `multiprocessing` 模块的 `Process` 类，你可以在 Python 中创建新的进程，并在这些进程中执行指定的函数或代码块。这种方式允许利用多核处理器，实现并行处理，提高程序的执行效率。



# Queue()

队列，用于在多个进程之间传递数据和信息。`Queue` 可以安全地实现进程间通信（IPC）。

## 范例：1

```python
from multiprocessing import Process, Queue

def square(numbers, q):
    for n in numbers:
        q.put(n * n)

if __name__ == "__main__":
    numbers = [1, 2, 3, 4]
    q = Queue()
    p = Process(target=square, args=(numbers, q))
    p.start()
    p.join()

    while not q.empty():
        print(q.get())
```

这段代码演示了如何使用 `multiprocessing` 模块中的 `Queue` 实现进程间通信，具体来说：

1. `from multiprocessing import Process, Queue`：导入 `multiprocessing` 模块中的 `Process` 和 `Queue` 类。

2. `def square(numbers, q):`：定义了一个函数 `square`，接受一个数字列表和一个队列作为参数。这个函数将计算每个数字的平方并将结果放入队列中。

3. `if __name__ == "__main__":`：确保代码在主程序执行时运行。

4. `numbers = [1, 2, 3, 4]`：创建一个包含数字的列表。

5. `q = Queue()`：创建了一个 `Queue` 对象 `q`，用于在主进程和子进程之间传递数据。

6. `p = Process(target=square, args=(numbers, q))`：创建了一个 `Process` 对象 `p`，指定其 `target` 参数为 `square` 函数，并传入数字列表和队列作为参数。

7. `p.start()`：启动新的进程，开始执行 `square` 函数中的代码。

8. `p.join()`：等待新的进程执行结束。

9. `while not q.empty(): print(q.get())`：在主进程中，使用 `q.get()` 从队列中获取数据并打印。这里使用了一个循环，直到队列为空为止，逐个取出队列中的数据并打印。

这段代码的主要目的是利用 `Queue` 实现了主进程和子进程之间的数据传递。子进程 `square` 函数计算了输入数字列表中每个数字的平方并将结果放入队列，而主进程则从队列中获取并打印这些结果。

这种方式是 `multiprocessing` 模块中常用的方式之一，用于在多个进程之间安全地传递数据。



# Pool()

进程池，通过 `Pool` 可以管理多个进程，可以用来批量创建子进程，并控制并发的数量。

## 范例：1

```python
from multiprocessing import Pool

def cube(n):
    return n * n * n

if __name__ == "__main__":
    numbers = [1, 2, 3, 4]
    with Pool() as pool:
        result = pool.map(cube, numbers)
        print(result)
```

这段代码展示了如何使用 `multiprocessing` 模块中的 `Pool` 类来创建进程池，并使用 `map` 方法将任务分发给进程池中的多个进程来并行处理。

1. `from multiprocessing import Pool`：导入 `multiprocessing` 模块中的 `Pool` 类，用于创建进程池。

2. `def cube(n): return n * n * n`：定义了一个 `cube` 函数，用于计算输入数值的立方。

3. `if __name__ == "__main__":`：确保代码在主程序执行时运行。

4. `numbers = [1, 2, 3, 4]`：创建一个包含数字的列表。

5. `with Pool() as pool:`：使用 `Pool()` 创建一个进程池对象 `pool`。如果不传入参数，默认会使用计算机的核心数作为进程数量。

6. `result = pool.map(cube, numbers)`：利用 `pool.map` 方法将 `cube` 函数应用到 `numbers` 列表中的每个元素上，并行计算它们的立方。`pool.map` 会将任务分发给进程池中的多个进程进行处理，并返回处理结果的列表。

7. `print(result)`：打印并输出最终的处理结果列表。

使用 `Pool` 类可以方便地创建并行的进程池，在处理一批任务时能够利用多核处理器，提高程序的执行效率。`map` 方法可以很容易地将任务分发给进程池中的多个进程并收集它们的处理结果。



# Lock()

锁，在多进程共享资源时，为了避免竞争条件和数据混乱，`multiprocessing.Lock` 可以用来实现简单的进程同步。

## 范例：1

```python
from multiprocessing import Process, Lock

def increment(lock, counter):
    for _ in range(1000):
        lock.acquire()
        counter.value += 1
        lock.release()

if __name__ == "__main__":
    from multiprocessing import Value

    counter = Value('i', 0)
    lock = Lock()
    processes = [Process(target=increment, args=(lock, counter)) for _ in range(4)]

    for p in processes:
        p.start()
    for p in processes:
        p.join()

    print(counter.value)
```

这段代码展示了如何使用 `multiprocessing` 模块中的 `Lock` 对象来实现进程间的同步，避免多个进程同时修改共享资源而导致的数据竞争问题。

1. `from multiprocessing import Process, Lock`：导入 `multiprocessing` 模块中的 `Process` 和 `Lock` 类。

2. `def increment(lock, counter):`：定义了一个 `increment` 函数，该函数接受一个锁对象 `lock` 和一个共享计数器 `counter`。在一个循环中，通过 `lock.acquire()` 和 `lock.release()` 来确保每次修改 `counter` 值时只有一个进程能够执行，其他进程需要等待。

3. `if __name__ == "__main__":`：确保代码在主程序执行时运行。

4. `from multiprocessing import Value`：导入 `Value` 类，用于创建共享变量。

5. `counter = Value('i', 0)`：创建一个整数类型的共享变量 `counter`，初始值为 0。这个变量将被多个进程共享和修改。

6. `lock = Lock()`：创建一个 `Lock` 对象 `lock`，用于确保对共享资源的安全访问。

7. `processes = [Process(target=increment, args=(lock, counter)) for _ in range(4)]`：创建了一个包含了四个进程的列表，每个进程都执行 `increment` 函数，并传入相同的 `lock` 和 `counter` 参数。

8. `for p in processes: p.start()`：启动了四个进程，它们会并行执行 `increment` 函数中的代码。

9. `for p in processes: p.join()`：等待所有进程执行结束。

10. `print(counter.value)`：打印最终的共享变量 `counter` 的值，展示了多个进程安全地对共享资源进行累加操作的结果。

这段代码通过使用 `Lock` 对象确保了对共享资源的安全访问，避免了多个进程同时修改共享变量而导致的数据不一致或竞争条件问题。