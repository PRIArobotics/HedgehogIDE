// @flow
/* eslint-disable import/no-duplicates, import/first */

/**
 * Icons (and potentially other UI elements) are associated with more semantic names here and re-exported.
 * For example, instead of using `ArrowLeftIcon` for a "back" navigation action,
 * a "BackIcon" export should be added here so that
 * an icon for the "back" navigation action is only defined once, here,
 * and can be changed in a single place.
 *
 * Icons can be found at https://materialdesignicons.com/
 */

import * as React from 'react';
import { withStyles } from '@material-ui/styles';
import Badge from '@material-ui/core/Badge';

import MenuIcon from 'mdi-material-ui/DotsVertical';

// files: general
import FileIcon from 'mdi-material-ui/File';
import FolderIcon from 'mdi-material-ui/Folder';
import FolderOpenIcon from 'mdi-material-ui/FolderOpen';

// files: code
import LanguageBlocklyIcon from 'mdi-material-ui/Widgets';
import LanguageJavascriptIcon from 'mdi-material-ui/LanguageJavascript';
import LanguagePythonIcon from 'mdi-material-ui/LanguagePython';

// files: other file types
import ImageFileIcon from 'mdi-material-ui/Image';
import MarkdownFileIcon from 'mdi-material-ui/LanguageMarkdown';
import PdfFileIcon from 'mdi-material-ui/FilePdf';

// files: metadata
import MetadataPluginsIcon from 'mdi-material-ui/ToyBrick';
import MetadataAssetsIcon from 'mdi-material-ui/FolderImage';
import MetadataLayoutIcon from 'mdi-material-ui/ViewCompactOutline';
import MetadataSimulatorIcon from 'mdi-material-ui/AxisArrow';
import MetadataToolboxIcon from 'mdi-material-ui/ToolboxOutline';

// projects
import LocalProjectIcon from 'mdi-material-ui/Folder';
import UnlinkExerciseIcon from 'mdi-material-ui/LinkOff';
import UploadExerciseIcon from 'mdi-material-ui/CloudUpload';

// project actions
import RestoreLayoutIcon from 'mdi-material-ui/ViewCompactOutline';
import SettingsIcon from 'mdi-material-ui/Cogs';

// IDE navigation
import SelectLanguageIcon from 'mdi-material-ui/Translate';
import HelpIcon from 'mdi-material-ui/HelpCircleOutline';
import ContestIcon from 'mdi-material-ui/ExclamationThick';
import ControlsIcon from 'mdi-material-ui/TuneVertical';
import IndexDBTestIcon from 'mdi-material-ui/Database';
import WebRTCTestIcon from 'mdi-material-ui/Forum';

// IDE tab components
import ConsoleIcon from 'mdi-material-ui/Console';
import SimulatorIcon from 'mdi-material-ui/AxisArrow';

// file/collection actions
import CreateIcon from 'mdi-material-ui/Plus';
import OpenIcon from 'mdi-material-ui/FolderOpen';
import RenameIcon from 'mdi-material-ui/Pencil';
import DeleteIcon from 'mdi-material-ui/Delete';
import RefreshIcon from 'mdi-material-ui/Refresh';
import DownloadIcon from 'mdi-material-ui/Download';
import UploadIcon from 'mdi-material-ui/Upload';

// execution & simulation actions
import ExecuteIcon from 'mdi-material-ui/Play';
import TerminateIcon from 'mdi-material-ui/Stop';
import ResetIcon from 'mdi-material-ui/RotateLeft';
import ZoomInIcon from 'mdi-material-ui/MagnifyPlusOutline';
import ZoomOutIcon from 'mdi-material-ui/MagnifyMinusOutline';
import ZoomFitIcon from 'mdi-material-ui/MagnifyScan';

const TerminateAndResetIconBadge = withStyles({
  badge: {
    bottom: '25%',
    right: '25%',
    background: '#e8e8e8',
    minWidth: 'auto',
    width: '15px',
    height: '15px',
  },
})(Badge);

const TerminateAndResetIcon = React.forwardRef<
  React.ElementConfig<typeof TerminateIcon>,
  TerminateIcon,
>((props, ref) => (
  <TerminateAndResetIconBadge
    overlap="circle"
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    badgeContent={<ResetIcon style={{ fontSize: '15px' }} />}
  >
    <TerminateIcon ref={ref} {...props} />
  </TerminateAndResetIconBadge>
));

import ZoomIcon from 'mdi-material-ui/Magnify';

const ZoomResetIconBadge = withStyles({
  badge: {
    bottom: '25%',
    left: '25%',
    background: '#e8e8e8',
    minWidth: 'auto',
    width: '13px',
    height: '13px',
  },
})(Badge);

const ZoomResetIcon = React.forwardRef<React.ElementConfig<typeof ZoomIcon>, ZoomIcon>(
  (props, ref) => (
    <ZoomResetIconBadge
      overlap="circle"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      badgeContent={<ResetIcon style={{ fontSize: '13px' }} />}
    >
      <ZoomIcon ref={ref} {...props} />
    </ZoomResetIconBadge>
  ),
);

// misc actions
import SlideLeftIcon from 'mdi-material-ui/ChevronLeft';
import SlideRightIcon from 'mdi-material-ui/ChevronRight';
import AccountCircleIcon from 'mdi-material-ui/AccountCircle';
import ExitToAppIcon from 'mdi-material-ui/ExitToApp';

export {
  MenuIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  LanguageBlocklyIcon,
  LanguageJavascriptIcon,
  LanguagePythonIcon,
  ImageFileIcon,
  MarkdownFileIcon,
  PdfFileIcon,
  MetadataPluginsIcon,
  MetadataAssetsIcon,
  MetadataLayoutIcon,
  MetadataSimulatorIcon,
  MetadataToolboxIcon,
  LocalProjectIcon,
  UnlinkExerciseIcon,
  UploadExerciseIcon,
  RestoreLayoutIcon,
  SettingsIcon,
  SelectLanguageIcon,
  HelpIcon,
  ContestIcon,
  ControlsIcon,
  IndexDBTestIcon,
  WebRTCTestIcon,
  ConsoleIcon,
  SimulatorIcon,
  CreateIcon,
  OpenIcon,
  RenameIcon,
  DeleteIcon,
  DownloadIcon,
  UploadIcon,
  RefreshIcon,
  ExecuteIcon,
  TerminateIcon,
  ResetIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ZoomFitIcon,
  ZoomResetIcon,
  TerminateAndResetIcon,
  SlideLeftIcon,
  SlideRightIcon,
  AccountCircleIcon,
  ExitToAppIcon,
};
