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
                        description: oBundle.getText("preenchimentoobrigatorio", ["Data"]),
                        subtitle: oBundle.getText("data"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)

                    vValido = false;
                } else {
                    var vLimiteRetroativo = parseInt(pMedicao.LimiteRetroativo)
                    if (oController.verificarDiferencaHoras(vLimiteRetroativo, pMedicao.Data)) {
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData").setValueState("Error");
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData").setValueStateText(oBundle.getText("campoobrigatorio"));

                        var oMockMessage = {
                            type: 'Error',
                            title: oBundle.getText("limiteretroativo"),
                            description: oBundle.getText("limiteretroativomsg", [vLimiteRetroativo]),
                            subtitle: oBundle.getText("limiteretroativo"),
                            counter: 1
                        };
                        aMockMessages.push(oMockMessage)

                        vValido = false;
                    }

                }

                if (pMedicao.MedEquipamento == null || pMedicao.MedEquipamento == "") {
                    sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto").setValueState("Error");
                    sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto").setValueStateText(oBundle.getText("campoobrigatorio"));

                    var oMockMessage = {
                        type: 'Error',
                        title: oBundle.getText("campoobrigatorio"),
                        description: oBundle.getText("preenchimentoobrigatorio", ["Horimero Equipamento"]),
                        subtitle: oBundle.getText("ultimoponto"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)

                    vValido = false;
                } else {
                    var vMedEpto = parseInt(pMedicao.MedEquipamento)
                    var vUltMedEqpto = parseInt(pMedicao.UltMedEqpto)
                    var vDifMaxMedicoes = parseInt(pMedicao.DifMaxMedicoes)

                    if (vMedEpto < vUltMedEqpto) {
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto").setValueState("Error");
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto").setValueStateText(oBundle.getText("valormenor"));

                        var oMockMessage = {
                            type: 'Error',
                            title: oBundle.getText("ultimoponto"),
                            description: oBundle.getText("valormenor", [vMedEpto, vUltMedEqpto]),
                            subtitle: oBundle.getText("valormenor", [vMedEpto, vUltMedEqpto]),
                            counter: 1
                        };
                        aMockMessages.push(oMockMessage)

                        vValido = false;
                    }

                    if (vMedEpto > (vUltMedEqpto + vDifMaxMedicoes)) {
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto").setValueState("Error");
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto").setValueStateText(oBundle.getText("valormenor"));

                        var oMockMessage = {
                            type: 'Error',
                            title: oBundle.getText("diferencaomedicao"),
                            description: oBundle.getText("diferencaomedicaomsg", [vMedEpto, vDifMaxMedicoes]),
                            subtitle: oBundle.getText("medicao"),
                            counter: 1
                        };
                        aMockMessages.push(oMockMessage)

                        vValido = false;
                    }

                }

                var aComponentes = oController.agruparPorCampo(pMedicao.Componentes, "ComponenteLado")
                aComponentes.forEach(oComponente => {
                    var aCompMedNaoInformada = pMedicao.Componentes.filter(c => c.ComponenteLado == oComponente.key && c.Valormedido == 0);
                    var aCompMedInformada = pMedicao.Componentes.filter(c => c.ComponenteLado == oComponente.key && c.Valormedido != 0);

                    if (aCompMedNaoInformada != 0 && aCompMedInformada != 0) {

                        var oComp = pMedicao.Componentes.find(c => c.ComponenteLado == oComponente.key);

                        var oMockMessage = {
                            type: 'Error',
                            title: oBundle.getText("componentesmedicao", [oComp.Componente, oComp.Lado]),
                            description: oBundle.getText("componentesmedicaomsg", [oComp.Componente, oComp.Lado]),
                            subtitle: oBundle.getText("campoobrigatorio"),
                            counter: 1
                        };
                        aMockMessages.push(oMockMessage)

                        pMedicao.Componentes.forEach(element => {
                            if (element.ComponenteLado == oComp.ComponenteLado) {
                                element.ValorMedidoValueState = 'Error'
                            }

                        });

                        oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty("/Componentes", pMedicao.Componentes)
                        oController.getOwnerComponent().getModel("materialRodanteFormularioModel").refresh()

                        vValido = false;
                    } else {

                    }
                });

                pMedicao.Componentes.forEach(oComponente => {
                    var vValorMedido = parseFloat(oComponente.Valormedido)
                    var vUltimoValorMedido = parseFloat(oComponente.UltValormedido)
                    switch (oComponente.Ordenacao) {
                        case "D":
                            if (vValorMedido != 0 && vValorMedido > vUltimoValorMedido) {
                                var oMockMessage = {
                                    type: 'Error',
                                    title: oBundle.getText("componenteerro", [oComponente.Componente, oComponente.Lado, oComponente.Posicao]),
                                    description: oBundle.getText("valormaiormsg", [vValorMedido, vUltimoValorMedido, oComponente.Componente, oComponente.Lado, oComponente.Posicao]),
                                    subtitle: oBundle.getText("medicao"),
                                    counter: 1
                                };
                                aMockMessages.push(oMockMessage)

                                oComponente.ValorMedidoValueState = 'Error'

                                vValido = false;
                            }

                            break;
                        case "C":
                            if (vValorMedido != 0 && vValorMedido < vUltimoValorMedido) {
                                var oMockMessage = {
                                    type: 'Error',
                                    title: oBundle.getText("componenteerro", [oComponente.Componente, oComponente.Lado, oComponente.Posicao]),
                                    description: oBundle.getText("valormenormsg", [vValorMedido, vUltimoValorMedido, oComponente.Componente, oComponente.Lado, oComponente.Posicao]),
                                    subtitle: oBundle.getText("medicao"),
                                    counter: 1
                                };
                                aMockMessages.push(oMockMessage)

                                oComponente.ValorMedidoValueState = 'Error'

                                vValido = false;
                            }
                            break;

                        default:
                            break;
                    }
                });

                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty("/Componentes", pMedicao.Componentes)
                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").refresh()

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
                    oView.byId("cancelarButton").setEnabled(true);
                    oView.byId("cancelarButton").setBusy(false);
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
                            var aListaComponetes = oController.getOwnerComponent().getModel("listaComponentesModel").getData().filter(c => c.Equipamento == oEquipamento.Equnr && c.IdForm == oEquipamento.IdForm);
                            var aListaComponentesCombo = oController.agruparComponentes(aListaComponetes);
                            var aComponentesCombo = []
                            var aListaInspecoes = oController.getOwnerComponent().getModel("listaInspecoesModel").getData().filter(c => c.IdForm == oEquipamento.IdForm);
                            var aListaCondicoes = oController.getOwnerComponent().getModel("listaCondicoesModel").getData().filter(c => c.IdForm == oEquipamento.IdForm);

                            aListaComponetes.forEach(element => {
                                element.Valormedido = 0
                                element.ValorMedidoValueState = 'None'
                                element.ComponenteLado = element.IdComponente + element.IdLado
                                if (element.Fabricante != "") {
                                    element.ValorMedidoEnabled = true
                                    element.ValorMedidoStatus = 'Indication05'
                                } else {
                                    element.ValorMedidoEnabled = false
                                    element.Fabricante = "Não cadastrado"
                                    element.ValorMedidoStatus = 'Indication02'
                                }

                                element.PercDesgasteValueState = 'Indication05'  //Azul                              
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


                            aListaCondicoes.forEach(element => {
                                element.Nivel = "Não Informada"
                            });

                            var aNiveisCombo = [
                                {
                                    key: "Não Informada",
                                    text: "Não Informada"
                                },
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

                            oFormulario.UltMedEqpto = oFormulario.UltMedEqpto
                            oFormulario.DtHrEqpto = oFormulario.DtHrEqpto;
                            oFormulario.TagE = oFormulario.TagEsquerda;
                            oFormulario.TagD = oFormulario.TagDireita;
                            oFormulario.HorimetroE = oFormulario.MedEsquerda;
                            oFormulario.HorimetroD = oFormulario.MedDireita;
                            oFormulario.DtHrDir = oFormulario.DtHrDir;
                            oFormulario.DtHrEsq = oFormulario.DtHrEsq;
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
                            oFormulario.VisibilidadeInformacoes = true
                            oFormulario.VisibilidadeTAG = true

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
