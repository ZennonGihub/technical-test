import { CollaborationNotes } from "./collaboration.service.js";

const service = new CollaborationNotes();

export const addCollaborator = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const { email, permission } = req.body;
    const newCollab = await service.addCollaborator(
      userId,
      noteId,
      email,
      permission
    );
    res.status(201).json(newCollab);
  } catch (error) {
    next(error);
  }
};

export const getCollaborators = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const collaborators = await service.getCollaborators(userId, noteId);
    res.status(200).json(collaborators);
  } catch (error) {
    next(error);
  }
};

export const updatePermission = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { noteId, collaboratorId } = req.params;
    const { permission } = req.body;
    const newcollaborator = await service.updatePermission(
      userId,
      noteId,
      collaboratorId,
      permission
    );
    res.status(201).json(newcollaborator);
  } catch (error) {
    next(error);
  }
};

export const removeCollaborator = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { noteId, collaboratorId } = req.params;
    const collaborator = await service.removeCollaborator(
      userId,
      noteId,
      collaboratorId
    );
    res.status(201).json(collaborator);
  } catch (error) {
    next(error);
  }
};
