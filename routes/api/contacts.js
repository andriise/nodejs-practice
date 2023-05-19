const express = require("express");

const router = express.Router();

const contactsService = require("../../models/contacts");

router.get("/", async (req, res, next) => {
  try {
    const result = await contactsService.listContacts();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await contactsService.getContactById(id);
    if (!result) {
      const error = new Error("Not found");
      error.status = 404;
      throw error;
    }
    res.json(result);
  } catch (error) {
    const { status = 500, message = "Server error" } = error;
    res.status(status).json({
      message,
    });
  }
});

router.post("/", async (req, res, next) => {
  try {
    res.json({ message: "template message" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const result = await contactsService.removeContact();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    res.json({ message: "template message" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
