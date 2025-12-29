---
title: "DML"
---

## INSERT INTO

## 语法一

```sql
-- 向表中插入一行数据，自增字段、缺省值字段、可为空字段可以不写。
INSERT INTO table_name (column1, column2, ..., columnN)
VALUES (value1, value2, ..., valueN);
```

**例子：**

```sql
INSERT INTO employees (first_name, last_name, hire_date)
VALUES ('John', 'Doe', '2022-01-15');
```

在这个例子中，向 `employees` 表插入了一行数据，包括 `first_name`、`last_name` 和 `hire_date` 列的值。



## 语法二

```sql
-- 将 SELECT 查询的结果插入到表中。
INSERT INTO table_name (column1, column2, ..., columnN)
SELECT value1, value2, ..., valueN
FROM another_table
WHERE condition;
```



## 语法三

这是 MySQL 中的一种插入语句，用于在插入数据时处理主键或唯一键冲突的情况。具体来说，如果插入操作导致主键或唯一键发生冲突（即已存在具有相同主键或唯一键值的行），则会执行 UPDATE 操作，将已存在的行的其他列更新为指定的值。

```sql
-- 如果主键、唯一键冲突，就执行 UPDATE 后的设置。
INSERT INTO table_name (column1, column2, ..., columnN)
VALUES (value1, value2, ..., valueN)
ON DUPLICATE KEY UPDATE column1=value1, ...;
```

- `INSERT INTO table_name (column1, column2, ..., columnN) VALUES (value1, value2, ..., valueN)`: 这部分是标准的插入语句，用于向表 `table_name` 中插入一行数据，指定了要插入的列和对应的值。

- `ON DUPLICATE KEY UPDATE column1=value1, ...`: 这是在插入操作发生主键或唯一键冲突时执行的操作。如果插入操作导致主键或唯一键冲突，则会执行 UPDATE 操作，将已存在的行的指定列更新为指定的值。

接下来，让我们通过一个示例来说明该语句的用法：

假设有一个名为 `employees` 的表，结构如下：

```sql
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(50),
    department_id INT UNIQUE
);
```

现在想要向 `employees` 表中插入一条记录，如果 `department_id` 已经存在相同的值，则更新 `name` 列的值。

```sql
INSERT INTO employees (employee_id, name, department_id)
VALUES (101, 'John', 101)
ON DUPLICATE KEY UPDATE name='John Doe';
```

在上述示例中，如果已存在 `department_id` 为 101 的记录，则更新该记录的 `name` 列为 'John Doe'。否则，将新的记录插入表中。



## 语法四

```sql
-- 如果主键、唯一键冲突，就忽略错误，返回一个警告。
INSERT IGNORE INTO table_name (column1, column2, ..., columnN)
VALUES (value1, value2, ..., valueN);
```

- `IGNORE`: 这是 INSERT 语句的一个修饰符，表示如果出现主键或唯一键冲突，则忽略错误，不执行任何操作。





## UPDATE

`UPDATE` 是 SQL 中用于修改表中现有数据的语句。通过 `UPDATE` 语句，可以更新表中的一行或多行记录的列值。

## 注意事项

执行`UPDATE` 语句，**一定要加 `WHERE` 条件，否则会对全表进行更新。**

`UPDATE` 语句会影响表中的现有数据，因此在生产环境中使用时需要谨慎。确保 `WHERE` 子句足够准确，以避免不必要的数据修改。在修改大量数据时，建议在执行 `UPDATE` 之前进行备份，并在事务中使用，以便在需要时能够回滚更改。

## 语法一

基本的 `UPDATE` 语法如下：

```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ..., columnN = valueN
WHERE condition;
```

其中：
- `table_name` 是要更新数据的表的名称。
- `SET column1 = value1, column2 = value2, ..., columnN = valueN` 是要设置的列和对应的新值。
- `WHERE condition` 是用于指定更新哪些行的条件，**如果省略 `WHERE` 子句，则所有行都会被更新。**

**例子：**
```sql
UPDATE employees
SET salary = salary * 1.1
WHERE department = 'IT';
```

在这个例子中，更新了 `employees` 表中部门为 'IT' 的员工的工资，每个员工的工资增加了 10%。



## 语法二

`UPDATE` 语句还可以使用子查询来设置新的列值，例如：

```sql
UPDATE table_name
SET column1 = (SELECT value FROM another_table WHERE condition),
    column2 = (SELECT value FROM another_table WHERE condition)
WHERE condition;
```

在这种情况下，子查询返回的结果将用于设置相应列的新值。



## 语法三

```sql
-- 如果主键、唯一键冲突，就忽略错误，返回一个警告。
UPDATE IGNORE table_name
SET column1 = value1, column2 = value2, ..., columnN = valueN
WHERE condition;
```

- `IGNORE`: 这是 INSERT 语句的一个修饰符，表示如果出现主键或唯一键冲突，则忽略错误，不执行任何操作。







## DELETE

`DELETE` 是 SQL 中用于从表中删除数据的语句。通过 `DELETE` 语句，可以删除满足特定条件的一行或多行记录。

## 注意事项

如果省略 `WHERE` 子句，则所有行都会被删除。

`DELETE` 语句会永久性地从表中删除数据，因此在生产环境中使用时需要谨慎。确保 `WHERE` 子句足够准确，以避免不必要的数据删除。在删除大量数据时，建议在执行 `DELETE` 之前进行备份，并在事务中使用，以便在需要时能够回滚更改。

## 语法一

基本的 `DELETE` 语法如下：

```sql
DELETE FROM table_name
WHERE condition;
```

其中：
- `table_name` 是要删除数据的表的名称。
- `WHERE condition` 是用于指定删除哪些行的条件，**如果省略 `WHERE` 子句，则所有行都会被删除。**

**例子：**

```sql
DELETE FROM employees
WHERE department = 'HR' AND hire_date < '2022-01-01';
```

在这个例子中，删除了 `employees` 表中部门为 'HR' 且入职日期早于 '2022-01-01' 的员工记录。

与 `UPDATE` 语句类似，`DELETE` 语句也可以使用子查询来指定要删除的行，例如：

```sql
DELETE FROM table_name
WHERE column_name IN (SELECT column_name FROM another_table WHERE condition);
```

在这种情况下，满足子查询条件的行将被删除。



## 最佳实践

```sql
-- 真删除，不推荐，这意味着这些记录被永久地从表中删除，数据库中将不再存在这些数据。
DELETE FROM reg WHERE id = 1 OR id = 2;

-- 假删除，推荐，这种假删除方式并没有真正从数据库中删除记录，而是通过修改记录的状态来标记记录为已删除状态。
UPDATE reg SET del=1 WHERE id = 1 OR id = 2;
```

为什么要采用假删除方式，而不是直接使用真删除呢？这主要是因为假删除方式具有一些优势：

1. **数据保留：** 使用假删除方式，数据实际上并没有被永久删除，而是被标记为已删除状态。这样做的好处是可以在需要时恢复已删除的数据，或者进行审计跟踪。

2. **维护历史记录：** 假删除方式保留了删除操作的历史记录，即记录被删除的时间和原因。这有助于追踪数据的变更历史，并提高数据审计的可追溯性。

3. **防止数据丢失：** 真删除操作是不可逆的，一旦删除就无法恢复数据。而假删除方式不会真正删除数据，因此可以避免数据丢失的风险。

4. **性能优化：** 真删除操作可能会导致表的碎片化和索引重建，从而影响数据库性能。假删除方式则不会对表结构造成影响，因此通常更加高效。

总的来说，假删除方式是一种更加安全和可控的数据删除方式，适用于需要保留删除历史记录、可恢复已删除数据或者需要进行数据审计的场景。



## ---



## MERGE

在一条语句中执行插入、更新或删除操作，通常用于处理表之间的复杂关系。

`MERGE` 是 SQL 中用于根据条件在表中执行插入、更新、删除操作的语句。`MERGE` 语句通常用于数据仓库等场景，其中需要将源表的数据合并（更新或插入）到目标表中。

基本的 `MERGE` 语法如下：

```sql
MERGE INTO target_table USING source_table
ON (condition)
WHEN MATCHED THEN
  UPDATE SET column1 = value1, column2 = value2, ...
WHEN NOT MATCHED THEN
  INSERT (column1, column2, ...) VALUES (value1, value2, ...)
WHEN NOT MATCHED BY SOURCE THEN
  DELETE;
```

其中：
- `target_table` 是要更新的目标表的名称。
- `source_table` 是包含要合并数据的源表的名称。
- `(condition)` 是用于指定匹配行的条件。
- `UPDATE SET` 子句用于指定匹配行时要执行的更新操作。
- `INSERT` 子句用于指定不匹配时要执行的插入操作。
- `DELETE` 子句用于指定在目标表中存在但在源表中不存在时要执行的删除操作。

**例子：**
```sql
MERGE INTO employees_target USING employees_source
ON (employees_target.employee_id = employees_source.employee_id)
WHEN MATCHED THEN
  UPDATE SET
    employees_target.first_name = employees_source.first_name,
    employees_target.last_name = employees_source.last_name,
    employees_target.salary = employees_source.salary
WHEN NOT MATCHED THEN
  INSERT (employee_id, first_name, last_name, salary)
  VALUES (employees_source.employee_id, employees_source.first_name, employees_source.last_name, employees_source.salary)
WHEN NOT MATCHED BY SOURCE THEN
  DELETE;
```

在这个例子中，根据 `employee_id` 列将源表的数据合并到目标表中。如果 `employee_id` 在目标表中存在，则更新相关列的值；如果在源表中存在但在目标表中不存在，则插入一行新记录；如果在目标表中存在但在源表中不存在，则删除该行。

`MERGE` 语句是一种强大的工具，但在使用时需要谨慎。确保在合并数据之前备份数据，并验证条件和逻辑以确保合并的准确性。此外，支持 `MERGE` 语句的数据库管理系统可能会有不同的语法和行为，因此建议查阅相应数据库系统的文档以获取详细信息。

