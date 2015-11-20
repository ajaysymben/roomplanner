import QUnit from 'steal-qunit';
import Roomplan from './roomplan';

QUnit.module('models/roomplan');

QUnit.test('getList', function(){
  stop();
  Roomplan.getList().then(function(items) {
    QUnit.equal(items.length, 2);
    QUnit.equal(items.attr('0.description'), 'First item');
    start();
  });
});
