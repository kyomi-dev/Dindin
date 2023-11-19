const express = require("express");
const { cadastrarUsuario, login } = require("./controllers/usuarios");
const rotas = express();


rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", login);

module.exports = rotas;
