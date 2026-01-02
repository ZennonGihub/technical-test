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
    const { search, isArchived } = req.query;

    const filters = {};

    if (search) {
      filters.search = search;
    }

    if (isArchived === "true") filters.isArchived = true;
    if (isArchived === "false") filters.isArchived = false;

    const notes = await service.findAll(req.user.id, filters);
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

export const toggleArchive = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const result = await service.toggleArchive(userId, id);
    res.status(200).json(result);
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
