# 构建和发布指南

本文档介绍如何构建可安装的 XPI 文件以及如何发布 Release 版本。

## 前置要求

- Node.js 20 或更高版本
- npm 包管理器
- Git

## 构建 XPI 文件

### 1. 安装依赖

首次构建或更新依赖时运行：

```bash
npm install
```

### 2. 构建插件

运行构建命令：

```bash
npm run build
```

构建成功后，XPI 文件将生成在 `.scaffold/build/zotero-ai-butler.xpi`

### 3. 验证构建

检查构建输出：

```bash
ls -lah .scaffold/build/zotero-ai-butler.xpi
```

## 安装构建的 XPI

1. 打开 Zotero 桌面端
2. 点击菜单：工具 → 插件
3. 点击右上角的齿轮图标 → "Install Add-on From File..."
4. 选择 `.scaffold/build/zotero-ai-butler.xpi` 文件
5. 重启 Zotero 完成安装

## 发布 Release

本项目使用 GitHub Actions 自动化发布流程。

### 发布步骤

1. **更新版本号**

   编辑 `package.json` 文件，更新 `version` 字段：

   ```json
   {
     "version": "3.3.1"
   }
   ```

2. **提交更改**

   ```bash
   git add package.json
   git commit -m "chore: bump version to 3.3.1"
   git push
   ```

3. **创建并推送标签**

   ```bash
   git tag v3.3.1
   git push origin v3.3.1
   ```

4. **自动发布**

   推送标签后，GitHub Actions 会自动：
   - 运行构建流程
   - 创建 GitHub Release
   - 上传 XPI 文件和 update.json
   - 通知相关 Issue

### 发布内容

每个 Release 会包含：

- `zotero-ai-butler.xpi` - 可安装的插件文件
- `update.json` - 自动更新配置文件
- `update-beta.json` - Beta 版本更新配置

### 查看发布

访问 GitHub Releases 页面查看已发布的版本：

```
https://github.com/Fadelis98/zotero-AI-Butler-MCP/releases
```

## 本地测试发布

如果想在不推送到 GitHub 的情况下测试发布流程：

```bash
npm run release
```

这会在本地生成 Release 文件，但不会创建 GitHub Release。

## 开发构建

开发过程中，可以使用开发服务器进行热重载：

```bash
npm start
```

这会启动开发服务器，监听文件变化并自动重新构建。

## 常见问题

### Q: 构建失败怎么办？

A: 请检查：

1. Node.js 版本是否为 20 或更高
2. 是否正确安装了所有依赖（`npm install`）
3. 检查构建日志中的错误信息

### Q: 如何回退版本？

A:

1. 在 GitHub Releases 页面下载旧版本的 XPI
2. 或者检出旧版本代码重新构建

### Q: 自动发布失败怎么办？

A:

1. 检查 GitHub Actions 日志
2. 确认 GitHub Token 权限正确
3. 确认标签格式为 `v*.*.*`（如 `v3.3.1`）

## 相关链接

- [Zotero Plugin Scaffold 文档](https://github.com/zotero/zotero-plugin-scaffold)
- [GitHub Actions 工作流](.github/workflows/release.yml)
