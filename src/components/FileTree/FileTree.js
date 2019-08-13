// @flow

import React from 'react';
import Tree from 'rc-tree';
import s from 'rc-tree/assets/index.css';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Menu, MenuItem } from '@material-ui/core';

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
        ],
      },
    ],
  },
];

let anchorEl = null;

type PropTypes = {|
  keys: array,
|};
type StateTypes = {|
  defaultSelectedKeys: array,
  defaultCheckedKeys: array,
|};

class FileTree extends React.Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      selectedKeys: [],
    };
    document.body.addEventListener('mousemove', e => {
      anchorEl = e.target;
    });
  }

  onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys: [info.node.props.eventKey] });
  };

  // TODO implement moving files/directories via drag & drop

  // onDragStart = (event, node) => {
  // };

  // onDragEnd = (event, node) => {
  // };

  handleRightClick = (event, node) => {
    // TODO only right click supported for opening context menu
    this.setState({ selectedKeys: [event.node.props.eventKey] });
    this.setState({ cmOpen: true });
  };

  handleClose = () => {
    this.setState({ cmOpen: false });
  };

  treeOnExpand = keys => {
    this.props.callbackSave(keys);
  }

  render() {
    return (
      <div style={{ margin: '0 10px' }}>
        <Tree
          className="file-tree"
          showLine
          checkable={false}
          selectable
          draggable
          defaultExpandedKeys={this.props.callbackGet()}
          onSelect={this.onSelect}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          onRightClick={this.handleRightClick}
          selectedKeys={this.state.selectedKeys}
          onExpand={this.treeOnExpand}
          treeData={treeData}
        />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={this.state.cmOpen}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}>New Folder</MenuItem>
          <MenuItem onClick={this.handleClose}>New File</MenuItem>
          <MenuItem onClick={this.handleClose}>Rename</MenuItem>
          <MenuItem onClick={this.handleClose}>Delete</MenuItem>
        </Menu>
      </div>
    );
  }
}

export default withStyles(s)(FileTree);
