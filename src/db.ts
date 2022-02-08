import { Client } from "pg";

const client = new Client({
    user: "rizakhan",
    host: "127.0.0.1",
    database: "terminal",
    password: "password",
    port: 5432,
});

export default client;
