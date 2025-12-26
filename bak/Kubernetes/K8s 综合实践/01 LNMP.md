





# 方案一

- 在一个 Pod 中分别运行 nginx 与 wordpress 两个容器；
  - nginx 的配置文件使用 ConfigMap 挂载，https证书使用Secret挂载；
  - wordpress 的页面数据采用 hostPath 挂载；
- 采用外部的 MySQL 数据库（使用自定义的endpoint和service引用）；
- 最后由 NodePort 类型的 service 对外暴露服务

## 先决条件

## 准备外部 MySQL 数据库

- 安装过程省略

```sql
# 创建wordpress所需的数据库
CREATE DATABASE wordpress;


# 创建wordpress连接MySQL所需的账号，这里允许任何网段都可以访问
CREATE USER 'wp-user'@'%';


# 为要定义的密码生成密文
select password('wppass');


# 使用生成的密文为账号设置密码
SET PASSWORD FOR 'wp-user'@'%' = '*C9B2DB1CA193280B971CA3602D5174A5D637D2BF';


# 为账号授权
GRANT ALL ON wordpress.* TO 'wp-user'@'%';
```

## yaml

- wordpress.yaml
- **下面的配置无法实现http自动跳转至https，解决方案？**

```yaml
# 连接集群外部MySQL
apiVersion: v1
kind: Endpoints
metadata:
  name: mysql-external
  namespace: wordpress
subsets:
- addresses: # 外部MySQL的IP
  - ip: 10.0.0.28
  ports: # 外部MySQL的端口
  - name: mysql
    port: 3306
    protocol: TCP

---

apiVersion: v1
kind: Service # 引用 Endpoints，只需将 name 设为和 Endpoints 同名，不需要设置标签选择器
metadata:
  name: mysql-external
  namespace: wordpress
spec:
  type: ClusterIP
  ports:
  - name: mysql
    port: 3306
    targetPort: 3306
    protocol: TCP

---

# nginx配置文件
kind: ConfigMap
apiVersion: v1
metadata:
  name: wordpress-nginx-config
  namespace: wordpress
data:
  nginx.conf: |
    user  nginx;
    worker_processes  2;

    error_log  /var/log/nginx/error.log notice;
    pid        /var/run/nginx.pid;


    events {
        worker_connections  1024;
    }


    http {
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;

        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                          '$status $body_bytes_sent "$http_referer" '
                          '"$http_user_agent" "$http_x_forwarded_for"';

        access_log  /var/log/nginx/access.log  main;

        sendfile        on;
        #tcp_nopush     on;

        keepalive_timeout  65;

        gzip  on;

        include /etc/nginx/conf.d/*.conf;
    }
  xiangzheng.com.conf: |
    server {
        listen       80;
        server_name  _;
        return       301 https://$host$request_uri;
    }
    server {
        server_name  xiangzheng.com;
        listen       80;
        return 301 https://xiangzheng.com$request_uri;
        listen       443 ssl;        
        ssl_certificate /etc/nginx/certs/tls.crt;
        ssl_certificate_key /etc/nginx/certs/tls.key;
    
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }
    
        #error_page  404              /404.html;
    
        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    
        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}
    
        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}
    }

---

# xiangzheng.com的证书
apiVersion: v1
kind: Secret
metadata:
  name: xiangzheng.com
  namespace: wordpress
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUZiVENDQTFVQ0ZEUy9ta3J4c3BHN1J4NkVLQnUrSHhTWk1QVnFNQTBHQ1NxR1NJYjNEUUVCQ3dVQU1ISXgKQ3pBSkJnTlZCQVlUQWtOT01SQXdEZ1lEVlFRSURBZENaV2xxYVc1bk1SQXdEZ1lEVlFRSERBZENaV2xxYVc1bgpNUk13RVFZRFZRUUtEQXBCZW1obGJtZExaVXBwTVJFd0R3WURWUVFMREFoUVpYSnpiMjVoYkRFWE1CVUdBMVVFCkF3d09lR2xoYm1kNmFHVnVaeTVqYjIwd0lCY05Nakl4TVRBMk1qTTFPVE16V2hnUE1qRXlNakV3TVRNeU16VTUKTXpOYU1ISXhDekFKQmdOVkJBWVRBa05PTVJBd0RnWURWUVFJREFkQ1pXbHFhVzVuTVJBd0RnWURWUVFIREFkQwpaV2xxYVc1bk1STXdFUVlEVlFRS0RBcEJlbWhsYm1kTFpVcHBNUkV3RHdZRFZRUUxEQWhRWlhKemIyNWhiREVYCk1CVUdBMVVFQXd3T2VHbGhibWQ2YUdWdVp5NWpiMjB3Z2dJaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQ0R3QXcKZ2dJS0FvSUNBUURrbzY0aDZHOGxkVUExd1dCQ2xEZG1ZQkc5YUkyQmFVeVkzWUlRNlhVYkd3MTcvQ3VvWFlUdQp3YU1lUHgxV1VGY0dwVFUyaS83eXprbXdKVk9RYzNWeFpBVVdZKzlXcVY0bElyVjhkbW91WW56OUNjOUJXbitRCmFSYkJkbE85YlNEOFJjN0dpcFRNNEZNVll1VzRxVXAvYWZsTmdwTjlrTkVrM01ZSHFiZjlaeG9hb1hObnlBVHoKTGlwWGZiejdsamFTRnVXNzlMRzcrRGhqeS9PK2VHY2JFNzBXSXdxdCsxcFI1NGNBRUVXd0JPZGtuM1ZaMGkyZgpvQ1NpQXpwNmxDSlVOUm5adG5BR0VCdUF4dExWV2xTL0p0dElpRzQyT1dacEJvakVmMmNXMEU1VHR3cjAvNmY2Ck1Xa3BienprbVJOTWxNS2FybXIxcTJZMkZ1QmFYa2ZPM3l5azlpSUYzQlplanZNSVU0ZEVLQzhOc1gzT1lHZDAKZFJrcHVpOTVXMzgzUkMyN3dyVGxlQURUbGRNTzBOdzRtWWZtd3FUTWVVKzdvN29zYTJPTXhPYVROdGhVV2ovMwpaUC9OanFPS2premxlUHFPQW5QbmtTS1FTcWdMelRYT2FvWVNjNHFuSytqS040bGxIZHJZU3JVSVNIY3VxdVgzCnloRm9Qb0tUN3BSaXMrektDNDdJRVJha0ZHYXY5MVk1bkRHakV0d3N4MmVCNWVVZWZuYTFyUk9ZN0RjUTdNVDMKK3Z1NzJTZlJIQURnZkVHb2h3SytnYkFkS01yT0JrMjZraVFoc25WTmc3dEtmUnRUMmZMdTNLbTk0eG1DRlp5VQpRQ3BXRkMvczg0YUhhaXZEanZBejU0MTFEdTdZZUhzUzRicmVnSklpbVdZREExL3B6Mjh4bHdJREFRQUJNQTBHCkNTcUdTSWIzRFFFQkN3VUFBNElDQVFBMFJreXVDdUxLU3ZsT0VjWitFaHZvQUczMkZTVXcxdWMvdk1Tdmw2bFkKVFMzY2huZ09BQmZ1WjlaRnpwZ2tKWDRXc1J1OEU4VFJzRVpyMVJuUktYOVRsRlZ6L0ZxVXZOalBBNmVjUCtlRQpyOUhtL0JkQTFUZGJkOW9nOWtLN0JzYTJKODlWazNPekRSOU10VUxmYVBTbFFNZjF6bSs0YjdscEgwZnl6QzFhCmVGOHpPU1AvL2NNcGtJY2VQczY3bGdGUWo4azF6VUxTVmdYRE1iV0ZWTC9JMDRwTEdmdWp3V1ZtYkZoSmV3dXkKWCtsdVBEZXBwMTJqZ1hHbkRQc1VFekNDWDJNV2dBcG1BVUs4dnJTaVUrVjRoNnpjamRyNWJnRlJaUmw2OVBIcApzaDE1cnB1WHVlTjRRZGpYOGlZTEJ2OUhNbkU4anJGUnpSTTJzODJ2QVVMMk1ZL0cxSXlVcHpkZHFVb1EyY3E3CmdBZDVtdVV2eTMvQ3hHbHRKSVNnWXhtcGhNVHIyTUxzRE1oQkFoMlBSN1ZNNGRidDRwdFRUSE1zSC9LckFCc1YKNVZBVUZUQzVqTDA3RzdNZ2p0OE56VzdERWtZSm82d21nS2RBQld1YmFseTFFdjdPNkJpTzdKQW9MYTJ4OVUxcwpDS2FyRHFTbUdaenNDRmlBMTVycldiL1dhTHU3bzY5RHUwNXp1TWw5Nk9QcGVIMFpaa0k0RDRvSnd1ZW5Uc3dJClV0SnZGNzdhQkZyYnZCeVBxTkh5dlBmaENkV3BybXZWTi9nYkgvNGRESlZlUXpCQ3YyZmNvU0loaGRySzBoZE4KTDRhNWdqbHM5d0VwMVVuenR0YkF0ZitwZGdBZTFveTN5WU1XOFY1Um5JcTVmb3NtbFhHc3lDMUgwOFQwL05FbApsdz09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
  tls.key: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlKS1FJQkFBS0NBZ0VBNUtPdUllaHZKWFZBTmNGZ1FwUTNabUFSdldpTmdXbE1tTjJDRU9sMUd4c05lL3dyCnFGMkU3c0dqSGo4ZFZsQlhCcVUxTm92KzhzNUpzQ1ZUa0hOMWNXUUZGbVB2VnFsZUpTSzFmSFpxTG1KOC9RblAKUVZwL2tHa1d3WFpUdlcwZy9FWE94b3FVek9CVEZXTGx1S2xLZjJuNVRZS1RmWkRSSk56R0I2bTMvV2NhR3FGegpaOGdFOHk0cVYzMjgrNVkya2hibHUvU3h1L2c0WTh2enZuaG5HeE85RmlNS3JmdGFVZWVIQUJCRnNBVG5aSjkxCldkSXRuNkFrb2dNNmVwUWlWRFVaMmJad0JoQWJnTWJTMVZwVXZ5YmJTSWh1TmpsbWFRYUl4SDluRnRCT1U3Y0sKOVArbitqRnBLVzg4NUprVFRKVENtcTVxOWF0bU5oYmdXbDVIenQ4c3BQWWlCZHdXWG83ekNGT0hSQ2d2RGJGOQp6bUJuZEhVWktib3ZlVnQvTjBRdHU4SzA1WGdBMDVYVER0RGNPSm1INXNLa3pIbFB1Nk82TEd0ampNVG1remJZClZGby85MlQvelk2amlvNU01WGo2amdKejU1RWlrRXFvQzgwMXptcUdFbk9LcHl2b3lqZUpaUjNhMkVxMUNFaDMKTHFybDk4b1JhRDZDays2VVlyUHN5Z3VPeUJFV3BCUm1yL2RXT1p3eG94TGNMTWRuZ2VYbEhuNTJ0YTBUbU93MwpFT3pFOS9yN3U5a24wUndBNEh4QnFJY0N2b0d3SFNqS3pnWk51cElrSWJKMVRZTzdTbjBiVTlueTd0eXB2ZU1aCmdoV2NsRUFxVmhRdjdQT0doMm9ydzQ3d00rZU5kUTd1MkhoN0V1RzYzb0NTSXBsbUF3TmY2Yzl2TVpjQ0F3RUEKQVFLQ0FnRUF1aWhLNzNEQWprOFpLS3Q2Skx0cElBRzRiKzlneDYxa29GSTZSR3JRM25ENFdhcklJUjJEenFINgpuZlhsZlJHTXlleFpsMEFGSk15eFVxb1JqOXR5RkJETDA1OHFqL1Qyb21YUVByWnJYYmp5NjFQQlhBVERPR0ZZCkZjeXlBZG1Jc2Q1a3JXTElKTWZBM2ZqWDhiSms1Ymp6TXhqTjNiNjdpcmYyeE9aNjErZkthVVJySW1USkl2YkQKb3RqTnRrcG54Q3JBZ25pSS9mTHNkdFRvY0h5MzltUHI0TXBITjhFZm1QQmFDc00wK2t3RDJ2bTZJcGZ1YmJtRwpHaU5teWNjeTdEMFAveU43c25RSzhKN3hxcVVSdTFGMzJXYTcxWXFHeDV4Nlh3TWNmSWErUDRzWmNNRjNrMDRICndhVEFmNS9qQnNkWWEzajN2VzhBbWFtbW9lMkJxSFBJWWJUcVlDYnBYVjZtcVRHNTgwSkFBVVhFVzlpUUJKenoKNE1hMjlJbmQ0WGhFQkRmcGl6bEpGN04rUml4c2pobmtxRkxBM3ZLakN5NkE1bmZlRG96UlZnaUdQTjZGNVJiMQpEYytuMGV1a0R5WDB4cGt2VmxnYnBDWlpxMzZTY0VCaFNoZjFMUWhDMytXTWZDUjNJdlNPOVZ3TVRCRkgyUDFGCml5L0VBNXpqN1hsN1VHZS9BblVrZis4U0IxUVJtZGZReHh2ODFOUjJyYUJ0ZkFDRGlHbThRbkdPemhHWlQrbG8KQi9vTU1wa0lmMlJ1dzloN25vU3M5T1ZnaFJaVm5JOHB3UFhvbGRSdmVRelhBRVR3R0Nld0tUc0NBZVdtdmx1SApWYTI3VGp2V0pYUmIvVXJYWnVPZ1J5VGV2Y2JSY1dONzduZHlJTWNGRjRxcFBCdkdEQUVDZ2dFQkFQMTBiN3M2CktXTDBJMXNqU3U2aC9YMGJPM3pxZ1Q4MWtsblJtbGNTMUpYSmZ5dWw0aXZrZXNnVGQzK3kwaW1Db2FIZzFXckwKR0tEK25xT0t1MWlBSVJCZ3VTSGhxOGRIcm56dUFmT1luQVVzckgxa2lTZEZyK0gyZUM3blhXZEs0TXRmL2JkYgpHWnZrYWFMQXdJRkhIUHU3cS9lTFQ5WThVdkRoRjBKc2t2c3l6ZlFKblJ3blZPc2hoQXlOYURFemF1dURxd1h6CnNtZFVmUGlyTXN2S1Z3bFdORVROY2UxTWVBdXhCazRYTU1KSkhRcVFDd3FIUjc4dHdTUnkrK1lzbjdQZytnZkcKcXVxNllRUWVFWVIyYTBvRTg4bk1uM0VwN3A5N0FZVjNjWEg0dnBnQ3FDOGF0T2hPTWdsZkZaQUN5SmdLMnRrRQprdy96RkN2VnV5RmRuSGNDZ2dFQkFPYnZjekNQeXBUZ01oc20wNTFnaUFLNU9icW1vekczN0MxSEhFVktrZUtQCmc2TmR1WVcwLzNBS2NwZ04vNEFJOElScmtSMmUrTUtWY1F3YUo2WEoxQXgrQWk1UUQxWEhFREhka3hZa0xjVkgKUGhQbWp2WEowTW00NUplQXV0N25aeDh1QTVLcFJlRW5rbHZydHdlazBGeWc0alphbVRnMEpqNXh3T0N2bG1hMwp2QkJlUVBTTXlLUUxJYUFpWjBzeW9Wc0tGb3BSVkpvMFV1SGpsTHlUNnFwNDhLMTRnNzdnOXc1RDhvOEpXYUMrCjhFbWlFZEoxTm02aFp1ZnFUdnZZdEhIL2h3R2JkeGFQWk1UN3FUYkhyWEtFZCtrS1JXWFlmWXdWNE1iVUlzL28KRE1nRlo2U0RXbFF3Rm8xVEcyTTNLQzZhZ3Z4ZktEK25JMFYxYkpwQSsrRUNnZ0VCQUpWeU9ZdUpRT3dERG5Ibgp2b0EwN2hYOW43Y0pRMHAxR1NWeTdQR1l2ZGJRWi9iaHFobTljQlJYUGlnQzFkNzZFcm96cTBOOEc3cWFTQW9nCmZGVXp2OHM3YlE0b1ZiUjhkTXRmUDdGVjgvRXRKVXdPb3J5UVg2UDZRMlZNc1F0OTRFeXEvaHhHVURSV20xOEgKRHJ0cnBoQmMyWXB1RDVaQUhadkE3WWtTSWh5U0dWUmk4c3V0K1dsbmFzaEgvUDY5MWJhbS9ZblY1d1Q4a1cvQwo2b0cxZmxxWUJOdm8wOXRiTXBHYVFTQjhsaGlKS2VHWGk1c2FwMWgzN3lIQjF2d2lwY3hYeExZZkU1cXlhUkFYCmRyYkhhSDNOcTczNnRLenlUNnlqeUFMZHFmdk04djBJM0FoaVUvZUNYQWlnazBOR0VPZHR4eHNka21WZUxDK28KcDkyRnFBTUNnZ0VBZmplRElwaUVaVWYvdXIxR3pXNFVDRUVLSDB5eVJ4czU5eWsxZDEyaFRFMlo2ZkR3MC9Zdgo0aUdqcmgyQWRvN3NQY080eFpLOGJVVldTd0lFaDJVL0F6RGZxa1pSaTFWSU1hamptaWRkNk1QZVZ1d2RXSkxjCkRWU0RnNVoxREIwM1RHQk96WnE4dWFseUlkRTc4TzZRZnYvamcwZVRGSmZVQ3k4Szl3S2cxalUza1U2aWU4WnkKWnM0NnE1WUNGS1J3Y2h5YVl6QytaNldQWXl5S2YyTHMwQTFYcGNnSFlZejlHb3ZpaDNEWnpyUnRDaUdOVWhTRQpFb1VlaEVTWXRLY2xRR1VqZWFwcHRTZmNNSmxIUzh4b3JQMWZ1RHZINERrcHJTWEwrMys0SXgrMTFLQzNtNys2CjMrYUVmT3RlUGFUSXptZmVqV2JJemJsZzJyYXFDOGpXb1FLQ0FRQWF5NDhCZlJZbE5YWXdVWGVvTmJHOWpKS0UKTDg3cXFYVHFtRDkvRmo0SktEVWpkd3oxdlFTWWVCejZSbFNSY29hQ2ZTTnpIcWhMU2JWcSttKy9WZmtHNHZxdQpVb2pRWGxEQ09CbGFwcTVzNWdsSUZndmRldmQ2OTEwQTljb0hQamh6MjVodER3L1pmaUt5Q0J2bDJ1dXYrRGJNCnduaEEzempHVklXd3R1UnB6bjFOeFZqK0NLbTlSNmhxYTVBY0crU0toYmJwVnl5aFcxUTc1SlYvOXAwVnBFeTIKSlVtdFhGZ3MxN2lYMzQrNzNmRVZKb1VsYTFjOVZrNm9tY3NOZnBwKzdRbEhObldRbzc0dUZCK0tRNlgvT2NpSApQVkRsVThVK2RDQTBYMDQ0T0Jla3FJRmdjUy80SlRsTnJNZllMWU1kVzh0VzY1M2hhSkVVRE43OHYydmMKLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0K

---

# wordpress的service
apiVersion: v1
kind: Service
metadata:
  name: wordpress-svc
  namespace: wordpress
spec:
  type: NodePort
  selector:
    app: wordpress
  ports:
  - port: 80
    targetPort: 443
    nodePort: 30080
  #- port: 443
  #  targetPort: 443
  #  nodePort: 30443

---

# wordpress的Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: wordpress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: wordpress
  template:
    metadata:
      labels:
        app: wordpress
    spec:
      containers:
      - name: nginx
        image: nginx:1.23
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
          - containerPort: 80
          - containerPort: 443
        volumeMounts:
          #- name: nginx-conf
          #  mountPath: /etc/nginx/nginx.conf
          #  subPath: nginx.conf
          - name: nginx-conf
            mountPath: /etc/nginx/conf.d/xiangzheng.com.conf
            subPath: xiangzheng.com.conf
          - name: wordpress-data
            mountPath: /var/www/html
          - name: certs
            mountPath: /etc/nginx/certs/
      - name: wordpress
        image: wordpress:php7.4-fpm
        env:
        - name: WORDPRESS_DB_HOST
          value: 'mysql-external.wordpress.svc.k8s.xiangzheng.com'
        - name: WORDPRESS_DB_USER
          value: 'wp-user'
        - name: WORDPRESS_DB_PASSWORD
          value: 'wppass'
        - name: WORDPRESS_DB_NAME
          value: wordpress
        - name: WORDPRESS_TABLE_PREFIX
          value: wp_
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        volumeMounts:
          - name: wordpress-data
            mountPath: /var/www/html
        ports:
          - containerPort: 9000
      volumes:
        - name: nginx-conf
          configMap:
            name: wordpress-nginx-config
        - name: wordpress-data
          hostPath:
            path: /data/wordpress
        - name: certs
          secret:
            secretName: xiangzheng.com
```

### problem

- 有问题，https访问不了 并且提示以下错误，为什么重定向到30080了？

```sh
# curl https://xiangzheng.com -ILk
HTTP/1.1 301 Moved Permanently
Server: nginx/1.23.1
Date: Mon, 07 Nov 2022 08:26:32 GMT
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
X-Redirect-By: WordPress
Location: https://xiangzheng.com:30080/

curl: (7) Failed to connect to xiangzheng.com port 30080: Connection refused
```



## ---

## 01-endpoint-mysql.yaml

```yaml
apiVersion: v1
kind: Endpoints
metadata:
  name: mysql-external
  namespace: wordpress
subsets:
- addresses: # 定义外部MySQL的IP
  - ip: 10.0.0.28
  ports: # 定义外部MySQL的端口
  - name: mysql
    port: 3306
    protocol: TCP
```

## 02-service-mysql.yaml

```yaml
apiVersion: v1
kind: Service # 引用 Endpoints，只需将 name 设为和 Endpoints 同名，不需要设置标签选择器
metadata:
  name: mysql-external
  namespace: wordpress
spec:
  type: ClusterIP
  ports:
  - name: mysql
    port: 3306
    targetPort: 3306
    protocol: TCP
```





## 03-configmap-wordpress.yaml

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: wordpress-nginx-config
  namespace: wordpress
data:
  nginx.conf: |
    user  nginx;
    worker_processes  2;

    error_log  /var/log/nginx/error.log notice;
    pid        /var/run/nginx.pid;


    events {
        worker_connections  1024;
    }


    http {
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;

        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                          '$status $body_bytes_sent "$http_referer" '
                          '"$http_user_agent" "$http_x_forwarded_for"';

        access_log  /var/log/nginx/access.log  main;

        sendfile        on;
        #tcp_nopush     on;

        keepalive_timeout  65;

        gzip  on;

        include /etc/nginx/conf.d/*.conf;
    }
  xiangzheng.com.conf: |
    server {
        listen 80;
        #listen 443 ssl;
        server_name xiangzheng.com;
    	#ssl_certificate /data/certs/llinux.cn/llinux.cn.pem;
        #ssl_certificate_key /data/certs/llinux.cn/llinux.cn.key;
    
        location / {
            #if ( $scheme = http ) {
            #    rewrite / https://$host redirect;
            #}
            root /var/www/html/;
            index index.php;
        }
    
        location ~ \.php$ {
            root           html;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  /var/www/html$fastcgi_script_name;
            include        fastcgi_params;
            fastcgi_hide_header X-Powered-By;
            fastcgi_connect_timeout 300s;
            fastcgi_send_timeout 300s;
            fastcgi_read_timeout 300s;
    	}
    }
```



## 04-service-wordpress.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: wordpress-svc
  namespace: wordpress
spec:
  type: NodePort
  selector:
    app: wordpress
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
```







## 05-deployment-wordpress.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wordpress
  namespace: wordpress
spec:
  replicas: 1
  selector:
    matchLabels:
      app: wordpress
  template:
    metadata:
      labels:
        app: wordpress
    spec:
      containers:
      - name: nginx
        image: nginx:1.23
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
          - containerPort: 80
          #- containerPort: 443
        volumeMounts:
          - name: nginx-conf
            mountPath: /etc/nginx/nginx.conf
            subPath: nginx.conf
          - name: nginx-conf
            mountPath: /etc/nginx/conf.d/xiangzheng.com.conf
            subPath: xiangzheng.com.conf
          - name: wordpress-data
            mountPath: /var/www/html
      - name: wordpress
        image: wordpress:php7.4-fpm
        env:
        - name: WORDPRESS_DB_HOST
          value: 'mysql-external.wordpress.svc.k8s.xiangzheng.com'
        - name: WORDPRESS_DB_USER
          value: 'wp-user'
        - name: WORDPRESS_DB_PASSWORD
          value: 'wppass'
        - name: WORDPRESS_DB_NAME
          value: wordpress
        - name: WORDPRESS_TABLE_PREFIX
          value: wp_
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        volumeMounts:
          - name: wordpress-data
            mountPath: /var/www/html
        ports:
          - containerPort: 9000
      volumes:
        - name: nginx-conf
          configMap:
            name: wordpress-nginx-config
        - name: wordpress-data
          hostPath:
            path: /data/wordpress
```









# 方案二

作业：

	在kubernetes部署wordpress，要满足以下要求：
	以下全部在kubernetes中部署
	(1) 部署一个独立的nginx Pod实例，为wordpress提供反向代理；同时提供https和http虚拟主机，其中发往http的请求都重定向给https；以ConfigMap和Secret提供必要的配置；
	(2) 独立部署两个wordpress Pod实例，它们使用Longhorn存储卷存储用户上传的图片或文件等数据；以ConfigMap和Secret提供必要的配置；
	(3) 部署一个mariadb或mysql数据库；以ConfigMap和Secret提供必要的配置；





# 1

```nginx
    server {
        listen 80;
        #listen 443 ssl;
        server_name xiangzheng.com;
    	#ssl_certificate /data/certs/llinux.cn/llinux.cn.pem;
        #ssl_certificate_key /data/certs/llinux.cn/llinux.cn.key;
    
        location / {
            #if ( $scheme = http ) {
            #    rewrite / https://$host redirect;
            #}
            root /var/www/html/;
            index index.php;
        }
    
        location ~ \.php$ {
            root           html;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  /var/www/html$fastcgi_script_name;
            include        fastcgi_params;
            fastcgi_hide_header X-Powered-By;
            fastcgi_connect_timeout 300s;
            fastcgi_send_timeout 300s;
            fastcgi_read_timeout 300s;
    	}
    }




    server {
        server_name  xiangzheng.com;
        listen       80;
        listen       443 ssl;        
        ssl_certificate /etc/nginx/certs/tls.crt;
        ssl_certificate_key /etc/nginx/certs/tls.key;
    
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }
    
        #error_page  404              /404.html;
    
        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    
        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}
    
        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}
    }
```

