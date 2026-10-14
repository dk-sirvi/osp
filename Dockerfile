FROM node:18-alpine
WORKDIR /app
COPY package.json server.js ./
COPY public/ public/
COPY data/ data/
RUN mkdir -p uploads
EXPOSE 3000
CMD ["node", "server.js"]
