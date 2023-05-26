const mongoose = require("mongoose");
const app = require("./app");
const { DB_HOST, PORT } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
