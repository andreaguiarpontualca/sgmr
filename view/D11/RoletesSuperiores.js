sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D11.RoletesSuperiores", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D11.RoletesSuperiores",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D11.RoletesSuperiores",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;
	});
