// @flow

import * as React from 'react';

import Peer from 'peerjs';

import * as hooks from '../../components/misc/hooks';
import type { AceConfig, AceMarker } from './aceTypes';

import useRemoteCursors from './useRemoteCursors';
import useContent from './useContent';
import Controller, { type ControllerAction } from './conclave/controller';

export type ConnectionConfig = {|
  siteId: string,
  targetPeerId: string | null,
  peerOptions?: any,
  onOpen?: (id: string) => void,
|};

type ConclaveHook = {|
  mountAceEditor(
    props: AceConfig | null,
  ): {|
    value: string,
    markers: AceMarker[],
    ...AceConfig,
  |},
|};

export default function useConclave(
  connectionConfig: ConnectionConfig,
  getMarkerClassName: (siteId: string, type: 'selection' | 'cursor') => string,
): ConclaveHook {
  const remoteCursors = useRemoteCursors(getMarkerClassName);
  const remoteCursorsDispatch = remoteCursors.dispatch;

  const controller = hooks.useValue(() => {
    const { peerOptions, onOpen, siteId, targetPeerId } = connectionConfig;

    // eslint-disable-next-line no-shadow
    const controller = new Controller(
      siteId,
      targetPeerId,
      // eslint-disable-next-line no-restricted-globals
      location.origin,
      new Peer({
        ...peerOptions,
        debug: 1,
      }),
    );

    if (onOpen) controller.broadcast.peer.on('open', onOpen);

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

    return controller;
  });

  const content = useContent(remoteCursorsDispatch, controller);
  const contentRefresh = content.refreshValue;

  React.useEffect(() => {
    function dispatch(action: ControllerAction) {
      switch (action.type) {
        case 'REMOVE_CURSOR': {
          const { siteId } = action;

          remoteCursorsDispatch({ type: 'REMOVE', siteId });
          break;
        }
        case 'INSERT': {
          contentRefresh();
          break;
        }
        case 'DELETE': {
          contentRefresh();
          break;
        }
        default:
          // eslint-disable-next-line no-throw-literal
          throw 'unreachable';
      }
    }

    controller.dispatch = dispatch;
  }, [controller, remoteCursorsDispatch, contentRefresh]);

  return {
    mountAceEditor(config: AceConfig | void) {
      const { markers, ...props } = config ?? {};

      return {
        ...props,
        markers: [...(markers ?? []), ...remoteCursors.getAceMarkers()],
        onChange: content.onChange,
        value: content.value,
      };
    },
  };
}
