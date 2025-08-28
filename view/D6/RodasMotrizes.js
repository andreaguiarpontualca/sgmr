sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D6.RodasMotrizes", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D6.RodasMotrizes",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D6.RodasMotrizes",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;
	});
