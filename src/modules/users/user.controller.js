import { UserService } from "./users.service.js";

const service = new UserService();

export const getAll = async (req, res, next) => {
  try {
    const users = await service.getAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const user = await service.getOne(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
