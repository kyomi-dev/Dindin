const bcrypt = require("bcrypt");
const pool = require("./conexao");


const validarLogin = async (req, res, next) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ mensagem: "Preencha todos os campos." });
        }

        const usuarioEncontrado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        if (usuarioEncontrado.rows.length === 0) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválido(s)." });
        }

        const senhaValida = await bcrypt.compare(senha, usuarioEncontrado.rows[0].senha);
        if (!senhaValida) {
            return res.status(400).json({ mensagem: "Insira a senha correta." });
        }

        req.usuario = usuarioEncontrado.rows[0];
        next();
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao validar o login." });
    }
};


module.exports = { validarLogin };
