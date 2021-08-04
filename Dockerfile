FROM node:14
COPY . /bot
WORKDIR /bot
RUN npm i
RUN tsc --build tsconfig.json
CMD npm start