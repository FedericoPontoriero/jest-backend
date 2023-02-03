import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class RefreshToken extends Model {
    static associace(models) {
      RefreshToken.belongsTo(models["User"]);
    }
  }

  RefreshToken.init(
    {
      token: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "RefreshToken",
    }
  );

  return RefreshToken;
};
