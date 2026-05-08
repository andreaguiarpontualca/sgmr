sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    'sap/m/MessageToast',
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel'
],
    function (Controller, MessageToast, MessagePopover, MessageItem, JSONModel) {
        "use strict";
        var oController
        var oView
        var oMessagePopover;
        var aMockMessages;

        return Controller.extend("com.pontual.sgmr.controller.Configurar", {
            onInit: function () {
                oController = this;
                oView = oController.getView();
                this.getView().addStyleClass("sapUiSizeCompact");

                oView.bindElement("configurarModel>/")
                oView.bindElement("busyDialogModel>/")

                var oMessageTemplate = new MessageItem({
                    type        : '{type}',
                    title       : '{title}',
                    activeTitle : "{active}",
                    description : '{description}',
                    subtitle    : '{subtitle}',
                    counter     : '{counter}'
                });

                oMessagePopover = new MessagePopover({
                    items            : { path: '/', template: oMessageTemplate },
                    activeTitlePress : () => MessageToast.show('Active title is pressed')
                });

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);
                this.byId("messagePopoverBtn").addDependent(oMessagePopover);

                oController._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oController._oRouter.getRoute("Configurar").attachMatched(this._handleRouteMatched, this);
            },

            _handleRouteMatched: function (oEvent) {
                this.limparMensagens();
                aMockMessages = [];
                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                var oHostInput = oView.byId("hostInput")
                oHostInput.setValueState("None");

                var oConfigurar = oController.lerLocalStorage("SGMR_DadosConexao")
                if (!oConfigurar) {
                    oConfigurar = {
                        protocolo    : 1,
                        host         : "",
                        porta        : "",
                        cliente      : "",
                        url          : "",
                        urlsemclient : "",
                        verificarDisponibilidade: true,
                        exibirMensagemSincAuto: true
                    }
                }
                oController.getOwnerComponent().getModel("configurarModel").setData(oConfigurar);
            },

            onNavBack: function () {
                this.getRouter().navTo("Login", {}, true /*no history*/);
            },

            onConfirmar: function () {

                this.limparMensagens();

                var oConexao = oController.getOwnerComponent().getModel("configurarModel").getData()
                oConexao.host = oConexao.host.trim();

                if (oConexao.host) {
                    var vProtocolo = (oConexao.protocolo == 1) ? "https://" : "http://";
                    oConexao.url   = vProtocolo + oConexao.host

                    if (oConexao.porta != "") {
                        oConexao.url = oConexao.url + ":" + oConexao.porta;
                    }

                    oConexao.urlsemclient = oConexao.url

                    if (oConexao.cliente != "") {
                        oConexao.url = oConexao.url + "/sap-client=" + oConexao.cliente
                    }

                    oController.gravarLocalStorage("SGMR_DadosConexao", oConexao)
                    oController.getOwnerComponent().getModel("configurarModel").setData(oConexao)
                    oController.getOwnerComponent().getModel("configurarModel").refresh()

                    MessageToast.show(oController.i18n("msgdadosconexao"), {
                        duration: 1000,
                        onClose: function() {
                            oController.getRouter().navTo("Login", {}, true /*no history*/)                            
                        }
                    });

                    oController.adicionarMensagemSucesso("gravacaosucesso", "dadossucesso", "dadosconexao");
                } else {
                    var oHostInput = oView.byId("hostInput")
                    oHostInput.setValueState("Error");
                    oController.adicionarMensagemErro("campoobrigatorio", "campohost", "host");
                }
            },

            onCancelar: function () {
                oController.getRouter().navTo("Login", {}, true /*no history*/)
            },

            onTestar: function () {
                oController.limparMensagens();
                var oConexao = oController.getOwnerComponent().getModel("configurarModel").getData()
                if (oController.checkConnection() == true) {
                    if (oConexao.url) {
                        oController.openBusyDialog();
                        oController.atualizarBusyDialog("Tentando conexão com o endereço " + oConexao.url);

                        fetch(oConexao.urlsemclient, { mode: 'no-cors' }).then(r => {
                            const msgSucesso = oController.i18n("mensagem.conexao.sucesso", [oConexao.urlsemclient])
                            oController.atualizarBusyDialog(msgSucesso);
                            MessageToast.show(msgSucesso, { duration: 3000, onClose: "" });
                            oController.closeBusyDialog();

                            oController.adicionarMensagemSucesso("testesucesso", "sucessoservidor", msgSucesso);
                        }).catch(e => {
                            const msgErro = oController.i18n("mensagem.conexao.erro", [oConexao.urlsemclient]);
                            oController.atualizarBusyDialog(msgErro);
                            MessageToast.show(msgErro, { duration: 3000, onClose: "" });
                            oController.closeBusyDialog();
                            oController.adicionarMensagemErro("testeerro", msgErro, e);
                        });
                    } else {
                        MessageToast.show(oController.i18n("graveosdadosantestestar"), { duration: 3000, onClose: ""});
                    }
                } else {
                    MessageToast.show(oController.i18n("conexaosem"), { duration: 3000, onClose: "" });
                    oController.adicionarMensagemErro("testeerro", "conexaosem", "mensagem.conexao.erro.wifi");
                }
            }
        });
    });
