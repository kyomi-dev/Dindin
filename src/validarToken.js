const pool = require("./conexao");
const { secret } = require("./segredo");
const jwt = require("jsonwebtoken");


const validarToken = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const token = authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({ mensagem: "Para acessar este recurso, um token de autenticação válido deve ser enviado" });
        }

        const tokenVerificado = jwt.verify(token, secret);
        const { id } = tokenVerificado;

        const usuario = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);

        if (usuario.rows.length === 0) {
            return res.status(401).json({ mensagem: "Usuário não encontrado." });
        }

        req.usuario = usuario.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ mensagem: "Token inválido." });
    }
};

module.exports = validarToken;