FROM node:23-alpine

WORKDIR /app

# Cài dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 3000

# Chạy Next.js ở chế độ development
CMD ["npm", "run", "dev"]