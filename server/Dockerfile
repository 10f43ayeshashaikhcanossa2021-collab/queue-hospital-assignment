FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY jest.config.cjs ./jest.config.cjs

EXPOSE 5000

CMD ["node", "src/index.js"]