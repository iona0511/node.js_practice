const express = require('express');

const router = express.Router(); // 建立 router 物件

router.get('/r1/:action?/:id?', (req, res)=>{
    res.json({
        url: req.url,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        params: req.params,
        code: 'admins.js',
    });
});
router.get('/r2/:action?/:id?', (req, res)=>{
    res.json({
        url: req.url,
        params: req.params,
        code: 'admins.js',
    });
});

module.exports = router;

