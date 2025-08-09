# Frontend Dockerfile
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Сборка проекта
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Экспонируем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
