FROM node:19.8.1

ADD . /app

WORKDIR /app

RUN npm i

EXPOSE 5001

## ENSURES DATABASE IS RUNNING BEFORE SERVER STARTS
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

# ENTRYPOINT only allows one command, so we used bash command as work around
ENTRYPOINT ["/bin/sh", "-c" , "/wait && npm run dev"]