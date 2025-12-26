import * as mysqlDriver from 'mysql2';
import {DataSourceOptions} from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export function getConfig() {
    return {
        type: "mysql",
        host: process.env.TYPEORM_HOST,
        port: process.env.TYPEORM_PORT,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        synchronize: false,
        logging: true,
        maxQueryExecutionTime: 1000,
        entities: [process.env.TYPEORM_ENTITIES],
        migrations: [process.env.TYPEORM_MIGRATIONS],
        subscribers: [process.env.TYPEORM_SUBSCRIPTIONS],

        driver: mysqlDriver,
    } as DataSourceOptions;
}
