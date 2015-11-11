import QUnit from 'steal-qunit';
import { ViewModel } from './isvg-parts';

// ViewModel unit tests
QUnit.module('svg-roomplanner/isvg-parts');

QUnit.test('Has message', function(){
  var vm = new ViewModel();
  QUnit.equal(vm.attr('message'), 'This is the interactive-svg-parts component');
});
