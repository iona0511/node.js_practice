require("dotenv").config();
const express = require("express");
const multer = require('multer');
// const upload = multer({dest: 'tmp-uploads'});
const upload = require(__dirname + '/modules/upload-images');

const app = express();

app.set("view engine", "ejs");
app.set('case sensitive routing', true); // 區分大小寫

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

app.post('/try-uploads', upload.array('photos'), (req, res)=>{
    res.json(req.files);
});


app.get('/try-params1/:action/:id', (req, res)=>{
    res.json({code:2, params: req.params});
})
app.get('/try-params1/:action', (req, res)=>{
    res.json({code:3, params: req.params});
})
app.get('/try-params1/:action?/:id?', (req, res)=>{
    res.json({code:1, params: req.params});
});

app.get(/^\/hi\/?/i, (req, res)=>{
    res.send({url: req.url});
});
app.get(['/aaa', '/bbb'], (req, res)=>{
    res.send({url: req.url, code:'array'});
});

const adminsRouter = require(__dirname + '/routes/admins');
// prefix 前綴路徑
app.use('/admins', adminsRouter);
app.use(adminsRouter);


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
