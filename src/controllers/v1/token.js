import { Router } from "express";

import models from "../../models";
import JWTUtils from "../../utils/jwt-utils";
import runAsyncWrapper from "../../utils/runAsyncWrapper";
import requiresAuth from "../../middlewares/requiresAuth";

const router = Router();
const { User, RefreshToken } = models;

router.post(
  "/token",
  requiresAuth("refreshToken"),
  runAsyncWrapper(async (req, res) => {
    const { jwt } = req.body;
    const user = await User.findOne({
      where: { email: jwt.email },
      include: RefreshToken,
    });
    const savedToken = user.RefreshToken;

    if (!savedToken || !savedToken.token) {
      return res
        .status(401)
        .send({ success: false, message: "You must login first" });
    }

    const payload = { email: user.email };
    const newAccessToken = JWTUtils.generateAccessToken(payload);
    return res
      .status(200)
      .send({ success: true, data: { accessToken: newAccessToken } });
  })
);

export default router;
