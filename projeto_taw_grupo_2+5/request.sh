curl -X POST http://localhost:3001/api/auth/login \
-H "Content-Type: application/json" \
-d '{   
    "identifier": "user@projeto.pt", 
    "password": "SenhaSegura123"
}'
