const express = require("express");

const app = express();

const port = process.env.PORT || 3000;
const mongoose = require("mongoose");

require("dotenv").config();
app.use(express.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("db connected ");
}

const userRoutes = require("./routes/userRoutes");

app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
