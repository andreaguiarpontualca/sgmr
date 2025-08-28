sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT2 = BlockBase.extend("com.pontual.sgmr.view.EX2500-5.RoletesSuperiores", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX2500-5.RoletesSuperiores",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX2500-5.RoletesSuperiores",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT2;

	});
