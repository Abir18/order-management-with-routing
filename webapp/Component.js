sap.ui.define(
    ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/f/library"],
    function (UIComponent, JSONModel, fioriLibrary) {
        "use strict";

        return UIComponent.extend("sap.test.routing.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                var oModel, oProductsModel, oRouter;

                UIComponent.prototype.init.apply(this, arguments);

                oModel = new JSONModel();
                this.setModel(oModel);

                oRouter = this.getRouter();
                oRouter.attachBeforeRouteMatched(
                    this._onBeforeRouteMatched,
                    this
                );
                oRouter.initialize();

                // // set products demo model on this sample
                // oProductsModel = new JSONModel(
                //     sap.ui.require.toUrl("products.json")
                // );
                // oProductsModel.setSizeLimit(1000);
                // this.setModel(oProductsModel, "products");
            },

            _onBeforeRouteMatched: function (oEvent) {
                var oModel = this.getModel(),
                    sLayout = oEvent.getParameters().arguments.layout;

                // If there is no layout parameter, set a default layout (normally OneColumn)
                if (!sLayout) {
                    sLayout = fioriLibrary.LayoutType.OneColumn;
                }

                oModel.setProperty("/layout", sLayout);
            }
        });
    }
);
