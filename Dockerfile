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
RUN chmod +x rescrape_all16.js entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
