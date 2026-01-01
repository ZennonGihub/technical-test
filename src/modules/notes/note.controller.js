import { NotesService } from "./note.service.js";

const service = new NotesService();

export const create = async (req, res, next) => {
  try {
    const note = await service.createNote(req.body, req.user.id);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const findAll = async (req, res, next) => {
  try {
    const note = await service.findAll(req.user.id);
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};
export const findOne = async (req, res, next) => {
  try {
    const note = await service.findNote(req.user.id, req.params.id);
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const newNote = await service.update(req.user.id, req.params.id, req.body);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const note = await service.delete(req.user.id, req.params.id);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};
