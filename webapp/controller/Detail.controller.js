sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/f/library"],
    function (Controller, fioriLibrary) {
        "use strict";

        return Controller.extend("sap.test.routing.controller.Detail", {
            onInit: function () {
                var oOwnerComponent = this.getOwnerComponent();

                this.oRouter = oOwnerComponent.getRouter();
                this.oModel = oOwnerComponent.getModel();

                this.oRouter
                    .getRoute("master")
                    .attachPatternMatched(this._onProductMatched, this);
                this.oRouter
                    .getRoute("detail")
                    .attachPatternMatched(this._onProductMatched, this);
            },

            _onProductMatched: function (oEvent) {
                let hashRouteMatched =
                    sap.ui.core.UIComponent.getRouterFor(this).oHashChanger
                        .hash;

                let productId = hashRouteMatched.split("/")[1];

                console.log(productId, "productId");

                this.byId("app_input_orderno").setValue(productId);

                this;

                this._product =
                    oEvent.getParameter("arguments").product ||
                    this._product ||
                    "0";
                this.getView().bindElement({
                    path: "/ProductCollection/" + this._product,
                    model: "products"
                });
            },

            onEditToggleButtonPress: function () {
                var oObjectPage = this.getView().byId("ObjectPageLayout"),
                    bCurrentShowFooterState = oObjectPage.getShowFooter();

                oObjectPage.setShowFooter(!bCurrentShowFooterState);
            },

            onExit: function () {
                this.oRouter
                    .getRoute("master")
                    .detachPatternMatched(this._onProductMatched, this);
                this.oRouter
                    .getRoute("detail")
                    .detachPatternMatched(this._onProductMatched, this);
            },

            onCancelPressed: function () {
                var oFCL = this.oView.getParent().getParent();

                oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
            },

            handleValueHelp: function () {
                var oView = this.getView();

                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "task.order.management.view.ValueHelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._pValueHelpDialog.then(
                    function (oValueHelpDialog) {
                        this._configValueHelpDialog();
                        oValueHelpDialog.open();
                    }.bind(this)
                );
            },

            _configValueHelpDialog: function () {
                // var sInputValue = this.byId("productInput").getValue(),
                //     oModel = this.getView().getModel("products"),
                //     aProducts = oModel.getProperty("/ProductCollection");
                // aProducts.forEach(function (oProduct) {
                //     oProduct.selected = oProduct.Name === sInputValue;
                // });
                // oModel.setProperty("/ProductCollection", aProducts);
            },
            handleValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem"),
                    oInput = this.byId("app_input_customername");
                console.log("oSelectedItem", oSelectedItem);

                if (!oSelectedItem) {
                    oInput.resetProperty("value");

                    return;
                }
                // console.log(oSelectedItem.getCells()[1]);
                oInput.setValue(oSelectedItem.getCells()[1].getText());
                // oInput.setValue(oSelectedItem.getCells()[1].mProperties.text);
            },

            onCountryChange: function (oEvent) {
                // console.log(oEvent.getParameters().selectedItem.sId.slice(-1));

                const selectedCountryIndex = oEvent
                    .getParameters()
                    .selectedItem.sId.slice(-1);

                const selectedCountryId = parseInt(selectedCountryIndex) + 1;
                console.log(selectedCountryId);

                const countriesData = this.getView()
                    .getModel("countries")
                    .getData();

                console.log(countriesData, "countriesData");

                const selectedCountryData = countriesData.find(
                    (country) => country.countryId === selectedCountryId
                );
                console.log(selectedCountryData);

                const cityModel = new JSONModel(selectedCountryData);

                this.getView().setModel(cityModel, "cityName");
            }
        });
    }
);
