FROM node:19.8.1

ADD . /app

WORKDIR /app

RUN npm i

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev"]
