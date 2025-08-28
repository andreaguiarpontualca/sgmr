sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var RoletesSuperiores = BlockBase.extend("com.pontual.sgmr.controller.RoletesSuperiores", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.RoletesSuperiores",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.RoletesSuperiores",
						type: "XML"
					}
				}
			}
		});

		return RoletesSuperiores;

	});
