FROM node:alpine AS build

WORKDIR /app

# Copy the authenticationservice code and dependicies
COPY . . 

# copy the middleware directory and rabbitmqconnection file from the parent directory
COPY . ./targetupload

# copy the package.json from the parent directory
COPY package.json ./

# Expose the port that the authenticationservice is listen to
EXPOSE 3039

# Run the authenticationservice
CMD ["node", "index.js", "rabbitmq-server"]