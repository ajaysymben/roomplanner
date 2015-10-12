import F from 'funcunit';
import QUnit from 'steal-qunit';

F.attach(QUnit);

QUnit.module('svg-roomplanner functional smoke test', {
  beforeEach() {
    F.open('../development.html');
  }
});

QUnit.test('svg-roomplanner main page shows up', function() {
  F('title').text('svg-roomplanner', 'Title is set');
});
