/** @odoo-module **/

import { registry } from "@web/core/registry";
import { session } from "@web/session";
import { Widget } from "@web/views/widgets/widget";
import { loadJS, loadBundle } from "@web/core/assets";
import { useEffect, useService } from "@web/core/utils/hooks";
const { Component, hooks } = owl;
import { onWillStart, onMounted, useRef } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";


export class SalesDashboard extends Component {
    setup() {
        this.orm = useService("orm");
        this.canvasMonthlySales = useRef('canvasMonthlySales');
        this.canvasTopSellingProducts = useRef('canvasTopSellingProducts');
        this.canvasFulfillmentEfficiency = useRef('canvasFulfillmentEfficiency');
        this.canvasSalesByCustomer = useRef('canvasSalesByCustomer');

        onWillStart(async () => {
            await loadBundle("web.chartjs_lib");
            await this.orm.call( 'sale.order', 'get_sales_dashboard_data').then((data) => {
                    // Charts Section
                   this.monthly_sales = data.monthly_sales;
                   this.top_selling_products = data.top_selling_products;
                   this.fulfillment_efficiency = data.fulfillment_efficiency;
                   this.sales_by_customer = data.sales_by_customer;
                   this.sales_funnel = data.sales_funnel;
            });
        });

        onMounted(async () => {
                this.renderMonthlySales();
                this.renderTopSellingProducts();
                this.renderFulfillmentEfficiency();
                this.renderSalesByCustomer();
        })
    }

    renderMonthlySales() {
    const monthNames = [];
    const salesAmounts = [];

    for (let monthKey in this.monthly_sales) {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        monthNames.push(monthName);
        salesAmounts.push(this.monthly_sales[monthKey]);
    }

    new Chart(this.canvasMonthlySales.el, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Monthly Sales Performance',
                data: salesAmounts,
                fill: true,
                borderColor: '#5932EA',
                backgroundColor: 'rgba(89, 50, 234, 0.2)',
                pointBackgroundColor: '#5932EA',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Sales Amount'
                    },
                    beginAtZero: true
                }
            }
        }
    });
    }

    renderTopSellingProducts() {
    const productNames = [];
    const salesQuantities = [];

    // Extract product names and quantities from data
    this.top_selling_products.forEach(product => {
        productNames.push(product.product_name);
        salesQuantities.push(product.quantity);
    });

    new Chart(this.canvasTopSellingProducts.el, {
        type: 'bar',
        data: {
            labels: productNames,
            datasets: [{
                label: 'Top Selling Products by Quantity',
                data: salesQuantities,
                backgroundColor: '#5932EA',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Products'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Quantity Sold'
                    },
                    beginAtZero: true
                }
            }
        }
    });
    }


    renderFulfillmentEfficiency() {
    const leadTimes = this.fulfillment_efficiency.map(item => item.lead_time);
    const averageLeadTime = leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length;

    const efficiencyPercentage = Math.max(0, Math.min(100, (1 - (averageLeadTime / 7)) * 100)); // Example: target of 7 days for ideal efficiency

    // Render pie chart
    new Chart(this.canvasFulfillmentEfficiency.el, {
        type: 'pie',
        data: {
            labels: ['Fulfillment Efficiency'],
            datasets: [{
                data: [efficiencyPercentage, 100 - efficiencyPercentage],
                backgroundColor: ['#4CAF50', '#e0e0e0'], // Green for good, light gray for the rest
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        }
    });
    }

    renderSalesByCustomer() {
    const customers = this.sales_by_customer.map(item => item.customer_name);
    const salesVolumes = this.sales_by_customer.map(item => item.sales_volume);

    // Render bar chart
    new Chart(this.canvasSalesByCustomer.el, {
        type: 'bar',
        data: {
            labels: customers, // Customer segments
            datasets: [{
                label: 'Sales Volume',
                data: salesVolumes, // Sales data per segment
                backgroundColor: '#4CAF50', // Green color for bars
                borderColor: '#388E3C', // Darker green for border
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true, // Ensure the y-axis starts at 0
                    ticks: {
                        stepSize: 5000 // Adjust step size to match the sales volume range
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}

}
SalesDashboard.template = 'sales_dashboard';
registry.category("actions").add("sales_dashboard", SalesDashboard);