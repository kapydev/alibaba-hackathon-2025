FROM node:20.14.0-slim

# Put everything in /app
WORKDIR /app

# Copy root package json and package lock
COPY package*.json ./

# Copy folder
COPY packages/backend ./packages/backend

# Install backend workspace
RUN npm install --workspace=packages/backend --force

WORKDIR /app/packages/backend


CMD ["node", "/dist/main.js"]
