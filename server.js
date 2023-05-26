const mongoose = require("mongoose");
const app = require("./app");

// sUorejdQhpibjd9B

const DB_HOST =
  "mongodb+srv://Andrii:sUorejdQhpibjd9B@cluster0.dzdy5b0.mongodb.net/db-contacts?retryWrites=true&w=majority";

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(3000);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
