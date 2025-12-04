sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.SharedBlocks.Anexos", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.SharedBlocks.Anexos",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.SharedBlocks.Anexos",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});