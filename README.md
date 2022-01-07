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

Nous avons décidé d'utliser apache pour réaliser notre reverse proxy.

Nous n'allons pas mapper les containers vers l'extérieur, car toutes les communications passeront par le reverse proxy.

Requête http normale : quand le client clique sur qqch, il fait une requête, un GET etc etc
Rêquête AJAX : après le chargement d'une page, très souvent du code js est exécuté. De manière asynchrone le code js peut envoyer d'autres requêtes vers un serveur. Formulaires, etc etc. Presque obligé de passer par un reverse proxy pour traiter les requêtes ajax.

Same-origin policy : secure, pour éviter certaines attaques. Normalement, un script exécuté qui vient d'un certain domaine ne peut faire des requêtes que vers le même domaine. Sans reverse proxy on serait embêté pour charger une page depuis un certain container et les données depuis un autre, car comme ils ont des noms de domaines différents on viole la same origin policy. Avec un reverse proxy on a pas ce problème

Dans notre cas ici, notre reverse proxy correspond à un site dans les fichiers de configurations du serveur apache. 

Virtual host = un site logique. Le client précise grâche à une entête à quel virtual host il veut accéder

Pour créer un reverse proxy avec apache, nous avons, dans les fichiers de configurations /etc/apache2/sites-available de notre container, ajouté un nouveau fichier de configuration 001-reverse-proxy.conf

Dans un premier temps nous avons modifié les fichiers de configuration directement depuis notre container. Mais ce n'est pas du tout optimal car il faut entrer à la main les adresses ip, et afin de modifier notre fichier de configuration directement dans le bash de notre container, nous avons dû installer vim (apt-get update + apt-get install vim).
Pour faire de notre container apache un reverse proxy, nous avons donc modifié le fichier de configuration 001-reverse-proxy.conf pour qu'il utilise les commandes ProxyPass (pour quand on arrive vers le proxy avec la requête) et ProxyPassReverse (pour quand on repart du proxy avec la réponse).

Important que la règle (/api/pets ou /) plus générale soit après la règle plus spéciale.

Après avoir modifié les fichiers de config il faut faire un service apache2 restart. Il faut aussi indiquer à apache que le site est activé, pas seulement disponible, et pour ça il faut utiliser la commande a2ensite suivi du nom du fichier de configuration. Il faudra ensuite activer les modules proxy avec les instructions a2enmod proxy et a2enmod proxy_http, reload avec service apache2 reload, et notre configuration est alors fonctionnelle

Dans un deuxième temps nous avons créé un dossier conf local sur notre machine, qui contient les deux fichiers conf que nous avions créé à la main lors de l'étape précédente. Dans le Dockerfile nous ajoutons donc la recette qui permet de construire une image apache qui copie notre dossier conf vers le dossier /etc/apache2/ de notre image, puis nous lançons deux commandes qui activent les modules proxy et proxy_http avec a2enmod, puis qui activent les deux sites que nous avons définis dans les deux fichiers de configurations, avec a2ensite.

Il est important de fournir un site par défaut, dans notre cas ici le site qui est décrit par le fichier 000-default.conf, afin de rerouter les demandes qui ne précisent pas de Host: vers ce dernier. Sinon les demandes sans Host: seraient aussi redirigées vers notre reverse-proxy, et ce n'est pas ce que l'on veut, cas on veut uniquement les demandes qui sont adressées au Host: labo.api.ch.

Une fois qu'on a build et run notre image, on peut tester notre infrastructure avec telnet. Pour tester notre infrastructure, il faut faire en sorte que le navigateur envoie le bon Host dans sa requête, et pour cela il faut configurer le DNS. Pour Windows, il faut modifier le fichier host qui se trouve à C:\Windows\System32\drivers\etc\hosts

## 4. Requêtes AJAX avec JQuery

## 5. Reverse proxy dynamique