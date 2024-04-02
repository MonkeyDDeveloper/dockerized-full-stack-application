FROM node:lts-alpine3.19

ARG BACK_API_PORT

WORKDIR /api
COPY . .

RUN npm install
RUN npm run build

EXPOSE ${BACK_API_PORT}

CMD ["npm", "start"]