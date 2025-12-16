const express = require('express'); // Importa o Express (padrão da indústria em Node.js para criar servidores web, rotas API (REST) e middleware)
const mongoose = require('mongoose'); // Importa o Mongoose para interação com a base de dados

const app = express(); // Cria uma instância da aplicação. Será utilizado para definir as rotas, configurações e middleware do servidor
const cors = require('cors');           // Para a segurança do frontend
const bcrypt = require('bcrypt');   // Para hashing de passwords
const helmet = require('helmet');   // Para segurança geral
const morgan = require('morgan');   // Para logging dos pedidos HTTP do cliente

const PORT = process.env.PORT || 3001; // Define o número da porta de rede onde o servidor web irá estar à escuta de pedidos

// Middlewares
app.use(express.json()); // Configura o Express para processar pedidos que chegam ao servidor com o header Content-Type: application/json.

const authRoutes = require('./routes/authRoutes'); // Importar as rotas
const userRoutes = require('./routes/userRoutes'); // Importar as rotas de utilizadores

app.use('/api/auth', authRoutes); // Usar as rotas da API sob o prefixo /api/auth
app.use('/api/users', userRoutes); // Usar as rotas de utilizadores sob o prefixo /api/users


// Rota de teste simples
app.get('/', (req, res) => { // Ficará à escuta de pedidos HTTP que usam o método GET no caminho / (ou seja, a raiz ou root da aplicação).
    // Define a função callback que é executada sempre que um pedido corresponde à rota /. 
    res.send('A API de Utilizadores está ON!'); // Envia a resposta ao cliente
});
app.use(cors());                   // Para simplificar, vamos permitir todas as origens
app.use(morgan('tiny'));   // Existem outros presets que podem usar: dev, combined, common, ou short
app.use(helmet());                // Define cabeçalhos de resposta HTTP relacionados com a segurança
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
