import express from "express";
import cors from "cors";    
import dotenv from "dotenv";
import mongoConnection from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

//routs
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/booking', bookingRoutes);


//connect db
mongoConnection();
//create server
const PORT =process.env.PORT || 5000;
app.listen(PORT, ()=>{
console.log(`sever is running on port ${PORT}`);

})