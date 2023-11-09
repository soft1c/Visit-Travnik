const express = require("express")
const multer=require('multer')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const sqlite3=require('sqlite3');


let baza=new sqlite3.Database('dogadjaji.db');
let lokacije=new sqlite3.Database('lokacije.db');
let recenzije=new sqlite3.Database('recenzije.db');
const app = express()


app.use(express.static('public'));
app.use(session({secret:'your_secret_key',resave: false, saveUninitialized:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use('/css/public/fonts', express.static(path.join(__dirname, 'public', 'fonts')));

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/img');
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
    },
});

const upload=multer({storage:storage});

const server = app.listen(3000, () => { // create a HTTP server on port 3000
    console.log(`Express running → PORT ${server.address().port}`)
});


const adminUsername='user';
const adminPassword='password';
let adminLogged=false;

app.get('/recenzije',(req,res)=>{
    res.redirect("/recenzije.html");
});

app.get('/events',(req,res)=>{
    baza.all('SELECT * FROM dogadjaji',(err,rows)=>{
    if(err){
            console.error(err);
            res.status(500).send('Internal Server Error');
        }else{
            res.json(rows);
        }
    });
});


app.get('/public/img/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    res.sendFile(path.join(__dirname, 'public', 'img', imageName));
});



app.post('/public/img',upload.single('fileToUpload'),(req,res)=>{
    if(!req.file){
        return res.status(400).send("File nije uploadovan");
    }
    res.send("File uploadovan uspjesno");
})

app.get("/", (req, res) => {
    return res.sendFile("./PC.html")
})

/*app.post('/admin',(req,res)=>{
    const {username,password}=req.body;
    if(username===adminUsername && password === adminPassword){
        adminLogged=true;
        res.redirect('/admin.html');
    }else{
        res.redirect('/admin_login.html');
    }
})*/

app.post('/admin',(req,res)=>{
    const{username,password}=req.body;
    if(username===adminUsername && password===adminPassword){
        req.session.isAdmin=true;
        res.redirect('/admin.html');
    }else{
        res.redirect('/admin_login.html');
    }
});

app.get('/preporuke',(req,res)=>{
    res.sendFile(path.join(__dirname,'public', 'preporuka.html'));
})

app.get('/admin', (req, res) => {
    if(req.session.isAdmin){
        res.sendFile(path.join(__dirname,'public','admin.html'));
    }else{
        res.redirect('/admin_login.html');
    }
    if (true) {
        baza.all('SELECT * FROM dogadjaji', (err, events) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                const eventList = events.map(event => {
                    return `
                        <li>
                            <input type="radio" name="event_id" value="${event.id}">
                            ${event.name} (${event.date}) - <img src="${event.imageurl}" width="100" alt="Picture">
                        </li>
                    `;
                });
                res.sendFile(path.join(__dirname, 'public', 'admin.html'));
            }
        });
    } else {
        res.redirect('/admin_login.html');
    }
});
app.post('/add_event', upload.single('event_image'), (req, res) => {
    if (true) {
        const { event_name, event_description, event_date } = req.body;
        const imageurl = req.file ? `public/img/${req.file.filename}` : '';

        if (event_name && event_date && imageurl && event_description) {
            const query = 'INSERT INTO dogadjaji (name, opis, datum, picture) VALUES (?,?, ?, ?)';
            const values = [event_name, event_description, event_date, imageurl];

            baza.run(query, values, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.sendFile(path.join(__dirname,'public', 'admin.html'));
                }
            });
        } else {
            res.status(400).send('Bad Request: Event data missing');
        }
    } else {
        res.status(403).send('Forbidden: Admin access required');
    }
});

// New route for deleting events
app.post('/delete_event', (req, res) => {
    if (true) {
        const event_id = req.body.event_id;

        if (event_id) {
            const query = 'DELETE FROM dogadjaji WHERE id = ?';
            baza.run(query, [event_id], (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.sendFile(path.join(__dirname,'public', 'admin.html'));
                }
            });
        } else {
            res.status(400).send('Bad Request: Event ID missing');
        }
    } else {
        res.status(403).send('Forbidden: Admin access required');
    }
});

app.post('/add_place', (req, res) => {
    const { placeName, placeType, placeVrijemepocetak, placeVrijemekraj, do18, do30, do50, preko50, cevapi, tradicionalno, fastfood, kafa, pice, provod, lokacijalan, lokacijalat, znacaj } = req.body;

    lokacije.run(
        'INSERT INTO lokacije (name, tip, pocetak_radnog_vremena, kraj_radnog_vremena, prikladnost_za_do_18, prikladnost_za_do_30, prikladnost_za_do_50, prikladnost_za_preko_50, hrana_cevapi, hrana_tradicionalno, hrana_fast_food, kafa, pice, provod, lokacija_lang, lokacija_lat, turisticki_znacaj) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [placeName, placeType, placeVrijemepocetak, placeVrijemekraj, do18, do30, do50, preko50, cevapi, tradicionalno, fastfood, kafa, pice, provod, lokacijalan, lokacijalat, znacaj],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Error adding place' });
            } else {
                res.redirect('/admin.html'); // Redirect to the admin page after adding the place
            }
        }
    );
});


app.post('/submit_review', upload.single('reviewImage'), (req, res) => {
    const { reviewText, selectedRating, selectedLocationId } = req.body;
    const reviewImage = req.file ? `public/img/${req.file.filename}` : '';

    // Insert the review data into the database
    recenzije.run(
        'INSERT INTO neodobreneRecenzije (lokacija_id, ocjena, tekst, slika) VALUES (?, ?, ?, ?)',
        [selectedLocationId, selectedRating, reviewText, reviewImage],
        (err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Error adding review' });
            } else {
                console.log('Review added successfully');
                res.json({ message: 'Review added successfully' });
            }
        }
    );
});



app.post('/delete_location', (req, res) => {
    const locationIdsToDelete = req.body.location_ids;

    if (!locationIdsToDelete || locationIdsToDelete.length === 0) {
        res.status(400).send('Bad Request: Location IDs missing');
        return;
    }

    const placeholders = locationIdsToDelete.map(() => '?').join(',');
    const query = `DELETE FROM lokacije WHERE id IN (${placeholders})`;

    lokacije.run('BEGIN', (beginErr) => {
        if (beginErr) {
            console.error(beginErr);
            res.status(500).json({ error: 'Error beginning transaction' });
            return;
        }

        lokacije.run(query, locationIdsToDelete, (deleteErr) => {
            if (deleteErr) {
                console.error(deleteErr);
                lokacije.run('ROLLBACK', (rollbackErr) => {
                    if (rollbackErr) {
                        console.error(rollbackErr);
                        res.status(500).json({ error: 'Error rolling back transaction' });
                    } else {
                        res.status(500).json({ error: 'Error deleting location' });
                    }
                });
            } else {
                lokacije.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        console.error(commitErr);
                        res.status(500).json({ error: 'Error committing transaction' });
                    } else {
                        res.json({ message: 'Location deleted successfully' });
                    }
                });
            }
        });
    });
});




app.get('/places', (req,res)=>{
    lokacije.all('SELECT * FROM lokacije',(err,lokacije)=>{
        if(err){
            console.error(err);
            res.status(500).json({error:'Internal Server Error'});
        }else
            res.json({lokacije:lokacije});
    });
});

app.get('/top_locations_and_reviews', (req, res) => {
    const locationTypes = ['hrana', 'piće', 'historija', 'priroda', 'religija'];
    const topLocations = {};

    locationTypes.forEach(type => {
        lokacije.all(
            'SELECT * FROM lokacije WHERE tip = ?',
            [type],
            (err, locationRows) => {
                if (err) {
                    console.error(err);
                } else {
                    // Izračunaj prosječnu ocjenu za svaku lokaciju iz tabele recenzija
                    const locations = locationRows;
                    const locationIds = locations.map(location => location.id);

                    recenzije.all(
                        'SELECT lokacija_id, AVG(ocjena) AS avg_rating FROM neodobreneRecenzije WHERE lokacija_id =',
                        (err, ratingRows) => {
                            if (err) {
                                console.error(err);
                            } else {
                                // Stvori mapping lokacija prema prosječnim ocjenama
                                const locationRatings = {};
                                ratingRows.forEach(row => {
                                    locationRatings[row.lokacija_id] = row.avg_rating;
                                });

                                // Sortiraj lokacije po prosječnoj ocjeni i odaberi top 3
                                locations.sort((a, b) => {
                                    return (locationRatings[b.id] || 0) - (locationRatings[a.id] || 0);
                                });
                                topLocations[type] = locations.slice(0, 3);
                                if (Object.keys(topLocations).length === locationTypes.length) {
                                    res.json({ topLocations });
                                }
                            }
                        }
                    );
                }
            }
        );
    });
});


app.get("*", (req, res) => {
    return res.sendStatus(404)
})



