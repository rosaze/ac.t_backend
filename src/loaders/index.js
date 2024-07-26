const express = require("express");
const connectDB = require("../config/database");

const startServer = async () => {
  const app = express();

  app.use(express.json());

  await connectDB();

  app.use("/api", require("../routes/userRoutes"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

module.exports = startServer;
