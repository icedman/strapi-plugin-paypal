'use strict';

const paypal = require('paypal-rest-sdk');
const http = require('axios');
const qs = require('qs');

/**
 * Paypal.js controller
 *
 * @description: A set of functions called "actions" of the `paypal` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    paypal.configure(strapi.config.paypal);

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:1337/paypal/completed",
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "order_id": "xx", // post/query
            "redirect_url": "yy", // post/query
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };


    var createPayment = new Promise(function(resolve, reject) {
      paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
              // throw error;
              return reject(error);
          } else {
              // console.log("Create Payment Response");
              // console.log(payment);
              return resolve(payment);
          }
      });  
    });

    var payment = null;
    try {
      payment = await createPayment;
    } catch(err) {
      console.log(err);
      return ctx.send('error');
    }

    var redirect_dir = payment.links.filter(l => { return l.method === 'REDIRECT'})[0].href;
    var q = qs.parse((redirect_dir + '?').split('?')[1]);
    console.log('------------------------');
    console.log(q);

    console.log(payment);

    ctx.send(payment);
  },

  completed: async (ctx) => {
    console.log('completed');
    console.log(ctx);

    var q = qs.parse((ctx.request.url + '?').split('?')[1]);
    console.log('------------------------');
    console.log(q);

    var paymentId = q.paymentId; //'PAYMENT id created in previous step';

    var execute_payment_json = {
        "payer_id": q.PayerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            // throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
        }
    });

    ctx.send({
      message: ctx
    });

    // redirect ...
  },

  cancelled: async (ctx) => {
    console.log('cancelled');
    console.log(ctx);
    ctx.send({
      message: ctx
    });
  }
};
