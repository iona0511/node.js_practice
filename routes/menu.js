const express = require('express');
const db = require(__dirname + '/../modules/mysql-connect');
const {
    toDateString,
    toDatetimeString,
} = require(__dirname + '/../modules/date-tools');
const moment = require('moment-timezone');

const router = express.Router(); // 建立 router 物件

const getListHandler = async (req, res)=>{
    let output = {
        perPage: 10,
        page: 1,
        totalRows: 0,
        totalPages: 0,
        code: 0,  // 辨識狀態
        error: '',
        query: {},
        rows: []
    };
    let page = +req.query.page || 1;

    let search = req.query.search || '';
    let beginDate = req.query.beginDate || '';
    let endDate = req.query.endDate || '';
    let where = ' WHERE 1 ';
    if(search){
        where += ` AND menu_categories LIKE ${ db.escape('%'+search+'%') } `;
        output.query.search = search;
        
    }
    if(beginDate){
        const mo = moment(beginDate);
        if(mo.isValid()){
            where += ` AND created_at >= '${mo.format('YYYY-MM-DD')}' `;
            output.query.beginDate = mo.format('YYYY-MM-DD');
        }
    }
    if(endDate){
        const mo = moment(endDate);
        if(mo.isValid()){
            where += ` AND created_at <= '${mo.format('YYYY-MM-DD')}' `;
            output.query.endDate = mo.format('YYYY-MM-DD');
        }
    }
    output.showTest = where;

    if(page<1) {
        output.code = 410;
        output.error = '頁碼太小';
        return output;
    }

    const sql01 = `SELECT COUNT(1) totalRows FROM menu ${where} `;
    const [[{totalRows}]] = await db.query(sql01);
    let totalPages = 0;
    if(totalRows) {
        totalPages = Math.ceil(totalRows/output.perPage);
        if(page>totalPages){
            output.totalPages = totalPages;
            output.code = 420;
            output.error = '頁碼太大';
            return output;
        }

        const sql02 = `SELECT * FROM menu ${where} ORDER BY menu_sid DESC LIMIT ${(page-1)*output.perPage}, ${output.perPage}`;
        const [r2] = await db.query(sql02);
        r2.forEach(el=> el.created_at = toDateString(el.created_at) );
        output.rows = r2;
    }
    output.code = 200;
    output = {...output, page, totalRows, totalPages};

    return output;
};
router.get('/add', async (req, res)=>{
        if(! req.session.admin){
                return res.redirect('/');
            }
        res.render('menu/add');
    });

    router.post('/add', async (req, res)=>{
        if(! req.session.admin){
            return res.json({success: false, error: '請先登入'});
        }
        // const schema = Joi.object({
        //     menu_categories: Joi.string(),
        //     menu_photo: Joi.string(),
        //     menu_name: Joi.string(),
        //     menu_kcal:Joi.string(),
        //     menu_price_m: Joi.string(),
        //     menu_nutrition: Joi.string(),  
        // });
    
        // 自訂訊息
        // https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages
    
        // console.log( schema.validate(req.body, {abortEarly: false}) );
        const sql = "INSERT INTO `menu`(`menu_categories`, `menu_photo`, `menu_name`, `menu_kcal`, `menu_price_m`, `menu_nutrition`, `created_at`) VALUES  (?, ?, ?, ?, ?, ?, NOW())";
        
        const {menu_categories,menu_photo, menu_name, menu_kcal, menu_price_m, menu_nutrition} = req.body;
        const [result] = await db.query(sql, [menu_categories,menu_photo, menu_name, menu_kcal, menu_price_m, menu_nutrition]);
        
        res.json(result);

    
    });

    router.use((req, res, next)=>{
            /*
        +    if(! req.session.admin){
        +        return res.redirect('/');
        +    }
        +    */
            next();
        });
        



router.get('/', async (req, res)=>{
    const output = await getListHandler(req, res);
    switch(output.code){
        case 410:
            return res.redirect(`?page=1`);
            break;
        case 420:
            return res.redirect(`?page=${output.totalPages}`);
            break;
    }
    if(! req.session.admin){
        res.render('menu/main-noadmin', output);
    } else {
        res.render('menu/main', output);
    }
    
});
router.get('/api', async (req, res)=>{
    const output = await getListHandler(req, res);
    res.json(output);
});








    











module.exports = router;


    // const schema = Joi.object({
    //         name: Joi.string()
    //             .min(3)
    //             .required()
    //             .label('姓名必填'),
    //         email: Joi.string()
    //             .email()
    //             .required(),
    //         mobile: Joi.string(),
    //         birthday: Joi.string(),
    //         address: Joi.string(),
    //     });
    
    //     res.json( schema.validate(req.body, {abortEarly: false}) );