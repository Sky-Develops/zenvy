
const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to ZENVY API!",
    status: "success",
  });
});

// Server hanya dijalankan jika file ini dieksekusi langsung.
if (require.main === module) {
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`ZENVY API is running on port ${port}`);
  });
}

module.exports = app;
