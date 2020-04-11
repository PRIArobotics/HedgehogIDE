// @flow

import { fs } from 'filer';

import type { Task } from '../components/ide/Executor';
import Executor from '../components/ide/Executor';
import { Project } from '../core/store/projects';
import Simulator from '../components/ide/Simulator';
import initMiscSdk from './misc';
import initHedgehogSdk from './hedgehog';
import initBlocklySdk from './blockly';

type Plugin = {
  name: string,
  task: Task,
};

class PluginManager {
  executor: Executor;
  plugins: Plugin[] = [];
  pluginReadyResolvers: (() => void)[] = [];

  getConsole: () => Promise<Console>;
  getSimulator: () => Promise<Simulator>;
  sdk;

  constructor(executor, getConsole, getSimulator) {
    this.executor = executor;
    this.getConsole = getConsole;
    this.getSimulator = getSimulator;
  }

  async initSdk() {
    // TODO: add on exit handler
    this.sdk = {
      misc: await initMiscSdk(this.getConsole, () => {}, this, this.executor),
      hedgehog: await initHedgehogSdk(this.getSimulator),
      blockly: await initBlocklySdk(),
    };
  }

  async loadFromProjectMetadata(project: Project) {
    const pluginFolderPath = project.resolve('.metadata', 'plugins');
    try {
      const stat = await fs.promises.stat(pluginFolderPath);
      if (!stat.isDirectory()) {
        return;
      }
    } catch (e) {
      if (e && e.code === 'ENOENT') {
        return;
      } else {
        throw e;
      }
    }

    const sh = new fs.Shell();
    const pluginFiles = await sh.promises.ls(pluginFolderPath);
    this.plugins.push(
      ...(await Promise.all(
        pluginFiles
          .filter(pluginFile => pluginFile.name.endsWith('.js'))
          .map(async pluginFile => {
            const code = await fs.promises.readFile(
              project.resolve('.metadata', 'plugins', pluginFile.name),
              'utf8',
            );
            return this.addPlugin(pluginFile.name, code);
          }),
      )),
    );
  }

  async addPlugin(name: string, code: string) {
    const readyPromise = new Promise(resolve => {
      this.pluginReadyResolvers.push(resolve);
    });
    const plugin = {
      name,
      task: this.executor.addTask({
        code,
        api: {
          ...this.sdk.misc.handlers,
          ...this.sdk.hedgehog.handlers,
          ...this.sdk.blockly.handlers,
        },
      }),
    };
    await readyPromise;
    return plugin;
  }

  onPluginReady = () => this.pluginReadyResolvers.shift()();
}
export default PluginManager;
