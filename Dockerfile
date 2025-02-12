# Build Stage

FROM public.ecr.aws/docker/library/node:23.1.0 AS build
ARG env_name
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run-script build -- --configuration=$env_name

# Release Stage

FROM public.ecr.aws/docker/library/nginx:latest AS release
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/media-vitals-hcp /usr/share/nginx/html
