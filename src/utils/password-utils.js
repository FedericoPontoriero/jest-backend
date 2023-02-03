import bcrypt from "bcrypt";
import environment from "../config/environment";

class PasswordUtils {
  static async hashPassword(password) {
    return bcrypt.hash(password, environment.saltRounds);
  }

  static async comparePasswords(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default PasswordUtils;
