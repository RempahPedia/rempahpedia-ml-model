FROM node:20-alpine

ARG MODEL_URL

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

ENV MODEL_URL $MODEL_URL

ENV PORT=8080
EXPOSE 8080

# Define the command to run the app
CMD ["node", "src/app.js"]