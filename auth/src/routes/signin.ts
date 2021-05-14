import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { validateEmailPwdRequest } from "../middlewares/validate-email-pwd-request";

import { BadRequestError } from "../errors/bad-request-error";

import { User } from "../models/user";

import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Invalid email or password"),
    body("password")
      .trim() //remove leading and trailing spaces
      .notEmpty()
      .withMessage("Invalid email or password"),
  ],
  validateEmailPwdRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    // user does not exist
    if (!existingUser) {
      throw new BadRequestError("Invalid email or password");
    }

    // compare supplied and stored passwords
    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordMatch) {
      throw new BadRequestError("Invalid email or password");
    }

    // generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // store it on the session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
