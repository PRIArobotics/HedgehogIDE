// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import useStyles from 'isomorphic-style-loader/useStyles';

import Blockly from 'blockly/core';
// loading this clears any previously set blocks, so make sure this module is loaded
// before adding any custom blocks
import 'blockly/blocks';

import { useLocale } from '../../locale';
import { type LocaleMap, getTranslation } from '../../../translations';

import { SlideLeftIcon, SlideRightIcon } from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import BlocklyComponent, {
  type Locale as BlocklyLocale,
  type WorkspaceTransform,
} from '../Blockly';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './SimulatorEditor.scss';

import useFile, { Project } from '../useFile';

import { schema } from '../Simulator/simulation';

import * as blocks from './blocks';

// TODO translate simulator editor
const LOCALES: LocaleMap<BlocklyLocale> = {
  en: {
    rtl: false,
    msg: {},
  },
};

const workspaceOptions = {
  toolbox: ReactDOM.renderToStaticMarkup(
    <xml>
      <category name="Simulation" colour="120">
        {blocks.SIMULATOR_ROOT.toolboxBlocks.default()}
        {blocks.SIMULATOR_RECT.toolboxBlocks.default()}
        {blocks.SIMULATOR_CIRCLE.toolboxBlocks.default()}
        {blocks.SIMULATOR_SVG.toolboxBlocks.default()}
        {blocks.SIMULATOR_GROUP.toolboxBlocks.default()}
        {blocks.SIMULATOR_GROUP.toolboxBlocks.line()}
      </category>
      <category name="Settings" colour="120">
        {blocks.SIMULATOR_SETTINGS_TRANSLATE.toolboxBlocks.default()}
        <block type="simulator_settings_translate">
          <value name="MORE">
            <block type="simulator_settings_rotate" />
          </value>
        </block>
        {blocks.SIMULATOR_SETTINGS_COLOR.toolboxBlocks.default()}
        {blocks.SIMULATOR_SETTINGS_VISIBILITY.toolboxBlocks.default()}
        {blocks.SIMULATOR_SETTINGS_SPRITE.toolboxBlocks.default()}
        {blocks.SIMULATOR_SETTINGS_SPRITE.toolboxBlocks.external()}
        {blocks.SIMULATOR_SETTINGS_STATIC.toolboxBlocks.default()}
        {blocks.SIMULATOR_SETTINGS_SENSOR.toolboxBlocks.default()}
        <block type="simulator_settings_sensor">
          <value name="MORE">
            <block type="simulator_settings_line" />
          </value>
        </block>
        {blocks.SIMULATOR_SETTINGS_DENSITY.toolboxBlocks.default()}
        {blocks.SIMULATOR_SETTINGS_FRICTION_AIR.toolboxBlocks.default()}
        {blocks.SIMULATOR_SETTINGS_LABEL.toolboxBlocks.default()}
      </category>
      <category name="Robots" colour="120">
        {blocks.SIMULATOR_ROBOT.toolboxBlocks.default()}
        {blocks.SIMULATOR_ROBOT_PART_LINE.toolboxBlocks.default()}
        {blocks.SIMULATOR_ROBOT_PART_TOUCH.toolboxBlocks.default()}
        {blocks.SIMULATOR_ROBOT_PART_DISTANCE.toolboxBlocks.default()}
        {blocks.SIMULATOR_ROBOT_PART_SERVO_ARM.toolboxBlocks.default()}
      </category>
    </xml>,
  ),
  move: {
    scrollbars: true,
    drag: true,
    wheel: false,
  },
  zoom: {
    controls: false,
    wheel: true,
    maxScale: 1.5,
    minScale: 0.4,
    scaleSpeed: 1.02,
  },
  grid: {
    spacing: 20,
    length: 3,
    colour: '#ccc',
    snap: true,
  },
  trashcan: false,
  scrollbars: true,
};

export type ControlledState = {|
  jsonCollapsed: boolean,
  workspaceTransform: WorkspaceTransform,
|};

type Props = {|
  project: Project,
  path: string,
  onConfigChange: (config: schema.Simulation | null) => void | Promise<void>,
  ...ControlledState,
  onUpdate: (state: ControlledState) => void | Promise<void>,
  layoutNode: any,
|};

function generateConfig(workspace: Blockly.Workspace): schema.Simulation | null {
  const roots = workspace.getBlocksByType('simulator_root');
  if (roots.length !== 1) return null;

  const [simulation] = roots;
  return simulation.serialize();
}

export function generateConfigFromXml(workspaceXml: string): schema.Simulation | null {
  const workspace = new Blockly.Workspace();
  Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(workspaceXml), workspace);
  const result = generateConfig(workspace);
  workspace.dispose();
  return result;
}

function SimulatorEditor({
  layoutNode,
  project,
  path,
  onConfigChange,
  jsonCollapsed,
  workspaceTransform,
  onUpdate,
}: Props) {
  const blocklyRef = hooks.useElementRef<typeof BlocklyComponent>();
  const jsonRef = hooks.useElementRef<'pre'>();

  const [content, setContent] = useFile(project, path, 'utf8');

  // update workspace size when the containing tab is resized or made visible
  React.useEffect(() => {
    layoutNode.setEventListener('resize', () => {
      if (blocklyRef.current) blocklyRef.current.refreshSizeDeferred();
    });
    layoutNode.setEventListener('visibility', ({ visible }) => {
      if (blocklyRef.current) blocklyRef.current.updateVisibility(visible);
    });

    return () => {
      layoutNode.setEventListener('resize', null);
      layoutNode.setEventListener('visibility', null);
    };
  }, [layoutNode, blocklyRef]);

  // animate workspace size when the sidebar is expanding or collapsing
  const [startAnimation, stopAnimation] = hooks.useAnimationFrame(() => {
    if (blocklyRef.current) blocklyRef.current.refreshSize();
  });
  React.useEffect(() => {
    if (jsonRef.current === null) return undefined;
    const jsonElem = jsonRef.current;

    const onTransitionEnd = () => {
      stopAnimation();
      if (blocklyRef.current) blocklyRef.current.refreshSizeDeferred();
    };

    jsonElem.addEventListener('transitionend', onTransitionEnd);

    return () => {
      jsonElem.removeEventListener('transitionend', onTransitionEnd);
    };
  });

  function handleToggleJsonCollapsed() {
    onUpdate({ jsonCollapsed: !jsonCollapsed, workspaceTransform });
    startAnimation();
  }

  // handle blockly changes by saving the file and regenerating code
  const [json, setJson] = React.useState<string | null>(null);

  function handleBlocklyChange(workspace: Blockly.Workspace) {
    const config = generateConfig(workspace);
    setJson(config === null ? '' : JSON.stringify(config, undefined, 2));
    onConfigChange(config);

    const workspaceXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    setContent(workspaceXml);
  }

  function handleBlocklyScroll(workspace: Blockly.Workspace) {
    const { scrollX, scrollY, scale } = workspace;
    // eslint-disable-next-line no-shadow
    const workspaceTransform = { scrollX, scrollY, scale };
    onUpdate({ jsonCollapsed, workspaceTransform });
  }

  useStyles(s);
  const { preferredLocales } = useLocale();
  const locale = getTranslation(preferredLocales, LOCALES) ?? LOCALES.en;
  return (
    <div className={s.tabRoot}>
      {content === null ? null : (
        <BlocklyComponent
          forwardedRef={blocklyRef}
          initialWorkspaceXml={content}
          locale={locale}
          workspaceOptions={workspaceOptions}
          workspaceTransform={workspaceTransform}
          onChange={handleBlocklyChange}
          onScroll={handleBlocklyScroll}
        />
      )}
      <ToolBar>
        <ToolBarItem>
          <ToolBarIconButton
            onClick={handleToggleJsonCollapsed}
            icon={jsonCollapsed ? SlideLeftIcon : SlideRightIcon}
            disableRipple
          />
        </ToolBarItem>
      </ToolBar>
      <pre
        ref={jsonRef}
        className={jsonCollapsed ? `${s.jsonContainer} ${s.collapsed}` : s.jsonContainer}
      >
        {json}
      </pre>
    </div>
  );
}
SimulatorEditor.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  jsonCollapsed: true,
  // eslint-disable-next-line react/default-props-match-prop-types
  workspaceTransform: {
    scrollX: 0.0,
    scrollY: 0.0,
    scale: 1.0,
  },
};

export default SimulatorEditor;
