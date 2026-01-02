import Joi from "joi";

const id = Joi.number().integer().min(1);
const title = Joi.string().min(3).max(200);
const content = Joi.string().min(1);
const isArchived = Joi.boolean();
const search = Joi.string().allow("");

export const createNoteSchema = Joi.object({
  title: title.required(),
  content: content.required(),
  isArchived: isArchived.optional(),
});

export const updateNoteSchema = Joi.object({
  title: title,
  content: content,
  isArchived: isArchived,
});

export const getNoteSchema = Joi.object({
  id: id.required(),
});

export const queryNoteSchema = Joi.object({
  search: search,
  isArchived: isArchived,
});
