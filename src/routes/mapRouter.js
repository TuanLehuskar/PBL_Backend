const express = require("express");

const router = express.Router();
const { getAllData } = require("../controllers/dataController");

router.route("/map").get(getAllUsers);

module.exports = router;
