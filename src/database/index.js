import { Sequelize } from "sequelize";

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
    const uri = this.getConnectionString();

    this.connection = new Sequelize(uri, {
      logging: this.isTestEnvironment ? false : console.log,
    });

    await this.connection.authenticate({ logging: false });

    if (!this.isTestEnvironment) {
      console.log("Connection established");
    }

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
