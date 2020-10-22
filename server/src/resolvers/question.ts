import { Question } from '../entities/Question';
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { getConnection } from 'typeorm';

@InputType()
class QuestionInput {
  @Field()
  eventId: number;
  @Field()
  authorName: string;
  @Field()
  description: string;
}

@Resolver()
export class QuestionResolver {
  @Query(() => [Question])
  async questions(
    @Arg('eventId', () => Int) eventId: number,
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<Question[]> {
    const realLimit = Math.min(50, limit);
    const qb = getConnection()
      .getRepository(Question)
      .createQueryBuilder('q')
      .where('"eventId" = :eventId', { eventId })
      .orderBy('"createdAt"', 'DESC')
      .take(realLimit);

    if (cursor) {
      qb.andWhere('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    return qb.getMany();
  }

  @Query(() => Question, { nullable: true })
  question(@Arg('id') id: number): Promise<Question | undefined> {
    return Question.findOne(id);
  }

  @Mutation(() => Question)
  async createQuestion(@Arg('input') input: QuestionInput): Promise<Question> {
    return Question.create({
      ...input,
    }).save();
  }

  @Mutation(() => Question, { nullable: true })
  async updateQuestion(
    @Arg('id') id: number,
    @Arg('description', () => String, { nullable: true }) description: string
  ): Promise<Question | null> {
    const question = await Question.findOne(id);
    if (!question) {
      return null;
    }
    if (typeof description !== 'undefined') {
      question.description = description;
      await Question.update({ id }, { description });
    }
    return question;
  }

  @Mutation(() => Boolean)
  async deleteQuestion(@Arg('id') id: number): Promise<boolean> {
    await Question.delete(id);
    return true;
  }
}
