# 使用 Node.js 官方镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm install

# 复制所有代码
COPY . .

# 设置环境变量（从构建参数传入）
ARG CACHE_TTL=3600
ENV CACHE_TTL=$CACHE_TTL

# 启动命令
CMD ["npm", "start"]

# 暴露端口（根据你的应用调整）
EXPOSE 3000
