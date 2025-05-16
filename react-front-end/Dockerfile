# Stage 1: Build the React app
FROM registry.suse.com/bci/nodejs:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install react-scripts
RUN npm install react-window
RUN npm install react-loader-spinner
RUN npm install react-infinite-scroll-component
COPY . .
RUN npm run build

# Production Stage
FROM registry.suse.com/suse/nginx:latest AS production
COPY --from=builder /app/build /srv/www/htdocs/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
