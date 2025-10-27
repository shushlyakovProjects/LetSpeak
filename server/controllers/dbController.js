const mysql = require('mysql') // Пакет для работы с mysql (БД)

// Устанавливаем соединение с базой данных
const connection = mysql.createConnection({
    host: 'localhost',
    database: 'letspeak',
    user: 'root',
    password: ''
})

module.exports = connection