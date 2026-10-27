FROM node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53
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
