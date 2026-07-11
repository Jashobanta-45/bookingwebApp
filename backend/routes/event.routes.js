import express from "express";
import { protect,admin } from "../middleware/auth.middileware.js";
import { getAllEvents, getEventsById, createEvent, updateEvent, deleteEvent } from "../controller/event.controller.js";

const router = express.Router();

//get all routes
router.get("/", protect,getAllEvents );

//get bY id
router.get("/:id",getEventsById );

//create event (Admin only)

router.post("/", protect, admin,createEvent );

//update event(admin only)
router.put("/:id", protect, admin, updateEvent);

//delete event(admin only)
router.delete("/:id", protect, admin, deleteEvent);

export default router;