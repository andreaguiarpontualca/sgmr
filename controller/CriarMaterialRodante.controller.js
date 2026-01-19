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
                this.getView().addStyleClass("sapUiSizeCompact");

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
                this.limparMensagens();
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
                    oController.adicionarMensagemErro("campoobrigatorio", "materialRodante", "campomaterialRodante");
                    vPodeGravar = false;

                } else {
                    if (oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().length != undefined) {
                        var omaterialRodanteExistente = oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().find((oElement) => oElement.DescrmaterialRodante.toUpperCase() == omaterialRodante.DescrmaterialRodante.toUpperCase());
                        if (omaterialRodanteExistente != undefined) {
                            omaterialRodanteInput.setValueState("Error");
                            oController.adicionarMensagemErro("materialRodanteexistente", "materialRodante", "materialRodanteexistentemsg");
                            vPodeGravar = false;
                        }
                    }
                }

                var vAutorizacoes = omaterialRodante.AutorizacaoSet.find((oOperacao) => oOperacao.Selecionado == true);
                if (vAutorizacoes == undefined) {
                    oController.adicionarMensagemErro("campoobrigatorio", "autorizacao", "campoautorizacao");
                    vPodeGravar = false;
                }

                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                if (vPodeGravar == true) {
                    omaterialRodanteInput.setValueState("None");
                    if (oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().length == undefined) {
                        oController.getOwnerComponent().getModel("listaEquipamentoModel").setData([])
                        oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().push(omaterialRodante)
                    } else {
                        oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().push(omaterialRodante)
                    }
                    var oObjetoNovo = JSON.parse(JSON.stringify(oController.getOwnerComponent().getModel("listaEquipamentoModel").getData()));
                    oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh();
                    oController.limparTabelaIndexDB("tb_materialRodante")
                    .then(() => {
                        oController.gravarTabelaIndexDB("tb_materialRodante", oObjetoNovo)
                        .then(() => {
                            MessageToast.show(oController.i18n("dadossucesso"), {
                                onClose: () => {
                                    if (oController.checkConnection() == true) {
                                        oController.materialRodanteUpdate()
                                        .then(() => {
                                                oController.closeBusyDialog();
                                                oController.getRouter().navTo("ListamaterialRodante", {}, true /*no history*/);
                                                oConfirmarButton.setEnabled(true);
                                                oConfirmarButton.setBusy(false);
                                            });
                                    } else {
                                        oController.closeBusyDialog();
                                        oController.getRouter().navTo("ListamaterialRodante", {}, true /*no history*/);
                                        oConfirmarButton.setEnabled(true);
                                        oConfirmarButton.setBusy(false);
                                    }
                                }
                            });
                        });
                    });
                } else {
                    oConfirmarButton.setEnabled(true);
                    oConfirmarButton.setBusy(false);
                }
            }
        });
    });
