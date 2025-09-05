sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel'
],
    function (Controller, formatter, Filter, FilterOperator, Fragment, MessageToast, MessagePopover, MessageItem, JSONModel) {
        "use strict";
        var oController
        var oView
        var oMessagePopover;
        var aMockMessages;

        return Controller.extend("com.pontual.sgmr.controller.CriarPerfil", {
            onInit: function () {
                oController = this;
                oView = oController.getView();

                oView.bindElement("perfilCriarModel>/");

                console.log("Dados do PerfilCentroSet:",
                    this.getOwnerComponent().getModel("perfilCriarModel").getProperty("/PerfilCentroSet"));

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
                this.byId("messagePopoverBtn").addDependent(oMessagePopover);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("CriarPerfil").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {

                aMockMessages = [];
                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                var oPerfilInput = oView.byId("perfilInput")
                oPerfilInput.setValueState("None");

                var oConfirmarButton = oView.byId("confirmarPerfilButton")

                oConfirmarButton.setBusy(false);

                var oPerfil = oController.getOwnerComponent().getModel("perfilCriarModel").getData()
                if (oPerfil.AutorizacaoSet != undefined) {
                    oPerfil.AutorizacaoSet.forEach(element => {
                        element.Selecionado = false
                    });
                }
                oController.getOwnerComponent().getModel("perfilCriarModel").refresh();

                // Prepopular /Centros a partir de PerfilCentroSet (se vier do modelo)
                var oPerfil = oController.getOwnerComponent().getModel("perfilCriarModel").getData();
                if (oPerfil && oPerfil.PerfilCentroSet && oPerfil.PerfilCentroSet.length) {
                    var aTokens = oPerfil.PerfilCentroSet.map(function (pc) {
                        // ajusta os nomes conforme seu modelo (CodigoCentro/DescrCentro)
                        return { key: pc.Centro, value: pc.DescrCentro };
                    });
                    oController.getOwnerComponent().getModel("perfilCriarModel").setProperty("/Centros", aTokens);
                }


            },


            onNavBack: function () {
                this.getRouter().navTo("ListaPerfil", {}, true /*no history*/);
            },

            onCancelarPerfil: function () {
                this.getRouter().navTo("ListaPerfil", {}, true /*no history*/);
            },

            /*  handleTokenUpdate: function (oEvent) {
             // Atualiza o listaCentrosModel
             var aLista = oController.getOwnerComponent().getModel("listaCentrosModel").getData();
             var chave = oEvent.getParameter("removedTokens")[0].getProperty("key");
             var vIndex = aLista.findIndex(element => element.Werks === chave);
 
             if (vIndex > -1) {
                 aLista[vIndex].Selected = false;
                 oController.getOwnerComponent().getModel("listaCentrosModel").setData(aLista);
                 oController.getOwnerComponent().getModel("listaCentrosModel").refresh();
             }
 
             // Atualiza o perfilCriarModel
             var aCentrosSelecionados = oController.getOwnerComponent().getModel("perfilCriarModel").getProperty("/Centros") || [];
             var novoscentrosSelecionados = aCentrosSelecionados.filter(item => item.key !== chave);
             oController.getOwnerComponent().getModel("perfilCriarModel").setProperty("/Centros", novoscentrosSelecionados);
             }, */

            handleTokenUpdate: function (oEvent) {
                var sType = oEvent.getParameter("type"); // "added" | "removed"
                var aAdded = oEvent.getParameter("addedTokens") || [];
                var aRemoved = oEvent.getParameter("removedTokens") || [];

                var oPerfilModel = oController.getOwnerComponent().getModel("perfilCriarModel");
                var aCentrosSel = oPerfilModel.getProperty("/Centros") || [];

                var oListaModel = oController.getOwnerComponent().getModel("listaCentrosModel");
                var aLista = (oListaModel && oListaModel.getData()) || [];

                // REMOÇÃO
                if (sType === "removed") {
                    aRemoved.forEach(function (oTok) {
                        var sKey = oTok.getProperty("key") || oTok.getKey() || oTok.getText();
                        // tira do perfil
                        aCentrosSel = aCentrosSel.filter(function (it) { return it.key !== sKey; });
                        // desmarca na lista (se existir)
                        var idx = aLista.findIndex(function (x) { return x.Werks === sKey; });
                        if (idx > -1) {
                            aLista[idx].Selected = false;
                        }
                    });
                }

                // ADIÇÃO (inclui tokens digitados – custom)
                if (sType === "added") {
                    aAdded.forEach(function (oTok) {
                        var sKey = oTok.getProperty("key") || oTok.getKey() || oTok.getText();
                        var sText = oTok.getText();
                        // evita duplicados
                        if (!aCentrosSel.some(function (x) { return x.key === sKey; })) {
                            aCentrosSel.push({ key: sKey, value: sText }); // se for custom, value = texto
                        }
                        // marca na lista se existir
                        var idx = aLista.findIndex(function (x) { return x.Werks === sKey; });
                        if (idx > -1) {
                            aLista[idx].Selected = true;
                        }
                    });
                }

                // aplica nos modelos
                oPerfilModel.setProperty("/Centros", aCentrosSel);
                if (oListaModel) {
                    oListaModel.setData(aLista);
                    oListaModel.refresh();
                }
            },

            handleValueHelpRequestedCentro: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oButton = oEvent.getSource(),
                    oView = this.getView();

                if (!this._pCentroValueHelpDialog) {
                    this._pCentroValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.pontual.sgmr.fragment.CentroDialog",
                        controller: this
                    }).then(function (oValueHelpCentroDialog) {
                        oView.addDependent(oValueHelpCentroDialog);
                        return oValueHelpCentroDialog;
                    });
                }

                this._pCentroValueHelpDialog.then(function (oValueHelpCentroDialog) {
                    // Pega os centros já selecionados do modelo de perfil
                    var aCentrosSelecionados = oController.getOwnerComponent().getModel("perfilCriarModel").getProperty("/Centros") || [];
                    var aListaCentros = oController.getOwnerComponent().getModel("listaCentrosModel").getData();

                    // Marca os centros que já estavam selecionados
                    if (aListaCentros && aCentrosSelecionados.length > 0) {
                        aListaCentros.forEach(function (centro) {
                            // Verifica se o centro está na lista de selecionados
                            var centroSelecionado = aCentrosSelecionados.find(function (item) {
                                return item.key === centro.Werks;
                            });
                            centro.Selected = !!centroSelecionado;
                        });
                        oController.getOwnerComponent().getModel("listaCentrosModel").refresh();
                    }

                    oValueHelpCentroDialog.getBinding("items").filter([new Filter("Werks", sap.ui.model.FilterOperator.Contains, sInputValue)]);
                    oValueHelpCentroDialog.open();
                });
            },

            _handleValueHelpSearchCentro: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilters = [new Filter({
                    filters: [
                        new Filter("Werks", sap.ui.model.FilterOperator.Contains, sValue),
                        new Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue)
                    ],
                    and: false,
                })
                ];
                oFilters.push(oFilters);
                oEvent.getSource().getBinding("items").filter(oFilters);

            },

            /* _handleValueHelpCloseCentro: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems"),
                aElementos = [];

            if (aSelectedItems) {
                aSelectedItems.forEach(element => {
                    var vKey = element.getProperty("title");
                    var vValue = element.getProperty("description");
                    var oToken = {
                        key: vKey,
                        value: vValue
                    }
                    aElementos.push(oToken);

                    var aLista = oController.getOwnerComponent().getModel("listaCentrosModel").getData();
                    var vIndex = aLista.findIndex(element => element.Werks === vKey);
                    if (vIndex > -1) { 
                        aLista[vIndex].Selected = true;    
                        oController.getOwnerComponent().getModel("listaCentrosModel").setData(aLista);
                        oController.getOwnerComponent().getModel("listaCentrosModel").refresh();                    
                    }
                });
                
            }

            oController.getOwnerComponent().getModel("perfilCriarModel").setProperty("/Centros", aElementos);

            }, */

            _handleValueHelpCloseCentro: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems") || [];
                var oPerfilModel = oController.getOwnerComponent().getModel("perfilCriarModel");
                var aAtuais = oPerfilModel.getProperty("/Centros") || [];
                var oListaModel = oController.getOwnerComponent().getModel("listaCentrosModel");
                var aLista = (oListaModel && oListaModel.getData()) || [];

                aSelectedItems.forEach(function (element) {
                    var vKey = element.getProperty("title");        // Werks
                    var vValue = element.getProperty("description");// Name1
                    if (!aAtuais.some(function (x) { return x.key === vKey; })) {
                        aAtuais.push({ key: vKey, value: vValue });
                    }
                    var idx = aLista.findIndex(function (x) { return x.Werks === vKey; });
                    if (idx > -1) {
                        aLista[idx].Selected = true;
                    }
                });

                oPerfilModel.setProperty("/Centros", aAtuais);

                if (oListaModel) {
                    oListaModel.setData(aLista);
                    oListaModel.refresh();
                }
            },


            onConfirmarPerfil: function () {

                var aMockMessages = [];
                var vPodeGravar = true;
                var oMockMessage = {}
                var oPerfil = oController.getOwnerComponent().getModel("perfilCriarModel").getData()
                var oPerfilInput = oView.byId("perfilInput")
                var oConfirmarButton = oView.byId("confirmarPerfilButton")
                oConfirmarButton.setEnabled(false);
                oConfirmarButton.setBusy(true);

                if (oPerfil.DescrPerfil == "") {
                    oPerfilInput.setValueState("Error");
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campoperfil"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("perfil"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;

                } else {
                    if (oController.getOwnerComponent().getModel("listaPerfilModel").getData().length != undefined) {
                        var oPerfilExistente = oController.getOwnerComponent().getModel("listaPerfilModel").getData().find((oElement) => oElement.DescrPerfil.toUpperCase() == oPerfil.DescrPerfil.toUpperCase());
                        if (oPerfilExistente != undefined) {
                            oPerfilInput.setValueState("Error");
                            var oMockMessage = {
                                type: 'Error',
                                title: oController.getView().getModel("i18n").getResourceBundle().getText("perfilexistente"),
                                description: oController.getView().getModel("i18n").getResourceBundle().getText("perfilexistentemsg"),
                                subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("perfil"),
                                counter: 1
                            };
                            aMockMessages.push(oMockMessage)
                            vPodeGravar = false;
                        }
                    }
                }

                var vAutorizacoes = oPerfil.AutorizacaoSet.find((oOperacao) => oOperacao.Selecionado == true);
                if (vAutorizacoes == undefined) {
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campoautorizacao"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("autorizacao"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;
                }

                if (oController.getOwnerComponent().getModel("perfilCriarModel").getData().Centros == undefined || oController.getOwnerComponent().getModel("perfilCriarModel").getData().Centros.length == 0) {
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campocentro"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("centro"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;
                }

                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                if (vPodeGravar == true) {
                    oPerfilInput.setValueState("None");
                    oView.byId("idListaAutorizacoesTable").getSelectedContextPaths().forEach(element => {
                        // oController.getOwnerComponent().getModel("perfilCriarModel").setProperty(element + '/Selecionado', true )
                    });

                    if (oController.getOwnerComponent().getModel("listaPerfilModel").getData().length == undefined) {
                        oController.getOwnerComponent().getModel("listaPerfilModel").setData([])
                        oController.getOwnerComponent().getModel("listaPerfilModel").getData().push(oPerfil)
                    } else {
                        oController.getOwnerComponent().getModel("listaPerfilModel").getData().push(oPerfil)
                    }
                    // Clonagem segura para evitar referências circulares
                    var aPerfilData = oController.getOwnerComponent().getModel("listaPerfilModel").getData();
                    var oObjetoNovo = [];

                    if (aPerfilData && aPerfilData.length) {
                        aPerfilData.forEach(function (perfil) {
                            var oPerfilClone = {
                                CodigoPerfil: perfil.CodigoPerfil,
                                DescrPerfil: perfil.DescrPerfil,
                                Sincronizado: perfil.Sincronizado,
                                HabilitarTelaCriarPerfil: perfil.HabilitarTelaCriarPerfil,
                                AutorizacaoSet: [],
                                PerfilCentroSet: []
                            };

                            if (perfil.AutorizacaoSet && perfil.AutorizacaoSet.length) {
                                perfil.AutorizacaoSet.forEach(function (auth) {
                                    oPerfilClone.AutorizacaoSet.push({
                                        CodigoPerfil: auth.CodigoPerfil,
                                        CodigoAutorizacao: auth.CodigoAutorizacao,
                                        DescrAutorizacao: auth.DescrAutorizacao,
                                        Selecionado: auth.Selecionado
                                    });
                                });
                            }

                            if (perfil.Centros && perfil.Centros.length) {
                                perfil.Centros.forEach(function (centro) {
                                    oPerfilClone.PerfilCentroSet.push({
                                        CodigoPerfil: perfil.CodigoPerfil,
                                        DescrPerfil: perfil.DescrPerfil,
                                        CodigoCentro: centro.key,
                                        DescrCentro: centro.value
                                    });
                                });
                            }

                            oObjetoNovo.push(oPerfilClone);
                        });
                    }
                    oController.getOwnerComponent().getModel("listaPerfilModel").refresh();
                    oController.limparTabelaIndexDB("tb_perfil").then(
                        function (result) {
                            oController.gravarTabelaIndexDB("tb_perfil", oObjetoNovo).then(
                                function (result) {
                                    MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("dadossucesso"), {
                                        duration: 500,                  // default
                                        onClose: function () {
                                            if (oController.checkConnection() == true) {
                                                oController.perfilUpdate().then(
                                                    function (result) {
                                                        oController.closeBusyDialog();
                                                        oController.getRouter().navTo("ListaPerfil", {}, true /*no history*/);
                                                        oConfirmarButton.setEnabled(true);
                                                        oConfirmarButton.setBusy(false);
                                                    }).catch(
                                                        function (result) {

                                                        })
                                            } else {
                                                oController.closeBusyDialog();
                                                oController.getRouter().navTo("ListaPerfil", {}, true /*no history*/);
                                                oConfirmarButton.setEnabled(true);
                                                oConfirmarButton.setBusy(false);
                                            }

                                        }
                                    });
                                }).catch(
                                    function (result) {

                                    })
                        }).catch(
                            function (result) {

                            })
                } else {
                    oConfirmarButton.setEnabled(true);
                    oConfirmarButton.setBusy(false);
                }
            },


            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            }


        });
    });
