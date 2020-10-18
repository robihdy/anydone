import { Migration } from '@mikro-orm/migrations';

export class Migration20201018060622 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "task" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');

    this.addSql('drop table if exists "recipe" cascade;');
  }

}
