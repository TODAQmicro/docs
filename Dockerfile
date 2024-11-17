FROM node:20
EXPOSE 3040

RUN mkdir /service
WORKDIR /service

ARG NPM_TOKEN
COPY . .

RUN NODE_ENV=production npm install --production
RUN rm .npmrc

CMD npm start
