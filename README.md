# Rose Universe V1

纯前端静态 Three.js 粒子花束，可直接部署到静态网站托管服务。

## 本地运行

用 VS Code 打开项目文件夹，安装 Live Server，然后打开 `index.html` 并点击 **Go Live**。不要直接双击 `index.html`，ES Modules 和 Canvas 图片采样需要通过 HTTP 服务运行。

## 分享功能

- 手机和平板优先使用 Web Share API，打开系统分享面板。
- 不支持 Web Share API 的浏览器会复制当前链接。
- 专属链接只包含 `to`、`from`、`message`，祝福最多 80 字。
- 页面不读取或分享 `localStorage` 中的收藏、已解锁花朵等状态；新访客始终从全新页面开始。

花朵发现进度只保存在当前访问者浏览器的 `localStorage` 中，不会写入分享链接。页面左上角的“重新收集”只会清理本项目的花朵发现记录。

`localhost`、`127.0.0.1` 和 `file://` 地址只能在本机访问，不能直接发给别人。正式分享前必须把项目部署到公网 HTTPS 地址。

## 推荐部署

### GitHub Pages

1. 将包含 `index.html` 的当前目录推送到 GitHub 仓库。
2. 在仓库 **Settings → Pages** 中选择 **Deploy from a branch**，分支选 `main`，目录选 `/ (root)`。
3. 保存并等待生成 HTTPS 地址。

### Vercel

1. 在 Vercel 导入 GitHub 仓库。
2. Framework Preset 选择 **Other**，Root Directory 选择包含 `index.html` 的目录。
3. Build Command 和 Output Directory 留空，直接部署。

Netlify 和 Cloudflare Pages 也可以直接部署此静态目录，并默认提供 HTTPS。

## 目录

```text
index.html
style.css
src/main.js
assets/
```

项目没有构建步骤、服务端代码或环境变量；部署时必须保持 `index.html`、`style.css`、`src/` 和 `assets/` 的相对位置不变。
