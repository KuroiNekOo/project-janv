FROM node:alpine

WORKDIR /usr/src/app

EXPOSE 4200

RUN npm install -g @angular/cli

# Faire tourner le container a l'infini car il se stop s'il n'y a rien dedans
ENTRYPOINT [ "tail", "-f", "/dev/null" ]
