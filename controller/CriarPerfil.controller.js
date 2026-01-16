sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    'sap/ui/model/Filter',
    'sap/ui/core/Fragment',
    'sap/m/MessageToast'
],
    function (Controller, Filter, Fragment, MessageToast) {
        "use strict";
        var oController
        var oView

        return Controller.extend("com.pontual.sgmr.controller.CriarPerfil", {
            onInit: function () {
                oController = this;
                oView = oController.getView();
                this.getView().addStyleClass("sapUiSizeCompact");

                oView.bindElement("perfilCriarModel>/");

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("CriarPerfil").attachMatched(this._handleRouteMatched, this);
            },


            _handleRouteMatched: function (oEvent) {
                this.limparMensagens();

                var oPerfilInput     = oView.byId("perfilInput")
                var oConfirmarButton = oView.byId("confirmarPerfilButton")

                oPerfilInput.setValueState("None");
                oConfirmarButton.setBusy(false);

                var oPerfil = oController.getOwnerComponent().getModel("perfilCriarModel").getData();
                if (oPerfil.AutorizacaoSet != undefined) {
                    oPerfil.AutorizacaoSet.forEach(element => {
                        element.Selecionado = false
                    });
                }
                oController.getOwnerComponent().getModel("perfilCriarModel").refresh();

                var oPerfil = oController.getOwnerComponent().getModel("perfilCriarModel").getData();
                if (oPerfil && oPerfil.PerfilCentroSet && oPerfil.PerfilCentroSet.length) {
                    var aTokens = oPerfil.PerfilCentroSet.map(function (pc) {
                        return { key: pc.Centro, value: pc.DescrCentro };
                    });
                    oController.getOwnerComponent().getModel("perfilCriarModel").setProperty("/Centros", aTokens);
                }
            },


            onNavBack: function () {
                this.getRouter().navTo("ListaPerfil", {}, true);
            },

            onCancelarPerfil: function () {
                this.getRouter().navTo("ListaPerfil", {}, true);
            },

            handleTokenUpdate: function (oEvent) {
                var sType = oEvent.getParameter("type"); // "added" | "removed"
                var aAdded = oEvent.getParameter("addedTokens") || [];
                var aRemoved = oEvent.getParameter("removedTokens") || [];

                var oPerfilModel = oController.getOwnerComponent().getModel("perfilCriarModel");
                var aCentrosSel = oPerfilModel.getProperty("/Centros") || [];

                var oListaModel = oController.getOwnerComponent().getModel("listaCentrosModel");
                var aLista = (oListaModel && oListaModel.getData()) || [];

                if (sType === "removed") {
                    aRemoved.forEach(function (oTok) {
                        var sKey = oTok.getProperty("key") || oTok.getKey() || oTok.getText();
                        aCentrosSel = aCentrosSel.filter(function (it) { return it.key !== sKey; });
                        var idx = aLista.findIndex(function (x) { return x.Werks === sKey; });
                        if (idx > -1) {
                            aLista[idx].Selected = false;
                        }
                    });
                }

                if (sType === "added") {
                    aAdded.forEach(function (oTok) {
                        var sKey = oTok.getProperty("key") || oTok.getKey() || oTok.getText();
                        var sText = oTok.getText();
                        if (!aCentrosSel.some(function (x) { return x.key === sKey; })) {
                            aCentrosSel.push({ key: sKey, value: sText }); // se for custom, value = texto
                        }
                        var idx = aLista.findIndex(function (x) { return x.Werks === sKey; });
                        if (idx > -1) {
                            aLista[idx].Selected = true;
                        }
                    });
                }

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
                    var aCentrosSelecionados = oController.getOwnerComponent().getModel("perfilCriarModel").getProperty("/Centros") || [];
                    var aListaCentros = oController.getOwnerComponent().getModel("listaCentrosModel").getData();

                    if (aListaCentros && aCentrosSelecionados.length > 0) {
                        aListaCentros.forEach(function (centro) {
                            var centroSelecionado = aCentrosSelecionados.find(item => item.key === centro.Werks);
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

            _handleValueHelpCloseCentro: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems") || [];
                var oPerfilModel = oController.getOwnerComponent().getModel("perfilCriarModel");
                var aAtuais = oPerfilModel.getProperty("/Centros") || [];
                var oListaModel = oController.getOwnerComponent().getModel("listaCentrosModel");
                var aLista = (oListaModel && oListaModel.getData()) || [];

                aSelectedItems.forEach(function (element) {
                    var vKey = element.getProperty("title");
                    var vValue = element.getProperty("description");
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
                this.limparMensagens();

                var vPodeGravar      = true;
                var oPerfil          = oController.getOwnerComponent().getModel("perfilCriarModel").getData();
                var oPerfilInput     = oView.byId("perfilInput");
                var oConfirmarButton = oView.byId("confirmarPerfilButton");
                oConfirmarButton.setEnabled(false);
                oConfirmarButton.setBusy(true);

                if (oPerfil.DescrPerfil == "") {
                    oPerfilInput.setValueState("Error");
                    const title       = oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio");
                    const subtitle    = oController.getView().getModel("i18n").getResourceBundle().getText("perfil");
                    const description = oController.getView().getModel("i18n").getResourceBundle().getText("campoperfil");
                    oController.adicionarMensagemErro(title, subtitle, description);
                    vPodeGravar = false;

                } else {
                    if (oController.getOwnerComponent().getModel("listaPerfilModel").getData().length != undefined) {
                        var oPerfilExistente = oController.getOwnerComponent().getModel("listaPerfilModel").getData().find((oElement) => oElement.DescrPerfil.toUpperCase() == oPerfil.DescrPerfil.toUpperCase());
                        if (oPerfilExistente != undefined) {
                            oPerfilInput.setValueState("Error");
                            const title       = oController.getView().getModel("i18n").getResourceBundle().getText("perfilexistente");
                            const subtitle    = oController.getView().getModel("i18n").getResourceBundle().getText("perfil");
                            const description = oController.getView().getModel("i18n").getResourceBundle().getText("perfilexistentemsg");
                            oController.adicionarMensagemErro(title, subtitle, description);
                            vPodeGravar = false;
                        }
                    }
                }

                if (oController.getOwnerComponent().getModel("perfilCriarModel").getData().Centros == undefined || oController.getOwnerComponent().getModel("perfilCriarModel").getData().Centros.length == 0) {
                    const title       = oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio");
                    const subtitle    = oController.getView().getModel("i18n").getResourceBundle().getText("centro");
                    const description = oController.getView().getModel("i18n").getResourceBundle().getText("campocentro");
                    oController.adicionarMensagemErro(title, subtitle, description);
                    vPodeGravar = false;
                }

                var vAutorizacoes = oPerfil.AutorizacaoSet.find((oOperacao) => oOperacao.Selecionado == true);
                if (vAutorizacoes == undefined) {
                    const title       = oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio");
                    const subtitle    = oController.getView().getModel("i18n").getResourceBundle().getText("autorizacao");
                    const description = oController.getView().getModel("i18n").getResourceBundle().getText("campoautorizacao");
                    oController.adicionarMensagemErro(title, subtitle, description);
                    vPodeGravar = false;
                }

                if (vPodeGravar == true) {
                    oPerfilInput.setValueState("None");
                    if (oController.getOwnerComponent().getModel("listaPerfilModel").getData().length == undefined) {
                        oController.getOwnerComponent().getModel("listaPerfilModel").setData([])
                        oController.getOwnerComponent().getModel("listaPerfilModel").getData().push(oPerfil)
                    } else {
                        oController.getOwnerComponent().getModel("listaPerfilModel").getData().push(oPerfil)
                    }

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
                    oController.limparTabelaIndexDB("tb_perfil")
                    .then( () => {
                        oController.gravarTabelaIndexDB("tb_perfil", oObjetoNovo)
                        .then( () => {
                            MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("dadossucesso"), {
                                onClose: function () {
                                    if (oController.checkConnection() == true) {
                                        oController.perfilUpdate()
                                        .then( () => {
                                            oController.closeBusyDialog();
                                            oController.getRouter().navTo("ListaPerfil", {}, true);
                                            oConfirmarButton.setEnabled(true);
                                            oConfirmarButton.setBusy(false);
                                        });
                                    } else {
                                        oController.closeBusyDialog();
                                        oController.getRouter().navTo("ListaPerfil", {}, true);
                                        oConfirmarButton.setEnabled(true);
                                        oConfirmarButton.setBusy(false);
                                    }
                                }
                            });
                        })
                    })
                } else {
                    oConfirmarButton.setEnabled(true);
                    oConfirmarButton.setBusy(false);
                }
            }
        });
    });
