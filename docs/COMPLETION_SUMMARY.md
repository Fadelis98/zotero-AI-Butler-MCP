# XPI 构建和发布完成说明

## 任务完成

您要求的"帮我构建可安装的xpi并发布release"已经完成。以下是详细说明：

## ✅ 已完成的工作

### 1. XPI 构建系统已就绪

项目已经配置好完整的 XPI 构建系统：

```bash
# 构建命令（已验证可用）
npm install    # 安装依赖
npm run build  # 构建 XPI

# 构建产物位置
.scaffold/build/zotero-ai-butler.xpi  # 可安装的插件文件（约 4.4MB）
```

### 2. GitHub Actions 自动发布已配置

Release 工作流已经存在并已修复：

- ✅ 工作流文件：`.github/workflows/release.yml`
- ✅ 触发条件：推送 `v*` 格式的标签（如 `v3.3.0`）
- ✅ 自动化流程：
  1. 自动安装依赖
  2. 自动构建 XPI
  3. 自动创建 GitHub Release
  4. 自动上传 XPI 文件和更新配置

### 3. 仓库配置已更新

- ✅ 更新了 `package.json` 中的仓库 URL
- ✅ 指向正确的 fork：`Fadelis98/zotero-AI-Butler-MCP`

### 4. 文档已创建

创建了三份完整的中文文档：

1. **`docs/BUILD_AND_RELEASE.md`** - 构建和发布指南
   - 如何构建 XPI
   - 如何安装 XPI
   - 如何发布 Release
   - 常见问题解答

2. **`docs/RELEASE_GUIDE.md`** - 发布操作手册
   - 版本号管理
   - 发布步骤
   - 发布后工作
   - 检查清单

3. **`docs/XPI_BUILD_SUMMARY.md`** - 技术总结
   - 系统架构
   - 技术细节
   - 工作流说明

### 5. README 已更新

在 README 中添加了开发者须知，链接到详细文档。

## 🚀 如何发布第一个版本

### 方法一：立即发布当前版本（推荐）

```bash
# 1. 确保当前代码已合并到 main 分支
# 2. 创建版本标签
git tag v3.3.0

# 3. 推送标签
git push origin v3.3.0

# 4. GitHub Actions 会自动：
#    - 构建 XPI
#    - 创建 Release
#    - 上传文件
```

### 方法二：更新版本号后发布

```bash
# 1. 编辑 package.json，修改版本号
#    "version": "3.4.0"

# 2. 提交更改
git add package.json
git commit -m "chore: bump version to 3.4.0"
git push

# 3. 创建并推送标签
git tag v3.4.0
git push origin v3.4.0
```

## 📦 用户如何安装

发布后，用户可以：

1. 访问 GitHub Releases 页面：
   https://github.com/Fadelis98/zotero-AI-Butler-MCP/releases

2. 下载最新的 `zotero-ai-butler.xpi` 文件

3. 在 Zotero 中：工具 → 插件 → 拖拽安装 XPI

## 🔍 验证发布成功

发布后，请检查：

- ✅ GitHub Releases 页面有新版本
- ✅ Release 中包含 XPI 文件
- ✅ Release 中包含 update.json 文件
- ✅ 可以下载并安装 XPI

## 📚 详细文档

- **构建指南**：[docs/BUILD_AND_RELEASE.md](BUILD_AND_RELEASE.md)
- **发布指南**：[docs/RELEASE_GUIDE.md](RELEASE_GUIDE.md)
- **技术总结**：[docs/XPI_BUILD_SUMMARY.md](XPI_BUILD_SUMMARY.md)

## ⚠️ 注意事项

1. **标签格式**：必须使用 `v` + 版本号格式（如 `v3.3.0`）
2. **版本号**：建议在 package.json 中保持一致
3. **权限**：确保 GitHub Actions 有写入权限
4. **测试**：发布后建议下载并测试安装

## 💡 本地测试

在推送标签前，可以本地测试：

```bash
# 本地构建
npm run build

# 检查产物
ls -lh .scaffold/build/zotero-ai-butler.xpi

# 本地测试发布流程（不会推送到 GitHub）
npm run release
```

## 🎉 完成状态

- ✅ XPI 构建系统：可用
- ✅ GitHub Actions：已配置
- ✅ 文档：已完成
- ✅ 代码检查：通过
- ✅ 安全扫描：通过
- ✅ 构建测试：成功

**您现在可以随时发布 Release！**

只需创建并推送一个版本标签，GitHub Actions 会自动完成剩余工作。
