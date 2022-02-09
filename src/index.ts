import axios from "axios";
import client from "./db";
import { Client } from "pg";

class API {
    connection: Client;

    constructor(connection: Client) {
        this.connection = connection;
    }

    databaseCheck = async (): Promise<boolean | string> => {
        const appsTable = `
          CREATE TABLE IF NOT EXISTS "apps" (
            "id" SERIAL,
            "name" VARCHAR(100) UNIQUE NOT NULL,
            "url" VARCHAR(100) NOT NULL,
            "token" VARCHAR(250) NULL,
            PRIMARY KEY ("id")
          );`;

        const endpointsTable = `
          CREATE TABLE IF NOT EXISTS "endpoints" (
            "id" SERIAL,
            "apps_id" INT NOT NULL,
            FOREIGN KEY ("apps_id") REFERENCES apps ("id"),
            "endpoint" VARCHAR(100) UNIQUE NOT NULL,
            "headers" VARCHAR(100) NOT NULL,
            PRIMARY KEY ("id")
          );`;

        try {
            this.connection.connect();
            await this.connection.query(appsTable);
            await this.connection.query(endpointsTable);
            console.log("Tables created!");
        } catch (e) {
            console.table(e);
        } finally {
            this.connection.end();
            process.exit(0);
        }
    };

    setApp = async (...args: string[]): Promise<boolean | string> => {
        const [name, url] = args;

        if (!name) {
            console.log("An app name is required");
            process.exit(0);
        }

        if (!url) {
            console.log("App's url is required");
            process.exit(0);
        }

        const text = "INSERT INTO apps(name, url) VALUES($1, $2);";

        try {
            this.connection.connect();
            await this.connection.query(text, [name, url]);
        } catch (e) {
            console.table(e);
        } finally {
            this.connection.end();
            process.exit(0);
        }
    };

    setToken = async (...args: string[]): Promise<boolean | string> => {
        const [name, endpoint, data] = args;
        const payload = {};
        data.split(",").forEach((item) => {
            const [key, value] = item.split(":");
            payload[key] = value;
        });

        try {
            this.connection.connect();
            const results = await this.connection.query(
                "SELECT url FROM apps WHERE name = $1;",
                [name]
            );

            const url = results.rows[0]["url"];

            const res = await axios.post(`${url}${endpoint}`, payload, {
                headers: { "Content-Type": "application/json" },
            });

            const token = res.data.data.token;

            await this.connection.query(
                "UPDATE apps SET token = $1 WHERE name = $2;",
                [token, name]
            );
            console.log("Token saved to database!");
        } catch (e) {
            console.log(e);
        } finally {
            this.connection.end();
        }
    };

    authEndpoints = async (...args: string[]): Promise<boolean | string> => {
        const [name, endpoint] = args;
        // const payload = {};
        // data.split(",").forEach((item) => {
        //     const [key, value] = item.split(":");
        //     payload[key] = value;
        // });

        try {
            this.connection.connect();

            const results = await this.connection.query(
                "SELECT url, token FROM apps WHERE name = $1;",
                [name]
            );

            const url = results.rows[0]["url"];
            const token = results.rows[0]["token"];

            const res = await axios.get(`${url}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            this.connection.end();
        }
    };
}

export const api = new API(client);
