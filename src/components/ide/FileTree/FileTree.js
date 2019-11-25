// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import CodeIcon from '@material-ui/icons/Code';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';

import Tree, { TreeNode } from 'rc-tree';
// $FlowExpectError
import sRcTree from 'rc-tree/assets/index.css';

import s from './FileTree.scss';

import type {
  FilerRecursiveStatInfo,
  FilerRecursiveDirectoryInfo,
} from '../../../core/store/projects';

import FileMenu, { type FileAction } from './FileMenu';
import type { RcTreeNodeEvent, RcNodeEventInfo } from './RcTreeTypes';

export type { FileAction };

/*
--- rc-tree BUG ---
Open all Nodes (or one child node), then close the root node.
After reloading, the root node will open even though it is not
defined in the localstorage.
*/

export type ControlledState = $Shape<{|
  expandedKeys: Array<string>,
|}>;

type PropTypes = {|
  files: FilerRecursiveStatInfo,
  expandedKeys: Array<string>,
  onFileAction: (RcTreeNodeEvent, FileAction) => void | Promise<void>,
  onUpdate: (state: ControlledState) => void | Promise<void>,
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

  handleClickFile(path: string, file: FilerRecursiveStatInfo) {
    this.setState({ selectedKeys: [path] });
  }

  // TODO implement moving files/directories via drag & drop

  handleTreeDragStart = ({ node }: RcNodeEventInfo<>) => {};

  handleTreeDragEnd = ({ node }: RcNodeEventInfo<>) => {};

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
    this.props.onUpdate({ expandedKeys });
  };

  render() {
    const renderChildren = (
      path: string,
      children: Array<FilerRecursiveStatInfo>,
    ) =>
      children.map(child =>
        // eslint-disable-next-line no-use-before-define
        renderNode(`${path}/${child.name}`, child),
      );

    const renderNode = (path: string, file: FilerRecursiveStatInfo) => {
      const isLeaf = !file.isDirectory();
      const isExpanded = this.props.expandedKeys.includes(path);

      const IconComponent = isLeaf
        ? CodeIcon
        : isExpanded
        ? FolderOpenIcon
        : FolderIcon;

      const attrs = {
        key: path,
        isLeaf,
        title: (
          // TODO figure out accessibility
          <span
            onClick={() => this.handleClickFile(path, file)}
            onRightClick={event => {}}
            onDoubleClick={event => {}}
          >
            <IconComponent style={{ fontSize: '1rem' }} />
            {file.name}
          </span>
        ),
        file,
      };

      if (isLeaf) {
        return <TreeNode {...attrs} />;
      } else {
        // $FlowExpectError
        const dir: FilerRecursiveDirectoryInfo = file;
        return (
          <TreeNode {...attrs}>{renderChildren(path, dir.contents)}</TreeNode>
        );
      }
    };

    return (
      <div ref={this.rootDivRef} className={s.root}>
        <Tree
          className="file-tree"
          showLine
          showIcon={false}
          checkable={false}
          selectable
          draggable
          expandedKeys={this.props.expandedKeys}
          onExpand={this.handleTreeExpand}
          selectedKeys={this.state.selectedKeys}
          onDragStart={this.handleTreeDragStart}
          onDragEnd={this.handleTreeDragEnd}
          onRightClick={this.handleTreeRightClick}
        >
          {renderNode('.', this.props.files)}
        </Tree>
        <FileMenu ref={this.menuRef} onFileAction={this.props.onFileAction} />
      </div>
    );
  }
}

export default withStyles(sRcTree, s)(FileTree);
