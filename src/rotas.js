const express = require("express");
const { cadastrarUsuario, login } = require("./controllers/usuarios");
const validarLogin = require("./validarLogin");
const rotas = express();


rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", validarLogin, login);

module.exports = rotas;
