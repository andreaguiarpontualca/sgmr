sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D11.Sapatas", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D11.Sapatas",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D11.Sapatas",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});