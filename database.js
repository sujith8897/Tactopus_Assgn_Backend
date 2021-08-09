const {Client} = require('pg');

const client = new Client({
    user: "postgres",
    password: "local1234",
    database: "mydb",
    host: "localhost",
    port:5432,
});

module.exports = client;