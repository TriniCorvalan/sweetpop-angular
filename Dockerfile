# ============================================================
# ETAPA 1: Construcción del proyecto Angular
# ============================================================

# Se utiliza una imagen de Node.js para instalar dependencias
# y compilar el proyecto Angular.
FROM node:20-alpine AS build

# Define la carpeta de trabajo dentro del contenedor.
WORKDIR /app

# Copia los archivos de dependencias.
# Se copian primero para aprovechar la caché de Docker.
COPY package*.json ./

# Instala las dependencias del proyecto.
RUN npm install

# Copia el resto del código fuente al contenedor.
COPY . .

# Compila el proyecto Angular.
# El resultado se generará dentro de la carpeta dist/.
RUN npm run build


# ============================================================
# ETAPA 2: Servidor NGINX para publicar Angular
# ============================================================

# Se utiliza NGINX como servidor web liviano.
FROM nginx:alpine

# Copia la configuración personalizada de NGINX.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos compilados de Angular desde la etapa build.
# Importante:
# En este proyecto Angular la salida compilada queda en:
# dist/sweetpop-angular/browser
COPY --from=build /app/dist/sweetpop-angular/browser /usr/share/nginx/html

# Expone el puerto 80 dentro del contenedor.
EXPOSE 80

# Inicia NGINX en primer plano.
CMD ["nginx", "-g", "daemon off;"]
