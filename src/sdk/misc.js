// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import ExecutorTask from '../components/ide/Executor/ExecutorTask';
import baseEmit from './base';
// <GSL customizable: misc-imports>
import PluginManager from './PluginManager';
import Executor from '../components/ide/Executor';
import { type ConsoleType } from '../components/ide/Console';

// </GSL customizable: misc-imports>

export default async function init(getConsole: () => Promise<ConsoleType>, onExit: () => void | Promise<void>, pluginManager: PluginManager, executor: Executor) {
  // <default GSL customizable: misc-init>
  // Your module initialization code

  // </GSL customizable: misc-init>

  const emit = baseEmit.bind(null, 'misc');

  async function print(text: string) {
    // <GSL customizable: misc-body-print>
    (await getConsole()).print(text, 'stdout');
    // </GSL customizable: misc-body-print>
  }

  async function exit(error: any) {
    // <GSL customizable: misc-body-exit>
    // Your function code goes here
    if (error) {
      (await getConsole()).print(error, 'stderr');
    }
    return onExit(error);
    // </GSL customizable: misc-body-exit>
  }

  async function pluginReady() {
    // <GSL customizable: misc-body-pluginReady>
    // Your function code goes here
    pluginManager.onPluginReady();
    // </GSL customizable: misc-body-pluginReady>
  }

  async function handleEmit(prefix: string, event: string, payload: any) {
    // <GSL customizable: misc-body-emit>
    // Your function code goes here
    return baseEmit(prefix, executor, event, payload);
    // </GSL customizable: misc-body-emit>
  }

  return {
    // <default GSL customizable: misc-extra-return>
    // Space for extra exports

    // </GSL customizable: misc-extra-return>
    emit,
    handlers: {
      'misc_print': ({ text }) => print(text),
      'misc_exit': ({ error }) => exit(error),
      'misc_pluginReady': ({  }) => pluginReady(),
      'misc_emit': ({ prefix, event, payload }) => handleEmit(prefix, event, payload),
    },
  };
}
