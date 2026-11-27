const express = require("express");
const router = express.Router();
const {
  getStudyPlan,
  addStudyTask,
  toggleStudyTask,
  deleteStudyTask,
} = require("../controllers/studyPlanController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getStudyPlan);
router.post("/", addStudyTask);
router.patch("/:id/toggle", toggleStudyTask);
router.delete("/:id", deleteStudyTask);

module.exports = router;
