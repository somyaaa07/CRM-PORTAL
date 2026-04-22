// seedAdmin.js — root mein banao, ek baar chalao
import { User } from './models/index.js';
import { sequelize } from './models/index.js';
import dotenv from 'dotenv';
dotenv.config();

await sequelize.sync();
await User.create({
  name: 'Debox',
  email: 'debox.technology@gmail.com',
  password: 'debox@12345',
  role: 'admin',
});
console.log('Admin created!');
process.exit();