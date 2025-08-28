sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX5500.Observacoes", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX5500.Observacoes",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX5500.Observacoes",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});