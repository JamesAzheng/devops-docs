---
title: "Containerd"
---

# Containerd 概述
containerd 是一个容器运行时（Container Runtime），它负责管理容器的整个生命周期（镜像拉取、存储管理、容器执行、进程监控等），是 Docker 公司将其核心运行时组件剥离出来并捐献给 CNCF 的产物。

containerd 是 K8s 最推荐的 CRI 之一，它比完整的 Docker 引擎更轻量，占用的资源更少。
```sh
# 旧架构 (K8s → Docker):
K8s  (通过 CRI 接口)  ->  Docker  (通过 gRPC)  ->  containerd  (通过 OS 调用)  ->  runc

# 新架构 (K8s → containerd):
K8s  (通过 CRI 接口)  ->  containerd  (通过 OS 调用)  ->  runc
```
- 在新架构中，K8s 可以直接通过 CRI 接口与 containerd 通信，省去了中间的 Docker daemon 层 (Dockershim)。这减少了 API 转换的开销、降低了复杂性，也排除了一个潜在的故障点。


# Containerd 配置文件
```ini
# cat /etc/containerd/config.toml 
# ==============================================================================
# 核心配置部分 (General Settings)
# ==============================================================================
disabled_plugins = []
imports = []
oom_score = 0 # OOM分数调整，0表示不调整，避免containerd主进程被OOM killer轻易终止
plugin_dir = ""
required_plugins = []
root = "/var/lib/containerd" # containerd存储容器状态和镜像数据的根目录
state = "/run/containerd"    # containerd存储运行时状态、套接字等临时数据的目录
temp = ""
version = 2 # 配置文件版本

[cgroup]
  path = ""

[debug]
  address = ""
  format = ""
  gid = 0
  level = ""
  uid = 0

# ==============================================================================
# gRPC 接口配置 (API Communication)
# ==============================================================================
[grpc]
  address = "/run/containerd/containerd.sock" # containerd Unix域套接字地址，kubelet和crictl通过此通信
  gid = 0
  max_recv_message_size = 16777216
  max_send_message_size = 16777216
  tcp_address = "" # TCP监听地址（通常不启用）
  tcp_tls_ca = ""
  tcp_tls_cert = ""
  tcp_tls_key = ""
  uid = 0

[metrics]
  address = ""
  grpc_histogram = false

[plugins]

  [plugins."io.containerd.gc.v1.scheduler"] # 垃圾回收 (GC) 调度器配置
    deletion_threshold = 0
    mutation_threshold = 100
    pause_threshold = 0.02
    schedule_delay = "0s"
    startup_delay = "100ms"

# ==============================================================================
# CRI 插件配置 (Kubernetes Interface) - K8s交互的核心
# ==============================================================================
  [plugins."io.containerd.grpc.v1.cri"]
    cdi_spec_dirs = ["/etc/cdi", "/var/run/cdi"]
    device_ownership_from_security_context = false
    disable_apparmor = false
    disable_cgroup = false # 是否禁用cgroup，通常为false (启用资源限制)
    disable_hugetlb_controller = true
    disable_proc_mount = false
    disable_tcp_service = true
    drain_exec_sync_io_timeout = "0s"
    enable_cdi = false
    enable_selinux = false # 是否启用SELinux。在需要SELinux的环境中应设为true
    enable_tls_streaming = false
    enable_unprivileged_icmp = false
    enable_unprivileged_ports = false
    ignore_deprecation_warnings = []
    ignore_image_defined_volumes = false
    image_pull_progress_timeout = "5m0s"
    image_pull_with_sync_fs = false
    max_concurrent_downloads = 3 # 最大并发镜像层下载数
    max_container_log_line_size = 16384
    netns_mounts_under_state_dir = false
    restrict_oom_score_adj = false
    sandbox_image = "registry.k8s.io/pause:3.8" # K8s Pod 沙箱（pause容器）使用的镜像
    selinux_category_range = 1024
    stats_collect_period = 10
    stream_idle_timeout = "4h0m0s" # 流（如kubectl logs/exec）的空闲超时时间
    stream_server_address = "127.0.0.1"
    stream_server_port = "0"
    systemd_cgroup = false # K8s节点关键配置：是否使用systemd cgroup驱动。与kubelet保持一致很重要
    tolerate_missing_hugetlb_controller = true
    unset_seccomp_profile = ""

    [plugins."io.containerd.grpc.v1.cri".cni] # CNI 网络插件配置
      bin_dir = "/opt/cni/bin" # CNI插件可执行文件的目录
      conf_dir = "/etc/cni/net.d" # CNI配置文件目录
      conf_template = ""
      ip_pref = ""
      max_conf_num = 1
      setup_serially = false

    [plugins."io.containerd.grpc.v1.cri".containerd] # CRI 对接 containerd 的配置
      default_runtime_name = "runc" # 默认的容器运行时名称，对应下面的 [runc]
      disable_snapshot_annotations = true
      discard_unpacked_layers = false
      ignore_blockio_not_enabled_errors = false
      ignore_rdt_not_enabled_errors = false
      no_pivot = false
      snapshotter = "overlayfs" # 默认的快照存储驱动 (如 overlayfs, btrfs, zfs等)

      [plugins."io.containerd.grpc.v1.cri".containerd.default_runtime]
        base_runtime_spec = ""
        cni_conf_dir = ""
        cni_max_conf_num = 0
        container_annotations = []
        pod_annotations = []
        privileged_without_host_devices = false
        privileged_without_host_devices_all_devices_allowed = false
        runtime_engine = ""
        runtime_path = ""
        runtime_root = ""
        runtime_type = ""
        sandbox_mode = ""
        snapshotter = ""

        [plugins."io.containerd.grpc.v1.cri".containerd.default_runtime.options]

      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes] # 定义所有可用的容器运行时

        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc] # runc 运行时配置
          base_runtime_spec = ""
          cni_conf_dir = ""
          cni_max_conf_num = 0
          container_annotations = []
          pod_annotations = []
          privileged_without_host_devices = false
          privileged_without_host_devices_all_devices_allowed = false
          runtime_engine = ""
          runtime_path = ""
          runtime_root = ""
          runtime_type = "io.containerd.runc.v2" # 使用 runc v2 shim
          sandbox_mode = "podsandbox"
          snapshotter = ""

          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options] # runc 运行时选项
            BinaryName = ""
            CriuImagePath = ""
            CriuPath = ""
            CriuWorkPath = ""
            IoGid = 0
            IoUid = 0
            NoNewKeyring = false
            NoPivotRoot = false
            Root = ""
            ShimCgroup = ""
            SystemdCgroup = true # K8s节点关键配置：指示runc使用systemd cgroup驱动

      [plugins."io.containerd.grpc.v1.cri".containerd.untrusted_workload_runtime]
        base_runtime_spec = ""
        cni_conf_dir = ""
        cni_max_conf_num = 0
        container_annotations = []
        pod_annotations = []
        privileged_without_host_devices = false
        privileged_without_host_devices_all_devices_allowed = false
        runtime_engine = ""
        runtime_path = ""
        runtime_root = ""
        runtime_type = ""
        sandbox_mode = ""

        [plugins."io.containerd.grpc.v1.cri".containerd.untrusted_workload_runtime.options]

    [plugins."io.containerd.grpc.v1.cri".image_decryption]
      key_model = "node"

    [plugins."io.containerd.grpc.v1.cri".registry] # 镜像注册表（Registry）配置
      config_path = ""

      [plugins."io.containerd.grpc.v1.cri".registry.auths] # 认证配置
      [plugins."io.containerd.grpc.v1.cri".registry.configs] # 镜像仓库特定配置
      [plugins."io.containerd.grpc.v1.cri".registry.headers]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors] # 镜像加速器/镜像源配置

    [plugins."io.containerd.grpc.v1.cri".x509_key_pair_streaming]
      tls_cert_file = ""
      tls_key_file = ""

  [plugins."io.containerd.internal.v1.opt"]
    path = "/opt/containerd"

  [plugins."io.containerd.internal.v1.restart"]
    interval = "10s"

  [plugins."io.containerd.internal.v1.tracing"]

  [plugins."io.containerd.metadata.v1.bolt"]
    content_sharing_policy = "shared"

  [plugins."io.containerd.monitor.v1.cgroups"]
    no_prometheus = false

  [plugins."io.containerd.nri.v1.nri"] # NRI 插件配置 (Node Resource Interface)
    disable = true
    disable_connections = false
    plugin_config_path = "/etc/nri/conf.d"
    plugin_path = "/opt/nri/plugins"
    plugin_registration_timeout = "5s"
    plugin_request_timeout = "2s"
    socket_path = "/var/run/nri/nri.sock"

  [plugins."io.containerd.runtime.v1.linux"]
    no_shim = false
    runtime = "runc"
    runtime_root = ""
    shim = "containerd-shim"
    shim_debug = false

  [plugins."io.containerd.runtime.v2.task"]
    platforms = ["linux/amd64"]
    sched_core = false

  [plugins."io.containerd.service.v1.diff-service"]
    default = ["walking"]
    sync_fs = false

  [plugins."io.containerd.service.v1.tasks-service"]
    blockio_config_file = ""
    rdt_config_file = ""

# ==============================================================================
# 快照插件配置 (Snapshotters) - 存储后端
# ==============================================================================
  [plugins."io.containerd.snapshotter.v1.aufs"]
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.blockfile"]
    fs_type = ""
    mount_options = []
    root_path = ""
    scratch_file = ""

  [plugins."io.containerd.snapshotter.v1.btrfs"]
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.devmapper"]
    async_remove = false
    base_image_size = ""
    discard_blocks = false
    fs_options = ""
    fs_type = ""
    pool_name = ""
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.native"]
    root_path = ""

  [plugins."io.containerd.snapshotter.v1.overlayfs"] # 最常用的 Linux 存储驱动
    mount_options = []
    root_path = ""
    sync_remove = false
    upperdir_label = false

  [plugins."io.containerd.snapshotter.v1.zfs"]
    root_path = ""

  [plugins."io.containerd.tracing.processor.v1.otlp"]

  [plugins."io.containerd.transfer.v1.local"]
    config_path = ""
    max_concurrent_downloads = 3
    max_concurrent_uploaded_layers = 3

    [[plugins."io.containerd.transfer.v1.local".unpack_config]]
      differ = ""
      platform = "linux/amd64"
      snapshotter = "overlayfs"

[proxy_plugins]

[stream_processors] # 用于处理加密镜像等场景的流处理器

  [stream_processors."io.containerd.ocicrypt.decoder.v1.tar"]
    accepts = ["application/vnd.oci.image.layer.v1.tar+encrypted"]
    args = ["--decryption-keys-path", "/etc/containerd/ocicrypt/keys"]
    env = ["OCICRYPT_KEYPROVIDER_CONFIG=/etc/containerd/ocicrypt/ocicrypt_keyprovider.conf"]
    path = "ctd-decoder"
    returns = "application/vnd.oci.image.layer.v1.tar"

  [stream_processors."io.containerd.ocicrypt.decoder.v1.tar.gzip"]
    accepts = ["application/vnd.oci.image.layer.v1.tar+gzip+encrypted"]
    args = ["--decryption-keys-path", "/etc/containerd/ocicrypt/keys"]
    env = ["OCICRYPT_KEYPROVIDER_CONFIG=/etc/containerd/ocicrypt/ocicrypt_keyprovider.conf"]
    path = "ctd-decoder"
    returns = "application/vnd.oci.image.layer.v1.tar+gzip"

[timeouts] # 各种操作的超时配置
  "io.containerd.timeout.bolt.open" = "0s"
  "io.containerd.timeout.metrics.shimstats" = "2s"
  "io.containerd.timeout.shim.cleanup" = "5s"
  "io.containerd.timeout.shim.load" = "5s"
  "io.containerd.timeout.shim.shutdown" = "3s"
  "io.containerd.timeout.task.state" = "2s"

[ttrpc]
  address = ""
  gid = 0
  uid = 0
```