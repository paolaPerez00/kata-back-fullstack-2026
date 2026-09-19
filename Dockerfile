FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
# El executor lanza contenedores efímeros en el Docker del host vía docker.sock
RUN apk add --no-cache docker-cli
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]