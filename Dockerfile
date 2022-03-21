FROM node:16.14

ENV PORT=24543
ENV DEFAULT_FRAME_RATE=30

WORKDIR /app

COPY . .

RUN ["npm", "install"]

EXPOSE $PORT

CMD ["npm", "start"]