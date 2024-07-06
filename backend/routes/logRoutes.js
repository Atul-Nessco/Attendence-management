const express = require('express');
const { someLogControllerMethod } = require('../controllers/logController');

const router = express.Router();

console.log(someLogControllerMethod); // Should not be undefined

router.post('/log', someLogControllerMethod);

module.exports = router;
