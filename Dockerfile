FROM node:lts-slim
LABEL maintainer="thorben@fohlmeister.com"

WORKDIR /opt/einkserver

# Set production environment as default
ENV NODE_PATH=/usr/local/lib/node_modules/:/usr/local/lib NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev
COPY dist/ .

RUN mkdir -p /images    

HEALTHCHECK --interval=5s --timeout=10s --retries=3 CMD node healthcheck.js
EXPOSE 3000
CMD ["node","server.js"]
