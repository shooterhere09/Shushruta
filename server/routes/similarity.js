const express = require("express");
const router = express.Router();
const similarityController = require("../controller/similarity");

router.post("/get-ranked-organ-reports", similarityController.getRankedOrganReports);

module.exports = router;