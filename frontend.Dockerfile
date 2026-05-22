FROM node:22-alpine
WORKDIR /app

# Install su-exec for proper user switching and dos2unix for line endings, plus build tools for native node modules
RUN apk add --no-cache su-exec dos2unix python3 make g++

RUN mkdir ./public
COPY public/ ./public/
COPY package-lock.json .
COPY package.json .
COPY server.js .
COPY default-grid.js .
COPY default-grid-2.js .
COPY database.js .

COPY entrypoint.sh .
RUN dos2unix entrypoint.sh && chmod +x entrypoint.sh

RUN chown node:node . -R

# Install dependencies as node user
USER node
RUN npm install

# Switch back to root for entrypoint
USER root

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
