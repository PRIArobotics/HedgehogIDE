// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import { type TaskHandle } from '../components/ide/Executor/Executor';
import baseEmit from './base';
// <GSL customizable: misc-imports>
import PluginManager from './PluginManager';
import Executor from '../components/ide/Executor';
import { type ConsoleType } from '../components/ide/Console';

// </GSL customizable: misc-imports>

export default async function init(getConsole: () => Promise<ConsoleType>, onExit: (string | void) => void | Promise<void>, pluginManager: PluginManager, executor: Executor) {
  // <default GSL customizable: misc-init>
  // Your module initialization code

  // </GSL customizable: misc-init>

  const emit = baseEmit.bind(null, 'misc');

  async function print(text: any) {
    // <GSL customizable: misc-body-print>
    (await getConsole()).print(text.toString(), 'stdout');
    // </GSL customizable: misc-body-print>
  }

  async function exit(error: string | void) {
    // <GSL customizable: misc-body-exit>
    // Your function code goes here
    if (error) {
      (await getConsole()).print(error, 'stderr');
    }
    await onExit(error);
    // </GSL customizable: misc-body-exit>
  }

  async function pluginReady() {
    // <GSL customizable: misc-body-pluginReady>
    // Your function code goes here
    pluginManager.onPluginReady();
    // </GSL customizable: misc-body-pluginReady>
  }

  return {
    // <default GSL customizable: misc-extra-return>
    // Space for extra exports

    // </GSL customizable: misc-extra-return>
    emit,
    handlers: {
      'misc_print': ({ text }: { text: any }) => print(text),
      'misc_exit': ({ error }: { error: string | void }) => exit(error),
      'misc_pluginReady': ({  }: {  }) => pluginReady(),
    },
  };
}
