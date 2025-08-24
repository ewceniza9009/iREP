# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Pass the API URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ARG VITE_REALTIME_URL
ENV VITE_REALTIME_URL=${VITE_REALTIME_URL}
RUN npm run build

# ---- Production Stage ----
FROM nginx:1.25-alpine
# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]