# Stage 1: Build the React Application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the Application with Nginx
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy a custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy the built React app from the 'build' stage into Nginx's html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (HTTP)
EXPOSE 80

# Start Nginx inside the container
CMD ["nginx", "-g", "daemon off;"]
