CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pass VARCHAR(255) NOT NULL
);

CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    location INTEGER NOT NULL,
    publicationdate VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    source INTEGER NOT NULL,
    link VARCHAR(255) NOT NULL,
    type INTEGER NOT NULL,
    theme INTEGER NOT NULL,
    emotional INTEGER NOT NULL
);

CREATE TABLE planned (
    id SERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    planned INTEGER NOT NULL,
    location INTEGER NOT NULL,
    type INTEGER NOT NULL
);

CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE source (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE theme (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE emotional (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);


INSERT INTO location VALUES (1, 'Владимир Сбыт');
INSERT INTO location VALUES (2, 'Иваново Сбыт');
INSERT INTO location VALUES (3, 'Владимир Генерация');
INSERT INTO location VALUES (4, 'Иваново Генерация');

INSERT INTO type VALUES (1, 'Пресс-релиз');
INSERT INTO type VALUES (2, 'Новость');
INSERT INTO type VALUES (3, 'Видео');
INSERT INTO type VALUES (4, 'Сюжет');
INSERT INTO type VALUES (5, 'Соцсети');
INSERT INTO type VALUES (6, 'Сайты');
INSERT INTO type VALUES (7, 'Газета');
INSERT INTO type VALUES (8, 'хорошая новость');

INSERT INTO source VALUES (1, 'Портал');
INSERT INTO source VALUES (2, 'Сайт');
INSERT INTO source VALUES (3, 'Приложение');
INSERT INTO source VALUES (4, 'КТВ');
INSERT INTO source VALUES (5, 'Аккаунт');
INSERT INTO source VALUES (6, 'Рассылка');

INSERT INTO theme VALUES (1, 'Транспорт');
INSERT INTO theme VALUES (2, 'Бизнес');
INSERT INTO theme VALUES (3, 'Строительство');

INSERT INTO emotional VALUES (1, 'Позитивные');
INSERT INTO emotional VALUES (2, 'Нейтральные');
INSERT INTO emotional VALUES (3, 'Отрицательные');

INSERT INTO users VALUES (1, 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918');
INSERT INTO users VALUES (2, 'user', '04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb');
INSERT INTO users VALUES (3, 'test', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
