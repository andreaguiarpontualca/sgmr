sap.ui.define([
    "com/pontual/sgmr/controller/BaseController",
    "com/pontual/sgmr/model/formatter",
    'sap/m/MessagePopover',
    'sap/m/MessageItem',
    'sap/ui/model/json/JSONModel',
    "sap/m/Dialog",
    "sap/m/Button",
    "../model/mockserver",
    "sap/m/MessageBox",
    'sap/base/util/uid',
    "sap/m/plugins/UploadSetwithTable",
    'sap/m/MessageToast',              
],
    function (Controller, formatter, MessagePopover, MessageItem, JSONModel, Dialog, Button, MockServer, MessageBox, uid, UploadSetwithTable, MessageToast) {
        "use strict";
        var oView
        var oController


        var eventListener = function (e) {
            var elem = e.target;

            while (elem != document) {
                if (elem.tagName === "A" && elem.hasAttribute("download")) {
                    e.preventDefault();

                    if (elem.getAttribute("href").slice(0, 5) === "data:") {
                        var blob = dataURItoBlob(elem.getAttribute("href"));
                        oController.download(elem.getAttribute("download"), blob, blob.type);
                    } else {
                        fetch(elem.getAttribute("href"))
                            .then(function (response) {
                                return response.blob();
                            })
                            .then(function (blob) {
                                if (e.type.includes("image")) {
                                    return oController.downloadFile(blob)
                                } else {
                                    return oController.download(elem.getAttribute("download"), blob, blob.type);
                                }


                            });
                    }
                    return;
                }
                elem = elem.parentNode;
            }
        };

        return Controller.extend("com.pontual.sgmr.controller.Anexos", {
            onInit: function () {
                oController = this;
                // oController.registraModeloMensagem();
                oView = oController.getView();

                var oModel = new JSONModel();
                oModel.setData([]);
                this.getView().setModel(oModel);

                oView.bindElement("materialRodanteFormularioModel>/")


                this.documentTypes = this.getFileCategories();
                this.oMockServer = new MockServer();
                this.oMockServer.oModel = oController.getOwnerComponent().getModel("materialRodanteFormularioModel");
                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").setProperty("/items", [])

                oView.byId("cameraSelectedButton").setVisible(!!window.cordova);
            },

            onNavBack: function () {
                this.getRouter().navTo("ListaMaterialRodante", {}, true /*no history*/);
            },

 //Anexo - Inicio

            onBeforeUploadStarts: function () {
                // This code block is only for demonstration purpose to simulate XHR requests, hence starting the mockserver.
                this.oMockServer.start();
            },
            onPluginActivated: function (oEvent) {
                this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
            },
            getIconSrc: function (mediaType, thumbnailUrl) {
                return UploadSetwithTable.getIconForFileType(mediaType, thumbnailUrl);
            },
            // Table row selection handler
            onSelectionChange: function (oEvent) {
                const oTable = oEvent.getSource();
                //                const aSelectedItems = oTable?.getSelectedContexts();
                const aSelectedItems = oTable ? oTable.getSelectedContexts() : null;
                const oDownloadBtn = this.byId("downloadSelectedButton");
                const oRenameBtn = this.byId("renameButton");
                const oRemoveDocumentBtn = this.byId("removeDocumentButton");

                if (aSelectedItems.length > 0) {
                    oDownloadBtn.setEnabled(true);
                } else {
                    oDownloadBtn.setEnabled(false);
                }
                if (aSelectedItems.length === 1) {
                    oRenameBtn.setEnabled(true);
                    oRemoveDocumentBtn.setEnabled(true);
                } else {
                    oRenameBtn.setEnabled(false);
                    oRemoveDocumentBtn.setEnabled(false);
                }
            },
            // Download files handler
            onDownloadFiles: function (oEvent) {
                const oContexts = this.byId("table-uploadSet").getSelectedContexts();
                if (oContexts && oContexts.length) {
                    oContexts.forEach((oContext) => this.oUploadPluginInstance.download(oContext, false));
                }
            },
            // UploadCompleted event handler
            onUploadCompleted: function (oEvent) {
                const oModel = this.byId("table-uploadSet").getModel("materialRodanteFormularioModel");
                const iResponseStatus = oEvent.getParameter("status");

                // check for upload is sucess
                if (iResponseStatus === 201) {
                    oModel.refresh(true);
                    setTimeout(function () {
                        MessageToast.show("Documento adicionado");
                    }, 1000);
                }
                // This code block is only for demonstration purpose to simulate XHR requests, hence restoring the server to not fake the xhr requests.
                this.oMockServer.restore();
            },
            onRemoveButtonPress: function (oEvent) {
                var oTable = this.byId("table-uploadSet");
                const aContexts = oTable.getSelectedContexts();
                this.removeItem(aContexts[0]);
            },
            onRemoveHandler: function (oEvent) {
                var oSource = oEvent.getSource();
                const oContext = oSource.getBindingContext("materialRodanteFormularioModel");
                this.removeItem(oContext);
            },
            removeItem: function (oContext) {
                const oModel = this.getView().getModel("materialRodanteFormularioModel");
                const oTable = this.byId("table-uploadSet");
                MessageBox.warning(
                    "Tem certeza que deseja remover o arquivo" + " " + oContext.getProperty("fileName") + " " + "?",
                    {
                        icon: MessageBox.Icon.WARNING,
                        actions: ["Remover", MessageBox.Action.CANCEL],
                        emphasizedAction: "Remover",
                        styleClass: "sapMUSTRemovePopoverContainer",
                        initialFocus: MessageBox.Action.CANCEL,
                        onClose: function (sAction) {
                            if (sAction !== "Remover") {
                                return;
                            }
                            var spath = oContext.getPath();
                            if (spath.split("/")[2]) {
                                var index = spath.split("/")[2];
                                var data = oModel.getProperty("/items");
                                data.splice(index, 1);
                                oModel.refresh(true);
                                if (oTable && oTable.removeSelections) {
                                    oTable.removeSelections();
                                }
                            }
                        }
                    }
                );
            },
            getFileCategories: function () {
                return [
                    { categoryId: "Invoice", categoryText: "Invoice" },
                    { categoryId: "Specification", categoryText: "Specification" },
                    { categoryId: "Attachment", categoryText: "Attachment" },
                    { categoryId: "Legal Document", categoryText: "Legal Document" }
                ];
            },
            getFileSizeWithUnits: function (iFileSize) {
                return UploadSetwithTable.getFileSizeWithUnits(iFileSize);
            },
            openPreview: function (oEvent) {
                const oSource = oEvent.getSource();
                const oBindingContext = oSource.getBindingContext("materialRodanteFormularioModel");
                if (oBindingContext && this.oUploadPluginInstance) {
                    if (window.cordova && cordova.platformId !== "browser") {
                        if (oBindingContext.getObject().mediaType.includes("pdf")) {
                            oController.prepareDownloadFiles();
                            var a = window.document.createElement("a");
                            a.href = oBindingContext.getObject().url;
                            a.download = oBindingContext.getObject().fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        } else {
                            this.oUploadPluginInstance.openFilePreview(oBindingContext);
                        }
                    } else {
                        this.oUploadPluginInstance.openFilePreview(oBindingContext);
                    }
                }
            },

            prepareDownloadFiles: function () {
                if (window.cordova && cordova.platformId !== "browser") {
                    document.addEventListener("deviceready", function () {
                        document.addEventListener("click", eventListener);
                    })
                }
            },

            download: function (filename, data, mimeType) {
                var blob = new Blob([data], {
                    type: mimeType
                });
                if (window.cordova && cordova.platformId !== "browser") {
                    document.addEventListener("deviceready", function () {
                        var storageLocation = "";

                        switch (device.platform) {
                            case "Android":
                                storageLocation = cordova.file.externalDataDirectory;
                                break;

                            case "iOS":
                                storageLocation = cordova.file.documentsDirectory;
                                break;
                        }

                        var folderPath = storageLocation;

                        window.resolveLocalFileSystemURL(
                            folderPath,
                            function (dir) {
                                dir.getFile(
                                    filename,
                                    {
                                        create: true
                                    },
                                    function (file) {
                                        file.createWriter(
                                            function (fileWriter) {
                                                fileWriter.write(blob);

                                                fileWriter.onwriteend = function () {
                                                    var url = file.toURL();
                                                    cordova.plugins.fileOpener2.open(url, mimeType, {
                                                        error: function error(err) {
                                                            console.error(err);
                                                        },
                                                        success: function success() {
                                                            document.removeEventListener("click", eventListener);
                                                        }
                                                    });

                                                };

                                                fileWriter.onerror = function (err) {
                                                    console.error(err);
                                                };
                                            },
                                            function (err) {
                                                // failed
                                                console.error(err);
                                            }
                                        );
                                    },
                                    function (err) {
                                        console.error(err);
                                    }
                                );
                            },
                            function (err) {
                                console.error(err);
                            }
                        );
                    });
                } else {
                    saveAs(blob, filename);
                }
            },

            downloadFile: function (pBlob) {
                //  var utf8BOM = "\uFEFF";
                //  var vType = t.type.split(":")[1] + ";charset=utf-8;"
                //	var blob = new Blob([utf8BOM, sContent], { type: vType });
                var sURL = window.URL.createObjectURL(pBlob);
                var link = document.createElement("a");
                link.href = sURL;
                link.setAttribute("download", "Imagem");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },

            onRenameDocument: function () {
                const oUploadSet = this.byId("table-uploadSet");
                const aSelectedContexts = oUploadSet.getSelectedContexts();
                //               if (aSelectedContexts?.length === 1) {
                if ((aSelectedContexts ? aSelectedContexts.length : null) === 1) {
                    // invoking public API on UploadSetTable
                    this.oUploadPluginInstance.renameItem(aSelectedContexts[0]);
                }
            },
            onDocumentRenamedSuccess: function (oEvent) {
                // placeholder event handler to initiate a file name change that gets updated in the backend, and then the message is displayed in the application

                // Toast for sucessful rename.
                MessageToast.show("Document Renamed.", { duration: 2000 });
            },
            openAddOrEditDialog: function () {
                if (!this._addViaUrlFragment) {
                    Fragment.load({
                        name: "sap.m.sample.UploadSetwithTablePlugin.ResponsiveTableSimple.view.fragment.AddViaUrl",
                        id: "addViaUrlDialog",
                        controller: this
                    })
                        .then(function (oPopover) {
                            this._addViaUrlFragment = oPopover;
                            this.getView().addDependent(oPopover);
                            // if edit is clicked
                            const editFileInfo = this.oEditDocumentInfo;
                            const renameFileInfo = this.oRenameDocumentInfo;
                            if (this.bEditDocument && this.oEditDocumentInfo) {
                                Element.getElementById('addViaUrlDialog--addViaUrlDialog').setTitle("Edit URL");
                                Element.getElementById('addViaUrlDialog--addDocumentBtn').setText("Apply");
                                Element.getElementById('addViaUrlDialog--urlInput').setValue(editFileInfo.url);
                                Element.getElementById('addViaUrlDialog--nameInput').setValue(editFileInfo.name);
                                Element.getElementById('addViaUrlDialog--urlInputLabel').setRequired(false);
                                Element.getElementById('addViaUrlDialog--urlInput').setVisible(true);

                            }
                            if (this.bRenameDocument && renameFileInfo) {
                                Element.getElementById('addViaUrlDialog--addViaUrlDialog').setTitle("Rename");
                                Element.getElementById('addViaUrlDialog--addViaUrlDialog').setContentHeight("7rem");
                                Element.getElementById('addViaUrlDialog--addDocumentBtn').setText("Apply");
                                Element.getElementById('addViaUrlDialog--nameInput').setValue(renameFileInfo.name);
                                Element.getElementById('addViaUrlDialog--urlInput').setVisible(false);
                            }
                            oPopover.open();
                        }.bind(this));
                } else {
                    this._addViaUrlFragment.open();
                }
            },
            closeAddViaUrlFragment: function () {
                this.bEditDocument = false;
                this.oEditDocumentInfo = null;
                this.bRenameDocument = false;
                this.oRenameDocumentInfo = null;
                this._addViaUrlFragment.destroy();
                this._addViaUrlFragment = null;
            },
            onEditUrl: function (oEvent) {
                const oTable = this.byId("table-uploadSet"),
                    oBidningContextObject = oTable.getSelectedContexts()[0].getObject(),
                    sUrl = oBidningContextObject.url,
                    sName = oBidningContextObject.fileName;

                this.bEditDocument = true;
                this.oEditDocumentInfo = {
                    url: sUrl,
                    name: sName
                };
                this.openAddOrEditDialog();
            },
            handleAddViaUrl: function () {
                if (this.bEditDocument) {
                    if (this._isValidName()) {
                        this.showEditConfirmation();
                    } else {
                        MessageToast.show("No Changes found");
                    }
                    return;
                } else if (this.bRenameDocument) {
                    this.showEditConfirmation();
                    return;
                }
                const oValidateObject = this._validateAddOrEditUrlDialog(),
                    sName = oValidateObject.name,
                    sUrl = oValidateObject.url,
                    bHasError = oValidateObject.error;
                if (!bHasError) {
                    setTimeout(function () {

                        let fnResolve, fnReject;
                        const oPromise = new Promise(function (resolve, reject) {
                            fnResolve = resolve;
                            fnReject = reject;
                        });
                        const oItem = this.oUploadPluginInstance.uploadItemViaUrl(sName, sUrl, oPromise);
                        if (oItem) {

                            /* Demonstration use case of Setting the header field if required to be passed in API request headers to
                            inform backend with the file url captured through user input */
                            oItem.addHeaderField(new CoreItem({
                                key: 'documentUrl',
                                text: sUrl
                            }));
                            // resolve to initiate the upload.
                            fnResolve(true);
                        } else {
                            fnReject(true);
                        }
                        this._addViaUrlFragment.destroy();
                        this._addViaUrlFragment = null;

                    }.bind(this), 1000);
                }
            },
            _isValidUrl: function (sUrl) {
                const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                return regexp.test(sUrl);
            },
            _isValidName: function () {
                const domRefName = Element.getElementById('addViaUrlDialog--nameInput');
                const sName = domRefName.getValue();
                let bHasError = false;
                if (!sName) {
                    domRefName.setValueState('Error');
                    domRefName.setValueStateText('Text is either empty or contains special characters');
                    bHasError = true;
                } else {
                    domRefName.setValueState('None');
                    bHasError = false;
                }
                return !bHasError;
            },

            _validateAddOrEditUrlDialog: function () {
                const domRefUrl = Element.getElementById('addViaUrlDialog--urlInput'),
                    domRefName = Element.getElementById('addViaUrlDialog--nameInput'),
                    sUrl = domRefUrl.getValue(),
                    sName = domRefName.getValue();
                let bFormHasError = !this._isValidName();

                if (!sUrl || !this._isValidUrl(sUrl)) {
                    domRefUrl.setValueState('Error');
                    domRefUrl.setValueStateText('Enter Valid URL');
                    bFormHasError = true;
                } else {
                    domRefUrl.setValueState('None');
                }

                return {
                    error: bFormHasError,
                    name: sName,
                    url: sUrl
                };
            },

            showEditConfirmation: function () {
                const DialogType = mobileLibrary.DialogType;
                const ValueState = coreLibrary.ValueState;
                const ButtonType = mobileLibrary.ButtonType;
                this.oWarningMessageDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Warning",
                    state: ValueState.Warning,
                    content: new Text({ text: "You have made changes to this object. What would you like to do?" }),
                    buttons: [new Button({
                        type: ButtonType.Emphasized,
                        text: "Save",
                        press: [function () {
                            const oValidateObject = this._validateAddOrEditUrlDialog(),
                                sName = oValidateObject.name,
                                sUrl = oValidateObject.url,
                                oTable = this.byId("table-uploadSet"),
                                oBidningContextObject = oTable.getSelectedContexts()[0].getObject();
                            const oModel = this.getView().getModel("materialRodanteFormularioModel");
                            const oData = oModel.getProperty("/items");
                            var iUpdateIndex, item;
                            oData.filter(function (obj, index) {
                                if (obj.id === oBidningContextObject.id) {
                                    iUpdateIndex = index;
                                    item = obj;
                                }
                            });
                            oData[iUpdateIndex] = Object.assign(item, !this.bRenameDocument ? {
                                fileName: sName,
                                url: sUrl
                            } : { fileName: sName });
                            oModel.setProperty("/items", oData);
                            this.oWarningMessageDialog.close();
                            this.closeAddViaUrlFragment();

                        }, this]
                    }), new Button({
                        text: "DiscardChanges",
                        press: [function () {
                            this.oWarningMessageDialog.close();
                        }, this]
                    })]
                });
                this.oWarningMessageDialog.open();
            },

            onSearch: function (oEvent) {
                const aFilters = [];
                const sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    const filter = new Filter("fileName", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }
                const oTable = this.byId("table-uploadSet");
                const oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },

            onCameraPress: function (oEvent) {
                navigator.camera.cleanup();
                navigator.camera.getPicture(onSuccess, onFail, {
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    saveToPhotoAlbum: true,
                    encodingType: Camera.EncodingType.JPEG,
                    correctOrientation: true,
                    allowEdit: false,
                    quality: 50
                })
                function onSuccess(imageData) {
                    MessageToast.show("Sucesso ao recuperar imagem");
                    oController.obterArquivo("teste", imageData);

                }
                function onFail(message) {
                    MessageToast.show(oBundle.getText("falha") + message);
                }
            },

            obterArquivo: function (pNome, pImageData) {
                window.resolveLocalFileSystemURL(pImageData,
                    function success(fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var blob   = new Blob([new Uint8Array(this.result)], { type: "image/jpeg" });
                                var reader = new FileReader();
                                reader.readAsDataURL(blob);
                                reader.onloadend = function () {
                                    var base64data = reader.result.substr(reader.result.indexOf(',') + 1);
                                    oController.gravarImagem(base64data);
                                }
                            };
                            reader.readAsArrayBuffer(file);

                        }, onErrorReadFile);
                        function onErrorReadFile(oErro) {
                            console.error("Erro ao ler arquivo:", oErro);
                        }
                    },
                    function () {
                        oController.createNewFileEntry(imgUri);
                    }
                );
            },

            createNewFileEntry: function (imgUri) {
                window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
                    dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {
                        oController.gravarImagem(fileEntry);
                        oController.imageClean();
                    }, onErrorCreateFile);
                    function onErrorCreateFile(oErro) {
                        console.error("Erro ao criar o arquivo:", oErro);
                    }
                }, onErrorResolveUrl);

                function onErrorResolveUrl(oErro) {
                    console.error("Erro ao tentar recuperar a url:", oErro);
                }
            },

            imageClean: function () {
                navigator.camera.cleanup(
                () => {
                    //console.log("Camera cleanup success.")
                },
                (message) => {
                    console.error('Failed clean picture ', message);
                });
            },

            gravarImagem: function (pImageData) {
                var arquivo = pImageData;
                var fMres = atob(arquivo);
                var byteNumbers = new Array(fMres.length);
                for (var x = 0; x < fMres.length; x++) {
                    byteNumbers[x] = fMres.charCodeAt(x);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], {
                    type: "image/jpeg"
                });
                var vUrl = URL.createObjectURL(blob);

                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").getProperty("/items").unshift(
                    {
                        "id"             : idAnexo,
                        "fileName"       : "IMG_" + idAnexo + "." + blob.type.split('/')[1],
                        "mediaType"      : blob.type,
                        "url"            : vUrl,
                        "imageUrl"       : vUrl,
                        "uploadState"    : "Complete",
                        "revision"       : "00",
                        "status"         : "In work",
                        "fileSize"       : blob.size,
                        "lastModifiedBy" : "SGMR",
                        "lastmodified"   : new Date().toLocaleString("pt-BR"),
                        "documentType"   : "Arquivo Câmera",
                        "file"           : pImageData,
                        "previewable"    : true,
                        "trustedSource"  : true
                    }
                );
                oController.getOwnerComponent().getModel("materialRodanteFormularioModel").refresh()
            }
        });
    });
