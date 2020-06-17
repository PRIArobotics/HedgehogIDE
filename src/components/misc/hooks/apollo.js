// @flow

import {
  useQuery,
  useLazyQuery,
  useSubscription,
  useMutation,
  type QueryHookOptions,
  type QueryTuple,
  type QueryResult,
  type LazyQueryHookOptions,
  type SubscriptionHookOptions,
  type MutationHookOptions,
  type MutationTuple,
} from '@apollo/react-hooks';

// graphql types
type DocumentNode = any;

type QueryHook<TData, TVariables> = (
  options?: QueryHookOptions<TData, TVariables>,
) => QueryResult<TData, TVariables>;

export function makeQuery<TData, TVariables>(query: DocumentNode): QueryHook<TData, TVariables> {
  return options => useQuery<TData, TVariables>(query, options);
}

type LazyQueryHook<TData, TVariables> = (
  options?: LazyQueryHookOptions<TData, TVariables>,
) => QueryTuple<TData, TVariables>;

export function makeLazyQuery<TData, TVariables>(
  query: DocumentNode,
): LazyQueryHook<TData, TVariables> {
  return options => useLazyQuery<TData, TVariables>(query, options);
}

type SubscriptionHook<TData, TVariables> = (
  options?: SubscriptionHookOptions<TData, TVariables>,
) => QueryResult<TData, TVariables>;

export function makeSubscription<TData, TVariables>(
  query: DocumentNode,
): SubscriptionHook<TData, TVariables> {
  return options => useSubscription<TData, TVariables>(query, options);
}

type MutationHook<TData, TVariables> = (
  options?: MutationHookOptions<TData, TVariables>,
) => MutationTuple<TData, TVariables>;

export function makeMutation<TData, TVariables>(
  query: DocumentNode,
): MutationHook<TData, TVariables> {
  return options => useMutation<TData, TVariables>(query, options);
}
