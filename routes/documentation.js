var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
/* GET home page. */
router.get('/doc', function(req, res, next) {
  res.sendFile(path.resolve(path.dirname(__dirname), './views/documentation.html'));
});

module.exports = router;
