// @flow

export type RcDataNode = {
  key: string,
  title: string,
  isLeaf: boolean,
  children: Array<RcDataNode>,
};

type RcTreeNodeProps = {
  title: string,
  isLeaf: boolean,
  // eslint-disable-next-line no-use-before-define
  children: Array<RcTreeNode>,
};

export type RcTreeNode = {
  key: string,
  props: RcTreeNodeProps,
};

export type RcTreeNodeEvent = {
  props: RcTreeNodeProps & {
    eventKey: string,
  },
};

export type RcNodeEventInfo<+T = void> = T & {
  node: RcTreeNodeEvent,
};
