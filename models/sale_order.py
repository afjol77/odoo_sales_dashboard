# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.model
    def get_sales_dashboard_data(self):

        # Monthly Sales Performance
        sales_orders = self.env['sale.order'].search([('state', '=', 'sale')])
        monthly_sales = {}
        for order in sales_orders:
            month = order.date_order.strftime('%Y-%m')
            monthly_sales[month] = monthly_sales.get(month, 0) + order.amount_total

        # Top Selling Products by Quantity/Revenue
        sale_lines = self.env['sale.order.line'].search([('order_id.state', '=', 'sale')])
        product_sales = {}
        for line in sale_lines:
            product_id = line.product_id.id
            if product_id not in product_sales:
                product_sales[product_id] = {
                    'product_name': line.product_id.display_name,
                    'quantity': 0,
                    'revenue': 0,
                }
            product_sales[product_id]['quantity'] += line.product_uom_qty
            product_sales[product_id]['revenue'] += line.price_total

        # Sales Fulfillment Efficiency
        deliveries = self.env['stock.picking'].search([
            ('state', '=', 'done'), ('picking_type_id.code', '=', 'outgoing')
        ])
        fulfillment_efficiency = []
        for picking in deliveries:
            lead_time = (picking.date_done - picking.scheduled_date).days if picking.scheduled_date else 0
            fulfillment_efficiency.append({
                'sale_order': picking.origin,
                'scheduled_date': picking.scheduled_date.strftime('%Y-%m-%d') if picking.scheduled_date else None,
                'actual_date': picking.date_done.strftime('%Y-%m-%d') if picking.date_done else None,
                'lead_time': lead_time
            })

        # Sales by Customer
        sales_by_customer = []
        sales_data = self.env['sale.order'].read_group(
            [('state', '=', 'sale')],
            ['partner_id', 'amount_total'],
            ['partner_id']
        )

        for data in sales_data:
            customer = data['partner_id'][1]
            sales_volume = data['amount_total']
            sales_by_customer.append({
                'customer_name': customer,
                'sales_volume': sales_volume
            })

        # Sales Funnel Metrics
        sales_funnel = {
            'leads': self.env['crm.lead'].search_count([('type', '=', 'lead')]),
            'opportunities': self.env['crm.lead'].search_count([('type', '=', 'opportunity')]),
            'quotations': self.env['sale.order'].search_count([('state', '=', 'draft')]),
            'confirmed_sales': self.env['sale.order'].search_count([('state', '=', 'sale')])
        }
        print(monthly_sales)
        print(list(product_sales.values()))
        print(fulfillment_efficiency)
        print(sales_by_customer)
        print(sales_funnel)

        # Return all data as a dictionary
        return {
            'monthly_sales': monthly_sales,
            'top_selling_products': list(product_sales.values()),
            'fulfillment_efficiency': fulfillment_efficiency,
            'sales_by_customer': sales_by_customer,
            'sales_funnel':  [
                        {'id': 1,'name': 'Leads', 'count': sales_funnel['leads']},
                        {'id': 2,'name': 'Opportunities', 'count': sales_funnel['opportunities']},
                        {'id': 3,'name': 'Quotations', 'count': sales_funnel['quotations']},
                        {'id': 4,'name': 'Confirmed Sales', 'count': sales_funnel['confirmed_sales']},
                    ]
        }