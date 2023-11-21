const express = require("express");
const { cadastrarUsuario, login, getDadosUsuario, getListarCategorias } = require("./controllers/usuarios");
const { validarLogin } = require("./validarLogin");
const validarToken = require("./validarToken");
const rotas = express();


rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", validarLogin, login);
rotas.get("/usuario", validarToken, getDadosUsuario)
rotas.get("/categoria", validarToken, getListarCategorias)


module.exports = rotas;
