const express = require("express");
const { cadastrarUsuario } = require("./controllers/usuarios");
const rotas = express();

rotas.post("/usuario", cadastrarUsuario);

module.exports = rotas;
