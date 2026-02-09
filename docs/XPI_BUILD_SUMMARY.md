# XPI 构建和发布系统总结

## 概述

本文档总结了为 Zotero AI Butler MCP 项目设置的 XPI 构建和发布系统。

## 已完成的工作

### 1. 验证现有构建系统

项目已经配置了完整的构建系统：

- ✅ **构建工具**：使用 `zotero-plugin-scaffold` 作为构建工具
- ✅ **配置文件**：`zotero-plugin.config.ts` 包含完整的构建配置
- ✅ **构建脚本**：`npm run build` 命令可以生成 XPI 文件
- ✅ **输出目录**：构建产物输出到 `.scaffold/build/` 目录

### 2. 验证 GitHub Actions 工作流

项目已配置两个重要的 GitHub Actions 工作流：

#### CI 工作流 (`.github/workflows/ci.yml`)

- 在推送到 main 分支或 PR 时触发
- 执行代码检查（linting）
- 执行构建
- 运行测试
- 上传构建产物

#### Release 工作流 (`.github/workflows/release.yml`)

- 在推送 `v*` 格式的标签时触发
- 自动构建 XPI
- 创建 GitHub Release
- 上传 XPI 文件和更新配置文件
- 通知相关 Issue

### 3. 更新仓库配置

更新了以下文件以适配当前的仓库：

#### `package.json`

```diff
- "url": "git+https://github.com/steven-jianhao-li/zotero-AI-Butler.git"
+ "url": "git+https://github.com/Fadelis98/zotero-AI-Butler-MCP.git"

- "url": "https://github.com/steven-jianhao-li/zotero-AI-Butler/issues"
+ "url": "https://github.com/Fadelis98/zotero-AI-Butler-MCP/issues"

- "homepage": "https://github.com/steven-jianhao-li/zotero-AI-Butler#readme"
+ "homepage": "https://github.com/Fadelis98/zotero-AI-Butler-MCP#readme"
```

### 4. 创建文档

创建了两份详细的中文文档：

#### `docs/BUILD_AND_RELEASE.md` - 构建和发布指南

包含内容：

- 前置要求
- 构建 XPI 文件的步骤
- 安装构建的 XPI 的方法
- 发布 Release 的完整流程
- 本地测试发布的方法
- 开发构建指南
- 常见问题解答

#### `docs/RELEASE_GUIDE.md` - 发布指南

面向项目维护者的发布步骤：

- 版本号管理
- 创建和推送标签
- 自动发布流程说明
- 发布后的工作
- 发布检查清单
- 常见问题处理

### 5. 更新 README

在 README.md 中添加了开发者须知，链接到构建文档：

```markdown
> **开发者须知**：如需从源码构建或了解发布流程，请参阅 [构建和发布指南](./docs/BUILD_AND_RELEASE.md)。
```

## 如何使用

### 本地构建 XPI

```bash
# 安装依赖
npm install

# 构建 XPI
npm run build

# XPI 文件位置
.scaffold/build/zotero-ai-butler.xpi
```

### 发布新版本

```bash
# 1. 更新 package.json 中的版本号
# 2. 提交更改
git add package.json
git commit -m "chore: bump version to x.x.x"
git push

# 3. 创建并推送标签
git tag vx.x.x
git push origin vx.x.x

# 4. GitHub Actions 会自动构建并创建 Release
```

## 技术细节

### 构建产物

每次构建会生成以下文件：

- `zotero-ai-butler.xpi` - 可安装的插件文件（约 4.4MB）
- `update.json` - 稳定版更新配置
- `update-beta.json` - Beta 版更新配置

### XPI 文件结构

XPI 文件实际上是一个 ZIP 压缩包，包含：

- `addon/` - 插件资源文件
  - `content/` - 内容脚本和资源
  - `manifest.json` - 插件清单文件
  - 其他资源文件

### 自动更新机制

插件支持自动更新，配置在 `zotero-plugin.config.ts` 中：

```typescript
updateURL: `https://github.com/{{owner}}/{{repo}}/releases/download/release/update.json`,
xpiDownloadLink: "https://github.com/{{owner}}/{{repo}}/releases/download/v{{version}}/{{xpiName}}.xpi",
```

## 依赖工具

- **Node.js**: >= 20.x
- **npm**: 包管理器
- **zotero-plugin-scaffold**: 构建工具
- **TypeScript**: 类型检查
- **ESLint**: 代码检查
- **Prettier**: 代码格式化

## 工作流状态

- ✅ CI 工作流正常工作
- ✅ Release 工作流配置完成
- ✅ 构建系统验证通过
- ✅ 代码检查通过
- ✅ 文档完善

## 下一步

维护者可以按照以下步骤发布第一个版本：

1. 确保所有功能完成并测试通过
2. 更新 `package.json` 中的版本号
3. 提交并推送代码
4. 创建版本标签（如 `v3.3.0`）
5. 推送标签触发自动发布

## 参考链接

- [构建和发布指南](./BUILD_AND_RELEASE.md)
- [发布指南](./RELEASE_GUIDE.md)
- [Zotero Plugin Scaffold](https://github.com/zotero/zotero-plugin-scaffold)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
