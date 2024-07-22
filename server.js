const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const authRouter = require("./routes/auth");
const surveyRouter = require("./routes/survey");
const recommendationRouter = require("./routes/recommendation");

app.use("/api/auth", authRouter);
app.use("/api/survey", surveyRouter);
app.use("/api/recommendations", recommendationRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
