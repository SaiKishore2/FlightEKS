FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --producer
COPY . .
CMD ["node","src/index.js"]
