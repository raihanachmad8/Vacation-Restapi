# Development stage
FROM node:20-alpine as development

WORKDIR /rezork/src/app

ARG port=3000

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

RUN npm ci
RUN npm run build

EXPOSE ${port}

CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine as production

ARG NODE_ENV=production
ARG port=3000
ENV NODE_ENV=${NODE_ENV}

WORKDIR /rezork/src/app

COPY --from=development /rezork/src/app/ ./

EXPOSE ${port}

CMD ["node", "dist/main"]
