#!/bin/bash

CONTAINER_NAME="mongodb-db-etapa2-8"
DB_NAME="projeto-db"

echo "A apagar todos os utilizadores da base de dados '$DB_NAME' no container '$CONTAINER_NAME'..."

# Executa o comando mongosh dentro do container para apagar todos os documentos da coleção 'users'
docker exec $CONTAINER_NAME mongosh $DB_NAME --eval "db.users.deleteMany({})" || \
docker exec $CONTAINER_NAME mongo $DB_NAME --eval "db.users.deleteMany({})"

echo "Concluído."
