---
title: "kubesphere"
weight: 10
---

# kubesphere 迁移存储类

## kubesphere-monitoring-system

- `kubectl get pvc -n kubesphere-monitoring-system prometheus-k8s-db-prometheus-k8s-0 -o yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    pv.kubernetes.io/bind-completed: "yes"
    pv.kubernetes.io/bound-by-controller: "yes"
    volume.beta.kubernetes.io/storage-provisioner: openebs.io/local
    volume.kubernetes.io/selected-node: k8s-worker1
  creationTimestamp: "2023-03-21T06:22:57Z"
  finalizers:
  - kubernetes.io/pvc-protection
  labels:
    app.kubernetes.io/instance: k8s
    app.kubernetes.io/managed-by: prometheus-operator
    app.kubernetes.io/name: prometheus
    operator.prometheus.io/name: k8s
    operator.prometheus.io/shard: "0"
    prometheus: k8s
  name: prometheus-k8s-db-prometheus-k8s-0
  namespace: kubesphere-monitoring-system
  resourceVersion: "4176"
  uid: cc90f698-c295-42a5-853e-d3a748620707
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: local
  volumeMode: Filesystem
  volumeName: pvc-cc90f698-c295-42a5-853e-d3a748620707
status:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 20Gi
  phase: Bound

```

- `kubectl get pvc -n kubesphere-monitoring-system prometheus-k8s-db-prometheus-k8s-1 -o yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    pv.kubernetes.io/bind-completed: "yes"
    pv.kubernetes.io/bound-by-controller: "yes"
    volume.beta.kubernetes.io/storage-provisioner: openebs.io/local
    volume.kubernetes.io/selected-node: k8s-worker2
  creationTimestamp: "2023-03-21T06:22:58Z"
  finalizers:
  - kubernetes.io/pvc-protection
  labels:
    app.kubernetes.io/instance: k8s
    app.kubernetes.io/managed-by: prometheus-operator
    app.kubernetes.io/name: prometheus
    operator.prometheus.io/name: k8s
    operator.prometheus.io/shard: "0"
    prometheus: k8s
  name: prometheus-k8s-db-prometheus-k8s-1
  namespace: kubesphere-monitoring-system
  resourceVersion: "4756"
  uid: ffa760c4-3213-49ce-bdb5-4871f8b0147a
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: local
  volumeMode: Filesystem
  volumeName: pvc-ffa760c4-3213-49ce-bdb5-4871f8b0147a
status:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 20Gi
  phase: Bound

```

### 删除 pvc

```
kubectl delete pvc -n kubesphere-monitoring-system prometheus-k8s-db-prometheus-k8s-0


kubectl delete pvc -n kubesphere-monitoring-system prometheus-k8s-db-prometheus-k8s-1
```



### 重建 pvc

- `vim pvc-prometheus-k8s-db-prometheus-k8s-0.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  labels:
    app.kubernetes.io/instance: k8s
    app.kubernetes.io/managed-by: prometheus-operator
    app.kubernetes.io/name: prometheus
    operator.prometheus.io/name: k8s
    operator.prometheus.io/shard: "0"
    prometheus: k8s
  name: prometheus-k8s-db-prometheus-k8s-0
  namespace: kubesphere-monitoring-system
spec:
  storageClassName: nfs-client
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

- `vim pvc-prometheus-k8s-db-prometheus-k8s-1.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  labels:
    app.kubernetes.io/instance: k8s
    app.kubernetes.io/managed-by: prometheus-operator
    app.kubernetes.io/name: prometheus
    operator.prometheus.io/name: k8s
    operator.prometheus.io/shard: "0"
    prometheus: k8s
  name: prometheus-k8s-db-prometheus-k8s-1
  namespace: kubesphere-monitoring-system
spec:
  storageClassName: nfs-client
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```





## kubesphere-system

### redis

- `kubectl get pvc -n kubesphere-system redis-pvc -o yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"PersistentVolumeClaim","metadata":{"annotations":{},"name":"redis-pvc","namespace":"kubesphere-system"},"spec":{"accessModes":["ReadWriteOnce"],"resources":{"requests":{"storage":"2Gi"}}}}
    pv.kubernetes.io/bind-completed: "yes"
    pv.kubernetes.io/bound-by-controller: "yes"
    volume.beta.kubernetes.io/storage-provisioner: openebs.io/local
    volume.kubernetes.io/selected-node: k8s-master1
  creationTimestamp: "2023-03-21T06:19:46Z"
  finalizers:
  - kubernetes.io/pvc-protection
  name: redis-pvc
  namespace: kubesphere-system
  resourceVersion: "2002"
  uid: 0f6a2dab-51bf-44b9-ab3e-3b0d60a22b62
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  storageClassName: local
  volumeMode: Filesystem
  volumeName: pvc-0f6a2dab-51bf-44b9-ab3e-3b0d60a22b62
status:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 2Gi
  phase: Bound

```

#### 删除 pvc

```
kubectl delete pvc -n kubesphere-system redis-pvc
```

#### 重建 pvc

- `vim redis-pvc.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: kubesphere-system
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  storageClassName: nfs-client
```

### minio

- `kubectl get pvc -n kubesphere-system minio -o yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    meta.helm.sh/release-name: ks-minio
    meta.helm.sh/release-namespace: kubesphere-system
    pv.kubernetes.io/bind-completed: "yes"
    pv.kubernetes.io/bound-by-controller: "yes"
    volume.beta.kubernetes.io/storage-provisioner: openebs.io/local
    volume.kubernetes.io/selected-node: k8s-worker1
  creationTimestamp: "2023-03-22T09:26:22Z"
  finalizers:
  - kubernetes.io/pvc-protection
  labels:
    app: minio
    app.kubernetes.io/managed-by: Helm
    chart: minio-2.5.16
    heritage: Helm
    release: ks-minio
  name: minio
  namespace: kubesphere-system
  resourceVersion: "336946"
  uid: 776675a0-ccb9-46b6-a6e3-2cbc7003db0b
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: local
  volumeMode: Filesystem
  volumeName: pvc-776675a0-ccb9-46b6-a6e3-2cbc7003db0b
status:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 20Gi
  phase: Bound
```

#### 删除 pvc

```
kubectl delete pvc -n kubesphere-system minio
```

#### 重建 pvc

- `vim kubesphere-minio-pvc.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  labels:
    app: minio
    app.kubernetes.io/managed-by: Helm
    chart: minio-2.5.16
    heritage: Helm
    release: ks-minio
  name: minio
  namespace: kubesphere-system
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  storageClassName: nfs-client
```

