sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessageToast',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel'
],
    function (Controller, formatter, MessageToast, MessagePopover, MessageItem, JSONModel) {
        "use strict";
        var oController
        var oView
        var oMessagePopover;
        var aMockMessages;

        return Controller.extend("com.pontual.sgmr.controller.CriarMaterialRodante", {
            onInit: function () {
                oController = this;
                oView = oController.getView();

                oView.bindElement("MaterialRodanteCriarModel>/");

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
                        MessageToast.show('Active title is pressed');
                    }
                });

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);
                // this.byId("messagePopoverBtn").addDependent(oMessagePopover);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("CriarMaterialRodante").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {

                aMockMessages = [];
                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                var omaterialRodanteInput = oView.byId("MaterialRodanteInput")
                omaterialRodanteInput.setValueState("None");

                var oConfirmarButton = oView.byId("confirmarMaterialRodanteButton")

                oConfirmarButton.setBusy(false);

            },


            onNavBack: function () {
                this.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);
            },

            onCancelarMaterialRodante: function () {
                this.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);
            },

            onConfirmarMaterialRodante: function () {

                var aMockMessages = [];
                var vPodeGravar = true;
                var oMockMessage = {}
                var omaterialRodante = oController.getOwnerComponent().getModel("materialRodanteCriarModel").getData()
                var omaterialRodanteInput = oView.byId("materialRodanteInput")
                var oConfirmarButton = oView.byId("confirmarmaterialRodanteButton")
                oConfirmarButton.setEnabled(false);
                oConfirmarButton.setBusy(true);

                if (omaterialRodante.DescrmaterialRodante == "") {
                    omaterialRodanteInput.setValueState("Error");
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campomaterialRodante"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("materialRodante"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;

                } else {
                    if (oController.getOwnerComponent().getModel("listamaterialRodanteModel").getData().length != undefined) {
                        var omaterialRodanteExistente = oController.getOwnerComponent().getModel("listamaterialRodanteModel").getData().find((oElement) => oElement.DescrmaterialRodante.toUpperCase() == omaterialRodante.DescrmaterialRodante.toUpperCase());
                        if (omaterialRodanteExistente != undefined) {
                            omaterialRodanteInput.setValueState("Error");
                            var oMockMessage = {
                                type: 'Error',
                                title: oController.getView().getModel("i18n").getResourceBundle().getText("materialRodanteexistente"),
                                description: oController.getView().getModel("i18n").getResourceBundle().getText("materialRodanteexistentemsg"),
                                subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("materialRodante"),
                                counter: 1
                            };
                            aMockMessages.push(oMockMessage)
                            vPodeGravar = false;
                        }
                    }
                }

                var vAutorizacoes = omaterialRodante.AutorizacaoSet.find((oOperacao) => oOperacao.Selecionado == true);
                if (vAutorizacoes == undefined) {
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campoautorizacao"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("autorizacao"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;
                }

                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                if (vPodeGravar == true) {
                    omaterialRodanteInput.setValueState("None");
                    oView.byId("idListaAutorizacoesTable").getSelectedContextPaths().forEach(element => {
                       // oController.getOwnerComponent().getModel("materialRodanteCriarModel").setProperty(element + '/Selecionado', true )
                    });

                    if (oController.getOwnerComponent().getModel("listamaterialRodanteModel").getData().length == undefined) {
                        oController.getOwnerComponent().getModel("listamaterialRodanteModel").setData([])
                        oController.getOwnerComponent().getModel("listamaterialRodanteModel").getData().push(omaterialRodante)
                    } else {
                        oController.getOwnerComponent().getModel("listamaterialRodanteModel").getData().push(omaterialRodante)
                    }
                    var oObjetoNovo = JSON.parse(JSON.stringify(oController.getOwnerComponent().getModel("listamaterialRodanteModel").getData()));
                    oController.getOwnerComponent().getModel("listamaterialRodanteModel").refresh();
                    oController.limparTabelaIndexDB("tb_materialRodante").then(
                        function (result) {
                            oController.gravarTabelaIndexDB("tb_materialRodante", oObjetoNovo).then(
                                function (result) {
                                    MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("dadossucesso"), {
                                        duration: 500,                  // default
                                        onClose: function () {
                                            if (oController.checkConnection() == true) {
                                                oController.materialRodanteUpdate().then(
                                                    function (result) {
                                                        oController.closeBusyDialog();
                                                        oController.getRouter().navTo("ListamaterialRodante", {}, true /*no history*/);
                                                        oConfirmarButton.setEnabled(true);
                                                        oConfirmarButton.setBusy(false);
                                                    }).catch(
                                                        function (result) {

                                                        })
                                            } else {
                                                oController.closeBusyDialog();
                                                oController.getRouter().navTo("ListamaterialRodante", {}, true /*no history*/);
                                                oConfirmarButton.setEnabled(true);
                                                oConfirmarButton.setBusy(false);
                                            }

                                        }
                                    });
                                }).catch(
                                    function (result) {

                                    })
                        }).catch(
                            function (result) {

                            })
                }else{
                    oConfirmarButton.setEnabled(true);
                    oConfirmarButton.setBusy(false);
                }
            },


            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            }


        });
    });
