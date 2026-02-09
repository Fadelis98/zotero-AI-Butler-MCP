# 如何发布新版本

本指南面向项目维护者，介绍如何发布新版本。

## 发布步骤

### 1. 确保代码已准备就绪

- 所有功能已完成并测试
- 所有测试通过
- 文档已更新

### 2. 更新版本号

编辑 `package.json` 文件，更新版本号：

```json
{
  "version": "3.4.0"
}
```

版本号格式：`主版本.次版本.补丁版本`

- **主版本**：重大功能更新或不兼容的更改
- **次版本**：新功能添加，向后兼容
- **补丁版本**：bug 修复

### 3. 提交版本更新

```bash
git add package.json
git commit -m "chore: bump version to 3.4.0"
git push origin main
```

### 4. 创建并推送版本标签

```bash
git tag v3.4.0
git push origin v3.4.0
```

⚠️ **重要**：标签格式必须是 `v` + 版本号（如 `v3.4.0`）

### 5. 等待自动发布

推送标签后：

1. GitHub Actions 会自动触发构建流程
2. 构建完成后会创建新的 Release
3. Release 中会包含 XPI 文件和更新配置文件

### 6. 检查发布结果

访问 [Releases 页面](https://github.com/Fadelis98/zotero-AI-Butler-MCP/releases) 确认：

- ✅ Release 已创建
- ✅ XPI 文件已上传
- ✅ update.json 文件已上传
- ✅ Release 说明自动生成

## 发布后的工作

### 编辑 Release 说明

GitHub 会自动生成 Release 说明，但建议手动编辑添加：

1. 主要新功能说明
2. Bug 修复列表
3. 已知问题
4. 致谢

### 通知用户

可以通过以下方式通知用户：

- 在相关 Issue 中评论
- 在 Discussion 中发布公告
- 更新文档中的版本信息

## 常见问题

### Q: 如果发布失败怎么办？

A:

1. 查看 [Actions](https://github.com/Fadelis98/zotero-AI-Butler-MCP/actions) 页面的错误日志
2. 修复问题后，删除标签重新发布：
   ```bash
   git tag -d v3.4.0
   git push origin :refs/tags/v3.4.0
   git tag v3.4.0
   git push origin v3.4.0
   ```

### Q: 如何发布预发布版本？

A: 使用带有后缀的版本号：

```bash
# 例如 beta 版本
git tag v3.4.0-beta.1
git push origin v3.4.0-beta.1
```

在 GitHub Release 页面勾选 "This is a pre-release"。

### Q: 如何撤回已发布的版本？

A: 在 Releases 页面：

1. 找到要撤回的版本
2. 点击 "Delete" 删除 Release
3. （可选）删除对应的 Git 标签

## 发布检查清单

发布前请确认：

- [ ] 版本号已更新
- [ ] 更新日志已准备
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] 代码已推送到 main 分支
- [ ] 标签格式正确（v + 版本号）

发布后请确认：

- [ ] GitHub Actions 构建成功
- [ ] Release 已创建
- [ ] XPI 文件可下载
- [ ] 安装测试通过
- [ ] Release 说明已完善
