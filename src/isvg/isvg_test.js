import QUnit from 'steal-qunit';
import { ViewModel } from './isvg';

// ViewModel unit tests
QUnit.module('svg-roomplanner/isvg');

QUnit.test('Has message', function(){
  var vm = new ViewModel();
  QUnit.equal(vm.attr('message'), 'This is the interactive-svg component');
});
