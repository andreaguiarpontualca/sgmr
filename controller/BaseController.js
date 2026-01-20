sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    'sap/m/MessageToast',
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass"
], function (Controller, UIComponent, History, MessageToast, Fragment, syncStyleClass) {
    "use strict";
    var oController
    var oView

    const BD_VERSION = 8;
    var aFilters     = "";
    var oExpand      = "";
    var oPerfilChave = {};

    return Controller.extend("com.pontual.sgmr.controller.BaseController", {

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

		getResourceBundle: function () {
 			var modelo = this.getOwnerComponent().getModel("i18n");
 			if (!!modelo && typeof modelo.getResourceBundle === 'function') {
 				return modelo.getResourceBundle();
 			}
			return;
		},
		
		i18n: function (chave, parametros) {
			if (!chave) {
				return this.getResourceBundle();
			} 
			var rb = this.getResourceBundle(); 
			if (rb) {
				return rb.getText(chave, (parametros || []));
			}
			return chave;
		},

        onNavBack: function () {
            var oHistory, sPreviousHash;

            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("Login", {}, true /*no history*/);
            }
        },

        onNavBackCordova: function () {
            MessageToast.show('Por favor utilize o botão voltar da aplicação', {
                duration: 500
            })
        },

        onSairApp: function () {
            this.getRouter().navTo("Login", {}, true /*no history*/);
        },

        carregarAcessos: function () {
            oController = this;
            const aAutorizacoes = oController.getOwnerComponent().getModel("usuarioModel").getProperty("/Autorizacoes")
            const oAcesso       = {
                administrativo  : false,
                materialrodante : false,
                perfil          : false,
                usuario         : false,
                associar        : false,
                sincronizar     : false
            }

            if (aAutorizacoes) {
                aAutorizacoes.forEach(oAutorizacao => {
                    if (oAutorizacao.CodigoAutorizacao == "001") {
                        oAcesso.materialrodante = true;
                    }
                    if (oAutorizacao.CodigoAutorizacao == "002" || oAutorizacao.CodigoAutorizacao == "003" || oAutorizacao.CodigoAutorizacao == "004" || oAutorizacao.CodigoAutorizacao == "005") {
                        oAcesso.administrativo = true;
                        if (oAutorizacao.CodigoAutorizacao == "002") {
                            oAcesso.perfil = true;
                        }
                        if (oAutorizacao.CodigoAutorizacao == "003") {
                            oAcesso.usuario = true;
                        }
                        if (oAutorizacao.CodigoAutorizacao == "004") {
                            oAcesso.associar = true;
                        }
                    }
                });
                oController.getOwnerComponent().getModel("acessosModel").setData(oAcesso);
                oController.getOwnerComponent().getModel("acessosModel").refresh();
            }
        },

        inicializaModeloSGMR: function() {
            const sgmrODataModel = this.getOwnerComponent().getModel("sgmrODataModel");

            if (sgmrODataModel._inicializado) {
                return;
            }

            sgmrODataModel.setHeaders(this.getModelHeader());
            sgmrODataModel.setUseBatch(false);
            sgmrODataModel._inicializado = true;

            sgmrODataModel.attachRequestSent(function () {
                oController?.closeBusyDialog && oController.closeBusyDialog();
            });

            sgmrODataModel.attachRequestCompleted(function () {
                oController?.closeBusyDialog && oController.closeBusyDialog();
            });

            sgmrODataModel.attachMetadataLoaded(function () {
                oController?.closeBusyDialog && oController.closeBusyDialog();
            });

            sgmrODataModel.attachRequestFailed(function (oError) {
                oController?.closeBusyDialog && oController.closeBusyDialog();
                const response = oError.getParameter("response");
                const titulo   = response?.statusCode == 500 ? "Erro interno no SAP" : "Problemas de conexão";
                const pServico = oError.getParameter("url").substr(oError.getParameter("url").lastIndexOf("/") + 1);
                oController.atualizarBusyDialog(oError.getParameter("message"));
                oController.adicionarMensagemErro(titulo, "Problemas no serviço " + pServico, response);
            });

            sgmrODataModel.attachMetadataFailed(function (oError) {
                oController?.closeBusyDialog && oController.closeBusyDialog();
                oController.atualizarBusyDialog(oError.getParameter("message"));
                const response = oError.getParameter("response");
                const pServico = oError.getParameter("url").substr(oError.getParameter("url").lastIndexOf("/") + 1);
                oController.adicionarMensagemErro("Problemas no SAP", "Problemas no serviço " + pServico, response);
            });
        },

        //-- MENSAGENS --//

        mMensagens: function() {
            return this.getOwnerComponent().getModel("mMensagens");
        },
        
		adicionarMensagemSucesso: function (message, subtitle, description) {
			this.adicionarMensagem("Success", message, subtitle, description);
		},

		adicionarMensagemAviso: function (message, subtitle, description) {
			this.adicionarMensagem("Warning", message, subtitle, description);
		},

		adicionarMensagemInfo: function (message, subtitle, description) {
			this.adicionarMensagem("Information", message, subtitle, description);
		},

		adicionarMensagemErro: function (message, subtitle, description) {
			let descricao = '';
			if (typeof description === 'string') {
				descricao = description;
			} else if (typeof description === 'object') {
				try {
					const mensagem  = description?.responseText;
					const oMensagem = JSON.parse(mensagem);
					descricao       = oMensagem.error.message.value;
				} catch (error) {
					descricao = description?.responseText || description?.message || '';
				}
			}
			this.adicionarMensagem("Error", message, subtitle, descricao);
		},

		adicionarMensagem: function (type, titulo, subtitulo, descricao) {
            const title       = (!titulo    || titulo.includes(" ")   ) ? titulo    : this.i18n(titulo);
            const subtitle    = (!subtitulo || subtitulo.includes(" ")) ? subtitulo : this.i18n(subtitulo);
            const description = (!descricao || descricao.includes(" ")) ? descricao : this.i18n(descricao);
            this._adicionaMensagem({ type, title, subtitle, description });
		},
		
        _adicionaMensagem: function (mensagem) {
            try {
                const model     = this.mMensagens();
                const mensagens = model?.getData() || [];
                mensagens.push(mensagem);
                model?.setData(mensagens);
                model?.refresh(true);
            } catch (error) {
                console.error("Erro ao tentar adicionar mensagem:", error);
            }
		},

        limparMensagens: function() {
            const model = this.mMensagens();
            model?.setData([]);
            model?.refresh(true);
            sap.ui.getCore()?.getMessageManager()?.removeAllMessages();
        },
       
        exibeMensagens: function(oEvent) {
            const popover = oController.getOwnerComponent().obtemPopoverMensagens();
            if (!popover.getModel("mMensagens")) {
                popover.setModel(oController.mMensagens(), "mMensagens");
            }
            popover.openBy(oEvent.getSource());
        },
    
        //---------------//

        /** Funções de Banco de Dados */


        gravarLocalStorage: function (pStorage, pData) {
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            oStorage.put(pStorage, pData);
        },

        lerLocalStorage: function (pStorage) {
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var oData = oStorage.get(pStorage);

            return oData;
        },

        gravarNomeBancoDados: function (pUsuario) {
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var data = {
                "databasename": "BDSGMR_" + pUsuario
            };
            oStorage.put("SGMR_StorageSet", data);
        },

        getDatabaseName: function () {
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var oData = oStorage.get("SGMR_StorageSet");

            return oData.databasename;
        },

        getDatabaseVersion: function () {
            return BD_VERSION;
        },


        onInit: function () {
            oController = this;
            oView = oController.getView();

            oView.bindElement("conexaoModel>/");
            oView.bindElement("busyDialogModel>/")

            if (oController.checkConnection() == true) {
                oController.onOnline()
            } else {
                oController.onOffline()
            }

            window.onoffline = (event) => {
                oController.onOffline()
            };

            window.ononline = (event) => {
                oController.onOnline()
            };
            window.addEventListener("orientationchange", oController.onOrientationChange());

            if (window.hasOwnProperty("cordova")) {
                document.addEventListener('deviceready', oController.onDeviceReady.bind(this), false);

            } else {
                oController.limparMensagens();
                oController.getOwnerComponent().getRouter().navTo("Login", null, true);
            }
        },

        onDeviceReady: function () {
            if (window.location.hash == "") {
                oController.limparMensagens();

                var oConexao = oController.lerLocalStorage("SGMR_DadosConexao")
                if (oConexao != null && oConexao.urlsemclient != "") {
                    oController.getOwnerComponent().getRouter().navTo("Login", null, true);
                } else {
                    oController.getOwnerComponent().getRouter().navTo("Configurar", null, true);
                }
            }
        },

        onOnline: function (oEvent) {
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://connected")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Success")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "online")
            oController.getOwnerComponent().getModel("conexaoModel").refresh(true)

        },

        onOffline: function (oEvent) {
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://disconnected")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Error")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "offline")
            oController.getOwnerComponent().getModel("conexaoModel").refresh(true)
        },

        onOrientationChange: function () {
            //console.log(screen.orientation.type);
        },


        buttonTypeFormatter: function () {
            var sHighestSeverityIcon;
            var aMessages = this.mMensagens()?.getData() || [];

            if (!Array.isArray(aMessages)) {
                return "Neutral";
            }

            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sHighestSeverityIcon = "Negative";
                        break;
                    case "Warning":
                        sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" ? "Critical" : sHighestSeverityIcon;
                        break;
                    case "Success":
                        sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ? "Success" : sHighestSeverityIcon;
                        break;
                    default:
                        sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
                        break;
                }
            });

            return sHighestSeverityIcon;
        },

        buttonIconFormatter: function () {
            var sIcon;
            var aMessages = this.mMensagens()?.getData() || [];

            if (!Array.isArray(aMessages)) {
                return;
            }

            aMessages.forEach(function (sMessage) {
                switch (sMessage.type) {
                    case "Error":
                        sIcon = "sap-icon://error";
                        break;
                    case "Warning":
                        sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                        break;
                    case "Success":
                        sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                        break;
                    default:
                        sIcon = !sIcon ? "sap-icon://information" : sIcon;
                        break;
                }
            });

            return sIcon;
        },

        criptografar: function (content) {
            return btoa(unescape(encodeURIComponent(content)));
        },

        descriptografar: function (content) {
            try {
                return atob(content);
            } catch (error) {
                return content;
            }
        },

        enviarDados: function (pServico, pDados) {

            oController = this;
            return new Promise((resolve, reject) => {
                var sgmrODataModel = oController.getConnectionModel("sgmrODataModel");
                sgmrODataModel.setHeaders(oController.getModelHeader());
                sgmrODataModel.setUseBatch(false);

                if (typeof sgmrODataModel.setRefreshAfterChange === "function") {
                    sgmrODataModel.setRefreshAfterChange(false);
                }

                sgmrODataModel.create("/" + pServico, pDados, {
                    success: function (oData) {
                        resolve(oData);
                    },
                    error: function (oError) {
                        oController.closeBusyDialog();
                        reject(oError);
                    }
                });

                // sgmrODataModel.attachRequestFailed(function (oError) {
                //     oController.atualizarBusyDialog(oError.getParameter("message"));
                //     oController.closeBusyDialog();
                //     const response = oError.getParameter("response");
                //     const titulo   = response?.statusCode == 500 ? "Erro interno no SAP" : "Problemas de conexão";
                //     oController.adicionarMensagemErro(titulo, "Problemas no serviço " + pServico, response);
                //     reject(oError);
                // });

                // sgmrODataModel.attachMetadataFailed(function (oError) {
                //     oController.atualizarBusyDialog(oError.getParameter("message"));
                //     oController.closeBusyDialog()
                //     oController.adicionarMensagemErro("Problemas no SAP", "Metadados no serviço " + pServico, oError.getParameter('response'));
                //     reject(oError);
                // });
            })

        },

        carregarDados: function (pServico, pFiltros) {
            oController = this;
            return new Promise((resolve, reject) => {
                var aFilters = []
                var sgmrODataModel = oController.getConnectionModel("sgmrODataModel");
                sgmrODataModel.setHeaders(oController.getModelHeader());
                sgmrODataModel.setUseBatch(false);

                switch (pServico) {
                    case "PerfilSet":
                        oExpand = "PerfilCentroSet,AutorizacaoSet";
                        aFilters = [];
                        break;

                    case "ListaCentroSet":
                        oExpand = ""
                        aFilters = [];
                        break;

                    case "ListaAutorizacaoSet":
                        oExpand = ""
                        aFilters = [];
                        break;

                    case "ListaEquipamentoSet":
                        oExpand = ""
                        aFilters = [];
                        for (let index = 0; index < pFiltros.length; index++) {
                            const element = pFiltros[index];
                            var filter = new sap.ui.model.Filter({ path: element.key, operator: sap.ui.model.FilterOperator.EQ, value1: element.value });
                            aFilters.push(filter);
                        }
                        break;

                    case "ListaFormularioSet":
                        oExpand = ""
                        aFilters = [];
                        break;

                    case "UsuarioSet":
                        oExpand = ""
                        aFilters = [];
                        break;

                    default:
                        break;
                }

                sgmrODataModel.read("/" + pServico, {
                    filters: aFilters,
                    urlParameters: {
                        "$expand": oExpand
                    },
                    success: function (oData, oResponse) {
                        resolve(oData);
                    },
                    error: function (oError) {
                        oController.closeBusyDialog();
                        reject(oError);
                    }
                });

                // sgmrODataModel.attachRequestSent(function () {
                //     oController.closeBusyDialog();
                // });

                // sgmrODataModel.attachRequestCompleted(function () {
                //     oController.closeBusyDialog();
                // });

                // sgmrODataModel.attachRequestFailed(function (oError) {
                //     oController.closeBusyDialog();
                //     oController.atualizarBusyDialog(oError.getParameter("message"));
                //     const response = oError.getParameter("response");
                //     const titulo   = response?.statusCode == 500 ? "Erro interno no SAP" : "Problemas de conexão";
                //     oController.adicionarMensagemErro(titulo, "Problemas no serviço " + pServico, response);
                //     reject(oError);
                // });

                // sgmrODataModel.attachMetadataLoaded(function () {
                //     oController.closeBusyDialog();
                // });

                // sgmrODataModel.attachMetadataFailed(function (oError) {
                //     oController.atualizarBusyDialog(oError.getParameter("message"));
                //     oController.closeBusyDialog();
                //     oController.adicionarMensagemErro("Problemas no SAP", "Problemas no serviço " + pServico, oError.getParameter("response"));
                //     reject(oError);
                // });

            })
        },

        carregarPerfil: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandoperfis"));
                oController.carregarDados("PerfilSet", []).then(function (result) {
                    var aPerfis = []
                    for (let x = 0; x < result.results.length; x++) {
                        const oPerfil = result.results[x];
                        oPerfil.AutorizacaoSet = oPerfil.AutorizacaoSet.results;
                        oPerfil.PerfilCentroSet = oPerfil.PerfilCentroSet.results;
                        oPerfil.AutorizacaoSet.forEach(element => {
                            delete element.__metadata

                        });

                        oPerfil.PerfilCentroSet.forEach(element => {
                            delete element.__metadata
                        });

                        delete oPerfil.__metadata
                        aPerfis.push(oPerfil);
                    }
                    oController.getOwnerComponent().getModel("listaPerfilModel").setData(aPerfis)
                    var vDescricao = "Perfis sincronizados " + aPerfis.length
                    oController.adicionarMensagemSucesso(vDescricao, "Download de perfis", "Perfis encaminhados para o dispositivo");
                    resolve()
                }).catch( result => reject(result) )
            })
        },

        carregarPerfilIndexDB: function () {
            oController = this;
            return new Promise((resolve, reject) => {
                oController.lerTabelaIndexDB("tb_perfil")
                .then( result => {
                    oController.getOwnerComponent().getModel("listaPerfilModel").setData(result.tb_perfil);
                    resolve();
                })
                .catch(() => reject());
            })
        },

        carregarCentro: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandocentros"));
                oController.carregarDados("ListaCentroSet", []).then(function (result) {
                    for (let x = 0; x < result.results.length; x++) {
                        result.results.forEach(element => {
                            delete element.__metadata
                        });
                    }

                    oController.getOwnerComponent().getModel("listaCentrosModel").setData(result.results);
                    var vDescricao = "Centros sincronizados " + result.results.length
                    oController.adicionarMensagemSucesso(vDescricao, "Centros encaminhados para o dispositivo", "Download de centros");
                    resolve()
                }).catch( result => reject(result) )
            })
        },

        carregarAutorizacoes: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandoautorizacoes"));
                oController.carregarDados("ListaAutorizacaoSet", []).then(function (result) {
                    var aAutorizacoes = []
                    for (let x = 0; x < result.results.length; x++) {
                        const oAutorizacao = result.results[x];
                        delete oAutorizacao.__metadata
                        aAutorizacoes.push(oAutorizacao);
                    }
                    oController.getOwnerComponent().getModel("listaAutorizacaoModel").setData(aAutorizacoes)
                    oController.adicionarMensagemSucesso("Autorizações sincronizadas " + aAutorizacoes.length, "Autorizações download", "Autorizações encaminhados para o dispositivo");
                    resolve()
                }).catch( result => {
                    oController.closeBusyDialog();
                    reject(result)
                })
            })
        },

        atualizarBusyDialog: function (pMensagem) {
            oController = this;
            oController.getOwnerComponent().getModel("busyDialogModel").setProperty("/mensagem", pMensagem)
            oController.getOwnerComponent().getModel("busyDialogModel").refresh()
        },

        closeBusyDialog: function () {
            var loginInProgress = false;
            try {
                loginInProgress = this.getOwnerComponent().getModel("busyDialogModel").getProperty("/loginInProgress");
            } catch (e) {
                loginInProgress = false;
            }

            if (!loginInProgress && this._pBusyDialog) {
                this._pBusyDialog.then(function (oBusyDialog) {
                    oBusyDialog.close();
                });
            }
        },

        sincronizarReceber: function () {

            oController = this;
            return new Promise((resolve, reject) => {
                if (oController.checkConnection() == true) {

                    // Carregar dados do servidor quando há conexão
                    var aLeituras = [
                        oController.carregarAutorizacoes().catch(() => oController.carregarDadosIndexDB("tb_autorizacao", "listaAutorizacaoModel")),
                        oController.carregarPerfil().catch(() => oController.carregarDadosIndexDB("tb_perfil", "listaPerfilModel")),
                        oController.carregarCentro().catch(() => oController.carregarDadosIndexDB("tb_centros", "listaCentrosModel")),
                        oController.carregarUsuario().catch(() => oController.carregarDadosIndexDB("tb_usuario", "listaUsuariosModel")),
                        oController.carregarEquipamento().catch(() => oController.carregarDadosIndexDB("tb_equipamento", "listaEquipamentoModel")),
                        oController.carregarFormulario().catch(() => oController.carregarDadosIndexDB("tb_formulario", "listaFormularioModel"))
                    ];

                    Promise.all(aLeituras).then(function () {
                        // Preencher aqui as tabelas que precisam ser limpas antes da atualização
                        oController.atualizarBusyDialog(oController.i18n("preparandobancos"));
                        var aLimpezas = [
                            oController.limparTabelaIndexDB("tb_autorizacao"),
                            oController.limparTabelaIndexDB("tb_perfil"),
                            oController.limparTabelaIndexDB("tb_centros"),
                            oController.limparTabelaIndexDB("tb_usuario"),
                            oController.limparTabelaIndexDB("tb_equipamento"),
                            oController.limparTabelaIndexDB("tb_formulario")
                        ];

                        Promise.all(aLimpezas).then(function () {
                            var aAutorizacoes    = oController.getOwnerComponent().getModel("listaAutorizacaoModel").getData() || [];
                            var aPerfis          = oController.getOwnerComponent().getModel("listaPerfilModel").getData()      || [];
                            var aUsuarios        = oController.getOwnerComponent().getModel("listaUsuariosModel").getData()    || [];
                            var aCentros         = oController.getOwnerComponent().getModel("listaCentrosModel").getData()     || [];
                            var aMaterialRodante = oController.getOwnerComponent().getModel("listaEquipamentoModel").getData() || [];
                            var aFormularios     = oController.getOwnerComponent().getModel("listaFormularioModel").getData()  || [];

                            aPerfis.forEach(element => {
                                element.AutorizacaoSet.forEach(auth => {
                                    var oAutorizacao = aAutorizacoes.find((oElement) => auth.CodigoAutorizacao == oElement.CodigoAutorizacao);
                                    auth.DescrAutorizacao = oAutorizacao ? oAutorizacao.DescrAutorizacao : ""
                                })
                            });

                            var aGravacoes = [
                                oController.gravarTabelaIndexDB("tb_autorizacao", aAutorizacoes),
                                oController.gravarTabelaIndexDB("tb_perfil",      aPerfis),
                                oController.gravarTabelaIndexDB("tb_centros",     aCentros),
                                oController.gravarTabelaIndexDB("tb_usuario",     aUsuarios),
                                oController.gravarTabelaIndexDB("tb_equipamento", aMaterialRodante),
                                oController.gravarTabelaIndexDB("tb_formulario",  aFormularios)
                            ];

                            // Aguarda todas as gravações antes de continuar
                            Promise.all(aGravacoes).then(function () {

                                var aForms   = oController.agruparPorCampo(aMaterialRodante, "IdForm")
                                var aModelos = oController.agruparPorCampo(aMaterialRodante, "Modelo")
                                var aLeiturasForm = [
                                    oController.carregarComponentes(aForms).catch(    () => oController.carregarDadosIndexDB("tb_componentes",   "listaComponentesModel" )),
                                    oController.carregarCondicoes(aForms).catch(      () => oController.carregarDadosIndexDB("tb_condicoes",     "listaCondicoesModel"   )),
                                    oController.carregarTemperaturas(aForms).catch(   () => oController.carregarDadosIndexDB("tb_temperaturas",  "listaTemperaturasModel")),
                                    oController.carregarInspecoes(aForms).catch(      () => oController.carregarDadosIndexDB("tb_inspecoes",     "listaInspecoesModel"   )),
                                    oController.carregarListaDesgaste(aModelos).catch(() => oController.carregarDadosIndexDB("tb_listadesgaste", "listaDesgastesModel"   ))
                                ];

                                Promise.all(aLeiturasForm)
                                .then(() => {
                                    //Preencher aqui as tabelas que precisam ser limpas antes da atualização
                                    oController.atualizarBusyDialog(oController.i18n("preparandobancos"));
                                    var aLimpezas = [
                                        oController.limparTabelaIndexDB("tb_componentes"),
                                        oController.limparTabelaIndexDB("tb_condicoes"),
                                        oController.limparTabelaIndexDB("tb_temperaturas"),
                                        oController.limparTabelaIndexDB("tb_inspecoes"),
                                        oController.limparTabelaIndexDB("tb_listadesgaste")
                                    ];
                                    Promise.all(aLimpezas)
                                    .then( () => {
                                        var aComponentes = oController.getOwnerComponent().getModel("listaComponentesModel").getData();
                                        var aCondicoes   = oController.getOwnerComponent().getModel("listaCondicoesModel").getData();
                                        var aTemperaturas= oController.getOwnerComponent().getModel("listaTemperaturasModel").getData();
                                        var aInspecoes   = oController.getOwnerComponent().getModel("listaInspecoesModel").getData();
                                        var aDesgastes   = oController.getOwnerComponent().getModel("listaDesgastesModel").getData();
                                        var aGravacoes   = [
                                            oController.gravarTabelaIndexDB("tb_componentes",   aComponentes),
                                            oController.gravarTabelaIndexDB("tb_condicoes",     aCondicoes),
                                            oController.gravarTabelaIndexDB("tb_temperaturas",  aTemperaturas),
                                            oController.gravarTabelaIndexDB("tb_inspecoes",     aInspecoes),
                                            oController.gravarTabelaIndexDB("tb_listadesgaste", aDesgastes),
                                        ];
                                        Promise.all(aGravacoes).then( () => resolve());
                                    }).catch(() => {
                                        oController.closeBusyDialog();
                                        resolve();
                                    });
                                }).catch(() => {
                                    oController.closeBusyDialog();
                                    resolve();
                                });
                            }).catch((err) => {
                                oController.closeBusyDialog();
                                reject(err);
                            });
                        }).catch((err) => {
                            oController.closeBusyDialog();
                            reject(err);
                        });
                    }).catch((err) => {
                        oController.closeBusyDialog();
                        reject(err);
                    });

                } else {
                    // Sem conexão - carregar dados do IndexedDB
                    oController.atualizarBusyDialog(oController.i18n("carregarIDB"));
                    var aLeiturasOffline = [
                        oController.carregarDadosIndexDB("tb_autorizacao", "listaAutorizacaoModel"),
                        oController.carregarDadosIndexDB("tb_perfil",      "listaPerfilModel"),
                        oController.carregarDadosIndexDB("tb_centros",     "listaCentrosModel"),
                        oController.carregarDadosIndexDB("tb_usuario",     "listaUsuariosModel")
                    ];

                    Promise.all(aLeiturasOffline).then(function () {
                        oController.closeBusyDialog();
                        resolve();
                    }).catch(function (err) {
                        oController.closeBusyDialog();
                        reject(err);
                    });
                }
            });

        },

        sincronizar: function () {
            oController = this;
            return new Promise((resolve, reject) => {
                if (oController.checkConnection() == true) {
                    oController.limparMensagens();
                    oController.verificarDisponibilidadeServidor()
                    .then(result => {
                        oController.sincronizarEnviar()
                        .then(result => {
                            oController.sincronizarReceber()
                            .then(result => {
                                var loginInProgress = false;
                                try {
                                    loginInProgress = oController.getOwnerComponent().getModel("busyDialogModel").getProperty("/loginInProgress");
                                } catch (e) {
                                    loginInProgress = false;
                                }

                                if (!loginInProgress) {
                                    oController.closeBusyDialog();
                                }
                                resolve(result)
                            }).catch( result => reject(result) )
                        }).catch( result => reject(result) )
                    }).catch( result => reject(result) )
                } else {
                    reject()
                }
            })
        },

        openBusyDialog: function () {
            oController = this;
            oController.getOwnerComponent().getModel("busyDialogModel").setProperty("/mensagem", "Iniciando sincronismo")
            oController.getOwnerComponent().getModel("busyDialogModel").refresh()

            var oComponent = this.getOwnerComponent();
            if (!oComponent._busyDialog && !this._pBusyDialog) {
                this._pBusyDialog = Fragment.load({
                    name: "com.pontual.sgmr.fragment.BusyDialog",
                    controller: this
                }).then(function (oBusyDialog) {
                    this.getView().addDependent(oBusyDialog);
                    syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
                    return oBusyDialog;
                }.bind(this));

                oComponent._busyDialog = this._pBusyDialog;
            } else if (oComponent._busyDialog) {
                this._pBusyDialog = oComponent._busyDialog;
            }

            this._pBusyDialog.then(function (oBusyDialog) {
                oBusyDialog.open();
            }.bind(this));
        },

        forceCloseBusyDialog: function () {
            if (this._pBusyDialog) {
                this._pBusyDialog.then(function (oBusyDialog) {
                    oBusyDialog.close();
                });
            }

            try {
                var oComponent = this.getOwnerComponent();
                if (oComponent && oComponent._busyDialog) {
                    oComponent._busyDialog.then(function (oBusyDialog) {
                        oBusyDialog.close();
                    });
                }
            } catch (e) {
                // Silently handle error
            }

            try {
                var aBusyDialogs = document.querySelectorAll('.sapMBusyDialog');
                if (aBusyDialogs.length > 0) {
                    for (var i = 0; i < aBusyDialogs.length; i++) {
                        var oBusyElement = aBusyDialogs[i];
                        var oBusyControl = sap.ui.getCore().byId(oBusyElement.id);
                        if (oBusyControl && oBusyControl.close) {
                            oBusyControl.close();
                        }
                    }
                }
            } catch (e) {
                // Silently handle error
            }
        },

        getConnectionModel: function (pModel) {
            oController = this;

            var oController = this;
            if (typeof cordova != "undefined") {

                var oDataModel = oController.getOwnerComponent().getModel(pModel)
                var oConexao = oController.lerLocalStorage("SGMR_DadosConexao")

                var vUrl = oConexao.urlsemclient + oDataModel.sServiceUrl + "?sap-client=" + oConexao.cliente;

                var model = new sap.ui.model.odata.v2.ODataModel(vUrl, {
                    json: true
                });

                model.setHeaders(this.getModelHeader());
                model.setUseBatch(false);
                return model;

            } else {
                return oController.getOwnerComponent().getModel(pModel);
            }
        },

        getModelHeader: function () {
            var oHeader = {
                "X-Requested-With": "X",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "MaxDataServiceVersion": "3.0"
            };

            return oHeader;
        },

        prepararPerfil: function () {
            return new Promise((resolve, reject) => {
                oController = this;
                oController.atualizarBusyDialog(oController.i18n("atualizandoperfis"));
                var aPerfis = oController.getOwnerComponent().getModel("listaPerfilModel").getData() || [];
                var aPerfilSetPromises = [];

                aPerfis.forEach(oPerfil => {
                    if (!oPerfil || !oPerfil.Sincronizado) {
                        return;
                    }

                    // normaliza possíveis formas de AutorizacaoSet / PerfilCentroSet
                    var aAutorizacoes = Array.isArray(oPerfil.AutorizacaoSet) ? oPerfil.AutorizacaoSet :
                        (oPerfil.AutorizacaoSet && Array.isArray(oPerfil.AutorizacaoSet.results) ? oPerfil.AutorizacaoSet.results : []);
                    var aCentros = Array.isArray(oPerfil.PerfilCentroSet) ? oPerfil.PerfilCentroSet :
                        (oPerfil.PerfilCentroSet && Array.isArray(oPerfil.PerfilCentroSet.results) ? oPerfil.PerfilCentroSet.results : []);

                    switch (oPerfil.Sincronizado) {
                        case "N":
                            // monta o perfil para criação
                            var oPerfilSetN = {
                                "Chave": "1",
                                "CodigoPerfil": "0",
                                "DescrPerfil": oPerfil.DescrPerfil || "",
                                "Sincronizado": "N",
                                "AutorizacaoSet": { "results": [] },
                                "PerfilCentroSet": { "results": [] }
                            };

                            aAutorizacoes.forEach(oAutorizacao => {
                                if (!oAutorizacao) return;
                                if (oAutorizacao.Selecionado === true) {
                                    oPerfilSetN.AutorizacaoSet.results.push({
                                        "Chave": "1",
                                        "CodigoPerfil": oPerfilSetN.CodigoPerfil,
                                        "CodigoAutorizacao": oAutorizacao.CodigoAutorizacao || oAutorizacao.Codigo,
                                        "DescrAutorizacao": oAutorizacao.DescrAutorizacao || oAutorizacao.Descricao || ""
                                    });
                                }
                            });

                            aCentros.forEach(oCentro => {
                                if (!oCentro) return;
                                oPerfilSetN.PerfilCentroSet.results.push({
                                    "Chave": "1",
                                    "CodigoPerfil": oCentro.CodigoPerfil ? oCentro.CodigoPerfil.toString() : (oPerfil.CodigoPerfil ? oPerfil.CodigoPerfil.toString() : ""),
                                    "DescPerfil": oCentro.DescrPerfil || oCentro.DescPerfil || oPerfil.DescrPerfil || "",
                                    "Centro": oCentro.CodigoCentro || oCentro.Centro || "",
                                    "DescCentro": oCentro.DescrCentro || oCentro.DescCentro || ""
                                });
                            });

                            var oPayloadN = {
                                Chave: "1",
                                PerfilSet: [oPerfilSetN]
                            };

                            aPerfilSetPromises.push(oController.enviarDados("ListaPerfilSet", oPayloadN));
                            break;

                        case "E":
                            // monta o perfil para exclusão/edição conforme o que existe
                            var oPerfilSetE = {
                                "Chave": "1",
                                "CodigoPerfil": oPerfil.CodigoPerfil ? oPerfil.CodigoPerfil.toString() : "",
                                "DescrPerfil": oPerfil.DescrPerfil || "",
                                "Sincronizado": "E",
                                "AutorizacaoSet": { "results": [] },
                                "PerfilCentroSet": { "results": [] }
                            };

                            var oPayloadE = {
                                Chave: "1",
                                PerfilSet: [oPerfilSetE]
                            };

                            aPerfilSetPromises.push(oController.enviarDados("ListaPerfilSet", oPayloadE));
                            break;

                        default:
                            break;
                    }
                });

                if (aPerfilSetPromises.length > 0) {
                    Promise.all(aPerfilSetPromises).then(function (results) {
                        results.forEach(function (oResp, idx) {
                            try {
                                // Normaliza várias formas de resposta possíveis
                                var oFirst = null;

                                if (oResp && oResp.PerfilSet && Array.isArray(oResp.PerfilSet.results) && oResp.PerfilSet.results.length > 0) {
                                    oFirst = oResp.PerfilSet.results[0];
                                } else if (oResp && Array.isArray(oResp.results) && oResp.results.length > 0) {
                                    oFirst = oResp.results[0];
                                } else if (oResp && (oResp.Tipomensagem || oResp.Mensagem)) {
                                    oFirst = oResp;
                                } else {
                                    //console.warn("prepararPerfil -> resposta em formato inesperado (índice " + idx + "):", oResp);
                                    oFirst = { Tipomensagem: "", Mensagem: "" };
                                }

                                var vTipo;
                                switch ((oFirst && oFirst.Tipomensagem) || "") {
                                    case "S": vTipo = "Success"; break;
                                    case "E": vTipo = "Error"; break;
                                    default: vTipo = "Information"; break;
                                }

                                var sMsg = (oFirst && oFirst.Mensagem) || (oResp && oResp.Mensagem) || "";
                                oController.adicionarMensagem(vTipo, "Gestão de perfil", sMsg);
                            } catch (e) {
                                console.error("prepararPerfil -> erro ao processar resultado no índice " + idx + ":", e, oResp);
                            }
                        });

                        resolve();
                    }).catch(function (err) {
                        console.error("prepararPerfil -> Promise.all rejeitado:", err);
                        reject(err);
                    });
                } else {
                    resolve();
                }
            });
        },

        onSincronizarGeral: function (pController) {
            var aMockMessages = []
            if (oController.checkConnection() == true) {
                oController = pController
                oController.openBusyDialog();
                oController.sincronizar().then(function (result) {
                    oController.closeBusyDialog();
                }).catch(
                    function (result) {
                        oController.closeBusyDialog();
                    });
            } else {
                oController.adicionarMensagemErro("Sem conexão", "Problemas de conexão", "Sem conexão com internet no momento. Tente mais tarde novamente");
            }
        },

        sincronizarEnviar: function () {
            oController = this;
            return new Promise((resolve, reject) => {
                if (oController.checkConnection() == true) {
                    Promise.all([
                        oController.atualizarPerfil(),
                        oController.atualizarUsuario(),
                        oController.atualizarMaterialRodante()
                    ]).then(
                        function (result) {
                            resolve()
                        }).catch(
                            function (result) {
                                reject()
                            });
                } else {
                    reject()
                }
            })
        },

        atualizarUsuario: function () {
            return new Promise((resolve, reject) => {
                oController.lerTabelaIndexDB("tb_usuario").then(
                    function (result) {
                        if (result.tb_usuario) {
                            oController.getOwnerComponent().getModel("listaUsuariosModel").setData(result.tb_usuario);
                            oController.prepararUsuario().then(
                                function (result) {
                                    resolve()
                                }).catch(
                                    function (result) {
                                        reject()
                                    })
                        } else {
                            resolve()
                        }
                    }).catch(
                        function (result) {
                            reject(result)
                        })
            })
        },

        // ...existing code...
        prepararUsuario: function () {
            return new Promise((resolve, reject) => {
                oController = this;
                oController.atualizarBusyDialog(oController.i18n("atualizandousuarios"));

                var aUsuarios = oController.getOwnerComponent().getModel("listaUsuariosModel").getData() || [];
                var aUsuarioPromises = [];

                if (aUsuarios && aUsuarios.length) {
                    aUsuarios.forEach(oUsuario => {
                        // normaliza Bloqueado para o payload
                        var sBloqueado = (oUsuario.Bloqueado === true || oUsuario.Bloqueado === "X") ? "X" : "";

                        if (oUsuario.Sincronizado === "") {
                            return;
                        }

                        // monta objeto que será enviado
                        var oUsuarioSet = {
                            "Chave": "1",
                            "CodUsuario": oUsuario.CodUsuario,
                            "Nome": oUsuario.Nome,
                            "Senha": oUsuario.Senha,
                            "Deposito": oUsuario.Deposito,
                            "Bloqueado": sBloqueado,
                            "Perfil": oUsuario.CodigoPerfil ? oUsuario.CodigoPerfil.toString() : '',
                            "Sincronizado": oUsuario.Sincronizado
                        };

                        // payload isolado por usuário (evita reuso de referência)
                        var oPayload = {
                            Chave: "1",
                            UsuarioSet: [oUsuarioSet]
                        };

                        // empurra a promise para o array correto (mantém mesma interface do enviarDados)
                        aUsuarioPromises.push(oController.enviarDados("ListaUsuarioSet", oPayload));
                    });
                }

                if (aUsuarioPromises.length > 0) {
                    Promise.all(aUsuarioPromises).then(function (results) {
                        //console.log("prepararUsuario -> resultados recebidos:", results);

                        results.forEach(function (oResp, idx) {
                            try {
                                // normaliza várias formas de resposta possíveis
                                var oFirst = null;
                                if (oResp && oResp.UsuarioSet && Array.isArray(oResp.UsuarioSet.results) && oResp.UsuarioSet.results.length > 0) {
                                    oFirst = oResp.UsuarioSet.results[0];
                                } else if (oResp && Array.isArray(oResp.results) && oResp.results.length > 0) {
                                    oFirst = oResp.results[0];
                                } else if (oResp && (oResp.Tipomensagem || oResp.Mensagem)) {
                                    oFirst = oResp;
                                } else {
                                    console.warn("prepararUsuario -> resposta em formato inesperado (índice " + idx + "):", oResp);
                                    oFirst = { Tipomensagem: "", Mensagem: "" };
                                }

                                var vTipo;
                                switch ((oFirst && oFirst.Tipomensagem) || "") {
                                    case "S": vTipo = "Success"; break;
                                    case "E": vTipo = "Error"; break;
                                    default: vTipo = "Information"; break;
                                }

                                var sMsg = (oFirst && oFirst.Mensagem) || (oResp && oResp.Mensagem) || "";

                                oController.adicionarMensagem(vTipo, "Gestão de usuário", sMsg);
                            } catch (e) {
                                console.error("prepararUsuario -> erro ao processar resultado no índice " + idx + ":", e, oResp);
                            }
                        });

                        resolve();
                    }).catch(function (err) {
                        console.error("prepararUsuario -> Promise.all rejeitado:", err);
                        reject(err);
                    });
                } else {
                    resolve();
                }
            });
        },


        atualizarMaterialRodante: function () {
            return new Promise((resolve, reject) => {
                // Material Rodante pode não existir em todas as implementações
                // Por isso, sempre resolve com sucesso
                resolve()
            })
        },

        atualizarPerfil: function () {
            return new Promise((resolve, reject) => {
                oController.lerTabelaIndexDB("tb_perfil")
                .then(result => {
                    if (result.tb_perfil) {
                        oController.getOwnerComponent().getModel("listaPerfilModel").setData(result.tb_perfil);
                        oController.prepararPerfil()
                        .then( result => resolve())
                        .catch( result => reject())
                    }
                })
                .catch( result => reject(result))
            })
        },

        limpaElemento: function(elemento) {
            delete elemento.__metadata;
            delete elemento.ListaCondicoes;
            delete elemento.Medicao;
            delete elemento.ListaComponentes;
            delete elemento.ListaInspecoes;
            delete elemento.ListaTemperaturas;
        },

        carregarOffline: function () {
            oController = this;
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("carregaroffline"));
                var aLeituras = [
                    oController.carregarDadosIndexDB("tb_autorizacao", "autorizacoesModel"),
                    oController.carregarDadosIndexDB("tb_perfil", "listaPerfilModel"),
                    oController.carregarDadosIndexDB("tb_centros", "listaCentrosModel"),
                    oController.carregarDadosIndexDB("tb_usuario", "listaUsuariosModel")
                ]
                Promise.all(aLeituras)
                .then( result => resolve())
                .catch( result =>  {
                    oController.closeBusyDialog();
                    reject(result);
                })
            })
        },

        carregarOrdens: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandoordens"));
                var oUsuario = oController.getOwnerComponent().getModel("usuarioModel").getData()

                var aFiltros = [
                    { key: "Centro",   value: oUsuario.Centro },
                    { key: "Deposito", value: oUsuario.Deposito }
                ]
                oUsuario.Autorizacoes.forEach(element => {
                    if (element.CodigoAutorizacao != "000") {
                        aFiltros.push({
                            key: "Tipoatividade",
                            value: element.CodigoAutorizacao

                        })
                    }
                });
                oController.carregarDados("ListaOrdensSet", aFiltros).then(function (result) {
                    var aOrdens = []
                    var aOperacoes = []
                    for (let x = 0; x < result.results.length; x++) {
                        const oOrdem = result.results[x];
                        for (let y = 0; y < oOrdem.ListaOperacoesSet.results.length; y++) {
                            const oOperacao = oOrdem.ListaOperacoesSet.results[y];
                            delete oOperacao.ListaComponentesOperacaoSet
                            delete oOperacao.ListaOrdens
                            delete oOperacao.__metadata
                            aOperacoes.push(oOperacao)
                        }
                        delete oOrdem.ListaOperacoesSet
                        delete oOrdem.__metadata
                        aOrdens.push(oOrdem)
                    }
                    oController.getOwnerComponent().getModel("ordensModel").setData(aOrdens)
                    oController.getOwnerComponent().getModel("operacoesModel").setData(aOperacoes)

                    oController.adicionarMensagemSucesso("Ordens recebidas " + aOrdens.length, "Download de ordens", "Ordens encaminhadas para o dispositivo");
                    oController.adicionarMensagemSucesso("Operações recebidas " + aOperacoes.length, "Download de operações", "Operações encaminhadas para o dispositivo");

                    resolve();
                }).catch( result => reject(result));
            })
        },

        carregarFormulario: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandoformularios"));
                oController.carregarDados("ListaFormularioSet").then(function (result) {
                    var aFormularios = []
                    for (let x = 0; x < result.results.length; x++) {
                        const oFormulario = result.results[x];
                        delete oFormulario.__metadata
                        aFormularios.push(oFormulario);
                    }
                    oController.getOwnerComponent().getModel("listaFormularioModel").setData(aFormularios)
                    oController.adicionarMensagemSucesso("Formulários sincronizados " + aFormularios.length, "Download de formulários", "Formulários encaminhados para o dispositivo");

                    resolve();
                }).catch( result => reject(result));
            })
        },


        carregarEquipamento: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandoequipamentos"));
                var oUsuario = oController.getOwnerComponent().getModel("usuarioModel").getData()
                var aFiltros = [
                    {
                        key: "Usuario",
                        value: oUsuario.CodUsuario
                    }]
                oController.carregarDados("ListaEquipamentoSet", aFiltros).then(function (result) {
                    var aEquipamentos = []
                    for (let x = 0; x < result.results.length; x++) {
                        const oEquipamento = result.results[x];
                        delete oEquipamento.__metadata
                        aEquipamentos.push(oEquipamento);
                    }
                    oController.getOwnerComponent().getModel("listaEquipamentoModel").setData(aEquipamentos)
                    oController.adicionarMensagemSucesso("Material Rodante sincronizado " + aEquipamentos.length, "Download de meteriais rodantes", "Material Rodante encaminhado para o dispositivo");

                    resolve();
                }).catch( result => reject(result));
            })
        },


        carregarMateriais: function () {

            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandomateriais"));
                var oUsuario = oController.getOwnerComponent().getModel("usuarioModel").getData()
                var aFiltros = [
                    { key: "Centro",   value: oUsuario.Centro },
                    { key: "Deposito", value: oUsuario.Deposito }
                ]

                oController.carregarDados("ListaMateriaisSet", aFiltros).then(function (result) {
                    var aMateriais = []
                    var aTipos = []
                    for (let x = 0; x < result.results.length; x++) {
                        const oMaterial = result.results[x];
                        if (oMaterial.ListaTiposAvaliacaoSet.results.length > 0) {
                            for (let y = 0; y < oMaterial.ListaTiposAvaliacaoSet.results.length; y++) {
                                const oTipo = oMaterial.ListaTiposAvaliacaoSet.results[y];
                                delete oTipo.__metadata
                                aTipos.push(oTipo)
                            }
                        } else {
                            oMaterial.ListaTiposAvaliacaoSet.results.push( { Material: "", TipoAvaliacao: "NOVO" } )
                        }
                        delete oMaterial.__metadata
                        aMateriais.push(oMaterial);
                    }
                    oController.getOwnerComponent().getModel("materiaisModel").setData(aMateriais)
                    oController.getOwnerComponent().getModel("tiposAvaliacaoModel").setData(aTipos)
                    oController.adicionarMensagemSucesso("Materiais sincronizados " + aMateriais.length, "Download de materiais", "Materiais encaminhados para o dispositivo");
                    oController.adicionarMensagemSucesso("Tipos de avaliação sincronizados " + aTipos.length, "Download de Tipos de avaliação", "Tipos de avaliação encaminhados para o dispositivo");
                    resolve();
                }).catch( result => reject(result));
            })

        },

        carregarCatalogos: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandocatalogos"));
                var aListaCatalogos = [];
                qtdeCatalogo = 0;
                var aEquipamentos = oController.getOwnerComponent().getModel("equipamentosModel").getData()

                for (let index = 0; index < aEquipamentos.length; index++) {
                    const element = aEquipamentos[index];
                    var aFiltros = [{ key: "Equipamento", value: element.Equipamento }]
                    aListaCatalogos.push(oController.carregarDados("ListaCatalogosSet", aFiltros))
                }
                Promise.all(aListaCatalogos).then(
                    function (result) {
                        var aCatalogos = []

                        for (let x = 0; x < result.length; x++) {
                            const element = result[x];
                            var array3 = aCatalogos.concat(result[x].results)
                            aCatalogos = array3;
                        }

                        oController.getOwnerComponent().getModel("catalogosModel").setData(aCatalogos)
                        oController.adicionarMensagemSucesso("Catálogos sincronizados " + aCatalogos.length, "Download de catálogos", "Catálogos encaminhados para o dispositivo");
                        resolve();
                    }).catch( result => reject(result));
            })
        },

        carregarComponentes: function (aFormularios) {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandocomponentes"));
                var aComponentes = {
                    Chave: 'X',
                    ComponentesSet: []
                }
                aFormularios.forEach(oFormulario => {
                    if (oFormulario.key != "") {
                        var oComponente = {
                            Chave: 'X',
                            IdForm: oFormulario.key,
                        }
                        aComponentes.ComponentesSet.push(oComponente);
                    }
                })

                oController.enviarDados("ListaComponentesSet", aComponentes).then(function (result) {
                    var aListaComponentes = []
                    result.ComponentesSet.results.forEach(element => {
                        oController.limpaElemento(element);
                        aListaComponentes.push(element);
                    });

                    oController.getOwnerComponent().getModel("listaComponentesModel").setData(aListaComponentes)
                    oController.adicionarMensagemSucesso("Componentes sincronizados " + aListaComponentes.length, "Download de componentes", "Componentes encaminhados para o dispositivo");
                    resolve();
                }).catch( result => reject(result));
            })

        },

        carregarCondicoes: function (aFormularios) {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandocondicoes"));
                var aCondicoes = {
                    Chave: 'X',
                    CondicoesSet: []
                }
                aFormularios.forEach(oFormulario => {
                    if (oFormulario.key != "") {
                        var oComponente = {
                            Chave: 'X',
                            IdForm: oFormulario.key,
                        }
                        aCondicoes.CondicoesSet.push(oComponente);
                    }
                })

                oController.enviarDados("ListaCondicoesSet", aCondicoes).then(function (result) {
                    var aListaCondicoes = []
                    result.CondicoesSet.results.forEach(element => {
                        oController.limpaElemento(element)
                        aListaCondicoes.push(element);
                    });

                    oController.getOwnerComponent().getModel("listaCondicoesModel").setData(aListaCondicoes)
                    oController.adicionarMensagemSucesso("Condições sincronizadas " + aListaCondicoes.length, "Download de condições", "Condições encaminhadas para o dispositivo");
                    resolve();
                }).catch( result => reject(result));
            })
        },

        carregarTemperaturas: function (aFormularios) {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandotemperaturas"));
                // const aTemperaturas = { Chave: 'X', TemperaturasSet: [] }
                // aFormularios.forEach(oFormulario => {
                //     if (oFormulario.key != "") {
                //         aTemperaturas.TemperaturasSet.push({ Chave: 'X', IdForm: oFormulario.key });
                //     }
                // })

                // oController.enviarDados("ListaTemperaturasSet", aTemperaturas).then(function (result) {
                //     const aListaTemperaturas = [];
                //     result.TemperaturasSet.results.forEach(element => {
                //         oController.limpaElemento(element);
                //         aListaTemperaturas.push(element);
                //     });

                //     oController.getOwnerComponent().getModel("listaTemperaturasModel").setData(aListaTemperaturas)
                //     oController.adicionarMensagemSucesso(oController.i18n("temperatura.mensagem.sucesso.sync", [aListaTemperaturas.length]), "temperatura.download", "temperatura.mensagem.sucesso");
                //     resolve();
                // }).catch( result => reject(result));

                const aListaTemperaturas = [];
                //TOOD: Descomentar para testar preenchimento
                // aListaTemperaturas.push({ IdLado : "LD", Cor : "None", Secao : "Seção 1" });
                // aListaTemperaturas.push({ IdLado : "LD", Cor : "None", Secao : "Seção 2" });
                // aListaTemperaturas.push({ IdLado : "LD", Cor : "None", Secao : "Seção 3" });
                // aListaTemperaturas.push({ IdLado : "LE", Cor : "None", Secao : "Seção 1" });
                // aListaTemperaturas.push({ IdLado : "LE", Cor : "None", Secao : "Seção 2" });
                // aListaTemperaturas.push({ IdLado : "LE", Cor : "None", Secao : "Seção 3" });
                oController.getOwnerComponent().getModel("listaTemperaturasModel").setData(aListaTemperaturas);
                resolve();
            })
        },

        carregarInspecoes: function (aFormularios) {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandoinspecoes"));
                var aInspecoes = {
                    Chave: 'X',
                    InspecoesSet: []
                }
                aFormularios.forEach(oFormulario => {
                    if (oFormulario.key != "") {
                        var oComponente = {
                            Chave: 'X',
                            IdForm: oFormulario.key,
                        }
                        aInspecoes.InspecoesSet.push(oComponente);
                    }
                })

                oController.enviarDados("ListaInspecoesSet", aInspecoes).then(function (result) {
                    var aListaInspecoes = []
                    result.InspecoesSet.results.forEach(element => {
                        oController.limpaElemento(element);
                        aListaInspecoes.push(element);
                    });

                    oController.getOwnerComponent().getModel("listaInspecoesModel").setData(aListaInspecoes)
                    oController.adicionarMensagemSucesso("Inspeções sincronizadas " + aListaInspecoes.length, "Download de inspeções", "Inspeções encaminhadas para o dispositivo");
                    resolve();
                }).catch( result => reject(result));
            })
        },

        carregarListaDesgaste: function (aModelos) {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandoinspecoes"));
                var aDesgastes = {
                    Chave: 'X',
                    DesgastesSet: []
                }
                aModelos.forEach(oModelo => {
                    if (oModelo.key != "") {
                        var oDesgaste = {
                            Chave: 'X',
                            TipoEquipamento: oModelo.key
                        }
                        aDesgastes.DesgastesSet.push(oDesgaste);
                    }
                })

                oController.enviarDados("ListaDesgastesSet", aDesgastes).then(function (result) {
                    var aLista = []
                    result.DesgastesSet.results.forEach(element => {
                        delete element.__metadata
                        delete element.ListaDesgastes
                        aLista.push(element);
                    });

                    oController.getOwnerComponent().getModel("listaDesgastesModel").setData(aLista)
                    oController.adicionarMensagemSucesso("Desgastes sincronizados " + aLista.length, "Download de desgastes", "Desgastes encaminhados para o dispositivo");
                    resolve();
                }).catch( result => reject(result));
            })
        },

        carregarDadosIndexDB: function (pTabela, pModel) {
            oController = this;
            return new Promise((resolve, reject) => {
                oController.lerTabelaIndexDB(pTabela).then(
                    function (result) {
                        var data = result[pTabela];

                        // Converter campo Bloqueado para boolean se for dados de usuário
                        if (pTabela === "tb_usuario" && data && Array.isArray(data)) {
                            data.forEach(function (oUsuario) {
                                if (oUsuario.Bloqueado === "X" || oUsuario.Bloqueado === true) {
                                    oUsuario.Bloqueado = true;
                                } else {
                                    oUsuario.Bloqueado = false;
                                }
                            });
                        }

                        oController.getOwnerComponent().getModel(pModel).setData(data)
                        resolve();
                    }).catch( result => reject(result));

            })
        },

        lerTabelaIndexDB: function (pTabela) {

            oController = this;

            return new Promise((resolve, reject) => {

                var oDBData;
                var db;
                var databaseName = oController.getDatabaseName();
                var databaseVersion = oController.getDatabaseVersion();
                var openRequest = window.indexedDB.open(databaseName, databaseVersion);

                openRequest.onerror = function (event) {
                    console.error(openRequest.errorCode);
                    reject('Erro durante a leitura do banco de dados!')
                };

                openRequest.onsuccess = function (event) {
                    db = event.target.result;
                    db.onerror = function () {
                        console.error(db.errorCode);
                        reject('Erro durante a leitura do banco de dados!')
                    };

                    const transaction = db.transaction([pTabela], "readwrite")
                    transaction.oncomplete = event => {
                        db.close();
                        var data = {};
                        data[pTabela] = oDBData;
                        resolve(data)
                    };

                    const objectStore = transaction.objectStore(pTabela);

                    if ('getAll' in objectStore) {
                        var values = objectStore.getAll().onsuccess = function (event) {
                            oDBData = {};
                            oDBData = event.target.result;

                        };
                    } else {
                        objectStore.openCursor().onsuccess = function (event) {
                            var cursor = event.target.result;
                            if (cursor) {
                                var value = cursor.value;
                                values.push(value);
                                cursor.continue();
                            } else {
                                oDBData = {};
                                oDBData = values;
                            }
                        };
                    }
                };
            })
        },

        checkConnection: function () {
            if (window.hasOwnProperty("cordova")) {
                if (navigator.onLine) {
                    this.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://connected");
                    this.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Success");
                    this.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "online");
                    this.getOwnerComponent().getModel("conexaoModel").refresh(true);
                    return true;
                }
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://disconnected");
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Error");
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "offline");
                this.getOwnerComponent().getModel("conexaoModel").refresh(true);
                return false;
            } else {
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://connected");
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Success");
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "online");
                this.getOwnerComponent().getModel("conexaoModel").refresh(true);
                return navigator.onLine
            }
        },

        verificarDisponibilidadeServidor: function () {
            oController = this;
            var oConexao = oController.lerLocalStorage("SGMR_DadosConexao")
            oController.getOwnerComponent().getModel("configurarModel").setData(oConexao)

            return new Promise((resolve, reject) => {

                if (oConexao.verificarDisponibilidade) {
                    if (oController.checkConnection() == true) {
                        if (oConexao.url && oConexao.urlsemclient) {
                            try {
                                new URL(oConexao.urlsemclient);
                            } catch (urlError) {
                                console.error("URL inválida:", oConexao.urlsemclient, urlError);
                                oController.adicionarMensagemErro("URL inválida", oController.i18n("conexaoerro"), "O endereço configurado não é válido: " + oConexao.urlsemclient);
                                reject();
                                return;
                            }

                            oController.openBusyDialog();
                            oController.atualizarBusyDialog("Tentando conexão com o endereço " + oConexao.urlsemclient);

                            try {
                                fetch(oConexao.urlsemclient, {
                                    mode: 'no-cors',
                                    method: 'GET',
                                    cache: 'no-cache'
                                }).then(r => {
                                    oController.atualizarBusyDialog("Conexão com o endereço " + oConexao.urlsemclient + " estabelecida com sucesso");
                                    oController.adicionarMensagemSucesso(oController.i18n("sucessoservidor"), oController.i18n("conexaosucesso"), "Conexão com o endereço " + oConexao.urlsemclient + " estabelecida com sucesso");
                                    resolve()
                                })
                                    .catch(e => {
                                        console.error("Fetch error:", e);
                                        oController.adicionarMensagemErro(oController.i18n("erroservidor"), oController.i18n("conexaoerro"), "Erro de conexão: " + e.message + " - Endereço: " + oConexao.urlsemclient);
                                        resolve();
                                    });
                            } catch (error) {
                                resolve();
                            }
                        } else {
                            oController.adicionarMensagemErro(oController.i18n("configurarconexao"), oController.i18n("conexaosem"), "Configure os dados de conexão antes de continuar");
                            reject();
                        }

                    } else {
                        oController.adicionarMensagemErro(oController.i18n("testeerro"), oController.i18n("conexaosem"), "Por favor verifque a disponibilidade de rede ou wi-fi");
                        reject()
                    }
                } else {
                    resolve()
                }
            })
        },

        carregarUsuario: function () {
            oController = this
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("sincronizandousuarios"));
                oController.carregarDados("UsuarioSet", []).then(function (result) {
                    var aUsuarios = []
                    // Obtém os perfis carregados (pode estar vazio se carregamento paralelo ainda não terminou)
                    var aPerfis = oController.getOwnerComponent().getModel("listaPerfilModel").getData() || []
                    for (let x = 0; x < result.results.length; x++) {
                        const oUsuario = result.results[x];
                        if (aPerfis.length != undefined && aPerfis.length > 0) {
                            var oPerfil = aPerfis.find((oElement) => oUsuario.Perfil == oElement.CodigoPerfil);
                            if (oPerfil != undefined) {
                                oUsuario.Perfil = oPerfil.DescrPerfil;
                                oUsuario.CodigoPerfil = oPerfil.CodigoPerfil
                                oUsuario.Autorizacoes = oPerfil.AutorizacaoSet
                            }
                        } else {
                            console.warn("Perfis ainda não disponíveis durante carregamento de usuários");
                        }

                        if (oUsuario.Bloqueado == 'X') {
                            oUsuario.Bloqueado = true
                        } else {
                            oUsuario.Bloqueado = false
                        }

                        delete oUsuario.__metadata
                        aUsuarios.push(oUsuario);
                    }
                    oController.getOwnerComponent().getModel("listaUsuariosModel").setData(aUsuarios)
                    oController.adicionarMensagemSucesso("Usuários sincronizados " + aUsuarios.length, "Download de usuários", "Usuários encaminhados para o dispositivo");
                    resolve();
                }).catch( result =>  {
                    oController.closeBusyDialog();
                    reject(result);
                })
            })
        },

        limparTabelaIndexDB: function (pTabela) {
            oController = this;
            return new Promise((resolve, reject) => {
                var db;
                var databaseName = oController.getDatabaseName();
                var databaseVersion = oController.getDatabaseVersion();
                var openRequest = window.indexedDB.open(databaseName, databaseVersion);

                openRequest.onerror = function (event) {
                    console.error(openRequest.errorCode);
                    reject();
                };

                openRequest.onsuccess = function (event) {
                    db = event.target.result;
                    db.onerror = function () {
                        console.error(db.errorCode);
                        reject();
                    };
                    var oTransaction = db.transaction([pTabela], "readwrite");
                    oTransaction.oncomplete = function (event) {
                        db.close();
                        resolve();
                    };

                    oTransaction.onerror = function (event) {
                        db.close();
                        reject();
                    };
                    var oObjectStore = oTransaction.objectStore(pTabela);
                    oObjectStore.clear();

                };
            })
        },

        gravarTabelaIndexDB: function (pTabela, pData) {
            var oController = this;
            return new Promise((resolve, reject) => {
                var vMsg = oController.i18n("gravandotabela") + " " + pTabela;
                oController.atualizarBusyDialog(vMsg);

                var db;
                var databaseName = oController.getDatabaseName();
                var databaseVersion = oController.getDatabaseVersion();
                var openRequest = window.indexedDB.open(databaseName, databaseVersion);

                openRequest.onerror = function (event) {
                    console.error(openRequest.errorCode);
                    reject()
                };

                openRequest.onsuccess = function (event) {
                    db = event.target.result;
                    db.onerror = function () {
                        console.error(db.errorCode);
                        reject()
                    };
                    var objectStore = db.transaction([pTabela], "readwrite").objectStore(pTabela);
                    objectStore.openCursor().onsuccess = function (event) {
                        var transaction = db.transaction([pTabela], "readwrite");
                        transaction.oncomplete = function (event) {
                            db.close();
                            resolve()
                        };

                        transaction.onerror = function (event) {
                            db.close();
                            reject();
                        };
                        var values = pData
                        var objectStore = transaction.objectStore(pTabela);
                        if (values.length == undefined) {
                            var objectStoreRequest = objectStore.add(values);
                            objectStoreRequest.onsuccess = function (event) {
                                //console.table(event);
                            }

                            objectStoreRequest.onerror = function (oError) {
                                console.table(oError);
                            }
                        } else {
                            for (var i = 0; i < values.length; i++) {
                                var objectStoreRequest = objectStore.add(values[i]);
                                objectStoreRequest.onsuccess = function (event) {
                                    //console.table(event);
                                }

                                objectStoreRequest.onerror = function (oError) {
                                    console.table(oError);
                                }
                            }
                        }
                    };
                };
            })
        },

        usuarioUpdate: function () {
            oController = this;
            return new Promise((resolve, reject) => {

                oController.atualizarUsuario().then(
                    function (result) {
                        var aLeituras = [oController.carregarUsuario()]
                        Promise.all(aLeituras).then(
                            function (result) {
                                //Preencher aqui as tabelas que precisam ser limpas antes da atualização
                                oController.atualizarBusyDialog(oController.i18n("atualizandousuarios"));
                                var aLimpezas = [oController.limparTabelaIndexDB("tb_usuario")]
                                Promise.all(aLimpezas).then(
                                    function (result) {
                                        var aPerfis = oController.getOwnerComponent().getModel("listaUsuariosModel").getData();
                                        var aGravacoes = [oController.gravarTabelaIndexDB("tb_usuario", aPerfis)]
                                        Promise.all(aGravacoes).then(
                                            function (result) {
                                                oController.closeBusyDialog();
                                                resolve()
                                            })
                                    }).catch(
                                        function (result) {
                                            oController.closeBusyDialog();
                                            reject()
                                        })

                            }).catch(
                                function (result) {
                                    oController.closeBusyDialog();
                                    reject()
                                })

                    }).catch(
                        function (result) {
                            oController.closeBusyDialog();
                            reject()
                        })

            })
        },

        perfilUpdate: function () {
            oController = this;
            return new Promise((resolve, reject) => {

                oController.atualizarPerfil().then(
                    function (result) {
                        var aLeituras = [oController.carregarPerfil()]
                        Promise.all(aLeituras).then(
                            function (result) {
                                //Preencher aqui as tabelas que precisam ser limpas antes da atualização
                                oController.atualizarBusyDialog(oController.i18n("atualizandoperfis"));
                                var aLimpezas = [oController.limparTabelaIndexDB("tb_perfil")]
                                Promise.all(aLimpezas).then(
                                    function (result) {
                                        var aPerfis = oController.getOwnerComponent().getModel("listaPerfilModel").getData();
                                        var aGravacoes = [oController.gravarTabelaIndexDB("tb_perfil", aPerfis)]
                                        Promise.all(aGravacoes).then(
                                            function (result) {
                                                resolve()
                                            })
                                    }).catch(
                                        function (result) {
                                            // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                                            reject()
                                        })

                            }).catch(
                                function (result) {
                                    // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                                    reject()
                                })

                    }).catch(
                        function (result) {
                            // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                            reject()
                        })

            })
        },

        medicaoUpdate: function (oEvent) {
            oController = this;
            return new Promise((resolve, reject) => {
                oController.atualizarMedicao().then(
                    function () {
                        resolve()
                    }).catch(
                        function () {
                            reject()
                        })
            })
        },

        atualizarMedicao: function () {
            return new Promise((resolve, reject) => {
                oController.lerTabelaIndexDB("tb_medicao").then(
                    function (result) {
                        if (result.tb_medicao) {
                            oController.getOwnerComponent().getModel("listaMedicoesModel").setData(result.tb_medicao);
                            oController.prepararMedicao().then(
                                function () {
                                    //Preencher aqui as tabelas que precisam ser limpas antes da atualização
                                    oController.atualizarBusyDialog(oController.i18n("atualizandomedicoes"));
                                    var aLimpezas = [oController.limparTabelaIndexDB("tb_medicao")]
                                    Promise.all(aLimpezas).then(
                                        function () {
                                            var aMedicoesErro = oController.getOwnerComponent().getModel("listaMedicoesErroModel").getData();
                                            var aMedicoesAtuais = oController.getOwnerComponent().getModel("listaMedicoesModel").getData();
                                            var aMedicoesCorrigir = []
                                            oController.getOwnerComponent().getModel("listaMedicoesModel").setData([])
                                            if (aMedicoesErro.length > 0) {
                                                aMedicoesErro.forEach(element => {
                                                    var oMedicaoAtual = aMedicoesAtuais.find(oElement => oElement.Uuid === element.Uuid);
                                                    if (oMedicaoAtual) {
                                                        oMedicaoAtual.Status = "E"
                                                        oMedicaoAtual.Retorno = element.RetornoSet.results
                                                        aMedicoesCorrigir.push(oMedicaoAtual)
                                                    }
                                                });
                                                oController.getOwnerComponent().getModel("listaEquipamentoModel").getData().forEach(element => {
                                                    var vIdx = aMedicoesCorrigir.findIndex(e => e.Equnr == element.Equnr);
                                                    if (vIdx != -1) {
                                                        element.Status = 'P';
                                                    }
                                                });
                                                oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh();

                                                oController.gravarTabelaIndexDB("tb_medicao", aMedicoesCorrigir).then(
                                                    function (result) {
                                                        oController.getOwnerComponent().getModel("listaMedicoesModel").setData(aMedicoesCorrigir);
                                                        oController.getOwnerComponent().getModel("listaMedicoesModel").refresh(true);
                                                        oController.getOwnerComponent().getModel("listaEquipamentoModel").refresh(true);
                                                        resolve()
                                                    })

                                            } else {
                                                oController.getOwnerComponent().getModel("listaMedicoesModel").setData([])
                                                resolve()
                                            }

                                        }).catch(
                                            function () {
                                                // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                                                reject()
                                            })
                                }).catch(
                                    function () {
                                        // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                                        reject()
                                    })
                        }

                    }).catch(
                        function (result) {
                            // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                            reject(result)
                        })

            })
        },

        prepararMedicao: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.i18n("atualizandoordenscorretiva"));
                var aMedicoes = oController.getOwnerComponent().getModel("listaMedicoesModel").getData();
                var aListaMedicaoes = {
                    Chave: 'X',
                    MedicaoSet: []
                }
                var aMedicoesSet = []

                aMedicoes.forEach(oMedicao => {

                    var now = oMedicao.Data;
                    var hours = now.getHours().toString().padStart(2, '0');
                    var minutes = now.getMinutes().toString().padStart(2, '0');
                    var seconds = now.getSeconds().toString().padStart(2, '0');
                    var timeString = "PT" + hours + "H" + minutes + "M" + seconds + "S"; //"PT10H19M23S"

                    var oMedicaoSet = {
                        Chave: 'X',
                        Data: oMedicao.Data,
                        DataSt: oMedicao.Data.toLocaleString().replace(',', ""),
                        Eqktx: oMedicao.Eqktx,
                        Equnr: oMedicao.Equnr,
                        Formulario: oMedicao.IdForm,
                        MedEqpto: oMedicao.MedEquipamento,
                        Mensagem: "",
                        Modelo: oMedicao.Modelo,
                        Objnr: oMedicao.Objnr,
                        Observacoes: oMedicao.Observacoes,
                        Pltxt: oMedicao.Pltxt,
                        Roleteqtdeld: oMedicao.RoleteQtdeLD?.toString() || "0",
                        Roleteqtdele: oMedicao.RoleteQtdeLE?.toString() || "0",
                        Roletevazamento: oMedicao.RoleteVazamento,
                        Status: oMedicao.Status,
                        Tplnr: oMedicao.Tplnr,
                        Usuario: oMedicao.Usuario,
                        Uuid: oMedicao.Uuid,
                        TagDireita: oMedicao.TagDireita,
                        TagEsquerda: oMedicao.TagEsquerda,
                        TruckDireita: oMedicao.TruckDireita,
                        TruckEsquerda: oMedicao.TruckEsquerda,
                        ComponentesSet: [],
                        CondicoesSet: [],
                        InspecoesSet: [],
                        AnexosSet: [],
                        RetornoSet: []
                    };


                    oMedicao.Componentes.forEach(oComponente => {
                        delete oComponente.ListaComponentes
                        if (oComponente.Valormedido != "" && oComponente.Valormedido != null && oComponente.Valormedido != undefined && oComponente.Valormedido != 0) {
                            var oComp = {
                                Chave: 'X',
                                Valormedido: String(oComponente.Valormedido),
                                IdComponente: oComponente.IdComponente,
                                Posicao: oComponente.Posicao,
                                PosicaoTec: oComponente.PosicaoTec,
                                CodiFabr: oComponente.CodiFabr,
                                IdLado: oComponente.IdLado
                            }

                            oMedicaoSet.ComponentesSet.push(oComp)
                        }
                    });

                    oMedicao.Condicoes.forEach(oCondicoes => {
                        delete oCondicoes.ListaCondicoes
                        oMedicaoSet.CondicoesSet.push(oCondicoes)
                    });

                    oMedicao.Inspecoes.forEach(oInspecao => {
                        oMedicaoSet.InspecoesSet.push(oInspecao)
                    });

                    oMedicao.items.forEach(oAnexo => {
                        var oAnexoNovo = Object.assign({}, oAnexo); // Cria uma cópia do objeto para evitar mutações
                        oMedicaoSet.AnexosSet.push(oAnexoNovo)
                    });

                    aListaMedicaoes.MedicaoSet.push(oMedicaoSet)
                });
                var aAnexos = []
                aListaMedicaoes.MedicaoSet.forEach(oAnexo => {
                    oAnexo.AnexosSet.forEach(element => {
                        aAnexos.push(oController.prepararAnexo(element))
                    });

                })

                Promise.all(aAnexos)
                .then(result => {
                    aListaMedicaoes.MedicaoSet.forEach(oAnexo => {
                        oAnexo.AnexosSet.forEach(element => {
                            delete element.file
                            element.ImString = result.find(oElement => oElement.id === element.id).ImString
                        });
                    })
                    aMedicoesSet.push(oController.enviarDados("ListaMedicaoSet", aListaMedicaoes))
                    if (aListaMedicaoes.MedicaoSet.length > 0) {
                        Promise.all(aMedicoesSet)
                        .then(result => {
                            const tipoStatus = {"S" : "Success", "E" : "Error"};
                            result[0].MedicaoSet.results.forEach(element => {
                                const aListaMedicoesRetorno = element.RetornoSet.results;
                                const vInspecao             = element;
                                const vStatus               = vInspecao.Status;
                                aListaMedicoesRetorno.forEach(oMedicaoRetorno => {
                                    const vTipo = tipoStatus[oMedicaoRetorno.Type] || "None";
                                    oController.adicionarMensagem(vTipo, "medicao", oMedicaoRetorno.MessageV1, oMedicaoRetorno.Message);
                                    oController.getOwnerComponent().getModel("listaMedicoesErroModel").setData([]);
                                    if (vStatus == 'E') {
                                        oController.getOwnerComponent().getModel("listaMedicoesErroModel").getData().push(vInspecao);
                                    }
                                });
                            });

                            oController.sincronizarReceber()
                            .then(result => {
                                resolve(result);
                            }).catch(result => {
                                console.error(result);
                                resolve(result);
                            })
                        }).catch(result => {
                            console.error(result);
                            reject(result);
                        });
                    } else {
                        console.log(aListaMedicaoes);
                        resolve();
                    }
                });
            })
        },

        prepararAnexo: function (pAnexo) {
            return new Promise((resolve, reject) => {
                if (pAnexo.file) {
                    if (pAnexo.documentType == 'Arquivo Câmera') {
                        pAnexo.ImString = pAnexo.file
                        resolve(pAnexo)
                    } else {
                        // Usa FileReader para criar a miniatura (Base64)
                        var oReader = new FileReader();
                        oReader.onload = function (e) {
                            var vContent = e.target.result.replace("data:" + pAnexo.mediaType + ";base64,", "")
                            pAnexo.ImString = vContent
                            resolve(pAnexo)
                        }.bind(this);
                        oReader.readAsDataURL(pAnexo.file);
                    }
                }
            })
        },

        agruparPorCampo: function (pData, campo) {
            const resultArr = [];

            const groupByField = pData.reduce((group, item) => {
                const key = item[campo];
                group[key] = (group[key] ?? 0) + 1; // contar quantas vezes aparece
                return group;
            }, {});

            Object.keys(groupByField).forEach((key) => {
                resultArr.push({
                    key: key,
                    Quantidade: groupByField[key]
                });
            });

            resultArr.sort((a, b) => {
                if (a.key < b.key) return -1;
                if (a.key > b.key) return 1;
                return 0;
            });

            return resultArr;
        },

        agruparFormularios: function (pData) {
            // Input array
            const data = pData;

            // result array
            const resultArr = [];

            // grouping by location and resulting with an object using Array.reduce() method
            const groupByLocation = data.reduce((group, item) => {
                const { IdForm } = item;
                group[IdForm] = group[IdForm] ?? [];
                group[IdForm].push(1);
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

        },

        verificarDiferencaHoras: function (pDiferenca, pDataInformada) {
            // 1. Criar objetos Date para a data atual e a data informada
            const dataAtual     = new Date();
            const dataInformada = pDataInformada;

            // 2. Calcular a diferença em milissegundos
            const diferencaEmMilissegundos = Math.abs(dataInformada.getTime() - dataAtual.getTime());

            // 3. Converter milissegundos para horas
            const milissegundosPorHora = 1000 * 60 * 60;
            const diferencaEmHoras     = Math.floor(diferencaEmMilissegundos / milissegundosPorHora);

            return diferencaEmHoras > pDiferenca;
        },

        limpaZerosNoFoco: function(input) {
            if (input.__zerosLimpos) {
                return;
            }
            input.__zerosLimpos = true;
            input.addEventDelegate({
                onfocusin: function(oEvent) {
                    const domInput = oEvent.target?.tagName === "INPUT" ? oEvent.target : input.getDomRef()?.querySelector("input");
                    if (!domInput) {
                        return;
                    }
                    setTimeout(() => domInput.select(), 10);
                }
            });
        },

        removeMensagemEstadoCampo: function(input) {
            if (input && input._oValueStateMessage && typeof input._oValueStateMessage.close === 'function') {
                input._oValueStateMessage.close();
            }
        },

        limpaEstadoCampoMedicao: function() {
            const input = sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto");
            input.setValueState("None");
            input.setValueStateText("");
            this.removeMensagemEstadoCampo(input);
        },

        limpaEstadoCampoDataMedicao: function() {
            const input = sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData");
            input.setValueState("None");
            input.setValueStateText("");
            this.removeMensagemEstadoCampo(input);
        },

        limpaEstadoCampoRoleteDireito: function() {
            const blocoRoletes = oController.byId("roletesBlock").getAggregation("_views");
            if (!blocoRoletes || blocoRoletes.length < 1) {
                return;
            }

            const viewRoletes = blocoRoletes[0];
            const input       = viewRoletes.byId("inputRoletesVazandoLD");
            input.setValueState("None");
            input.setValueStateText("");
            this.removeMensagemEstadoCampo(input);
        },

        limpaEstadoCampoRoleteEsquerdo: function() {
            const blocoRoletes = oController.byId("roletesBlock").getAggregation("_views");
            if (!blocoRoletes || blocoRoletes.length < 1) {
                return;
            }

            const viewRoletes = blocoRoletes[0];
            const input       = viewRoletes.byId("inputRoletesVazandoLE");
            input.setValueState("None");
            input.setValueStateText("");
            this.removeMensagemEstadoCampo(input);
        },

        limpaEstadoCampos: function() {
            this.limpaEstadoCampoMedicao();
            this.limpaEstadoCampoDataMedicao();
            this.limpaEstadoCampoRoleteDireito();
            this.limpaEstadoCampoRoleteEsquerdo();
        },

        validaMedicao: function(parametro) {
            var aMockMessages = parametro;
            if (!Array.isArray(parametro)) {
                aMockMessages = [];
            }
            this.limpaEstadoCampoMedicao();
            const input = sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputMedEqpto");
           
            const oMedicao = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getData();
            if (oMedicao.MedEquipamento == null || oMedicao.MedEquipamento == "") {
                input.setValueState("Error");
                input.setValueStateText(oController.i18n("campoobrigatorio"));
                input.focus();
                aMockMessages.push({
                    type: 'Error',
                    title: oController.i18n("campoobrigatorio"),
                    description: oController.i18n("preenchimentoobrigatorio", ["Horimero Equipamento"]),
                    subtitle: oController.i18n("horimetroatual"),
                    counter: 1
                });
            } else {
                oMedicao.MedEquipamento = parseInt(oMedicao.MedEquipamento).toFixed(0);
                var vMedEpto        = parseInt(oMedicao.MedEquipamento);
                var vUltMedEqpto    = parseInt(oMedicao.UltMedEqpto);
                var vDifMaxMedicoes = parseInt(oMedicao.DifMaxMedicoes);
                if (vMedEpto < vUltMedEqpto) {
                    input.setValueState("Error");
                    input.setValueStateText(oController.i18n("valormenor", [vMedEpto, vUltMedEqpto]));
                    input.focus();
                    aMockMessages.push({
                        type: 'Error',
                        title: oController.i18n("horimetroatual"),
                        description: oController.i18n("valormenor", [vMedEpto, vUltMedEqpto]),
                        subtitle: oController.i18n("valormenor", [vMedEpto, vUltMedEqpto]),
                        counter: 1
                    });
                }

                if (vMedEpto > (vUltMedEqpto + vDifMaxMedicoes)) {
                    input.setValueState("Error");
                    input.setValueStateText(oController.i18n("valormenor", [vMedEpto, vUltMedEqpto]));
                    input.focus();
                    aMockMessages.push({
                        type: 'Error',
                        title: oController.i18n("diferencaomedicao"),
                        description: oController.i18n("diferencaomedicaomsg", [vMedEpto, vDifMaxMedicoes]),
                        subtitle: oController.i18n("medicao"),
                        counter: 1
                    });
                }
            }
        },

        validaDataMedicao: function(parametro) {
            this.limpaEstadoCampoDataMedicao();
            const input = sap.ui.getCore().byId("container-com.pontual.sgmr---Formulario--cabecalhoBlock-Collapsed--idInputData")
            var aMockMessages = parametro;
            if (!Array.isArray(parametro)) {
                aMockMessages = [];
            }
            
            const oMedicao = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getData();
            if (oMedicao.Data == null || oMedicao.Data == "") {
                input.setValueState("Error");
                input.setValueStateText(oController.i18n("campoobrigatorio"));
                input.focus();
                aMockMessages.push({
                    type: 'Error',
                    title: oController.i18n("campoobrigatorio"),
                    description: oController.i18n("preenchimentoobrigatorio", ["Data"]),
                    subtitle: oController.i18n("data"),
                    counter: 1
                });
                return;
            }

            var dataAtual = input.getDateValue();
            if (dataAtual > new Date()) {
                input.setValueState("Error");
                input.setValueStateText(oController.i18n("datamaiorqueatual"));
                input.focus();
                aMockMessages.push({
                    type: 'Error',
                    title: oController.i18n("datainvalida"),
                    description: oController.i18n("datamaiorqueatual"),
                    subtitle: oController.i18n("data"),
                    counter: 1
                });
                return;
            }

            var vLimiteRetroativo = parseInt(oMedicao.LimiteRetroativo)
            if (oController.verificarDiferencaHoras(vLimiteRetroativo, oMedicao.Data)) {
                input.setValueState("Error");
                input.setValueStateText(oController.i18n("limiteretroativomsg", [vLimiteRetroativo]));
                input.focus();
                aMockMessages.push({
                    type: 'Error',
                    title: oController.i18n("limiteretroativo"),
                    description: oController.i18n("limiteretroativomsg", [vLimiteRetroativo]),
                    subtitle: oController.i18n("limiteretroativo"),
                    counter: 1
                });
            }
        },

        validaVazamentoRoleteDireito: function(mensagens) {
            this.limpaEstadoCampoRoleteDireito();
            const blocoRoletes = oController.byId("roletesBlock").getAggregation("_views");
            if (!blocoRoletes || blocoRoletes.length < 1) {
                return;
            }

            const viewRoletes = blocoRoletes[0];
            const input       = viewRoletes.byId("inputRoletesVazandoLD");
            const dados       = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getData();
            const valor       = Number(dados.RoleteQtdeLD);
            const maximo      = Number(dados.MaxRoleteQtdeLD);
            const minimo      = 0;

            const limite         = valor > maximo ? maximo : minimo;
            const mensagemLimite = valor > maximo ? "roletes.limite.maximo" : ( valor < minimo ? "roletes.limite.minimo" : "" );

            if (!mensagemLimite) {
                return
            }

            input.setValueState("Error");
            input.setValueStateText(oController.i18n(mensagemLimite, [limite]));
            input.focus();

            mensagens.push({
                type        : 'Error',
                title       : oController.i18n(mensagemLimite, [limite]),
                description : oController.i18n(mensagemLimite + ".detalhe", [limite]),
                subtitle    : oController.i18n("roletes.lado.direito"),
                counter     : 1
            });
        },

        validaVazamentoRoleteEsquerdo: function(mensagens) {
            this.limpaEstadoCampoRoleteEsquerdo();
            const blocoRoletes = oController.byId("roletesBlock").getAggregation("_views");
            if (!blocoRoletes || blocoRoletes.length < 1) {
                return;
            }

            const viewRoletes = blocoRoletes[0];
            const input       = viewRoletes.byId("inputRoletesVazandoLE");
            const dados       = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getData();
            const valor       = Number(dados.RoleteQtdeLE);
            const maximo      = Number(dados.MaxRoleteQtdeLE);
            const minimo      = 0;

            const limite         = valor > maximo ? maximo : minimo;
            const mensagemLimite = valor > maximo ? "roletes.limite.maximo" : ( valor < minimo ? "roletes.limite.minimo" : "" );

            if (!mensagemLimite) {
                return
            }

            input.setValueState("Error");
            input.setValueStateText(oController.i18n(mensagemLimite, [limite]));
            input.focus();

            mensagens.push({
                type        : 'Error',
                title       : oController.i18n(mensagemLimite, [limite]),
                description : oController.i18n(mensagemLimite + ".detalhe", [limite]),
                subtitle    : oController.i18n("roletes.lado.esquerdo"),
                counter     : 1
            });
        },

		formataTextoLado: function (value) {
			if (!value) {
				return "-";
			}
			return oController.i18n("texto.lado." + value) || "-";
		},

    });
});
