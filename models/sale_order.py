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
        total_sales_amount = 0
        for order in sales_orders:
            month = order.date_order.strftime('%Y-%m')
            monthly_sales[month] = monthly_sales.get(month, 0) + order.amount_total
            total_sales_amount += order.amount_total

        # Top Selling Products
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

        top_selling_products = sorted(product_sales.values(), key=lambda x: x['revenue'], reverse=True)[:5]

        # Sales Fulfillment Efficiency
        deliveries = self.env['stock.picking'].search([
            ('state', '=', 'done'), ('picking_type_id.code', '=', 'outgoing')
        ])

        total_deliveries = len(deliveries)
        on_time_count = 0
        delayed_count = 0
        ideal_lead_time = 7  # Target lead time for efficiency (7 days)

        for picking in deliveries:
            if picking.scheduled_date and picking.date_done:
                lead_time = (picking.date_done - picking.scheduled_date).days
                if lead_time <= ideal_lead_time:
                    on_time_count += 1
                else:
                    delayed_count += 1

        # Calculating efficiency percentage
        efficiency_percentage = (on_time_count / total_deliveries) * 100 if total_deliveries > 0 else 0


        # Sales by Customer (Top 5)
        sales_by_customer = []
        sales_data = self.env['sale.order'].read_group(
            [('state', '=', 'sale')],
            ['partner_id', 'amount_total'],
            ['partner_id']
        )

        # Sorting by sales volume and limiting to top 5
        sorted_sales_data = sorted(sales_data, key=lambda x: x['amount_total'], reverse=True)[:5]

        for data in sorted_sales_data:
            customer = data['partner_id'][1] if data['partner_id'] else 'Unknown Customer'
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

        # Conversion Rate (Only count opportunities that converted to sales)
        total_opportunities = self.env['crm.lead'].search_count([
            ('type', '=', 'opportunity'),
        ])

        won_opportunities = self.env['crm.lead'].search_count([
            ('type', '=', 'opportunity'),
            ('probability', '=', 100),  # Closed Won Opportunities
            ('order_ids.state', '=', 'sale')  # Ensure linked sales orders are confirmed
        ])

        # Calculate conversion rate
        conversion_rate = (won_opportunities / total_opportunities * 100) if total_opportunities > 0 else 0

        # Profit Margin per Sale
        profit_margins = []
        for order in sales_orders:
            total_revenue = order.amount_total
            total_cost = sum(
                line.product_id.standard_price * line.product_uom_qty for line in order.order_line
            )
            profit_margin = ((total_revenue - total_cost) / total_revenue * 100) if total_revenue > 0 else 0
            profit_margins.append(profit_margin)

        average_profit_margin = sum(profit_margins) / len(profit_margins) if profit_margins else 0

        # Fetch sale orders in the "sale" state
        sales_orders = self.env['sale.order'].search([('state', '=', 'sale')])

        # Aggregate sales by sales representatives
        sales_rep_dict = {}

        for order in sales_orders:
            rep_id = order.user_id.id
            rep_name = order.user_id.name if order.user_id else 'Unassigned'
            sales_volume = order.amount_total

            if rep_id in sales_rep_dict:
                sales_rep_dict[rep_id]['sales_volume'] += sales_volume
            else:
                sales_rep_dict[rep_id] = {
                    'sales_rep_name': rep_name,
                    'sales_volume': sales_volume
                }

        # Convert the dictionary to a sorted list and limit to top 5
        sorted_sales_reps = sorted(sales_rep_dict.values(), key=lambda x: x['sales_volume'], reverse=True)[:5]

        # Add an ID for t-key in the template
        top_sales_reps = [{'id': idx + 1, **rep} for idx, rep in enumerate(sorted_sales_reps)]

        currency = self.env.company.currency_id.symbol
        # Return all data as a dictionary
        return {
            'total_sales_amount': total_sales_amount,
            'monthly_sales': monthly_sales,
            'top_selling_products': top_selling_products,
            'fulfillment_efficiency': {
                'on_time_count': on_time_count,
                'delayed_count': delayed_count,
                'efficiency_percentage': efficiency_percentage
            },
            'sales_by_customer': sales_by_customer,
            'leads': sales_funnel['leads'],
            'opportunities': sales_funnel['opportunities'],
            'quotations': sales_funnel['quotations'],
            'confirmed_sales': sales_funnel['confirmed_sales'],
            'conversion_rate': round(conversion_rate, 2),
            'average_profit_margin': round(average_profit_margin, 2),
            'top_sales_reps': top_sales_reps,
            'currency_symbol': currency,
        }