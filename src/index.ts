// import axios from "./axios";
import client from "./db";
import { Client } from "pg";

class API {
    connection: Client;

    constructor(connection: Client) {
        this.connection = connection;
    }

    /*
      Function that is used to query the database
    */

    execute = async (query: string) => {
        try {
            await this.connection.connect();
            // Lets ask the user to create the database before they start using the application.
            await this.connection.query(query);
            return true;
        } catch (e) {
            console.log(e.stack);
            return false;
        } finally {
            await this.connection.end();
        }
    };

    /*
      Create tables if they don't exist. Otherwise create it.
    */

    databaseCheck() {
        const text = `
          CREATE TABLE IF NOT EXISTS "apps" (
            "id" SERIAL,
            "name" VARCHAR(100) NOT NULL,
            "role" VARCHAR(15) NOT NULL,
            PRIMARY KEY ("id")
          );`;

        this.execute(text)
            .then((res) => {
                console.log("res", res);
            })
            .catch((e) => console.log("foobar", e));
    }
}

export const api = new API(client);
