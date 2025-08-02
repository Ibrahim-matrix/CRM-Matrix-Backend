const { users } = require("../../models");

const { auth } = require("../../observers/auth.observers");
class authService {
  async signupAdmin(data) {
    try {
      const note = await users.create(data);
      auth.notifyObservers({ action: "create", data: note });
      return note;
    } catch (error) {
      throw error;
    }
  }

  async getNotes() {
    try {
      return await users.find();
    } catch (error) {
      throw error;
    }
  }

  async updateNote(id, data) {
    try {
      const note = await users.findByIdAndUpdate(id, data, { new: true });
      auth.notifyObservers({ action: "update", data: note });
      return note;
    } catch (error) {
      throw error;
    }
  }

  async deleteNote(id) {
    try {
      const note = await users.findByIdAndDelete(id);
      auth.notifyObservers({ action: "delete", data: note });
      return note;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new authService();