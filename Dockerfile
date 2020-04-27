FROM node:lts
LABEL maintainer="thorben@fohlmeister.com"


RUN mkdir -p /opt/einkserver
WORKDIR /opt/einkserver

# Set developme nt environment as default
ENV NODE_PATH=/usr/local/lib/node_modules/:/usr/local/lib NODE_ENV=production

COPY package.json /opt/einkserver/
RUN npm install --production --quiet
COPY dist/ /opt/einkserver/

RUN mkdir -p /images
VOLUME [ "/images" ]

# Run server
EXPOSE 3000
CMD ["node","server"]
