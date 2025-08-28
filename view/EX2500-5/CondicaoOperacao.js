sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX2500-5.CondicaoOperacao", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX2500-5.CondicaoOperacao",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX2500-5.CondicaoOperacao",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});