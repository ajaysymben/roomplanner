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
	partsByCategory: null,
	isvgPartsConfig: {
		parts: []
	},
	categoryMenuOpen: false,

	currentCategoryText: "",
	currentSubcategoryText: "Select a category",

	getCategory: function ( category, partsByCategory ) {
		if ( !partsByCategory ) partsByCategory = this.attr( "partsByCategory" );
		if ( !partsByCategory.length ) return null;

		for ( var i = 0; i < partsByCategory.length; i++ ) {
			if ( partsByCategory[ i ].category === category ) {
				return partsByCategory[ i ];
			}
		}
		return null;
	},

	getSubcategory: function ( subcategory, categoryObj ) {
		var subcategories = categoryObj.subcategories;
		if ( !subcategories || !subcategories.length ) return null;

		for ( var i = 0; i < subcategories.length; i++ ) {
			if ( subcategories[ i ].subcategory === subcategory ) {
				return subcategories[ i ];
			}
		}
		return null;
	},

	getParts: function ( category, subcategory, partsByCategory ) {
		if ( !partsByCategory ) partsByCategory = this.attr( "partsByCategory" );
		if ( !partsByCategory.length ) return [];

		var categoryObj = this.getCategory( category, partsByCategory );
		if ( !categoryObj ) return [];

		//default subcategory is same as the category, parts without a subcat will be there
		var subcategoryObj = this.getSubcategory( subcategory || category, categoryObj );
		if ( !subcategoryObj ) return [];
		return subcategoryObj.parts;
	},

	subcategorySelected: function ( category, subcategory ) {
		this.attr( "isvgPartsConfig.parts", this.getParts( category, subcategory ) );
		this.attr( "categoryMenuOpen", false );

		if ( category === subcategory ) {
			this.attr( "currentCategoryText", "" );
			this.attr( "currentSubcategoryText", category );
		} else {
			this.attr( "currentCategoryText", category );
			this.attr( "currentSubcategoryText", subcategory );
		}
	},

	loadSVGParts: function () {
    var jqXHR = $.ajax({
      url: "/items?clientid=" + this.attr( "clientInfo.id" ),
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      cache: false
    });

    var vm = this;

    jqXHR.then( function ( itemsData ) {
    	if ( !itemsData || !itemsData.success ) {
    		console.log( "Error with items.", itemsData );
    	}
    	if ( !itemsData.data || !itemsData.data.length ) {
    		console.log( "Error: no items", itemsData );
    		return;
    	}
    	var parts = itemsData.data;
			var partsByCategory = [];
			var part, i, categoryObj, subcategoryObj;

			for ( i = 0; i < parts.length; i++ ) {
				part = parts[ i ];
				categoryObj = vm.getCategory( part.category, partsByCategory );

				if ( categoryObj === null ) {
					categoryObj = {
						category: part.category,
						subcategories: [],
						parts: [],
						resizeable: part.resizeable
					};
					partsByCategory.push( categoryObj );
				}

				//create a default subcategory that has the same name as the category if there's no subcat for this part
				subcategoryObj = vm.getSubcategory( part.subcategory || part.category, categoryObj );
				if ( subcategoryObj === null ) {
					subcategoryObj = {
						category: part.category,
						subcategory: part.subcategory || part.category,
						parts: []
					};
					categoryObj.subcategories.push( subcategoryObj );
				}

				subcategoryObj.parts.push( part );
			}
			vm.attr( "partsByCategory", partsByCategory );
    });

    return jqXHR;
	}
});

export default Component.extend({
	tag: 'furniture-nav',
	viewModel: ViewModel,
	template,
	events: {
		"init": function () {
			var vm = this.viewModel;
			if ( !vm ) return;
			vm.attr( "isvgPartsConfig" ).onBeforeStartMove = function () {
				if ( $( document.body ).width() <= 800 ) vm.attr( "partsMenuExpanded", false );
			};
			vm.attr( "isvgPartsConfig" ).onAfterStopMove = function () {
				if ( $( document.body ).width() <= 800 ) vm.attr( "partsMenuExpanded", true );
			};
			vm.loadSVGParts();
		},
		".category-dd-current click": function () {
			var vm = this.viewModel;
			var oldState = vm.attr( "categoryMenuOpen" );
			vm.attr( "categoryMenuOpen", !oldState );
		},
		".categories click": function () {
			this.viewModel.attr( "categoryMenuOpen", false );
		}
	}
});