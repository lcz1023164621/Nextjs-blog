此项目基于nextjs开发，使用shadcn作为组件库，neon postgresql和drizzleorm进行数据库管理,trpc进行数据交互，使用clerk进行身份验证,调用deepseek api集成翻译、搜索和生成标签功能<br><br>

演示：[https://nextjs-blog-sigma-virid-40.vercel.app](https://nextjs-blog-sigma-virid-40.vercel.app)<br><br>
安装nodejs环境，最好在v19以上 [https://nodejs.org/zh-cn](https://nodejs.org/zh-cn)<br><br>
安装完成后打开项目文件执行<br><br>
```bash
npm install
# or
bun add
```
在项目根目录中创建.env.local文件<br><br>
获取neon密钥[https://neon.com](https://neon.com),创建新项目后打开dashboard并点击connection，获取其中的密钥<br><br>
之后获取clerk密钥[https://clerk.com](https://clerk.com),创建新项目后，打开Configure后找到API keys，获取其中的密钥<br><br>
获取deepseek api的密钥[https://api-docs.deepseek.com/](https://api-docs.deepseek.com/)<br><br>
该项目中设置密钥名为<br>
### .env.local
```env
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
DATABASE_URL=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_API_KEY=
```
<br>更新数据库<br>
```bash
npx drizzle-kit push
```

将服务跑在本地中

```bash
npm run dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

查看数据库数据：
```bash
npx drizzle-kit studio
```

可写webhook加入到其中，需要使用ngrok等内网穿透工具.<br><br>
还在继续写...<br>
