const express = require('express'); // Importa o Express (padrão da indústria em Node.js para criar servidores web, rotas API (REST) e middleware)
const mongoose = require('mongoose'); // Importa o Mongoose para interação com a base de dados

const app = express(); // Cria uma instância da aplicação. Será utilizado para definir as rotas, configurações e middleware do servidor
const PORT = process.env.PORT || 3001; // Define o número da porta de rede onde o servidor web irá estar à escuta de pedidos

// Middlewares
app.use(express.json()); // Configura o Express para processar pedidos que chegam ao servidor com o header Content-Type: application/json.

// Define a string de conexão a partir da variável de ambiente (MONGO_URI)
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projeto-db';

mongoose.connect(DB_URI) // Inicia a tentativa de conexão assíncrona à base de dados MongoDB
    .then(() => { // Esta função é executada apenas se a ligação à base de dados for bem-sucedida
        console.log('Ligação bem-sucedida ao MongoDB!');
        app.listen(PORT, () => { // Servidor iniciado
            console.log(`O Servidor Express encontra-se em execução na porta ${PORT}`);
        });
    })
    .catch(err => { // Esta função é executada apenas se a ligação ao MongoDB falhar
        console.error('ERRO: Falha na ligação ao MongoDB:', err.message);
    });