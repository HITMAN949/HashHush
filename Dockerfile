FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install
RUN cd server && npm install
RUN cd ../client && npm install

COPY . .

RUN cd client && npm run build

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "start"] 