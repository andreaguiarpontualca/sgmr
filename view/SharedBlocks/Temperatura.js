sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";
		return BlockBase.extend("com.pontual.sgmr.view.SharedBlocks.Temperatura", {
			metadata: {
				views: {
					Collapsed: { viewName: "com.pontual.sgmr.view.SharedBlocks.Temperatura", type: "XML" },
					Expanded : { viewName: "com.pontual.sgmr.view.SharedBlocks.Temperatura", type: "XML" }
				}
			}
		});
	}
);