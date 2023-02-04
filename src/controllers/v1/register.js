import { Router } from "express";
import models from "../../models";
import JWTUtils from "../../utils/jwt-utils";
import runAsyncWrapper from "../../utils/runAsyncWrapper";

const router = Router();
const { User, Role } = models;

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

    try {
      const newUser = await User.create({ email, password });
      const jwtPayload = { email };
      const accessToken = JWTUtils.generateAccessToken(jwtPayload);
      const refreshToken = JWTUtils.generateRefreshToken(jwtPayload);
      await newUser.createRefreshToken({ token: refreshToken });

      if (roles && Array.isArray(roles)) {
        const rolesToSave = [];
        for (const role of roles) {
          const newRole = await Role.create({ role });
          rolesToSave.push(newRole);
        }

        await newUser.addRoles(rolesToSave);
      }

      return res.send({
        success: true,
        message: "User successfully registered",
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      console.error("Error registering the user:\n", err.stack);
      return res.status(500).send({ success: false, message: err.message });
    }
  })
);

export default router;
