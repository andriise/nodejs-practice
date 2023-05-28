const path = require("path");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const HttpError = require("../../helpers");

const contactsSchema = require("../../schemas/contactsSchema");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const Contact = mongoose.model("Contact", contactsSchema);
  const res = await Contact.find();
  console.log(res);
  return res;
};

const getContactById = async (contactId) => {
  const data = await listContacts();
  const result = data.find((item) => item.id === contactId);
  return result || null;
};

const removeContact = async (contactId) => {
  const data = await listContacts();
  const index = data.findIndex((item) => item.id === contactId);
  if (index === -1) {
    return null;
  }
  const [result] = data.splice(index, 1);
  await updateContact(data);
  return result;
};

const addContact = async (contactDetails) => {
  const data = await listContacts();
  const newContact = {
    id: nanoid(),
    ...contactDetails,
  };
  data.push(newContact);
  await updateContact(data);
  return newContact;
};

const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await contactsSchema.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, `Contact with ${contactId} not found`);
  }
  res.json(result);
};

const updateContactById = async (id, contactData) => {
  const contacts = listContacts();
  const index = contacts.findIndex((item) => item.id === id);
  if (index === -1) return null;
  contacts[index] = { id, ...contactData };
  await updateContact(contacts);
  return contacts[index];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateContactById,
};
