const bcrypt = require("bcrypt");
const pool = require("./conexao");


const validarLogin = async (email, senha) => {
    if (!email || !senha) {
        throw new Error("Preencha todos os campos.");
    }

    const usuarioEncontrado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (usuarioEncontrado.rows.length === 0) {
        throw new Error("Usuário e/ou senha inválido(s).");
    }

    const senhaValida = await bcrypt.compare(senha, usuarioEncontrado.rows[0].senha);
    if (!senhaValida) {
        throw new Error("Insira a senha correta.");
    }

    return usuarioEncontrado.rows[0];
}


module.exports = { validarLogin };
