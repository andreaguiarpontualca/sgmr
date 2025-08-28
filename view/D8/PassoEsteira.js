sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D8.PassoEsteira", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D8.PassoEsteira",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D8.PassoEsteira",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});