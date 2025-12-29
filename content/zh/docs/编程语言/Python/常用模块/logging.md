---
title: "logging"
---


## logging 模块概述

https://docs.python.org/3/library/logging.html?highlight=logging#module-logging

`logging` 模块是Python标准库中用于记录日志信息的模块。它提供了一种灵活的方式来管理应用程序的日志输出，以便在开发、调试和生产环境中跟踪和记录信息。使用 `logging` 模块，您可以控制日志消息的级别、输出位置和格式。

以下是一些关键的 `logging` 模块组件和概念：

1. **Logger（记录器）**：Logger是日志记录的主要接口。您可以创建一个或多个Logger实例，用于不同的部分或模块，以便将日志信息进行分类和组织。通常，每个模块或应用程序的不同部分都应该有自己的Logger。

2. **Handler（处理程序）**：Handler用于指定将日志消息发送到哪里。Python提供了多种内置的Handler，例如将消息发送到控制台、文件、网络套接字等。您还可以自定义Handler以满足特定需求。

3. **Formatter（格式化程序）**：Formatter用于定义日志消息的输出格式。它允许您指定消息中包含的信息（如时间戳、日志级别、模块名称和消息内容等），以便更容易阅读和分析日志。

4. **Level（级别）**：日志消息可以分为不同的级别，例如DEBUG、INFO、WARNING、ERROR和CRITICAL。您可以为每个Logger和Handler设置最低级别，以控制记录哪些级别的消息。

5. **配置文件**：您可以使用配置文件或编程方式配置`logging`模块，以决定日志的行为，包括级别、格式和输出位置。

`logging` 模块允许您根据应用程序的需求进行更高级的配置，包括将日志消息发送到不同的处理程序、在不同环境中更改日志级别等。这使得它成为一个强大的工具，用于管理和分析应用程序的日志。



## Level

日志级别指的是产生日志的事件的严重程度。

以下是Python `logging` 模块中标准日志级别对应的数值以及它们的默认值：

| 日志级别        | 数值 |
| --------------- | ---- |
| CRITICAL        | 50   |
| ERROR           | 40   |
| WARNING（默认） | 30   |
| INFO            | 20   |
| DEBUG           | 10   |
| NOTSET          | 0    |

设置一个级别后，严重程度低于设置值的日志消息将被忽略。例如：设置为30（`WARNING`）后，只有**大于等于**30的（`ERROR`、`CRITICAL`）日志信息输出。

- ```py
  import logging
  
  logging.info('info ~~~') # 不会输出，因为默认的的日志级别为30，而INFO为20（小于30）
  logging.warning('warning ~~~') # WARNING:root:warning ~~~
  logging.error('error ~~~') # ERROR:root:error ~~~
  ```

  





## ---



默认情况下，Logger、Handler和其他日志相关的对象的日志级别（例如，`Logger.setLevel()` 和 `Handler.setLevel()`）都设置为 `NOTSET`，这意味着它们会继承其最近的父级对象的级别设置。通常情况下，根Logger的默认级别也是 `NOTSET`。

如果您不显式设置级别，那么将会使用默认级别 `NOTSET`，这意味着它们不会阻止任何消息记录。要启用特定级别的日志记录，您需要显式设置相应的级别。

例如，在以下示例中，Logger的默认级别为 `NOTSET`，但我们通过`Logger.setLevel(logging.DEBUG)`显式设置了它的级别为 `DEBUG`：

```python
import logging

## 创建一个Logger实例
logger = logging.getLogger('my_logger')

## 设置Logger的级别为DEBUG
logger.setLevel(logging.DEBUG)

## 记录DEBUG级别的日志消息
logger.debug('This is a debug message.')  # 会被记录
```

这样，只有 `DEBUG` 级别及以上的消息才会被记录。其他级别的消息将被忽略。



## CRITICAL

`CRITICAL` 是 Python `logging` 模块中的最高级别日志。当您使用 `CRITICAL` 级别记录日志消息时，它表示发生了严重的、致命的错误，这可能导致应用程序无法继续执行。这些消息通常用于标识应用程序的崩溃或无法恢复的问题。

下面是一些关于 `CRITICAL` 级别日志的详细信息：

1. **严重性**: `CRITICAL` 级别的日志用于表示最严重的问题，通常与应用程序的崩溃或严重数据损坏相关。当出现这种级别的日志消息时，应用程序可能无法正常运行。

2. **用例示例**: 

   - 在关键的生产环境中，记录 `CRITICAL` 级别的消息以通知维护人员立即采取行动来修复问题。
   - 如果应用程序依赖于外部资源（例如数据库或网络服务），并且无法连接到这些资源，可以记录 `CRITICAL` 级别的消息来指示应用程序无法运行。

3. **日志处理方式**: 默认情况下，`CRITICAL` 级别的日志消息将被发送到所有处理程序（如控制台、文件、网络套接字等），以确保及时通知有关问题。通常，`CRITICAL` 级别的日志消息也可以配合警报系统，以便管理员或运维人员能够及时采取行动。

4. **示例代码**：

   ```python
   import logging
   
   # 创建一个Logger实例
   logger = logging.getLogger('my_logger')
   
   # 设置Logger的级别为CRITICAL
   logger.setLevel(logging.CRITICAL)
   
   # 记录CRITICAL级别的日志消息
   logger.critical('This is a critical message. The application may be in serious trouble.')
   ```

   在上述示例中，我们创建了一个Logger实例并将其级别设置为 `CRITICAL`。然后，我们使用 `logger.critical()` 记录了一条 `CRITICAL` 级别的日志消息，表示应用程序可能遇到了严重问题。

总之，`CRITICAL` 级别的日志用于标识应用程序中的严重问题，这些问题可能会导致应用程序崩溃或无法正常运行。在生产环境中，`CRITICAL` 级别的消息通常需要及时处理，以确保应用程序的可用性和可靠性。



## ERROR

`ERROR` 是 Python `logging` 模块中的一个标准日志级别，用于表示应用程序遇到的错误情况。`ERROR` 级别的日志消息用于指示可能会影响应用程序功能的问题，但应用程序仍然可以继续执行。以下是关于 `ERROR` 级别日志的详细信息：

1. **严重性**: `ERROR` 级别的日志表示应用程序遇到了一个错误，但通常情况下，这个错误不会导致应用程序崩溃。应用程序仍然可以继续执行，但可能会受到某些功能的影响。

2. **用例示例**: 

   - 记录应用程序中的异常情况，如无法找到所需的文件或数据库连接失败。
   - 用于记录应用程序处理异常情况的代码块中，以便在发生问题时能够追踪错误。

3. **日志处理方式**: 默认情况下，`ERROR` 级别的日志消息将被发送到所有处理程序，以便开发人员和维护人员能够识别并解决问题。通常，`ERROR` 级别的日志消息也可以用于监控和警报，以便及时发现问题。

4. **示例代码**：

   ```python
   import logging
   
   # 创建一个Logger实例
   logger = logging.getLogger('my_logger')
   
   # 设置Logger的级别为ERROR
   logger.setLevel(logging.ERROR)
   
   # 记录ERROR级别的日志消息
   try:
       result = 10 / 0  # 除以零将引发一个异常
   except ZeroDivisionError as e:
       logger.error('An error occurred: %s', e)
   ```

   在上述示例中，我们创建了一个Logger实例并将其级别设置为 `ERROR`。然后，我们尝试执行一个可能引发异常的操作，并在异常处理块中使用 `logger.error()` 记录了错误消息，以便识别问题并进行记录。

总之，`ERROR` 级别的日志用于表示应用程序中的错误情况，这些错误通常不会导致应用程序崩溃，但可能会影响其功能。这些日志消息对于监视和排除问题非常有帮助，以确保应用程序的稳定性和可靠性。



## WARNING

默认情况下，Python `logging` 模块的默认日志级别是 `WARNING`（警告级别）。这意味着如果您不显式设置Logger、Handler或其他日志相关对象的级别，它们将继承父级对象的级别设置，并且只会记录 `WARNING` 级别及以上的日志消息。例如：

```python
import logging

## 创建一个Logger实例
logger = logging.getLogger('my_logger')

## 记录不同级别的日志消息
logger.debug('This is a debug message.')      # 不会被记录
logger.info('This is an info message.')        # 不会被记录
logger.warning('This is a warning message.')  # 会被记录
logger.error('This is an error message.')      # 会被记录
logger.critical('This is a critical message.') # 会被记录
```

在上述示例中，由于未显式设置Logger的级别，因此它继承了默认的 `WARNING` 级别。因此，只有 `WARNING` 级别及以上的消息才会被记录，而 `DEBUG` 和 `INFO` 级别的消息将被忽略。

如果您希望更改默认的全局日志级别，可以使用以下代码：

```python
import logging

## 设置全局默认日志级别为DEBUG
logging.basicConfig(level=logging.DEBUG)

## 创建一个Logger实例
logger = logging.getLogger('my_logger')

## 现在记录DEBUG级别的日志消息将被记录
logger.debug('This is a debug message.')
```

通过调用 `logging.basicConfig(level=logging.DEBUG)`，我们将全局默认级别设置为 `DEBUG`，这将影响所有后续创建的Logger实例，除非它们显式设置了不同的级别。这样，全局默认级别将变为 `DEBUG`，并允许记录所有级别的日志消息。



`WARNING` 是 Python `logging` 模块中的一个标准日志级别，用于表示潜在的问题或警告信息。`WARNING` 级别的日志消息用于指示应用程序遇到了一些不寻常的情况，但不会影响应用程序的正常运行。以下是关于 `WARNING` 级别日志的详细信息：

1. **严重性**: `WARNING` 级别的日志用于表示潜在的问题或警告，但通常情况下，这些问题不会导致应用程序崩溃或无法继续执行。应用程序仍然可以继续正常运行。

2. **用例示例**: 

   - 用于记录一些不寻常但不是严重错误的情况，例如配置文件中的不一致或非法输入。
   - 在应用程序中发现一些可能需要注意的情况时，可以使用 `WARNING` 级别记录消息。
   - `WARNING` 级别通常用于提醒开发人员或维护人员需要检查某些情况，但不需要立即采取行动。

3. **日志处理方式**: 默认情况下，`WARNING` 级别的日志消息将被发送到所有处理程序，以便开发人员和维护人员能够注意到这些问题。通常，`WARNING` 级别的日志消息可以用于监视和提醒，以确保及时检查问题。

4. **示例代码**：

   ```python
   import logging
   
   # 创建一个Logger实例
   logger = logging.getLogger('my_logger')
   
   # 设置Logger的级别为WARNING
   logger.setLevel(logging.WARNING)
   
   # 记录WARNING级别的日志消息
   logger.warning('This is a warning message. Please check the configuration.')
   ```

   在上述示例中，我们创建了一个Logger实例并将其级别设置为 `WARNING`。然后，我们使用 `logger.warning()` 记录了一条警告消息，以提醒开发人员或维护人员需要检查配置。

总之，`WARNING` 级别的日志用于表示潜在的问题或警告情况，这些问题通常不会导致应用程序崩溃，但需要注意和检查。这些日志消息对于监视应用程序的健康状态和发现潜在问题非常有帮助。



## INFO

`INFO` 是 Python `logging` 模块中的一个标准日志级别，用于提供有关应用程序正常运行状态的信息。`INFO` 级别的日志消息用于记录应用程序的进展、操作和状态，通常用于生产环境中，以帮助开发人员和维护人员了解应用程序的运行情况。以下是关于 `INFO` 级别日志的详细信息：

1. **严重性**: `INFO` 级别的日志消息用于表示应用程序正常运行的信息。这些消息不是错误或警告，而是提供关于应用程序状态和操作的有用信息。

2. **用例示例**: 

   - 记录应用程序的主要操作、状态变化或进程。
   - 在生产环境中用于监视应用程序的运行状况，以确保它按预期运行。
   - 提供关于应用程序的统计信息或重要事件的记录。

3. **日志处理方式**: 默认情况下，`INFO` 级别的日志消息将被发送到所有处理程序，以便开发人员和维护人员了解应用程序的状态和操作。通常，`INFO` 级别的日志消息用于监视和分析应用程序的正常运行。

4. **示例代码**：

   ```python
   import logging
   
   # 创建一个Logger实例
   logger = logging.getLogger('my_logger')
   
   # 设置Logger的级别为INFO
   logger.setLevel(logging.INFO)
   
   # 记录INFO级别的日志消息
   logger.info('The application has started successfully.')
   logger.info('Processing data...')
   logger.info('Data processing completed.')
   
   # 通常用于记录应用程序的状态和进程
   ```

   在上述示例中，我们创建了一个Logger实例并将其级别设置为 `INFO`。然后，我们使用 `logger.info()` 记录了一系列 `INFO` 级别的日志消息，用于描述应用程序的状态和操作。

总之，`INFO` 级别的日志用于提供关于应用程序正常运行状态的信息。这些日志消息对于监视和了解应用程序的行为非常有帮助，通常在生产环境中广泛使用。它们不是错误或警告消息，而是用于描述应用程序的正常工作过程。



## DEBUG

`DEBUG` 是 Python `logging` 模块中的一个标准日志级别，用于提供详细的调试信息。`DEBUG` 级别的日志消息用于记录应用程序的内部操作、变量值、函数调用等详细信息，通常仅在开发和调试阶段使用，不应在生产环境中启用。以下是关于 `DEBUG` 级别日志的详细信息：

1. **严重性**: `DEBUG` 级别的日志消息是最低级别的日志，用于提供详细的调试信息。这些消息通常不应该在生产环境中启用，因为它们会产生大量的输出。

2. **用例示例**: 

   - 用于记录变量值、函数调用、算法步骤等详细信息，以帮助开发人员诊断和解决问题。
   - 在开发和测试阶段用于跟踪应用程序的内部状态和操作，以便进行调试。

3. **日志处理方式**: 默认情况下，`DEBUG` 级别的日志消息将被发送到所有处理程序，但通常在生产环境中会将其禁用，以减少日志文件大小和噪音。

4. **示例代码**：

   ```python
   import logging
   
   # 创建一个Logger实例
   logger = logging.getLogger('my_logger')
   
   # 设置Logger的级别为DEBUG
   logger.setLevel(logging.DEBUG)
   
   # 记录DEBUG级别的日志消息
   logger.debug('Entering function calculate()')
   
   x = 5
   y = 10
   result = x + y
   logger.debug(f'Result: {result}')
   
   # 通常用于记录详细的调试信息
   ```

   在上述示例中，我们创建了一个Logger实例并将其级别设置为 `DEBUG`。然后，我们使用 `logger.debug()` 记录了一系列 `DEBUG` 级别的日志消息，用于描述函数调用和变量值。

总之，`DEBUG` 级别的日志用于提供详细的调试信息，通常在开发和调试阶段使用。这些日志消息对于定位和解决问题非常有帮助，但在生产环境中通常会禁用，以避免产生大量的不必要日志输出。它们可以帮助开发人员深入了解应用程序的内部工作原理。



## NOTSET

`NOTSET` 是 Python `logging` 模块中的一个特殊日志级别，它在标准日志级别中的位置是最低的。`NOTSET` 级别的日志消息通常不会单独使用，而是作为一种特殊设置来影响其他日志级别的行为。以下是关于 `NOTSET` 级别日志的详细信息：

1. **严重性**: `NOTSET` 级别的日志消息本身不表示任何特定的严重性或信息。它主要用于影响其他日志级别的行为。

2. **用例示例**: 

   - 通常不会单独使用 `NOTSET` 级别的日志消息。它主要用于配置或影响其他Logger、Handler或Filter对象的级别设置。
   - 当Logger、Handler或Filter对象的级别设置为 `NOTSET` 时，它们会继承其最近的父级对象的级别设置。

3. **日志处理方式**: `NOTSET` 级别的日志消息通常不会被记录到任何处理程序中。它们的主要作用是在级别继承和配置方面起作用。

4. **示例代码**：

   ```python
   import logging
   
   # 创建一个Logger实例
   logger = logging.getLogger('my_logger')
   
   # 设置Logger的级别为NOTSET
   logger.setLevel(logging.NOTSET)
   
   # 创建一个Handler并将其级别设置为NOTSET
   handler = logging.StreamHandler()
   handler.setLevel(logging.NOTSET)
   
   # 记录DEBUG级别的日志消息
   logger.debug('This is a debug message.')  # 会被记录，因为级别继承自Handler
   
   # 通常不会单独使用NOTSET级别的消息
   ```

   在上述示例中，我们创建了一个Logger实例并将其级别设置为 `NOTSET`，然后创建了一个Handler并将其级别设置为 `NOTSET`。由于级别设置为 `NOTSET`，它们会继承其最近的父级对象（在此示例中为Handler）的级别设置，因此 `logger.debug()` 消息将被记录。

总之，`NOTSET` 级别的日志消息本身通常不会单独使用，而是用于配置和影响其他日志级别的行为。它在级别继承和配置方面发挥作用，通常用于Logger、Handler和Filter对象的级别设置。









## Logger

`Logger` 是 Python `logging` 模块中的核心组件之一，用于记录应用程序的日志消息。`Logger` 对象负责处理和分发日志消息，允许您按照不同的级别、目标和格式来记录日志。以下是关于 `Logger` 的详细解释：

1. **Logger 的创建**:
   您可以通过 `logging.getLogger('name')` 方法来创建 `Logger` 对象。`'name'` 参数是可选的，用于给 `Logger` 对象命名，以便更好地组织和分类日志消息。如果不提供 `'name'`，则会创建一个根 `Logger`，通常称为默认的根 `Logger`。

   ```python
   import logging
   
   # 创建一个Logger实例
   logger = logging.getLogger('my_logger')
   ```

2. **级别设置**:
   `Logger` 对象有一个级别设置，该级别决定了哪些级别的日志消息会被记录和处理。通过 `setLevel(level)` 方法来设置级别，其中 `level` 可以是 `logging` 模块中定义的日志级别，例如 `logging.DEBUG`、`logging.INFO`、`logging.WARNING` 等。

   ```python
   logger.setLevel(logging.DEBUG)  # 设置Logger的级别为DEBUG，记录所有级别的消息
   ```

3. **处理程序（Handlers）**:
   `Logger` 对象可以附加一个或多个处理程序（`Handler`），以确定日志消息的输出位置。`Handler` 可以将日志消息写入文件、发送到网络套接字、输出到控制台等。不同的 `Handler` 可以将日志消息发送到不同的目标。

   ```python
   handler = logging.StreamHandler()  # 创建一个输出到控制台的Handler
   logger.addHandler(handler)        # 将Handler添加到Logger
   ```

4. **格式化（Formatter）**:
   `Logger` 对象的处理程序可以附加一个或多个格式化（`Formatter`）对象，用于自定义日志消息的输出格式。通过设置 `Formatter`，您可以决定日志消息的外观，包括时间戳、级别、消息文本等。

   ```python
   formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
   handler.setFormatter(formatter)  # 将Formatter应用于Handler
   ```

5. **记录日志消息**:
   使用 `Logger` 对象的方法（例如 `logger.debug()`、`logger.info()`、`logger.warning()` 等）来记录不同级别的日志消息。根据 `Logger` 的级别设置，只有级别高于或等于阈值级别的消息才会被处理。

   ```python
   logger.debug('This is a debug message.')
   logger.info('This is an info message.')
   logger.warning('This is a warning message.')
   ```

6. **日志消息传递**:
   `Logger` 对象可以将日志消息传递给其父级 `Logger`（如果有）。这是通过 Logger 层次结构中的名称来确定的。如果没有为 `Logger` 对象指定名称，它将被视为根 `Logger`。

7. **Logger 层次结构**:
   `Logger` 对象形成了一个层次结构，具有父子关系，这使得可以按层次结构组织和分类日志消息。例如，您可以创建多个子 `Logger` 对象，用于不同模块或组件的日志记录，并将它们与根 `Logger` 关联。

   ```python
   parent_logger = logging.getLogger('parent')
   child_logger = logging.getLogger('parent.child')
   ```

总之，`Logger` 是 Python `logging` 模块中用于记录和管理日志消息的关键组件。通过使用 `Logger`，您可以配置不同的日志级别、处理程序、格式化方式，以满足不同应用程序的需求，并在代码中更好地组织和分类日志消息。它是支持灵活日志记录的重要工具。







## 输出到文件

- 通过添加`filename`选项，实现输出到指定文件（默认为追加写入）

```python
#!/usr/local/bin/python3
import logging

FORMAT = "%(asctime)s %(levelname)s \x01 %(message)s"

## logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S", filename='/var/log/test.log')

for i in range(6):
    logging.warning('warning ~~~')


## tail -f /var/log/test.log
2023-10-10 10:55:36 WARNING  warning ~~~
2023-10-10 10:55:36 WARNING  warning ~~~
2023-10-10 10:55:36 WARNING  warning ~~~
2023-10-10 10:55:36 WARNING  warning ~~~
2023-10-10 10:55:36 WARNING  warning ~~~
2023-10-10 10:55:36 WARNING  warning ~~~
```



## Handler

`Handler` 是 Python `logging` 模块中的重要组件之一，用于定义如何处理和分发日志消息。每个 `Handler` 对象决定了日志消息的输出目标，例如将消息写入文件、发送到网络套接字、输出到控制台等。以下是关于 `Handler` 的详细解释：

1. **Handler 的作用**:
   `Handler` 负责将日志消息从 `Logger` 对象发送到指定的输出目标，以便记录、分析或监视应用程序的运行。一个 `Logger` 可以附加多个 `Handler`，这允许将同一日志消息发送到不同的目标。

2. **内置 Handler**:
   Python 的 `logging` 模块提供了多种内置的 `Handler` 类，包括：

   - `StreamHandler`：将日志消息输出到控制台。
   - `FileHandler`：将日志消息写入文件。
   - `SocketHandler`：将日志消息发送到网络套接字。
   - `SMTPHandler`：通过电子邮件发送日志消息。
   - 等等...

3. **创建和配置 Handler**:
   您可以通过创建 `Handler` 的实例来定义如何处理日志消息。通常，您需要配置 `Handler` 的级别、格式化、过滤器等属性，以满足特定的需求。

   ```python
   import logging
   
   # 创建一个Handler实例（例如输出到控制台的Handler）
   handler = logging.StreamHandler()
   
   # 配置Handler的级别（例如设置为DEBUG，记录所有级别的消息）
   handler.setLevel(logging.DEBUG)
   
   # 创建Formatter实例，并设置Handler的格式化方式
   formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
   handler.setFormatter(formatter)
   ```

4. **附加 Handler 到 Logger**:
   通过使用 `Logger` 对象的 `addHandler(handler)` 方法，将创建的 `Handler` 实例附加到特定的 `Logger`，以便它可以处理该 `Logger` 对象生成的日志消息。

   ```python
   logger = logging.getLogger('my_logger')
   logger.addHandler(handler)
   ```

5. **处理日志消息**:
   一旦 `Handler` 被附加到 `Logger`，它就会处理来自该 `Logger` 的日志消息，并按照其配置的方式将它们发送到指定的输出目标。

   ```python
   logger.debug('This is a debug message.')
   logger.info('This is an info message.')
   ```

6. **过滤日志消息**:
   您可以配置 `Handler` 的过滤器（`Filter`），以决定哪些日志消息应该被处理。过滤器允许您根据条件过滤掉不感兴趣的消息。

7. **自定义 Handler**:
   您还可以创建自定义的 `Handler` 类，以实现特定的日志消息处理行为。这允许您完全定制日志消息的处理方式。

8. **多个 Handler**:
   一个 `Logger` 可以附加多个 `Handler`，从而将同一条日志消息发送到不同的目标。这对于同时记录日志消息到文件和输出到控制台或其他目标非常有用。

总之，`Handler` 是 Python `logging` 模块中用于决定日志消息的输出目标和处理方式的重要组件。通过创建和配置不同的 `Handler`，您可以将日志消息发送到不同的地方，以满足不同的需求，例如记录到文件、输出到控制台、发送到网络等。这为应用程序提供了灵活的日志记录和管理机制。



## Formatter

`Formatter` 是 Python `logging` 模块中的一个重要组件，用于定义日志消息的输出格式。通过定义 `Formatter`，您可以自定义日志消息的外观，包括时间戳、级别、消息文本等。

1. **Formatter 的作用**:
   `Formatter` 主要用于定义日志消息的输出格式，以便记录、分析或监视应用程序的运行。每个 `Handler` 可以附加一个 `Formatter` 对象，以决定输出的日志消息的外观。

2. **创建 Formatter**:
   您可以通过创建 `Formatter` 的实例来定义日志消息的格式。`Formatter` 的构造函数接受一个格式字符串作为参数，该字符串包含格式化代码，用于指定消息中包含的信息。

   ```python
   import logging
   
   # 创建一个Formatter实例，定义自定义格式
   formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
   ```

3. **应用 Formatter 到 Handler**:
   创建 `Formatter` 后，您需要将它应用到 `Handler`，以决定该 `Handler` 输出的日志消息的格式。这可以通过 `setFormatter(formatter)` 方法来实现。

   ```python
   import logging
   
   # 创建一个Handler实例
   handler = logging.StreamHandler()
   
   # 创建Formatter实例
   formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
   
   # 将Formatter应用于Handler
   handler.setFormatter(formatter)
   ```

4. **自定义 Formatter**:
   您可以根据特定需求创建自定义的 `Formatter` 类，以完全定制日志消息的输出格式。这允许您创建适合特定应用程序或日志记录需求的格式。

5. **多个 Formatter**:
   虽然每个 `Handler` 通常只附加一个 `Formatter`，但您可以创建多个不同的 `Formatter` 对象，并将它们应用于不同的 `Handler`，以根据需要记录不同格式的日志消息。

总之，`Formatter` 是 Python `logging` 模块中用于定义日志消息输出格式的重要组件。通过自定义 `Formatter`，您可以决定日志消息的外观，包括时间戳、级别、消息文本等。这使得日志消息的输出更具灵活性，可以根据特定需求进行定制，以便满足不同应用程序和日志管理的要求。





## 格式化代码

格式化字符串中的格式化代码是以百分号（%）开始的占位符，表示将被替换为实际信息的部分。常见的格式化代码包括：

- `%(asctime)s`：日志消息的时间戳。
- `%(levelname)s`：日志消息的级别（例如，'INFO'、'WARNING'、'ERROR' 等）。
- `%(message)s`：日志消息的文本内容。
- `%(name)s`：`Logger` 的名称。
- `%(pathname)s`：包含日志消息的源文件的完整路径。
- 等等...



**PS：**

格式化代码的语法风格在 Python `logging` 模块中是受到 C 语言的影响的，因此被称为 "C 风格" 格式化字符串。这种风格的格式化字符串使用百分号（%）作为占位符，类似于 C 语言中的 `printf` 函数中的格式化字符串。

在 C 风格的格式化字符串中，占位符以 `%` 开头，后跟一个字符，该字符表示将要插入的信息类型。以下是一些常用的格式化代码示例：

- `%s`：表示字符串，将插入一个字符串值。
- `%d`：表示整数，将插入一个整数值。
- `%f`：表示浮点数，将插入一个浮点数值。
- `%x`：表示十六进制整数，将插入一个十六进制整数值。
- `%%(百分号)`：用于插入字面的百分号字符。

在 Python 的 `logging` 模块中，这些格式化代码用于定义 `Formatter` 对象中的格式化字符串，以决定日志消息的输出格式。例如，`'%(asctime)s - %(levelname)s - %(message)s'` 中的 `%asctime` 表示要插入时间戳信息，`%levelname` 表示要插入日志级别信息，`%message` 表示要插入消息文本信息。

尽管 Python 也支持另一种字符串格式化方法，即使用 `str.format()` 方法或 f-strings（在 Python 3.6+ 中引入），但在 `logging` 模块中，C 风格的格式化字符串仍然是最常用的方式，因为它与传统的日志记录方式相一致，而且更容易理解和使用。



### 默认记录格式

```python
## cat 1.py 
#!/usr/local/bin/python3
import logging

logging.warning('warning ~~~')



## ./1.py 
WARNING:root:warning ~~~
```



### 修改记录格式 format

- 通过`format`修改默认Logger记录格式

```python
import logging

FORMAT = "'%(asctime)s - %(levelname)s - %(message)s"

logging.basicConfig(format=FORMAT)

logging.warning('warning ~~~')

'''
'2023-10-10 09:46:27,461 - WARNING - warning ~~~
'''
```



### 修改日期格式 datefmt

- 通过`datefmt`，实现自定义时间戳

```python
import logging

FORMAT = "'%(asctime)s - %(levelname)s - %(message)s"

logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

logging.warning('warning ~~~')

'''
'2023-10-10 09:50:06 - WARNING - warning ~~~
'''
```



### 自定义分隔符

- 可以使用特定的分隔符（如 `'\x01'`）来定义日志消息的格式，以便在日志消息中插入自定义分隔符，从而使信息更容易分割和解析。

```python
import logging

## 定义自定义格式化字符串，使用 '\x01' 作为分隔符
FORMAT = "%(asctime)s %(levelname)s \x01 %(message)s"

## 配置根Logger的格式和日期时间格式
logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

## 记录一条警告级别的日志消息
logging.warning('warning ~~~')
```

`\x01` 表示一个十六进制的 ASCII 控制字符，具体是 "Start of Header"（标题开始）控制字符，其 ASCII 值为 1。这个字符通常不可见，用于控制通信协议或数据格式，而不是在文本中显示。

下面是如何分割并解析这种格式的日志消息的示例：

```python
import logging

## 定义自定义格式化字符串，使用 '\x01' 作为分隔符
FORMAT = "%(asctime)s %(levelname)s \x01 %(message)s"

## 配置根Logger的格式和日期时间格式
logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

## 记录一条警告级别的日志消息
logging.warning('2023-10-09 15:30:00 WARNING \x01 This is a warning message.')

## 记录另一条信息
logging.info('2023-10-09 15:31:00 INFO \x01 This is an info message.')

## 记录一条错误消息
logging.error('2023-10-09 15:32:00 ERROR \x01 This is an error message.')

## 模拟从日志文件中读取的日志消息
log_entry = "2023-10-09 15:33:00 WARNING \x01 Another warning message."

## 分割日志消息
parts = log_entry.split('\x01')

## 解析日志消息的各个部分
if len(parts) == 3:
    timestamp, level, message = parts
    print("Timestamp:", timestamp)
    print("Level:", level)
    print("Message:", message)
else:
    print("Invalid log entry format.")
```

在上述示例中，我们首先使用了 `\x01` 作为分隔符来记录不同级别的日志消息。然后，我们模拟了从日志文件中读取的日志消息，并使用 `split('\x01')` 方法将消息拆分为各个部分。最后，我们解析了拆分后的日志消息，分别提取了时间戳、级别和消息文本。

这个示例演示了如何使用自定义分隔符来分割和解析日志消息，以便将日志消息的各个部分提取出来并进行处理。自定义分隔符在处理日志数据时非常有用，特别是当您需要将日志数据导入到其他系统或进行自定义日志分析时。



### 自定义格式化代码

- 非内置的格式化代码会报`KeyError: 'alias'`异常：

```python
import logging

## 定义自定义格式化字符串，使用 '\x01' 作为分隔符，并包括了 %(alias)s 格式化代码
FORMAT = "%(asctime)s %(levelname)s \x01 %(message)s %(alias)s"

## 配置根 Logger 的格式和日期时间格式
logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

## 记录一条警告级别的日志消息
logging.warning('warning ~~~')
```



- 通过在信息中添加`extra`选项，实现引用自定义的信息

```python
import logging

## 定义自定义格式化字符串，使用 '\x01' 作为分隔符，并包括了 %(alias)s 格式化代码
FORMAT = "%(asctime)s %(levelname)s \x01 %(message)s %(alias)s"

## 配置根 Logger 的格式和日期时间格式
logging.basicConfig(format=FORMAT, datefmt="%Y-%m-%d %H:%M:%S")

## 定义一个名为 'alias' 的字典，包含了别名信息
alias = {'alias': 'azheng'}

## 记录一条警告级别的日志消息，并通过 'extra' 参数传递了自定义字段
logging.warning('warning ~~~', extra=alias)


'''
2023-10-10 10:22:49 WARNING  warning ~~~ azheng
'''
```





如果您希望在日志消息中添加自定义字段，并且使用自定义格式化代码，您可以通过自定义 `Formatter` 类来实现。以下是一个示例，展示如何自定义格式化代码：

```python
import logging

## 创建自定义Formatter类
class MyFormatter(logging.Formatter):
    def format(self, record):
        # 自定义格式化代码
        custom_field = "CustomField: {}".format(record.custom_data)
        # 调用父类的format方法生成默认的日志消息
        log_message = super().format(record)
        # 将自定义字段添加到默认消息中
        return "{} - {}".format(log_message, custom_field)

## 创建Logger实例
logger = logging.getLogger('my_logger')
logger.setLevel(logging.DEBUG)

## 创建Handler实例
handler = logging.StreamHandler()
handler.setLevel(logging.DEBUG)

## 创建自定义Formatter实例
formatter = MyFormatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

## 将Handler添加到Logger
logger.addHandler(handler)

## 记录带有自定义字段的日志消息
logger.debug('This is a debug message.', extra={'custom_data': '12345'})
```

在这个示例中，我们创建了一个自定义的 `MyFormatter` 类，继承自 `logging.Formatter`，并覆盖了其 `format` 方法。在 `format` 方法中，我们可以添加自定义的格式化代码和字段，例如 `%(custom_data)s`。

然后，我们创建了一个 `Logger` 对象，并为它添加了一个 `Handler`，以及自定义的 `MyFormatter`。在记录日志消息时，我们可以使用 `extra` 参数传递自定义字段，例如 `{'custom_data': '12345'}`，并在格式化方法中将其添加到日志消息中。

这样，您可以自定义格式化代码和字段，以满足特定的日志记录需求。这对于在日志消息中添加额外信息或自定义标记非常有用。

### 范例：记录格式

默认情况下，Python `logging` 模块的默认日志记录器（根日志记录器或 "root logger"）使用简单的文本格式来记录日志消息。这个默认的记录格式包含以下信息：

- 日志消息级别（例如，'INFO'、'WARNING'、'ERROR'等）。
- 日志消息文本内容。
- 换行符（'\n'）。

例如，如果您使用默认的根日志记录器记录一条 `WARNING` 级别的消息，日志消息的格式可能如下所示：

```
WARNING: This is a warning message.
```

这个默认的记录格式非常简单，只包含了最基本的信息。但您可以通过配置 `logging` 模块，自定义日志消息的格式，以满足您的需求。

要自定义日志消息的格式，您可以使用 `logging` 模块的 `Formatter` 类。以下是一个示例，演示如何自定义记录格式：

```python
import logging

## 创建一个Formatter实例，定义自定义格式
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

## 创建一个Handler实例，并将Formatter设置为自定义格式
handler = logging.StreamHandler()
handler.setFormatter(formatter)

## 获取根Logger实例并添加Handler
logger = logging.getLogger()
logger.addHandler(handler)

## 记录一条日志消息
logger.warning('This is a customized warning message.')
```

在上述示例中，我们首先创建了一个自定义的日志记录格式，通过`logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')`定义了包含时间戳、日志级别和消息文本的格式。然后，我们创建了一个Handler实例，并将自定义格式应用于该Handler，然后将Handler添加到根Logger。最后，我们使用根Logger记录了一条 `WARNING` 级别的消息，消息的格式符合我们定义的自定义格式。

通过自定义记录格式，您可以将日志消息的内容、级别和其他信息按照您的需求进行格式化和组织。这使得日志记录更具灵活性，可以根据特定的应用程序和需求进行定制。





## ---



## 示例：使用默认 Logger

在 Python 的 `logging` 模块中，存在一个名为 "root logger" 或 "默认 logger" 的默认日志记录器。这个默认的日志记录器是模块初始化时自动创建的，并且没有指定名称。它是全局的，可以在整个应用程序中使用。

## logging.basicConfig()

在使用默认 Logger 时，通常要先使用 `logging.basicConfig()` 方法定义输出的级别与输出样式。

`logging.basicConfig()` 是一个设置默认日志配置的函数。当在Python中使用 `logging` 模块时，可以通过该函数设置一些基本的配置，例如日志的级别、输出格式、输出目标等。下面是该函数支持的参数以及默认值的解释：

1. **filename**: 指定日志输出到文件的文件名。如果指定了这个参数，则日志会输出到指定的文件中，而不是输出到控制台。默认值为 `None`，表示日志会输出到控制台而不是文件。

2. **filemode**: 指定日志文件的打开模式。默认值为 `'a'`，表示日志会以追加模式写入文件。其他常见的值包括 `'w'`（覆盖模式）和 `'x'`（如果文件不存在则创建，存在则失败）。

3. **format**: 指定日志输出的格式。默认值为 `'%(asctime)s - %(levelname)s - %(message)s'`，其中 `%(asctime)s` 表示日志记录的时间，`%(levelname)s` 表示日志级别，`%(message)s` 表示日志消息。可以根据需要自定义格式，例如 `'%(asctime)s - %(name)s - %(levelname)s - %(message)s'`。

4. **datefmt**: 指定日期时间格式化字符串。默认值为 `None`，表示使用默认的日期时间格式。

5. **level**: 指定日志输出的级别。默认值为 `logging.WARNING`，表示只输出 `WARNING` 级别及以上的日志。可以设置为其他级别，如 `logging.DEBUG`、`logging.INFO`、`logging.ERROR` 等。

6. **stream**: 指定日志输出的目标流。默认值为 `None`，表示使用 `sys.stderr` 作为输出流。可以指定其他流，如文件流或者网络流。



## 记录信息方式

例如使用`logger.warning('xxx')`记录信息时通常可以使用格式化字符串，类似于Python的`str.format()`方法或C语言风格的格式化字符串。这可以帮助您将变量的值或其他信息包含在日志消息中，以使日志信息更加有用。

以下是使用这两种方法的示例：

**使用`str.format()`方法：**

```python
import logging

logger = logging.getLogger('my_logger')
logger.setLevel(logging.WARNING)

name = 'John'
age = 30

## 使用str.format()将变量的值包含在日志消息中
logger.warning('User {} is {} years old'.format(name, age))
```

在这个示例中，`'User {} is {} years old'`是日志消息的格式化字符串，`name`和`age`是要插入的变量值。`str.format()`方法会将这些变量的值插入到字符串中，生成最终的日志消息。

**使用C语言风格的格式化字符串：**

```python
import logging

logger = logging.getLogger('my_logger')
logger.setLevel(logging.WARNING)

name = 'John'
age = 30

## 使用C语言风格的格式化字符串将变量的值包含在日志消息中
logger.warning('User %s is %d years old', name, age)
```

在这个示例中，`'User %s is %d years old'`是日志消息的格式化字符串，`%s`和`%d`是占位符，分别用于字符串和整数类型的变量。然后，`name`和`age`的值在日志记录时传递给这些占位符。

无论是使用`str.format()`还是C语言风格的格式化字符串，都可以根据您的喜好和需求来选择。一些日志库可能更喜欢其中一种风格，所以请查看您所使用的日志库的文档以了解最佳实践。





## 最佳实践

```py
#!/usr/local/bin/python3
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s\t%(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    filename='/var/log/test.log'
)

logging.info('info ~~~')
logging.warning('warning ~~~')
logging.error('error ~~~')
```







## 示例：自定义 Logger

尽管默认日志记录器非常方便，但通常在实际应用程序中，建议使用显式命名的Logger对象来进行更细粒度的日志记录和控制。这些显式的Logger对象可以通过`logging.getLogger('name')`创建，其中 `'name'` 是Logger的名称，用于将日志消息进行分类和组织。

使用显式命名的Logger对象具有更多的灵活性，可以根据需要独立配置、处理和格式化日志消息。默认日志记录器通常用于快速的、简单的日志记录，但在大型应用程序中，通常需要更多的控制和组织。

以下是一个简单的示例，演示了如何使用自定义 Logger 日志：

```python
import logging

## 创建一个Logger实例
logger = logging.getLogger('my_logger')
logger.setLevel(logging.DEBUG)

## 创建一个文件处理程序，将日志写入文件
file_handler = logging.FileHandler('my_log.log')
file_handler.setLevel(logging.DEBUG)

## 创建一个格式化程序，定义日志消息的格式
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

## 将处理程序添加到Logger
logger.addHandler(file_handler)

## 记录不同级别的日志消息
logger.debug('This is a debug message.')
logger.info('This is an info message.')
logger.warning('This is a warning message.')
logger.error('This is an error message.')
logger.critical('This is a critical message.')
```

在此示例中，我们创建了一个Logger实例，设置了最低级别为DEBUG，然后将一个文件处理程序添加到Logger中，以便将日志写入文件。还定义了一个格式化程序，以指定日志消息的格式。最后，我们使用Logger记录了不同级别的日志消息。
