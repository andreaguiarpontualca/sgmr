sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator"
],
    function (Controller, formatter, JSONModel, Filter, FilterOperator) {
        "use strict";
        var oView
        var oController

        return Controller.extend("com.pontual.sgmr.controller.Componentes", {
            onInit: function () {
                oController = this;
                oController.oController = this;
                oView = oController.getView();

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oView.bindElement("materialRodanteFormularioModel>/")

            },

            onFiltroChange: function (oEvent) {

                var vCS = oEvent.getSource().getBindingContext("materialRodanteFormularioModel").getObject().ComponenteSelecionado;
                var vLS = oEvent.getSource().getBindingContext("materialRodanteFormularioModel").getObject().LadoSelecionado;
                var aFilter;

                if (vCS != "Todos" && vLS != "Ambos") {
                    aFilter = new Filter({
                        filters: [
                            new Filter("Componente", FilterOperator.EQ, vCS),
                            new Filter("Lado", FilterOperator.EQ, vLS)
                        ],
                        and: true,
                    });
                } else {
                    if (vCS == "Todos" && vLS == "Ambos") {
                        aFilter = []
                    } else {
                        if (vCS != "Todos" && vLS == "Ambos") {
                            aFilter = new Filter({
                                filters: [
                                    new Filter("Componente", FilterOperator.EQ, vCS)
                                ],
                                and: false,
                            });
                        } else {
                            aFilter = new Filter({
                                filters: [
                                    new Filter("Lado", FilterOperator.EQ, vLS)
                                ],
                                and: false,
                            });
                        }
                    }
                }

                oView.byId("idComponentesTable").getBinding("items").filter(aFilter, "Application");

            },

            onItemPress: function (oEvent) {
                var oComponenteSelecionado = oEvent.getSource().getBindingContext("materialRodanteFormularioModel").getObject()
                oController._handleExibirImagem(oComponenteSelecionado.Imagem, oComponenteSelecionado.Componente)
                //Teste
            },

            _handleExibirImagem: function (sImagem, sTitulo) {

                // Fallback caso não venha data
                if (!sImagem) {
                    sImagem = "imagem_nao_encontrada";
                }
                if (!sTitulo) {
                    sTitulo = "Imagem não encontrada";
                }
                var sSrc = "";
                if (window.location.protocol == "file:") {
                    sSrc = "file:///android_asset/www/img/" + sImagem + ".png";
                } else {
                    if (window.location.hostname == "localhost") {
                        sSrc = "/img/" + sImagem + ".png";
                    } else {
                        sSrc = "/sap/bc/ui5_ui5/sap/zsgmr/img/" + sImagem + ".png";
                    }
                }

                var oImage = new sap.m.Image({
                    src: sSrc,
                    width: "100%",
                    height: "auto",
                    decorative: false,
                    alt: sTitulo
                });

                var oDialog = new sap.m.Dialog({
                    title: sTitulo,
                    content: [oImage],
                    beginButton: new sap.m.Button({
                        text: "Fechar",
                        press: function () {
                            oDialog.close();
                        }
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    }
                });

                oDialog.open();
            }

        });
    });
