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
        var oController;
        var oView;
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.CriarUsuario", {
            onInit: function () {
                oController = this;
                oView = oController.getView();

                oView.bindElement("layoutTelaModel>/");
                oView.bindElement("criarUsuarioModel>/");
                oView.bindElement("listaPerfilModel>/");
                oView.bindElement("perfilCriarModel>/");

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("CriarUsuario").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {

                var oUsuarioInput = oView.byId("usuarioInput")
                var oNomeInput = oView.byId("nomeInput")
                var oSenhaInput = oView.byId("senhaInput")
                var oConfirmarInput = oView.byId("confirmarSenhaInput")
                //var oCentroInput = oView.byId("centroInput")
                var oDepositoInput = oView.byId("depositoInput")
                var oPerfilInput = oView.byId("perfilInput")

                oUsuarioInput.setValueState("None");
                oNomeInput.setValueState("None");
                oSenhaInput.setValueState("None");
                oConfirmarInput.setValueState("None");
                //oCentroInput.setValueState("None");
                //oDepositoInput.setValueState("None");
                oPerfilInput.setValueState("None");

                var oConfirmarButton = oView.byId("confirmarUsuarioButton")
                oConfirmarButton.setBusy(false);

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

                var aFilters = []
                var filter = new sap.ui.model.Filter({ path: "Selecionado", operator: sap.ui.model.FilterOperator.EQ, value1: true });
                aFilters.push(filter);
                this.getView().byId("idListaAutorizacoesTable").getBinding("items").filter(aFilters, "Application");
            },


            onNavBack: function () {
                this.getRouter().navTo("ListaUsuario", {}, true /*no history*/);
            },

            _handlePerfilValueHelpRequest: function (oEvent) {
                var oView = this.getView();
                this._sInputId = oEvent.getSource().getId();

                // create value help dialog
                if (!this._pPerfilValueHelpDialog) {
                    this._pPerfilValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.pontual.sgmr.fragment.PerfilDialog",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }

                // open value help dialog
                this._pPerfilValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                });
            },

            _handlePerfilValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter(
                    "Perfil",
                    FilterOperator.Contains, sValue
                );
                var oFilter2 = new Filter(
                    "Sincronizado",
                    FilterOperator.EQ, "N"
                );
                oEvent.getSource().getBinding("items").filter([oFilter, oFilter2]);
            },

            _handlePerfilValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");

                if (oSelectedItem) {
                    var oPerfil = oSelectedItem.getModel("listaPerfilModel").getProperty(oSelectedItem.getBindingContext("listaPerfilModel").getPath())


                    oController.getOwnerComponent().getModel("criarUsuarioModel").setProperty("/Perfil", oSelectedItem.getTitle());
                    oController.getOwnerComponent().getModel("criarUsuarioModel").setProperty("/CodigoPerfil", oPerfil.CodigoPerfil);
                    oController.getOwnerComponent().getModel("criarUsuarioModel").setProperty("/Autorizacoes", oPerfil.AutorizacaoSet);
                    oController.getOwnerComponent().getModel("criarUsuarioModel").refresh()
                    var aFilters = []
                    var filter = new sap.ui.model.Filter({ path: "Selecionado", operator: sap.ui.model.FilterOperator.EQ, value1: true });
                    aFilters.push(filter);
                    this.getView().byId("idListaAutorizacoesTable").getBinding("items").filter(aFilters, "Application");

                }

            },


            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            },

            onConfirmarUsuario: function (oEvent) {
                var aMockMessages = [];
                var vPodeGravar = true;
                var oMockMessage = {}
                var oUsuario = oController.getOwnerComponent().getModel("criarUsuarioModel").getData();
                var oUsuarioInput = oView.byId("usuarioInput")
                var oNomeInput = oView.byId("nomeInput")
                var oSenhaInput = oView.byId("senhaInput")
                var oConfirmarInput = oView.byId("confirmarSenhaInput")
                //var oCentroInput = oView.byId("centroInput")
                var oDepositoInput = oView.byId("depositoInput")
                var oPerfilInput = oView.byId("perfilInput")

                var oConfirmarButton = oView.byId("confirmarUsuarioButton")
                oConfirmarButton.setEnabled(false);
                oConfirmarButton.setBusy(true);

                if (oUsuario.Usuario == "") {
                    oUsuarioInput.setValueState("Error");
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campousuario"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("usuario"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;
                } else {
                    if (oUsuario.Sincronizado != "U") {
                        var oUsuarioExistente = oController.getOwnerComponent().getModel("listaUsuariosModel").getData().find((oElement) => oElement.CodUsuario.toUpperCase() == oUsuario.CodUsuario.toUpperCase());
                        if (oUsuarioExistente != undefined) {
                            oUsuarioInput.setValueState("Error");
                            var oMockMessage = {
                                type: 'Error',
                                title: oController.getView().getModel("i18n").getResourceBundle().getText("usuarioexistente"),
                                description: oController.getView().getModel("i18n").getResourceBundle().getText("usuarioexistentemsg"),
                                subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("usuario"),
                                counter: 1
                            };
                            aMockMessages.push(oMockMessage)
                            vPodeGravar = false;
                        }
                    }
                }
                if (oUsuario.Nome == "") {
                    oNomeInput.setValueState("Error");
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("camponome"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("nome"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;
                }

                if (oUsuario.Senha == "") {
                    oSenhaInput.setValueState("Error");
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("camposenha"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("senha"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;
                } else {
                    if (oUsuario.Senha.length < 6) {
                        oSenhaInput.setValueState("Error");
                        var oMockMessage = {
                            type: 'Error',
                            title: oController.getView().getModel("i18n").getResourceBundle().getText("tamanhoinvalido"),
                            description: oController.getView().getModel("i18n").getResourceBundle().getText("tamanhosenhainvalido"),
                            subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("senha"),
                            counter: 1
                        };
                        aMockMessages.push(oMockMessage)
                        vPodeGravar = false;
                    } else {
                        if (oUsuario.Senha != oUsuario.ConfirmarSenha) {
                            oConfirmarInput.setValueState("Error");
                            var oMockMessage = {
                                type: 'Error',
                                title: oController.getView().getModel("i18n").getResourceBundle().getText("senhasdiferentes"),
                                description: oController.getView().getModel("i18n").getResourceBundle().getText("senhasdiferentesmsg"),
                                subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("confirmarsenha"),
                                counter: 1
                            };
                            aMockMessages.push(oMockMessage)
                            vPodeGravar = false;
                        }
                    }
                }

                if (oUsuario.ConfirmarSenha == "") {
                    oConfirmarInput.setValueState("Error");
                    var oMockMessage = {
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campoconfirmarsenha"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("confirmarsenha"),
                        counter: 1
                    };
                    aMockMessages.push(oMockMessage)
                    vPodeGravar = false;
                }

                /* if (oUsuario.Centro == "") {
                    // oCentroInput.setValueState("Error");
                    // var oMockMessage = {

                    //     type: 'Error',
                    //     title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                    //     description: oController.getView().getModel("i18n").getResourceBundle().getText("campocentro"),
                    //     subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("centro"),
                    //     counter: 1
                    // };
                    // aMockMessages.push(oMockMessage)
                    // vPodeGravar = false;
                } else {
                    if (oUsuario.Centro.length < 4) {
                        oCentroInput.setValueState("Error");
                        var oMockMessage = {
                            type: 'Error',
                            title: oController.getView().getModel("i18n").getResourceBundle().getText("tamanhoinvalido"),
                            description: oController.getView().getModel("i18n").getResourceBundle().getText("tamanhocentroinvalido"),
                            subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("centro"),
                            counter: 1
                        };
                        aMockMessages.push(oMockMessage)
                        vPodeGravar = false;
                    }
                } */

                if (oUsuario.Deposito == "") {
                    // oDepositoInput.setValueState("Error");
                    // var oMockMessage = {
                    //     type: 'Error',
                    //     title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                    //     description: oController.getView().getModel("i18n").getResourceBundle().getText("campodeposito"),
                    //     subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("deposito"),
                    //     counter: 1
                    // };
                    // aMockMessages.push(oMockMessage)
                    // vPodeGravar = false;
                } else {
                    if (oUsuario.Deposito.length < 4) {
                        oDepositoInput.setValueState("Error");
                        var oMockMessage = {
                            type: 'Error',
                            title: oController.getView().getModel("i18n").getResourceBundle().getText("tamanhoinvalido"),
                            description: oController.getView().getModel("i18n").getResourceBundle().getText("tamanhodepositoinvalido"),
                            subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("deposito"),
                            counter: 1
                        };
                        aMockMessages.push(oMockMessage)
                        vPodeGravar = false;
                    }
                }

                if (oUsuario.Perfil == "") {
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
                }

                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                if (vPodeGravar) {
                    oUsuarioInput.setValueState("None");
                    oNomeInput.setValueState("None");
                    oSenhaInput.setValueState("None");
                    oConfirmarInput.setValueState("None");
                    // oCentroInput.setValueState("None");
                    // oDepositoInput.setValueState("None");
                    oPerfilInput.setValueState("None");
                    //oUsuario.Centro = oUsuario.Centro.toUpperCase();
                    oUsuario.Deposito = oUsuario.Deposito.toUpperCase();
                    oUsuario.Senha = oController.criptografar(oUsuario.Senha)
                    oUsuario.ConfirmarSenha = oController.criptografar(oUsuario.ConfirmarSenha)
                    if (oUsuario.Sincronizado != "U") {
                        if (oController.getOwnerComponent().getModel("listaUsuariosModel").getData().length == undefined) {
                            oController.getOwnerComponent().getModel("listaUsuariosModel").setData([])
                            oController.getOwnerComponent().getModel("listaUsuariosModel").getData().push(oUsuario)
                        } else {
                            oController.getOwnerComponent().getModel("listaUsuariosModel").getData().push(oUsuario)
                        }
                    } else {
                        var vIndex = oController.getOwnerComponent().getModel("listaUsuariosModel").getData().findIndex((oElement) => oUsuario.CodUsuario == oElement.CodUsuario);
                        oController.getOwnerComponent().getModel("listaUsuariosModel").getData()[vIndex] = oUsuario
                    }
                    oController.getOwnerComponent().getModel("listaUsuariosModel").refresh();
                    var oObjetoNovo = JSON.parse(JSON.stringify(oController.getOwnerComponent().getModel("listaUsuariosModel").getData()));
                    oController.limparTabelaIndexDB("tb_usuario").then(
                        function (result) {
                            oController.gravarTabelaIndexDB("tb_usuario", oObjetoNovo).then(
                                function (result) {
                                    MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("dadossucesso"), {
                                        duration: 500,                  // default
                                        onClose: function () {
                                            if (oController.checkConnection() == true) {
                                                oController.usuarioUpdate().then(
                                                    function (result) {
                                                        oController.closeBusyDialog();
                                                        oConfirmarButton.setEnabled(true);
                                                        oConfirmarButton.setBusy(false);
                                                        oController.getRouter().navTo("ListaUsuario", {}, true /*no history*/);
                                                    }).catch(
                                                        function (result) {
                                                        oConfirmarButton.setBusy(false);
                                                      oController.getRouter().navTo("ListaUsuario", {}, true /*no history*/);
                                                        })

                                            } else {
                                                oController.closeBusyDialog();
                                                oConfirmarButton.setEnabled(true);
                                                oConfirmarButton.setBusy(false);
                                                oController.getRouter().navTo("ListaUsuario", {}, true /*no history*/);

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

            onCancelarUsuario: function () {
                oController.getRouter().navTo("ListaUsuario", {}, true /*no history*/);
            }

        });
    });
