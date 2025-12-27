---
title: "configparser"
---

# configparser

`configparser` 是 Python 标准库中的一个模块，用于解析和操作 INI 文件格式的配置文件。它提供了一种简单的方法来读取和写入配置数据，支持创建、修改和删除配置文件中的节和键值对。

以下是 `configparser` 模块的基本用法示例：

1. **导入模块**：

   首先，需要导入 `configparser` 模块：

   ```python
   import configparser
   ```

2. **创建配置文件对象**：

   创建一个 `ConfigParser` 对象，用于操作配置文件：

   ```python
   config = configparser.ConfigParser()
   ```

3. **读取配置文件**：

   使用 `read()` 方法从配置文件中读取数据：

   ```python
   config.read('config.ini')  # 读取名为 'config.ini' 的配置文件
   ```

4. **访问配置数据**：

   使用 `get()` 方法来获取特定节和键的值：

   ```python
   server_name = config.get('Database', 'ServerName')
   ```

   在上述代码中，我们获取了 `Database` 节中 `ServerName` 键的值。

5. **修改配置数据**：

   使用 `set()` 方法来更改或添加配置数据：

   ```python
   config.set('Database', 'Port', '3307')  # 将 'Port' 的值更改为 '3307'
   config.set('AppSettings', 'NewSetting', 'value')  # 添加一个新的键值对
   ```

6. **写回到配置文件**：

   使用 `write()` 方法将修改后的配置数据写回到文件：

   ```python
   with open('config.ini', 'w') as configfile:
       config.write(configfile)
   ```

7. **删除配置数据**：

   使用 `remove_option()` 方法来删除配置文件中的键值对：

   ```python
   config.remove_option('AppSettings', 'LogLevel')
   ```

   这将删除 `AppSettings` 节中的 `LogLevel` 键值对。

`configparser` 模块提供了更多高级功能，如处理默认值、处理多行值以及处理布尔值等。这使得它成为在 Python 中处理配置文件的强大工具。



## ini 概述

INI 文件（又称 INI 配置文件）是一种常见的文本文件格式，用于存储配置数据。INI 文件通常以 .ini 作为文件扩展名，并由一系列节（sections）和键值对（key-value pairs）组成，用于配置应用程序、操作系统或其他软件的设置选项。每个节都包含一个或多个键值对，用于指定特定设置的值。

以下是一个典型的 INI 文件示例：

```ini
; 这是注释
[Database]
ServerName=localhost
Port=3306
Username=myuser
Password=mypassword

[AppSettings]
LogLevel=2
AutoSave=true
Theme=Dark
```

在上面的示例中，INI 文件有两个节：`[Database]` 和 `[AppSettings]`。每个节下面都包含了一系列键值对，例如 `[Database]` 节包含了 ServerName、Port、Username 和 Password 这些键值对。

INI 文件通常用于存储配置信息，应用程序可以读取这些信息并根据配置文件中的值来调整其行为。INI 文件的语法相对简单，易于人们阅读和编辑，但在某些情况下可能不够灵活，特别是对于包含复杂数据结构的配置。

请注意，虽然 INI 文件在过去非常流行，但现代应用程序通常更倾向于使用其他配置文件格式，如 JSON、YAML 或 XML，因为这些格式提供了更多的灵活性和扩展性。

**section**

在 INI 文件中，"section"（或称为节）是一个用方括号 `[ ]` 括起来的部分，用来组织配置文件中的键值对。每个节包含一组相关的键值对，用于描述特定的配置或设置选项。节的主要目的是将相关的配置数据分组在一起，以便在应用程序中更容易地进行查找和管理。

以下是一个示例 INI 文件，其中包含两个节：

```ini
[Database]
ServerName=localhost
Port=3306
Username=myuser
Password=mypassword

[AppSettings]
LogLevel=2
AutoSave=true
Theme=Dark
```

在上面的示例中，有两个节：`[Database]` 和 `[AppSettings]`。`[Database]` 节包含有关数据库连接的配置，而 `[AppSettings]` 节包含有关应用程序设置的配置。

要访问 INI 文件中的特定配置项，通常需要指定节的名称，然后提供键的名称，以获取其值。例如，要获取数据库的用户名，您可以使用以下方式：

```
Database.Username = myuser
```

这种结构使得在配置文件中组织和查找数据变得更加简单和有组织。不同的程序和库可以通过解析 INI 文件来读取和写入配置信息，以根据需要调整应用程序的行为。

## 范例 - 1

### mysql.ini

```ini
[DEFAULT]
a = test

[Database]
ServerName=localhost
Port=3306
Username=azheng
Password=123

[AppSettings]
LogLevel=2
AutoSave=true
Theme=Dark
```

### test.py

```python
import configparser

# 创建一个名为 cfg 的 ConfigParser 对象。这个对象将用于操作配置文件，包括读取、写入和修改配置数据。
cfg = configparser.ConfigParser()
print(cfg)  # <configparser.ConfigParser object at 0x000001EEE02A96F0>
print('-' * 30)

# 虽然在上述代码中创建了 cfg 对象，但还没有读取任何配置文件。要读取配置文件，通常使用 read() 方法。例如，要读取名为 mysql.ini 的配置文件，可以执行以下操作：
r = cfg.read('mysql.ini')
print(r)  # ['mysql.ini']
print('-' * 30)

# 使用 configparser 模块中的 sections() 方法来获取配置文件中的所有节（sections），然后使用 options() 方法获取每个节中的键值对的键（options）。
for x in cfg.sections():  #返回所有section，但不包含特殊的缺省section
    # 遍历配置文件中的所有节
    print(type(x), x)  # 打印节的类型和名称
    print(cfg.options(x))  # 打印当前节中的所有键（options）
'''
<class 'str'> Database
['servername', 'port', 'username', 'password', 'a']
<class 'str'> AppSettings
['loglevel', 'autosave', 'theme', 'a']
'''

print('-' * 30)

# 使用 configparser 模块中的 items() 方法来获取配置文件中所有节（sections）中的所有键值对（key-value pairs）。
for y in cfg.items():
    print(type(y), y)
'''
<class 'tuple'> ('DEFAULT', <Section: DEFAULT>)
<class 'tuple'> ('Database', <Section: Database>)
<class 'tuple'> ('AppSettings', <Section: AppSettings>)
'''

print('-' * 30)

# 这段代码使用 configparser 模块中的 items() 方法来获取配置文件中所有节（sections）中的所有键值对（key-value pairs），然后遍历每个键值对，分别打印键和值，并尝试使用 items() 方法获取特定节中的键值对。
# 推荐使用！
for k, v in cfg.items():
    # 遍历配置文件中的所有节中的键值对
    print(type(k), k)  # 打印键的类型和内容
    print(type(v), v)  # 打印值的类型和内容
    print(cfg.items(k))  # 返回整个配置文件中的所有键值对列表
'''
<class 'str'> DEFAULT
<class 'configparser.SectionProxy'> <Section: DEFAULT>
[('a', 'test')]
<class 'str'> Database
<class 'configparser.SectionProxy'> <Section: Database>
[('a', 'test'), ('servername', 'localhost'), ('port', '3306'), ('username', 'azheng'), ('password', '123')]
<class 'str'> AppSettings
<class 'configparser.SectionProxy'> <Section: AppSettings>
[('a', 'test'), ('loglevel', '2'), ('autosave', 'true'), ('theme', 'Dark')]
'''

print('-' * 30)

# 判断某 section 下是否有某 option
print(cfg.has_option('Database', 'port'))  # True
print(cfg.has_option('Database', 'pport'))  # False



if cfg.has_section('test'):
    cfg.add_section('test')
    cfg.remove_section('test')
```





