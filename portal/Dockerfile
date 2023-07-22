FROM node:19.8.1

WORKDIR /app

COPY package.json /app/package.json

COPY package-lock.json /app/package-lock.json

RUN npm i

COPY . /app

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev"]
