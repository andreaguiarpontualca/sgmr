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

		getLadoIcone: function (value) {
			if (value == "Lado Direito") {
				return "sap-icon://navigation-right-arrow"
			} else {
				return "sap-icon://navigation-left-arrow"
			}
		},	
		
		getDesgasteVisivel: function (value) {	
			if (value != 0.00) {
				return true
			} else {
				return false
			}
		},

		getStatusEquipamento: function (value) {	
			switch (value) {
				case "S":
					return "Warning"
				case "E":
					return "Error"
				case "X":
					return "Error"					
				case "P":
					return "Success"
				default:
					return "None"
			}
		},

		getIconeEquipamento: function (value) {	
			switch (value) {
				case "S":
					return "sap-icon://status-critical"
				case "E":
					return "sap-icon://status-error"
				case "X":
					return "sap-icon://message-error"					
				case "P":
					return "sap-icon://message-warning"
				default:
					return "sap-icon://status-inactive"
			}
		},
		getOrdencaoIcone: function (value) {
			switch (value) {
				case "D":
					return "sap-icon://trend-down"
				case "C":
					return "sap-icon://trend-up"
				default:
					return "sap-icon://arrow-right"
			}
		},							

	};

	return Formatter;

}, /* bExport= */ true);