sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX1200-7.RoletesSuperiores", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX1200-7.RoletesSuperiores",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX1200-7.RoletesSuperiores",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;
	});
