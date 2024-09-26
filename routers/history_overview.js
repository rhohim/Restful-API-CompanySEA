const express = require('express')
const router = express.Router() 
const historyoverviewcontroller = require("../controllers/historyoverviewController")
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .get(historyoverviewcontroller.getAllhistory_overview)
    .post(upload.fields([{ name: 'image', maxCount: 1 }]), historyoverviewcontroller.posthistory_overview)
    .delete(historyoverviewcontroller.deletehistory_overview)

router.route('/:id')
    .get(historyoverviewcontroller.gethistory_overviewbyID)
    .delete(historyoverviewcontroller.deletehistory_overviewbyID)
    .put(upload.fields([{ name: 'image', maxCount: 1 }]), historyoverviewcontroller.puthistory_overview)

 module.exports = router