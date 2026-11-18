FROM node:24-alpine

RUN mkdir /service
WORKDIR /service

ARG NPM_TOKEN
COPY . .

RUN NODE_ENV=production npm ci --omit=dev
RUN rm .npmrc

ENV HOST=0.0.0.0
ENV PORT=80
CMD node ./dist/server/entry.mjs
# CMD npm start -- --host 0.0.0.0 --port 80
