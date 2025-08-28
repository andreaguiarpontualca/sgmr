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
        var oController;
        var oView;
        var oMessagePopover;

        return Controller.extend("com.pontual.sgmr.controller.ListaMaterialRodante", {
            onInit: function () {

                oController = this;
                oView = oController.getView();

                /* var oMaterialRodante = [{
                    Codigo: "EH-4010",
                    DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA HITACHI - EX 1200-5", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "EX 1200-5",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-4011",
                    DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA HITACHI - EX 1200-6", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "EX 1200-6",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }
                    ]},
                    {
                    Codigo: "EH-4042",
                    DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA HITACHI - EX 1200-7", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "EX1200-7",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }
                    ]},
                    {
                    Codigo: "PF-1009",
                    DescrMaterialRodante: "TRATOR DE ESTEIRA CATERPILLAR - D6", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "D6",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }
                    ]},
                    {
                    Codigo: "TE-3002",
                    DescrMaterialRodante: "TRATOR DE ESTEIRA CATERPILLAR - D8", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "D8",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }
                    ]},
                    {
                    Codigo: "TE-4021",
                    DescrMaterialRodante: "TRACK DOOZER CATERPILLAR D9T", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "D9T",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }
                    ]},
                    {
                    Codigo: "TE-6006",
                    DescrMaterialRodante: "TRATOR DE ESTEIRAS CATERPILLAR D11T CD", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "D11",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }
                    ]},
                    {
                    Codigo: "EH-5001",
                    DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA HITACHI - EX 2500-5", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "EX 2500-5",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-6001",
                    DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA HITACHI - EX 5500", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "EX 5500",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-1026",
                    DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA CATERPILLAR 315D", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "315",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-1021",
                    DescrMaterialRodante: "HYDRAULIC EXCAVATOR CATERPILLAR 320D", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "320",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-9999",
                    DescrMaterialRodante: "323 323 323D", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "323",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-9997",
                    DescrMaterialRodante: "336 336 336", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "336",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-9998",
                    DescrMaterialRodante: "349 349 349", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "349",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                    Codigo: "EH-3007",
                    DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA CATERPILLAR 365C", 
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    CodigoFormulario: "365_374",
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        },
                        {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: true
                        }


                    ]},
                    {
                        Codigo: "EH-1053",
                        DescrMaterialRodante: "ESCAVADEIRA HIDRÁULICA HYUNDAI - R220LC-9",
                        Sincronizado: "N",
                        HabilitarTelaCriarmaterialRodante: true,
                        CodigoFormulario: "R 220LC-9",
                        AutorizacaoSet: [
                            {
                                CodigoAutorizacao: "01",
                                DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                                Selecionado: true
                            },


                        ]
                    }
                ]


                oController.getOwnerComponent().getModel("listaMaterialRodanteModel").setData(oMaterialRodante);
                oController.getOwnerComponent().getModel("listaMaterialRodanteModel").refresh()
 */

                oView.bindElement("listaMaterialRodanteModel>/");
                oView.bindElement("layoutTelaModel>/");
                oView.bindElement("busyDialogModel>/");

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("ListaMaterialRodante").attachMatched(this._handleRouteMatched, this);

            },


            _handleRouteMatched: function (oEvent) {

                oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);

              /*   var aFilters = []
                var filter = new sap.ui.model.Filter({ path: "Sincronizado", operator: sap.ui.model.FilterOperator.NE, value1: "E" });
                aFilters.push(filter);
                this.getView().byId("idListaMaterialRodanteTable").getBinding("items").filter(aFilters, "Application");
 */
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

                oView.bindElement("listaMaterialRodanteModel>/");

            },


            onNavBack: function () {
                this.getRouter().navTo("Administrativo", {}, true /*no history*/);
            },


            onEliminarmaterialRodante: function (oEvent) {
                var oMaterialRodante = oEvent.getSource().getBindingContext("listaMaterialRodanteModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaMaterialRodanteModel").getPath());
                var aUsuarios = oController.getOwnerComponent().getModel("listaUsuariosModel").getData()
                var oUsuario = aUsuarios.find(function (pUsuario) {
                    return pUsuario.materialRodante === oMaterialRodante.DescrmaterialRodante
                })
                if (oUsuario == undefined) {
                    oMaterialRodante.Sincronizado = "E"
                    oController.getOwnerComponent().getModel("listaMaterialRodanteModel").refresh()
                    oController.limparTabelaIndexDB("tb_materialRodante").then(
                        function (result) {
                            oController.gravarTabelaIndexDB("tb_materialRodante", oController.getOwnerComponent().getModel("listaMaterialRodanteModel").getData()).then(
                                function (result) {
                                    MessageToast.show("materialRodante marcado para eliminação.");
                                    oController.materialRodanteUpdate().then(
                                        function (result) {
                                            MessageToast.show("materialRodante eliminado com sucesso");
                                            var aMensagens = oController.getOwnerComponent().getModel("mensagensModel").getData();
                                            oController.getView().getModel().setData(aMensagens);
                                            oController.getView().getModel().refresh()
                                        }).catch(
                                            function (result) {

                                            })
                                }).catch(
                                    function (result) {

                                    })
                        }).catch(
                            function (result) {

                            })
                } else {
                    MessageToast.show("materialRodante associado a usuário. Remova antes de eliminar.");
                    var oMockMessage = {
                        type: 'Error',
                        title: 'materialRodante em uso',
                        description: 'materialRodante associado a usuário. Remova antes de eliminar.',
                        subtitle: 'materialRodante',
                        counter: 1
                    };
                    oController.getView().getModel().setData([oMockMessage]);
                    oController.getView().getModel().refresh()
                }
            },

            onMaterialRodantePress: function (oEvent) {
                var oMaterialRodante = oEvent.getSource().getBindingContext("listaMaterialRodanteModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaMaterialRodanteModel").getPath());
                var oObjetoNovo = JSON.parse(JSON.stringify(oMaterialRodante));
                oObjetoNovo.HabilitarTelaCriarmaterialRodante = false
                oController.getOwnerComponent().getModel("materialRodanteCriarModel").setData(oObjetoNovo);
                oController.getOwnerComponent().getModel("materialRodanteCriarModel").refresh();
                oController.getView().byId("idListaMaterialRodanteTable").setBusy(true);
                //oController.getOwnerComponent().getRouter().navTo(oMaterialRodante.CodigoFormulario, null, true);                
                //oController.getOwnerComponent().getRouter().navTo("ObjectPageSection", null, true);
                var oRouter = oController.getOwnerComponent().getRouter();
                var oDestiny = oMaterialRodante.Modelo.replace(/\s+/g, '');
                var oRoute = oRouter.getRoute(oDestiny);

                if (oRoute !== undefined) {
                    oRouter.navTo(oDestiny, null, true);
                } else {
                    var oBundle = oView.getModel("i18n").getResourceBundle();
                    var oMockMessage = {
                        type: 'Error',
                        title: "Erro ao navegar",
                        description: "Não foi possível encontrar o formulário: " + oMaterialRodante.Modelo,
                        subtitle: oBundle.getText("materialRodante"),
                        counter: 1
                    };
                    oController.getView().getModel().setData([oMockMessage]);
                    oController.getView().getModel().refresh();
                    oController.getView().byId("idListaMaterialRodanteTable").setBusy(false);
                }

            },

            onCriarmaterialRodante: function (oEvent) {

                var oMaterialRodante = {
                    CodigomaterialRodante: 0,
                    DescrmaterialRodante: "",
                    Sincronizado: "N",
                    HabilitarTelaCriarmaterialRodante: true,
                    AutorizacaoSet: [
                        {
                            CodigoAutorizacao: "01",
                            DescrAutorizacao: "INSPEÇÃO MATERIAL RODANTE",
                            Selecionado: false
                        }, {
                            CodigoAutorizacao: "02",
                            DescrAutorizacao: "MOVIMENTAÇÃO MATERIAL RODANTE",
                            Selecionado: false
                        }
                        


                    ]
                }

                oController.getOwnerComponent().getModel("materialRodanteCriarModel").setData(oMaterialRodante);
                oController.getOwnerComponent().getModel("materialRodanteCriarModel").refresh()
                oController.getOwnerComponent().getRouter().navTo("CriarMaterialRodante", null, true);
            },

            onSincronizar: function (oEvent) {
                oController.onSincronizarGeral(oController, false)

            },

            handleMessagePopoverPress: function (oEvent) {
                oMessagePopover.toggle(oEvent.getSource());
            },

            onSearchOrdem: function(oEvent) {
                var sQuery = oEvent.getParameter("query") || oEvent.getSource().getValue();
                var oTable = this.byId("idListaMaterialRodanteTable");
                var oBinding = oTable.getBinding("items");
                if (!sQuery) {
                    oBinding.filter([]);
                    return;
                }
                sQuery = sQuery.toLowerCase();
                oBinding.filter(new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter({
                            path: "Equnr",
                            test: function(value) {
                                return value && value.toLowerCase().indexOf(sQuery) !== -1;
                            }
                        }),
                        new sap.ui.model.Filter({
                            path: "Eqktx",
                            test: function(value) {
                                return value && value.toLowerCase().indexOf(sQuery) !== -1;
                            }
                        })
                    ],
                    and: false
                }));
            }

        });
    });
