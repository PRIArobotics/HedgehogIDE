// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Tree, { TreeNode } from 'rc-tree';
// $FlowExpectError
import sRcTree from 'rc-tree/assets/index.css';

import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  LanguageBlocklyIcon,
  LanguageJavascriptIcon,
} from '../../misc/palette';

import s from './FileTree.scss';

import type {
  FilerRecursiveStatInfo,
  FilerRecursiveDirectoryInfo,
} from '../../../core/store/projects';

import FileMenu from './FileMenu';

export type FileType = 'FILE' | 'DIRECTORY';
export type FileDesc =
  | {| type: 'DIRECTORY' |}
  | {| type: 'FILE', extension: string |};

export type FileReference = {|
  path: string,
  file: FilerRecursiveStatInfo,
|};

export type DirReference = {|
  path: string,
  file: FilerRecursiveDirectoryInfo,
|};

export type FileAction =
  | {|
      action: 'CREATE',
      parentDir: DirReference,
      desc: FileDesc,
    |}
  | {|
      action: 'RENAME' | 'DELETE' | 'OPEN',
      file: FileReference,
    |};

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
  onFileAction: (action: FileAction) => void | Promise<void>,
  onUpdate: (state: ControlledState) => void | Promise<void>,
|};
type StateTypes = {|
  selectedKeys: Array<string>,
|};

class FileTree extends React.Component<PropTypes, StateTypes> {
  rootDivRef: RefObject<'div'> = React.createRef();
  menuRef: RefObject<typeof FileMenu> = React.createRef();

  state = {
    selectedKeys: [],
  };

  handleFileClick(event: MouseEvent, file: FileReference) {
    this.setState({ selectedKeys: [file.path] });
    event.preventDefault();
  }

  handleFileRightClick(event: MouseEvent, file: FileReference) {
    this.setState({ selectedKeys: [file.path] });

    // eslint-disable-next-line no-throw-literal
    if (this.menuRef.current === null) throw 'ref is null';
    this.menuRef.current.show(
      { left: event.clientX - 2, top: event.clientY - 4 },
      file,
    );

    event.preventDefault();
  }

  handleFileDoubleClick(event: MouseEvent, file: FileReference) {
    this.setState({ selectedKeys: [file.path] });

    if (file.file.isDirectory()) this.setExpandDirectory(file, null);
    else this.props.onFileAction({ action: 'OPEN', file });

    event.preventDefault();
  }

  handleFileKeyDown(event: KeyboardEvent, file: FileReference) {
    // we don't handle any of these
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.isComposing
    )
      return;

    if (file.file.isDirectory())
      switch (event.key) {
        case 'ArrowLeft':
          this.setExpandDirectory(file, false);
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.setExpandDirectory(file, true);
          event.preventDefault();
          break;
        default:
      }
    else
      switch (event.key) {
        case ' ':
        case 'Enter':
          this.props.onFileAction({ action: 'OPEN', file });
          event.preventDefault();
          break;
        default:
      }
  }

  // TODO implement moving files/directories via drag & drop
  handleFileDragStart(file: FileReference) {}
  handleFileDragEnd(file: FileReference) {}

  setExpandDirectory(file: FileReference, state: boolean | null) {
    const expandedKeys = [...this.props.expandedKeys];
    const index = expandedKeys.indexOf(file.path);
    if (state === null) {
      // toggle
      if (index === -1) expandedKeys.push(file.path);
      else expandedKeys.splice(index, 1);
    } else {
      // set/reset
      // eslint-disable-next-line no-lonely-if
      if (index === -1 && state) expandedKeys.push(file.path);
      else if (index !== -1 && !state) expandedKeys.splice(index, 1);
    }
    this.props.onUpdate({ expandedKeys });
  }

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

      const TheIcon = (() => {
        if (isLeaf) {
          if (file.name.endsWith('.blockly')) return LanguageBlocklyIcon;
          if (file.name.endsWith('.js')) return LanguageJavascriptIcon;
          return FileIcon;
        } else {
          return isExpanded ? FolderOpenIcon : FolderIcon;
        }
      })();

      const attrs = {
        key: path,
        isLeaf,
        title: (
          // TODO figure out accessibility
          <span
            onClick={e => this.handleFileClick(e, { path, file })}
            onContextMenu={e => this.handleFileRightClick(e, { path, file })}
            onDoubleClick={e => this.handleFileDoubleClick(e, { path, file })}
            onKeyDown={e => this.handleFileKeyDown(e, { path, file })}
            role="treeitem"
            tabIndex="0"
          >
            <TheIcon className={s.fileIcon} />
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

    const eventToFileRef = ({ node }) => ({
      path: node.props.eventKey,
      file: node.props.file,
    });

    return (
      <div ref={this.rootDivRef}>
        <Tree
          className="file-tree"
          showLine
          showIcon={false}
          checkable={false}
          selectable
          draggable
          expandedKeys={this.props.expandedKeys}
          onExpand={expandedKeys => this.props.onUpdate({ expandedKeys })}
          selectedKeys={this.state.selectedKeys}
          onDragStart={event => this.handleFileDragStart(eventToFileRef(event))}
          onDragEnd={event => this.handleFileDragEnd(eventToFileRef(event))}
        >
          {renderNode('.', this.props.files)}
        </Tree>
        <FileMenu ref={this.menuRef} onFileAction={this.props.onFileAction} />
      </div>
    );
  }
}

export default withStyles(sRcTree, s)(FileTree);
