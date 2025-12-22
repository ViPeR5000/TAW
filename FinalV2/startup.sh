#correr so 1 x
#npm install cors bcrypt helmet morgan jsonwebtoken
#npm init -y
#npm install express mongoose
#edit files
#docker compose down --volumes // Remove todos os containers, redes e volumes definidos no docker-compose.yml que foram criados na execução anterior
#docker compose build --no-cache // Reconstrói as imagens de todos os serviços definidos
#por uma questao de organizacao e de nao criar mais ruido adicionei numeros ao nome dos container para não terem probelmas a destruir-lo
docker compose up --build

#[+] Running 3/3
# ✔ app                          Built                                                                                                                0.0s 
# ✔ Container mongodb-db-etapa2  Running                                                                                                              0.0s 
# ✔ Container express-app        Recreated                                                                                                            0.3s 
# Attaching to express-app, mongodb-db-etapa2
# Gracefully stopping... (press Ctrl+C again to force)
# Error response from daemon: driver failed programming external connectivity on endpoint express-app (eb8b2b1d680941d854749da5c684a865bc9ad20f6c468233ec2a592d40de00a2): failed to bind port 0.0.0.0:3000/tcp: Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use

#┌──(viper5000㉿viper-windows)-[/mnt/c/viper5000/git/TAW/projeto_taw_grupo_2]
#└─$
#[+] Building 14.7s (11/11) FINISHED                                                                                                        docker:default
# => [app internal] load build definition from Dockerfile                                                                                             0.0s
# => => transferring dockerfile: 517B                                                                                                                 0.0s 
# => [app internal] load metadata for docker.io/library/node:alpine                                                                                   0.4s 
# => [app internal] load .dockerignore                                                                                                                0.0s
# => => transferring context: 2B                                                                                                                      0.0s 
# => [app 1/5] FROM docker.io/library/node:alpine@sha256:fd164609b5ab0c6d49bac138ae06c347e72261ec6ae1de32b6aa9f5ee2271110                             0.0s 
# => [app internal] load build context                                                                                                               13.1s 
# => => transferring context: 109.52kB                                                                                                               13.1s 
# => CACHED [app 2/5] WORKDIR /usr/src/app                                                                                                            0.0s
# => CACHED [app 3/5] COPY package*.json ./                                                                                                           0.0s 
# => CACHED [app 4/5] RUN npm install                                                                                                                 0.0s 
# => [app 5/5] COPY . .                                                                                                                               0.8s 
# => [app] exporting to image                                                                                                                         0.2s
# => => exporting layers                                                                                                                              0.2s 
# => => writing image sha256:a1d4e63927873d5308439c25ec79c02fa224c9b26b917562f2e5ac2af06631ae                                                         0.0s
# => => naming to docker.io/library/projeto_taw_grupo_2-app                                                                                           0.0s 
# => [app] resolving provenance for metadata file                                                                                                     0.0s 
# [+] Running 3/3
# ✔ app                          Built                                                                                                                0.0s 
# ✔ Container mongodb-db-etapa2  Running                                                                                                              0.0s 
# ✔ Container express-app        Recreated                                                                                                            0.1s 
# Attaching to express-app, mongodb-db-etapa2
# express-app        |
# express-app        | > projeto_taw_grupo_2@1.0.0 start
# express-app        | > node server.js                                                                                                                     
# express-app        |                                                                                                                                      
#mongodb-db-etapa2  | {"t":{"$date":"2025-12-13T01:40:11.843+00:00"},"s":"I",  "c":"ACCESS",   "id":10483900,"ctx":"conn1","msg":"Connection not authenticating","attr":{"client":"172.22.0.3:59038","doc":{"driver":{"name":"nodejs|Mongoose","version":"7.0.0|9.0.1"},"platform":"Node.js v25.2.1, LE","os":{"name":"linux","architecture":"x64","version":"6.6.87.2-microsoft-standard-WSL2","type":"Linux"},"env":{"container":{"runtime":"docker"}}}}}
#mongodb-db-etapa2  | {"t":{"$date":"2025-12-13T01:40:11.859+00:00"},"s":"I",  "c":"ACCESS",   "id":10483900,"ctx":"conn2","msg":"Connection not authenticating","attr":{"client":"172.22.0.3:59050","doc":{"driver":{"name":"nodejs|Mongoose","version":"7.0.0|9.0.1"},"platform":"Node.js v25.2.1, LE","os":{"name":"linux","architecture":"x64","version":"6.6.87.2-microsoft-standard-WSL2","type":"Linux"},"env":{"container":{"runtime":"docker"}}}}}
#express-app        | Ligação bem-sucedida ao MongoDB!
#express-app        | O Servidor Express encontra-se em execução na porta 3001                                                                             
#mongodb-db-etapa2  | {"t":{"$date":"2025-12-13T01:40:22.361+00:00"},"s":"I",  "c":"ACCESS",   "id":10483900,"ctx":"conn3","msg":"Connection not authenticating","attr":{"client":"172.22.0.3:34088","doc":{"driver":{"name":"nodejs|Mongoose","version":"7.0.0|9.0.1"},"platform":"Node.js v25.2.1, LE","os":{"name":"linux","architecture":"x64","version":"6.6.87.2-microsoft-standard-WSL2","type":"Linux"},"env":{"container":{"runtime":"docker"}}}}}
#mongodb-db-etapa2  | {"t":{"$date":"2025-12-13T01:40:39.104+00:00"},"s":"I",  "c":"WTCHKPT",  "id":22430,   "ctx":"Checkpointer","msg":"WiredTiger message","attr":{"message":{"ts_sec":1765590039,"ts_usec":103901,"thread":"1:0x74e6adbb16c0","session_name":"WT_SESSION.checkpoint","category":"WT_VERB_CHECKPOINT_PROGRESS","log_id":1000000,"category_id":7,"verbose_level":"INFO","verbose_level_id":0,"msg":"saving checkpoint snapshot min: 40, snapshot max: 40 snapshot count: 0, oldest timestamp: (0, 0) , meta checkpoint timestamp: (0, 0) base write gen: 1"}}}
#mongodb-db-etapa2  | {"t":{"$date":"2025-12-13T01:41:39.122+00:00"},"s":"I",  "c":"WTCHKPT",  "id":22430,   "ctx":"Checkpointer","msg":"WiredTiger message","attr":{"message":{"ts_sec":1765590099,"ts_usec":122287,"thread":"1:0x74e6adbb16c0","session_name":"WT_SESSION.checkpoint","category":"WT_VERB_CHECKPOINT_PROGRESS","log_id":1000000,"category_id":7,"verbose_level":"INFO","verbose_level_id":0,"msg":"saving checkpoint snapshot min: 41, snapshot max: 41 snapshot count: 0, oldest timestamp: (0, 0) , meta checkpoint timestamp: (0, 0) base write gen: 1"}}}
#mongodb-db-etapa2  | {"t":{"$date":"2025-12-13T01:42:39.385+00:00"},"s":"I",  "c":"WTCHKPT",  "id":22430,   "ctx":"Checkpointer","msg":"WiredTiger message","attr":{"message":{"ts_sec":1765590159,"ts_usec":384954,"thread":"1:0x74e6adbb16c0","session_name":"WT_SESSION.checkpoint","category":"WT_VERB_CHECKPOINT_PROGRESS","log_id":1000000,"category_id":7,"verbose_level":"INFO","verbose_level_id":0,"msg":"saving checkpoint snapshot min: 42, snapshot max: 42 snapshot count: 0, oldest timestamp: (0, 0) , meta checkpoint timestamp: (0, 0) base write gen: 1"}}}
