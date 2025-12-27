---
title: "关系型"
weight: 51
---


## 关系统型数据库相关概念

- 关系 ：关系就是二维表，其中：表中的行、列次序并不重要
- 行row：表中的每一行，又称为一条记录record 
- 列column：表中的每一列，称为属性，字段，域field 
- 主键PK Primary key：用于惟一确定一个记录的字段，一张表只有一个主键
- 域domain：属性的取值范围，如，性别只能是‘男’和‘女’两个值，人类的年龄只能0-150



##  联系类型

- 一对一联系(1:1)
- 一对多联系(1:n)：外键
- 多对多联系(m:n)：增加第三张表



## 关系型数据库的常见组件

- 数据库：database
- 表：table，行：row 列：column
- 索引：index
- 视图：view
- 用户：user
- 权限：privilege
- 存储过程：procedure
- 存储函数：function
- 触发器：trigger
- 事件调度器：event scheduler，任务计划



# MySQL 命令分类

- MySQL命令分为客户端命令和sql标准命令

#### 客户端命令

- mysql> help 或 mysql> \h 列出的都是MySQL的客户端命令 以及对应的用法帮助

```bash
#范例：执行系统命令
mysql> \! pwd #或 mysql> system cmd 也可以执行 \! 为简写
/root
```

#### SQL标准命令

- 以 ; 结尾的命令都是SQL标准命令

```sql
#范例：显示目前所有数据库
mysql> SHOW databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+

#获取帮助
mysql> help SHOW
Name: 'SHOW'
Description:
SHOW has many forms that provide information about databases, tables,
columns, or status information about the server. This section describes
those following:

SHOW {BINARY | MASTER} LOGS
SHOW BINLOG EVENTS [IN 'log_name'] [FROM pos] [LIMIT [offset,] row_count]
SHOW CHARACTER SET [like_or_where]
SHOW COLLATION [like_or_where]
...
```







# MySQL 默认数据库说明

#### mysql

- 是mysql的核心数据库，类似于Sql Server中的master库，主要负责存储数据库的用户、权限设置、关键字等mysql自己需要使用的控制和管理信息


#### performance_schema

- MySQL 5.5开始新增的数据库，主要用于收集数据库服务器性能参数,库里表的存储引擎均为PERFORMANCE_SCHEMA，用户不能创建存储引擎为PERFORMANCE_SCHEMA的表


#### information_schema

- MySQL 5.0之后产生的，一个虚拟数据库，物理上并不存在information_schema数据库类似与“数据字典”，提供了访问数据库元数据的方式，即数据的数据。比如数据库名或表名，列类型，访问权限（更加细化的访问方式）


#### sys

- MySQL5.7之后新增加的数据库，库中所有数据源来自performance_schema。目标是把performance_schema的把复杂度降低，让DBA能更好的阅读这个库里的内容。让DBA更快的了解DB的运行情况








# MySQL 字符集和排序

## 字符集说明

- 通用字符集：utf8
- 升级版通用字符集：utf8mb4（支持表情包）

```bash
#查看支持所有字符集
MariaDB [(none)]> SHOW CHARACTER SET;
...

#查看当前字符集的使用情况
MariaDB [(none)]> show variables like 'character%';
+--------------------------+------------------------------+
| Variable_name            | Value                        |
+--------------------------+------------------------------+
| character_set_client     | utf8                         |
| character_set_connection | utf8                         |
| character_set_database   | latin1                       |
| character_set_filesystem | binary                       |
| character_set_results    | utf8                         |
| character_set_server     | latin1 #服务端字符集           |
| character_set_system     | utf8                         |
| character_sets_dir       | /usr/share/mariadb/charsets/ #字符集对应的文件
+--------------------------+------------------------------+
8 rows in set (0.001 sec)

```

## 永久修改默认字符集

- 修改配置文件后需重启服务
- 修改默认字符集后，只对之后增加的内容生效

```bash
#设置服务器默认的字符集
vim /etc/my.cnf
[mysqld]
character-set-server=utf8mb4
MariaDB [(none)]> show variables like 'character%';
+--------------------------+------------------------------+
| Variable_name            | Value                        |
+--------------------------+------------------------------+
| character_set_client     | utf8                         |
| character_set_connection | utf8                         |
| character_set_database   | utf8mb4 #对此行做出改变        |
| character_set_filesystem | binary                       |
| character_set_results    | utf8                         |
| character_set_server     | utf8mb4 #对此行做出改变        |
| character_set_system     | utf8                         |
| character_sets_dir       | /usr/share/mariadb/charsets/ |
+--------------------------+------------------------------+


#设置mysql客户端默认的字符集
vim /etc/my.cnf
[mysql]
default-character-set=utf8mb4
MariaDB [(none)]> show variables like 'character%';
+--------------------------+------------------------------+
| Variable_name            | Value                        |
+--------------------------+------------------------------+
| character_set_client     | utf8mb4 #对此行做出改变        |
| character_set_connection | utf8mb4 #对此行做出改变        |
| character_set_database   | utf8mb4                      |
| character_set_filesystem | binary                       |
| character_set_results    | utf8mb4 #对此行做出改变        |
| character_set_server     | utf8mb4                      |
| character_set_system     | utf8                         |
| character_sets_dir       | /usr/share/mariadb/charsets/ |
+--------------------------+------------------------------+
```

## 排序

- 决定了文本的排序规则，一般采用默认即可


```bash
#查看所有支持的排序规则
MariaDB [(none)]> SHOW COLLATION;

#查看当前使用的排序规则
MariaDB [(none)]> SHOW VARIABLES LIKE 'collation%';
```









# MySQL 服务管理

- 除定义service文件管理mysql服务外，还可以使用mysqladmin命令来对其进行管理

```bash
#关闭mysql服务，但mysqladmin命令无法开启服务
mysqladmin -uroot -12345 shutdown
```





# MySQL 健康性检查

- MySQL健康性检查，查看mysql服务是否正常，如果正常提示mysqld is alive

```bash
# mysqladmin -uroot -p123 ping
mysqld is alive

# echo $?
0
```







# SQL脚本的执行方法

```bash
#方法一
mysql -uUSERNAME -pPASSWORD < /path/somefile.sql

#方法二
cat /path/somefile.sql | mysql -uUSERNAME -pPASSWORD 

#方法三
mysql>source   /path/from/somefile.sql
```





# MySQL 客户端常用选项

```bash
#语法
mysql [OPTIONS] [database]

#选项
-A, --no-auto-rehash #禁止补全
-u, --user= #用户名,默认为root
-h, --host= #服务器主机,默认为localhost
-p, --passowrd= #用户密码,建议使用-p,默认为空密码
-P, --port= #服务器端口
-S, --socket= #指定连接socket文件路径
-D, --database= #指定默认数据库
-C, --compress #启用压缩
-e   #“SQL“ 执行SQL命令
-V, --version #显示版本
-v --verbose #显示详细信息
--print-defaults #获取程序默认使用的配置
```

### 基础使用范例

```bash
#默认空密码登录
[root@centos8 ~]$mysql –uroot –p

#运行mysql命令
mysql>use mysql
mysql>select user(); #查看当前用户
mysql>SELECT User,Host,Password FROM user;

#查看mysql版本
[root@centos8 ~]$mysql -V
mysql Ver 15.1 Distrib 10.3.11-MariaDB, for Linux (x86_64) using readline 5.1

#临时修改mysql提示符1
[root@centos8 ~]$mysql -uroot -pcentos --prompt="\\r:\\m:\\s(\\u@\\h) [\\d]>\\_"

#临时修改mysql提示符2
[root@centos8 ~]$export MYSQL_PS1="\\r:\\m:\\s(\\u@\\h) [\\d]>\\_"

#持久修改mysql提示符
[root@centos8 ~]$vim /etc/my.cnf.d/mysql-clients.cnf 
[mysql]
prompt="\\r:\\m:\\s(\\u@\\h) [\\d]>\\_"
[root@centos8 ~]$mysql --print-defaults -v
mysql would have been started with the following arguments:
--prompt=\r:\m:\s(\u@\h) [\d]>\_ -v
10:29:30(root@localhost) [(none)]> #样式
```





# 关闭MySQL中的线程

```sql
mysql> kill {process Id}
```





# 查看数据库相关进程

```sql
MariaDB [(none)]> show processlist;
```



# 查看插件

```sql
SHOW PLUGINS;
```
