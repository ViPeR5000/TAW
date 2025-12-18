#!/bin/bash

# Script de Teste para Funcionalidades de Administrador

# 1. Registar o futuro administrador
echo "[SETUP] Registar user 'admin'..."
curl -s -X POST http://localhost:3001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "admin", "email": "admin@projeto.pt", "password": "adminpassword", "nome": "Admin User", "nif": "999999990"}' > /dev/null

# 2. Promover a Admin diretamente na BD (Hack para teste)
# O nome do container está definido no docker-compose.yml como 'mongodb-db-etapa2-5'
echo "[SETUP] Promover 'admin' a Administrador via MongoDB..."
docker exec mongodb-db-etapa2-5 mongosh projeto-db --eval "db.users.updateOne({username: 'admin'}, {\$set: {isAdmin: true}})" > /dev/null

# 3. Login como Admin
echo "[TEST] Login como Admin..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"identifier": "admin", "password": "adminpassword"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token Admin: $TOKEN"

if [ -z "$TOKEN" ]; then
    echo "Falha no login. Abortar."
    exit 1
fi

# 4. Listar todos os utilizadores (Deve funcionar)
echo "[TEST] Listar todos os utilizadores (Admin)..."
RESPONSE=$(curl -s -X GET http://localhost:3001/api/users \
-H "Authorization: Bearer $TOKEN")

# Verifica se a resposta contém "success":true
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "SUCESSO: Lista de utilizadores obtida."
    # echo "$RESPONSE" # Opcional: mostrar a lista
else
    echo "FALHA: Não foi possível obter a lista."
    echo "$RESPONSE"
fi
echo ""

# 5. Criar utilizador vítima para eliminar
echo "[SETUP] Criar utilizador 'vitima'..."
curl -s -X POST http://localhost:3001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "vitima", "email": "vitima@projeto.pt", "password": "bye", "nome": "Vitima", "nif": "111111111"}' > /dev/null

# Obter ID da vítima (necessita de jq ou grep hack)
# Vamos obter a lista novamente e sacar o ID do user 'vitima'
# Assumindo que o output é JSON e 'vitima' é unico.
echo "[SETUP] Obter ID da vítima..."
VITIMA_ID=$(curl -s -X GET http://localhost:3001/api/users -H "Authorization: Bearer $TOKEN" | grep -o '"_id":"[^"]*","username":"vitima"' | cut -d'"' -f4)

if [ -z "$VITIMA_ID" ]; then
    echo "AVISO: Não foi possivel encontrar o ID da vitima. Tentar método alternativo ou o user ja existe."
    # Tentar hack simples: assumir que foi o último (não garantido).
    # Vamos apenas informar.
    echo "Saltar teste de eliminação."
else
    echo "ID da Vítima: $VITIMA_ID"

    # 6. Eliminar utilizador (Deve funcionar)
    echo "[TEST] Eliminar utilizador 'vitima'..."
    DEL_RESPONSE=$(curl -s -X DELETE http://localhost:3001/api/users/$VITIMA_ID \
    -H "Authorization: Bearer $TOKEN")
    
    if echo "$DEL_RESPONSE" | grep -q '"success":true'; then
        echo "SUCESSO: Utilizador eliminado."
    else
        echo "FALHA: Não foi possível eliminar."
        echo "$DEL_RESPONSE"
    fi
fi

echo "Teste de Admin concluído."
