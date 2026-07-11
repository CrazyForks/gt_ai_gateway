# Sutando query().update() 绕过 casts 的问题

## 问题

Sutando 的 `Model.query().where(...).update(data)` 是直接拼 SQL 字符串的，不经过 model 实例的 `setAttribute` → `casts` 转换链路。

对于 `casts: 'json'` 或自定义 cast 的字段，如果 `updateData` 里传的是**对象**（非字符串），拼出来的 SQL 类似：

```sql
UPDATE vendor SET urls = {"openai":"https://..."} WHERE id = 1
```

SQLite 不接受对象类型的绑定值，直接抛：

```
TypeError: SQLite3 can only bind numbers, strings, bigints, buffers, and null
```

而 `Model.query().create(data)` 是安全的——它内部走 `newModelInstance()` + `instance.save()`，会经过 casts。

## 规避方式

`query().update()` 可以继续用，但 json / 自定义 cast 字段需要**手动序列化为字符串**后再传：

```ts
// ✅ query().update() + 手动序列化
await SgVendor.query().where('id', id).update({
    urls: JSON.stringify(urlsObj),
    config: JSON.stringify(configObj),
});
```

传不对会直接报错，所以不会悄无声息出 bug，是个"安全"的手动约定。

## 当前项目里用到的 models

| Model | casts | query().create() | query().update() |
|---|---|---|---|
| SgVendor | urls: json, config: SgVendorConfig | ✅ | ✅ 手动 JSON.stringify |
| SgModel | prices: json | ✅ | 无 |
| SgClientConfig | configContent: json | ✅ | 无 |
| SgRecord | start_at: datetime, end_at: datetime | ✅ | ✅（标量，不需要处理） |

## 现行代码

- `src/service/vendorService.ts`：`updateVendor()` 中 `urls` / `config` 手动 `JSON.stringify` 后传入 `query().update()`
- `src/controller/vendorController.ts`：`createVendor()` 走 `query().create()`（安全路径）
