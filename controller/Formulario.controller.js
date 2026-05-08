sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    'sap/ui/model/json/JSONModel',
    'sap/base/util/uid',
    "sap/m/MessageBox"
],
    function (Controller, JSONModel, uid, MessageBox) {
        "use strict";
        var oView
        var oController
        var oBundle
        var aMockMessages = []

        return Controller.extend("com.pontual.sgmr.controller.Formulario", {

            onInit: function () {
                try {
                    oController = sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario").getController();
                } catch (error) {
                    oController = sap.ui.getCore().byId("container-com.pontual.SGMR---Formulario").getController();
                }

                oView = oController.getView();
                this.getView().addStyleClass("sapUiSizeCompact");

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oView.bindElement("materialRodanteFormularioModel>/")

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Formulario").attachMatched(this._handleRouteMatched, this);
            },

            _handleRouteMatched: function (oEvent) {
                this.limparMensagens();
                oBundle = oController.getView().getModel("i18n").getResourceBundle();
                try {
                    oView.byId("idFormulario").scrollTo(0);
                } catch (error) {

                }

                var oEquipamento = oController.getOwnerComponent().getModel("materialRodanteSelecionadoModel").getData();
                if (oEquipamento.FormularioCarregado != true) {
                    oEquipamento.FormularioCarregado = true
                    oController.getOwnerComponent().getModel("materialRodanteSelecionadoModel").setData(oEquipamento)
                    oController.lerTabelaIndexDB("tb_medicao")
                    .then(result => {
                        var aMedicoes           = result.tb_medicao;
                        var oMedicaoEncontrada  = aMedicoes.find((oElement) => oEquipamento.Equnr == oElement.Equnr);
                        if (oMedicaoEncontrada != undefined) {
                            oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setData(oMedicaoEncontrada);
                        } else {
                            oController.carregarElementosFormularios()
                        }
                    });
                    sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData")?.setValueState("None");
                    sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData")?.setValueStateText("");
                }
            },

            onNavBack: function (oEvent) {
                oController.onCancelar(oEvent);
            },

            atualizaTotalRoletes: function(oEvent) {
                const valor = oEvent.getParameter('state');
                if (!valor) {
                    const dados = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getData();
                    dados.RoleteQtdeLD = "0";
                    dados.RoleteQtdeLE = "0";
                }
            },

            controlaIndicadorVazamento: function(oEvent) {
                const dados = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getData();
                const valorDireito  = Number(dados.RoleteQtdeLD);
                const valorEsquerdo = Number(dados.RoleteQtdeLE);
                dados.RoleteVazamento = valorDireito > 0 || valorEsquerdo > 0;
            },

            validarFormulario: function () {
                this.limparMensagens();
                return new Promise((resolve, reject) => {
                    const pMedicao      = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getData();
                    const erros         = [];
                    var vValido         = true;
                    var vAlerta         = false;
                    var vMensagemAlerta = "";

                    //-- Validações no BaseController par acompartilhar com os blocos do form --//
                    oController.validaMedicao(erros);
                    oController.validaDataMedicao(erros);
                    oController.validaVazamentoRoleteDireito(erros);
                    oController.validaVazamentoRoleteEsquerdo(erros);

                    vValido = erros.length < 1;
                  
                    var aComponentes = oController.agruparPorCampo(pMedicao.Componentes, "ComponenteLado")
                    aComponentes.forEach(oComponente => {
                        var aCompMedNaoInformada = pMedicao.Componentes.filter(c => c.ComponenteLado == oComponente.key && c.Valormedido == 0);
                        var aCompMedInformada = pMedicao.Componentes.filter(c => c.ComponenteLado == oComponente.key && c.Valormedido != 0);

                        if (aCompMedNaoInformada != 0 && aCompMedInformada != 0) {

                            const oComp = pMedicao.Componentes.find(c => c.ComponenteLado == oComponente.key);
                            vMensagemAlerta = oController.i18n("componentesmedicaomsg", [oComp.Componente, oComp.Lado]);
                            oController.adicionarMensagemAviso(oController.i18n("componentesmedicao", [oComp.Componente, oComp.Lado]), "campoobrigatorio", vMensagemAlerta);

                            pMedicao.Componentes.forEach(element => {
                                if (element.ComponenteLado == oComp.ComponenteLado) {
                                    element.ValorMedidoValueState = 'Warning'
                                }
                            });

                            oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty("/Componentes", pMedicao.Componentes)
                            oController.getOwnerComponent().getModel("materialRodanteFormularioModel").refresh()

                            vAlerta = true;
                        }
                    });

                    pMedicao.Componentes.forEach(oComponente => {
                        var vValorMedido = parseFloat(oComponente.Valormedido)
                        var vUltimoValorMedido = parseFloat(oComponente.UltValormedido)
                        switch (oComponente.Ordenacao) {
                            case "D":
                                if (vValorMedido != 0 && vValorMedido > vUltimoValorMedido) {
                                    const titulo    = oController.i18n("componenteerro", [oComponente.Componente, oComponente.Lado, oComponente.Posicao]);
                                    const descricao = oController.i18n("valormaiormsg", [vValorMedido, vUltimoValorMedido, oComponente.Componente, oComponente.Lado, oComponente.Posicao]);
                                    oController.adicionarMensagemErro(titulo, "medicao", descricao);
                                    oComponente.ValorMedidoValueState = 'Error'
                                    vValido = false;
                                }
                                break;
                            case "C":
                                if (vValorMedido != 0 && vValorMedido < vUltimoValorMedido) {
                                    const titulo    = oController.i18n("componenteerro", [oComponente.Componente, oComponente.Lado, oComponente.Posicao]);
                                    const descricao = oController.i18n("valormenormsg",  [vValorMedido, vUltimoValorMedido, oComponente.Componente, oComponente.Lado, oComponente.Posicao]);
                                    oController.adicionarMensagemErro(titulo, "medicao", descricao);
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
                    oModel.setData(erros);
                    try {
                        sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario").setModel(oModel);
                    } catch (error) {
                        sap.ui.getCore().byId("container-com.pontual.SGMR---Formulario").setModel(oModel);
                    }

                    if (vValido) {
                        if (vAlerta) {
                            MessageBox.warning(vMensagemAlerta, {
                                title: oBundle.getText("confirmacao"),
                                actions: [sap.m.MessageBox.Action.OK],
                                onClose: function (sAction) {
                                    if (sAction == 'OK') {
                                        resolve();
                                    }
                                }
                            });
                        } else {
                            return resolve();
                        }
                    } else {
                        reject();
                    }
                });
            },

            onCancelar: function () {
                oController.limpaEstadoCampos();
                MessageBox.confirm(oBundle.getText("cancelargravacao"), {
                    title            : oBundle.getText("cancelar"),
                    actions          : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction : sap.m.MessageBox.Action.OK,
                    onClose          : function (sAction) {
                        if (sAction == 'OK') {
                            setTimeout( () => oController.getRouter().navTo("ListaMaterialRodante", {}, true), 200);
                        }
                    }
                });
            },

            onConfirmar: function (oEvent) {
                oController.validarFormulario()
                .then(() => {
                    MessageBox.confirm(oBundle.getText("confirmagravacao"), {
                        title            : oBundle.getText("confirmacao"),
                        actions          : [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction : sap.m.MessageBox.Action.OK,
                        onClose          : sAction => {
                            if (sAction == 'OK') {
                                oController.confirmar(oEvent);
                            }
                        }
                    });
                });
            },

            confirmar: function (oEvent) {
                oView.byId("confirmarButton").setEnabled(false);
                oView.byId("confirmarButton").setBusy(true);
                oView.byId("cancelarButton").setEnabled(false);
                oView.byId("cancelarButton").setBusy(true);

                var oMedicao = oEvent.getSource().getBindingContext("materialRodanteFormularioModel").getObject();
                oController.lerTabelaIndexDB("tb_medicao")
                .then(result => {
                    var aMedicoes = result.tb_medicao;
                    if (oMedicao.Uuid == "") {
                        oMedicao.Uuid = uid();
                        oMedicao.VisibilidadeRetorno = true;
                        aMedicoes.push(oMedicao);
                    } else {
                        var vIdx = aMedicoes.findIndex((oElement) => oMedicao.Uuid == oElement.Uuid);
                        aMedicoes[vIdx] = oMedicao
                    }
                    oController.limparTabelaIndexDB("tb_medicao")
                    .then(() => {
                        oController.gravarTabelaIndexDB("tb_medicao", aMedicoes)
                        .then(() => {
                            if (oController.checkConnection() == true) {
                                oController.medicaoUpdate()
                                .then(() => {
                                    oController.closeBusyDialog();
                                    oView.byId("confirmarButton").setEnabled(true);
                                    oView.byId("confirmarButton").setBusy(false);
                                    oView.byId("cancelarButton").setEnabled(true);
                                    oView.byId("cancelarButton").setBusy(false);
                                    oController.getRouter().navTo("ListaMaterialRodante", {}, true);
                                }).catch(() => {
                                    oView.byId("confirmarButton").setEnabled(true);
                                    oView.byId("confirmarButton").setBusy(false);
                                    oView.byId("cancelarButton").setEnabled(true);
                                    oView.byId("cancelarButton").setBusy(false);
                                    oController.getRouter().navTo("ListaMaterialRodante", {}, true);
                                });
                            } else {
                                oController.closeBusyDialog();
                                oView.byId("confirmarButton").setEnabled(true);
                                oView.byId("confirmarButton").setBusy(false);
                                oView.byId("cancelarButton").setEnabled(true);
                                oView.byId("cancelarButton").setBusy(false);
                                oController.getRouter().navTo("ListaMaterialRodante", {}, true);
                            }
                        });
                    });
                });
            },

            somaRoletes: function(componente, total) {
                total.direito  += ((componente.IdComponente === "RIN" || componente.IdComponente === "RSU") && componente.IdLado === "LD") ? 1 : 0;
                total.esquerdo += ((componente.IdComponente === "RIN" || componente.IdComponente === "RSU") && componente.IdLado === "LD") ? 1 : 0;
            },

            carregarElementosFormularios: function (aFormularios) {
                return new Promise((resolve, reject) => {
                    var aLeiturasForm = [
                        oController.carregarDadosIndexDB("tb_componentes",  "listaComponentesModel"),
                        oController.carregarDadosIndexDB("tb_condicoes",    "listaCondicoesModel"),
                        oController.carregarDadosIndexDB("tb_temperaturas", "listaTemperaturasModel"),
                        oController.carregarDadosIndexDB("tb_inspecoes",    "listaInspecoesModel")
                    ];

                    Promise.all(aLeiturasForm).then(
                        function () {
                            var oEquipamento           = oController.getOwnerComponent().getModel("materialRodanteSelecionadoModel").getData();
                            var aListaComponetes       = oController.getOwnerComponent().getModel("listaComponentesModel").getData().filter(c => c.Equipamento == oEquipamento.Equnr && c.IdForm == oEquipamento.IdForm);
                            var aListaComponentesCombo = oController.agruparComponentes(aListaComponetes);
                            const aListaCondicoes      = oController.getOwnerComponent().getModel("listaCondicoesModel"   ).getData().filter(c => c.IdForm == oEquipamento.IdForm && c.TipoRetorno !== 'E') || [];
                            const aListaInspecoes      = oController.getOwnerComponent().getModel("listaInspecoesModel"   ).getData().filter(c => c.IdForm == oEquipamento.IdForm && c.TipoRetorno !== 'E') || [];
                            const aListaTemperaturas   = oController.getOwnerComponent().getModel("listaTemperaturasModel").getData().filter(c => c.IdForm == oEquipamento.IdForm ) || [];
                            const totalRoletes         = { direito : 0, esquerdo : 0 };
                            const aComponentesCombo    = [];
                            let   corDireita           = "";
                            let   corEsquerda          = "";

                            aListaCondicoes.sort((a, b) => Number(a.IdCondicao) - Number(b.IdCondicao));
                            aListaInspecoes.sort((a, b) => a.Sequencial - b.Sequencial);

                            var total = 0;

                            aListaComponetes.forEach(element => {
                                element.Sequenciamento = element.Sequenciamento || total++;
                                element.Valormedido = 0
                                element.ValorMedidoValueState = 'None'
                                element.ComponenteLado = element.IdComponente + element.IdLado
                                if (element.Fabricante != "") {
                                    element.ValorMedidoEnabled = !!element.Acao; 
                                    element.ValorMedidoStatus  = 'Indication05'
                                } else {
                                    element.ValorMedidoEnabled = false
                                    element.Fabricante = "Não cadastrado"
                                    element.ValorMedidoStatus = 'Indication02'
                                }

                                element.PercDesgasteValueState = 'Indication05'  //Azul
                                oController.somaRoletes(element, totalRoletes);

                                if (!corDireita && element.IdLado === "LD") {
                                    corDireita = element.Cor;
                                }
                                if (!corEsquerda && element.IdLado === "LE") {
                                    corEsquerda = element.Cor;
                                }
                            });

                            aListaTemperaturas.forEach(item => {
                                item.Cor = item.Lado === "D" ? corDireita : corEsquerda;
                            });

                            aListaTemperaturas.sort((a, b) => {
                                if (a.Lado < b.Lado) return -1;
                                if (a.Lado > b.Lado) return 1;
                                return 0;
                            });

                            aListaComponentesCombo.forEach(element => aComponentesCombo.push({ key: element.key, text: element.key }));

                            aComponentesCombo.push({ key: 'Todos', text: 'Todos' });

                            var aLadosCombo = [
                                { key: "Ambos",         text: "Ambos" },
                                { key: "Lado Direito",  text: "Lado Direito" },
                                { key: "Lado Esquerdo", text: "Lado Esquerdo" }
                            ];

                            aListaCondicoes.forEach(element => {
                                element.Nivel = "Não Informada"
                            });

                            var aNiveisCombo = [
                                { key: "Não Informada", text: "Não Informada" },
                                { key: "Alta",          text: "Alta" },
                                { key: "Moderada",      text: "Moderada" },
                                { key: "Baixa",         text: "Baixa" }
                            ];

                            const oFormulario = JSON.parse(JSON.stringify(oEquipamento));
                            oFormulario.Uuid  = "";
                            oFormulario.Data  = new Date();

                            oFormulario.UltMedEqpto             = oFormulario.UltMedEqpto;
                            oFormulario.DtHrEqpto               = oFormulario.DtHrEqpto;
                            oFormulario.TagE                    = oFormulario.TagEsquerda;
                            oFormulario.TagD                    = oFormulario.TagDireita;
                            oFormulario.HorimetroE              = oFormulario.MedEsquerda;
                            oFormulario.HorimetroD              = oFormulario.MedDireita;
                            oFormulario.DtHrDir                 = oFormulario.DtHrDir;
                            oFormulario.DtHrEsq                 = oFormulario.DtHrEsq;
                            oFormulario.Componentes             = aListaComponetes;
                            oFormulario.ComponentesCombo        = aComponentesCombo;
                            oFormulario.ComponenteSelecionado   = "Todos";
                            oFormulario.LadoCombo               = aLadosCombo;
                            oFormulario.LadoSelecionado         = "Ambos";
                            oFormulario.Condicoes               = aListaCondicoes;
                            oFormulario.NivelCombo              = aNiveisCombo;
                            oFormulario.RoleteVazamento         = false;
                            oFormulario.RoleteQtdeLD            = "0";
                            oFormulario.RoleteQtdeLE            = "0";
                            oFormulario.MaxRoleteQtdeLD         = totalRoletes.direito;
                            oFormulario.MaxRoleteQtdeLE         = totalRoletes.esquerdo;
                            oFormulario.Temperaturas            = aListaTemperaturas;
                            oFormulario.Inspecoes               = aListaInspecoes;
                            oFormulario.Observacoes             = "";
                            oFormulario.items                   = [];
                            oFormulario.Status                  = "P";
                            oFormulario.Retorno                 = [];
                            oFormulario.VisibilidadeRetorno     = false;
                            oFormulario.VisibilidadeInformacoes = true;
                            oFormulario.VisibilidadeTAG         = true;

                            oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setData(oFormulario);
                            oController.inicializaCamposNumericos();

                            resolve();
                        }
                    );
                })
            },

            onAfterRendering: function(oEvent) {
                oController.inicializaCamposNumericos();
            },

            inicializaCamposNumericos: function() {
                const blocoRoletes = oController.byId("roletesBlock").getAggregation("_views");
                if (!!blocoRoletes && blocoRoletes.length > 0) {
                    oController.inicializaLimpezaFoco(blocoRoletes[0], "inputRoletesVazandoLD");
                    oController.inicializaLimpezaFoco(blocoRoletes[0], "inputRoletesVazandoLE");
                }

                const blocoTemperaturas = oController.byId("temperaturaBlock").getAggregation("_views");
                if (!!blocoTemperaturas && blocoTemperaturas.length > 0) {
                    oController.inicializaLimpezaFoco(blocoTemperaturas[0], "inputPino");
                    oController.inicializaLimpezaFoco(blocoTemperaturas[0], "inputTemp");
                }
			},

            inicializaLimpezaFoco: function(bloco, id) {
				const input = bloco.byId(id);
				if (!input) {
					return;
				};
                oController.limpaZerosNoFoco(input);
            },

            agruparComponentes: function (pData) {
                const data      = pData;
                const resultArr = [];
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
