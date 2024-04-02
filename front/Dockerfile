FROM node:lts-alpine3.19

ARG PORT
ARG BACK_API_PORT

ENV PORT=${PORT}
ENV BACK_API_PORT=${BACK_API_PORT}

WORKDIR /front
COPY . .

EXPOSE ${PORT}

RUN npm install
RUN npm run build

CMD ["npm", "start"]
