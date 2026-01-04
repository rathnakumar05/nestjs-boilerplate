import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';

export const getDBConfig = (): TypeOrmModuleOptions & DataSourceOptions => {
  const DBConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    logger: 'advanced-console',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    poolSize: process.env.DB_POOL_SIZE ? +process.env.DB_POOL_SIZE : 10,
    connectTimeoutMS: 10000,
    extra: {
      max: process.env.DB_POOL_SIZE ? +process.env.DB_POOL_SIZE : 10,
      min: 2,
      idleTimeoutMillis: 10000,
      application_name: process.env.DB_APPLICATION_NAME,
    },
  };

  return DBConfig;
};

export default registerAs('database', getDBConfig);
