import QUnit from 'steal-qunit';
import { ViewModel } from './view-3d';

// ViewModel unit tests
QUnit.module('svg-roomplanner/view-3d');

QUnit.test('Has message', function(){
  var vm = new ViewModel();
  QUnit.equal(vm.attr('message'), 'This is the view-3d component');
});
