---
title: "JVM"
---

## JVM 概述

- Java Virtual Machine，Java 虚拟机

```bash
## Oracle JDK8，默认的JVM是：HotSpot
## java -version
java version "1.8.0_311"
Java(TM) SE Runtime Environment (build 1.8.0_311-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.311-b11, mixed mode)

---

## Open JDK8
## java -version
openjdk version "1.8.0_312"
OpenJDK Runtime Environment (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM (build 25.312-b07, mixed mode)
```

- Oracle 默认的 JVM 是 HotSpot，HotSpot 也是目前最主流的虚拟机
- 安卓程序也运行在 JVM 上，其默认的虚拟机是 Google 自研的 Java 虚拟机 Dalvik





## JVM 组成

<img src="/docs/编程语言/Java/jvm.png" alt="jvm" style="zoom: 67%;" />



## Class Loading Subsystem

- 类加载子系统
- 使用 Java 语言编写 .java Source Code 文件，通过 Javac 编译成 .class Byte Code 文件
- class loader 类加载器将所需所有类加载到内存，必要时将类实例化成实例
- **类：**java中的类是程序的组织单位，类有自己的属性和方法，比如小猫是一个类，它要吃饭，喝水这些都是方法，自身的属性包括爪子，眼睛等。



## Runtime Data Areas

- 运行时数据区
- 最消耗内存的空间，需要优化，但**能优化的只有堆内存**，其他地方都是由 Java 内部自身控制的

### Method Area

- 方法区（线程共享）
- **有的资料中把方法区也划分到了堆内存分代当中，称之为永久代 Permanent Generation，又称元空间 Meta Space**

- 所有线程共享的内存空间，存放已加载的类信息(构造方法，接口定义)，常量(final)，静态变量(static)，运行时常量池等。**但实例变量存放在堆内存中**

### Heap

- 堆（线程共享）
- **只有这里能优化**

- 虚拟机启动时创建，存放创建的所有对象信息。
- 如果对象无法申请到可用内存将抛出OOM异常
- 堆是靠GC垃圾回收器管理的，通过-Xmx-Xms 指定最大堆和最小堆空间大小

### Java Threads

- 栈（线程私有）；Java stack

- 每个线程会分配一个栈，存放Java中8大基本数据类型，对象引用，实例的本地变量，方法参数和返回值等，基于FILO() (first in last out)，每个方法为一个栈帧


### Program Counter Registers

- PC寄存器（线程私有）

- 就是一个指针，指向方法区中的方法字节码，每一个线程用于记录当前线程正在执行的字节码指令地址。由执行引擎读取下一条指令，因为线程需要切换，当一个线程被切换回来需要执行的时候，知道执行到哪里了


### Native Internal Threads

- 本地方法栈（线程私有）

- 为本地方法执行构建的内存空间，存放本地方法执行时的局部变量，操作数等。所谓本地方法，使用native关键字修饰的方法
  - 比如：thread.sleep方法，简单的说是非Java实现的方法，例如操作系统的C编写的库提供的本地方法，Java调用这些本地方法接口执行。但是要注意，本地方法应该避免直接编程使用，因为Java可能跨平台使用，如果用了Windows API，换到了Linux平台部署就会有问题



## Execution Engine

- 执行引擎
- 包括 JIT（just in time compiler）即时编译器，GC垃圾回收器



## Native Method Interface

- 本地方法接口
- 将本地方法栈通过JNI（java native interface）调用 native method libraries 本地方法库
  - 比如：C,C++库等，扩展Java功能，融合不同的编程语言为Java所用





## ---

## 堆内存分代

<img src="/docs/编程语言/Java/堆内存分代.png" alt="堆内存分代" style="zoom: 50%;" />

- 参考文档：https://blog.sysco.no/weblogic/WebLogic-JVM-setup-problems/

## 年轻代 Young Generation

**伊甸园区 eden**

- 只有一个，存放刚刚创建的对象

**幸存区 Survivor Space**

- 存放 GC 后存活的对象
- 有两个幸存区，一个是 from 区 即S0，一个是to区 即S1，大小相等、地位相同、可互换（哪个为空哪个就是 to）
- from：指的是本次复制数据的源区
  
- to：指的是本次复制数据的目标区



## 老年代 Old Generation

- 存放 初始较大的对象 或 多次GC后依然存活的对象（默认15次GC）



## 永久代 Permanent Generation

- JDK1.8 后改名为元空间 MetaSpace
- 有的资料中把永久代也划分到堆内存中，有的资料中没有将永久代划分到堆内存中
  - 比如说 Tomcat 状态页中就未将 MetaSpace 划分到堆内存中
  - 而 java -XX:PrintGCDetails 显示的结果中将 MetaSpace 划分到堆内存中了
- **此空间不存在垃圾回收，关闭 JVM 会释放此区域内存**
- **此空间物理上不属于heap内存，但逻辑上存在于heap内存中**
  - 因为堆内存使用量 = 年轻代 + 老年代 的使用量，所以永久代物理上不属于堆内存

- 永久代必须指定使用内存的大小限制，字符串常量 JDK1.7 存放在永久代，1.8 后存放在 heap 中
- MetaSpace 可以指定使用内存的大小限制，也可以不指定 但会无上限



## 其它说明

**默认空间大小比例：**

- 假设将 年轻代 和 老年代总共划分为三十份，那么年轻代占十份（eden 8；S0 1；S1 1；），老年代占二十份

**默认值：**

- 默认 JVM 试图分配的最大内存为 总内存的1/4；初始化默认总内存为 总内存的1/64

**规律：**

- 一般情况 99% 的对象都是临时对象（存活时间很短，过一会就成垃圾了 需要回收了）





## Garbage Collection（GC）

- Garbage Collection  垃圾收集器，**只有运行时数据区的堆有垃圾 需要回收 其他地方没有垃圾**

## GC 概述

- 在堆内存中 如果创建的对象不再使用，仍占用着内存 此对象则为垃圾 需要进行回收 进而释放内存空间 给其他对象使用
- 堆内存中 经常创建、销毁对象，内存也是被使用、释放。如不妥善处理 会出现即使有足够的内存容量 但依旧无法分配出可用的内存空间 因为没有连续成片的内存了，内存都是碎片化的空间
- 所有需要有合适的垃圾回收机制 确保正常释放不再使用的内存空间，还需要保证内存空间尽可能的连续

**垃圾回收需要考虑的三个问题：**

- 哪些是垃圾要回收？
- 怎么回收垃圾？
- 什么时候回收垃圾？



## 垃圾确定方法

JVM 中有两种垃圾确定方法，分别是 引用计数 和 根可达算法。

### 引用计数

- 每一个堆内对象上都有一个私有引用计数器，记录着被引用的次数，引用计数清零，该对象所占用堆内存就可以被回收。
- **但是循环引用的对象都无法将引用计数归零，就无法清除。**
- python 中即使用此方式

### 根可达算法

- Root Searching
- 从根开始（也就是变量或本地接口开始），不可达的对象即为垃圾



## 垃圾回收算法

实际 Java 对垃圾回收采用的是多种算法综合使用，而非单一的某一种算法

- 即针对不同的堆内存分代采用不同的垃圾回收算法，比如：
  - 幸存区多采用 复制 算法
  - 老年代多采用 标记-压缩 算法

### Mark-Sweep

Mark-Sweep 标记-清除

- 分为垃圾标记阶段 和 内存释放阶段。
- 标记阶段，基于引用计数 或 根可达算法，标记出所有需要回收的对象
- 清理阶段，遍历整个堆，回收被标记的对象所占用的空间
- **优点：速度快、效率高**
- **缺点：是会产生内存碎片**



### Mark-Compact

Mark-Compact 标记-压缩(压实)，又称标记整理

- 分垃圾标记阶段 和 内存整理阶段。
- 标记阶段，基于引用计数 或 根可达算法，标记出所有需要回收的对象
- 内存清理阶段，整理时将可访问的对象向内存一端移动，不可访问的对象直接清理。
- **优点：整理后内存空间连续分配，有大段的连续内存可分配，没有内存碎片**
- **缺点：是内存整理过程有消耗，效率相对低下**



### Copying

Copying 复制

- 先将可用内存分为大小相同两块区域 A 和 B，每次只用其中一块
- 比如先使用 A，当 A 用完后，同样根据垃圾回收算法对垃圾进行标记，然后将 A 中存活的对象复制到 B。复制到 B 的时候连续的使用内存，最后将 A 一次性清除干净


- **优点：是没有内存碎片，复制过程中保证对象使用连续空间**

- **缺点：是比较浪费内存，只能使用原来一半的内存，因为内存对半划分了**



### 垃圾回收算法总结

- **效率**：复制算法 > 标记清除算法 > 标记压缩算法
- **内存整齐度**：复制算法 = 标记压缩算法 > 标记清除算法
- **内存利用率**：标记压缩算法 = 标记清除算法 > 复制算法

**其他说明**

- 没有最好的算法，但可以在不同场景选择最合适的算法
- 不同分区对数据实施不同回收策略，分而治之



## STW

- 对于大多数垃圾回收算法而言，GC线程工作时，停止所有工作的线程，称为**Stop The World**。GC 完成时，恢复其他工作线程运行。这也是JVM最头疼的问题
- 这也是安卓手机运行慢的原因之一



## 垃圾收集方式

按**工作模式**不同：（指的是 GC 线程和工作线程是否在一起运行）

- 独占垃圾回收器：只有 GC 线程在工作，**STW** 一直进行到回收完毕，工作线程才能继续执行
- 并发垃圾回收器：让 GC 线程垃圾回收**某些阶段**可以和工作线程一起进行
  - 如：标记阶段并行；回收阶段仍然串行

按**回收线程**数：（指的是 GC 线程是否串行或并行执行）

- 串行垃圾回收器：一个 GC 线程完成回收工作
- 并行垃圾回收器：多个 GC 线程同时一起完成回收工作，充分利用CPU资源



## 垃圾回收器

- Java 8 之前不同分代采用不同的垃圾回收器，9 以后不再按照分代使用不同的垃圾回收器

### 新生代 垃圾回收器

#### Serial

- 新生代**串行**收集器 Serial

- 单线程、独占式串行，采用**复制算法**，简单高效，但会造成 STW

#### Parallel Scavenge

- 新生代**并行**收集器 Parallel Scavenge

- 多线程并行，独占式，采用**复制算法**，会产生 STW
- 关注调整吞吐量，此收集器关注点是达到一个可控制的吞吐量
  - 吞吐量 = 运行用户代码时间 / (运行用户代码时间 + 垃圾收集时间)
  - 比如虚拟机总共运行 100 分钟，其中垃圾回收花掉 1 分钟，那吞吐量就是 99%
  - 高吞吐量可以高效率利用 CPU 时间，尽快完成运算任务，主要适合在**后台运算**而不需要太多交互的任务
- 除此以外，Parallel Scavenge 收集器具有自适应调节策略，它可以将内存管理的调优任务交给虚拟机去完成。
  - 自适应调节策略也是 Parallel Scavenge 与 ParNew 收集器的一个重要区别
- **注意：** Parallel Scavenge 和 ParNew 不同，**Parallel Scavenge 不可以和老年代的 CMS 组合，因为一个是为了吞吐量，一个是为了客户体验（也就是暂停时间的缩短）**

#### ParNew

- 新生代**并行**收集器 ParNew

- ParNew 就是 Serial 收集器的多线程版，将单线程的串行收集器 变成了多线程并行
- 独占式，使用复制算法，相当于 Parallel Scavenge 的改进版
- 经常和 CMS 配合使用，关注点是**尽可能的缩短垃圾收集时用户线程的停顿时间，适合需要与用户交互的程序**，良好的响应速度能提升用户体验





### 老年代 垃圾回收器

#### Serial Old

- 老年代串行收集器 Serial Old

- Serial Old 是 Serial 收集器的老年代版本
- 单线程、独占式串行、回收算法采用**标记压缩**

#### Parallel Old

- 老年代并行收集器 Parallel Old
- Parallel Old 收集器是 Parallel Scavenge 收集器的老年代版本
- 多线程、独占式并行、回收算法采用**标记压缩**，关注调整**吞吐量**

#### CMS

- Concurrent Mark Sweep 并发标记清除算法（收集器）
- 在某些阶段尽量使用和工作线程一起运行，减少 STW 时长(**200ms以内**)，提升响应速度，是互联网服务端 BS 系统上较佳的回收算法
- 分为四个阶段：（在初始标记、重新标记时需要 STW）
  - **初始标记**：此过程需要 STW，只标记一下 GC Roots 能直接关联到的对象，速度很快
  - **并发标记**：就是 GC Roots 进行扫描可达链的过程，为了找出哪些对象需要收集。这个过程远慢于初始标记，但是它是和用户线程一起运行的，不会出现 STW，所有用户并不会感受到
  - **重新标记**：为了修正在并发标记期间，用户线程产生的垃圾，这个过程会比初始标记时间稍微长一点，但是也很快，和初始标记一样会产生 STW
  - **并发清除**：在重新标记之后，对现有的垃圾进行清理，和并发标记一样也是和用户线程一起运行的，耗时较长（和初始标记对比的话），不会出现 STW
- 由于整个过程中，耗时最长的并发标记和并发清理都是与用户线程一起执行的，所以总体上来说，CMS 收集器的内存回收过程是与用户线程一起并发执行的



### 不分代的 垃圾回收器

#### G1

- Garbage First 收集器，JDK7 发布，JDK9 将 G1 设为默认的收集器（建议 JDK9 版本以后使用）
- 其设计目标是在多处理器、大内存服务器提供优于 CMS 收集器的吞吐量和停顿控制的回收器
- 基于**标记压缩**算法，不会产生大量的空间碎片，有利于程序的长期执行
- 分为四个阶段：（并发标记并行执行，其他阶段 STW 只有 GC 线程并行执行）
  - **初始标记**
  - **并发标记**
  - **最终标记**
  - **筛选回收**
- G1 能充分的利用多核 CPU，多核环境下的硬件优势，使用多个 CPU 来缩短 STW 停顿的时间（**10ms以内**）
- 可预测的停顿：这是 G1 相对于 CMS 的另一大优势，G1 和 CMS 一样都是关注于降低停顿时间，但是 G1 能够让使用者明确的指定在一个 M 毫秒的时间片段内，消耗在垃圾收集的时间不得超过 N 毫秒
- 通过此选项指定：+UseG1GC

#### ZGC

- 减少 STW 时长（1ms以内），可以 PK c++ 的效率，目前实验阶段

#### Shenandoah

- 和 ZGC 竞争关系，目前实验阶段

#### Epsilon

- 调试 JDK 使用，内部使用，不用于生产环境



### JDK8 默认的垃圾回收器

- Parallel Scavenge **+** Parallel Old（所以大多数都是针对此进行调优）





## GC 总结

1. 首先需要根据垃圾确定方法确定哪些是哪里（引用计数，根可达）
2. 然后使用垃圾回收算法回收垃圾
3. xxx





## 堆内存 GC 过程

## 年轻代回收 Minor GC 

- 又称 Young GC

1. 开始所有新建对象都出生在 Eden（特大对象直接进入老年代），
2. 当Eden满了则**启动GC**，先**标记** Eden 中存活的对象，然后将存活的对象**复制**到 S0（假设本次是S0，也可以是S1，两者可以调换），最后 Eden 清空剩余空间，**此次GC完成**
3. 继续新建对象，当 Eden 满了再次**启动GC**，先**标记** Eden和 S0 中存活的对象，然后将存活的对象**复制**到 S1，最后清空 Eden 和 S0 中剩余空间，**此次GC完成**
4. 继续新建对象，当 Eden 满了，**启动GC**，先**标记** Eden 和 S1 中存活的对象，然后将存活的对象复制到 S0，最后清空 Eden 和 S1 中剩余空间，**此次GC完成**

- **以后就重复上面的步骤**

**PS：**

- 通常场景下，大多数对象都不会存活很久，而且创建活动非常多，新生代就需要频繁垃圾回收

- 但是如果一个对象一直存活，它就会在 from 和 to 间来回复制
  - 如果 from 区中对象复制次数达到阈值（默认15次，CMS为6次，可通过Java的选项：**-XX:MaxTenuringThreshold=N** 来指定），就直接复制到老年代



## 老年代回收 Major GC

- 又称 Old GC、FULL GC
- 进入老年代的数据较少，所以老年代区被沾满的速度较慢，所以垃圾回收也不频繁
- 如果老年代也满了，则会触发老年代 GC
- 由于老年代中对象存活时间较长，所以通常使用 **标记-压缩** 算法
- **当老年代满时，会触发 Full GC，即对所有的"代"的内存进行垃圾回收**
  - 由于老年代对象也可以引用新生代对象，所以先进行一次 Minor GC，然后再 Major GC 会提高效率
  - 可以认为回收老年代的时候完成了一次 FULL GC




## 其它说明

**年轻代和老年代的特点：**

- 年轻代：存活时间较短，回收比较频繁
- 老年代：存活时间较长，回收不频繁

**年轻代和老年代适合的垃圾回收算法：**

- 年轻代：适合 复制算法
- 老年代：适合 标记-清除 和 标记-压缩 算法

**GC 触发条件：**

- Minor GC：当 Eden 区满了
- FULL GC：老年代满了 **或** System.gc() 手动调用 但不推荐





## ---

## JVM 优化前言

**很多场合都需要对 JVM 进行优化调整，比如：**

- WEB 领域中的 Tomcat 等
- 大数据领域的 Hadoop 生态各组件
- 消息中间件领域的 Kafka 等
- 搜索引擎领域的 ElasticSearch、Solr 等



**注意：在不同领域和场景对 JVM 需要不同的调整策略，主要的优化目标是：**

- 减少 STW 时长，串行变并行
- 减少 GC 次数，要分配合适的内存大小



**一般情况下，我们大概可以使用以下原则：**

- 客户端或较小的程序，内存使用量不大的，可以使用串行回收
- 对于服务端大型计算，可以使用并行回收
  - 如：xxx？
- 以展示为主的网站，提高用户访问体验，尽量少的 STW，可以使用并行回收
  - 比如：电商网站展示页面



## Java 内存调整相关参数

## Java 选项分类

- **-选项名称**：标准选项，所有 HotSpot 都支持
- **-X选项名称**：稳定的非标准选项
- **-XX:选项名称**：非标准的不稳定选项，下一个版本可能会取消



## Java 选项帮助

- https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html
- man java

```bash
## 查看Java的标准选项
java

## 查看Java的非标准选项
java -X

------------------------------------------------------------------------------

## 如果不将标准错误隐藏输出 2> /dev/null 则还会显示 java 的选项说明

## 查看所有不稳定选项的当前生效值
java -XX:+PrintFlagsFinal 2> /dev/null

## 查看所有不稳定选项的默认值
java -XX:+PrintFlagsInitial 2> /dev/null

## 查看当前命令行的使用的选项设置
## 如果显示：-XX:useParallelGC 说明当前使用 Parallel Scavenge + Parallel old
java -XX:+PrintCommandLineFlags 2> /dev/null
```



## Java 常用选项说明

### 基础优化项

#### -Xms

- 设置应用程序**初始**使用的堆内存大小（年轻代+老年代）

- 此值设置的太小 也会导致 OOM

- ```bash
  # 通常数值与-Xmx保持一致
  -Xms4g
  ```

#### -Xmx

- 设置应用程序能获得的**最大**堆内存，早期 JVM 不建议超过32G 超过会导致内存管理效率下降

- 此值设置的太小 也会导致 OOM

  - 假设操作系统有8g内存 而设置最大能获得堆内存为4g 而程序需要5g，则就会产生 OOM

- ```bash
  # 通常数值与-Xms保持一致
  -Xmx4g
  ```

#### -XX:NewSize

- 设置初始新生代大小

- ```bash
  -XX:NewSize=1g
  ```

#### -XX:MaxNewSize

- 设置最大新生代内存空间

- ```bash
  -XX:MaxNewSize=1g
  ```

#### -Xmnsize

- 同时设置 -XX:NewSize 和 -XX:MaxNewSize，代替两者

- ```bash
  -Xmn1g
  ```

**-XX:NewRatio**

- 以比例方式设置新生代和老年代

- ```bash
  -XX:NewRatio=2 new/old=1/2
  ```

#### -XX:SurvivorRatio

- 以比例方式设置 Eden 和 survivor ( S0 或 S1 )

- ```bash
  -XX:SurvivorRatio=6 eden/survivor=6/1 new/survivor=8/1
  ```

#### -Xss

- 设置每个线程私有的栈空间大小，依据具体线程大小和数量

- ```bash
  -Xss256k
  ```









## 查看 JVM 内存分配范例

- **查看 JVM 默认分配内存（字节为单位）**
- 如果不将标准错误隐藏输出 `2> /dev/null` 则还会显示 java 的选项说明

```bash
## java -XX:+PrintCommandLineFlags 2> /dev/null 
-XX:InitialHeapSize=15424192 -XX:MaxHeapSize=246787072 -XX:+PrintCommandLineFlags -XX:+UseCompressedClassPointers -XX:+UseCompressedOops

## free -h
          total        used        free      shared  buff/cache   available
Mem:      941Mi       248Mi       472Mi       6.0Mi       219Mi       545Mi
Swap:        0B          0B          0B

---

## 将初始堆内存的结果转化为 M
## echo 15424192/1024/1024 | bc
14
## 将系统总内存与初始堆内存相除，所以得到JVM默认初始堆内存 约等于总内存的1/64
## echo 941/14 | bc
67

---

## 将最大堆内存的结果转化为 M
## echo 246787072/1024/1024 | bc
235
## 将系统总内存与最大堆内存相除，所以得到JVM默认分配最大堆内存 约等于总内存的1/4
## echo 941/235 | bc
4
```



## 查看 JVM 内存分配的 shell 脚本

- heap.sh
- 何用？？？？

```bash
#!/bin/bash
## #********************************************************************
#Author:	     	xiangzheng
#QQ: 			    767483070
#Date: 		     	2022-01-07
#FileName：		    heap.sh
#URL: 		    	https://www.xiangzheng.vip
#Email: 		    rootroot25@163.com
#Description：		The test script
#Copyright (C): 	2022 All rights reserved
#********************************************************************

DEAP_SIZE=`java -XX:+PrintCommandLineFlags 2> /dev/null`

initdeap(){
INIT_BYTE=`echo ${DEAP_SIZE} |awk '{print $1}'|awk -F= '{print $2}'`
INIT_COUNT_M=`echo "${INIT_BYTE}/1024/1024" | bc`
echo "total=${INIT_BYTE}byte ${INIT_COUNT_M}MB"
}
maxdeap(){
MAX_BYTE=`echo ${DEAP_SIZE} |awk '{print $2}'|awk -F= '{print $2}'`
MAX_COUNT_M=`echo "${MAX_BYTE}/1024/1024" | bc`
echo "max=${MAX_BYTE}byte ${MAX_COUNT_M}MB"
}

initdeap

maxdeap
```

- 测试

```bash
#查看当前JVM内存的默认分配情况
## bash heap.sh 
total=15424192byte 14MB
max=246787072byte 235MB

## free -h
              total        used        free      shared  buff/cache   available
Mem:          941Mi       304Mi       205Mi        24Mi       431Mi       466Mi

#指定内存空间
```





## ---

## JMX

- Java Management Extension ；Java 管理扩展
- JMX 是一个为应用程序、设备、系统等植入管理功能的框架
- JMX 可以跨越一系列异构操作系统平台、系统体系结构和网络传输协议，灵活的开发无缝集成的系统、网络和服务管理应用
- **任何 Java 程序都可以开启 JMX，JMX 最常见的场景是监控 Java 程序的基本信息和运行情况（配合 Zabbix 或 Prometheus等） 以及使用 jconsole 或 visual VM 进行预览**

## 开启 JMX

- **为一般程序开启 JMX：**

```bash
## 在Java程序启动时添加以下参数
-Djava.rmi.server.hostname=192.168.1.2 # jmx服务端IP

-Dcom.sun.management.jmxremote.port=6666 # jmx监听端口

-Dcom.sun.management.jmxremote.ssl=false # 不启用ssl连接

-Dcom.sun.management.jmxremote.authenticate=false # 不启用授权
```

- **tomcat 开启 JMX：**

```bash
## vim /usr/local/tomcat/bin/catalina.sh
...
CATALINA_OPTS="${CATALINA_OPTS} -Djava.rmi.server.hostname=$(hostname -I | awk '{print $1}')"
#CATALINA_OPTS="${CATALINA_OPTS} -Djava.rmi.server.hostname=10.0.0.18"
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote=true"
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote.port=12345"
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote.ssl=false"
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote.authenticate=false"


## 说明：
CATALINA_OPTS="${CATALINA_OPTS} -Djava.rmi.server.hostname=JMX_HOST" #tomcat(Java程序)运行主机的IP地址，如果要在多台主机运行可以采用变量的方式获取当前主机的IP：$(hostname -I | awk '{print $1}')"
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote=true" #启动远程监控JMX
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote.port=JMX_PORT" #JMX监听的端口号，要和zabbix添加主机时候的端口一致即可 
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote.ssl=false" #不启用ssl连接
CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote.authenticate=false" #不启用授权
```



## ---

## JVM 常用工具

- JVM 相关工具位于 `$JAVA_HOME/bin` 下

## jps

- 查看所有 jvm 进程

### syntax

```bash
usage: jps [-help]
       jps [-q] [-mlvV] [<hostid>]

Definitions:
    <hostid>:      <hostname>[:<port>]
```

### option

```bash
-q # 静默模式
-v # 显示传递给jvm的命令行参数
-m # 输出传入main方法的参数
-l # 输出main类或jar完全限定名称
-v # 显示通过flag文件传递给jvm的参数
<hostid> # 主机id，默认为localhost
```

### example

```sh
## 显示Java进程
## jps
2502 Jps


## 列出当前Java进程的详细信息
## jps -lv
2512 sun.tools.jps.Jps -Denv.class.path=/usr/local/jdk/lib/:/usr/local/jdk/jre/lib/ -Dapplication.home=/usr/local/jdk1.8.0_333 -Xms8m
```



## jinfo

- 查看进程的运行环境参数，主要是jvm命令行参数
- 输出给定的Java进程的所有配置信息

### example

```bash
## 获取Java进程ID
## jps 
2543 Jps


## 打印配置信息（此处报错是因为没有运行Java进程，而jps进程是运行一次就关闭的Java进程）
## jinfo 2543
Attaching to process ID 2543, please wait...
Error attaching to process: sun.jvm.hotspot.debugger.DebuggerException: cannot open binary file
sun.jvm.hotspot.debugger.DebuggerException: sun.jvm.hotspot.debugger.DebuggerException: cannot open binary file
	at sun.jvm.hotspot.debugger.linux.LinuxDebuggerLocal$LinuxDebuggerLocalWorkerThread.execute(LinuxDebuggerLocal.java:163)
...
```



## jstat

- 对 jvm 应用程序的资源和性能进行实时监控，输出指定的java进程的统计信息

### syntax

```sh
jstat -<option> [-t] [-h<lines>] <vmid> [<interval> [<count>]]


interval # 时间间隔，单位毫秒
count # 显示的次数
```

### option

```bash
## jstat -options
-class # class loader
-compiler
-gc
-gccapacity # 统计堆中各代的容量
-gccause
-gcmetacapacity
-gcnew # 新生代
-gcnewcapacity
-gcold # 老年代
-gcoldcapacity
-gcutil
-printcompilation
```

### example

```bash
## jps 
2903 Jps

## jstat -gc 2903

## 三次，一秒一次
## jstat -gcnew 2903 1000 3
```



## jstack

- 查看所有Java进程中线程的运行状态，也是程序员常用的堆栈情况查看工具

### syntax

```bash
Usage:
    jstack [-l] <pid>
        (to connect to running process)
    jstack -F [-m] [-l] <pid>
        (to connect to a hung process)
    jstack [-m] [-l] <executable> <core>
        (to connect to a core file)
    jstack [-m] [-l] [server_id@]<remote server IP or hostname>
        (to connect to a remote debug server)

Options:
    -F  # 当使用 "jstack -l PID" 无响应时，可以使用 -F 强制输出信息
    -m  # 混合模式，既输出Java堆栈信息，也输出C/C++堆栈信息
    -l  # 会显示额外的锁信息，因此 发生死锁时常用此选项
```



## jmap

- 查看jvm占用物理内存的状态（查看堆内存的使用状态）

### example

```bash
jmap -heap <pid>
```



## jhat

- 堆内存分析工具



## jvisualvm

- 图形工具



## jconsole

- 图形工具
- 

### 安装依赖包

```bash
## centos
xorg-x11-xauth xorg-x11-fonts-* xorg-x11-font-utils xorg-x11-fonts-Type1 libXtst


## Ubuntu
...
```

### example

```bash
## 声明环境变量
## export DISPLAY=10.0.0.1:0.0


## 启动jconsole
## jconsole

## Windows中的路径：
C:\Program Files\Java\jdk1.8.0_251\bin\jconsole.exe
```





## 第三方工具

## Jprofile

- 收费，但有破解版，可以具体定位 OOM 出现在哪里（老年代满了则会产生 OOM）



