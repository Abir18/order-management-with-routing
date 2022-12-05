sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
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
                sap.ui.core.UIComponent.getRouterFor(this).oHashChanger.hash;

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
        }
    });
});
