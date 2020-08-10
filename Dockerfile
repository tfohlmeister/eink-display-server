FROM node:lts-slim
LABEL maintainer="thorben@fohlmeister.com"

WORKDIR /opt/einkserver

# Set production environment as default
ENV NODE_PATH=/usr/local/lib/node_modules/:/usr/local/lib NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production
COPY dist/ .

RUN mkdir -p /images    

# Run server
EXPOSE 3000
CMD ["node","server.js"]
