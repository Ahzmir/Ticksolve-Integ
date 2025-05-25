FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install -g pm2 && npm install

# Now copy the rest of the source code (including server.js and package.json)
COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "start", "./server.js"]
