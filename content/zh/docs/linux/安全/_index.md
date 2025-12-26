
---
title: 安全
---




# 加密算法

### 对称加密算法

key1 = key2（加密和解密的秘钥是相同的）

#### 功能：

- 实现数据的加密

#### 特性:

- 加密、解密使用同一个秘钥，效率高
- 将原始数据切割成固定大小的块，逐个进行加密

#### 缺陷：

- 秘钥分发（每个用户都得发不同的口令）
- 秘钥过多
- 数据来源无法确认

#### 常见对称加密算法:

- DES：Data Encryption Standard，56bits（古老）
- 3DES：（古老）
- **AES：Advanced (128, 192, 256bits)（目前流行**）
- Blowfish，Twofish（商业）
- IDEA，RC6，CAST5（商业）



### 非对称加密算法

key1 != key2（加密和解密的秘钥是不同的）

public key 公钥：(公开，可以到处传)

secret key | private key 私钥:（私有的，不公开）

#### 功能：

- 数据的加密

- 实现数据来源的确认，针对小数据效率高（Alice用私钥加密，则其他机器只能用Alice的公钥解密，从而知晓文件一定是Alice的）

#### 特性：

- 通讯双方各有两把钥匙（公钥和私钥）
- **用公钥加密，则只能用对应的私钥解密**
- **用私钥加密，则只能用对应的公钥解密**

#### 缺点：

- 密钥长,算法复杂
- 加密解密效率低下

#### 常见非对称加密算法:

- RSA：最常用，由 RSA 公司发明，是一个支持变长密钥的公共密钥算法，需要加密的文件块的长度也是可变的,可实现加密和数字签名
- DSA（Digital Signature Algorithm）：数字签名算法，是一种标准的 DSS（数字签名标准）
- ECC（Elliptic Curves Cryptography）：椭圆曲线密码编码学，比RSA加密算法使用更小的密钥，提供相当的或更高等级的安全



### 单向哈希算法

哈希算法：也称为散列算法，将任意数据缩小成固定大小的“指纹”，称为digest，即摘要

#### 特性：

- 任意长度输入，固定长度输出
- 若修改数据，指纹也会改变，且有雪崩效应，数据的一点微小改变，生成的指纹值变化非常大
- 无法从指纹中反推出原有数据，即不可逆，具有单向性

#### 功能：

- 验证数据的完整性（是否被篡改）

#### 计算文件的哈希值

```bash
[root@aliyun ~]# sha256sum filename
195a223b0b7b76ad64ca83746a6120e6721a51bb286b14c209cf42cd49b318e1  filename

#根据文件来判断哈希值是否一样
[root@aliyun ~]# sha256sum filename > sha.txt
[root@aliyun ~]# sha256sum -c sha.txt
passwd: OK
```

### 数字签名

- 将数据进行哈希运算，在进行私钥或公钥的加密，得到的结果即为数字签名





# 安全协议SSL/TLS

**SSL/TLS是一个协议栈**

**SLL/TLS协议位于TCP/IP模型中的应用层和传输层之间，**

**功能：**

- 机密性（加密数据）
- 认证（验证身份）
- 完整性（数据被篡改可以发现）
- 重放保护（防止加密后的密码被截获后使用加密的密码再次进行登录）



# base64编码

base64编码只是一种数据的保存形式，而非加密

主要功能：**让加密的文件可以明文显示，而非乱码**

能被3整除的字符数量不会产生"="

**base64编码的组成：**

```bash
a-z A-Z 0-9 / +
```

**生成base64编码:**

```bash
[root@aliyun ~]# echo abc|base64 
YWJjCg==
[root@openvpn-server ~]# echo -n abc | base64 
YWJj
[root@aliyun ~]# echo abcccc |base64 
YWJjY2NjCg==
[root@aliyun ~]# echo -n abcccc |base64 
YWJjY2Nj

#因为回车换行也算字符所以需要echo -n

#再转换回来
[root@openvpn-server ~]# echo -n abc | base64 | base64 -d
abc
```

# CA

相关理论文档：https://support.huaweicloud.com/ccm_faq/ccm_01_0248.html

CA即证书颁发机构

**利用第三方机构认证的方式来实现数据的安全交换，还可以防止中间人攻击**

**中间人攻击:**

中间人攻击就是利用了公钥这种公开机制，伪装成客户端的公钥来获取数据，可以利用CA证书颁发机构这种机制来确保得到的公钥是安全可靠的，而不是中间人伪装的

### 实现原理：

![CA](/docs/linux/安全/CA.png)

**CA颁发阶段**

- Alice先将自己的公钥(Pa)发送给CA，CA验证公钥是否合法，CA再用自己的私钥(Sca)将Alice的公钥签名得到Aclice的证书证书，最后再将Aclice的证书返还给Alice
- Bob同理

**双方通讯阶段**

- Alice再将得到的CA证书发送给Bob，Bob再将CA证书用CA的公钥来解密，因为证书是CA颁发的，所以Bob信任Alice，最后Bob安全的得到了Alice的公钥，防止了中间人攻击的产生
- Bob同理

### CA 相关术语

- .key 私钥文件
- .crt 证书文件（certs的缩写，Linux默认的后缀）
- .cer 证书文件（certs的缩写，Windows默认的后缀）
- ca 证书机构
- .req 证书签名申请文件
- .csr 证书签名申请文件（Open SSL默认）
- .crl 证书吊销列表文件（Windows默认的后缀）
- .pem 证书吊销列表文件 或 CA私钥文件（Open SSL默认）