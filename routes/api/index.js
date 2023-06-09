const express = require("express");
const router = express.Router();

router.use('/users', require('./auth'))
router.use('/contacts', require('./contacts'))

module.exports = router;
