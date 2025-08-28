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
                oController.oController = this;
                oView = oController.getView();

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
                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oController.getOwnerComponent().getModel("mensagensModel").setData([])

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

            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            }

        });
    });
