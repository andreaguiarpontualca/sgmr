sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator"
],
    function (Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        var oView
        var oController

        return Controller.extend("com.pontual.sgmr.controller.Componentes", {

            COR_LIMITE : {
                BAIXO : "Indication04",
                MEDIO : "Indication03",
                ALTO  : "Indication02"
            },

            onInit: function () {
                oController = this;
                oController.oController = this;
                oView = oController.getView();

                const oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oView.bindElement("materialRodanteFormularioModel>/")

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("Formulario").attachMatched(this._handleRouteMatched, this);
            },

            _handleRouteMatched: function (oEvent) {
                const oTable   = this.byId("idComponentesTable");
                const oBinding = oTable.getBinding("items");
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
            },

            _handleExibirImagem: function (sImagem, sTitulo) {
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
                var vPath           = oEvent.getSource().getBindingContext("materialRodanteFormularioModel").getPath();
                var oComponente     = oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getProperty(vPath);
                var vValorMedido    = parseFloat(oComponente.Valormedido);
                var vUltValormedido = parseFloat(oComponente.UltValormedido);

                if (oComponente.Ordenacao == "D" && vValorMedido > vUltValormedido) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Valor informado maior que último valor medido");
                }
                if (oComponente.Ordenacao == "C" && vValorMedido < vUltValormedido) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("Valor informado menor que último valor medido");
                }

                const vCorPercentualDesgaste = oController.obtemCorLimite(oComponente);
                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty(vPath + '/PercDesgasteValueState', vCorPercentualDesgaste);
                const vPercentualDesgaste = oController.calcularPercentualDesgaste(oComponente);
                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty(vPath + '/PercDesgaste', vPercentualDesgaste);
                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").refresh();
            },

            calcularPercentualDesgaste: function (oComponente) {
                const oDesgaste    = oController.obtemLimites(oComponente);
                return (oDesgaste == undefined) ? "Não cadastrado": oDesgaste + "%";
            },

            obtemCorLimite: function(componente) {
                const tabela    = oController.getOwnerComponent().getModel("listaDesgastesModel").getData() || [];
                const tabelaCre = tabela.filter(c => c.CodiFabr === componente.CodiFabr && c.Componente === componente.IdComponente && c.TipoEquipamento === componente.ModEquip);
                const tabelaDec = tabela.filter(c => c.CodiFabr === componente.CodiFabr && c.Componente === componente.IdComponente && c.TipoEquipamento === componente.ModEquip);

                if (!tabelaCre || tabelaCre.length < 1 || !tabelaDec || tabelaDec.length < 1) {
                    return "Indication05";
                }

                tabelaCre.sort((a, b) => Number(a.MedidaMm) - Number(b.MedidaMm));
                tabelaDec.sort((a, b) => Number(b.MedidaMm) - Number(a.MedidaMm));

                const medidaAtual = componente.Valormedido;
                const limiteSup   = tabelaCre.filter( l => Number(l.MedidaMm) >= medidaAtual )[0];
                const limiteInf   = tabelaDec.filter( l => Number(l.MedidaMm) <= medidaAtual )[0];

                if (componente.Ordenacao === "C") {
                    return oController.COR_LIMITE[limiteInf?.Alerta] || "Indication05";
                }
                return oController.COR_LIMITE[limiteSup?.Alerta] || "Indication05";
            },

            obtemLimites: function(componente) {
                const tabela    = oController.getOwnerComponent().getModel("listaDesgastesModel").getData() || [];
                const tabelaCre = tabela.filter(c => c.CodiFabr === componente.CodiFabr && c.Componente === componente.IdComponente && c.TipoEquipamento === componente.ModEquip);
                const tabelaDec = tabela.filter(c => c.CodiFabr === componente.CodiFabr && c.Componente === componente.IdComponente && c.TipoEquipamento === componente.ModEquip);

                if (!tabelaCre || tabelaCre.length < 1 || !tabelaDec || tabelaDec.length < 1) {
                    return;
                }

                //TODO : REMOVER COMENTÁRIO ANTES DO APK.
                console.clear();

                tabelaCre.sort((a, b) => Number(a.MedidaMm) - Number(b.MedidaMm));
               
                console.log("Tabela Sup: ==================================================");
                tabelaCre.map( a=> console.log("Componente: ", a.Componente, " | ", a.MedidaMm, " | ", a.PercDesgaste, " | ", a.Alerta));
                console.log("==============================================================");

                tabelaDec.sort((a, b) => Number(b.MedidaMm) - Number(a.MedidaMm));

                console.log("Tabela Inf: ==================================================");
                tabelaDec.map( a=> console.log("Componente: ", a.Componente, " | ", a.MedidaMm, " | ", a.PercDesgaste, " | ", a.Alerta));
                console.log("==============================================================");

                const medidaAtual = componente.Valormedido;
                const limiteSup   = tabelaCre.filter( l => Number(l.MedidaMm) >= medidaAtual )[0];
                const limiteInf   = tabelaDec.filter( l => Number(l.MedidaMm) <= medidaAtual )[0];
                const medidaSup   = (!!limiteSup && !!limiteSup.MedidaMm) ? Number(limiteSup.MedidaMm) : 0.0;

                const desgVsRefAnt  = medidaSup - medidaAtual;
                const percRefAnt    = Number(limiteSup && limiteSup.PercDesgaste) || 0.0;
                const percRefPos    = Number(limiteInf && limiteInf.PercDesgaste) || 0.0;
                const percIntervalo = desgVsRefAnt / 5;
                const desgaste      = ((percRefPos - percRefAnt) * percIntervalo + percRefAnt).toFixed(2);

                console.log("Medida Atual.........: ", medidaAtual);
                console.log("Desgaste vs Ref. Ant.: ", desgVsRefAnt);
                console.log("Desgaste Ref. Ant....: ", percRefAnt, "%");
                console.log("Desgaste Ref. Pos....: ", percRefPos, "%");
                console.log("Perc. do Intervalo...: ", percIntervalo, "%");
                console.log("Desgaste.............: ", desgaste, "%");

                const limiteIni = tabelaCre[0];
                const medidaIni = Number(limiteIni.MedidaMm)      || 0.0;
                const percIni   = (Number(limiteIni.PercDesgaste) || 0.0).toFixed(2);

                const limiteFim = tabelaCre[tabelaCre.length - 1];
                const medidaFim = Number(limiteFim.MedidaMm)      || 0.0;
                const percFim   = (Number(limiteFim.PercDesgaste) || 0.0).toFixed(2);
                
                if (medidaAtual < medidaIni) {
                    return percIni;
                }

                if (medidaAtual > medidaFim) {
                    return percFim;
                }
                
                return desgaste;
            }

        });
    });
