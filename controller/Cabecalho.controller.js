sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel',
    "sap/m/Dialog",
    "sap/m/Button",
],
    function (Controller, formatter, MessagePopover, MessageItem, JSONModel, Dialog, Button) {
        "use strict";
        var oView
        var oController

        return Controller.extend("com.pontual.sgmr.controller.Cabecalho", {
            onInit: function () {
                oController = this;
                oController.oController = this;
                oView = oController.getView();

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oView.bindElement("materialRodanteFormularioModel>/")

            },

            onNavBack: function () {
                this.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);
            },



        });
    });
