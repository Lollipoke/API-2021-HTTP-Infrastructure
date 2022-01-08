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

Une fois qu'on a build et run notre image, on peut tester notre infrastructure avec telnet. Pour tester notre infrastructure dans un navigateur, il faut faire en sorte que le navigateur envoie le bon Host dans sa requête, et pour cela il faut configurer le DNS. Pour Windows, il faut modifier le fichier hosts qui se trouve à C:\Windows\System32\drivers\etc\hosts.

De manière similaire aux étapes 1 et 2, nous avons également écrits deux scripts build et run, qui nous permettent respectivement de construire et lancer l'image Docker décrite plus haut.

/!\ Ce setup est très fragile car les adresses IP sont hardcodées dans le fichier de configuration, et il faut s'assurer de démarrer les containers dans le bon ordre, et qu'ils aient reçu la bonne adresse IP.

## 4. Requêtes AJAX avec JQuery

Pour faire nos requêtes AJAX, nous avons décidé d'utiliser la librairie Javascript JQuery. Depuis notre browser, on envoie des requêtes en arrière plan au serveur dynamique pour récupérer des données (des animaux colorés), et à partir de ces données on va modifier notre site web statique pour afficher le nom du premier animal dans la couleur correspondante.

Nous avons ensuite modifié notre container apache_statique. Nous avons modifié index.html en ajoutant deux nouveaux scripte, un qui charge JQuery, et l'autrescript javascript, pets.js, qui s'occupe de charger nos paires d'animaux colorés.

Dans notre script pets.js, le premier dollar est une variable utilisée par JQuery. Cela signifie que quand JQuery a fini de charger, il faut exécuter cette fonction-là de call-back. Nous avons ensuite écrit la fonction loadPets qui s'occupe de récupérer depuis /api/pets/ la liste des animaux colorés, et qui change le texte et la couleur class "pets" en fonction du premier résultat obtenu, s'il y en a au moins un.

Comme pour les étapes précédentes, nous avons ajouté nos modifications dans le dossier src local afin de pouvoir les copier directement lors de la création des containers, via l'instruction COPY du Dockerfile.

## 5. Reverse proxy dynamique

Un des problèmes fondamentaux avec notre infrastructure telle que nous l'avons laissée à la fin de l'étape 4, est le fait que nous avons codé "en dur" les adresses IP dans le fichier de configuration de notre reverse proxy. Cette solution, bien que fonctionnelle sous certaines conditions, est non seulement peu élégante, mais surtout extrêmement fragile. En effet, elle implique de lancer les containers dans un ordre précis et nécessite de vérifier à la main que les adresses IP attribuées aux containers sont bien celles auxquelles on s'attend. Rien ne nous garantit qu'elles seront effectivement les bonnes !

Le but de cette 5ème partie du laboratoire était donc de corriger ce problème en rendant la configuration de notre reverse proxy dynamique.

Une des premières choses à savoir est qu'avec le flag -e, il est possible de démarrer un container en lui passant des variables d'environnement, que des scripts à l'intérieur du container en exécution pourront lire et utiliser. C'est donc un moyen de communiquer entre l'extérieur et l'intérieur du container.

Une deuxième chose à noter est qu'il faut aller voir comment l'image php a été construite afin de pouvoir ajouter une étape dans la configuration, étape qui exécutera un script que nous auront écrit et qui permettra de définir les addresses ip des containers en cours d'exécution de manière dynamique, en lisant les variables d'environnement définie lors du lancement du container. Dans cette étape nous utiliserons php comme outil pour réaliser un script pour injecter les variables d'environnement dans un template et pour préparer notre fichier de configuration.

En observant la structure du Dockerfile de l'image apache que nous avons choisie pour notre reverse proxy, nous remarquons que sa dernière instruction est le fait de run le script apache2-foreground. Ce que nous allons faire, c'est de remplacer ce script apache2-foreground par une nouvelle version où nous y ajoutons l'exécution de notre propre script. Nous avons copié le contenu du script original et avons simplement ajouté quelques lignes. **************
Nous avons également modifié le Dockerfile afin de remplacer le fichier apache2-foreground par notre version modifiée dans /usr/local/bin/.

Nous avons ensuite créé un dossier templates dans lequel nous avons ajouté un script php config-template.php. La fonction getenv("NAME") de php nous permet de récupérer la valeur de variables d'environnement, ce qui nous permet donc de récupérer nos deux adresses IP passées au moment de la création des containers à l'intérieur du script php. En reprenant le script 001-reverse-proxy.conf écrit dans l'étape 3 et en l'adaptant au php, on peut donc remplacer les adresses ip hardcodées par les valeur des variables d'environnement si souvent citées dans cette partie.

Une fois cette étape réalisée, il a fallu à nouveau modifier le Dockerfile pour copier notre dossier templates dans /var/apache2/templates

Ensuite nous avons modifié à nouveau notre script apache2-foreground adapté pour y ajouter la commande php qui permet d'exécuter notre script php qui se situe dans templates, et qui génère notre fichier de configuration 001-reverse-proxy.conf

Nous avons rencontré quelques problèmes avec apache et les variables d'environnement, et c'est pour cela que nous avons ajouté dans Dockerfile la définition des variables d'environnements qui se trouvent dans le fichier etc/apache2/envvars. Pour que cela fonctionne on aurait également pu run la commande source etc/apache2/envvars.

Une fois que nous avons fait tout cela, nous pouvons tester notre infrastructure dans sa totalité. Pour cela nous pouvons lancer plusieurs container api/apache_php, dont un que nous nommons apache_static, puis plusieurs container api/express_pets, dont un que nous nommons express_dynamic. A l'aide de la commande docker inspect XXX | grep -i ipaddress, nous récupérons les addresses de nos deux containers nommés (remplacer XXX par apache_static et express_dynamic). Ensuite, nous pouvons lancer un container api/apache_rp en n'oubliant pas de préciser les variables d'environnement initialisées avec les addresses IP qu'on a récupérées l'instant d'avant ni de mapper le port 8080 au port 80.
Finalement, étant donné que notre fichier Hosts contient toujours la liaison labo.api.ch => localhost, on peut accéder directement à notre page web à l'adresse labo.api.ch:8080 et admirer le fruit de notre dur labeur.