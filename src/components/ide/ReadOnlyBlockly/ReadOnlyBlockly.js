// @flow

import * as React from 'react';
import ReactDOM from 'react-dom/server';

import { useLocale } from '../../locale';
import { getTranslation } from '../../../translations';

import Blockly, { LOCALES } from '../VisualEditor/blockly_config';

import { type Props } from '.';

function ReadOnlyBlockly({ children, width, height }: Props) {
  const [workspaceDiv, setWorkspaceDiv] = React.useState<React.ElementRef<'div'> | null>(null);
  const { preferredLocales } = useLocale();

  React.useEffect(() => {
    if (workspaceDiv === null) return undefined;

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
      <xml xmlns="https://developers.google.com/blockly/xml">{children}</xml>,
    );
    const dom = Blockly.Xml.textToDom(xml);
    Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);

    return () => {
      workspace.dispose();
    };
  }, [workspaceDiv, children, preferredLocales]);

  return <div ref={setWorkspaceDiv} style={{ width, height }} />;
}

export default ReadOnlyBlockly;
