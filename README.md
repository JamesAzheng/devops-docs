## 先决条件
- 安装 Node.js，推荐版本：`v20.x.x`
- 安装 hugo ，拷贝到 /usr/local/bin 目录下，推荐版本：`hugo v0.153.2-798533a2013eab97198b0a155a8f4afab7e79865+extended linux/amd64 BuildDate=2025-12-22T16:53:01Z VendorInfo=gohugoio`
- 安装 caddy ，拷贝到 /usr/local/bin 目录下，推荐版本：`v2.9.1 h1:OEYiZ7DbCzAWVb6TNEkjRcSCRGHVoZsJinoDR/n9oaY=`


## 安装
1. 将该项目放置到 /root 目录下

2. 拷贝该 service 到 /etc/systemd/system/caddy-hugo.service

- ```sh
  [Unit]
  Description=Caddy Hugo Server
  After=network.target
  
  [Service]
  WorkingDirectory=/root/devops-docsza 
  TimeoutStartSec=300
  ExecStartPre=/usr/local/bin/hugo
  ExecStart=/usr/local/bin/caddy run --config /root/devops-docs/Caddyfile
  Restart=on-failure
  
  [Install]
  WantedBy=multi-user.target
  
  ```


3. 启动：
- ```sh
  systemctl daemon-reload
  systemctl start caddy-hugo.service
  ```