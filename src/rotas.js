const express = require("express");
const { cadastrarUsuario, login, getDadosUsuario, getListarCategorias, listarTransacoes, detalharTransacao, editarUsuario } = require("./controllers/usuarios");
const { validarLogin } = require("./validarLogin");
const validarToken = require("./validarToken");
const rotas = express();


rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", validarLogin, login);
rotas.get("/usuario", validarToken, getDadosUsuario)
rotas.put("/usuario", validarToken, editarUsuario)
rotas.get("/categoria", validarToken, getListarCategorias)
rotas.get("/transacao", validarToken, listarTransacoes)
rotas.get("/transacao/:id", validarToken, detalharTransacao)


module.exports = rotas;
