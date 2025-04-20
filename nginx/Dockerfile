FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL sertifikaları için dizin oluştur
RUN mkdir -p /etc/nginx/ssl

# Nginx'i arka planda çalıştır
CMD ["nginx", "-g", "daemon off;"] 