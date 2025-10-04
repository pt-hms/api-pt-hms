import jwt from "jsonwebtoken";
import { config } from "dotenv";

config({ path: ".env" });

export const auth = (req, res, next) => {
   try {
      const token = req.headers.authorization.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
   } catch (error) {
      res.status(401).json({ error: "Authorization Failed!" });
   }
};

export const createToken = (user) => {
   return jwt.sign(user, process.env.JWT_SECRET);
};
