// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Tree from 'rc-tree';
// $FlowExpectError
import sRcTree from 'rc-tree/assets/index.css';

import s from './FileTree.scss';

import FileMenu from './FileMenu';

import * as ProjectsDB from '../../../core/store/projects';

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
  project: ProjectsDB.Project,
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

  handleTreeSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys: [info.node.props.eventKey] });
  };

  // TODO implement moving files/directories via drag & drop

  // handleTreeDragStart = (event, node) => {
  // };

  // handleTreeDragEnd = (event, node) => {
  // };

  handleTreeRightClick = (event, node) => {
    // TODO only right click supported for opening context menu

    this.setState({
      selectedKeys: [event.node.props.eventKey],
    });

    // eslint-disable-next-line no-throw-literal
    if (this.menuRef.current === null) throw 'ref is null';
    this.menuRef.current.show(this.menuAnchor);
  };

  handleTreeExpand = expandedKeys => {
    this.props.callbackSave({ expandedKeys });
  };

  getTreeData() {
    const visitNode = (path: Array<string>, node: ProjectsDB.FileTreeNode) => {
      const key = '/' + path.join('/');
      const title = path[path.length - 1];

      if (node.type === 'file')
        return {
          key,
          title,
          isLeaf: true,
          data: {
            path,
          },
        };
      else
        return {
          key,
          title,
          isLeaf: false,
          data: {
            path,
          },
          children: visitChildren(path, node.children),
        }
    };

    const visitChildren = (path: Array<string>, children: ProjectsDB.DirectoryContents) =>
      Object.entries(children).map(([name, node]) =>
          visitNode([...path, name], ((node: any): ProjectsDB.FileTreeNode)));

    const visitRoot = (project: ProjectsDB.Project) => [
      {
        key: '/',
        title: project.name,
        isLeaf: false,
        data: {
          path: [],
        },
        children: visitChildren([], project.files),
      },
    ];

    return visitRoot(this.props.project);
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
        <FileMenu ref={this.menuRef} />
      </div>
    );
  }
}

export default withStyles(sRcTree, s)(FileTree);
