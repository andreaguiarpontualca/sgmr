sap.ui.define(function () {
	"use strict";

	var count = 0;

	var Formatter = {

		getIconeConexao: function (value) {
			if (value == "online") {
				return "sap-icon://connected"
			} else {
				return "sap-icon://disconnected"
			}
		},

		getCorIconeConexao: function (value) {
			if (value == "online") {
				return "Success"
			} else {
				return "Error"
			}
		},

		getIconeStatusOrdem: function (value) {
			switch (value) {
				case "@09@":
					return "sap-icon://status-critical"
					break;
				case "error":
					return "sap-icon://status-error"
					break;
				case "@08@":
					return "sap-icon://status-positive"
					break
				default:
					return "sap-icon://status-error"
					//					return "sap-icon://status-inactive"
					break;
			}
		},

		getCorIconeStatusOrdem: function (value) {
			switch (value) {
				case "@09@":
					return "Warning"
					break;
				case "error":
					return "Error"
					break;
				case "@08@":
					return "Success"
					break
				default:
					return "Error"
					break;
			}
		},

		getToggleCondicaoBaixo: function (value) {
			if (value != undefined && value == "B") {
				return "Success"
			} else {
				return "Neutral"
			}
		},

		getToggleCondicaoMedio: function (value) {
			if (value != undefined && value == "M") {
				return "Attention"
			} else {
				return "Neutral"
			}
		},

		getToggleCondicaoAlto: function (value) {
			if (value != undefined && value == "A") {
				return "Reject"
			} else {
				return "Neutral"
			}
		},

	};

	return Formatter;

}, /* bExport= */ true);