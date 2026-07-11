import mongoose from "mongoose";

const mongoConnection = async () => {   
  await mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connect to the mongodb"))
  .catch((err) => console.log("connecting error to mongoDb",err));
};

export default mongoConnection;