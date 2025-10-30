# Use an official PHP image with FPM (FastCGI Process Manager) and a lightweight Alpine Linux base.
FROM php:8.2-fpm-alpine

# Install system dependencies needed for the server and Composer
RUN apk add --no-cache \
    nginx \
    supervisor

# Install PHP extensions that your app might need (e.g., for database access)
# Uncomment and modify as needed.
# RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory inside the container
WORKDIR /var/www/html

# Copy composer files first to leverage Docker's layer caching
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy the rest of your application code
COPY . .

# Create a directory for Nginx logs and set permissions
RUN mkdir -p /var/log/nginx && \
    chown -R www-data:www-data /var/www/html /var/log/nginx

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the supervisor configuration to start both PHP-FPM and Nginx
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port 80 to the outside world
EXPOSE 80

# The command to start the services when the container runs
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]