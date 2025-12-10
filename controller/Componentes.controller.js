sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator",
    'sap/m/MessageToast'
],
    function (Controller, formatter, JSONModel, Filter, FilterOperator, MessageToast) {
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

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Formulario").attachMatched(this._handleRouteMatched, this);

            },

            _handleRouteMatched: function (oEvent) {
                var oTable = this.byId("idComponentesTable"); // Get the table instance
                var oBinding = oTable.getBinding("items"); // Get the items binding

                // Clear all filters applied to the binding
                if (oBinding) {
                    oBinding.filter([]);
                }
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
            },

            onValidarMedicao: function (oEvent) {
                var vPath = oEvent.getSource().getBindingContext("materialRodanteFormularioModel").getPath()
                var oComponente = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getProperty(vPath)
                var vValorMedido = parseFloat(oComponente.Valormedido)
                var vUltValormedido = parseFloat(oComponente.UltValormedido)
                var vValido = true
                if (oComponente.Ordenacao == "D" && vValorMedido > vUltValormedido) {
                    oEvent.getSource().setValueState("Error")
                    oEvent.getSource().setValueStateText("Valor informado maior que último valor médido")
                    //                    MessageToast.show("Valor informado maior que último valor médido");
                    vValido = false
                }
                if (oComponente.Ordenacao == "C" && vValorMedido < vUltValormedido) {
                    oEvent.getSource().setValueState("Error")
                    oEvent.getSource().setValueStateText("Valor informado menor que último valor médido")
                    //                    MessageToast.show("Valor informado menor que último valor médido");
                    vValido = false
                }
                if (vValido) {
                    var vCorPercentualDesgaste = oController.corPercentualDesgaste(oComponente)
                    oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty(vPath + '/PercDesgasteValueState', vCorPercentualDesgaste)
                    var vPercentualDesgaste = oController.calcularPercentualDesgaste(oComponente)
                    oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty(vPath + '/PercDesgaste', vPercentualDesgaste)
                    oController.getOwnerComponent().getModel("materialRodanteFormularioModel").refresh()
                }
            },

            corPercentualDesgaste: function (oComponente) {
                var aListaDesgaste = oController.getOwnerComponent().getModel("listaDesgastesModel").getData()
                var vValorMedido = oController.arredondarPara05(oComponente.Valormedido)
                var oDesgaste = aListaDesgaste.find(c => c.CodiFabr == oComponente.CodiFabr &&
                    c.Componente == oComponente.IdComponente &&
                    c.TipoEquipamento == oComponente.ModEquip &&
                    c.MedidaMm == vValorMedido);
                if (oDesgaste == undefined) {
                    return "Indication05"
                } else {
                    switch (oDesgaste.Alerta) {
                        case 'BAIXO':
                            return 'Indication04' //Verde
                        case 'MEDIO':
                            return 'Indication03' //Amarelo           
                        case 'ALTO':
                            return 'Indication02'//Vermelho                 
                        default:
                            return "Indication05"
                    }
                }
            },

            arredondarPara05: function (numero) {
                return Math.round(numero * 2) / 2;
            },

            calcularPercentualDesgaste: function (oComponente) {
                const oDesgaste      = oController.obtemLimites(oComponente);
                if (oDesgaste == undefined) {
                    return "Não cadastrado"
                } else {
                    return oDesgaste + "%"
                }
            },

            obtemLimites: function(componente) {
                const tabela     = oController.getOwnerComponent().getModel("listaDesgastesModel").getData() || [];
                const limitesSup = tabela.filter(c => c.CodiFabr === componente.CodiFabr && c.Componente === componente.IdComponente && c.TipoEquipamento === componente.ModEquip);
                const limitesInf = tabela.filter(c => c.CodiFabr === componente.CodiFabr && c.Componente === componente.IdComponente && c.TipoEquipamento === componente.ModEquip);

                if (!limiteSup || !limiteInf) {
                    return;
                }

                limitesSup.sort((a, b) => Number(a.MedidaMm) - Number(b.MedidaMm));

                console.clear();
                
                console.log("Tabela Sup: ==================================================");
                limitesSup.map( a=> console.log("Componente: ", a.Componente, " | ", a.MedidaMm, " | ", a.PercDesgaste, " | ", a.Alerta));
                console.log("==============================================================");

                limitesInf.sort((a, b) => Number(b.MedidaMm) - Number(a.MedidaMm));

                console.log("Tabela Inf: ==================================================");
                limitesInf.map( a=> console.log("Componente: ", a.Componente, " | ", a.MedidaMm, " | ", a.PercDesgaste, " | ", a.Alerta));
                console.log("==============================================================");

                const medidaAtual = componente.Valormedido;
                const limiteSup   = limitesSup.filter( l => Number(l.MedidaMm) >= medidaAtual )[0];
                const limiteInf   = limitesInf.filter( l => Number(l.MedidaMm) <= medidaAtual )[0];

                console.log("medidaAdual: ", medidaAtual);
                console.log("LimiteSup: ", limiteSup && limiteSup.MedidaMm);
                console.log("LimiteInf: ", limiteInf && limiteInf.MedidaMm);

                let   desgaste    = componente.Ordenacao === "C" ? limiteSup?.PercDesgaste : limiteInf?.PercDesgaste ;
                return desgaste;
            }

        });
    });
