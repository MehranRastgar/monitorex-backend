import * as mongoose from 'mongoose';
import dayjs from 'dayjs';

const date = dayjs();
const dbName = `monitorex-${date.format('YYYY-MM')}`;
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(`mongodb://root:password@localhost:27018`, {
        dbName: dbName,
      }),
  },
];
