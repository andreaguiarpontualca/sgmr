sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX1200-7.Observacoes", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX1200-7.Observacoes",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX1200-7.Observacoes",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});