const { Router } = require("express");
const { addClient, getClient } = require("../controllers/client.controllers");


const router = Router();

router.post("/add",addClient)
router.get("/",getClient)
router.use;

module.exports = router;
