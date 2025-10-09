sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.SharedBlocks.Retornos", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.SharedBlocks.Retornos",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.SharedBlocks.Retornos",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});