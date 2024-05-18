const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tntdb',
  password: 'admin',
  port: 5432,
})


//require the just installed express app
var express = require('express');//then we call express
var bodyParser = require("body-parser");
var app = express();//takes us to the root(/) URL
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('assets'))



app.get('/', async function (req, res) {//when we visit the root URL express will respond with 'Hello World'
    const query = 'SELECT * FROM users'
    const users = await pool.query(query)
    await res.render('index', { users: users.rows});

});//the server is listening on port 3000 for connections

app.get('/kontakt', function (req, res) {//when we visit the root URL express will respond with 'Hello World'
    res.render('kontakt');
  });//the server is listening on port 3000 for connections



app.listen(3000, function () {
  console.log('Example app listening on port 3000!') //node index.js
});