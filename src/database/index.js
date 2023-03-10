import { Sequelize } from "sequelize";
import cls from "cls-hooked";

import { registerModels } from "../models";

class Database {
  constructor(environment, dbConfig) {
    this.environment = environment;
    this.dbConfig = dbConfig;
    this.isTestEnvironment = this.environment === "test";
  }

  getConnectionString() {
    const { username, password, host, port, database } =
      this.dbConfig[this.environment];
    return `postgres://${username}:${password}@${host}:${port}/${database}`;
  }

  async connect() {
    const namespace = cls.createNamespace("transactions-namespace");
    Sequelize.useCLS(namespace);

    const uri = this.getConnectionString();

    this.connection = new Sequelize(uri, {
      logging: this.isTestEnvironment ? false : console.log,
    });

    await this.connection.authenticate({ logging: false });

    if (!this.isTestEnvironment) {
      console.log("Connection established");
    }

    registerModels(this.connection);

    await this.sync();
  }

  async sync() {
    await this.connection.sync({
      force: this.isTestEnvironment,
      logging: false,
    });

    if (!this.isTestEnvironment) {
      console.log("Models synchronized");
    }
  }

  async disconnect() {
    await this.connection.close();
  }
}

export default Database;
