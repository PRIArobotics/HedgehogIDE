// @flow

/**
 * The `makeFoo` hook factories in this module wrap Apollo's `useFoo` hooks for more convenient typing.
 *
 * Using the Apollo hooks directly leads to code like this:
 *
 *    import { useMutation } from '@apollo/react-hooks';
 *    import gql from 'graphql-tag';
 *
 *    import {
 *      type Mutate,
 *      type MutateVariables,
 *    } from './__generated__/Mutate';
 *
 *    const SomeMutation = gql`
 *      mutation Mutate() {
 *        mutate()
 *      }
 *    `;
 *
 *    function Component({ key }) {
 *      const [mutate, response] = useMutation<Mutate, MutateVariables>(SomeMutation, options);
 *    }
 *
 * even though the type information is actually connected to the `SomeConnection` constant,
 * not the hook call.
 *
 * The factories here shift that typing (and passing of the query constant)
 * from the call site to the query declaration site:
 *
 *    import gql from 'graphql-tag';
 *
 *    import {
 *      type Mutate,
 *      type MutateVariables,
 *    } from './__generated__/Mutate';
 *
 *    const useSomeMutation = makeMutation<Mutate, MutateVariables>(gql`
 *      mutation Mutate() {
 *        mutate()
 *      }
 *    `);
 *
 *    function Component({ key }) {
 *      const [mutate, response] = useSomeMutation(options);
 *    }
 */

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
