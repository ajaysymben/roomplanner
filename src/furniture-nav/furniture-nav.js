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
		//TODO: query the database for current client's parts
		var data = {
			parts: [
				{ url: "/src/svgs/acid_cab.svg", 								itemname: "acid_cab.svg", 							forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat1", subcategory: "sub1" },
				{ url: "/src/svgs/cab_apronrail.svg", 					itemname: "cab_apronrail.svg", 					forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat1", subcategory: "sub2" },
				{ url: "/src/svgs/cab_openstorage_24.svg", 			itemname: "cab_openstorage_24.svg", 		forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat1", subcategory: null },
				{ url: "/src/svgs/cab_openstorage_36-16.svg", 	itemname: "cab_openstorage_36-16.svg", 	forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat2", subcategory: "sub3" },
				{ url: "/src/svgs/cab_openstorage_36.svg", 			itemname: "cab_openstorage_36.svg", 		forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat3", subcategory: "sub3" },
				{ url: "/src/svgs/cab_openstorage_48-22.svg", 	itemname: "cab_openstorage_48-22.svg", 	forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_openstorageshelf.svg", 		itemname: "cab_openstorageshelf.svg", 	forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_perimiter_18.svg", 				itemname: "cab_perimiter_18.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_perimiter_24.svg", 				itemname: "cab_perimiter_24.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_perimiter_36.svg", 				itemname: "cab_perimiter_36.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_perimiter_48.svg", 				itemname: "cab_perimiter_48.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_perimitercornercab.svg", 	itemname: "cab_perimitercornercab.svg", forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_perimitersink_24.svg", 		itemname: "cab_perimitersink_24.svg", 	forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_perimitersink_36.svg", 		itemname: "cab_perimitersink_36.svg", 	forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_rolllab.svg", 						itemname: "cab_rolllab.svg", 						forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_sinkcab38.svg", 					itemname: "cab_sinkcab38.svg", 					forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_storagemicroscope.svg", 	itemname: "cab_storagemicroscope.svg", 	forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_wall_18.svg", 						itemname: "cab_wall_18.svg", 						forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_wall_24.svg", 						itemname: "cab_wall_24.svg", 						forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cab_wall_48.svg", 						itemname: "cab_wall_48.svg", 						forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/cor_cab.svg", 								itemname: "cor_cab.svg", 								forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fire_cab.svg", 								itemname: "fire_cab.svg", 							forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fireextinguisher.svg", 				itemname: "fireextinguisher.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fumehood_48.svg", 						itemname: "fumehood_48.svg", 						forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fumehood_60.svg", 						itemname: "fumehood_60.svg", 						forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fumehood_72.svg", 						itemname: "fumehood_72.svg", 						forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fumehood_basecab4.svg", 			itemname: "fumehood_basecab4.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fumehood_basecab5.svg", 			itemname: "fumehood_basecab5.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null },
				{ url: "/src/svgs/fumehood_basecab6.svg", 			itemname: "fumehood_basecab6.svg", 			forceWidth: 48, forceHeight: 24, layer: 3, unitprice: 2.5, category: "cat4", subcategory: null }
			]
		};

		var partsByCategory = [];
		var part, i, categoryObj, subcategoryObj;

		for ( i = 0; i < data.parts.length; i++ ) {
			part = data.parts[ i ];
			categoryObj = this.getCategory( part.category, partsByCategory );

			if ( categoryObj === null ) {
				categoryObj = {
					category: part.category,
					subcategories: [],
					parts: []
				};
				partsByCategory.push( categoryObj );
			}

			//create a default subcategory that has the same name as the category if there's no subcat for this part
			subcategoryObj = this.getSubcategory( part.subcategory || part.category, categoryObj );
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
		this.attr( "partsByCategory", partsByCategory );
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
			vm.loadSVGParts();
		},
		".category-dd-current click": function () {
			var vm = this.viewModel;
			var oldState = vm.attr( "categoryMenuOpen" );
			vm.attr( "categoryMenuOpen", !oldState );
		}
	}
});