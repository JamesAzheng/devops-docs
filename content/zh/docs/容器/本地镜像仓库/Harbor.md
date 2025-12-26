---
title: "Harbor"
weight: 11
---

# 部署

## docker-compose

```sh
tar xf harbor-offline-installer-v2.5.3.tgz -C .
cd harbor/

cp harbor.yml.tmpl harbor.yml
vim harbor.yml
# 注释掉https相关配置
#https:
#  # https port for harbor, default is 443
#  port: 443
#  # The path of cert and key files for nginx
#  certificate: /your/certificate/path
#  private_key: /your/private/key/path
external_url: http://172.16.0.123:80


./install.sh
```

