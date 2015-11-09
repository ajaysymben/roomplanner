import QUnit from 'steal-qunit';
import { ViewModel } from './furniture-nav';

// ViewModel unit tests
QUnit.module('svg-roomplanner/furniture-nav');

QUnit.test('Has message', function(){
  var vm = new ViewModel();
  QUnit.equal(vm.attr('message'), 'This is the furniture-nav component');
});
