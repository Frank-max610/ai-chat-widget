# 🤖 AI Chat Widget — 网站智能客服插件

> 一行代码，给任何网站加上 AI 智能客服。基于 DeepSeek，5 分钟部署，数据私有，极低成本。

---

## 为什么你需要这个？

- 💰 第三方 AI 客服 SaaS 月费 $20-50+，这个**一次性付费，终身使用**
- 🔒 数据存在你自己服务器，不经过第三方
- ⚡ 一行 `<script>` 标签接入，无需改动原有网站
- 🎨 颜色、Logo、欢迎语完全自定义，匹配品牌
- 🇨🇳 中文优化，基于 DeepSeek 国产大模型

---

## 快速开始

### 1. 配置后端

```bash
cd server
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入你的 DeepSeek API Key
python app.py
```

### 2. 嵌入网站

```html
<script src="http://你的服务器:5000/static/chat-widget.js"
        data-server="http://你的服务器:5000"
        data-title="AI 客服助手"
        data-placeholder="有什么可以帮你的？"
        data-color="#4F46E5"
        data-logo="🤖">
</script>
```

### 3. 完成

刷新你的网站，右下角出现 AI 聊天按钮。

---

## 自定义参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `data-server` | 后端地址 | `http://localhost:5000` |
| `data-title` | 聊天窗口标题 | `AI 客服助手` |
| `data-placeholder` | 输入框提示文字 | `输入你的问题...` |
| `data-color` | 主题色 | `#4F46E5` |
| `data-logo` | Logo（支持 Emoji） | `🤖` |

---

## 部署到生产环境

```bash
# 用 gunicorn 运行（Linux/Mac）
gunicorn -w 2 -b 0.0.0.0:5000 app:app

# 或配 Nginx 反代 + HTTPS
# 完整部署脚本见 server/deploy.sh
```

---

## 文件结构

```
ai-chat-widget/
├── server/
│   ├── app.py              # Flask API 代理
│   ├── requirements.txt    # Python 依赖
│   └── .env.example        # 配置模板
├── widget/
│   └── chat-widget.js      # 前端聊天组件（含样式）
├── demo/
│   └── index.html          # 演示页面
└── README.md               # 本文档
```

---

## 技术要求

- Python 3.8+
- DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com) 免费注册）
- 任何能跑 Python 的服务器（1核512M 最低配即可）

---

## 常见问题

**Q: 支持流式输出吗？**
A: 支持。后端提供 `/chat/stream` 端点，打字机效果。

**Q: 能改系统提示词吗？**
A: 能。编辑 `.env` 里的 `SYSTEM_PROMPT`，可以设定为客服、销售、技术支持等角色。

**Q: 支持哪些模型？**
A: 默认 `deepseek-chat`，可改为 `deepseek-reasoner` 或其他兼容模型。

**Q: 对话历史保存在哪？**
A: 存在用户浏览器端，刷新后清空。如需持久化，加数据库即可（联系作者获取企业版）。

---

## 购买后获得

✅ 完整源码（前端 + 后端 + Demo）  
✅ 部署指南  
✅ 30 天技术支持  
✅ 免费更新  

---

> Made with ❤️ | 定价 $10 USD
