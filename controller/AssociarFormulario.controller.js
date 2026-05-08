sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
	"sap/ui/core/Fragment",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/MessageToast',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel'
],
    function (Controller, formatter, Fragment, Filter, FilterOperator, MessageToast, MessagePopover, MessageItem, JSONModel) {
        "use strict";
        var oController;
        var oView;
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.AssociarFormulario", {
            onInit: function () {

                oController = this;
                oView = oController.getView();
                this.getView().addStyleClass("sapUiSizeCompact");

                var oFormularioSet = { Codigo: "" };


                oController.getOwnerComponent().getModel("listaAssociarFormularioModel").setData(oFormularioSet);
                oController.getOwnerComponent().getModel("listaAssociarFormularioModel").refresh();


                oView.bindElement("listaEquipamentoModel>/");
                oView.bindElement("layoutTelaModel>/");
                oView.bindElement("busyDialogModel>/");
                oView.bindElement("objectPageModel>/");
                oView.bindElement("listaFormularioModel>/");
                oView.bindElement("listaAssociarFormularioModel>/");
                
                /* var aCondicoes = [{ key: "Formulário 321" }, { key: "Formulário 322" }, { key: "Formulário 323" }]
                oController.getOwnerComponent().getModel("formularioModel").setData(aCondicoes);
                oController.getOwnerComponent().getModel("formularioModel").refresh(); */

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("AssociarFormulario").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {
                var oFormularioSet = { Codigo: "" };
                oController.getOwnerComponent().getModel("listaAssociarFormularioModel").setData(oFormularioSet);
                oController.getOwnerComponent().getModel("listaAssociarFormularioModel").refresh();
            },


            onNavBack: function () {
                this.getRouter().navTo("Administrativo", {}, true /*no history*/);
            },

            onCancelarFormulario: function () {
                oController.getRouter().navTo("Administrativo", {}, true /*no history*/);
            },

            onConfirmarFormulario: function () {
                var aMockMessages = [];
                var vPodeGravar = true;
                var oFormulario = oController.getOwnerComponent().getModel("listaAssociarFormularioModel").getData();
                var oFormularioInput = oView.byId("formularioInput");
                var oConfirmarButton = oView.byId("idConfirmarFormularioButton");
                oConfirmarButton.setEnabled(false);
                oConfirmarButton.setBusy(true);

                if (oFormulario.CodigoFormulario == "") {
                    oFormularioInput.setValueState("Error");
                    oController.adicionarMensagemErro("campoobrigatorio", "formulario", "campoformulario");
                    vPodeGravar = false;
                } 

                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                if (vPodeGravar == true) {
                    oFormularioInput.setValueState("None");
                    var aModelosEquipamentos = oController.getOwnerComponent().getModel("modeloEquipamentoModel").getData();
                    var aAssociacoes = oController.getOwnerComponent().getModel("listaAssociarFormularioModel").getData();
                    if (!Array.isArray(aAssociacoes)) {
                        aAssociacoes = [];
                    }
                    // Procurar associação existente
                    var oAssociacaoExistente = aAssociacoes.find(function(assoc) {
                        return assoc.CodigoFormulario === oFormulario.CodigoFormulario;
                    });
                    if (oAssociacaoExistente) {
                        // Atualizar apenas a propriedade Selecionado dos equipamentos
                        oAssociacaoExistente.ModelosEquipamentosAssociados.forEach(function(equipAssoc) {
                            var equipAtual = aModelosEquipamentos.find(function(e) {
                                return e.CodigoModeloEquipamento === equipAssoc.CodigoModeloEquipamento;
                            });
                            if (equipAtual) {
                                equipAssoc.Selecionado = !!equipAtual.Selecionado;
                            }
                        });
                        oAssociacaoExistente.DataAssociacao = new Date().toISOString();
                    } else {
                        // Criar nova associação
                        var aModelosEquipamentosParaSalvar = aModelosEquipamentos.map(function(oEquipamento) {
                            return {
                                CodigoModeloEquipamento: oEquipamento.CodigoModeloEquipamento,
                                DescricaoModeloEquipamento: oEquipamento.DescricaoModeloEquipamento,
                                CodigoFormulario: oFormulario.CodigoFormulario,
                                Selecionado: !!oEquipamento.Selecionado,
                                Sincronizado: false
                            };
                        });
                        var oAssociacaoFormulario = {
                            CodigoFormulario: oFormulario.CodigoFormulario,
                            ModelosEquipamentosAssociados: aModelosEquipamentosParaSalvar,
                            DataAssociacao: new Date().toISOString(),
                            Sincronizado: false
                        };
                        aAssociacoes.push(oAssociacaoFormulario);
                    }
                    oController.getOwnerComponent().getModel("listaAssociarFormularioModel").setData(aAssociacoes);
                    oController.getOwnerComponent().getModel("listaAssociarFormularioModel").refresh();
                    oController.limparTabelaIndexDB("tb_associarFormulario")
                    .then(() => {
                        oController.gravarTabelaIndexDB("tb_associarFormulario", aAssociacoes)
                        .then(() => {
                            MessageToast.show(oController.i18n("dadossucesso"), {
                                onClose: function () {
                                    oConfirmarButton.setEnabled(true);
                                    oConfirmarButton.setBusy(false);
                                }
                            });
                        }).catch(() => {
                            MessageToast.show("Erro ao gravar dados localmente");
                            oConfirmarButton.setEnabled(true);
                            oConfirmarButton.setBusy(false);
                        });
                    }).catch(() => {
                        MessageToast.show("Erro ao limpar tabela local");
                        oConfirmarButton.setEnabled(true);
                        oConfirmarButton.setBusy(false);
                    });
                }
                if (aMockMessages.length > 0) {
                    var oModel = new JSONModel();
                    oModel.setData(aMockMessages);
                    this.getView().setModel(oModel);
                }
                if (vPodeGravar === false) {
                    oConfirmarButton.setEnabled(true);
                    oConfirmarButton.setBusy(false);
                }
            },

            //Formulários
            _handleAssociarFormularioValueHelpRequest: function (oEvent) {
                var oView = this.getView();
                this._sInputId = oEvent.getSource().getId();

                if (!this._pPerfilValueHelpDialog) {
                    this._pPerfilValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.pontual.sgmr.fragment.FormularioDialog",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }

                this._pPerfilValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                });
            },

            _handleAssociarFormularioValueHelpSearch: function (oEvent) {
                var sValue  = oEvent.getParameter("value");
                var oFilter = new Filter( "Modelo", FilterOperator.Contains, sValue );
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            _handleAssociarFormularioValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    var formulario = oSelectedItem.getModel("listaAssociarFormularioModel").getProperty(oSelectedItem.getBindingContext("listaAssociarFormularioModel").getPath()).Modelo;
                    oController.getOwnerComponent().getModel("listaAssociarFormularioModel").setProperty("/CodigoFormulario", formulario);
                    oController.carregarEquipamentosAssociados(formulario);
                }

            },
            
            carregarEquipamentosAssociados: function (codigoFormulario) {
                var aModelosEquipamentos = oController.getOwnerComponent().getModel("modeloEquipamentoModel").getData();
                oController.lerTabelaIndexDB("tb_associarFormulario").then(function(aAssociacoes) {
                    
                    if (aAssociacoes && aAssociacoes.tb_associarFormulario.length > 0) {
                        var aAssociacoesFormulario = aAssociacoes.tb_associarFormulario.filter(associacao => associacao.CodigoFormulario === codigoFormulario );
                        if (aAssociacoesFormulario.length > 0) {
                            oController.getOwnerComponent().getModel("modeloEquipamentoModel").setData(aAssociacoesFormulario[0].ModelosEquipamentosAssociados);
                        } else {
                            const aModelosEquipamentos = oController.getOwnerComponent().getModel("modeloEquipamentoModel").getData();
                            aModelosEquipamentos.forEach(equipamento => equipamento.Selecionado = false );
                            oController.getOwnerComponent().getModel("modeloEquipamentoModel").setData(aModelosEquipamentos);
                        }
                    } else {
                        const aModelosEquipamentos = oController.getOwnerComponent().getModel("modeloEquipamentoModel").getData();
                        aModelosEquipamentos.forEach(equipamento => equipamento.Selecionado = false );
                        oController.getOwnerComponent().getModel("modeloEquipamentoModel").setData(aModelosEquipamentos);
                    }
                    oController.getOwnerComponent().getModel("modeloEquipamentoModel").refresh();
                    
                    
                }).catch(function(error) {
                    console.error("Erro ao carregar associações do IndexDB:", error);
                    oController.getOwnerComponent().getModel("modeloEquipamentoModel").setData(aModelosEquipamentos);
                    oController.getOwnerComponent().getModel("modeloEquipamentoModel").refresh();
                });
            },
            
            atualizarSelecaoTabela: function() {
                console.log("Função atualizarSelecaoTabela chamada - mas agora usa binding automático");
            },

            onSelectionChange: function(oEvent) {
                var oTable = oEvent.getSource();
                var aSelectedItems = oTable.getSelectedItems();
                var aModelosEquipamentos = oController.getOwnerComponent().getModel("modeloEquipamentoModel").getData();
                
                aModelosEquipamentos.forEach(function(equipamento, index) {
                    equipamento.Selecionado = false;
                });
                
                aSelectedItems.forEach(function(oSelectedItem) {
                    var iIndex = oTable.indexOfItem(oSelectedItem);
                    if (iIndex >= 0 && aModelosEquipamentos[iIndex]) {
                        aModelosEquipamentos[iIndex].Selecionado = true;
                    }
                });
                
                oController.getOwnerComponent().getModel("modeloEquipamentoModel").setData(aModelosEquipamentos);
                oController.getOwnerComponent().getModel("modeloEquipamentoModel").refresh();
            },

            //Formulários
            onEliminarmaterialRodante: function (oEvent) {
                var omaterialRodante = oEvent.getSource().getBindingContext("listaEquipamentoModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaEquipamentoModel").getPath());
                var aUsuarios = oController.getOwnerComponent().getModel("listaUsuariosModel").getData()
                var oUsuario = aUsuarios.find(function (pUsuario) {
                    return pUsuario.materialRodante === omaterialRodante.DescrmaterialRodante
                })
                if (oUsuario == undefined) {
                    omaterialRodante.Sincronizado = "E"
                    oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh()
                    oController.limparTabelaIndexDB("tb_materialRodante")
                    .then(() => {
                        oController.gravarTabelaIndexDB("tb_materialRodante", oController.getOwnerComponent().getModel("listaEquipamentoModel").getData())
                        .then(() => {
                            MessageToast.show("materialRodante marcado para eliminação.");
                            oController.materialRodanteUpdate()
                            .then(() => {
                                MessageToast.show("materialRodante eliminado com sucesso");
                            });
                        });
                    });
                } else {
                    const msgErro = "materialRodante associado a usuário. Remova antes de eliminar.";
                    MessageToast.show(msgErro);
                    oController.adicionarMensagemErro("materialRodante em uso", "materialRodante", msgErro);
                }
            },

            onMaterialRodantePress: function (oEvent) {
                var omaterialRodante = oEvent.getSource().getBindingContext("listaEquipamentoModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaEquipamentoModel").getPath());
                var oObjetoNovo = JSON.parse(JSON.stringify(omaterialRodante));
                oObjetoNovo.HabilitarTelaCriarmaterialRodante = false
                oController.getOwnerComponent().getModel("materialRodanteCriarModel").setData(oObjetoNovo);
                oController.getOwnerComponent().getModel("materialRodanteCriarModel").refresh()
                oController.getOwnerComponent().getRouter().navTo("ObjectPageSection", null, true);
            },

            onCriarmaterialRodante: function (oEvent) {
                var omaterialRodante = {
                    CodigomaterialRodante: 0,
                    DescrmaterialRodante: "",
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    AutorizacaoSet: [
                        { CodigoAutorizacao: "01", DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",     Selecionado: false },
                        { CodigoAutorizacao: "02", DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE", Selecionado: false }
                    ]
                }
                oController.getOwnerComponent().getModel("materialRodanteCriarModel").setData(omaterialRodante);
                oController.getOwnerComponent().getModel("materialRodanteCriarModel").refresh()
                oController.getOwnerComponent().getRouter().navTo("CriarMaterialRodante", null, true);
            },

            onSincronizar: function (oEvent) {
                oController.onSincronizarGeral(oController, false)
            }

        });
    });
