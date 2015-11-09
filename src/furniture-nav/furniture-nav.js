import Component from 'can/component/';
import Map from 'can/map/';
import 'can/map/define/';
import './furniture-nav.less!';
import template from './furniture-nav.stache!';

export const ViewModel = Map.extend({
  define: {
    message: {
      value: 'This is the furniture-nav component'
    }
  },
  categoryMenuOpen: false
});

export default Component.extend({
  tag: 'furniture-nav',
  viewModel: ViewModel,
  template,
  events: {
  	".category-dd-current click": function () {
  		var vm = this.viewModel;
  		var oldState = vm.attr( "categoryMenuOpen" );
  		vm.attr( "categoryMenuOpen", !oldState );
  	}
  }
});