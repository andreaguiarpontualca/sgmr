sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D9T.Roletes", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D9T.Roletes",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D9T.Roletes",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});