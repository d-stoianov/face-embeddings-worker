FROM node:24-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

CMD ["npm", "start"]
