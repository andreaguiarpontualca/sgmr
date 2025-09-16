sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessageToast',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel',
    "sap/ui/model/FilterOperator",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    "sap/m/MessageBox",
],
    function (Controller, formatter, MessageToast, MessagePopover, MessageItem, JSONModel, FilterOperator, Sorter, Fragment, Filter, MessageBox) {
        "use strict";
        var oController;
        var oView;
        var oBundle;
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.ListaMaterialRodante", {
            onInit: function () {

                oController = this;
                oView = oController.getView();

                oView.bindElement("listaEquipamentoModel>/");
                oView.bindElement("layoutTelaModel>/");
                oView.bindElement("busyDialogModel>/");
                oView.bindElement("mensagensModel>/");

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("ListaMaterialRodante").attachMatched(this._handleRouteMatched, this);

            },

            _handleRouteMatched: function (oEvent) {

                oBundle = oView.getModel("i18n").getResourceBundle();
                oController.getView().byId("idListaMaterialRodanteTable").setBusy(true);

                /*   var aFilters = []
                  var filter = new sap.ui.model.Filter({ path: "Sincronizado", operator: sap.ui.model.FilterOperator.NE, value1: "E" });
                  aFilters.push(filter);
                  this.getView().byId("idListaMaterialRodanteTable").getBinding("items").filter(aFilters, "Application");
   */
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

                oView.bindElement("listaEquipamentoModel>/");

                oController.lerTabelaIndexDB("tb_medicao").then(
                    function (result) {

                        oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().forEach(element => {
                            var vIdx = result.tb_medicao.findIndex(e => e.Equnr == element.Equnr);
                            if (vIdx == -1) {
                                element.Status = 'S';
                            } else {
                                element.Status = result.tb_medicao[vIdx].Status
                            }
                        });
                        oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh();
                        oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                    }).catch(
                        function (result) {
                            oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                        })

            },


            onNavBack: function () {
                this.getRouter().navTo("Inicio", {}, true /*no history*/);
            },

            onMaterialRodantePress: function (oEvent) {
                var oMaterialRodante = oController.getOwnerComponent().getModel("medicaoSelecionadaModel").getData()
                oMaterialRodante.FormularioCarregado = false
                oController.getOwnerComponent().getModel("materialRodanteSelecionadoModel").setData(oMaterialRodante)

                var oRouter = oController.getOwnerComponent().getRouter();
                var oDestiny = "Formulario"
                var oRoute = oRouter.getRoute(oDestiny);

                if (oRoute !== undefined) {
                    oRouter.navTo(oDestiny, null, true);
                } else {
                    var oBundle = oView.getModel("i18n").getResourceBundle();
                    var oMockMessage = {
                        type: 'Error',
                        title: "Erro ao navegar",
                        description: "Não foi possível encontrar o formulário: " + oMaterialRodante.Modelo,
                        subtitle: oBundle.getText("materialRodante"),
                        counter: 1
                    };
                    oController.getView().getModel().setData([oMockMessage]);
                    oController.getView().getModel().refresh();
                    oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                }

            },

            onSincronizar: function (oEvent) {
                oView.byId("idListaMaterialRodanteTable").setBusy(true);
                oController.medicaoUpdate(oController).then(
                    function (result) {
                        var oModel = new JSONModel();
                        oModel.setData(oController.getOwnerComponent().getModel("mensagensModel").getData());
                        oView.setModel(oModel);
                        oView.byId("idListaMaterialRodanteTable").setBusy(false);
                    }).catch(
                    function (result) {
                        oView.byId("idListaMaterialRodanteTable").setBusy(false);
                    })

            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            },

            onSearchEquipamento: function (oEvent) {
                var sQuery = oEvent.getParameter("query") || oEvent.getSource().getValue();
                var oTable = this.byId("idListaMaterialRodanteTable");
                var oBinding = oTable.getBinding("items");
                if (!sQuery) {
                    oBinding.filter([]);
                    return;
                }
                sQuery = sQuery.toLowerCase();
                oBinding.filter(new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter({
                            path: "Equnr",
                            test: function (value) {
                                return value && value.toLowerCase().indexOf(sQuery) !== -1;
                            }
                        }),
                        new sap.ui.model.Filter({
                            path: "Eqktx",
                            test: function (value) {
                                return value && value.toLowerCase().indexOf(sQuery) !== -1;
                            }
                        })
                    ],
                    and: false
                }));
            },

            /********************************************* MENU OPÇÕES *********************************************************/
            onMedicaoOpcaoDialogOpen: function (oEvent) {

                var oAtendimentoSelecionado = oEvent.getSource().getBindingContext("listaEquipamentoModel").getObject()
                oController.getOwnerComponent().getModel("medicaoSelecionadaModel").setData(oAtendimentoSelecionado)
                oController.getOwnerComponent().getModel("medicaoSelecionadaModel").refresh()
                if (oAtendimentoSelecionado.Status == 'S') {
                    oController.onMaterialRodantePress()
                } else {
                    oController.carregarAcoes(oAtendimentoSelecionado).then(function () {
                        var oView = oController.getView();
                        oController._sInputId = oEvent.getSource().getId();


                        // create value help dialog
                        if (!oController._pDialog) {
                            oController._pDialog = Fragment.load({
                                id: oView.getId(),
                                name: "com.pontual.sgmr.fragment.MedicaoOpcoesAtendimentoDialog",
                                controller: oController
                            }).then(function (oValueHelpDialog) {
                                oView.addDependent(oValueHelpDialog);
                                return oValueHelpDialog;
                            });
                        }

                        // open value help dialog
                        oController._pDialog.then(function (oValueHelpDialog) {
                            oValueHelpDialog.open();
                        });
                    })
                }

            },

            onMedicaoOpcaoDialogSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilters = [new Filter(
                    {
                        filters: [
                            new Filter("acao", FilterOperator.Contains, sValue)
                        ],
                        and: false
                    }
                )];
                oFilters.push(oFilters);

                oEvent.getSource().getBinding("items").filter([oFilters]);
            },


            onMedicaoOpcaoDialogClose: function (oEvent) {
                var aSelectedItem = oEvent.getParameter("selectedItem")

                if (aSelectedItem != undefined) {
                    switch (aSelectedItem.getTitle()) {
                        case oBundle.getText("editarmedicao"):
                            oController.onMaterialRodantePress()
                            break;

                        case oBundle.getText("excluirmedicao"):
                            oController.onExcluirMedicao()
                            break;


                        default:
                            break;
                    }
                }

            },


            carregarAcoes: function () {
                return new Promise((resolve, reject) => {
                    var aAcoes = [];

                    aAcoes.push({
                        acao: oBundle.getText("editarmedicao"),
                        icone: "sap-icon://edit"
                    })


                    aAcoes.push({
                        acao: oBundle.getText("excluirmedicao"),
                        icone: "sap-icon://delete"
                    })


                    aAcoes.sort((a, b) => a.acao.localeCompare(b.acao));

                    oController.getOwnerComponent().getModel("medicaoAcoesModel").setData(aAcoes)
                    oController.getOwnerComponent().getModel("medicaoAcoesModel").refresh()
                    resolve()
                })

            },

            onExcluirMedicao: function () {
                oController.getView().byId("idListaMaterialRodanteTable").setBusy(true);
                var oMedicaoSelecionada = oController.getOwnerComponent().getModel("medicaoSelecionadaModel").getData()
                MessageBox.warning(oBundle.getText("confirmaexclusao"), {
                    title: oBundle.getText("confirmacao"),               // default
                    styleClass: "",                                      // default
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],         // default
                    emphasizedAction: sap.m.MessageBox.Action.OK,        // default
                    initialFocus: null,                                  // default
                    textDirection: sap.ui.core.TextDirection.Inherit,    // default
                    onClose: function (sAction) {
                        if (sAction == 'OK') {
                            oController.excluirMedicao(oMedicaoSelecionada).then(
                                function (result) {
                                    oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh();
                                    oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                                }
                            );

                        } else if (sAction == "CANCEL") {

                            return;
                        }
                    }
                });
            },

            excluirMedicao: function (oMedicaoSelecionada) {
                return new Promise((resolve, reject) => {
                    oController.lerTabelaIndexDB("tb_medicao").then(
                        function (result) {
                            var aMedicoes = result.tb_medicao.filter(e => e.Equnr != oMedicaoSelecionada.Equnr);
                                oController.limparTabelaIndexDB("tb_medicao").then(
                                    function (result) {
                                        oController.gravarTabelaIndexDB("tb_medicao", aMedicoes).then(
                                            function (result) {
                                                oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().forEach(element => {
                                                    var vIdx = aMedicoes.findIndex(e => e.Equnr == element.Equnr);
                                                    if (vIdx == -1) {
                                                        element.Status = 'S';
                                                    } else {
                                                        element.Status = aMedicoes[vIdx].Status
                                                    }
                                                });
                                                resolve()
                                            })
                                    })
                        }).catch(
                            function (result) {
                                resolve()
                            })
                })

            }

        });
    });
