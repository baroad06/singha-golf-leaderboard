FROM node:20-bookworm

RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /usr/share/man/man1 \
    && mkdir -p /home/node/.cache/ms-playwright \
    && ln -sf /usr/bin/chromium /usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN chmod +x rescrape_all16.js

EXPOSE 3000

# Launch both the API server and the scraper in background
CMD node server.js & \
    sleep 3 && node rescrape_all16.js && \
    node server.js
