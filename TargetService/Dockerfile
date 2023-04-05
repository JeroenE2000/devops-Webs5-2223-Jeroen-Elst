FROM node:alpine AS build

WORKDIR /app

# Copy the authenticationservice code and dependicies
COPY . . 

# copy the middleware directory and rabbitmqconnection file from the parent directory
COPY . ./uploads

# copy the package.json from the parent directory
COPY package.json ./
RUN npm install


# Expose the port that the authenticationservice is listen to
EXPOSE 3012

# Run the authenticationservice
CMD ["node", "index.js", "rabbitmq-server"]