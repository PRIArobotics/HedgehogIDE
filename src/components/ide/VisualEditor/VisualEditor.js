// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import useStyles from 'isomorphic-style-loader/useStyles';

import { useLocale } from '../../locale';
import { getTranslation } from '../../../translations';

import {
  ExecuteIcon,
  TerminateIcon,
  ResetIcon,
  TerminateAndResetIcon,
  SlideLeftIcon,
  SlideRightIcon,
  LanguageJavascriptIcon,
  LanguagePythonIcon,
} from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import { type ExecutionAction } from '../Ide';
import BlocklyComponent, { type WorkspaceTransform } from '../Blockly';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './VisualEditor.scss';

import useFile, { Project } from '../useFile';

import Blockly, { hedgehogBlocks, miscBlocks, LOCALES } from './blockly_config.js';

export type ControlledState = {|
  codeCollapsed: boolean,
  codeLanguage: 'JavaScript' | 'Python',
  workspaceTransform: WorkspaceTransform,
|};

type Props = {|
  project: Project,
  path: string,
  ...ControlledState,
  onUpdate: (state: ControlledState) => void | Promise<void>,
  onExecutionAction: (action: ExecutionAction) => void | Promise<void>,
  running: boolean,
  layoutNode: any,
|};

/**
 * The Visual editor allows creation of programs using a Blockly-based visual language.
 * Visual programs are translated into JavaScript code for execution,
 * and that code can also be viewed (read-only) side-by-side with the visual code.
 *
 * Besides the editor surface, the toolbar allows running and terminating programs, and resetting the simulation.
 */
function VisualEditor({
  layoutNode,
  project,
  path,
  codeCollapsed,
  codeLanguage,
  workspaceTransform,
  onUpdate,
  onExecutionAction,
  running,
}: Props) {
  const blocklyRef = hooks.useElementRef<typeof BlocklyComponent>();
  const codeRef = hooks.useElementRef<'pre'>();

  const [content, setContent] = useFile(project, path, 'utf8');

  // TODO this has a timing issue, as it depends on `VisualEditor.dynamicBlockLoaders`
  // being fully initialized before the VisualEditor component is created
  const workspaceOptions = React.useMemo(() => {
    const dynamicBlocks = VisualEditor.dynamicBlockLoaders.length ? (
      <category name="%{BKY_CAT_CUSTOM}" colour="120">
        {VisualEditor.dynamicBlockLoaders.map((loader) =>
          loader().map((block) => block.toolboxBlocks.default()),
        )}
      </category>
    ) : null;
    const toolbox = ReactDOM.renderToStaticMarkup(
      <xml>
        <category name="%{BKY_HEDGEHOG_CAT_DRIVE}" colour="120">
          {hedgehogBlocks.HEDGEHOG_MOVE2_UNLIMITED.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_MOVE2.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_MOTOR_OFF2.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_BRAKE2.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="%{BKY_HEDGEHOG_CAT_MOTORS}" colour="120">
          {hedgehogBlocks.HEDGEHOG_MOVE_UNLIMITED.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_MOVE.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_MOTOR_OFF.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_BRAKE.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="%{BKY_HEDGEHOG_CAT_SERVOS}" colour="120">
          {hedgehogBlocks.HEDGEHOG_SERVO.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_SERVO_OFF.toolboxBlocks.default()}
        </category>
        <category name="%{BKY_HEDGEHOG_CAT_SENSORS}" colour="120">
          {hedgehogBlocks.HEDGEHOG_READ_DIGITAL.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_READ_ANALOG.toolboxBlocks.default()}
          {hedgehogBlocks.HEDGEHOG_READ_ANALOG.toolboxBlocks.comparison()}
        </category>
        {dynamicBlocks}
        <sep />
        <category name="%{BKY_CAT_LOGIC}" colour="%{BKY_LOGIC_HUE}">
          <block type="controls_if" />
          <block type="controls_if">
            <mutation else="1" />
          </block>
          <block type="controls_if">
            <mutation elseif="1" else="1" />
          </block>
          <block type="logic_compare" />
          <block type="logic_operation" />
          <block type="logic_negate" />
          <block type="logic_boolean" />
          <block type="logic_null" />
          <block type="logic_ternary" />
        </category>
        <category name="%{BKY_CAT_LOOPS}" colour="%{BKY_LOOPS_HUE}">
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="controls_whileUntil" />
          <block type="controls_for">
            <field name="VAR">i</field>
            <value name="FROM">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
            <value name="TO">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
            <value name="BY">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
          </block>
          <block type="controls_forEach" />
          <block type="controls_flow_statements" />
        </category>
        <category name="%{BKY_CAT_MATH}" colour="%{BKY_MATH_HUE}">
          <block type="math_number">
            <field name="NUM">0</field>
          </block>
          <block type="math_arithmetic" />
          <block type="math_single" />
          <block type="math_trig" />
          <block type="math_constant" />
          <block type="math_number_property" />
          <block type="math_round" />
          <block type="math_on_list" />
          <block type="math_modulo" />
          <block type="math_constrain">
            <value name="LOW">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
            <value name="HIGH">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="math_random_int">
            <value name="FROM">
              <block type="math_number">
                <field name="NUM">1</field>
              </block>
            </value>
            <value name="TO">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="math_random_float" />
          <block type="math_atan2" />
        </category>
        <category name="%{BKY_CAT_LISTS}" colour="%{BKY_LISTS_HUE}">
          <block type="lists_create_empty" />
          <block type="lists_create_with" />
          <block type="lists_repeat">
            <value name="NUM">
              <block type="math_number">
                <field name="NUM">5</field>
              </block>
            </value>
          </block>
          <block type="lists_length" />
          <block type="lists_isEmpty" />
          <block type="lists_indexOf" />
          <block type="lists_getIndex" />
          <block type="lists_setIndex" />
        </category>
        <sep />
        <category name="%{BKY_CAT_VARIABLES}" custom="VARIABLE" colour="%{BKY_VARIABLES_HUE}" />
        <category name="%{BKY_CAT_FUNCTIONS}" custom="PROCEDURE" colour="%{BKY_PROCEDURES_HUE}" />
        <category name="%{BKY_CAT_TEXT}" colour="70">
          {miscBlocks.PRINT_BLOCK.toolboxBlocks.default()}
          <block type="text" />
          <block type="text_join" inline="true">
            <value name="ADD0">
              <shadow type="text" />
            </value>
            <value name="ADD1">
              <shadow type="text" />
            </value>
          </block>
        </category>
      </xml>,
    );
    return {
      toolbox,
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
  }, []);

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
    if (codeRef.current === null) return undefined;
    const codeElem = codeRef.current;

    const onTransitionEnd = () => {
      stopAnimation();
      if (blocklyRef.current) blocklyRef.current.refreshSizeDeferred();
    };

    codeElem.addEventListener('transitionend', onTransitionEnd);

    return () => {
      codeElem.removeEventListener('transitionend', onTransitionEnd);
    };
  });

  function handleToggleCodeCollapsed() {
    onUpdate({
      codeLanguage,
      codeCollapsed: !codeCollapsed,
      workspaceTransform,
    });
    startAnimation();
  }

  // handle blockly changes by saving the file and regenerating code
  const [code, setCode] = React.useState<string | null>(null);

  // eslint-disable-next-line no-shadow
  function generateCode(codeLanguage: 'JavaScript' | 'Python') {
    // eslint-disable-next-line no-throw-literal
    if (blocklyRef.current === null) throw 'ref is null';
    // eslint-disable-next-line no-throw-literal
    if (blocklyRef.current.workspace === null) throw 'workspace is null';

    const language = Blockly[codeLanguage];
    try {
      return language.workspaceToCode(blocklyRef.current.workspace);
    } catch (err) {
      // Happens e.g. when deleting a function that is used somewhere.
      // Blockly will quickly recover from this, so it's not a big deal.
      // Just make sure the IDE doesn't crash until then.
      return null;
    }
  }
  function refreshCode() {
    if (blocklyRef.current === null || blocklyRef.current.workspace === null) return;
    setCode(generateCode(codeLanguage));
  }

  function handleBlocklyChange(workspace: Blockly.Workspace) {
    const workspaceXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    setContent(workspaceXml);
    refreshCode();
  }

  function handleBlocklyScroll(workspace: Blockly.Workspace) {
    const { scrollX, scrollY, scale } = workspace;
    // eslint-disable-next-line no-shadow
    const workspaceTransform = { scrollX, scrollY, scale };
    onUpdate({ codeLanguage, codeCollapsed, workspaceTransform });
  }

  // handle language changes by regenerating code
  React.useEffect(() => {
    refreshCode();
  });

  // eslint-disable-next-line no-shadow
  function setCodeLanguage(codeLanguage: 'JavaScript' | 'Python') {
    onUpdate({ codeLanguage, codeCollapsed, workspaceTransform });
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
            onClick={() => {
              const code = generateCode('JavaScript');
              if (code !== null) {
                onExecutionAction({
                  action: 'EXECUTE',
                  code,
                });
              }
            }}
            icon={ExecuteIcon}
            color="limegreen"
            disableRipple
            disabled={
              running || blocklyRef.current === null || blocklyRef.current.workspace === null
            }
          />
        </ToolBarItem>
        {running ? (
          <ToolBarItem key="terminate-and-reset">
            <ToolBarIconButton
              onClick={() => {
                onExecutionAction({
                  action: 'TERMINATE',
                  reset: true,
                });
              }}
              icon={TerminateAndResetIcon}
              color="red"
              disableRipple
            />
          </ToolBarItem>
        ) : (
          <ToolBarItem key="reset">
            <ToolBarIconButton
              onClick={() => {
                onExecutionAction({
                  action: 'RESET',
                });
              }}
              icon={ResetIcon}
              disableRipple
            />
          </ToolBarItem>
        )}
        <ToolBarItem>
          <ToolBarIconButton
            onClick={() => {
              onExecutionAction({
                action: 'TERMINATE',
                reset: false,
              });
            }}
            icon={TerminateIcon}
            color="red"
            disableRipple
            disabled={!running}
          />
        </ToolBarItem>
        <div style={{ flex: '1 0 auto' }} />
        <ToolBarItem>
          <ToolBarIconButton
            onClick={handleToggleCodeCollapsed}
            icon={codeCollapsed ? SlideLeftIcon : SlideRightIcon}
            disableRipple
          />
        </ToolBarItem>
        <ToolBarItem>
          <ToolBarIconButton
            onClick={() => setCodeLanguage('JavaScript')}
            icon={LanguageJavascriptIcon}
            color={codeLanguage === 'JavaScript' ? 'black' : 'gray'}
            disableRipple
          />
        </ToolBarItem>
        <ToolBarItem>
          <ToolBarIconButton
            onClick={() => setCodeLanguage('Python')}
            icon={LanguagePythonIcon}
            color={codeLanguage === 'Python' ? 'black' : 'gray'}
            disableRipple
          />
        </ToolBarItem>
      </ToolBar>
      <pre
        ref={codeRef}
        className={codeCollapsed ? `${s.codeContainer} ${s.collapsed}` : s.codeContainer}
      >
        {code}
      </pre>
    </div>
  );
}
VisualEditor.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  codeCollapsed: true,
  // eslint-disable-next-line react/default-props-match-prop-types
  codeLanguage: 'JavaScript',
  // eslint-disable-next-line react/default-props-match-prop-types
  workspaceTransform: {
    scrollX: 0.0,
    scrollY: 0.0,
    scale: 1.0,
  },
};
// type: [() => Block[]]
VisualEditor.dynamicBlockLoaders = [];

export default VisualEditor;
