FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm --production
COPY . .
CMD ["node","src/index.js"]
