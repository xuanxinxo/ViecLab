import { Router } from "express";
import {
  getAllNewJobs,
  getNewJobById,
  createNewJob,
  updateNewJob,
  deleteNewJob,
} from "../controllers/newJobController.js";

const router = Router();

router.get("/", getAllNewJobs);
router.get("/:id", getNewJobById);
router.post("/", createNewJob);
router.put("/:id", updateNewJob);
router.delete("/:id", deleteNewJob);

export default router;