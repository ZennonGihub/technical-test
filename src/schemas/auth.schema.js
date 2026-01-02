import Joi from "joi";

const email = Joi.string().email();
const password = Joi.string().min(6).max(40);
const username = Joi.string().min(3).max(50);

export const registerSchema = Joi.object({
  email: email.required(),
  password: password.required(),
  username: username.required(),
});

export const loginSchema = Joi.object({
  email: email.required(),
  password: password.required(),
});
