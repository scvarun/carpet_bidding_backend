FROM node:16
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package*.json ./
RUN npm_config_target_arch=x64 yarn install --nodedir
COPY . .