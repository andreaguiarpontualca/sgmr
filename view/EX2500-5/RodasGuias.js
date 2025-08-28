sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX2500-5.RodasGuias", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX2500-5.RodasGuias",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX2500-5.RodasGuias",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});