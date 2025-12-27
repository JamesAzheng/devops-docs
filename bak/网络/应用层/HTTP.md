# HTTP 协议概述

HTTP（Hypertext Transfer Protocol，超文本传输协议）是用于在互联网上传输超文本的应用层协议。它是万维网（World Wide Web）的基础协议，用于在客户端和服务器之间传输数据。以下是对 HTTP 协议的概述：

## HTTP 基本概念

1. **客户端和服务器**：
   - **客户端**：通常是浏览器，它向服务器发送请求。
   - **服务器**：存储资源并响应客户端的请求。

2. **请求和响应**：
   - **请求（Request）**：由客户端发送，包括请求行、请求头和请求体。
   - **响应（Response）**：由服务器发送，包括状态行、响应头和响应体。

## HTTP 特性

1. **无状态**：每个 HTTP 请求都是独立的，不保留之前请求的状态。为了实现会话管理（如登录状态），通常使用 Cookie 和 Session。
2. **可扩展性**：HTTP 支持扩展，通过增加新的方法或头字段来满足新的需求。
3. **灵活性**：能够传输各种类型的数据，不仅限于文本数据。



## HTTP 协议版本

HTTP（Hypertext Transfer Protocol，超文本传输协议）自从其引入以来，已经经历了多个版本的演进，每个版本都带来了不同的改进和特性，以提升性能和安全性。以下是对 HTTP 各个主要版本的概述：

### HTTP/0.9

- **年份**：1991
- **特性**：
  - 最初的版本，简单且功能有限。
  - 只有一个方法 `GET`。
  - 没有 HTTP 头部，只有请求行和响应体。
  - 响应只支持纯文本。

- **使用场景**：早期网页浏览，仅用于简单的文本传输。

### HTTP/1.0

- **年份**：1996
- **特性**：
  - 引入了请求和响应头部，支持更多元数据（如内容类型、长度等）。
  - 支持多种方法：`GET`、`POST`、`HEAD`。
  - 支持状态码，用于表示请求结果（如 `200 OK`、`404 Not Found`）。
  - 引入了协议版本号，允许更好的版本控制和扩展。

- **使用场景**：改善了页面的传输能力，适用于简单的网页和表单提交。

### HTTP/1.1

- **年份**：1997（初版），1999（修订版）
- **特性**：
  - 持久连接：默认情况下，连接保持打开状态，以便复用，从而减少了连接建立的开销。
  - 分块传输编码：支持传输大文件时的分块传输。
  - 增加了更多的 HTTP 方法：`PUT`、`DELETE`、`OPTIONS`、`TRACE`。
  - 改进的缓存控制：通过 `Cache-Control` 头部更好地控制缓存行为。
  - 支持 Host 头部：允许在同一个 IP 地址上托管多个域名（多虚拟主机）。

- **使用场景**：广泛用于现代 Web 应用，改善了性能和带宽使用。

### HTTP/2

- **年份**：2015
- **特性**：
  - 二进制协议：将请求和响应数据分成二进制帧，提高传输效率。
  - 多路复用：在一个连接中同时发送多个请求和响应，消除了 HTTP/1.1 的队头阻塞问题。
  - 头部压缩：使用 HPACK 算法压缩头部，减少传输数据量。
  - 服务器推送：服务器可以主动向客户端推送资源，无需客户端请求。

- **使用场景**：适用于现代 Web 应用，特别是那些需要高性能和低延迟的应用。

### HTTP/3

- **年份**：2020（草案）
- **特性**：
  - 基于 QUIC 协议：QUIC 是一种基于 UDP 的传输层协议，具有低延迟和更好的连接恢复能力。
  - 内置 TLS：所有传输都通过加密进行，提供更高的安全性。
  - 改进的多路复用和流控制：进一步减少了队头阻塞，提升了传输效率。

- **使用场景**：特别适用于需要快速建立连接和在不稳定网络条件下保持高性能的应用。

### 各版本比较

| 特性     | HTTP/0.9 | HTTP/1.0        | HTTP/1.1                          | HTTP/2      | HTTP/3           |
| -------- | -------- | --------------- | --------------------------------- | ----------- | ---------------- |
| 请求方法 | GET      | GET, POST, HEAD | 多种（GET, POST, PUT, DELETE 等） | 同 HTTP/1.1 | 同 HTTP/2        |
| 状态码   | 无       | 有              | 有                                | 有          | 有               |
| 头部     | 无       | 有              | 有                                | 有          | 有               |
| 持久连接 | 无       | 无              | 有                                | 有          | 有               |
| 多路复用 | 无       | 无              | 无                                | 有          | 有（改进）       |
| 传输层   | TCP      | TCP             | TCP                               | TCP         | QUIC（基于 UDP） |
| 加密     | 无       | 无              | 通过 TLS                          | 通过 TLS    | 内置 TLS         |

### 总结

HTTP 协议随着版本的演进，不断提升了传输性能、扩展能力和安全性。从简单的文本传输（HTTP/0.9）到支持现代高性能应用（HTTP/3），每个版本都解决了前一版本的不足之处，并引入了新特性以适应不断变化的网络环境和需求。



# HTTP 头字段

HTTP 头字段包含客户端和服务器交换的附加信息，分为以下几类：

- **通用头字段**：适用于请求和响应的通用信息（如 `Date`、`Connection`）。
- **请求头字段**：包含更多关于资源的请求或客户端本身的信息（如 `Accept`、`User-Agent`）。
- **响应头字段**：包含关于响应的服务器信息（如 `Server`、`Set-Cookie`）。
- **实体头字段**：包含有关实体主体（即内容）的详细信息（如 `Content-Type`、`Content-Length`）。







# HTTP 请求报文

**HTTP 请求报文简述：**

- **方法、URL、版本号、回车换行；**
- **首部字段（很多k/v对）、回车换车；**
- **空行；**
- **最后像POST、PUT方法有请求体、GET方法没有。**



HTTP 请求报文是客户端发送到服务器以请求资源的消息。HTTP 请求报文由以下部分组成：

1. **请求行（Request Line）**
2. **请求头部（Headers）**
3. **空行（CRLF）**
4. **请求体（Body）**（可选）

## 1. 请求行（Request Line）

请求行包含三个部分：
- **请求方法**：指定要对资源执行的操作（例如，`GET`、`POST`、`PUT`、`DELETE`）。
- **请求 URI**：资源的标识符，通常是 URL 的路径部分。
- **HTTP 版本**：协议的版本，通常为 `HTTP/1.1` 或 `HTTP/2`。

**示例**：

```http
GET /index.html HTTP/1.1
```

### 请求方法

HTTP 使用不同的方法来表示对资源的不同操作。常见的方法有：

- **GET**：请求指定资源。只获取数据，不对服务器资源进行更改。
- **POST**：向服务器提交数据以进行处理（例如提交表单或上传文件）。可能会导致服务器上的资源发生更改。
- **PUT**：更新数据（上传某个指定资源的最新内容）。
- **DELETE**：删除指定资源。
- **HEAD**：类似于 GET 请求，只不过返回的响应中没有具体内容，用于获取报头。
- **OPTIONS**：返回服务器支持的 HTTP 方法。
- **PATCH**：对资源进行部分修改。

- **TRACE**： 追踪请求到达服务器中间经过的代理服务器。
- **CONNECT**：建立一个到由目标资源标识的服务器的隧道。

### URL

URL（Uniform Resource Locator，统一资源定位符）是用于标识互联网上资源的字符串。URL 提供了访问资源的方式以及资源的具体位置。URL 的基本格式为：

```ABAP
scheme://user:password@host:port/path?query#fragment
```

- **Scheme（方案）**：说明使用的协议类型，例如 `http`、`https`、`ftp`、`mailto` 等。
- **User（用户信息，非必需）**：包含访问资源所需的用户名和密码，现代浏览器中通常省略或不推荐使用。格式：`user:password@`。例子：`user:pass@`。
- **Host（主机）**：指定资源所在的服务器，可以是域名或 IP 地址。例子：`www.example.com`、`192.168.1.1`。
- **Port（端口，非必需）**：指定用于连接服务器的端口号，默认端口根据不同的协议有所不同（如 HTTP 默认端口为 80，HTTPS 为 443）。
- **Path（路径）**：指定资源在服务器上的具体位置，通常表现为文件路径或目录结构。例子：`/path/to/resource`。
- **Query（查询参数，非必需）**：包含发送给服务器的额外参数，常用于动态网页查询。**用?分隔与路径分割**，多个查询用&分隔，格式：`?key1=value1&key2=value2`。例子：`?id=123&name=John`。
- **Fragment（片段，非必需）**：指向资源的某个片段或位置，通常用于网页内部导航。格式：`#section`。例子：`#toc`。

#### 示例解析

以下是一个完整的 URL 例子和它的各个部分解析：

```
https://user:pass@www.example.com:443/path/to/resource?search=query#section
```

- **Scheme**: `https`
- **User**: `user`
- **Password**: `pass`
- **Host**: `www.example.com`
- **Port**: `443`
- **Path**: `/path/to/resource`
- **Query**: `search=query`
- **Fragment**: `section`

#### 特殊 URL 类型

- **Data URL**:
  - 用于内嵌小型数据，如图片或文件。
  - 格式：`data:[<mime-type>][;charset=<charset>][;base64],<encoded-data>`。
  - 例子：`data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==`。

- **Mailto URL**:
  - 用于电子邮件链接。
  - 格式：`mailto:user@example.com`。
  - 例子：`mailto:someone@example.com`。

#### 常见用途

1. **访问网页**：
   - 通过 HTTP 或 HTTPS 协议访问网页。
   - 例子：`https://www.example.com/index.html`。

2. **文件传输**：
   - 使用 FTP 协议上传或下载文件。
   - 例子：`ftp://ftp.example.com/file.txt`。

3. **数据库连接**：
   - 连接数据库，通常用于应用程序配置。
   - 例子：`mysql://user:pass@localhost:3306/database`。

4. **API 调用**：
   - 用于调用 RESTful API 服务。
   - 例子：`https://api.example.com/v1/resources?id=123&format=json`。



## 2. 请求头部（Headers）

请求头部包含多个键值对，用于传递额外的信息。每个头部字段都包括一个字段名、冒号和字段值。

常见的请求头部字段包括：

- **Host**：指定服务器的域名和端口。
- **User-Agent**：发送请求的客户端信息（例如浏览器类型）。
- **Accept**：客户端可接收的内容类型。
- **Content-Type**：请求体的内容类型（仅在有请求体时）。
- **Content-Length**：请求体的长度（仅在有请求体时）。
- **Authorization**：认证信息。

**示例**：
```http
Host: www.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
```



## 3. 空行（CRLF）

请求头部之后是一个空行，表示头部的结束。这是由回车符（CR）和换行符（LF）组成。

**示例**：

```http
\r\n
```



## 4. 请求体（Body）

请求体包含要发送到服务器的数据，通常用于 `POST`、`PUT` 等方法。对于 `GET` 请求，通常没有请求体。

**示例**：

```http
name=John&age=30
```

`name=John&age=30` 是一个 URL 编码格式的查询字符串（Query String），通常用于 HTTP 请求的请求体（如 `POST` 请求）或 URL 中的查询参数（如 `GET` 请求）。它包含一系列键值对，用于传递参数和对应的值。

具体来说，`name=John&age=30` 表示两个参数：
- `name` 是参数名，`John` 是参数值。
- `age` 是参数名，`30` 是参数值。

这些参数可以在服务器端被解析和处理，常用于传递用户输入的数据。以下是更详细的解释和示例：

### 组成部分

1. **name=John**：
   - `name` 是参数名。
   - `John` 是参数值。

2. **age=30**：
   - `age` 是参数名。
   - `30` 是参数值。

3. **&**：
   - `&` 是分隔符，用于分隔不同的键值对。

### 应用示例

#### 在 URL 中的查询参数

当用于 `GET` 请求时，这些参数通常附加在 URL 的末尾，用于向服务器传递信息。例如：
```
http://www.example.com/search?name=John&age=30
```
服务器接收到这个请求后，可以解析 URL 中的查询字符串并提取参数 `name` 和 `age` 的值。

#### 在 HTTP 请求体中的数据

当用于 `POST` 请求时，这些参数通常在请求体中，以表单数据的形式传递。例如：
```
POST /submit-form HTTP/1.1
Host: www.example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 18

name=John&age=30
```
服务器接收到这个请求后，可以解析请求体中的数据并提取参数 `name` 和 `age` 的值。

### 解析示例

假设服务器收到以下查询字符串或请求体数据：

```
name=John&age=30
```

服务器可以将其解析为以下键值对：

```python
{
    "name": "John",
    "age": "30"
}
```

然后服务器可以使用这些值进行相应的处理，比如在数据库中查找名为 John 的用户或将这些数据存储起来。

### 总结

`name=John&age=30` 是一种标准的键值对格式，用于在 HTTP 请求中传递参数。它可以在 URL 查询字符串中使用，也可以在 `POST` 请求的请求体中使用，以便服务器解析和处理客户端发送的数据。



## 完整示例

下面是一个完整的 HTTP 请求报文示例，用于提交一个表单：

```http
POST /submit-form HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
Content-Type: application/x-www-form-urlencoded
Content-Length: 27

name=John&age=30
```

各部分解释：

1. **请求行**：
   ```http
   POST /submit-form HTTP/1.1
   ```
   - 请求方法：`POST`
   - 请求 URI：`/submit-form`
   - HTTP 版本：`HTTP/1.1`

2. **请求头部**：
   ```http
   Host: www.example.com
   User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
   Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
   Content-Type: application/x-www-form-urlencoded
   Content-Length: 27
   ```

3. **空行**：
   
   ```http
   \r\n
   ```
   
4. **请求体**：
   ```http
   name=John&age=30
   ```

这个示例演示了一个 HTTP `POST` 请求报文，用于提交包含姓名和年龄的数据到服务器。





# HTTP 响应报文

**HTTP 响应报文简述：**

- **版本号、状态码、短语、回车换行；**
- **首部字段（很多k/v对）、回车换车；**
- **空行；**
- **实体。**



HTTP 响应报文是服务器在接收到客户端的请求后发送回客户端的消息。HTTP 响应报文由以下部分组成：

1. **状态行（Status Line）**
2. **响应头部（Headers）**
3. **空行（CRLF）**
4. **响应体（Body）**（可选）

## 1. 状态行（Status Line）

状态行包含三个部分：
- **HTTP 版本**：协议的版本，通常为 `HTTP/1.1` 或 `HTTP/2`。
- **状态码**：三位数字的代码，表示响应的结果（例如，`200`、`404`、`500`）。
- **状态文本**：状态码的描述短语（例如，`OK`、`Not Found`、`Internal Server Error`）。

**示例**：

```http
HTTP/1.1 200 OK
```

### 状态码

参考文档：https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status

状态码由三位数字组成，表示服务器对请求的处理结果。常见的状态码有：

- **1xx（信息性状态码）**：表示请求已接收，继续处理。
- **2xx（成功状态码）**：表示请求已成功被接收、理解和处理。
- **3xx（重定向状态码）**：表示需要进一步操作以完成请求。
- **4xx（客户端错误状态码）**：表示请求可能出错，妨碍了服务器的处理。
- **5xx（服务器错误状态码）**：表示服务器在处理请求时发生内部错误。

#### 2xx

- **200 OK**：请求成功。
- **201 Created**：请求成功并且服务器创建了新的资源。

#### 3xx

- **301 Moved Permanently**：永久重定向，资源已永久移动到新位置。
- **302 Found**：临时重定向，资源临时移动。
- **304 Not Modified**：资源未修改，浏览器使用本地缓存。
- **307 Temporary Redirect**:  与 302 很像，只是客户端保持当前请求方法不变重定向。
  - **含义**：请求的资源临时地被移动到另一个 URL，客户端应使用新的 URL 进行请求，但必须使用与原请求相同的 HTTP 方法。
  - **场景**：服务器希望客户端暂时访问另一个 URL，但不希望客户端更新其书签，因为这只是临时的重定向。
  - **示例**：客户端发送一个 `POST` 请求，服务器返回 `307 Temporary Redirect` 和新的 URL，客户端应使用 `POST` 方法访问新 URL，而不是自动转换为 `GET` 方法。

#### 4xx

- **400 Bad Request**：服务器无法理解请求。
- **401 Unauthorized**：请求要求用户的身份认证。
- **403 Forbidden**：请求被禁止
- **404 Not Found**：服务器找不到请求的资源。
- **405 Method Not Allowed**：请求的方法不允许。
- **413 Payload Too Large**：请求实体太大
  - **含义**：请求实体（例如请求体）的大小超过了服务器愿意或能够处理的限制。
  - **场景**：客户端发送的请求数据过大，超出了服务器设置的最大允许大小。
  - **示例**：客户端试图上传一个非常大的文件，而服务器设置了请求体大小的限制。服务器返回 `413 Payload Too Large`，表示无法处理该请求。

#### 5xx

- **500 Internal Server Error**：服务器遇到未知错误。
- **501 Not Implemented**：
  - **含义**：服务器不支持请求中使用的功能。
  - **场景**：客户端发送了服务器不支持的请求方法，或请求中包含了服务器无法处理的功能。
  - **示例**：客户端发送 `PATCH` 请求，但服务器不支持 `PATCH` 方法。
- **502 Bad Gateway**：
  - **含义**：作为网关或代理的服务器从上游服务器收到无效响应。
  - **场景**：服务器作为中间人，向上游服务器请求数据时，接收到上游服务器的错误响应。
  - **示例**：反向代理服务器向其背后的应用服务器请求数据，但应用服务器返回了错误或无效的响应。
- **503 Service Unavailable**：服务器目前无法处理请求。
- **504 Gateway Timeout**：
  - **含义**：作为网关或代理的服务器在等待上游服务器的响应时超时。
  - **场景**：服务器作为中间人，等待上游服务器响应请求，但上游服务器未能在规定时间内返回响应。
  - **示例**：反向代理服务器向其背后的应用服务器请求数据，但应用服务器未能及时响应。





## 2. 响应头部（Headers）

响应头部包含多个键值对，用于传递额外的信息。每个头部字段都包括一个字段名、冒号和字段值。

常见的响应头部字段包括：

- **Content-Type**：响应体的内容类型（例如，`text/html`、`application/json`）。
- **Content-Length**：响应体的长度。
- **Date**：响应生成的日期和时间。
- **Server**：服务器软件的信息。
- **Set-Cookie**：设置 HTTP cookie。

**示例**：
```http
Content-Type: text/html
Content-Length: 1234
Date: Mon, 03 Jun 2024 12:00:00 GMT
Server: Apache/2.4.41 (Ubuntu)
```

## 3. 空行（CRLF）

响应头部之后是一个空行，表示头部的结束。这是由回车符（CR）和换行符（LF）组成。

**示例**：
```http
\r\n
```

## 4. 响应体（Body）

响应体包含服务器返回的实际数据，通常是请求资源的内容。对于 `200 OK` 响应，响应体可能是 HTML 页面、图像、JSON 数据等。对于某些状态码（如 `204 No Content`），响应体可能为空。

**示例**：

```html
<html>
<head><title>Example</title></head>
<body><h1>Hello, World!</h1></body>
</html>
```

## 完整示例

下面是一个完整的 HTTP 响应报文示例，响应一个简单的 HTML 页面：

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 70
Date: Mon, 03 Jun 2024 12:00:00 GMT
Server: Apache/2.4.41 (Ubuntu)

<html>
<head><title>Example</title></head>
<body><h1>Hello, World!</h1></body>
</html>
```

## 各部分解释

1. **状态行**：
   ```http
   HTTP/1.1 200 OK
   ```
   - HTTP 版本：`HTTP/1.1`
   - 状态码：`200`
   - 状态文本：`OK`

2. **响应头部**：
   ```http
   Content-Type: text/html
   Content-Length: 70
   Date: Mon, 03 Jun 2024 12:00:00 GMT
   Server: Apache/2.4.41 (Ubuntu)
   ```

3. **空行**：
   
   ```
   \r\n
   ```
   
4. **响应体**：
   ```html
   <html>
   <head><title>Example</title></head>
   <body><h1>Hello, World!</h1></body>
   </html>
   ```

这个示例演示了一个 HTTP `200 OK` 响应报文，服务器返回了一个简单的 HTML 页面，内容是 "Hello, World!"。



# HTTP 首部字段

参考文档：https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers

- 首部字段存在于请求报文 和 响应报文中，涵盖了HTTP报文相关的内容信息
- 首部字段是由首部字段名和字段值构成，中间用冒号:分割，即 key/value 键/值 对构成
- 单个 HTTP 首部字段可以有多个值

以下是首部字段分类与内容：

## 通用首部

请求报文 和 响应报文都会使用的首部

- **Date** 报文的创建时间
- **Connection** 连接状态，如：keep-alive、close
- **via** 显示报文经过的中间节点（代理、网关）
- **cache-control** 控制缓存，如缓存时长
- **Mime-Version** 发送端使用的MIME版本
- **Warning** 错误通知

## 请求首部

从客户端向服务器端发送请求报文时使用的首部，补充了请求的附加内容、客户端信息、请求内容相关优先级等信息

- **Accept** 通知服务器自己可接受的媒体类型
- **Accept-charset** 客户端可接受的字符集
- **Accept-Encoding** 客户端可接受的编码格式，如：gzip
- **Accept-Language** 客户端可接受的语言
- **Client-IP** 请求的客户端IP
- **Host** 请求的服务器名称和端口号
- **Referer** 跳转至当前URL的前一个URL
- **User-Agent** 客户端代理，浏览器版本

**条件式请求首部：**

- **Expect** 允许客户端列出某请求所要求的服务器行为
- **If-Modified-Since** 自从指定的时间之后，请求的资源是否发生过修改
- **If-Unmodified-Since** 与上面相反
- **If-Node-Match** 本地缓存中存储的文档的Etag标签是否与服务器文档的Etag不匹配
- **If-Match** 与上面相反

**安全请求首部：**

- **Authorization** 向服务器发送认证信息，如：账号密码
- **Cookie** 客户端向服务器发送cookie

**代理请求首部：**

- **Proxy-Authorization** 向代理服务器认证

## 响应首部

从服务器端向客户端返回响应报文时使用的首部，补充了响应的附加内容，也会要求客户端附加额外的内容信息

**信息：**

- **Age** 从最初创建开始，响应持续时长
- **Server** 服务器程序软件名称和版本

**协商首部：**（某资源有多种表现方法时使用）

- **Accept-Ranges** 服务器可接受的请求范围类型
- **Vary** 服务器查看的其它首部列表

**安全响应首部：**

- **Set-Cookie** 向客户端设置cookie
- **WWW-Authenticate** 来自服务器对客户端的质询列表

## 实体首部

针对请求报文和响应报文的实体部分使用的首部，补充了资源内容更新时间等与实体有关的信息

- **Allow** 列出对此资源实体可使用的请求方法
- **Location** 告诉客户端真正的实体位于何处
- **Content-Encoding** 对主题执行的编码
- **Content-Language** 理解主体时最适合的语言
- **Content-Length** 主体的长度
- **Content-Location** 实体真正所处位置
- **Content-Type** 主题的对象类型，如：text

**缓存相关：**

- **Etag** 实体的扩展标签
- **Expires** 实体的过期时间
- **Last-Modified** 最后一次修改的时间



# Cookie & Sessions

Cookies 和 Sessions 是用于在 HTTP 请求之间保持状态的两种常见机制。由于 HTTP 协议是无状态的，这些机制使得服务器能够识别并跟踪客户端的状态和会话。以下是对 Cookies 和 Sessions 的详细解释：

## Cookies

**定义**：

- Cookies 是由服务器发送并存储在客户端（浏览器）上的小块数据。

**工作原理**：

1. **服务器设置 Cookie**：
   - 当客户端首次访问服务器时，服务器可以通过 HTTP 响应头 `Set-Cookie` 向客户端发送 Cookie。
   - 浏览器接收到 Cookie 后会存储在本地，后续请求中会将 Cookie 一并发送给服务器。

2. **客户端发送 Cookie**：
   - 在之后的每次请求中，浏览器会通过 HTTP 请求头 `Cookie` 将存储的 Cookie 发送给服务器。

**示例**：

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Expires=Wed, 09 Jun 2024 10:18:14 GMT; Path=/

GET /profile HTTP/1.1
Host: www.example.com
Cookie: sessionId=abc123
```

**属性**：

- **Name=Value**：键值对形式存储数据。
- **Expires**：Cookie 的过期时间。
- **Path**：Cookie 的有效路径。
- **Domain**：Cookie 的有效域。
- **Secure**：仅通过 HTTPS 发送 Cookie。
- **HttpOnly**：禁止 JavaScript 访问 Cookie，防范 XSS 攻击。

**用途**：

- 记住用户的登录状态。
- 存储用户偏好设置。
- 跟踪用户行为（例如广告系统中的跟踪）。



## Sessions

**定义**：

- Session 是在服务器端存储的一种数据结构，用于保存用户的会话数据。

**工作原理**：

1. **创建 Session**：
   - 当客户端首次访问服务器时，服务器会创建一个新的 Session，并生成一个唯一的 Session ID。
   - 服务器通过 HTTP 响应头 `Set-Cookie` 将 Session ID 发送给客户端，并要求客户端在后续请求中携带此 ID。

2. **存储 Session 数据**：
   - 服务器将与会话相关的数据（如用户信息、购物车内容）存储在服务器端的 Session 存储中（内存、数据库等）。

3. **客户端发送 Session ID**：
   - 在后续的每次请求中，客户端通过 Cookie 将 Session ID 发送给服务器。

4. **服务器检索 Session 数据**：
   - 服务器根据接收到的 Session ID 检索对应的会话数据。

**示例**：

```http
HTTP/1.1 200 OK
Set-Cookie: sessionId=abc123; Path=/

GET /profile HTTP/1.1
Host: www.example.com
Cookie: sessionId=abc123
```

**特点**：

- **安全性**：由于敏感数据存储在服务器端，更加安全。
- **生命周期**：Session 通常具有会话生命周期（浏览器关闭或会话超时后失效）。
- **存储位置**：存储在服务器端，常用的存储介质包括内存、数据库和文件系统。

**用途**：

- 维持用户的登录状态。
- 存储用户在当前会话中的活动数据，如购物车内容。

## 对比

| 特性     | Cookie                           | Session                          |
| -------- | -------------------------------- | -------------------------------- |
| 存储位置 | 客户端（浏览器）                 | 服务器端                         |
| 安全性   | 较低（敏感数据可能被窃取或篡改） | 较高（敏感数据存储在服务器端）   |
| 存储容量 | 小（每个 Cookie 通常不超过 4KB） | 大（服务器端可以存储大量数据）   |
| 生命周期 | 可以设置长期存储                 | 一般为会话期（浏览器关闭或超时） |
| 用途     | 存储小块数据、用户偏好等         | 存储会话数据、用户状态等         |
| 性能影响 | 客户端存储，减少服务器负担       | 需要服务器端存储和检索           |

## 结合使用

在实际应用中，Cookie 和 Session 通常结合使用。服务器通过 Cookie 发送 Session ID，客户端在后续请求中携带该 Session ID，从而使服务器能够识别和跟踪用户会话。这样既能充分利用 Cookie 的便利性，又能确保数据存储的安全性和完整性。





# ---

# 网站访问量的相关统计指标

**IP(独立IP)：**

- Internet Protocol
- 指独立IP数，**一天内来自相同客户机IP 地址只计算一次**

**PV(访问量)：**

- Page View
- **页面浏览量或点击量，用户每次刷新网页即被计算一次**
- PV是网站被访问的页面数量（访问日志一行就是一个PV）

**UV(独立访客)：**

- Unique Visitor
- **访问网站的一台电脑为一个访客，一天内相同的客户端只被计算一次(根据cookie来判断)**
- 可以理解成访问某网站的电脑的数量。网站判断来访电脑的身份是通过cookies实现的。如果更换了IP后但不清除cookies，再访问相同网站，该网站的统计中UV数是不变的

**QPS：**

- request per second，每秒请求数

### 示例：

```bash
#甲乙丙三人在同一台通过 ADSL 上网的电脑上（中间没有断网），分别访问 www.magedu.com 网站，并且每人共用一个浏览器，各个浏览了2个页面，那么网站的流量统计是：
IP: 1
PV: 6
UV：1

#若三人都是ADSL重新拨号后,各浏览了2个页面，则
IP: 3 #因为ADSL每次重新拨号后都会获取新的IP
PV: 6
UV：1
```

### 相关计算公式：

**PV，QPS和并发连接数换算公式**

- QPS= PV * 页面衍生连接次数/ 统计时间（86400）

- 并发连接数 =QPS * http平均响应时间

**峰值时间：每天80%的访问集中在20%的时间里，这20%时间为峰值时间**

- 峰值时间每秒请求数(QPS)=( 总PV数 *页面衍生连接次数）*80% ) / ( 每天秒数 * 20% ) 









# 浏览器访问网站的过程

**下面以https举例：**

1. 首先DNS解析输入的URL对应IP地址，分析本机host文件中是否有对应URL指向的IP，没有的话则向本地指向的DNS服务器发起递归查询，本地DNS服务器也没有的话则向根服务器发起迭代查询
2. 获取到服务器的IP后，客户端向服务器的443端口发起TCP请求，并进行三次握手建立连接
3. 建立连接后，服务器会将证书发送给客户端（证书中包括服务器的公钥，证书的颁发机构、过期时间等信息）
4. 客户端收到后，分析证书是否有效合法，证书有问题的话则会在浏览器中弹出对话框提示连接不安全
5. 然后客户端会生成一段随机值并使用服务器的公钥进行非对称加密在发送给服务器
6. 服务器收到后会使用自己的私钥进行解密，进而得到该随机值，后续使用这段随机值来进行数据传输
7. 客户端向服务器发送http请求报文（请求报文中主要包含方法、URL、版本号、首部字段、实体）
8. 服务器根据发来的指令(如GET、POST...)来处理请求
9. 服务器处理完毕后，则将响应报文发送给客户端（响应报文主要包含版本、状态码、短语、首部字段、实体），并进行日志记录
10. 最后客户端收到后，浏览器将数据进行渲染，展示给用户





# HTTP相关技术

## WEB前端开发相关语言

### html

- Hypertext markup language 超文本标记语言
- 主要负责实现页面的结构

### css

- Cascading style sheets 层叠样式表
- 定义了如何显示(装扮)HTML元素，比如：字体大小和颜色属性等
- 样式通常保存在外部的.css文件中
- 通过仅编辑一个简单的CSS文档，就可以同时改变站点中所有页面的布局和外观

### js

- Java script
- 实现网页的动画效果，但实属于静态资源



## MIME

- Multipurpose Internet Mail Extension 多用途互联网邮件扩展

- 早期互联网进行传输只有邮件这一种格式，后期因为技术的发展 出现了很多其他格式的文件，如：jpg、png图片、mp3、mp4等，为了便于浏览器将对应格式的文件进行解析识别 便出现了MIME

- MIME相关文件：

  - /etc/mime.types（来自 mailcap 包）

- MIME格式：

  - major/minor（主要类型/次要类型）

- 参考链接

  - https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_Types
  - https://www.w3school.com.cn/media/media_mimeref.asp

- MIME范例：

  ```
  text/plain 
  text/html  
  text/css 
  image/jpeg 
  image/png 
  video/mp4 
  application/javascript
  ```



- 

## 动态资源和静态资源

- 动态资源和静态资源的区分**不是看页面的显示是动态还是静态**，**而是以服务器端和客户端的文件是否相同来判断**，相同为静态，不相同则为动态。
- 或者也可以理解为可以从浏览器中显示源码即为静态，显示的不是源代码则为动态

### 静态文件

- 无需后端服务器做额外处理
- 如：
  - .html
  - .txt
  - .jpg
  - .css
  - .mp3
  - .avi

### 动态文件

- 服务端执行程序，返回的执行结果
  - .php
  - .jsp
  - .asp



# **提高**HTTP连接性能

- **并行连接：**
  - 通过多条TCP连接发起并发的HTTP请求
- **持久连接：**
  - keep-alive，重用TCP连接，以消除连接和关闭的时延,以事务个数和时间来决定是否关闭连接
- **管道化连接：**
  - 通过共享TCP连接，发起并发的HTTP请求
- **复用的连接：**
  - 交替传送请求和响应报文（实验阶段）











# HTTPS协议

- https主要为了解决http数据明文传输而导致不安全的问题
- 早期https与SSL一起使用，但目前都是https+TLS

##  **HTTPS** **会话的简化过程**

1. 客户端发送可供选择的加密方式，并向服务器请求证书

2. 服务器端发送证书以及选定的加密方式给客户端

3. 客户端取得证书并进行证书验证，如果信任给其发证书的CA

​       (a) 验证证书来源的合法性；用CA的公钥解密证书上数字签名

​       (b) 验证证书的内容的合法性：完整性验证

​       (c) 检查证书的有效期限

​       (d) 检查证书是否被吊销

​       (e) 证书中拥有者的名字，与访问的目标主机要一致

4. 客户端生成临时会话密钥（对称密钥），并使用服务器端的公钥加密此数据发送给服务器，完成密钥交换

5. 服务用此密钥加密用户请求的资源，响应给客户端

注意：SSL是基于IP地址实现,单IP的httpd主机，仅可以使用一个https虚拟主机



# web访问响应模型（web I/O）

### 单线程I/O结构：

启动一个进程处理用户请求，而且一次只处理一个，多个请求被串行响应

优点：无

缺点：效率极其低下，在web应用中不显示

### 多线程I/O结构：

并行启动多个进程,每个进程响应一个连接请求**apache默认选项**

事先开启多个进程(准备多个服务员来迎接顾客)

优点：有一定的并发响应能力

缺点：瞬间接受大量请求时需要事先开启进程(现招聘服务员)，效率较低

### 复用的I/O结构：

启动一个进程，同时响应N个连接请求

只有一个处理能力非常强的work进程（**将绝大多数的操作交给内核来完成**），通过连接池来接受用户的请求，用户的请求先放在连接池中，在依次执行，并将结果返还给用户（work进程背后还有一个master进程）

优点：大大减少了开启进程的数量，节约内存，提升了工作效率

缺点：

### 复用的多线程I/O结构：

启动M个进程，每个进程响应N个连接请求，同时接收M*N个请求，**nginx默认选项**

每核CPU都可以开启一个work进程，原理同复用的IO结构一样，不同的是可以根据CPU的个数来开启更多的超级进程（work进程背后还有一个master进程）

优点：可以根据CPU的个数来开启更多的超级进程，从而效率比复用的IO结构更高

缺点：



