# syntax=docker/dockerfile:1
FROM node:lts-alpine
WORKDIR /backend
COPY . .
RUN yarn install --production
CMD ["node", "server.js"]
EXPOSE 3000
