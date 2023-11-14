const sqlite3=require('sqlite3').verbose();

let baza1= new sqlite3.Database('dogadjaji.db');
let baza2=new sqlite3.Database('neodobreneRecenzije.db');
let baza3=new sqlite3.Database('lokacije.db');
let baza4 = new sqlite3.Database('recenzije.db');


baza3.serialize(function(){
    baza3.run("CREATE TABLE lokacije (id INTEGER PRIMARY KEY, name TEXT,tip TEXT,pocetak_radnog_vremena INTEGER,kraj_radnog_vremena INTEGER,prikladnost_za_do_18 INTEGER,prikladnost_za_do_30 INTEGER,prikladnost_za_do_50 INTEGER,prikladnost_za_preko_50 INTEGER, hrana_cevapi INTEGER, hrana_tradicionalno INTEGER,hrana_restoran INTEGER, hrana_fast_food INTEGER, kafa INTEGER,pice INTEGER, provod INTEGER, lokacija TEXT, turisticki_znacaj INTEGER ,ocjena REAL)");
});

/*baza1.serialize(function(){
    baza1.run("CREATE TABLE dogadjaji (id INTEGER PRIMARY KEY, name TEXT, opis TEXT, datum DATE, picture TEXT)");
})*/
/*
baza2.serialize(function(){
    baza2.run("CREATE TABLE neodobreneRecenzije (id INTEGER PRIMARY KEY, lokacija_id INTEGER,ocjena INTEGER, tekst TEXT,slika TEXT, FOREIGN KEY(lokacija_id) REFERENCES lokacija(id))");


})*/
/*
baza4.serialize(function(){
    baza4.run("CREATE TABLE odobreneRecenzije (id INTEGER PRIMARY KEY, lokacija_id INTEGER,ocjena INTEGER, tekst TEXT,slika TEXT, FOREIGN KEY(lokacija_id) REFERENCES lokacija(id))");
})*/





