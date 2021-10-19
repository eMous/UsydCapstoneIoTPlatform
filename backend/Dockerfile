# Using version 14 of node
FROM node:14
# Create a directory to hold the application code INSIDE the image
WORKDIR /backend
# Install the application dependencies
COPY package*.json ./
RUN npm install
# Copy the source code in the Docker image
COPY . .
# Since we're using port 8080 for the application, we expose this port
EXPOSE 8080
# Then we run the application using
CMD [ "npx", "ts-node", "app.ts" ]