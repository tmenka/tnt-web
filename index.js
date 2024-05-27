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



app.get('/', async function (req, res) {
    await res.render('index');

});

app.get('/pocetna', function (req, res) {
    res.render('index');
});

app.get('/radno-vrijeme-cjenik', function (req, res) {
    res.render('priceList');
});

app.get('/tnt-team', function (req, res) {
  res.render('tntTeam');
});

app.get('/galerija', function (req, res) {
  res.render('galery');
});

app.get('/kontakt', function (req, res) {
  res.render('contact');
});

//ADMIN PART
app.get('/users', async function (req, res) {
  const usersQuery = 'SELECT * FROM users';
  const users = await pool.query(usersQuery);

  const rolesQuery = 'SELECT * FROM roles';
  const roles = await pool.query(rolesQuery);

  await res.render('admin/users', { users: users.rows, roles: roles.rows });
});

app.post('/users', async function (req, res) {
 let user= req.body;

 await pool.query(
  'INSERT into users (firstname, lastname, username, password, role_id) VALUES($1, $2, $3, $4, $5)', 
  [user.firstname, user.lastname, user.username, user.password, user.role_id]);

 res.redirect("/users");
});

app.post('/users/delete', async function (req, res) {
  let user= req.body;
 
  await pool.query(
    'DELETE from users where users_id = $1', 
    [user.users_id]);
 
  res.redirect("/users");
 });

//the server is listening on port 3000 for connections
app.listen(3000, function () {
  console.log('Example app listening on port 3000!') //node index.js
});