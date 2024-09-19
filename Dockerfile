FROM node:lts-alpine

# Set environment to production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent

# Copy the rest of the application code
COPY . .

# Expose necessary ports
EXPOSE 443

# Set permissions for node user
RUN chown -R node /usr/src/app

# Use node user to run the application
USER node

# Start the application
CMD ["npm", "start"]
