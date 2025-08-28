sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D9T.PinosSapatas", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.pontual.sgmr.view.D9T.PinosSapatas",
					type: "XML"
				},
				Expanded: {
					viewName: "com.pontual.sgmr.view.D9T.PinosSapatas",
					type: "XML"
				}
			}
		}
	});
	return BlockBlueT1;
}, true);
