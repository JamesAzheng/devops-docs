---
title: "pickle"
---

## pickle 概述

`pickle` 是 Python 中的一个模块，用于序列化和反序列化 Python 对象。它允许你将 Python 对象保存到磁盘或通过网络传输，然后在需要时将其还原为原始对象。

以下是关于 `pickle` 模块的一些重要信息：

1. **序列化**：使用 `pickle`，你可以将 Python 对象转换为二进制数据流，这个过程称为序列化。这允许你将对象保存到文件中或通过网络发送给其他计算机。

2. **反序列化**：反序列化是将二进制数据流还原为原始的 Python 对象。这使你能够重新获取已序列化的对象，并在你的程序中使用它们。

3. **用法**：使用 `pickle` 很简单。你可以使用 `pickle.dump()` 将对象序列化并保存到文件中，然后使用 `pickle.load()` 从文件中读取并反序列化对象。以下是一个示例：

   ```python
   import pickle
   
   # 序列化对象并保存到文件
   data = {'name': 'Alice', 'age': 30}
   with open('data.pkl', 'wb') as file:
       pickle.dump(data, file)
   
   # 从文件中读取并反序列化对象
   with open('data.pkl', 'rb') as file:
       loaded_data = pickle.load(file)
   
   print(loaded_data)  # 输出: {'name': 'Alice', 'age': 30}
   ```

4. **安全性注意事项**：请注意，由于 `pickle` 可以序列化几乎任何 Python 对象，因此要小心从不受信任的来源加载 `pickle` 数据，因为它可能包含恶意代码。不要在不受信任的环境中使用 `pickle`。

5. **跨 Python 版本问题**：`pickle` 的序列化格式与 Python 版本相关，因此在不同版本的 Python 之间可能存在兼容性问题。如果需要跨版本保存和加载数据，可以考虑使用其他序列化格式，如 JSON。

总之，`pickle` 是 Python 中用于序列化和反序列化对象的强大工具，但需要小心使用以确保数据的安全性和兼容性。



`pickle` 模块提供了四个主要的函数 `dump`、`load`、`dumps`、`loads`，用于序列化和反序列化 Python 对象：

这些函数使你能够方便地在 Python 中进行对象的序列化和反序列化操作。需要注意的是，`pickle` 通常用于在 Python 环境中保存和加载对象，因此在与其他编程语言交互或在不受信任的环境中使用时需要格外小心，以防止安全风险。



## dump & load

`pickle.dump(obj, file, protocol=None, *, fix_imports=True)`

- `dump` 函数用于将 Python 对象 `obj` 序列化并写入文件 `file` 中。
- `protocol` 参数指定了使用的协议版本，如果不提供，默认使用最高版本的协议。
- `fix_imports` 参数在 Python 2 和 Python 3 之间的对象引用转换时使用，通常可以保持默认值 `True`。

`pickle.load(file, *, fix_imports=True, encoding="ASCII", errors="strict")`

- `load` 函数用于从文件 `file` 中读取并反序列化数据，并返回原始 Python 对象。
- `fix_imports` 参数用于在 Python 2 和 Python 3 之间的对象引用转换时使用，默认为 `True`。
- `encoding` 和 `errors` 参数用于指定文件的编码和错误处理方式，通常可以保持默认值。

## 范例

下面是使用 `pickle` 模块的 `dump` 和 `load` 函数的范例，展示了如何将 Python 对象序列化到文件中并从文件中反序列化对象。

```python
import pickle

## 示例对象
data = {
    "name": "Alice",
    "age": 30,
    "isStudent": False,
    "languages": ["Python", "JavaScript"]
}

## 使用 dump 函数将对象序列化并保存到文件
with open('data.pkl', 'wb') as file:
    pickle.dump(data, file)

## 使用 load 函数从文件中读取并反序列化对象
with open('data.pkl', 'rb') as file:
    loaded_data = pickle.load(file)

## 打印反序列化后的对象
print(loaded_data)
```

这个示例包括以下步骤：

1. 创建一个包含示例数据的 Python 字典 `data`。

2. 使用 `open` 函数以二进制写入模式（'wb'）打开一个文件 `data.pkl`，然后使用 `pickle.dump()` 将 `data` 序列化并保存到文件中。

3. 使用 `open` 函数以二进制读取模式（'rb'）再次打开 `data.pkl` 文件，然后使用 `pickle.load()` 从文件中读取数据并反序列化为 Python 对象，并将其存储在 `loaded_data` 变量中。

4. 最后，我们打印 `loaded_data`，它应该与原始 `data` 对象相同。

这样，你就完成了对象的序列化和反序列化过程。你可以使用类似的方法来保存和加载任何支持 `pickle` 的 Python 对象。请注意，由于 `pickle` 数据格式与 Python 版本相关，当你在不同版本的 Python 之间传递数据时，需要小心版本兼容性问题。



## dumps & loads

`pickle.dumps(obj, protocol=None, *, fix_imports=True)`

- `dumps` 函数将 Python 对象 `obj` 序列化为一个包含序列化数据的字节串，并返回该字节串。
- `protocol` 参数指定了使用的协议版本，如果不提供，默认使用最高版本的协议。
- `fix_imports` 参数在 Python 2 和 Python 3 之间的对象引用转换时使用，通常可以保持默认值 `True`。

`pickle.loads(bytes_object, *, fix_imports=True, encoding="ASCII", errors="strict")`

- `loads` 函数用于从包含序列化数据的字节串中反序列化并返回原始 Python 对象。
- `fix_imports` 参数用于在 Python 2 和 Python 3 之间的对象引用转换时使用，默认为 `True`。
- `encoding` 和 `errors` 参数用于指定字节串的编码和错误处理方式，通常可以保持默认值。

## 范例

以下是使用 `pickle` 模块的 `dumps` 和 `loads` 函数的范例，展示了如何将 Python 对象序列化为字节串并从字节串中反序列化对象：

```python
import pickle

## 示例对象
data = {
    "name": "Alice",
    "age": 30,
    "isStudent": False,
    "languages": ["Python", "JavaScript"]
}

## 使用 dumps 函数将对象序列化为字节串
serialized_data = pickle.dumps(data)

## 使用 loads 函数从字节串中反序列化对象
loaded_data = pickle.loads(serialized_data)

## 打印反序列化后的对象
print(loaded_data)
```

这个示例包括以下步骤：

1. 创建一个包含示例数据的 Python 字典 `data`。

2. 使用 `pickle.dumps()` 将 `data` 对象序列化为一个字节串 `serialized_data`。

3. 使用 `pickle.loads()` 从字节串 `serialized_data` 中读取数据并反序列化为 Python 对象，并将其存储在 `loaded_data` 变量中。

4. 最后，我们打印 `loaded_data`，它应该与原始 `data` 对象相同。

这样，你就完成了对象的序列化和反序列化过程，但这次是在内存中进行的，而不是在文件中。你可以使用 `dumps` 和 `loads` 函数来保存和加载任何支持 `pickle` 的 Python 对象，并且不需要将数据写入文件。同样要注意版本兼容性问题，尤其是在不同 Python 版本之间。

