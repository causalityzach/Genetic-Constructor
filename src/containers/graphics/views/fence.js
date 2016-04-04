import Box2D from '../geometry/box2d';
import invariant from 'invariant';

/**
 * an interactive fence / drag box for the construct viewer
 */
export default class Fence {

  /**
   * @param ui ConstructViewerUserInterface
   * @param p initial zero point box
   */
  constructor(cvui, point) {
    this.cvui = cvui;
    this.start = point.clone();
    this.createElement();
    this.update(this.start);
  }

  /**
   * create display element for fence
   */
  createElement() {
    this.fenceElement = document.createElement('div');
    this.fenceElement.className = 'fence-element';
    this.cvui.el.appendChild(this.fenceElement);
  }
  /**
   * update fence rendering
   */
  update(newEnd) {
    // update end point of box
    this.end = newEnd.clone();
    // get a normalized rectangle from the start/end points
    const box = Box2D.boxFromPoints([this.start, this.end]);
    // clamp to element
    const client = new Box2D(this.cvui.el.getBoundingClientRect());
    client.x = client.y = 0;
    const final = box.intersectWithBox(client);
    if (final) {
      this.fenceElement.style.left = final.x + 'px';
      this.fenceElement.style.top = final.y + 'px';
      this.fenceElement.style.width = final.w + 'px';
      this.fenceElement.style.height = final.h + 'px';
    }
  }

  /**
   * return our bounds using a normalized box i.e. without negative extents
   */
  getBox() {
    return Box2D.boxFromPoints([this.start, this.end]);
  }

  dispose() {
    invariant(!this.disposed, 'already disposed');
    this.disposed = true;
    // remove the fence element if we have one
    if (this.fenceElement) {
      this.fenceElement.parentElement.removeChild(this.fenceElement);
      this.fenceElement = null;
    }
  }
}
