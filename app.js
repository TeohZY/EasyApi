import express, { json, urlencoded } from 'express';
import routes from './routes/faviconRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(json());
app.use(urlencoded({ extended: true }));

// 路由
app.use('/', routes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
