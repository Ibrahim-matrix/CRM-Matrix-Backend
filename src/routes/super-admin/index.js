const express = require("express");
const router = express.Router();
const path = require('path')
const superAdminRoutes = require("./superAdmin.route");

const defaultRoutes = [
  {
    path: "/admins",
    route: superAdminRoutes,
  },
 
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
