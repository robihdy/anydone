import { Task } from '../entities/Task';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { MyContext } from 'src/types';
import { isAuthenticated } from '../middleware/isAuthenticated';

@InputType()
class TaskInput {
  @Field()
  title: string;
  @Field()
  description: string;
  @Field()
  pomodoro: number;
}

@Resolver()
export class TaskResolver {
  @Query(() => [Task])
  tasks(): Promise<Task[]> {
    return Task.find();
  }

  @Query(() => Task, { nullable: true })
  task(@Arg('id') id: number): Promise<Task | undefined> {
    return Task.findOne(id);
  }

  @Mutation(() => Task)
  @UseMiddleware(isAuthenticated)
  async createTask(
    @Arg('input') input: TaskInput,
    @Ctx() { req }: MyContext
  ): Promise<Task> {
    return Task.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Task, { nullable: true })
  async updateTask(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Task | null> {
    const task = await Task.findOne(id);
    if (!task) {
      return null;
    }
    if (typeof title !== 'undefined') {
      task.title = title;
      await Task.update({ id }, { title });
    }
    return task;
  }

  @Mutation(() => Boolean)
  async deleteTask(@Arg('id') id: number): Promise<boolean> {
    await Task.delete(id);
    return true;
  }
}
