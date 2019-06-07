import gql from 'graphql-tag';

export default function registerNetworkStatusUpdate(apolloClient) {
  function onNetworkStatusChange() {
    apolloClient.mutate({
      mutation: gql`
        mutation updateNetworkStatus($isConnected: Boolean) {
          updateNetworkStatus(isConnected: $isConnected) @client {
            isConnected
          }
        }
      `,
      variables: {
        isConnected: navigator.onLine,
      },
    });
  }

  window.addEventListener('online', onNetworkStatusChange);
  window.addEventListener('offline', onNetworkStatusChange);
  onNetworkStatusChange();
}
