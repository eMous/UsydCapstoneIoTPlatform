# Using version 14 of node
FROM node:14
# Create a directory to hold the application code INSIDE the image
WORKDIR /frontend
# Install the application dependencies
COPY package*.json ./
# Copy the source code in the Docker image
COPY . .
RUN npm install
# Run the build
RUN npm run build
# Since we're using port 8080 for the application, we expose this port
EXPOSE 8080
# Then we run the application using
CMD [ "node", "server.js" ]