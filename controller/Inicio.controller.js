sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel'
],
    function (Controller, formatter, MessagePopover, MessageItem, JSONModel) {
        "use strict";
        var oView
        var oController
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.Inicio", {
            onInit: function () {
                oController = this;
                oController.oController = this;
                oView = oController.getView();

                oView.bindElement("conexaoModel>/");
                oView.bindElement("loginModel>/");
                oView.bindElement("busyDialogModel>/")
                oView.bindElement("acessosModel>/")

                //oController.getOwnerComponent().getModel("usuarioModel").setData({CodUsuario: "USUARIO01"});
                //oController.getOwnerComponent().getModel("usuarioModel").refresh()
                oView.bindElement("usuarioModel>/")
                
                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Inicio").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {

                oController.carregarAcessos();

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                var oMessageTemplate = new MessageItem({
                    type: '{type}',
                    title: '{title}',
                    activeTitle: "{active}",
                    description: '{description}',
                    subtitle: '{subtitle}',
                    counter: '{counter}'
                });

                oMessagePopover = new MessagePopover({
                    items: {
                        path: '/',
                        template: oMessageTemplate
                    },
                    activeTitlePress: function () {

                    }
                });

                var aMensagens = oController.getOwnerComponent().getModel("mensagensModel").getData();
                var aMockMessages = []
                if (aMensagens.length != undefined) {
                    aMensagens.forEach(mensagem => {
                        var oMockMessage = {
                            type: mensagem.type,
                            title: mensagem.title,
                            active: false,
                            description: mensagem.description,
                            subtitle: mensagem.subtitle
                        }
                        aMockMessages.push(oMockMessage)
                    });
                }
                
                oController.getOwnerComponent().getModel("mensagensModel").setData([])

                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);
                this.byId("messagePopoverBtn").addDependent(oMessagePopover);
                
                setTimeout(function() {
                    oController.getOwnerComponent().getModel("busyDialogModel").setProperty("/loginInProgress", false);
                    oController.forceCloseBusyDialog();
                }, 100);
                
            },

            onEntrarOrdem: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("ListaOrdem", null, true);
            },

            onEntrarComboio: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("Comboio", null, true);
            },

            onEntrarAdministrativo: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("Administrativo", null, true);
            },

            onEntrarMaterialRodante: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("ListaMaterialRodante", null, true);
            },

            onSincronizar: function (oEvent) {
                oController.onSincronizarGeral(oController, true)

            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            },

            onTeste: function (oEvent) {
                oController.getOwnerComponent().getRouter().navTo("ObjectPageSection", null, true);
            },



        });
    });
