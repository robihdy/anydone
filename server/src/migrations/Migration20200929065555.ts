import { Migration } from '@mikro-orm/migrations';

export class Migration20200929065555 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "question" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "description" text not null);');
  }

}
