sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.365_374.Tensionamento", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.365_374.Tensionamento",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.365_374.Tensionamento",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});