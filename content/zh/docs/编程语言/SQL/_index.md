---
title: "SQL"
---

# SQL 语言规范

- SQL 语句中的关键字、函数名大小写不敏感，但建议用大写。
- SQL 关键字不能跨多行或简写。
- SQL 子句通常位于独立行，便于编辑，提高可读性
- SQL 语句可单行或多行书写，以` ;` 结尾
- 用空格和缩进来提高语句的可读性
- and，or，逗号等放在行首，这样的好处是增加删除条件时比较方便，否则删除最后一个条件时还要去上一行末删除关联词。
- SQL 支持注释：
  - `-- 注释内容` ，单行注释，注意有空格
  - `/*注释内容*/` ，多行注释
  - MySQL 注释可以使用`#`


- 命名规范：

  - 必须以字母开头，可包括数字和三个特殊字符（# _ $）

  - 不要使用 MySQ L的保留字

  - 同一database(Schema)下的对象不能同名

以下是一个例子，同时列出与您提到的规范点的对应情况：

```sql
-- SQL关键词不区分大小写，但建议用大写
SELECT FirstName, LastName
FROM Employees
WHERE Department = 'IT'
ORDER BY LastName;

-- SQL语句可单行或多行书写，以 ; 结尾
-- 用空格和缩进来提高语句的可读性
-- 子句通常位于独立行，便于编辑，提高可读性
SELECT 
    FirstName,
    LastName
FROM 
    Employees
WHERE 
    Department = 'IT'
ORDER BY 
    LastName;

-- 关键词不能跨多行或简写
-- and，or，逗号等放在行首
SELECT FirstName, LastName
FROM Employees
WHERE Department = 'IT'
  AND Salary > 50000
ORDER BY LastName;
```

在这个例子中：

- SQL关键词使用大写，尽管在某些系统中不区分大小写，但使用大写可以提高可读性。
- SQL语句可单行或多行书写，以 ; 结尾，同时使用了空格和缩进来提高可读性，子句通常独立成行。
- 关键词没有跨多行或简写，而是清晰地列在各自的行中。
- and关键词放在行首，这是一种格式规范，增加或删除条件时更方便。







# SQL 语句分类

SQL（Structured Query Language）语句可以分为以下几类：

1. **数据查询语句（Data Query Language，DQL）**：用于从数据库中检索数据的语句，最常见的是SELECT语句。例如：SELECT * FROM table_name;

2. **数据操作语言（Data Manipulation Language，DML）**：用于操作数据库中数据的语句，包括插入、更新、删除数据等操作。常见的命令有INSERT、UPDATE和DELETE。例如：INSERT INTO table_name (column1, column2) VALUES (value1, value2);

3. **数据定义语言（Data Definition Language，DDL）**：用于定义、修改和删除数据库对象（如表、视图、索引等）的语句。常见的命令有CREATE、ALTER和DROP。例如：CREATE TABLE table_name (column1 datatype, column2 datatype);

4. **数据控制语言（Data Control Language，DCL）**：用于控制数据库访问权限的语句，包括授权和撤销授权等。常见的命令有GRANT和REVOKE。

这些是SQL语言中的主要类别，每种类别都有其特定的语法和用途。 









# SQL 语句构成

关健字Keyword组成子句clause，多条clause组成语句

```sql
SELECT *                 #SELECT子句
FROM products             #FROM子句
WHERE price>400           #WHERE子句
```

说明：一组SQL语句，由三个子句构成，SELECT,FROM和WHERE是关键字数据库操作



SQL 子句是构成 SQL 语句的组成部分，用于指定查询、操作或定义数据库结构的详细条件。不同类型的 SQL 语句包含不同的子句。以下是一些常见的 SQL 子句：

1. **SELECT 子句：**
   - 用于指定要从数据库中检索的列和表。
   - **例子：**
     ```sql
     SELECT column1, column2 FROM table_name WHERE condition;
     ```
   - 子句包括：`SELECT`, `FROM`, `WHERE`, `ORDER BY`, `GROUP BY`, `HAVING`, `LIMIT` 等。

2. **FROM 子句：**
   - 用于指定查询的数据表。
   - **例子：**
     ```sql
     SELECT column1, column2 FROM table_name WHERE condition;
     ```
   - 子句包括：`FROM`, 有时也可以包含 `JOIN` 子句。

3. **WHERE 子句：**
   - 用于筛选满足特定条件的行。
   - **例子：**
     ```sql
     SELECT column1, column2 FROM table_name WHERE condition;
     ```
   - 子句包括：`WHERE`。

4. **ORDER BY 子句：**
   - 用于对结果集进行排序。
   - **例子：**
     ```sql
     SELECT column1, column2 FROM table_name ORDER BY column1 ASC;
     ```
   - 子句包括：`ORDER BY`。

5. **GROUP BY 子句：**
   - 用于将结果集分组。
   - **例子：**
     ```sql
     SELECT column1, COUNT(column2) FROM table_name GROUP BY column1;
     ```
   - 子句包括：`GROUP BY`。

6. **HAVING 子句：**
   - 用于筛选分组后的结果。
   - **例子：**
     ```sql
     SELECT column1, COUNT(column2) FROM table_name GROUP BY column1 HAVING COUNT(column2) > 1;
     ```
   - 子句包括：`HAVING`。

7. **INSERT 子句：**
   - 用于将数据插入到表中。
   - **例子：**
     ```sql
     INSERT INTO table_name (column1, column2) VALUES (value1, value2);
     ```
   - 子句包括：`INSERT INTO`, `VALUES`。

8. **UPDATE 子句：**
   - 用于更新表中的数据。
   - **例子：**
     ```sql
     UPDATE table_name SET column1 = value1 WHERE condition;
     ```
   - 子句包括：`UPDATE`, `SET`, `WHERE`。

9. **DELETE 子句：**
   - 用于从表中删除数据。
   - **例子：**
     ```sql
     DELETE FROM table_name WHERE condition;
     ```
   - 子句包括：`DELETE FROM`, `WHERE`。

10. **ALTER 子句：**
    - 用于修改数据库对象的结构，如表。
    - **例子：**
      ```sql
      ALTER TABLE table_name ADD column_name datatype;
      ```
    - 子句包括：`ALTER TABLE`.

这些子句根据 SQL 语句的类型而有所不同。使用这些子句的组合，可以构建各种查询和操作数据库的语句。

# 获取帮助

https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html

```sql
mysql> HELP KEYWORD
```





# ---

# 1

SQL（Structured Query Language）是一种用于管理关系型数据库的标准化查询语言。它允许用户执行诸如查询数据、插入、更新和删除数据等操作。以下是一些常用的 SQL 语句及其详解：

1. **SELECT（查询）：**
   - 用于从数据库中检索数据。
   ```sql
   SELECT column1, column2 FROM table_name WHERE condition;
   ```
   - `column1, column2` 是你要选择的列名，`table_name` 是表名，`condition` 是可选的筛选条件。

2. **INSERT INTO（插入）：**
   
   - 用于将新数据插入到表中。
   ```sql
   INSERT INTO table_name (column1, column2) VALUES (value1, value2);
   ```
   - `table_name` 是表名，`column1, column2` 是要插入的列名，`value1, value2` 是相应的值。
   
3. **UPDATE（更新）：**
   - 用于更新表中的数据。
   ```sql
   UPDATE table_name SET column1 = value1 WHERE condition;
   ```
   - `table_name` 是表名，`column1 = value1` 是要更新的列和新值，`condition` 是筛选条件。

4. **DELETE（删除）：**
   - 用于从表中删除数据。
   ```sql
   DELETE FROM table_name WHERE condition;
   ```
   - `table_name` 是表名，`condition` 是要删除的行的筛选条件。

5. **CREATE TABLE（创建表）：**
   - 用于创建新表。
   ```sql
   CREATE TABLE table_name (
       column1 datatype,
       column2 datatype,
       ...
   );
   ```
   - `table_name` 是表名，`column1, column2` 是列名和它们的数据类型。

6. **ALTER TABLE（修改表）：**
   - 用于修改现有表的结构。
   ```sql
   ALTER TABLE table_name ADD column_name datatype;
   ```
   - 添加新列到现有表。

7. **DROP TABLE（删除表）：**
   - 用于删除表及其数据。
   ```sql
   DROP TABLE table_name;
   ```
   - `table_name` 是要删除的表名。

8. **SELECT DISTINCT（选择唯一值）：**
   - 用于检索唯一的值。
   ```sql
   SELECT DISTINCT column1, column2 FROM table_name;
   ```
   - 返回指定列的不同值。

9. **ORDER BY（排序）：**
   - 用于对结果集进行排序。
   ```sql
   SELECT column1, column2 FROM table_name ORDER BY column1 ASC;
   ```
   - `ASC` 表示升序，`DESC` 表示降序。

10. **GROUP BY（分组）：**
    - 用于将结果集分组。
    ```sql
    SELECT column1, COUNT(column2) FROM table_name GROUP BY column1;
    ```
    - 在这个例子中，按 `column1` 的值分组，并计算每组中 `column2` 的数量。

这只是 SQL 语句中的一小部分，SQL 还有很多其他功能和语法。具体的语法和用法可能会因不同的数据库管理系统而有所不同，如MySQL、PostgreSQL、SQL Server等。



# 2

SQL（Structured Query Language）是一种标准化的查询语言，用于管理关系型数据库。SQL 的规范定义了一系列语法规则和关键字，以执行各种数据库操作。以下是 SQL 语言的一般规范：

1. **关键字（Keywords）：**
   - SQL 中有一组保留的关键字，用于表示特定的操作或任务，如SELECT、INSERT、UPDATE、DELETE等。

2. **语句（Statements）：**
   - SQL 语言由一系列语句组成，每个语句用于执行特定的数据库操作。常见的语句包括SELECT、INSERT、UPDATE、DELETE、CREATE TABLE、ALTER TABLE、DROP TABLE等。

3. **注释（Comments）：**
   - SQL 支持单行注释（以`--`开头）和多行注释（以`/*`开始，以`*/`结束）。

4. **数据类型（Data Types）：**
   - SQL 定义了各种数据类型，例如整数、浮点数、字符、日期等。不同的数据库管理系统可能有不同的数据类型。

5. **表达式（Expressions）：**
   - 表达式用于在 SQL 语句中计算值，可以包括常量、列名、运算符等。

6. **函数（Functions）：**
   - SQL 提供了许多内置函数，用于执行各种操作，如聚合函数（SUM、AVG、COUNT等）、字符串函数、日期函数等。

7. **查询（Queries）：**
   - 查询是 SQL 中最常见的任务之一。SELECT 语句用于检索数据，可以包括条件、排序、分组等。

8. **约束（Constraints）：**
   - 约束用于定义表中数据的规则。常见的约束有 PRIMARY KEY（主键）、FOREIGN KEY（外键）、UNIQUE（唯一约束）、NOT NULL（非空约束）等。

9. **事务（Transactions）：**
   - SQL 支持事务，用于将一系列操作捆绑在一起，以确保数据库的一致性和完整性。

10. **索引（Indexes）：**
    - 索引用于提高数据库的检索性能。通过在表的一列或多列上创建索引，可以快速查找特定的数据。

11. **视图（Views）：**
    - 视图是基于一个或多个表的查询结果，可以像表一样进行查询，但本身不包含实际的数据。

这些规范适用于 ANSI SQL 标准，但不同的数据库管理系统可能会在语法和功能上有所不同。每个数据库系统通常都有自己的扩展和特定功能。在使用 SQL 时，建议查阅相关数据库管理系统的文档以了解特定系统的语法和功能。
