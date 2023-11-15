const express = require("express")
const multer=require('multer')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const sqlite3=require('sqlite3')
const async = require("async");


let baza=new sqlite3.Database('dogadjaji.db');
let lokacije=new sqlite3.Database('lokacije.db');
let recenzije=new sqlite3.Database('recenzije.db');
let neodobreneRecenzije=new sqlite3.Database('neodobreneRecenzije.db');
const app = express()


app.use(express.static('public'));
app.use(session({secret:'your_secret_key',resave: false, saveUninitialized:true}));
app.use(express.urlencoded({extended:true}));
app.use('/css/public/fonts', express.static(path.join(__dirname, 'public', 'fonts')));
app.use(express.json());
app.use(bodyParser.json());
const sampleData = [
    { name: 'Ćevapi', type: 'Hrana' },
    { name: 'Kafići', type: 'Pice' },
    { name: 'Fast Food', type: 'Hrana' },
    { name: 'Kafa', type: 'Pice' },
    { name: 'Stari Grad', type: 'Znamenitost' },
    { name: 'Tradicionalna hrana', type: 'Hrana' },
    { name: 'Restorani', type: 'Hrana' },
    { name: 'Priroda', type: 'Znamenitost' },
    { name: 'Zabava', type: 'Pice' },
    { name: 'Historijske Znamenitosti', type: 'Znamenitost' },
    { name: 'Vjerske Znamenitosti', type: 'Znamenitost' }
];

const tabela=[
    {name:'Ćevapi', type : 'hrana_cevapi'},
    {name:'FastFood', type:'hrana_fast_food'},
    {name:'Tradicionalno',type:'hrana_tradiocionalno'},
    {name:'Restorani',type:'hrana_restoran'}

];

const novaTabela=[
    {name:'tip1', type:['Ćevapi','Sok','Historija']},
    {name:'tip2', type:['FastFood','Kafa','Religija']},
    {name:'tip3', type:['Tradicionalno','Provod','Priroda']},
    {name:'tip4', type:['Restorani','Raja','Značaj']}
];


const pica=[
    {name:'Kafići',type:'pice'},
    {name:'Kafa',type:'kafa'},
    {name:'Zabava', type:'provod'}
];

const znamenitosti=[
    {name:'Priroda',type:'priroda'},
    {name:'Historijske Znamenitosti',type:'historija'},
    {name:'Vjerske Znamenitosti',type:'vjera'}
];

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

function dajLokacije(tip, callback){
    lokacije.all('SELECT * FROM lokacije WHERE tip = ?',
        [tip],(err,rows)=>{
        if(err){
            return callback(err,null);
        }else{
            callback(null,rows);
        }
        })
}


async function dajNajboljiRestoran(lokacije, dob, vrijeme_dolaska, vrijeme_odlaska, tipovi) {
    let najbolji = [];

    if (!Array.isArray(tipovi)) {
        tipovi = [tipovi];
    }

    if (!Array.isArray(lokacije)) {
        lokacije = [lokacije];
    }

    console.log("Ovo su tipovi: ", tipovi);

    lokacije.forEach(lokacija => {
        let rezultat = 0;

        tipovi.forEach(tip => {
            // Pronađi odgovarajući red u tabeli
            const korelacija = novaTabela.find(item => item.type.includes(tip));

            if (korelacija) {
                const atribut = korelacija.name;
                // Dodaj ocjenu na osnovu tipa
                rezultat += lokacija[atribut];
            } else {
                console.log(`Nije pronađena korelacija za tip: ${tip}`);
            }
        });

        if (vrijeme_dolaska > lokacija.kraj_radnog_vremena || vrijeme_odlaska < lokacija.pocetak_radnog_vremena) {
            rezultat = 0;
        }

        rezultat += lokacija.ocjena;

        najbolji.push({ lokacija, rezultat });
    });

    najbolji.sort((a, b) => b.rezultat - a.rezultat);

    najbolji = najbolji.slice(0, 3);

    najbolji.forEach(item => {
        console.log(`Lokacija: ${item.lokacija.name}, Rezultat: ${item.rezultat}`);
    });

    return najbolji;
}
async function dajNajboljuZnamenitost(lokacije, dob, vrijeme_dolaska,vrijeme_odlaska,tipovi){
    let najbolji = [];

    if (!Array.isArray(tipovi)) {
        tipovi = [tipovi];
    }

    if (!Array.isArray(lokacije)) {
        lokacije = [lokacije];
    }

    console.log("Ovo su tipovi: ", tipovi);

    lokacije.forEach(lokacija => {
        console.log(lokacija);
        let rezultat = 0;

        tipovi.forEach(tip => {
            // Pronađi odgovarajući red u tabeli
            const korelacija = novaTabela.find(item => item.type.includes(tip));

            if (korelacija) {
                const atribut = korelacija.name;
                // Dodaj ocjenu na osnovu tipa
                rezultat += lokacija[atribut];
            } else {
                console.log(`Nije pronađena korelacija za tip: ${tip}`);
            }
        });

        if (vrijeme_dolaska > lokacija.kraj_radnog_vremena || vrijeme_odlaska < lokacija.pocetak_radnog_vremena) {
            rezultat = 0;
        }

        rezultat += lokacija.ocjena;

        najbolji.push({ lokacija, rezultat });
    });

    najbolji.sort((a, b) => b.rezultat - a.rezultat);

    najbolji = najbolji.slice(0, 3);

    najbolji.forEach(item => {
        console.log(`Lokacija: ${item.lokacija.name}, Rezultat: ${item.rezultat}`);
    });

    return najbolji;
}
async function dajNajboljiKafic(lokacije, dob, vrijeme_dolaska, vrijeme_odlaska, tipovi) {
    let najbolji = [];

    if (!Array.isArray(tipovi)) {
        tipovi = [tipovi];
    }

    if (!Array.isArray(lokacije)) {
        lokacije = [lokacije];
    }

    console.log("Ovo su tipovi: ", tipovi);

    lokacije.forEach(lokacija => {
        let rezultat = 0;

        tipovi.forEach(tip => {
            // Pronađi odgovarajući red u tabeli
            const korelacija = novaTabela.find(item => item.type.includes(tip));

            if (korelacija) {
                const atribut = korelacija.name;
                // Dodaj ocjenu na osnovu tipa
                rezultat += lokacija[atribut];
            } else {
                console.log(`Nije pronađena korelacija za tip: ${tip}`);
            }
        });

        if (vrijeme_dolaska > lokacija.kraj_radnog_vremena || vrijeme_odlaska < lokacija.pocetak_radnog_vremena) {
            rezultat = 0;
        }

        rezultat += lokacija.ocjena;

        najbolji.push({ lokacija, rezultat });
    });

    najbolji.sort((a, b) => b.rezultat - a.rezultat);

    najbolji = najbolji.slice(0, 3);

    najbolji.forEach(item => {
        console.log(`Lokacija: ${item.lokacija.name}, Rezultat: ${item.rezultat}`);
    });

    return najbolji;
}


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
    const { placeName, placeType, pocetakRadnogVremena, krajRadnogVremena, prikladnost_za_do_18, prikladnost_za_do_30, prikladnost_za_do_50, prikladnost_za_preko_50, tip1,tip2,tip3,tip4, lokacija, turisticki_znacaj } = req.body;
    console.log(req.body);
    let ocjena_pocetna=0;
    console.log(lokacija);
    lokacije.run(
        'INSERT INTO lokacije (name, tip, pocetak_radnog_vremena, kraj_radnog_vremena, prikladnost_za_do_18, prikladnost_za_do_30, prikladnost_za_do_50, prikladnost_za_preko_50, tip1,tip2,tip3,tip4, lokacija, turisticki_znacaj, ocjena) VALUES (?, ?, ?, ?, ?, ?, ?,? ,?, ?, ?, ?, ?, ?,?)',
        [placeName, placeType, pocetakRadnogVremena, krajRadnogVremena, prikladnost_za_do_18, prikladnost_za_do_30, prikladnost_za_do_50, prikladnost_za_preko_50, tip1,tip2,tip3,tip4, lokacija, turisticki_znacaj,ocjena_pocetna],
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
    console.log(reviewText);
    console.log(selectedRating);
    console.log(selectedLocationId);
    console.log(reviewImage);

    // Insert the review data into the database
    neodobreneRecenzije.run(
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



async function getRecenzijaById(recenzijaId) {
    const sqlDohvatiRecenziju = "SELECT lokacija_id, ocjena, tekst, slika FROM neodobreneRecenzije WHERE id = ?";

    return new Promise((resolve, reject) => {
        neodobreneRecenzije.get(sqlDohvatiRecenziju, [recenzijaId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}
app.get('/neodobreneRecenzije',(req,res)=>{
    neodobreneRecenzije.all('SELECT * FROM neodobreneRecenzije', (err,rows)=>{
        if(err){
            console.error(err);
            res.status(500).send('Internal Server Error');
        }else{
            res.json(rows);
        }
    })
});

app.post('/odobri_recenziju/:id', async (req, res) => {
    let recenzijaId=req.params.id;
    console.log('Pokušavam dohvatiti recenziju za ID:', recenzijaId);
    const recenzija = await getRecenzijaById(recenzijaId);
    console.log('Uspješno dohvaćena recenzija:', recenzija);

    if (!recenzija) {
        return res.status(404).json({ error: 'Recenzija nije pronađena.' });
    }

    const { lokacija_id, ocjena, tekst, slika } = recenzija;
    console.log('Lokacija ID:', lokacija_id);
    console.log('Ocjena:', ocjena);
    console.log('Tekst:', tekst);
    console.log('Slika:', slika);


    const sqlOdobriRecenziju = "INSERT INTO odobreneRecenzije (lokacija_id, ocjena, tekst, slika) VALUES (?, ?, ?, ?)";
    const sqlObrisiRecenziju = "DELETE FROM neodobreneRecenzije WHERE id = ?";

    try {
        await recenzije.run(sqlOdobriRecenziju, [lokacija_id, ocjena, tekst, slika]);
        await neodobreneRecenzije.run(sqlObrisiRecenziju, [recenzijaId]);
        res.status(200).json({ message: 'Recenzija je odobrena.' });
    } catch (error) {
        console.error('Greška pri odobravanju recenzije:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/obrisi_recenziju/:recenzijaId', (req, res) => {
    const recenzijaId = req.params.recenzijaId;

    // Obriši recenziju iz neodobreneRecenzije
    const queryDelete = 'DELETE FROM neodobreneRecenzije WHERE id = ?';
    neodobreneRecenzije.run(queryDelete, [recenzijaId], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            res.json({ success: true, message: 'Recenzija je obrisana.' });
        }
    });
});

async function dohvatiSveLokacije() {
    return new Promise((resolve, reject) => {
        lokacije.all('SELECT * FROM lokacije', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function izracunajProsjecnuOcjenu(lokacijaId) {
    return new Promise((resolve, reject) => {
        recenzije.get('SELECT AVG(ocjena) AS prosjecna_ocjena FROM odobreneRecenzije WHERE lokacija_id = ?', [lokacijaId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const prosjecnaOcjena = row.prosjecna_ocjena || 0;
                resolve(prosjecnaOcjena);
            }
        });
    });
}

async function azurirajOcenuLokacije(lokacijaId, novaOcjena) {
    return new Promise((resolve, reject) => {
        lokacije.run('UPDATE lokacije SET ocjena = ? WHERE id = ?', [novaOcjena, lokacijaId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
app.post('/azuriraj_ocjene', async (req, res) => {
    try {
        const lokacije = await dohvatiSveLokacije();

        for (const lokacija of lokacije) {
            const prosjecnaOcjena = await izracunajProsjecnuOcjenu(lokacija.id);
            console.log(`Prosjecna ocjena za lokaciju ${lokacija.id}: ${prosjecnaOcjena}`);

            // Ažuriraj ocjenu u tabeli lokacija
            await azurirajOcenuLokacije(lokacija.id, prosjecnaOcjena);
        }

        console.log('Ocjene su uspješno ažurirane.');
        res.json({ success: true, message: 'Ocjene su uspješno ažurirane.' });
    } catch (error) {
        console.error('Greška pri ažuriranju ocjena:', error);
        res.status(500).json({ success: false, error: 'Greška pri ažuriranju ocjena.' });
    }
});

function getCategory(preference) {
    const foundItem = sampleData.find(item => item.name === preference);
    return foundItem ? foundItem.type : null;
}


app.post('/search-results', async (req, res) => {
    console.log(req.body);
    console.log(req.query);

    let preferencije = req.body.preference;
    console.log(preferencije);
    let vrijeme_odlaska = req.body.number2;
    let vrijeme_dolaska = req.body.number1;
    let dob = req.body.age;
    console.log(dob, vrijeme_dolaska, vrijeme_odlaska);

    if (typeof preferencije === 'string') {
        preferencije = [preferencije];
    }
    console.log(preferencije);

    const kategorije = [...new Set(preferencije.map(pref => getCategory(pref)))];
    let rezultati = {};

    // Kreiramo niz obećanja (Promise) koje čekamo
    const promises = kategorije.map(async (kategorija) => {
        console.log(kategorija);
        // Pronalaženje odgovarajućeg objekta u mapi sampleData
        //const foundItem = sampleData.find(item => item.name === kategorija);

        // Provjera da li je pronađen odgovarajući objekat
        if (kategorija) {
            console.log(kategorija);
            // Ispisivanje imena preferencije i njenog tipa
            return new Promise((resolve, reject) => {
                dajLokacije(kategorija, async (err, lokacije) => {
                    if (err) {
                        console.log('Nije dobro nesto');
                        reject(err);
                    } else {
                        console.log("Ovdje sam");
                        if (kategorija === 'Znamenitost') {
                            const znamenitostiPreferencije = preferencije.filter(pref => znamenitosti.some(z => z.name === pref));
                            rezultati[kategorija] = await dajNajboljuZnamenitost(lokacije, dob, vrijeme_dolaska, vrijeme_odlaska, znamenitostiPreferencije);
                            console.log("U petlji ", rezultati[kategorija]);
                            resolve();
                        } else if (kategorija === 'Pice') {
                            const drinksPreferencije = preferencije.filter(pref => pica.some(p => p.name === pref));
                            rezultati[kategorija] = await dajNajboljiKafic(lokacije, dob, vrijeme_dolaska, vrijeme_odlaska, drinksPreferencije);
                            console.log("U petlji ", rezultati[kategorija]);
                            resolve();
                        } else if (kategorija === 'Hrana') {
                            const restaurantPreferencije = preferencije.filter(pref => tabela.some(t => t.name === pref));
                            rezultati[kategorija] = await dajNajboljiRestoran(lokacije, dob, vrijeme_dolaska, vrijeme_odlaska, restaurantPreferencije);
                            console.log("U petlji ", rezultati[kategorija]);
                            resolve();
                        } else {
                            console.log("jebi ga");
                            resolve();
                        }
                    }
                });
            });
        }
    });

    try {
        // Čekamo na sve asinkrone pozive prije nego nastavimo
        await Promise.all(promises);

        // Slanje odgovora
        console.log("Poslao: ",rezultati.Hrana);
        res.json({ status: 'success', message: 'Data received successfully.', results: rezultati });
    } catch (error) {
        console.error("Greška prilikom čekanja na asinkrone pozive:", error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

app.get('/en',(req,res)=>{
    res.sendFile(path.join(__dirname,'public', 'index-en.html'));
})

app.get('/result-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'result-page.html'));
});

app.get("*", (req, res) => {
    return res.sendStatus(404)
})



