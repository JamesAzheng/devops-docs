# nfs 信息

- nfs-server 地址：172.16.0.136
- nfs 共享目录：/data





# Pod 对接 nfs

- Pod 中的容器使用 NFS 作为存储媒介

## demoapp-nfs.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volumes-nfs-demo
  labels:
    app: redis
spec:
  containers: # Pod 中运行的容器
  - name: redis
    image: redis:alpine # 运行 redis 进行测试
    ports:
    - containerPort: 6379
      name: redisport
    volumeMounts:
    - name: redisdata
      mountPath: /data # 容器中对应的目录
  volumes:
    - name: redisdata
      nfs:
        server: 172.16.0.136 # nfs-server 地址
        path: /data # nfs 共享的目录
        readOnly: false # 读写方式挂载
```



## 验证

- 进入 redis 容器写入数据并保存

```sh
root@k8s-master1:~# kubectl exec -it volumes-nfs-demo -- sh

/data # redis-cli -h 127.0.0.1

127.0.0.1:6379> set key1 azheng
OK

127.0.0.1:6379> get key1
"azheng"

127.0.0.1:6379> bgsave
Background saving started

127.0.0.1:6379> exit

/data # ls /data/
dump.rdb
```

- nfs-server 端验证文件是否存在

```sh
root@nfs-server:~# ls /data/ -l
total 4
-rw------- 1 999 azheng 107 Jun  8 11:28 dump.rdb
```

- 重构 pod 验证数据是否能恢复

```sh
root@k8s-master1:~# kubectl delete -f test/pod/demoapp-nfs.yaml 
pod "volumes-nfs-demo" deleted


root@k8s-master1:~# kubectl apply -f test/pod/demoapp-nfs.yaml 
pod/volumes-nfs-demo created


root@k8s-master1:~# kubectl exec -it volumes-nfs-demo -- sh


/data # redis-cli -h 127.0.0.1


127.0.0.1:6379> get key1
"azheng"
```

