﻿FROM node:16-alpine

ENV TZ=Asia/Yekaterinburg
ENV NPM_CONFIG_PREFIX=/home/app/.npm-global
ENV PATH=$PATH:/home/app/.npm-global/bin
ENV NODE_ENV=production

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install pm2 -g
RUN npm install -g yarn

# Создать директорий и раздаем права на расшареные папки
RUN mkdir -pv /home/app/logs

# Скопировать исходники приложения
COPY backend/config /home/app/config
COPY backend/exportTemplates /home/app/exportTemplates
COPY backend/src /home/app/src
COPY backend/types /home/app/types

# Установить зависимости приложения
# Используется символ подстановки для копирования как package.json, так и package-lock.json,
# работает с npm@5+
COPY backend/package.json /home/app
COPY process.yml /home/app
# COPY ecosystem.config.js /home/app
# COPY backend/package-lock.json /home/app
COPY backend/yarn.lock /home/app
COPY backend/tsconfig.json /home/app
COPY backend/nest-cli.json /home/app

WORKDIR /home/app

# Running npm install for production development purpose will not run dev dependencies.
RUN yarn

# Компилим typescript
RUN yarn run build

# Create a user group 'xyzgroup'
#RUN addgroup -S xyzgroup

# Create a user 'appuser' under 'xyzgroup'
#RUN adduser -S -D -h /home/app appuser xyzgroup

# Chown all the files to the app user.
RUN chown -R node /home/app

# Switch to 'appuser'
USER node

CMD ["pm2-runtime", "--format", "process.yml", "--only", "rate-cluster"]