# 1. Choose the base environment (like buying a computer with Node.js pre-installed)
FROM node:20-alpine

# 2. Create a folder inside the container where our app will live
WORKDIR /app

# 3. Copy ONLY the package.json files first
COPY package*.json ./

# 4. Install the dependencies inside the container
RUN npm install

# 5. Copy the rest of our code (src, public, etc.) into the container
COPY . .

# 6. Tell Docker which port our Express server uses
EXPOSE 3000

# 7. The command to start the server when the container runs
CMD ["npm", "start"]