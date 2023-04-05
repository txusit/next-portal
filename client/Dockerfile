FROM node:19.8.1

ADD . /app

WORKDIR /app

EXPOSE 8080

RUN npm i

ENTRYPOINT ["npm", "run", "dev"]
