#!/bin/bash

# Nome do container definido no docker-compose.yml
CONTAINER_NAME="mongodb-db-etapa2-8"
DB_NAME="projeto-db"

echo "A listar todos os utilizadores da base de dados '$DB_NAME'..."


docker exec $CONTAINER_NAME mongosh $DB_NAME --eval "db.users.find()" || \
docker exec $CONTAINER_NAME mongo $DB_NAME --eval "db.users.find()"

echo "--- Fim da Lista ---"
