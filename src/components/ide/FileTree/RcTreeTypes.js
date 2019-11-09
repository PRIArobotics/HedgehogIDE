// @flow

export type RcDataNode = {
  key: string,
  title: string,
  isLeaf: boolean,
  data: {|
    path: Array<string>,
  |},
  children: Array<RcDataNode>,
};

type RcTreeNodeProps = {
  title: string,
  isLeaf: boolean,
  data: {|
    path: Array<string>,
  |},
  children: Array<RcTreeNode>,
}

export type RcTreeNode = {
  key: string,
  props: RcTreeNodeProps,
};

export type RcTreeNodeEvent = {
  props: RcTreeNodeProps & {
    eventKey: string,
  },
};

export type RcNodeEventInfo<T = any> = T & {
  node: RcTreeNodeEvent,
};