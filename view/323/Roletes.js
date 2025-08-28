sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.323.Roletes", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.323.Roletes",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.323.Roletes",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});