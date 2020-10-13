// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';

import { useLocale } from '../../locale';
import { getTranslation } from '../../../translations';

import * as hooks from '../../misc/hooks';

import Blockly, {
  hedgehogBlocks,
  miscBlocks,
  LOCALES
} from '../VisualEditor/blockly_config.js';

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
        {hedgehogBlocks.HEDGEHOG_MOVE2_UNLIMITED.toolboxBlocks.default()}
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
