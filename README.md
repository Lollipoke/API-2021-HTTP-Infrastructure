# API-2021-HTTP_Infrastructure

## 1. Serveur HTTP statique "dockerisé" avec apache httpd

Nous avons décidé de suivre la procédure décrite dans la vidéo, et d'utiliser l'image Docker officielle php, afin d'avoir directement accès à php en plus de pouvoir lancer un serveur apache

On peut trouver l'arborescence de notre file system HTML se trouve sous /var/www/html. Dans le docker file on copie statiquement le contenu de notre fichier src/ local vers /var/www/html.

On peut trouver les fichiers de configuration de apache dans le dossier /etc/apache2/. On y trouve, entre autres, le fichier de configuration principal apache2.conf, ou la liste des fichiers de configurations pour plusieurs sites potentiels dans /etc/apache2/sites-available. Dans chaque fichier de configuration pour les sites disponibles, on peut modifier la racine du file system HTML, ce qui peut s'avérer pratique dans les cas où nous gérons plusieurs sites. Dans ce cas-là il faut faire bien attention à changer également la destination de notre COPY dans le Dockerfile.

Pour le contenu de notre page HTML statique, nous avons choisi de partir avec le template Grayscale (https://startbootstrap.com/previews/grayscale) fourni par Start Bootstrap, que nous avons customisé.

Nous avons également créé deux scripts, build.sh et run.sh qui nous permettent respectivement de build et de run notre image Docker php.

## 2. Serveur HTTP dynamique "dockerisé" avec express.js

## 3. Reverse proxy statique avec apache

## 4. Requêtes AJAX avec JQuery

## 5. Reverse proxy dynamique