# 以wordpress库为例

- **最新版本就只有*.ibd文件了**

wordpress库的根目录：/var/lib/mysql/wordpress/

```bash
db.opt #数据库定义文件(字符集，排序规则...)
wp_commentmeta.frm #wp_commentmeta表的表结构文件
wp_commentmeta.ibd #wp_commentmeta表的表数据文件(存储数据和索引)
*.TRN #触发器相关文件
*.TRG #被监控表的触发器相关文件
```



# 如果为MyISAM存储引擎

- MyISAM的数据文件和索引文件是分开的，而InnoDB是二合一

```bash
tbl_name.frm #表格式定义
tbl_name.MYD #数据文件
tbl_name.MYI #索引文件
```

