sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel',
    "sap/m/Dialog",
    "sap/m/Button",
    'sap/base/util/uid',
    'sap/m/MessageToast',
    "sap/m/MessageBox"
],
    function (Controller, formatter, MessagePopover, MessageItem, JSONModel, Dialog, Button, uid, MessageToast, MessageBox) {
        "use strict";
        var oView
        var oController
        var oBundle
        var oMedicao
        var oMessagePopover;
        var aMockMessages = []

        return Controller.extend("com.pontual.sgmr.controller.Formulario", {
            onInit: function () {
                oController = sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario").getController();
                oView = oController.getView();

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oView.bindElement("materialRodanteFormularioModel>/")
                oView.bindElement("mensagensModel>/")

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Formulario").attachMatched(this._handleRouteMatched, this);

            },

            _handleRouteMatched: function (oEvent) {
                oBundle = oController.getView().getModel("i18n").getResourceBundle();
                try {
                    oView.byId("idFormulario").scrollTo(0);
                } catch (error) {

                }
                oController.iniciarMensagens();

                var oEquipamento = oController.getOwnerComponent().getModel("materialRodanteSelecionadoModel").getData();

                if (oEquipamento.FormularioCarregado != true) {
                    oEquipamento.FormularioCarregado = true
                    oController.getOwnerComponent().getModel("materialRodanteSelecionadoModel").setData(oEquipamento)
                    oController.lerTabelaIndexDB("tb_medicao").then(
                        function (result) {
                            var aMedicoes = result.tb_medicao
                            var oMedicaoEncontrada = aMedicoes.find((oElement) => oEquipamento.Equnr == oElement.Equnr);

                            if (oMedicaoEncontrada != undefined) {
                                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setData(oMedicaoEncontrada);
                            } else {

                                oController.carregarElementosFormularios()
                            }

                        }).catch(function (result) {

                        })
                    try {
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData").setValueState("None");
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData").setValueStateText("");
                    } catch (error) {

                    }

                }
            },

            iniciarMensagens: function () {
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
            },

            onNavBack: function (oEvent) {
                oController.onCancelar(oEvent);
            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            },


            validarFormulario: function (pMedicao) {
                aMockMessages = []
                var vValido = true
                if (pMedicao.Data == null || pMedicao.Data == "") {
                    sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData").setValueState("Error");
                    sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData").setValueStateText(oBundle.getText("campoobrigatorio"));

                    var oMockMessage = {
                        type: 'Error',
                        title: oBundle.getText("campoobrigatorio"),
                        description: oBundle.getText("campodata"),
                        subtitle: oBundle.getText("data"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)

                    vValido = false;
                }


                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario").setModel(oModel);

                return vValido

            },

            onCancelar: function (oEvent) {
                MessageBox.confirm(oBundle.getText("cancelargravacao"), {
                    title: oBundle.getText("cancelar"),               // default
                    styleClass: "",                                      // default
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],         // default
                    emphasizedAction: sap.m.MessageBox.Action.OK,        // default
                    initialFocus: null,                                  // default
                    textDirection: sap.ui.core.TextDirection.Inherit,    // default
                    onClose: function (sAction) {
                        if (sAction == 'OK') {
                           oController.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);

                        } else if (sAction == "CANCEL") {

                            return;
                        }
                    }
                });
            },

            onConfirmar: function (oEvent) {
                MessageBox.confirm(oBundle.getText("confirmagravacao"), {
                    title: oBundle.getText("confirmacao"),               // default
                    styleClass: "",                                      // default
                    actions: [sap.m.MessageBox.Action.OK,
                    sap.m.MessageBox.Action.CANCEL],         // default
                    emphasizedAction: sap.m.MessageBox.Action.OK,        // default
                    initialFocus: null,                                  // default
                    textDirection: sap.ui.core.TextDirection.Inherit,    // default
                    onClose: function (sAction) {
                        if (sAction == 'OK') {
                            oController.confirmar(oEvent)

                        } else if (sAction == "CANCEL") {

                            return;
                        }
                    }
                });
            },

            confirmar: function (oEvent) {
                oView.byId("confirmarButton").setEnabled(false);
                oView.byId("confirmarButton").setBusy(true);
                oView.byId("cancelarButton").setEnabled(false);
                oView.byId("cancelarButton").setBusy(true);

                oMedicao = oEvent.getSource().getBindingContext("materialRodanteFormularioModel").getObject();

                if (oController.validarFormulario(oMedicao)) {
                    oController.lerTabelaIndexDB("tb_medicao").then(
                        function (result) {
                            var aMedicoes = result.tb_medicao
                            if (oMedicao.Uuid == "") {
                                oMedicao.Uuid = uid()
                                oMedicao.VisibilidadeRetorno = true
                                aMedicoes.push(oMedicao)
                            } else {
                                var vIdx = aMedicoes.findIndex((oElement) => oMedicao.Uuid == oElement.Uuid);
                                aMedicoes[vIdx] = oMedicao
                            }
                            oController.limparTabelaIndexDB("tb_medicao").then(
                                function (result) {
                                    oController.gravarTabelaIndexDB("tb_medicao", aMedicoes).then(
                                        function (result) {
                                            MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("dadossucesso"), {
                                                duration: 500,                  // default
                                                onClose: function () {
                                                    if (oController.checkConnection() == true) {
                                                        oController.medicaoUpdate().then(
                                                            function (result) {
                                                                oController.closeBusyDialog();
                                                                oView.byId("confirmarButton").setEnabled(true);
                                                                oView.byId("confirmarButton").setBusy(false);
                                                                oView.byId("cancelarButton").setEnabled(true);
                                                                oView.byId("cancelarButton").setBusy(false);
                                                                oController.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);
                                                            }).catch(
                                                                function (result) {
                                                                    oView.byId("confirmarButton").setEnabled(true);
                                                                    oView.byId("confirmarButton").setBusy(false);
                                                                    oView.byId("cancelarButton").setEnabled(true);
                                                                    oView.byId("cancelarButton").setBusy(false);
                                                                    oController.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);
                                                                })

                                                    } else {
                                                        oController.closeBusyDialog();
                                                        oView.byId("confirmarButton").setEnabled(true);
                                                        oView.byId("confirmarButton").setBusy(false);
                                                        oView.byId("cancelarButton").setEnabled(true);
                                                        oView.byId("cancelarButton").setBusy(false);
                                                        oController.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);

                                                    }
                                                }
                                            });
                                        }).catch(
                                            function (result) {
                                            })
                                }).catch(
                                    function (result) {
                                    })

                        }).catch(
                            function (result) {

                            })
                } else {
                    oView.byId("confirmarButton").setEnabled(true);
                    oView.byId("confirmarButton").setBusy(false);
                }

            },

            carregarElementosFormularios: function (aFormularios) {
                return new Promise((resolve, reject) => {
                    var aLeiturasForm = [
                        oController.carregarDadosIndexDB("tb_componentes", "listaComponentesModel"),
                        oController.carregarDadosIndexDB("tb_condicoes", "listaCondicoesModel"),
                        oController.carregarDadosIndexDB("tb_inspecoes", "listaInspecoesModel")
                    ];

                    Promise.all(aLeiturasForm).then(
                        function () {
                            var oEquipamento = oController.getOwnerComponent().getModel("materialRodanteSelecionadoModel").getData()
                            var aListaComponetes = oController.getOwnerComponent().getModel("listaComponentesModel").getData().filter(c => c.IdForm == oEquipamento.IdForm);
                            var aListaComponentesCombo = oController.agruparComponentes(aListaComponetes);
                            var aComponentesCombo = []
                            var aListaInspecoes = oController.getOwnerComponent().getModel("listaInspecoesModel").getData().filter(c => c.IdForm == oEquipamento.IdForm);
                            var aListaCondicoes = oController.getOwnerComponent().getModel("listaCondicoesModel").getData().filter(c => c.IdForm == oEquipamento.IdForm);

                            aListaComponetes.forEach(element => {
                                element.Valormedido = 0
                            });

                            aListaComponentesCombo.forEach(element => {

                                aComponentesCombo.push({
                                    key: element.key,
                                    text: element.key
                                })
                            })

                            aComponentesCombo.push({
                                key: 'Todos',
                                text: 'Todos'
                            })

                            var aLadosCombo = [
                                {
                                    key: "Ambos",
                                    text: "Ambos"
                                },
                                {
                                    key: "Lado Direito",
                                    text: "Lado Direito"
                                },
                                {
                                    key: "Lado Esquerdo",
                                    text: "Lado Esquerdo"
                                }]

                            var aNiveisCombo = [
                                {
                                    key: "Alta",
                                    text: "Alta"
                                },
                                {
                                    key: "Moderada",
                                    text: "Moderada"
                                },
                                {
                                    key: "Baixa",
                                    text: "Baixa"
                                }]

                            var oFormulario = JSON.parse(JSON.stringify(oEquipamento));

                            oFormulario.Uuid = ""
                            oFormulario.Data = new Date();
                            try {
                                oFormulario.UltMedEpto = oFormulario.UltMedEpto.trim();
                            } catch (error) { }
                            oFormulario.TagE = "";
                            oFormulario.TagD = "";
                            oFormulario.HorimetroE = "0";
                            oFormulario.HorimetroD = "0";
                            oFormulario.Componentes = aListaComponetes;
                            oFormulario.ComponentesCombo = aComponentesCombo
                            oFormulario.ComponenteSelecionado = "Todos"
                            oFormulario.LadoCombo = aLadosCombo
                            oFormulario.LadoSelecionado = "Ambos"
                            oFormulario.Condicoes = aListaCondicoes;
                            oFormulario.NivelCombo = aNiveisCombo;
                            oFormulario.RoleteVazamento = false;
                            oFormulario.RoleteQtdeLD = "0";
                            oFormulario.RoleteQtdeLE = "0";
                            oFormulario.Inspecoes = aListaInspecoes;
                            oFormulario.Observacoes = "";
                            oFormulario.items = [];
                            oFormulario.Status = "P";
                            oFormulario.Retorno = [];
                            oFormulario.VisibilidadeRetorno = false

                            oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setData(oFormulario);

                            resolve();
                        }
                    );
                })
            },

            agruparComponentes: function (pData) {
                // Input array
                const data = pData;

                // result array
                const resultArr = [];

                // grouping by location and resulting with an object using Array.reduce() method
                const groupByLocation = data.reduce((group, item) => {
                    const { Componente } = item;
                    group[Componente] = group[Componente] ?? [];
                    group[Componente].push(1);
                    return group;
                }, {});

                Object.keys(groupByLocation).forEach((item) => {
                    groupByLocation[item] = groupByLocation[item].reduce((a, b) => a + b);
                    resultArr.push({
                        'key': item,
                        'Quantidade': groupByLocation[item]
                    })
                })

                resultArr.sort(function (a, b) {
                    if (a.key < b.key) { return -1; }
                    if (a.key > b.key) { return 1; }
                    return 0;
                });

                return resultArr;

            }

        });
    });
