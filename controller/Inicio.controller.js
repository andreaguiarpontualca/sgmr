sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    'sap/ui/model/json/JSONModel'
],
    function (Controller, JSONModel) {
        "use strict";
        var oView
        var oController

        return Controller.extend("com.pontual.sgmr.controller.Inicio", {
            onInit: function () {
                oController = this;
                // oController.registraModeloMensagem();
                oView = oController.getView();
                this.getView().addStyleClass("sapUiSizeCozy");

                oView.bindElement("conexaoModel>/");
                oView.bindElement("loginModel>/");
                oView.bindElement("busyDialogModel>/")
                oView.bindElement("acessosModel>/")
                oView.bindElement("usuarioModel>/")
                
                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Inicio").attachMatched(this._handleRouteMatched, this);

                this.byId("pageMenuInicio").addStyleClass("sapUiSizeCozy");

            },


            _handleRouteMatched: function (oEvent) {
                oController.carregarAcessos();
               
                setTimeout(function() {
                    oController.getOwnerComponent().getModel("busyDialogModel").setProperty("/loginInProgress", false);
                    oController.forceCloseBusyDialog();
                    oController.sincronizaDadosOffline();
                }, 100);
            },

            sincronizaDadosOffline: function() {
                oView.setBusy(true);
                const aLeituras = [
                    oController.carregarDadosIndexDB("tb_autorizacao", "listaAutorizacaoModel"),
                    oController.carregarDadosIndexDB("tb_perfil",      "listaPerfilModel"),
                    oController.carregarDadosIndexDB("tb_centros",     "listaCentrosModel"),
                    oController.carregarDadosIndexDB("tb_usuario",     "listaUsuariosModel"),
                    oController.carregarDadosIndexDB("tb_equipamento", "listaEquipamentoModel"),
                    oController.carregarDadosIndexDB("tb_formulario",  "listaFormularioModel"),
                    oController.carregarDadosIndexDB("tb_medicao",     "listaMedicoesModel")
                ];
                Promise.all(aLeituras).then(() => oView.setBusy(false));
            },

            onEntrarOrdem: function (oEvent) {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("ListaOrdem", null, true);
            },

            onEntrarComboio: function (oEvent) {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("Comboio", null, true);
            },

            onEntrarAdministrativo: function (oEvent) {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("Administrativo", null, true);
            },

            onEntrarMaterialRodante: function (oEvent) {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("ListaMaterialRodante", null, true);
            },

            onEntrarRelatorioInspecao: function (oEvent) {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("RelatorioInspecao", null, true);
            },

            onSincronizar: function (oEvent) {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("Sincronizar", null, true);
            },

            onTeste: function (oEvent) {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("ObjectPageSection", null, true);
            }

        });
    });
