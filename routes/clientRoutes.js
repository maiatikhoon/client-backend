const express = require("express");

const router = express.Router();

const multer = require("multer");

const {
  getAllClient,
  createClient,
  updateClient,
  deleteClient,
} = require("../controller/clientController");

const { clientAuth } = require("../middleware/clientAuth");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cpUpload = upload.fields([
  { name: "logo", maxcount: 1 },
  { name: "name" },
  { name: "code" },
  { name: "email" },
  { name: "contact" },
  { name: "landline_number" },
  { name: "website_link" },
  { name: "address" },
  { name: "state" },
  { name: "city" },
  { name: "pincode" },
  { name: "organisation_type" },
  { name: "userId" },
]);

router.get("/", clientAuth, getAllClient);

router.post("/addclient", clientAuth, cpUpload, createClient);

router.put("/updateclient/:code", clientAuth, cpUpload, updateClient);

router.delete("/delete/:code", clientAuth, deleteClient);

module.exports = router;
