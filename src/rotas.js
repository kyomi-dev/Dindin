const express = require("express");
const { cadastrarUsuario, login, getDadosUsuario } = require("./controllers/usuarios");
const { validarLogin } = require("./validarLogin");
const validarToken = require("./validarToken");
const rotas = express();


rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", validarLogin, login);
rotas.get("/usuario", validarToken, getDadosUsuario)


module.exports = rotas;
