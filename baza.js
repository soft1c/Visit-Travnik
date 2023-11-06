const sqlite3=require('sqlite3').verbose();

let baza1= new sqlite3.Database('dogadjaji.db');
let baza2=new sqlite3.Database('recenzije.db');
let baza3=new sqlite3.Database('lokacije.db');


baza3.serialize(function(){
    baza3.run("CREATE TABLE lokacije (id INTEGER PRIMARY KEY, name TEXT,tip TEXT)");

});





