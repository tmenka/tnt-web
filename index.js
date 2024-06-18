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
var session = require('express-session'); // login session module
var bcrypt = require('bcrypt'); // password hash module
var bodyParser = require("body-parser");
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('assets'))
app.use(fileUpload());

app.use(session({
    secret: 'secret', //TODO prominit da se cita odnekud prije deploya
    resave: true,
    saveUninitialized: true
}));

// PUBLIC PART 

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

app.get('/kontakt', function (req, res) {
  res.render('contact');
});

app.get('/galerija', async function (req, res) {
  const galleryQuery = 'SELECT * FROM gallery_items';
  const galleryDB = await pool.query(galleryQuery);

  await res.render('gallery', { gallery_items: galleryDB.rows });
});

// Rezervacija
app.get('/rezervacija', async function (req, res) {
  const appointmentQuery = `SELECT app.* FROM appointment app 
                              LEFT JOIN reservation res ON app.appointment_id = res.appointment_id
                              WHERE res.reservation_id IS NULL`;
  const appointmentsDb = await pool.query(appointmentQuery);
  
  
  await res.render('reservation', { appointments: appointmentsDb.rows });
});



app.post('/reservation', async function (req, res) {
  let reservation = req.body;

  // TODO dodat check za appointment
   
  await pool.query(
     'INSERT into reservation (firstname, lastname, email, phone_number,' + 
     'date_of_birth, allergies, comment, status, appointment_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
     [reservation.firstname, reservation.lastname, reservation.email,
      reservation.phone_number, reservation.date_of_birth, reservation.allergies,
      reservation.comment, 0, reservation.appointment_id]);
   
  res.redirect("/rezervacija");
});

// LOGIN

app.get('/login', async function (req, res) {
     let errorMessage = req.query.errorMessage ?? null; 

     if(req.session.loggedin) {
        res.redirect('/admin/users');
     }

     res.render('admin/login', { errorMessage: errorMessage });
});

app.post('/login', async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;;
    const usersDb = await pool.query( 'SELECT * FROM users WHERE username = $1', [username]);

    if (usersDb && usersDb.rows.length > 0 && bcrypt.compareSync(password, usersDb.rows[0].password)) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('admin/users');
    } else {
      res.redirect('/login?errorMessage=Pogrešno korisničko ime i/ili zaporka');
    }    
    res.end();
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.redirect('/admin/users?errorMessage=Greška prilikom odjave');
        }

        res.clearCookie('sid');
        res.redirect('/login');
    });
});

//--------------ADMIN PART---------------

// Middleware to protect /admin routes
app.use('/admin', (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
});

// users
app.get('/admin/users', async function (req, res) {
  let errorMessage = req.query.errorMessage ?? null; 

  const usersQuery = 'SELECT * FROM users';
  const users = await pool.query(usersQuery);

  const rolesQuery = 'SELECT * FROM roles';
  const roles = await pool.query(rolesQuery);

  await res.render('admin/users', { users: users.rows, roles: roles.rows , errorMessage: errorMessage  });
});

app.post('/admin/users', async function (req, res) {
 let user = req.body;
 const usersDb = await pool.query( 'SELECT * FROM users WHERE username = $1', [user.username]);
 
 if (usersDb && usersDb.rows.length > 0 && bcrypt.compareSync(user.password, usersDb.rows[0].password)) { 
    res.redirect("/admin/users?errorMessage=Korisnik već postoji");
 } else { 
   await pool.query(
    'INSERT into users (firstname, lastname, username, password, role_id) VALUES($1, $2, $3, $4, $5)', 
    [user.firstname, user.lastname, user.username, bcrypt.hashSync(user.password, 10), user.role_id]);

    res.redirect("/admin/users");
 }
});

app.post('/admin/users/delete', async function (req, res) {
  let user = req.body;
 
  await pool.query(
    'DELETE from users where users_id = $1', 
    [user.users_id]);
 
  res.redirect("/admin/users");
});


//appointment
app.get('/admin/appointment', async function (req, res) {
  let errorMessage = req.query.errorMessage ?? null; 
  let edit_app_id = req.query.edit_appointment_id ?? null;
  const appointmentQuery = 'SELECT * FROM appointment';
  const appointmentsDb = await pool.query(appointmentQuery);

  await res.render('admin/appointment', {
     appointments: appointmentsDb.rows, edit_appointment_id: edit_app_id, errorMessage: errorMessage
  });
});

 app.post('/admin/appointment', async function (req, res) {
  let appointment= req.body;
 
  // TODO jel mos imat 2 appointment u isto vijeme ili da jedan appointment ulazi u drugi
  // const appointmentsDb = await pool.query('SELECT * FROM appointment WHERE (start_date, end_date) OVERLAPS ($1, $2)',
  //   [appointment.start_date_time, appointment.end_date_time]);
  
  // if(appointmentsDb && appointmentsDb.rows.length > 0) {
  //   res.redirect("/admin/appointment?errorMessage=Termin je zauzet");
  // } else {
    await pool.query(
     'INSERT into appointment (start_date_time, end_date_time) VALUES($1, $2)', 
     [appointment.start_date_time, appointment.end_date_time]);
   
    res.redirect("/admin/appointment");
  // }

});

 app.post('/admin/appointment/edit', async function (req, res) {
  let appointment= req.body;
  // TODO jel mos imat 2 appointment u isto vijeme ili da jedan appointment ulazi u drugi
  // const appointmentsDb = await pool.query('SELECT * FROM appointment WHERE (start_date, end_date) OVERLAPS ($1, $2)',
  //   [appointment.start_date_time, appointment.end_date_time]);
  
  // if(appointmentsDb && appointmentsDb.rows.length > 0) {
  //   res.redirect("/admin/appointment?errorMessage=Termin je zauzet");
  // } else {
  await pool.query(
   'UPDATE appointment SET start_date_time = $1, end_date_time = $2 WHERE appointment_id = $3', 
   [appointment.start_date_time, appointment.end_date_time, appointment.appointment_id]);
 
    res.redirect("/admin/appointment");
  // }
});
 
 app.post('/admin/appointment/delete', async function (req, res) {
   let appointment= req.body;
  
   await pool.query(
     'DELETE from appointment where appointment_id = $1', 
     [appointment.appointment_id]);
  
   res.redirect("/admin/appointment");
});


// gallery

app.get('/admin/gallery', async function (req, res) {
  let errorMessage = req.query.errorMessage ?? null; 
  const galleryQuery = 'SELECT * FROM gallery_items';
  const galleryDB = await pool.query(galleryQuery);


  await res.render('admin/admin-gallery', { gallery_items: galleryDB.rows, errorMessage: errorMessage });
});


app.post('/admin/gallery', async function (req, res) {
  let uploaded_file = req.files.image;
  // provjeri jel postoji uplaod file -- uploaded_file
  let upload_file_name = `${Date.now()}-${uploaded_file.name}`;
  if (!uploaded_file) {
    res.redirect("/admin/gallery?errorMessage=No file uploaded");
  } else {
     uploaded_file.mv('assets/images/galerija/' + upload_file_name, async function(err) {
      if(err) {
        res.redirect("/admin/gallery?errorMessage=Error uploading file");
      } else {
        await pool.query(
          'INSERT into gallery_items (path, title) VALUES($1, $2)', 
          ['/images/galerija/' + upload_file_name, req.body.title]);

        await res.redirect('/admin/gallery');
      }
    });
  }
});


app.post('/admin/gallery/delete', async function (req, res) {
  let image= req.body;
   
  let imageDb = await pool.query(
    'SELECT * from gallery_items where gallery_items_id = $1', 
    [image.image_id]);

    fs.unlink('assets' + imageDb.rows[0].path, async function(err) {
      if(err) {
        res.redirect("/admin/gallery?errorMessage=Error deleting file");
      } else { 
        await pool.query(
                'DELETE from gallery_items where gallery_items_id = $1', 
                [image.image_id]);
                
        res.redirect("/admin/gallery");
     }
  });
});


  //  ADMIN RESERVATIONS

app.get('/admin/reservation', async function (req, res) {
  let errorMessage = req.query.errorMessage ?? null; 
  const reservationQuery = `SELECT res.*, app.start_date_time, app.end_date_time FROM appointment app 
                              INNER JOIN reservation res ON app.appointment_id = res.appointment_id
                              WHERE res.status = 1`;
  const reservationsDb = await pool.query(reservationQuery);
  
  
    await res.render('admin/admin-reservations', { reservations: reservationsDb.rows, errorMessage: errorMessage });
});

  app.post('/admin/reservations/delete', async function (req, res) {
    let reservation = req.body;
   
    await pool.query(
      'DELETE from reservation where reservation_id = $1', 
      [reservation.reservation_id]);
   
    res.redirect("/admin/reservation");
   });

   app.post('/admin/reservations/change-status', async function (req, res) {
    let reservation= req.body;
   
    await pool.query(
      'UPDATE reservation SET status = 0 WHERE reservation_id = $1', 
      [reservation.reservation_id]);
   
    res.redirect("/admin/reservation");
   });


     //  ADMIN PRE-RESERVATIONS

  app.get('/admin/pre-reservation', async function (req, res) {
    let errorMessage = req.query.errorMessage ?? null; 
    const pre_reservationQuery = `SELECT res.*, app.start_date_time, app.end_date_time FROM appointment app 
                              INNER JOIN reservation res ON app.appointment_id = res.appointment_id
                              WHERE res.status = 0`;
    const pre_reservationsDb = await pool.query(pre_reservationQuery);
  
  
     await res.render('admin/admin-pre-reservations', { pre_reservations: pre_reservationsDb.rows, errorMessage: errorMessage });
  });

  app.post('/admin/pre-reservations/delete', async function (req, res) {
    let pre_reservation= req.body;
   
    await pool.query(
      'DELETE from reservation where reservation_id = $1', 
      [pre_reservation.reservation_id]);
   
    res.redirect("/admin/pre-reservation");
   });


   app.post('/admin/pre-reservations/change-status', async function (req, res) {
    let pre_reservation= req.body;
   
    await pool.query(
      'UPDATE reservation SET status = 1 WHERE reservation_id = $1', 
      [pre_reservation.reservation_id]);
   
    res.redirect("/admin/pre-reservation");
   });


  //  EDIT PRE/RESERVATIONS

  app.get('/admin/reservation/:reservation_id', async function (req, res) {
    let errorMessage = req.query.errorMessage ?? null; 
    let reservation_id = parseInt(req.params.reservation_id)
    const reservationQuery = `SELECT res.*, app.start_date_time, app.end_date_time FROM appointment app 
                              INNER JOIN reservation res ON app.appointment_id = res.appointment_id
                              WHERE res.reservation_id = $1`;
    const reservationsDb = await pool.query(reservationQuery,[reservation_id]);

    const appointmentQuery = `SELECT * FROM appointment`;
    const appointmentsDb = await pool.query(appointmentQuery);

  
  
     await res.render('admin/edit-reservation', { 
        reservation: reservationsDb.rows[0], appointments: appointmentsDb.rows, errorMessage: errorMessage});
  });

  app.post('/admin/reservation/:reservation_id', async function (req, res) {
    let reservation_id = parseInt(req.params.reservation_id);
    let reservation = req.body;

    await pool.query(
      `UPDATE reservation SET 
          firstname = $1, 
          lastname =$2, 
          email = $3, 
          phone_number = $4,
          date_of_birth = $5,
          allergies = $6, 
          comment =$7, 
          status = $8, 
          appointment_id = $9
        WHERE reservation_id = $10`, 
      [reservation.firstname, reservation.lastname, reservation.email,
       reservation.phone_number, reservation.date_of_birth, reservation.allergies,
       reservation.comment, reservation.status, reservation.appointment_id, reservation_id]);

       if (reservation.status == 0){
        res.redirect("/admin/pre-reservation")
       }
       else{
        res.redirect("/admin/reservation")
       }
    });

  // middleware for not found
  app.use('*', (req, res) => {
    res.redirect('/');
  });

//the server is listening on port 3000 for connections
app.listen(3000, function () {
  console.log('Example app listening on port 3000!') //node index.js
});