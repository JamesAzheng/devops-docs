---
title: "psutil"
---


# Process()

在Python中，有一些库可以用来控制进程的CPU亲缘性绑定，比如`psutil`和`os.sched_setaffinity`。

`psutil`库提供了跨平台的系统信息查询和进程管理功能，可以用来设置进程的CPU亲缘性绑定。以下是使用`psutil`库的示例：

```python
import psutil

def bind_process_to_cores(process_id, core_list):
    p = psutil.Process(process_id)
    p.cpu_affinity(core_list)

# 示例：将进程绑定到CPU核心0和1
process_id_to_bind = 1234  # 替换为你的进程ID
cores_to_bind = [0, 1]     # 替换为你想要绑定的CPU核心列表

bind_process_to_cores(process_id_to_bind, cores_to_bind)
```

这个示例使用`psutil.Process`获取特定进程，并使用`cpu_affinity`方法将其绑定到指定的CPU核心列表上。

