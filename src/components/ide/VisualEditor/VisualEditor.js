// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';
import withStyles from 'isomorphic-style-loader/withStyles';

import Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';
import 'blockly/python';
import De from 'blockly/msg/de';
import En from 'blockly/msg/en';

import { LocaleConsumer } from '../../locale';
import { getEffectiveLocale } from '../../../translations';

import {
  ExecuteIcon,
  TerminateIcon,
  SlideLeftIcon,
  SlideRightIcon,
  LanguageJavascriptIcon,
  LanguagePythonIcon,
} from '../../misc/palette';

import ColoredIconButton from '../../misc/ColoredIconButton';
import BlocklyComponent from '../Blockly';
import ToolBar from '../ToolBar';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './VisualEditor.scss';

import DeHedgehog from './blocks/hedgehog_msg_de';
import EnHedgehog from './blocks/hedgehog_msg_en';
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
import PrintBlock from './blocks/PrintBlock';

const locales = {
  de: { ...De, ...DeHedgehog },
  en: { ...En, ...EnHedgehog },
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
  PrintBlock,
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
  onExecute: (code: string) => void | Promise<void>,
  onTerminate: () => void | Promise<void>,
  running: boolean,
  layoutNode: any,
|};
type StateTypes = {|
  code: string | null,
  workspaceOptions: any,
|};

class VisualEditor extends React.Component<PropTypes, StateTypes> {
  static defaultProps = {
    codeCollapsed: true,
    codeLanguage: 'JavaScript',
  };

  static dynamicBlockLoaders: [() => Block[]] = [];

  blocklyRef: RefObject<BlocklyComponent> = React.createRef();
  codeRef: RefObject<'pre'> = React.createRef();

  resizeAnim: AnimationFrameID | null;

  state = {
    code: null,
    workspaceOptions: this.buildWorkspaceOptions(),
  };

  componentDidMount() {
    // eslint-disable-next-line no-throw-literal
    if (this.codeRef.current === null) throw 'ref is null in componentDidMount';
    const codeRefCurrent = this.codeRef.current;

    const { layoutNode } = this.props;
    layoutNode.setEventListener('resize', () => {
      if (this.blocklyRef.current)
        this.blocklyRef.current.refreshSizeDeferred();
    });
    layoutNode.setEventListener('visibility', ({ visible }) => {
      if (this.blocklyRef.current)
        this.blocklyRef.current.updateVisibility(visible);
    });
    codeRefCurrent.addEventListener('transitionend', () => {
      if (this.resizeAnim) {
        cancelAnimationFrame(this.resizeAnim);
        this.resizeAnim = null;
      }

      if (this.blocklyRef.current)
        this.blocklyRef.current.refreshSizeDeferred();
    });
  }

  componentDidUpdate(prevProps) {
    const { codeLanguage: prevCodeLanguage } = prevProps;
    const { codeLanguage } = this.props;

    // refresh code when language is changed
    if (prevCodeLanguage !== codeLanguage) this.refreshCode();
  }

  animateWorkspaceSize() {
    this.resizeAnim = requestAnimationFrame(() => {
      if (this.blocklyRef.current) this.blocklyRef.current.refreshSize();
      this.animateWorkspaceSize();
    });
  }

  refreshCode() {
    // eslint-disable-next-line no-throw-literal
    if (this.blocklyRef.current === null) throw 'ref is null';

    const { workspace } = this.blocklyRef.current;

    const language = Blockly[this.props.codeLanguage];
    const code = language.workspaceToCode(workspace);
    this.setState({ code });
  }

  handleBlocklyChange = workspace => {
    this.refreshCode();

    const workspaceXml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspace),
    );
    this.props.onContentChange(workspaceXml);
  };

  setCodeLanguage(codeLanguage: 'JavaScript' | 'Python') {
    this.props.onUpdate({ codeLanguage });
  }

  handleToggleCodeCollapsed = () => {
    this.props.onUpdate({ codeCollapsed: !this.props.codeCollapsed });
    this.animateWorkspaceSize();
  };

  buildWorkspaceOptions() {
    const dynamicBlocks = VisualEditor.dynamicBlockLoaders.length ? (
      <category name="Custom" colour="120">
        {VisualEditor.dynamicBlockLoaders.map(loader =>
          loader().map(block => block.toolboxBlocks.default()),
        )}
      </category>
    ) : null;
    const toolbox = ReactDOM.renderToStaticMarkup(
      <xml>
        <category name="Drive" colour="120">
          {HEDGEHOG_MOVE2_UNLIMITED.toolboxBlocks.default()}
          {HEDGEHOG_MOTOR_OFF2.toolboxBlocks.default()}
          {HEDGEHOG_BRAKE2.toolboxBlocks.default()}
          {HEDGEHOG_MOVE2.toolboxBlocks.default()}
          {HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="Motors" colour="120">
          {HEDGEHOG_MOVE_UNLIMITED.toolboxBlocks.default()}
          {HEDGEHOG_MOTOR_OFF.toolboxBlocks.default()}
          {HEDGEHOG_BRAKE.toolboxBlocks.default()}
          {HEDGEHOG_MOVE.toolboxBlocks.default()}
          {HEDGEHOG_SLEEP.toolboxBlocks.default()}
        </category>
        <category name="Servos" colour="120">
          {HEDGEHOG_SERVO.toolboxBlocks.default()}
          {HEDGEHOG_SERVO_OFF.toolboxBlocks.default()}
        </category>
        <category name="Sensors" colour="120">
          {HEDGEHOG_READ_DIGITAL.toolboxBlocks.default()}
          {HEDGEHOG_READ_ANALOG.toolboxBlocks.default()}
          {HEDGEHOG_READ_ANALOG.toolboxBlocks.comparison()}
        </category>
        {dynamicBlocks}
        <sep />
        <category name="Logic" colour="%{BKY_LOGIC_HUE}">
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
        <category name="Loops" colour="%{BKY_LOOPS_HUE}">
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
        <category name="Math" colour="%{BKY_MATH_HUE}">
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
        <category name="Lists" colour="%{BKY_LISTS_HUE}">
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
          name="Variables"
          custom="VARIABLE"
          colour="%{BKY_VARIABLES_HUE}"
        />
        <category
          name="Functions"
          custom="PROCEDURE"
          colour="%{BKY_PROCEDURES_HUE}"
        />
        <category name="Text" colour="70">
          {PrintBlock.toolboxBlocks.default()}
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
  }

  render() {
    const { content, codeCollapsed, codeLanguage } = this.props;
    const { code } = this.state;

    function getMsg(preferred) {
      const locale = getEffectiveLocale(
        [preferred],
        Object.hasOwnProperty.bind(locales),
      );
      return locale ? locales[locale] : locales.en;
    }

    return (
      <div className={s.tabRoot}>
        {content === null ? null : (
          <LocaleConsumer>{({ preferredLocale }) => (
            <BlocklyComponent
              forwardedRef={this.blocklyRef}
              initialWorkspaceXml={content}
              locale={{ rtl: false, msg: getMsg(preferredLocale) }}
              workspaceOptions={this.state.workspaceOptions}
              onChange={this.handleBlocklyChange}
            />
          )}</LocaleConsumer>
        )}
        <ToolBar>
          <ToolBarItem>
            {this.props.running ? (
              <ColoredIconButton
                onClick={() => this.props.onTerminate()}
                disableRipple
                color="red"
              >
                <TerminateIcon />
              </ColoredIconButton>
            ) : (
              <ColoredIconButton
                onClick={() => {
                  if (code !== null) this.props.onExecute(code);
                }}
                disableRipple
                color="limegreen"
                disabled={code === null || codeLanguage !== 'JavaScript'}
              >
                <ExecuteIcon />
              </ColoredIconButton>
            )}
          </ToolBarItem>
          <ToolBarItem>
            <ColoredIconButton
              onClick={this.handleToggleCodeCollapsed}
              disableRipple
            >
              {codeCollapsed ? <SlideLeftIcon /> : <SlideRightIcon />}
            </ColoredIconButton>
          </ToolBarItem>
          <ToolBarItem>
            <ColoredIconButton
              onClick={() => this.setCodeLanguage('JavaScript')}
              disableRipple
              color={codeLanguage === 'JavaScript' ? 'black' : 'gray'}
            >
              <LanguageJavascriptIcon />
            </ColoredIconButton>
          </ToolBarItem>
          <ToolBarItem>
            <ColoredIconButton
              onClick={() => this.setCodeLanguage('Python')}
              disableRipple
              color={codeLanguage === 'Python' ? 'black' : 'gray'}
            >
              <LanguagePythonIcon />
            </ColoredIconButton>
          </ToolBarItem>
        </ToolBar>
        <pre
          ref={this.codeRef}
          className={
            codeCollapsed
              ? `${s.codeContainer} ${s.collapsed}`
              : s.codeContainer
          }
        >
          {code}
        </pre>
      </div>
    );
  }
}

export default withStyles(s)(VisualEditor);
