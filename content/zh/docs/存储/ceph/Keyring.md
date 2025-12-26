---
title: "Keyring"
---

# 前言

我们知道ceph作为一个分布式存储系统，用户想要在其上面存储数据，首先得通过认证以后，才能正常使用ceph；那么对于ceph来讲，它是怎么认证用户的呢？除了认证，我们知道不是所有用户都能在ceph上创建存储池，删除存储池等；这也意味着每个用户都有一定的权限，在自己的权限范围内操作，ceph才算得上是一个安全的存储系统；那么ceph的认证和授权到底是怎么做的呢？



# Ceph X

https://docs.ceph.com/en/pacific/rados/configuration/auth-config-ref/?highlight=cephx#

- cephx 协议是一种协议，Ceph 使用 cephx 协议对客户端进行身份认证；
- cephx 用于对 ceph 保存的数据进行认证访问和授权，用于对访问 ceph 的请求进行认证和授权检测，**与 mon 通信的请求都要经过 ceph 认证通过**，但是也可以在 mon 节点关闭 cephx 认证，但是关闭认证之后任何访问都将被允许，因此无法保证数据的安全性。





# Ceph X 认证流程

https://docs.ceph.com/en/pacific/architecture/#high-availability-authentication

- **每个 mon 节点都可以对客户端进行身份认证并分发秘钥**，因此多个 mon 节点就不存在单点故障和认证性能瓶颈。
- mon 节点会返回用于身份认证的数据结构，其中包含获取 ceph 服务时用到的 session key, session key 通过客户端秘钥进行加密
  - 秘钥是在客户端提前配置好的， 在类似于 /etc/ceph/ceph.client.admin.keyring 的keyring文件中；
- 客户端使用 session key 向 mon 请求所需要的服务，mon 向客户端提供一个 tiket，用于向实际处理数据的 OSD 等服务验证客户端身份，MON 和 OSD 共享同一个 secret，因此 OSD 会信任有 MON 发放的 tiket，且 tiket 存在有效期。

**注意：**

- CephX 身份验证功能仅限制在 Ceph 的各组件之间，不能扩展到其他非 Ceph 组件
- Ceph 只负责认证授权，不能解决数据传输的加密问题
- ceph 用户需要拥有存储池访问权限，才能读取和写入数据
- ceph 用户必须拥有执行权限才能使用 ceph 的管理命令

## 第一阶段

![cephauth-1](/docs/存储/ceph/cephauth-1.png)

- 客户端请求创建用户，mon创建用户并返回与共享密钥给客户端；
  - 这个用户通常需要管理员手动进行创建，且此密钥在客户端与服务端都需要存在。




## 第二阶段

![cephauth-2](/docs/存储/ceph/cephauth-2.png)

- 客户端向mon发起认证，认证成功，mon会返回一个session key；
- 在规定时效范围内，客户端拿着session key向mon请求ticket；
- mon 生成 ticket 并用对应 session key 加密；
- 客户端收到对应 mon 返回的数据用 session key 解密，拿到ticket；



## 第三阶段

![cephauth-3](/docs/存储/ceph/cephauth-3.png)

- 最后客户端拿着对应当 ticket 去 mds 或者 osd 进行数据存取操作，对应组件会被认证通过，因为mon 和 mds、osd 之间都是共享 secret；
  - 通常只有cephfs的客户端需要与mds进行交互，redosgw、rdb的客户端仅与osd进行交互。








# Ceph 用户

- 用户是指 个人(ceph 管理者) 或 系统参与者(MON/OSD/MDS)。
  - 类似于k8s中的 UserAccount & ServiceAccount
- 通过创建用户，可以控制用户或哪个参与者能够访问 ceph 存储集群、以及可访问的存储池及存储池中的数据。
- ceph 支持多种类型的用户，但**可管理的用户都属于 client 类型**。
  - 区分用户类型的原因在于，MON/OSD/MDS 等系统组件特使用 cephx 协议，但是它们为非客户端。
- 通过点号来分割用户类型和用户名，格式为 TYPE.ID，例如 client.admin。

```sh
[root@ceph-node2 ~]# cat /etc/ceph/ceph.client.admin.keyring 
[client.admin] 
    key = AQAGDKJfQk/dAxAA3Y+9xoE/p8in6QjoHeXmeg== 
    caps mds = "allow *" 
    caps mgr = "allow *" 
    caps mon = "allow *" 
    caps osd = "allow *"
```





# Ceph 授权和使能

https://docs.ceph.com/en/latest/rados/operations/user-management/#authorization-capabilities

- 无论 Ceph 客户端是何类型，Ceph 都会在存储池中将所有数据存储为对象；
  - Ceph 用户需要拥有存储池访问权限才能读取和写入数据；
  - Ceph 用户必须拥有执行权限才能使用Ceph 的管理命令；
- Ceph 基于使能/能力(Capabilities，简称 caps )来描述用户可针对 MON/OSD 或 MDS 使用的授权范围或级别。
  - 典型的用户至少对 Ceph monitor 具有读取功能，并对 Ceph OSD 具有读取和写入功能。
  - 用户的 OSD 权限通常限制为只能访问特定的存储池。
    - **注意：用户的 OSD 权限通常应该限制为只能访问特定的存储池，否则，他将具有访问集群中所有存储池的权限**
- **PS：**想k8s等客户端需要使用ceph作为存储时，通常应该参考其官方文档来查询需要具体哪些能力，以避免权限不足或权限过大等问题的发生。

## 能力一览表

```sh
r # 向用户授予读取权限。访问监视器以检索 CRUSH 运行图时需具有此能力。 
w # 向用户授予针对对象的写入权限。 
x # 授予用户调用类方法（包括读取和写入）的能力，以及在监视器中执行 auth 操作的能力。
    class-read # 授予用户调用类读取方法的能力，属于是 x 能力的子集。 
    class-write # 授予用户调用类写入方法的能力，属于是 x 能力的子集。 
* # 授予用户对特定守护进程/存储池的读取、写入和执行权限，以及执行管理命令的能力。 

profile osd # 授予用户以某个 OSD 身份连接到其他 OSD 或监视器的权限；授予 OSD 权限，使 OSD 能够处理复制检测信号流量和状态报告(获取 OSD 的状态信息)。 

profile mds # 授予用户以某个 MDS 身份连接到其他 MDS 或监视器的权限。 

profile bootstrap-osd # 授予用户引导 OSD 的权限(初始化 OSD 并将 OSD 加入 ceph 集群)；授权给部署工具，使其在引导 OSD 时有权添加密钥。 

profile bootstrap-mds # 授予用户引导元数据服务器的权限；授权部署工具权限，使其在引导元数据服务器时有权添加密钥。
```



## MON 能力

- 包括 r/w/x 和 allow profile cap(ceph 的运行图)

```sh
mon 'allow rwx' 
mon 'allow profile osd'
```



## OSD 能力

- 包括 r、w、x、class-read、class-write(类读取)）和 profile osd(类写入)；
- 另外 OSD 能力还允许进行存储池和名称空间设置。 

```sh
osd 'allow capability' [pool=poolname] [namespace=namespace-name]
```



## MDS 能力

- 只需要 allow 或空都表示允许。

```sh
mds 'allow'
```





# Ceph 用户管理

[User Management — Ceph Documentation](https://docs.ceph.com/en/pacific/rados/operations/user-management/)

- 用户管理功能可让 Ceph 集群管理员能够直接在 Ceph 集群中创建、更新和删除用户。

## 列出所有用户

```sh
# ceph auth list
installed auth entries:

mds.stor01
	key: AQAA/Xpjh5/QERAAolTlz3Wi5WHR9hA0WajBow==
	caps: [mds] allow
	caps: [mon] allow profile mds
	caps: [osd] allow rwx
osd.0
	key: AQDF83hj2HGbMBAAoTPETs+wWWvFKtC6k+IAdA==
	caps: [mgr] allow profile osd
	caps: [mon] allow profile osd
	caps: [osd] allow *
osd.1
	key: AQDR83hj0f1jAxAAEhMkyi+GlBz+EuQTHRocyg==
	caps: [mgr] allow profile osd
	caps: [mon] allow profile osd
	caps: [osd] allow *
osd.2
	key: AQDc83hjws0fORAAW0Aqwh9YLD/AYLlHS8ivwQ==
	caps: [mgr] allow profile osd
	caps: [mon] allow profile osd
	caps: [osd] allow *
client.admin
	key: AQCn0Xhj/DhPFhAAhctzFIwATq4xfADupJxzBA==
	caps: [mds] allow *
	caps: [mgr] allow *
	caps: [mon] allow *
	caps: [osd] allow *
...
```



## 列出指定用户信息

- 针对用户采用 TYPE.ID 表示法
- 例如：osd.0 指定是 osd 类型且 ID 为 0 的用户(节点)，client.admin 是 client 类型的用户，其 ID 为 admin，

```sh
# ceph auth get osd.0
exported keyring for osd.0
[osd.0]
	key = AQDF83hj2HGbMBAAoTPETs+wWWvFKtC6k+IAdA==
	caps mgr = "allow profile osd"
	caps mon = "allow profile osd"
	caps osd = "allow *"


# ceph auth get client.admin
exported keyring for client.admin
[client.admin]
	key = AQCn0Xhj/DhPFhAAhctzFIwATq4xfADupJxzBA==
	caps mds = "allow *"
	caps mgr = "allow *"
	caps mon = "allow *"
	caps osd = "allow *"
```



## 只获取指定用户的 key 信息

- 只打印key，不打印caps能力

```sh
# ceph auth print-key client.admin
AQCn0Xhj/DhPFhAAhctzFIwATq4xfADupJxzBA==
```



## 导出用户信息

- 可以结合使用-o 文件名选项和 ceph auth list 将输出保存到某个文件。
- **注意：导出的目标文件必须是使用 `ceph-authtool --create-keyring ceph.client.kube.keyring` 创建的，否则将无keyring文件将无法使用**

```sh
# 导出所有用户信息
# ceph auth list -o 123.key


# 导出指定用户信息
# ceph auth get client.admin -o 456.key
```



## 添加用户

- 添加一个用户会创建用户名 (TYPE.ID)、机密密钥，以及包含在命令中用于创建该用户的所有能力；
- 用户可使用其密钥向 Ceph 存储集群进行身份验证；
- 用户的能力授予该用户在 Ceph monitor (mon)、Ceph OSD (osd) 或 Ceph 元数据服务器 (mds) 上进行读取、写入或执行的能力，可以使用以下几个命令来添加用户

### 方法一 auth add

- 添加用户的规范方法。它会创建用户、生成密钥，并添加所有指定的能力。

#### syntax

- `ceph auth add <entity> {<caps> [<caps>...]}`

#### example

```sh
# 创建用户、生成密钥，并添加所有指定的能力
# ceph auth add client.james mon 'allow r' osd 'allow rwx pool=mypool' 
added key for client.james


# 验证
# ceph auth get client.james
exported keyring for client.james
[client.james]
	key = AQA/pYVj8rHcJhAAaM2aP3ElkF1Ay8Dq+PBx5w==
	caps mon = "allow r"
	caps osd = "allow rwx pool=mypool"
```

### 方法二 auth get-or-create

- 如果该用户已存在，此命令只返回密钥；
- 对于只需要密钥的客户端（例如 libvirt），此命令非常有用。

#### syntax

- `ceph auth get-or-create <entity> {<caps> [<caps>...]}`

#### example

```sh
# 创建用户
# ceph auth get-or-create client.bob mon 'allow r' osd 'allow rwx pool=mypool'
[client.bob]
	key = AQBcrIVjmJ+xKhAAykM01lD3C54DK6PReemrzQ==


# 验证用户
# ceph auth get client.bob
exported keyring for client.bob
[client.bob]
	key = AQBcrIVjmJ+xKhAAykM01lD3C54DK6PReemrzQ==
	caps mon = "allow r"
	caps osd = "allow rwx pool=mypool"


# 再次创建用户，因为用户事先已存在，所以只会打印用户的key信息
# ceph auth get-or-create client.bob mon 'allow r' osd 'allow rwx pool=mypool'
[client.bob]
	key = AQBcrIVjmJ+xKhAAykM01lD3C54DK6PReemrzQ==
```



### 创建不具有能力的用户

- 不具有能力的用户可以进行身份验证，但不能执行其他操作，此类客户端无法从监视器检索集群地图;
- 如果希望稍后再添加能力，可以使用 `ceph auth caps` 为不具有能力的用户添加能力；

```sh
# 创建无能力的用户
# ceph auth add client.testuser
added key for client.testuser

# 验证
# ceph auth get client.testuser
exported keyring for client.testuser
[client.testuser]
	key = AQCWx4ZjkGWmAxAAa1GfWmZ8e+LxmtLTSVeCiA==


# 为其添加能力
# ceph auth caps client.testuser mon 'allow rw'
updated caps for client.testuser

# 验证添加的能力
# ceph auth get client.testuser
exported keyring for client.testuser
[client.testuser]
	key = AQCWx4ZjkGWmAxAAa1GfWmZ8e+LxmtLTSVeCiA==
	caps mon = "allow rw"

```



## 修改用户能力

- 使用 `ceph auth caps` 命令可以指定用户以及更改该用户的能力，**设置新能力会完全覆盖当前的能力，因此要加上之前的用户已经拥有的能和新的能力；**
- 如果看当前能力，可以运行 `ceph auth get USERTYPE.USERID`;

```sh
# 查看用户当前权限 
# ceph auth get client.james
exported keyring for client.james
[client.james]
	key = AQA/pYVj8rHcJhAAaM2aP3ElkF1Ay8Dq+PBx5w==
	caps mon = "allow r"
	caps osd = "allow rwx pool=mypool"


# 修改用户权限
# ceph auth caps client.james mon 'allow r' osd 'allow rw pool=mypool'
updated caps for client.james


# 再次验证权限
# ceph auth get client.james
exported keyring for client.james
[client.james]
	key = AQA/pYVj8rHcJhAAaM2aP3ElkF1Ay8Dq+PBx5w==
	caps mon = "allow r"
	caps osd = "allow rw pool=mypool"
```



## 删除用户

- 要删除用户使用 ceph auth del TYPE.ID，其中 TYPE 是 client、osd、mon 或 mds 之一，ID 是用户名或守护进程的 ID。

```sh
# 当前用户
# ceph auth get client.bob
exported keyring for client.bob
[client.bob]
	key = AQBcrIVjmJ+xKhAAykM01lD3C54DK6PReemrzQ==
	caps mon = "allow r"
	caps osd = "allow rwx pool=mypool"


# 删除用户
# ceph auth del client.bob
updated


# 验证
# ceph auth get client.bob
Error ENOENT: failed to find client.bob in keyring
```



## 导入用户

- 要导入一个或多个用户，请使用 `ceph auth import` 并指定密钥环

```sh
# ceph auth import -i /etc/ceph/ceph.keyring
```





# Ceph keyring 秘钥环

https://docs.ceph.com/en/latest/rados/operations/user-management/#keyring-management

- ceph 的秘钥环是一个保存了 secrets、password、keys、certificates 并且能够让客户端通认证访问 ceph 的 keyring file(集合文件)；

  - keyring file 文件中可以包含一个或者多个用户认证信息；
  - 凡是拥有此文件的节点，将具备访问 ceph 的权限，而且可以使用其中任何一个账户的权限；
  - 此文件类似于 linux 系统的中的 /etc/passwd 文件。
  - 每一个 key 都有一个实体名称加权限，类型为：
    - 
      {client、mon、mds、osd}.name

- 当客户端访问 ceph 集群时，会使用 keyring 文件查找用户并检索秘钥，ceph 会使用以下四个密钥环文件预设置密钥环设置

  - ```sh
    # 保存单个用户的 keyring
    /etc/ceph/<$cluster name>.<user $type>.<user $id>.keyring
    
    # 保存多个用户的 keyring
    /etc/ceph/cluster.keyring
    
    # 未定义集群名称的多个用户的 keyring 	
    /etc/ceph/keyring
    
    # 编译后的二进制文件
    /etc/ceph/keyring.bin
    ```

- 也可以手动指定密钥环文件

  - XXX

## 注意事项

- keyring文件一般应该保存于/etc/ceph目录中，以便客户端能自动查找
- 创建包含多个用户的keyring文件时，应该使用cluster-name.keyring作为文件名
- 创建仅包含单个用户的kerying文件时，应该使用cluster-name.user-name.keyring作为文件名，例如为 client.tom 用户创建 ceph.client.tom.keyring。



## 创建秘钥环

- 使用 ceph auth add 等命令添加的用户默认仅存在于集群中，可以使用 `ceph-authtool --create-keyring FILE` 命令为其创建用户秘钥环

```sh
# 现有用户
# ceph auth get client.james
exported keyring for client.james
[client.james]
	key = AQA/pYVj8rHcJhAAaM2aP3ElkF1Ay8Dq+PBx5w==
	caps mon = "allow r"
	caps osd = "allow rw pool=mypool"


# 创建 keyring 文件
# ceph-authtool --create-keyring ceph.client.james.keyring
creating ceph.client.james.keyring


# 验证 keyring 文件，其实就是一个空文件，但设置了严格的权限
# file ceph.client.james.keyring 
ceph.client.james.keyring: empty
# ll ceph.client.james.keyring
-rw------- 1 root root 0 Nov 29 16:19 ceph.client.james.keyring


# 导出 keyring 至指定文件
# ceph auth get client.james -o ceph.client.james.keyring
exported keyring for client.james


# 验证 keyring 文件
# cat ceph.client.james.keyring
[client.james]
	key = AQA/pYVj8rHcJhAAaM2aP3ElkF1Ay8Dq+PBx5w==
	caps mon = "allow r"
	caps osd = "allow rw pool=mypool"
```



## 将用户导入至秘钥环

```sh
# 创建 keyring 文件
ceph-authtool --create-keyring ceph.client.user.keyring

# 把指定用户的 keyring 文件内容导入到 user 用户的 keyring 文件
ceph-authtool ./ceph.client.user.keyring --import-keyring ./ceph.client.admin.keyring

# 验证 keyring 文件
[ceph@ceph-deploy ceph-cluster]$ ceph-authtool -l ./ceph.client.user.keyring

# 导入其他用户的 keyring
[ceph@ceph-deploy ceph-cluster]$ ceph-authtool ./ceph.client.user.keyring --import-keyring ./ceph.client.user1.keyring

# 再次验证 keyring 文件：
[ceph@ceph-deploy ceph-cluster]$ ceph-authtool -l ./ceph.client.user.keyring
```

## 总结

- 这样一个权限已经适合一个用户对应一个业务

```sh
[client.user1] 
    key = AQAUUchfjpMqGRAARV6h0ofdDEneuaRnxuHjoQ== 
    caps mon = "allow r" 
    caps osd = "allow * pool=mypool"
```







# 使用 ceph-authtool 命令管理用户

- ceph-authtool命令可直接创建用户、授予caps并创建keyring
  - `ceph-authtool keyringfile [-C | --create-keyring] [-n | --name entityname] [--gen- key] [-a | --add-key base64_key] [--cap | --caps capfile]`
  - 命令选项
    - -C, --create-keyring：will create a new keyring, overwriting any existing keyringfile 
    - --gen-key：will generate a new secret key for the specified entityname 
    - --add-key：will add an encoded key to the keyring 
    - --cap subsystem capability：will set the capability for given subsystem
    - --caps capsfile：will set all of capabilities associated with a given key, for all subsystems
- 注意：此种方式添加的用户仅存在于keyring文件中，管理员还需要额外将其添加至Ceph集群上；
  - 命令： ceph auth add TYPE.ID -i /PATH/TO/keyring
