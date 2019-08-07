import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Tree from 'rc-tree';
import s from 'rc-tree/assets/index.css';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import s1 from './filetree-styling.css';

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

class FileTree extends React.Component {
  static propTypes = {
    keys: PropTypes.array,
  };

  static defaultProps = {
    keys: ['0-0-0-0'],
  };

  constructor(props) {
    super(props);
    const { keys } = props;
    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
    };
  }

  onExpand = (...args) => {
    console.log('onExpand', ...args);
  };

  onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
    this.selKey = info.node.props.eventKey;

    if (this.tree) {
      console.log(
        'Selected DOM node:',
        selectedKeys.map(key =>
          ReactDOM.findDOMNode(this.tree.domTreeNodes[key]),
        ),
      );
    }
  };

  onCheck = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);
  };

  onEdit = () => {
    setTimeout(() => {
      console.log('current key: ', this.selKey);
    }, 0);
  };

  onDel = e => {
    if (!window.confirm('sure to delete?')) {
      return;
    }
    e.stopPropagation();
  };

  onDragStart = (event, node) => {
    console.log('Begin', event, node);
  };

  onDragEnd = (event, node) => {
    console.log('End', event, node);
  };

  setTreeRef = tree => {
    this.tree = tree;
  };

  handleRightClick = () => {
    console.log('Click!');
  };

  render() {
    return (
      <div style={{ margin: '0 10px' }}>
        <ContextMenuTrigger id="filecontext">
          <Tree
            className="file-tree"
            showLine
            checkable={false}
            selectable
            draggable
            defaultExpandAll
            onExpand={this.onExpand}
            defaultSelectedKeys={this.state.defaultSelectedKeys}
            defaultCheckedKeys={this.state.defaultCheckedKeys}
            onSelect={this.onSelect}
            onCheck={this.onCheck}
            onDragStart={this.onDragStart}
            onDragEnd={this.onDragEnd}
            onRightClick={this.handleRightClick}
            treeData={treeData}
          />
        </ContextMenuTrigger>
        {/*
        <ContextMenu id="filecontext">
          <MenuItem>Add New File</MenuItem>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Delete</MenuItem>
        </ContextMenu>
        */}
      </div>
    );
  }
}

export default withStyles(s)(FileTree);
