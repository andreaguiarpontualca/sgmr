sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT2 = BlockBase.extend("com.pontual.sgmr.view.315.RoletesInferiores", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.315.RoletesInferiores",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.315.RoletesInferiores",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT2;

	});