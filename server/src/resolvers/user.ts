import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';
import { MyContext } from '../types';
import { User } from '../entities/User';
import argon2 from 'argon2';

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { em }: MyContext
  ) {
    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, {
      username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }
}
