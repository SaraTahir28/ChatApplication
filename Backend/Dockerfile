FROM node:alpine
ENV NODE_ENV=production
COPY . /app
WORKDIR /app
RUN npm --omit=dev ci
ENTRYPOINT ["node", "backend.js"]