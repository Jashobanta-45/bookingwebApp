import mongoose from "mongoose";



const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  action:{
    type:String,
   enum:['accont_verification','event_booking'],
   required:true

  },
  createdAt:{
    type:Date,
    default:Date.now,
    expires:3000  //otp expir in 5 min
}
})

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;