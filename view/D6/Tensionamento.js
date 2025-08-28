sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT1 = BlockBase.extend("com.pontual.sgmr.view.D6.Tensionamento", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "com.pontual.sgmr.view.D6.Tensionamento",
						type: "XML"
					},
					Expanded: {
						viewName: "com.pontual.sgmr.view.D6.Tensionamento",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT1;

	});