# 连接错误

**ERROR 1129 (HY000): Host '10.0.0.203' is blocked because of many connection errors; unblock with 'mysqladmin flush-hosts'**

- 解决方法：
  1. 在MySQL节点上执行 flush hosts;