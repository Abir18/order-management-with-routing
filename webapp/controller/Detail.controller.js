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
                const productIndex = oEvent.getParameter("arguments").product;

                // console.log(oEvent.getParameter("arguments"), "productIndex");

                // console.log(
                //     "obj",
                //     this.getView().getBindingContext("products").getObject()
                // );

                if (productIndex) {
                    this.byId("detail_form").bindElement(
                        `products>/ProductCollection/${productIndex}`
                    );

                    const localStorageData =
                        localStorage.getItem("LocalStorageData");
                    const parseData = JSON.parse(localStorageData);
                    const ProductsModel = new JSONModel(parseData);
                    this.getView().setModel(ProductsModel, "products");

                    if (productIndex == "new") {
                        const randomId = parseInt(Date.now() + Math.random())
                            .toString()
                            .slice(6);
                        const product = {
                            ProductCollection: [
                                {
                                    OrderId: randomId,
                                    CustomerName: ""
                                }
                            ]
                        };

                        let newCustomer = new JSONModel(product);

                        this.getView().setModel(newCustomer, "products");

                        this.byId("detail_form").bindElement(
                            `products>/ProductCollection`
                        );

                        this.byId("app_input_orderno").setValue(randomId);
                    } else {
                        const oModel = this.getView().getModel("products");

                        if (oModel) {
                            const productData =
                                oModel.getData().ProductCollection;

                            const countryName =
                                productData[productIndex].Country;

                            const countriesData = this.getView()
                                .getModel("countries")
                                .getData();

                            const selectedCountryData = countriesData.find(
                                (country) => country.countryName === countryName
                            );

                            const cityModel = new JSONModel(
                                selectedCountryData
                            );

                            this.getView().setModel(cityModel, "cityName");
                        }
                    }
                }
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

            // When User Click Close Button of Side Panel
            onCancelPressed: function (oRouter = null) {
                // var oFCL = this.oView.getParent().getParent();
                // oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);

                this.byId("app_input_country").setValue("");
                this.byId("app_input_city").setValue("");
                this.byId("app_input_date").setValue("");

                this.routeToOneColumn(oRouter);
            },

            routeToOneColumn: function (oRouter = null) {
                if (this.oRouter) {
                    oRouter = this.oRouter;
                }

                if (oRouter !== null) {
                    oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });
                }
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

                this.byId("app_input_city").setSelectedKey("");
            },

            _dataFormat: {
                ProductCollection: []
            },

            // When User Click Submit Button
            onSavePressed: function () {
                const localData = JSON.parse(
                    localStorage.getItem("LocalStorageData")
                );

                const id = this.byId("app_input_orderno").getValue();

                const filteredData = localData?.ProductCollection.filter(
                    (product) => product.OrderId == id
                );

                if (filteredData?.length > 0) {
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

                    if (
                        customerName == "" ||
                        countryName == "" ||
                        cityName == "" ||
                        date == ""
                    ) {
                        // console.log("nNot found");
                        return;
                    }

                    const updatedCustomerData = {
                        OrderId: orderId,
                        CustomerName: customerName,
                        City: cityName,
                        Country: countryName,

                        // Address: `${cityName || "Dhaka"}, ${
                        //     countryName || "Bangladesh"
                        // }`,
                        Date: new Date(date).toLocaleDateString("en-us", {
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

                    this.oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });
                } else {
                    // console.log("Form SUbmitted");

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

                    if (
                        customerName == "" ||
                        countryName == "" ||
                        cityName == "" ||
                        date == ""
                    ) {
                        // console.log("Not found");
                        return;
                    }

                    const newCustomerData = {
                        OrderId: orderId,
                        CustomerName: customerName,
                        City: cityName,
                        Country: countryName,
                        // Address: `${cityName}, ${countryName}`,
                        Date: new Date(date).toLocaleDateString("en-us", {
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

                    const localStorageData =
                        localStorage.getItem("LocalStorageData");
                    const parseData = JSON.parse(localStorageData);
                    // console.log(parseData, "parseData");
                    const ProductsModel = new JSONModel(parseData);
                    this.getView().setModel(ProductsModel, "products");

                    this.oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });

                    this.byId("app_input_country").setValue("");
                    this.byId("app_input_city").setValue("");
                    this.byId("app_input_date").setValue("");

                    // sap.ui.getCore().byId("gridTable").getModel().refresh(true);

                    // this.getView().getModel("products").refresh();
                }
            }
        });
    }
);
