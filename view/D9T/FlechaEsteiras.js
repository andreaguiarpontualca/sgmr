sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D9T.FlechaEsteiras", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.pontual.sgmr.view.D9T.FlechaEsteiras",
					type: "XML"
				},
				Expanded: {
					viewName: "com.pontual.sgmr.view.D9T.FlechaEsteiras",
					type: "XML"
				}
			}
		}
	});
	return BlockBlueT1;
}, true);
