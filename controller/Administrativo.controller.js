sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel'
],
    function (Controller, formatter, MessagePopover, MessageItem, JSONModel) {
        "use strict";
        var oView;
        var oController;
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.Administrativo", {
            onInit: function () {
                oController = this;
                // oController.registraModeloMensagem();
                oView = oController.getView();
                this.getView().addStyleClass("sapUiSizeCozy");

                oView.bindElement("conexaoModel>/");
                oView.bindElement("busyDialogModel>/");

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Administrativo").attachMatched(this._handleRouteMatched, this);

            },

            onNavBack: function () {
                this.getRouter().navTo("Inicio", {}, true /*no history*/);
            },

            _handleRouteMatched: function (oEvent) {
                oController.limparMensagens();
                oView.bindElement("acessosModel>/");
            },

            onEntrarPerfil: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("ListaPerfil", null, true);
            },

            onEntrarUsuario: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("ListaUsuario", null, true);
            },

            onAssociarFormulario: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("AssociarFormulario", null, true);
            },


            onSincronizar: function (oEvent) {
              oController.getOwnerComponent().getRouter().navTo("Sincronizar", null, true);
            }

        });
    });
