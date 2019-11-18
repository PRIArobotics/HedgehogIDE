// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Tree from 'rc-tree';
// $FlowExpectError
import sRcTree from 'rc-tree/assets/index.css';

import s from './FileTree.scss';

import FileMenu from './FileMenu';
import type { FileAction } from './FileMenu';
import type {
  RcDataNode,
  RcTreeNodeEvent,
  RcNodeEventInfo,
} from './RcTreeTypes';

import * as ProjectsDB from '../../../core/store/projects';

export type { FileAction };

/*
--- rc-tree BUG ---
Open all Nodes (or one child node), then close the root node.
After reloading, the root node will open even though it is not
defined in the localstorage.
*/

type FileTreeState = {|
  expandedKeys: Array<string>,
|};

type PropTypes = {|
  projectName: ProjectsDB.ProjectName,
  files: Array<any>,
  onFileAction: (RcTreeNodeEvent, FileAction) => void | Promise<void>,
  callbackSave: (state: FileTreeState) => void,
  callbackGet: () => FileTreeState,
|};
type StateTypes = {|
  selectedKeys: Array<string>,
|};

class FileTree extends React.Component<PropTypes, StateTypes> {
  rootDivRef: RefObject<'div'> = React.createRef();
  menuRef: RefObject<typeof FileMenu> = React.createRef();

  menuAnchor: HTMLElement | null = null;

  state = {
    selectedKeys: [],
  };

  componentDidMount() {
    if (this.rootDivRef.current === null) {
      // eslint-disable-next-line no-throw-literal
      throw 'ref is null in componentDidMount';
    }

    const rootDiv = this.rootDivRef.current;
    rootDiv.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    if (this.rootDivRef.current === null) {
      // eslint-disable-next-line no-throw-literal
      throw 'ref is null in componentDidMount';
    }

    const rootDiv = this.rootDivRef.current;
    rootDiv.removeEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = e => {
    this.menuAnchor = e.target;
  };

  handleTreeSelect = (
    selectedKeys: Array<string>,
    { node }: RcNodeEventInfo<>,
  ) => {
    this.setState({ selectedKeys });
  };

  // TODO implement moving files/directories via drag & drop

  // handleTreeDragStart = ({ node }: RcNodeEventInfo<>) => {
  // };

  // handleTreeDragEnd = ({ node }: RcNodeEventInfo<>) => {
  // };

  handleTreeRightClick = ({ node }: RcNodeEventInfo<>) => {
    // TODO only right click supported for opening context menu

    this.setState({
      selectedKeys: [node.props.eventKey],
    });

    // eslint-disable-next-line no-throw-literal
    if (this.menuRef.current === null) throw 'ref is null';
    this.menuRef.current.show(this.menuAnchor, node);
  };

  handleTreeExpand = (
    expandedKeys: Array<string>,
    { node }: RcNodeEventInfo<>,
  ) => {
    this.props.callbackSave({ expandedKeys });
  };

  getTreeData(): Array<RcDataNode> {
    const visitChildren = (
      path: string,
      children: Array<any>,
    ): Array<RcDataNode> =>
      children.map(child =>
        // eslint-disable-next-line no-use-before-define
        visitNode(path, child),
      );

    const visitNode = (path: string, node: any): RcDataNode => {
      const { name: title, type, contents } = node;
      const key = `${path}/${title}`;
      const isLeaf = !node.isDirectory();
      const children = isLeaf ? [] : visitChildren(key, contents);
      return { key, title, isLeaf, children };
    };

    const { projectName, files } = this.props;

    return [
      {
        key: '.',
        title: projectName,
        isLeaf: false,
        children: visitChildren('.', files),
      },
    ];
  }

  render() {
    return (
      <div ref={this.rootDivRef} className={s.root}>
        <Tree
          className="file-tree"
          showLine
          checkable={false}
          selectable
          draggable
          defaultExpandedKeys={this.props.callbackGet().expandedKeys}
          onSelect={this.handleTreeSelect}
          // onDragStart={this.handleTreeDragStart}
          // onDragEnd={this.handleTreeDragEnd}
          onRightClick={this.handleTreeRightClick}
          selectedKeys={this.state.selectedKeys}
          onExpand={this.handleTreeExpand}
          treeData={this.getTreeData()}
        />
        <FileMenu ref={this.menuRef} onFileAction={this.props.onFileAction} />
      </div>
    );
  }
}

export default withStyles(sRcTree, s)(FileTree);
