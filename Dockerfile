# Check out https://hub.docker.com/_/node to select a new base image
FROM node:12-slim
RUN apt-get update && apt-get -y --no-install-recommends install curl

# Set to a non-root built-in user `node`
USER node
# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

# set working directory
WORKDIR /home/node/app


COPY --chown=node lib/msutils-1.0.0.tgz ./lib/

COPY --chown=node api/ssl/development/*.pem ./ssl/development/  
COPY --chown=node api/ssl/production/*.pem ./ssl/production/
COPY --chown=node ssl/teams/*.pem ./ssl/teams/
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package.json ./

RUN npm install
# RUN npm run build

# Bundle app source code
COPY --chown=node . .

WORKDIR /home/node/app/api
COPY --chown=node lib/msutils-1.0.0.tgz ./lib/
COPY --chown=node passport-ci-oidc-2.0.4.tgz ./lib/
RUN npm install
WORKDIR /home/node/app

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=5678

EXPOSE ${PORT}
RUN INLINE_RUNTIME_CHUNK=false npm run build
ENTRYPOINT ["/home/node/app/build.sh"]
HEALTHCHECK --interval=120s --timeout=10s --start-period=180s --retries=5 CMD ./healthcheck.sh || exit 1