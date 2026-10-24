FROM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914
ARG RELEASE_SHA=unversioned
LABEL org.opencontainers.image.revision=$RELEASE_SHA
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build placeholders cannot authenticate to a database and are never runtime credentials.
RUN PAYLOAD_SECRET=synthetic-build-only-secret-not-used-at-runtime DATABASE_URI=postgresql://build:build@127.0.0.1:1/build npm run build
EXPOSE 3000
CMD ["npm", "start"]
