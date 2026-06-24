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
                this.getView().addStyleClass("sapUiSizeCompact");

                oView.bindElement("listaEquipamentoModel>/");
                oView.bindElement("layoutTelaModel>/");
                oView.bindElement("busyDialogModel>/");

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("ListaMaterialRodante").attachMatched(this._handleRouteMatched, this);

            },

            _handleRouteMatched: function (oEvent) {
                oBundle = oView.getModel("i18n").getResourceBundle();
                oController.getView().byId("idListaMaterialRodanteTable").setBusy(true);

                oView.bindElement("listaEquipamentoModel>/");

                oController.lerTabelaIndexDB("tb_medicao")
                .then( result => {
                    oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().forEach(element => {
                        var vIdx = result.tb_medicao.findIndex(e => e.Equnr == element.Equnr);
                        if (vIdx == -1) {
                            //      element.Status = 'S';
                        } else {
                            element.Status = result.tb_medicao[vIdx].Status
                        }
                    });
                    oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh();
                    oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                })
                .catch(() => {
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
                    oController.adicionarMensagemErro("Erro ao navegar", "materialRodante", "Não foi possível encontrar o formulário: " + oMaterialRodante.Modelo);
                    oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                }

            },

            onSincronizar: function (oEvent) {
                oView.byId("idListaMaterialRodanteTable").setBusy(true);
                oController.medicaoUpdate(oController)
                .then(() => oView.byId("idListaMaterialRodanteTable").setBusy(false))
                .catch(() => oView.byId("idListaMaterialRodanteTable").setBusy(false));
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

                switch (oAtendimentoSelecionado.Status) {
                    case "X":
                        this.limparMensagens();
                        this.adicionarMensagemErro("equipamentoincompleto", oAtendimentoSelecionado.Equnr, this.i18n("equipamentoincompletomsg", [oAtendimentoSelecionado.Equnr]));
                        oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                        break;
                    case "S":
                        oController.onMaterialRodantePress()
                        break;
                    default:
                        oController.carregarAcoes(oAtendimentoSelecionado).then(function () {
                            var oView = oController.getView();
                            oController._sInputId = oEvent.getSource().getId();

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

                            oController._pDialog.then(function (oValueHelpDialog) {
                                oValueHelpDialog.open();
                            });
                        })
                        break;
                }

            },

            onMedicaoOpcaoDialogSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                oEvent.getSource().getBinding("items").filter([new Filter( { filters: [ new Filter("acao", FilterOperator.Contains, sValue) ], and: false } )]);
            },


            onMedicaoOpcaoDialogClose: function (oEvent) {
                var aSelectedItem = oEvent.getParameter("selectedItem");
                if (aSelectedItem != undefined) {
                    switch (aSelectedItem.getTitle()) {
                        case oBundle.getText("editarmedicao"):
                            oController.onMaterialRodantePress();
                            break;
                        case oBundle.getText("excluirmedicao"):
                            oController.onExcluirMedicao();
                            break;
                        default:
                            break;
                    }
                }
            },

            carregarAcoes: function () {
                return new Promise((resolve, reject) => {
                    oController.getOwnerComponent().getModel("medicaoAcoesModel").setData([
                        { acao: oBundle.getText("editarmedicao"),  icone: "sap-icon://edit" },
                        { acao: oBundle.getText("excluirmedicao"), icone: "sap-icon://delete" }
                    ])
                    oController.getOwnerComponent().getModel("medicaoAcoesModel").refresh();
                    resolve();
                });
            },

            onExcluirMedicao: function () {
                oController.getView().byId("idListaMaterialRodanteTable").setBusy(true);
                var oMedicaoSelecionada = oController.getOwnerComponent().getModel("medicaoSelecionadaModel").getData()
                MessageBox.warning(oBundle.getText("confirmaexclusao"), {
                    title: oBundle.getText("confirmacao"),
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK,
                    initialFocus: null,
                    onClose: function (sAction) {
                        if (sAction == "CANCEL") {
                            return;
                        }
                        oController.excluirMedicao(oMedicaoSelecionada)
                        .then(() => {
                            oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh();
                            oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                        });
                    }
                });
            },

            excluirMedicao: function (oMedicaoSelecionada) {
                return new Promise((resolve, reject) => {
                    oController.lerTabelaIndexDB("tb_medicao")
                    .then( result => {
                        var aMedicoes = result.tb_medicao.filter(e => e.Equnr != oMedicaoSelecionada.Equnr);
                        oController.limparTabelaIndexDB("tb_medicao")
                        .then(() => {
                            oController.gravarTabelaIndexDB("tb_medicao", aMedicoes)
                            .then(() => {
                                oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().forEach(element => {
                                    var vIdx = aMedicoes.findIndex(e => e.Equnr == element.Equnr);
                                    if (vIdx == -1) {
                                        element.Status = 'S';
                                    } else {
                                        element.Status = aMedicoes[vIdx].Status;
                                    }
                                });
                                resolve();
                            });
                        })
                    }).catch(() => resolve());
                })
            }
        });
    });
