sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D6.RoletesSuperiores", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D6.RoletesSuperiores",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D6.RoletesSuperiores",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;
	});
