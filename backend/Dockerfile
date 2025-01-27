FROM node:alpine

WORKDIR /usr/src/app

EXPOSE 3000

# RUN npm init es6 -y

# RUN npm install express --save

# Faire tourner le container a l'infini car il se stop s'il n'y a rien dedans
ENTRYPOINT [ "tail", "-f", "/dev/null" ]