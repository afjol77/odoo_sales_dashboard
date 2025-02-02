/** @odoo-module **/

import { registry } from "@web/core/registry";
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
                   this.total_sales_amount = data.total_sales_amount;
                   this.monthly_sales = data.monthly_sales;
                   this.top_selling_products = data.top_selling_products;
                   this.fulfillment_efficiency = data.fulfillment_efficiency;
                   this.sales_by_customer = data.sales_by_customer;
                   this.leads = data.leads;
                   this.opportunities = data.opportunities;
                   this.quotations = data.quotations;
                   this.confirmed_sales = data.confirmed_sales;
                   this.conversion_rate = data.conversion_rate;
                   this.average_profit_margin = data.average_profit_margin;
                   this.top_sales_reps = data.top_sales_reps;
                   this.currency_symbol = data.currency_symbol;
            });
        });

        onMounted(async () => {
                this.renderMonthlySales();
                this.renderTopSellingProducts();
                this.renderFulfillmentEfficiency();
                this.renderSalesByCustomer();
        })
    }

    _onClickLeads() {
        this.env.services.action.doAction({
            name: _t("Leads"),
            type: 'ir.actions.act_window',
            res_model: 'crm.lead',
            view_mode: 'tree',
            views: [[false, 'list']],
            target: 'current',
            domain: [['type', '=', 'lead']],
        });
    }

    _onClickOpportunities() {
        this.env.services.action.doAction({
            name: _t("Opportunities"),
            type: 'ir.actions.act_window',
            res_model: 'crm.lead',
            view_mode: 'tree',
            views: [[false, 'list']],
            target: 'current',
            domain: [['type', '=', 'opportunity']],
        });
    }


    _onClickQuotations() {
        this.env.services.action.doAction({
            name: _t("Quotations"),
            type: 'ir.actions.act_window',
            res_model: 'sale.order',
            view_mode: 'tree',
            views: [[false, 'list']],
            target: 'current',
            domain: [['state', '=', 'draft']],
        });
    }

    _onClickSales() {
        this.env.services.action.doAction({
            name: _t("Confirmed Sales"),
            type: 'ir.actions.act_window',
            res_model: 'sale.order',
            view_mode: 'tree',
            views: [[false, 'list']],
            target: 'current',
            domain: [['state', '=', 'sale']],
        });
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

    const ctx = this.canvasMonthlySales.el.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(89, 50, 234, 0.7)');
    gradient.addColorStop(1, 'rgba(89, 50, 234, 0.1)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Month',
                data: salesAmounts,
                fill: true,
                backgroundColor: gradient,
                borderColor: '#5932EA',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#5932EA',
                pointHoverBackgroundColor: '#FFD700',
                pointHoverBorderColor: '#5932EA',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        },
                        color: '#333'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => {
                            const value = tooltipItem.raw;
                            return `${this.currency_symbol}${value.toLocaleString()}`;
                        }
                    },
                    backgroundColor: '#5932EA',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#FFD700',
                    borderWidth: 1
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `Sales Amount (${this.currency_symbol})`,
                        font: {
                            size: 16
                        },
                        color: '#333'
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(89, 50, 234, 0.1)'
                    }
                }
            }
        }
    });
    }

    renderTopSellingProducts() {
    const productNames = [];
    const productRevenues = [];

    const topProducts = this.top_selling_products
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    topProducts.forEach(product => {
        productNames.push(product.product_name.length > 10 ? product.product_name.slice(0, 10) + '...' : product.product_name);
        productRevenues.push(product.revenue);
    });

    new Chart(this.canvasTopSellingProducts.el, {
        type: 'bar',
        data: {
            labels: productNames,
            datasets: [{
                label: `Revenue (${this.currency_symbol})`,
                data: productRevenues,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                ],
                borderColor: '#777',
                borderWidth: 2,
                hoverBackgroundColor: '#FFC107',
                hoverBorderColor: '#FF9800'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold',
                        },
                        color: '#333'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${this.currency_symbol}${context.raw.toLocaleString()}`,
                        title: (context) => this.top_selling_products[context[0].dataIndex].product_name,
                    }
                },
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 20,
                    bottom: 10
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Product Names',
                        font: {
                            size: 14,
                        },
                        color: '#555'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#333',
                        callback: (value) => productNames[value]
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `Revenue (${this.currency_symbol})`,
                        font: {
                            size: 14,
                        },
                        color: '#555'
                    },
                    ticks: {
                        callback: (value) => `${this.currency_symbol}${value.toLocaleString()}`,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#333'
                    },
                    grid: {
                        borderColor: '#ddd',
                        color: '#eee'
                    }
                }
            }
        }
    });
}

    renderFulfillmentEfficiency() {
    const onTimeCount = this.fulfillment_efficiency.on_time_count;
    const delayedCount = this.fulfillment_efficiency.delayed_count;
    const totalCount = onTimeCount + delayedCount;

    // If no deliveries, set to 0% efficiency
    const efficiencyPercentage = totalCount > 0 ? (onTimeCount / totalCount) * 100 : 0;

    // Render pie chart
    new Chart(this.canvasFulfillmentEfficiency.el, {
        type: 'pie',
        data: {
            labels: ['On-time Deliveries', 'Delayed Deliveries'],
            datasets: [{
                data: [onTimeCount, delayedCount],
                backgroundColor: ['#4CAF50', '#FF6F61'], // Green for on-time, red for delayed
                hoverBackgroundColor: ['#66BB6A', '#FF8A80'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 20,
                        padding: 10,
                        color: '#333',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw} deliveries`
                    },
                    backgroundColor: '#444',
                    titleColor: '#FFF',
                    bodyColor: '#FFF',
                    borderColor: '#CCC',
                    borderWidth: 1
                },
                title: {
                    display: true,
                    text: `Efficiency: ${efficiencyPercentage.toFixed(2)}%`,
                    color: '#2C3E50',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            layout: {
                padding: 15
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

    renderSalesByCustomer() {
    const customers = this.sales_by_customer.map(item => item.customer_name);
    const salesVolumes = this.sales_by_customer.map(item => item.sales_volume);

    new Chart(this.canvasSalesByCustomer.el, {
        type: 'bar',
        data: {
            labels: customers,
            datasets: [{
                label: `Sales Volume (${this.currency_symbol})`,
                data: salesVolumes,
                backgroundColor: '#42A5F5',
                borderColor: '#1E88E5',
                borderWidth: 1,
                hoverBackgroundColor: '#90CAF9',
                hoverBorderColor: '#1565C0'
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: `Sales Volume (${this.currency_symbol})`,
                        font: {
                            size: 14
                        },
                        color: '#555'
                    },
                    ticks: {
                        callback: (value) => `${this.currency_symbol}${value.toLocaleString()}`,
                        color: '#333',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: '#eee',
                        borderColor: '#ddd'
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        color: '#333'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${this.currency_symbol}${context.raw.toLocaleString()}`
                    }
                },
            },
            layout: {
                padding: 15
            },
            animation: {
                duration: 1000,
                easing: 'easeOutBounce'
            }
        }
    });
}

}
SalesDashboard.template = 'sales_dashboard';
registry.category("actions").add("sales_dashboard", SalesDashboard);