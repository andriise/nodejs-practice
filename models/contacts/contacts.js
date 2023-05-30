const HttpError = require("../../helpers");
// const { nanoid } = require("nanoid");
const Contact = require("../../schemas/contactsSchema");
const { ObjectId } = require("mongodb");
const objectid = new ObjectId();

const listContacts = async () => {
  const res = await Contact.find();
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
    _id: objectid,
    ...contactDetails,
  };
  // console.log(newContact);
  data.push(newContact);
   updateContact(newContact._id, newContact);
  return newContact;
};

const updateContact = async (id, body) => {
  // const { id } = req.find({_id: req.params.id});
  const result = await Contact.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!result) {
    throw HttpError(404, `Contact with ${id} not found`);
  }
  return result;
};

const updateContactById = async (id, contactData) => {
  const contacts = listContacts();
  const index = contacts.findIndex((item) => item.id === id);
  if (index === -1) return null;
  contacts[index] = { id, ...contactData };
  await updateContact(contacts);
  return contacts[index];
};

const updateFavourite = async (id, data) => {
  const result = await Contact.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, `Contact with ${id} not found`);
  }
  return result;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateContactById,
  updateFavourite,
};
