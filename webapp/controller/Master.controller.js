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
                this.oRouter = this.getOwnerComponent().getRouter();

                // this.getView().getModel("products").refresh();

                const localStorageData =
                    localStorage.getItem("LocalStorageData");
                const parseData = JSON.parse(localStorageData);
                // console.log(parseData, "parseData");
                const ProductsModel = new JSONModel(parseData);
                this.getView().setModel(ProductsModel, "products");
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

                    // let q = pData.ProductCollection.filter((p) => p[0]);

                    let selectedProduct =
                        pData.ProductCollection[product].OrderId;

                    // console.log(selectedProduct, "id");

                    // console.log("sadasd", oData);
                    // console.log("ppp", pData);
                    // console.log("ppp", q);

                    this.oRouter.navTo("detail", {
                        layout: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
                        product: selectedProduct
                    });
                } else {
                    // console.log("not found");

                    const randomId = parseInt(Date.now() + Math.random())
                        .toString()
                        .slice(6);

                    this.oRouter.navTo("detail", {
                        layout: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
                        product: randomId
                    });
                }
            },

            onStatusChanged: function (orderId, delivered) {
                if (delivered) return;

                if (!this.oDefaultDialog) {
                    console.log("Helllooooooo");

                    this.oDefaultDialog = new Dialog({
                        title: "Are you sure to change this status?",

                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                const localStorageData =
                                    localStorage.getItem("LocalStorageData");
                                const parseData = JSON.parse(localStorageData);
                                let updatedData =
                                    parseData.ProductCollection.filter(
                                        (order) => {
                                            // console.log(orderId, "orderId");
                                            return order.OrderId == orderId;
                                        }
                                    ).map((data) => {
                                        if (data.Delivered == false) {
                                            data.Delivered = true;
                                            console.log(
                                                data.Delivered,
                                                "data.Delivered"
                                            );
                                            return data;
                                        }
                                        return data;
                                    });
                                // console.log(updatedData, "updatedData");
                                // console.log(parseData, "parseData");
                                let mappedStatusData =
                                    parseData.ProductCollection.map((order) => {
                                        if (order.OrderId == orderId) {
                                            // console.log(orderId, "in the middle");
                                            return updatedData[0];
                                        }
                                        return order;
                                    });

                                let data = {
                                    ProductCollection: mappedStatusData
                                };
                                console.log(data, "data");

                                localStorage.setItem(
                                    "LocalStorageData",
                                    JSON.stringify(data)
                                );

                                const getlocalStorageData =
                                    localStorage.getItem("LocalStorageData");
                                const getParseData =
                                    JSON.parse(getlocalStorageData);
                                // console.log(getParseData, "parseData");
                                const ProductsModel = new JSONModel(
                                    getParseData
                                );
                                this.getView().setModel(ProductsModel);
                                //==============
                                this.oDefaultDialog.close();
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
                console.log("this.oDefaultDialog");
                console.log(this.oDefaultDialog, "this.oDefaultDialog");
                this.oDefaultDialog.open();
            },

            onDeleteButtonPressed: function (orderId) {
                console.log(orderId, typeof orderId);
                // console.log(oEvent.getParameters());
                console.log("Deleted");

                let allOrders = JSON.parse(
                    localStorage.getItem("LocalStorageData")
                );
                // console.log(allOrders.ProductCollection);

                let updatedOrderData = allOrders.ProductCollection.filter(
                    (order) => order.OrderId !== orderId
                );

                let data = { ProductCollection: updatedOrderData };

                localStorage.setItem("LocalStorageData", JSON.stringify(data));

                const localStorageData =
                    localStorage.getItem("LocalStorageData");
                const parseData = JSON.parse(localStorageData);
                console.log(parseData, "parseData");
                const ProductsModel = new JSONModel(parseData);
                this.getView().setModel(ProductsModel);

                this.oRouter.navTo("master", {
                    layout: fioriLibrary.LayoutType.OneColumn
                });

                // this.getView().getModel().refresh();
            }
        });
    }
);
