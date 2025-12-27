---
title: "shutil"
---

## shutil

`shutil` 模块是 Python 的标准库之一，用于执行各种文件操作。它构建在 `os` 模块之上，提供了更高级的文件和目录操作功能，包括文件的复制、移动、删除、压缩等。以下是一些常用的 `shutil` 模块函数和方法：

复制文件或目录：

```python
import shutil
shutil.copy('/path/to/source', '/path/to/destination')
```

递归复制目录及其内容：

```python
shutil.copytree('/path/to/source', '/path/to/destination')
```

移动文件或目录：

```python
shutil.move('/path/to/source', '/path/to/destination')
```

删除文件或目录（与 `os.remove()` 和 `os.rmdir()` 不同，`shutil.rmtree()` 可以删除非空目录）：

```python
shutil.rmtree('/path/to/directory')
```

压缩文件或目录为 ZIP 文件：

```python
shutil.make_archive('/path/to/archive', 'zip', '/path/to/source')
```

解压 ZIP 文件：

```python
shutil.unpack_archive('/path/to/archive.zip', '/path/to/destination')
```

复制文件的权限和元数据：

```python
shutil.copy2('/path/to/source', '/path/to/destination')
```

获取文件或目录的大小：

```python
total_size = shutil.disk_usage('/path/to/directory').total
```

检查文件是否存在并且可读：

```python
exists_and_readable = shutil.os.path.isfile('/path/to/file') and os.access('/path/to/file', os.R_OK)
```

获取文件的最后访问和修改时间：

```python
atime, mtime = shutil.os.path.getatime('/path/to/file'), shutil.os.path.getmtime('/path/to/file')
```

拷贝文件权限和状态信息（包括所有者和组）：

```python
shutil.copymode('/path/to/source', '/path/to/destination')
```

`shutil` 模块提供了许多功能强大的文件和目录操作工具，非常适合在 Python 中处理文件系统任务。在使用 `shutil` 模块时，要小心确保你有适当的权限，并注意对文件和目录的操作可能会对系统造成影响。

