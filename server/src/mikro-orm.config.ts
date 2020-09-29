import { __prod__ } from './constants';
import { Question } from './entities/Question';
import { MikroORM } from '@mikro-orm/core';
import path from 'path';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Question],
  dbName: 'interask',
  user: 'robihid',
  password: 'ghj123',
  type: 'postgresql',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
