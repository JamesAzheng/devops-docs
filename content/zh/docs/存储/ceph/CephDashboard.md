---
title: "Ceph Dashboard"
---

# 启用 dashboard module

```sh
# 启用
# ceph mgr module enable dashboard


# 验证是否启用
# ceph mgr module ls
{
    "enabled_modules": [
        "balancer",
        "crash",
        "dashboard", # 已启用
        "iostat",
        "restful",
        "status"
    ],
...
```





# http dashboard

- 若使用http协议的Dashboard V2，需要设定禁用SSL功能：

```sh
# ceph config set mgr mgr/dashboard/ssl false
```





# https dashboard

若使用https协议的Dashboard V2，需要以如下步骤生成证书及相关配置：

- Dashboard要通过https协议提供服务。管理员可配置其使用自动生成的自签证书，也可以为其提供自定义的证书文件，⼆者选其⼀即可。

  - 若需要使用自签证书，运行如下命令生成自动生成证书即可：

  - ```sh
    # ceph dashboard create-self-signed-cert
    ```

  - 若需要自定义证书，则应该通过合适的方式获取到相关证书。例如，以如下方式运行命令生成自定义的证书：

  - ```sh
    # openssl req -new -nodes -x509 -subj "/O=IT/CN=ceph-mgr-dashboard" \ -days 3650 -keyout dashboard.key -out dashboard.crt -extensions v3_ca
    ```

- 而后配置dashboard加载证书：

```sh
# ceph config-key set mgr mgr/dashboard/crt -i dashboard.crt

# ceph config-key set mgr mgr/dashboard/key -i dashboard.key
```





# 配置监听的地址和端口

```sh
# ceph config set mgr mgr/dashboard/server_addr 0.0.0.0 

# ceph config set mgr mgr/dashboard/server_port 8888
```

- 也可以分别为每个mgr实例配置监听的地址和端口，将下面命令格式中的$name替换为mgr实例的名称即可。

```sh
# ceph config set mgr mgr/dashboard/$name/server_addr $IP

# ceph config set mgr mgr/dashboard/$name/server_port $PORT
```



# 启用与禁用 Dashboard

- 重新启用dashboard后配监听的地址和端口等配置才会生效

```sh
# ceph mgr module disable dashboard

# ceph mgr module enable dashboard
```



# 配置管理员认证信息

- `ceph dashboard set-login-credentials <username> <password>`

```sh
# admin设置密码为12345
# ceph dashboard set-login-credentials admin 12345
Username and password updated
```



# 验证

```sh
# ceph -s
  cluster:
    id:     23af67b8-235b-48f2-8dfe-8b52370a7419
    health: HEALTH_OK
 
  services:
    mon: 3 daemons, quorum stor01,stor02,stor03
    mgr: stor02(active), standbys: stor01 # 浏览器访问处于active的mgr节点
    mds: cephfs-1/1/1 up  {0=stor01=up:active}
    osd: 3 osds: 3 up, 3 in
    rgw: 1 daemon active
...


# 浏览器访问，登录账号为admin，密码为12345
# http://10.0.0.17:8888/#/login
```







