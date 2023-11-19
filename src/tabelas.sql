CREATE TABLE
    usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
    );

CREATE TABLE
    categorias (
        id SERIAL PRIMARY KEY,
        descricao TEXT NOT NULL
    );

CREATE TABLE
    transacoes (
        id SERIAL PRIMARY KEY,
        descricao TEXT NOT NULL,
        valor INTEGER NOT NULL,
        data TIMESTAMP NOT NULL,
        categoria_id REFERENCES categorias(id),
        usuario_id REFERENCES usuarios(id),
        tipo TEXT NOT NULL
    );