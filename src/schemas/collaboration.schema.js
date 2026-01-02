import Joi from "joi";

const noteId = Joi.number().integer().min(1);
const userId = Joi.number().integer().min(1);
const email = Joi.string().email();
const permission = Joi.string().valid("VIEWER", "EDITOR");

export const addCollaboratorSchema = Joi.object({
  email: email.required(),
  permission: permission.required(),
});

export const updatePermissionSchema = Joi.object({
  permission: permission.required(),
});

export const getCollabSchema = Joi.object({
  noteId: noteId.required(),
});

export const updateCollabParamsSchema = Joi.object({
  noteId: noteId.required(),
  userId: userId.required(),
});
