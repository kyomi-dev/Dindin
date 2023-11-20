const bcrypt = require("bcrypt");
const pool = require("../conexao");
const jwt = require("jsonwebtoken");
const { criarToken } = require("../criarToken");
const { validarLogin } = require("../validarLogin");


const cadastrarUsuario = async (req, res) => {
    try {
        // criar um middlware num arquivo pra validar o email.
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Preencha todos os campos" });
        };
        const usuarioEncontrado = await pool.query("SELECT * FROM usuarios WHERE email = $1 ", [email]);
        if (usuarioEncontrado && usuarioEncontrado.rows.length > 0) {
            return res.status(400).json({ mensagem: "Já existe um usuário cadastrado com o email informado." });
        }
        else {
            const hashSenha = await bcrypt.hash(senha, 10);
            await pool.query("INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)", [nome, email, hashSenha]);
            const resultado = await pool.query("SELECT * FROM usuarios WHERE email = $1 ", [email]);
            res.status(201).json({
                "mensagem": {
                    "id": resultado.rows[0].id,
                    "nome": resultado.rows[0].nome,
                    "email": resultado.rows[0].email
                }
            });
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const login = async (req, res) => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválido(s)." });
        }

        const id = usuario.id;
        const token = await criarToken(id);
        const { senha: _, ...usuarioLogado } = usuario;

        return res.status(200).json({ usuario: usuarioLogado, token });

    } catch (error) {
        return res.status(400).json({ mensagem: error.message });
    }
}


module.exports = { cadastrarUsuario, login };