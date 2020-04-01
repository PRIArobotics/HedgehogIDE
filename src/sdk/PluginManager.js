// @flow

import { fs } from 'filer';

import type { Task } from '../components/ide/Executor';
import Executor from '../components/ide/Executor';
import { Project } from '../core/store/projects';

type Plugin = {
  name: string,
  task: Task,
};

class PluginManager {
  executor: Executor;
  plugins: Plugin[] = [];

  constructor(executor) {
    this.executor = executor;
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
            return {
              name: pluginFile.name,
              task: this.executor.addTask({
                code,
                api: {
                  exit: () => null,
                },
              }),
            };
          }),
      )),
    );
  }
}
export default PluginManager;
