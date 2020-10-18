import { Task } from '../entities/Task';
import { Arg, Mutation, Query, Resolver } from 'type-graphql';

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
  async createTask(@Arg('title') title: string): Promise<Task> {
    return Task.create({ title }).save();
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
