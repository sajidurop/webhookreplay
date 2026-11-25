FROM node:20-alpine
WORKDIR /app
COPY package.json server.js index.html brand.json README.md LICENSE ./
RUN mkdir -p data
EXPOSE 3000
CMD ["node", "server.js"]
