var Sequelize = require("sequelize");

var connection = new Sequelize('xxx', 'xxx', {
    host: "localhost",
    port: 3306,
    dialect: 'mysql'
});

module.exports = connection


