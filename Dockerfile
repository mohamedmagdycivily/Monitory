FROM node:13-alpine

COPY ./package.json /usr/api/package.json
COPY ./package-lock.json /usr/api/package-lock.json

WORKDIR /usr/api

## Install required packages to install bcrpyt before npm install
RUN apk --no-cache add --virtual builds-deps build-base python

RUN npm i

COPY . /usr/api

EXPOSE 3000

CMD npm start
