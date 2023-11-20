const jwt = require("jsonwebtoken");
const { secret } = require("./segredo");


const criarToken = async (id) => {

    try {
        const token = jwt.sign({ id }, secret, { expiresIn: "1h" });
        return token;

    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = { criarToken };