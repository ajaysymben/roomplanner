import QUnit from 'steal-qunit';
import { ViewModel } from './pre-saved-rooms';

// ViewModel unit tests
QUnit.module('svg-roomplanner/pre-saved-rooms');

QUnit.test('Has message', function(){
  var vm = new ViewModel();
  QUnit.equal(vm.attr('message'), 'This is the pre-saved-rooms component');
});
