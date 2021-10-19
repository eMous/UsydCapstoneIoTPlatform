const express = require("express");
const path = require("path");
const app = express();

// A replacement for body-parser,
// to parse JSON bodies
app.use(express.json());

// To use the static files from the React app build
app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// We listen to the defined port in the environment variable,
// otherwise we default to port 8080
app.listen(process.env.PORT || 8080);
