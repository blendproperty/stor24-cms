FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @tailwindcss/postcss tailwindcss autoprefixer --save-dev
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -- --no-lint
EXPOSE 3000
CMD ["npm", "start"]
