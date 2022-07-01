require("dotenv").config();
const express = require("express");
const multer = require('multer');
// const upload = multer({dest: 'tmp-uploads'});
const upload = require(__dirname + '/modules/upload-images');
const session = require('express-session');
const moment = require('moment-timezone');
const axios = require('axios');
const bcrypt = require('bcryptjs');


// 把session 存入SQL
const db = require(__dirname + '/modules/mysql-connect');
const MysqlStore = require('express-mysql-session')(session);
const sessionStore = new MysqlStore({}, db);

const app = express();

app.set("view engine", "ejs");
app.set('case sensitive routing', true);

const corsOptions = {
    credentials: true,
    origin: (origin, cb)=>{
        console.log({origin});
        cb(null, true);
    }
};

// Top-level middlewares
const cors = require('cors');
app.use(cors(corsOptions));
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'dkfdl85493igdfigj9457394573irherer',
    store:sessionStore,
    cookie:{
        maxAge:1800000,
    }
}));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use((req, res, next)=>{
    // res.locals.shinder = '哈囉';

    // template helper functions
    // res.locals.toDateString = toDateString;
    // res.locals.toDatetimeString = toDatetimeString;
    res.locals.session = req.session;

    next();
});







app.get('/try-qs', (req, res)=>{
    res.json(req.query);
});

app.get('/try-json', (req, res)=>{
    const data =  require(__dirname + '/data/data01')   
    console.log(data)
  
    res.locals.rows = data;
    res.render('try-json');
    
    ;
});


app.get('/try-moment', (req, res)=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const m1 = moment();
    const m2 = moment('2022-02-28');

    res.json({
        m1: m1.format(fm),
        m1a: m1.tz('Europe/London').format(fm),
        m2: m2.format(fm),
        m2a: m2.tz('Europe/London').format(fm),
    })
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

app.get('/try-session', (req, res)=>{
    req.session.my_var = req.session.my_var || 0;
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session: req.session,
    });
})


app.use('/menu', require(__dirname + '/routes/menu'));


app.get("/", (req, res) => {
    res.render("main", { name: "Shinder" });
});


app.get('/yahoo', async (req, res)=>{
    axios.get('https://tw.yahoo.com/')
    .then(function (response) {
      // handle success
        console.log(response);
        res.send(response.data);
    })
});

app.route('/login')
    .get(async (req, res)=>{
        res.render('login');
    })
    .post(async (req, res)=>{
        const output = {
            success: false,
            error: '',
            code: 0,
        };
        const sql = "SELECT * FROM admins WHERE account=?";
        const [r1] = await db.query(sql, [req.body.account]);

        if(! r1.length){
            // 帳號錯誤
            output.code = 401;
            output.error = '帳密錯誤'
            return res.json(output)
        }
        //const row = r1[0];

        output.success = await bcrypt.compare(req.body.password, r1[0].pass_hash);
        // console.log(await bcrypt.compare(req.body.password, r1[0].pass_hash));
        if(! output.success){
            // 密碼錯誤
            output.code = 402;
            output.error = '帳密錯誤'
                    } else {
                            req.session.admin = {
                                sid: r1[0].sid,
                                account: r1[0].account,
                            };
        }

        res.json(output);
    });

    app.get("/logout", (req, res) => {
        delete req.session.admin;
        res.redirect("/");
    });

// ------- static folder -----------
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use("/joi", express.static("node_modules/joi/dist"));

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
