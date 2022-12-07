sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/f/library",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment"
    ],
    function (Controller, fioriLibrary, JSONModel, Fragment) {
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

                const getProducts = JSON.parse(
                    localStorage.getItem("LocalStorageData")
                );

                const filteredProduct = getProducts?.ProductCollection?.find(
                    (product) => product.OrderId == productId
                );

                // console.log(filteredProduct, "filteredProduct");

                if (filteredProduct) {
                    const {
                        CustomerName: customerName,
                        Address: address,
                        Date: date
                    } = filteredProduct;

                    const city = address.split(",")[0];
                    const country = address.split(",")[1];

                    const dateFormat = date.split(",");

                    const dateValue = dateFormat[1] + "," + dateFormat[2];

                    this.byId("app_input_orderno").setValue(productId);
                    this.byId("app_input_customername").setValue(customerName);
                    this.byId("app_input_country").setValue(country);
                    this.byId("app_input_city").setValue(city);
                    this.byId("app_input_date").setValue(dateValue);
                } else {
                    const randomId = parseInt(Date.now() + Math.random())
                        .toString()
                        .slice(6);
                    this.byId("app_input_orderno").setValue(randomId);
                    this.byId("app_input_customername").setValue("");
                    this.byId("app_input_country").setValue("");
                    this.byId("app_input_city").setValue("");
                    this.byId("app_input_date").setValue("");
                }

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
                // var oFCL = this.oView.getParent().getParent();

                // oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);

                this.oRouter.navTo("master", {
                    layout: fioriLibrary.LayoutType.OneColumn
                });
            },

            handleValueHelp: function () {
                var oView = this.getView();

                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "sap.test.routing.view.ValueHelp",
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
            handleValueHelpSelect: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem"),
                    oInput = this.byId("app_input_customername");

                console.log("oSelectedItem", oSelectedItem);
                oSelectedItem.getCells();

                if (!oSelectedItem) {
                    oInput.resetProperty("value");

                    return;
                }
                oInput.setValue(oSelectedItem.getCells()[1].getText());
            },
            handleValueHelpClose: function (oEvent) {
                // var oSelectedItem = oEvent.getParameter("listItem"),
                //     oInput = this.byId("app_input_customername");
                // console.log("oSelectedItem", oSelectedItem);
                // oSelectedItem.getCells();
                // if (!oSelectedItem) {
                //     oInput.resetProperty("value");
                //     return;
                // }
                // oInput.setValue(oSelectedItem.getCells()[1].getText());
            },

            onCountryChange: function (oEvent) {
                // console.log(oEvent.getParameters().selectedItem.sId.slice(-1));

                const selectedCountryIndex = oEvent
                    .getParameters()
                    .selectedItem.sId.slice(-1);

                const selectedCountryId = parseInt(selectedCountryIndex) + 1;
                // console.log(selectedCountryId);

                const countriesData = this.getView()
                    .getModel("countries")
                    .getData();

                // console.log(countriesData, "countriesData");

                const selectedCountryData = countriesData.find(
                    (country) => country.countryId === selectedCountryId
                );
                // console.log(selectedCountryData);

                const cityModel = new JSONModel(selectedCountryData);

                this.getView().setModel(cityModel, "cityName");
            },

            _dataFormat: {
                ProductCollection: []
            },

            onSavePressed: function () {
                const localData = JSON.parse(
                    localStorage.getItem("LocalStorageData")
                );

                const id = this.byId("app_input_orderno").getValue();

                // console.log(id, "localData");

                const filteredData = localData?.ProductCollection.filter(
                    (product) => product.OrderId == id
                );
                // console.log(filteredData, "filteredData");

                if (filteredData?.length > 0) {
                    console.log("found");
                    console.log(filteredData, "ff");

                    const orderId = this.byId("app_input_orderno").getValue();
                    const customerName = this.byId(
                        "app_input_customername"
                    ).getValue();
                    const countryName = this.byId("app_input_country")
                        ?.getSelectedItem()
                        ?.getText();
                    const cityName = this.byId("app_input_city")
                        ?.getSelectedItem()
                        ?.getText();

                    const date = this.byId("app_input_date").getValue();

                    const updatedCustomerData = {
                        OrderId: orderId,
                        CustomerName: customerName,
                        Address: `${cityName || "Dhaka"}, ${
                            countryName || "Bangladesh"
                        }`,
                        Date: date
                            ? new Date(date).toLocaleDateString("en-us", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                              })
                            : new Date("11/24/22").toLocaleDateString("en-us", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                              }),
                        // Date: date
                        Delivered: false
                    };

                    // console.log(updatedCustomerData, "updatedCustomerData");

                    const mappedData = localData.ProductCollection.map(
                        (product) => {
                            if (
                                product.OrderId == updatedCustomerData.OrderId
                            ) {
                                return updatedCustomerData;
                            }
                            return product;
                        }
                    );

                    this._dataFormat.ProductCollection = mappedData;

                    localStorage.setItem(
                        "LocalStorageData",
                        JSON.stringify(this._dataFormat)
                    );

                    // const localStorageData =
                    //     localStorage.getItem("LocalStorageData");
                    // const parseData = JSON.parse(localStorageData);
                    // console.log(parseData, "parseData");
                    // const ProductsModel = new JSONModel(parseData);
                    // this.getView().setModel(ProductsModel, "products");

                    this.oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });

                    // this.getView().getModel("products").refresh();

                    // sap.ui.getCore().byId("gridTable").getModel().refresh(true);

                    // console.log("mappedData", mappedData);
                    // console.log("this._dataFormat", this._dataFormat);
                } else {
                    // console.log("not found");
                    console.log("Form SUbmitted");

                    const orderId = this.byId("app_input_orderno").getValue();
                    const customerName = this.byId(
                        "app_input_customername"
                    ).getValue();

                    const countryName = this.byId("app_input_country")
                        ?.getSelectedItem()
                        ?.getText();
                    const cityName = this.byId("app_input_city")
                        ?.getSelectedItem()
                        ?.getText();

                    const date = this.byId("app_input_date").getValue();

                    const newCustomerData = {
                        OrderId: orderId,
                        CustomerName: customerName || "John Doe",
                        Address: `${cityName || "Dhaka"}, ${
                            countryName || "Bangladesh"
                        }`,
                        Date: date
                            ? new Date(date).toLocaleDateString("en-us", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                              })
                            : new Date("11/24/22").toLocaleDateString("en-us", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                              }),
                        Delivered: false
                        // Date: date
                    };

                    this._dataFormat.ProductCollection.push(newCustomerData);

                    if (localStorage.getItem("LocalStorageData")) {
                        let newARR = JSON.parse(
                            localStorage.getItem("LocalStorageData")
                        );

                        newARR.ProductCollection.push(newCustomerData);

                        localStorage.setItem(
                            "LocalStorageData",
                            JSON.stringify(newARR)
                        );
                    } else {
                        localStorage.setItem(
                            "LocalStorageData",
                            JSON.stringify(this._dataFormat)
                        );
                        console.log("not found");
                    }

                    // this.oRouter.navTo("master", {
                    //     layout: fioriLibrary.LayoutType.OneColumn
                    // });

                    // this.getView().getModel("products").refresh();

                    // this.byId("app_input_orderno").setValue("");

                    // this.byId("app_input_orderno").setValue(
                    //     parseInt(Date.now() + Math.random())
                    //         .toString()
                    //         .slice(6)
                    // );

                    // var oFCL = this.oView.getParent().getParent();
                    // oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);

                    const localStorageData =
                        localStorage.getItem("LocalStorageData");
                    const parseData = JSON.parse(localStorageData);
                    // console.log(parseData, "parseData");
                    const ProductsModel = new JSONModel(parseData);
                    this.getView().setModel(ProductsModel, "products");

                    this.oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });

                    // sap.ui.getCore().byId("gridTable").getModel().refresh(true);

                    // this.getView().getModel("products").refresh();
                }
            }
        });
    }
);
