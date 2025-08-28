sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    'sap/m/MessageToast',
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    'sap/ui/model/json/JSONModel'
], function (Controller, UIComponent, History, MessageToast, Fragment, syncStyleClass, JSONModel) {
    "use strict";
    var oController
    var oView

    const BD_VERSION = 7;
    var aFilters = ""
    var oExpand = ""

    return Controller.extend("com.pontual.sgmr.controller.BaseController", {

        getRouter: function () {
            return UIComponent.getRouterFor(this);
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

        onSairApp: function () {
            this.getRouter().navTo("Login", {}, true /*no history*/);
        },

        carregarAcessos: function () {

            oController = this;

            var aAutorizacoes = oController.getOwnerComponent().getModel("usuarioModel").getProperty("/Autorizacoes")

            var oAcesso = {
                administrativo: false,
                materialrodante: false,
                perfil: false,
                usuario: false,
                associar: false,
                sincronizar: false
            }

            if (aAutorizacoes) {
                aAutorizacoes.forEach(oAutorizacao => {
                    if (oAutorizacao.CodigoAutorizacao == "001") {
                        oAcesso.materialrodante = true;
                    }
                    if (oAutorizacao.CodigoAutorizacao == "002" || oAutorizacao.CodigoAutorizacao == "003" || oAutorizacao.CodigoAutorizacao == "004" || oAutorizacao.CodigoAutorizacao == "005"){
                        oAcesso.administrativo = true;
                        if(oAutorizacao.CodigoAutorizacao == "002"){
                            oAcesso.perfil = true;
                        }
                        if(oAutorizacao.CodigoAutorizacao == "003"){
                            oAcesso.usuario = true;
                        }
                        if(oAutorizacao.CodigoAutorizacao == "004"){
                            oAcesso.associar = true;
                        }
/*                         if(oAutorizacao.CodigoAutorizacao == "005"){
                            oAcesso.sincronizar = true;
                        } */
                    }
                });
            

            oController.getOwnerComponent().getModel("acessosModel").setData(oAcesso)
            oController.getOwnerComponent().getModel("acessosModel").refresh();
            }
        },

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
                oController.getOwnerComponent().getModel("mensagensModel").setData([])
                oController.getOwnerComponent().getRouter().navTo("Login", null, true);
            }
        },

        onDeviceReady: function () {
            if (window.location.hash == "") {
                oController.getOwnerComponent().getModel("mensagensModel").setData([])

                var oConexao = oController.lerLocalStorage("SGMR_DadosConexao")
                if (oConexao != null && oConexao.urlsemclient != "") {
                    oController.getOwnerComponent().getRouter().navTo("Login", null, true);
                } else {
                    oController.getOwnerComponent().getRouter().navTo("Configurar", null, true);
                }
            }
        },

        onOnline: function (oEvent) {
            console.log("You are now connected to the network.");
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://connected")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Success")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "online")
            oController.getOwnerComponent().getModel("conexaoModel").refresh(true)

        },

        onOffline: function (oEvent) {
            console.log("You are not connected to the network.");
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://disconnected")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Error")
            oController.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "offline")
            oController.getOwnerComponent().getModel("conexaoModel").refresh(true)
        },

        onOrientationChange: function () {
            console.log(screen.orientation.type);
        },


        // Display the button type according to the message with the highest severity
        // The priority of the message types are as follows: Error > Warning > Success > Info
        buttonTypeFormatter: function () {
            var sHighestSeverityIcon;
            var aMessages = this.getView().getModel().oData;

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

        // Display the number of messages with the highest severity
        highestSeverityMessages: function () {
            var sHighestSeverityIconType = this.buttonTypeFormatter();
            var sHighestSeverityMessageType;

            switch (sHighestSeverityIconType) {
                case "Negative":
                    sHighestSeverityMessageType = "Error";
                    break;
                case "Critical":
                    sHighestSeverityMessageType = "Warning";
                    break;
                case "Success":
                    sHighestSeverityMessageType = "Success";
                    break;
                default:
                    sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                    break;
            }

            return this.getView().getModel().oData.reduce(function (iNumberOfMessages, oMessageItem) {
                return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
            }, "");
        },

        // Set the button icon according to the message with the highest severity
        buttonIconFormatter: function () {
            var sIcon;
            var aMessages = this.getView().getModel().oData;

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
                sgmrODataModel.create("/" + pServico, pDados, {
                    success: function (oData) {
                        resolve(oData);
                    },
                    error: function (oError) {
                        oController.closeBusyDialog();
                        reject(oError);
                    }
                });
                sgmrODataModel.attachRequestSent(function () {

                });
                sgmrODataModel.attachRequestCompleted(function () {

                });
                sgmrODataModel.attachRequestFailed(function (oError) {
                    oController.atualizarBusyDialog(oError.getParameter("message"));
                    oController.closeBusyDialog()
                    var oMockMessage = {
                        type: 'Error',
                        title: 'Sem Conexão',
                        description: 'Sem conexão com internet no momento. Tente mais tarde novamente',
                        subtitle: 'Problemas de conexão',
                        counter: 1
                    };
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)
                    reject(oError);
                });
                sgmrODataModel.attachMetadataLoaded(function () {

                });
                sgmrODataModel.attachMetadataFailed(function (oError) {
                    oController.atualizarBusyDialog(oError.getParameter("message"));
                    oController.closeBusyDialog()
                    var oMockMessage = {
                        type: 'Error',
                        title: 'Sem Conexão',
                        description: 'Sem conexão com internet no momento. Tente mais tarde novamente',
                        subtitle: 'Problemas de conexão',
                        counter: 1
                    };
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)
                    reject(oError);
                });
            })

        },

        carregarDados: function (pServico, pFiltros) {
            oController = this;
            return new Promise((resolve, reject) => {
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
                sgmrODataModel.attachRequestSent(function () {

                });
                sgmrODataModel.attachRequestCompleted(function () {

                });
                sgmrODataModel.attachRequestFailed(function (oError) {
                    oController.closeBusyDialog();
                    oController.atualizarBusyDialog(oError.getParameter("message"));
                    var oMockMessage = {
                        type: 'Error',
                        title: 'Sem Conexão',
                        description: 'Sem conexão com internet no momento. Tente mais tarde novamente',
                        subtitle: 'Problemas de conexão',
                        counter: 1
                    };
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)
                    reject(oError);
                });
                sgmrODataModel.attachMetadataLoaded(function () {

                });
                sgmrODataModel.attachMetadataFailed(function (oError) {
                    oController.atualizarBusyDialog(oError.getParameter("message"));
                    oController.closeBusyDialog();
                    var oMockMessage = {
                        type: 'Error',
                        title: 'Sem Conexão',
                        description: 'Sem conexão com internet no momento. Tente mais tarde novamente',
                        subtitle: 'Problemas de conexão',
                        counter: 1
                    };
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)
                    reject(oError);
                });

            })
        },

        carregarPerfil: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandoperfis"));
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
                    var oMensagem = {
                        "title": vDescricao,
                        "description": "Perfis encaminhados para o dispositivo",
                        "type": "Success",
                        "subtitle": "Perfis download"
                    }
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

                    resolve()
                }).catch(
                    function (result) {
                        // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                        reject(result)
                    })
            })
        },

        carregarPerfilIndexDB: function () {
			oController = this;

			return new Promise((resolve, reject) => {

				oController.lerTabelaIndexDB("tb_perfil").then(
					function (result) {
						oController.getOwnerComponent().getModel("listaPerfilModel").setData(result.tb_perfil)
						resolve()
					}).catch(
						function (result) {
							reject()
						})

			})
		},

        carregarCentro: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandocentros"));
                oController.carregarDados("ListaCentroSet", []).then(function (result) {
                    for (let x = 0; x < result.results.length; x++) {
                        
                        result.results.forEach(element => {
                            delete element.__metadata

                        });
                    }

                    oController.getOwnerComponent().getModel("listaCentrosModel").setData(result.results);


                    var vDescricao = "Centros sincronizados " + result.results.length
                    var oMensagem = {
                        "title": vDescricao,
                        "description": "Centros encaminhados para o dispositivo",
                        "type": "Success",
                        "subtitle": "Centros download"
                    }
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

                    resolve()
                }).catch(
                    function (result) {
                        // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                        reject(result)
                    })
            })
        },

        carregarAutorizacoes: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandoautorizacoes"));
                oController.carregarDados("ListaAutorizacaoSet", []).then(function (result) {
                    var aAutorizacoes = []
                    for (let x = 0; x < result.results.length; x++) {
                        const oAutorizacao = result.results[x];
                        //oAutorizacao.AutorizacaoSet = oAutorizacao;
                        // oAutorizacao.forEach(element => {
                        //     delete element.__metadata

                        // });


                        delete oAutorizacao.__metadata
                        aAutorizacoes.push(oAutorizacao);
                    }
                    oController.getOwnerComponent().getModel("listaAutorizacao").setData(aAutorizacoes)


                    var vDescricao = "Autorizações sincronizadas " + aAutorizacoes.length
                    var oMensagem = {
                        "title": vDescricao,
                        "description": "Autorizações encaminhados para o dispositivo",
                        "type": "Success",
                        "subtitle": "Autorizações download"
                    }
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

                    resolve()
                }).catch(
                    function (result) {
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

        sincronizarReceber1: function (pCatalogo) {

            // oController = this;
            // return new Promise((resolve, reject) => {

            //     if (oController.checkConnection() == true) {

            //         //Preencher aqui com todos os serviços que precisam ser chamados e carregados
            //         var aLeituras = [
            //             oController.carregarPerfil(),
            //         ]

            //     } else {
            //         oController.closeBusyDialog();
            //         reject()
            //     }
            // })
            resolve()

        },
        //Revisar
        sincronizarReceber: function (pCatalogo) {

            oController = this;
            return new Promise((resolve, reject) => {

                if (oController.checkConnection() == true) {

                    //Carregar dados do servidor quando há conexão
                    var aLeituras = [
                        oController.carregarAutorizacoes().catch(() => oController.carregarDadosIndexDB("tb_autorizacao", "listaAutorizacao")),
                        oController.carregarPerfil().catch(() => oController.carregarDadosIndexDB("tb_perfil", "listaPerfilModel")),
                        oController.carregarCentro().catch(() => oController.carregarDadosIndexDB("tb_centros", "listaCentrosModel")),
                        oController.carregarUsuario().catch(() => oController.carregarDadosIndexDB("tb_usuario", "listaUsuariosModel")),
                        oController.carregarMaterialRodante().catch(() => oController.carregarDadosIndexDB("tb_material_rodante", "listaMaterialRodanteModel")),
                        oController.carregarFormulario().catch(() => oController.carregarDadosIndexDB("tb_formulario", "listaFormularioModel"))
                    ];

                    

                    Promise.all(aLeituras).then(
                        function (result) {
                            //Preencher aqui as tabelas que precisam ser limpas antes da atualização
                            oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("preparandobancos"));
                            var aLimpezas = [
                                oController.limparTabelaIndexDB("tb_autorizacao"),
                                oController.limparTabelaIndexDB("tb_perfil"),
                                oController.limparTabelaIndexDB("tb_centros"),
                                oController.limparTabelaIndexDB("tb_usuario"),
                                oController.limparTabelaIndexDB("tb_material_rodante"),
                                oController.limparTabelaIndexDB("tb_formulario"),
                            ];
                            Promise.all(aLimpezas).then(
                                function (result) {
                                    var aAutorizacoes = oController.getOwnerComponent().getModel("listaAutorizacao").getData();
                                    var aPerfis = oController.getOwnerComponent().getModel("listaPerfilModel").getData();
                                    var aUsuarios = oController.getOwnerComponent().getModel("listaUsuariosModel").getData();
                                    var aCentros = oController.getOwnerComponent().getModel("listaCentrosModel").getData();
                                    var aMaterialRodante = oController.getOwnerComponent().getModel("listaMaterialRodanteModel").getData();
                                    var aFormularios = oController.getOwnerComponent().getModel("listaFormularioModel").getData();

                                    var aGravacoes = [
                                        oController.gravarTabelaIndexDB("tb_autorizacao", aAutorizacoes),
                                        oController.gravarTabelaIndexDB("tb_perfil", aPerfis),
                                        oController.gravarTabelaIndexDB("tb_centros", aCentros),
                                        oController.gravarTabelaIndexDB("tb_usuario", aUsuarios),
                                        oController.gravarTabelaIndexDB("tb_material_rodante", aMaterialRodante),
                                        oController.gravarTabelaIndexDB("tb_formulario", aFormularios)
                                    ];
                                    Promise.all(aGravacoes).then(
                                        function (result) {
                                            if (pCatalogo) {
                                                /* oController.carregarCatalogos().then(
                                                    function (result) {
                                                        oController.limparTabelaIndexDB("tb_catalogo").then(
                                                            function (result) {
                                                                var aCatalogos = oController.getOwnerComponent().getModel("catalogosModel").getData();
                                                                oController.gravarTabelaIndexDB("tb_catalogo", aCatalogos).then(
                                                                    function (result) { */
                                                                        oController.carregarCodes().then(
                                                                            function (result) {
                                                                                oController.limparTabelaIndexDB("tb_code").then(
                                                                                    function (result) {
                                                                                        var aCodes = oController.getOwnerComponent().getModel("codesModel").getData();
                                                                                        oController.gravarTabelaIndexDB("tb_code", aCodes).then(
                                                                                            function (result) {

                                                                                                resolve(result)
                                                                                            }).catch(
                                                                                                function (result) {

                                                                                                    oController.closeBusyDialog();
                                                                                                    reject(result)
                                                                                                })
                                                                                        //resolve()
                                                                                    }).catch(
                                                                                        function (result) {
                                                                                            oController.closeBusyDialog();
                                                                                            reject(result)
                                                                                        })
                                                                                //resolve()
                                                                            }).catch(
                                                                                function (result) {
                                                                                    oController.closeBusyDialog();
                                                                                    reject(result)
                                                                                });
                                                                    /* }).catch(
                                                                        function (result) {
                                                                            oController.closeBusyDialog();
                                                                            reject(result)
                                                                        })
                                                                //resolve()
                                                            }).catch(
                                                                function (result) {
                                                                    oController.closeBusyDialog();
                                                                    reject(result)
                                                                })
                                                        //resolve()
                                                    }).catch(
                                                        function (result) {
                                                            oController.closeBusyDialog();
                                                            reject(result)
                                                        })*/
                                            } else {
                                                resolve()
                                            }

                                        }).catch(
                                            function (result) {
                                                oController.closeBusyDialog();
                                                reject(result)
                                            })
                                    //resolve()
                                }).catch(
                                    function (result) {
                                        oController.closeBusyDialog();
                                        reject(result)
                                    })
                            //resolve()
                        }).catch(
                            function (result) {
                                oController.closeBusyDialog();
                                reject(result)
                            })
                } else {
                    // Sem conexão - carregar dados do IndexedDB
                    oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("carregarIDB"));
                    var aLeituras = [
                        oController.carregarDadosIndexDB("tb_autorizacao", "listaAutorizacao"),
                        oController.carregarDadosIndexDB("tb_perfil", "listaPerfilModel"),
                        oController.carregarDadosIndexDB("tb_centros", "listaCentrosModel"),
                        oController.carregarDadosIndexDB("tb_usuario", "listaUsuariosModel")
                    ]
                    
                    Promise.all(aLeituras).then(
                        function (result) {
                            oController.closeBusyDialog();
                            resolve()
                        }).catch(
                            function (result) {
                                oController.closeBusyDialog();
                                reject(result)
                            })
                }
            })

        },

        sincronizar: function (pCatalogo) {
            //oController.carregarPerfil();
            //oController.carregarAutorizacao()
            oController = this;

            return new Promise((resolve, reject) => {
                if (oController.checkConnection() == true) {
                    oController.getOwnerComponent().getModel("mensagensModel").setData([])
                    oController.verificarDisponibilidadeServidor().then(
                        function (result) {
                            oController.sincronizarEnviar(pCatalogo).then(
                                function (result) {
                                    oController.sincronizarReceber(pCatalogo).then(
                                        function (result) {
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
                                        }).catch(
                                            function (result) {
                                                //oController.forceCloseBusyDialog();
                                                reject(result)
                                            })
                                }).catch(
                                    function (result) {
                                        //oController.forceCloseBusyDialog();
                                        reject(result)
                                    })
                        }).catch(
                            function (result) {
                                //oController.closeBusyDialog();
                                reject(result)
                            })
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
                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("atualizandoperfis"));
                var aPerfis = oController.getOwnerComponent().getModel("listaPerfilModel").getData();
                var aPerfilSet = []

                aPerfis.forEach(oPerfil => {
                    switch (oPerfil.Sincronizado) {
                        case "N":
                            var oPerfilSet = {
                                "CodigoPerfil": 0,
                                "DescrPerfil": oPerfil.DescrPerfil,
                                "Sincronizado": "N",
                                "AutorizacaoSet": [],
                                "PerfilCentroSet": []
                            }
                            oPerfil.AutorizacaoSet.forEach(oAutorizacao => {
                                if (oAutorizacao.Selecionado == true) {
                                    var oAutorizacaoSet =
                                    {
                                        "CodigoPerfil": 0,
                                        "CodigoAutorizacao": oAutorizacao.CodigoAutorizacao,
                                        "DescrAutorizacao": oAutorizacao.DescrAutorizacao
                                    }
                                    oPerfilSet.AutorizacaoSet.push(oAutorizacaoSet)
                                }
                            });
                            oPerfil.PerfilCentroSet.forEach(oCentro => {
                                if (oCentro) {
                                    var oCentroSet =
                                    {
                                        "CodigoPerfil": oCentro.CodigoPerfil,
                                        "DescPerfil": oCentro.DescrPerfil,
                                        "Centro": oCentro.CodigoCentro,
                                        "DescCentro": oCentro.DescrCentro
                                    }
                                    oPerfilSet.PerfilCentroSet.push(oCentroSet)
                                }
                            });
                            aPerfilSet.push(oController.enviarDados("PerfilSet", oPerfilSet))
                            break;
                        case "E":
                            var oPerfilSet = {
                                "CodigoPerfil": oPerfil.CodigoPerfil,
                                "DescrPerfil": oPerfil.DescrPerfil,
                                "Sincronizado": "E",
                                "AutorizacaoSet": [],
                                "PerfilCentroSet": []
                            }
                            aPerfilSet.push(oController.enviarDados("PerfilSet", oPerfilSet))
                            break;

                        default:
                            break;
                    }


                });

                if (aPerfilSet.length > 0) {
                    Promise.all(aPerfilSet).then(
                        function (result) {
                            result.forEach(oPerfil => {
                                var vTipo
                                switch (oPerfil.Tipomensagem) {
                                    case "S":
                                        vTipo = "Success"
                                        break;
                                    case "E":
                                        vTipo = "Error"
                                        break;
                                    default:
                                        break;
                                }
                                var oMensagem = {
                                    "title": "Gestão de perfil",
                                    "description": oPerfil.Mensagem,
                                    "type": vTipo,
                                    "subtitle": oPerfil.Mensagem
                                }
                                oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

                            });

                            resolve()
                        }).catch(
                            function (result) {
                                // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                                reject()
                            })
                } else {
                    resolve()
                }

            })
        },

        onSincronizarGeral: function (pController, pCatalogo) {
            var aMockMessages = []
            if (oController.checkConnection() == true) {
                oController = pController
                oController.openBusyDialog();
                oController.sincronizar(pCatalogo).then(function (result) {
                    oController.closeBusyDialog();

                    var aMensagens = oController.getOwnerComponent().getModel("mensagensModel").getData();

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

                    var oModel = new JSONModel();
                    oModel.setData(aMockMessages);
                    oController.getView().setModel(oModel);
                    oController.getView().getModel().refresh()

                }).catch(
                    function (result) {
                        oController.closeBusyDialog();
                    });
            } else {
                MessageToast.show("Dispositivo sem conexão com a internet no momento.");
                var oMockMessage = {
                    type: 'Error',
                    title: 'Sem Conexão',
                    description: 'Sem conexão com internet no momento. Tente mais tarde novamente',
                    subtitle: 'Problemas de conexão',
                    counter: 1
                };
                aMockMessages.push(oMockMessage)

                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);
            }


        },

        sincronizarEnviar: function (pCatalogo) {
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

        prepararUsuario: function () {
            return new Promise((resolve, reject) => {
                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("atualizandousuarios"));
                var aUsuarios = oController.getOwnerComponent().getModel("listaUsuariosModel").getData();
                var aUsuarioSet = []

                if (aUsuarios && aUsuarios.length) {
                    aUsuarios.forEach(oUsuario => {
                        if (oUsuario.Bloqueado == true) {
                            oUsuario.Bloqueado = "X"
                        } else {
                            oUsuario.Bloqueado = ""
                        }
                        switch (oUsuario.Sincronizado) {
                            case "N":
                                var oUsuarioSet = {
                                    "CodUsuario": oUsuario.CodUsuario,
                                    "Nome": oUsuario.Nome,
                                    "Senha": oUsuario.Senha,
                                    "Centro": oUsuario.Centro,
                                    "Deposito": oUsuario.Deposito,
                                    "Bloqueado": oUsuario.Bloqueado,
                                    "Perfil": oUsuario.CodigoPerfil.toString(),
                                    "Sincronizado": "N"
                                }
                                aUsuarioSet.push(oController.enviarDados("UsuarioSet", oUsuarioSet))
                                break;
                            case "U":
                                var oUsuarioSet = {
                                    "CodUsuario": oUsuario.CodUsuario,
                                    "Nome": oUsuario.Nome,
                                    "Senha": oUsuario.Senha,
                                    "Centro": oUsuario.Centro,
                                    "Deposito": oUsuario.Deposito,
                                    "Bloqueado": oUsuario.Bloqueado,
                                    "Perfil": oUsuario.CodigoPerfil.toString(),
                                    "Sincronizado": "U"
                                }
                                aUsuarioSet.push(oController.enviarDados("UsuarioSet", oUsuarioSet))
                                break;
                            case "E":
                                var oUsuarioSet = {
                                    "CodUsuario": oUsuario.CodUsuario,
                                    "Nome": oUsuario.Nome,
                                    "Senha": oUsuario.Senha,
                                    "Centro": oUsuario.Centro,
                                    "Deposito": oUsuario.Deposito,
                                    "Bloqueado": oUsuario.Bloqueado,
                                    "Perfil": oUsuario.CodigoPerfil.toString(),
                                    "Sincronizado": "E"
                                }
                                aUsuarioSet.push(oController.enviarDados("UsuarioSet", oUsuarioSet))
                                break;
                            default:
                                break;
                        }
                    });
                }

                if (aUsuarioSet.length > 0) {
                    Promise.all(aUsuarioSet).then(
                        function (result) {
                            result.forEach(oUsuario => {
                                var vTipo
                                switch (oUsuario.Tipomensagem) {
                                    case "S":
                                        vTipo = "Success"
                                        break;
                                    case "E":
                                        vTipo = "Error"
                                        break;
                                    default:
                                        break;
                                }
                                var oMensagem = {
                                    "title": "Gestão de usuário",
                                    "description": oUsuario.Mensagem,
                                    "type": vTipo,
                                    "subtitle": oUsuario.Mensagem
                                }
                                oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)
                            });
                            resolve()
                        }).catch(
                            function (result) {
                                // Não fechar o busy dialog aqui - será fechado no método sincronizar principal
                                reject()
                            })
                } else {
                    resolve()
                }
            })
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
                oController.lerTabelaIndexDB("tb_perfil").then(
                    function (result) {
                        if (result.tb_perfil) {
                            oController.getOwnerComponent().getModel("listaPerfilModel").setData(result.tb_perfil);
                            oController.prepararPerfil().then(
                                function (result) {
                                    resolve()
                                }).catch(
                                    function (result) {
                                        reject()
                                    })
                        }

                    }).catch(
                        function (result) {
                            reject(result)
                        })

            })
        },

        carregarOffline: function (pCatalogo) {

            oController = this;
            return new Promise((resolve, reject) => {

                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("carregaroffline"));
                var aLeituras = [
                    oController.carregarDadosIndexDB("tb_autorizacao", "autorizacoesModel"),
                    oController.carregarDadosIndexDB("tb_perfil", "listaPerfilModel"),
                    oController.carregarDadosIndexDB("tb_centros", "listaCentrosModel"),
                    oController.carregarDadosIndexDB("tb_usuario", "listaUsuariosModel")
                ]
                Promise.all(aLeituras).then(
                    function (result) {
                        resolve()

                    }).catch(
                        function (result) {
                            oController.closeBusyDialog();
                            reject(result)
                        })

            })

        },

        carregarOrdens: function () {

			return new Promise((resolve, reject) => {
				oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandoordens"));
				var oUsuario = oController.getOwnerComponent().getModel("usuarioModel").getData()

				var aFiltros = [
					{
						key: "Centro",
						value: oUsuario.Centro
					},
					{
						key: "Deposito",
						value: oUsuario.Deposito
					}]
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

					var vDescricao = "Ordem recebidas " + aOrdens.length
					var oMensagem = {
						"title": vDescricao,
						"description": "Ordens encaminhadas para o dispositivo",
						"type": "Success",
						"subtitle": "Ordens download"
					}
					oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

					var vDescricao = "Operações recebidas " + aOperacoes.length
					var oMensagem = {
						"title": vDescricao,
						"description": "Operações encaminhadas para o dispositivo",
						"type": "Success",
						"subtitle": "Operações download"
					}
					oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

					resolve()
				}).catch(
					function (result) {
						// Não fechar o busy dialog aqui - será fechado no método sincronizar principal
						reject(result)
					})
			})

		},

        carregarFormulario: function () {

			return new Promise((resolve, reject) => {
				oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandoequipamentos"));
/* 				var oUsuario = oController.getOwnerComponent().getModel("usuarioModel").getData()
				var aFiltros = [
					{
						key: "Centro",
						value: oUsuario.Centro
					}] */
				oController.carregarDados("ListaFormularioSet").then(function (result) {
					var aFormularios = []
					for (let x = 0; x < result.results.length; x++) {
						const oFormulario = result.results[x];
						delete oFormulario.__metadata
						aFormularios.push(oFormulario);
					}
					oController.getOwnerComponent().getModel("listaFormularioModel").setData(aFormularios)

					var vDescricao = "Material Rodante sincronizado " + aFormularios.length
					var oMensagem = {
						"title": vDescricao,
						"description": "Material Rodante encaminhado para o dispositivo",
						"type": "Success",
						"subtitle": "Material Rodante download"
					}
					oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

					resolve()
				}).catch(
					function (result) {
						// Não fechar o busy dialog aqui - será fechado no método sincronizar principal
						reject(result)
					})
			})

		},


        carregarMaterialRodante: function () {

			return new Promise((resolve, reject) => {
				oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandoequipamentos"));
				var oUsuario = oController.getOwnerComponent().getModel("usuarioModel").getData()
				var aFiltros = [
					{
						key: "Centro",
						value: oUsuario.Centro
					}]
				oController.carregarDados("ListaEquipamentoSet", aFiltros).then(function (result) {
					var aEquipamentos = []
					for (let x = 0; x < result.results.length; x++) {
						const oEquipamento = result.results[x];
						delete oEquipamento.__metadata
						aEquipamentos.push(oEquipamento);
					}
					oController.getOwnerComponent().getModel("listaMaterialRodanteModel").setData(aEquipamentos)

					var vDescricao = "Material Rodante sincronizado " + aEquipamentos.length
					var oMensagem = {
						"title": vDescricao,
						"description": "Material Rodante encaminhado para o dispositivo",
						"type": "Success",
						"subtitle": "Material Rodante download"
					}
					oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

					resolve()
				}).catch(
					function (result) {
						// Não fechar o busy dialog aqui - será fechado no método sincronizar principal
						reject(result)
					})
			})

		},


		carregarMateriais: function () {

			return new Promise((resolve, reject) => {
				oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandomateriais"));
				var oUsuario = oController.getOwnerComponent().getModel("usuarioModel").getData()
				var aFiltros = [
					{
						key: "Centro",
						value: oUsuario.Centro
					},
					{
						key: "Deposito",
						value: oUsuario.Deposito
					}
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
							oMaterial.ListaTiposAvaliacaoSet.results.push(
								{
									Material: "",
									TipoAvaliacao: "NOVO"
								}
							)
						}

						// delete oMaterial.ListaTiposAvaliacaoSet
						delete oMaterial.__metadata
						aMateriais.push(oMaterial);
					}
					oController.getOwnerComponent().getModel("materiaisModel").setData(aMateriais)
					oController.getOwnerComponent().getModel("tiposAvaliacaoModel").setData(aTipos)

					var vDescricao = "Materiais sincronizados " + aMateriais.length
					var oMensagem = {
						"title": vDescricao,
						"description": "Materiais encaminhados para o dispositivo",
						"type": "Success",
						"subtitle": "Materiais download"
					}
					oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

					var vDescricao = "Tipo de Avaliação sincronizados " + aTipos.length
					var oMensagem = {
						"title": vDescricao,
						"description": "Tipo de Avaliação encaminhados para o dispositivo",
						"type": "Success",
						"subtitle": "Tipo de Avaliação download"
					}
					oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

					resolve()
				}).catch(
					function (result) {
						// Não fechar o busy dialog aqui - será fechado no método sincronizar principal
						reject(result)
					})
			})

		},

		carregarCatalogos: function () {

			return new Promise((resolve, reject) => {
				oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandocatalogos"));
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

						var vDescricao = "Catálogos sincronizados " + aCatalogos.length
						var oMensagem = {
							"title": vDescricao,
							"description": "Catálogos encaminhados para o dispositivo",
							"type": "Success",
							"subtitle": "Catálogos download"
						}
						oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

						resolve()
					}).catch(
						function (result) {
							// Não fechar o busy dialog aqui - será fechado no método sincronizar principal
							reject();
							console.table(result)
						})
			})
		},

		carregarCodes: function () {
			return new Promise((resolve, reject) => {
				oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandocodes"));
				var aListaCodes = []
				var aCatalogos = oController.agruparCatalogos(oController.getOwnerComponent().getModel("catalogosModel").getData())

				for (let index = 0; index < aCatalogos.length; index++) {
					const element = aCatalogos[index];
					var aFiltros = [{ key: "Catalogo", value: element.key }]
					aListaCodes.push(oController.carregarDados("ListaCodesSet", aFiltros))
				}
				Promise.all(aListaCodes).then(
					function (result) {
						var aCodes = []

						for (let x = 0; x < result.length; x++) {
							var array3 = aCodes.concat(result[x].results)
							aCodes = array3;
						}

						var aCatalogos = oController.getOwnerComponent().getModel("catalogosModel").getData();

						aCodes.forEach(function (item) {
							var oCatalogo = aCatalogos.find(function (catalogo) {
								return catalogo.CodeGroup === item.Codegruppe;
							});
							if (oCatalogo) {
								item.Shorttxtgr = oCatalogo.Shorttxtgr;
							}
						});

						oController.getOwnerComponent().getModel("codesModel").setData(aCodes)

						oController.getOwnerComponent().getModel("codesModel").setData(aCodes)

						var vDescricao = "Codes sincronizados " + aCodes.length
						var oMensagem = {
							"title": vDescricao,
							"description": "Codes encaminhados para o dispositivo",
							"type": "Success",
							"subtitle": "Codes download"
						}
						oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

						resolve()
					}).catch(
						function (result) {
							// Não fechar o busy dialog aqui - será fechado no método sincronizar principal
							reject(result)
						})
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
                            data.forEach(function(oUsuario) {
                                if (oUsuario.Bloqueado === "X" || oUsuario.Bloqueado === true) {
                                    oUsuario.Bloqueado = true;
                                } else {
                                    oUsuario.Bloqueado = false;
                                }
                            });
                        }
                        
                        oController.getOwnerComponent().getModel(pModel).setData(data)
                        resolve()
                    }).catch(
                        function (result) {
                            reject()
                        })

            })
        },

        lerTabelaIndexDB: function (pTabela) {

            oController = this;

            return new Promise((resolve, reject) => {

                console.log("Iniciando leitura da tabela " + pTabela);

                var oDBData

                var db;
                var databaseName = oController.getDatabaseName();
                var databaseVersion = oController.getDatabaseVersion();
                var openRequest = window.indexedDB.open(databaseName, databaseVersion);

                openRequest.onerror = function (event) {
                    console.log(openRequest.errorCode);
                    reject('Erro durante a leitura do banco de dados!')
                };

                openRequest.onsuccess = function (event) {
                    db = event.target.result;
                    db.onerror = function () {
                        console.log(db.errorCode);
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
                switch (navigator.connection.type) {
                    case 'unknown':
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://disconnected")
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Error")
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "offline")
                        this.getOwnerComponent().getModel("conexaoModel").refresh(true)
                        return false
                    case 'none':
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://disconnected")
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Error")
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "offline")
                        this.getOwnerComponent().getModel("conexaoModel").refresh(true)
                        return false
                    default:
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://connected")
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Success")
                        this.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "online")
                        this.getOwnerComponent().getModel("conexaoModel").refresh(true)
                        return true;
                }
            } else {
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/iconeConexao", "sap-icon://connected")
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/corIconeConexao", "Success")
                this.getOwnerComponent().getModel("conexaoModel").setProperty("/statusConexao", "online")
                this.getOwnerComponent().getModel("conexaoModel").refresh(true)
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
                            // Validar se a URL tem formato válido
                            try {
                                new URL(oConexao.urlsemclient);
                            } catch (urlError) {
                                console.error("URL inválida:", oConexao.urlsemclient, urlError);
                                var oMockMessage = {
                                    type: 'Error',
                                    title: 'URL Inválida',
                                    description: "O endereço configurado não é válido: " + oConexao.urlsemclient,
                                    subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaoerro"),
                                    counter: 1
                                };
                                oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)
                                reject()
                                return;
                            }

                            oController.openBusyDialog();
                            oController.atualizarBusyDialog("Tentando conexão com o endereço " + oConexao.urlsemclient);

                            console.log("Testando conexão com:", oConexao.urlsemclient);

                            fetch(oConexao.urlsemclient, { 
                                mode: 'no-cors',
                                method: 'GET',
                                cache: 'no-cache'
                            }).then(r => {
                                console.log("Fetch success:", r);
                                oController.atualizarBusyDialog("Conexão com o endereço " + oConexao.urlsemclient + " estabelecida com sucesso");

                                var oMockMessage = {
                                    type: 'Success',
                                    title: oController.getView().getModel("i18n").getResourceBundle().getText("sucessoservidor"),
                                    description: "Conexão com o endereço " + oConexao.urlsemclient + " estabelecida com sucesso",
                                    subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaosucesso"),
                                    counter: 1
                                };

                                oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)
                                resolve()
                            })
                            .catch(e => {
                                console.error("Fetch error:", e);
                                oController.atualizarBusyDialog("Não foi possível alcançar o endereço " + oConexao.urlsemclient + " informado");

                                var oMockMessage = {
                                    type: 'Error',
                                    title: oController.getView().getModel("i18n").getResourceBundle().getText("erroservidor"),
                                    description: "Erro de conexão: " + e.message + " - Endereço: " + oConexao.urlsemclient,
                                    subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaoerro"),
                                    counter: 1
                                };

                                oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)
                                resolve() // Resolve para não quebrar o fluxo
                            });
                        } else {
                            var oMockMessage = {
                                type: 'Error',
                                title: oController.getView().getModel("i18n").getResourceBundle().getText("configurarconexao"),
                                description: "Configure os dados de conexão antes de continuar",
                                subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaosem"),
                                counter: 1
                            };

                            oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)

                            reject()
                        }

                    } else {
                        var oMockMessage = {
                            type: 'Error',
                            title: oController.getView().getModel("i18n").getResourceBundle().getText("testeerro"),
                            description: "Por favor verifque a disponibilidade de rede ou wi-fi.",
                            subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaosem"),
                            counter: 1
                        };

                        oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMockMessage)

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
                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("sincronizandousuarios"));
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
                            // Perfis ainda não carregados - mantém dados originais do usuário
                            console.log("Perfis ainda não disponíveis durante carregamento de usuários");
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


                    var vDescricao = "Usuários sincronizados " + aUsuarios.length
                    var oMensagem = {
                        "title": vDescricao,
                        "description": "Usuários encaminhados para o dispositivo",
                        "type": "Success",
                        "subtitle": "Usuários download"
                    }
                    oController.getOwnerComponent().getModel("mensagensModel").getData().push(oMensagem)

                    resolve()
                }).catch(
                    function (result) {
                        oController.closeBusyDialog();
                        reject(result)
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
                    console.log(openRequest.errorCode);
                    // Não fechar o busy dialog aqui - será fechado no onSincronizarGeral
                    reject();
                };

                openRequest.onsuccess = function (event) {
                    db = event.target.result;
                    db.onerror = function () {
                        console.log(db.errorCode);
                        // Não fechar o busy dialog aqui - será fechado no onSincronizarGeral
                        reject();
                    };
                    var oTransaction = db.transaction([pTabela], "readwrite");
                    oTransaction.oncomplete = function (event) {
                        db.close();
                        // Não fechar o busy dialog aqui - será fechado no onSincronizarGeral
                        resolve();
                    };

                    oTransaction.onerror = function (event) {
                        db.close();
                        // Não fechar o busy dialog aqui - será fechado no onSincronizarGeral
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


                var vMsg = oController.getView().getModel("i18n").getResourceBundle().getText("gravandotabela") + " " + pTabela;
                oController.atualizarBusyDialog(vMsg);

                var db;
                var databaseName = oController.getDatabaseName();
                var databaseVersion = oController.getDatabaseVersion();
                var openRequest = window.indexedDB.open(databaseName, databaseVersion);

                openRequest.onerror = function (event) {
                    console.log(openRequest.errorCode);
                    // Não fechar o busy dialog aqui - será fechado no onSincronizarGeral
                    reject()
                };

                openRequest.onsuccess = function (event) {
                    db = event.target.result;
                    db.onerror = function () {
                        console.log(db.errorCode);
                        // Não fechar o busy dialog aqui - será fechado no onSincronizarGeral
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
                            // Não fechar o busy dialog aqui - será fechado no onSincronizarGeral
                            reject();
                        };
                        var values = pData
                        var objectStore = transaction.objectStore(pTabela);
                        if (values.length == undefined) {
                            var objectStoreRequest = objectStore.add(values);
                            objectStoreRequest.onsuccess = function (event) {
                                console.table(event);
                            }

                            objectStoreRequest.onerror = function (oError) {
                                console.table(oError);

                            }
                        } else {
                            for (var i = 0; i < values.length; i++) {
                                var objectStoreRequest = objectStore.add(values[i]);
                                objectStoreRequest.onsuccess = function (event) {
                                    console.table(event);
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
                                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("atualizandousuarios"));
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
                                oController.atualizarBusyDialog(oController.getView().getModel("i18n").getResourceBundle().getText("atualizandoperfis"));
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






    });
});
