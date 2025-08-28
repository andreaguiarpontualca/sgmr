sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D8.RodasMotrizes", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D8.RodasMotrizes",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D8.RodasMotrizes",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;
	});
