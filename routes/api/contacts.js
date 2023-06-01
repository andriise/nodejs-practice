const express = require("express");
const validateBody = require("../../middlewars/validateBody");
const contactsSchema = require("../../schemas/contactsSchema");
const Contact = require("../../models/contacts/contacts");
const router = express.Router();

const {
  updateFavourite,
  updateContactById,
  removeContact,
} = require("../../controllers/contacts");

router.get("/", async (req, res, next) => {
  const result = await Contact.find({});
  return res.json(result);
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const result = await Contact.findOne({ _id: id });
  return res.json(result);
});

router.post("/", validateBody(contactsSchema), async (req, res, next) => {
  const result = await Contact.create(req.body);
  return res.json(result);
});

router.delete("/:id", removeContact);

router.put("/:id", validateBody(contactsSchema), updateContactById);

router.patch("/:id/favourite", updateFavourite);

// async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     console.log(id);
//     const body = req.body;
//     const result = await updateFavourite(id, body);
//     const { error } = contactsSchema.validate(body);
//     if (error) {
//       throw HttpError(400, "missing field favorite");
//     }
//     res.json(result);
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = router;
