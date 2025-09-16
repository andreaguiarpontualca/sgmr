sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessageToast',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageBox"
],
    function (Controller, formatter, MessageToast, MessagePopover, MessageItem, JSONModel, MessageBox) {
        "use strict";
        var oController
        var oView
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.ListaUsuario", {
            onInit: function () {
                oController = this;
                oView = oController.getView();

                oView.bindElement("listaUsuariosModel>/");
                oView.bindElement("layoutTelaModel>/");
                oView.bindElement("busyDialogModel>/")

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("ListaUsuario").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {

                var aFilters = []
                var filter = new sap.ui.model.Filter({ path: "Sincronizado", operator: sap.ui.model.FilterOperator.NE, value1: "E" });
                aFilters.push(filter);
                this.getView().byId("idListaUsuarioTable").getBinding("items").filter(aFilters, "Application");

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


            onNavBack: function () {
                this.getRouter().navTo("Administrativo", {}, true /*no history*/);
            },


            onExcluirUsuario: function (oEvent) {
                var oUsuario = oEvent.getSource().getBindingContext("listaUsuariosModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaUsuariosModel").getPath());
                MessageBox.warning(
                    "Tem certeza que deseja remover o usuário" + " " + oUsuario.Nome + " " + "?",
                    {
                        icon: MessageBox.Icon.WARNING,
                        actions: ["Remover", MessageBox.Action.CANCEL],
                        emphasizedAction: "Remover",
                        styleClass: "sapMUSTRemovePopoverContainer",
                        initialFocus: MessageBox.Action.CANCEL,
                        onClose: function (sAction) {
                            if (sAction !== "Remover") {
                                return;
                            } else {
                                oUsuario.Sincronizado = "E"
                                oController.getOwnerComponent().getModel("listaUsuariosModel").refresh()
                                oController.limparTabelaIndexDB("tb_usuario").then(
                                    function (result) {
                                        oController.gravarTabelaIndexDB("tb_usuario", oController.getOwnerComponent().getModel("listaUsuariosModel").getData()).then(
                                            function (result) {
                                                MessageToast.show("Usuário marcado para eliminação.");
                                                if (oController.checkConnection() == true) {
                                                    oController.usuarioUpdate().then(
                                                        function (result) {
                                                            MessageToast.show("Perfil eliminado com sucesso");
                                                            var aMensagens = oController.getOwnerComponent().getModel("mensagensModel").getData();
                                                            oController.getView().getModel().setData(aMensagens);
                                                            oController.getView().getModel().refresh()
                                                        }).catch(
                                                            function (result) {
                                                            })

                                                } else {
                                                    oController.getRouter().navTo("ListaUsuario", {}, true /*no history*/);
                                                }
                                            }).catch(
                                                function (result) {

                                                })
                                    }).catch(
                                        function (result) {

                                        })
                            }

                        }
                    }
                );

            },

            onEditarUsuario: function (oEvent) {
                var oUsuario = oEvent.getSource().getBindingContext("listaUsuariosModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaUsuariosModel").getPath());
                var oUsuario = JSON.parse(JSON.stringify(oUsuario));
                oUsuario.Sincronizado = "U"
                oUsuario.Senha = oController.descriptografar(oUsuario.Senha)
                oUsuario.ConfirmarSenha = oUsuario.Senha
                
                // Garantir que Bloqueado seja sempre boolean para o Switch
                if (oUsuario.Bloqueado === "X" || oUsuario.Bloqueado === true) {
                    oUsuario.Bloqueado = true;
                } else {
                    oUsuario.Bloqueado = false;
                }
                
                oController.getOwnerComponent().getModel("criarUsuarioModel").setData(oUsuario);
                oController.getOwnerComponent().getModel("layoutTelaModel").setProperty("/HabilitarEditarUsuario", false);
                oController.getOwnerComponent().getModel("layoutTelaModel").setProperty("/HabilitarTelaCriarUsuario", true);
                oController.getOwnerComponent().getRouter().navTo("CriarUsuario", null, true);
            },

            onExibirUsuario: function (oEvent) {
                var oUsuario = oEvent.getSource().getBindingContext("listaUsuariosModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaUsuariosModel").getPath());               
                var oUsuario = JSON.parse(JSON.stringify(oUsuario));
                oUsuario.Senha = oController.descriptografar(oUsuario.Senha)
                oUsuario.ConfirmarSenha = oUsuario.Senha
                
                // Garantir que Bloqueado seja sempre boolean para o Switch
                if (oUsuario.Bloqueado === "X" || oUsuario.Bloqueado === true) {
                    oUsuario.Bloqueado = true;
                } else {
                    oUsuario.Bloqueado = false;
                }
                
                oController.getOwnerComponent().getModel("criarUsuarioModel").setData(oUsuario);
                oController.getOwnerComponent().getModel("layoutTelaModel").setProperty("/HabilitarEditarUsuario", false);
                oController.getOwnerComponent().getModel("layoutTelaModel").setProperty("/HabilitarTelaCriarUsuario", false);
                oController.getOwnerComponent().getRouter().navTo("CriarUsuario", null, true);
            },

            onCriarUsuario: function (oEvent) {

                var oUsuario = {
                    CodUsuario: "",
                    Nome: "",
                    Senha: "",
                    ConfirmarSenha: "",
                    Centro: "",
                    Deposito: "DPLU",
                    Perfil: "",
                    CodigoPerfil: "",
                    Sincronizado: "N",
                    Bloqueado: false,
                    Tipomensagem: "",
                    Mensagem: "",
                    Autorizacoes: []
                }

                // var listaAutorizacao = oController.getOwnerComponent().getModel("listaAutorizacaoModel").getData()

                // listaAutorizacao.forEach(element => {
                //     element.Selecionado = false
                //     oUsuario.Autorizacoes.push(element)

                // });

                oController.getOwnerComponent().getModel("criarUsuarioModel").setData(oUsuario);
                oController.getOwnerComponent().getModel("layoutTelaModel").setProperty("/HabilitarEditarUsuario", true);
                oController.getOwnerComponent().getModel("layoutTelaModel").setProperty("/HabilitarTelaCriarUsuario", true);
                oController.getOwnerComponent().getRouter().navTo("CriarUsuario", null, true);
            },

            onSincronizar: function (oEvent) {
                oController.onSincronizarGeral(oController, false)

            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            }

        });
    });
