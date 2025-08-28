sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.315.Buchas", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.315.Buchas",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.315.Buchas",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});