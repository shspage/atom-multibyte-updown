'use babel';

import { Disposable } from 'atom';

export default class MultibyteUpdownEventListener extends Disposable {

  constructor(eventName, method) {
    super();
    this.editor = null;
    this.eventName = eventName;
    this.method = method;
    this.isActive = false;
  }

  attach() {
    if( ! this.isActive && this.editor != null){
      atom.views.getView(this.editor).addEventListener(this.eventName, this.method);
      this.isActive = true;
    }
  }

  detach() {
    if(this.isActive && this.editor != null){
      atom.views.getView(this.editor).removeEventListener(this.eventName, this.method);
      this.isActive = false;
    }
  }

  dispose() {
    this.detach();
  }

  resetIfEditorChanged(editor) {
    let isReset = false;
    if(editor !== this.editor){
      this.detach();
      this.editor = editor;
      isReset = true;
    }
    this.attach();
    return isReset;
  }
}
