FROM node:lts-alpine as static-temp
ARG web_environment=testnet

RUN apk update && apk add git

COPY ./ /srv/www/DCCGUI/
WORKDIR /srv/www/DCCGUI
RUN mkdir -p /srv/www/DCCGUI/dist/web/$web_environment/

ARG platform=web
RUN npm ci --unsafe-perm && \
    node_modules/.bin/gulp build --platform web --config ./configs/$web_environment.json
RUN rm -rf /srv/www/WavesGUI/node_modules/


FROM nginx:stable-alpine
ARG web_environment=testnet
ARG platform=web
ENV WEB_ENVIRONMENT=$web_environment
ENV PLATFORM=$platform

RUN  mkdir -p /etc/nginx/sites-enabled && \
    apk update && \
    apk add gettext libintl

WORKDIR /srv/www
RUN mkdir /srv/www/static-clients/
COPY ./build-wallet/nginx/default.conf /etc/nginx/sites-available/default.conf
#COPY ./win.zip /srv/www/static-clients/win.zip
#COPY ./osx.tar.gz /srv/www/static-clients/osx.tar.gz
#COPY ./linux.tar.gz /srv/www/static-clients/linux.tar.gz

#COPY ./build-wallet/info.html /srv/www/info
COPY ./build-wallet/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=static-temp /srv/www/DCCGUI/dist/web/$web_environment/ /srv/www/DCCGUI/dist/web/$web_environment/
EXPOSE 80

CMD ["/bin/sh","-c", "envsubst '${WEB_ENVIRONMENT}' < /etc/nginx/sites-available/default.conf > /etc/nginx/sites-enabled/web-${WEB_ENVIRONMENT}.conf ; nginx -g 'daemon off;'"]
