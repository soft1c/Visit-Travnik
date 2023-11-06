const sqlite3=require('sqlite3').verbose();

const baza1= new sqlite3.Database('dogadjaji.db');
const baza2=new sqlite3.Database('recenzije.db');
const baza3=new sqlite3.Database('lokacije.db');


baza1.serialize(function(){
    baza1.run("CREATE TABLE events (id INTEGER PRIMARY KEY, name TEXT,date DATE, imageurl TEXT)");
    let stmt=baza1.prepare("INSERT INTO events (name,date,imageurl) VALUES (?,?,?)");
    stmt.run("Brucosijada","2023-11-05","public/img/p1.jpg");
    stmt.run("Ispit iz matematike","2023-11-13","public/img/p1.jpg");
    stmt.finalize();
});





