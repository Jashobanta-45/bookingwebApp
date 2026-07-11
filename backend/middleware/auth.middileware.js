import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import express from "express";
//user authentication middileware
const protect = async (req, res, next) => {
  let token =
    req.headers.authorization && req.headers.authorization.startsWidth("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

  if (token) { 
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    if(!req.user){
        return res.status(401).json({ message: "not authurized,user not found" });
    }
   next();

      
    } catch (error) {
         return res.status(401).json({ message: "not authurized,token failed" });
    }
  }
  else{
    return res.status(401).json({ message: "Unauthorized" });
  }
};

//admin 
const  admin = (req,res,next)=>{
    if(req.user && req.user.isAdmin){
        next();
    }   else{
        return res.status(401).json({ message: "Not authorized as an admin" });
    }
}

export { protect, admin 
    }