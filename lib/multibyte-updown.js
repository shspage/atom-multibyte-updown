'use babel';

import MultibyteUpdownEventListener from './multibyte-updown-event-listener';
import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,
  keydownHandler: null,
  clickHandler: null,
  savedLeft: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'multibyte-updown:up': () => this.up(),
      'multibyte-updown:down': () => this.down()
    }));

    this.keydownHandler = new MultibyteUpdownEventListener(
      "keydown", this.onKeyDown.bind(this));
    this.subscriptions.add(this.keydownHandler);

    this.clickHandler = new MultibyteUpdownEventListener(
      "click", this.onClick.bind(this));
    this.subscriptions.add(this.clickHandler);

    this.savedLeft = [];
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  _resetKeydownListener(editor){
    if(this.keydownHandler.resetIfEditorChanged(editor)){
      this.savedLeft = [];
    }
  },

  _detachKeydownListener(editor){
    this.keydownHandler.detach();
    this.savedLeft = [];
  },

  _getLeft(i){
    if(i < this.savedLeft.length){
      return this.savedLeft[i];
    }
    return 0;
  },

  _updown(isUp){
    const editor = atom.workspace.getActiveTextEditor();

    this._resetKeydownListener(editor);
    this.clickHandler.resetIfEditorChanged(editor);

    const elem = editor.getElement();
    const notSaved = (this.savedLeft.length == 0);
    const cursors = editor.getCursors();

    for(let i = 0, iEnd = cursors.length; i < iEnd; i++){
      const cursor = cursors[i];
      const pos = cursor.getScreenPosition();
      const pxPos = elem.pixelPositionForScreenPosition(pos);
      const newPxPos = {
        top : pxPos.top + editor.lineHeightInPixels * (isUp ? -1 : 1),
        left : Math.max(pxPos.left, this._getLeft(i))
      };
      if(notSaved) this.savedLeft.push(pxPos.left);
      const newPos = elem.screenPositionForPixelPosition(newPxPos);
      cursor.setScreenPosition(newPos);
    }
  },

  up() {
    this._updown(true);
  },

  down() {
    this._updown(false);
  },

  onKeyDown(event) {
    if(event.keyCode != 38 && event.keyCode != 40){
      this._detachKeydownListener();
    }
  },

  onClick(event) {
    this._detachKeydownListener();
  }
};
