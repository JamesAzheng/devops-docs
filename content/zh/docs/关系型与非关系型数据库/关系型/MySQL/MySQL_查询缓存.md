# MySQL8.0 取消查询缓存的功能

尽管MySQL Query Cache旨在提高性能，但它存在严重的可伸缩性问题，并且很容易成为严重的瓶颈。

自MySQL 5.6（2013）以来，默认情况下已禁用查询缓存，其不能与多核计算机上在高吞吐量工作负载情况下进行扩展。

另外有时因为查询缓存往往弊大于利。比如:查询缓存的失效非常频繁，只要有对一个表的更新，这个表上的所有的查询缓存都会被清空。因此很可能你费劲地把结果存起来，还没使用呢，就被一个更新全清空了。对于更新压力大的数据库来说，查询缓存的命中率会非常低。除非你的业务有一张静态表，很长时间更新一次，比如系统配置表，那么这张表的查询才适合做查询缓存。目前大多数应用都把缓存做到了应用逻辑层，比如:使用redis或者memcache





# 查询缓存相关的服务器变量

```sql
SHOW VARIABLES LIKE 'query_cache_%';

query_cache_min_res_unit：#查询缓存中内存块的最小分配单位，默认4k，较小值会减少浪费，但会导致更频繁的内存分配操作，较大值会带来浪费，会导致碎片过多，内存不足
query_cache_limit：#单个查询结果能缓存的最大值，单位字节，默认为1M，对于查询结果过大而无法缓存的语句，建议使用SQL_NO_CACHE
query_cache_size：#查询缓存总共可用的内存空间；单位字节，必须是1024的整数倍，最小值40KB，低于此值有警报
query_cache_wlock_invalidate：#如果某表被其它的会话锁定，是否仍然可以从查询缓存中返回结果，默认值为OFF，表示可以在表被其它会话锁定的场景中继续从缓存返回数据；ON则表示不允许
query_cache_type：#是否开启缓存功能，取值为ON, OFF, DEMAND（DEMAND:按需开启）
```



# 查询缓存相关的状态变量

```SQL
SHOW GLOBAL STATUS LIKE 'qcache%';

Qcache_free_blocks：#处于空闲状态 Query Cache中内存 Block 数
Qcache_total_blocks：#Query Cache 中总Block ，当Qcache_free_blocks相对此值较大时，可能用内存碎片，执行FLUSH QUERY CACHE清理碎片
Qcache_free_memory：#处于空闲状态的 Query Cache 内存总量
Qcache_hits：#Query Cache 命中次数
Qcache_inserts：#向 Query Cache 中插入新的 Query Cache 的次数，即没有命中的次数
Qcache_lowmem_prunes：#记录因为内存不足而被移除出查询缓存的查询数
Qcache_not_cached：#没有被 Cache 的 SQL 数，包括无法被 Cache 的 SQL 以及由于
query_cache_type： #设置的不会被 Cache 的 SQL语句
Qcache_queries_in_cache：#在 Query Cache 中的 SQL 数量
```



# 查询缓存优化

![16765593181388201494(1)](C:\Users\阿征\Desktop\运维指南\原理图\16765593181388201494(1).png)



# 命中率和内存使用率估算

- 查询缓存中内存块的最小分配单位query_cache_min_res_unit ：

```
(query_cache_size - Qcache_free_memory) / Qcache_queries_in_cache
```

- 查询缓存命中率 ：

```
Qcache_hits / ( Qcache_hits + Qcache_inserts ) * 100%
```

- 查询缓存内存使用率：

```
(query_cache_size – qcache_free_memory) / query_cache_size * 100%
```





