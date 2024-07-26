const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

router.post("/users", userController.createUser);
router.get("/users/:id", userController.getUserById);
router.patch("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
