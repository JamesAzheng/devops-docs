---
title: "pymysql"
---


# 使用流程概述

PyMySQL 是一个纯 Python 实现的 MySQL 客户端库，用于与 MySQL 服务器进行通信和交互。

使用 PyMySQL 连接 MySQL 数据库主要包括以下步骤：

1. 安装 PyMySQL：首先需要通过 pip 或其他包管理工具安装 PyMySQL 库。

   ```bash
   pip install pymysql
   ```

2. 连接到 MySQL 数据库：在 Python 代码中导入 PyMySQL 库，并使用 `connect()` 方法建立与 MySQL 数据库的连接。连接方法需要提供数据库的主机地址、用户名、密码、数据库名称等信息。

   ```python
   import pymysql

   # 建立数据库连接
   conn = pymysql.connect(
       host='localhost',
       user='username',
       password='password',
       database='database_name'
   )
   ```

3. 创建游标对象：连接成功后，需要创建一个游标对象，用于执行 SQL 查询和操作数据库。

   ```python
   # 创建游标对象
   cursor = conn.cursor()
   ```

4. 执行 SQL 查询：使用游标对象的 `execute()` 方法执行 SQL 查询语句。

   ```python
   # 执行 SQL 查询
   cursor.execute("SELECT * FROM table_name")
   ```

5. 获取查询结果：通过游标对象的 `fetchall()`、`fetchone()` 或 `fetchmany()` 方法获取执行查询后的结果。

   ```python
   # 获取所有结果
   results = cursor.fetchall()

   # 遍历结果
   for row in results:
       print(row)
   ```

6. 提交事务和关闭连接：执行完所有操作后，需要提交事务并关闭连接。

   ```python
   # 提交事务
   conn.commit()
   
   # 关闭游标和连接
   cursor.close()
   conn.close()
   ```

这就是使用 PyMySQL 连接 MySQL 数据库的基本流程。根据具体需求，可以在此基础上进行更多的操作，例如插入数据、更新数据、删除数据等。同时，还可以使用异常处理来处理连接、查询过程中的错误情况，以保证程序的稳定性和健壮性。



## 注意事项

1. 增删改，`cursor.execute()`返回的是受影响的行数



# 连接数据库

## 通过 json 配置文件传参

准备 json 配置文件 `config.json`：

```json
{
  "host": "10.0.0.123",
  "password": "123456",
  "database": "test",
  "user": "azheng",
  "port": 3306
}
```

连接数据库：

```py
import os
import simplejson
import pymysql

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
    conf = simplejson.load(f)

# 创建连接数据库对象
conn = pymysql.connect(**conf)
```

**假设conf的返回值为 {'host': '10.0.0.123', 'password': '12345', 'database': 'test', 'user': 'azheng', 'port': 3306}，那么 \*\*conf 这种传参方式可以起到什么作用？**

在 Python 中，`**conf` 的语法是将字典中的键值对作为关键字参数传递给函数或方法。在你的代码中，`pymysql.connect(**conf)` 这行代码的作用是将 `conf` 字典中的键值对解包，然后作为关键字参数传递给 `pymysql.connect()` 方法。

假设 `conf` 的返回值为 `{'host': '10.0.0.123', 'password': '12345', 'database': 'test', 'user': 'azheng', 'port': 3306}`，那么 `pymysql.connect(**conf)` 实际上等同于：

```python
pymysql.connect(host='10.0.0.123', password='12345', database='test', user='azheng', port=3306)
```

这样的写法使得代码更加简洁和可读，避免了在调用函数时逐个指定参数名和值的繁琐操作。同时，如果 `conf` 字典中的键值对发生变化，不需要修改函数调用的代码，只需要更新字典即可，提高了代码的灵活性和可维护性。

**为什么要定义 conn = None？**

在这段代码中，定义 `conn = None` 是为了确保在连接数据库之前，`conn` 变量已经被声明了，即使在 `try` 块之前发生了异常。这是一种良好的编程实践，可以确保代码在执行过程中不会因为变量未被声明而引发 `NameError` 异常。

在 Python 中，`try...finally` 结构用于确保在代码执行过程中无论是否发生异常，都会执行指定的清理代码。在这个例子中，即使在 `try` 块中连接数据库时发生了异常，`finally` 块中的代码也会执行，保证了数据库连接在不再需要时被正确关闭。

因此，在 `try` 块之前声明 `conn = None` 是为了确保即使 `try` 块中的代码在执行前就发生了异常，`conn` 变量也已经被定义了，从而使得在 `finally` 块中可以正确地关闭数据库连接。



# 创建游标对象

- 操作数据库，必须使用游标，因此需要先获取一个游标对象（Cursor Object）
- 游标对象是通过数据库连接对象的 `cursor()` 方法创建
- 游标对象类似于指针，指向某些记录
- 游标对象允许程序在数据库中执行 SQL 查询并处理查询结果。
- 它充当了程序与数据库之间的桥梁，使得程序能够向数据库发送查询请求，并从查询结果中获取数据。
- 游标对象还提供了许多方法来处理查询结果，如获取单行数据、获取多行数据等。
- 连接没有关闭前，游标对象可以反复使用。
- **游标对象获取的查询结果，是缓存到客户端的，并非每次都去数据库查询。因此如果游标对象已经获取到了查询结果，即使关闭连接，后期也同样能查询到结果。**

```py
import os
import simplejson
import pymysql

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
    conf = simplejson.load(f)

conn = pymysql.connect(**conf)

# 通过连接数据库对象，创建游标对象
cursor = conn.cursor()
```



## 带列名查询 DictCursor

`DictCursor` 是 `pymysql` 中的一个游标类型。当你使用 `DictCursor` 时，查询结果将以字典形式返回，其中列名作为键，对应的值为字典的值。这使得对查询结果的处理更加直观和方便，因为你可以通过列名来访问数据，而不是通过索引。

以下是一个简单的示例，展示了如何使用 `DictCursor`：

```python
import pymysql

# 连接到 MySQL 数据库
connection = pymysql.connect(host='localhost',
                             user='username',
                             password='password',
                             database='database_name',
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        # 执行 SELECT 查询
        sql = "SELECT * FROM my_table"
        cursor.execute(sql)

        # 获取所有行
        rows = cursor.fetchall()

        # 遍历行并打印字典形式的行数据
        for row in rows:
            print(row)

finally:
    # 关闭连接
    connection.close()
```

在这个例子中，查询结果将以字典的形式返回给变量 `rows`，其中字典的键是列名，值是对应的数据。





# 执行 SQL 语句和提交事务

通过游标对象的 `execute()` 或 `executemany()` 方法可以执行 SELECT、INSERT、UPDATE、DELETE 等 SQL 语句。

## 执行单条 SQL 语句

游标对象的 `execute()` 方法可执行单条 SQL 语句

### INSERT

```py
import os
import simplejson
import pymysql

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
    conf = simplejson.load(f)

conn = pymysql.connect(**conf)
cursor = conn.cursor()

# 要执行的单条SQL语句
sql = """INSERT INTO students (name, age) VALUES ('tom', 23)"""
# 通过游标对象，执行sql语句
cursor.execute(sql)
# 提交事务
conn.commit()
```



## 执行多条 SQL 语句

游标对象的`executemany()` 方法可执行多条 SQL 语句，也可通过 for 循环 +  `execute()` 的方式执行多条 SQL 语句

### for 循环 + execute()

- 通过 for 循环 + execute()，同样可以实现 executemany() 的效果。

#### INSERT

- 向表中插入多行数据

```sql
import os
import simplejson
import pymysql

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
    conf = simplejson.load(f)

conn = pymysql.connect(**conf)
cursor = conn.cursor()

# 多条SQL语句
for i in range(100, 103):
    # 要执行的SQL语句
    sql = """INSERT INTO students (name, age) VALUES ('tom{0}', {0})""".format(i)
    # 通过游标对象，执行sql语句
    cursor.execute(sql)
# 统一提交事务
conn.commit()
```



### executemany()

`executemany()` 是数据库编程中用于批量执行相同或类似的 SQL 语句的方法。下面是关于 `executemany()` 方法的详细解释：

1. **作用**：

   - `executemany()` 方法用于执行多个相同或类似的 SQL 语句，通常是 INSERT、UPDATE 或 DELETE 等操作。
   - 它可以一次性执行多个 SQL 语句，提高了数据库操作的效率和性能。

2. **语法**：

   ```python
   cursor.executemany(operation, seq_of_params)
   ```

   - `operation` 是要执行的 SQL 语句，通常是一个带有占位符的 SQL 语句。
   - `seq_of_params` 是一个包含多个参数序列的可迭代对象，每个参数序列对应一个 SQL 语句中的占位符。

3. **示例**：

   ```python
   data = [
       ('John', 30),
       ('Alice', 25),
       ('Bob', 35)
   ]
   cursor.executemany("INSERT INTO table_name (name, age) VALUES (%s, %s)", data)
   ```

   在这个示例中，`data` 是一个包含多个元组的列表，每个元组对应一个要插入到数据库中的数据行。`executemany()` 方法会执行一次 INSERT 语句，并将 `data` 中的每个元组中的值作为参数依次插入到数据库中。

4. **注意事项**：

   - 在执行 `executemany()` 方法时，数据库模块通常会尝试一次性提交所有的操作，因此可以提高数据库操作的效率。
   - 使用 `executemany()` 方法时要注意 SQL 语句中的占位符与参数序列中的元素个数要对应，否则会引发异常。
   - 在执行大量操作时，建议使用 `executemany()` 方法来批量执行，而不是使用循环多次执行单个 SQL 语句，以减少数据库交互的开销。

`executemany()` 方法是数据库编程中非常常用的方法之一，特别适用于需要批量处理大量数据的情况。



## ---

## 通过参数化查询防止 SQL 注入攻击

- 生产环境中的代码一定要这样写

使用参数化查询是一种有效的方法来防止 SQL 注入攻击。在 Python 中，可以使用 pymysql 模块执行参数化查询。下面是一个简单的示例：

```python
import pymysql

# 连接数据库
connection = pymysql.connect(host='your_host',
                             user='your_username',
                             password='your_password',
                             database='your_database',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        # 定义 SQL 查询语句，使用占位符 %s
        sql = "SELECT * FROM your_table WHERE column1 = %s AND column2 = %s"
        
        # 定义查询参数
        params = ('value1', 'value2')
        
        # 执行查询
        cursor.execute(sql, params)
        
        # 获取查询结果
        result = cursor.fetchall()
        print(result)
finally:
    # 关闭数据库连接
    connection.close()
```

在这个示例中，SQL 查询语句中的 `%s` 是占位符，参数 `params` 是一个包含实际查询值的元组。通过在执行查询时将参数传递给 `execute()` 方法，pymysql 将会安全地处理参数，并防止 SQL 注入攻击。

**记住，永远不要通过字符串拼接的方式来构建 SQL 查询语句，因为这会增加 SQL 注入攻击的风险。**使用参数化查询是更安全的做法。





# 获取 SQL 语句查询结果

- 可以使用游标对象的 `fetchone()`、`fetchall()`、`fetchmany(size)` 方法获取查询结果。
- `fetchone()` 方法用于获取查询结果集中的一行数据。
  - 通常在需要逐行处理查询结果时（例如查询结果集很大），使用 `fetchone()` 方法。
- `fetchall()` 方法用于获取查询结果集中的所有数据。
  - 通常在需要一次性获取整个查询结果集并处理所有数据时使用 `fetchall()` 方法。
- `fetchmany(size)` 方法用于获取查询结果集中指定数量（size）的数据。

## 获取查询结果集中的一行数据

- `fetchone()` 方法用于从查询结果集中获取一行数据，并将游标移到下一行。
- 如果查询结果集为空或游标已经到达结果集的末尾，则返回 None。
- 每次调用 `fetchone()` 方法，游标都会向下移动一行。

```python
cursor.execute("SELECT * FROM table_name")
row = cursor.fetchone()
while row:
    print(row)
    row = cursor.fetchone()
```



## 获取查询结果集中的所有数据

- `fetchall()` 方法用于从查询结果集中获取所有数据，并返回一个包含所有数据的列表。
- 如果查询结果集为空，则返回一个空列表。
- `fetchall()` 方法一次性获取整个结果集，将游标移到结果集的末尾。

```python
cursor.execute("SELECT * FROM table_name")
rows = cursor.fetchall()
for row in rows:
    print(row)
```



## 获取查询结果集中指定数量的数据

```python
rows = cursor.fetchmany(5)  # 获取指定数量的数据
```



## 获取执行 SQL 查询后受影响的行数

- 在 Python 的数据库模块中，游标对象通常提供了 `rowcount` 属性，用于获取执行 SQL 查询后受影响的行数。
- `rowcount` 属性返回一个整数值，表示最近一次执行的 SQL 语句影响的行数。
- 对于 SELECT 查询，`rowcount` 属性通常返回 -1，因为游标对象无法预先知道查询结果的行数。

```python
cursor.execute("UPDATE table_name SET column_name = 'new_value' WHERE condition")
affected_rows = cursor.rowcount
```



## 获取查询结果集中的行号

`cursor.rownumber`可以返回当前行号，可以修改，支持负数。

```python
cursor.execute("SELECT * FROM table_name")
row = cursor.fetchone()
while row:
    print("行号:", cursor.rownumber) # 获取行号
    print(row)
    row = cursor.fetchone()
```















# 关闭连接

## close()

可通过 `conn.close()` 和 `cursor.close()` 关闭资源，关闭 cursor 后，不能再执行任何 SQL 查询操作。

以下是一个示例，演示了如何使用 `conn.close()` 和 `cursor.close()` 关闭资源：

```python
import pymysql

# 连接到 MySQL 数据库
connection = pymysql.connect(host='localhost',
                             user='username',
                             password='password',
                             database='database_name',
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        # 执行 SQL 查询
        sql = "SELECT * FROM my_table"
        cursor.execute(sql)

        # 获取所有行
        rows = cursor.fetchall()

        # 遍历行并打印行数据
        for row in rows:
            print(row)

finally:
    # 关闭游标
    cursor.close()
    # 关闭连接
    connection.close()
```

在这个例子中，首先使用 `connection.cursor()` 创建游标，然后执行查询并处理结果。最后，通过 `cursor.close()` 关闭游标，然后通过 `conn.close()` 关闭连接。这样可以确保在结束数据库操作后，释放了所有相关的资源。



## with

还可以通过上下文管理器 `with` 关闭 cursor

在 Python 中，使用上下文管理器 `with` 语句可以确保资源在不再需要时被正确关闭。对于 `pymysql` 中的游标，你可以使用 `with` 语句来创建游标，并在 `with` 代码块结束时自动关闭游标，而不需要显式调用 `cursor.close()`。

以下是使用 `with` 语句关闭游标的示例：

```python
import pymysql

# 连接到 MySQL 数据库
connection = pymysql.connect(host='localhost',
                             user='username',
                             password='password',
                             database='database_name',
                             cursorclass=pymysql.cursors.DictCursor)

# 使用 with 语句创建游标，并在 with 代码块结束时自动关闭游标
with connection.cursor() as cursor:
    try:
        # 执行 SQL 查询
        sql = "SELECT * FROM my_table"
        cursor.execute(sql)

        # 获取所有行
        rows = cursor.fetchall()

        # 遍历行并打印行数据
        for row in rows:
            print(row)

    finally:
        # 游标会在 with 代码块结束时自动关闭，所以这里不需要调用 cursor.close()
        pass

# 关闭连接
connection.close()
```

在这个例子中，游标是使用 `with` 语句创建的，这样可以确保在执行完查询后自动关闭游标，而不需要显式调用 `cursor.close()`。



# ---

# 示例：INSERT

```yaml
#!/usr/local/bin/python3
import os
import simplejson
import pymysql

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
    conf = simplejson.load(f)

conn = None
cursor = None
try:
    conn = pymysql.connect(**conf)
    cursor = conn.cursor()
    # 要执行的单条SQL语句
    sql = """INSERT INTO students (name, age) VALUES ('tom', 23)"""
    # 通过游标对象，执行sql语句
    cursor.execute(sql)
    # 提交事务
    conn.commit()
except Exception as e:
    # 如抛异常则回滚
    conn.rollback()
    # 可改为写日志
    print(e)
finally:
    if conn:
        conn.close()
    if cursor:
        cursor.close()
```

## 1

```py
import os
import simplejson
import pymysql

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as f:
    conf = simplejson.load(f)

conn = pymysql.connect(**conf)
cursor = conn.cursor()

# 要执行的单条SQL语句
sql = """INSERT INTO students (name, age) VALUES ('tom', 23)"""
# 通过游标对象，执行sql语句
cursor.execute(sql)
# 提交事务
conn.commit()
```



# 示例：SELECT

