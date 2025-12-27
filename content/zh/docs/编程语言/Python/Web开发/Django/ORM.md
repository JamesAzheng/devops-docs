---
title: "ORM"
---

# ORM 概述

ORM，对象关系映射，对象和关系之间的映射，使用面向对象的方式来操作数据库。

- 对象指的是面向对象中的对象，关系指的是关系型数据库。

关系模型和python对象之间的映射：

```py
table		->	class		# 表映射为类
row			->	object     # 行映射为实例
column	->	property # 字段映射为属性
```

例如，有表student，字段为`id int`，`name varchar`，`age int`，映射到python为：

```py
class Student:
    id = ?某类型字段
    name = ?某类型字段
    age = ?某类型字段

# 最终得到实例：
class Student:
    def __init__(self):
        self.id = ?
        self.name = ?
        self.age = ?
```



## ---

ORM，即对象关系映射（Object-Relational Mapping），是一种程序设计技术，它在面向对象编程语言和关系数据库之间建立了一种映射关系，使得数据库中的数据可以以对象的形式进行操作，从而简化了开发人员在应用程序中对数据的处理。

ORM 的主要作用包括：

1. 将数据库中的表映射为面向对象编程语言中的类，表中的每一行数据都对应着类的一个实例对象。
2. 通过简单的 API（应用程序接口）或语言特性，开发人员可以像操作对象一样操作数据库中的数据，无需编写复杂的 SQL 查询语句。
3. 提高了代码的可维护性和可读性，使得开发人员可以更加专注于业务逻辑的实现，而无需过多关注数据库操作的细节。
4. ORM 框架通常提供了一些额外功能，如数据校验、缓存管理、事务控制等，简化了开发过程。

常见的 ORM 框架包括 Django 的 ORM、SQLAlchemy、Hibernate（用于 Java）等。这些框架通常提供了丰富的功能和灵活的配置选项，可以根据项目的需求选择合适的框架。

在使用 ORM 框架时，开发人员需要定义好对象与数据库表之间的映射关系，并配置好数据库连接信息。然后就可以通过框架提供的 API 或语言特性来进行数据操作，例如插入、更新、删除和查询等操作。

尽管 ORM 技术简化了开发过程，但在处理大量数据或对性能要求较高的场景下，开发人员仍需注意 ORM 操作可能带来的性能损耗，并根据实际情况进行优化。





# Django ORM

Django 的 ORM（Object-Relational Mapping）是 Django 框架中的一个核心组件，它提供了一种将数据库表映射到 Python 对象的方式，使得开发人员可以使用面向对象的方式操作数据库，而无需直接编写 SQL 查询语句。下面是 Django ORM 的一些重要特性和用法详解：

1. 模型定义：在 Django 中，每个数据库表都对应着一个模型（Model），模型是一个 Python 类，通过继承 `django.db.models.Model` 类来定义。模型类中的属性代表数据库表的字段，例如 CharField、IntegerField、DateTimeField 等。

```python
from django.db import models

class MyModel(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
```

2. 数据库迁移：通过 Django 的迁移工具可以将模型类的定义转换成对应的数据库表结构，并同步到数据库中。开发人员只需运行 `python manage.py makemigrations` 和 `python manage.py migrate` 命令即可完成数据库迁移过程。

3. 数据查询：Django 提供了 QuerySet API 来执行数据库查询操作，QuerySet 是一个可迭代的对象，支持链式调用。开发人员可以使用各种方法来过滤、排序、限制查询结果等。

```python
# 查询所有数据
MyModel.objects.all()

# 根据条件过滤数据
MyModel.objects.filter(age__gte=18)

# 排序查询结果
MyModel.objects.order_by('-created_at')

# 获取单个对象
MyModel.objects.get(pk=1)
```

4. 数据操作：Django 的模型类提供了一些方法来执行数据操作，如创建、更新、删除等。

```python
# 创建对象
obj = MyModel.objects.create(name='John', age=25)

# 更新对象
obj.age = 26
obj.save()

# 删除对象
obj.delete()
```

5. 关联查询：Django 支持定义模型之间的关联关系，如一对多、多对一、多对多等。通过定义外键、一对一字段等来建立关联关系，并可以通过双下划线语法进行关联查询。

```python
class Author(models.Model):
    name = models.CharField(max_length=100)

class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)

# 查询某个作者的所有书籍
author = Author.objects.get(name='John Doe')
author.books.all()
```

Django ORM 提供了丰富的功能和灵活的查询语法，使得开发人员可以高效地进行数据库操作。同时，Django 还提供了一些性能优化的方式，如使用 select_related()、prefetch_related() 方法进行关联查询优化，以及使用 defer()、only() 方法选择需要查询的字段，从而提升查询效率。



# 前期准备

## 1. 创建项目

安装 Django 后，打开命令行终端，导航到你想要创建项目的目录，并执行以下命令来创建一个新的 Django 项目：

```
django-admin startproject <project_name>
```

这里的 `<project_name>` 是你想要给项目起的名字，可以是任何合法的 Python 标识符。

执行上述命令后，会在当前目录下创建一个新的目录，目录名就是你指定的项目名称。在这个目录中，会生成一些默认的文件和子目录，这些文件和目录的功能如下：

- `<project_name>/`：项目的根目录，以你指定的项目名称命名。
  - `manage.py`：Django 项目的命令行工具，用于执行各种管理任务。
  - `<project_name>/`：项目的 Python 包，包含项目的设置、URL 配置等。
    - `__init__.py`：一个空文件，表示该目录是一个 Python 包。
    - `settings.py`：Django 项目的设置文件，包含项目的配置信息。
    - `urls.py`：URL 路由配置文件，定义了 URL 和视图函数之间的映射关系。
    - `wsgi.py`：WSGI 兼容的 Web 服务器入口，用于部署项目到 WSGI 兼容的服务器。





## 2. 创建应用

创建 Django 应用是 Django 开发中的重要步骤，它允许你将不同功能或模块拆分成独立的组件，以便更好地组织代码和逻辑。下面是创建 Django 应用的详细步骤：

1. **进入 Django 项目目录：** 首先，确保你已经在 Django 项目的根目录下。如果你还没有创建 Django 项目，可以使用 `django-admin startproject <project_name>` 命令创建一个新的项目。

2. **使用 `startapp` 命令创建应用：** 在命令行中执行以下命令来创建一个新的 Django 应用：

   ```
   python manage.py startapp <app_name>
   ```

   这里的 `<app_name>` 是你想为应用指定的名称。执行上述命令后，Django 将在项目目录下创建一个新的应用程序目录，其中包含了一些基本的文件和文件夹结构。

3. **查看新应用的文件结构：** 创建应用后，你会在项目目录中看到一个新的文件夹，其名称与你指定的应用名称相同。在这个文件夹中，你将看到一些文件和子文件夹，包括：

   - `models.py`：用于定义应用程序的数据模型。
   - `views.py`：包含应用程序的视图函数，用于处理请求并生成响应。
   - `urls.py`：定义了应用程序的 URL 路由映射。
   - `admin.py`：用于注册模型以在 Django 管理界面中进行管理。
   - `apps.py`：包含应用程序的配置信息。
   - `migrations/`：用于存储数据库迁移文件。
   - `tests.py`：包含应用程序的单元测试。

4. **注册应用到项目中：** 一旦应用程序创建完成，你需要将其注册到项目中。为此，你需要编辑项目目录下的 `settings.py` 文件，并在 `INSTALLED_APPS` 配置项中添加你的应用名称。例如：

   ```python
   INSTALLED_APPS = [
       ...
       'myapp',
   ]
   ```

   这里的 `'myapp'` 是你创建的应用的名称。



## 3. 配置项目

编辑`settings.py`：

```py
# 配置连接数据库，注释掉默认的 `DATABASES` 字段，如使用MySQL，可添加类似如下配置：
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "hellodb",
        "USER": "azheng",
        "PASSWORD": "123456",
        "HOST": "10.0.0.123",
        "PORT": "3306",
    }
}


# 设置时区
TIME_ZONE = 'Asia/Shanghai'


# 设置日志输出
# https://docs.djangoproject.com/zh-hans/4.2/topics/logging/
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": "/var/log/django.log",
        },
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["file"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}
```





## 4. 定义模型（可选）

如果你的应用需要与数据库交互，你可以在 `models.py` 文件中定义应用的数据模型。通过定义模型，你可以定义数据的结构和行为，并使用 Django 的 ORM 来处理数据库操作。



## 5. 编写视图和 URL 映射

在 `views.py` 文件中编写视图函数，用于处理来自客户端的请求。然后，在 `urls.py` 文件中定义 URL 路由映射，将 URL 请求与相应的视图函数关联起来。



## 6. 运行开发服务器

在完成以上步骤后，你可以使用 `python manage.py runserver` 命令来启动 Django 的开发服务器，并在浏览器中访问应用程序，进行测试和调试。



## 示例

1. 创建项目：

   - 也可使用`django-admin startproject test_django_project .` 避免创建子目录

   - ```sh
     # django-admin startproject test_django_project
     # tree
     .
     └── test_django_project
         ├── manage.py
         └── test_django_project
             ├── __init__.py
             ├── asgi.py
             ├── settings.py
             ├── urls.py
             └── wsgi.py
     ```

2. 创建应用

   - ```sh
     # cd test_django_project/
     # python3 manage.py startapp app1
     # tree
     .
     ├── app1
     │   ├── __init__.py
     │   ├── admin.py
     │   ├── apps.py
     │   ├── migrations
     │   │   └── __init__.py
     │   ├── models.py
     │   ├── tests.py
     │   └── views.py
     ├── manage.py
     └── test_django_project
         ├── __init__.py
         ├── __pycache__
         │   ├── __init__.cpython-38.pyc
         │   └── settings.cpython-38.pyc
         ├── asgi.py
         ├── settings.py
         ├── urls.py
         └── wsgi.py
     
     
     # 注册应用到项目中
     # vim test_django_project/settings.py
     INSTALLED_APPS = [
         ...
         'app1',
     ]
     ```




# 创建 Model 类

models.py：

```py
from django.db import models

# Create your models here.

# CREATE TABLE `students` (
#   `StuID` int unsigned NOT NULL AUTO_INCREMENT,
#   `Name` varchar(50) NOT NULL,
#   `Age` tinyint unsigned NOT NULL,
#   `Gender` enum('F','M') NOT NULL,
#   `ClassID` tinyint unsigned DEFAULT NULL,
#   `TeacherID` int unsigned DEFAULT NULL,
#   PRIMARY KEY (`StuID`)
# ) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;

class Employee(models.Model): # metaclass=ModelBase
    class Meta:
        db_table = 'students'

    StuID = models.IntegerField(primary_key=True)
    Name = models.CharField(null=False, max_length=50)
    Age = models.IntegerField(null=False)
    Gender = models.SmallIntegerField(null=False)
    ClassID = models.IntegerField(null=True)
    TeacherID = models.IntegerField(null=True)

    def __repr__(self):
        return "<Employee: {} {} {}>".format(
            self.StuID, self.Name, self.Age
        )

    __str__ = __repr__
```

t1.py（引用）：

```py
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "salary.settings")
django.setup()

from employee.models import Employee

emps = Employee.objects.all() # 懒查询
print(emps)

for emp in emps:
    print(type(emp), emp) # 返回的每行都是Employee的各个实例
```



## 字段映射含义

当你在 Django 中创建一个 Model 类时，你使用的字段（Field）定义了数据库表中的列以及这些列的数据类型。下面是一些常用的字段以及它们的含义：

1. **AutoField**: 一个自动增长的整数字段，通常用作主键。
   
2. **BigAutoField**: 一个自动增长的64位整数字段，用作大型主键。

3. **BigIntegerField**: 一个64位整数字段。

4. **BinaryField**: 用于存储二进制数据的字段。

5. **BooleanField**: 一个布尔字段，存储 True 或 False。

6. **CharField**: 一个字符串字段，需要指定最大长度。

7. **DateField**: 一个日期字段。

8. **DateTimeField**: 一个日期时间字段。

9. **DecimalField**: 一个十进制数字段。

10. **DurationField**: 一个持续时间字段，用于存储时间间隔。

11. **EmailField**: 一个字符串字段，验证输入是否为有效的电子邮件地址。

12. **FileField**: 用于上传文件的字段。

13. **FloatField**: 一个浮点数字段。

14. **ImageField**: 用于上传图像文件的字段。

15. **IntegerField**: 一个整数字段。

16. **GenericIPAddressField**: 一个存储 IPv4 或 IPv6 地址的字段。

17. **NullBooleanField**: 一个允许存储 Null 值的布尔字段。

18. **PositiveIntegerField**: 一个正整数字段。

19. **PositiveSmallIntegerField**: 一个正整数字段，范围较小。

20. **SlugField**: 一个用于URLs的字符串字段，通常用于友好的URL。

21. **SmallAutoField**: 一个自动增长的16位整数字段，用作较小的主键。

22. **SmallIntegerField**: 一个16位整数字段。

23. **TextField**: 一个文本字段，通常用于长文本。

24. **TimeField**: 一个时间字段。

这些字段是 Django 中最常用的一些字段类型，它们允许你在模型中定义各种类型的数据，并且 Django 会根据这些字段自动创建相应的数据库结构。



# 管理器对象 objects

在Django中，管理器对象(objects)是模型(Model)的一个关键部分，用于管理数据库中模型实例的创建、查询、更新和删除等操作。下面是一些关于Django管理器对象的详解：

1. **默认管理器(objects)**:
   - Django模型中默认情况下会自动创建一个名为`objects`的管理器，用于执行数据库操作。
   - 如果你没有明确地为模型指定自定义的管理器，`objects`管理器将会被自动创建并添加到模型中。

2. **自定义管理器**:
   - 你可以通过在模型中定义自定义管理器来扩展模型的查询功能。
   - 自定义管理器是一个继承自`models.Manager`的类，你可以在其中定义额外的方法来执行特定的查询操作。
   - 通过自定义管理器，你可以轻松地封装常用的查询逻辑，使代码更加清晰和可维护。

3. **使用自定义管理器**:
   - 一旦你在模型中定义了自定义管理器，你可以通过调用该管理器的方法来执行自定义的查询操作。
   - 例如，如果你定义了一个名为`CustomManager`的自定义管理器，你可以通过`MyModel.custom_manager_name.method()`的方式来使用它。

4. **修改默认管理器**:
   - 你可以通过在模型中添加`objects`属性并将其设置为你自定义的管理器的实例来覆盖默认的`objects`管理器。
   - 这样做可以让你在模型中使用自定义的查询逻辑而不是默认的`objects`管理器。

5. **链式调用**:
   - 管理器方法通常支持链式调用，这意味着你可以在单个查询中连续调用多个管理器方法。
   - 这种方法允许你构建复杂的查询，同时保持代码的可读性和简洁性。

6. **延迟查询执行**:
   - 在Django中，查询通常是延迟执行的。这意味着当你调用管理器方法时，实际的数据库查询不会立即执行，直到需要获取查询结果时才会执行。
   - 这种延迟执行的特性使得可以构建高效的查询链，只有在必要时才会触发数据库操作。

总的来说，Django管理器对象(objects)提供了一个强大的接口来管理模型实例在数据库中的操作。通过默认管理器和自定义管理器，你可以方便地执行各种数据库查询操作，并且可以根据需要轻松地扩展和定制查询功能。



# 查询

## 查询集

在Django中，查询集（QuerySet）是对数据库中数据进行查询的对象。它允许你以一种Pythonic的方式来构建和执行数据库查询，同时提供了一系列方法来过滤、排序、限制和聚合数据。以下是关于Django查询集的详细解释：

1. **概述**：
   - 查询集是一个包含数据库中数据的集合，可以通过模型的管理器(objects)或相关对象的关联属性进行访问。
   - 查询集允许你在不触发实际数据库查询的情况下构建查询，并在需要时才执行实际的数据库操作。
   - 查询集是惰性的，这意味着它们不会立即执行查询，直到需要获取查询结果或对查询集进行迭代时才会执行。

2. **创建查询集**：
   - 你可以通过使用模型的管理器(objects)或相关对象的关联属性来创建查询集。
   - 例如，`MyModel.objects.all()`会返回一个包含模型`MyModel`中所有对象的查询集。

3. **过滤数据**：
   - 你可以使用`filter()`方法来过滤查询集中的数据，根据指定的条件筛选出满足条件的对象。
   - 例如，`MyModel.objects.filter(name='John')`会返回一个只包含`name`字段为'John'的对象的查询集。

4. **排序数据**：
   - 使用`order_by()`方法可以对查询集中的数据进行排序。
   - 例如，`MyModel.objects.order_by('name')`会按照`name`字段的值对查询集中的对象进行升序排序。

5. **限制数据**：
   - 你可以使用`limit()`、`offset()`和`slice()`等方法来限制查询集返回的结果数量。
   - 例如，`MyModel.objects.all()[:5]`会返回查询集中的前5个对象。

6. **聚合数据**：
   - 使用`aggregate()`方法可以对查询集中的数据进行聚合操作，如计数、求和、平均值等。
   - 例如，`MyModel.objects.aggregate(Count('id'))`会返回查询集中对象数量的统计信息。

7. **链式调用**：
   - 查询集方法通常支持链式调用，这意味着你可以在单个查询中连续调用多个方法。
   - 例如，`MyModel.objects.filter(category='A').order_by('-date')`会先对分类为'A'的对象进行过滤，然后按照日期降序排序。

8. **延迟执行**：
   - 查询集是惰性执行的，它们不会立即执行查询，而是在需要获取查询结果时才会执行实际的数据库操作。
   - 这种延迟执行的特性使得可以构建高效的查询链，只有在必要时才会触发数据库操作。

9. **查询集方法**：
   - Django提供了丰富的查询集方法，包括`filter()`、`exclude()`、`get()`、`order_by()`、`annotate()`等，用于执行不同类型的数据库操作。

总的来说，Django查询集提供了一个强大而灵活的接口来与数据库进行交互。通过使用查询集方法，你可以轻松地构建复杂的数据库查询，并在需要时执行实际的数据库操作，从而实现高效的数据检索和处理。

### 注意事项

还有注意是否使用了缓存：

```py
# 查询了三次：
emps = Employee.objects.all() # 懒查询
print(emps)
print(emps)
print(emps)

# 只查询了一次
emps = list(Employee.objects.all()) # 非查询，查询后将查询结果包在了列表当中
print(emps)
print(emps)
print(emps)
```



## 限制查询集（切片）

在Django中，你可以使用切片来限制查询集(QuerySet)返回的结果数量。切片允许你获取查询集中的一部分数据，可以用于分页或限制结果集大小。以下是如何在Django中使用切片来限制查询集的方法：

1. **使用索引切片**：
   你可以使用Python中的索引切片语法来限制查询集的结果数量。索引切片使用`[start:stop]`的形式，其中`start`是起始索引，`stop`是结束索引（不包括在结果中）。

   ```python
   # 获取前5个对象
   objects = MyModel.objects.all()[:5]
   
   # 获取第6到第10个对象
   objects = MyModel.objects.all()[5:10]
   ```

2. **获取前N个对象**：
   如果你只需要获取查询集中的前N个对象，你可以简单地通过索引切片获取。

   ```python
   # 获取前10个对象
   objects = MyModel.objects.all()[:10]
   ```

3. **跳过前N个对象**：
   除了限制返回结果的数量，你也可以使用切片来跳过查询集中的前N个对象。

   ```python
   # 跳过前5个对象，获取后面的对象
   objects = MyModel.objects.all()[5:]
   ```

4. **结合其他查询**：
   切片可以与其他查询方法链式调用，例如过滤、排序等。

   ```python
   # 获取前5个满足特定条件的对象
   objects = MyModel.objects.filter(category='A')[:5]
   
   # 获取按时间降序排序的前10个对象
   objects = MyModel.objects.order_by('-date')[:10]
   ```

通过使用切片，你可以轻松地限制查询集返回的结果数量，以满足不同的需求，如分页显示或者获取前N个对象。



## 结果集方法

### all()

**注意：`all()` 会返回结果集的所有对象，因此通常不建议使用，如果使用，通常也应配合切片使用**

在Django中，`all()` 方法用于获取查询集（QuerySet）中的所有对象。这个方法可以用于检索模型中的所有记录，无论是单个模型还是关联模型的集合。

基本用法如下：

```python
objects = MyModel.objects.all()
```

这将返回模型 `MyModel` 中所有对象的查询集。你可以通过迭代或其他查询集方法来处理这个查询集。

例如，你可以对结果集进行迭代：

```python
for obj in objects:
    print(obj)
```

或者你可以对结果集进行其他查询操作，比如过滤、排序等：

```python
# 获取所有名字以'A'开头的对象
objects_starting_with_a = MyModel.objects.all().filter(name__startswith='A')

# 对结果集按照日期降序排序
objects_ordered_by_date = MyModel.objects.all().order_by('-date')
```

总的来说，`all()` 方法用于检索模型中的所有对象，并返回一个查询集，你可以进一步对这个查询集进行处理和操作。



**`all()` 背后的SQL：**

`all()` 方法返回的是一个包含了所有数据库表中数据的查询集（QuerySet）。这个方法在内部并不会生成具体的 SQL 查询，因为它只是返回了一个未执行的查询集对象。但是，当你对这个查询集进行实际的操作（比如迭代、序列化等），Django 会自动执行相应的 SQL 查询以获取数据。

在执行 `all()` 方法时，Django 会生成类似于以下的 SQL 查询：

```sql
SELECT * FROM app_mymodel;
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中的所有数据，并将其返回给 Django 的查询集对象。

值得注意的是，`all()` 方法返回的查询集可能会包含大量数据，因此在使用时要注意性能问题。如果可能的话，最好根据需要进行过滤或者分页，以减少返回数据的数量，提高系统的性能。



### filter()

过滤，返回满足条件的数据

`filter()` 方法用于在查询集（QuerySet）中过滤出符合指定条件的对象。这个方法允许你根据指定的条件来筛选查询集中的数据，并返回一个新的查询集，其中包含满足条件的对象。

基本用法如下：

```python
filtered_objects = MyModel.objects.filter(field_name=value)
```

其中，`field_name` 是模型中的字段名，`value` 是要匹配的值。`filter()` 方法将返回一个新的查询集，其中包含模型 `MyModel` 中满足条件的对象。

你可以使用不同的条件来过滤数据，例如：

- 精确匹配：`filter(field_name=value)`
- 大小写敏感的精确匹配：`filter(field_name__exact=value)`
- 不区分大小写的匹配：`filter(field_name__iexact=value)`
- 包含：`filter(field_name__contains=value)`
- 区分大小写的包含：`filter(field_name__contains=value)`
- 不区分大小写的包含：`filter(field_name__icontains=value)`，**慎用！性能很差！**
- 不区分大小写匹配开头：`filter(field_name__istartswith=value)`
- 不区分大小写匹配结尾：`filter(field_name__iendswith=value)`
- 大于：`filter(field_name__gt=value)`
- 小于：`filter(field_name__lt=value)`
- 大于或等于：`filter(field_name__gte=value)`
- 小于或等于：`filter(field_name__lte=value)`
- 在列表中：`filter(field_name__in=[value1, value2, ...])`
- 不在列表中：`filter(field_name__notin=[value1, value2, ...])`
- 等于 NULL：`filter(field_name__isnull=True)`
- 不等于 NULL：`filter(field_name__isnull=False)`
- 外键过滤：`filter(foreign_key__field_name=value)`

例如，如果要过滤出名字为 "John" 的所有对象，可以这样做：

```python
john_objects = MyModel.objects.filter(name='John')
```

这将返回一个包含所有名字为 "John" 的对象的查询集。



**`filter()` 背后的SQL：**

`filter()` 方法用于根据指定的条件过滤数据库中的数据，并返回满足条件的对象的查询集（QuerySet）。当你调用 `filter()` 方法时，Django 会生成相应的 SQL 查询来执行过滤操作。

下面是一个示例模型和使用 `filter()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 filter() 方法进行过滤
objects = MyModel.objects.filter(category='A')
```

在这个示例中，`filter()` 方法用于根据 `category` 字段的值为 `'A'` 来过滤数据。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT * FROM app_mymodel WHERE category = 'A';
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中 `category` 字段值为 `'A'` 的所有数据，并将其返回给 Django 的查询集对象。

根据 `filter()` 方法的参数不同，生成的 SQL 查询会相应地变化，以满足你的过滤条件。



#### 示例

```py
result = mgr.filter(StuID=1)
print(*result)
'''
(0.000) SELECT `students`.`StuID`, `students`.`Name`, `students`.`Age`, `students`.`Gender`, `students`.`ClassID`, `students`.`TeacherID` FROM `students` WHERE `students`.`StuID` = 1; args=(1,); alias=default
<Employee: 1 Shi Zhongyu 22>
'''


result = mgr.filter(Age__gt=10, Age__lt=30)
print(*result)
"""
(0.000) SELECT `students`.`StuID`, `students`.`Name`, `students`.`Age`, `students`.`Gender`, `students`.`ClassID`, `students`.`TeacherID` FROM `students` WHERE (`students`.`Age` > 10 AND `students`.`Age` < 30); args=(10, 30); alias=default
"""
```



### exclude()

过滤，返回满足条件的数据

`exclude()` 方法与 `filter()` 方法相似，但是它用于排除满足指定条件的对象，而不是返回这些对象。这个方法允许你在查询集（QuerySet）中排除符合指定条件的对象，并返回一个新的查询集，其中包含不满足条件的对象。

基本用法如下：

```python
excluded_objects = MyModel.objects.exclude(field_name=value)
```

其中，`field_name` 是模型中的字段名，`value` 是要排除的值。`exclude()` 方法将返回一个新的查询集，其中包含模型 `MyModel` 中不满足条件的对象。

你可以使用不同的条件来排除数据，例如：

- 精确匹配：`exclude(field_name=value)`
- 大小写敏感的精确匹配：`exclude(field_name__exact=value)`
- 不区分大小写的匹配：`exclude(field_name__iexact=value)`
- 包含：`exclude(field_name__contains=value)`
- 不区分大小写的包含：`exclude(field_name__icontains=value)`
- 大于：`exclude(field_name__gt=value)`
- 小于：`exclude(field_name__lt=value)`
- 大于或等于：`exclude(field_name__gte=value)`
- 小于或等于：`exclude(field_name__lte=value)`
- 在列表中：`exclude(field_name__in=[value1, value2, ...])`
- 不在列表中：`exclude(field_name__notin=[value1, value2, ...])`
- 等于 NULL：`exclude(field_name__isnull=True)`
- 不等于 NULL：`exclude(field_name__isnull=False)`
- 外键过滤：`exclude(foreign_key__field_name=value)`

例如，如果要排除名字为 "John" 的所有对象，可以这样做：

```python
not_john_objects = MyModel.objects.exclude(name='John')
```

这将返回一个包含所有名字不为 "John" 的对象的查询集。



**`exclude()` 背后的SQL：**

`exclude()` 方法用于在数据库查询中排除满足指定条件的对象，并返回不满足条件的对象的查询集（QuerySet）。当你调用 `exclude()` 方法时，Django 会生成相应的 SQL 查询来执行排除操作。

下面是一个示例模型和使用 `exclude()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 exclude() 方法进行排除
objects = MyModel.objects.exclude(category='A')
```

在这个示例中，`exclude()` 方法用于排除 `category` 字段的值为 `'A'` 的数据。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT * FROM app_mymodel WHERE NOT (category = 'A');
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中 `category` 字段值不为 `'A'` 的所有数据，并将其返回给 Django 的查询集对象。

根据 `exclude()` 方法的参数不同，生成的 SQL 查询会相应地变化，以满足你的排除条件。



#### 示例

```py
result = mgr.exclude(StuID__in=[6, 7, 8])
print(result)
'''
<QuerySet [<Employee: 1 Shi Zhongyu 22>, <Employee: 2 Shi Potian 22>, <Employee: 3 Xie Yanke 53>, <Employee: 4 Ding Dian 32>, <Employee: 5 Yu Yutong 26>, <Employee: 9 Ren Yingying 20>, ...
'''
```



### order_by()

排序，注意参数是字符串

`order_by()` 方法用于对查询集（QuerySet）中的结果进行排序。它允许你根据指定的字段对查询集中的对象进行排序，并返回一个新的查询集，其中包含按照指定字段排序后的对象。

基本用法如下：

```python
ordered_objects = MyModel.objects.order_by(field_name)
```

其中，`field_name` 是你想要排序的字段名。`order_by()` 方法将返回一个新的查询集，其中包含模型 `MyModel` 中按照指定字段排序后的对象。

你可以对结果进行升序排序（默认）或者降序排序。例如，要对结果按照 `name` 字段进行升序排序，可以这样做：

```python
ordered_objects = MyModel.objects.order_by('name')
```

如果要对结果按照 `name` 字段进行降序排序，可以在字段名前加上减号（`-`）：

```python
ordered_objects = MyModel.objects.order_by('-name')
```

除了单个字段外，你还可以同时指定多个字段进行排序。例如，要先按照 `category` 字段升序排序，然后再按照 `name` 字段降序排序，可以这样做：

```python
ordered_objects = MyModel.objects.order_by('category', '-name')
```

这将返回一个按照 `category` 字段升序排序，然后按照 `name` 字段降序排序的查询集。

总的来说，`order_by()` 方法用于对查询集中的结果进行排序，并返回一个新的查询集。你可以根据需要指定单个字段或多个字段进行排序，并选择升序或降序排序。



**`order_by()` 背后的SQL：**

`order_by()` 方法用于对查询集中的结果进行排序，并返回按照指定条件排序后的对象的查询集（QuerySet）。当你调用 `order_by()` 方法时，Django 会生成相应的 SQL 查询来执行排序操作。

下面是一个示例模型和使用 `order_by()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 order_by() 方法进行排序
objects = MyModel.objects.order_by('price')
```

在这个示例中，`order_by()` 方法用于按照 `price` 字段的值对数据进行升序排序。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT * FROM app_mymodel ORDER BY price ASC;
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中的所有数据，并按照 `price` 字段的值进行升序排序，并将排序后的结果返回给 Django 的查询集对象。

根据 `order_by()` 方法的参数不同，生成的 SQL 查询会相应地变化，以满足你的排序需求。你可以指定单个字段或多个字段进行排序，并可以选择升序或降序排序。



### values()

返回一个对象字典的列表，列表的元素是字典，字典内是字段和值的键值对。

`values()` 方法用于将查询集（QuerySet）中的对象转换为字典形式的值，其中键是模型字段名，值是相应字段的值。这个方法允许你获取模型对象的特定字段值，而不是整个对象本身。

基本用法如下：

```python
values_list = MyModel.objects.values(field1, field2, ...)
```

其中，`field1`, `field2`, ... 是你想要包含在字典中的字段名。`values()` 方法将返回一个包含查询集中对象的字段值的字典列表。

你也可以将所有字段的值都包含在结果中，只需简单调用 `values()` 而不传递任何参数：

```python
values_list = MyModel.objects.values()
```

这将返回一个包含查询集中所有对象的所有字段值的字典列表。

除了获取字段值之外，`values()` 方法还允许你对结果进行过滤、排序等操作，就像在查询集上使用其他方法一样。例如，你可以先对结果进行过滤，然后再获取特定字段的值：

```python
values_list = MyModel.objects.filter(category='A').values('name', 'age')
```

这将返回一个包含分类为 'A' 的对象的名字和年龄字段值的字典列表。

总的来说，`values()` 方法用于将查询集中的对象转换为字典形式的值，并返回一个包含字段值的字典列表。这个方法对于获取特定字段的值，并将其用于进一步处理或序列化非常有用。



**`values()` 背后的SQL：**

`values()` 方法用于将查询集中的对象转换为字典形式的值，并返回一个包含字段值的字典列表。当你调用 `values()` 方法时，Django 会生成相应的 SQL 查询来执行这种转换操作。

下面是一个示例模型和使用 `values()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 values() 方法获取字段值
values_list = MyModel.objects.values('name', 'price')
```

在这个示例中，`values()` 方法用于获取模型 `MyModel` 中每个对象的 `name` 和 `price` 字段的值。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT name, price FROM app_mymodel;
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中的所有数据，并仅返回 `name` 和 `price` 字段的值，并将其转换为字典形式的列表返回给 Django 的查询集对象。

根据 `values()` 方法的参数不同，生成的 SQL 查询会相应地变化，以满足你的需要获取的字段值。



#### 示例：取列（投影）

**values() 放到后面是投影**

在 Django ORM 中，`values()` 方法用于指定查询结果所需返回的字段，即进行投影操作。当 `values()` 方法放在查询链的最后，它将选择指定的字段，并返回包含这些字段的字典列表。

下面是一个示例，演示了如何在查询中使用 `values()` 方法进行投影操作：

假设有一个模型 `Transaction`，其中包含了用户的交易记录，包括用户ID、交易金额等字段：

```python
from django.db import models

class Transaction(models.Model):
    user_id = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
```

现在，假设我们只需要获取每个用户的ID和总交易金额，并且不需要其他字段。我们可以将 `values()` 方法放在查询链的最后，以进行投影操作：

```python
from django.db.models import Sum

# 进行投影操作，只选择'user_id'和'total_amount'字段
queryset = Transaction.objects.annotate(
    total_amount=Sum('amount')
).values('user_id', 'total_amount')

# 打印结果
for data in queryset:
    print("User ID:", data['user_id'])
    print("Total Amount:", data['total_amount'])
    print()
```

在这个示例中，`values('user_id', 'total_amount')` 指定了只选择 `'user_id'` 和 `'total_amount'` 字段进行投影操作。因此，查询结果将只包含这两个字段，并返回一个字典列表，每个字典代表一个对象，包含所选择的字段及其对应的值。

通过这种方式，我们可以灵活地选择所需的字段进行查询，并得到相应的投影结果。

#### 示例：分组

**values() 放到前面是group by**

**注意：分组只能通过`annotate()` 方法，`aggregate()` 不可以实现分组。**

- 是的，对于在 Django ORM 中对查询集进行分组聚合操作，通常只能使用 `annotate()` 方法，而不能使用 `aggregate()` 方法。、

- `aggregate()` 方法用于对整个查询集进行聚合操作，返回一个包含聚合结果的字典。它不会按照某个字段的值进行分组，而是将所有对象的相关字段值汇总为一个值（如总和、平均值、最大值等）。因此，`aggregate()` 方法适用于获取整个数据集的总体聚合结果，而不是对数据进行分组聚合。

- 相反，`annotate()` 方法用于对每个对象添加聚合函数的计算结果作为新的字段，并返回包含这些新字段的查询集。这允许你在每个对象上访问聚合函数的计算结果，而不是仅仅获取一个总体的聚合结果。通过结合 `values()` 方法，`annotate()` 方法可以实现对数据进行分组，并对每个分组进行聚合计算。

  因此，通常情况下，如果需要对数据进行分组聚合操作，应该使用 `annotate()` 方法。

在 Django ORM 中，虽然 `values()` 方法通常用于指定查询结果所需返回的字段，即进行投影操作，但是当 `values()` 方法放在查询链的最前面时，它还可以与 `annotate()` 方法结合实现分组聚合操作，类似于 SQL 中的 GROUP BY 功能。

下面是一个示例，演示了如何在查询中使用 `values()` 方法结合 `annotate()` 方法实现分组聚合操作：

假设有一个模型 `Transaction`，其中包含了用户的交易记录，包括用户ID、交易金额等字段：

```python
from django.db import models

class Transaction(models.Model):
    user_id = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
```

现在，假设我们想要按照用户ID分组，并计算每个用户的总交易金额。我们可以将 `values('user_id')` 方法放在查询链的最前面，结合 `annotate()` 方法进行分组聚合操作：

```python
from django.db.models import Sum

# 按用户ID分组，并计算每个用户的总交易金额
queryset = Transaction.objects.values('user_id').annotate(
    total_amount=Sum('amount')
)

# 打印结果
for data in queryset:
    print("User ID:", data['user_id'])
    print("Total Amount:", data['total_amount'])
    print()
```

在这个示例中，`values('user_id')` 将指定了按照 `user_id` 字段进行分组，然后 `annotate()` 方法结合 `Sum()` 函数对每个分组进行聚合计算，计算了每个用户的总交易金额，并将计算结果添加到每个分组中。

通过这种方式，我们可以实现对数据进行分组聚合操作，类似于 SQL 中的 GROUP BY 功能。

##### 1

在Django中，`annotate()` 方法结合 `values()` 方法可以实现分组聚合操作。这样可以根据某个字段的值进行分组，并对每个分组进行聚合计算，然后将聚合结果作为新的字段添加到每个对象中。

下面是一个示例，演示了如何使用 `annotate()` 方法实现分组聚合：

假设有一个模型 `Transaction`，其中包含了用户的交易记录，包括用户ID、交易金额等字段：

```python
from django.db import models

class Transaction(models.Model):
    user_id = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
```

现在，假设我们想要按照用户ID分组，并计算每个用户的总交易金额和交易次数。

我们可以使用 `values()` 方法指定需要分组的字段（用户ID），然后结合 `annotate()` 方法进行聚合计算：

```python
from django.db.models import Sum, Count

# 按用户ID分组，并计算每个用户的总交易金额和交易次数
queryset = Transaction.objects.values('user_id').annotate(
    total_amount=Sum('amount'), 
    transaction_count=Count('id')
)

# 打印结果
for data in queryset:
    print("User ID:", data['user_id'])
    print("Total Amount:", data['total_amount'])
    print("Transaction Count:", data['transaction_count'])
    print()
```

在这个示例中，`values('user_id')` 指定了按照 `user_id` 字段进行分组，然后 `annotate()` 方法结合 `Sum()` 和 `Count()` 函数对每个分组进行聚合计算，分别计算了总交易金额和交易次数，并将计算结果作为新的字段添加到每个分组中。

这样，我们就可以得到每个用户的总交易金额和交易次数，并且这些信息会被添加到对应的对象中，以便后续使用。





## 返回单个值的方法

### get()

`get()` 方法用于从数据库中获取满足指定条件的单个对象。它期望找到且仅找到一个符合条件的对象，如果找到多个或者没有找到对象，它将抛出异常。

基本用法如下：

```python
obj = MyModel.objects.get(field_name=value)
```

其中，`field_name` 是模型中的字段名，`value` 是要匹配的值。`get()` 方法将返回一个满足条件的对象，如果没有找到满足条件的对象，或者找到多个满足条件的对象，它将抛出 `MyModel.DoesNotExist` 或 `MyModel.MultipleObjectsReturned` 异常。

`get()` 方法常用于获取单个对象，如通过主键获取对象，或者通过唯一字段获取对象。例如，如果你有一个模型 `Person`，其中有一个名为 `id` 的主键字段，你可以通过 `get()` 方法获取指定 `id` 的对象：

```python
person = Person.objects.get(id=1)
```

或者，如果你有一个模型 `Product`，其中有一个唯一的字段 `sku`，你可以通过 `get()` 方法获取指定 `sku` 的产品对象：

```python
product = Product.objects.get(sku='ABC123')
```

需要注意的是，如果使用 `get()` 方法时找不到对象或找到多个对象，它将引发异常。因此，在使用 `get()` 方法时，要确保条件能够精确地匹配到一个对象。



**`get()` 背后的SQL：**

`get()` 方法用于从数据库中获取满足指定条件的单个对象。当你调用 `get()` 方法时，Django 会生成相应的 SQL 查询来执行这个操作。

下面是一个示例模型和使用 `get()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 get() 方法获取单个对象
object = MyModel.objects.get(name='Product A')
```

在这个示例中，`get()` 方法用于获取模型 `MyModel` 中 `name` 字段值为 `'Product A'` 的单个对象。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT * FROM app_mymodel WHERE name = 'Product A';
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中 `name` 字段值为 `'Product A'` 的单个对象，并将其返回给 Django 的查询集对象。

需要注意的是，`get()` 方法期望找到且仅找到一个满足条件的对象。如果找到多个或者没有找到对象，它将抛出异常。因此，生成的 SQL 查询是基于唯一性条件进行过滤的。



### count()

`count()` 方法用于计算查询集（QuerySet）中对象的数量。它返回一个表示查询集中对象数量的整数。

基本用法如下：

```python
count = MyModel.objects.count()
```

这将返回模型 `MyModel` 中对象的数量。你也可以在查询集上应用过滤条件，然后计算满足条件的对象的数量：

```python
count = MyModel.objects.filter(field_name=value).count()
```

其中，`field_name` 是模型中的字段名，`value` 是要匹配的值。这将返回满足指定条件的对象的数量。

`count()` 方法通常用于确定查询集中的对象数量，以便在视图中进行分页或生成汇总信息时使用。它是一个高效的方法，因为它只返回对象的数量，而不会实际获取对象本身。



**`count()` 背后的SQL：**

`count()` 方法用于计算查询集（QuerySet）中对象的数量。当你调用 `count()` 方法时，Django 会生成相应的 SQL 查询来执行计数操作。

下面是一个示例模型和使用 `count()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 count() 方法计算对象数量
count = MyModel.objects.count()
```

在这个示例中，`count()` 方法用于计算模型 `MyModel` 中对象的数量。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT COUNT(*) FROM app_mymodel;
```

这条 SQL 查询会对指定模型 `MyModel` 对应的数据库表中的所有数据进行计数，并返回结果给 Django，即查询集对象的 `count` 方法。

值得注意的是，`count()` 方法执行的是数据库层面的计数操作，而不是在 Python 中对查询集对象进行遍历计数。因此，它是一个高效的方法，尤其适用于大型数据集。



### first()

`first()` 方法用于从查询集（QuerySet）中获取第一个对象。它返回满足查询条件的第一个对象，如果查询集为空，则返回 `None`。

基本用法如下：

```python
first_object = MyModel.objects.first()
```

这将返回模型 `MyModel` 中的第一个对象。如果查询集为空，则 `first_object` 将为 `None`。

`first()` 方法通常用于获取查询集中的第一个对象，而不需要关心查询集中是否有其他对象。它可以用于快速获取单个对象的信息，例如在模板中显示第一个对象的详情。



**`first()` 背后的SQL：**

`first()` 方法用于从查询集（QuerySet）中获取第一个对象。当你调用 `first()` 方法时，Django 会生成相应的 SQL 查询来执行获取操作。

下面是一个示例模型和使用 `first()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 first() 方法获取第一个对象
first_object = MyModel.objects.first()
```

在这个示例中，`first()` 方法用于获取模型 `MyModel` 中的第一个对象。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT * FROM app_mymodel LIMIT 1;
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中的第一个对象，并将其返回给 Django 的查询集对象。

`first()` 方法执行的是数据库层面的操作，它会返回查询集中的第一个对象，而不会获取整个查询集的数据。因此，它是一个高效的方法，尤其适用于大型数据集。



### last()

`last()` 方法用于从查询集（QuerySet）中获取最后一个对象。它返回满足查询条件的最后一个对象，如果查询集为空，则返回 `None`。

基本用法如下：

```python
last_object = MyModel.objects.last()
```

这将返回模型 `MyModel` 中的最后一个对象。如果查询集为空，则 `last_object` 将为 `None`。

`last()` 方法通常用于获取查询集中的最后一个对象，而不需要关心查询集中是否有其他对象。它可以用于快速获取单个对象的信息，例如在模板中显示最后一个对象的详情。



**`last()` 背后的SQL：**

`last()` 方法用于从查询集（QuerySet）中获取最后一个对象。当你调用 `last()` 方法时，Django 会生成相应的 SQL 查询来执行获取操作。

下面是一个示例模型和使用 `last()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 last() 方法获取最后一个对象
last_object = MyModel.objects.last()
```

在这个示例中，`last()` 方法用于获取模型 `MyModel` 中的最后一个对象。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT * FROM app_mymodel ORDER BY id DESC LIMIT 1;
```

这条 SQL 查询会选取指定模型 `MyModel` 对应的数据库表中的最后一个对象，并将其返回给 Django 的查询集对象。

需要注意的是，`last()` 方法需要对查询集进行排序操作，以便获取最后一个对象。默认情况下，它会按照模型的主键字段（通常是 `id`）进行降序排序。



### exists()

在Django中，`exists()` 方法用于检查查询集（QuerySet）是否包含至少一个对象。它返回一个布尔值，如果查询集中至少包含一个对象，则返回 `True`，否则返回 `False`。

基本用法如下：

```python
if MyModel.objects.filter(field_name=value).exists():
    # 查询集中至少有一个对象满足条件
    # 在这里执行相应的逻辑
else:
    # 查询集中没有对象满足条件
    # 在这里执行相应的逻辑
```

这个例子中，`exists()` 方法检查是否存在满足指定条件的对象。如果至少有一个对象满足条件，则执行 `if` 语句块中的逻辑，否则执行 `else` 语句块中的逻辑。

`exists()` 方法通常用于检查是否存在满足特定条件的对象，以便在后续代码中根据结果执行不同的逻辑。它是一个效率很高的方法，因为它只会检查是否存在对象，而不会实际获取对象的数据。

**`exists()` 背后的SQL：**

`exists()` 方法用于检查查询集（QuerySet）中是否存在至少一个对象。当你调用 `exists()` 方法时，Django 会生成相应的 SQL 查询来执行这个检查操作。

下面是一个示例模型和使用 `exists()` 方法的示例：

```python
class MyModel(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# 使用 exists() 方法检查是否存在对象
if MyModel.objects.filter(category='A').exists():
    # 执行逻辑...
```

在这个示例中，`exists()` 方法用于检查模型 `MyModel` 中是否存在 `category` 字段值为 `'A'` 的对象。当你执行这个查询时，Django 将生成以下类似的 SQL 查询：

```sql
SELECT EXISTS (SELECT 1 FROM app_mymodel WHERE category = 'A' LIMIT 1);
```

这条 SQL 查询会在数据库中检查是否存在满足条件的对象，并返回 `True` 或 `False`。

需要注意的是，`exists()` 方法是一个高效的方法，因为它只会检查是否存在对象，而不会实际获取对象的数据。这使得它成为在判断查询集是否为空时的常用方法。



## 与或非

```PY
# AND，同时满足两个条件
result = mgr.filter(StuID__gt=6, StuID__lt=8)
print(result) # <QuerySet [<Employee: 7 Xi Ren 19>]>

# OR，满足其中一个条件即可
result = mgr.filter(StuID__in=[1, 2, 3])
print(result) # <QuerySet [<Employee: 1 Shi Zhongyu 22>, <Employee: 2 Shi Potian 22>, <Employee: 3 Xie Yanke 53>]>

# NOT
由filter改用exclude是最简单的方式，也可使用Q对象中的~运算符取反
```



## Q 对象

在Django中，Q 对象是用于构建复杂查询条件的对象。它允许你使用逻辑运算符（AND、OR、NOT）来组合多个查询条件，以实现更灵活和复杂的查询。

基本上，Q 对象是通过在模型的查询中使用逻辑运算符来构建条件查询的工具。它允许你将多个查询条件组合在一起，以构建更复杂的查询语句。通常，Q 对象与 filter() 方法一起使用。

下面是一个简单的示例，演示了如何使用 Q 对象：

```python
from django.db.models import Q

# 构建查询条件
query = Q(name__icontains='john') | Q(age__gte=18)

# 使用 Q 对象进行过滤
results = MyModel.objects.filter(query)
```

在这个示例中，首先导入了 `Q` 对象，然后创建了两个查询条件：一个是检查 `name` 字段是否包含 "john"（不区分大小写），另一个是检查 `age` 字段是否大于或等于 18。然后，使用逻辑运算符 `|`（OR）将这两个条件组合在一起，形成一个复合条件。最后，将这个复合条件传递给 `filter()` 方法，以获取满足条件的对象。

Q 对象可以使用以下逻辑运算符进行组合：

- `&`（AND）：逻辑与运算符，用于组合多个条件，要求所有条件都满足。
- `|`（OR）：逻辑或运算符，用于组合多个条件，要求至少一个条件满足。
- `~`（NOT）：逻辑非运算符，用于对条件取反。

通过使用 Q 对象，你可以更加灵活地构建复杂的查询语句，以满足各种不同的查询需求。

下面是每个逻辑运算符的使用示例：

### 逻辑与运算符（&）示例：

```python
from django.db.models import Q

# 构建查询条件：同时满足两个条件
query = Q(name__icontains='john') & Q(age__gte=18)

# 使用 Q 对象进行过滤
results = MyModel.objects.filter(query)
```

在这个示例中，`query` 变量包含了两个条件：检查 `name` 字段是否包含 "john"（不区分大小写）并且 `age` 字段是否大于或等于 18。

### 逻辑或运算符（|）示例：

```python
from django.db.models import Q

# 构建查询条件：满足其中一个条件即可
query = Q(name__icontains='john') | Q(name__icontains='jane')

# 使用 Q 对象进行过滤
results = MyModel.objects.filter(query)
```

在这个示例中，`query` 变量包含了两个条件：检查 `name` 字段是否包含 "john"（不区分大小写）或者是否包含 "jane"（不区分大小写）。

### 逻辑非运算符（~）示例：

```python
from django.db.models import Q

# 构建查询条件：不满足指定条件
query = ~Q(name__icontains='john')

# 使用 Q 对象进行过滤
results = MyModel.objects.filter(query)
```

在这个示例中，`query` 变量包含了一个条件：检查 `name` 字段不包含 "john"（不区分大小写）的对象。





## 使用聚合函数

除使用`count()`方法外，还可使用`aggregate()`、`annotate()`函数来使用SQL中的其他聚合函数

### aggregate()

`aggregate()` 方法用于执行聚合函数，例如求和、计数、平均值等。它允许你对查询集中的对象进行聚合操作，并返回聚合结果（返回字典，默认key命名为`字段名__聚合函数名`）。

下面是一些常用的聚合函数以及它们的使用示例：

```python
from django.db.models import Sum, Count, Avg, Max, Min

# 求和，在这个示例中，`total_sales` 变量将包含 `sales_amount` 字段的总和。
total_sales = MyModel.objects.aggregate(total_sales=Sum('sales_amount'))

# 计数，在这个示例中，`total_customers` 变量将包含 `customer_id` 字段的数量。
total_customers = MyModel.objects.aggregate(total_customers=Count('customer_id'))

# 平均值，在这个示例中，`average_rating` 变量将包含 `rating` 字段的平均值。
average_rating = MyModel.objects.aggregate(average_rating=Avg('rating'))

# 最大值，在这个示例中，`highest_price` 变量将包含 `price` 字段的最大值。
highest_price = MyModel.objects.aggregate(highest_price=Max('price'))

# 最小值，在这个示例中，`lowest_price` 变量将包含 `price` 字段的最小值。
lowest_price = MyModel.objects.aggregate(lowest_price=Min('price'))
```

示例（不额外为返回值命名）：

```py
result = mgr.aggregate(Sum('Age'), Count('StuID'), Avg('Age'), Max('Age'), Min('Age'))
print(result) # {'Age__sum': 685, 'StuID__count': 25, 'Age__avg': 27.4, 'Age__max': 100, 'Age__min': 17}
'''
SELECT
	SUM( `students`.`Age` ) AS `Age__sum`,
	COUNT( `students`.`StuID` ) AS `StuID__count`,
	AVG( `students`.`Age` ) AS `Age__avg`,
	MAX( `students`.`Age` ) AS `Age__max`,
	MIN( `students`.`Age` ) AS `Age__min` 
FROM
	`students`;
'''
```



### annotate()（分组）

`annotate()` 方法用于对每个对象添加聚合函数的计算结果作为新的字段，并返回包含这些新字段的查询集（QuerySet）。这允许你在每个对象上访问聚合函数的计算结果，而不是仅仅获取一个总体的聚合结果。

返回查询集，元素是对象。用聚合函数，聚合函数会分组，**没有指定分组则使用pk分组，行行分组。（对主键分组一般无意义，因此通常需要用`values`来指定分组字段）**

下面是一些常用的聚合函数以及它们如何使用 `annotate()` 方法：

```python
from django.db.models import Sum, Count, Avg, Max, Min

# 求和并添加新字段，在这个示例中，`total_sales` 将会是每个对象的 `sales_amount` 字段的总和。
queryset = MyModel.objects.annotate(total_sales=Sum('sales_amount'))

# 计数并添加新字段，在这个示例中，`total_customers` 将会是每个对象的 `customer_id` 字段的数量。
queryset = MyModel.objects.annotate(total_customers=Count('customer_id'))

# 平均值并添加新字段，在这个示例中，`average_rating` 将会是每个对象的 `rating` 字段的平均值。
queryset = MyModel.objects.annotate(average_rating=Avg('rating'))

# 最大值并添加新字段，在这个示例中，`highest_price` 将会是每个对象的 `price` 字段的最大值。
queryset = MyModel.objects.annotate(highest_price=Max('price'))

# 最小值并添加新字段，在这个示例中，`lowest_price` 将会是每个对象的 `price` 字段的最小值。
queryset = MyModel.objects.annotate(lowest_price=Min('price'))
```

示例（不额外为返回值命名）：

```py
# 通过Gender分组，取各分组的Age总和
result = mgr.values('Gender').annotate(Sum('Age'))
print(result) # <QuerySet [{'Gender': 'M', 'Age__sum': 495}, {'Gender': 'F', 'Age__sum': 190}]>
'''
SELECT
	`students`.`Gender`,
	SUM( `students`.`Age` ) AS `Age__sum` 
FROM
	`students` 
GROUP BY
	`students`.`Gender` 
'''


# 后面的values表示仅取Gender列（实际上无意义，仅作为values的使用演示）
result = mgr.values('Gender').annotate(Sum('Age')).values('Gender')
print(result) # <QuerySet [{'Gender': 'M'}, {'Gender': 'F'}]>
'''
SELECT
`students`.`Gender` 
FROM
	`students` 
GROUP BY
	`students`.`Gender` 
ORDER BY
'''
```

除了使用 `print()` 函数打印结果外，`result` 变量作为一个查询集（QuerySet）还可以进行许多其他常见操作，包括：

```py
result = mgr.values('Gender').annotate(Sum('Age'))
print(result)
'''
<QuerySet [{'Gender': 'M', 'Age__sum': 495}, {'Gender': 'F', 'Age__sum': 190}]>
'''

# 迭代访问每个结果，使用 for 循环迭代访问查询集中的每个结果，并对结果进行处理。
for item in result:
    print(item)
    print(item['Gender'], item['Age__sum'])
    print('-' * 30)
'''
{'Gender': 'M', 'Age__sum': 495}
M 495
------------------------------
{'Gender': 'F', 'Age__sum': 190}
F 190
------------------------------
'''
```







### 两者区别

在 Django ORM 中，`aggregate()` 和 `annotate()` 方法都用于聚合数据，但它们之间有着不同的作用和行为：

1. **`aggregate()` 方法：**
   - 用于对整个查询集进行聚合操作，返回一个包含聚合结果的字典。
   - 返回的结果是一个单一的值或者值的集合，而不是与原始对象集相关联的新字段。
   - 聚合操作会将所有对象的相关字段值汇总为一个值（如总和、平均值、最大值等）。
   - 适合于需要获取整个数据集的总体聚合结果的情况。

```python
from django.db.models import Sum

total_sales = MyModel.objects.aggregate(total_sales=Sum('sales_amount'))
```

2. **`annotate()` 方法：**
   - 用于对每个对象添加聚合函数的计算结果作为新的字段，并返回包含这些新字段的查询集。
   - 返回的结果是一个包含了原始对象以及聚合结果字段的查询集。
   - 聚合操作会对每个对象进行计算，并将计算结果作为一个新字段添加到每个对象中。
   - 适合于需要在每个对象级别上访问聚合函数的计算结果的情况。

```python
from django.db.models import Count

queryset = MyModel.objects.annotate(total_customers=Count('customer_id'))
```

所以，`aggregate()` 方法用于整体汇总数据，而 `annotate()` 方法用于在每个对象级别上添加聚合计算结果。



## 一对多查询

在 Django 中，一对多关系是指一个模型与另一个模型之间的关系，其中一个模型中的一个对象可以关联另一个模型中的多个对象。通常在这种关系中，父模型（"一"）使用 `ForeignKey` 字段与子模型（"多"）关联。通过一对多关系，你可以方便地查询和操作相关联的对象。

### 创建一对多关系

首先，我们来创建一个简单的一对多关系。假设我们有一个模型 `Author` 表示作者，另一个模型 `Book` 表示书籍，并且一个作者可以有多本书。

```python
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)

class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
```

在这个例子中，`Book` 模型中有一个 `ForeignKey` 字段 `author`，它与 `Author` 模型关联，表示每本书都有一个作者。同时，`related_name='books'` 设置了一个反向关系名称，这样可以从 `Author` 对象访问关联的 `Book` 对象。

#### 示例

```py
from django.db import models


class Classes(models.Model):
    class Meta:
        db_table = 'classes'

    ClassID = models.AutoField(primary_key=True)
    Class = models.CharField(null=False, max_length=100)
    NumOfStu = models.SmallIntegerField(null=True)

    def __repr__(self):
        return "<Classes: {} {}>".format(
            self.ClassID, self.Class
        )

    __str__ = __repr__


class Students(models.Model):
    class Meta:
        db_table = 'students'

    StuID = models.AutoField(primary_key=True)
    Name = models.CharField(null=False, max_length=50)
    Age = models.IntegerField(null=False)
    Gender = models.SmallIntegerField(null=False)
    ClassID = models.ForeignKey(Classes, on_delete=models.CASCADE, db_column='ClassID')
    TeacherID = models.IntegerField(null=True)

    def __repr__(self):
        return "<Students: {} {} {} {}>".format(
            self.StuID,
            self.Name,
            self.Age,
            self.ClassID_id # 如果只写ClassID，返回的将是Classes的ClassID对象
        )

    __str__ = __repr__
from django.db import models


class Classes(models.Model):
    class Meta:
        db_table = 'classes'

    ClassID = models.AutoField(primary_key=True)
    Class = models.CharField(null=False, max_length=100)
    NumOfStu = models.SmallIntegerField(null=True)

    def __repr__(self):
        return "<Classes: {} {}>".format(
            self.ClassID, self.Class
        )

    __str__ = __repr__


class Students(models.Model):
    class Meta:
        db_table = 'students'

    StuID = models.AutoField(primary_key=True)
    Name = models.CharField(null=False, max_length=50)
    Age = models.IntegerField(null=False)
    Gender = models.SmallIntegerField(null=False)
    ClassID = models.ForeignKey(Classes, on_delete=models.CASCADE, db_column='ClassID')
    TeacherID = models.IntegerField(null=True)

    def __repr__(self):
        return "<Students: {} {} {} {}>".format(
            self.StuID,
            self.Name,
            self.Age,
            self.ClassID_id # 如果只写ClassID，返回的将是Classes的ClassID对象
        )

    __str__ = __repr__
```

**`ClassID = models.ForeignKey(Classes, on_delete=models.CASCADE, db_column='ClassID') `**

- 该外键默认引用Classes的主键；
- `db_column` 用于指定表中字段的实际名称，如不加该选项，则默认为`ClassID_id`（在实际字段名后加`__id`）；





### 查询一对多关系

- **从父模型查询子模型：**
  通过 `related_name`（在这个例子中为 `books`），你可以从 `Author` 查询其关联的 `Book` 对象。

```python
author = Author.objects.get(name='J.K. Rowling')
books = author.books.all()  # 获取该作者的所有书籍
```

- **从子模型查询父模型：**
  你可以通过 `ForeignKey` 字段来查询关联的父模型。

```python
book = Book.objects.get(title='Harry Potter and the Philosopher\'s Stone')
author = book.author  # 获取该书籍的作者
```

- **过滤子模型：**
  可以使用 `filter()` 方法来根据某个条件过滤关联的子模型。

```python
authors_with_most_books = Author.objects.annotate(book_count=Count('books')).filter(book_count__gt=5)
```



#### 示例

##### 查询ClassID为1的学生信息

要查询 `ClassID` 为 1 的学生信息，你可以使用 Django ORM 的 `filter()` 方法来筛选符合条件的学生对象。`filter()` 方法用于根据指定条件筛选查询集。在这个例子中，你可以通过 `Students` 模型中的 `ClassID` 字段过滤学生信息。

这里是查询 `ClassID` 为 1 的学生信息的示例代码：

```python
# 获取所有 `ClassID` 为 1 的学生信息
students_in_class_1 = Students.objects.filter(ClassID=1)

# 输出这些学生的信息
for student in students_in_class_1:
    print(student)  # 或者使用其他方式查看学生信息
```

在这个例子中，我们使用 `filter(ClassID=1)` 来获取 `ClassID` 为 1 的所有学生。然后，我们可以迭代结果并输出每个学生的信息。

###### 其他查询方式

此外，你还可以使用其他查询方法来检索相关数据：

- **通过 ForeignKey 反向关系查询**：
  如果有反向关系（例如 `related_name`），可以从 `Classes` 模型中访问相关学生：

  ```python
  # 获取 `ClassID` 为 1 的班级
  class_1 = Classes.objects.get(ClassID=1)
  
  # 通过反向关系访问相关的学生
  students_in_class_1 = class_1.students_set.all()  # 使用默认 `related_name`
  ```





- **过滤多个条件**：
  你还可以在过滤中使用多个条件来进一步筛选结果：

  ```python
  # 获取 `ClassID` 为 1 且年龄大于 18 的学生
  students_in_class_1 = Students.objects.filter(ClassID=1, Age__gt=18)
  ```

这些方法展示了如何在 Django ORM 中查询和过滤一对多关系中的数据，并根据需要进一步筛选结果。



### 反向关系查询

在 Django 中，`ForeignKey` 字段用于创建一对多关系。它表示模型中的一个对象可以关联另一个模型中的多个对象。`ForeignKey` 字段本身位于 "多" 的那一端，而 "一" 的那一端是关联的模型。

"一" 端的模型可以通过反向关系访问与其关联的 "多" 端对象。在 Django 中，这种反向关系的名称可以通过 `related_name` 指定。如果没有指定 `related_name`，Django 将使用默认名称（`模型名小写 + _set`）。

以下是如何使用反向关系查询的详细解释和示例：

#### 定义模型和关系

假设我们有两个模型：`Classes` 和 `Students`。其中，`Students` 与 `Classes` 有一对多关系，一个班级（`Classes`）可以有多个学生（`Students`）。

```python
from django.db import models

# 定义班级模型
class Classes(models.Model):
    ClassID = models.AutoField(primary_key=True)
    ClassName = models.CharField(max_length=100)

# 定义学生模型
class Students(models.Model):
    StuID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=50)
    ClassID = models.ForeignKey(Classes, on_delete=models.CASCADE, related_name='students')  # 使用 related_name
```

在这个例子中，`Students` 模型中的 `ClassID` 字段是一个 `ForeignKey`，关联到 `Classes` 模型。我们设置 `related_name='students'` 来指定反向关系的名称，这样从 `Classes` 模型可以方便地访问其关联的学生。

#### 使用反向关系查询

有了 `related_name`，我们可以从 `Classes` 模型访问与其关联的学生列表：

```python
# 获取班级 ID 为 1 的班级
class_1 = Classes.objects.get(ClassID=1)

# 使用反向关系访问这个班级的所有学生
students_in_class_1 = class_1.students.all()  # 使用 related_name 'students'

# 打印学生信息
for student in students_in_class_1:
    print(student.Name)
```

在这个例子中，通过 `class_1.students.all()`，我们访问了这个班级关联的所有学生。因为使用了 `related_name='students'`，所以反向关系的名称为 `students`。

如果没有指定 `related_name`，Django 会使用默认名称 `students_set`。因此，在这种情况下，访问关联的学生将是 `class_1.students_set.all()`。

#### 过滤反向关系中的对象

你还可以使用 `filter()` 方法在反向关系上进行过滤，以获得特定的结果：

```python
# 获取班级 ID 为 1 中年龄大于 18 的学生
students_above_18 = class_1.students.filter(Age__gt=18)

for student in students_above_18:
    print(student.Name)
```

通过这种方式，你可以方便地使用反向关系来查询和操作一对多关系中的相关对象。



### 级联删除

当父模型中的对象被删除时，Django 允许你指定关联的子模型的行为。`on_delete` 参数控制这种行为：

- `CASCADE`: 如果父模型对象被删除，相关的子模型对象也会被删除。
- `SET_NULL`: 如果父模型对象被删除，相关的子模型对象的 `ForeignKey` 字段将被设置为 `None`。
- `PROTECT`: 如果父模型对象被删除，Django 将阻止删除操作。
- 其他选项如 `SET_DEFAULT` 和 `DO_NOTHING`。

例如，使用 `on_delete=models.CASCADE` 意味着当 `Author` 对象被删除时，关联的 `Book` 对象也会被删除。

通过以上这些方法，你可以深入理解 Django 中的一对多关系及其查询方式，并根据需求来使用它们。





## distinct() 与子查询

在 Django ORM 中，`distinct()` 和子查询是用于处理复杂查询的强大工具。下面将分别详细解释这两个概念。

### `distinct()`

`distinct()` 方法用于从查询集中消除重复的结果。它确保返回的结果集中的每个记录都是唯一的。

#### 基本使用

在最简单的情况下，`distinct()` 可以确保查询结果中没有重复项。例如，假设有一个模型 `Transaction`，其中包含了重复的客户 ID：

```python
from django.db import models

class Transaction(models.Model):
    customer_id = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
```

为了获取唯一的客户 ID，可以使用 `distinct()`：

```python
unique_customers = Transaction.objects.values('customer_id').distinct()
```

#### 结合 `order_by()`

当 `distinct()` 与 `order_by()` 结合使用时，结果的唯一性取决于 `order_by()` 中的字段。如果 `order_by()` 包含不同的字段组合，可能会影响结果的唯一性。

```python
unique_customers = Transaction.objects.values('customer_id', 'amount').distinct()
```

这个例子会确保 `(customer_id, amount)` 组合是唯一的，而不是仅 `customer_id`。



### 子查询

子查询是一种在查询中嵌套另一查询的技术，用于解决复杂的查询需求。在 Django 中，子查询通常通过 `Subquery` 来实现。

#### 子查询示例

假设有一个模型 `Order` 和另一个模型 `OrderItem`。我们想要找到每个订单的最新订单项。可以使用子查询来实现。

```python
from django.db import models
from django.db.models import Subquery, OuterRef

class Order(models.Model):
    order_date = models.DateTimeField()

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    item_name = models.CharField(max_length=100)
    created_at = models.DateTimeField()
```

为了获取每个订单的最新订单项，我们可以使用子查询来查找 `OrderItem` 的最大日期，然后结合 `OuterRef` 来关联外部查询。

```python
latest_order_item_subquery = OrderItem.objects.filter(
    order=OuterRef('pk')
).order_by('-created_at').values('item_name')[:1]

orders_with_latest_item = Order.objects.annotate(
    latest_item=Subquery(latest_order_item_subquery)
)
```

在这个例子中，`OuterRef` 指代外部查询的 `pk` 字段，`Subquery` 则表示子查询，`order_by('-created_at')[:1]` 表示选择最新的订单项。

### 结合使用 `distinct()` 和子查询

在某些情况下，可能需要结合 `distinct()` 和子查询。例如，要找到每个客户的最后一笔交易：

```python
latest_transaction_subquery = Transaction.objects.filter(
    customer_id=OuterRef('customer_id')
).order_by('-date').values('amount')[:1]

unique_customers_with_latest_transaction = Transaction.objects.values(
    'customer_id'
).annotate(
    latest_transaction=Subquery(latest_transaction_subquery)
).distinct()
```

这个示例首先使用 `distinct()` 确保结果中没有重复的客户，然后使用子查询查找每个客户的最新交易。

通过以上详细解释和示例，你可以理解 Django 中 `distinct()` 的应用以及子查询的用法，并且知道如何结合使用这两者来解决复杂的查询需求。



## raw()

Django 的 `raw()` 方法允许你执行原始 SQL 查询并将结果映射到 Django 模型对象。它是 Django ORM 提供的与数据库直接交互的方式之一，适用于在复杂查询无法通过 Django ORM 实现时直接使用 SQL 查询。

### 使用 `raw()` 执行 SQL 查询

`raw()` 方法可以在 `QuerySet` 上调用，并接受一个 SQL 查询字符串。你可以将 SQL 查询中的参数替换为 Django 中的占位符，如 `%s`。这在避免 SQL 注入时非常有用。

以下是一些示例，展示了 `raw()` 的使用：

#### 基本用法

```python
from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

# 使用原始 SQL 查询
employees_in_sales = Employee.objects.raw("SELECT * FROM myapp_employee WHERE department = 'Sales'")
```

在这个示例中，`raw()` 接受 SQL 查询字符串，并返回一个查询集。尽管它返回的是查询集，但由于是使用原始 SQL 查询，不能像通常的 Django ORM 查询集那样使用。

#### 使用占位符避免 SQL 注入

为了避免 SQL 注入，使用 `raw()` 时最好通过参数化查询或占位符传递参数，而不是直接将值拼接到 SQL 字符串中。

```python
department_name = 'Sales'
employees_in_sales = Employee.objects.raw("SELECT * FROM myapp_employee WHERE department = %s", [department_name])
```

#### 复杂查询

如果有非常复杂的 SQL 查询，可能包含子查询、联合、分组等，`raw()` 是一个强有力的工具。下面是一个例子，展示了使用原始 SQL 查询实现更复杂的操作。

```python
# 获取每个部门员工的平均工资，并显示部门名称和平均工资
average_salary_per_dept = Employee.objects.raw(
    """
    SELECT department, AVG(salary) as avg_salary
    FROM myapp_employee
    GROUP BY department
    """
)
```

#### 注意事项

- **结果映射**：`raw()` 查询的结果需要与模型结构匹配。即使查询返回额外的字段，它们也会被忽略。缺少必需字段可能导致错误。
- **无法链式调用**：使用 `raw()` 的查询不能与其他 Django ORM 方法链式调用，如 `filter()` 或 `order_by()`。
- **事务处理**：确保在使用 `raw()` 时考虑事务处理，特别是在执行可能影响数据的 SQL 查询时。



### 何时使用 `raw()`

在以下情况下，`raw()` 是一个有用的工具：

- 当查询过于复杂，无法通过 Django ORM 表达。
- 当查询需要高度定制，或者需要利用数据库的特定功能。
- 当在现有数据库上使用 Django，而这些数据库可能包含非标准结构。

通过这些信息，你应该对 Django 中 `raw()` 方法的用法和适用场景有更好的理解。记住，在执行原始 SQL 查询时，要小心处理潜在的 SQL 注入问题，并确保查询的结果与模型结构相匹配。