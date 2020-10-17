import { Migration } from '@mikro-orm/migrations';

export class Migration20201017174103 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" rename column "username" to "email";');


    this.addSql('alter table "user" drop constraint "user_username_unique";');
  }

}
