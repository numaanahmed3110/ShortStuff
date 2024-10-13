const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();

app.use(helmet());
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

// app.get("/url/:id", (req, res) => {
//   //todo:get short url by id
// });

// app.get("/:id", (req, res) => {
//   //todo:redirect to url
// });

// app.post("/url", (req, res) => {
//   //todo:create short url
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listning on port http://localhost${PORT}`);
});
