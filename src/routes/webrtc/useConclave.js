// @flow

import * as React from 'react';

import Peer from 'peerjs';

import type { AceRef, AceConfig, AceMarker, AcePosition } from './aceTypes';

import useRemoteCursors from './useRemoteCursors';
import useContent from './useContent';
import Controller from './conclave/controller';

type ConnectionConfig = {|
  peerOptions: any,
  siteId: string,
  targetPeerId: string | null,
|};

type ControllerAction =
  | {| type: 'REMOVE_CURSOR', siteId: string |}
  | {| type: 'INSERT', siteId: string, value: string, start: AcePosition, end: AcePosition |}
  | {| type: 'DELETE', siteId: string, value: string, start: AcePosition, end: AcePosition |};

type ConclaveHook = {|
  mountAceEditor(props: AceConfig | null): {|
    ref: (AceRef | null) => void,
    value: string,
    markers: AceMarker[],
    ...AceConfig,
  |},
|};

export default function useConclave(
  connectionConfig: ConnectionConfig,
  getMarkerClassName: (siteId: string, type: 'selection' | 'cursor') => string,
): ConclaveHook {
  const [ace, setAce] = React.useState<AceRef | null>(null);

  const remoteCursors = useRemoteCursors(getMarkerClassName);
  const content = useContent(remoteCursors.dispatch);

  React.useEffect(() => {
    if (ace === null) return;

    const { peerOptions, siteId, targetPeerId } = connectionConfig;

    function dispatch(action: ControllerAction) {
      switch (action.type) {
        case 'REMOVE_CURSOR': {
          const { siteId } = action;

          remoteCursors.dispatch({ type: 'REMOVE', siteId });
          return;
        }
        case 'INSERT': {
          const { siteId, value, start, end } = action;
          console.log(action);
          return;
        }
        case 'DELETE': {
          const { siteId, value, start, end } = action;
          console.log(action);
          return;
        }
      }
    }

    const controller = new Controller(
      siteId,
      targetPeerId,
      location.origin,
      new Peer({
        ...peerOptions,
        debug: 1,
      }),
      dispatch,
    );

    setTimeout(() => {
      remoteCursors.dispatch({
        type: 'SET',
        siteId: 'foo',
        remoteCursor: {
          selection: {
            start: { row: 1, column: 1 },
            end: { row: 1, column: 3 },
          },
          cursor: { row: 1, column: 3 },
        },
      });
    }, 5000);

    return () => {
      // TODO discard controller
    };
  }, [ace]);

  return {
    mountAceEditor(config: AceConfig | void) {
      const { ref, markers, ...props } = config ?? {};

      return {
        ref: setAce,
        ...props,
        markers: [...(markers ?? []), ...remoteCursors.getAceMarkers()],
        onChange: content.onChange,
        value: content.value,
      };
    },
  }
}
