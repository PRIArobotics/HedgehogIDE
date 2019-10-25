// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Tree from 'rc-tree';
import sRcTree from 'rc-tree/assets/index.css';

import { Menu, MenuItem } from '@material-ui/core';

import s from './FileTree.scss';

/*
--- rc-tree BUG ---
Open all Nodes (or one child node), then close the root node.
After reloading, the root node will open even though it is not
defined in the localstorage.
*/

// TODO get rid of dummy tree
const treeData = [
  {
    key: '0-0',
    title: 'Root',
    children: [
      {
        key: '0-0-0',
        title: 'Folder #1',
        children: [{ key: '0-0-0-0', title: 'File #1' }],
      },
      {
        key: '0-0-1',
        title: 'Folder #2',
        children: [
          { key: '0-0-1-0', title: 'File #2' },
          { key: '0-0-1-1', title: 'File #3' },
          {
            key: '0-0-1-2',
            title: 'Folder #3',
            children: [
              { key: '0-0-1-2-0', title: 'File #4' },
              { key: '0-0-1-2-1', title: 'File #5' },
            ],
          },
        ],
      },
    ],
  },
];

let anchorEl = null;

type FileTreeState = {|
  expandedKeys: Array<string>,
|};

type PropTypes = {|
  callbackSave: (state: FileTreeState) => void,
  callbackGet: () => FileTreeState,
|};
type StateTypes = {|
  cmOpen: boolean,
  selectedKeys: Array<string>,
|};

class FileTree extends React.Component<PropTypes, StateTypes> {
  rootDivRef: RefObject<'div'> = React.createRef();

  state = {
    cmOpen: false,
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
    anchorEl = e.target;
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
      cmOpen: true,
      selectedKeys: [event.node.props.eventKey],
    });
  };

  handleTreeExpand = expandedKeys => {
    this.props.callbackSave({ expandedKeys });
  };

  handleContextMenuClose = () => {
    this.setState({ cmOpen: false });
  };

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
          treeData={treeData}
        />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={this.state.cmOpen}
          onClose={this.handleContextMenuClose}
        >
          <MenuItem onClick={this.handleContextMenuClose}>New Folder</MenuItem>
          <MenuItem onClick={this.handleContextMenuClose}>New File</MenuItem>
          <MenuItem onClick={this.handleContextMenuClose}>Rename</MenuItem>
          <MenuItem onClick={this.handleContextMenuClose}>Delete</MenuItem>
        </Menu>
      </div>
    );
  }
}

export default withStyles(sRcTree, s)(FileTree);
