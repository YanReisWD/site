import http from 'http';
import { Client } from 'pg';
import bcrypt from 'bcrypt';

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
  );
`);


const PORT = 3000;
const SALT_ROUNDS = 10;


const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/register') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      try {
        const { nome, email, senha, confirmarSenha } = JSON.parse(body);

        if (!nome || !email || !senha || !confirmarSenha) {
          res.writeHead(400);
          res.end(JSON.stringify({ erro: 'Todos os campos são obrigatórios' }));
          return;
        }

        if (senha !== confirmarSenha) {
          res.writeHead(400);
          res.end(JSON.stringify({ erro: 'As senhas não coincidem' }));
          return;
        }

        const hash = await bcrypt.hash(senha, SALT_ROUNDS);

        try {
          await client.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
            [nome, email, hash]
          );

          res.writeHead(201);
          res.end(JSON.stringify({ mensagem: 'Usuário registrado com sucesso' }));
        } catch (err) {
          if (err.code === '23505') {
            res.writeHead(400);
            res.end(JSON.stringify({ erro: 'E-mail já registrado' }));
          } else {
            console.error(err);
            res.writeHead(500);
            res.end(JSON.stringify({ erro: 'Erro interno no servidor' }));
          }
        }

      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ erro: 'JSON inválido' }));
      }
    });
      } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      try {
        const { email, senha } = JSON.parse(body);

        if (!email || !senha) {
          res.writeHead(400);
          res.end(JSON.stringify({ erro: 'Preencha todos os campos' }));
          return;
        }

        const resultado = await client.query(
          'SELECT * FROM usuarios WHERE email = $1',
          [email]
        );

        if (resultado.rows.length === 0) {
          res.writeHead(401);
          res.end(JSON.stringify({ erro: 'Usuário não encontrado' }));
          return;
        }

        const usuario = resultado.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
          res.writeHead(401);
          res.end(JSON.stringify({ erro: 'Senha incorreta' }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({ mensagem: 'Login realizado com sucesso', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } }));

      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ erro: 'Erro interno no servidor' }));
      }
    });


  } else {
    
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
  }
});

// Inicia o servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

