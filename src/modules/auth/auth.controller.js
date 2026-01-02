import { AuthService } from "./auth.service.js";

const service = new AuthService();

export const register = async (req, res, next) => {
  try {
    const { refreshToken, token } = await service.register(req.body);
    res.status(201).json({ refreshToken, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { refreshToken, token } = await service.login(req.body);
    res.status(201).json({ refreshToken, token });
  } catch (error) {
    next(error);
  }
};

export const findOne = async (req, res, next) => {
  try {
    const user = await service.findOne(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const newUser = await service.update(req.user.id, req.body);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const user = await service.delete(req.params.id);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
