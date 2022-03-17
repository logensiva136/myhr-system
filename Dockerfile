# syntax=docker/dockerfile:1
FROM node:12.18.1
WORKDIR /
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD [ "nodemon", "app.js" ]
