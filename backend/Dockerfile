FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js firebase.js bibleBooks.js ./

EXPOSE 8080

CMD ["node", "index.js"]
