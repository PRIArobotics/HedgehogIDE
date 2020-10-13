// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';

import Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';
import 'blockly/python';
import De from 'blockly/msg/de';
import En from 'blockly/msg/en';

import { useLocale } from '../../locale';
import { type LocaleMap, getTranslation } from '../../../translations';

import * as hooks from '../../misc/hooks';

import { type Locale as BlocklyLocale } from '../Blockly';

import '../VisualEditor/blocks/async_procedures_js';
import '../VisualEditor/blocks/hedgehog';
import '../VisualEditor/blocks/misc';
import DeHedgehog from '../VisualEditor/blocks/hedgehog_msg_de';
import EnHedgehog from '../VisualEditor/blocks/hedgehog_msg_en';
import DeMisc from '../VisualEditor/blocks/misc_msg_de';
import EnMisc from '../VisualEditor/blocks/misc_msg_en';

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

type Props = {||};

function ReadOnlyBlockly({}: Props) {
  const [workspaceDiv, setWorkspaceDiv] = React.useState<React.ElementRef<'div'> | null>(null);
  const { preferredLocales } = useLocale();

  React.useEffect(() => {
    if (workspaceDiv === null) return;

    const { rtl, msg } = getTranslation(preferredLocales, LOCALES) ?? LOCALES.en;

    Blockly.setLocale(msg);
    const workspace = Blockly.inject(workspaceDiv, {
      readOnly: true,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true,
      },
      rtl,
      trashcan: false,
    });

    const xml = ReactDOM.renderToStaticMarkup(
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="hedgehog_move">
          <value name="SPEED">
            <shadow type="math_number">
              <field name="NUM">1000</field>
            </shadow>
          </value>
          <value name="TIME">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
      </xml>
    );
    const dom = Blockly.Xml.textToDom(xml);
    Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);

    return () => {
      workspace.dispose();
    };
  }, [workspaceDiv, preferredLocales]);


  return (
    <div ref={setWorkspaceDiv} style={{ height: '60px', width: '920px' }} />
  );
}

export default ReadOnlyBlockly;
