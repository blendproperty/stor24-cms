FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install @tailwindcss/postcss tailwindcss autoprefixer --save-dev --legacy-peer-deps
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -- --no-lint
EXPOSE 3000
CMD ["npm", "start"]
