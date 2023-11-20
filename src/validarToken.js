const { secret } = require("./segredo");
const jwt = require("jsonwebtoken");


const validarToken = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ mensagem: "Token não foi enviado na requisição." });
    }

    try {
        const tokenValidado = await jwt.verify(token, secret);
        req.usuario = tokenValidado;
    } catch (error) {
        return res.status(401).json({ mensagem: "Token inválido." });
    }
}

module.exports = validarToken;
