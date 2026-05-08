sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/m/MessagePopover",
        "sap/m/MessageItem",
        "com/pontual/sgmr/model/models"
    ],
    function (UIComponent, MessagePopover, MessageItem, models) {
        "use strict";

        return UIComponent.extend("com.pontual.sgmr.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                UIComponent.prototype.init.apply(this, arguments);

                this.getRouter().initialize();

                this.setModel(models.createDeviceModel(), "device");

                this.getModel("mMensagens").setData([]);

                this.inicializaPopoverMensagens();
            },

            inicializaPopoverMensagens: function() {
                this.__popoverMensagens = new MessagePopover({
                    items: {
                        path  : 'mMensagens>/',
                        template: new MessageItem({
                            type       : "{mMensagens>type}",
                            title      : "{mMensagens>title}",
                            activeTitle: "{mMensagens>active}",
                            description: "{mMensagens>description}",
                            subtitle   : "{mMensagens>subtitle}",
                            counter    : "{mMensagens>counter}"
                        })
                    },
                    afterClose: () => {
                        this.limparMensagens();
                    }
                });
            },

            obtemPopoverMensagens: function() {
                return this.__popoverMensagens;
            },

            limparMensagens: function() {
                this.getModel("mMensagens").setData([]);
                this.getModel("mMensagens").refresh(true);
                sap.ui.getCore()?.getMessageManager()?.removeAllMessages();
            },
        });
    }
);
