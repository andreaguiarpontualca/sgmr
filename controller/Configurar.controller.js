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
        var oController
        var oView
        var oMessagePopover;
        var aMockMessages;

        return Controller.extend("com.pontual.sgmr.controller.Configurar", {
            onInit: function () {
                oController = this;
                oView = oController.getView();

                oView.bindElement("configurarModel>/")
                oView.bindElement("busyDialogModel>/")


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

                oController._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oController._oRouter.getRoute("Configurar").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {

                aMockMessages = [];
                var oModel = new JSONModel();
                oModel.setData(aMockMessages);
                this.getView().setModel(oModel);

                var oHostInput = oView.byId("hostInput")
                oHostInput.setValueState("None");

                var oConfigurar = oController.lerLocalStorage("SGMR_DadosConexao")
                if (!oConfigurar) {
                    oConfigurar = {
                        protocolo: 1,
                        host: "",
                        porta: "",
                        cliente: "",
                        url: "",
                        urlsemclient: "",
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

                var oConexao = oController.getOwnerComponent().getModel("configurarModel").getData()
                oConexao.host = oConexao.host.trim();

                if (oConexao.host) {
                    var vProtocolo
                    if (oConexao.protocolo == 1) {
                        vProtocolo = "https://"
                    } else {
                        vProtocolo = "http://"
                    }
                    oConexao.url = vProtocolo + oConexao.host

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

                    MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("msgdadosconexao"), {
                        duration: 1000,
                        onClose: function() {
                            oController.getRouter().navTo("Login", {}, true /*no history*/)                            
                        }
                    });



                    var aMockMessages = [{
                        type: 'Success',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("gravacaosucesso"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("dadossucesso"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("dadosconexao"),
                        counter: 1
                    }];

                    var oModel = new JSONModel();
                    oModel.setData(aMockMessages);
                    this.getView().setModel(oModel);


                } else {
                    var oHostInput = oView.byId("hostInput")
                    oHostInput.setValueState("Error");
                    var aMockMessages = [{
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("campoobrigatorio"),
                        description: oController.getView().getModel("i18n").getResourceBundle().getText("campohost"),
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("host"),
                        counter: 1
                    }];

                    var oModel = new JSONModel();
                    oModel.setData(aMockMessages);
                    this.getView().setModel(oModel);
                }
            },

            onCancelar: function () {
                oController.getRouter().navTo("Login", {}, true /*no history*/)
            },

            onTestar: function () {
                var oConexao = oController.getOwnerComponent().getModel("configurarModel").getData()

                if (oController.checkConnection() == true) {
                    if (oConexao.url) {
                        oController.openBusyDialog();
                        oController.atualizarBusyDialog("Tentando conexão com o endereço " + oConexao.url);

                        fetch(oConexao.urlsemclient, { mode: 'no-cors' }).then(r => {
                            oController.atualizarBusyDialog("Conexão com o endereço " + oConexao.urlsemclient + " estabelecida com sucesso");
                            MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("Conexão com o endereço " + oConexao.urlsemclient + " estabelecida com sucesso"), {
                                duration: 3000,                  // default
                                onClose: ""
                            });
                            oController.closeBusyDialog();

                            var aMockMessages = [{
                                type: 'Success',
                                title: oController.getView().getModel("i18n").getResourceBundle().getText("testesucesso"),
                                description: "Conexão com o endereço " + oConexao.urlsemclient + " estabelecida com sucesso",
                                subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaosucesso"),
                                counter: 1
                            }];

                            var oModel = new JSONModel();
                            oModel.setData(aMockMessages);
                            this.getView().setModel(oModel);

                        })
                            .catch(e => {
                                oController.atualizarBusyDialog("Não foi possível alcançar o endereço " + oConexao.urlsemclient + "informado");
                                MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("Não foi possível alcançar o endereço " + oConexao.urlsemclient + " informado"), {
                                    duration: 3000,                  // default
                                    onClose: ""
                                });
                                oController.closeBusyDialog();

                                var aMockMessages = [{
                                    type: 'Error',
                                    title: oController.getView().getModel("i18n").getResourceBundle().getText("testeerro"),
                                    description: "Não foi possível alcançar o endereço " + oConexao.urlsemclient + " informado.",
                                    subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaoerro"),
                                    counter: 1
                                }];

                                var oModel = new JSONModel();
                                oModel.setData(aMockMessages);
                                this.getView().setModel(oModel);

                            });
                    } else {
                        MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("graveosdadosantestestar"), {
                            duration: 3000,                  // default
                            onClose: ""
                        });

                    }
                } else {
                    MessageToast.show(oController.getView().getModel("i18n").getResourceBundle().getText("conexaosem"), {
                        duration: 3000,                  // default
                        onClose: ""
                    });

                    var aMockMessages = [{
                        type: 'Error',
                        title: oController.getView().getModel("i18n").getResourceBundle().getText("testeerro"),
                        description: "Por favor verifque a disponibilidade de rede ou wi-fi.",
                        subtitle: oController.getView().getModel("i18n").getResourceBundle().getText("conexaosem"),
                        counter: 1
                    }];

                    var oModel = new JSONModel();
                    oModel.setData(aMockMessages);
                    this.getView().setModel(oModel);
                }
            },


            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            }


        });
    });
