const mysql = require("mysql");
const {HOST, USERNAME, PASSWORD, DATABASE} = require("./config.js");

// Create a connection to the database
const conn = mysql.createConnection({
  host: HOST,
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE
});

// open the MySQL connection
conn.connect(error => {
  if (error) throw error;
  console.log("Connection to the database successful!");
});

module.exports = conn;