sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX5500.PassoEsteiras", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX5500.PassoEsteiras",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX5500.PassoEsteiras",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});