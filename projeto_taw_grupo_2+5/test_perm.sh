#!/bin/bash

# Script de Teste de Permissões (Security Check)


echo -e "=== INÍCIO DO TESTE DE PERMISSÕES ===$"

# 1. UTILIZADOR NORMAL
echo -e "\n[1] TESTE COM UTILIZADOR NORMAL"

# 1.1 Registar
echo "--> A registar 'user_normal'..."
curl -s -X POST http://localhost:3001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "user_normal", "email": "normal@test.com", "password": "123", "nome": "User Normal", "nif": "100000001"}' > /dev/null

# 1.2 Login
echo "--> A fazer login..."
TOKEN_NORMAL=$(curl -s -X POST http://localhost:3001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"identifier": "user_normal", "password": "123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN_NORMAL" ]; then
    echo -e "ERRO: Falha no login do user normal."
    exit 1
fi
echo "Token User Normal obtido."

# 1.3 Tentar Aceder a Rota de Admin (Listar Users)
echo "--> Tentativa de acesso a rota protegida (GET /api/users)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3001/api/users \
-H "Authorization: Bearer $TOKEN_NORMAL")

if [ "$HTTP_CODE" == "403" ]; then
    echo -e "SUCESSO (ESPERADO): Acesso negado com código 403."
else
    echo -e "ALERTA DE SEGURANÇA: Código $HTTP_CODE recebido (Esperado 403)."
fi



# 2. ADMINISTRADOR
echo -e "\n[2] TESTE COM ADMINISTRADOR"

# 2.1 Registar
echo "--> A registar 'user_admin'..."
curl -s -X POST http://localhost:3001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "user_admin", "email": "admin@test.com", "password": "123", "nome": "User Admin", "nif": "100000002"}' > /dev/null

# 2.2 Promover a Admin (MongoDB Hack)
echo "--> A promover 'user_admin' a Administrador..."
docker exec mongodb-db-etapa2-5 mongosh projeto-db --eval "db.users.updateOne({username: 'user_admin'}, {\$set: {isAdmin: true}})" > /dev/null

# 2.3 Login
echo "--> A fazer login como Admin..."
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"identifier": "user_admin", "password": "123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN_ADMIN" ]; then
    echo -e "ERRO: Falha no login do admin."
    exit 1
fi
echo "Token Admin obtido."

# 2.4 Tentar Aceder a Rota de Admin (Listar Users)
echo "--> Tentativa de acesso a rota protegida (GET /api/users)..."
RESPONSE=$(curl -s -X GET http://localhost:3001/api/users \
-H "Authorization: Bearer $TOKEN_ADMIN")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "SUCESSO: Acesso permitido a Administrador."
else
    echo -e "FALHA: O Admin não conseguiu aceder."
    echo "Resposta: $RESPONSE"
fi

echo -e "\n=== FIM DO TESTE ==="
