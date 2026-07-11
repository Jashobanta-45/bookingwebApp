import express from "express";
import { protect, admin } from "../middleware/auth.middileware.js";
import Event from "../model/event.model.js";

const getAllEvents = async (req, res) => {
  try {
    const filters = {};

    if (req.query.catagory) {
      filters.catagory = req.query.catagory;
    }
    if (req.query.location) {
      filters.location = req.query.location;
    }
    if (req.query.ticketprice) {
      filters.ticketprice = req.query.ticketprice;
    }
    const events = await Event.find(filters);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getEventsById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createEvent = async (req, res) => {
  const {
    titel,
    description,
    date,
    location,
    catagory,
    totalSeat,
    ticketprice,
    image,
  } = req.body;
  try {
    const event = await Event.create({
      titel,
      description,
      date,
      location,
      catagory,
      totalSeat,
      ticketprice,
      image,
      createdBy: req.user._id,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateEvent = async (req, res) => {
  const {
    titel,
    description,
    date,
    location,
    catagory,
    totalSeat,
    ticketprice,
    image,
  } = req.body;
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        titel,
        description,
        date,
        location,
        catagory,
        totalSeat,
        ticketprice,
        image,
      },
      { new: true },
    );
    if (!event) {
      res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch {
    res.status(500).json({ message: error.message });
  }
};
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
    } else {
      res.status(200).json({ message: "Event deleted successfully" });
    }
  } catch {
    res.status(500).json({ message: error.message });
  }
};

export { getAllEvents, getEventsById, createEvent, updateEvent, deleteEvent };
