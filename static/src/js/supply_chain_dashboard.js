/** @odoo-module **/

import { registry } from "@web/core/registry";
import { session } from "@web/session";
import { Widget } from "@web/views/widgets/widget";
import { loadJS, loadBundle } from "@web/core/assets";
import { useEffect, useService } from "@web/core/utils/hooks";
const { Component, hooks } = owl;
import { onWillStart, onMounted, useRef } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";


export class SupplyChainDashboard extends Component {
    setup() {
        this.orm = useService("orm");

        onWillStart(async () => {
            await loadBundle("web.chartjs_lib");
            // getting data from sale order
            await this.orm.call( 'sale.order', 'get_sale_order_data').then((data) => {
                   this.test = data.test;
            });
        });
    }
}
SupplyChainDashboard.template = 'supply_chain_dashboard';
registry.category("actions").add("supply_chain_dashboard", SupplyChainDashboard);