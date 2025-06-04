FROM php:8.1-apache

# Instalar dependencias necesarias para Composer y PDO MySQL
RUN apt-get update && apt-get install -y \
    unzip git zip \
    && docker-php-ext-install pdo pdo_mysql

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Habilitar mod_rewrite si usas URL amigables en Apache
RUN a2enmod rewrite

# Copiar el código dentro del contenedor (opcional, si usas volúmenes)
# COPY . /var/www/html/

EXPOSE 80
CMD ["apache2-foreground"]
