FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY test-email.js ./

CMD ["node", "test-email.js"]
