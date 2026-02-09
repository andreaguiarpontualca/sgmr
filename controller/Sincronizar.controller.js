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
        var oController;
        var oView;
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.Sincronizar", {
            onInit: function () {

                oController = this;
                // oController.registraModeloMensagem();
                oView = oController.getView();

                var omaterialRodante = [
                    { Codigo: "Equipamento" },
                    { Codigo: "Formulário" }
                ]

                oController.getOwnerComponent().getModel("sincronizarModel").setData(omaterialRodante);
                oController.getOwnerComponent().getModel("sincronizarModel").refresh()

                oView.bindElement("busyDialogModel>/")

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Sincronizar").attachMatched(this._handleRouteMatched, this);

            },

            _handleRouteMatched: function (oEvent) {
                this.limparMensagens();
                oView.byId("sincronismoFormContainer").setBusy(true);
                var aLeituras = [
                    oController.carregarDadosIndexDB("tb_autorizacao", "listaAutorizacaoModel"),
                    oController.carregarDadosIndexDB("tb_perfil", "listaPerfilModel"),
                    oController.carregarDadosIndexDB("tb_centros", "listaCentrosModel"),
                    oController.carregarDadosIndexDB("tb_usuario", "listaUsuariosModel"),
                    oController.carregarDadosIndexDB("tb_equipamento", "listaEquipamentoModel"),
                    oController.carregarDadosIndexDB("tb_formulario", "listaFormularioModel"),
                    oController.carregarDadosIndexDB("tb_medicao", "listaMedicoesModel")
                ];

                Promise.all(aLeituras).then(function (result) {
                    oView.byId("sincronismoFormContainer").setBusy(false);
                    var oAcessos = oController.getOwnerComponent().getModel("acessosModel").getData();
                    oView.byId("downloadPerfilButton").setVisible(oAcessos.perfil);
                    oView.byId("downloadCentrosButton").setVisible(oAcessos.perfil);
                    oView.byId("downloadAutorizacaoButton").setVisible(oAcessos.perfil);
                    oView.byId("downloadUsuarioButton").setVisible(oAcessos.usuario);
                })
            },

            onNavBack: function () {
                this.limparMensagens();

                this.getRouter().navTo("Inicio", {}, true /*no history*/);
            },

            onSincronizar: function (oEvent) {
                this.limparMensagens();

                oController.onSincronizarGeral(oController, false)
            },

            onDownloadAutorizacao: function (oEvent) {
                this.limparMensagens();

                var vButton = "downloadAutorizacaoButton"
                var vTabela = "tb_autorizacao"
                var vModel = "listaAutorizacaoModel"
                oView.byId(vButton).setBusy(true);
                oController.carregarAutorizacoes().then(function () {
                    oController.limparTabelaIndexDB(vTabela).then(function (oEvent) {
                        var aDados = oController.getOwnerComponent().getModel(vModel).getData() || [];
                        oController.gravarTabelaIndexDB(vTabela, aDados).then(function () {
                            oView.byId(vButton).setBusy(false);
                            MessageToast.show("Download de Autorizações concluído");
                        }).catch(function () {
                            oView.byId(vButton).setBusy(false);
                        })
                    }).catch(function () {
                        oView.byId(vButton).setBusy(false);
                    })
                }).catch(function () {
                    oView.byId(vButton).setBusy(false);
                })
            },

            onDownloadPerfil: function (oEvent) {
                this.limparMensagens();

                var vButton = "downloadPerfilButton"
                var vTabela = "tb_perfil"
                var vModel = "listaPerfilModel"
                oView.byId(vButton).setBusy(true);
                oController.carregarPerfil().then(function () {
                    oController.limparTabelaIndexDB(vTabela).then(function (oEvent) {
                        var aDados = oController.getOwnerComponent().getModel(vModel).getData() || [];
                        oController.gravarTabelaIndexDB(vTabela, aDados).then(function () {
                            oView.byId(vButton).setBusy(false);
                            MessageToast.show("Download de Perfis concluído");
                        }).catch(function () {
                            oView.byId(vButton).setBusy(false);
                        })
                    }).catch(function () {
                        oView.byId(vButton).setBusy(false);
                    })
                }).catch(function () {
                    oView.byId(vButton).setBusy(false);
                })
            },

            onDownloadCentros: function (oEvent) {
                this.limparMensagens();

                var vButton = "downloadCentrosButton"
                var vTabela = "tb_centros"
                var vModel = "listaCentrosModel"
                oView.byId(vButton).setBusy(true);
                oController.carregarCentro().then(function () {
                    oController.limparTabelaIndexDB(vTabela).then(function (oEvent) {
                        var aDados = oController.getOwnerComponent().getModel(vModel).getData() || [];
                        oController.gravarTabelaIndexDB(vTabela, aDados).then(function () {
                            oView.byId(vButton).setBusy(false);
                            MessageToast.show("Download de Centros concluído");
                        }).catch(function () {
                            oView.byId(vButton).setBusy(false);
                        })
                    }).catch(function () {
                        oView.byId(vButton).setBusy(false);
                    })
                }).catch(function () {
                    oView.byId(vButton).setBusy(false);
                })
            },

            onDownloadEquipamento: function (oEvent) {
                this.limparMensagens();

                const vButton = "downloadEquipamentoButton"
                const vTabela = "tb_equipamento"
                const vModel  = "listaEquipamentoModel"
                oView.byId(vButton).setBusy(true);
                oController.carregarEquipamento()
                .then(() => {
                    oController.limparTabelaIndexDB(vTabela)
                    .then(() => {
                        const aDados = oController.getOwnerComponent().getModel(vModel).getData() || [];
                        oController.gravarTabelaIndexDB(vTabela, aDados)
                        .then(() => {
                            const aForms        = oController.agruparFormularios(aDados);
                            const aEqunrs       = oController.agruparPorCampo(aDados, "Equnr");
                            const aModelos      = oController.agruparPorCampo(aDados, "Modelo");
                            const aLeiturasForm = [
                                oController.carregarComponentes(aEqunrs).catch(   () => oController.carregarDadosIndexDB("tb_componentes",   "listaComponentesModel" )),
                                oController.carregarCondicoes(aForms).catch(      () => oController.carregarDadosIndexDB("tb_condicoes",     "listaCondicoesModel"   )),
                                oController.carregarInspecoes(aForms).catch(      () => oController.carregarDadosIndexDB("tb_inspecoes",     "listaInspecoesModel"   )),
                                oController.carregarTemperaturas(aForms).catch(   () => oController.carregarDadosIndexDB("tb_temperaturas",  "listaTemperaturasModel")),
                                oController.carregarListaDesgaste(aModelos).catch(() => oController.carregarDadosIndexDB("tb_listadesgaste", "listaDesgastesModel"   ))                                
                            ];

                            Promise.all(aLeiturasForm)
                            .then(() => {
                                //Preencher aqui as tabelas que precisam ser limpas antes da atualização
                                oController.atualizarBusyDialog(oController.i18n("preparandobancos"));
                                const aLimpezas = [
                                    oController.limparTabelaIndexDB("tb_componentes"),
                                    oController.limparTabelaIndexDB("tb_condicoes"),
                                    oController.limparTabelaIndexDB("tb_inspecoes"),
                                    oController.limparTabelaIndexDB("tb_temperaturas"),
                                    oController.limparTabelaIndexDB("tb_listadesgaste")
                                ];
                                Promise.all(aLimpezas)
                                .then(() => {
                                    const aComponentes  = oController.getOwnerComponent().getModel("listaComponentesModel" ).getData();
                                    const aCondicoes    = oController.getOwnerComponent().getModel("listaCondicoesModel"   ).getData();
                                    const aInspecoes    = oController.getOwnerComponent().getModel("listaInspecoesModel"   ).getData();
                                    const aTemperaturas = oController.getOwnerComponent().getModel("listaTemperaturasModel").getData();
                                    const aDesgastes    = oController.getOwnerComponent().getModel("listaDesgastesModel"   ).getData();
                                    const aGravacoes    = [
                                        oController.gravarTabelaIndexDB("tb_componentes",   aComponentes),
                                        oController.gravarTabelaIndexDB("tb_condicoes",     aCondicoes),
                                        oController.gravarTabelaIndexDB("tb_inspecoes",     aInspecoes),
                                        oController.gravarTabelaIndexDB("tb_temperaturas",  aTemperaturas),
                                        oController.gravarTabelaIndexDB("tb_listadesgaste", aDesgastes)                                                
                                    ];
                                    Promise.all(aGravacoes)
                                    .then((result) => {
                                        oView.byId(vButton).setBusy(false);
                                        MessageToast.show("Download de Equipamentos concluído");
                                    });
                                }).catch((error) => oView.byId(vButton).setBusy(false));
                            }).catch((error) => oView.byId(vButton).setBusy(false));
                        }).catch((error) => oView.byId(vButton).setBusy(false));
                    }).catch((error) => oView.byId(vButton).setBusy(false));
                }).catch((error) => oView.byId(vButton).setBusy(false));
            },

            onDownloadUsuario: function (oEvent) {
                this.limparMensagens();

                var vButton = "downloadUsuarioButton"
                var vTabela = "tb_usuario"
                var vModel = "listaUsuariosModel"
                oView.byId(vButton).setBusy(true);
                oController.carregarUsuario().then(function () {
                    oController.limparTabelaIndexDB(vTabela).then(function (oEvent) {
                        var aDados = oController.getOwnerComponent().getModel(vModel).getData() || [];
                        oController.gravarTabelaIndexDB(vTabela, aDados).then(function () {
                            oView.byId(vButton).setBusy(false);
                            MessageToast.show("Download de Usuários concluído");
                        }).catch(function () {
                            oView.byId(vButton).setBusy(false);
                        })
                    }).catch(function () {
                        oView.byId(vButton).setBusy(false);
                    })
                }).catch(function () {
                    oView.byId(vButton).setBusy(false);
                })
            },

            onDownloadFormulario: function (oEvent) {
                this.limparMensagens();

                var vButton = "downloadFormularioButton"
                var vTabela = "tb_formulario"
                var vModel = "listaFormularioModel"
                oView.byId(vButton).setBusy(true);
                oController.carregarFormulario().then(function () {
                    oController.limparTabelaIndexDB(vTabela).then(function (oEvent) {
                        var aDados = oController.getOwnerComponent().getModel(vModel).getData() || [];
                        oController.gravarTabelaIndexDB(vTabela, aDados).then(function () {
                            oView.byId(vButton).setBusy(false);
                            MessageToast.show("Download de Formulários concluído");
                        }).catch(function () {
                            oView.byId(vButton).setBusy(false);
                        })
                    }).catch(function () {
                        oView.byId(vButton).setBusy(false);
                    })
                }).catch(function () {
                    oView.byId(vButton).setBusy(false);
                })
            },            

            onUploadMedicao: function (oEvent) {
                this.limparMensagens();
                oView.byId("uploadMedicaoButton").setBusy(true);
                oController.medicaoUpdate(oController, true).then(function () {
                    oView.byId("uploadMedicaoButton").setBusy(false);
                    MessageToast.show("Upload de Medições concluído");
                })
            }

        });
    });
