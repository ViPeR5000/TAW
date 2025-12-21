# Relatório de Implementação e Segurança - Projeto TAW

## 1. Introdução
Este relatório detalha as medidas de segurança e decisões arquiteturais implementadas no projeto, com foco na robustez da API e proteção contra vetores de ataque comuns.

## 2. Funcionalidades Implementadas

O projeto inclui as seguintes funcionalidades principais, divididas entre componentes e segurança:

### Funcionalidades 
- **Registo de Utilizadores**: Criação de conta com validação de dados únicos (email/username).
- **Autenticação (Login)**: Sistema de login seguro com emissão de tokens JWT.
- **Upload de Imagem de Perfil**: Carregamento e armazenamento local de imagens de perfil via `multer`.
- **API RESTful**: Endpoints estruturados para gestão de utilizadores e autenticação.

### Funcionalidades de Segurança
- **Hashing de Passwords**: Encriptação irreversível com `bcrypt`.
- **Gestão de Sessão**: Uso de JSON Web Tokens (JWT) com expiração definida.
- **Limitação de Pedidos (Rate Limiting)**: Proteção contra brute-force e DoS.
- **Validação de Inputs**: Verificação rigorosa de tipos e formatos de dados.
- **Sanitização de HTML**: Limpeza de inputs para prevenir XSS.
- **Gestão de Configuração**: Segredos isolados em variáveis de ambiente.

### Infraestrutura e Controlo de Versões

 - **VM de Apoio**: Implementação de uma Máquina Virtual dedicada para suporte e testes.

https://drive.google.com/drive/folders/1pm7MPKF5v4BlgmahKV3nw3REUKUwtX5f

codigo

- **Repositório Git Online**: Organização do projeto em fases (pastas distintas) e histórico de commits atómicos focados por funcionalidade.

https://github.com/ViPeR5000/TAW/
### Criação de bashscripts 

 - **scripts**: Implementação de diversos bashsciprts para optimizar / automatizar tarefas ou ajudar na manutenção e despiste de erros


## 3. Implementação dos Requisitos de Segurança

Abaixo descreve-se como cada requisito foi abordado para garantir a segurança da aplicação:

### 3.1. Gestão de Segredos (Confidencialidade)
 - **Implementação**: Utilização da biblioteca `dotenv`.

-  **Prevenção**: O `JWT_SECRET` e a `MONGO_URI` foram removidos do código-fonte (hardcoded) e passaram a ser lidos de variáveis de ambiente. Isto previne a exposição acidental de credenciais em repositórios de código (git).

### 3.2. Proteção de Passwords (Integridade)
- **Implementação**: Uso de `bcrypt` para hashing de passwords antes do armazenamento na base de dados.
- **Prevenção**: Mitigação de ataques de *Rainbow Tables* e proteção em caso de acesso indevido à base de dados. As passwords nunca são guardadas em texto limpo.

### 3.3. Validação e Sanitização de Dados (Prevenção de Injeção e XSS)
- **Implementação**:
    
    **Validação**: `express-validator` assegura que os dados recebidos (email, nif, etc.) correspondem aos formatos esperados.
    
     **Sanitização**: `dompurify` (via `jsdom`) limpa strings de entrada.
- **Prevenção**: 
    
     **XSS (Cross-Site Scripting)**: A sanitização remove scripts maliciosos injetados em campos de texto (ex: nome, comentários).
    
     **NoSQL Injection**: A validação estrita de tipos ajuda a prevenir que objetos de consulta maliciosos sejam passados para o Mongoose.

### 3.4. Controlo de Tráfego (Rate Limiting)
- **Implementação**: Middleware `express-rate-limit`.
    
-    **Global**: Limite generoso para a API em geral.
    
-    **Autenticação**: Limite estrito (10 tentativas/minuto) nas rotas `/login` e `/register`.
    
-    **Prevenção**: Protege contra ataques de *     *Força Bruta** (tentativas infinitas de adivinhar passwords) e **Negação de Serviço (DoS)** por exaustão de recursos.

### 3.5. Upload Seguro de Imagens
- **Implementação**: Substituição de strings Base64 por upload de ficheiros via `multer`.
    
-    **Prevenção**: Validação do tipo de ficheiro (MIME type e extensão) no servidor para garantir que apenas imagens reais são carregadas, prevenindo o upload de executáveis ou scripts maliciosos.

## 4. Dificuldades Técnicas e Soluções

Durante a implementação, destacam-se os seguintes desafios:

1.  **Gestão de Dependências em Docker**: Ao adicionar novas bibliotecas (`dotenv`, `multer`, etc.), o container Docker não reconhecia os módulos devido ao cache dos volumes.
    -**Solução**: Forçar a recriação dos volumes anónimos com `docker-compose down -v` e reconstrução com `--build`.

2.  **Transição para Multipart/Form-Data**: A mudança para `multer` exigiu que o frontend deixasse de enviar JSON para enviar `FormData`, o que altera a estrutura do pedido HTTP.
3.  **Restart / do motor de renderização**: Por vezes esquecer de reiniciar o motor de renderização.


## 5. Vulnerabilidades e Limitações Conhecidas

O projeto, embora funcional e com boas práticas implementadas, possui vulnerabilidades conhecidas que devem ser mitigadas caso seja implementado num ambiente de produção real:

1.  **Armazenamento de Segredos**: Para efeitos académicos e de partilha, as variáveis de ambiente estão num ficheiro `TXT.env`. Em produção, estas não devem ser commitadas no repositório.

2.  **Logs em Modo Debug**: O `console.log` e o middleware `morgan` estão ativos, o que pode expor detalhes sensíveis nos logs do servidor.

3.  **Configuração de Proxy (Trust Proxy)**: A aplicação corre em Docker mas não tem `app.set('trust proxy', 1)` configurado. Isto significa que o *Rate Limiting* pode não identificar corretamente o IP real do cliente se estiver atrás de um *Reverse Proxy* (como Nginx), limitando todos os utilizadores como se fossem um só.

4.  **CORS Permissivo**: A configuração `app.use(cors())` permite pedidos de qualquer origem (*). Em produção, deve haver uma *whitelist* de domínios autorizados.

5.  **Falta de HTTPS**: A comunicação é feita via HTTP. Sem certificados SSL/TLS, os dados (incluindo tokens e passwords) podem ser intercetados na rede.

6.  **Cookies vs LocalStorage**: O token JWT é guardado em `localStorage` (suscetível a XSS se houver falhas de sanitização). O ideal seria usar Cookies `HttpOnly; Secure`.

## 6. Reflexão Final

O projeto atingiu um nível de segurança significativamente superior ao estado inicial. A arquitetura modular (separação de rotas, controladores e middlewares) facilitou a introdução de camadas de segurança.

A combinação de **validação de entrada**, **limitação de taxa** e **gestão de segredos** cumpre globalmente os requisitos de segurança modernos para uma API Web, garantindo robustez contra os ataques mais comuns listados na OWASP Top 10.

## 7. Autores


**Carlos Pimentel**	[carlos.pimentel@outlook.pt]

**Luís Moreira**	[luismoreir@gmail.com]

**Rui Melo**		[viper5000pt@gmail.com]


Obrigado