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
var fileUpload = require('express-fileupload');//upload file
var fs = require('fs');
var bodyParser = require("body-parser");
var app = express();//takes us to the root(/) URL
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('assets'))
app.use(fileUpload());



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


//appointment

app.get('/appointment', async function (req, res) {
  let edit_app_id = req.query.edit_appointment_id ?? null;
  const appointmentQuery = 'SELECT * FROM appointment';
  const appointmentsDb = await pool.query(appointmentQuery);


  await res.render('admin/appointment', { appointments: appointmentsDb.rows, edit_appointment_id: edit_app_id });
  });

 app.post('/appointment', async function (req, res) {
  let appointment= req.body;
 
  await pool.query(
   'INSERT into appointment (start_date_time, end_date_time) VALUES($1, $2)', 
   [appointment.start_date_time, appointment.end_date_time]);
 
  res.redirect("/appointment");
 });

 app.post('/appointment/edit', async function (req, res) {
  let appointment= req.body;
 
  await pool.query(
   'UPDATE appointment SET start_date_time = $1, end_date_time = $2 WHERE appointment_id = $3', 
   [appointment.start_date_time, appointment.end_date_time, appointment.appointment_id]);
 
  res.redirect("/appointment");
 });
 
 app.post('/appointment/delete', async function (req, res) {
   let appointment= req.body;
  
   await pool.query(
     'DELETE from appointment where appointment_id = $1', 
     [appointment.appointment_id]);
  
   res.redirect("/appointment");
  });


// GALLERY

app.get('/gallery', async function (req, res) {
  const galleryQuery = 'SELECT * FROM gallery_items';
  const galleryDB = await pool.query(galleryQuery);


  await res.render('gallery', { gallery_items: galleryDB.rows });
  });

app.get('/admin/gallery', async function (req, res) {
  const galleryQuery = 'SELECT * FROM gallery_items';
  const galleryDB = await pool.query(galleryQuery);


  await res.render('admin/admin-gallery', { gallery_items: galleryDB.rows });
  });


app.post('/admin/gallery', async function (req, res) {
  let uploaded_file = req.files.image;
  // provjeri jel postoji uplaod file -- uploaded_file
 let upload_file_name = `${Date.now()}-${uploaded_file.name}`

  uploaded_file.mv('assets/images/galerija/' + upload_file_name, async function(err) {
    if(err) console.log(err);

    await pool.query(
      'INSERT into gallery_items (path, title) VALUES($1, $2)', 
      ['/images/galerija/' + upload_file_name, req.body.title]);

    await res.redirect('/admin/gallery');
  })
  
  });


app.post('/admin/gallery/delete', async function (req, res) {
  let image= req.body;
   
  let imageDb = await pool.query(
    'SELECT * from gallery_items where gallery_items_id = $1', 
    [image.image_id]);

    fs.unlink('assets' + imageDb.rows[0].path, async function(err) {
      if(err) console.log(err);

      await pool.query(
        'DELETE from gallery_items where gallery_items_id = $1', 
        [image.image_id]);
        
        res.redirect("/admin/gallery");
    })

   
  });


//the server is listening on port 3000 for connections
app.listen(3000, function () {
  console.log('Example app listening on port 3000!') //node index.js
});