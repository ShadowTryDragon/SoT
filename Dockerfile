# TODO: Add a build stage and build in docker instead of the host
# Usage: First build the app and afterwards this image

FROM node:latest
USER node
WORKDIR /app
COPY --chown=node package*.json /app
RUN npm ci
COPY --chown=node dist /app
CMD node main.js