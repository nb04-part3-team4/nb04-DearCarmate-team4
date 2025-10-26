# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies + tsx for seed
RUN npm ci --only=production && npm install tsx

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy swagger yaml files (not compiled by TypeScript)
COPY src/documentation/swagger ./dist/documentation/swagger

# Copy seed scripts
COPY scripts ./scripts

# Expose port
EXPOSE 3001

# Run database setup (migrations + seed) and start the server
# db:setup = npx prisma migrate deploy && npx prisma db seed
CMD ["sh", "-c", "npm run db:setup && npm start"]
