import history from '../core/history';

class History {
  currentLocation;

  scrollPositionsHistory = {};

  render;

  constructor(render) {
    this.currentLocation = history.location;
    this.render = render;
  }

  async initialRender() {
    await this.onLocationChange(this.currentLocation);
  }

  async onLocationChange(location, action) {
    // Remember the latest scroll position for the previous location
    this.scrollPositionsHistory[this.currentLocation.key] = {
      scrollX: window.pageXOffset,
      scrollY: window.pageYOffset,
    };

    // Delete stored scroll position for next page if any
    if (action === 'PUSH') {
      delete this.scrollPositionsHistory[location.key];
    }

    this.currentLocation = location;
    const isInitialRender = !action;
    await this.render(this, location, isInitialRender);
  }

  // eslint-disable-next-line class-methods-use-this
  replace(redirect) {
    history.replace(redirect);
  }

  restoreScrolling(location) {
    let scrollX = 0;
    let scrollY = 0;
    const pos = this.scrollPositionsHistory[location.key];
    if (pos) {
      scrollX = pos.scrollX;
      scrollY = pos.scrollY;
    } else {
      const targetHash = location.hash.substr(1);
      if (targetHash) {
        const target = document.getElementById(targetHash);
        if (target) {
          scrollY = window.pageYOffset + target.getBoundingClientRect().top;
        }
      }
    }

    // Restore the scroll position if it was saved into the state
    // or scroll to the given #hash anchor
    // or scroll to top of the page
    window.scrollTo(scrollX, scrollY);
  }
}

export default function setup(render) {
  const h = new History(render);

  // Handle client-side navigation by using HTML5 History API
  // For more information visit https://github.com/mjackson/history#readme
  history.listen(h.onLocationChange.bind(h));
  h.initialRender();
}
