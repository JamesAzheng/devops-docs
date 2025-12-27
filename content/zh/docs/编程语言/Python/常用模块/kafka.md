---
title: "kafka"
---


# 概述

`kafka-python` 是一个纯 Python 实现的 Kafka 客户端库，适用于对 Kafka 的简单操作和中小规模的消息处理需求。尽管其性能可能不如基于 `librdkafka` 的 `confluent-kafka-python`，但它仍然是一个功能全面且易于使用的选择。

以下是对 `kafka-python` 的详细介绍，包括安装、基本用法和常见操作示例。

## 安装

首先，使用 pip 安装 `kafka-python`：

```sh
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple kafka-python
```

## 生产者使用示例

以下是使用 `kafka-python` 创建 Kafka 生产者并发送消息的示例：

```python
from kafka import KafkaProducer

# 创建生产者实例
producer = KafkaProducer(bootstrap_servers='localhost:9092')  # 替换为你的 Kafka 服务器地址

# 发送消息
producer.send('my_topic', key=b'my_key', value=b'Hello, Kafka!')

# 刷新网络缓冲区，使所有消息都被发送
producer.flush()

# 关闭生产者
producer.close()
```

## 消费者使用示例

以下是使用 `kafka-python` 创建 Kafka 消费者并接收消息的示例：

```python
from kafka import KafkaConsumer

# 创建消费者实例
consumer = KafkaConsumer(
    'my_topic',
    bootstrap_servers='localhost:9092',  # 替换为你的 Kafka 服务器地址
    group_id='my_group',
    auto_offset_reset='earliest'
)

# 消费消息
for message in consumer:
    print(f"Received message: {message.value.decode('utf-8')}")

# 关闭消费者
consumer.close()
```

## 高级功能

### 分区和键控消息

你可以将消息发送到特定的分区，或使用键控消息来确保具有相同键的消息发送到同一分区：

```python
# 发送到特定分区
producer.send('my_topic', key=b'my_key', value=b'Hello, Kafka!', partition=0)
```

### 批量发送

`kafka-python` 支持异步发送消息，可以批量发送以提高性能：

```python
# 批量发送消息
for i in range(100):
    producer.send('my_topic', key=b'my_key', value=f'Hello, Kafka! {i}'.encode('utf-8'))

# 刷新网络缓冲区，使所有消息都被发送
producer.flush()
```

### 消费者偏移提交

消费者可以手动提交偏移，以确保在处理消息后偏移被正确记录：

```python
for message in consumer:
    # 处理消息
    print(f"Received message: {message.value.decode('utf-8')}")
    
    # 手动提交偏移
    consumer.commit()
```

### 处理错误

可以通过捕获异常来处理 Kafka 连接或消息处理中的错误：

```python
try:
    for message in consumer:
        print(f"Received message: {message.value.decode('utf-8')}")
except Exception as e:
    print(f"Error occurred: {e}")
finally:
    consumer.close()
```

### 连接 Kafka 集群

`kafka-python` 支持连接到 Kafka 集群，只需提供集群中所有 broker 的地址：

```python
producer = KafkaProducer(bootstrap_servers=['broker1:9092', 'broker2:9092'])
consumer = KafkaConsumer('my_topic', bootstrap_servers=['broker1:9092', 'broker2:9092'])
```

## 完整示例

以下是一个完整的生产者和消费者示例，展示了如何使用 `kafka-python` 进行消息的生产和消费：

```python
# 生产者
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers='localhost:9092')
for i in range(10):
    producer.send('my_topic', key=b'my_key', value=f'Hello, Kafka! {i}'.encode('utf-8'))
producer.flush()
producer.close()

# 消费者
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    'my_topic',
    bootstrap_servers='localhost:9092',
    group_id='my_group',
    auto_offset_reset='earliest'
)
for message in consumer:
    print(f"Received message: {message.value.decode('utf-8')}")
consumer.close()
```

`kafka-python` 是一个功能全面且易于使用的 Kafka 客户端库，适用于大多数 Kafka 使用场景。通过了解其基本和高级功能，你可以有效地在 Python 项目中使用 Kafka 进行消息处理。



# topic 常用操作

## 创建

```py
from kafka.admin import KafkaAdminClient, NewTopic
from kafka.errors import KafkaError

# Kafka 服务器地址
bootstrap_servers = 'localhost:9092'

# 创建 KafkaAdminClient 实例
admin_client = KafkaAdminClient(bootstrap_servers=bootstrap_servers)

try:
    # 创建一个名为 "my_topic" 的新 topic，它将有 3 个分区和一个复制因子
    new_topic = NewTopic(name="my_topic", num_partitions=3, replication_factor=1)
    
    # 使用 KafkaAdminClient 创建 topic
    admin_client.create_topics([new_topic])
    
    print("Topic 创建成功！")
    
except KafkaError as e:
    print("Error:", e)

finally:
    # 关闭 admin client 连接
    admin_client.close()
```

这段 Python 代码会创建一个名为 `my_topic` 的 topic，它将有 3 个分区，并且复制因子设置为 1。确保你已经安装了 `kafka-python`，你可以使用 `pip install kafka-python` 来安装。



## 列出所有

```py
from kafka import KafkaAdminClient
from kafka.errors import KafkaError

# Kafka 服务器地址
bootstrap_servers = 'localhost:9092'

# 创建 KafkaAdminClient 实例
admin_client = KafkaAdminClient(bootstrap_servers=bootstrap_servers)

try:
    # 获取 Kafka 中的所有 topic
    topics = admin_client.list_topics()
    
    # 输出所有 topic
    print("Kafka 中的所有 topic:")
    for topic in topics:
        print(topic)
        
except KafkaError as e:
    print("Error:", e)

finally:
    # 关闭 admin client 连接
    admin_client.close()
```

## 删除