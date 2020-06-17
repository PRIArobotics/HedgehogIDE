// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import Tree, { TreeNode } from 'rc-tree';
// $FlowExpectError
import sRcTree from 'rc-tree/assets/index.css';

import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  LanguageBlocklyIcon,
  LanguageJavascriptIcon,
  MetadataSimulatorIcon,
  MetadataToolboxIcon,
} from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import s from './FileTree.scss';

import type {
  FilerRecursiveStatInfo,
  FilerRecursiveDirectoryInfo,
} from '../../../core/store/projects';

import FileMenu from './FileMenu';

export type FileType = 'FILE' | 'DIRECTORY';
// prettier-ignore
export type FileDesc =
  | {| type: 'DIRECTORY' |}
  | {| type: 'FILE', extension: string |};
export type MetadataDesc = {|
  type: 'METADATA',
  name: string,
  fileType: FileType,
|};

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
      desc: FileDesc | MetadataDesc,
    |}
  | {|
      action: 'UPLOAD',
      parentDir: DirReference,
    |}
  | {|
      action: 'RENAME' | 'DELETE' | 'OPEN' | 'DOWNLOAD',
      file: FileReference,
    |}
  | {|
      action: 'MOVE',
      file: FileReference,
      destDirPath: string,
    |};

/*
--- rc-tree BUG ---
Open all Nodes (or one child node), then close the root node.
After reloading, the root node will open even though it is not
defined in the localstorage.
*/

export type ControlledState = {|
  expandedKeys: string[],
|};

type Props = {|
  files: FilerRecursiveStatInfo,
  ...ControlledState,
  filter?: (path: string, child: FilerRecursiveStatInfo) => boolean,
  onFileAction: (action: FileAction) => void | Promise<void>,
  onUpdate: (state: ControlledState) => void | Promise<void>,
|};

function FileTree({ files, expandedKeys, filter, onFileAction, onUpdate }: Props) {
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  const rootDivRef = hooks.useElementRef<'div'>();
  const menuRef = hooks.useElementRef<typeof FileMenu>();

  function setExpandDirectory(file: FileReference, state: boolean | null) {
    const newExpandedKeys = [...expandedKeys];
    const index = newExpandedKeys.indexOf(file.path);
    if (state === null) {
      // toggle
      if (index === -1) newExpandedKeys.push(file.path);
      else newExpandedKeys.splice(index, 1);
    } else {
      // set/reset
      // eslint-disable-next-line no-lonely-if
      if (index === -1 && state) newExpandedKeys.push(file.path);
      else if (index !== -1 && !state) newExpandedKeys.splice(index, 1);
    }
    onUpdate({ expandedKeys: newExpandedKeys });
  }

  function handleFileClick(event: MouseEvent, file: FileReference) {
    setSelectedKeys([file.path]);
    event.preventDefault();
  }

  function handleFileRightClick(event: MouseEvent, file: FileReference) {
    setSelectedKeys([file.path]);

    // eslint-disable-next-line no-throw-literal
    if (menuRef.current === null) throw 'ref is null';
    menuRef.current.show({ left: event.clientX - 2, top: event.clientY - 4 }, file);

    event.preventDefault();
  }

  function handleFileDoubleClick(event: MouseEvent, file: FileReference) {
    setSelectedKeys([file.path]);

    if (file.file.isDirectory()) setExpandDirectory(file, null);
    else onFileAction({ action: 'OPEN', file });

    event.preventDefault();
  }

  function handleFileKeyDown(event: KeyboardEvent, file: FileReference) {
    // we don't handle any of these
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing)
      return;

    if (file.file.isDirectory())
      switch (event.key) {
        case 'ArrowLeft':
          setExpandDirectory(file, false);
          event.preventDefault();
          break;
        case 'ArrowRight':
          setExpandDirectory(file, true);
          event.preventDefault();
          break;
        case ' ':
        case 'Enter':
          setExpandDirectory(file, null);
          event.preventDefault();
          break;
        default:
      }
    else
      switch (event.key) {
        case ' ':
        case 'Enter':
          onFileAction({ action: 'OPEN', file });
          event.preventDefault();
          break;
        default:
      }
  }

  function handleFileDrop({ dragNode, node, dropToGap }) {
    const file = {
      path: dragNode.props.eventKey,
      file: dragNode.props.file,
    };
    let destDirPath = node.props.eventKey;
    if (dropToGap) {
      if (destDirPath === '.') return;
      destDirPath += '/..';
    }

    onFileAction({ action: 'MOVE', file, destDirPath });
  }

  const effectiveFilter: (path: string, child: FilerRecursiveStatInfo) => boolean =
    filter ?? (() => true);

  function renderChildren(path: string, children: FilerRecursiveStatInfo[]) {
    return children
      .filter(child => effectiveFilter(path, child))
      .map(child =>
        // eslint-disable-next-line no-use-before-define
        renderNode(`${path}/${child.name}`, child),
      );
  }

  function renderNode(path: string, file: FilerRecursiveStatInfo) {
    const isLeaf = !file.isDirectory();
    const isExpanded = expandedKeys.includes(path);

    const TheIcon = (() => {
      if (isLeaf) {
        if (path === './.metadata/simulator') return MetadataSimulatorIcon;
        if (path === './.metadata/toolbox') return MetadataToolboxIcon;
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
          onClick={e => handleFileClick(e, { path, file })}
          onContextMenu={e => handleFileRightClick(e, { path, file })}
          onDoubleClick={e => handleFileDoubleClick(e, { path, file })}
          onKeyDown={e => handleFileKeyDown(e, { path, file })}
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
      return <TreeNode {...attrs}>{renderChildren(path, dir.contents)}</TreeNode>;
    }
  }

  useStyles(sRcTree);
  useStyles(s);
  return (
    <div ref={rootDivRef}>
      <Tree
        className="file-tree"
        showLine
        showIcon={false}
        checkable={false}
        selectable
        draggable
        expandedKeys={expandedKeys}
        onExpand={
          // eslint-disable-next-line no-shadow
          expandedKeys => onUpdate({ expandedKeys })
        }
        selectedKeys={selectedKeys}
        onDrop={handleFileDrop}
      >
        {renderNode('.', files)}
      </Tree>
      <FileMenu ref={menuRef} onFileAction={onFileAction} />
    </div>
  );
}
export default FileTree;
