sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX1200-6.Buchas", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX1200-6.Buchas",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX1200-6.Buchas",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});