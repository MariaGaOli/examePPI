const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let users = [];
let messages = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1800000 } // 30 minutos
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar se o usuário está logado
function checkLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Rota para a página inicial (menu)
app.get('/', checkLogin, (req, res) => {
  res.render('menu', { lastAccess: req.cookies.lastAccess });
});

// Rota para a página de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Rota para processar o login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.user = username;
    res.cookie('lastAccess', new Date().toLocaleString());
    res.redirect('/');
  } else {
    res.render('login', { error: 'Credenciais inválidas' });
  }
});

// Rota para logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Rota para a página de cadastro de usuários
app.get('/cadastroUsuario.html', checkLogin, (req, res) => {
  res.render('cadastroUsuario', { users });
});

// Rota para processar o cadastro de usuários
app.post('/cadastrarUsuario', checkLogin, (req, res) => {
  const { nome, dataNascimento, nickname } = req.body;
  if (nome && dataNascimento && nickname) {
    users.push({ nome, dataNascimento, nickname });
    res.render('cadastroUsuario', { users });
  } else {
    res.render('cadastroUsuario', { users, error: 'Todos os campos são obrigatórios' });
  }
});

// Rota para a página de bate-papo
app.get('/batePapo', checkLogin, (req, res) => {
  res.render('batePapo', { users, messages });
});

// Rota para processar o envio de mensagens
app.post('/postarMensagem', checkLogin, (req, res) => {
  const { usuario, mensagem } = req.body;
  if (usuario && mensagem) {
    messages.push({ usuario, mensagem, timestamp: new Date().toLocaleString() });
    res.render('batePapo', { users, messages });
  } else {
    res.render('batePapo', { users, messages, error: 'Usuário e mensagem são obrigatórios' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
