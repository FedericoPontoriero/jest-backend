import { Router } from "express";
import models from "../../models";
import runAsyncWrapper from "../../utils/runAsyncWrapper";

const router = Router();
const { User } = models;

router.post(
  "/register",
  runAsyncWrapper(async (req, res) => {
    const { email, password, roles } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res
        .status(200)
        .send({ success: false, message: "User already exists" });
    }

    const result = await User.createNewUser({ email, password, roles });

    const { accessToken, refreshToken } = result;

    return res.send({
      success: true,
      message: "User successfully registered",
      data: {
        accessToken,
        refreshToken,
      },
    });
  })
);

export default router;
