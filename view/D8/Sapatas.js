sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D8.Sapatas", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D8.Sapatas",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D8.Sapatas",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});