sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "sap/m/MessageBox",
        "sap/f/library"
    ],
    function (
        Controller,
        Filter,
        FilterOperator,
        Sorter,
        MessageBox,
        fioriLibrary
    ) {
        "use strict";

        return Controller.extend("sap.test.routing.controller.Master", {
            onInit: function () {
                this.oView = this.getView();
                this._bDescendingSort = false;
                this.oProductsTable = this.oView.byId("productsTable");
                this.oRouter = this.getOwnerComponent().getRouter();
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

                let selectedProduct = pData.ProductCollection[product].OrderId;

                // console.log(selectedProduct, "id");

                // console.log("sadasd", oData);
                // console.log("ppp", pData);
                // console.log("ppp", q);

                this.oRouter.navTo("detail", {
                    layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
                    product: selectedProduct
                });
            }
        });
    }
);
