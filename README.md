# API-2021-HTTP_Infrastructure

## 1. Serveur HTTP statique "dockerisé" avec apache httpd

Nous avons décidé de suivre la procédure décrite dans la vidéo, et d'utiliser l'image Docker officielle php, afin d'avoir directement accès à php en plus de pouvoir lancer un serveur apache

On peut trouver l'arborescence de notre file system HTML se trouve sous /var/www/html. Dans le docker file on copie statiquement le contenu de notre fichier src/ local vers /var/www/html.

On peut trouver les fichiers de configuration de apache dans le dossier /etc/apache2/. On y trouve, entre autres, le fichier de configuration principal apache2.conf, ou la liste des fichiers de configurations pour plusieurs sites potentiels dans /etc/apache2/sites-available. Dans chaque fichier de configuration pour les sites disponibles, on peut modifier la racine du file system HTML, ce qui peut s'avérer pratique dans les cas où nous gérons plusieurs sites. Dans ce cas-là il faut faire bien attention à changer également la destination de notre COPY dans le Dockerfile.

Pour le contenu de notre page HTML statique, nous avons choisi de partir avec le template Grayscale (https://startbootstrap.com/previews/grayscale) fourni par Start Bootstrap, que nous avons customisé.

Nous avons également créé deux scripts, build.sh et run.sh qui nous permettent respectivement de build et de run notre image Docker php avec un port mapping de 9090 vers 80.

## 2. Serveur HTTP dynamique "dockerisé" avec express.js

Nous avons à nouveau décidé de suivre la procédure décrite dans la vidéo, et d'utiliser l'image Docker officielle node.js. Nous utilisons la dernière version stable de node.js au moment de l'écriture du rapport, à savoir la 16.13.

Une particularité du Dockerfile est la nouvelle ligne CMD. Elle permet d'exécuter une commande au lancement d'un container. Dans ce cas-ci il s'agit de la commande node, qui va exécuter le script index.js.

Dans le dossier local src, celui que nous copions dans notre container dans le dossier /opt/app, nous avons run la commande npm init, avec d'obtenir les fichiers nécessaires au démarrage d'une nouvelle application node.js.

Nous avons ensuite, toujours dans le dossier src, run les commandes npm install --save chance et npm install --save express afin d'installer le module chance qui nous permettra de générer des valeurs aléatoires, et le module express qui nous permettra de créer une application HTTP.

Nous avons également ajouté un script index.js qui, à l'aide du module chance, génère aléatoirement des paires d'animaux colorés. Nous avons ensuite créé une application HTTP en utilisant le framework Express.js, qui se connecte au port 3000 et qui renvoie au client les paires générées avec chance.

Nous avons finalement créé deux scripts au même niveau que notre Dockerfile, build.sh et run.sh qui nous permettent respectivement de build et de run notre image Docker node avec un port mapping de 9090 vers 3000.

## 3. Reverse proxy statique avec apache

## 4. Requêtes AJAX avec JQuery

## 5. Reverse proxy dynamique