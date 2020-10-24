import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from 'urql';
import { pipe, tap } from 'wonka';
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  VoteMutationVariables,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import Router from 'next/router';
import gql from 'graphql-tag';
import { isServer } from './isServer';

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login');
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      'questions'
    );
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'questions') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: 'PaginatedQuestions',
      hasMore,
      questions: results,
    };
  };
};

export const createUrqlClient = () => {
  return {
    url: 'http://localhost:5000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedQuestions: () => null,
        },
        resolvers: {
          Query: {
            questions: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            vote: (_result, args, cache, info) => {
              const { questionId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Question {
                    id
                    points
                  }
                `,
                { id: questionId } as any
              );

              if (data) {
                const newPoints = (data.points as number) + value;
                cache.writeFragment(
                  gql`
                    fragment __ on Question {
                      points
                    }
                  `,
                  { id: questionId, points: newPoints } as any
                );
              }
            },
            createQuestion: (_result, args, cache, info) => {
              const allFields = cache.inspectFields('Query');
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === 'questions'
              );
              fieldInfos.forEach((fi) => {
                cache.invalidate('Query', 'questions', fi.arguments || {});
              });
            },
            logout: (_result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
            },
            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      fetchExchange,
    ],
  };
};
