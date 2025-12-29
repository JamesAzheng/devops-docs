---
title: "TCP 编程"
---


## TCP 服务端编程

下面这些步骤概括了一个基本的TCP服务端程序的工作流程。您可以根据具体需求对其进行扩展和优化，例如使用多线程或多进程处理多个客户端连接，或实现更复杂的应用程序逻辑。

## 1. 导入 socket 模块

首先，您需要导入Python的socket模块，以便使用套接字相关的函数。

```python
import socket
```



## 2. 创建 Socket 对象

Socket对象是用于网络通信的主要构件，它允许你在计算机之间建立通信链接，并发送/接收数据。

### socket.socket()

`socket.socket()` 函数是用于创建套接字对象的函数，它是Python中进行网络通信的重要构建之一。

**以下是 `socket.socket()` 函数的详细语法解释：**

```python
socket.socket(family, type, proto=0, fileno=None)
```

- `family`（地址族，address family）：套接字的地址族。通常可以选择的值包括：
  - `socket.AF_INET`：IPv4 地址族。
  - `socket.AF_INET6`：IPv6 地址族。
  - `socket.AF_UNIX` 或 `socket.AF_LOCAL`：Unix 域套接字（用于本地通信）。
  - `socket.AF_PACKET`：数据链路层套接字。
- `type`（套接字类型，socket type）：套接字的类型，通常可以选择的值包括：
  - `socket.SOCK_STREAM`：TCP 套接字，用于可靠的、面向连接的流式通信。
  - `socket.SOCK_DGRAM`：UDP 套接字，用于无连接的数据报通信。
  - `socket.SOCK_RAW`：原始套接字，用于直接访问网络协议层。
- `proto`（协议编号，protocol）：通常可以省略，表示默认的协议。对于某些特定的套接字类型和地址族，可以指定协议编号，例如，`socket.IPPROTO_TCP` 或 `socket.IPPROTO_UDP`。
- `fileno`：可选参数，表示已存在的文件描述符。如果提供了这个参数，将创建一个套接字对象，该对象将与现有文件描述符关联，而不是创建一个新的套接字。

返回值：`socket.socket()` 函数返回一个新创建的套接字对象。

这个函数的调用用于创建不同类型的套接字，以适应不同的网络通信需求。根据你的应用程序和通信协议的选择，你可以使用不同的参数来创建不同类型的套接字对象。然后，你可以使用这些套接字对象来进行网络通信、绑定地址和端口、监听连接、接受连接、发送和接收数据等各种操作。

### 示例：创建一个IPv4 TCP套接字

```python
import socket

## 创建一个IPv4 TCP套接字
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
```

### 示例：创建一个IPv6 UDP套接字

```py
import socket

## 创建一个IPv6 UDP套接字
udp_socket = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
```



### Socket 选项和设置（可选）

你可以设置一些套接字选项，如超时、重用地址等，以满足你的需求。

套接字选项和设置允许您配置套接字的行为和属性，以满足您的网络编程需求。这些选项可以通过`setsockopt()`方法来设置。下面是一些常用的套接字选项和设置的详细解释：

#### 超时设置

- `socket.timeout`：可以使用 `settimeout()` 方法设置套接字操作的超时时间。如果在超时时间内没有完成操作（例如连接、接收数据等），套接字操作将引发`socket.timeout`异常。

```python
import socket

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.settimeout(10)  # 设置套接字操作的超时时间为10秒
```



例如，要设置套接字的超时时间，你可以使用`settimeout()`方法：

```python
server_socket.settimeout(10)  # 设置套接字的超时时间为10秒
```



在套接字编程中，超时设置是一项重要的套接字选项，它允许您控制套接字操作的超时行为。超时设置可以确保套接字操作不会无限期地阻塞，从而使您的应用程序能够更灵活地处理网络通信。以下是有关套接字超时设置的详细解释：

1. **超时设置的目的**：

   - 超时设置用于控制套接字操作的最大等待时间。如果在指定的时间内操作没有完成，套接字将引发超时错误，以便应用程序可以继续执行其他任务或采取适当的措施。

2. **套接字选项**：

   - 超时设置通常使用以下两种套接字选项来配置：
     - `SO_RCVTIMEO`：用于接收数据的超时设置。
     - `SO_SNDTIMEO`：用于发送数据的超时设置。

3. **设置超时**：

   - 要设置套接字的超时，通常需要使用 `setsockopt()` 方法，并指定所需的套接字选项和超时值（以秒为单位）。

   ```python
   import socket
   
   # 创建套接字
   client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 设置接收超时为5秒
   timeout = 5
   client_socket.setsockopt(socket.SOL_SOCKET, socket.SO_RCVTIMEO, timeout)
   
   # 设置发送超时为5秒
   client_socket.setsockopt(socket.SOL_SOCKET, socket.SO_SNDTIMEO, timeout)
   ```

   在上面的示例中，我们创建了一个套接字 `client_socket` 并设置了接收和发送操作的超时都为5秒。

4. **超时异常**：

   - 当套接字操作在超时时间内无法完成时，套接字将引发 `socket.timeout` 异常。您可以捕获此异常以处理超时情况。

   ```python
   try:
       data_received = client_socket.recv(1024)
   except socket.timeout:
       print("Receive operation timed out.")
   ```

5. **无穷大超时**：

   - 如果不希望套接字操作超时，可以将超时值设置为无穷大（`float("inf")` 或 `None`）。

   ```python
   # 永不超时
   client_socket.setsockopt(socket.SOL_SOCKET, socket.SO_RCVTIMEO, None)
   ```

6. **应用场景**：

   - 超时设置在网络编程中非常有用，特别是在处理不可靠网络或需要响应时间敏感的应用程序中。例如，您可以在套接字连接、接收数据或发送数据时设置超时，以确保您的应用程序不会永远阻塞等待响应。

7. **超时设置的注意事项**：

   - 超时设置应该根据您的应用程序需求来选择合适的值。设置过短的超时可能导致虚假的超时错误，而设置过长的超时可能导致长时间的阻塞。
   - 您可以根据不同的套接字操作（连接、接收、发送等）设置不同的超时值，以满足不同的需求。
   - 在某些操作系统中，超时设置的最小时间粒度可能是秒，因此不能设置非常小的超时值。

超时设置是套接字编程中的重要部分，它可以提高网络通信的稳定性和可靠性，并确保您的应用程序在网络故障或其他问题时能够适当地响应。



#### 地址重用

- `socket.SO_REUSEADDR`：可以使用 `setsockopt()` 方法启用地址重用选项，允许多个套接字绑定到相同的地址和端口。这在服务器快速重启时很有用。

```python
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
```



要启用地址重用选项，你可以使用`setsockopt()`方法：

```python
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
```



地址重用是套接字编程中的一项重要选项，它允许您在套接字关闭后立即重新使用相同的地址和端口。这对于在套接字处于 TIME_WAIT 状态时能够更快地重新启动服务器非常有用。以下是关于地址重用的详细解释：

1. **地址重用的目的**：

   - 地址重用选项允许您在套接字关闭后立即重新使用相同的地址和端口。默认情况下，在套接字关闭后，操作系统会等待一段时间（通常是几分钟）才能再次使用相同的地址。地址重用允许您立即重新启动服务器，而无需等待这段时间。

2. **套接字选项**：

   - 地址重用通常使用 `SO_REUSEADDR` 套接字选项来配置。

3. **设置地址重用**：

   - 要设置地址重用，可以使用 `setsockopt()` 方法，并指定 `SO_REUSEADDR` 选项和一个非零的整数值。

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 启用地址重用选项
   server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
   ```

   在上面的示例中，我们创建了一个服务器套接字 `server_socket` 并启用了地址重用选项。

4. **地址重用的注意事项**：

   - 在启用地址重用时，应该小心，因为它允许多个套接字绑定到相同的地址和端口。这可能导致端口冲突和套接字混乱。确保只在服务器套接字上启用地址重用，而不要在客户端套接字上启用。

   ```python
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 启用地址重用选项（仅应用于服务器套接字）
   server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
   
   # 绑定地址和端口
   server_socket.bind(('127.0.0.1', 8080))
   ```

5. **适用场景**：

   - 地址重用对于服务器应用程序非常有用，特别是在需要快速重启服务器以处理多个客户端连接时。它可以确保服务器能够更快地重新启动，而无需等待 TIME_WAIT 状态的结束。

6. **TIME_WAIT 状态**：

   - 默认情况下，在套接字关闭后，它会进入 TIME_WAIT 状态，这是为了确保在网络中的所有数据包都被正确处理。在 TIME_WAIT 状态结束之前，无法重用相同的地址和端口。
   - 使用地址重用选项后，套接字关闭后，可以立即重新使用相同的地址和端口，而不必等待 TIME_WAIT 状态结束。

7. **安全性考虑**：

   - 虽然地址重用选项非常有用，但需要小心使用。在某些情况下，它可能会导致安全问题，例如允许恶意程序占用特定的地址和端口。因此，在启用地址重用时，应仅允许信任的应用程序使用它，并确保合理地处理套接字资源。

地址重用是套接字编程中的一项有用的选项，可以加速服务器的重新启动，特别是在需要处理多个客户端连接时。但需要小心使用，确保在合适的情况下启用它，并在安全性方面采取适当的措施。



#### 缓冲区大小

- `socket.SO_RCVBUF` 和 `socket.SO_SNDBUF`：这些选项允许您设置接收缓冲区和发送缓冲区的大小。可以通过 `setsockopt()` 来设置缓冲区大小。

```python
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 8192)  # 设置接收缓冲区大小为8192字节
```



套接字编程中的缓冲区大小是一项关键的设置，它允许您控制套接字在发送和接收数据时使用的缓冲区大小。缓冲区大小设置可以影响数据传输的性能和效率。以下是有关套接字缓冲区大小的详细解释：

1. **缓冲区大小的目的**：

   - 缓冲区大小设置用于控制套接字在发送和接收数据时使用的缓冲区的大小。这可以影响数据传输的速度和内存利用率。

2. **套接字选项**：

   - 套接字缓冲区大小通常使用以下两种套接字选项来配置：
     - `SO_RCVBUF`：用于接收数据的缓冲区大小。
     - `SO_SNDBUF`：用于发送数据的缓冲区大小。

3. **设置缓冲区大小**：

   - 要设置套接字的缓冲区大小，可以使用 `setsockopt()` 方法，并指定所需的套接字选项和缓冲区大小（以字节为单位）。

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 设置接收缓冲区大小为8192字节
   server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 8192)
   
   # 设置发送缓冲区大小为8192字节
   server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 8192)
   ```

   在上面的示例中，我们创建了一个服务器套接字 `server_socket` 并设置了接收和发送缓冲区的大小为8192字节。

4. **获取当前缓冲区大小**：

   - 您还可以使用 `getsockopt()` 方法来查询当前的缓冲区大小设置。

   ```python
   recv_buffer_size = server_socket.getsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF)
   send_buffer_size = server_socket.getsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF)
   ```

   这将返回当前接收缓冲区和发送缓冲区的大小。

5. **缓冲区大小的影响**：

   - 缓冲区大小的设置可以影响数据传输的性能。较大的缓冲区可以提高数据传输的效率，因为它允许更多的数据在一次套接字操作中传输。然而，它也会增加内存的使用。
   - 对于高性能网络应用程序，可以尝试调整缓冲区大小以找到最佳的性能设置。不过，应该注意，过大的缓冲区大小可能导致内存浪费。

6. **操作系统限制**：

   - 操作系统通常对缓冲区大小设置有一些限制，例如最小值和最大值。这些限制可能因操作系统和套接字类型而异。在设置缓冲区大小时，应该考虑这些限制。

7. **适用场景**：

   - 调整套接字的缓冲区大小通常用于需要高性能数据传输的应用程序，如流媒体传输、文件传输和高吞吐量的网络应用程序。根据应用程序的需求和性能测试的结果，可以选择适当的缓冲区大小。

缓冲区大小设置是套接字编程中的一项重要操作，它可以影响数据传输的性能和效率。适当地设置缓冲区大小可以帮助优化网络应用程序的性能，但需要注意不要过分增加缓冲区大小，以避免内存浪费。



#### 广播套接字

- `socket.SO_BROADCAST`：允许套接字发送广播消息。通常在UDP通信中使用。

```python
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
```



广播套接字（Broadcast Socket）是一种特殊类型的套接字，它用于向同一网络中的多个计算机发送数据包。广播套接字允许数据包被多个接收方接收，而不是只有一个。以下是有关广播套接字的详细解释：

1. **广播套接字的目的**：

   - 广播套接字用于将数据包发送到同一网络中的多个计算机，而不仅仅是单个目标。这对于需要向多个计算机广播信息的应用程序非常有用，如网络发现和广播通知。

2. **套接字选项**：

   - 广播套接字通常使用 `SO_BROADCAST` 套接字选项来启用广播功能。这个选项是一个布尔值，用于指示是否允许广播。

3. **设置广播套接字**：

   - 要设置广播套接字，可以使用 `setsockopt()` 方法，并指定 `SO_BROADCAST` 选项为 `True`（1）。

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
   
   # 启用广播套接字选项
   server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
   ```

   在上面的示例中，我们创建了一个UDP套接字 `server_socket` 并启用了广播套接字选项。

4. **广播地址**：

   - 广播套接字发送数据包到广播地址，通常是目标网络的广播地址。IPv4广播地址通常是网络地址加上全1的子网掩码，例如，`192.168.1.0/24` 网络的广播地址为 `192.168.1.255`。
   - 在IPv6中，广播地址不再使用，而是使用多播地址。

5. **发送广播数据**：

   - 使用广播套接字发送广播数据非常类似于普通的套接字发送数据，只需将目标地址设置为广播地址即可。

   ```python
   broadcast_address = ('192.168.1.255', 12345)  # 广播地址和端口
   message = "Hello, everyone!"  # 要广播的消息
   
   server_socket.sendto(message.encode(), broadcast_address)
   ```

   在上面的示例中，我们将消息发送到广播地址 `192.168.1.255` 上的端口 `12345`。

6. **广播接收**：

   - 接收广播数据也非常类似于普通套接字的接收操作，只需绑定到广播地址并接收数据包即可。

   ```python
   server_socket.bind(('0.0.0.0', 12345))  # 绑定到所有接口上的端口12345
   
   while True:
       data, sender_address = server_socket.recvfrom(1024)
       print(f"Received from {sender_address}: {data.decode()}")
   ```

   在上面的示例中，我们将套接字绑定到所有接口上的端口 `12345` 并接收广播数据。

7. **广播的用途**：

   - 广播套接字常用于网络中的服务发现、时间同步、设备配置以及一些应用程序中，例如在线游戏中的局域网发现和大规模部署的系统中的集中式配置管理。

8. **安全性注意事项**：

   - 使用广播套接字时需要注意安全性，因为广播数据可以被网络中的所有计算机接收。确保广播数据不包含敏感信息，并且只允许信任的计算机发送广播数据。

广播套接字允许将数据包发送到同一网络中的多个计算机，这对于一些特定的网络通信需求非常有用。然而，在使用广播套接字时需要谨慎处理，以确保安全性和可靠性。



#### TCP_NODELAY

- `socket.TCP_NODELAY`：禁用Nagle算法，可以降低TCP套接字的延迟，适用于需要低延迟的应用程序。

```python
server_socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
```



`TCP_NODELAY` 是一种套接字选项，通常用于优化TCP传输的性能。它控制是否启用Nagle算法，该算法旨在减少小数据包的发送，以提高网络效率。以下是有关 `TCP_NODELAY` 的详细解释：

1. **TCP_NODELAY的目的**：

   - `TCP_NODELAY` 套接字选项的目的是禁用 Nagle 算法。Nagle 算法的作用是将多个小数据包合并成一个较大的数据包，以减少网络传输的开销。然而，对于某些应用程序（如实时通信和游戏），小的数据包延迟可能更为重要，因此禁用 Nagle 算法可以提高传输速度和响应时间。

2. **套接字选项**：

   - `TCP_NODELAY` 常常通过将其设置为1来启用，或者设置为0来禁用。通常，启用 `TCP_NODELAY` 表示禁用 Nagle 算法，而禁用 `TCP_NODELAY` 表示启用 Nagle 算法。

3. **设置TCP_NODELAY**：

   - 要设置 `TCP_NODELAY` 套接字选项，可以使用 `setsockopt()` 方法，并将选项设置为1或0。

   ```python
   import socket
   
   client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 启用TCP_NODELAY（禁用Nagle算法）
   client_socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
   ```

   在上面的示例中，我们创建了一个客户端套接字 `client_socket` 并启用了 `TCP_NODELAY` 套接字选项，从而禁用了 Nagle 算法。

4. **Nagle算法的工作原理**：

   - Nagle 算法通常会等待一小段时间，以查看是否有更多的数据需要发送。如果没有更多的数据或者已经等待了足够长的时间，Nagle 算法将当前的数据发送出去。这个等待时间通常被称为"延迟"。
   - 当需要发送小数据包时，启用 `TCP_NODELAY` 可以立即发送数据而不等待延迟。这对于需要低延迟的应用程序非常有用，例如实时游戏和实时通信应用程序。

5. **适用场景**：

   - 适用于需要低延迟和实时性的应用程序，例如实时音频/视频通话、在线游戏、远程控制和即时通信应用程序。
   - 不适用于需要大量小数据包合并以减少网络开销的大文件传输应用程序。

6. **注意事项**：

   - 禁用 Nagle 算法可以降低延迟，但可能导致网络传输效率降低，特别是在发送大量小数据包的情况下。应根据应用程序的需求来选择是否启用 `TCP_NODELAY`。
   - 在实际应用中，可以根据需要在客户端和服务器端设置 `TCP_NODELAY`。如果需要禁用 Nagle 算法，通常应在两端同时启用。

`TCP_NODELAY` 套接字选项是套接字编程中用于优化TCP传输性能的一个重要选项。启用它可以降低延迟，但需要谨慎使用，以确保不会降低网络效率。



#### 设置IP和端口重用（Linux特定）

- `socket.SO_REUSEPORT`：在Linux上启用端口重用选项，允许多个套接字绑定到相同的IP地址和端口号。

```python
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
```



在Linux中，您可以使用套接字选项和设置来配置套接字的IP和端口重用。IP重用允许多个套接字绑定到相同的IP地址和端口，而端口重用允许多个套接字绑定到相同的端口。这些选项在特定情况下非常有用，例如允许多个应用程序同时监听相同的端口。以下是关于IP和端口重用的详细解释：

**IP重用（SO_REUSEADDR）**：

1. **IP重用的目的**：

   - IP重用选项（`SO_REUSEADDR`）用于允许多个套接字绑定到相同的IP地址和端口。默认情况下，操作系统通常不允许多个套接字绑定到相同的IP地址和端口，因此启用IP重用选项可以允许此操作。

2. **设置IP重用**：

   - 要设置IP重用，可以使用 `setsockopt()` 方法，并将 `SO_REUSEADDR` 选项设置为1。

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 启用IP重用选项
   server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
   ```

   在上面的示例中，我们创建了一个服务器套接字 `server_socket` 并启用了IP重用选项。

3. **适用场景**：

   - IP重用通常用于允许多个服务器套接字绑定到相同的IP地址和端口。这对于负载均衡、容错、多实例服务等情况非常有用。

**端口重用（SO_REUSEPORT）**：

1. **端口重用的目的**：

   - 端口重用选项（`SO_REUSEPORT`）允许多个套接字绑定到相同的IP地址和端口，但它更加灵活，因为它允许多个套接字在不同的进程中监听相同的IP地址和端口。

2. **设置端口重用**：

   - 要设置端口重用，可以使用 `setsockopt()` 方法，并将 `SO_REUSEPORT` 选项设置为1。

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 启用端口重用选项
   server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
   ```

   在上面的示例中，我们创建了一个服务器套接字 `server_socket` 并启用了端口重用选项。

3. **适用场景**：

   - 端口重用通常用于在不同的进程中允许多个服务器监听相同的IP地址和端口。这对于多进程、多线程服务器、容器化应用程序等情况非常有用。

4. **注意事项**：

   - 使用端口重用选项（`SO_REUSEPORT`）时，需要确保操作系统支持该选项。它通常在较新的Linux内核中可用。
   - 端口重用和IP重用选项可以同时使用，允许多个套接字绑定到相同的IP地址和端口，即使它们在不同的进程中运行。

在特定情况下，IP和端口重用选项可以帮助解决多个套接字绑定到相同地址和端口的问题，这对于一些应用程序非常有用，如负载均衡、容错和多进程/多线程服务器。确保在适当的情况下使用这些选项，以提高应用程序的灵活性和可扩展性。



#### 套接字选项查询

- `getsockopt()` 方法可用于查询套接字的选项值。

```python
option_value = server_socket.getsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR)
```

这些只是套接字选项和设置的一些示例，实际上有许多其他选项和设置，具体取决于您的应用程序需求和操作系统的支持。请查阅相关文档以获取更多详细信息和可用选项的列表。套接字选项和设置是调整套接字行为的重要方式，以满足特定的应用程序需求。



在套接字编程中，您可以使用套接字选项查询来获取有关套接字的配置和状态信息。这些查询可用于检查各种套接字属性，以便更好地了解套接字的状态和配置。以下是有关套接字选项查询的详细解释：

1. **查询套接字选项的目的**：

   - 套接字选项查询用于获取有关套接字配置和状态的信息。它们允许您查看套接字的当前设置，以便进行故障排除、性能调整和应用程序监控。

2. **套接字选项查询方法**：

   - 套接字选项查询通常使用 `getsockopt()` 方法来执行。这个方法需要指定查询的选项名字，通常是套接字选项的名称，以及一个用于存储结果的缓冲区。

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   # 查询套接字的接收缓冲区大小
   recv_buffer_size = server_socket.getsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF)
   ```

   在上面的示例中，我们使用 `getsockopt()` 查询了套接字的接收缓冲区大小。

3. **套接字选项查询的常见选项**：

   - 套接字选项查询可以用于检查许多不同的套接字属性，包括但不限于：
     - `SO_RCVBUF`：接收缓冲区大小。
     - `SO_SNDBUF`：发送缓冲区大小。
     - `SO_REUSEADDR`：IP地址和端口重用选项。
     - `SO_REUSEPORT`：端口重用选项。
     - `SO_KEEPALIVE`：启用或禁用保持活动连接的选项。
     - `SO_ERROR`：获取套接字上的错误状态。
     - `SO_TYPE`：套接字类型（如SOCK_STREAM或SOCK_DGRAM）。

4. **查询结果的解释**：

   - 查询的结果通常存储在一个缓冲区中，您可以通过解析缓冲区中的内容来获取套接字选项的值。查询结果的格式和内容取决于所查询的选项。

   ```python
   # 解析接收缓冲区大小的查询结果
   recv_buffer_size = struct.unpack("i", recv_buffer_size)[0]
   print(f"Receive Buffer Size: {recv_buffer_size} bytes")
   ```

   在上面的示例中，我们使用 `struct` 模块来解析接收缓冲区大小的查询结果。

5. **适用场景**：

   - 套接字选项查询通常用于网络应用程序的监控和调试，以及在需要了解套接字配置的情况下进行故障排除。它们也可以用于性能优化，例如查看缓冲区大小以确保数据传输的效率。

6. **查询的注意事项**：

   - 查询结果的格式和解释可能因所查询的选项而异。您应该查阅相关文档以了解如何解析特定选项的查询结果。
   - 查询操作可能会引发异常，例如 `OSError`，因此在进行查询时需要进行错误处理。

套接字选项查询是套接字编程中用于获取有关套接字配置和状态的重要工具。它们可以帮助您监控和调试网络应用程序，以及优化网络性能。要执行查询，只需指定所需的套接字选项和解析查询结果即可。

### PS

1. socket 对象占用文件描述符 fd；
2. xxx



## 3. 绑定地址和端口

使用 `bind()` 方法将套接字绑定到特定的地址和端口上，以便监听客户端的连接请求。通常，您会使用元组来指定服务器的地址和端口。

### 示例

```python
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

## 绑定地址和端口
server_address = ('127.0.0.1', 8080)
server_socket.bind(server_address)
```



### PS

在套接字编程中，绑定地址和端口是服务器端常见的操作。绑定操作指的是将套接字与一个特定的本地地址和端口关联起来，以便监听客户端的连接请求。以下是绑定地址和端口的详细解释：

1. **绑定操作的目的**：

   - 绑定操作是为了告诉操作系统在哪个本地地址和端口上监听传入的连接请求。服务器端通过绑定一个地址和端口来监听客户端的连接，这样客户端就可以通过指定这个地址和端口来与服务器通信。

2. **地址和端口的组合**：

   - 绑定操作通常使用一个元组（address, port）来指定地址和端口，其中：
     - `address`：是服务器所监听的本地地址，可以是IP地址或主机名。常见的是监听在特定IP地址上（例如，'127.0.0.1' 表示本地回环地址，'0.0.0.0' 表示所有可用的网络接口）。
     - `port`：是要绑定的端口号，用于标识服务器上的不同服务。通常，一种服务与一个端口号相关联（例如，HTTP服务通常使用端口80）。

3. **绑定的代码示例**：

   - 在Python中，使用`bind()`方法来执行绑定操作。以下是一个示例：

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # 创建TCP服务器套接字
   
   server_address = ('127.0.0.1', 8080)  # 绑定到本地回环地址和端口8080
   server_socket.bind(server_address)
   ```

   在此示例中，我们创建了一个TCP服务器套接字`server_socket`并将其绑定到了本地回环地址（127.0.0.1）和端口8080。

4. **多地址和多端口绑定**：

   - 服务器可以绑定到多个本地地址和/或多个端口，以侦听多个接口或提供多个服务。这对于多网络接口或多个服务的服务器很有用。

   ```python
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   
   address1 = ('0.0.0.0', 8080)  # 绑定到所有可用的网络接口，监听端口8080
   address2 = ('192.168.1.100', 8081)  # 绑定到指定IP地址，监听端口8081
   
   server_socket.bind(address1)
   server_socket.bind(address2)
   ```

   在上面的示例中，服务器套接字分别绑定到了所有可用的网络接口上的端口8080，以及指定的IP地址上的端口8081。

绑定操作是设置服务器套接字的一个重要步骤，它指定了服务器在哪个地址和端口上接受传入的连接请求。一旦套接字被绑定，服务器将开始监听指定的地址和端口上的连接请求，以便与客户端建立通信。



## 4. 监听连接

使用`listen()`方法开始监听传入的连接请求。参数指定最大等待连接数，这是等待队列的大小，通常设置为一个合理的数字。

### 示例

```python
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server_address = ('127.0.0.1', 8080)
server_socket.bind(server_address)

## 最多同时处理5个等待连接的客户端
server_socket.listen(5)
```

### PS

监听连接请求是在套接字编程中用于服务器端的重要操作，它允许服务器等待客户端连接并处理传入的连接请求。以下是监听连接请求的详细解释：

1. **监听连接请求的目的**：

   - 监听连接请求是服务器套接字准备好接受来自客户端的连接请求的方式。一旦服务器启动并开始监听，它就可以等待客户端尝试连接并接受这些连接，以便与客户端建立通信。

2. **`listen()` 方法**：

   - 在Python中，使用 `listen()` 方法来启动监听连接请求。`listen()` 方法接受一个参数，表示等待连接的最大数量（等待队列的大小）。通常情况下，这个参数设置为一个正整数。

   ```python
   import socket
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # 创建TCP服务器套接字
   
   server_address = ('127.0.0.1', 8080)  # 绑定到本地回环地址和端口8080
   server_socket.bind(server_address)
   
   server_socket.listen(5)  # 最多同时处理5个等待连接的客户端
   ```

   在上面的示例中，`server_socket.listen(5)` 启动了服务器套接字的监听，使其能够同时处理最多5个等待连接的客户端。

   ```python
   # cat 1.py 
   #!/usr/local/bin/python3
   import socket
   import time
   
   server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # 创建TCP服务器套接字
   
   server_address = ('127.0.0.1', 8080)  # 绑定到本地回环地址和端口8080
   server_socket.bind(server_address)
   server_socket.listen(5)  # 最多同时处理5个等待连接的客户端
   
   time.sleep(60)
   
   
   # ./1.py 
   
   
   
   #  Send-Q为5？？？？？？
   # ss -ntlp
   State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port Process     
   ...
   LISTEN  0       5            127.0.0.1:8080         0.0.0.0:*     users:(("1.py",pid=50358,fd=3))
   ...
   ```

3. **等待连接**：

   - 一旦调用 `listen()` 方法，服务器套接字就进入了监听状态，可以开始等待客户端的连接请求。在这个阶段，服务器不会执行其他操作，只会等待客户端的连接。

4. **等待队列**：

   - `listen()` 方法中指定的等待队列大小决定了在等待连接的客户端数量。当等待队列已满时，任何尝试连接的新客户端都将被拒绝，直到有空闲的位置。

5. **客户端连接**：

   - 当客户端尝试连接到服务器时，服务器套接字将接受连接并返回一个新的套接字对象，该套接字对象用于与客户端建立通信。

   ```python
   client_socket, client_address = server_socket.accept()
   ```

   这个新的套接字对象 `client_socket` 用于与客户端进行数据交换。

6. **处理多个客户端**：

   - 通常，服务器需要处理多个客户端的连接请求。为了实现这一点，可以在一个循环中重复调用 `accept()` 方法来接受新的连接请求。

   ```python
   while True:
       client_socket, client_address = server_socket.accept()
       # 在这里处理与客户端的通信
   ```

   这允许服务器同时处理多个客户端连接。

7. **错误处理**：

   - 在监听连接请求时，可能会出现一些错误，例如套接字关闭或其他异常。因此，需要在 `listen()` 方法和 `accept()` 方法的周围添加适当的错误处理代码以确保服务器的稳定性。

   ```python
   try:
       server_socket.listen(5)
   except socket.error as e:
       print(f"Listen error: {e}")
   
   try:
       client_socket, client_address = server_socket.accept()
   except socket.error as e:
       print(f"Accept error: {e}")
   ```

监听连接请求是服务器端套接字的关键操作之一，它允许服务器准备好接受客户端的连接请求，并与客户端建立通信。通过适当处理连接请求，服务器可以有效地服务多个客户端。



## 5. 接受连接

使用 `accept()` 方法接受客户端的连接请求。这个方法会阻塞程序，直到有客户端尝试连接。**一旦连接建立，它将返回一个新的套接字对象，用于与客户端通信。**

### 示例

```python
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server_address = ('0.0.0.0', 9999)
server_socket.bind(server_address)

server_socket.listen(5)

## 使用 accept() 方法接受客户端的连接请求。这个方法会阻塞程序，直到有客户端尝试连接。
client_socket, client_address = server_socket.accept()

## accept() 方法还返回了客户端的地址信息，包括IP地址和端口号。这对于识别和跟踪连接的客户端非常有用。
print(type(client_socket), client_socket) # <class 'socket.socket'> <socket.socket fd=452, family=AddressFamily.AF_INET, type=SocketKind.SOCK_STREAM, proto=0, laddr=('10.0.0.1', 9999), raddr=('10.0.0.123', 51494)>
print(type(client_address), client_address) # <class 'tuple'> ('10.0.0.123', 41784)
```

### PS

1. **多个客户端连接**：

   - 通常情况下，服务器需要处理多个客户端的连接请求。为了实现这一点，可以在一个循环中重复调用 `accept()` 方法以接受新的连接请求。

   ```python
   while True:
       client_socket, client_address = server_socket.accept()
       # 在这里处理与客户端的通信
   ```

   这允许服务器同时处理多个客户端连接，每个连接都在单独的套接字中进行通信。

2. **数据交换**：

   - 一旦连接被接受，您可以使用 `client_socket` 对象与客户端进行数据交换。您可以使用 `send()` 方法向客户端发送数据，使用 `recv()` 方法从客户端接收数据。

   ```python
   data = client_socket.recv(1024)  # 接收客户端发送的数据，最多1024字节
   client_socket.send(b'Response to client')  # 向客户端发送数据
   ```



## 6. 与客户端通信

一旦连接建立，您可以使用`client_socket`与客户端进行通信。通常，您会使用`send()`发送数据给客户端，使用`recv()`接收来自客户端的数据。

### 发送数据

```py
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_address = ('0.0.0.0', 9999)
server_socket.bind(server_address)
server_socket.listen(5)
client_socket, client_address = server_socket.accept()

client_socket.send(b'Hello, client!') # 发送数据给客户端

## 记得关闭
client_socket.close() # 当与客户端的通信完成后，使用 close() 方法关闭客户端套接字。
server_socket.close() # 如果服务器需要停止运行，使用 close() 方法关闭服务器套接字。
```

- 使用 telnet 连接服务端后：

```sh
$ telnet 10.0.0.1 9999
Trying 10.0.0.1...
Connected to 10.0.0.1.
Escape character is '^]'.
Hello, client!Connection closed by foreign host.
```

#### PS

- 使用 `send()` 方法将数据发送给远程套接字。

```python
client_socket.send(b'Hello, server!') # 发送数据给客户端
```

在套接字编程中，发送数据是通过套接字对象将数据从一个端点发送到另一个端点的关键操作。以下是发送数据的详细解释：

1. **发送数据的目的**：

   - 发送数据是用于在网络上的两个端点之间传输信息的操作。通过套接字，可以将数据从一个端点（通常是发送方或客户端）发送到另一个端点（通常是接收方或服务器）。

2. **`send()` 方法**：

   - 在Python中，可以使用套接字对象的 `send()` 方法来发送数据。此方法将数据作为字节串（bytes）传递给套接字，以便在网络上传输。

   ```python
   data_to_send = b'Hello, server!'
   client_socket.send(data_to_send)
   ```

   在上面的示例中，`client_socket.send(data_to_send)` 发送了一个字节串 `data_to_send` 到连接的服务器。

3. **字节串数据**：

   - 数据通常以字节串（bytes）的形式发送，因为套接字是面向字节的。您可以使用 `bytes()` 函数将字符串转换为字节串，或者在字符串前加上 `b` 前缀来表示字节串。

   ```python
   data_to_send = b'This is a bytes string.'
   ```

4. **发送数据的返回值**：

   - `send()` 方法返回实际发送的字节数。您可以使用这个返回值来检查是否成功发送所有数据。

   ```python
   data_to_send = b'Hello, server!'
   sent_bytes = client_socket.send(data_to_send)
   if sent_bytes == len(data_to_send):
       print("Data sent successfully.")
   ```

5. **发送大数据**：

   - 如果要发送大量数据，可以将数据分成较小的块进行多次发送，以确保稳定的数据传输。通常，发送大型数据块时，会使用一个循环来逐步发送数据。

   ```python
   data_to_send = b'Very long data...'  # 长数据块
   chunk_size = 1024  # 每次发送的块大小
   sent_bytes = 0  # 已发送的字节数
   
   while sent_bytes < len(data_to_send):
       chunk = data_to_send[sent_bytes:sent_bytes + chunk_size]
       sent = client_socket.send(chunk)
       if sent == 0:
           raise RuntimeError("Socket connection broken")
       sent_bytes += sent
   ```

6. **非阻塞发送**：

   - 如果套接字是非阻塞的，`send()` 方法可能不会发送所有数据，因为发送缓冲区可能已满。在这种情况下，可以使用非阻塞模式来继续发送数据，直到所有数据都被发送。

   ```python
   client_socket.setblocking(False)  # 设置套接字为非阻塞模式
   
   data_to_send = b'Large data...'
   total_sent = 0
   
   while total_sent < len(data_to_send):
       try:
           sent = client_socket.send(data_to_send[total_sent:])
           if sent == 0:
               raise RuntimeError("Socket connection broken")
           total_sent += sent
       except BlockingIOError:
           pass  # 在非阻塞模式下，send() 可能会抛出 BlockingIOError 异常
   ```

7. **错误处理**：

   - 在发送数据时，可能会出现一些错误，例如套接字关闭、连接中断或其他异常。因此，需要在 `send()` 方法周围添加适当的错误处理代码以处理这些问题。

   ```python
   try:
       client_socket.send(data_to_send)
   except socket.error as e:
       print(f"Send error: {e}")
   ```

发送数据是通过套接字在网络上进行通信的关键操作之一。在网络编程中，需要谨慎处理数据的发送，确保数据能够按预期到达接收端。



### 接收数据

```py
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_address = ('0.0.0.0', 9999)
server_socket.bind(server_address)
server_socket.listen(5)
client_socket, client_address = server_socket.accept()

data = client_socket.recv(1024)  # 接收最多1024字节的数据，通常为2048、4096以此类推

## 使用 telnet 发送数据后会显示例如以下内容：
print(type(data), data) # <class 'bytes'> b'hello server!\r\n'

## 记得关闭
client_socket.close() # 当与客户端的通信完成后，使用 close() 方法关闭客户端套接字。
server_socket.close() # 如果服务器需要停止运行，使用 close() 方法关闭服务器套接字。
```

- telnet：

```sh
$ telnet 10.0.0.1 9999
Trying 10.0.0.1...
Connected to 10.0.0.1.
Escape character is '^]'.
hello server!
Connection closed by foreign host.
```



#### PS

- 使用 `recv()` 方法从套接字接收数据。通常，您需要指定最大接收数据的大小。

```python
data = client_socket.recv(1024)  # 接收最多1024字节的数据
```

在套接字编程中，接收数据是通过套接字对象从一个端点接收数据的关键操作。以下是接收数据的详细解释：

1. **接收数据的目的**：

   - 接收数据是用于从网络上的一个端点接收信息的操作。通过套接字，可以接收来自另一个端点（通常是发送方或服务器）的数据。

2. **`recv()` 方法**：

   - 在Python中，可以使用套接字对象的 `recv()` 方法来接收数据。此方法从套接字接收数据，并将其存储为字节串（bytes）以供进一步处理。

   ```python
   data_received = client_socket.recv(1024)  # 接收最多1024字节的数据
   ```

   在上面的示例中，`client_socket.recv(1024)` 从客户端套接字接收最多1024字节的数据。

3. **数据的接收缓冲区**：

   - 接收数据时，套接字会从接收缓冲区中读取数据。接收缓冲区是一个特定大小的内存区域，用于存储待接收的数据。

4. **接收数据的返回值**：

   - `recv()` 方法返回实际接收的字节数。通常，它返回一个非负整数，表示成功接收的字节数。

   ```python
   data_received = client_socket.recv(1024)
   if len(data_received) > 0:
       print(f"Received {len(data_received)} bytes of data.")
   else:
       print("Connection closed by remote end.")
   ```

   如果 `recv()` 返回0，表示连接已关闭。

5. **处理大数据**：

   - 如果接收的数据量较大，可以使用循环来逐步接收数据块，直到接收到所有数据。通常，接收大型数据块时，需要使用一个循环。

   ```python
   data_received = b''  # 初始化接收的数据为空字节串
   chunk_size = 1024  # 每次接收的块大小
   
   while True:
       chunk = client_socket.recv(chunk_size)
       if not chunk:
           break  # 如果没有更多数据，退出循环
       data_received += chunk
   ```

6. **非阻塞接收**：

   - 如果套接字是非阻塞的，`recv()` 方法可能不会立即返回数据，因为接收缓冲区可能为空。在这种情况下，您可以使用非阻塞模式来等待数据的到达。

   ```python
   client_socket.setblocking(False)  # 设置套接字为非阻塞模式
   
   data_received = b''  # 初始化接收的数据为空字节串
   
   try:
       while True:
           chunk = client_socket.recv(chunk_size)
           if not chunk:
               break  # 如果没有更多数据，退出循环
           data_received += chunk
   except BlockingIOError:
       pass  # 在非阻塞模式下，recv() 可能会抛出 BlockingIOError 异常
   ```

7. **错误处理**：

   - 在接收数据时，可能会出现一些错误，例如套接字关闭、连接中断或其他异常。因此，需要在 `recv()` 方法周围添加适当的错误处理代码以处理这些问题。

   ```python
   try:
       data_received = client_socket.recv(1024)
   except socket.error as e:
       print(f"Receive error: {e}")
   ```

接收数据是通过套接字从网络中获取信息的关键操作之一。在网络编程中，需要确保数据能够按预期接收，并进行适当的处理和解析。



## 循环处理连接（可选）

如果您希望服务器能够处理多个客户端连接，可以将上述步骤放在一个循环中，并在每次处理完一个客户端后重复接受下一个客户端的连接。



## 错误处理

在套接字编程中，需要适当处理各种异常，以确保程序的稳定性和健壮性。常见的异常包括 `socket.error` 和 `ConnectionResetError` 等。

在套接字编程中，错误处理是至关重要的，因为网络通信可能会出现各种问题。适当地处理错误可以增加程序的健壮性，确保应用程序在发生问题时能够 graceful 地处理。以下是一些常见的套接字操作中的错误以及错误处理的详细解释：

1. **套接字创建错误**：

   - 在创建套接字对象时可能会出现错误，例如无法创建套接字、套接字类型不受支持等。通常，这些错误会引发 `socket.error` 异常。

   ```python
   try:
       client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   except socket.error as e:
       print(f"Socket creation error: {e}")
   ```

2. **绑定错误**：

   - 在绑定套接字到地址和端口时，可能会出现一些错误，例如端口已被占用、无法访问指定的地址等。

   ```python
   try:
       server_socket.bind(server_address)
   except socket.error as e:
       print(f"Binding error: {e}")
   ```

3. **监听连接请求错误**：

   - 在启动监听连接请求时，可能会发生错误，例如套接字已关闭或监听队列已满。

   ```python
   try:
       server_socket.listen(5)
   except socket.error as e:
       print(f"Listen error: {e}")
   ```

4. **接受连接错误**：

   - 在接受连接请求时，可能会出现一些错误，例如套接字已关闭或连接中断。

   ```python
   try:
       client_socket, client_address = server_socket.accept()
   except socket.error as e:
       print(f"Accept error: {e}")
   ```

5. **连接错误**：

   - 在客户端连接到服务器时，可能会出现一些错误，例如无法连接到指定的服务器、连接超时等。

   ```python
   try:
       client_socket.connect(server_address)
   except socket.error as e:
       print(f"Connection error: {e}")
   ```

6. **发送和接收数据错误**：

   - 在发送和接收数据时，可能会发生各种错误，例如连接已关闭、超时、数据太大等。在发送数据时，通常检查返回值以确保数据已成功发送。在接收数据时，检查返回值以确定接收到的字节数。

   ```python
   try:
       data_received = client_socket.recv(1024)
       if not data_received:
           print("Connection closed by remote end.")
   except socket.error as e:
       print(f"Receive error: {e}")
   ```

7. **关闭套接字错误**：

   - 在关闭套接字时，可能会发生一些错误，例如套接字已关闭或未正常关闭。

   ```python
   try:
       client_socket.close()
   except socket.error as e:
       print(f"Socket close error: {e}")
   ```

8. **通用错误处理**：

   - 捕获通用的 `socket.error` 异常可以用于处理不特定的套接字错误，以便识别问题并采取适当的措施。

   ```python
   try:
       # 套接字操作
   except socket.error as e:
       print(f"Socket error: {e}")
   ```

在编写套接字程序时，始终考虑错误处理是一个好习惯。适当处理错误可以帮助您的应用程序更稳定地运行，并提供有用的调试信息，以便在出现问题时进行故障排除。根据应用程序的特定需求，您可以选择不同的错误处理策略，例如重新尝试、记录错误或终止应用程序。



## 示例：CS交互

- 可使用 telnet 等工具，连接该 server 端的 9999 端口进行测试。

```py
import socket

## 创建服务器套接字
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_address = ('0.0.0.0', 9999)
server_socket.bind(server_address)
server_socket.listen(5)
print("Server is listening on port 9999...")

## 接受客户端连接
client_socket, client_address = server_socket.accept()
print(f"Connection from {client_address} has been established.")

try:
    # 发送数据给客户端
    client_socket.send(b'Hello, client!')
    
    # 在这里添加一些逻辑以保持连接打开，例如等待进一步的客户端请求
    while True:
        data = client_socket.recv(1024)
        if not data:
            break
        print(f"Received data: {data.decode('utf-8')}")
        client_socket.send(b'Echo: ' + data)
        
finally:
    # 当与客户端的通信完成后，关闭客户端套接字
    client_socket.close()
    print("Client socket closed.")
    
    # 如果服务器需要停止运行，关闭服务器套接字
    server_socket.close()
    print("Server socket closed.")
```



## 示例：实现群聊服务端

要求：多个客户端，都可以与服务端进行通信。当某一个客户端发送消息，所有客户端都将收到该消息。

为了实现一个简单的群聊服务器，您可以使用 Python 的 `socket` 和 `threading` 模块。服务器将接受多个客户端连接，并在一个客户端发送消息时将该消息广播给所有其他客户端。

以下是实现群聊服务器的代码：

### 服务端代码

```python
import socket
import threading

## 维护所有客户端连接
clients = []

## 广播消息给所有客户端
def broadcast(message, source_client):
    for client in clients:
        if client != source_client:
            try:
                client.send(message)
            except Exception as e:
                print(f"Error sending message: {e}")
                client.close()
                clients.remove(client)

## 处理客户端连接
def handle_client(client_socket):
    while True:
        try:
            message = client_socket.recv(1024)
            if not message:
                break
            print(f"Received message: {message.decode('utf-8')}")
            broadcast(message, client_socket)
        except:
            break
    client_socket.close()
    clients.remove(client_socket)

## 主函数，设置并启动服务器
def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_address = ('0.0.0.0', 9999)
    server_socket.bind(server_address)
    server_socket.listen(5)
    print("Server is listening on port 9999...")

    while True:
        client_socket, client_address = server_socket.accept()
        print(f"New connection from {client_address}")
        clients.append(client_socket)
        threading.Thread(target=handle_client, args=(client_socket,)).start()

if __name__ == "__main__":
    main()
```

### 客户端代码

每个客户端都可以使用以下代码来连接服务器并参与群聊：

```python
import socket
import threading

## 接收来自服务器的消息
def receive_messages(client_socket):
    while True:
        try:
            message = client_socket.recv(1024)
            if not message:
                break
            print(f"Received: {message.decode('utf-8')}")
        except:
            break
    client_socket.close()

def main():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_address = ('127.0.0.1', 9999)
    client_socket.connect(server_address)

    threading.Thread(target=receive_messages, args=(client_socket,)).start()

    while True:
        message = input("")
        if message.lower() == 'exit':
            break
        client_socket.send(message.encode('utf-8'))

    client_socket.close()

if __name__ == "__main__":
    main()
```

### 运行步骤

1. **启动服务器**：
    - 运行服务器代码，服务器将开始监听端口 9999。
    ```sh
    python server.py
    ```

2. **启动客户端**：
    - 运行客户端代码，每个客户端都会连接到服务器，并可以开始发送和接收消息。
    ```sh
    python client.py
    ```

3. **参与群聊**：
    - 客户端发送消息后，服务器会将消息广播给所有其他客户端。

这种设置允许多个客户端连接到服务器并进行群聊，当任何一个客户端发送消息时，所有连接的客户端都会收到该消息。



### ---

### 课堂演示代码参考

有问题，待排查

```py
## TCP Chat Server
import datetime
import socket
import threading
import time
import logging

FORMAT = '%(asctime)s %(levelname)s %(message)s'
logging.basicConfig(format=FORMAT, level=logging.INFO)

class ChatServer():
    def __init__(self, ip='0.0.0.0', port=9999):
        self.sock = socket.socket()
        self.addr = ip, port
        self.event = threading.Event()
        self.clients = {}
        self.lock = threading.Lock()

    def statr(self):
        self.sock.bind(self.addr)
        self.sock.listen()

        threading.Thread(target=self.accept, name='accept', daemon=False).start()

    def accept(self):
        count = 1
        while not self.event.is_set():
            client, raddr = self.sock.accept()
            print(client)
            print(raddr)
            with self.lock:
                self.clients[raddr] = client
            threading.Thread(
                target=self.recv,
                name='recv {}'.format(count),
                args=(client,raddr)
            ).start()
            count += 1

    def recv(self, client, raddr):
        while not self.event.is_set():
            data = client.recv(1024)
            print(data)
            if not data:
                client.close()
                with self.lock:
                    if raddr in self.clients.keys():
                        self.clients.pop(raddr)
                break
            msg = "{:%m%d %H:%M:%S} From {}:{}. msg={}".format(
                datetime.datetime.now(),
                *raddr,
                data.decode()
            )
            logging.info(msg)
            msg = msg.encode()

            with self.lock:
                for c in self.clients.values():
                   c.send(msg)

    def stop(self):
        self.event.set()
        with self.lock:
            for client in self.clients.values():
                print('close ~~~', client)
                client.close()
            self.clients.clear()
        self.sock.close()

cs = ChatServer()
cs.statr()

while True:
    cmd = input('>>> ').strip()
    if cmd == 'quit':
        cs.stop()
        break
```







## TCP 客户端编程

下面是一个示例代码：

```python
import socket

def tcp_client():
    # 创建一个 TCP/IP 套接字
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    # 连接到服务器
    server_address = ('localhost', 65432)  # 替换为服务器的地址和端口
    print(f'正在连接到 {server_address[0]} 端口 {server_address[1]}')
    client_socket.connect(server_address)
    
    try:
        # 发送数据
        message = '这是一条测试消息。'
        print(f'正在发送: {message}')
        client_socket.sendall(message.encode())
        
        # 接收响应
        data = client_socket.recv(1024)
        print(f'接收到的数据: {data.decode()}')
    
    finally:
        print('正在关闭套接字')
        client_socket.close()

if __name__ == '__main__':
    tcp_client()
```

在这个示例中，我们做了以下几件事：

1. 创建一个 TCP/IP 套接字。
2. 连接到服务器（在示例中，服务器地址是 `localhost`，端口是 `65432`）。
3. 发送消息到服务器。
4. 接收服务器的响应并打印出来。
5. 关闭套接字。

你可以根据需要修改服务器的地址和端口，或者修改发送的消息内容。如果你还没有一个 TCP 服务器，可以编写一个简单的服务器来测试。下面是一个简单的 TCP 服务器示例代码：

```python
import socket

def tcp_server():
    # 创建一个 TCP/IP 套接字
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    # 绑定套接字到端口
    server_address = ('localhost', 65432)
    print(f'正在启动服务器，监听 {server_address[0]} 端口 {server_address[1]}')
    server_socket.bind(server_address)
    
    # 监听传入连接
    server_socket.listen(1)
    
    while True:
        print('等待连接...')
        connection, client_address = server_socket.accept()
        try:
            print(f'连接自 {client_address}')
            
            # 接收数据
            data = connection.recv(1024)
            print(f'接收到的数据: {data.decode()}')
            
            # 发送数据回客户端
            response = '服务器已收到消息。'
            connection.sendall(response.encode())
        
        finally:
            # 清理连接
            connection.close()

if __name__ == '__main__':
    tcp_server()
```

这个服务器会监听 `localhost` 上的 `65432` 端口，接收来自客户端的消息，并发送一个确认消息回去。

## 示例：实现群聊客户端

### 课堂演示代码参考

还有很多问题，仅供参考。

```py
## TCP Chat Client
import threading
import socket

class ChatClient():
    def __init__(self, dip='127.0.0.1', dport=9999):
        self.client_socket = socket.socket()
        self.addr = (dip, dport)
        self.event = threading.Event()

    def send(self, msg):
        self.client_socket.send(msg.encode('utf-8'))


    def recv(self):
        while not self.event.is_set():
            try:
                data = self.client_socket.recv(1024)
            except Exception as e:
                print(e)
                break
            print(f'接收到的数据: {data.decode()}')

    def start(self):
        try:
            print(f'正在连接到 {self.addr[0]} 端口 {self.addr[1]}')
            self.client_socket.connect(self.addr)
        except Exception as e:
            print(e)

        threading.Thread(target=self.recv, name='recv').start()

    def stop(self):
        self.send('quit')
        self.event.set()
        self.client_socket.close()

cc = ChatClient()
cc.start()

while True:
    message = input('please input your message: ')
    if message == 'quit':
        cc.stop()
        break
    cc.send(message)
```



## Makefile

在 Python 中，`socket` 模块提供了用于网络通信的功能。其中，`makefile` 方法是 `socket` 对象的一个方法，它返回一个类文件对象，该对象允许你使用文件 I/O 接口来读写套接字。

`makefile` 方法的定义如下：

```python
socket.makefile(mode='r', buffering=None, encoding=None, errors=None, newline=None)
```

- `mode`: 文件模式，默认为 `'r'`（只读）。常用的模式有：
  - `'r'`: 读
  - `'w'`: 写
  - `'b'`: 二进制模式
  - `'t'`: 文本模式
- `buffering`: 缓冲策略，类似于 `open()` 函数中的 `buffering` 参数。`0` 表示不使用缓冲，`1` 表示行缓冲，正整数表示块缓冲（以字节为单位），负数（默认）表示使用系统默认缓冲策略。
- `encoding`: 字符编码，仅在文本模式下使用。
- `errors`: 错误处理方案，仅在文本模式下使用。
- `newline`: 换行符，仅在文本模式下使用。

## 使用示例

以下是一个简单的示例，展示如何使用 `makefile` 方法来创建类文件对象，并使用文件方法来读写套接字：

```python
import socket

## 创建一个 TCP/IP 套接字
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

## 连接到服务器
server_address = ('localhost', 10000)
sock.connect(server_address)

try:
    # 创建类文件对象
    file_obj = sock.makefile(mode='rw')

    # 发送数据
    file_obj.write('This is the message. It will be repeated.\n')
    file_obj.flush()  # 刷新缓冲区，确保数据发送

    # 接收响应
    response = file_obj.readline()
    print('Received:', response)

finally:
    # 关闭文件对象和套接字
    file_obj.close()
    sock.close()
```

## 注意事项

1. **关闭资源**：在使用 `makefile` 创建的文件对象时，确保在不再需要时关闭文件对象和原始套接字。通常，关闭文件对象会自动关闭底层的套接字，但这是实现细节，最好明确关闭套接字。
2. **缓冲区**：使用 `makefile` 方法创建的文件对象可能会有缓冲区。因此，在写操作后使用 `flush()` 方法确保数据立即发送。

`makefile` 方法在处理基于文本协议的通信时特别有用，例如 HTTP、SMTP 等协议，因为它允许你使用标准的文件 I/O 接口（如 `readline` 和 `write`）来处理数据，而不必直接处理套接字的低级接口。



## ---

## 示例1

```py
import socket

server = socket.socket()
server.bind(('0.0.0.0', 9999))
server.listen()

newsock, raddr = server.accept()
print(newsock)  # <socket.socket fd=380, family=AddressFamily.AF_INET, type=SocketKind.SOCK_STREAM, proto=0, laddr=('10.0.0.1', 9999), raddr=('10.0.0.123', 53690)>

print(raddr)  # ('10.0.0.123', 53690)

f = newsock.makefile('rw')  # 读写都支持
print(f)  # <_io.TextIOWrapper mode='rw' encoding='cp936'>

data = f.read(5)  # 接受数据，等价于 recv() 方法
print(type(data), data)  # <class 'str'> 12345

f.write('Hello Client!')  # 发送数据，等价于 send() 方法
f.flush()  # 刷新缓冲区，确保数据发送

newsock.close()
f.close()
server.close()
```

```sh
$ telnet 10.0.0.1 9999
Trying 10.0.0.1...
Connected to 10.0.0.1.
Escape character is '^]'.
12345678
Hello Client!Connection closed by foreign host.
```

