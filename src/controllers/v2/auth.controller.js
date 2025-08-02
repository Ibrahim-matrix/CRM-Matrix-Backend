// controllers/notesController.js

const authServiceNew = require('../../services/v2/auth.service');

class authController {
  async signupAdmin(req, res) {
    try {
      const note = await authServiceNew.signupAdmin(req.body);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const notes = await authServiceNew.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const note = await authServiceNew.updateNote(req.params.id, req.body);
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const note = await authServiceNew.deleteNote(req.params.id);
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new authController();