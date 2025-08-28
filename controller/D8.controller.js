sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel',
    "sap/m/Dialog",
    "sap/m/Button",
],
    function (Controller, formatter, MessagePopover, MessageItem, JSONModel, Dialog, Button) {
        "use strict";
        var oView
        var oController

        return Controller.extend("com.pontual.sgmr.controller.D8", {
            onInit: function () {
                oController = this;
                oController.oController = this;
                oView = oController.getView();

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oView.bindElement("objectPageModel>/")
                oView.bindElement("condicaoOperacaoModel>/")
                oView.bindElement("inspecaoModel>/")
                oView.bindElement("condicaoModel>/")
                oView.bindElement("materialRodanteCriarModel>/")

                var oTesteModel = {
                    country: "Brasil",
                    company: "Pontual"
                }

                oController.getOwnerComponent().getModel("objectPageModel").setData(oTesteModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("D8").attachMatched(this._handleRouteMatched, this);

            },

            _handleRouteMatched: function (oEvent) {

                var aCondicoesOperacoes = [
                    { operacao: "Umidade", status: "" },
                    { operacao: "Acúmulo", status: "" },
                    { operacao: "Abrasividade", status: "" },
                    { operacao: "Imapacto", status: "" }]
                oController.getOwnerComponent().getModel("condicaoOperacaoModel").setData(aCondicoesOperacoes);
                oController.getOwnerComponent().getModel("condicaoOperacaoModel").refresh();

                var aCondicoes = [{ key: "Baixo" }, { key: "Médio" }, { key: "Alto" }]
                oController.getOwnerComponent().getModel("condicaoModel").setData(aCondicoes);
                oController.getOwnerComponent().getModel("condicaoModel").refresh();

                var aInspecoe = [
                    { inspecao: "Conferir tensão (flecha) e passo das esteiras conforme manual do equipamento." },
                    { inspecao: "Medir a temperatura quando o equipamento estiver operando ou se estiver interrompido a operação em no máximo 20 min;" },
                    { inspecao: "Verificar parafusos/porcas das sapatas, parafusos de segmentos, das rodas motrizes, dos mancais de roletes e protetores de roletes, que estejam frouxos ou faltando; " },
                    { inspecao: "Verificar avarias e empenos nos suportes dos roletes superiores, protetores de roletes e nos suportes e alinhadores das rodas guia." }]
                oController.getOwnerComponent().getModel("inspecaoModel").setData(aInspecoe);
                oController.getOwnerComponent().getModel("inspecaoModel").refresh();

                var oMaterialModel = oController.getOwnerComponent().getModel("materialRodanteCriarModel");
                if (oMaterialModel) {
                    var oData = oMaterialModel.getData() || {};
                    if (!oData.Data) {
                        oData.Data = new Date();
                        oMaterialModel.setData(oData);
                    }
                }
            },

            _handleExibirRoleteSuperior: function (oEvent) {
                oController._handleExibirImagem()
                //Teste
            },

            _handleExibirImagem: function (oEvent) {
                var oSource = oEvent.getSource();
                // Busca os dados customizados
                var aCustomData = oSource.getCustomData();
                var sImagem = aCustomData.find(function(d){ return d.getKey() === "imagem"; })?.getValue();
                var sTitulo = aCustomData.find(function(d){ return d.getKey() === "titulo"; })?.getValue();

                // Fallback caso não venha data
                if (!sImagem) {
                    sImagem = "imagem_nao_encontrada";
                }
                if (!sTitulo) {
                    sTitulo = "Imagem não encontrada";
                }

                var sSrc = "/img/" + sImagem + ".png";

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
            },

            onPressBaixo: function (oEvent) {
                var vPath = oEvent.getSource().getBindingContext("condicaoOperacaoModel").getPath()
                var oAtividade = oEvent.getSource().getBindingContext("condicaoOperacaoModel").getModel().getProperty(vPath);
                oAtividade.Status = "B";
                oEvent.getSource().getBindingContext("condicaoOperacaoModel").getModel().setProperty(vPath, oAtividade);
                oController.getView().getModel("condicaoOperacaoModel").refresh()
                oController.onStatusChange(oEvent)
            },

            onPressMedio: function (oEvent) {
                var vPath = oEvent.getSource().getBindingContext("condicaoOperacaoModel").getPath()
                var oAtividade = oEvent.getSource().getBindingContext("condicaoOperacaoModel").getModel().getProperty(vPath);
                oAtividade.Status = "M";
                oEvent.getSource().getBindingContext("condicaoOperacaoModel").getModel().setProperty(vPath, oAtividade);
                oController.getView().getModel("condicaoOperacaoModel").refresh()
                oController.onStatusChange(oEvent)
            },

            onPressAlto: function (oEvent) {
                var vPath = oEvent.getSource().getBindingContext("condicaoOperacaoModel").getPath()
                var oAtividade = oEvent.getSource().getBindingContext("condicaoOperacaoModel").getModel().getProperty(vPath);
                oAtividade.Status = "A";
                oEvent.getSource().getBindingContext("condicaoOperacaoModel").getModel().setProperty(vPath, oAtividade);
                oController.getView().getModel("condicaoOperacaoModel").refresh()
                oController.onStatusChange(oEvent)
            },

            onNavBack: function () {
                this.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);
            }

        });
    });
