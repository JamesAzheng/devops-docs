# 01

- 运行2个Pod，一个运行wordpress，一个运行MySQL，两者进行配合实现完整应用；
- **使用 nodeport 对外提供访问。**

## yaml

### wordpress.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: wordpress
  labels:
    name: wordpress
spec:
  containers:
  - name: wordpress
    image: wordpress:php8.2-apache
    imagePullPolicy: IfNotPresent
    env:
    - name: WORDPRESS_DB_HOST
      value: '10.0.0.101'
    - name: WORDPRESS_DB_USER
      value: 'wp-user'
    - name: WORDPRESS_DB_PASSWORD
      value: 'wppass'
    - name: WORDPRESS_DB_NAME
      value: wordpress
    - name: WORDPRESS_TABLE_PREFIX
      value: wp_
    ports:
    - containerPort: 80
      hostPort: 30888
```

### mysql.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql
  labels:
    name: mysql
spec:
  containers:
  - name: mysql
    image: mysql:8.0.31
    imagePullPolicy: IfNotPresent
    env:
    - name: MYSQL_USER
      value: 'wp-user'
    - name: MYSQL_PASSWORD
      value: 'wppass'
    - name: MYSQL_DATABASE
      value: 'wordpress'
    - name: MYSQL_RANDOM_ROOT_PASSWORD
      value: 'yes'
    ports:
    - containerPort: 3306
      hostPort: 3306
```



## 验证

```sh
# kubectl apply -f .
pod/mysql created
pod/wordpress created


# kubectl get pod -o wide 
NAME        READY   STATUS    RESTARTS   AGE   IP             NODE         NOMINATED NODE   READINESS GATES
mysql       1/1     Running   0          37s   10.244.1.238   k8s-node-1   <none>           <none>
wordpress   1/1     Running   0          37s   10.244.1.239   k8s-node-1   <none>           <none>


# 访问k8s-node-1，即http://10.0.0.101:30888/
```



# 02

- 运行2个Pod，一个运行wordpress，一个运行MySQL，两者进行配合实现完整应用；
- **共享宿主机的网络名称空间外提供访问。**

## yaml

### wordpress.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: wordpress
  labels:
    name: wordpress
spec:
  hostNetwork: true # 共享宿主机的网络名称空间
  containers:
  - name: wordpress
    image: wordpress:php8.2-apache
    imagePullPolicy: IfNotPresent
    env:
    - name: WORDPRESS_DB_HOST
      value: '10.0.0.101'
    - name: WORDPRESS_DB_USER
      value: 'wp-user'
    - name: WORDPRESS_DB_PASSWORD
      value: 'wppass'
    - name: WORDPRESS_DB_NAME
      value: wordpress
    - name: WORDPRESS_TABLE_PREFIX
      value: wp_
```

### mysql.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql
  labels:
    name: mysql
spec:
  hostNetwork: true # 共享宿主机的网络名称空间
  containers:
  - name: mysql
    image: mysql:8.0.31
    imagePullPolicy: IfNotPresent
    env:
    - name: MYSQL_USER
      value: 'wp-user'
    - name: MYSQL_PASSWORD
      value: 'wppass'
    - name: MYSQL_DATABASE
      value: 'wordpress'
    - name: MYSQL_RANDOM_ROOT_PASSWORD
      value: 'yes'
```



## 验证

```sh
# kubectl apply -f .
pod/mysql created
pod/wordpress created


# kubectl get pod -o wide 
NAME        READY   STATUS    RESTARTS   AGE   IP             NODE         NOMINATED NODE   READINESS GATES
mysql       1/1     Running   0          37s   10.244.1.238   k8s-node-1   <none>           <none>
wordpress   1/1     Running   0          37s   10.244.1.239   k8s-node-1   <none>           <none>


# 访问k8s-node-1，即http://10.0.0.101/
```

