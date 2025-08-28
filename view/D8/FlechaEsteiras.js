sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D8.FlechaEsteiras", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.pontual.sgmr.view.D8.FlechaEsteiras",
					type: "XML"
				},
				Expanded: {
					viewName: "com.pontual.sgmr.view.D8.FlechaEsteiras",
					type: "XML"
				}
			}
		}
	});
	return BlockBlueT1;
}, true);
