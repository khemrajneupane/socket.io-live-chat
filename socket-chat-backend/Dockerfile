# Use an official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend files
COPY socket-chat-backend/ ./backend

# Copy frontend files
COPY socket-chat-frontend/ ./frontend

# Install dependencies
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app/backend
RUN npm install

# Move frontend build into backend build folder
RUN cp -r /app/frontend/build ./build

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
