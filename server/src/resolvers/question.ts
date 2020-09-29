import { Question } from '../entities/Question';
import { MyContext } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class QuestionResolver {
  @Query(() => [Question])
  questions(@Ctx() { em }: MyContext): Promise<Question[]> {
    return em.find(Question, {});
  }

  @Query(() => Question, { nullable: true })
  question(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<Question | null> {
    return em.findOne(Question, { id });
  }

  @Mutation(() => Question)
  async createQuestion(
    @Arg('description') description: string,
    @Ctx() { em }: MyContext
  ): Promise<Question> {
    const question = em.create(Question, { description });
    await em.persistAndFlush(question);
    return question;
  }

  @Mutation(() => Question, { nullable: true })
  async updateQuestion(
    @Arg('id') id: number,
    @Arg('description', () => String, { nullable: true }) description: string,
    @Ctx() { em }: MyContext
  ): Promise<Question | null> {
    const question = await em.findOne(Question, { id });
    if (!question) {
      return null;
    }
    if (typeof description !== 'undefined') {
      question.description = description;
      await em.persistAndFlush(question);
    }
    return question;
  }

  @Mutation(() => Boolean)
  async deleteQuestion(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Question, { id });
    return true;
  }
}
