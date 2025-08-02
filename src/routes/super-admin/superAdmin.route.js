const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");

const superAdminController = require("../../controllers/superAdmin/superAdmin.controller");
const { isSuperAdmin } = require("../../middlewares/admin");

// router
//   .route("/todo")
//   .post(auth, isSuperAdmin, superAdminController.createTodo)
//   .get(auth, isSuperAdmin, superAdminController.getTodos);

// router
//   .route("/todo/:id")
//   .get(auth, isSuperAdmin, superAdminController.getTodoById)
//   .put(auth, isSuperAdmin, superAdminController.updateTodo)
//   .delete(auth, isSuperAdmin, superAdminController.deleteTodo);

router
  .route("/editSuperAdmin")
  .put(auth, isSuperAdmin, superAdminController.updateSuperAdmin);
router
  .route("/update-superadminPassword")
  .put(auth, isSuperAdmin, superAdminController.updateSuperAdminPassword);

router
  .route("/sideMenu")
  .post(auth, superAdminController.addMenu)
  .get(auth, superAdminController.getMenu)
  .put(auth, superAdminController.updateMenu)
  .delete(auth, superAdminController.deleteMenu);

router.get("/leads", auth, isSuperAdmin, superAdminController.getAllLeads);
router.get(
  "/dashboard",
  auth,
  isSuperAdmin,
  superAdminController.getDashboardCounts
);
router.get(
  "/dashboardAdminsRevenue",
  auth,
  isSuperAdmin,
  superAdminController.getAdminsTotalCoursePrice
);
router.put(
  "/updateRaisedIssues/:id",
  auth,
  isSuperAdmin,
  superAdminController.updateRaisedIssues
);
router.get(
  "/adminProductRevenues/:adminId",
  auth,
  isSuperAdmin,
  superAdminController.getAdminProductRevenue
);
router.get("/source", auth, superAdminController.getAllSources);
router.get("/city", auth, superAdminController.getAllCities);
router.get("/course", auth, superAdminController.getAllCourses);
router.get("/status", auth, superAdminController.getAllStatus);
router.get("/branch", auth, superAdminController.getAllBranches);
router.get("/assignTo", auth, superAdminController.getAllAssignTo);
router
  .route("/adminUsers/:id")
  .get(auth, isSuperAdmin, superAdminController.getAdminUsers)
  .put(auth, isSuperAdmin, superAdminController.updateAdmin);

router.get("/", auth, isSuperAdmin, superAdminController.getAllAdmins);

module.exports = router;
