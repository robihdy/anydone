import { Recipe } from '../entities/Recipe';
import { MyContext } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class RecipeResolver {
  @Query(() => [Recipe])
  recipes(@Ctx() { em }: MyContext): Promise<Recipe[]> {
    return em.find(Recipe, {});
  }

  @Query(() => Recipe, { nullable: true })
  recipe(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<Recipe | null> {
    return em.findOne(Recipe, { id });
  }

  @Mutation(() => Recipe)
  async createRecipe(
    @Arg('title') title: string,
    @Ctx() { em }: MyContext
  ): Promise<Recipe> {
    const recipe = em.create(Recipe, { title });
    await em.persistAndFlush(recipe);
    return recipe;
  }

  @Mutation(() => Recipe, { nullable: true })
  async updateRecipe(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Recipe | null> {
    const recipe = await em.findOne(Recipe, { id });
    if (!recipe) {
      return null;
    }
    if (typeof title !== 'undefined') {
      recipe.title = title;
      await em.persistAndFlush(recipe);
    }
    return recipe;
  }

  @Mutation(() => Boolean)
  async deleteRecipe(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Recipe, { id });
    return true;
  }
}
