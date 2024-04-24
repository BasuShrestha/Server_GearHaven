const mysql = require("mysql");
const {HOST, USERNAME, PASSWORD, DATABASE} = require("./config.js");

const conn = mysql.createConnection({
  host: HOST,
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE
});

conn.connect(error => {
  if (error) throw error;
  console.log("Connection to the database successful!");
});

module.exports = conn;