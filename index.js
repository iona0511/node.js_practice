require("dotenv").config();
const express = require("express");
const multer = require('multer');
const upload = multer({dest: 'tmp-uploads'});

const app = express();

app.set("view engine", "ejs");

// Top-level middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.get('/try-qs', (req, res)=>{
    res.json(req.query);
});

// middleware: 中介軟體 (function)
// const bodyParser = express.urlencoded({extended: false});
app.post('/try-post', (req, res)=>{
    res.json(req.body);
});

app.route('/try-post-form')
    .get((req, res)=>{
        res.render('try-post-form');
    })
    .post((req, res)=>{
        const {email, password} = req.body;
        res.render('try-post-form', {email, password});
    });

app.post('/try-upload', upload.single('avatar'), (req, res)=>{
    res.json(req.file);
});
/*
app.get('/try-post-form', (req, res)=>{
});
app.post('/try-post-form', (req, res)=>{
});
*/

app.get("/", (req, res) => {
    res.render("main", { name: "Shinder" });
});

// ------- static folder -----------
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));

// ------- 404 -----------
app.use((req, res) => {
    res.send(`<h2>找不到頁面 404</h2>
    <img src="/imgs/6c0519f6e0e0d42e458daef829c74ae4.jpg" alt="" width="300px" />
    `);
});

app.listen(process.env.PORT, () => {
    console.log(`server started: ${process.env.PORT}`);
    console.log({ NODE_ENV: process.env.NODE_ENV });
});
