FROM node:22-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:22-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_ADSENSE_CLIENT
ARG NEXT_PUBLIC_ADSENSE_HOME_SLOT
ARG NEXT_PUBLIC_ADSENSE_READER_SLOT
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_ADSENSE_CLIENT=$NEXT_PUBLIC_ADSENSE_CLIENT
ENV NEXT_PUBLIC_ADSENSE_HOME_SLOT=$NEXT_PUBLIC_ADSENSE_HOME_SLOT
ENV NEXT_PUBLIC_ADSENSE_READER_SLOT=$NEXT_PUBLIC_ADSENSE_READER_SLOT
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 8080

CMD ["npm", "start"]
