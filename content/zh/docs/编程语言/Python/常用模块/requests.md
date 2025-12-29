---
title: "requests"
---

## requests 模块概述

`requests` 是一个Python HTTP库，用于向网络服务器发起请求和获取响应。它提供了简洁且易于使用的API，使得发送HTTP请求变得非常简单。

如果你还没有安装 `requests` 模块，可以使用以下命令安装：

```
pip install requests
```

https://github.com/psf/requests/tree/main

https://requests.readthedocs.io/en/latest/



## requests 常用函数

`requests` 模块提供了一系列常用的函数，用于发送不同类型的HTTP请求以及处理响应。以下是其中一些常用的函数：

1. **`requests.get(url, params=None, **kwargs)`**：
   发起一个GET请求，并返回一个 `Response` 对象。可以通过 `params` 参数传递查询字符串参数。

2. **`requests.post(url, data=None, json=None, **kwargs)`**：
   发起一个POST请求，并返回一个 `Response` 对象。可以通过 `data` 参数传递表单数据，或使用 `json` 参数传递JSON数据。

3. **`requests.put(url, data=None, **kwargs)`**：
   发起一个PUT请求，并返回一个 `Response` 对象。

4. **`requests.delete(url, **kwargs)`**：
   发起一个DELETE请求，并返回一个 `Response` 对象。

5. **`requests.head(url, **kwargs)`**：
   发起一个HEAD请求，并返回一个 `Response` 对象，通常用于检查资源的头部信息而不获取其内容。

6. **`requests.options(url, **kwargs)`**：
   发起一个OPTIONS请求，并返回一个 `Response` 对象，用于获取目标URL支持的HTTP方法。

7. **`requests.request(method, url, **kwargs)`**：
   发起一个自定义类型的HTTP请求，并返回一个 `Response` 对象。`method` 参数指定请求方法，如 'GET'、'POST' 等。

8. **`response.text`**：
   获取响应内容的文本形式。

9. **`response.json()`**：
   将响应内容解析为JSON格式。

10. **`response.status_code`**：
    获取响应的状态码。

11. **`response.headers`**：
    获取响应头部信息。

12. **`response.raise_for_status()`**：
    检查响应状态码，如果不是200，则抛出异常。

13. **`response.content`**：
    获取响应内容的二进制形式。

14. **`response.cookies`**：
    获取响应中的Cookies信息。

这些是 `requests` 模块中最常用的一些函数和属性。它们提供了发送不同类型HTTP请求以及处理响应的便利方法。

## post()

`requests.post()` 是 `requests` 模块中用于发起 POST 请求的函数。它允许向指定的 URL 发送数据，并返回一个 `Response` 对象，其中包含服务器响应的内容。

```py
requests.post(url, data=None, json=None, **kwargs)
```

- **`url`** *(必需)*:
   - 字符串，表示请求的目标 URL。

- **`data`**:
   - 字典、字节序列或文件对象。
   - 用于发送作为表单数据的内容，会自动编码为表单形式。
   - 若设置了`json`参数，`data`将不会起作用。

- **`json`**:
   - 字典，用于发送JSON数据。
   - 当传递JSON数据时，会自动设置请求头部为`application/json`。

- **`headers`**:
   - 字典，用于设置请求头部信息。

- **`params`**:
   - 字典或字符串序列，用于向URL中添加查询字符串参数。

- **`auth`**:
   - 元组，用于HTTP身份验证。例如，`auth=('user', 'pass')`。

- **`cookies`**:
   - 字典或`CookieJar`对象，用于发送请求时携带的Cookies信息。

- **`files`**:
   - 字典，用于发送文件，类似于`{'file': ('filename', open('file.txt', 'rb'), 'text/plain')}`。

- **`timeout`**:
   - 整数或浮点数，指定请求超时时间（以秒为单位）。

- **`allow_redirects`**:
  - 布尔值，默认为`True`。控制重定向行为。

- **`proxies`**:
  - 字典，用于设置代理服务器。

- **`verify`**:
  - 布尔值或字符串，控制SSL证书验证行为。
  - `True`表示验证证书，`False`表示不验证。
  - 也可以传递证书路径。

- **`stream`**:
  - 布尔值，控制响应体的获取方式。
  - 若为`True`，则响应内容不会立即下载，而是在需要时按需获取。

- **`cert`**:
  - 字符串或元组，用于设置客户端证书。

### 发送字典数据

```python
import requests

## 定义要发送的数据
data = {'key1': 'value1', 'key2': 'value2'}

## 发起POST请求
response = requests.post('https://api.example.com/post', data=data)

## 获取响应内容
print(response.text)
```

### 发送JSON数据

```python
import requests

## 定义要发送的JSON数据
payload = {'key1': 'value1', 'key2': 'value2'}

## 发起POST请求，将数据编码为JSON格式
response = requests.post('https://api.example.com/post', json=payload)

## 获取响应内容
print(response.text)
```

### 自定义请求头部信息

```python
import requests

## 自定义请求头部
headers = {'Content-Type': 'application/json'}

## 定义要发送的JSON数据
payload = {'key1': 'value1', 'key2': 'value2'}

## 发起POST请求，将数据编码为JSON格式，并自定义请求头部信息
response = requests.post('https://api.example.com/post', json=payload, headers=headers)

## 获取响应内容
print(response.text)
```

### 处理异常

```python
import requests
from requests.exceptions import RequestException

try:
    # 定义要发送的数据
    data = {'key1': 'value1', 'key2': 'value2'}

    # 发起POST请求
    response = requests.post('https://api.example.com/post', data=data)
    
    # 检查响应状态码
    response.raise_for_status()
    
    # 获取响应内容
    print(response.text)
except RequestException as e:
    print("Request failed:", e)
```

### 返回值

`requests.post()` 方法的返回值是一个 `Response` 对象，它代表了服务器对请求的响应。这个 `Response` 对象包含了许多有用的信息，可以访问到响应的内容、状态码、响应头部信息等。

你可以使用这个 `Response` 对象来获取服务器返回的数据或者检查请求的状态。一般来说，你可以使用以下属性和方法来处理 `Response` 对象：

- **`response.text`**：获取响应内容的文本形式。
- **`response.json()`**：将响应内容解析为 JSON 格式。
- **`response.status_code`**：获取响应的状态码。
- **`response.headers`**：获取响应头部信息。
- **`response.content`**：获取响应内容的二进制形式。
- **`response.cookies`**：获取响应中的 Cookies 信息。
- **`response.raise_for_status()`**：检查响应状态码，如果不是 2xx，则抛出异常。

你可以根据需要使用这些属性和方法来处理 `requests.post()` 返回的 `Response` 对象，从而获取服务器响应的相关信息或对响应进行处理。



## requests 常用类

在`requests`模块中，最常用的类是：

1. **`requests.Response`**：
   这个类代表了HTTP请求的响应。通过发送请求后返回的对象，可以访问响应的内容、状态码、头部信息等。例如：`response = requests.get('https://example.com')` 中的 `response` 对象就是 `Response` 类的实例。

2. **`requests.Request`**：
   这个类代表了一个HTTP请求。它可以用来构建一个HTTP请求，设置请求方法、头部信息、URL、数据等。然后可以使用`Session`来发送这个请求。一般情况下，直接使用 `get()`、`post()` 等方法发送请求更为常见。

3. **`requests.Session`**：
   `Session` 类可以在多个请求之间保持一些参数，比如Cookies、头部信息等。通过创建一个 `Session` 对象，可以在一个实例中保持多个请求之间的状态，例如在多次请求之间保持Cookies信息，提高效率。

4. **`requests.HTTPError`**：
   这是一个异常类，继承自Python的`HTTPError`类。如果HTTP请求返回的状态码不是成功状态码（2xx），则可能会引发此异常。可以通过`response.raise_for_status()`方法来检查并抛出`HTTPError`异常。

这些类是在 `requests` 模块中使用最频繁的。`Response` 和 `Request` 类是用于处理请求和响应的主要接口，而 `Session` 则用于在多个请求之间共享状态信息。