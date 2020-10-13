// @flow

import Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';
import 'blockly/python';
import De from 'blockly/msg/de';
import En from 'blockly/msg/en';

import { type LocaleMap } from '../../../translations';

import { type Locale as BlocklyLocale } from '../Blockly';

import './blocks/async_procedures_js';
import * as hedgehogBlocks from './blocks/hedgehog';
import * as miscBlocks from './blocks/misc';
import DeHedgehog from './blocks/hedgehog_msg_de';
import EnHedgehog from './blocks/hedgehog_msg_en';
import DeMisc from './blocks/misc_msg_de';
import EnMisc from './blocks/misc_msg_en';

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

export default Blockly;

export {
  hedgehogBlocks,
  miscBlocks,
  LOCALES,
}