import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { validateEmailPwdRequest } from "../middlewares/validate-email-pwd-request";

import { BadRequestError } from "../errors/bad-request-error";

import { User } from "../models/user";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .trim() //remove leading and trailing spaces
      .isLength({ min: 4, max: 20 })
      .withMessage("Your password must have 4-20 characters"),
  ],
  validateEmailPwdRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.exists({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    // generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // store it on the session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
