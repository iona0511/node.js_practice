const express = require('express');
const db = require(__dirname + '/../modules/mysql-connect');

const {
        toDateString,
        toDatetimeString,
    } = require(__dirname + '/../modules/date-tools');

const router = express.Router(); // 建立 router 物件

router.get('/', async (req, res)=>{
    let output = {
        perPage: 10,
        page: 1,
        totalRows: 0,
        totalPages: 0,
        rows: []
    };
    let page = +req.query.page || 1;
    if(page<1){
        return res.redirect('?page=1');
    }



    const sql01 = "SELECT COUNT(1) totalRows FROM menu";
    const [[{totalRows}]] = await db.query(sql01);
    let totalPages = 0;
    if(totalRows) {
        totalPages = Math.ceil(totalRows/output.perPage);
        if(page>totalPages){
            return res.redirect(`?page=${totalPages}`);
        }

        const sql02 = `SELECT * FROM menu LIMIT ${(page-1)*output.perPage}, ${output.perPage}`;
        const [r2] = await db.query(sql02);
        r2.forEach(el=> el.created_at = toDatetimeString(el.created_at) );

        output.rows = r2;
    }

    output = {...output, page, totalRows, totalPages};

    res.render('menu/main', output);
});

module.exports = router;