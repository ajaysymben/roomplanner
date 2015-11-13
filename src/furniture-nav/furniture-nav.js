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
				{ url: "/src/svgs/acid_cab.svg", itemname: "Acid Storage Cab", category: "Cabinetry / Storage", subcategory: "", forceWidth: 30, forceHeight: 18.5, unitprice: 645.00, itemnumber: "SE8081", layer: 2 - 1 },
				{ url: "/src/svgs/cab_openstorage_36-16.svg", itemname: "36\"L Wall Cabinet", category: "Cabinetry / Storage", subcategory: "", forceWidth: 36, forceHeight: 12, unitprice: 528.40, itemnumber: "AP6555", layer: 2 - 1 },
				{ url: "/src/svgs/cab_openstorage_36.svg", itemname: "Tall Storage Case, 36\"", category: "Cabinetry / Storage", subcategory: "", forceWidth: 36, forceHeight: 22, unitprice: 1359.80, itemnumber: "AP6559", layer: 2 - 1 },
				{ url: "/src/svgs/cab_openstorage_48-22.svg", itemname: "Tall Storage Case, 48\"", category: "Cabinetry / Storage", subcategory: "", forceWidth: 48, forceHeight: 22, unitprice: 1531.75, itemnumber: "AP6560", layer: 2 - 1 },
				{ url: "/src/svgs/cab_openstorageshelf.svg", itemname: "Chemical Shelving Unit", category: "Cabinetry / Storage", subcategory: "", forceWidth: 31, forceHeight: 16, unitprice: 545.00, itemnumber: "SE6010", layer: 2 - 1 },
				{ url: "/src/svgs/cab_perimiter_24.svg", itemname: "Base Storage Cab", category: "Cabinetry / Storage", subcategory: "", forceWidth: 30, forceHeight: 18.5, unitprice: 645.00, itemnumber: "SE8083", layer: 2 - 1 },
				{ url: "/src/svgs/cab_perimiter_36.svg", itemname: "36\"L Base Cabinet", category: "Cabinetry / Storage", subcategory: "", forceWidth: 36, forceHeight: 24, unitprice: 1165.50, itemnumber: "AP6553", layer: 2 - 1 },
				{ url: "/src/svgs/cab_perimiter_48.svg", itemname: "48\"L Base Cabinet", category: "Cabinetry / Storage", subcategory: "", forceWidth: 48, forceHeight: 24, unitprice: 1404.10, itemnumber: "AP6554", layer: 2 - 1 },
				{ url: "/src/svgs/cab_perimitercornercab.svg", itemname: "Corner Cabinet, Rt.", category: "Cabinetry / Storage", subcategory: "", forceWidth: 37, forceHeight: 24, unitprice: 1061.95, itemnumber: "AP6561", layer: 2 - 1 },
				{ url: "/src/svgs/cab_perimitersink_24.svg", itemname: "Clean Up Sink", category: "Cabinetry / Storage", subcategory: "", forceWidth: 55, forceHeight: 28, unitprice: 3258.15, itemnumber: "AP7141", layer: 2 - 1 },
				{ url: "/src/svgs/cab_perimitersink_36.svg", itemname: "36\" Perimeter Sink Cab.", category: "Cabinetry / Storage", subcategory: "", forceWidth: 36, forceHeight: 24, unitprice: 1712.35, itemnumber: "AP6562", layer: 2 - 1 },
				{ url: "/src/svgs/cab_rolllab.svg", itemname: "Mobile Storage Cabinet", category: "Cabinetry / Storage", subcategory: "", forceWidth: 36, forceHeight: 24, unitprice: 719.50, itemnumber: "AP5351", layer: 2 - 1 },
				{ url: "/src/svgs/cab_rolllab.svg", itemname: "Mobile Microscope Cab", category: "Cabinetry / Storage", subcategory: "", forceWidth: 47, forceHeight: 22, unitprice: 824.30, itemnumber: "FB1031", layer: 2 - 1 },
				{ url: "/src/svgs/cab_storagemicroscope.svg", itemname: "Microscope Storage Cab", category: "Cabinetry / Storage", subcategory: "", forceWidth: 36, forceHeight: 24, unitprice: 1595.00, itemnumber: "AP7142", layer: 2 - 1 },
				{ url: "/src/svgs/cab_wall_24.svg", itemname: "36\"L Wall Cabinet", category: "Cabinetry / Storage", subcategory: "", forceWidth: 36, forceHeight: 12, unitprice: 528.40, itemnumber: "AP6555", layer: 3 - 1 },
				{ url: "/src/svgs/cab_wall_48.svg", itemname: "48\"L Wall Cabinet", category: "Cabinetry / Storage", subcategory: "", forceWidth: 48, forceHeight: 12, unitprice: 616.55, itemnumber: "AP6556", layer: 3 - 1 },
				{ url: "/src/svgs/fire_cab.svg", itemname: "Acid Storage Cab", category: "Cabinetry / Storage", subcategory: "", forceWidth: 30, forceHeight: 18.5, unitprice: 645.00, itemnumber: "SE8081", layer: 2 - 1 },
				{ url: "/src/svgs/fire_cab.svg", itemname: "Corrosive Storage Cab", category: "Cabinetry / Storage", subcategory: "", forceWidth: 30, forceHeight: 18.5, unitprice: 645.00, itemnumber: "SE8082", layer: 2 - 1 },
				{ url: "/src/svgs/fire_cab.svg", itemname: "Flammable Cab-wood", category: "Cabinetry / Storage", subcategory: "", forceWidth: 43, forceHeight: 18, unitprice: 785.00, itemnumber: "SE7131", layer: 2 - 1 },
				{ url: "/src/svgs/fire_cab.svg", itemname: "Flammable Cab-metal", category: "Cabinetry / Storage", subcategory: "", forceWidth: 43, forceHeight: 18, unitprice: 1093.50, itemnumber: "SE5445", layer: 2 - 1 },
				{ url: "/src/svgs/fireextinguisher.svg", itemname: "Fire Extinguisher", category: "[ERR NO CATEGORY]", subcategory: "", forceWidth: 14, forceHeight: 14, unitprice: 116.70, itemnumber: "SE3001", layer: 1 - 1 },
				{ url: "/src/svgs/fumehood_48.svg", itemname: "3' Fume Hood", category: "Fume Hoods", subcategory: "", forceWidth: 38.25, forceHeight: 23.25, unitprice: 1153.45, itemnumber: "SE8000", layer: 4 - 1 },
				{ url: "/src/svgs/fumehood_60.svg", itemname: "4'  Fume Hood", category: "Fume Hoods", subcategory: "", forceWidth: 47, forceHeight: 25, unitprice: 5171.05, itemnumber: "SE1900", layer: 4 - 1 },
				{ url: "/src/svgs/fumehood_72.svg", itemname: "6' Fume Hood", category: "Fume Hoods", subcategory: "", forceWidth: 70, forceHeight: 25, unitprice: 6843.90, itemnumber: "SE1901", layer: 4 - 1 },
				{ url: "/src/svgs/fumehood_basecab4.svg", itemname: "Base Cab. - 3' Hood", category: "Fume Hoods", subcategory: "", forceWidth: 38.5, forceHeight: 24, unitprice: 828.25, itemnumber: "SE8003", layer: 2 - 1 },
				{ url: "/src/svgs/fumehood_basecab5.svg", itemname: "Base Cab. - 4' Hood", category: "Fume Hoods", subcategory: "", forceWidth: 47, forceHeight: 30, unitprice: 1082.75, itemnumber: "SE1906", layer: 2 - 1 },
				{ url: "/src/svgs/fumehood_basecab6.svg", itemname: "Base Cab. - 6' Hood", category: "Fume Hoods", subcategory: "", forceWidth: 70, forceHeight: 30, unitprice: 1868.50, itemnumber: "SE1907", layer: 2 - 1 },
				{ url: "/src/svgs/fumehood_xvs.svg", itemname: "Biological Safety Cabinet", category: "[ERR NO CATEGORY]", subcategory: "", forceWidth: 54.5, forceHeight: 31.25, unitprice: 10590, itemnumber: "FB2118", layer: 2 - 1 },
				{ url: "/src/svgs/Instructors_Bench_5.svg", itemname: "Instructor's Bench, 5'", category: "Instructor's Benches", subcategory: "", forceWidth: 60, forceHeight: 30, unitprice: 3075.05, itemnumber: "AP6547", layer: 2 - 1 },
				{ url: "/src/svgs/Instructors_Bench_8.svg", itemname: "Instructor's Bench, 8'", category: "Instructor's Benches", subcategory: "", forceWidth: 96, forceHeight: 30, unitprice: 4412.90, itemnumber: "AP6548", layer: 2 - 1 },
				{ url: "/src/svgs/Instructors_Bench_Attachment.svg", itemname: "Bench Attachment", category: "Instructor's Benches", subcategory: "", forceWidth: 48, forceHeight: 30, unitprice: 1783.50, itemnumber: "", layer: 2 - 1 },
				{ url: "/src/svgs/safety_eyewash.svg", itemname: "Eye Wash", category: "Safety", subcategory: "", forceWidth: 10.8, forceHeight: 10.8, unitprice: 324.20, itemnumber: "SE1010", layer: 1 - 1 },
				{ url: "/src/svgs/safety_firstaid.svg", itemname: "First Aid Kit", category: "Safety", subcategory: "", forceWidth: 10.5, forceHeight: 2.75, unitprice: 74.95, itemnumber: "SE1029", layer: 1 - 1 },
				{ url: "/src/svgs/safety_safetycenter.svg", itemname: "Safety Shower / Eyewash", category: "Safety", subcategory: "", forceWidth: 30, forceHeight: 30, unitprice: 1009.95, itemnumber: "SE1081", layer: 1 - 1 },
				{ url: "/src/svgs/safety_sanitizing.svg", itemname: "Goggle Sanitizer, 36", category: "Safety", subcategory: "", forceWidth: 26.25, forceHeight: 10.25, unitprice: 549.95, itemnumber: "SE1000", layer: 2 - 1 },
				{ url: "/src/svgs/safety_spillcontrol.svg", itemname: "Spill Control Center", category: "Safety", subcategory: "", forceWidth: 17.5, forceHeight: 9, unitprice: 216.95, itemnumber: "AP6448", layer:  - 1 },
				{ url: "/src/svgs/safety_woolfireblanket.svg", itemname: "Fire Blanket", category: "Safety", subcategory: "", forceWidth: 18, forceHeight: 4.5, unitprice: 117.65, itemnumber: "SE3006", layer: 1 - 1 },
				{ url: "/src/svgs/support_chalk.svg", itemname: "Knowledge-Plus Wall", category: "Support Equipment", subcategory: "", forceWidth: 96, forceHeight: 24, unitprice: 7400, itemnumber: "XXXX", layer:  - 1 },
				{ url: "/src/svgs/support_chalk.svg", itemname: "Chalkboard", category: "Support Equipment", subcategory: "", forceWidth: 96, forceHeight: 1, unitprice: 2400, itemnumber: "XXXX", layer: 2 - 1 },
				{ url: "/src/svgs/support_dishwasher.svg", itemname: "SteamScrubber", category: "Support Equipment", subcategory: "", forceWidth: 24.2, forceHeight: 47.5, unitprice: 2400, itemnumber: "XXXX", layer: 2 - 1 },
				{ url: "/src/svgs/sw_2studentscience48.svg", itemname: "2-Student Table,48\"", category: "Workstations, Tables", subcategory: "", forceWidth: 48, forceHeight: 24, unitprice: 582.80, itemnumber: "AP9142", layer: 2 - 1 },
				{ url: "/src/svgs/sw_2studentscience60.svg", itemname: "2-Student Table, 60\"", category: "Workstations, Tables", subcategory: "", forceWidth: 60, forceHeight: 24, unitprice: 695.70, itemnumber: "AP9144", layer: 2 - 1 },
				{ url: "/src/svgs/sw_2studentscience72.svg", itemname: "2-Student Table, 72\"", category: "Workstations, Tables", subcategory: "", forceWidth: 72, forceHeight: 24, unitprice: 804.90, itemnumber: "AP9145", layer: 2 - 1 },
				{ url: "/src/svgs/SW_4student_octagonal.svg", itemname: "4-Student Octagonal", category: "Workstations, Tables", subcategory: "", forceWidth: 56, forceHeight: 56, unitprice: 4147.20, itemnumber: "XXXX", layer: 2 - 1 },
				{ url: "/src/svgs/SW_4studentbench_2sided.svg", itemname: "4-Student Bench, 2-side", category: "Workstations, Tables", subcategory: "", forceWidth: 66, forceHeight: 48, unitprice: 5287.00, itemnumber: "AP7883", layer: 2 - 1 },
				{ url: "/src/svgs/SW_4studentlabexpress.svg", itemname: "Combination Table/Lab Bench", category: "Workstations, Tables", subcategory: "", forceWidth: 96, forceHeight: 50, unitprice: 4170.20, itemnumber: "AP6205", layer: 2 - 1 },
				{ url: "/src/svgs/sw_4studenttwosided.svg", itemname: "4-Student Table, 2-side", category: "Workstations, Tables", subcategory: "", forceWidth: 72, forceHeight: 42, unitprice: 1226.25, itemnumber: "AP9146", layer: 2 - 1 },
				{ url: "/src/svgs/SW_6sidedbench_1sided.svg", itemname: "8-Student Bench, 2-side", category: "Workstations, Tables", subcategory: "", forceWidth: 132, forceHeight: 48, unitprice: 10574.00, itemnumber: "AP7885", layer: 2 - 1 },
				{ url: "/src/svgs/SW_12studentbench_2sided.svg", itemname: "12-Student Bench, 2-side", category: "Workstations, Tables", subcategory: "", forceWidth: 198, forceHeight: 48, unitprice: 15861.00, itemnumber: "AP7887", layer: 2 - 1 },
				{ url: "/src/svgs/sw_ADA_workstation.svg", itemname: "ADA Combo Table/Lab Bench", category: "Workstations, Tables", subcategory: "", forceWidth: 96, forceHeight: 50, unitprice: 4717.12, itemnumber: "AP7882", layer: 2 - 1 },
				{ url: "/src/svgs/sw_ADA_workstation.svg", itemname: "Combo Table/Lab Bench", category: "Workstations, Tables", subcategory: "", forceWidth: 96, forceHeight: 50, unitprice: 4170.20, itemnumber: "AP6205", layer: 2 - 1 },
				{ url: "/src/svgs/sw_chairdeskcombo.svg", itemname: "Portable ADA Station", category: "Workstations, Tables", subcategory: "", forceWidth: 60, forceHeight: 23, unitprice: 2297.50, itemnumber: "AP4557", layer: 2 - 1 },
				{ url: "/src/svgs/SW_student_stool.svg", itemname: "Student Stool 24\"", category: "Workstations, Tables", subcategory: "", forceWidth: 18, forceHeight: 18, unitprice: 59.95, itemnumber: "AP1093", layer: 2 - 1 },
				{ url: "/src/svgs/tech_refrigerator.svg", itemname: "Refrigerator, EP", category: "Support Equipment", subcategory: "", forceWidth: 29.5, forceHeight: 23.5, unitprice: 3793.20, itemnumber: "AP7600", layer: 2 - 1 },
				{ url: "/src/svgs/tech_smart_board.svg", itemname: "SMART Board", category: "Support Equipment", subcategory: "", forceWidth: 73, forceHeight: 1.5, unitprice: 2400, itemnumber: "AP7638", layer: 2 - 1 },
				{ url: "/src/svgs/column.svg", itemname: "Column", category: "Structural Details", subcategory: "", forceWidth: 24, forceHeight: 24, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/door30L.svg", itemname: "Door30L", category: "Structural Details", subcategory: "", forceWidth: 30, forceHeight: 3, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/door30R.svg", itemname: "Door30R", category: "Structural Details", subcategory: "", forceWidth: 30, forceHeight: 3, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/door36L.svg", itemname: "Door36L", category: "Structural Details", subcategory: "", forceWidth: 36, forceHeight: 3, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/door36R.svg", itemname: "Door36R", category: "Structural Details", subcategory: "", forceWidth: 36, forceHeight: 3, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/drain.svg", itemname: "Drain", category: "Structural Details", subcategory: "", forceWidth: 6, forceHeight: 6, unitprice: 0, itemnumber: "0", layer: 1 - 1 },
				{ url: "/src/svgs/electric.svg", itemname: "Electric", category: "Structural Details", subcategory: "", forceWidth: 4, forceHeight: 4, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/gas.svg", itemname: "Gas", category: "Structural Details", subcategory: "", forceWidth: 4, forceHeight: 4, unitprice: 0, itemnumber: "0", layer: 1 - 1 },
				{ url: "/src/svgs/post.svg", itemname: "Post", category: "Structural Details", subcategory: "", forceWidth: 12, forceHeight: 12, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/radiator.svg", itemname: "Radiator", category: "Structural Details", subcategory: "", forceWidth: 36, forceHeight: 3, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/softwall.svg", itemname: "Softwall", category: "Structural Details", subcategory: "", forceWidth: 96, forceHeight: 4, unitprice: 0, itemnumber: "0", layer: 2 - 1 },
				{ url: "/src/svgs/water.svg", itemname: "Water", category: "Structural Details", subcategory: "", forceWidth: 4, forceHeight: 4, unitprice: 0, itemnumber: "0", layer: 1 - 1 },
				{ url: "/src/svgs/window.svg", itemname: "Window", category: "Structural Details", subcategory: "", forceWidth: 36, forceHeight: 2, unitprice: 0, itemnumber: "0", layer: 3 - 1 }
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