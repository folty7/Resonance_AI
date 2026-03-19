# Use the official, lightweight Node.js 20 image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This is a Docker best practice: we install dependencies before copying the rest of the code.
# This way, if you only change your code (not your packages), Docker uses a cached version of node_modules!
COPY package*.json ./

# Install only production dependencies (skips devDependencies for a leaner, more secure image)
RUN npm ci --only=production

# Copy the rest of your application code
COPY . .

# Expose the port your Express server runs on
EXPOSE 8080

# The command that starts your app
CMD ["node", "server.js"]