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
    }
    const usuarioEncontrado = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 ",
      [email]
    );
    if (usuarioEncontrado && usuarioEncontrado.rows.length > 0) {
      return res.status(400).json({
        mensagem: "Já existe um usuário cadastrado com o email informado.",
      });
    } else {
      const hashSenha = await bcrypt.hash(senha, 10);
      await pool.query(
        "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)",
        [nome, email, hashSenha]
      );
      const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1 ",
        [email]
      );
      res.status(201).json({
        mensagem: {
          id: resultado.rows[0].id,
          nome: resultado.rows[0].nome,
          email: resultado.rows[0].email,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res
        .status(400)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const id = usuario.id;
    const token = await criarToken(id);
    const { senha: _, ...usuarioLogado } = usuario;

    return res.status(200).json({ usuario: usuarioLogado, token });
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const getDadosUsuario = async (req, res) => {
  try {
    const id = req.usuario.id;
    const query = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      id,
    ]);

    if (query.rows.length === 0) {
      return res.status(401).json({ mensagem: "Usuário não encontrado." });
    }

    const { senha: _, ...usuarioLogado } = query.rows[0];

    return res.status(200).json({ mensagem: usuarioLogado });
  } catch (error) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao buscar dados do usuário." });
  }
};

const editarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }
  const usuarioEncontrado = await pool.query(
    "SELECT * FROM usuarios WHERE email = $1 ",
    [email]
  );

  if (usuarioEncontrado.rows.length > 0) {
    return res
      .status(401)
      .json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." });
  }
  const idToken = req.usuario.id;
  const hashSenha = await bcrypt.hash(senha, 10);
  await pool.query(
    "UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4",
    [nome, email, hashSenha, idToken]
  );

  return res.status(204).end();
};

const getListarCategorias = async (req, res) => {
  try {
    const query = await pool.query("SELECT * FROM categorias ");

    if (query.rows.length === 0) {
      return res.status(401).json({ mensagem: "Categoria não encontrada." });
    }

    return res.status(200).json({ mensagem: query.rows });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao buscar categorias." });
  }
};

const criarTransacao = async (req, res) => {
  const usuarioID = req.usuario.id;
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  try {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res
        .status(400)
        .json({
          mensagem: "Todos os campos obrigatórios devem ser informados.",
        });
    }

    const validaCategoria = await pool.query(
      "SELECT id, descricao FROM categorias WHERE id = $1",
      [categoria_id]
    );

    if (validaCategoria.rows.length === 0) {
      return res
        .status(404)
        .json({ mensagem: "A categoria não consta no banco de dados." });
    }



    if (tipo === "entrada" || tipo === "saida") {
      const resultado = await pool.query(
        "INSERT INTO transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [descricao, valor, data, categoria_id, usuarioID, tipo]
      );

      const novaTransacao = resultado.rows[0];

      return res.status(201).json({
        id: novaTransacao.id,
        tipo: novaTransacao.tipo,
        descricao: novaTransacao.descricao,
        valor: novaTransacao.valor,
        data: novaTransacao.data,
        usuario_id: novaTransacao.usuario_id,
        categoria_id: novaTransacao.categoria_id,
        categoria_nome: validaCategoria.rows[0].descricao,
      });
    } else {
      return res.status(400).json({ mensagem: "Tipo de transação inválido." });
    }
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao criar transação." });
  }
};

const listarTransacoes = async (req, res) => {
  try {
    const id = req.usuario.id;
    let categoriasFiltro = req.query.filtro;

    if (!categoriasFiltro || (Array.isArray(categoriasFiltro) && categoriasFiltro.length === 0)) {
      const query = await pool.query(
        "SELECT * FROM transacoes WHERE usuario_id = $1",
        [id]
      );

      if (query.rows.length === 0) {
        return res.status(401).json({ mensagem: "Nenhuma transação encontrada." });
      }

      return res.status(200).json({ mensagem: query.rows });
    }

    categoriasFiltro = Array.isArray(categoriasFiltro) ? categoriasFiltro : [categoriasFiltro];

    const placeholders = categoriasFiltro
      .map((_, index) => `$${index + 2}`)
      .join(", ");

    const query = await pool.query(
      `SELECT * FROM transacoes WHERE usuario_id = $1 AND categoria_id IN (SELECT id FROM categorias WHERE descricao IN (${placeholders}))`,
      [id, ...categoriasFiltro]
    );

    if (query.rows.length === 0) {
      return res.status(401).json({ mensagem: "Nenhuma transação encontrada." });
    }

    return res.status(200).json({ mensagem: query.rows });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao buscar transações." });
  }
};

const atualizarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const { id } = req.params;

  if (!descricao || !valor || !data || !categoria_id || !tipo) {
    return res.status(400).json({
      mensagem: "Todos os campos obrigatórios devem ser informados.",
    });
  }

  try {
    const transacao = await pool.query("SELECT * FROM transacoes WHERE id = $1", [id]);

    if (transacao.rows.length === 0) {
      return res.status(404).json({ mensagem: "A transação não existe." });
    }

    if (Number(transacao.rows[0].usuario_id) !== Number(req.usuario.id)) {
      return res.status(401).json({ mensagem: "Usuário não autorizado." });
    }

    const categoria = await pool.query("SELECT * FROM categorias WHERE id = $1", [categoria_id]);

    if (categoria.rows.length === 0) {
      return res.status(404).json({ mensagem: "A categoria não existe." });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(401).json({ mensagem: "O tipo deve ser 'entrada' ou 'saida'." });
    }

    const resultado = await pool.query(
      "UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6",
      [descricao, valor, data, categoria_id, tipo, id]
    );

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao atualizar transação." });
  }
};


const detalharTransacao = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const transacaoId = req.params.id;

    const query = await pool.query("SELECT * FROM transacoes WHERE id = $1", [
      transacaoId,
    ]);

    if (query.rows.length === 0) {
      return res.status(401).json({ mensagem: "Transação não encontrada." });
    }

    const usuarioTransacaoId = query.rows[0].usuario_id;

    if (usuarioId !== usuarioTransacaoId) {
      return res.status(401).json({
        mensagem: "Usuário não autorizado a visualizar esta transação.",
      });
    }

    return res.status(200).json({ mensagem: query.rows });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao buscar transação." });
  }
};

const extratoTransacoes = async (req, res) => {
  try {
    const id = req.usuario.id;

    const query = await pool.query(
      "SELECT tipo, SUM(valor) AS total FROM transacoes WHERE usuario_id = $1 GROUP BY tipo",
      [id]
    );

    if (query.rows.length === 0) {
      return res
        .status(200)
        .json({ mensagem: "Nenhuma transação encontrada." });
    }

    const resultados = query.rows;

    const resultadoFinal = {
      entradas: 0,
      saidas: 0,
    };

    resultados.forEach((resultado) => {
      if (resultado.tipo === "entrada") {
        resultadoFinal.entradas = parseFloat(resultado.total);
      } else if (resultado.tipo === "saida") {
        resultadoFinal.saidas = parseFloat(resultado.total);
      }
    });

    const saldo = resultadoFinal.entradas - resultadoFinal.saidas;

    return res.status(200).json({
      mensagem: {
        entradas: resultadoFinal.entradas,
        saidas: resultadoFinal.saidas,
        saldo,
      },
    });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao buscar transações." });
  }
};

const excluirTransacao = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const transacaoId = req.params.id;

    const query = await pool.query("SELECT * FROM transacoes WHERE id = $1", [
      transacaoId,
    ]);

    if (query.rows.length === 0) {
      return res.status(404).json({ mensagem: "Transação não encontrada." });
    }

    const usuarioTransacaoId = query.rows[0].usuario_id;

    if (usuarioId !== usuarioTransacaoId) {
      return res
        .status(401)
        .json({ mensagem: "Usuário não autorizado a excluir esta transação." });
    }

    const resultado = await pool.query(
      "DELETE FROM transacoes WHERE id = $1 RETURNING *",
      [transacaoId]
    );

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro ao excluir transação." });
  }
};

module.exports = {
  cadastrarUsuario,
  login,
  getDadosUsuario,
  editarUsuario,
  criarTransacao,
  getListarCategorias,
  listarTransacoes,
  detalharTransacao,
  atualizarTransacao,
  excluirTransacao,
  extratoTransacoes,
};
