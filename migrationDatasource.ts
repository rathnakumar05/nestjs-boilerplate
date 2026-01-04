import 'dotenv/config';
import { DataSource } from 'typeorm';
import { getDBConfig } from './src/config/database.config';

export const AppDataSource = new DataSource(getDBConfig());
