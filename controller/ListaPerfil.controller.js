sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    'sap/m/MessageToast',
    'sap/ui/model/json/JSONModel'
],
    function (Controller, MessageToast, JSONModel) {
        "use strict";
        var oController;
        var oView;

        return Controller.extend("com.pontual.sgmr.controller.ListaPerfil", {
            onInit: function () {

                oController = this;
                oView = oController.getView();
                this.getView().addStyleClass("sapUiSizeCompact");

                try {
                    var perfis = oController.getOwnerComponent().getModel("listaPerfilModel").getData()
                    perfis.forEach(element => {
                        element.Selecionado = false

                    });
                    oController.getOwnerComponent().getModel("listaPerfilModel").refresh()
                } catch (error) {

                }

                oView.bindElement("listaPerfilModel>/");
                oView.bindElement("layoutTelaModel>/");
                oView.bindElement("busyDialogModel>/")

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.getRoute("ListaPerfil").attachMatched(this._handleRouteMatched, this);
            },

            _handleRouteMatched: function (oEvent) {
                var aFilters = []
                var filter = new sap.ui.model.Filter({ path: "Sincronizado", operator: sap.ui.model.FilterOperator.NE, value1: "E" });
                aFilters.push(filter);
                this.getView().byId("idListaPerfilTable").getBinding("items").filter(aFilters, "Application");
            },

            onNavBack: function () {
                this.getRouter().navTo("Administrativo", {}, true /*no history*/);
            },

            onEliminarPerfil: function (oEvent) {
                this.limparMensagens();
                var oPerfil = oEvent.getSource().getBindingContext("listaPerfilModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaPerfilModel").getPath());
                var aUsuarios = oController.getOwnerComponent().getModel("listaUsuariosModel").getData()
                var oUsuario = aUsuarios.find(function (pUsuario) {
                    return pUsuario.Perfil === oPerfil.DescrPerfil
                })
                if (oUsuario == undefined) {
                    oPerfil.Sincronizado = "E"
                    oController.getOwnerComponent().getModel("listaPerfilModel").refresh()
                    oController.limparTabelaIndexDB("tb_perfil")
                    .then( () => {
                        oController.gravarTabelaIndexDB("tb_perfil", oController.getOwnerComponent().getModel("listaPerfilModel").getData())
                        .then( () => {
                            MessageToast.show("Perfil marcado para eliminação.");
                            oController.perfilUpdate()
                            .then( () => {
                                MessageToast.show("Perfil eliminado com sucesso");
                            });
                        });
                    });
                } else {
                    MessageToast.show("Perfil associado a usuário. Remova antes de eliminar.");
                    const title       = 'Perfil em uso';
                    const subtitle    = 'Perfil';
                    const description = 'Perfil associado a usuário. Remova antes de eliminar.';
                    oController.adicionarMensagemErro(title, subtitle, description);
                }
            },

            onPerfilPress: function (oEvent) {
                var oPerfil = oEvent.getSource().getBindingContext("listaPerfilModel").getModel().getProperty(oEvent.getSource().getBindingContext("listaPerfilModel").getPath());
                try {
                    var oObjetoNovo = JSON.parse(JSON.stringify(oPerfil));
                    oObjetoNovo.HabilitarTelaCriarPerfil = false;
                    oController.getOwnerComponent().getModel("perfilCriarModel").setData(oObjetoNovo);
                    oController.getOwnerComponent().getModel("perfilCriarModel").refresh()
                    oController.getOwnerComponent().getRouter().navTo("CriarPerfil", null, true);
                } catch (error) {

                    var oPerfil = oController.getOwnerComponent().getModel("perfilCriarModel").getData();
                    var aPerfil = {
                        CodigoPerfil            : oPerfil.CodigoPerfil,
                        DescrPerfil             : oPerfil.DescrPerfil,
                        Sincronizado            : "N",
                        HabilitarTelaCriarPerfil: true,
                        AutorizacaoSet          : []
                    }

                    oPerfil.AutorizacaoSet.forEach(element => {
                        if (element.Selecionado == true) {
                            aPerfil.AutorizacaoSet.push(element)
                        }
                    });

                    oController.getOwnerComponent().getModel("perfilCriarModel").setData(aPerfil);
                    oController.getOwnerComponent().getModel("perfilCriarModel").refresh()
                    oController.getOwnerComponent().getRouter().navTo("CriarPerfil", null, true);
                }
            },

            onCriarPerfil: function (oEvent) {
                var listaAutorizacao = oController.getOwnerComponent().getModel("listaAutorizacaoModel").getData()
                var oPerfil = {
                    CodigoPerfil            : 0,
                    DescrPerfil             : "",
                    Sincronizado            : "N",
                    HabilitarTelaCriarPerfil: true,
                    AutorizacaoSet          : []
                }

                if (listaAutorizacao.length != undefined) {
                    listaAutorizacao.forEach(element => {
                        element.Selecionado = false;
                        oPerfil.AutorizacaoSet.push(element);
                    });
                }


                oController.getOwnerComponent().getModel("perfilCriarModel").setData(oPerfil);
                oController.getOwnerComponent().getModel("perfilCriarModel").refresh();
                oController.getOwnerComponent().getRouter().navTo("CriarPerfil", null, true);
            },

            onSincronizar: function (oEvent) {
                oController.onSincronizarGeral(oController, false)
            }

        });
    });
