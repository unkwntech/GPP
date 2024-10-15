import { Collection } from "discord.js";
import { Connection } from "mysql";

declare module "discord.js" {
    interface Client {
        commands: Collection<any, any>;
        mysql: Connection;
    }
}
