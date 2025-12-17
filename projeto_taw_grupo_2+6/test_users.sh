#!/bin/bash

# Este script testa os endpoints de utilizadores 

# 1. Registar um utilizador normal
echo "[TEST] Registar utilizador normal..."
curl -s -X POST http://localhost:3001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "email": "test@example.com", "password": "password123", "nome": "Test User", "nif": "123456789"}' > /dev/null

# 2. Login como utilizador normal
echo "[TEST] Login como utilizador normal..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"identifier": "testuser", "password": "password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token User: $TOKEN"

# 3. Obter perfil (deve funcionar)
echo "[TEST] Obter perfil do utilizador normal..."
curl -s -X GET http://localhost:3001/api/users/profile \
-H "Authorization: Bearer $TOKEN"
echo ""

# 4. Tentar obter lista de utilizadores (deve falhar - 403 Forbidden)
echo "[TEST] Tentar listar utilizadores como normal (Deve falhar)..."
curl -s -X GET http://localhost:3001/api/users \
-H "Authorization: Bearer $TOKEN"
echo ""

# Nota: Para testar as funcionalidades de Admin, seria necessário criar um user com isAdmin: true na base de dados (o registo poe false por defeito)
# ou modificar o código temporariamente.

echo "Teste concluído."
