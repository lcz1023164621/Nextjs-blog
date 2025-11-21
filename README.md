此项目基于nextjs开发，使用shadcn作为组件库，neon postgresql和drizzleorm进行数据库管理,trpc进行数据交互，使用clerk进行身份验证,调用deepseek api集成翻译和搜索功能

## Getting Started
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
还在继续写...<br><br>
演示图片：

<img width="1575" height="969" alt="image" src="https://github.com/user-attachments/assets/6c1b11d9-8c5a-4b1c-8aef-4135aebc2349" /><br>

<img width="1575" height="969" alt="image" src="https://github.com/user-attachments/assets/ce479f4c-7af6-4bb0-86c1-7d3713aba51b" /><br>

<img width="1575" height="969" alt="image" src="https://github.com/user-attachments/assets/e797d8cd-cf98-4108-8041-7ef181e28cef" /> <br>

<img width="1575" height="969" alt="image" src="https://github.com/user-attachments/assets/dd8ae2bf-6d5b-40e0-8e5f-adb1d9ef4e96" />





## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
