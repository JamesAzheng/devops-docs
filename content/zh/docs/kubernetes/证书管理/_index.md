---
title: "证书管理"
weight: 10
---

# 参考文档

- https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/
- https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/certificates/
- https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/#client-and-serving-certificates
- https://kubernetes.io/zh-cn/docs/tasks/tls/manual-rotation-of-ca-certificates/



# k8s 根CA分类

k8s 中的根 CA 大体分为三类：

- **etcd-ca**：etcd中的根CA，主要负责签发etcd各节点间通信所使用的证书，apiserver作为客户端连接到etcd的时候的客户端证书和私钥也是由该 CA 所签发

- **kubernetes-ca**：k8s 根CA，kubelet 的证书就是由此CA签发

- **kubernetes-front-proxy-ca**：k8s 外部CA

**参考文档：**

- https://kubernetes.io/zh-cn/docs/setup/best-practices/certificates/



# k8s 证书存放位置

- 通过 kubeadm 安装的 Kubernetes 集群，大多数证书都存储在 `/etc/kubernetes/pki` 目录下

## /etc/kubernetes/pki/

```sh
# k8s根CA
ca.crt
ca.key


# apiserver作为服务端时使用的证书（由k8s根CA签发）
apiserver.crt
apiserver.key


# apiserver作为客户端连接到etcd的时候的客户端证书和私钥
apiserver-etcd-client.crt
apiserver-etcd-client.key


# apiserver作为客户端连接到kubelet进行查询的时候的客户端证书和私钥
# PS：因为所有kubelet的证书都是由kubernetes-ca进行签发的，因此只需要一对证书和私钥，不需要对每个kubelet都有一对证书和私钥
apiserver-kubelet-client.crt
apiserver-kubelet-client.key





front-proxy-ca.crt
front-proxy-ca.key
front-proxy-client.crt
front-proxy-client.key


sa.key
sa.pub
```

## /etc/kubernetes/pki/etcd/

```sh
# etcd根CA
ca.crt
ca.key


# 健康检查所需的证书和私钥
healthcheck-client.crt
healthcheck-client.key


# etcd各端点间通信使用的证书和私钥
peer.crt
peer.key


# etcd作为服务器端和客户端通信时使用的证书和私钥
server.crt
server.key
```



- 







- 













# 查看证书有效期

- 参考文档：
  - https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/#check-certificate-expiration

- **老版本写法**

```bash
# 方法一
kubeadm alpha certs check-expiration


# 方法二，利用for循环
`for item in `find /etc/kubernetes/pki -maxdepth 2 -name "*.crt"`;do openssl x509 -in $item -text -noout| grep Not;echo ======================$item===================;done`
```

- **新版本写法**

```bash
kubeadm certs check-expiration
```







# 更新证书

- 通过 kubeadm 安装的k8s证书有效期默认为一年，所以在证书过期前要提前签发，否则集群将无法正常使用
- **PS：**此方式目前在 k8s-1.20.9 以上版本测试有效，不同版本可能不支持这种方式



## kubeadm 手动更新证书

- **注意：kubeadm 不能管理由外部 CA 签名的证书**
- 参考文档：
  - https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/#manual-certificate-renewal

```bash
# 可以更新单个证书而不是全部证书。all 表示更新全部证书
kubeadm certs renew all


# 验证更新结果
kubeadm certs check-expiration
```

### 重启相关服务

- 执行完此命令之后你需要重启控制面 Pods，需要在所有 master 节点执行
- 等待20秒 参考 [KubeletConfiguration 结构](https://kubernetes.io/zh-cn/docs/reference/config-api/kubelet-config.v1beta1/) 中的`fileCheckFrequency` 值

```bash
# 创建一个临时目录
mkdir 111


# 将所有的文件移动到临时目录
mv /etc/kubernetes/manifests/* 111/


# 等待20秒后在将文件移回去
mv 111/* /etc/kubernetes/manifests/
```



## 用 Kubernetes 证书 API 更新证书

- 参考文档：
  - https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/#renew-certificates-with-the-kubernetes-certificates-api



## 通过外部 CA 更新证书

- 参考文档：
  - https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/#renew-certificates-with-external-ca
