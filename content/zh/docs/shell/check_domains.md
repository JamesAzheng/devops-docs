---
title: "域名解析测试脚本"
---
## 域名检查脚本

这个shell脚本用于批量检查域名列表中的每个域名是否能够被解析，并输出可解析域名的IP地址。

### 使用方式

1. 准备一个包含域名列表的文本文件，每行一个域名，空行和以#开头的行将被忽略。
2. 执行脚本并将文件路径作为参数传递：./check_domains.sh /path/to/domains.txt3. 脚本将输出每个可解析域名及其对应的IP地址。

### 脚本代码
```sh
#!/bin/bash

# 检查是否提供了文件
if [ $# -eq 0 ]; then
    echo "请提供一个包含域名的文件作为参数"
    exit 1
fi

# 读取域名列表文件
domain_file=$1

# 检查文件是否存在
if [ ! -f "$domain_file" ]; then
    echo "文件 $domain_file 不存在"
    exit 1
fi

# 遍历域名列表
while IFS= read -r domain; do
    # 跳过空行和以#开头的注释行
    if [[ -z "$domain" || "$domain" =~ ^# ]]; then
        continue
    fi

    # 使用nslookup测试域名解析并提取IP地址
    result=$(nslookup "$domain" 2>/dev/null)

    # 根据nslookup返回的状态码判断是否能解析
    if [ $? -eq 0 ]; then
        # 提取IP地址
        ip=$(echo "$result" | awk '/^Address: / {print $2}')
        echo "$domain 能被解析，IP地址: $ip"
    fi
done < "$domain_file"
```
### 示例

假设你有一个文件`domains.txt`，内容如下：
```
# 重要域名列表
example.com
nonexistent-domain.example
google.com
```
执行脚本：
`./check_domains.sh domains.txt`
输出可能是：
```
example.com 能被解析，IP地址: 93.184.216.34
google.com 能被解析，IP地址: 142.250.187.110
```
