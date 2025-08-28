sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D11.PinosSapatas", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.pontual.sgmr.view.D11.PinosSapatas",
					type: "XML"
				},
				Expanded: {
					viewName: "com.pontual.sgmr.view.D11.PinosSapatas",
					type: "XML"
				}
			}
		}
	});
	return BlockBlueT1;
}, true);
