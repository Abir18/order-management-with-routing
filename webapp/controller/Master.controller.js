sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "sap/m/MessageBox",
        "sap/f/library",
        "sap/ui/model/json/JSONModel",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/List",
        "sap/m/StandardListItem",
        "sap/m/library",
        "sap/m/MessageToast"
    ],
    function (
        Controller,
        Filter,
        FilterOperator,
        Sorter,
        MessageBox,
        fioriLibrary,
        JSONModel,
        Dialog,
        Button,
        List,
        StandardListItem,
        mobileLibrary,
        MessageToast
    ) {
        "use strict";
        // shortcut for sap.m.ButtonType
        var ButtonType = mobileLibrary.ButtonType;
        // shortcut for sap.m.DialogType
        var DialogType = mobileLibrary.DialogType;

        return Controller.extend("sap.test.routing.controller.Master", {
            onInit: function () {
                this.oView = this.getView();
                this._bDescendingSort = false;
                this.oProductsTable = this.oView.byId("productsTable");
                // this.oRouter = this.getOwnerComponent().getRouter();

                const localStorageData =
                    localStorage.getItem("LocalStorageData");
                const parseData = JSON.parse(localStorageData);
                // console.log(parseData, "parseData");
                const ProductsModel = new JSONModel(parseData);
                this.getView().setModel(ProductsModel, "products");

                this.oOwnerComponent = this.getOwnerComponent();

                this.oRouter = this.oOwnerComponent.getRouter();

                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
            },

            onRouteMatched: function (oEvent) {
                console.log("came in delete");
                const localStorageData =
                    localStorage.getItem("LocalStorageData");
                const parseData = JSON.parse(localStorageData);
                // console.log(parseData, "parseData");
                const ProductsModel = new JSONModel(parseData);
                this.getView().setModel(ProductsModel, "products");
            },

            test: function () {
                console.log("test");
            },

            onSearch: function (oEvent) {
                var oTableSearchState = [],
                    sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    oTableSearchState = [
                        new Filter("Name", FilterOperator.Contains, sQuery)
                    ];
                }

                this.oProductsTable
                    .getBinding("items")
                    .filter(oTableSearchState, "Application");
            },

            onAdd: function () {
                MessageBox.information("This functionality is not ready yet.", {
                    title: "Aw, Snap!"
                });
            },

            onSort: function () {
                this._bDescendingSort = !this._bDescendingSort;
                var oBinding = this.oProductsTable.getBinding("items"),
                    oSorter = new Sorter("Name", this._bDescendingSort);

                oBinding.sort(oSorter);
            },

            onListItemPress: function (oEvent) {
                const selectedItem =
                    oEvent
                        ?.getSource()
                        ?.getBindingContext("products")
                        ?.getObject() || "";

                const { Delivered: delivered } = selectedItem;

                // console.log(delivered, "delivered");

                if (delivered) {
                    MessageToast.show("Order already delivered.");
                    return;
                }
                if (oEvent.getSource().getBindingContext("products")) {
                    // console.log("items found");

                    var productPath = oEvent
                            .getSource()
                            .getBindingContext("products")
                            .getPath(),
                        product = productPath.split("/").slice(-1).pop();

                    let oData = oEvent.getParameter("arguments");

                    let pData = oEvent
                        .getSource()
                        .getBindingContext("products")
                        .getModel()
                        .getData();

                    let selectedProduct =
                        pData.ProductCollection[product].OrderId;

                    this.oRouter.navTo("detail", {
                        layout: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
                        product: product
                    });
                } else {
                    const randomId = parseInt(Date.now() + Math.random())
                        .toString()
                        .slice(6);

                    this.oRouter.navTo("detail", {
                        layout: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
                        product: "new"
                    });
                }
            },

            statusChangedConfirmed: function () {
                let idForStatus = localStorage.getItem("statusIdInLocal");

                const localStorageData =
                    localStorage.getItem("LocalStorageData");
                const parseData = JSON.parse(localStorageData);
                let updatedData = parseData.ProductCollection.filter(
                    (order) => {
                        // console.log(orderId, "orderId");
                        return order.OrderId == idForStatus;
                    }
                ).map((data) => {
                    if (data.Delivered == false) {
                        data.Delivered = true;
                        console.log(data.Delivered, "data.Delivered");
                        return data;
                    }
                    return data;
                });

                let mappedStatusData = parseData.ProductCollection.map(
                    (order) => {
                        if (order.OrderId == idForStatus) {
                            return updatedData[0];
                        }
                        return order;
                    }
                );

                let data = {
                    ProductCollection: mappedStatusData
                };
                console.log(data, "data");

                localStorage.setItem("LocalStorageData", JSON.stringify(data));

                const getlocalStorageData =
                    localStorage.getItem("LocalStorageData");
                const getParseData = JSON.parse(getlocalStorageData);
                // console.log(getParseData, "parseData");
                const ProductsModel = new JSONModel(getParseData);
                this.getView().setModel(ProductsModel, "products");
            },

            onStatusChanged: function (orderId, delivered) {
                if (delivered) return;

                localStorage.setItem("statusIdInLocal", orderId);

                if (!this.oDefaultDialog) {
                    console.log("Helllooooooo");

                    this.oDefaultDialog = new Dialog({
                        title: "Are you sure to change this status?",

                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                this.statusChangedConfirmed();
                                //==============
                                this.oDefaultDialog.close();

                                this.oRouter.navTo("master", {
                                    layout: fioriLibrary.LayoutType.OneColumn
                                });

                                this.getView().getModel().refresh();
                                var msg = "User status changed";
                                MessageToast.show(msg);
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Close",
                            press: function () {
                                this.oDefaultDialog.close();
                            }.bind(this)
                        })
                    });

                    console.log(this.oDefaultDialog, "this.oDefaultDialog");
                    // to get access to the controller's model
                    this.getView().addDependent(this.oDefaultDialog);
                }
                this.getView().getModel().refresh();

                this.oDefaultDialog.open();
            },
            deleteConfirmed: async function () {
                let idFordel = localStorage.getItem("deleteIdInLocal");
                let allOrders = await JSON.parse(
                    localStorage.getItem("LocalStorageData")
                );

                let updatedOrderData = await allOrders.ProductCollection.filter(
                    (order) => order.OrderId !== idFordel
                );

                let data = {
                    ProductCollection: updatedOrderData
                };
                localStorage.setItem("LocalStorageData", JSON.stringify(data));

                const ProductsModel = new JSONModel(data);
                this.getView().setModel(ProductsModel, "products");
                this.getView().getModel().refresh();
            },
            onDeleteButtonPressed: async function (orderId) {
                localStorage.setItem("deleteIdInLocal", orderId);

                if (!this.oDeleteDialog) {
                    this.oDeleteDialog = await new Dialog({
                        title: "Are you sure to delete?",

                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Delete",
                            press: function () {
                                this.deleteConfirmed();

                                var msg = "Data Deleted";
                                this.oDeleteDialog.close();
                                MessageToast.show(msg);
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Close",
                            press: function () {
                                this.oDeleteDialog.close();
                            }.bind(this)
                        })
                    });

                    console.log(this.oDeleteDialog, "this.oDeleteDialog");
                    // to get access to the controller's model
                    this.getView().addDependent(this.oDeleteDialog);
                }
                this.getView().getModel().refresh();

                this.oDeleteDialog.open();

                sap.ui
                    .controller("sap.test.routing.controller.Detail")
                    .onCancelPressed(this);
            }
        });
    }
);
