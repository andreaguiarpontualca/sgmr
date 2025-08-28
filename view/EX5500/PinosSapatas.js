sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.EX5500.PinosSapatas", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.EX5500.PinosSapatas",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.EX5500.PinosSapatas",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});