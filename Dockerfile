FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

COPY . .

# 환경 변수 설정
ENV NODE_ENV=production

EXPOSE 443
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
