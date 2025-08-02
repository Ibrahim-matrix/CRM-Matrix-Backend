const mongoose = require("mongoose");

const sideMenuSchema = mongoose.Schema(
  {
    menu: [
      {
      type: String,
      },
    ]
  },
  { timestamps: true }
);


const SideMenu = mongoose.model("sideMenu", sideMenuSchema);
module.exports = SideMenu;
