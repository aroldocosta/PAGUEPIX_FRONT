# # Build stage
# FROM node:20 AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build -- --configuration production

# Serve stage
# FROM nginx:alpine
# COPY --from=build /app/dist/paguepix-front/browser /usr/share/nginx/html
# # COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 4210
# CMD ["nginx", "-g", "daemon off;"]

# Estágio 1: Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Estágio 2: O Container que vai segurar a porta 4210
FROM nginx:alpine
# 1. Copia os arquivos compilados para dentro do Nginx do container
COPY --from=build /app/dist/paguepix-front/browser /usr/share/nginx/html

# 2. Copia a configuração customizada do Nginx para suportar rotas Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Expõe a porta interna (padrao 80) que o Docker Compose mapeará para 4210
EXPOSE 80

# 3. OBRIGATÓRIO: Mantém o container vivo
CMD ["nginx", "-g", "daemon off;"]
