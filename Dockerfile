# Use official Node.js LTS lightweight image
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Default environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Expose server port
EXPOSE 5001

# Start the application
CMD ["node", "backend/server.js"]
