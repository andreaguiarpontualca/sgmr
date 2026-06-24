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
                this.getView().addStyleClass("sapUiSizeCompact");

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
                this.limparMensagens();

                var oUsuarioInput   = oView.byId("usuarioInput");
                var oNomeInput      = oView.byId("nomeInput");
                var oSenhaInput     = oView.byId("senhaInput");
                var oConfirmarInput = oView.byId("confirmarSenhaInput");
                var oPerfilInput    = oView.byId("perfilInput");

                oUsuarioInput.setValueState("None");
                oNomeInput.setValueState("None");
                oSenhaInput.setValueState("None");
                oConfirmarInput.setValueState("None");
                oPerfilInput.setValueState("None");

                var oConfirmarButton = oView.byId("confirmarUsuarioButton");
                oConfirmarButton.setBusy(false);

                const aFilters = [];
                const filter   = new sap.ui.model.Filter({ path: "Selecionado", operator: sap.ui.model.FilterOperator.EQ, value1: true });
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


                    oController.getOwnerComponent().getModel("criarUsuarioModel").setProperty("/Perfil", oSelectedItem.getTitle().split("-")[1].trim());
                    oController.getOwnerComponent().getModel("criarUsuarioModel").setProperty("/CodigoPerfil", oPerfil.CodigoPerfil);
                    oController.getOwnerComponent().getModel("criarUsuarioModel").setProperty("/Autorizacoes", oPerfil.AutorizacaoSet);
                    oController.getOwnerComponent().getModel("criarUsuarioModel").refresh()
                    var aFilters = []
                    var filter = new sap.ui.model.Filter({ path: "Selecionado", operator: sap.ui.model.FilterOperator.EQ, value1: true });
                    aFilters.push(filter);
                    this.getView().byId("idListaAutorizacoesTable").getBinding("items").filter(aFilters, "Application");
                }
            },

            onConfirmarUsuario: function (oEvent) {
                this.limparMensagens();
                var aMockMessages   = [];
                var vPodeGravar     = true;
                var oUsuario        = oController.getOwnerComponent().getModel("criarUsuarioModel").getData();
                var oUsuarioInput   = oView.byId("usuarioInput");
                var oNomeInput      = oView.byId("nomeInput");
                var oSenhaInput     = oView.byId("senhaInput");
                var oConfirmarInput = oView.byId("confirmarSenhaInput");
                var oDepositoInput  = oView.byId("depositoInput");
                var oPerfilInput    = oView.byId("perfilInput");

                var oConfirmarButton = oView.byId("confirmarUsuarioButton");
                oConfirmarButton.setEnabled(false);
                oConfirmarButton.setBusy(true);

                oUsuarioInput.setValueState("None");
                oNomeInput.setValueState("None");
                oSenhaInput.setValueState("None");
                oConfirmarInput.setValueState("None");
                oPerfilInput.setValueState("None");

                if (oUsuario.CodUsuario == "") {
                    oUsuarioInput.setValueState("Error");
                    oController.adicionarMensagemErro("campoobrigatorio", "usuario", "usuario");
                    vPodeGravar = false;
                } else {
                    if (oUsuario.Sincronizado != "U") {
                        var oUsuarioExistente = oController.getOwnerComponent().getModel("listaUsuariosModel").getData().find((oElement) => oElement.CodUsuario.toUpperCase() == oUsuario.CodUsuario.toUpperCase());
                        if (oUsuarioExistente != undefined) {
                            oUsuarioInput.setValueState("Error");
                            oController.adicionarMensagemErro("usuarioexistente", "usuario", "usuarioexistentemsg");
                            vPodeGravar = false;
                        }
                    }
                }
                if (oUsuario.Nome == "") {
                    oNomeInput.setValueState("Error");
                    oController.adicionarMensagemErro("campoobrigatorio", "nome", "camponome");
                    vPodeGravar = false;
                }

                if (oUsuario.Senha == "") {
                    oSenhaInput.setValueState("Error");
                    oController.adicionarMensagemErro("campoobrigatorio", "senha", "camposenha");
                    vPodeGravar = false;
                } else {
                    if (oUsuario.Senha.length < 6) {
                        oSenhaInput.setValueState("Error");
                        oController.adicionarMensagemErro("tamanhoinvalido", "senha", "tamanhosenhainvalido");
                        vPodeGravar = false;
                    } else {
                        if (oUsuario.Senha != oUsuario.ConfirmarSenha) {
                            oConfirmarInput.setValueState("Error");
                            oController.adicionarMensagemErro("senhasdiferentes", "confirmarsenha", "senhasdiferentesmsg");
                            vPodeGravar = false;
                        }
                    }
                }

                if (oUsuario.ConfirmarSenha == "") {
                    oConfirmarInput.setValueState("Error");
                    oController.adicionarMensagemErro("campoobrigatorio", "confirmarsenha", "campoconfirmarsenha");
                    vPodeGravar = false;
                }

                if (oUsuario.Deposito !== "") {
                    if (oUsuario.Deposito.length < 4) {
                        oDepositoInput.setValueState("Error");
                        oController.adicionarMensagemErro("tamanhoinvalido", "deposito", "tamanhodepositoinvalido");
                        vPodeGravar = false;
                    }
                }

                if (oUsuario.Perfil == "") {
                    oPerfilInput.setValueState("Error");
                    oController.adicionarMensagemErro("campoobrigatorio", "perfil", "campoperfil");
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
                    oPerfilInput.setValueState("None");
                    oUsuario.Deposito       = oUsuario.Deposito.toUpperCase();
                    oUsuario.Senha          = oController.criptografar(oUsuario.Senha)
                    oUsuario.ConfirmarSenha = oController.criptografar(oUsuario.ConfirmarSenha)
                    if (oUsuario.Sincronizado != "U") {
                        if (oController.getOwnerComponent().getModel("listaUsuariosModel").getData().length == undefined) {
                            oController.getOwnerComponent().getModel("listaUsuariosModel").setData([]);
                            oController.getOwnerComponent().getModel("listaUsuariosModel").getData().push(oUsuario);
                        } else {
                            oController.getOwnerComponent().getModel("listaUsuariosModel").getData().push(oUsuario);
                        }
                    } else {
                        var vIndex = oController.getOwnerComponent().getModel("listaUsuariosModel").getData().findIndex((oElement) => oUsuario.CodUsuario == oElement.CodUsuario);
                        oController.getOwnerComponent().getModel("listaUsuariosModel").getData()[vIndex] = oUsuario;
                    }
                    oController.getOwnerComponent().getModel("listaUsuariosModel").refresh();
                    var oObjetoNovo = JSON.parse(JSON.stringify(oController.getOwnerComponent().getModel("listaUsuariosModel").getData()));
                    oController.limparTabelaIndexDB("tb_usuario")
                    .then(() => {
                        oController.gravarTabelaIndexDB("tb_usuario", oObjetoNovo)
                        .then(() => {
                            MessageToast.show(oController.i18n("dadossucesso"), {
                                duration: 500,
                                onClose: function () {
                                    if (oController.checkConnection() == true) {
                                        oController.usuarioUpdate()
                                        .then(() => {
                                            oController.closeBusyDialog();
                                            oConfirmarButton.setEnabled(true);
                                            oConfirmarButton.setBusy(false);
                                            oController.getRouter().navTo("ListaUsuario", {}, true);
                                        }).catch(() => {
                                            oConfirmarButton.setBusy(false);
                                            oController.getRouter().navTo("ListaUsuario", {}, true);
                                        });
                                    } else {
                                        oController.closeBusyDialog();
                                        oConfirmarButton.setEnabled(true);
                                        oConfirmarButton.setBusy(false);
                                        oController.getRouter().navTo("ListaUsuario", {}, true);
                                    }
                                }
                            });
                        });
                    });
                } else {
                    oConfirmarButton.setEnabled(true);
                    oConfirmarButton.setBusy(false);
                }
            },

            onCancelarUsuario: function () {
                oController.getRouter().navTo("ListaUsuario", {}, true);
            }

        });
    });
