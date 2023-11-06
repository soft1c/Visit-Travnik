const express = require("express")
const multer=require('multer')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const sqlite3=require('sqlite3');


const baza=new sqlite3.Database('dogadjaji.db');
const app = express()
app.use(express.static('public'));

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads');
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
    },
});

const upload=multer({storage:storage});



const server = app.listen(3000, () => { // create a HTTP server on port 3000
    console.log(`Express running → PORT ${server.address().port}`)
});



app.use(session({secret:'your_secret_key',resave: false, saveUninitialized:true}));

app.use(bodyParser.urlencoded({extended:true}));

const adminUsername='user';
const adminPassword='password';
let adminLogged=false;



app.get('/recenzije',(req,res)=>{
    res.sendFile("./recenzije.html");
});

app.get('/events',(req,res)=>{
    baza.all('SELECT * FROM events',(err,rows)=>{
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

app.use('/css/public/fonts', express.static(path.join(__dirname, 'public', 'fonts')));

app.post('/uploads',upload.single('fileToUpload'),(req,res)=>{
    if(!req.file){
        return res.status(400).send("File nije uploadovan");
    }
    res.send("File uploadovan uspjesno");
})

app.get("/", (req, res) => {
    return res.sendFile("./PC.html")
})

app.post('/admin',(req,res)=>{
    const {username,password}=req.body;
    if(username===adminUsername && password === adminPassword){
        adminLogged=true;
        res.redirect('/admin.html');
    }else{
        res.redirect('/admin_login.html');
    }
})

app.get('/admin', (req,res)=>{
    if(adminLogged){
        res.sendFile("./admin.html");
    }else{
        res.redirect('./admin_login.html');
    }
})

app.get("*", (req, res) => {
    return res.sendStatus(404)
})



