---
title: "C"
---

## C、C++的源码编译：

使用 make 项目管理器

confifigure脚本 --> Makefifile.in --> Makefifile

相关开发工具：

autoconf: 生成confifigure脚本

automake：生成Makefifile.in



### C语言源代码编译安装过程

利用编译工具，通常只需要三个大的步骤

- **./confifigure**

  (1) 通过选项传递参数，指定安装路径、启用特性等；执行时会参考用户的指定以及Makefifile.in文件生成Makefifile

  (2) 检查依赖到的外部环境，如依赖的软件包

- **make**

  根据Makefifile文件，会检测依赖的环境，进行构建应用程序，**此步出错解决完问题后，需把之前结果删除，从头在做**

- **make install** 

  复制文件到相应路径

**注意：安装前可以通过查看README，INSTALL获取帮助**

