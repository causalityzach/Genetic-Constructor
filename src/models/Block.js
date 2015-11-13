import Instance from './Instance';
import randomColor from '../utils/generators/color';

export default class Block extends Instance {
  constructor(...args) {
    super(...args, {
      color: randomColor(),
      components: [],
    });
  }

  addComponents(...components) {
    return this.mutate('components', this.components.concat(components));
  }
}