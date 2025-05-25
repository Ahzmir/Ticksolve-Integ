FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install -g pm2 && npm install

COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "start", "./src/server.js"]