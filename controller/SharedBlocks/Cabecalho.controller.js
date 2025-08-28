sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
    "use strict";
        var oView
        var oController

    return Controller.extend("com.pontual.sgmr.controller.Cabecalho", {
        onInit: function() {
            /* var oModel = this.getOwnerComponent().getModel("materialRodanteCriarModel");
            if (!oModel) {
                oModel = new JSONModel();
                this.getOwnerComponent().setModel(oModel, "materialRodanteCriarModel");
            }
            var oData = oModel.getData() || {};
            if (!oData.Data) {
                oData.Data = new Date();
                oModel.setData(oData);
            } */

            oController = this;
            oController.oController = this;
            oView = oController.getView();

            var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.getRoute("Cabecalho").attachMatched(this._handleRouteMatched, this);
        },

        handleRouteMatched: function(oEvent) {

            
            
            oView.bindElement("materialRodanteCriarModel>/");
           
        }
    });
});
