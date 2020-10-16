// @flow

export function anyAncestor(block, condition) {
  for (
    let ancestor = block.getSurroundParent();
    ancestor !== null;
    ancestor = ancestor.getSurroundParent()
  ) {
    if (condition(ancestor)) return true;
  }
  return false;
}

export function forbidsAncestor(types, warning) {
  return function onchange() {
    // Don't change state at the start of a drag.
    if (this.workspace.isDragging()) return;

    // Is the block nested in a forbidden ancestor?
    const legal = !anyAncestor(this, (block) => types.indexOf(block.type) !== -1);
    if (legal) {
      this.setWarningText(null);
      if (!this.isInFlyout) this.setEnabled(true);
    } else {
      this.setWarningText(warning);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setEnabled(false);
      }
    }
  };
}

// reads the SETTINGS input and recursively that block's MORE input
// to get a settings object
export function getSettings() {
  let settings: any = {
    position: { x: 0, y: 0 },
    angle: 0,
  };
  for (
    let block = this.getInputTargetBlock('SETTINGS');
    block !== null;
    block = block.getInputTargetBlock('MORE')
  ) {
    const moreSettings = block.getSettings();
    settings = {
      // overwrite settings with later settings
      ...settings,
      ...moreSettings,
      // however merge some specific properties
      ...(('render' in settings || 'render' in moreSettings
        ? {
            render: {
              ...settings.render,
              ...moreSettings.render,
            },
          }
        : null): any),
      ...(('plugin' in settings || 'plugin' in moreSettings
        ? {
            plugin: {
              hedgehog: {
                ...settings.plugin?.hedgehog,
                ...moreSettings.plugin?.hedgehog,
              },
            },
          }
        : null): any),
    };
  }
  return settings;
}

// collects settings from the object and all its ancestor groups and collects them into one setting object
export function collectSettings(object) {
  // position and angle are treated separately to other settings
  let { position, angle, ...settings } = object.getSettings();

  for (
    let group = object.getSurroundParent();
    group.type === 'simulator_group';
    group = group.getSurroundParent()
  ) {
    const { position: outerPosition, angle: outerAngle, ...outerSettings } = group.getSettings();

    const cos = Math.cos(outerAngle);
    const sin = Math.sin(outerAngle);
    position = {
      x: outerPosition.x + cos * position.x - sin * position.y,
      y: outerPosition.y + sin * position.x + cos * position.y,
    };
    angle += outerAngle;

    settings = {
      // we're going from most to least specific, so don't override properties already present
      ...outerSettings,
      ...settings,
      // however merge some specific properties
      ...(('render' in outerSettings || 'render' in settings
        ? {
            render: {
              ...outerSettings.render,
              ...settings.render,
            },
          }
        : null): any),
      ...(('plugin' in outerSettings || 'plugin' in settings
        ? {
            plugin: {
              hedgehog: {
                ...outerSettings.plugin?.hedgehog,
                ...settings.plugin?.hedgehog,
              },
            },
          }
        : null): any),
    };
  }
  return {
    position,
    angle,
    ...settings,
  };
}
