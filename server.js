const express = require("express");

const app = express();

const port = process.env.PORT || 3000;
const mongoose = require("mongoose");

const cors = require("cors");

require("dotenv").config();
app.use(express.json());

app.use(cors());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("db connected ");
}

const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");

app.use("/api/user", userRoutes);
app.use("/api/client", clientRoutes);

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
