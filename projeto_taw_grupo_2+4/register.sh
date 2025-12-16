curl -X POST http://localhost:3001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "user", "email": "user@projeto.pt", "password": "SenhaSegura123", "nome": "Utilizador", "nif": "999999999", "morada": "Rua do Projeto"}'