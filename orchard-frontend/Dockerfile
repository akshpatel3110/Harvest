FROM nginx:alpine

# Remove the default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your React build output
COPY build/ /usr/share/nginx/html/

# Update nginx to listen on port 8080
RUN sed -i 's/80;/8080;/' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
