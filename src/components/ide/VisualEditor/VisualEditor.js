// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import useStyles from 'isomorphic-style-loader/useStyles';

import Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';
import 'blockly/python';
import De from 'blockly/msg/de';
import En from 'blockly/msg/en';

import { useLocale } from '../../locale';
import { type LocaleMap, getTranslation } from '../../../translations';

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

import ExecutionAction from '../Ide';
import BlocklyComponent, { type Locale as BlocklyLocale } from '../Blockly';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './VisualEditor.scss';

import DeHedgehog from './blocks/hedgehog_msg_de';
import EnHedgehog from './blocks/hedgehog_msg_en';
import DeMisc from './blocks/misc_msg_de';
import EnMisc from './blocks/misc_msg_en';
import './blocks/async_procedures_js';
import {
  HEDGEHOG_MOVE,
  HEDGEHOG_MOVE_UNLIMITED,
  HEDGEHOG_MOTOR_OFF,
  HEDGEHOG_BRAKE,
  HEDGEHOG_MOVE2,
  HEDGEHOG_MOVE2_UNLIMITED,
  HEDGEHOG_MOTOR_OFF2,
  HEDGEHOG_BRAKE2,
  HEDGEHOG_SERVO,
  HEDGEHOG_SERVO_OFF,
  HEDGEHOG_READ_ANALOG,
  HEDGEHOG_READ_DIGITAL,
  HEDGEHOG_SLEEP,
} from './blocks/hedgehog';
import { PRINT_BLOCK } from './blocks/misc';

const LOCALES: LocaleMap<BlocklyLocale> = {
  de: {
    rtl: false,
    msg: { ...De, ...DeHedgehog, ...DeMisc },
  },
  en: {
    rtl: false,
    msg: { ...En, ...EnHedgehog, ...EnMisc },
  },
};

const blocks = [
  HEDGEHOG_MOVE,
  HEDGEHOG_MOVE_UNLIMITED,
  HEDGEHOG_MOTOR_OFF,
  HEDGEHOG_BRAKE,
  HEDGEHOG_MOVE2,
  HEDGEHOG_MOVE2_UNLIMITED,
  HEDGEHOG_MOTOR_OFF2,
  HEDGEHOG_BRAKE2,
  HEDGEHOG_SERVO,
  HEDGEHOG_SERVO_OFF,
  HEDGEHOG_READ_ANALOG,
  HEDGEHOG_READ_DIGITAL,
  HEDGEHOG_SLEEP,
  PRINT_BLOCK,
];
blocks.forEach(block => {
  const { type } = block.blockJson;

  Blockly.Blocks[type] = {
    init() {
      this.jsonInit(block.blockJson);
    },
  };
  Blockly.JavaScript[type] = block.generators.JavaScript;
  Blockly.Python[type] = block.generators.Python;
});

export type ControlledState = $Shape<{|
  codeCollapsed: boolean,
  codeLanguage: 'JavaScript' | 'Python',
|}>;

type PropTypes = {|
  content: string | null,
  onContentChange: (content: string) => void | Promise<void>,
  codeCollapsed: boolean,
  codeLanguage: 'JavaScript' | 'Python',
  onUpdate: (state: ControlledState) => void | Promise<void>,
  onExecutionAction: (action: ExecutionAction) => void | Promise<void>,
  running: boolean,
  layoutNode: any,
|};

function VisualEditor({
  layoutNode,
  content,
  onContentChange,
  codeCollapsed,
  codeLanguage,
  onUpdate,
  onExecutionAction,
  running,
}: PropTypes) {
  const blocklyRef = React.useRef<typeof BlocklyComponent | null>(null);
  const codeRef = React.useRef<HTMLPreElement | null>(null);

  const workspaceOptions = React.useMemo(() => {
    const dynamicBlocks = VisualEditor.dynamicBlockLoaders.length ? (
      <category name="%{BKY_CAT_CUSTOM}" colour="120">
        {VisualEditor.dynamicBlockLoaders.map(loader =>
          loader().map(block => block.toolboxBlocks.default()),
        )}
      </category>
    ) : null;
    const toolbox = ReactDOM.renderToStaticMarkup(
      <xml>
        <category name="%{BKY_HEDGEHOG_CAT_DRIVE}" colour="120">
          {HEDGEHOG_MOVE2_UNLIMITED.toolboxBlocks.default()}
          {HEDGEHOG_MOTOR_OFF2.toolboxBlocks.default()}
          {HEDGEHOG_BRAKE2.toolboxBlocks.default()}
          {HEDGEHOG_MOVE2.toolboxBlocks.default()}
          {HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="%{BKY_HEDGEHOG_CAT_MOTORS}" colour="120">
          {HEDGEHOG_MOVE_UNLIMITED.toolboxBlocks.default()}
          {HEDGEHOG_MOTOR_OFF.toolboxBlocks.default()}
          {HEDGEHOG_BRAKE.toolboxBlocks.default()}
          {HEDGEHOG_MOVE.toolboxBlocks.default()}
          {HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="%{BKY_HEDGEHOG_CAT_SERVOS}" colour="120">
          {HEDGEHOG_SERVO.toolboxBlocks.default()}
          {HEDGEHOG_SERVO_OFF.toolboxBlocks.default()}
        </category>
        <category name="%{BKY_HEDGEHOG_CAT_SENSORS}" colour="120">
          {HEDGEHOG_READ_DIGITAL.toolboxBlocks.default()}
          {HEDGEHOG_READ_ANALOG.toolboxBlocks.default()}
          {HEDGEHOG_READ_ANALOG.toolboxBlocks.comparison()}
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
        <category
          name="%{BKY_CAT_VARIABLES}"
          custom="VARIABLE"
          colour="%{BKY_VARIABLES_HUE}"
        />
        <category
          name="%{BKY_CAT_FUNCTIONS}"
          custom="PROCEDURE"
          colour="%{BKY_PROCEDURES_HUE}"
        />
        <category name="%{BKY_CAT_TEXT}" colour="70">
          {PRINT_BLOCK.toolboxBlocks.default()}
          <block type="text" />
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
        startScale: 1.0,
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
  }, [layoutNode]);

  // animate workspace size when the sidebar is expanding or collapsing
  const resizeAnimRef = React.useRef<AnimationFrameID | null>(null);
  React.useEffect(() => {
    if (codeRef.current === null) return undefined;
    const codeElem = codeRef.current;

    const onTransitionEnd = () => {
      if (resizeAnimRef.current !== null) {
        cancelAnimationFrame(resizeAnimRef.current);
        resizeAnimRef.current = null;
      }

      if (blocklyRef.current) blocklyRef.current.refreshSizeDeferred();
    };

    codeElem.addEventListener('transitionend', onTransitionEnd);

    return () => {
      codeElem.removeEventListener('transitionend', onTransitionEnd);
    };
  });

  const animateWorkspaceSize = () => {
    resizeAnimRef.current = requestAnimationFrame(() => {
      if (blocklyRef.current) blocklyRef.current.refreshSize();
      animateWorkspaceSize();
    });
  };

  const handleToggleCodeCollapsed = () => {
    onUpdate({ codeCollapsed: !codeCollapsed });
    animateWorkspaceSize();
  };

  // handle blockly changes by saving the file and regenerating code
  const [code, setCode] = React.useState<string | null>(null);

  // eslint-disable-next-line no-shadow
  const generateCode = (codeLanguage: 'JavaScript' | 'Python') => {
    // eslint-disable-next-line no-throw-literal
    if (blocklyRef.current === null) throw 'ref is null';
    // eslint-disable-next-line no-throw-literal
    if (blocklyRef.current.workspace === null) throw 'workspace is null';

    const language = Blockly[codeLanguage];
    return language.workspaceToCode(blocklyRef.current.workspace);
  };
  const refreshCode = React.useCallback(() => {
    if (blocklyRef.current === null || blocklyRef.current.workspace === null)
      return;
    setCode(generateCode(codeLanguage));
  }, [codeLanguage]);

  const handleBlocklyChange = workspace => {
    const workspaceXml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace),
    );
    onContentChange(workspaceXml);
    refreshCode();
  };

  // handle language changes by regenerating code
  React.useEffect(() => {
    refreshCode();
  }, [codeLanguage, refreshCode]);

  // eslint-disable-next-line no-shadow
  const setCodeLanguage = (codeLanguage: 'JavaScript' | 'Python') => {
    onUpdate({ codeLanguage });
  };

  useStyles(s);
  const { preferredLocales } = useLocale();
  const locale = getTranslation(preferredLocales, LOCALES) || LOCALES.en;
  return (
    <div className={s.tabRoot}>
      {content === null ? null : (
        <BlocklyComponent
          forwardedRef={blocklyRef}
          initialWorkspaceXml={content}
          locale={locale}
          workspaceOptions={workspaceOptions}
          onChange={handleBlocklyChange}
        />
      )}
      <ToolBar>
        <ToolBarItem>
          <ToolBarIconButton
            onClick={() => {
              onExecutionAction({
                action: 'EXECUTE',
                code: generateCode('JavaScript'),
              });
            }}
            icon={ExecuteIcon}
            color="limegreen"
            disableRipple
            disabled={
              running ||
              blocklyRef.current === null ||
              blocklyRef.current.workspace === null
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
        className={
          codeCollapsed ? `${s.codeContainer} ${s.collapsed}` : s.codeContainer
        }
      >
        {code}
      </pre>
    </div>
  );
}
VisualEditor.defaultProps = {
  codeCollapsed: true,
  codeLanguage: 'JavaScript',
};
// type: [() => Block[]]
VisualEditor.dynamicBlockLoaders = [];

export default VisualEditor;
