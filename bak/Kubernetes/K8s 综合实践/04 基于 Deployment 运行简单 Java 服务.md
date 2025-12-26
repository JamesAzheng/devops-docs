# 前言

- 简单的 java 服务是指直接使用 java -jar 就可以启动的 jar包 或者 war包
- 下面以 Jenkins 举例（生产中 Jenkins 一般都是跑在虚拟机上）
- 因为 Jenkins 中的插件数据和一些其他数据需要持久化保存，所以在此使用 PV/PVC 进行持久化保存





# Dockerfile

## 相关文件

- Jenkins下载链接：https://mirrors.tuna.tsinghua.edu.cn/jenkins/war-stable/

```bash
# pwd
/data/dockerfile/jenkins


# Jenkins为区分版本，将其后缀加上了版本号，entrypoint脚本要加执行权限
# ll
total 70660
drwxr-xr-x 2 root root     4096 Jul 16 15:38 ./
drwxr-xr-x 8 root root     4096 Jul 16 15:23 ../
-rw-r--r-- 1 root root      309 Jul 16 15:38 Dockerfile
-rwxr-xr-x 1 root root      439 Jul 16 15:36 entrypoint.sh*
-rw-r--r-- 1 root root 72338143 Jul 16 15:21 jenkins_2.303.3.war
```

## Dockerfile

```dockerfile
FROM harbor.xiangzheng.vip/baseimages-app/jdk-8u333-base-ubuntu:1.0

LABEL version="1.0" \
      maintainer="XiangZheng <767483070@qq.com>"

ADD jenkins_2.303.3.war /jenkins/

WORKDIR /jenkins/ 

EXPOSE 8080

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
```

## entrypoint.sh

```bash
#!/bin/bash
java -server -Xms1024m -Xmx1024m -Xss512k -jar jenkins_2.303.3.war --webroot=/jenkins/jenkins-data/ --httpPort=8080
```

## 测试

```bash
docker run --rm -d --name jenkins -p 8081:8080 jenkins-2.303.3-jdk-8u333:1.0 ; docker exec -it jenkins bash

浏览器访问8081

docker stop jenkins


docker images |grep jenkins ; docker ps -a |grep jenkins



#需要共享的目录
/root/.jenkins/
/jenkins/jenkins-data/
```

## 构建镜像并上传到 harbor

- **构建镜像**

```bash
docker build -t jenkins-2.303.3-jdk-8u333:1.0 .
```

- **打标签然后上传到 harbor**


```bash
# 打标签
docker tag jenkins-2.303.3-jdk-8u333:1.0 harbor.xiangzheng.vip/baseimages-app/jenkins-2.303.3-jdk-8u333:1.0

# 上传
docker push harbor.xiangzheng.vip/baseimages-app/jenkins-2.303.3-jdk-8u333:1.0
```





# yaml

## 说明

- **如果nfs端目录实现存有数据，那么新生成的 Pod 会直接采用 nfs 目录共享的内容 而不会生成初始化的文件，所以在初始化过程中要保证 nfs 共享的目录没有文件存在 尤其是不易发现的隐藏文件**

## 相关文件

```bash
# pwd
/data/yaml/jenkins

# ll
total 20
drwxr-xr-x 2 root root 4096 Jul 16 16:21 ./
drwxr-xr-x 7 root root 4096 Jul 16 16:11 ../
-rw-r--r-- 1 root root 1583 Jul 16 16:11 jenkins-deployment.yaml
-rw-r--r-- 1 root root  487 Jul 16 16:11 jenkins-pvc.yaml
-rw-r--r-- 1 root root  531 Jul 16 16:11 jenkins-pv.yaml
```

## 准备 NFS

- 安装过程省略

```bash
# 创建共享目录
# mkdir -p /nfs_data/jenkins/{jenkins-data,jenkins-root}

# 定义共享目录
# vim /etc/exports
...
/nfs_data/jenkins/ *(rw,no_root_squash)

# 重载配置文件
# exportfs -r

# 查看共享结果
# showmount -e 10.0.0.103
Export list for 10.0.0.103:
/nfs_data/jenkins/ *
```

## 准备 namespace

```yaml
# vim /data/yaml/jenkins/jenkins-ns.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: jenkins
```

### 验证

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-ns.yaml
namespace/jenkins created


# kubectl get ns
NAME              STATUS   AGE
jenkins           Active   2s
...
```



## 准备 PV

```yaml
# vim /data/yaml/jenkins/jenkins-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: jenkins-data-pv
  labels:
    type: jenkins-data-pv
  namespace: jenkins
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: "/nfs_data/jenkins/jenkins-data"
    server: 10.0.0.103

---

apiVersion: v1
kind: PersistentVolume
metadata:
  name: jenkins-root-pv
  labels:
    type: jenkins-root-pv
  namespace: jenkins
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: "/nfs_data/jenkins/jenkins-root"
    server: 10.0.0.103
```

### 验证

```bash
# kubectl apply -f jenkins-pv.yaml 
persistentvolume/jenkins-data-pv created
persistentvolume/jenkins-root-pv created


# STATUS 一定要是 Available
# kubectl get pv
NAME              CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
jenkins-data-pv   100Gi      RWO            Retain           Available                                   3s
jenkins-root-pv   100Gi      RWO            Retain           Available                                   3s
```



## 准备 PVC

```yaml
# vim /data/yaml/jenkins/jenkins-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-data-pvc
  namespace: jenkins
spec:
  volumeName: jenkins-data-pv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 80Gi

---

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-root-pvc
  namespace: jenkins
spec:
  volumeName: jenkins-root-pv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 80Gi
```

### 验证

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-pvc.yaml 
persistentvolumeclaim/jenkins-data-pvc created
persistentvolumeclaim/jenkins-root-pvc created



# STATUS 一定要是 Bound
# kubectl get pv
NAME              CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                      STORAGECLASS   REASON   AGE
jenkins-data-pv   100Gi      RWO            Retain           Bound    jenkins/jenkins-data-pvc                           113s
jenkins-root-pv   100Gi      RWO            Retain           Bound    jenkins/jenkins-root-pvc                           113s



# STATUS 一定要是 Bound
# kubectl get pvc -n jenkins 
NAME               STATUS   VOLUME            CAPACITY   ACCESS MODES   STORAGECLASS   AGE
jenkins-data-pvc   Bound    jenkins-data-pv   100Gi      RWO                           17s
jenkins-root-pvc   Bound    jenkins-root-pv   100Gi      RWO                           17s
```



## 准备 deployment

```yaml
# vim /data/yaml/jenkins/jenkins-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jenkins-deployment
  namespace: jenkins
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jenkins
  template:
    metadata:
      labels:
        app: jenkins
    spec:
      restartPolicy: Always
      containers:
      - name: jenkins-server
        image: jenkins-2.303.3-jdk-8u333:1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: jenkins-server
          protocol: TCP
        resources:
          requests:   
            cpu: 512m
            memory: 512Mi   
          limits:   
            cpu: 1   
            memory: 1024Mi
        volumeMounts:
        - mountPath: "/jenkins/jenkins-data/" # 结尾 / 加与不加效果都一样，都是将整个目录下的所有挂载至存储 
          name: jenkins-data # 调用卷名称（相当于调用PVC的别名）
        - mountPath: "/root/.jenkins/"
          name: jenkins-root
      volumes:
      - name: jenkins-data # 定义卷名称（相当于给PVC起别名）
        persistentVolumeClaim:
          claimName: jenkins-data-pvc # 指定pvc的name，需等于PersistentVolumeClaim.metadata.name
      - name: jenkins-root
        persistentVolumeClaim:
          claimName: jenkins-root-pvc

---

kind: Service
apiVersion: v1
metadata:
  labels:
    app: jenkins-service
  name: jenkins-service
  namespace: jenkins
spec:
  type: NodePort
  ports:
  - name: jenkins-server
    port: 8080
    protocol: TCP
    targetPort: 8080
    nodePort: 30080
  selector:
    app: jenkins
```

### 验证

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-deployment.yaml 
deployment.apps/jenkins-deployment created
service/jenkins-service created


# kubectl get pod -n jenkins -o wide 
NAME                                  READY   STATUS    RESTARTS   AGE     IP            NODE         NOMINATED NODE   READINESS GATES
jenkins-deployment-64d5b67576-gqd5z   1/1     Running   0          9m31s   10.10.1.147   k8s-work-1   <none>           <none>
```



## 测试

```bash
root@nfs:/nfs_data/jenkins# ls jenkins-data/
 bootstrap              images                        'Main$FileAndDescription.class'   robots.txt
 ColorFormatter.class   JNLPMain.class                 Main.class                       scripts
 css                    jsbundles                     'MainDialog$1$1.class'            WEB-INF
 executable            'LogFileOutputStream$1.class'  'MainDialog$1.class'              winstone.jar
 favicon.ico           'LogFileOutputStream$2.class'   MainDialog.class
 help                   LogFileOutputStream.class      META-INF


root@nfs:/nfs_data/jenkins# ls jenkins-root/
config.xml                        jobs              plugins                   updates
hudson.model.UpdateCenter.xml     logs              secret.key                userContent
identity.key.enc                  nodeMonitors.xml  secret.key.not-so-secret  users
jenkins.telemetry.Correlator.xml  nodes             secrets
```







# yaml（imperfect）

## 说明

- **此方式有瑕疵，主要是会将 Jenkins 中所有的数据都在 nfs 共享中存放到了一起，参阅 PV/PVC 的 yaml文件以及最后的测试阶段说明**
- **如果nfs端目录实现存有数据，那么新生成的 Pod 会直接采用 nfs 目录共享的内容 而不会生成初始化的文件，所以在初始化过程中要保证 nfs 共享的目录没有文件存在 尤其是不易发现的隐藏文件**

## 相关文件

```bash
# pwd
/data/yaml/jenkins

# ll
total 20
drwxr-xr-x 2 root root 4096 Jul 16 16:21 ./
drwxr-xr-x 7 root root 4096 Jul 16 16:11 ../
-rw-r--r-- 1 root root 1583 Jul 16 16:11 jenkins-deployment.yaml
-rw-r--r-- 1 root root  487 Jul 16 16:11 jenkins-pvc.yaml
-rw-r--r-- 1 root root  531 Jul 16 16:11 jenkins-pv.yaml
```

## 准备 NFS

- 安装过程省略

```bash
# 创建共享目录
# mkdir -p /nfs_data/jenkins/

# 定义共享目录
# vim /etc/exports
...
/nfs_data/jenkins/ *(rw,no_root_squash)

# 重载配置文件
# exportfs -r

# 查看共享结果
# showmount -e 10.0.0.103
Export list for 10.0.0.103:
/nfs_data/jenkins/ *
```

## 准备 namespace

```yaml
# vim /data/yaml/jenkins/jenkins-ns.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: jenkins
```

### 测试

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-ns.yaml
namespace/jenkins created


# kubectl get ns
NAME              STATUS   AGE
jenkins           Active   2s
...
```



## 准备 PV

```yaml
# vim /data/yaml/jenkins/jenkins-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: jenkins-pv
  labels:
    type: jenkins-pv
  namespace: jenkins
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    path: "/nfs_data/jenkins"
    server: 10.0.0.103
```

### 测试

```bash
# kubectl apply -f jenkins-pv.yaml 
persistentvolume/jenkins-pv created


# STATUS 一定要是 Available
# kubectl get pv
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
jenkins-pv   100Gi      RWO            Retain           Available                                   19s
```



## 准备 PVC

```yaml
# vim /data/yaml/jenkins/jenkins-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-pvc
  namespace: jenkins
spec:
  volumeName: jenkins-pv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 80Gi
```

### 测试

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-pvc.yaml 
persistentvolumeclaim/jenkins-pvc created


# STATUS 一定要是 Bound
# kubectl get pv
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS   REASON   AGE
jenkins-pv   100Gi      RWO            Retain           Bound    jenkins/jenkins-pvc                           81s

# STATUS 一定要是 Bound
# kubectl get pvc -n jenkins 
NAME          STATUS   VOLUME       CAPACITY   ACCESS MODES   STORAGECLASS   AGE
jenkins-pvc   Bound    jenkins-pv   100Gi      RWO                           29s
```



## 准备 deployment

```yaml
# vim /data/yaml/jenkins/jenkins-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jenkins-deployment
  namespace: jenkins
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jenkins
  template:
    metadata:
      labels:
        app: jenkins
    spec:
      restartPolicy: Always
      containers:
      - name: jenkins-server
        image: jenkins-2.303.3-jdk-8u333:1.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: jenkins-server
          protocol: TCP
        resources:
          requests:   
            cpu: 512m
            memory: 512Mi   
          limits:   
            cpu: 1   
            memory: 1024Mi
        volumeMounts:
        - mountPath: "/jenkins/jenkins-data/" # 结尾 / 加与不加效果都一样，都是将整个目录下的所有挂载至存储 
          name: jenkins-data
        - mountPath: "/root/.jenkins/"
          name: jenkins-data
      volumes:
      - name: jenkins-data
        persistentVolumeClaim:
          claimName: jenkins-pvc


---

kind: Service
apiVersion: v1
metadata:
  labels:
    app: jenkins-service
  name: jenkins-service
  namespace: jenkins
spec:
  type: NodePort
  ports:
  - name: jenkins-server
    port: 8080
    protocol: TCP
    targetPort: 8080
    nodePort: 30080
  selector:
    app: jenkins
```

### 测试

```bash
# kubectl apply -f /data/yaml/jenkins/jenkins-deployment.yaml 
deployment.apps/jenkins-deployment created
service/jenkins-service created


# kubectl get pod -n jenkins -o wide 
NAME                                  READY   STATUS    RESTARTS   AGE     IP            NODE         NOMINATED NODE   READINESS GATES
jenkins-deployment-64d5b67576-gqd5z   1/1     Running   0          9m31s   10.10.1.147   k8s-work-1   <none>           <none>
```

- **镜像未做 PV/PVC 挂载前的数据存放形式**

```bash
# ls /root/.jenkins/
config.xml                     identity.key.enc                  jobs  nodeMonitors.xml  plugins     secret.key.not-so-secret  updates      users
hudson.model.UpdateCenter.xml  jenkins.telemetry.Correlator.xml  logs  nodes             secret.key  secrets                   userContent

# ls /jenkins/jenkins-data/
 ColorFormatter.class           LogFileOutputStream.class       'MainDialog$1$1.class'   bootstrap     help         scripts
 JNLPMain.class                 META-INF                        'MainDialog$1.class'     css           images       winstone.jar
'LogFileOutputStream$1.class'  'Main$FileAndDescription.class'   MainDialog.class        executable    jsbundles
'LogFileOutputStream$2.class'   Main.class                       WEB-INF                 favicon.ico   robots.txt
```

- **镜像做 PV/PVC 挂载后的数据存放形式（两个目录的数据都放在一起了）**

```bash
# ls /root/.jenkins/
 ColorFormatter.class            'MainDialog$1$1.class'   favicon.ico                        logs                       secrets
 JNLPMain.class                  'MainDialog$1.class'     help                               nodeMonitors.xml           userContent
'LogFileOutputStream$1.class'     MainDialog.class        hudson.model.UpdateCenter.xml      nodes                      users
'LogFileOutputStream$2.class'     WEB-INF                 identity.key.enc                   plugins                    winstone.jar
 LogFileOutputStream.class        bootstrap               images                             robots.txt
 META-INF                         config.xml              jenkins.telemetry.Correlator.xml   scripts
'Main$FileAndDescription.class'   css                     jobs                               secret.key
 Main.class                       executable              jsbundles                          secret.key.not-so-secret


# ls /jenkins/jenkins-data/
 ColorFormatter.class            'MainDialog$1$1.class'   favicon.ico                        logs                       secrets
 JNLPMain.class                  'MainDialog$1.class'     help                               nodeMonitors.xml           userContent
'LogFileOutputStream$1.class'     MainDialog.class        hudson.model.UpdateCenter.xml      nodes                      users
'LogFileOutputStream$2.class'     WEB-INF                 identity.key.enc                   plugins                    winstone.jar
 LogFileOutputStream.class        bootstrap               images                             robots.txt
 META-INF                         config.xml              jenkins.telemetry.Correlator.xml   scripts
'Main$FileAndDescription.class'   css                     jobs                               secret.key
 Main.class                       executable              jsbundles                          secret.key.not-so-secret

```

- **nfs 端查看数据**

```bash
# ls /nfs_data/jenkins/
 bootstrap                          jobs                             nodeMonitors.xml
 ColorFormatter.class               jsbundles                        nodes
 config.xml                        'LogFileOutputStream$1.class'     plugins
 css                               'LogFileOutputStream$2.class'     robots.txt
 executable                         LogFileOutputStream.class        scripts
 favicon.ico                        logs                             secret.key
 help                              'Main$FileAndDescription.class'   secret.key.not-so-secret
 hudson.model.UpdateCenter.xml      Main.class                       secrets
 identity.key.enc                  'MainDialog$1$1.class'            userContent
 images                            'MainDialog$1.class'              users
 jenkins.telemetry.Correlator.xml   MainDialog.class                 WEB-INF
 JNLPMain.class                     META-INF                         winstone.jar
```





 