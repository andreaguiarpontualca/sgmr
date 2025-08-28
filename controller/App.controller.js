sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter) {
        "use strict";
        var oController
        var oView

        return Controller.extend("com.pontual.sgmr.controller.App", {
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
            }

        });
    });
