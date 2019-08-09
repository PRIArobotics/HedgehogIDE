import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Tree from 'rc-tree';
import s from 'rc-tree/assets/index.css';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// eslint-disable-next-line css-modules/no-unused-class
import { Menu, MenuItem } from '@material-ui/core';

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
let cmOpen = false;

class FileTree extends React.Component {
  static propTypes = {
    keys: PropTypes.array,
  };

  state = {
    selectedKeys: [],
  };

  constructor(props) {
    super(props);
    const { keys } = props;
    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
    };
    document.body.addEventListener('mousemove', e => (anchorEl = e.target));
  }

  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    this.setState({ selectedKeys: [info.node.props.eventKey] });

    if (this.tree) {
      console.log(
        'Selected DOM node:',
        selectedKeys.map(key =>
          ReactDOM.findDOMNode(this.tree.domTreeNodes[key]),
        ),
      );
    }
  };

  onDragStart = (event, node) => {
    console.log('Begin', event, node);
  };

  onDragEnd = (event, node) => {
    console.log('End', event, node);
  };

  handleRightClick = (event, node) => {
    this.setState({ selectedKeys: [event.node.props.eventKey] });
    cmOpen = true;
  };

  handleClose = () => {
    cmOpen = false;
    this.setState(this.state);
  };

  render() {
    return (
      <div style={{ margin: '0 10px' }}>
        <Tree
          className="file-tree"
          showLine
          checkable={false}
          selectable
          draggable
          defaultExpandAll
          defaultSelectedKeys={this.state.defaultSelectedKeys}
          defaultCheckedKeys={this.state.defaultCheckedKeys}
          onSelect={this.onSelect}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          onRightClick={this.handleRightClick}
          selectedKeys={this.state.selectedKeys}
          treeData={treeData}
        />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={cmOpen}
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
